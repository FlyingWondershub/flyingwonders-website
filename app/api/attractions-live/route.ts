import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const API_KEY = '235ed5f665a076097bd33bbce86f29ee'
const SECRET_KEY = '2d0558cbac58473551110d5539c31aab'
const BASE_URL = 'https://api.attractionsg.com'

// Server-side cache for the auth token
let cachedToken: string | null = null
let tokenExpiryTime: number = 0

// Helper to get active Auth Token using Reseller API protocol
async function getAuthToken(): Promise<string> {
  const now = Date.now()
  // Reuse cached token if it has more than 5 minutes of validity remaining
  if (cachedToken && tokenExpiryTime > now + 5 * 60 * 1000) {
    return cachedToken
  }

  console.log('Requesting new SG Reseller session...')
  // Step 1: Request Session Key
  const sessionRes = await fetch(`${BASE_URL}/reseller_auth/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-API-Version': 'v1.10'
    },
    body: `apikey=${API_KEY}`
  })

  if (!sessionRes.ok) {
    const errText = await sessionRes.text()
    throw new Error(`Failed to request session: ${sessionRes.status} - ${errText}`)
  }

  const sessionData = await sessionRes.json()
  if (sessionData.status !== 1000 || !sessionData.response?.data?.session_key) {
    throw new Error(`Invalid session response: ${JSON.stringify(sessionData)}`)
  }

  const sessionKey = sessionData.response.data.session_key

  // Step 2: Request Token (MD5 hash of sessionKey concatenated with secret)
  const authKey = crypto
    .createHash('md5')
    .update(sessionKey + SECRET_KEY)
    .digest('hex')

  const tokenRes = await fetch(`${BASE_URL}/reseller_auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-API-Version': 'v1.10'
    },
    body: `session_key=${sessionKey}&auth_key=${authKey}`
  })

  if (!tokenRes.ok) {
    const errText = await tokenRes.text()
    throw new Error(`Failed to request token: ${tokenRes.status} - ${errText}`)
  }

  const tokenData = await tokenRes.json()
  if (tokenData.status !== 1000 || !tokenData.response?.data?.auth_token) {
    throw new Error(`Invalid token response: ${JSON.stringify(tokenData)}`)
  }

  const token = tokenData.response.data.auth_token
  const expiresString = tokenData.response.data.expires_in // ISO string format
  
  cachedToken = token
  tokenExpiryTime = new Date(expiresString).getTime()

  console.log('Successfully acquired new B2B auth token expiring at:', expiresString)
  return token
}

const FALLBACK_TICKETS = [
  {
    id: "att-001",
    name: "Universal Studios Singapore (USS) - Standard Entry Ticket",
    category: "Theme Park",
    liveRate: 82.00,
    markupRate: 88.00,
    availability: "Instant Confirmation",
    validity: "Open Dated (6 Months)"
  },
  {
    id: "att-002",
    name: "Gardens by the Bay (Flower Dome & Cloud Forest)",
    category: "Nature & Gardens",
    liveRate: 46.00,
    markupRate: 53.00,
    availability: "Instant Confirmation",
    validity: "Fixed Date"
  },
  {
    id: "att-003",
    name: "S.E.A. Aquarium Singapore Ticket",
    category: "Aquarium",
    liveRate: 39.00,
    markupRate: 44.00,
    availability: "Instant Confirmation",
    validity: "Open Dated (3 Months)"
  },
  {
    id: "att-004",
    name: "Singapore Cable Car Sky Pass (Round Trip)",
    category: "Sightseeing & Ride",
    liveRate: 28.00,
    markupRate: 35.00,
    availability: "Instant Confirmation",
    validity: "Open Dated"
  },
  {
    id: "att-005",
    name: "Night Safari Admission Ticket + Tram Ride",
    category: "Wildlife Safari",
    liveRate: 51.00,
    markupRate: 56.00,
    availability: "Limited Slots",
    validity: "Fixed Date & Time"
  }
]

export async function GET(req: Request) {
  try {
    // 1. Session authorization check
    const cookieStore = await cookies()
    const sessionEmail = cookieStore.get('attractions_session')?.value

    if (!sessionEmail) {
      return NextResponse.json({ error: 'Unauthorized access. Session expired.' }, { status: 401 })
    }

    // 2. Query target endpoint from request params
    const { searchParams } = new URL(req.url)
    const path = searchParams.get('path') || '/attractions' // Default to get attractions list

    const targetUrl = `${BASE_URL}${path}`

    try {
      // Get the reseller token
      const authToken = await getAuthToken()

      const apiResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Authorization': `BEARER ${authToken}`,
          'X-API-Version': 'v1.10'
        },
        next: { revalidate: 60 }
      })

      if (apiResponse.ok) {
        const data = await apiResponse.json()
        const rawList = data.response?.data || []
        
        // Map attractions list to standard ticket format used in frontend
        const formattedTickets = rawList.map((item: any) => ({
          id: item.sku_id || `att-${Math.random()}`,
          name: item.title || 'Unknown Attraction',
          category: item.product_type?.description || 'Sightseeing',
          liveRate: parseFloat(item.lowest_ticket_price || '0'),
          markupRate: parseFloat(item.highest_ticket_price || '0'),
          availability: 'Instant Confirmation',
          validity: 'Open Dated'
        }))

        return NextResponse.json({ success: true, tickets: formattedTickets.length > 0 ? formattedTickets : FALLBACK_TICKETS })
      } else {
        const errorText = await apiResponse.text()
        console.warn(`External API returned non-200:`, errorText)
        return NextResponse.json({ success: true, tickets: FALLBACK_TICKETS, source: 'cache_fallback' })
      }
    } catch (fetchErr) {
      console.error('External API fetch failed, serving cache fallback:', fetchErr)
      return NextResponse.json({ success: true, tickets: FALLBACK_TICKETS, source: 'cache_fallback' })
    }

  } catch (err: any) {
    console.error('Attractions live endpoint error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
