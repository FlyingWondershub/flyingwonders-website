import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'
import { sendEmail } from '../../../../lib/brevo'
import { isSesConfigured } from '../../../../lib/ses'
import { fetchLiveBrevoQuota } from '../quota/route'
import { getSubscribersForSend } from '../../../../lib/audience-chunk-store'

export const maxDuration = 300

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

export async function POST(req: Request) {
  try {
    const {
      campaignId,
      adminEmail,
      targetAudience = 'all',
      sourceTag,
      customEmails,
      batchLimit,
      skipPreviouslySent = true,
      dispatcher = 'ses'
    } = await req.json()

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
      source?: string
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
    } else {
      recipients = (await getSubscribersForSend(targetAudience, sourceTag)) as Recipient[]
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({
        error: 'No active subscribers found matching the selected audience criteria.'
      }, { status: 400 })
    }

    // 4. Multi-Wave Deduplication (Skip Previously Sent Contacts)
    const prevDispatched = Array.isArray(campaign.dispatchedEmails) ? campaign.dispatchedEmails : []
    const sentSet = new Set(prevDispatched.map((e: string) => e.toLowerCase().trim()))

    let eligibleRecipients = recipients
    if (skipPreviouslySent) {
      eligibleRecipients = recipients.filter((r: Recipient) => !sentSet.has(r.email.toLowerCase().trim()))
    }

    if (eligibleRecipients.length === 0) {
      return NextResponse.json({
        error: `All ${recipients.length} contacts in this audience have already received this campaign in earlier waves. Uncheck "Exclude contacts who already received this campaign" if you wish to re-blast.`
      }, { status: 400 })
    }

    // 5. Safe Batch Capping & Dispatcher Selection
    const isUsingSes = dispatcher === 'ses' && isSesConfigured()
    let liveQuota: any = null

    if (!isUsingSes) {
      liveQuota = await fetchLiveBrevoQuota()
      if (liveQuota.planType === 'free' && liveQuota.remainingCredits <= 0) {
        return NextResponse.json({
          error: `Brevo daily limit reached (${liveQuota.sentToday} of ${liveQuota.dailyLimit} emails sent across your account today). Your quota resets at ${liveQuota.resetsAtUtc} (in approx ${liveQuota.resetsInHours} hours). Switch to Amazon SES in the modal for high-capacity instant delivery.`
        }, { status: 429 })
      }
    }

    const parsedLimit = typeof batchLimit === 'number' ? batchLimit : (batchLimit ? parseInt(batchLimit, 10) : undefined)
    const requestedBatchLimit = (parsedLimit && parsedLimit > 0) ? parsedLimit : eligibleRecipients.length

    // Safe single-wave batch capping:
    // - For Amazon SES: Cap single wave to 1,000 to complete comfortably within Vercel timeout (~85s) with 0 errors
    // - For Brevo free tier: Never exceed live remaining Brevo credits (max 250-300/day)
    const MAX_SES_WAVE_SIZE = 1000
    const effectiveBatchLimit = isUsingSes
      ? Math.min(requestedBatchLimit, MAX_SES_WAVE_SIZE)
      : (liveQuota?.planType === 'free' ? Math.min(requestedBatchLimit, liveQuota.remainingCredits) : Math.min(requestedBatchLimit, 500))

    const batchToSend = eligibleRecipients.slice(0, effectiveBatchLimit)

    console.log(`Starting targeted newsletter dispatch (${targetAudience} via ${isUsingSes ? 'Amazon SES' : 'Brevo'}) - Batch: ${batchToSend.length} / Eligible: ${eligibleRecipients.length} / Total Audience: ${recipients.length} for campaign: "${campaign.title}"`)

    // 6. Send Emails via Provider in Concurrent Chunks with Rate Pacing
    let successCount = 0
    const errors: Array<{ email: string; error: string }> = []
    const successfullySentEmails: string[] = []

    const waText = encodeURIComponent(`Hi Flying Wonders, I received your email regarding "${campaign.subject}" and would like to inquire.`)
    const defaultWhatsAppUrl = `https://wa.me/6594722830?text=${waText}`

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    let consecutiveFailureCount = 0

    const chunkSize = 10
    for (let i = 0; i < batchToSend.length; i += chunkSize) {
      // Circuit breaker: If 3 consecutive chunks completely fail due to provider rejection, stop early
      if (consecutiveFailureCount >= 3) {
        console.warn(`[Dispatcher] Aborting remaining dispatch after ${consecutiveFailureCount} consecutive chunk failures to protect provider quota.`)
        break
      }

      const chunk = batchToSend.slice(i, i + chunkSize)
      const chunkStartTime = Date.now()
      let chunkSuccessCount = 0

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
              <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a202c; max-width: 720px; margin: 0 auto; line-height: 1.6; background: #f8fafc; padding: 20px 0;">
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
              preferredProvider: isUsingSes ? 'ses' : 'brevo',
            })

            if (result.success) {
              successCount++
              chunkSuccessCount++
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

      if (chunkSuccessCount === 0 && chunk.length > 0) {
        consecutiveFailureCount++
      } else {
        consecutiveFailureCount = 0
      }

      // Safe rate-limiting pace for Amazon SES (Account max rate is 14/sec; target ~11.5/sec)
      if (isUsingSes && (i + chunkSize < batchToSend.length)) {
        const elapsed = Date.now() - chunkStartTime
        const minChunkDurationMs = 850 // ensures max ~11.7 emails/sec
        if (elapsed < minChunkDurationMs) {
          await sleep(minChunkDurationMs - elapsed)
        }
      }
    }

    // 7. Update Sanity Campaign Document with Audit History (No lock!)
    const remainingAfterBatch = Math.max(0, eligibleRecipients.length - successCount)
    const nowIso = new Date().toISOString()
    const dispatcherTag = isUsingSes ? 'Amazon SES' : 'Brevo'
    const isMultiWave = remainingAfterBatch > 0 || prevDispatched.length > 0
    const waveNote = targetAudience === 'tag'
      ? (isMultiWave
          ? `[${dispatcherTag}] Wave: Sent ${successCount} of ${eligibleRecipients.length} eligible tag "${sourceTag}" contacts (${remainingAfterBatch} remaining)`
          : `[${dispatcherTag}] Event tag "${sourceTag}" (${recipients.length} recipients)`)
      : (targetAudience === 'custom'
          ? `[${dispatcherTag}] Custom list: Sent ${successCount} of ${eligibleRecipients.length} addresses`
          : (isMultiWave
              ? `[${dispatcherTag}] Wave: Sent ${successCount} of ${eligibleRecipients.length} eligible ${targetAudience.toUpperCase()} contacts (${remainingAfterBatch} remaining)`
              : `[${dispatcherTag}] ${targetAudience.toUpperCase()} audience (${recipients.length} recipients)`))

    const newHistoryEntry = {
      _key: `dispatch-${Date.now()}`,
      dispatchedAt: nowIso,
      targetAudience: targetAudience === 'tag' && sourceTag ? `TAG: ${sourceTag.toUpperCase()}` : targetAudience.toUpperCase(),
      sentCount: successCount,
      errorCount: errors.length,
      dispatchedBy: adminEmail,
      notes: waveNote,
    }

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
      batchSize: batchToSend.length,
      totalEligible: eligibleRecipients.length,
      totalAudience: recipients.length,
      remainingAfterBatch,
      nextWaveRecommended: remainingAfterBatch > 0,
      targetAudience: targetAudience === 'tag' && sourceTag ? `TAG: ${sourceTag}` : targetAudience,
      dispatcher: isUsingSes ? 'ses' : 'brevo',
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    console.error('Newsletter Dispatch Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
