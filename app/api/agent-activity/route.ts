import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { client } from '../../../sanity/lib/client'

export const runtime = 'nodejs'

const ACTION_LABELS: Record<string, string> = {
  clipboard_copy: '📋 Copied Proposal to Clipboard',
  whatsapp_share: '💬 Shared via WhatsApp',
  pdf_download: '📥 Downloaded PDF Brochure',
  enquiry_submitted: '📧 Submitted B2B Enquiry',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      action = 'unknown',
      agentName = 'Unknown',
      agentEmail = '',
      agentPhone = '',
      agentCompany = '',
      totalPrice = 0,
      pax = '',
      nights = 0,
      arrivalDate = '',
      hotel = '',
      itinerarySummary = '',
    } = body

    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const host = process.env.SMTP_HOST || 'smtp.gmail.com'
    const port = parseInt(process.env.SMTP_PORT || '465')

    if (!user || !pass) {
      // No email config — silently succeed so the UI is unaffected
      return NextResponse.json({ ok: true, skipped: true })
    }

    const actionLabel = ACTION_LABELS[action] || `🔔 Action: ${action}`
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Singapore' })

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

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
      from: `"Flying Wonders CRM" <${user}>`,
      to: recipientEmails,
      subject: `${actionLabel} — ${agentName} | S$${totalPrice.toLocaleString()}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0F4C3A, #1a6b52); padding: 20px 24px; color: white;">
            <h2 style="margin: 0; font-size: 18px; letter-spacing: 0.5px;">🔔 Agent Activity Alert</h2>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.8;">${actionLabel}</p>
          </div>

          <!-- Agent Details -->
          <div style="padding: 20px 24px; background: #F7FAFC; border-bottom: 1px solid #E2E8F0;">
            <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; color: #4A5568;">Agent Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr><td style="padding: 4px 0; color: #718096; width: 130px;">Name:</td><td style="font-weight: 600; color: #2D3748;">${agentName}</td></tr>
              <tr><td style="padding: 4px 0; color: #718096;">Email:</td><td style="color: #2D3748;">${agentEmail || '—'}</td></tr>
              <tr><td style="padding: 4px 0; color: #718096;">Phone:</td><td style="color: #2D3748;">${agentPhone || '—'}</td></tr>
              <tr><td style="padding: 4px 0; color: #718096;">Company:</td><td style="color: #2D3748;">${agentCompany || '—'}</td></tr>
            </table>
          </div>

          <!-- Itinerary Summary -->
          <div style="padding: 20px 24px; border-bottom: 1px solid #E2E8F0;">
            <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; color: #4A5568;">Itinerary Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr><td style="padding: 4px 0; color: #718096; width: 130px;">Hotel:</td><td style="font-weight: 600; color: #2D3748;">${hotel || '—'}</td></tr>
              <tr><td style="padding: 4px 0; color: #718096;">Arrival Date:</td><td style="color: #2D3748;">${arrivalDate || '—'}</td></tr>
              <tr><td style="padding: 4px 0; color: #718096;">Duration:</td><td style="color: #2D3748;">${nights} Nights / ${nights + 1} Days</td></tr>
              <tr><td style="padding: 4px 0; color: #718096;">Travelers:</td><td style="color: #2D3748;">${pax || '—'}</td></tr>
            </table>
          </div>

          <!-- Total -->
          <div style="padding: 20px 24px; background: #0F4C3A; color: white; text-align: center;">
            <div style="font-size: 11px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Estimated Package Value</div>
            <div style="font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">S$ ${totalPrice.toLocaleString()}</div>
          </div>

          ${itinerarySummary ? `
          <!-- Itinerary Text -->
          <div style="padding: 20px 24px;">
            <h3 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; color: #4A5568;">Full Itinerary</h3>
            <pre style="font-size: 12px; color: #2D3748; background: #F7FAFC; padding: 12px; border-radius: 6px; white-space: pre-wrap; word-break: break-word; border: 1px solid #E2E8F0; font-family: 'Courier New', monospace; line-height: 1.6;">${itinerarySummary.substring(0, 3000)}</pre>
          </div>
          ` : ''}

          <!-- Footer -->
          <div style="padding: 12px 24px; background: #F7FAFC; border-top: 1px solid #E2E8F0; font-size: 11px; color: #A0AEC0; text-align: center;">
            Sent by Flying Wonders CRM · ${timestamp} (SGT)
          </div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Agent activity notification failed:', err)
    // Don't block the UI — return 200 so the agent action still succeeds
    return NextResponse.json({ ok: false, error: err.message })
  }
}
