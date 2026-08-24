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

    return NextResponse.json({
      success: true,
      inquiryId: newDoc._id,
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
