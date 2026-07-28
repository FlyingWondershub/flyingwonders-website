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

export async function POST(req: Request) {
  try {
    const { name, email, phone, attractionName } = await req.json()

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Name, email and phone number are required.' }, { status: 400 })
    }

    // 1. Create Promotion Inquiry Document in Sanity
    await writeClient.create({
      _type: 'promotionInquiry',
      name,
      email,
      phone,
      attractionName: attractionName || 'General',
      submittedAt: new Date().toISOString(),
    })

    // 2. Add/Transfer contact to Newsletter Subscribers if not already active
    try {
      const existing = await writeClient.fetch(
        `*[_type == "newsletterSubscriber" && email == $email][0]`,
        { email }
      )
      if (!existing) {
        await writeClient.create({
          _type: 'newsletterSubscriber',
          email,
          subscribedAt: new Date().toISOString(),
          isActive: true,
        })
      } else if (!existing.isActive) {
        await writeClient
          .patch(existing._id)
          .set({ isActive: true, subscribedAt: new Date().toISOString() })
          .commit()
      }
    } catch (err) {
      console.error('Failed to subscribe user to newsletter during promotion inquiry:', err)
    }

    // 3. Send Email Notification
    try {
      const user = process.env.SMTP_USER
      const pass = process.env.SMTP_PASS
      const host = process.env.SMTP_HOST || 'smtp.gmail.com'
      const port = parseInt(process.env.SMTP_PORT || '465')

      if (user && pass) {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        })

        // Fetch dynamic emails from siteSettings
        let recipientEmails = 'info.flyingwonders@gmail.com'
        try {
          const fetched = await writeClient.fetch(`*[_type == "siteSettings"][0]{ notificationEmails }`)
          if (fetched?.notificationEmails) {
            recipientEmails = fetched.notificationEmails
          }
        } catch (err) {
          console.error('Failed to fetch recipient emails from siteSettings:', err)
        }

        await transporter.sendMail({
          from: `"Flying Wonders Alerts" <${user}>`,
          to: recipientEmails,
          subject: `🔥 New Promotion Inquiry: ${attractionName || 'General'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #9a1f2f, #B83A4B); padding: 20px 24px; color: white;">
                <h2 style="margin: 0; font-size: 18px;">🎟️ New Promotion Claim / Inquiry</h2>
              </div>
              <div style="padding: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; width: 150px;">Full Name:</td>
                    <td style="padding: 8px 0;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                    <td style="padding: 8px 0;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                    <td style="padding: 8px 0;">${phone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Promotion:</td>
                    <td style="padding: 8px 0; color: #C53030; font-weight: bold;">${attractionName || 'General (All Deals)'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Submitted:</td>
                    <td style="padding: 8px 0;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                  </tr>
                </table>
                <div style="margin-top: 20px; padding: 12px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; color: #15803D; font-size: 13px;">
                  ℹ️ This contact has also been automatically added/activated in the Newsletter Subscribers list.
                </div>
              </div>
            </div>
          `
        })
      } else {
        console.warn('SMTP not configured — skipping email for promotion inquiry.')
      }
    } catch (err) {
      console.error('Failed to send email notification for promotion inquiry:', err)
    }

    return NextResponse.json({ success: true, message: 'Your inquiry has been submitted successfully and subscribed to the newsletter!' })
  } catch (err: any) {
    console.error('Promotion Inquiry API Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
