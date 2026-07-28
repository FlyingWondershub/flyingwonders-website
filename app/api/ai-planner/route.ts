import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const maxDuration = 60

async function fetchInventory() {
  try {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=csv'
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
    const { dates, adults, kids, vibe, budget } = await request.json()
    
    const apiKey = process.env.Aiplanner_API_key
    if (!apiKey) {
      return NextResponse.json({ error: 'AI capabilities are currently disabled (Missing API Key)' }, { status: 503 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const inventory = await fetchInventory()
    
    const systemInstruction = `You are an expert Singapore Destination Management Agent (DMC) named "Flying Wonders AI".
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
3. For events that are attractions, you MUST use the EXACT NAME from the inventory list and calculate its total price (Adult Price * Adults + Child Price * Kids).
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
          "priceSGD": 0
        },
        {
          "time": "18:00",
          "title": "Gardens by the Bay",
          "description": "Explore the Cloud Forest and Flower Dome.",
          "isInventoryItem": true,
          "priceSGD": 120
        }
      ]
    }
  ]
}`

    let responseText = ''
    
    try {
      // Attempt 1: Gemini 1.5 Flash
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: "application/json" }
      })
      const result = await model.generateContent(systemInstruction)
      responseText = result.response.text()
    } catch (modelError: any) {
      console.warn('Gemini 1.5 Flash failed, trying gemini-1.5-flash-latest...', modelError?.message)
      
      try {
        // Attempt 2: Gemini 1.5 Flash Latest
        const fallbackModel15 = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash-latest',
          generationConfig: { responseMimeType: "application/json" }
        })
        const result = await fallbackModel15.generateContent(systemInstruction)
        responseText = result.response.text()
      } catch (err2: any) {
        console.warn('Gemini 1.5 Flash Latest failed, falling back to gemini-pro...', err2?.message)
        try {
          // Attempt 3: Gemini 1.0 Pro
          const fallbackModel10 = genAI.getGenerativeModel({ model: 'gemini-pro' })
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
          } catch (fetchErr) {
            throw err3 // Throw original if fetching list fails
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
