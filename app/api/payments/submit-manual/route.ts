import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import nodemailer from 'nodemailer'

const getSanityWriteClient = () => {
  const token = process.env.SANITY_WRITE_TOKEN
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8xtd7yiv'
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

  if (!token) {
    console.warn('SANITY_WRITE_TOKEN is missing. Cannot perform write operations.')
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
      bookingReference,
      guestName,
      email,
      phone,
      amountSgd,
      amountInr,
      exchangeRateUsed,
      utrNumber,
      screenshotBase64,
      notes
    } = body

    if (!utrNumber || !utrNumber.trim()) {
      return NextResponse.json({ error: 'UTR / Transaction Reference number is required.' }, { status: 400 })
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
    }

    const writeClient = getSanityWriteClient()
    if (!writeClient) {
      return NextResponse.json({ error: 'Sanity write client is not configured.' }, { status: 500 })
    }

    // 1. Upload screenshot asset to Sanity if provided
    let screenshotAssetRef = null
    if (screenshotBase64 && screenshotBase64.includes('base64,')) {
      try {
        const commaIdx = screenshotBase64.indexOf(',')
        const data = screenshotBase64.substring(commaIdx + 1).replace(/[\r\n\s]/g, '')
        const buffer = Buffer.from(data, 'base64')
        
        const asset = await writeClient.assets.upload('image', buffer, {
          filename: `utr_${utrNumber.trim()}_${Date.now()}.jpg`,
          contentType: 'image/jpeg'
        })
        screenshotAssetRef = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id
          }
        }
      } catch (uploadErr) {
        console.warn('Failed to upload payment screenshot asset to Sanity:', uploadErr)
      }
    }

    const finalBookingRef = bookingReference || `FW-UPI-${Math.floor(100000 + Math.random() * 900000)}`

    // 2. Insert manualPayment document into Sanity
    const newDoc: any = {
      _type: 'manualPayment',
      bookingReference: finalBookingRef,
      guestName: guestName || 'Valued Guest',
      email: email.trim(),
      phone: phone || '',
      amountSgd: Number(amountSgd) || 0,
      amountInr: Number(amountInr) || 0,
      exchangeRateUsed: Number(exchangeRateUsed) || 0,
      utrNumber: utrNumber.trim(),
      status: 'pending_verification',
      submittedAt: new Date().toISOString(),
      notes: notes || ''
    }

    if (screenshotAssetRef) {
      newDoc.paymentScreenshot = screenshotAssetRef
    }

    const createdDoc = await writeClient.create(newDoc)

    // 3. Resolve Admin Recipient Email
    let adminEmailList = ['info.flyingwonders@gmail.com']
    try {
      const siteSettings = await writeClient.fetch(`*[_type == "siteSettings"][0]{ notificationEmails }`)
      if (siteSettings?.notificationEmails) {
        const parsed = siteSettings.notificationEmails.split(',').map((e: string) => e.trim()).filter(Boolean)
        if (parsed.length > 0) adminEmailList = parsed
      }
    } catch (e) {}

    // Transporter initialization
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
    const smtpPort = parseInt(process.env.SMTP_PORT || '465')

    let mailerTransporter: nodemailer.Transporter | null = null
    if (smtpUser && smtpPass) {
      mailerTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass }
      })
    }

    // A. CUSTOMER AUTO-RECEIPT EMAIL
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #F8FAFC; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #10B981; margin: 0; font-size: 22px;">Payment Receipt Acknowledgment</h2>
          <p style="color: #94A3B8; font-size: 14px; margin-top: 4px;">Flying Wonders Pvt Ltd • Singapore DMC</p>
        </div>

        <div style="background: #1E293B; padding: 18px; border-radius: 8px; border-left: 4px solid #10B981; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 15px; color: #E2E8F0;">Dear <strong>${guestName || 'Valued Guest'}</strong>,</p>
          <p style="font-size: 14px; color: #CBD5E1; margin: 10px 0 0 0; line-height: 1.5;">
            Thank you for submitting your payment details! Our accounts team is currently verifying your UTR reference with ICICI Bank and will issue your confirmed booking voucher shortly.
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; background: #1E293B; border-radius: 8px; font-size: 14px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px 14px; color: #94A3B8; border-bottom: 1px solid #334155;">Booking Reference</td>
            <td style="padding: 10px 14px; color: #10B981; font-weight: bold; border-bottom: 1px solid #334155; text-align: right;">${finalBookingRef}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; color: #94A3B8; border-bottom: 1px solid #334155;">UTR / Txn Reference</td>
            <td style="padding: 10px 14px; color: #F8FAFC; font-weight: bold; border-bottom: 1px solid #334155; text-align: right;">${utrNumber.trim()}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; color: #94A3B8; border-bottom: 1px solid #334155;">Amount Paid (INR)</td>
            <td style="padding: 10px 14px; color: #F8FAFC; font-weight: bold; border-bottom: 1px solid #334155; text-align: right;">₹ ${Number(amountInr).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; color: #94A3B8;">Amount in SGD</td>
            <td style="padding: 10px 14px; color: #F8FAFC; text-align: right;">SGD ${Number(amountSgd).toLocaleString()}</td>
          </tr>
        </table>

        <!-- WHATSAPP QUICK RESPONSE CALLOUT -->
        <div style="text-align: center; background: #064E3B; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <p style="color: #34D399; font-size: 13px; font-weight: bold; margin: 0 0 10px 0;">NEED A QUICKER CONFIRMATION?</p>
          <a href="https://wa.me/919886171251?text=${encodeURIComponent(`Hi Flying Wonders, I have paid ₹${amountInr} for reference ${finalBookingRef} (UTR: ${utrNumber}). Please confirm!`)}" 
             style="display: inline-block; background: #10B981; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 14px;">
            💬 Chat with Team on WhatsApp
          </a>
        </div>

        <p style="text-align: center; color: #64748B; font-size: 12px; margin: 0;">
          Flying Wonders Pvt Ltd • Dual Office Presence (Singapore & India)
        </p>
      </div>
    `

    // B. ADMIN ALERT EMAIL
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #059669;">⚠️ New ICICI Bank UPI Payment Received</h2>
        <p>A new offline payment submission requires ICICI Bank verification:</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 500px;">
          <tr><td><strong>Reference</strong></td><td>${finalBookingRef}</td></tr>
          <tr><td><strong>Guest / Agent</strong></td><td>${guestName || 'N/A'}</td></tr>
          <tr><td><strong>Email</strong></td><td>${email}</td></tr>
          <tr><td><strong>Phone / WA</strong></td><td>${phone || 'N/A'}</td></tr>
          <tr><td><strong>UTR Number</strong></td><td style="background: #FEF3C7; font-weight: bold;">${utrNumber.trim()}</td></tr>
          <tr><td><strong>INR Paid</strong></td><td>₹ ${Number(amountInr).toLocaleString('en-IN')}</td></tr>
          <tr><td><strong>SGD Equivalent</strong></td><td>SGD ${Number(amountSgd).toLocaleString()}</td></tr>
          <tr><td><strong>Applied Rate</strong></td><td>₹ ${exchangeRateUsed} / SGD</td></tr>
        </table>
        <p style="margin-top: 15px;">Please check your ICICI Bank mobile app for UTR <strong>${utrNumber.trim()}</strong> and update the status in Sanity Studio.</p>
      </div>
    `

    if (mailerTransporter) {
      // Send auto-email to customer
      try {
        await mailerTransporter.sendMail({
          from: `"Flying Wonders Accounts" <${smtpUser}>`,
          to: email.trim(),
          subject: `Payment Receipt Received - ${finalBookingRef}`,
          html: customerHtml
        })
      } catch (custErr) {
        console.warn('Failed to send customer auto-email:', custErr)
      }

      // Send admin alert email
      try {
        await mailerTransporter.sendMail({
          from: `"Flying Wonders Portal" <${smtpUser}>`,
          to: adminEmailList.join(','),
          subject: `[Payment Submission] ${guestName || 'Guest'} - ₹${amountInr} (UTR: ${utrNumber.trim()})`,
          html: adminHtml
        })
      } catch (adminErr) {
        console.warn('Failed to send admin payment alert email:', adminErr)
      }
    }

    return NextResponse.json({
      success: true,
      bookingReference: finalBookingRef,
      id: createdDoc._id
    })

  } catch (error: any) {
    console.error('Error submitting manual payment:', error)
    return NextResponse.json({ error: error.message || 'Failed to submit payment details.' }, { status: 500 })
  }
}
