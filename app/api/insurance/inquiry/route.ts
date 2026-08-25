import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      fullName,
      email,
      phone,
      passportNumber,
      destination,
      startDate,
      endDate,
      durationDays,
      planName,
      sumInsured,
      premiumTotalINR,
      travelersCount,
      travelerAges,
      notes,
    } = body

    if (!fullName || !phone || !email) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and phone number are required.' },
        { status: 400 }
      )
    }

    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const host = process.env.SMTP_HOST || 'smtp.gmail.com'
    const port = parseInt(process.env.SMTP_PORT || '465')

    const now = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    if (user && pass) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 1.8rem; color: #ffffff;">
            <h1 style="margin: 0; font-size: 1.4rem; font-weight: 700; letter-spacing: 0.02em;">🛡️ Flying Wonders Travel Insurance</h1>
            <p style="margin: 0.4rem 0 0; opacity: 0.9; font-size: 0.95rem;">New Policy Request / Insurance Inquiry</p>
          </div>
          
          <div style="padding: 1.8rem; color: #334155;">
            <p style="margin: 0 0 1.2rem; font-size: 0.95rem;">A customer has requested a travel insurance quote / policy issuance:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.9rem;">
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 0.6rem 0.8rem; font-weight: 600; width: 35%;">Customer Name:</td>
                <td style="padding: 0.6rem 0.8rem; font-weight: 700; color: #0f172a;">${fullName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 0.6rem 0.8rem; font-weight: 600;">Contact Phone:</td>
                <td style="padding: 0.6rem 0.8rem;"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${phone}</a></td>
              </tr>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 0.6rem 0.8rem; font-weight: 600;">Email Address:</td>
                <td style="padding: 0.6rem 0.8rem;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
              </tr>
              ${passportNumber ? `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 0.6rem 0.8rem; font-weight: 600;">Passport Number:</td>
                <td style="padding: 0.6rem 0.8rem;">${passportNumber}</td>
              </tr>
              ` : ''}
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 0.6rem 0.8rem; font-weight: 600;">Destination:</td>
                <td style="padding: 0.6rem 0.8rem; font-weight: 600; color: #0f172a;">${destination}</td>
              </tr>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 0.6rem 0.8rem; font-weight: 600;">Travel Dates:</td>
                <td style="padding: 0.6rem 0.8rem;">${startDate} to ${endDate} (${durationDays} days)</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 0.6rem 0.8rem; font-weight: 600;">Selected Plan:</td>
                <td style="padding: 0.6rem 0.8rem; font-weight: 700; color: #1d4ed8;">${planName || 'Selected Custom Plan'} (${sumInsured || '$100,000 USD'})</td>
              </tr>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 0.6rem 0.8rem; font-weight: 600;">Travelers:</td>
                <td style="padding: 0.6rem 0.8rem;">${travelersCount} traveler(s) ${travelerAges ? `(Ages: ${travelerAges})` : ''}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 0.6rem 0.8rem; font-weight: 600;">Quoted Premium:</td>
                <td style="padding: 0.6rem 0.8rem; font-weight: 800; font-size: 1.05rem; color: #15803d;">₹${premiumTotalINR ? Number(premiumTotalINR).toLocaleString('en-IN') : 'N/A'} (incl. GST)</td>
              </tr>
              ${notes ? `
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 0.6rem 0.8rem; font-weight: 600;">Special Notes:</td>
                <td style="padding: 0.6rem 0.8rem;">${notes}</td>
              </tr>
              ` : ''}
            </table>
            
            <p style="font-size: 0.85rem; color: #64748b; margin-top: 1.5rem;">Submitted on ${now} via Flying Wonders Insurance Portal.</p>
          </div>
        </div>
      `

      await transporter.sendMail({
        from: `"Flying Wonders Insurance" <${user}>`,
        to: process.env.ADMIN_EMAIL || 'info@flyingwonders.net',
        replyTo: email,
        subject: `🛡️ New Insurance Quote Request: ${fullName} - ${destination} (₹${premiumTotalINR || '0'})`,
        html: htmlContent,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Your insurance request has been received. Our travel insurance desk will reach out shortly.',
      referenceId: `FW-INS-${Date.now().toString().slice(-6)}`,
    })
  } catch (err: any) {
    console.error('Error submitting insurance inquiry:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to submit insurance inquiry' },
      { status: 500 }
    )
  }
}
