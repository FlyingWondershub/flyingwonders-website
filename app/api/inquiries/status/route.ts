import { NextResponse } from 'next/server'
import { client } from '../../../../sanity/lib/client'
import { getSanityWriteClient } from '../../../../sanity/lib/writeClient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { inquiryId, status, closedBy = '', pin = '' } = body

    if (!inquiryId || !status) {
      return NextResponse.json({ error: 'inquiryId and status are required' }, { status: 400 })
    }

    if (!['open', 'in_progress', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    // Check Sanity Settings if PIN is required
    const settingsQuery = `*[_type == "b2bLeadsSettings"][0]{
      requirePinToClose,
      closurePin
    }`
    const settings = await client.fetch(settingsQuery).catch(() => null)

    if (settings?.requirePinToClose && status === 'closed') {
      const expectedPin = settings.closurePin || '1234'
      if (pin.trim() !== expectedPin.trim()) {
        return NextResponse.json({ error: 'Incorrect Team PIN. Please provide the valid 4-digit code.' }, { status: 403 })
      }
    }

    const writeClient = getSanityWriteClient()
    if (!writeClient) {
      return NextResponse.json({ error: 'Sanity write client not configured' }, { status: 500 })
    }

    const patchData: Record<string, any> = {
      status,
    }

    if (status === 'closed') {
      patchData.closedBy = closedBy.trim() || 'Community Partner'
      patchData.closedAt = new Date().toISOString()
    } else if (status === 'open') {
      patchData.closedBy = null
      patchData.closedAt = null
    }

    const updated = await writeClient
      .patch(inquiryId)
      .set(patchData)
      .commit()

    return NextResponse.json({
      success: true,
      inquiryId: updated._id,
      status: updated.status,
      closedBy: updated.closedBy
    })
  } catch (error: any) {
    console.error('Error updating inquiry status:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
