import { NextResponse } from 'next/server'
import { client } from '../../../sanity/lib/client'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ reply: 'Please ask a question!' }, { status: 400 })
    }

    const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim()
    if (!apiKey) {
      return NextResponse.json({ 
        reply: "Hello! I am FlyBot from Flying Wonders. Our AI key is being configured. Meanwhile, please contact us on WhatsApp (+91 9886171251) or email info.flyingwonders@gmail.com for instant package quotes!" 
      })
    }

    // Dynamic Sanity Fetch
    let dynamicSanityContext = ''
    try {
      const [attractions, hotels, packages] = await Promise.all([
        client.fetch(`*[_type == "singaporeAttraction"][0..30]{ title, area, category, adultPrice, childPrice }`),
        client.fetch(`*[_type == "hotel"][0..15]{ name, rating, address }`),
        client.fetch(`*[_type == "package"][0..15]{ title, days, price, highlights }`)
      ])

      if (attractions && attractions.length > 0) {
        dynamicSanityContext += `\nDYNAMIC SANITY ATTRACTIONS:\n` + 
          attractions.map((a: any) => `• ${a.title} (${a.area || 'Singapore'}) - Adult: SGD ${a.adultPrice || 'N/A'}, Child: SGD ${a.childPrice || 'N/A'}`).join('\n')
      }
      if (hotels && hotels.length > 0) {
        dynamicSanityContext += `\nDYNAMIC SANITY HOTELS:\n` + 
          hotels.map((h: any) => `• ${h.name} (${h.rating || '4'} Star)`).join('\n')
      }
      if (packages && packages.length > 0) {
        dynamicSanityContext += `\nDYNAMIC SANITY PACKAGES:\n` + 
          packages.map((p: any) => `• ${p.title} (${p.days || '4'} Days)`).join('\n')
      }
    } catch (err) {
      console.warn('Sanity dynamic fetch fallback used in chat API')
    }

    const systemInstructionText = `You are FlyBot, the official expert AI Travel Assistant for Flying Wonders (flyingwonders.net), Singapore's premier Destination Management Company (DMC).
Your goal is to answer questions from travel agents, families, and tourists warmly, accurately, and concisely.

FLYING WONDERS KNOWLEDGE BASE:
- Company: Flying Wonders Pvt Ltd (DMC Specialist for Singapore & Southeast Asia).
- Offices: Dual presence in Singapore & India.
- Contacts: Email info.flyingwonders@gmail.com | WhatsApp: +91 9886171251 / +65 94722830.
- Online Customizer Tool: Users & travel agents can build custom B2B itineraries with instant pricing at /custom-package.

TOP SINGAPORE ATTRACTIONS & INDICATIVE RATES:
• Universal Studios Singapore (USS): Adult SGD 83, Child SGD 62 (7 themed zones, Battlestar Galactica, Transformers 3D).
• Gardens by the Bay (Flower Dome + Cloud Forest): Adult SGD 32, Child SGD 20.
• Supertree Observatory & OCBC Skyway: Adult SGD 14, Child SGD 10 (Bioluminescent vertical gardens).
• Night Safari (World's 1st nocturnal zoo + Tram ride): Adult SGD 55, Child SGD 38.
• Singapore Zoo: Adult SGD 48, Child SGD 33 (Open concept wildlife park).
• River Wonders (Amazon River Quest & Giant Pandas): Adult SGD 42, Child SGD 30.
• Bird Paradise (Mandai Wildlife Reserve): Adult SGD 48, Child SGD 33.
• Singapore Flyer (Giant Observation Wheel): Adult SGD 40, Child SGD 25.
• Sentosa Cable Car Sky Pass (Mount Faber & Sentosa Line): Adult SGD 35, Child SGD 25.
• Wings of Time (Laser & Fire Multi-sensory Night Show at Sentosa): Adult SGD 18, Child SGD 14.
• S.E.A. Aquarium Sentosa: Adult SGD 44, Child SGD 33.
• Singapore DUCKtours (Amphibious City & Harbor Tour): Adult SGD 45, Child SGD 33.
• Madame Tussauds + Marvel 4D + Digiphoto: Adult SGD 35, Child SGD 24.
• Skyline Luge Sentosa (3 Rides): Adult SGD 33, Child SGD 33.

HOTEL PARTNERS:
• Hotel Boss (4-Star, Lavender/Victoria St): Excellent location, modern amenities, popular for group tours.
• Orchard Rendezvous Hotel (4-Star, Orchard Road): Spacious family rooms, luxury heritage location.
• Village Hotel Sentosa, V Hotel Lavender, Grand Central Hotel.

POPULAR ITINERARY SUGGESTIONS:
• 3D2N Singapore Highlights: Half-day City Tour, Gardens by the Bay, Night Safari, Cable Car.
• 4D3N Essential Singapore: Universal Studios, S.E.A. Aquarium, Gardens by the Bay, Cable Car & Wings of Time, Night Safari.
• 5D4N Ultimate Wonders: Universal Studios, Sentosa Island, Wildlife Reserves, City Sightseeing & Shopping at Orchard.

RESPONSE RULES:
1. Always be helpful, polite, and enthusiastic about Singapore travel.
2. Provide clear, concise bullet points when listing attractions or itineraries.
3. Encourage users to try the Custom Package Estimator at /custom-package or contact our WhatsApp desk for custom B2B quotes.
${dynamicSanityContext}`

    // Clean user message history for valid Gemini REST API format (alternating user/model)
    const validContents: any[] = []
    messages.forEach((m: any) => {
      if (m.content && m.content.trim()) {
        const role = m.role === 'user' ? 'user' : 'model'
        // Prevent consecutive same-role messages
        if (validContents.length === 0 || validContents[validContents.length - 1].role !== role) {
          validContents.push({
            role: role,
            parts: [{ text: m.content.trim() }]
          })
        }
      }
    })

    // Ensure contents starts with 'user'
    if (validContents.length > 0 && validContents[0].role !== 'user') {
      validContents.shift()
    }

    if (validContents.length === 0) {
      return NextResponse.json({ reply: 'How can I assist you with Flying Wonders Singapore packages today?' })
    }

    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstructionText }]
      },
      contents: validContents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600
      }
    }

    const candidateEndpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`
    ]

    let replyText = ''

    for (const url of candidateEndpoints) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const resData = await response.json()
        if (response.ok && resData.candidates?.[0]?.content?.parts?.[0]?.text) {
          replyText = resData.candidates[0].content.parts[0].text
          break
        } else if (resData.error) {
          console.warn(`Chat route error from ${url}:`, resData.error.message)
        }
      } catch (e) {
        console.warn(`Chat route fetch exception for ${url}:`, e)
      }
    }

    if (!replyText) {
      replyText = "Flying Wonders offers customized Singapore B2B packages, Universal Studios tickets, Gardens by the Bay passes, and Hotel Boss / Orchard Rendezvous accommodations! You can estimate custom packages instantly at /custom-package or reach our team on WhatsApp at +91 9886171251."
    }

    return NextResponse.json({ reply: replyText })

  } catch (error: any) {
    console.error('Error in chat API:', error)
    return NextResponse.json({ 
      reply: "Flying Wonders offers full Singapore travel packages, attraction tickets, and hotel bookings! Feel free to ask about any specific attraction or check our Custom Package Estimator at /custom-package." 
    })
  }
}
