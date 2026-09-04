import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { cookies } from 'next/headers'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

export const dynamic = 'force-dynamic'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    let agentEmail = formData.get('agentEmail') as string | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 })
    }

    // Check session cookie if agentEmail not explicitly in formData
    if (!agentEmail) {
      try {
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get('b2b_session')
        if (sessionCookie?.value) {
          agentEmail = sessionCookie.value
        }
      } catch (cookieErr) {}
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    try {
      // 1. Upload asset to Sanity
      const asset = await writeClient.assets.upload('image', buffer, {
        filename: file.name,
        contentType: file.type || 'image/png',
      })

      // 2. If agentEmail is provided, link to b2bAgent document immediately
      if (agentEmail) {
        const cleanEmail = agentEmail.trim().toLowerCase()
        const agent = await writeClient.fetch(
          `*[_type == "b2bAgent" && (lower(email) == $cleanEmail || email == $cleanEmail)][0]`,
          { cleanEmail }
        )

        if (agent?._id) {
          await writeClient
            .patch(agent._id)
            .set({
              logo: {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: asset._id,
                },
              },
            })
            .commit()
        }
      }

      return NextResponse.json({
        success: true,
        url: asset.url,
        assetId: asset._id,
      })
    } catch (uploadErr: any) {
      console.warn('Sanity asset upload fallback to data URL:', uploadErr)
      const base64 = buffer.toString('base64')
      const mime = file.type || 'image/png'
      const dataUrl = `data:${mime};base64,${base64}`

      return NextResponse.json({
        success: true,
        url: dataUrl,
      })
    }
  } catch (error: any) {
    console.error('Error in logo-upload API:', error)
    return NextResponse.json({ success: false, error: error.message || 'Upload error' }, { status: 500 })
  }
}
