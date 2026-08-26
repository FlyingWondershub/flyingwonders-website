import { NextResponse } from 'next/server'
import { client } from '../../../../sanity/lib/client'
import { getSanityWriteClient } from '../../../../sanity/lib/writeClient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      agentName,
      companyName = '',
      whatsappNumber,
      email = '',
      subscribedDestinations = ['All Destinations'],
      subscribedCategories = ['all'],
      customKeywords = '',
      alertFrequency = 'instant',
      preferredChannel = 'whatsapp',
    } = body

    if (!agentName || !whatsappNumber) {
      return NextResponse.json({ error: 'Agent name and WhatsApp number are required.' }, { status: 400 })
    }

    // Clean and normalize phone number
    let cleanPhone = whatsappNumber.replace(/[^\d+]/g, '').trim()
    if (!cleanPhone.startsWith('+') && cleanPhone.length === 10) {
      cleanPhone = `+91${cleanPhone}`
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = `+${cleanPhone}`
    }

    const writeClient = getSanityWriteClient()
    if (!writeClient) {
      return NextResponse.json({ error: 'Sanity write client is not configured.' }, { status: 500 })
    }

    // Check if subscriber already exists by phone number
    const existingSubscriber = await client.fetch(
      `*[_type == "b2bLeadSubscriber" && whatsappNumber == $cleanPhone][0]._id`,
      { cleanPhone }
    ).catch(() => null)

    let docId: string

    if (existingSubscriber) {
      // Update existing subscription
      const updated = await writeClient
        .patch(existingSubscriber)
        .set({
          agentName,
          companyName,
          email: email || undefined,
          subscribedDestinations: Array.isArray(subscribedDestinations) && subscribedDestinations.length > 0 ? subscribedDestinations : ['All Destinations'],
          subscribedCategories: Array.isArray(subscribedCategories) && subscribedCategories.length > 0 ? subscribedCategories : ['all'],
          customKeywords: customKeywords || undefined,
          alertFrequency,
          preferredChannel,
          status: 'active',
          updatedAt: new Date().toISOString(),
        })
        .commit()
      docId = updated._id
    } else {
      // Create new subscriber
      const newDoc = await writeClient.create({
        _type: 'b2bLeadSubscriber',
        agentName,
        companyName,
        whatsappNumber: cleanPhone,
        email: email || undefined,
        subscribedDestinations: Array.isArray(subscribedDestinations) && subscribedDestinations.length > 0 ? subscribedDestinations : ['All Destinations'],
        subscribedCategories: Array.isArray(subscribedCategories) && subscribedCategories.length > 0 ? subscribedCategories : ['all'],
        customKeywords: customKeywords || undefined,
        alertFrequency,
        preferredChannel,
        status: 'active',
        maxDailyAlerts: 6,
        totalAlertsSent: 0,
        subscribedAt: new Date().toISOString(),
      })
      docId = newDoc._id
    }

    return NextResponse.json({
      success: true,
      subscriberId: docId,
      phone: cleanPhone,
      destinations: subscribedDestinations,
      message: 'Successfully subscribed to lead alerts!'
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error in subscribe route:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
