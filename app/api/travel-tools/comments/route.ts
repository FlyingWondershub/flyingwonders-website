import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

export const dynamic = 'force-dynamic'

const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
})

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// Fallback comments dataset
const SEED_COMMENTS: Record<string, any[]> = {
  'visa-checker': [
    {
      _id: 'seed-cmt-1',
      toolId: 'visa-checker',
      authorName: 'Rohan Sharma',
      authorRole: 'Travel Agent',
      commentText: 'Indian passport holders can get SG Arrival Card submitted within 3 days prior to flight. Super easy process, no fee required for SGAC!',
      likesCount: 34,
      _createdAt: '2026-08-01T10:00:00Z',
      isFeatured: true
    },
    {
      _id: 'seed-cmt-2',
      toolId: 'visa-checker',
      authorName: 'Ananya Verma',
      authorRole: 'Traveler',
      commentText: 'Malaysia visa exemption for Indian & Chinese passport holders is valid through 2026. Make sure to complete MDAC online before departure!',
      likesCount: 28,
      _createdAt: '2026-08-05T14:30:00Z',
      isFeatured: true
    }
  ],
  'currency-converter': [
    {
      _id: 'seed-cmt-3',
      toolId: 'currency-converter',
      authorName: 'Vikram Mehta',
      authorRole: 'Destination Specialist',
      commentText: 'Pro-Tip: Forex cards work seamlessly at Changi Airport & Orchard Road. Carrying 300-500 SGD cash is sufficient for hawker centers.',
      likesCount: 42,
      _createdAt: '2026-08-02T11:20:00Z',
      isFeatured: true
    }
  ]
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const toolId = searchParams.get('toolId') || 'visa-checker'

    let sanityComments: any[] = []
    try {
      sanityComments = await client.fetch(
        `*[_type == "b2bTravelToolComment" && toolId == $toolId && isApproved != false] | order(isFeatured desc, _createdAt desc)`,
        { toolId }
      )
    } catch (e) {}

    const defaultComments = SEED_COMMENTS[toolId] || []
    const combined = [...sanityComments, ...defaultComments.filter(d => !sanityComments.some(s => s._id === d._id))]

    return NextResponse.json({ success: true, comments: combined })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { toolId, authorName, authorRole, commentText } = body

    if (!toolId || !authorName || !commentText) {
      return NextResponse.json({ error: 'Missing required comment fields' }, { status: 400 })
    }

    const doc = {
      _type: 'b2bTravelToolComment',
      toolId,
      authorName: authorName.trim(),
      authorRole: authorRole || 'Traveler',
      commentText: commentText.trim(),
      likesCount: 1,
      isApproved: true,
      isFeatured: false,
    }

    if (process.env.SANITY_WRITE_TOKEN) {
      const created = await writeClient.create(doc)
      return NextResponse.json({ success: true, comment: created })
    }

    return NextResponse.json({ 
      success: true, 
      comment: { ...doc, _id: `temp-${Date.now()}`, _createdAt: new Date().toISOString() } 
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
