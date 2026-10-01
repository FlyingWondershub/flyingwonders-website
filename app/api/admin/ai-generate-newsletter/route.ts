import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 100% Verified, live high-resolution Singapore landmark hero images hosted on flyingwonders.net
const LANDMARK_HERO_IMAGES: Record<string, { url: string; alt: string }> = {
  skyline: {
    url: 'https://flyingwonders.net/images/hero/singapore-hero-1.jpg',
    alt: 'Marina Bay Sands Skyline and Singapore Waterfront'
  },
  universal: {
    url: 'https://flyingwonders.net/images/attractions/universal-studios-singapore/cover.jpg',
    alt: 'Universal Studios Singapore Theme Park'
  },
  nightsafari: {
    url: 'https://flyingwonders.net/images/attractions/night-safari-singapore/cover.jpg',
    alt: 'Singapore Night Safari with Guided Tram'
  },
  gardens: {
    url: 'https://flyingwonders.net/images/attractions/gardens-by-the-bay/cover.jpg',
    alt: 'Gardens by the Bay Supertree Grove and Conservatories'
  },
  jewel: {
    url: 'https://flyingwonders.net/images/hero/singapore-hero-4.jpg',
    alt: 'Jewel Changi Airport Rain Vortex Waterfall'
  },
  city: {
    url: 'https://flyingwonders.net/images/hero/singapore-hero-2.jpg',
    alt: 'Singapore Merlion and Downtown Skyline'
  }
}

interface RequestBody {
  proposal?: any
  customPrompt?: string
  tone?: 'b2c' | 'b2b' | 'luxury' | 'deal'
  imageCategory?: string
  customImagePrompt?: string
}

// Extraction helper for proposals
function extractProposalDetails(proposal: any) {
  let itineraryDays: any[] = []
  if (proposal?.itinerary) {
    try {
      itineraryDays = typeof proposal.itinerary === 'string' ? JSON.parse(proposal.itinerary) : proposal.itinerary
    } catch {
      // ignore
    }
  }

  const rawAttractions: string[] = []
  const rawTransfers: string[] = []
  const dayTitles: string[] = []

  if (Array.isArray(itineraryDays)) {
    itineraryDays.forEach(day => {
      if (day.dayTitle) dayTitles.push(day.dayTitle)
      if (Array.isArray(day.attractions)) {
        day.attractions.forEach((att: any) => {
          const name = (att.attractionName || att.title || att.name || '').trim()
          if (!name) return
          if (/arrival|departure|airport transfer/i.test(name)) {
            rawTransfers.push(name)
          } else {
            rawAttractions.push(name)
          }
        })
      }
      if (Array.isArray(day.transfers)) {
        day.transfers.forEach((tr: any) => {
          const desc = (tr.description || tr.serviceName || '').trim()
          if (desc && !rawTransfers.includes(desc)) rawTransfers.push(desc)
        })
      }
    })
  }

  return { rawAttractions, rawTransfers, dayTitles }
}

