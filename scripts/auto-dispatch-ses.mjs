import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { createClient } from '@sanity/client'
import { SESClient, SendEmailCommand, GetSendQuotaCommand } from '@aws-sdk/client-ses'

// 1. Load Environment Variables from .env.local
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        const key = match[1]
        let val = (match[2] || '').trim()
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}
loadEnv()

// 2. Parse CLI Arguments
const args = process.argv.slice(2)
function getArg(flag, defaultValue = null) {
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === flag && i + 1 < args.length) return args[i + 1]
    if (a.startsWith(`${flag}=`)) return a.split('=')[1]
  }
  return defaultValue
}
const hasFlag = (flag) => args.includes(flag)

const targetCampaignId = getArg('--campaignId')
const targetTag = (getArg('--tag') || 'nidhi').trim()
const targetRate = parseFloat(getArg('--rate', '12')) // max emails per second
const maxSendsLimit = getArg('--maxSends') ? parseInt(getArg('--maxSends'), 10) : null
const checkpointInterval = parseInt(getArg('--checkpoint', '500'), 10)
const isDryRun = hasFlag('--dryRun') || hasFlag('--dry-run')
const isAutoConfirm = hasFlag('--yes') || hasFlag('-y')

// 3. Initialize Sanity Client
const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8xtd7yiv'
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const sanityToken = process.env.SANITY_WRITE_TOKEN

if (!sanityToken) {
  console.error('❌ Error: SANITY_WRITE_TOKEN is missing in environment variables.')
  process.exit(1)
}

const sanityClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  token: sanityToken,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// 4. Initialize AWS SES Client
const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim()
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim()
const region = process.env.AWS_REGION?.trim() || 'us-east-1'
const fromEmail = process.env.AWS_SES_FROM_EMAIL?.trim() || 'Flying Wonders <contact@flyingwonders.net>'

if (!accessKeyId || !secretAccessKey) {
  console.error('❌ Error: AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY is missing in environment variables.')
  process.exit(1)
}

const sesClient = new SESClient({
  region,
  credentials: { accessKeyId, secretAccessKey },
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}m ${s < 10 ? '0' : ''}${s}s`
}

function promptUser(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => rl.question(query, (ans) => { rl.close(); resolve(ans); }))
}

// 5. Build HTML Email Template matching website standard
function buildCampaignHtml(campaign, recipient) {
  const recipientName = recipient.name || (recipient.audienceType === 'b2c' ? 'Traveler' : 'Travel Partner')
  const recipientCompany = recipient.company || 'your agency'

  const waText = encodeURIComponent(`Hi Flying Wonders, I received your email regarding "${campaign.subject}" and would like to inquire.`)
  const defaultWhatsAppUrl = `https://wa.me/6594722830?text=${waText}`
  const unsubscribeUrl = `https://flyingwonders.net/api/newsletter/unsubscribe?email=${encodeURIComponent(recipient.email)}`

  let personalizedSubject = campaign.subject
    .replace(/\{\{\s*name\s*\}\}/gi, recipientName)
    .replace(/\{\{\s*company\s*\}\}/gi, recipientCompany)

  let personalizedContent = campaign.content
    .replace(/\{\{\s*name\s*\}\}/gi, recipientName)
    .replace(/\{\{\s*company\s*\}\}/gi, recipientCompany)
    .replace(/https:\/\/wa\.me\/[0-9]+(\?[^"'\s]*)?/gi, defaultWhatsAppUrl)

  const preheaderHtml = campaign.preheader
    ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
        ${campaign.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
      </div>`
    : ''

  const html = `
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

  return { subject: personalizedSubject, html }
}

async function sendEmailViaSes(recipientEmail, subject, html) {
  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: {
      ToAddresses: [recipientEmail.trim()],
    },
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
      },
    },
    ReplyToAddresses: ['contact@flyingwonders.net'],
  })

  return await sesClient.send(command)
}

