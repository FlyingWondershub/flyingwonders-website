import { NextResponse } from 'next/server'
import { getSanityWriteClient } from '../../../../sanity/lib/writeClient'
import { parseWhatsAppMessage } from '../../../../utils/inquiryParser'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const {
      rawText = '',
      customTitle = '',
      customDestination = '',
      customCategory = '',
      customRequesterName = '',
      customPhone = '',
      groupName = 'Manual / Direct Paste',
    } = payload

    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 })
    }

    // Parse auto-extracted fields
    const parsed = parseWhatsAppMessage(rawText)

    const finalTitle = customTitle || parsed.title
    const finalDestination = customDestination || parsed.destination
    const finalCategory = customCategory || parsed.category || 'other'
    const finalRequesterName = customRequesterName || parsed.requesterName || 'Agent'
    const finalPhone = customPhone || parsed.phoneNumber

    const writeClient = getSanityWriteClient()
    if (!writeClient) {
      return NextResponse.json({
        error: 'Sanity write client is not configured (SANITY_WRITE_TOKEN is missing).'
      }, { status: 500 })
    }

    const doc = await writeClient.create({
      _type: 'b2bLeadInquiry',
      title: finalTitle,
      destination: finalDestination || undefined,
      category: finalCategory,
      rawMessage: rawText.trim(),
      requesterName: finalRequesterName,
      phoneNumber: finalPhone || undefined,
      city: parsed.city || undefined,
      groupName,
      urgency: parsed.urgency,
      status: 'open',
      postedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      inquiryId: doc._id,
      doc
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error in manual ingest:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
