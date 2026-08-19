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

export async function GET(req: NextRequest) {
  try {
    const bookings = await client.fetch(`
      *[_type == "travelConsultingBooking"] | order(_createdAt desc) {
        _id,
        bookingId,
        clientName,
        clientEmail,
        clientPhone,
        userRole,
        packageTitle,
        packagePrice,
        preferredDate,
        preferredTimeWindow,
        preferredLanguage,
        tripDetails,
        status,
        confirmedMeetingTime,
        meetingLink,
        adminNotes,
        _createdAt,
        assignedConsultant->{
          _id,
          name,
          title,
          whatsappNumber,
          meetingLink
        }
      }
    `)

    return NextResponse.json({ success: true, bookings: bookings || [] })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { bookingDocId, status, assignedConsultantId, confirmedMeetingTime, meetingLink, adminNotes } = body

    if (!bookingDocId) {
      return NextResponse.json({ error: 'Missing bookingDocId' }, { status: 400 })
    }

    if (!process.env.SANITY_WRITE_TOKEN) {
      return NextResponse.json({ error: 'SANITY_WRITE_TOKEN missing' }, { status: 500 })
    }

    const patchDoc: any = {}
    if (status) patchDoc.status = status
    if (adminNotes !== undefined) patchDoc.adminNotes = adminNotes
    if (confirmedMeetingTime) patchDoc.confirmedMeetingTime = confirmedMeetingTime
    if (meetingLink) patchDoc.meetingLink = meetingLink
    if (assignedConsultantId) {
      patchDoc.assignedConsultant = {
        _type: 'reference',
        _ref: assignedConsultantId
      }
    }

    const updated = await writeClient.patch(bookingDocId).set(patchDoc).commit()

    // Fetch full updated document with assigned consultant details
    const fullDoc = await client.fetch(`
      *[_type == "travelConsultingBooking" && _id == $bookingDocId][0]{
        _id,
        bookingId,
        clientName,
        clientEmail,
        clientPhone,
        userRole,
        packageTitle,
        packagePrice,
        preferredDate,
        preferredTimeWindow,
        preferredLanguage,
        status,
        confirmedMeetingTime,
        meetingLink,
        assignedConsultant->{
          name,
          title,
          whatsappNumber,
          meetingLink
        }
      }
    `, { bookingDocId })

    // IF STATUS IS SET TO ASSIGNED & CONFIRMED, SEND EMAIL NOTIFICATION TO CUSTOMER/AGENT (CC ADMIN)
    if (status === 'assigned' && fullDoc && fullDoc.clientEmail) {
      try {
        const meetUrl = meetingLink || fullDoc.meetingLink || fullDoc.assignedConsultant?.meetingLink || 'https://meet.google.com/flyingwonders-consulting'
        const consultantName = fullDoc.assignedConsultant?.name || 'Singapore DMC Specialist'
        const meetingTimeFormatted = confirmedMeetingTime 
          ? new Date(confirmedMeetingTime).toLocaleString('en-SG', { dateStyle: 'full', timeStyle: 'short' })
          : fullDoc.preferredDate ? `${fullDoc.preferredDate} (${fullDoc.preferredTimeWindow})` : 'To Be Confirmed'

        const globalSettings = await client.fetch(`*[_type == "globalContact"][0]{ contactEmail }`)
        const adminEmail = globalSettings?.contactEmail || 'info.flyingwonders@gmail.com'

        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: process.env.WEB3FORMS_ACCESS_KEY || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            subject: `✅ Your Travel Consultation is Confirmed! - ${consultantName} | Flying Wonders`,
            from_name: 'Flying Wonders Travel Consulting',
            to_email: fullDoc.clientEmail,
            cc_email: adminEmail,
            message: `
Dear ${fullDoc.clientName},

Great news! Your 1-on-1 Singapore & Malaysia Travel Consultation with Flying Wonders DMC is CONFIRMED.

CONFIRMED CONSULTATION DETAILS:
---------------------------------------
Booking Reference: ${fullDoc.bookingId || fullDoc._id}
Assigned Specialist: ${consultantName}
Confirmed Date & Time: ${meetingTimeFormatted}
Language: ${fullDoc.preferredLanguage || 'English'}
Package Selected: ${fullDoc.packageTitle} (${fullDoc.packagePrice})

JOIN YOUR VIDEO CONSULTATION:
🔗 Click to join video call: ${meetUrl}

---------------------------------------
NEED A DIFFERENT TIME OR DATE?
If this date or time is inconvenient for you, simply reply to this email or send us a message on WhatsApp (+91 98861 71251 / +65 9472 2830) to advise us of other suitable timings. We will happily adjust your session slot!

100% FEE CREDIT POLICY:
Remember, 100% of your consulting fee is credited back as a direct discount when you book your Singapore & Malaysia tour packages, attraction tickets, or hotels with Flying Wonders!

EXPLORE FLYING WONDERS TRAVEL UTILITIES & SERVICES:
• Live Travel Tools & Visa Checker: https://flyingwonders.net/travel-tools
• Singapore Attractions Portal: https://flyingwonders.net/singapore-attractions
• AI Travel Itinerary Planner: https://flyingwonders.net/ai-planner
• B2B Services Catalog: https://flyingwonders.net/services-catalog

We look forward to meeting you online and crafting your dream journey!

Warm regards,
Flying Wonders Travel Consulting Team
Singapore Desk: +65 9472 2830 | India Desk: +91 98861 71251
Website: https://flyingwonders.net
            `
          })
        })
      } catch (emailErr) {
        console.error('Failed to send customer confirmation email:', emailErr)
      }
    }

    return NextResponse.json({ success: true, booking: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
