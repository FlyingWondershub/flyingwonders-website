import { NextResponse } from 'next/server'
import { unsubscribeByEmail } from '../../../../lib/audience-chunk-store'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return new Response('Invalid request: Email parameter is missing.', { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    await unsubscribeByEmail(cleanEmail)

    // 2. Return clean branded HTML confirmation
    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed | Flying Wonders</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 2rem; display: flex; align-items: center; justify-content: center; min-height: 80vh; }
          .card { background: #ffffff; max-width: 500px; width: 100%; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2.5rem; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
          .logo { color: #800020; font-size: 1.5rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem; }
          .badge { display: inline-block; background: #ecfdf5; color: #059669; font-size: 0.85rem; font-weight: 700; padding: 0.4rem 1rem; border-radius: 999px; margin-bottom: 1.5rem; }
          h1 { font-size: 1.35rem; color: #0f172a; margin: 0 0 1rem 0; }
          p { font-size: 0.95rem; color: #64748b; line-height: 1.6; margin: 0 0 1.5rem 0; }
          .btn { display: inline-block; background: #800020; color: #ffffff; text-decoration: none; padding: 0.75rem 1.75rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; }
          .footer { font-size: 0.75rem; color: #94a3b8; margin-top: 2rem; border-top: 1px solid #f1f5f9; padding-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">Flying Wonders</div>
          <div class="badge">Preferences Updated</div>
          <h1>You have been unsubscribed</h1>
          <p>We've updated our records for <strong>${cleanEmail}</strong>. You will no longer receive marketing updates or promotional newsletter emails from Flying Wonders.</p>
          <a href="https://flyingwonders.net" class="btn">Return to Homepage</a>
          <div class="footer">Flying Wonders Private Limited | Singapore & India Specialist DMC</div>
        </div>
      </body>
      </html>
    `

    return new Response(htmlResponse, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err: any) {
    console.error('Unsubscribe Error:', err)
    return new Response('An error occurred while updating your preferences. Please contact contact@flyingwonders.net.', { status: 500 })
  }
}
