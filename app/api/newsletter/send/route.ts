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

// Nodemailer SMTP Transporter
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
    const { campaignId, adminEmail } = await req.json()

    // 1. Verify that the request is initiated by the admin
    const allowedAdmins = ['info.flyingwonders@gmail.com', 'support.flyingwonders@gmail.com']
    if (!adminEmail || !allowedAdmins.includes(adminEmail.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized. Only admins can dispatch newsletters.' }, { status: 403 })
    }

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required.' }, { status: 400 })
    }

    // 2. Fetch the Campaign document from Sanity
    const campaign = await writeClient.fetch(
      `*[_type == "newsletterCampaign" && _id == $campaignId][0]`,
      { campaignId }
    )

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 })
    }

    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'This campaign has already been sent.' }, { status: 400 })
    }

    // 3. Fetch all active subscribers
    const subscribers = await writeClient.fetch(
      `*[_type == "newsletterSubscriber" && isActive == true].email`
    )

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No active subscribers found in list.' }, { status: 400 })
    }

    // 4. Initialize SMTP
    const transporter = createTransporter()
    if (!transporter) {
      return NextResponse.json({ error: 'SMTP transporter not configured. Setup variables in Vercel.' }, { status: 500 })
    }

    console.log(`Starting newsletter dispatch to ${subscribers.length} subscribers for campaign: ${campaign.title}`)

    // 5. Send emails
    let successCount = 0
    const errors = []

    for (const email of subscribers) {
      try {
        await transporter.sendMail({
          from: `"Flying Wonders" <${process.env.SMTP_USER}>`,
          to: email,
          subject: campaign.subject,
          html: `
            <div style="font-family: Arial, sans-serif; color: #1a202c; max-width: 600px; margin: 0 auto; line-height: 1.6;">
              <header style="background: #800020; padding: 2rem 1.5rem; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 1.8rem; letter-spacing: 0.1em; text-transform: uppercase;">Flying Wonders</h1>
                <p style="color: #dfba6b; margin: 0.5rem 0 0 0; font-size: 0.8rem; letter-spacing: 0.25em; text-transform: uppercase;">Singapore Insider Guide</p>
              </header>
              <main style="padding: 2.5rem 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-bottom: none;">
                ${campaign.content.replace(/\n/g, '<br />')}
              </main>
              <footer style="background: #f7fafc; padding: 1.5rem; text-align: center; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; font-size: 0.75rem; color: #718096;">
                <p style="margin: 0 0 0.5rem 0;">Flying Wonders Private Limited | Singapore & India Specialist DMC</p>
                <p style="margin: 0;">You received this email because you subscribed to the Singapore Insider Guide. If you wish to unsubscribe, please email us at info.flyingwonders@gmail.com</p>
              </footer>
            </div>
          `
        })
        successCount++
      } catch (err: any) {
        console.error(`Failed to send to ${email}:`, err.message)
        errors.push({ email, error: err.message })
      }
    }

    // 6. Update Sanity Campaign Document Status
    await writeClient
      .patch(campaign._id)
      .set({
        status: 'sent',
        sentAt: new Date().toISOString(),
        sentToCount: successCount
      })
      .commit()

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      totalCount: subscribers.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (err: any) {
    console.error('Newsletter Dispatch Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
