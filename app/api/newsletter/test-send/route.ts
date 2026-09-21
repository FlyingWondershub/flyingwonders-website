import { NextResponse } from 'next/server'
import { sendEmail } from '../../../../lib/brevo'

export async function POST(req: Request) {
  try {
    const { subject, content, recipientEmail } = await req.json()

    if (!subject || !content) {
      return NextResponse.json({ error: 'Subject and content are required.' }, { status: 400 })
    }

    const targetEmail = recipientEmail || 'info.flyingwonders@gmail.com'

    const testHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a202c; max-width: 720px; margin: 0 auto; line-height: 1.6; background: #f8fafc; padding: 20px 0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 0 16px;">
          <div style="background: #FEF3C7; border-bottom: 1px solid #FDE68A; padding: 0.6rem 1rem; text-align: center; font-size: 0.75rem; color: #92400E; font-weight: 700;">
            🧪 TEST PREVIEW • Dispatched via Brevo API to ${targetEmail}
          </div>
          <header style="background: #800020; padding: 2.2rem 1.5rem; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 1.8rem; letter-spacing: 0.12em; text-transform: uppercase; font-family: Georgia, serif;">Flying Wonders</h1>
            <p style="color: #dfba6b; margin: 0.5rem 0 0 0; font-size: 0.8rem; letter-spacing: 0.25em; text-transform: uppercase; font-weight: 600;">Singapore & India Specialist DMC</p>
          </header>
          <main style="padding: 2.5rem 2rem; background: #ffffff;">
            ${/<[a-z][\s\S]*>/i.test(content) ? content : content.replace(/\n/g, '<br />')}
          </main>
          <footer style="background: #f8fafc; padding: 1.8rem 1.5rem; text-align: center; border-top: 1px solid #e2e8f0; font-size: 0.78rem; color: #64748b;">
            <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #334155;">Flying Wonders Private Limited</p>
            <p style="margin: 0 0 1rem 0;">Singapore & India Specialist DMC • Official B2B & B2C Partner</p>
            <p style="margin: 0; font-size: 0.72rem;">
              <span style="color: #800020; text-decoration: underline;">[Unsubscribe Link Preview]</span>
              &nbsp;•&nbsp;
              <a href="https://flyingwonders.net/contact" style="color: #64748b; text-decoration: none;">Contact Support</a>
            </p>
          </footer>
        </div>
      </div>
    `

    const result = await sendEmail({
      to: targetEmail,
      subject: `[PREVIEW] ${subject}`,
      html: testHtml,
      senderName: 'Flying Wonders Preview',
      senderEmail: 'contact@flyingwonders.net',
      replyTo: 'contact@flyingwonders.net',
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send test email' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${targetEmail}! Check your inbox.`,
      messageId: result.messageId,
    })
  } catch (err: any) {
    console.error('Test Send Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
