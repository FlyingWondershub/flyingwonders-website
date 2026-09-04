import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

function createTransporter() {
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
    const body = await req.json()
    const { email, companyName, agentName, phone, source, isDirectory, logoAssetId } = body

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const isNeutralDirectory = source === 'b2b-directory' || isDirectory === true

    // 1. Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes valid

    // 2. Query if agent or profile exists
    if (!isNeutralDirectory) {
      // ══ AGENT PORTAL WORKFLOW (b2bAgent schema) ══
      const agent = await writeClient.fetch(`*[_type == "b2bAgent" && (lower(email) == $cleanEmail || email == $cleanEmail)][0]`, { cleanEmail })

      if (agent) {
        if (!agent.isActive) {
          return NextResponse.json({ error: 'This agent account has been deactivated by admin.' }, { status: 403 })
        }
        const patchData: any = { otp, otpExpiry }
        if (logoAssetId) {
          patchData.logo = {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: logoAssetId,
            },
          }
        }
        await writeClient
          .patch(agent._id)
          .set(patchData)
          .commit()
      } else {
        if (!companyName || !agentName) {
          return NextResponse.json({ error: "Account not found. Please click 'Register Agency' to sign up first." }, { status: 404 })
        }

        const newAgentDoc: any = {
          _type: 'b2bAgent',
          companyName: companyName || 'N/A',
          agentName: agentName || 'N/A',
          email: cleanEmail,
          phone: phone || 'N/A',
          isActive: true,
          otp,
          otpExpiry,
        }

        if (logoAssetId) {
          newAgentDoc.logo = {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: logoAssetId,
            },
          }
        }

        await writeClient.create(newAgentDoc)

        try {
          const existingSub = await writeClient.fetch(`*[_type == "newsletterSubscriber" && (lower(email) == $cleanEmail || email == $cleanEmail)][0]`, { cleanEmail })
          if (!existingSub) {
            await writeClient.create({
              _type: 'newsletterSubscriber',
              email: cleanEmail,
              subscribedAt: new Date().toISOString(),
              isActive: true,
            })
          }
        } catch (subErr) {}
      }
    } else {
      // ══ B2B DIRECTORY WORKFLOW (b2bCatalogProfile schema) ══
      const existingProfile = await writeClient.fetch(`*[_type == "b2bCatalogProfile" && lower(email) == $cleanEmail][0]`, { cleanEmail })
      if (existingProfile) {
        await writeClient
          .patch(existingProfile._id)
          .set({ otp, otpExpiry })
          .commit()
      } else {
        const existingAgent = await writeClient.fetch(`*[_type == "b2bAgent" && lower(email) == $cleanEmail][0]`, { cleanEmail })
        if (existingAgent) {
          await writeClient.patch(existingAgent._id).set({ otp, otpExpiry }).commit()
        }
      }
    }

    // 3. Dispatch Notification Email
    const transporter = createTransporter()
    let emailSent = false
    let smtpError = ''

    if (transporter) {
      try {
        const mailSubject = isNeutralDirectory
          ? `🔑 B2B Partner Portal Verification Passcode: ${otp}`
          : `🔐 Flying Wonders B2B Verification Code: ${otp}`

        const mailSender = isNeutralDirectory
          ? `"B2B Directory Verification" <${process.env.SMTP_USER}>`
          : `"Flying Wonders B2B" <${process.env.SMTP_USER}>`

        const mailHtml = isNeutralDirectory ? `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 2.5rem; max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); color: #1E293B;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <h2 style="color: #0F4C3A; font-size: 1.4rem; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.02em;">🌐 Global B2B Partner Directory</h2>
              <p style="color: #64748B; font-size: 0.85rem; margin: 0; font-weight: 600;">Self-Service Profile Access & Verification</p>
            </div>
            
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.5rem; text-align: center; margin-bottom: 1.5rem;">
              <p style="font-size: 0.9rem; color: #475569; margin: 0 0 1rem 0; font-weight: 600;">Your one-time verification passcode to create or edit your B2B Directory listing is:</p>
              <div style="background-color: #0F4C3A; color: #FFFFFF; display: inline-block; padding: 0.75rem 2rem; border-radius: 10px; font-size: 2.2rem; font-weight: 900; letter-spacing: 0.35em;">
                ${otp}
              </div>
              <p style="font-size: 0.78rem; color: #94A3B8; margin: 1rem 0 0 0;">Expires in 10 minutes • Keep this code confidential</p>
            </div>
            
            <p style="font-size: 0.82rem; color: #64748B; line-height: 1.5; text-align: center; margin: 0 0 1.5rem 0;">
              If you did not request this verification code, you can safely ignore this security notification.
            </p>
            
            <hr style="border: 0; border-top: 1px dashed #CBD5E1; margin: 1.5rem 0;" />
            <p style="font-size: 0.75rem; color: #94A3B8; text-align: center; margin: 0;">
              B2B Directory Automated Verification Service • Global Travel Partner Showcase
            </p>
          </div>
        ` : `
          <div style="font-family: Arial, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #B83A4B; text-align: center;">Flying Wonders Singapore DMC</h2>
            <p>Your one-time verification code to access the B2B Package Cost Estimator is:</p>
            <div style="background-color: #f7fafc; padding: 1rem; text-align: center; border-radius: 6px; margin: 1.5rem 0;">
              <span style="font-size: 2.5rem; font-weight: bold; letter-spacing: 0.2em; color: #B83A4B;">${otp}</span>
            </div>
            <p style="font-size: 0.9rem; color: #718096;">This code is valid for 10 minutes. Do not share this code with anyone.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;" />
            <p style="font-size: 0.8rem; color: #a0aec0; text-align: center;">Flying Wonders Private Limited | Singapore & India Specialist DMC</p>
          </div>
        `

        await transporter.sendMail({
          from: mailSender,
          to: email,
          subject: mailSubject,
          html: mailHtml,
        })
        emailSent = true
      } catch (err: any) {
        console.error('SMTP Email Send Error:', err)
        smtpError = err.message || 'Failed to send email via SMTP'
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent ? 'Verification code sent to your email.' : 'OTP generated.',
      debugOtp: process.env.NODE_ENV !== 'production' || !emailSent ? otp : undefined,
    })

  } catch (error: any) {
    console.error('Error in send-otp API:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
