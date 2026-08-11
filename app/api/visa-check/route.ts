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

    const passportUpper = passport.toUpperCase()
    const destinationUpper = destination.toUpperCase()

    // --- Attempt 1: VisaRequirements endpoint (richer, more accurate data) ---
    const encodedParams = new URLSearchParams()
    encodedParams.set('passport', passportUpper)
    encodedParams.set('destination', destinationUpper)

    const reqResponse = await fetch(`https://${apiHost}/v2/visa/requirements`, {
      method: 'POST',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: encodedParams
    })

    if (reqResponse.ok) {
      const reqData = await reqResponse.json()

      // Normalize — VisaRequirements returns an object or array depending on version
      const entry = Array.isArray(reqData) ? reqData[0] : reqData

      if (entry) {
        // Map various field names the API may use
        const normalized = {
          visa: entry.visa_type || entry.visa || entry.requirement || entry.type || null,
          dur: entry.duration || entry.max_stay || entry.dur || null,
          admission: entry.admission || entry.admissions || null,
          passport_validity: entry.passport_validity || entry.passportValidity || null,
          currency: entry.currency || null,
          notes: entry.notes || entry.note || entry.information || null,
          source: 'VisaRequirements'
        }

        if (normalized.visa) {
          return NextResponse.json({ success: true, data: normalized })
        }
      }
    }

    // --- Fallback: visa/check endpoint ---
    const checkResponse = await fetch(`https://${apiHost}/v2/visa/check`, {
      method: 'POST',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: encodedParams
    })

    if (!checkResponse.ok) {
      const errText = await checkResponse.text()
      return NextResponse.json({ error: `API Error: ${checkResponse.status} - ${errText}` }, { status: checkResponse.status })
    }

    const checkData = await checkResponse.json()
    return NextResponse.json({ success: true, data: { ...checkData, source: 'visa/check' } })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error fetching visa requirements.' }, { status: 500 })
  }
}
