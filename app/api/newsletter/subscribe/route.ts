import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import crypto from 'crypto'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'
import { sendEmail } from '../../../../lib/brevo'

export const dynamic = 'force-dynamic'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// GET: Fetch list of active subscriber emails or full subscriber records
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const full = searchParams.get('full') === 'true'

    if (full) {
      const subscribers = await writeClient.fetch(
        `*[_type == "newsletterSubscriber"] | order(_createdAt desc) [0...1000] {
          _id,
          email,
          name,
          company,
          audienceType,
          source,
          isActive,
          subscribedAt,
          _createdAt
        }`
      )
      return NextResponse.json({ success: true, subscribers: subscribers || [] })
    }

    const activeSubscribers = await writeClient.fetch(
      `*[_type == "newsletterSubscriber" && isActive == true].email`
    )
    const emails = (activeSubscribers || []).map((e: string) => e.toLowerCase().trim())
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

      // Filter valid emails
      const validSubs = subscribersList.filter(s => s && s.email && typeof s.email === 'string' && s.email.includes('@'))
      if (validSubs.length === 0) {
        return NextResponse.json({ error: 'No valid email addresses found in the provided list.' }, { status: 400 })
      }

      let syncedCount = 0
      const batchSize = 50

      for (let i = 0; i < validSubs.length; i += batchSize) {
        const chunk = validSubs.slice(i, i + batchSize)
        const emails = chunk.map(c => c.email.toLowerCase().trim())

        // Check existing subscribers to preserve IDs, tags, and status
        const existingDocs = await writeClient.fetch(
          `*[_type == "newsletterSubscriber" && lower(email) in $emails]{_id, "lowerEmail": lower(email), isActive, source}`,
          { emails }
        )
        const existingMap = new Map<string, { _id: string; isActive?: boolean; source?: string }>()
        for (const ed of (existingDocs || [])) {
          if (ed.lowerEmail) existingMap.set(ed.lowerEmail, { _id: ed._id, isActive: ed.isActive, source: ed.source })
        }

        const transaction = writeClient.transaction()

        for (const sub of chunk) {
          const cleanEmail = sub.email.toLowerCase().trim()
          const existingInfo = existingMap.get(cleanEmail)

          if (existingInfo) {
            transaction.patch(existingInfo._id, (p) => {
              const patchObj: any = {}
              // Protect previously unsubscribed contacts from silent reactivation
              if (existingInfo.isActive !== false) {
                patchObj.isActive = true
              }
              if (sub.name) patchObj.name = sub.name
              if (sub.company) patchObj.company = sub.company
              if (sub.audienceType) patchObj.audienceType = sub.audienceType

              // Smart Tag Appending: preserve origin while appending new event tag
              if (sub.source) {
                const currentSource = existingInfo.source || ''
                const existingTags = currentSource.split(',').map((t: string) => t.trim().toLowerCase())
                const newTag = sub.source.trim()
                if (!existingTags.includes(newTag.toLowerCase())) {
                  patchObj.source = currentSource ? `${currentSource}, ${newTag}` : newTag
                }
              }

              return p.set(patchObj)
            })
          } else {
            const deterministicId = `newsletterSubscriber-${crypto.createHash('md5').update(cleanEmail).digest('hex').slice(0, 16)}`
            transaction.createOrReplace({
              _id: deterministicId,
              _type: 'newsletterSubscriber',
              email: cleanEmail,
              name: sub.name || undefined,
              company: sub.company || undefined,
              audienceType: sub.audienceType || 'b2b',
              source: sub.source || 'bulk_import',
              subscribedAt: new Date().toISOString(),
              isActive: true,
            })
          }

          // Dual-sync to Marketing Leads Directory if requested
          if (dualSyncLeads) {
            const seed = (cleanEmail || sub.phone || '').toLowerCase().trim()
            const leadId = `marketingLead-${crypto.createHash('md5').update(seed).digest('hex').slice(0, 16)}`
            transaction.createOrReplace({
              _id: leadId,
              _type: 'marketingLead',
              name: sub.name || '',
              email: cleanEmail,
              phone: sub.phone || '',
              whatsapp: sub.whatsapp || (sub.phone ? `https://wa.me/${sub.phone.replace(/[^\d]/g, '')}` : ''),
              company: sub.company || '',
              city: sub.city || '',
              designation: sub.designation || '',
              accreditations: sub.accreditations || '',
              priority: sub.priority || 'normal',
              leadType: sub.audienceType === 'b2c' ? 'individual' : 'agent',
              status: 'new',
              source: sub.source || 'subscriber_sync',
            })
          }
        }

        await transaction.commit()
        syncedCount += chunk.length
      }

      return NextResponse.json({
        success: true,
        message: `Successfully synced ${syncedCount} subscribers!${dualSyncLeads ? ' (And dual-synced to Leads Directory)' : ''}`,
        syncedCount,
      })
    }

    // ── SINGLE SUBSCRIBER INGESTION MODE ──
    const { email, name, company, audienceType, source, skipWelcomeEmail } = body

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
      const patchData: any = { isActive: true }
      if (name && !existing.name) patchData.name = name
      if (company && !existing.company) patchData.company = company
      if (audienceType) patchData.audienceType = audienceType
      if (source) patchData.source = source

      if (!existing.isActive) {
        patchData.subscribedAt = new Date().toISOString()
      }

      await writeClient
        .patch(existing._id)
        .set(patchData)
        .commit()

      if (existing.isActive) {
        return NextResponse.json({ success: true, message: 'This contact is already in the subscribers list!' })
      }
    } else {
      // Create new subscriber
      isNewSubscriber = true
      await writeClient.create({
        _type: 'newsletterSubscriber',
        email: cleanEmail,
        name: name || undefined,
        company: company || undefined,
        audienceType: audienceType || 'b2b',
        source: source || 'b2b_leads_directory',
        subscribedAt: new Date().toISOString(),
        isActive: true,
      })
    }

    // 2. Dispatch automated Welcome Email (only for B2C consumer opt-ins, or if skipWelcomeEmail is false)
    if (!skipWelcomeEmail) {
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
    const { id, isActive, audienceType, name, company } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required.' }, { status: 400 })
    }

    const patch = writeClient.patch(id)
    if (typeof isActive === 'boolean') patch.set({ isActive })
    if (audienceType) patch.set({ audienceType })
    if (name !== undefined) patch.set({ name })
    if (company !== undefined) patch.set({ company })

    await patch.commit()
    return NextResponse.json({ success: true, message: 'Subscriber updated successfully.' })
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

    await writeClient.delete(id)
    return NextResponse.json({ success: true, message: 'Subscriber removed successfully.' })
  } catch (err: any) {
    console.error('Delete Subscriber Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

