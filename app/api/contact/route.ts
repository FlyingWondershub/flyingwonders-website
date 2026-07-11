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

    // 2. Prepare Email Body
    const tierLabels: Record<string, string> = {
      budget: 'Budget Explorer',
      premium: 'Premium Luxury',
      solo: 'Solo Adventurer',
      groups: 'Groups & Families',
      general_inquiry: 'General Inquiry',
    }

    let htmlBody = ''
    let subjectLine = ''

    if (isGeneralInquiry) {
      subjectLine = `✉️ New Contact Inquiry from ${name}`
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #990000; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">✉️ New Contact Submission</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">From Flying Wonders Website</p>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Name:</td><td>${name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${email}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${phone}</td></tr>
            </table>
            <h2 style="color: #990000; border-bottom: 2px solid #990000; padding-bottom: 8px; margin-top: 24px;">Message Details</h2>
            <p style="background: #f9fafb; padding: 12px; border-radius: 6px; border-left: 4px solid #D4AF37; white-space: pre-wrap;">${notes}</p>
            ${sanityDocId ? `<p style="font-size: 11px; opacity: 0.5; margin-top: 20px;">Logged in Sanity: ${sanityDocId}</p>` : ''}
          </div>
        </div>
      `
    } else {
      subjectLine = `✈️ Custom Package Booking Request from ${name}`
      const experienceList = experiences && experiences.length > 0
        ? experiences.map((exp: any) => `<li>${exp.title}</li>`).join('')
        : '<li>None selected</li>'

      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #990000; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">✈️ Custom Package Lead</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">From Flying Wonders Website</p>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #990000; border-bottom: 2px solid #990000; padding-bottom: 8px;">Contact Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Name:</td><td>${name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${email}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${phone}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Travel Date:</td><td>${travelDate || 'Not specified'}</td></tr>
            </table>

            <h2 style="color: #990000; border-bottom: 2px solid #990000; padding-bottom: 8px; margin-top: 24px;">Package Profile</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Traveler Profile:</td><td>${tierLabels[tier] || tier}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Travelers:</td><td>${travelers}</td></tr>
            </table>

            <h3 style="color: #00A859; margin-top: 16px;">Selected Experiences:</h3>
            <ul style="padding-left: 20px;">${experienceList}</ul>

            <div style="background: linear-gradient(135deg, #990000, #4a0000); color: white; padding: 16px; border-radius: 8px; margin-top: 20px; text-align: center;">
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">Estimated Value</p>
              <p style="margin: 8px 0 0 0; font-size: 28px; font-weight: bold;">₹${totalPrice?.toLocaleString('en-IN') ?? '0'} Per Person</p>
            </div>

            ${notes ? `
            <h2 style="color: #990000; border-bottom: 2px solid #990000; padding-bottom: 8px; margin-top: 24px;">Special Notes</h2>
            <p style="background: #f9fafb; padding: 12px; border-radius: 6px; border-left: 4px solid #D4AF37;">${notes}</p>
            ` : ''}
            ${sanityDocId ? `<p style="font-size: 11px; opacity: 0.5; margin-top: 20px;">Logged in Sanity: ${sanityDocId}</p>` : ''}
          </div>
        </div>
      `
    }

    // 3. Try to Send Email via SMTP
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const nodemailer = require('nodemailer')
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })

        await transporter.sendMail({
          from: `"Flying Wonders Website" <${process.env.EMAIL_USER}>`,
          to: 'info.flyingwonders@gmail.com',
          replyTo: email,
          subject: subjectLine,
          html: htmlBody,
        })
        
        return NextResponse.json({ success: true, message: 'Your request has been sent and logged successfully!' })
      } catch (emailError: any) {
        console.error('Email send failed but request was parsed:', emailError)
        return NextResponse.json({
          success: true,
          warn: 'Email delivery failed, but lead was logged to dashboard.',
          message: 'Saved to dashboard. Please also touch base via WhatsApp for instant pricing confirmation!'
        })
      }
    }

    // Return success if logged to Sanity even if email auth is not configured yet
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
