import { NextResponse } from 'next/server'
import {
  getAllSubscribers,
  saveOrUpdateSubscribers,
  toggleSubscriberStatus,
  deleteSubscriber,
} from '../../../../lib/audience-chunk-store'
import { sendEmail } from '../../../../lib/brevo'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// GET: Fetch list of active subscriber emails or full subscriber records
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const full = searchParams.get('full') === 'true'

    if (full) {
      const subscribers = await getAllSubscribers(true)
      return NextResponse.json({
        success: true,
        subscribers: subscribers || [],
        totalCount: (subscribers || []).length,
      })
    }

    const emails = await getAllSubscribers(false)
    return NextResponse.json({ success: true, subscribers: emails })
  } catch (err: any) {
    console.error('Fetch Subscribers Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST: Add or reactivate a subscriber (supports single object or { subscribers: [...] } batch)
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // ── BATCH INGESTION MODE ──
    if (Array.isArray(body.subscribers)) {
      const subscribersList: any[] = body.subscribers
      const dualSyncLeads: boolean = Boolean(body.dualSyncLeads)

      if (subscribersList.length === 0) {
        return NextResponse.json({ error: 'No subscribers provided' }, { status: 400 })
      }

      const result = await saveOrUpdateSubscribers(subscribersList, dualSyncLeads)
      return NextResponse.json({
        success: true,
        message: `Successfully synced ${result.added + result.updated} subscribers!${dualSyncLeads ? ' (And dual-synced to Leads Directory)' : ''}`,
        syncedCount: result.added + result.updated,
      })
    }

    // ── SINGLE SUBSCRIBER INGESTION MODE ──
    const { email, name, company, audienceType, source, skipWelcomeEmail } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const result = await saveOrUpdateSubscribers([{
      email: cleanEmail,
      name: name || undefined,
      company: company || undefined,
      audienceType: audienceType || 'b2b',
      source: source || 'b2b_leads_directory',
    }])

    const isNewSubscriber = result.added > 0

    // Dispatch automated Welcome Email (only for B2C consumer opt-ins, or if skipWelcomeEmail is false)
    if (!skipWelcomeEmail) {
      try {
        const unsubscribeUrl = `https://flyingwonders.net/api/newsletter/unsubscribe?email=${encodeURIComponent(cleanEmail)}`

        const welcomeHtml = `
          <meta name="format-detection" content="telephone=no, address=no, email=no, date=no" />
          <style>
            a[x-apple-data-detectors] {
              color: inherit !important;
              text-decoration: none !important;
              font-size: inherit !important;
              font-family: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
            }
          </style>
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a202c; max-width: 600px; margin: 0 auto; line-height: 1.6; background: #f8fafc; padding: 20px 0;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 0 16px;">
              <header style="background: #ffffff; padding: 22px 20px 18px 20px; text-align: center; border-top: 4px solid #800020; border-bottom: 2px solid #C5A880;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; text-align: center;">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 14px; text-align: center;">
                      <a href="https://flyingwonders.net" target="_blank" style="text-decoration: none; display: inline-block;">
                        <img
                          src="https://flyingwonders.net/images/logo.png"
                          alt="Flying Wonders Logo"
                          width="52"
                          height="52"
                          style="width: 52px; height: 52px; border-radius: 50%; border: 2px solid #C5A880; display: block; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);"
                        />
                      </a>
                    </td>
                    <td style="vertical-align: middle; text-align: left;">
                      <a href="https://flyingwonders.net" target="_blank" style="text-decoration: none; color: inherit;">
                        <div style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 600; color: #1A1A1A; letter-spacing: 0.18em; text-transform: uppercase; line-height: 1.1;">
                          Flying Wonders
                        </div>
                        <div style="color: #800020; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700; margin-top: 5px; font-family: 'Helvetica Neue', Arial, sans-serif;">
                          Singapore &amp; India Specialist DMC
                        </div>
                      </a>
                    </td>
                  </tr>
                </table>
              </header>
              
              <main style="padding: 2.5rem 2rem; background: #ffffff; text-align: justify; text-justify: inter-word;">
                <h2 style="color: #0f172a; font-size: 1.35rem; margin: 0 0 1rem 0;">Welcome to the Singapore Insider Guide! 🌟</h2>
                <p style="font-size: 0.95rem; color: #475569; line-height: 1.6; margin: 0 0 1.25rem 0;">
                  Thank you for subscribing. You are now part of our curated travel circle. As a licensed Destination Management Company (DMC) specializing in Singapore and India, we are excited to share insider recommendations, seasonal offers, and seamless itinerary planning with you.
                </p>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.25rem; margin: 1.5rem 0;">
                  <h3 style="color: #800020; font-size: 1rem; margin: 0 0 0.75rem 0; font-weight: 700;">What to expect in your inbox:</h3>
                  <ul style="margin: 0; padding-left: 1.25rem; color: #334155; font-size: 0.9rem; line-height: 1.8;">
                    <li><strong>Curated Singapore Guides:</strong> Hidden foodie spots, transit tips, and cultural gems.</li>
                    <li><strong>Attraction Specials:</strong> Secret combo deals across Marina Bay, Sentosa, and Wildlife Parks.</li>
                    <li><strong>Bespoke Itineraries:</strong> Custom land packages tailored by our local specialists.</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 2rem 0 1rem 0;">
                  <a href="https://flyingwonders.net/custom-package" style="background-color: #800020; color: #ffffff; padding: 0.85rem 2rem; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Explore Singapore Packages →
                  </a>
                </div>
              </main>

              <footer style="background: #f8fafc; padding: 1.8rem 1.5rem; text-align: center; border-top: 1px solid #e2e8f0; font-size: 0.78rem; color: #64748b;">
                <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #334155;">Flying Wonders Private Limited</p>
                <p style="margin: 0 0 1rem 0;">Singapore & India Specialist DMC • Official B2B & B2C Partner</p>
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
    }

    return NextResponse.json({
      success: true,
      message: isNewSubscriber
        ? 'Contact added to newsletter subscribers list!'
        : 'Subscription reactivated successfully!',
    })
  } catch (err: any) {
    console.error('Subscription API Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

// PATCH: Toggle active status or update subscriber
export async function PATCH(req: Request) {
  try {
    const { id, isActive } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required.' }, { status: 400 })
    }

    const success = await toggleSubscriberStatus(id, !!isActive)
    return NextResponse.json({ success, message: success ? 'Subscriber updated successfully.' : 'Subscriber not found.' })
  } catch (err: any) {
    console.error('Update Subscriber Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Remove a subscriber
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required.' }, { status: 400 })
    }

    const success = await deleteSubscriber(id)
    return NextResponse.json({ success, message: success ? 'Subscriber removed successfully.' : 'Subscriber not found.' })
  } catch (err: any) {
    console.error('Delete Subscriber Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
