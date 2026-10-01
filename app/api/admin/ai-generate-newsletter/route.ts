import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Curated high-resolution Singapore landmark hero images
const LANDMARK_HERO_IMAGES: Record<string, { url: string; alt: string }> = {
  skyline: {
    url: 'https://images.unsplash.com/photo-1506351421178-63b52a2d15c8?w=1200&auto=format&fit=crop&q=80',
    alt: 'Marina Bay Sands Skyline and Singapore Waterfront'
  },
  gardens: {
    url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&auto=format&fit=crop&q=80',
    alt: 'Gardens by the Bay Supertree Grove and Cloud Forest Dome'
  },
  sentosa: {
    url: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1200&auto=format&fit=crop&q=80',
    alt: 'Sentosa Island and Universal Studios Singapore'
  },
  jewel: {
    url: 'https://images.unsplash.com/photo-1574786198875-49f5d09fe2d5?w=1200&auto=format&fit=crop&q=80',
    alt: 'Jewel Changi Airport Rain Vortex Waterfall'
  },
  wildlife: {
    url: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=1200&auto=format&fit=crop&q=80',
    alt: 'Singapore Wildlife Reserve and Night Safari'
  },
  luxury: {
    url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&auto=format&fit=crop&q=80',
    alt: 'Bioluminescent Supertrees and Luxury Singapore Evening'
  }
}

interface RequestBody {
  proposal?: any
  customPrompt?: string
  tone?: 'b2c' | 'b2b' | 'luxury' | 'deal'
  imageCategory?: string
  customImagePrompt?: string
}

