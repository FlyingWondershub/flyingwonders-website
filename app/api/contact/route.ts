import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, travelDate, tier, travelers, experiences, totalPrice, notes } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Name, email, and phone are required.' }, { status: 400 })
    }

    // Build the email HTML
    const experienceList = experiences && experiences.length > 0
      ? experiences.map((exp: any) => `<li>${exp.title} — ₹${exp.priceINR?.toLocaleString('en-IN') ?? 'N/A'}</li>`).join('')
      : '<li>None selected</li>'

    const tierLabels: Record<string, string> = {
      budget: 'Budget Explorer',
      premium: 'Premium Luxury',
      solo: 'Solo Adventurer',
      groups: 'Groups & Families',
    }

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #990000; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">✈️ New Booking Request</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">From Flying Wonders Website</p>
        </div>
        
        <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #990000; border-bottom: 2px solid #990000; padding-bottom: 8px;">Contact Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Name:</td><td>${name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${email}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${phone}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Travel Date:</td><td>${travelDate || 'Not specified'}</td></tr>
          </table>

          <h2 style="color: #990000; border-bottom: 2px solid #990000; padding-bottom: 8px; margin-top: 24px;">Package Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Traveler Profile:</td><td>${tierLabels[tier] || tier}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Travelers:</td><td>${travelers}</td></tr>
          </table>

          <h3 style="color: #00A859; margin-top: 16px;">Selected Experiences:</h3>
          <ul style="padding-left: 20px;">${experienceList}</ul>

          <div style="background: linear-gradient(135deg, #990000, #4a0000); color: white; padding: 16px; border-radius: 8px; margin-top: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Estimated Package Value</p>
            <p style="margin: 8px 0 0 0; font-size: 28px; font-weight: bold;">₹${totalPrice?.toLocaleString('en-IN') ?? '0'} Per Person</p>
          </div>

          ${notes ? `
          <h2 style="color: #990000; border-bottom: 2px solid #990000; padding-bottom: 8px; margin-top: 24px;">Special Notes</h2>
          <p style="background: #f9fafb; padding: 12px; border-radius: 6px; border-left: 4px solid #D4AF37;">${notes}</p>
          ` : ''}

          <p style="margin-top: 24px; padding: 12px; background: #f0fdf4; border-radius: 6px; border-left: 4px solid #00A859; font-size: 13px;">
            🛡️ Price protected under best price guarantee.
          </p>
        </div>
      </div>
    `

    // Use nodemailer to send the email
    const nodemailer = require('nodemailer')

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Flying Wonders Website" <${process.env.EMAIL_USER}>`,
      to: 'info.flyingwonders@gmail.com',
      replyTo: email,
      subject: `✈️ New Booking Request from ${name} — ${tierLabels[tier] || tier}`,
      html: htmlBody,
    })

    return NextResponse.json({ success: true, message: 'Your request has been sent successfully!' })
  } catch (error: any) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email. Please try again or contact us on WhatsApp.' },
      { status: 500 }
    )
  }
}
