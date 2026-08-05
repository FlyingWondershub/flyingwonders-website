import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import nodemailer from 'nodemailer'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

export const dynamic = 'force-dynamic'

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
    const { email, companyName, agentName, phone } = await req.json()

    const cleanEmail = email.trim().toLowerCase()

    // 1. Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes valid

    // 2. Query if agent exists in Sanity (case-insensitive)
    const agent = await writeClient.fetch(`*[_type == "b2bAgent" && (lower(email) == $cleanEmail || email == $cleanEmail)][0]`, { cleanEmail })
    let isNewAgent = false

    if (agent) {
      if (!agent.isActive) {
        return NextResponse.json({ error: 'This agent account has been deactivated by admin.' }, { status: 403 })
      }
      // Update existing agent with new OTP
      await writeClient
        .patch(agent._id)
        .set({ otp, otpExpiry })
        .commit()
    } else {
      // If it's a sign-in attempt (no registration details provided), return error
      if (!companyName || !agentName) {
        return NextResponse.json({ error: "Account not found. Please click 'Register Agency' to sign up first." }, { status: 404 })
      }

      isNewAgent = true
      // Create new agent profile (Auto-approved on verification)
      await writeClient.create({
        _type: 'b2bAgent',
        companyName: companyName || 'N/A',
        agentName: agentName || 'N/A',
        email: cleanEmail,
        phone: phone || 'N/A',
        isActive: true,
        otp,
        otpExpiry,
      })

      // By default add all B2B agent accounts to Newsletter subscribers
      try {
        const existingSub = await writeClient.fetch(`*[_type == "newsletterSubscriber" && (lower(email) == $cleanEmail || email == $cleanEmail)][0]`, { cleanEmail })
        if (!existingSub) {
          await writeClient.create({
            _type: 'newsletterSubscriber',
            email,
            subscribedAt: new Date().toISOString(),
            isActive: true,
          })
          console.log(`Auto-subscribed B2B agent email ${email} to newsletter.`);
        }
      } catch (subErr) {
        console.error('Failed to auto-subscribe agent to newsletter:', subErr)
      }
    }

    // 3. Dispatch OTP Email to Agent
    const transporter = createTransporter()
    let emailSent = false
    let smtpError = ''

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Flying Wonders B2B" <${process.env.SMTP_USER}>`,
          to: email,
          subject: `🔐 Flying Wonders B2B Verification Code: ${otp}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #B83A4B; text-align: center;">Flying Wonders Singapore DMC</h2>
              <p>Hello,</p>
              <p>Your one-time verification code to access the B2B Package Cost Estimator is:</p>
              <div style="background: #f7fafc; padding: 1.5rem; text-align: center; font-size: 2.2rem; font-weight: bold; letter-spacing: 0.1em; color: #1a202c; border: 1px dashed #cbd5e0; margin: 1.5rem 0;">
                ${otp}
              </div>
              <p style="font-size: 0.9rem; color: #718096; text-align: center;">This code is valid for 10 minutes. Do not share this OTP with anyone.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 2rem 0;" />
              <p style="font-size: 0.8rem; color: #a0aec0; text-align: center;">Flying Wonders Private Limited | Singapore & India Specialist DMC</p>
            </div>
          `,
        })
        emailSent = true

        // Send admin notification if it's a new registration
        if (isNewAgent) {
          const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'info.flyingwonders@gmail.com'
          await transporter.sendMail({
            from: `"B2B Portal" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `💼 New B2B Agent Registered: ${agentName} (${companyName})`,
            html: `
              <h3>New B2B Agent Sign-Up Notification</h3>
              <p>A new travel agent has verified their email and registered on the platform:</p>
              <ul>
                <li><strong>Agent Name:</strong> ${agentName}</li>
                <li><strong>Agency/Company:</strong> ${companyName}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Phone:</strong> ${phone}</li>
              </ul>
              <p>You can manage this profile in your Sanity Studio at '/studio' under B2B Agent Accounts.</p>
            `,
          })
        }

      } catch (err: any) {
        console.error('SMTP Send Failed:', err)
        smtpError = err.message || 'SMTP transport error'
      }
    } else {
      smtpError = 'SMTP credentials not configured in environment'
    }

    // 4. Return success (and the OTP in development/debug mode for testing if SMTP is not ready)
    return NextResponse.json({
      success: true,
      emailSent,
      smtpError,
      // Fallback debug code to make testing easy without forcing SMTP environment variables first
      debugOtp: !emailSent ? otp : null,
    })
  } catch (err: any) {
    console.error('Send OTP Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
