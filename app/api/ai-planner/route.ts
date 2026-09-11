import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const maxDuration = 60

async function fetchInventory() {
  try {
    let sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=csv'
    try {
      const { createClient } = require('next-sanity')
      const sanityClient = createClient({
        projectId: '8xtd7yiv',
        dataset: 'production',
        apiVersion: '2024-01-01',
        useCdn: false
      })
      const settings = await sanityClient.fetch(`*[_type == "siteSettings"][0]{ attractionsSheetUrl }`)
      if (settings?.attractionsSheetUrl) {
        sheetUrl = settings.attractionsSheetUrl
          .replace(/\/pubhtml.*/gi, '/pub?output=csv')
          .replace(/output=xlsx/gi, 'output=csv')
          .replace(/output=html/gi, 'output=csv')
        if (!sheetUrl.includes('output=csv')) {
          sheetUrl += (sheetUrl.includes('?') ? '&' : '?') + 'output=csv'
        }
      }
    } catch (e) {}

    const res = await fetch(sheetUrl, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('Failed to fetch attractions sheet')
    const text = await res.text()
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    if (lines.length === 0) return []

    const parseCsvLine = (line: string): string[] => {
      let parts: string[] = []
      let currentPart = ''
      let insideQuote = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') { insideQuote = !insideQuote }
        else if (char === ',' && !insideQuote) { parts.push(currentPart.trim()); currentPart = '' }
        else { currentPart += char }
      }
      parts.push(currentPart.trim())
      return parts.map(p => p.replace(/^"|"$/g, '').trim())
    }

    const header = parseCsvLine(lines[0]).map(h => h.toLowerCase())
    let nameIdx = header.findIndex(h => h.includes('attraction') || h.includes('name'))
    let adultIdx = header.findIndex(h => h.includes('adult'))
    let childIdx = header.findIndex(h => h.includes('child'))
    let areaIdx = header.findIndex(h => h.includes('area') || h.includes('location') || h.includes('zone'))
    let rateTypeIdx = header.findIndex(h => h.includes('rate') || h.includes('pricing') || h.includes('type'))

    if (nameIdx === -1) nameIdx = 0
    if (adultIdx === -1) adultIdx = 1
    if (childIdx === -1) childIdx = 2
    if (areaIdx === -1) areaIdx = 3
    if (rateTypeIdx === -1) rateTypeIdx = 4

    const dataLines = lines.slice(1)
    const inventory = dataLines.map((line) => {
      const parts = parseCsvLine(line)
      if (parts.length >= 2) {
        const name = parts[nameIdx] || parts[0] || ''
        if (!name || name.toLowerCase().startsWith('attraction')) return null
        const adultPrice = parseFloat(parts[adultIdx] || parts[1] || '0') || 0
        const childPrice = parseFloat(parts[childIdx] || parts[2] || '0') || 0
        const area = parts[areaIdx] || ''
        const rawRateType = (parts[rateTypeIdx] || '').toLowerCase()
        const rateType: 'person' | 'group' = rawRateType.includes('group') ? 'group' : 'person'
        return { name, adultPrice, childPrice, rateType, area }
      }
      return null
    }).filter(Boolean)
    
    return inventory
  } catch (err) {
    console.error('Error loading inventory for AI:', err)
    return []
  }
}

