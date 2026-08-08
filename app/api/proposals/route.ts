import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../sanity/env'

export const dynamic = 'force-dynamic'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// Helper to generate format: FW-2026-XXXX or FW-TMP-XXXX for template-based quotes
function generateProposalNumber(isTemplateBased = false) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return isTemplateBased ? `FW-TMP-${suffix}` : `FW-2026-${suffix}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      isTemplateBased,
      templateName,
      agentEmail,
      guestName,
      adults,
      kids,
      nights,
      arrivalDate,
      hotelRequired,
      hotelName,
      roomType,
      roomCount,
      supplementType,
      supplementCount,
      customHotelEnabled,
      customHotelPrice,
      customHotelSuppCost,
      miscCostPerPerson,
      miscNotes,
      costBreakdown,
      itinerary,
    } = body

    // 1. Find the B2B agent reference using email
    let agentRef = undefined
    if (agentEmail) {
      const agent = await writeClient.fetch(`*[_type == "b2bAgent" && email == $agentEmail][0]`, { agentEmail })
      if (agent) {
        agentRef = {
          _type: 'reference',
          _ref: agent._id,
        }
      }
    }

    // 2. Check if proposalNumber already exists (retaining same proposal number on edits)
    let proposalNumber = body.proposalNumber
    let isUpdate = false

    if (proposalNumber) {
      const existing = await writeClient.fetch(`*[_type == "proposal" && proposalNumber == $proposalNumber][0]`, { proposalNumber })
      if (existing) {
        isUpdate = true
        await writeClient.patch(existing._id).set({
          guestName: guestName || existing.guestName,
          adults: Number(adults) || existing.adults,
          kids: Number(kids) || existing.kids,
          nights: Number(nights) || existing.nights,
          arrivalDate: arrivalDate || existing.arrivalDate,
          hotelRequired: hotelRequired !== undefined ? !!hotelRequired : existing.hotelRequired,
          hotelName: hotelName || existing.hotelName,
          roomType: roomType || existing.roomType,
          roomCount: Number(roomCount) || existing.roomCount,
          supplementType: supplementType || existing.supplementType,
          supplementCount: Number(supplementCount) || existing.supplementCount,
          customHotelEnabled: customHotelEnabled !== undefined ? !!customHotelEnabled : existing.customHotelEnabled,
          customHotelPrice: Number(customHotelPrice) || existing.customHotelPrice,
          customHotelSuppCost: Number(customHotelSuppCost) || existing.customHotelSuppCost,
          miscCostPerPerson: miscCostPerPerson !== undefined ? Number(miscCostPerPerson) : existing.miscCostPerPerson,
          miscNotes: miscNotes !== undefined ? (miscNotes || '') : existing.miscNotes,
          costBreakdown: {
            roomCostTotal: Number(costBreakdown?.roomCostTotal) || 0,
            suppCostTotal: Number(costBreakdown?.suppCostTotal) || 0,
            transportTotal: Number(costBreakdown?.transportTotal) || 0,
            attractionTotal: Number(costBreakdown?.attractionTotal) || 0,
            mealTotal: Number(costBreakdown?.mealTotal) || 0,
            guideTotal: Number(costBreakdown?.guideTotal) || 0,
            netCost: Number(costBreakdown?.netCost) || 0,
            totalClientPrice: Number(costBreakdown?.totalClientPrice) || 0,
            totalClientPriceINR: Number(costBreakdown?.totalClientPriceINR) || 0,
            adultQuote: Number(costBreakdown?.adultQuote) || 0,
            childQuote: Number(costBreakdown?.childQuote) || 0,
          },
          itinerary: JSON.stringify(itinerary || []),
        }).commit()

        return NextResponse.json({
          success: true,
          proposalNumber: existing.proposalNumber,
          proposalId: existing._id,
          updated: true,
        })
      }
    }

    if (!proposalNumber) {
      proposalNumber = generateProposalNumber(!!isTemplateBased)
    }

    // 3. Create new document in Sanity
    const doc = await writeClient.create({
      _type: 'proposal',
      proposalNumber,
      isTemplateBased: !!isTemplateBased,
      templateName: templateName || '',
      agent: agentRef,
      guestName: guestName || '',
      adults: Number(adults) || 2,
      kids: Number(kids) || 0,
      nights: Number(nights) || 3,
      arrivalDate: arrivalDate || '',
      hotelRequired: !!hotelRequired,
      hotelName: hotelName || '',
      roomType: roomType || '',
      roomCount: Number(roomCount) || 0,
      supplementType: supplementType || '',
      supplementCount: Number(supplementCount) || 0,
      customHotelEnabled: !!customHotelEnabled,
      customHotelPrice: Number(customHotelPrice) || 0,
      customHotelSuppCost: Number(customHotelSuppCost) || 0,
      miscCostPerPerson: Number(miscCostPerPerson) || 0,
      miscNotes: miscNotes || '',
      status: 'pending',
      costBreakdown: {
        roomCostTotal: Number(costBreakdown?.roomCostTotal) || 0,
        suppCostTotal: Number(costBreakdown?.suppCostTotal) || 0,
        transportTotal: Number(costBreakdown?.transportTotal) || 0,
        attractionTotal: Number(costBreakdown?.attractionTotal) || 0,
        mealTotal: Number(costBreakdown?.mealTotal) || 0,
        guideTotal: Number(costBreakdown?.guideTotal) || 0,
        netCost: Number(costBreakdown?.netCost) || 0,
        totalClientPrice: Number(costBreakdown?.totalClientPrice) || 0,
        totalClientPriceINR: Number(costBreakdown?.totalClientPriceINR) || 0,
        adultQuote: Number(costBreakdown?.adultQuote) || 0,
        childQuote: Number(costBreakdown?.childQuote) || 0,
      },
      itinerary: JSON.stringify(itinerary || []),
    })

    return NextResponse.json({
      success: true,
      proposalNumber: doc.proposalNumber,
      proposalId: doc._id,
    })
  } catch (err: any) {
    console.error('Failed to create proposal:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const number = searchParams.get('number')
    const listAll = searchParams.get('listAll') === 'true'
    const agentEmail = searchParams.get('agentEmail')

    // If listing all/own proposals
    if (listAll || agentEmail) {
      let query = `*[_type == "proposal"]`
      const params: any = {}

      // If not admin, restrict to their email
      if (agentEmail && agentEmail.toLowerCase() !== 'info.flyingwonders@gmail.com') {
        query = `*[_type == "proposal" && agent->email == $agentEmail]`
        params.agentEmail = agentEmail
      }

      query += ` | order(_createdAt desc) {
        _id,
        _createdAt,
        _updatedAt,
        proposalNumber,
        guestName,
        nights,
        adults,
        kids,
        arrivalDate,
        hotelName,
        roomType,
        status,
        totalClientPrice,
        costBreakdown,
        itinerary,
        agent->{
          agentName,
          companyName,
          email
        }
      }`

      const list = await writeClient.fetch(query, params)
      return NextResponse.json({ success: true, list })
    }

    if (!number) {
      return NextResponse.json({ error: 'Proposal number required' }, { status: 400 })
    }

    const proposal = await writeClient.fetch(
      `*[_type == "proposal" && proposalNumber == $number][0]{
        ...,
        agent->{
          agentName,
          companyName,
          email,
          phone
        }
      }`,
      { number }
    )

    if (!proposal) {
      return NextResponse.json({ found: false })
    }

    return NextResponse.json({
      found: true,
      proposal: {
        ...proposal,
        itinerary: proposal.itinerary ? JSON.parse(proposal.itinerary) : [],
      },
    })
  } catch (err: any) {
    console.error('Failed to retrieve proposal:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
