import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

export const dynamic = 'force-dynamic'

const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
})

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      clientName, 
      clientEmail, 
      clientPhone, 
      userRole, 
      packageTitle, 
      packagePrice, 
      preferredDate, 
      preferredTimeWindow, 
      preferredLanguage, 
      tripDetails 
    } = body

    if (!clientName || !clientEmail || !clientPhone) {
      return NextResponse.json({ error: 'Missing required contact details' }, { status: 400 })
    }

    const bookingId = `FW-CONSULT-${Date.now().toString().slice(-6)}`

    const doc = {
      _type: 'travelConsultingBooking',
      bookingId,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      userRole: userRole || 'Traveler',
      packageTitle: packageTitle || 'Plan & Prepare',
      packagePrice: packagePrice || 'SGD $45 / ₹2,499',
      preferredDate: preferredDate || null,
      preferredTimeWindow: preferredTimeWindow || 'Morning (9:00 AM – 12:00 PM SGT)',
      preferredLanguage: preferredLanguage || 'English',
      tripDetails: tripDetails ? tripDetails.trim() : '',
      status: 'pending',
    }

    if (process.env.SANITY_WRITE_TOKEN) {
      const created = await writeClient.create(doc)
      return NextResponse.json({ success: true, bookingId, booking: created })
    }

    return NextResponse.json({ 
      success: true, 
      bookingId,
      booking: { ...doc, _id: `temp-${Date.now()}` } 
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
