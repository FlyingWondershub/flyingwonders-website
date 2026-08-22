import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'
import { apiVersion, dataset, projectId } from '../../../sanity/env'

const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: true,
})

const imageBuilder = createImageUrlBuilder({ projectId: projectId || '', dataset: dataset || '' })

export const revalidate = 600

export async function GET() {
  try {
    const meta = await client.fetch(
      `*[_type == "attractionMeta"] {
        _id,
        name,
        matchKeyword,
        photo,
        shortDescription,
        longDescription,
        highlights,
        tips,
        rating,
        category,
        openingHours,
        duration,
        location,
        ageRecommendation,
        isPopular,
        isTrending
      }`,
      {},
      { next: { revalidate: 600 } }
    )

    const resolved = (meta || []).map((m: any) => ({
      ...m,
      photoUrl: m.photo
        ? imageBuilder.image(m.photo).auto('format').width(600).height(400).url()
        : null,
    }))

    return NextResponse.json({ success: true, meta: resolved }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
      }
    })
  } catch (err) {
    console.error('Error fetching attraction meta:', err)
    return NextResponse.json({ success: false, meta: [] })
  }
}
