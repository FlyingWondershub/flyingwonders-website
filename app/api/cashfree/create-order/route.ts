import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { amount, customerId, customerName, customerEmail, customerPhone } = body

    if (!amount || !customerId || !customerPhone) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 })
    }

    const env = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX'
    const appId = process.env.CASHFREE_APP_ID
    const secretKey = process.env.CASHFREE_SECRET_KEY

    if (!appId || !secretKey) {
      console.error('Cashfree credentials missing in environment variables.')
      return NextResponse.json({ success: false, error: 'Payment gateway is not configured properly.' }, { status: 500 })
    }

    const baseUrl = env === 'PRODUCTION' 
      ? 'https://api.cashfree.com/pg/orders' 
      : 'https://sandbox.cashfree.com/pg/orders'

    const payload = {
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: customerName || 'Valued Customer',
        customer_email: customerEmail || 'no-email@flyingwonders.com',
        customer_phone: customerPhone
      },
      order_meta: {
        // Not strict return URL needed since we're using seamless JS SDK, but good to have
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flyingwonders.com'}/pay?order_id={order_id}`
      }
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Cashfree Create Order Error:', data)
      return NextResponse.json({ success: false, error: data.message || 'Payment initiation failed' }, { status: 500 })
    }

    // Success! Return the payment_session_id to the frontend
    return NextResponse.json({ 
      success: true, 
      paymentSessionId: data.payment_session_id,
      orderId: data.order_id 
    })
  } catch (error: any) {
    console.error('Cashfree API Route Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
