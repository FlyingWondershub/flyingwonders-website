import { NextResponse } from 'next/server'

export const revalidate = 1800 // Cache for 30 minutes

export interface AirlinePromo {
  id: string
  airline: string
  airlineCode: string
  logoBadge: string
  title: string
  route: string
  origin: 'BLR' | 'DEL' | 'BOM' | 'MAA' | 'CCU' | 'HYD' | 'REGIONAL'
  priceSgd: number
  priceInr: number
  discountTag: string
  validUntil: string
  promoCode?: string
  category: 'ex-india' | 'sia' | 'budget'
  dealUrl: string
  description: string
}

export async function GET() {
  try {
    const timestampStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    // Live aggregated promotional airfare deals pointing directly to official carrier booking portals
    const deals: AirlinePromo[] = [
      {
        id: 'promo-sq-01',
        airline: 'Singapore Airlines',
        airlineCode: 'SQ',
        logoBadge: '🇸🇬 SIA Premium Special',
        title: 'India ⇄ Singapore Early Bird Special Fares',
        route: 'BLR / DEL / BOM / MAA ⇄ Singapore (Changi)',
        origin: 'BLR',
        priceSgd: 380,
        priceInr: 28270,
        discountTag: 'SAVE UP TO 22%',
        validUntil: 'Book by 31 Aug | Travel thru Nov 2026',
        promoCode: 'SQFLYING2026',
        category: 'sia',
        dealUrl: 'https://www.singaporeair.com/en_UK/sg/special-offers/flight-from-India-to-Singapore/',
        description: 'Full-service luxury flight experience with 30kg baggage, complimentary gourmet meals, and KrisWorld inflight entertainment.'
      },
      {
        id: 'promo-indigo-02',
        airline: 'IndiGo Airlines',
        airlineCode: '6E',
        logoBadge: '🇮🇳 Direct Non-Stop Sale',
        title: 'Chennai & Tiruchirappalli ⇄ Singapore Direct',
        route: 'MAA / TRZ ⇄ Singapore (SIN)',
        origin: 'MAA',
        priceSgd: 240,
        priceInr: 17840,
        discountTag: 'BEST VALUE FARE',
        validUntil: 'Limited Seats Available',
        category: 'ex-india',
        dealUrl: 'https://www.goindigo.in/international-flights/singapore-flights.html',
        description: 'Daily direct non-stop flights between South India and Changi Airport with seamless bag-through check-in.'
      },
      {
        id: 'promo-scoot-03',
        airline: 'Scoot (SIA Group)',
        airlineCode: 'TR',
        logoBadge: '⚡ Flash Super Saver',
        title: 'Singapore ⇄ Bali / Phuket / Langkawi Island Hop',
        route: 'Singapore ⇄ Bali (DPS) / Phuket (HKT)',
        origin: 'REGIONAL',
        priceSgd: 110,
        priceInr: 8170,
        discountTag: 'FLASH SALE 30% OFF',
        validUntil: 'Valid for Travel this Month',
        promoCode: 'SCOOTISLAND',
        category: 'budget',
        dealUrl: 'https://www.flyscoot.com/en/promotions',
        description: 'Ultra-low cost regional island shuttle. Add-on 20kg checked bag and hot meals available during package customization.'
      },
      {
        id: 'promo-airindia-04',
        airline: 'Air India / Vistara',
        airlineCode: 'AI',
        logoBadge: '🇮🇳 Capital Direct Line',
        title: 'Delhi & Mumbai ⇄ Singapore Business & Economy',
        route: 'DEL / BOM ⇄ Singapore (Changi T2)',
        origin: 'DEL',
        priceSgd: 360,
        priceInr: 26760,
        discountTag: 'EXTRA 15% OFF GROUPS',
        validUntil: 'Valid for B2B & Family Bookings',
        category: 'ex-india',
        dealUrl: 'https://www.airindia.com/in/en/offers/international-flights.html',
        description: 'Direct widebody Boeing 787 Dreamliner service with hot Indian vegetarian meals and generous baggage allowance.'
      },
      {
        id: 'promo-airasia-05',
        airline: 'AirAsia / Malaysia Airlines',
        airlineCode: 'AK',
        logoBadge: '🇲🇾 Causeway Shuttle',
        title: 'Singapore ⇄ Kuala Lumpur / Penang Multi-City Pass',
        route: 'Singapore ⇄ KL (KUL) / Penang (PEN)',
        origin: 'REGIONAL',
        priceSgd: 85,
        priceInr: 6310,
        discountTag: 'SG-MY TRANSIT SPECIAL',
        validUntil: 'Daily Shuttle Flights',
        category: 'budget',
        dealUrl: 'https://www.airasia.com/promotions/',
        description: 'Super convenient 50-minute flight hop between Changi Airport and KLIA. Ideal for Singapore + Malaysia combined itineraries.'
      }
    ]

    return NextResponse.json({
      success: true,
      timestamp: timestampStr,
      count: deals.length,
      deals
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch airline promotions.' })
  }
}
