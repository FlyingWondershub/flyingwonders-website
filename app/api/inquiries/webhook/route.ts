import { NextResponse } from 'next/server'
import { client } from '../../../../sanity/lib/client'
import { getSanityWriteClient } from '../../../../sanity/lib/writeClient'
import { parseWhatsAppMessage } from '../../../../utils/inquiryParser'

export async function POST(request: Request) {
  try {
    // 1. Verify Secret Token if set in environment
    const authHeader = request.headers.get('Authorization')
    const configuredSecret = process.env.INQUIRIES_WEBHOOK_SECRET

    if (configuredSecret) {
      const providedToken = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : ''
      if (providedToken !== configuredSecret) {
        return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 })
      }
    }

    const payload = await request.json()
    const {
      groupName = 'DMC SUPPORT EACH OTHER',
      sender = '',
      senderName = '',
      text = '',
      botNumber = '',
      timestamp = new Date().toISOString()
    } = payload

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 })
    }

    // 2. Automatically ignore private 1-on-1 Direct Messages to the bot
    if (groupName === 'Direct Message') {
      return NextResponse.json({
        status: 'ignored',
        reason: 'Direct 1-on-1 messages to the bot are ignored.'
      }, { status: 200 })
    }

    // 3. Fetch Dynamic Settings from Sanity (with fresh fetch)
    const writeClient = getSanityWriteClient()
    const settingsQuery = `*[_type == "b2bLeadsSettings"] | order(_updatedAt desc)[0]{
      allowedGroups,
      authorizedBotNumbers,
      isPageHidden
    }`
    const settings = writeClient 
      ? await writeClient.fetch(settingsQuery).catch(() => null)
      : await client.fetch(settingsQuery).catch(() => null)

    // Helper to strip emojis, symbols, and extra spaces for resilient group name matching
    const normalizeGroupName = (name: string) =>
      (name || '')
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()

    const cleanIncomingGroup = normalizeGroupName(groupName)

    // Check Allowed Groups filter
    if (settings?.allowedGroups && Array.isArray(settings.allowedGroups) && settings.allowedGroups.length > 0) {
      const isGroupAllowed = settings.allowedGroups.some((g: string) => {
        const cleanAllowed = normalizeGroupName(g)
        if (!cleanAllowed) return false
        return (
          cleanIncomingGroup === cleanAllowed ||
          cleanIncomingGroup.includes(cleanAllowed) ||
          cleanAllowed.includes(cleanIncomingGroup)
        )
      })
      if (!isGroupAllowed) {
        return NextResponse.json({
          status: 'ignored',
          reason: `Group '${groupName}' does not match allowed groups whitelist.`
        }, { status: 200 })
      }
    }

    // Check Authorized Bot Numbers filter
    if (settings?.authorizedBotNumbers && Array.isArray(settings.authorizedBotNumbers) && settings.authorizedBotNumbers.length > 0 && botNumber) {
      const cleanBot = botNumber.replace(/[^\d]/g, '')
      const isBotAllowed = settings.authorizedBotNumbers.some((b: string) =>
        b.replace(/[^\d]/g, '').includes(cleanBot) || cleanBot.includes(b.replace(/[^\d]/g, ''))
      )
      if (!isBotAllowed) {
        return NextResponse.json({
          status: 'ignored',
          reason: `Bot number '${botNumber}' is not authorized.`
        }, { status: 200 })
      }
    }

    // 3. Parse Message Text with smart extractor
    const parsed = parseWhatsAppMessage(text, sender, senderName)

    if (!parsed.isLikelyInquiry) {
      return NextResponse.json({
        status: 'filtered',
        reason: parsed.rejectionReason || 'Message was classified as non-inquiry / greeting.'
      }, { status: 200 })
    }

    // 4. Duplicate Detection (within last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const duplicateQuery = `*[_type == "b2bLeadInquiry" && rawMessage == $rawMessage && postedAt >= $twentyFourHoursAgo][0]._id`
    const existingId = await client.fetch(duplicateQuery, { rawMessage: parsed.rawMessage, twentyFourHoursAgo }).catch(() => null)

    if (existingId) {
      return NextResponse.json({
        status: 'duplicate',
        message: 'Identical message already recorded recently.',
        inquiryId: existingId
      }, { status: 200 })
    }

    // 5. Save to Sanity
    if (!writeClient) {
      return NextResponse.json({
        error: 'Sanity write client is not configured (SANITY_WRITE_TOKEN is missing).'
      }, { status: 500 })
    }

    const newDoc = await writeClient.create({
      _type: 'b2bLeadInquiry',
      title: parsed.title,
      destination: parsed.destination || undefined,
      category: parsed.category,
      rawMessage: parsed.rawMessage,
      requesterName: parsed.requesterName || 'Agent',
      phoneNumber: parsed.phoneNumber || undefined,
      city: parsed.city || undefined,
      groupName,
      botNumber: botNumber || undefined,
      urgency: parsed.urgency,
      status: 'open',
      postedAt: typeof timestamp === 'string' ? timestamp : new Date().toISOString(),
    })

    // 6. Match Active Subscribers & Dispatch Alerts / Audit Log
    const enabledChannel = settings?.enabledAlertChannels || 'whatsapp_only'
    const isWhatsAppEnabled = enabledChannel === 'whatsapp_only' || enabledChannel === 'all_channels'

    const subscribersQuery = `*[_type == "b2bLeadSubscriber" && status == "active"]{
      _id,
      agentName,
      companyName,
      whatsappNumber,
      email,
      subscribedDestinations,
      subscribedCategories,
      customKeywords,
      alertFrequency,
      preferredChannel,
      maxDailyAlerts,
      totalAlertsSent,
      lastAlertSentAt
    }`
    const subscribers = await client.fetch(subscribersQuery).catch(() => [])

    const matchedAlerts: Array<{
      subscriberId: string
      recipientPhone: string
      recipientEmail?: string
      recipientName: string
      text: string
    }> = []

    // Helper to check quiet hours (e.g. 22:30 to 08:00)
    const isInQuietHours = () => {
      if (!settings?.enableQuietHours) return false
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const currentTimeVal = hours * 60 + minutes

      const [startH, startM] = (settings.quietHoursStart || '22:30').split(':').map(Number)
      const [endH, endM] = (settings.quietHoursEnd || '08:00').split(':').map(Number)
      const startTimeVal = (startH || 22) * 60 + (startM || 30)
      const endTimeVal = (endH || 8) * 60 + (endM || 0)

      if (startTimeVal > endTimeVal) {
        return currentTimeVal >= startTimeVal || currentTimeVal < endTimeVal
      }
      return currentTimeVal >= startTimeVal && currentTimeVal < endTimeVal
    }

    const inQuietHours = isInQuietHours() && parsed.urgency !== 'urgent'

    if (Array.isArray(subscribers) && subscribers.length > 0) {
      for (const sub of subscribers) {
        // Destination Match
        const destMatch =
          !sub.subscribedDestinations ||
          sub.subscribedDestinations.includes('All Destinations') ||
          sub.subscribedDestinations.includes('All') ||
          (parsed.destination && sub.subscribedDestinations.some((d: string) =>
            d.toLowerCase().trim() === parsed.destination.toLowerCase().trim() ||
            parsed.destination.toLowerCase().includes(d.toLowerCase().trim()) ||
            d.toLowerCase().includes(parsed.destination.toLowerCase().trim())
          ))

        // Category Match
        const catMatch =
          !sub.subscribedCategories ||
          sub.subscribedCategories.includes('all') ||
          sub.subscribedCategories.includes(parsed.category)

        // Custom Keywords Match
        let keywordMatch = true
        if (sub.customKeywords && typeof sub.customKeywords === 'string' && sub.customKeywords.trim()) {
          const keywords = sub.customKeywords.split(',').map((k: string) => k.trim().toLowerCase()).filter(Boolean)
          if (keywords.length > 0) {
            keywordMatch = keywords.some((k: string) => parsed.rawMessage.toLowerCase().includes(k))
          }
        }

        if (destMatch && catMatch && keywordMatch) {
          const limit = sub.maxDailyAlerts || settings?.defaultDailyAlertLimit || 6
          const isToday = sub.lastAlertSentAt && new Date(sub.lastAlertSentAt).toDateString() === new Date().toDateString()
          const isRateLimited = isToday && (sub.totalAlertsSent || 0) >= limit

          let deliveryStatus = 'sent'
          let skipDispatch = false

          if (sub.alertFrequency === 'daily_digest') {
            deliveryStatus = 'queued_for_digest'
            skipDispatch = true
          } else if (isRateLimited) {
            deliveryStatus = 'rate_limited'
            skipDispatch = true
          } else if (inQuietHours) {
            deliveryStatus = 'quiet_hours_delayed'
            skipDispatch = true
          }

          try {
            await writeClient.create({
              _type: 'b2bLeadAuditLog',
              inquiryTitle: parsed.title,
              inquiryRef: { _type: 'reference', _ref: newDoc._id },
              subscriberRef: { _type: 'reference', _ref: sub._id },
              recipientPhone: sub.whatsappNumber,
              recipientEmail: sub.email || undefined,
              matchedDestination: parsed.destination || 'All Destinations',
              dispatchChannel: isWhatsAppEnabled ? 'whatsapp' : 'email',
              deliveryStatus,
              dispatchedAt: new Date().toISOString(),
            })

            if (!skipDispatch) {
              await writeClient
                .patch(sub._id)
                .set({
                  lastAlertSentAt: new Date().toISOString(),
                  totalAlertsSent: (sub.totalAlertsSent || 0) + 1,
                })
                .commit()

              const waLink = parsed.phoneNumber
                ? `https://wa.me/${parsed.phoneNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                    `Hi ${parsed.requesterName || 'Partner'}, saw your requirement for "${parsed.title}". We can assist you.`
                  )}`
                : 'https://flyingwonders.net/b2b-leads'

              const alertMsg = `🔔 *NEW LEAD ALERT — ${parsed.destination ? parsed.destination.toUpperCase() : 'TRAVEL REQUIREMENT'}*\n━━━━━━━━━━━━━━━━━━━━\n📌 *Requirement:* ${parsed.title}\n👤 *Agent:* ${parsed.requesterName || 'Travel Partner'}${parsed.city ? ` (${parsed.city})` : ''}\n🕒 *Posted:* Just now\n\n👉 *Connect Directly on WhatsApp:*\n${waLink}\n\n🌐 *View on Live Board:*\nhttps://flyingwonders.net/b2b-leads\n━━━━━━━━━━━━━━━━━━━━\n_Reply STOP to pause alerts._`

              matchedAlerts.push({
                subscriberId: sub._id,
                recipientPhone: sub.whatsappNumber,
                recipientEmail: sub.email,
                recipientName: sub.agentName,
                text: alertMsg,
              })
            }
          } catch (auditErr) {
            console.error('Failed to log audit or update subscriber:', auditErr)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      inquiryId: newDoc._id,
      matchedAlerts,
      parsed: {
        title: parsed.title,
        destination: parsed.destination,
        category: parsed.category,
        phoneNumber: parsed.phoneNumber,
        requesterName: parsed.requesterName,
        city: parsed.city,
        urgency: parsed.urgency,
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error processing inquiry webhook:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
