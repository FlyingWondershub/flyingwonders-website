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
    const { campaignId, adminEmail, targetAudience = 'all', sourceTag, customEmails } = await req.json()

    // 1. Verify that the request is initiated by an authorized admin
    const allowedAdmins = ['info.flyingwonders@gmail.com', 'support.flyingwonders@gmail.com']
    if (!adminEmail || !allowedAdmins.includes(adminEmail.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized. Only admins can dispatch newsletters.' }, { status: 403 })
    }

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required.' }, { status: 400 })
    }

    // 2. Fetch the Campaign document from Sanity
    const campaign = await writeClient.fetch(
      `*[_type == "newsletterCampaign" && _id == $campaignId][0]`,
      { campaignId }
    )

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 })
    }

    // 3. Resolve Target Recipient List
    interface Recipient {
      email: string
      name?: string
      company?: string
      audienceType?: string
    }

    let recipients: Recipient[] = []

    if (targetAudience === 'custom') {
      let rawList: string[] = []
      if (Array.isArray(customEmails)) {
        rawList = customEmails
      } else if (typeof customEmails === 'string') {
        rawList = customEmails.split(/[,\n;]+/)
      }

      const seen = new Set<string>()
      for (const item of rawList) {
        const clean = item.trim().toLowerCase()
        if (clean && clean.includes('@') && !seen.has(clean)) {
          seen.add(clean)
          recipients.push({ email: clean })
        }
      }

      if (recipients.length === 0) {
        return NextResponse.json({ error: 'No valid email addresses provided in the custom list.' }, { status: 400 })
      }
    } else if (targetAudience === 'tag' && sourceTag) {
      const cleanTag = sourceTag.trim()
      const audienceQuery = `*[_type == "newsletterSubscriber" && isActive == true && source match $tag] { email, name, company, audienceType, source }`
      const params: Record<string, any> = { tag: `*${cleanTag}*` }
      const fetchedSubscribers = await writeClient.fetch(audienceQuery, params)
      recipients = fetchedSubscribers || []
    } else {
      let audienceQuery = `*[_type == "newsletterSubscriber" && isActive == true`
      if (targetAudience === 'b2b') {
        audienceQuery += ` && (audienceType == "b2b" || !defined(audienceType))`
      } else if (targetAudience === 'b2c') {
        audienceQuery += ` && audienceType == "b2c"`
      }
      audienceQuery += `] { email, name, company, audienceType }`

      const fetchedSubscribers = await writeClient.fetch(audienceQuery)

      if (targetAudience === 'new' && Array.isArray(campaign.dispatchedEmails) && campaign.dispatchedEmails.length > 0) {
        const sentSet = new Set(campaign.dispatchedEmails.map((e: string) => e.toLowerCase()))
        recipients = (fetchedSubscribers || []).filter((s: Recipient) => !sentSet.has(s.email.toLowerCase()))
      } else {
        recipients = fetchedSubscribers || []
      }
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({
        error: targetAudience === 'new'
          ? 'All active subscribers have already received this campaign previously.'
          : 'No active subscribers found matching the selected audience criteria.'
      }, { status: 400 })
    }

    console.log(`Starting targeted newsletter dispatch (${targetAudience}) to ${recipients.length} recipients for campaign: "${campaign.title}"`)

    // 4. Send Emails via Brevo in Concurrent Chunks of 10 (Zero Vercel Timeout)
    let successCount = 0
    const errors: Array<{ email: string; error: string }> = []
    const successfullySentEmails: string[] = []

    const waText = encodeURIComponent(`Hi Flying Wonders, I received your email regarding "${campaign.subject}" and would like to inquire.`)
    const defaultWhatsAppUrl = `https://wa.me/6594722830?text=${waText}`

    const chunkSize = 10
    for (let i = 0; i < recipients.length; i += chunkSize) {
      const chunk = recipients.slice(i, i + chunkSize)
      await Promise.all(
        chunk.map(async (recipient) => {
          const email = recipient.email.toLowerCase().trim()
          try {
            const unsubscribeUrl = `https://flyingwonders.net/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`

            // Dynamic Personalization: Replace {{name}} and {{company}}
            const recipientName = recipient.name || (recipient.audienceType === 'b2c' ? 'Traveler' : 'Travel Partner')
            const recipientCompany = recipient.company || 'your agency'

            let personalizedSubject = campaign.subject
              .replace(/\{\{\s*name\s*\}\}/gi, recipientName)
              .replace(/\{\{\s*company\s*\}\}/gi, recipientCompany)

            let personalizedContent = campaign.content
              .replace(/\{\{\s*name\s*\}\}/gi, recipientName)
              .replace(/\{\{\s*company\s*\}\}/gi, recipientCompany)

            // Auto-link pre-filled WhatsApp inquiry if standard WhatsApp link is present
            personalizedContent = personalizedContent.replace(
              /https:\/\/wa\.me\/[0-9]+(\?[^"'\s]*)?/gi,
              defaultWhatsAppUrl
            )

            // Optional Preheader snippet hidden for email client inbox snippet
            const preheaderHtml = campaign.preheader
              ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
                  ${campaign.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
                </div>`
              : ''

            const mailHtml = `
              ${preheaderHtml}
              <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a202c; max-width: 720px; margin: 0 auto; line-height: 1.6; background: #f8fafc; padding: 20px 0;">
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 0 16px;">
                  <header style="background: #800020; padding: 2.2rem 1.5rem; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 1.8rem; letter-spacing: 0.12em; text-transform: uppercase; font-family: Georgia, serif;">Flying Wonders</h1>
                    <p style="color: #dfba6b; margin: 0.5rem 0 0 0; font-size: 0.8rem; letter-spacing: 0.25em; text-transform: uppercase; font-weight: 600;">Singapore & India Specialist DMC</p>
                  </header>
                  <main style="padding: 2.5rem 2rem; background: #ffffff;">
                    ${/<[a-z][\s\S]*>/i.test(personalizedContent) ? personalizedContent : personalizedContent.replace(/\n/g, '<br />')}
                  </main>
                  <footer style="background: #f8fafc; padding: 1.8rem 1.5rem; text-align: center; border-top: 1px solid #e2e8f0; font-size: 0.78rem; color: #64748b;">
                    <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #334155;">Flying Wonders Private Limited</p>
                    <p style="margin: 0 0 1rem 0;">Singapore & India Specialist DMC • Official B2B & B2C Partner</p>
                    <p style="margin: 0 0 0.5rem 0; font-size: 0.72rem; color: #94a3b8;">
                      You are receiving this email because you subscribed to updates at flyingwonders.net.
                    </p>
                    <p style="margin: 0; font-size: 0.72rem;">
                      <a href="${unsubscribeUrl}" style="color: #800020; text-decoration: underline;">Unsubscribe from newsletter</a>
                      &nbsp;•&nbsp;
                      <a href="https://flyingwonders.net/contact" style="color: #64748b; text-decoration: none;">Contact Support</a>
                    </p>
                  </footer>
                </div>
              </div>
            `

            const result = await sendEmail({
              to: email,
              subject: personalizedSubject,
              html: mailHtml,
              senderName: 'Flying Wonders',
              senderEmail: 'contact@flyingwonders.net',
              replyTo: 'contact@flyingwonders.net',
            })

            if (result.success) {
              successCount++
              successfullySentEmails.push(email)
            } else {
              throw new Error(result.error || 'Failed to dispatch email')
            }
          } catch (err: any) {
            console.error(`Failed to send newsletter to ${email}:`, err.message)
            errors.push({ email, error: err.message })
          }
        })
      )
    }

    // 5. Update Sanity Campaign Document with Audit History (No lock!)
    const nowIso = new Date().toISOString()
    const newHistoryEntry = {
      _key: `dispatch-${Date.now()}`,
      dispatchedAt: nowIso,
      targetAudience: targetAudience === 'tag' && sourceTag ? `TAG: ${sourceTag.toUpperCase()}` : targetAudience.toUpperCase(),
      sentCount: successCount,
      errorCount: errors.length,
      dispatchedBy: adminEmail,
      notes: targetAudience === 'tag' ? `Targeted event tag "${sourceTag}" (${recipients.length} recipients)` : (targetAudience === 'custom' ? `Custom list of ${recipients.length} addresses` : `${targetAudience} audience`),
    }

    const prevDispatched = Array.isArray(campaign.dispatchedEmails) ? campaign.dispatchedEmails : []
    const updatedDispatchedEmails = Array.from(new Set([...prevDispatched, ...successfullySentEmails]))

    await writeClient
      .patch(campaign._id)
      .set({
        status: 'sent',
        lastSentAt: nowIso,
        lastSentToCount: successCount,
        dispatchedEmails: updatedDispatchedEmails,
      })
      .setIfMissing({ sentAt: nowIso, dispatchCount: 0, dispatchHistory: [] })
      .inc({ dispatchCount: 1 })
      .append('dispatchHistory', [newHistoryEntry])
      .commit()

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      totalCount: recipients.length,
      targetAudience: targetAudience === 'tag' && sourceTag ? `TAG: ${sourceTag}` : targetAudience,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    console.error('Newsletter Dispatch Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
