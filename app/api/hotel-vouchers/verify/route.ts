import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

export const dynamic = 'force-dynamic'

function getReadClient() {
  return createClient({
    apiVersion,
    dataset,
    projectId,
    useCdn: false,
  })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ref = searchParams.get('ref') || searchParams.get('number') || searchParams.get('id')

    if (!ref) {
      return NextResponse.json({ success: false, error: 'Verification reference missing' }, { status: 400 })
    }

    const client = getReadClient()
    const voucher = await client.fetch(
      `*[_type == "hotelVoucher" && (voucherNumber == $ref || _id == $ref)][0]`,
      { ref }
    )

    if (!voucher) {
      return NextResponse.json({ success: false, error: 'No matching accommodation voucher found for this reference.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      verified: true,
      verifiedAt: new Date().toISOString(),
      issuer: 'Flying Wonders Pvt Ltd (CIN: U63090KA2016PTC095564)',
      voucher: {
        voucherNumber: voucher.voucherNumber,
        groupName: voucher.groupName,
        hotelName: voucher.hotelName,
        hotelAddress: voucher.hotelAddress,
        hotelPhone: voucher.hotelPhone,
        hotelEmail: voucher.hotelEmail,
        starRating: voucher.starRating,
        hotelConfirmationNo: voucher.hotelConfirmationNo,
        checkInDate: voucher.checkInDate,
        checkInTime: voucher.checkInTime,
        checkOutDate: voucher.checkOutDate,
        checkOutTime: voucher.checkOutTime,
        nights: voucher.nights,
        mealPlan: voucher.mealPlan,
        bookingStatus: voucher.bookingStatus || 'Confirmed & Guaranteed',
        paymentStatus: voucher.paymentStatus || 'Prepaid / Billed to Flying Wonders DMC',
        rooms: voucher.rooms || [],
        specialRequests: voucher.specialRequests || '',
        proposalNumber: voucher.proposalNumber || '',
        agentName: voucher.agentName || '',
        _createdAt: voucher._createdAt,
      },
    })
  } catch (error: any) {
    console.error('Error in voucher verification API:', error)
    return NextResponse.json({ success: false, error: error.message || 'Verification service error' }, { status: 500 })
  }
}