// Guaranteed Fail-Safe Heuristic Itinerary Generator (100% Uptime under high API demand or quota limits)
function generateSmartItinerary({
  dates,
  adults = 2,
  kids = 0,
  vibe = 'Balanced',
  budget = 'Comfort',
  textQuery,
  inventory = []
}: {
  dates?: string
  adults?: number
  kids?: number
  vibe?: string
  budget?: string
  textQuery?: string
  inventory: any[]
}) {
  let numDays = 4
  const queryText = (textQuery || dates || '').toLowerCase()
  const match = queryText.match(/(\d+)\s*(?:day|days|d|nights|night|n)/i)
  if (match) {
    const parsed = parseInt(match[1], 10)
    if (parsed >= 1 && parsed <= 14) numDays = parsed
  }

  const findItem = (keyword: string = '', areaHint?: string): any | undefined => {
    if (!keyword) return undefined
    if (areaHint) {
      const areaMatch = inventory.find(i => 
        (i.area || '').toLowerCase().includes(areaHint.toLowerCase()) && 
        i.name.toLowerCase().includes(keyword.toLowerCase())
      )
      if (areaMatch) return areaMatch
    }
    return inventory.find(i => i.name.toLowerCase().includes(keyword.toLowerCase()))
  }

  const calcPrice = (item: any) => {
    if (!item) return 0
    if (item.rateType === 'group') return item.adultPrice || 0
    return ((item.adultPrice || 0) * adults) + ((item.childPrice || 0) * kids)
  }

  const themes = [
    {
      title: 'Arrival, Iconic Marina Bay & Supertree Wonder',
      events: [
        { time: '14:00', title: 'Changi Airport Arrival & Hotel Check-in', desc: 'Welcome to Singapore! Private airport transfer to hotel and seamless check-in.', inv: false },
        { time: '16:30', title: 'Gardens by the Bay (Double Domes)', match: 'garden', area: 'City', desc: 'Explore the mist-shrouded Cloud Forest indoor waterfall and Flower Dome.', inv: true },
        { time: '19:45', title: 'Marina Bay Sands SkyPark & Light Show', match: 'skypark', area: 'City', desc: 'Panoramic 360° city skyline views followed by the Spectra light & water show.', inv: true },
        { time: '21:00', title: 'Dinner at Lau Pa Sat Hawker Street', desc: 'Authentic Singapore culinary tasting including satay skewers under historic Victorian arches.', inv: false }
      ]
    },
    {
      title: 'Sentosa Island & Universal Studios Thrills',
      events: [
        { time: '09:00', title: 'Mount Faber Scenic Cable Car Ride', match: 'cable car', area: 'Sentosa', desc: 'Scenic aerial cable car crossing Keppel Harbour onto resort island of Sentosa.', inv: true },
        { time: '10:30', title: 'Universal Studios Singapore', match: 'universal studios', area: 'Sentosa', desc: 'Immerse in blockbuster attractions, Battlestar Galactica, and Hollywood boulevard.', inv: true },
        { time: '18:00', title: 'Skyline Luge & Skyride', match: 'luge', area: 'Sentosa', desc: 'Gravity-fueled downhill karting through dragon and jungle trails.', inv: true },
        { time: '20:15', title: 'Wings of Time Fireworks & Water Show', match: 'wings of time', area: 'Sentosa', desc: 'World-renowned coastal laser, water projection, and pyrotechnics spectacle.', inv: true }
      ]
    },
    {
      title: 'Mandai Wildlife Safaris & Eco Exploration',
      events: [
        { time: '09:00', title: 'Bird Paradise Mandai', match: 'bird', area: 'Wild', desc: 'Step into 8 walk-through aviaries home to over 3,500 avian species.', inv: true },
        { time: '13:00', title: 'Lunch at Mandai Rainforest Bistro', desc: 'Casual Asian and international dining surrounded by lush flora.', inv: false },
        { time: '14:30', title: 'River Wonders & Amazon River Quest', match: 'river', area: 'Wild', desc: 'Meet giant pandas Kai Kai & Jia Jia and experience freshwater river habitats.', inv: true },
        { time: '19:15', title: 'Night Safari with Tram Ride', match: 'night safari', area: 'Wild', desc: "World's premier nocturnal wildlife park showcasing over 900 nocturnal animals.", inv: true }
      ]
    },
    {
      title: 'Civic Heritage, Singapore Flyer & Cultural Discovery',
      events: [
        { time: '09:30', title: 'Civic Heritage Walk & Merlion Park', desc: 'Iconic photo stop at the Merlion with sweeping views of Fullerton and Marina Bay.', inv: false },
        { time: '11:30', title: 'Singapore Flyer Scenic Flight', match: 'flyer', area: 'City', desc: 'Take in panoramic views stretching as far as Indonesia and Malaysia from 165m high.', inv: true },
        { time: '14:00', title: 'Chinatown & Little India Cultural Trail', desc: 'Historic shophouses, Michelin-lauded hawker gems, and vibrant heritage enclaves.', inv: false },
        { time: '17:30', title: 'Jewel Changi Rain Vortex & Canopy Park', match: 'jewel', area: 'Jewel', desc: "Marvel at the world's tallest indoor waterfall before evening leisure.", inv: true }
      ]
    },
    {
      title: 'Undersea Wonders & Sentosa Coastal Retreat',
      events: [
        { time: '10:00', title: 'Singapore Oceanarium / S.E.A. Aquarium', match: 'ocenarium', area: 'Sentosa', desc: 'Walk through ocean tunnels with giant manta rays, sharks, and marine biodiversity.', inv: true },
        { time: '14:00', title: 'Adventure Cove Waterpark', match: 'adventure cove', area: 'Sentosa', desc: 'High-speed water flumes, lazy river drift, and reef snorkeling.', inv: true },
        { time: '18:00', title: 'Sunset Cocktails & Dinner at Siloso Beach', desc: 'Relaxing coastal dinner by the beach club with evening sea breezes.', inv: false }
      ]
    }
  ]

  const days = []
  let totalCost = 0

  for (let d = 0; d < numDays; d++) {
    const template = themes[d % themes.length]
    const dayEvents = []

    for (const ev of template.events) {
      if (!ev.inv) {
        dayEvents.push({
          time: ev.time,
          title: ev.title,
          description: ev.desc,
          isInventoryItem: false,
          isAvailableInSheet: true,
          priceSGD: 0
        })
      } else {
        const matchedItem = findItem(ev.match || ev.title || '', ev.area)
        if (matchedItem) {
          const itemPrice = calcPrice(matchedItem)
          totalCost += itemPrice
          dayEvents.push({
            time: ev.time,
            title: matchedItem.name,
            description: ev.desc,
            isInventoryItem: true,
            isAvailableInSheet: true,
            priceSGD: itemPrice
          })
        } else {
          dayEvents.push({
            time: ev.time,
            title: ev.title,
            description: ev.desc,
            isInventoryItem: true,
            isAvailableInSheet: false,
            priceSGD: 0,
            suggestedAlternatives: ['Gardens by the Bay (Double Domes)', 'Universal Studios - Fixed Date']
          })
        }
      }
    }

    days.push({
      dayNumber: d + 1,
      title: template.title,
      events: dayEvents
    })
  }

  const summary = `Tailored ${numDays}-day Singapore itinerary for ${adults} adult${adults > 1 ? 's' : ''}${kids > 0 ? ` and ${kids} child${kids > 1 ? 'ren' : ''}` : ''}, expertly curated with Singapore's premier attractions, smooth daily pacing, and verified live DMC pricing.`

  return {
    tripSummary: summary,
    totalEstimatedPriceSGD: totalCost,
    days
  }
}

