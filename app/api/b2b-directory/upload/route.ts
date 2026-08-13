import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
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

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
    const assetType = isPdf ? 'file' : 'image'

    try {
      const asset = await writeClient.assets.upload(assetType, buffer, {
        filename: file.name,
        contentType: file.type,
      })

      return NextResponse.json({
        success: true,
        url: asset.url,
        assetId: asset._id,
      })
    } catch (uploadErr: any) {
      console.warn('Sanity asset upload fallback to data URL', uploadErr)
      // Fallback data URL if Sanity token write fails
      const base64 = buffer.toString('base64')
      const mime = file.type || (isPdf ? 'application/pdf' : 'image/jpeg')
      const dataUrl = `data:${mime};base64,${base64}`

      return NextResponse.json({
        success: true,
        url: dataUrl,
      })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Upload error' }, { status: 500 })
  }
}
