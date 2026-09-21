import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'
import { sendEmail } from '../../../../lib/brevo'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})


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
      try {
        await sendEmail({
          to: 'info.flyingwonders@gmail.com',
          subject: `🔔 Attractions Live: New Access Request from ${name}`,
          senderName: 'Flying Wonders Attractions Live',
          senderEmail: 'contact@flyingwonders.net',
          replyTo: normalizedEmail,
          html: `
            <h3>New Access Request Received</h3>
            <p>A new agent has requested access to the B2B Live Attractions feed:</p>
            <ul>
              <li><strong>Name:</strong> ${name}</li>
              <li><strong>Company:</strong> ${company}</li>
              <li><strong>Email:</strong> ${normalizedEmail}</li>
            </ul>
            <p>Please log into your Sanity Studio to review and approve this user.</p>
          `,
        })
      } catch (emailErr) {
        console.error('Failed to send admin sign-up notification:', emailErr)
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
    let emailSent = false
    let smtpError = ''

    try {
      const sendResult = await sendEmail({
        to: normalizedEmail,
        subject: `🔑 Attractions Live OTP: ${otp}`,
        senderName: 'Flying Wonders Attractions Live',
        senderEmail: 'contact@flyingwonders.net',
        replyTo: 'contact@flyingwonders.net',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #800020; text-align: center;">Flying Wonders Attractions Live</h2>
            <p>Hello,</p>
            <p>Your login verification code is:</p>
            <div style="background: #f7fafc; padding: 1.5rem; text-align: center; font-size: 2.2rem; font-weight: bold; letter-spacing: 0.1em; color: #1a202c; border: 1px dashed #cbd5e0; margin: 1.5rem 0;">
              ${otp}
            </div>
            <p style="font-size: 0.9rem; color: #718096; text-align: center;">This code is valid for 10 minutes.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;" />
            <p style="font-size: 0.8rem; color: #a0aec0; text-align: center;">Flying Wonders Private Limited | Singapore & India Specialist DMC</p>
          </div>
        `,
      })

      if (sendResult.success) {
        emailSent = true
      } else {
        smtpError = sendResult.error || 'Failed to dispatch email'
        console.error('Attractions OTP Send Error:', smtpError)
      }
    } catch (err: any) {
      console.error('Attractions OTP Send Error:', err)
      smtpError = err.message || 'SMTP transport error'
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
