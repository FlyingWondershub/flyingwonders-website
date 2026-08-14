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

    let createdDoc = null
    if (process.env.SANITY_WRITE_TOKEN) {
      createdDoc = await writeClient.create(doc)
    }

    // DISPATCH INSTANT ADMIN EMAIL ALERT VIA WEB3FORMS API
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.WEB3FORMS_ACCESS_KEY || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          subject: `🚨 New Travel Consulting Request: ${bookingId} - ${clientName.trim()}`,
          from_name: 'Flying Wonders Travel Consulting',
          to_email: 'flyingwonders2024@gmail.com',
          message: `
NEW TRAVEL CONSULTING REQUEST SUBMITTED!
---------------------------------------
Booking Reference: ${bookingId}
Client Name: ${clientName.trim()}
Category: ${userRole || 'Traveler'}
Email: ${clientEmail.trim()}
Phone / WhatsApp: ${clientPhone.trim()}
Package: ${packageTitle} (${packagePrice})
Preferred Date: ${preferredDate || 'Flexible / Date TBD'}
Preferred Time Window: ${preferredTimeWindow}
Preferred Language: ${preferredLanguage}
Trip Notes: ${tripDetails || 'None provided'}

MANAGE LEAD & ASSIGN CONSULTANT:
1. Admin Dashboard: https://flyingwonders.net/admin-dashboard
2. Sanity Studio: https://flyingwonders.net/studio
          `
        })
      })
    } catch (emailErr) {
      console.error('Failed to send admin email alert:', emailErr)
    }

    return NextResponse.json({ 
      success: true, 
      bookingId,
      booking: createdDoc || { ...doc, _id: `temp-${Date.now()}` } 
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
