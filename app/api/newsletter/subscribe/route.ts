import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'
import { sendEmail } from '../../../../lib/brevo'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    // 1. Check if subscriber already exists
    const existing = await writeClient.fetch(
      `*[_type == "newsletterSubscriber" && lower(email) == $cleanEmail][0]`,
      { cleanEmail }
    )

    let isNewSubscriber = false

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ success: true, message: 'You are already subscribed!' })
      } else {
        // Re-activate subscription
        await writeClient
          .patch(existing._id)
          .set({ isActive: true, subscribedAt: new Date().toISOString() })
          .commit()
      }
    } else {
      // Create new subscriber
      isNewSubscriber = true
      await writeClient.create({
        _type: 'newsletterSubscriber',
        email: cleanEmail,
        subscribedAt: new Date().toISOString(),
        isActive: true,
      })
    }

    // 2. Dispatch automated Welcome Email
    try {
      const unsubscribeUrl = `https://flyingwonders.net/api/newsletter/unsubscribe?email=${encodeURIComponent(cleanEmail)}`

      const welcomeHtml = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a202c; max-width: 600px; margin: 0 auto; line-height: 1.6; background: #f8fafc; padding: 20px 0;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 0 16px;">
            <header style="background: #800020; padding: 2.2rem 1.5rem; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 1.8rem; letter-spacing: 0.12em; text-transform: uppercase; font-family: Georgia, serif;">Flying Wonders</h1>
              <p style="color: #dfba6b; margin: 0.5rem 0 0 0; font-size: 0.8rem; letter-spacing: 0.25em; text-transform: uppercase; font-weight: 600;">Singapore & India Specialist DMC</p>
            </header>
            
            <main style="padding: 2.5rem 2rem; background: #ffffff;">
              <h2 style="color: #0f172a; font-size: 1.35rem; margin: 0 0 1rem 0;">Welcome to the Singapore Insider Guide! 🌟</h2>
              <p style="font-size: 0.95rem; color: #475569; line-height: 1.6; margin: 0 0 1.25rem 0;">
                Thank you for subscribing. You are now part of our curated travel circle. As a licensed Destination Management Company (DMC) specializing in Singapore and India, we are excited to share insider recommendations, seasonal offers, and seamless itinerary planning with you.
              </p>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.25rem; margin: 1.5rem 0;">
                <h3 style="color: #800020; font-size: 1rem; margin: 0 0 0.75rem 0; font-weight: 700;">What to expect in your inbox:</h3>
                <ul style="margin: 0; padding-left: 1.25rem; color: #334155; font-size: 0.9rem; line-height: 1.8;">
                  <li><strong>Curated Singapore Guides:</strong> Hidden foodie spots, transit tips, and cultural gems.</li>
                  <li><strong>Attraction Specials:</strong> Secret combo deals across Marina Bay, Sentosa, and Wildlife Parks.</li>
                  <li><strong>Custom Packages:</strong> Tailor-made holiday solutions designed by local travel architects.</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 2rem 0 1rem 0;">
                <a href="https://flyingwonders.net/custom-package" style="display: inline-block; background: #800020; color: #ffffff; text-decoration: none; padding: 0.85rem 2rem; border-radius: 8px; font-size: 0.95rem; font-weight: 700; letter-spacing: 0.05em;">
                  Plan Your Singapore Trip →
                </a>
              </div>
            </main>

            <footer style="background: #f8fafc; padding: 1.8rem 1.5rem; text-align: center; border-top: 1px solid #e2e8f0; font-size: 0.78rem; color: #64748b;">
              <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #334155;">Flying Wonders Private Limited</p>
              <p style="margin: 0 0 1rem 0;">Singapore & India Specialist DMC</p>
              <p style="margin: 0; font-size: 0.72rem;">
                <a href="${unsubscribeUrl}" style="color: #800020; text-decoration: underline;">Unsubscribe</a>
                &nbsp;•&nbsp;
                <a href="https://flyingwonders.net" style="color: #64748b; text-decoration: none;">Visit Website</a>
              </p>
            </footer>
          </div>
        </div>
      `

      await sendEmail({
        to: cleanEmail,
        subject: '🌟 Welcome to Flying Wonders | Your Singapore Insider Guide',
        html: welcomeHtml,
        senderName: 'Flying Wonders',
        senderEmail: 'contact@flyingwonders.net',
        replyTo: 'contact@flyingwonders.net',
      })
    } catch (welcomeErr: any) {
      console.error('Welcome email dispatch error (non-blocking):', welcomeErr.message)
    }

    return NextResponse.json({
      success: true,
      message: isNewSubscriber
        ? 'Thank you for subscribing to Singapore Insider Guide! Check your inbox for your welcome email.'
        : 'Welcome back! Your subscription has been reactivated.',
    })
  } catch (err: any) {
    console.error('Subscription API Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