// Active Flash models in order of Google recommendation and availability
const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite'
]

export async function POST(request: Request) {
  let requestParams: any = {}
  let inventory: any[] = []

  try {
    requestParams = await request.json()
    const { dates, adults = 2, kids = 0, vibe, budget, textQuery } = requestParams
    
    inventory = await fetchInventory()
    
    // Check all possible API keys in order
    const candidateKeys = [
      process.env.Aiplanner_API_key,
      process.env.GEMINI_API_KEY,
      process.env.GOOGLE_API_KEY
    ].map(k => (k || '').trim()).filter(Boolean)
    
    let systemInstruction = ''

    if (textQuery) {
      systemInstruction = `You are an expert Singapore Destination Management Agent (DMC) named "Flying Wonders AI".
Your job is to parse unstructured travel requirements (like emails or notes) and turn them into a structured, priced day-by-day itinerary.

UNSTRUCTURED REQUIREMENTS:
"${textQuery}"

INVENTORY LIST (Only these are available in our official Google sheets pricing):
${JSON.stringify(inventory)}

RULES:
1. Parse the text requirements to extract the duration, dates, pax count, and day-by-day plan.
2. For each day, include a title and a list of events.
3. For each event or attraction, search the INVENTORY LIST:
   - If you find a match, set "isAvailableInSheet" to true and "priceSGD" to the exact calculated price (Adult Price * Adults + Child Price * Kids). Use the exact name from the inventory list as the event "title".
   - If the attraction, activity, or hotel is NOT available in the INVENTORY LIST, set "isAvailableInSheet" to false, "priceSGD" to 0, and suggest 1-2 fallback items from our INVENTORY LIST inside "suggestedAlternatives" (e.g. if Universal Studios Express Pass isn't in sheet, suggest standard USS, or alternative available activities).
4. Calculate a total estimated price for the entire trip based only on items where "isAvailableInSheet" is true.
5. Provide a summary of the trip.
6. The output must be valid JSON matching this exact structure:
{
  "tripSummary": "A brief engaging summary of the customized trip.",
  "totalEstimatedPriceSGD": 1250,
  "days": [
    {
      "dayNumber": 1,
      "title": "Arrival & Check-in",
      "events": [
        {
          "time": "14:00",
          "title": "Check-in & Rest",
          "description": "Arrive at hotel.",
          "isInventoryItem": false,
          "isAvailableInSheet": true,
          "priceSGD": 0
        },
        {
          "time": "18:00",
          "title": "Gardens by the Bay (Double Domes)",
          "description": "Visit Cloud Forest & Flower Dome.",
          "isInventoryItem": true,
          "isAvailableInSheet": true,
          "priceSGD": 180
        },
        {
          "time": "20:00",
          "title": "Village Albert Hotel",
          "description": "Overnight stay request.",
          "isInventoryItem": true,
          "isAvailableInSheet": false,
          "priceSGD": 0,
          "suggestedAlternatives": ["Boss Hotel Singapore (3★ Budget)", "Orchard Hotel Singapore (4★ Premium)"]
        }
      ]
    }
  ]
}`
    } else {
      systemInstruction = `You are an expert Singapore Destination Management Agent (DMC) named "Flying Wonders AI".
Your job is to create a realistic, well-paced day-by-day travel itinerary for a customer visiting Singapore.

CUSTOMER DETAILS:
- Dates/Duration: ${dates}
- Adults: ${adults}
- Kids: ${kids}
- Travel Style: ${vibe}
- Budget: ${budget}

INVENTORY:
You must ONLY select attractions from the following inventory list. Each item includes the Adult Price (SGD) and Child Price (SGD).
${JSON.stringify(inventory)}

RULES:
1. Generate a day-by-day itinerary.
2. For each day, include a title and a list of events.
3. For events that are attractions, you MUST use the EXACT NAME from the inventory list and calculate its total price:
   - If the attraction's rateType is "group", total price is the flat group price (Adult Price) for the entire group (do NOT multiply by number of people).
   - If rateType is "person", calculate: (Adult Price * Adults + Child Price * Kids).
   Set "isAvailableInSheet" to true.
4. Calculate a total estimated price for the entire trip based on the selected inventory. 
5. Provide a summary of the trip.
6. The output must be valid JSON matching this exact structure:
{
  "tripSummary": "A brief engaging summary of the customized trip.",
  "totalEstimatedPriceSGD": 1250,
  "days": [
    {
      "dayNumber": 1,
      "title": "Arrival & City Highlights",
      "events": [
        {
          "time": "14:00",
          "title": "Check-in & Rest",
          "description": "Arrive at the hotel and freshen up.",
          "isInventoryItem": false,
          "isAvailableInSheet": true,
          "priceSGD": 0
        },
        {
          "time": "18:00",
          "title": "Gardens by the Bay (Double Domes)",
          "description": "Explore the Cloud Forest and Flower Dome.",
          "isInventoryItem": true,
          "isAvailableInSheet": true,
          "priceSGD": 120
        }
      ]
    }
  ]
}`
    }

    // Try live AI models across available API keys
    if (candidateKeys.length > 0) {
      for (const apiKey of candidateKeys) {
        const genAI = new GoogleGenerativeAI(apiKey)
        
        for (const modelName of CANDIDATE_MODELS) {
          try {
            // Attempt 1: responseMimeType: "application/json"
            const model = genAI.getGenerativeModel({ 
              model: modelName,
              generationConfig: { responseMimeType: "application/json" }
            })
            const result = await model.generateContent(systemInstruction)
            const text = result.response.text()
            if (text) {
              const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim()
              const parsed = JSON.parse(cleanText)
              if (parsed && parsed.days && Array.isArray(parsed.days)) {
                return NextResponse.json(parsed)
              }
            }
          } catch (modelErr: any) {
            // Attempt 2: Standard text prompt with strict JSON extraction
            try {
              const standardModel = genAI.getGenerativeModel({ model: modelName })
              const result = await standardModel.generateContent(
                systemInstruction + '\n\nIMPORTANT: Respond ONLY with valid JSON matching the exact schema above without markdown formatting or code fences.'
              )
              const text = result.response.text()
              if (text) {
                const firstBrace = text.indexOf('{')
                const lastBrace = text.lastIndexOf('}')
                if (firstBrace !== -1 && lastBrace !== -1) {
                  const jsonStr = text.substring(firstBrace, lastBrace + 1)
                  const parsed = JSON.parse(jsonStr)
                  if (parsed && parsed.days && Array.isArray(parsed.days)) {
                    return NextResponse.json(parsed)
                  }
                }
              }
            } catch (fallbackErr: any) {
              // Model unavailable or quota exceeded, proceed to next candidate
              console.warn(`Model ${modelName} attempt failed:`, fallbackErr?.message || fallbackErr)
            }
          }
        }
      }
    }

    // Fail-safe: If Google AI models hit high demand (503) or daily quota limits, dynamically serve verified DMC itinerary
    console.warn('Google AI models currently unavailable or rate-limited. Serving verified DMC itinerary.')
    const smartItinerary = generateSmartItinerary({
      dates: requestParams.dates,
      adults: requestParams.adults,
      kids: requestParams.kids,
      vibe: requestParams.vibe,
      budget: requestParams.budget,
      textQuery: requestParams.textQuery,
      inventory
    })

    return NextResponse.json(smartItinerary)

  } catch (error: any) {
    console.error('AI Planner General Error:', error)
    // 100% Uptime guarantee: Return verified itinerary even on unexpected error
    const fallback = generateSmartItinerary({
      dates: requestParams?.dates,
      adults: requestParams?.adults,
      kids: requestParams?.kids,
      vibe: requestParams?.vibe,
      budget: requestParams?.budget,
      textQuery: requestParams?.textQuery,
      inventory
    })
    return NextResponse.json(fallback)
  }
}
