import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { passport, destination } = await req.json()

    if (!passport || !destination) {
      return NextResponse.json({ error: 'passport and destination country codes are required.' }, { status: 400 })
    }

    const apiKey = process.env.DOINEEDVISA_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Visa API credentials not configured.' }, { status: 500 })
    }

    const passportCode = passport.toUpperCase()
    const destinationCode = destination.toUpperCase()

    // DoINeedVisa: GET https://api.doineedvisa.to/{destination}?from={passport}
    // Accepts ISO alpha-2 codes (e.g. MY, SG, IN, JP)
    const response = await fetch(
      `https://api.doineedvisa.to/${destinationCode}?from=${passportCode}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: `Visa data unavailable (${response.status}). Please try again later.` },
        { status: response.status }
      )
    }

    const raw = await response.json()

    // Normalize DoINeedVisa response fields to our display format
    // raw.requirement values: visa_free | visa_on_arrival | eta | e_visa | visa_required | no_admission | citizen
    const requirementMap: Record<string, string> = {
      visa_free: 'visa free',
      visa_on_arrival: 'visa on arrival',
      eta: 'eta',
      e_visa: 'e-visa',
      visa_required: 'visa required',
      no_admission: 'no admission',
      citizen: 'citizen'
    }

    const normalized = {
      visa: requirementMap[raw.requirement] || raw.requirement || 'Unknown',
      dur: raw.allowed_stay_days ?? null,
      admission:
        raw.requirement === 'visa_free' ? 'Visa Free Entry' :
        raw.requirement === 'visa_on_arrival' ? 'Obtainable at Border' :
        raw.requirement === 'e_visa' || raw.requirement === 'eta' ? 'Online Application Required' :
        raw.requirement === 'no_admission' ? 'Entry Not Permitted' : null,
      passport_validity: null,
      currency: null,
      notes: null,
      evisaLink: raw.evisa_link || null,
      infoLink: raw.visa_info_link || null,
      lastVerified: raw.last_verified || null,
      source: 'DoINeedVisa'
    }

    return NextResponse.json({ success: true, data: normalized })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unexpected error fetching visa requirements.' },
      { status: 500 }
    )
  }
}
