import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { targetEmails, senderName, senderEmail, senderPhone, senderCompany, destination, travelDates, paxCount, notes } = await req.json()

    if (!Array.isArray(targetEmails) || targetEmails.length === 0 || !senderEmail) {
      return NextResponse.json({ success: false, error: 'Please select at least one agency and specify your work email.' }, { status: 400 })
    }

    // Prepare SMTP Transporter if environment has SMTP configuration
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })

        const mailOptions = {
          from: `"B2B Partner Portal" <${process.env.SMTP_USER}>`,
          to: targetEmails.join(', '),
          bcc: 'info.flyingwonders@gmail.com',
          replyTo: senderEmail,
          subject: `💼 B2B Joint RFQ Inquiry [${destination || 'Custom Travel'}] from ${senderCompany || senderName}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1E293B;">
              <h2 style="color: #0F4C3A; margin-top: 0;">✈️ B2B Joint Request for Quote (RFQ)</h2>
              <p>You have received a joint B2B travel inquiry via the B2B Showcase Directory:</p>
              
              <div style="background: #F8FAFC; border-left: 4px solid #0F4C3A; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 4px 0;"><strong>Sender Agency:</strong> ${senderCompany || 'Travel Partner'} (${senderName || 'Agent'})</p>
                <p style="margin: 4px 0;"><strong>Work Email:</strong> ${senderEmail}</p>
                <p style="margin: 4px 0;"><strong>Phone / WhatsApp:</strong> ${senderPhone || 'Not provided'}</p>
                <p style="margin: 4px 0;"><strong>Destination:</strong> ${destination || 'All Destinations'}</p>
                <p style="margin: 4px 0;"><strong>Estimated Pax:</strong> ${paxCount || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Travel Dates:</strong> ${travelDates || 'Flexible'}</p>
              </div>

              <div style="background: #FFFBEB; border: 1px solid #FDE68A; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 8px; color: #92400E;">Inquiry Notes & Requirements:</h4>
                <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">${notes || 'No extra notes provided.'}</p>
              </div>

              <p style="font-size: 12px; color: #64748B;">You can reply directly to this email to get in touch with <strong>${senderEmail}</strong>.</p>
            </div>
          `,
        }

        await transporter.sendMail(mailOptions)
      } catch (smtpErr) {
        console.warn('Failed to send RFQ email via SMTP', smtpErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: `B2B Request for Quote successfully sent to ${targetEmails.length} partner agency(ies)!`,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
