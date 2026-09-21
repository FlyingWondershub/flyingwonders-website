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
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 })
    }

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (file.type && !validMimes.includes(file.type.toLowerCase())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file format. Please upload JPG, PNG, WEBP, or GIF.'
      }, { status: 400 })
    }

    // Limit size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'File size too large. Maximum allowed is 10MB.'
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload asset to Sanity CDN
    const asset = await writeClient.assets.upload('image', buffer, {
      filename: file.name || `campaign-image-${Date.now()}.png`,
      contentType: file.type || 'image/png',
    })

    if (!asset || !asset.url) {
      throw new Error('Failed to retrieve uploaded image URL from CDN')
    }

    return NextResponse.json({
      success: true,
      url: asset.url,
      filename: file.name,
    })
  } catch (err: any) {
    console.error('Newsletter Image Upload Error:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Image upload failed'
    }, { status: 500 })
  }
}
