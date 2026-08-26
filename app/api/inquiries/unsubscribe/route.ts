import { NextResponse } from 'next/server'
import { client } from '../../../../sanity/lib/client'
import { getSanityWriteClient } from '../../../../sanity/lib/writeClient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, command = 'STOP', subscriberId } = body

    if (!phone && !subscriberId) {
      return NextResponse.json({ error: 'Phone number or subscriberId is required.' }, { status: 400 })
    }

    let cleanPhone = (phone || '').replace(/[^\d+]/g, '').trim()
    if (cleanPhone && !cleanPhone.startsWith('+') && cleanPhone.length === 10) {
      cleanPhone = `+91${cleanPhone}`
    } else if (cleanPhone && !cleanPhone.startsWith('+')) {
      cleanPhone = `+${cleanPhone}`
    }

    const writeClient = getSanityWriteClient()
    if (!writeClient) {
      return NextResponse.json({ error: 'Sanity write client is not configured.' }, { status: 500 })
    }

    // Find subscriber
    const query = subscriberId
      ? `*[_type == "b2bLeadSubscriber" && _id == $subscriberId][0]`
      : `*[_type == "b2bLeadSubscriber" && whatsappNumber == $cleanPhone][0]`
    const subscriber = await client.fetch(query, { subscriberId, cleanPhone }).catch(() => null)

    if (!subscriber) {
      return NextResponse.json({
        success: false,
        message: 'No active subscription found for this phone number.'
      }, { status: 404 })
    }

    const normalizedCmd = command.trim().toUpperCase()

    if (normalizedCmd === 'STATUS') {
      const destList = Array.isArray(subscriber.subscribedDestinations)
        ? subscriber.subscribedDestinations.join(', ')
        : 'All Destinations'
      return NextResponse.json({
        success: true,
        status: subscriber.status,
        destinations: destList,
        message: `Your alert subscription is currently ${subscriber.status.toUpperCase()} for destinations: ${destList}.`
      })
    }

    if (normalizedCmd === 'START' || normalizedCmd === 'RESUME') {
      await writeClient
        .patch(subscriber._id)
        .set({ status: 'active', updatedAt: new Date().toISOString() })
        .commit()

      return NextResponse.json({
        success: true,
        status: 'active',
        message: '✅ Your lead alerts have been reactivated! You will receive matching travel requirements.'
      })
    }

    // Default to STOP / PAUSE / UNSUBSCRIBE
    await writeClient
      .patch(subscriber._id)
      .set({ status: 'unsubscribed', unsubscribedAt: new Date().toISOString() })
      .commit()

    return NextResponse.json({
      success: true,
      status: 'unsubscribed',
      message: '✅ You have unsubscribed from Flying Wonders lead alerts. Reply START anytime to re-enable.'
    })

  } catch (error: any) {
    console.error('Error in unsubscribe route:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
