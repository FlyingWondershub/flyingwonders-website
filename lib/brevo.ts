import nodemailer from 'nodemailer'

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  senderName?: string
  senderEmail?: string
  replyTo?: string
  bcc?: string | string[]
}

/**
 * Universal email dispatcher for Flying Wonders:
 * 1. Prioritizes Brevo HTTPS REST API (no IP whitelist restrictions, high deliverability)
 * 2. Falls back to Nodemailer SMTP if BREVO_API_KEY is not configured
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  senderName = 'Flying Wonders',
  senderEmail = 'contact@flyingwonders.net',
  replyTo = 'contact@flyingwonders.net',
  bcc,
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const brevoApiKey = process.env.BREVO_API_KEY

  // 1. Send via Brevo REST API if valid key is available
  if (brevoApiKey && brevoApiKey !== '[SENSITIVE]' && brevoApiKey.startsWith('xkeysib-')) {
    try {
      const toList = Array.isArray(to)
        ? to.map((email) => ({ email: email.trim() }))
        : [{ email: to.trim() }]

      const bccList = bcc
        ? (Array.isArray(bcc) ? bcc : [bcc]).map((email) => ({ email: email.trim() }))
        : undefined

      const payload: any = {
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: toList,
        subject,
        htmlContent: html,
        replyTo: {
          email: replyTo,
          name: senderName,
        },
      }

      if (text) {
        payload.textContent = text
      }

      if (bccList && bccList.length > 0) {
        payload.bcc = bccList
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Brevo API Error Response:', data)
        throw new Error(data.message || 'Failed to send email via Brevo API')
      }

      return { success: true, messageId: data.messageId }
    } catch (err: any) {
      console.error('Brevo REST API dispatch failed, attempting SMTP fallback:', err.message)
      // Falls through to SMTP fallback
    }
  }

  // 2. Fallback to Nodemailer SMTP
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '465')

  if (!user || !pass) {
    return {
      success: false,
      error: 'No email service configured. Please set BREVO_API_KEY or SMTP credentials.',
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to,
      subject,
      text,
      html,
      replyTo,
      bcc,
    })

    return { success: true, messageId: info.messageId }
  } catch (err: any) {
    console.error('Nodemailer SMTP dispatch failed:', err)
    return { success: false, error: err.message || 'SMTP dispatch failed' }
  }
}
