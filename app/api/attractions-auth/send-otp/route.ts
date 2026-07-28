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

const createTransporter = () => {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '465')

  if (!user || !pass) return null
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export async function POST(req: Request) {
  try {
    const { email, name, company } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const isAdmin = normalizedEmail === 'info.flyingwonders@gmail.com'

    // 1. Fetch user record from Sanity
    let userRecord = await writeClient.fetch(
      `*[_type == "attractionsUser" && email == $email][0]`,
      { email: normalizedEmail }
    )

    // 2. Auto-seed admin user if they don't exist
    if (!userRecord && isAdmin) {
      userRecord = await writeClient.create({
        _type: 'attractionsUser',
        email: normalizedEmail,
        name: 'Admin Flying Wonders',
        company: 'Flying Wonders',
        isApproved: true,
      })
    }

    // 3. Handle new sign-ups / access requests
    if (!userRecord) {
      if (!name || !company) {
        return NextResponse.json({
          error: 'Profile not found. Please provide name and company to request access.'
        }, { status: 404 })
      }

      // Create new pending user
      await writeClient.create({
        _type: 'attractionsUser',
        email: normalizedEmail,
        name,
        company,
        isApproved: false,
      })

      // Send admin notification email
      const transporter = createTransporter()
      if (transporter) {
        try {
          await transporter.sendMail({
            from: `"B2B Attractions Live" <${process.env.SMTP_USER}>`,
            to: 'info.flyingwonders@gmail.com',
            subject: `🔔 Attractions Live: New Access Request from ${name}`,
            html: `
              <h3>New Access Request Received</h3>
              <p>A new agent has requested access to the B2B Live Attractions feed:</p>
              <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Company:</strong> ${company}</li>
                <li><strong>Email:</strong> ${normalizedEmail}</li>
              </ul>
              <p>Please log into your Sanity Studio to review and approve this user.</p>
            `
          })
        } catch (emailErr) {
          console.error('Failed to send admin sign-up notification:', emailErr)
        }
      }

      return NextResponse.json({
        success: true,
        pending: true,
        message: 'Access request submitted successfully. Awaiting approval by admin.'
      })
    }

    // 4. Handle pending approval state
    if (!userRecord.isApproved) {
      return NextResponse.json({
        error: 'Your access request is pending approval. You will receive an email once approved.'
      }, { status: 403 })
    }

    // 5. Approved user: Generate OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes valid

    await writeClient
      .patch(userRecord._id)
      .set({ otp, otpExpiry })
      .commit()

    // 6. Send OTP to User
    const transporter = createTransporter()
    let emailSent = false
    let smtpError = ''

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"B2B Attractions Live" <${process.env.SMTP_USER}>`,
          to: normalizedEmail,
          subject: `🔑 Attractions Live OTP: ${otp}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #B83A4B; text-align: center;">B2B Attractions Live Portal</h2>
              <p>Hello,</p>
              <p>Your login verification code is:</p>
              <div style="background: #f7fafc; padding: 1.5rem; text-align: center; font-size: 2.2rem; font-weight: bold; letter-spacing: 0.1em; color: #1a202c; border: 1px dashed #cbd5e0; margin: 1.5rem 0;">
                ${otp}
              </div>
              <p style="font-size: 0.9rem; color: #718096; text-align: center;">This code is valid for 10 minutes.</p>
            </div>
          `,
        })
        emailSent = true
      } catch (err: any) {
        console.error('SMTP Send Failed:', err)
        smtpError = err.message || 'SMTP transport error'
      }
    } else {
      smtpError = 'SMTP credentials not configured in environment'
    }

    return NextResponse.json({
      success: true,
      emailSent,
      smtpError,
      debugOtp: !emailSent ? otp : null,
    })
  } catch (err: any) {
    console.error('Attractions Send OTP Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
