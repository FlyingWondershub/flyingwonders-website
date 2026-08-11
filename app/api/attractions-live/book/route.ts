import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const API_KEY = process.env.CEBU_API_KEY || '235ed5f665a076097bd33bbce86f29ee'
const SECRET_KEY = process.env.CEBU_SECRET_KEY || '2d0558cbac58473551110d5539c31aab'
const BASE_URL = process.env.CEBU_API_PROXY_URL || 'http://129.159.237.41/cebu'

// Helper to get active Auth Token using Reseller API protocol
async function getAuthToken(): Promise<string> {
  const sessionRes = await fetch(`${BASE_URL}/reseller_auth/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-API-Version': 'v1.10'
    },
    body: `apikey=${API_KEY}`
  })

  if (!sessionRes.ok) throw new Error('Failed to start reseller auth session.')
  const sessionData = await sessionRes.json()
  if (sessionData.status !== 1000 || !sessionData.response?.data?.session_key) {
    throw new Error(sessionData.message || `Supplier auth error (${sessionData.status})`)
  }
  const sessionKey = sessionData.response.data.session_key

  const authKey = crypto.createHash('md5').update(sessionKey + SECRET_KEY).digest('hex')

  const tokenRes = await fetch(`${BASE_URL}/reseller_auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-API-Version': 'v1.10'
    },
    body: `session_key=${sessionKey}&auth_key=${authKey}`
  })

  const tokenData = await tokenRes.json()
  return tokenData.response.data.auth_token
}

export async function POST(req: Request) {
  try {
    // 1. Session check
    const cookieStore = await cookies()
    const sessionEmail = cookieStore.get('attractions_session')?.value
    if (!sessionEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skuId, quantity, bookingDate, customerName, customerEmail, customerPhone, ticketPrice } = await req.json()

    if (!skuId || !quantity || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    // Default to today's date YYYY-MM-DD for open date tickets if date not selected
    const effectiveDate = bookingDate || new Date().toISOString().split('T')[0]

    const token = await getAuthToken()
    const trackingNo = `FW-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`

    // Step A: Check availability
    const checkBody = `item_sku_id_1=${skuId}&item_quantity_1=${quantity}&item_booking_date_1=${effectiveDate}`
    const checkAvailabilityRes = await fetch(`${BASE_URL}/order/check_availability`, {
      method: 'POST',
      headers: {
        'Authorization': `BEARER ${token}`,
        'X-API-Version': 'v1.10',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: checkBody
    })

    const checkData = await checkAvailabilityRes.json()
    if (checkData.status !== 1000) {
      return NextResponse.json({ error: checkData.message || 'Item unavailable for selected date.' }, { status: 400 })
    }

    // Step B: Create Order (Status will be pending)
    const totalAmount = (parseFloat(ticketPrice || '0') * parseInt(quantity)).toFixed(2)
    const createOrderRes = await fetch(`${BASE_URL}/order/create`, {
      method: 'POST',
      headers: {
        'Authorization': `BEARER ${token}`,
        'X-API-Version': 'v1.10',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `tracking_no=${trackingNo}&customer_name=${encodeURIComponent(customerName)}&customer_email=${customerEmail}&customer_mobile=${encodeURIComponent(customerPhone)}&item_sku_id_1=${skuId}&item_quantity_1=${quantity}&item_booking_date_1=${effectiveDate}&total_amount=${totalAmount}&use_credits=1&email_voucher=1`
    })

    const createData = await createOrderRes.json()
    if (createData.status !== 1000 || !createData.data?.order_ref_id) {
      return NextResponse.json({ error: createData.message || 'Failed to create order.' }, { status: 400 })
    }

    const orderRefId = createData.data.order_ref_id

    // Step C: Update Order to Pay (Triggers voucher generation)
    const payRes = await fetch(`${BASE_URL}/order/update`, {
      method: 'POST',
      headers: {
        'Authorization': `BEARER ${token}`,
        'X-API-Version': 'v1.10',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `order_ref_id=${orderRefId}&action=pay`
    })

    const payData = await payRes.json()
    if (payData.status !== 1000) {
      return NextResponse.json({ error: 'Payment processing failed. Checking status...' })
    }

    // Step D: Retrieve Order Details (For Voucher PDF download links)
    const detailsRes = await fetch(`${BASE_URL}/order/details?order_ref_id=${orderRefId}`, {
      method: 'GET',
      headers: {
        'Authorization': `BEARER ${token}`,
        'X-API-Version': 'v1.10'
      }
    })

    const detailsData = await detailsRes.json()
    const vouchers = detailsData.data?.vouchers || []

    return NextResponse.json({
      success: true,
      orderRefId,
      trackingNo,
      total: totalAmount,
      status: 'confirmed',
      vouchers: vouchers.map((v: any) => ({
        code: v.code,
        downloadUrl: v.voucher // PDF download URL
      }))
    })

  } catch (err: any) {
    console.error('B2B Booking process failed:', err)
    return NextResponse.json({ error: err.message || 'Internal order process error' }, { status: 500 })
  }
}
