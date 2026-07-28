import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

const readClient = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
})

export async function GET() {
  try {
    // Query approved reviews from Sanity
    const query = `*[_type == "review" && isApproved == true] | order(_createdAt desc) {
      _id,
      authorName,
      agent_company,
      origin_city,
      segment_type,
      passenger_count,
      content,
      rating,
      operational_tags
    }`

    const rawReviews = await readClient.fetch(query)

    // Map Sanity schema fields to B2BReview layout structure
    const reviews = rawReviews.map((r: any) => ({
      agent_company: r.agent_company || `${r.authorName}`,
      origin_city: r.origin_city || 'India',
      segment_type: r.segment_type || 'Couple Packages',
      passenger_count: r.passenger_count || 2,
      review_text: r.content,
      star_rating: r.rating || 5,
      operational_tags: r.operational_tags || []
    }))

    return NextResponse.json({ success: true, reviews })
  } catch (err: any) {
    console.error('Fetch Reviews Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
