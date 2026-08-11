import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const API_KEY = process.env.CEBU_API_KEY || '235ed5f665a076097bd33bbce86f29ee'
const SECRET_KEY = process.env.CEBU_SECRET_KEY || '2d0558cbac58473551110d5539c31aab'
const BASE_URL = process.env.CEBU_API_PROXY_URL || 'http://129.159.237.41/cebu'

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
    throw new Error(sessionData.message || `Supplier auth error (${sessionData.status})`)
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
        
        // Group each attraction with its full list of Adult & Child sub-tickets
        const attractionPromises = rawList.slice(0, 40).map(async (item: any) => {
          let subTickets: any[] = []
          let descText = item.description || ''
          let tncText = ''
          const imageUrl = item.images?.full || item.images?.thumb || '/images/logo.png'

          try {
            const detailRes = await fetch(`${BASE_URL}/attraction/details?sku_id=${item.sku_id}`, {
              method: 'GET',
              headers: {
                'Authorization': `BEARER ${authToken}`,
                'X-API-Version': 'v1.10'
              },
              next: { revalidate: 60 }
            })

            if (detailRes.ok) {
              const detailData = await detailRes.json()
              descText = detailData?.response?.data?.description || descText
              tncText = detailData?.response?.data?.tnc || ''
              const rawSub = detailData.response?.data?.tickets || []
              
              const subTicketPromises = rawSub.map(async (t: any) => {
                const isChild = (t.type || t.title || '').toLowerCase().includes('child')
                const isAdult = (t.type || t.title || '').toLowerCase().includes('adult')
                const badge = isChild ? '[CHILD]' : isAdult ? '[ADULT]' : '[TICKET]'

                const datePrice = (t.available_dates && t.available_dates.length > 0) ? parseFloat(t.available_dates[0].price || '0') : 0
                const netPrice = datePrice > 0 ? datePrice : parseFloat(t.price || t.original_price || item.lowest_ticket_price || '0')
                const retailPrice = parseFloat(t.retail_price || t.original_price || (netPrice > 0 ? netPrice * 1.25 : item.highest_ticket_price || '0'))

                const datesMap: { [dateStr: string]: { price: number; available: boolean; remaining: number } } = {}
                let remaining = t.remaining_stock ?? t.stock ?? t.remaining_quantity ?? t.available_quantity ?? 20
                let isSoldOut = t.is_sold_out === true || t.status === 'sold_out' || remaining === 0

                // Query live supplier availabilities endpoint for exact date stock
                try {
                  const availRes = await fetch(`${BASE_URL}/ticket/availabilities?sku_id=${t.sku_id || item.sku_id}`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `BEARER ${authToken}`,
                      'X-API-Version': 'v1.10'
                    },
                    next: { revalidate: 60 }
                  })

                  if (availRes.ok) {
                    const availData = await availRes.json()
                    const availMap = availData.response?.data || {}

                    let firstSlotQty: number | null = null
                    Object.keys(availMap).forEach(dateStr => {
                      const slots = availMap[dateStr]
                      if (Array.isArray(slots) && slots.length > 0) {
                        const slot = slots[0]
                        const availQty = slot.available_quantity ?? 0
                        const slotPrice = slot.price ?? netPrice

                        datesMap[dateStr] = {
                          price: slotPrice,
                          available: availQty > 0,
                          remaining: availQty
                        }

                        if (firstSlotQty === null) {
                          firstSlotQty = availQty
                        }
                      }
                    })

                    if (firstSlotQty !== null) {
                      remaining = firstSlotQty
                      isSoldOut = firstSlotQty === 0
                    }
                  }
                } catch (availErr) {
                  console.warn(`Availabilities lookup failed for ${t.sku_id}:`, availErr)
                }

                // Fallback using available_dates array if datesMap empty
                if (Object.keys(datesMap).length === 0 && t.available_dates && Array.isArray(t.available_dates)) {
                  t.available_dates.forEach((d: any) => {
                    if (d.date) {
                      datesMap[d.date] = {
                        price: parseFloat(d.price || netPrice.toString()),
                        available: d.available !== false,
                        remaining: d.stock ?? remaining
                      }
                    }
                  })
                }

                // Format validity text from booking_period for open date tickets
                const startDateStr = t.booking_period?.start_date ? new Date(t.booking_period.start_date.replace(' ', 'T')).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
                const endDateStr = t.booking_period?.end_date ? new Date(t.booking_period.end_date.replace(' ', 'T')).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
                const validityPeriodText = (startDateStr && endDateStr) ? `Valid From ${startDateStr} To ${endDateStr}` : ''

                return {
                  skuId: t.sku_id || item.sku_id,
                  typeTitle: `${t.type || t.title || item.title}`,
                  badgeLabel: badge,
                  price: netPrice,
                  retailPrice: retailPrice,
                  msp: t.minimum_selling_price ? parseFloat(t.minimum_selling_price) : null,
                  bookingType: (t.booking_type || '').toLowerCase().includes('open') ? 'open_date' : 'fixed_date',
                  validityPeriodText,
                  minQty: t.min_quantity || 1,
                  maxQty: t.max_quantity || 50,
                  remainingStock: remaining,
                  isSoldOut: isSoldOut,
                  availableDates: datesMap
                }
              })

              subTickets = await Promise.all(subTicketPromises)
            }
          } catch (e) {
            console.warn(`Error fetching sub-tickets for ${item.sku_id}:`, e)
          }

          // Fallback sub-ticket if none returned
          if (subTickets.length === 0) {
            subTickets = [{
              skuId: item.sku_id,
              typeTitle: `[TICKET] ${item.title}`,
              price: parseFloat(item.lowest_ticket_price || '0'),
              retailPrice: parseFloat(item.highest_ticket_price || '0'),
              bookingType: 'open_date',
              minQty: 1,
              maxQty: 50
            }]
          }

          return {
            id: item.sku_id || `att-${Math.random()}`,
            attractionSku: item.sku_id,
            name: item.title || 'Unknown Attraction',
            category: item.product_type?.description || 'Sightseeing',
            imageUrl,
            liveRate: parseFloat(item.lowest_ticket_price || '0'),
            markupRate: parseFloat(item.highest_ticket_price || '0'),
            availability: 'Instant Confirmation',
            validity: 'Fixed Date',
            description: descText,
            tnc: tncText,
            subTickets
          }
        })

        const attractions = await Promise.all(attractionPromises)

        return NextResponse.json({ success: true, tickets: attractions.length > 0 ? attractions : FALLBACK_TICKETS })
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
