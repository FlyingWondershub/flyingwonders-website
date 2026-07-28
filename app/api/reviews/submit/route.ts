import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import nodemailer from 'nodemailer'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// Nodemailer SMTP Transporter setup
const createTransporter = () => {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '465')

  if (!user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export async function POST(req: Request) {
  try {
    const {
      authorName,
      agent_company,
      origin_city,
      segment_type,
      passenger_count,
      content,
      rating,
      operational_tags,
    } = await req.json()

    if (!authorName || !content || !rating) {
      return NextResponse.json({ error: 'Author Name, Review Content, and Rating are required.' }, { status: 400 })
    }

    // Parse operational tags from comma-separated string if provided
    let tagsArray: string[] = []
    if (typeof operational_tags === 'string') {
      tagsArray = operational_tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
    } else if (Array.isArray(operational_tags)) {
      tagsArray = operational_tags
    }

    // Create the review document in Sanity
    await writeClient.create({
      _type: 'review',
      authorName,
      agent_company: agent_company || undefined,
      origin_city: origin_city || 'India',
      segment_type: segment_type || 'Couple Packages',
      passenger_count: parseInt(passenger_count) || 2,
      content,
      rating: parseInt(rating) || 5,
      operational_tags: tagsArray,
      isApproved: false, // Must be approved by admin in Sanity Studio
    })

    // Send Admin Notification Email
    try {
      const transporter = createTransporter()
      if (transporter) {
        let adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'info.flyingwonders@gmail.com'
        try {
          const fetched = await writeClient.fetch(`*[_type == "siteSettings"][0]{ notificationEmails }`)
          if (fetched?.notificationEmails) {
            adminEmail = fetched.notificationEmails
          }
        } catch (err) {
          console.error('Failed to fetch recipient emails from siteSettings:', err)
        }
        await transporter.sendMail({
          from: `"Flying Wonders Portal" <${process.env.SMTP_USER}>`,
          to: adminEmail,
          subject: `✍️ New Review Submitted for Moderation: ${authorName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #800020; border-bottom: 2px solid #800020; padding-bottom: 0.5rem;">New Testimonial Moderation Alert</h2>
              <p>A new review has been submitted on the website and is waiting for your approval in Sanity Studio:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; margin-bottom: 1.5rem;">
                <tr style="background: #f7fafc;">
                  <td style="padding: 0.5rem; font-weight: bold; border: 1px solid #e2e8f0; width: 35%;">Author / Contact:</td>
                  <td style="padding: 0.5rem; border: 1px solid #e2e8f0;">${authorName}</td>
                </tr>
                <tr>
                  <td style="padding: 0.5rem; font-weight: bold; border: 1px solid #e2e8f0;">Agency/Company:</td>
                  <td style="padding: 0.5rem; border: 1px solid #e2e8f0;">${agent_company || 'Retail Guest'}</td>
                </tr>
                <tr style="background: #f7fafc;">
                  <td style="padding: 0.5rem; font-weight: bold; border: 1px solid #e2e8f0;">Origin City:</td>
                  <td style="padding: 0.5rem; border: 1px solid #e2e8f0;">${origin_city || 'India'}</td>
                </tr>
                <tr>
                  <td style="padding: 0.5rem; font-weight: bold; border: 1px solid #e2e8f0;">Travel Segment:</td>
                  <td style="padding: 0.5rem; border: 1px solid #e2e8f0;">${segment_type || 'Couple Packages'} (${passenger_count || 2} Pax)</td>
                </tr>
                <tr style="background: #f7fafc;">
                  <td style="padding: 0.5rem; font-weight: bold; border: 1px solid #e2e8f0;">Star Rating:</td>
                  <td style="padding: 0.5rem; border: 1px solid #e2e8f0; color: #F59E0B; font-size: 1.1rem;">${'★'.repeat(rating || 5)}${'☆'.repeat(5 - (rating || 5))}</td>
                </tr>
                <tr>
                  <td style="padding: 0.5rem; font-weight: bold; border: 1px solid #e2e8f0;">Operational Tags:</td>
                  <td style="padding: 0.5rem; border: 1px solid #e2e8f0; font-family: monospace;">${tagsArray.join(', ') || 'None'}</td>
                </tr>
              </table>

              <div style="background: #fffaf0; border-left: 4px solid #dd6b20; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem;">
                <h4 style="margin: 0 0 0.5rem 0; color: #dd6b20;">Review Content:</h4>
                <p style="margin: 0; font-style: italic; line-height: 1.5;">"${content}"</p>
              </div>

              <div style="text-align: center; margin-top: 2rem;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flyingwonders.net'}/studio" style="background: #800020; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                  Go to Sanity Studio to Approve
                </a>
              </div>
            </div>
          `
        })
      }
    } catch (emailErr: any) {
      console.error('Failed to send admin notification email for review:', emailErr.message)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you! Your review has been submitted for moderation and will appear once approved by our admin.' 
    })
  } catch (err: any) {
    console.error('Review Submission API Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
