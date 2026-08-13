import { NextResponse } from 'next/server'

// Offline Fallback Visa Matrix for key passports into SE Asia & East Asia destinations
const FALLBACK_VISA_MATRIX: Record<string, Record<string, any>> = {
  // Passports from INDIA (IN)
  IN: {
    SG: { visa: 'visa required', dur: 30, admission: 'Online eVisa Required via Authorized Agent', evisaLink: 'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements', infoLink: 'https://eservices.ica.gov.sg' },
    MY: { visa: 'visa free', dur: 30, admission: 'Visa Free Entry (Until 31 Dec 2026)', infoLink: 'https://imigresen-online.imi.gov.my/mdac/main' },
    TH: { visa: 'visa free', dur: 60, admission: 'Visa Free Entry (60 Days)', evisaLink: 'https://www.thaievisa.go.th/' },
    ID: { visa: 'visa on arrival', dur: 30, admission: 'e-VOA or On Arrival at Airport (IDR 500,000)', evisaLink: 'https://molina.imigrasi.go.id/' },
    JP: { visa: 'visa required', dur: 15, admission: 'e-Visa Application Required', evisaLink: 'https://www.japan-evisa.mofa.go.jp/' },
    AE: { visa: 'visa on arrival', dur: 14, admission: 'Visa on Arrival if holding US/UK/EU visa, else e-Visa Required' },
  },
  // Passports from CHINA (CN)
  CN: {
    SG: { visa: 'visa free', dur: 30, admission: '30-Day Mutual Visa Exemption Agreement' },
    MY: { visa: 'visa free', dur: 30, admission: '30-Day Visa Free Entry' },
    TH: { visa: 'visa free', dur: 60, admission: '60-Day Visa Free Entry' },
    ID: { visa: 'visa on arrival', dur: 30, admission: 'e-VOA or Border Purchase' },
    JP: { visa: 'visa required', dur: 15, admission: 'Individual Tourist Visa Required' },
  },
  // Passports from UNITED STATES (US), UNITED KINGDOM (GB), AUSTRALIA (AU)
  US: {
    SG: { visa: 'visa free', dur: 90, admission: 'Visa Free Entry (90 Days)' },
    MY: { visa: 'visa free', dur: 90, admission: 'Visa Free Entry (90 Days)' },
    TH: { visa: 'visa free', dur: 60, admission: 'Visa Free Entry (60 Days)' },
    ID: { visa: 'visa on arrival', dur: 30, admission: 'e-VOA or Border Purchase' },
    JP: { visa: 'visa free', dur: 90, admission: 'Visa Free Entry (90 Days)' },
  },
  GB: {
    SG: { visa: 'visa free', dur: 90, admission: 'Visa Free Entry (90 Days)' },
    MY: { visa: 'visa free', dur: 90, admission: 'Visa Free Entry (90 Days)' },
    TH: { visa: 'visa free', dur: 60, admission: 'Visa Free Entry (60 Days)' },
    ID: { visa: 'visa on arrival', dur: 30, admission: 'e-VOA or Border Purchase' },
    JP: { visa: 'visa free', dur: 90, admission: 'Visa Free Entry (90 Days)' },
  },
  AU: {
    SG: { visa: 'visa free', dur: 90, admission: 'Visa Free Entry (90 Days)' },
    MY: { visa: 'visa free', dur: 90, admission: 'Visa Free Entry (90 Days)' },
    TH: { visa: 'visa free', dur: 60, admission: 'Visa Free Entry (60 Days)' },
    ID: { visa: 'visa on arrival', dur: 30, admission: 'e-VOA or Border Purchase' },
    JP: { visa: 'visa free', dur: 90, admission: 'Visa Free Entry (90 Days)' },
  },
  // Passports from MALAYSIA (MY)
  MY: {
    SG: { visa: 'visa free', dur: 30, admission: 'Visa Free Entry (SG Arrival Card Required)' },
    TH: { visa: 'visa free', dur: 60, admission: 'Visa Free Border Crossing' },
    ID: { visa: 'visa free', dur: 30, admission: 'Visa Free ASEAN Entry' },
    JP: { visa: 'visa free', dur: 90, admission: 'Visa Free Entry (90 Days)' },
  },
}

export async function POST(req: Request) {
  try {
    const { passport, destination } = await req.json()

    if (!passport || !destination) {
      return NextResponse.json({ error: 'passport and destination country codes are required.' }, { status: 400 })
    }

    const passportCode = passport.toUpperCase()
    const destinationCode = destination.toUpperCase()
    const apiKey = process.env.DOINEEDVISA_API_KEY

    // If API Key exists, attempt live API call
    if (apiKey) {
      try {
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

        if (response.ok) {
          const raw = await response.json()
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
            source: 'DoINeedVisa API'
          }

          return NextResponse.json({ success: true, data: normalized })
        }
      } catch (e) {
        console.warn('DoINeedVisa live API call failed, using built-in fallback dataset.')
      }
    }

    // ══ FALLBACK OFFLINE LOOKUP (No API key required) ══
    const fallbackMatch = FALLBACK_VISA_MATRIX[passportCode]?.[destinationCode]

    if (fallbackMatch) {
      return NextResponse.json({
        success: true,
        data: {
          ...fallbackMatch,
          passport_validity: 'Minimum 6 months from entry date',
          source: 'Built-in Verification Database'
        }
      })
    }

    // Default Fallback if country pair is not in matrix
    const defaultFallback = {
      visa: 'visa check required',
      dur: 30,
      admission: 'Please verify with official embassy portal prior to travel',
      infoLink: destinationCode === 'SG' ? 'https://eservices.ica.gov.sg' : destinationCode === 'MY' ? 'https://imigresen-online.imi.gov.my/mdac/main' : 'https://www.thaievisa.go.th/',
      source: 'Default Travel Guidance'
    }

    return NextResponse.json({ success: true, data: defaultFallback })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unexpected error fetching visa requirements.' },
      { status: 500 }
    )
  }
}
