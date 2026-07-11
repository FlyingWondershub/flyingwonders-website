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

    // 1. Try to log lead directly to Sanity CMS
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

    // 2. Prepare Formatted Message Text for Web3Forms
    const tierLabels: Record<string, string> = {
      budget: 'Budget Explorer',
      premium: 'Premium Luxury',
      solo: 'Solo Adventurer',
      groups: 'Groups & Families',
      general_inquiry: 'General Inquiry',
    }

    let messageText = ''
    let subjectLine = ''

    if (isGeneralInquiry) {
      subjectLine = `✉️ New Contact Inquiry from ${name}`
      messageText = `
=== NEW CONTACT INQUIRY ===
Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${notes}

${sanityDocId ? `Logged in Sanity: ${sanityDocId}` : ''}
      `.trim()
    } else {
      subjectLine = `✈️ Custom Package Booking Request from ${name}`
      const experienceList = experiences && experiences.length > 0
        ? experiences.map((exp: any) => `- ${exp.title}`).join('\n')
        : 'None selected'

      messageText = `
=== CUSTOM PACKAGE LEAD ===
Name: ${name}
Email: ${email}
Phone: ${phone}
Travel Date: ${travelDate || 'Not specified'}

Package Profile: ${tierLabels[tier] || tier}
Travelers: ${travelers}

Selected Experiences:
${experienceList}

Estimated Value: ₹${totalPrice?.toLocaleString('en-IN') ?? '0'} Per Person

Special Notes:
${notes || 'None'}

${sanityDocId ? `Logged in Sanity: ${sanityDocId}` : ''}
      `.trim()
    }

    // 3. Send via Web3Forms API
    const web3formsKey = process.env.WEB3FORMS_ACCESS_KEY
    if (web3formsKey) {
      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: web3formsKey,
            subject: subjectLine,
            from_name: 'Flying Wonders Website',
            name: name,
            email: email,
            message: messageText,
          }),
        })

        const resData = await response.json()
        if (resData.success) {
          return NextResponse.json({ success: true, message: 'Your request has been sent and logged successfully!' })
        } else {
          throw new Error(resData.message || 'Web3Forms API rejected the request')
        }
      } catch (emailError: any) {
        console.error('Web3Forms dispatch failed:', emailError)
        return NextResponse.json({
          success: true,
          warn: 'Email delivery failed, but lead was logged to dashboard.',
          message: 'Saved to dashboard. Please also touch base via WhatsApp for instant confirmation!'
        })
      }
    }

    // Return success if logged to Sanity even if Web3Forms is not configured yet
    if (sanityDocId) {
      return NextResponse.json({ 
        success: true, 
        message: 'Lead logged successfully in dashboard CMS!' 
      })
    }

    return NextResponse.json({ 
      error: 'Form service currently offline. Please chat with us on WhatsApp for instant booking!' 
    }, { status: 500 })

  } catch (error: any) {
    console.error('General route error:', error)
    return NextResponse.json(
      { error: 'Failed to process request. Please contact us on WhatsApp.' },
      { status: 500 }
    )
  }
}