// Heuristic fallback generator when AI key is absent or rate-limited
function generateFallbackCampaign(proposal?: any, customPrompt?: string, tone = 'b2c', imageCategory?: string) {
  const pNum = proposal?.proposalNumber || ''
  const guest = proposal?.guestName || (tone === 'b2b' ? 'Valued Travel Partner' : 'Valued Traveler')
  const nights = proposal?.nights || 3
  const days = nights + 1
  const hotel = proposal?.hotelName || 'Selected 4-Star Partner Hotel'
  const adults = proposal?.adults || 2
  const kids = proposal?.kids || 0
  const price = proposal?.costBreakdown?.totalClientPrice || proposal?.totalClientPrice

  const { rawAttractions, rawTransfers } = extractProposalDetails(proposal)

  // Build clean, professional highlights
  const highlights: Array<{ id: string; title: string; desc: string }> = []
  let detectedHeroKey = 'skyline'

  rawAttractions.forEach((att) => {
    let cleanTitle = att.replace(/ - Fixed.*$/i, '').trim()
    let desc = 'Guaranteed digital admission vouchers with scheduled transfers and VIP skip-the-line privileges.'

    if (/universal/i.test(att)) {
      cleanTitle = 'Universal Studios Singapore (Theme Park Passes)'
      desc = 'Full-day admission to 7 immersive movie-themed zones, cutting-edge roller coasters, and world-class live entertainment.'
      detectedHeroKey = 'universal'
    } else if (/night safari/i.test(att)) {
      cleanTitle = 'Night Safari with Guided Tram Experience'
      desc = "Explore the world's first nocturnal wildlife park with guided open-air tram ride and animal presentations."
      if (detectedHeroKey === 'skyline') detectedHeroKey = 'nightsafari'
    } else if (/city tour|group tour/i.test(att)) {
      cleanTitle = 'Singapore City Exploration & Heritage Tour'
      desc = 'Guided panoramic city drive covering Merlion Park, Marina Bay waterfront, and vibrant cultural districts.'
    } else if (/gardens|flower dome|cloud forest/i.test(att)) {
      cleanTitle = 'Gardens by the Bay (Cloud Forest & Flower Dome)'
      desc = 'Iconic 35-meter indoor waterfall, world-record glass conservatory, and illuminated Supertree Grove.'
      if (detectedHeroKey === 'skyline') detectedHeroKey = 'gardens'
    } else if (/sentosa|cable car/i.test(att)) {
      cleanTitle = 'Sentosa Island & Cable Car Sky Network'
      desc = 'Scenic panoramic sky cableway flights connecting Mount Faber to Sentosa Island attractions.'
    }

    highlights.push({
      id: String(highlights.length + 1),
      title: cleanTitle,
      desc
    })
  })

  // Add transfer highlight if present
  if (rawTransfers.length > 0) {
    const specialTransfer = rawTransfers.find(t => /imm|jurong|shopping|mustafa/i.test(t))
    if (specialTransfer) {
      highlights.push({
        id: String(highlights.length + 1),
        title: 'Jurong IMM Shopping Outlet Transfer',
        desc: "Comfortable dedicated private transfer to Singapore's premier outlet mall with over 90 designer brand outlets."
      })
    }
    highlights.push({
      id: String(highlights.length + 1),
      title: 'Airport Meet & Greet Ground Fleet',
      desc: 'Seamless arrival and departure airport transfers with dedicated luggage assistance and zero wait time.'
    })
  }

  // Generic fallback if empty
  if (highlights.length === 0) {
    highlights.push({
      id: '1',
      title: 'Universal Studios Singapore',
      desc: 'Full-day theme park adventure across 7 movie-themed zones with instant mobile entry.'
    })
    highlights.push({
      id: '2',
      title: 'Night Safari with Tram',
      desc: 'Guided tram ride through nocturnal rainforest habitats.'
    })
  }

  const finalHeroKey = imageCategory && LANDMARK_HERO_IMAGES[imageCategory]
    ? imageCategory
    : detectedHeroKey
  const selectedHero = LANDMARK_HERO_IMAGES[finalHeroKey] || LANDMARK_HERO_IMAGES.skyline

  // Determine Title, Subject, & Headline
  let title = ''
  let subject = ''
  let headline = ''
  let greeting = ''
  let bodyText = ''

  const attractionNamesSummary = rawAttractions.map(a => a.replace(/ - Fixed.*$/i, '').trim()).join(', ')

  if (proposal) {
    title = `Proposal ${pNum} - ${guest} (${days}D${nights}N)`
    subject = tone === 'b2b'
      ? `📋 B2B DMC Proposal ${pNum} | ${guest} - ${days}D${nights}N Singapore Package`
      : `🌟 Singapore Proposal (${pNum}) | ${days}D${nights}N at ${hotel}${rawAttractions.length ? ` incl. ${rawAttractions[0].replace(/ - Fixed.*$/i, '')}` : ''}`
    greeting = `Dear ${guest},`
    headline = `Your Singapore ${days}D${nights}N Custom Package Proposal (${pNum})`
    bodyText = `We are delighted to present your personalized Singapore holiday proposal (${pNum}) curated by Flying Wonders DMC.\n\nYour customized ${days}-day itinerary features ${nights} nights accommodation at ${hotel}, private chauffeured ground transfers, and scheduled admissions for ${adults} adult(s)${kids > 0 ? ` and ${kids} child(ren)` : ''}.\n\n` +
      (rawAttractions.length > 0 ? `Featured Experiences: Highlights include ${attractionNamesSummary} with seamless ground coordination and zero ticket queues.\n\n` : '') +
      `Every detail of your stay is handled by our on-ground Singapore operations desk to ensure complete peace of mind from airport arrival to departure.`
    
    if (price) {
      bodyText += `\n\nTotal Package Quote: SGD ${price} net.`
    }
  } else {
    title = `Singapore Seasonal Gateway - ${days}D${nights}N`
    subject = tone === 'b2b'
      ? `📄 Flying Wonders DMC: Exclusive Singapore Wholesale Tariffs & Partner Packages`
      : `🇸🇬 Singapore Unveiled: Exclusive ${days}D${nights}N Packages & Seasonal Wonders`
    greeting = tone === 'b2b' ? `Dear Travel Partner,` : `Dear Valued Traveler,`
    headline = `Singapore Unveiled: Bespoke Itineraries & Exclusive DMC Rates`
    bodyText = `Singapore is brimming with extraordinary experiences this season! From architectural marvels to lush tropical conservation reserves, our destination specialists have curated the ultimate Singapore getaways.\n\nEnjoy guaranteed seamless private transfers, luxury star accommodations, and instant mobile attraction vouchers with 24/7 on-ground concierge support.`
  }

  if (customPrompt && customPrompt.trim()) {
    bodyText += `\n\nSpecial Inclusions & Notes: ${customPrompt.trim()}`
  }

  const ctaUrl = pNum
    ? `https://flyingwonders.net/custom-package?ref=${encodeURIComponent(pNum)}`
    : `https://flyingwonders.net/custom-package`

  const whatsAppText = pNum
    ? `Hi Flying Wonders, I received your email regarding proposal ${pNum} (${guest}) and would like to proceed with the booking.`
    : `Hi Flying Wonders, I received your email newsletter and would like to inquire about Singapore packages.`

  return {
    title,
    subject,
    preheader: `${days}D${nights}N Singapore Itinerary with ${hotel} & VIP Attraction Passes (${pNum || 'FW-DMC'})`,
    structuredData: {
      greeting,
      headline,
      bodyText,
      heroImage: selectedHero.url,
      heroImageAlt: selectedHero.alt,
      heroImageLink: ctaUrl,
      heroImagePosition: 'top' as const,
      highlights: highlights.slice(0, 4),
      showCta: true,
      ctaText: pNum ? `Review Proposal Details (${pNum}) →` : `Explore Singapore Packages →`,
      ctaUrl,
      showWhatsApp: true,
      whatsAppText: 'Chat with our Singapore Desk on WhatsApp',
      showSignature: true,
      salutation: 'Thanks & Best Regards,',
      signoffName: 'Nithin'
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json()
    const { proposal, customPrompt, tone = 'b2c', imageCategory, customImagePrompt } = body

    const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim()

    const { rawAttractions, rawTransfers, dayTitles } = extractProposalDetails(proposal)

    // Detect hero image
    let detectedHero = 'skyline'
    if (rawAttractions.some(a => /universal/i.test(a))) detectedHero = 'universal'
    else if (rawAttractions.some(a => /night safari/i.test(a))) detectedHero = 'nightsafari'
    else if (rawAttractions.some(a => /gardens/i.test(a))) detectedHero = 'gardens'

    const chosenHeroKey = imageCategory && LANDMARK_HERO_IMAGES[imageCategory]
      ? imageCategory
      : detectedHero
    let heroImageUrl = (LANDMARK_HERO_IMAGES[chosenHeroKey] || LANDMARK_HERO_IMAGES.skyline).url
    let heroImageAlt = (LANDMARK_HERO_IMAGES[chosenHeroKey] || LANDMARK_HERO_IMAGES.skyline).alt

    // If no API key is available, return the high-quality fallback immediately
    if (!apiKey) {
      const fallback = generateFallbackCampaign(proposal, customPrompt, tone, chosenHeroKey)
      return NextResponse.json({
        success: true,
        source: 'heuristic_template',
        ...fallback
      })
    }

    // Prepare system instructions and prompt for Gemini
    const systemPrompt = `You are a premier travel copywriter and DMC marketing specialist for Flying Wonders (Singapore Destination Management Company).
Generate an irresistible, highly converting, professional email newsletter / proposal broadcast.
Tone: ${tone === 'b2b' ? 'Professional B2B Travel Agent partner tone, highlighting net wholesale margins, instant vouchers, and reliability' : tone === 'luxury' ? 'Ultra-luxury VIP tone emphasizing bespoke concierge, private chauffeured Alphard transfers, and 5-star hospitality' : 'Warm, enticing B2C family vacation tone highlighting excitement, convenience, and unforgettable memories'}.

CRITICAL RULES:
1. If PROPOSAL CONTEXT is provided, you MUST explicitly feature the exact hotel (${proposal?.hotelName || ''}) and EXACT attractions booked in the itinerary: ${rawAttractions.join(', ') || 'Singapore Highlights'}. DO NOT invent unrelated attractions that are not in the itinerary!
2. Highlights array must contain 3-4 bullet items directly based on the proposal's booked attractions and excursions.

Return ONLY a valid JSON object with the exact keys:
{
  "title": "Short internal title",
  "subject": "Catchy email subject line mentioning the proposal code and key attraction with 1-2 relevant emojis",
  "preheader": "1-sentence preview text for inbox list",
  "greeting": "e.g. Dear [Guest or Partner],",
  "headline": "Compelling headline",
  "bodyText": "2-3 well-spaced paragraphs (separated by \\n\\n) explaining the experience, hotel stay, and seamless ground services",
  "highlights": [
    { "id": "1", "title": "Highlight or Attraction Name", "desc": "Compelling 1-2 sentence description of why it is special and included benefits" },
    { "id": "2", "title": "Highlight or Attraction Name", "desc": "Compelling description" },
    { "id": "3", "title": "Highlight or Attraction Name", "desc": "Compelling description" }
  ],
  "ctaText": "Call to action button text (e.g. Review Proposal & Confirm →)",
  "recommendedHeroImageCategory": "universal | nightsafari | skyline | gardens | jewel | city"
}
Do not wrap in markdown quotes or backticks if possible, or return raw valid JSON.`

    const userMessageContent = `PROPOSAL CONTEXT:
${proposal ? JSON.stringify({
  proposalNumber: proposal.proposalNumber,
  guestName: proposal.guestName,
  adults: proposal.adults,
  kids: proposal.kids,
  nights: proposal.nights,
  hotelName: proposal.hotelName,
  roomType: proposal.roomType,
  arrivalDate: proposal.arrivalDate,
  pricing: proposal.costBreakdown?.totalClientPrice ? `SGD ${proposal.costBreakdown.totalClientPrice}` : undefined,
  destinationMode: proposal.destinationMode,
  bookedAttractions: rawAttractions,
  transfersAndExcursions: rawTransfers,
  dayTitles: dayTitles
}, null, 2) : 'General Singapore Destination Showcase'}

ADDITIONAL USER INSTRUCTIONS & EXTRA NOTES:
${customPrompt || 'Create a bespoke, alluring proposal campaign matching the exact itinerary.'}
${customImagePrompt ? `Custom Image Request: ${customImagePrompt}` : ''}`

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessageContent }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1200
      }
    }

    const candidateEndpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`
    ]

    let generatedText = ''
    for (const url of candidateEndpoints) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const resData = await response.json()
        if (response.ok && resData.candidates?.[0]?.content?.parts?.[0]?.text) {
          generatedText = resData.candidates[0].content.parts[0].text
          break
        }
      } catch {
        // try next endpoint
      }
    }

    if (!generatedText) {
      const fallback = generateFallbackCampaign(proposal, customPrompt, tone, chosenHeroKey)
      return NextResponse.json({
        success: true,
        source: 'heuristic_fallback',
        ...fallback
      })
    }

    // Clean JSON markdown
    let cleanJson = generatedText.trim()
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim()
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim()
    }

    try {
      const parsed = JSON.parse(cleanJson)

      const recCategory = parsed.recommendedHeroImageCategory || chosenHeroKey
      if (LANDMARK_HERO_IMAGES[recCategory]) {
        heroImageUrl = LANDMARK_HERO_IMAGES[recCategory].url
        heroImageAlt = LANDMARK_HERO_IMAGES[recCategory].alt
      }

      const pNum = proposal?.proposalNumber || ''
      const ctaUrl = pNum
        ? `https://flyingwonders.net/custom-package?ref=${encodeURIComponent(pNum)}`
        : `https://flyingwonders.net/custom-package`

      return NextResponse.json({
        success: true,
        source: 'gemini_ai',
        title: parsed.title || `Proposal ${pNum} - ${proposal?.guestName || 'Special'}`,
        subject: parsed.subject || `Singapore Package Proposal ${pNum}`,
        preheader: parsed.preheader || '',
        structuredData: {
          greeting: parsed.greeting || `Dear ${proposal?.guestName || 'Valued Traveler'},`,
          headline: parsed.headline || `Your Singapore Custom Package Proposal (${pNum})`,
          bodyText: parsed.bodyText || '',
          heroImage: heroImageUrl,
          heroImageAlt: heroImageAlt,
          heroImageLink: ctaUrl,
          heroImagePosition: 'top',
          highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
          showCta: true,
          ctaText: parsed.ctaText || `Review Proposal Details (${pNum}) →`,
          ctaUrl,
          showWhatsApp: true,
          whatsAppText: `Hi Flying Wonders, I received the proposal email for ${pNum} (${proposal?.guestName || ''}) and would like to proceed.`,
          showSignature: true,
          salutation: 'Thanks & Best Regards,',
          signoffName: 'Nithin'
        }
      })
    } catch {
      const fallback = generateFallbackCampaign(proposal, customPrompt, tone, chosenHeroKey)
      return NextResponse.json({
        success: true,
        source: 'heuristic_parsed_fallback',
        ...fallback
      })
    }
  } catch (err: any) {
    console.error('Error generating AI newsletter:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
