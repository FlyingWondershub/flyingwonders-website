import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { passport, destination } = await req.json()

    if (!passport || !destination) {
      return NextResponse.json({ error: 'passport and destination country codes are required.' }, { status: 400 })
    }

    const apiKey = process.env.TRAVEL_BUDDY_API_KEY
    const apiHost = process.env.TRAVEL_BUDDY_API_HOST

    if (!apiKey || !apiHost) {
      return NextResponse.json({ error: 'Visa API credentials not configured.' }, { status: 500 })
    }

    const encodedParams = new URLSearchParams()
    encodedParams.set('passport', passport.toUpperCase())
    encodedParams.set('destination', destination.toUpperCase())

    const response = await fetch(`https://${apiHost}/v2/visa/check`, {
      method: 'POST',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: encodedParams
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json({ error: `API Error: ${response.status} - ${errText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error fetching visa requirements.' }, { status: 500 })
  }
}
