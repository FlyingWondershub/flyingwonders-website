import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'

// Create a Sanity client that can optionally use a write token for logging leads
const getSanityWriteClient = () => {
  const token = process.env.SANITY_WRITE_TOKEN
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8xtd7yiv'
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  
  if (!token) {
    console.warn('SANITY_WRITE_TOKEN is missing. Submissions will not be logged to Sanity CMS.')
    return null
  }

  return createClient({
    projectId,
    dataset,
    token,
    apiVersion: '2024-01-01',
    useCdn: false,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, travelDate, tier, travelers, experiences, totalPrice, notes } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Name, email, and phone are required.' }, { status: 400 })
    }

    const isGeneralInquiry = tier === 'general_inquiry'

    // 1. Log lead directly to Sanity CMS
    const writeClient = getSanityWriteClient()
    let sanityDocId = null
    
    if (writeClient) {
      try {
        if (isGeneralInquiry) {
          const doc = await writeClient.create({
            _type: 'contactSubmission',
            name,
            email,
            phone,
            message: notes,
            submittedAt: new Date().toISOString(),
          })
          sanityDocId = doc._id
        } else {
          const doc = await writeClient.create({
            _type: 'bookingRequest',
            name,
            email,
            phone,
            travelDate: travelDate || '',
            tier,
            travelers: Number(travelers) || 1,
            experiences: experiences?.map((exp: any) => exp.title) || [],
            totalPrice: Number(totalPrice) || 0,
            notes: notes || '',
            submittedAt: new Date().toISOString(),
          })
          sanityDocId = doc._id
        }
        console.log(`Successfully logged lead to Sanity with ID: ${sanityDocId}`)
      } catch (sanityError) {
        console.error('Failed to write to Sanity CMS:', sanityError)
      }
    }

    // Return success to the client, along with the doc ID.
    // The client (browser) will trigger the Web3Forms email send directly,
    // which bypasses Cloudflare blocking Vercel serverless IPs.
    return NextResponse.json({ 
      success: true, 
      sanityDocId,
      message: 'Lead logged successfully!' 
    })

  } catch (error: any) {
    console.error('General route error:', error)
    return NextResponse.json(
      { error: 'Failed to process request. Please contact us on WhatsApp.' },
      { status: 500 }
    )
  }
}
