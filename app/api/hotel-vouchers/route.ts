import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../sanity/env'

export const dynamic = 'force-dynamic'

function getWriteClient() {
  const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN
  return createClient({
    apiVersion,
    dataset,
    projectId,
    token,
    useCdn: false,
  })
}

function getReadClient() {
  return createClient({
    apiVersion,
    dataset,
    projectId,
    useCdn: false,
  })
}

function generateVoucherNumber() {
  const currentYear = new Date().getFullYear()
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `FW-HTL-${currentYear}-${suffix}`
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const number = searchParams.get('number')
    const id = searchParams.get('id')
    const search = searchParams.get('search')
    const client = getReadClient()

    if (number) {
      const voucher = await client.fetch(
        `*[_type == "hotelVoucher" && voucherNumber == $number][0]`,
        { number }
      )
      if (!voucher) {
        return NextResponse.json({ success: false, error: 'Voucher not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, voucher })
    }

    if (id) {
      const voucher = await client.fetch(
        `*[_type == "hotelVoucher" && _id == $id][0]`,
        { id }
      )
      if (!voucher) {
        return NextResponse.json({ success: false, error: 'Voucher not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, voucher })
    }

    // List all
    let query = `*[_type == "hotelVoucher"] | order(_createdAt desc) [0...100]`
    if (search) {
      query = `*[_type == "hotelVoucher" && (voucherNumber match $s || hotelName match $s || groupName match $s)] | order(_createdAt desc) [0...100]`
    }

    const vouchers = await client.fetch(query, { s: `*${search || ''}*` })
    return NextResponse.json({ success: true, vouchers })
  } catch (error: any) {
    console.error('Error fetching hotel vouchers:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const writeClient = getWriteClient()
    const body = await req.json()

    const {
      _id,
      voucherNumber,
      groupName,
      hotelName,
      hotelAddress,
      hotelPhone,
      hotelEmail,
      starRating,
      hotelConfirmationNo,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      nights,
      mealPlan,
      bookingStatus,
      paymentStatus,
      rooms,
      specialRequests,
      proposalNumber,
      agentName,
      agentEmail,
      agentPhone,
    } = body

    if (!hotelName) {
      return NextResponse.json({ success: false, error: 'Hotel Name is required' }, { status: 400 })
    }

    const assignedNumber = voucherNumber || generateVoucherNumber()

    const docPayload: any = {
      _type: 'hotelVoucher',
      voucherNumber: assignedNumber,
      groupName: groupName || '',
      hotelName,
      hotelAddress: hotelAddress || '',
      hotelPhone: hotelPhone || '',
      hotelEmail: hotelEmail || '',
      starRating: starRating || '4-Star',
      hotelConfirmationNo: hotelConfirmationNo || '',
      checkInDate: checkInDate || '',
      checkInTime: checkInTime || '15:00 hrs',
      checkOutDate: checkOutDate || '',
      checkOutTime: checkOutTime || '11:00 hrs',
      nights: Number(nights) || 1,
      mealPlan: mealPlan || 'Daily Buffet Breakfast (CP)',
      bookingStatus: bookingStatus || 'Confirmed & Guaranteed',
      paymentStatus: paymentStatus || 'Prepaid / Billed to Flying Wonders DMC',
      rooms: Array.isArray(rooms) ? rooms : [],
      specialRequests: specialRequests || '',
      proposalNumber: proposalNumber || '',
      agentName: agentName || '',
      agentEmail: agentEmail || '',
      agentPhone: agentPhone || '',
    }

    let result
    if (_id) {
      result = await writeClient.createOrReplace({
        ...docPayload,
        _id,
      })
    } else {
      result = await writeClient.create(docPayload)
    }

    return NextResponse.json({ success: true, voucher: result })
  } catch (error: any) {
    console.error('Error saving hotel voucher:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to save voucher' }, { status: 500 })
  }
}