// Heuristic fallback generator when AI key is absent or rate-limited
function generateFallbackCampaign(proposal?: any, customPrompt?: string, tone = 'b2c', imageCategory = 'skyline') {
  const pNum = proposal?.proposalNumber || ''
  const guest = proposal?.guestName || (tone === 'b2b' ? 'Valued Travel Partner' : 'Valued Traveler')
  const nights = proposal?.nights || 4
  const days = nights + 1
  const hotel = proposal?.hotelName || 'Selected 4-Star Premium Hotel'
  const adults = proposal?.adults || 2
  const kids = proposal?.kids || 0
  const arrival = proposal?.arrivalDate || 'Upcoming Travel Season'

  // Extract attractions from itinerary if present
  let extractedAttractions: string[] = []
  if (proposal?.itinerary) {
    try {
      const parsed = typeof proposal.itinerary === 'string' ? JSON.parse(proposal.itinerary) : proposal.itinerary
      if (Array.isArray(parsed)) {
        parsed.forEach((day: any) => {
          if (Array.isArray(day.attractions)) {
            day.attractions.forEach((att: any) => {
              const name = typeof att === 'string' ? att : att.title || att.name
              if (name && !extractedAttractions.includes(name)) extractedAttractions.push(name)
            })
          }
        })
      }
    } catch {
      // ignore
    }
  }

  if (extractedAttractions.length === 0) {
    extractedAttractions = [
      'Universal Studios Singapore (All-Zone Passes)',
      'Gardens by the Bay (Cloud Forest Waterfall & Flower Dome)',
      'Sentosa Island Mega Fun Pass & Cable Car Sky Network',
      'Singapore River Cruise & Marina Bay Sands SkyPark'
    ]
  }

  const selectedHero = LANDMARK_HERO_IMAGES[imageCategory] || LANDMARK_HERO_IMAGES.skyline

  // Determine Title, Subject, & Headline
  let title = ''
  let subject = ''
  let headline = ''
  let greeting = ''
  let bodyText = ''

  if (proposal) {
    title = `Proposal ${pNum} - ${guest} (${days}D${nights}N Singapore)`
    subject = tone === 'b2b'
      ? `📋 B2B DMC Proposal ${pNum} | ${guest} - ${days}D${nights}N Singapore Package`
      : `🌟 Your Singapore Vacation Proposal (${pNum}) | ${days}D${nights}N Custom Itinerary`
    greeting = `Dear ${guest},`
    headline = `Exclusive Singapore ${days}D${nights}N Travel Proposal (${pNum})`
    bodyText = `We are delighted to present your personalized Singapore holiday proposal curated by Flying Wonders DMC.\n\nYour customized itinerary features ${nights} nights accommodation at ${hotel}, private chauffeured ground transfers, and VIP admissions for ${adults} adult(s)${kids > 0 ? ` and ${kids} child(ren)` : ''}.\n\nEvery day of your journey is coordinated by our on-ground Singapore operations desk to ensure seamless convenience, zero ticket queues, and unforgettable moments.`
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

  const highlights = extractedAttractions.slice(0, 4).map((att, idx) => ({
    id: String(idx + 1),
    title: att,
    desc: `Guaranteed digital admission vouchers with skip-the-line privileges and seamless scheduled ground handling.`
  }))

  const ctaUrl = pNum
    ? `https://flyingwonders.net/custom-package?ref=${encodeURIComponent(pNum)}`
    : `https://flyingwonders.net/custom-package`

  const whatsAppText = pNum
    ? `Hi Flying Wonders, I received your email regarding proposal ${pNum} (${guest}) and would like to proceed with the booking.`
    : `Hi Flying Wonders, I received your email newsletter and would like to inquire about Singapore packages.`

  return {
    title,
    subject,
    preheader: `${days}D${nights}N Singapore Itinerary with ${hotel} & VIP Attraction Passes`,
    structuredData: {
      greeting,
      headline,
      bodyText,
      heroImage: selectedHero.url,
      heroImageAlt: selectedHero.alt,
      heroImageLink: ctaUrl,
      heroImagePosition: 'top' as const,
      highlights,
      showCta: true,
      ctaText: pNum ? `Review Proposal & Confirm Package →` : `Explore Singapore Packages →`,
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
    const { proposal, customPrompt, tone = 'b2c', imageCategory = 'skyline', customImagePrompt } = body

    const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim()

    // Determine initial selected hero image
    let heroImageUrl = LANDMARK_HERO_IMAGES[imageCategory]?.url || LANDMARK_HERO_IMAGES.skyline.url
    let heroImageAlt = LANDMARK_HERO_IMAGES[imageCategory]?.alt || LANDMARK_HERO_IMAGES.skyline.alt

    // If no API key is available, return the high-quality fallback immediately
    if (!apiKey) {
      const fallback = generateFallbackCampaign(proposal, customPrompt, tone, imageCategory)
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

Return ONLY a valid JSON object with the exact keys:
{
  "title": "Short internal title",
  "subject": "Catchy email subject line with 1-2 relevant emojis",
  "preheader": "1-sentence preview text for inbox list",
  "greeting": "e.g. Dear [Guest or Partner],",
  "headline": "Compelling headline",
  "bodyText": "2-3 well-spaced paragraphs (separated by \\n\\n) explaining the experience, hotel stay, and seamless ground services",
  "highlights": [
    { "id": "1", "title": "Highlight or Attraction Name", "desc": "Compelling 1-2 sentence description of why it is special and included benefits" },
    { "id": "2", "title": "Highlight or Attraction Name", "desc": "Compelling description" },
    { "id": "3", "title": "Highlight or Attraction Name", "desc": "Compelling description" }
  ],
  "ctaText": "Call to action button text (e.g. Confirm Your Singapore Package →)",
  "recommendedHeroImageCategory": "skyline | gardens | sentosa | jewel | wildlife | luxury"
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
  itinerary: proposal.itinerary
}, null, 2) : 'General Singapore Destination Showcase'}

ADDITIONAL USER INSTRUCTIONS & EXTRA NOTES:
${customPrompt || 'Create an alluring, comprehensive proposal campaign for Singapore.'}
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
      // Fallback
      const fallback = generateFallbackCampaign(proposal, customPrompt, tone, imageCategory)
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

      const recCategory = parsed.recommendedHeroImageCategory || imageCategory
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
        title: parsed.title || `Singapore Campaign - ${pNum || 'Special'}`,
        subject: parsed.subject || `Singapore Package Proposal ${pNum}`,
        preheader: parsed.preheader || '',
        structuredData: {
          greeting: parsed.greeting || 'Dear Valued Traveler,',
          headline: parsed.headline || 'Singapore Unveiled',
          bodyText: parsed.bodyText || '',
          heroImage: heroImageUrl,
          heroImageAlt: heroImageAlt,
          heroImageLink: ctaUrl,
          heroImagePosition: 'top',
          highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
          showCta: true,
          ctaText: parsed.ctaText || 'View Package Details →',
          ctaUrl,
          showWhatsApp: true,
          whatsAppText: 'Chat with our Singapore Desk on WhatsApp',
          showSignature: true,
          salutation: 'Thanks & Best Regards,',
          signoffName: 'Nithin'
        }
      })
    } catch {
      // JSON parse error fallback
      const fallback = generateFallbackCampaign(proposal, customPrompt, tone, imageCategory)
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
