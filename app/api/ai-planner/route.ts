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
    const dataLines = lines.slice(1)
    
    const inventory = dataLines.map((line) => {
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
      if (parts.length >= 3) {
        const name = parts[0].replace(/^\"|\"$/g, '')
        const adultPrice = parseFloat(parts[1]) || 0
        const childPrice = parseFloat(parts[2]) || 0
        return { name, adultPrice, childPrice }
      }
      return null
    }).filter(Boolean)
    
    return inventory
  } catch (err) {
    console.error('Error loading inventory for AI:', err)
    return []
  }
}

export async function POST(request: Request) {
  try {
    const { dates, adults, kids, vibe, budget, textQuery } = await request.json()
    
    const rawKey = process.env.Aiplanner_API_key
    const apiKey = rawKey ? rawKey.trim() : null
    if (!apiKey) {
      return NextResponse.json({ error: 'AI capabilities are currently disabled (Missing API Key)' }, { status: 503 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const inventory = await fetchInventory()
    
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
3. For events that are attractions, you MUST use the EXACT NAME from the inventory list and calculate its total price (Adult Price * Adults + Child Price * Kids). Set "isAvailableInSheet" to true.
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

    let responseText = ''
    
    try {
      // Attempt 1: Gemini Flash Latest
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-flash-latest',
        generationConfig: { responseMimeType: "application/json" }
      })
      const result = await model.generateContent(systemInstruction)
      responseText = result.response.text()
    } catch (modelError: any) {
      console.warn('Gemini Flash Latest failed, trying gemini-2.5-flash...', modelError?.message)
      
      try {
        // Attempt 2: Gemini 2.5 Flash
        const fallbackModel15 = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: "application/json" }
        })
        const result = await fallbackModel15.generateContent(systemInstruction)
        responseText = result.response.text()
      } catch (err2: any) {
        console.warn('Gemini 2.5 Flash failed, falling back to gemini-pro-latest...', err2?.message)
        try {
          // Attempt 3: Gemini Pro Latest
          const fallbackModel10 = genAI.getGenerativeModel({ model: 'gemini-pro-latest' })
          const result = await fallbackModel10.generateContent(systemInstruction)
          responseText = result.response.text()
        } catch (err3: any) {
          // Deep Diagnostic: Fetch available models
          console.warn('All models failed. Fetching available models for this API key...')
          try {
            const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
            const listData = await listRes.json()
            const availableModels = listData.models?.map((m: any) => m.name).join(', ') || 'None found'
            
            throw new Error(`Your API key does not support any Gemini models. Available models for your key: ${availableModels}. Original Error: ${err3?.message}`)
          } catch (fetchErr: any) {
            throw new Error(`[Diagnostic Failed]: Could not fetch models (${fetchErr?.message}). This usually means the API key is completely invalid or has extra spaces. Original Error: ${err3?.message}`)
          }
        }
      }
    }

    // Strip markdown formatting if the model wraps the JSON (especially important for fallback)
    const cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()
    
    const parsedJSON = JSON.parse(cleanText)
    return NextResponse.json(parsedJSON)

  } catch (error: any) {
    console.error('AI Planner Error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate itinerary. Please try again.',
      details: error?.message || String(error)
    }, { status: 500 })
  }
}