// 6. Main Execution Loop
async function main() {
  console.log('\n========================================================================')
  console.log('🚀 FLYING WONDERS — AMAZON SES BULK CAMPAIGN RUNNER')
  console.log('========================================================================\n')

  // Check AWS Quota
  try {
    const quotaRes = await sesClient.send(new GetSendQuotaCommand({}))
    console.log(`📡 AWS SES Region : ${region}`)
    console.log(`📡 AWS Daily Quota: ${quotaRes.SentLast24Hours?.toLocaleString() || 0} / ${quotaRes.Max24HourSend?.toLocaleString() || 0} sent in last 24h`)
    console.log(`📡 AWS Max Rate   : ${quotaRes.MaxSendRate || 14} emails/sec (Running safely at ${targetRate}/sec)\n`)
  } catch (err) {
    console.warn(`⚠️ Warning: Could not verify SES quota: ${err.message}`)
  }

  // Resolve Campaign
  let campaign = null
  if (targetCampaignId) {
    campaign = await sanityClient.fetch(`*[_type == "newsletterCampaign" && _id == $id][0]`, { id: targetCampaignId })
  } else {
    // Fetch recent campaigns and pick latest
    const recent = await sanityClient.fetch(
      `*[_type == "newsletterCampaign"] | order(_createdAt desc)[0..4] { _id, title, subject, status, "dispatchedCount": count(dispatchedEmails) }`
    )
    if (!recent || recent.length === 0) {
      console.error('❌ No campaigns found in Sanity.')
      process.exit(1)
    }

    console.log('Available Campaigns in Sanity:')
    recent.forEach((c, idx) => {
      console.log(` [${idx + 1}] "${c.title}" (Dispatched: ${c.dispatchedCount || 0} | Status: ${c.status})`)
    })

    if (isAutoConfirm) {
      campaign = await sanityClient.fetch(`*[_type == "newsletterCampaign" && _id == $id][0]`, { id: recent[0]._id })
    } else {
      const choice = await promptUser(`\nSelect campaign [1-${recent.length}] (default: 1): `)
      const selectedIdx = choice ? parseInt(choice, 10) - 1 : 0
      const chosen = recent[selectedIdx] || recent[0]
      campaign = await sanityClient.fetch(`*[_type == "newsletterCampaign" && _id == $id][0]`, { id: chosen._id })
    }
  }

  if (!campaign) {
    console.error('❌ Campaign not found.')
    process.exit(1)
  }

  console.log(`\nSelected Campaign : "${campaign.title}"`)
  console.log(`Subject Line      : "${campaign.subject}"`)
  console.log(`Campaign ID       : ${campaign._id}`)

  // Resolve Subscribers
  console.log(`\n🔍 Fetching active subscribers for tag: "${targetTag.toUpperCase()}"...`)
  const chunks = await sanityClient.fetch(
    `*[_type == "newsletterSubscriberChunk"] | order(chunkIndex asc) { subscribers }`
  )

  let allSubscribers = []
  if (chunks && chunks.length > 0) {
    for (const c of chunks) {
      if (Array.isArray(c.subscribers)) {
        allSubscribers.push(...c.subscribers)
      }
    }
  }

  const cleanTag = targetTag.toLowerCase()
  const matchingSubscribers = allSubscribers.filter((s) => {
    if (!s.isActive || !s.source) return false
    const tags = s.source.split(',').map((t) => t.trim().toLowerCase())
    return tags.includes(cleanTag) || s.source.toLowerCase().includes(cleanTag)
  })

  // Deduplication: Exclude previously dispatched emails
  const prevDispatched = Array.isArray(campaign.dispatchedEmails) ? campaign.dispatchedEmails : []
  const sentSet = new Set(prevDispatched.map((e) => e.toLowerCase().trim()))

  let eligibleRecipients = matchingSubscribers.filter((s) => !sentSet.has(s.email.toLowerCase().trim()))

  if (maxSendsLimit && maxSendsLimit > 0) {
    eligibleRecipients = eligibleRecipients.slice(0, maxSendsLimit)
  }

  console.log(`\n========================================================================`)
  console.log(`📊 AUDIENCE SUMMARY`)
  console.log(`========================================================================`)
  console.log(`Target Tag         : ${targetTag.toUpperCase()}`)
  console.log(`Total In Database  : ${matchingSubscribers.length.toLocaleString()} contacts`)
  console.log(`Already Dispatched : ${sentSet.size.toLocaleString()} contacts (Skipped automatically)`)
  console.log(`Eligible to Send   : ${eligibleRecipients.length.toLocaleString()} contacts`)
  const estSeconds = Math.ceil(eligibleRecipients.length / targetRate)
  console.log(`Estimated Duration : ~${formatDuration(estSeconds)} (at ~${targetRate} emails/second)`)
  console.log(`========================================================================\n`)

  if (eligibleRecipients.length === 0) {
    console.log('✅ All contacts matching this tag have already received this campaign!')
    process.exit(0)
  }

  if (isDryRun) {
    console.log('🔍 [DRY RUN MODE] Showing first 5 sample recipients that would be dispatched:')
    eligibleRecipients.slice(0, 5).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.email} (${r.name || 'No name'} | ${r.company || 'No company'})`)
    })
    console.log('\nDry run complete. No emails were sent. Run without --dryRun to dispatch.')
    process.exit(0)
  }

  if (!isAutoConfirm) {
    const confirm = await promptUser(`🚀 Ready to dispatch to all ${eligibleRecipients.length.toLocaleString()} contacts via Amazon SES? (yes/no): `)
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('Dispatch aborted by user.')
      process.exit(0)
    }
  }

  console.log(`\n🚀 Starting continuous automated dispatch via Amazon SES...\n`)

  const startTime = Date.now()
  let successCount = 0
  let errorCount = 0
  const newlySentEmails = []
  const errors = []

  const chunkSize = 10
  const minChunkDurationMs = Math.round((chunkSize / targetRate) * 1000) // pacing per chunk
  let lastCheckpointCount = 0
  let consecutiveFailures = 0

  for (let i = 0; i < eligibleRecipients.length; i += chunkSize) {
    if (consecutiveFailures >= 5) {
      console.error(`\n❌ [CIRCUIT BREAKER] 5 consecutive batches failed. Aborting to protect AWS reputation.`)
      break
    }

    const chunk = eligibleRecipients.slice(i, i + chunkSize)
    const chunkStart = Date.now()
    let chunkSuccess = 0

    await Promise.all(
      chunk.map(async (recipient) => {
        const email = recipient.email.toLowerCase().trim()
        try {
          const { subject, html } = buildCampaignHtml(campaign, recipient)
          await sendEmailViaSes(email, subject, html)
          successCount++
          chunkSuccess++
          newlySentEmails.push(email)
        } catch (err) {
          errorCount++
          errors.push({ email, error: err.message })
          console.error(`  ⚠️ Error sending to ${email}: ${err.message}`)
        }
      })
    )

    if (chunkSuccess === 0 && chunk.length > 0) {
      consecutiveFailures++
    } else {
      consecutiveFailures = 0
    }

    // Pacing rate control
    const chunkElapsed = Date.now() - chunkStart
    if (chunkElapsed < minChunkDurationMs && i + chunkSize < eligibleRecipients.length) {
      await sleep(minChunkDurationMs - chunkElapsed)
    }

    // Print live progress
    const totalElapsedSec = (Date.now() - startTime) / 1000
    const currentRate = totalElapsedSec > 0 ? (successCount / totalElapsedSec).toFixed(1) : 0
    const pct = ((successCount / eligibleRecipients.length) * 100).toFixed(1)
    const remainingCount = eligibleRecipients.length - successCount
    const etaSec = currentRate > 0 ? Math.ceil(remainingCount / currentRate) : 0

    process.stdout.write(
      `\r[${new Date().toLocaleTimeString()}] Sent: ${successCount.toLocaleString()} / ${eligibleRecipients.length.toLocaleString()} (${pct}%) | Rate: ${currentRate}/s | Elapsed: ${formatDuration(totalElapsedSec)} | ETA: ${formatDuration(etaSec)} | Errors: ${errorCount} `
    )

    // Checkpoint save to Sanity every checkpointInterval emails
    if (successCount - lastCheckpointCount >= checkpointInterval || i + chunkSize >= eligibleRecipients.length) {
      lastCheckpointCount = successCount
      const combinedDispatched = Array.from(new Set([...prevDispatched, ...newlySentEmails]))
      try {
        await sanityClient
          .patch(campaign._id)
          .set({
            dispatchedEmails: combinedDispatched,
            lastSentAt: new Date().toISOString(),
            lastSentToCount: successCount,
            status: 'sent',
          })
          .commit()
        process.stdout.write(`\n💾 [CHECKPOINT] Saved ${combinedDispatched.length.toLocaleString()} total dispatched contacts to Sanity.\n`)
      } catch (saveErr) {
        console.warn(`\n⚠️ Failed to commit checkpoint to Sanity: ${saveErr.message}\n`)
      }
    }
  }

  // Final Sanity update with Audit Trail
  const totalElapsedSec = (Date.now() - startTime) / 1000
  const finalDispatched = Array.from(new Set([...prevDispatched, ...newlySentEmails]))
  const nowIso = new Date().toISOString()

  const historyEntry = {
    _key: `ses-runner-${Date.now()}`,
    dispatchedAt: nowIso,
    targetAudience: `TAG: ${targetTag.toUpperCase()}`,
    sentCount: successCount,
    errorCount: errorCount,
    dispatchedBy: 'Amazon SES Background Runner',
    notes: `[Amazon SES Background Runner] Dispatched ${successCount.toLocaleString()} emails in ${formatDuration(totalElapsedSec)}. (Tag: ${targetTag.toUpperCase()} • Total Campaign Dispatched: ${finalDispatched.length.toLocaleString()})`,
  }

  try {
    await sanityClient
      .patch(campaign._id)
      .set({
        dispatchedEmails: finalDispatched,
        lastSentAt: nowIso,
        lastSentToCount: successCount,
        status: 'sent',
      })
      .setIfMissing({ sentAt: nowIso, dispatchCount: 0, dispatchHistory: [] })
      .inc({ dispatchCount: 1 })
      .append('dispatchHistory', [historyEntry])
      .commit()
    console.log('\n💾 Audit Trail & Dispatch History successfully recorded in Sanity!')
  } catch (err) {
    console.error('⚠️ Failed to save final audit history to Sanity:', err.message)
  }

  console.log('\n========================================================================')
  console.log('🎉 DISPATCH 100% COMPLETE!')
  console.log('========================================================================')
  console.log(`Campaign Title    : "${campaign.title}"`)
  console.log(`Audience Tag      : ${targetTag.toUpperCase()}`)
  console.log(`Emails Dispatched : ${successCount.toLocaleString()}`)
  console.log(`Total Dispatched  : ${finalDispatched.length.toLocaleString()} (Campaign total)`)
  console.log(`Errors Encountered: ${errorCount}`)
  console.log(`Total Time Taken  : ${formatDuration(totalElapsedSec)}`)
  console.log(`Audit Status      : Check "Dispatch History" on flyingwonders.net/admin-dashboard`)
  console.log('========================================================================\n')
}

main().catch((err) => {
  console.error('\n❌ Fatal Dispatch Error:', err)
  process.exit(1)
})
