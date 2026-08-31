import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { client } from '../../../../sanity/lib/client'
import { createClient } from 'next-sanity'

// Sanity Write Client for logging leads
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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      name,
      institution,
      email,
      phone,
      cohort,
      students,
      travelDate,
      notes,
      totalPrice
    } = body

    // 1. Basic validation
    if (!name || !email || !phone || !institution) {
      return NextResponse.json(
        { error: 'Coordinator name, institution, email, and phone number are required.' },
        { status: 400 }
      )
    }

    const studentCount = Number(students) || 30
    const chaperoneCount = Math.floor(studentCount / 10)
    const formattedNotes = `[Education Tour Proposal Request]\nInstitution: ${institution}\nCohort: ${cohort || 'School / College / MBA'}\nDelegates: ${studentCount} Students + ${chaperoneCount} Free Chaperones\nTarget Date: ${travelDate || 'Flexible'}\nSpecial Requirements: ${notes || 'None'}`

    // 2. Log lead directly to Sanity CMS
    const writeClient = getSanityWriteClient()
    let sanityDocId = null

    if (writeClient) {
      try {
        const doc = await writeClient.create({
          _type: 'bookingRequest',
          name,
          email,
          phone,
          travelDate: travelDate || '',
          tier: 'education',
          travelers: studentCount,
          totalPrice: Number(totalPrice) || 0,
          notes: formattedNotes,
          submittedAt: new Date().toISOString(),
        })
        sanityDocId = doc._id
        console.log(`Successfully logged education tour lead to Sanity with ID: ${sanityDocId}`)
      } catch (sanityError) {
        console.error('Failed to log education tour lead to Sanity CMS:', sanityError)
      }
    }

    // 3. Determine Notification Recipients (Education Tours Sanity -> Global Site Settings -> Default)
    let recipientEmails = 'info.flyingwonders@gmail.com'
    try {
      // First check Education Tours page specific setting
      const eduSettings = await client.fetch(`*[_type == "educationToursSettings"][0]{ notificationEmails }`)
      if (eduSettings?.notificationEmails && eduSettings.notificationEmails.trim() !== '') {
        recipientEmails = eduSettings.notificationEmails.trim()
      } else {
        // Fallback to Global Site Settings notification emails
        const globalSettings = await client.fetch(`*[_type == "siteSettings"][0]{ notificationEmails }`)
        if (globalSettings?.notificationEmails && globalSettings.notificationEmails.trim() !== '') {
          recipientEmails = globalSettings.notificationEmails.trim()
        }
      }
    } catch (fetchErr) {
      console.error('Error fetching notification emails from Sanity:', fetchErr)
    }

    const now = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })

    // 4. Send Email via Nodemailer (SMTP) if configured
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const host = process.env.SMTP_HOST || 'smtp.gmail.com'
    const port = parseInt(process.env.SMTP_PORT || '465')

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #05241B 0%, #093E30 60%, #0B2545 100%); padding: 2rem; color: #ffffff;">
          <span style="background: rgba(245,158,11,0.25); border: 1px solid #f59e0b; color: #fde68a; font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.08em; display: inline-block; margin-bottom: 8px;">
            🎓 New Institutional Tour Proposal Request
          </span>
          <h1 style="margin: 0; font-size: 1.4rem; font-weight: 800; color: #ffffff;">${institution}</h1>
          <p style="margin: 0.35rem 0 0; opacity: 0.9; font-size: 0.88rem; color: #a7f3d0;">Coordinator: ${name} • ${now} (IST)</p>
        </div>

        <!-- Body -->
        <div style="padding: 1.75rem;">
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
            <strong style="color: #065f46; font-size: 0.92rem;">🔔 High-Priority Educational Delegation Lead</strong>
            <p style="margin: 0.35rem 0 0; font-size: 0.84rem; color: #047857; line-height: 1.45;">
              An institutional coordinator has submitted a request for a customized Singapore study circuit.
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; margin-bottom: 1.5rem;">
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.6rem 0; font-weight: 700; color: #475569; width: 35%;">Institution / College:</td>
                <td style="padding: 0.6rem 0; font-weight: 800; color: #0f172a;">${institution}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.6rem 0; font-weight: 700; color: #475569;">Coordinator Name:</td>
                <td style="padding: 0.6rem 0; font-weight: 700; color: #0f172a;">${name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.6rem 0; font-weight: 700; color: #475569;">Official Email:</td>
                <td style="padding: 0.6rem 0; color: #2563eb; font-weight: 700;">
                  <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.6rem 0; font-weight: 700; color: #475569;">Phone / WhatsApp:</td>
                <td style="padding: 0.6rem 0; font-weight: 700; color: #0f172a;">
                  <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #059669; text-decoration: none;">
                    📱 ${phone} (Click to WhatsApp)
                  </a>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.6rem 0; font-weight: 700; color: #475569;">Student Cohort:</td>
                <td style="padding: 0.6rem 0; font-weight: 700; color: #0f172a;">${cohort || 'General'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.6rem 0; font-weight: 700; color: #475569;">Delegation Size:</td>
                <td style="padding: 0.6rem 0; font-weight: 800; color: #059669;">
                  ${studentCount} Students + ${chaperoneCount} Free Chaperones
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.6rem 0; font-weight: 700; color: #475569;">Target Travel Date:</td>
                <td style="padding: 0.6rem 0; font-weight: 700; color: #0f172a;">${travelDate || 'Flexible / Not set'}</td>
              </tr>
              ${totalPrice ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.6rem 0; font-weight: 700; color: #475569;">Estimated Budget:</td>
                <td style="padding: 0.6rem 0; font-weight: 800; color: #d97706;">SGD ~${totalPrice}</td>
              </tr>` : ''}
            </tbody>
          </table>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
            <div style="font-size: 0.78rem; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 4px;">
              Special Requirements & Inquiries:
            </div>
            <p style="font-size: 0.85rem; color: #334155; line-height: 1.5; margin: 0; white-space: pre-wrap;">${notes || 'None specified'}</p>
          </div>

          <div style="text-align: center; padding-top: 0.5rem;">
            <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${name}, thank you for reaching out to Flying Wonders regarding your Singapore Education Tour proposal for ${institution}.`)}"
              style="display: inline-block; background: #059669; color: #ffffff; padding: 0.75rem 1.75rem; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 0.88rem; box-shadow: 0 4px 12px rgba(5,150,105,0.25);">
              💬 Reply to Coordinator on WhatsApp
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 1rem; text-align: center; font-size: 0.75rem; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Flying Wonders Destination Management Company • Singapore & Bangalore<br/>
          Notification routed to: ${recipientEmails}
        </div>
      </div>
    `

    if (user && pass) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        })

        await transporter.sendMail({
          from: `"Flying Wonders Education Desk" <${user}>`,
          to: recipientEmails,
          replyTo: email,
          subject: `🎓 [Education Tour Proposal] ${institution} (~${studentCount} Students) - ${name}`,
          html: emailHtml
        })
        console.log(`Email notification sent successfully to ${recipientEmails}`)
      } catch (smtpErr) {
        console.error('SMTP notification send failed:', smtpErr)
      }
    } else {
      console.warn('SMTP credentials not provided. Attempting Web3Forms fallback...')
    }

    // 5. Web3Forms notification fallback
    const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
    if (web3formsKey) {
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: web3formsKey,
            subject: `🎓 [Education Tour] ${institution} (~${studentCount} Students) - ${name}`,
            from_name: `Flying Wonders Education Desk`,
            to_email: recipientEmails,
            name,
            email,
            phone,
            institution,
            cohort,
            students: studentCount,
            travel_date: travelDate,
            notes,
            message: formattedNotes
          })
        })
        console.log(`Web3Forms alert dispatched successfully to ${recipientEmails}`)
      } catch (w3Err) {
        console.error('Web3Forms dispatch error:', w3Err)
      }
    }

    return NextResponse.json({
      success: true,
      sanityDocId,
      recipientEmails,
      message: 'Proposal request logged and notifications sent successfully!'
    })

  } catch (error: any) {
    console.error('Education tour inquiry route error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process inquiry.' },
      { status: 500 }
    )
  }
}
