import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { client } from '../../../sanity/lib/client'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { selectedItems, grandTotal } = body

    if (!selectedItems || selectedItems.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const host = process.env.SMTP_HOST || 'smtp.gmail.com'
    const port = parseInt(process.env.SMTP_PORT || '465')

    if (!user || !pass) {
      // Silently succeed — don't block the WhatsApp flow
      console.warn('SMTP not configured — skipping attractions inquiry email.')
      return NextResponse.json({ sent: false, reason: 'smtp_not_configured' })
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    })

    const now = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })

    // Build items table rows
    const itemRows = selectedItems.map((item: any) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 0.6rem 0.75rem; font-weight: 600;">${item.name}</td>
        <td style="padding: 0.6rem 0.75rem; text-align: center;">${item.isFixedDate ? (item.date || '⚠ Not set') : '—'}</td>
        <td style="padding: 0.6rem 0.75rem; text-align: center;">${item.isGroup ? '—' : (item.adult || 0)}</td>
        <td style="padding: 0.6rem 0.75rem; text-align: center;">${item.isGroup ? `Group (${item.group || 1})` : (item.child || 0)}</td>
        <td style="padding: 0.6rem 0.75rem; text-align: right; font-weight: 700;">S$ ${item.total}</td>
      </tr>
    `).join('')

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0F4C3A 0%, #1a6b52 100%); padding: 2rem; color: white;">
          <h1 style="margin: 0; font-size: 1.4rem; font-weight: 700; letter-spacing: 0.05em;">🎡 Flying Wonders</h1>
          <p style="margin: 0.4rem 0 0; opacity: 0.85; font-size: 0.9rem;">New Attractions Booking Interest</p>
        </div>

        <!-- Body -->
        <div style="padding: 2rem; background: #ffffff;">
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1.75rem;">
            <strong style="color: #166534;">🔔 A customer has clicked "Book via WhatsApp"</strong>
            <p style="margin: 0.4rem 0 0; font-size: 0.85rem; color: #4b5563;">They have reviewed their selection and proceeded to WhatsApp to enquire about booking. This is a high-intent lead.</p>
          </div>

          <p style="margin: 0 0 0.5rem; font-size: 0.85rem; color: #6b7280;"><strong>Time of Interest:</strong> ${now} IST</p>

          <h3 style="margin: 1.5rem 0 0.75rem; font-size: 1rem; color: #111;">Selected Attractions:</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
            <thead>
              <tr style="background: #0F4C3A; color: white;">
                <th style="padding: 0.6rem 0.75rem; text-align: left;">Attraction</th>
                <th style="padding: 0.6rem 0.75rem;">Travel Date</th>
                <th style="padding: 0.6rem 0.75rem;">Adults</th>
                <th style="padding: 0.6rem 0.75rem;">Children</th>
                <th style="padding: 0.6rem 0.75rem; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr style="background: #f8fafc;">
                <td colspan="4" style="padding: 0.75rem; font-weight: 700; font-size: 0.95rem; color: #111;">Grand Total</td>
                <td style="padding: 0.75rem; text-align: right; font-weight: 800; font-size: 1.1rem; color: #0F4C3A;">S$ ${grandTotal}</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 2rem; padding: 1rem; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; font-size: 0.82rem; color: #7c2d12;">
            <strong>Privacy Note:</strong> This email contains only the itinerary data the customer explicitly built. No personal information (name, email, phone) has been collected.
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 1rem 2rem; text-align: center; font-size: 0.78rem; color: #9ca3af; border-top: 1px solid #e5e7eb;">
          Flying Wonders Automated Alert — Singapore Attractions Quote Builder
        </div>
      </div>
    `

    let recipientEmails = 'info.flyingwonders@gmail.com'
    try {
      const fetched = await client.fetch(`*[_type == "siteSettings"][0]{ notificationEmails }`)
      if (fetched?.notificationEmails) {
        recipientEmails = fetched.notificationEmails
      }
    } catch (err) {
      console.error('Failed to fetch recipient emails from siteSettings:', err)
    }

    await transporter.sendMail({
      from: `"Flying Wonders Alerts" <${user}>`,
      to: recipientEmails,
      subject: `🎡 Booking Interest — S$ ${grandTotal} Attractions Quote (${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''})`,
      html
    })

    return NextResponse.json({ sent: true })

  } catch (err: any) {
    console.error('Attractions inquiry email failed:', err)
    // Never block the user flow — return 200 always
    return NextResponse.json({ sent: false, reason: err.message })
  }
}
