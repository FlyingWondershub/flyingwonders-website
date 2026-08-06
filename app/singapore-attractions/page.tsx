import AttractionsForm from './AttractionsForm'
import { client } from '../../sanity/lib/client'
import { urlForImage } from '../../sanity/lib/image'

async function getAttractions() {
  try {
    let sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=csv'
    try {
      const siteSettings = await client.fetch(`*[_type == "siteSettings"][0]{ attractionsSheetUrl }`)
      if (siteSettings?.attractionsSheetUrl) {
        sheetUrl = siteSettings.attractionsSheetUrl
          .replace(/\/pubhtml.*/gi, '/pub?output=csv')
          .replace(/output=xlsx/gi, 'output=csv')
          .replace(/output=html/gi, 'output=csv')
        if (!sheetUrl.includes('output=csv')) {
          sheetUrl += (sheetUrl.includes('?') ? '&' : '?') + 'output=csv'
        }
      }
    } catch (e) {}

    const res = await fetch(sheetUrl, {
      next: { revalidate: 3600 }
    })
    if (!res.ok) throw new Error('Failed to fetch attractions sheet')
    const text = await res.text()
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const dataLines = lines.slice(1)
    const attractions = dataLines.map((line, index) => {
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
        return { id: `attr_${index}`, name, adultPrice, childPrice }
      }
      return null
    }).filter((a): a is { id: string; name: string; adultPrice: number; childPrice: number } => a !== null)
    return attractions
  } catch (err) {
    console.error('Error loading attractions sheet:', err)
    return [
      { id: 'attr_fallback_1', name: 'Universal Studios Singapore - Fixed Date', adultPrice: 78, childPrice: 66 },
      { id: 'attr_fallback_2', name: 'Gardens by the Bay Double Domes', adultPrice: 30, childPrice: 22 },
      { id: 'attr_fallback_3', name: 'Night Safari with Tram Ride - Fixed Date', adultPrice: 45, childPrice: 35 }
    ]
  }
}

export const metadata = {
  title: 'Singapore Attraction Tickets & E-Ticket Quotation Builder | Flying Wonders',
  description: 'Customize and build instant quotes for Singapore attractions including Universal Studios, Gardens by the Bay, Night Safari & Cable Car. Real-time SGD to INR conversion.',
  keywords: ['Singapore Attraction Tickets', 'Universal Studios Singapore E-Tickets', 'Gardens by the Bay Tickets', 'Night Safari Singapore', 'Singapore E-Ticket Quote'],
  openGraph: {
    title: 'Singapore Attraction Tickets & E-Ticket Quotation Builder | Flying Wonders',
    description: 'Build instant Singapore attraction quotes with SGD to INR rates. Barcoded E-Tickets dispatched instantly.',
    url: 'https://flyingwonders.net/singapore-attractions',
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SingaporeAttractionsPage() {
  const attractions = await getAttractions()

  // ── Fetch banner settings ──
  let bannerSettings = {
    attractionsBannerText: 'Complimentary tickets :  Wings of time for 8:30 PM show - Click Here',
    attractionsBannerActive: true,
    attractionsBannerWhatsappMessage: 'Hi Flying Wonders, I would like to request the complimentary tickets for the Wings of Time 8:30 PM show.'
  }
  try {
    const fetched = await client.fetch(`*[_type == "siteSettings"][0]{
      attractionsBannerText,
      attractionsBannerActive,
      attractionsBannerWhatsappMessage
    }`, {}, { cache: 'no-store' })
    if (fetched) bannerSettings = { ...bannerSettings, ...fetched }
  } catch (err) {
    console.error('Error fetching banner settings:', err)
  }

  // ── Fetch Sanity bundles ──
  let sanityBundles: any[] = []
  try {
    const rawBundles = await client.fetch(`*[_type == "attractionBundle" && isActive == true] | order(sortOrder asc) {
      _id, label, emoji, description, adultQty, childQty, attractionKeywords
    }`, {}, { cache: 'no-store' })
    sanityBundles = rawBundles || []
  } catch (err) {
    console.error('Error fetching attraction bundles from Sanity:', err)
  }

  // ── Fetch Sanity attraction meta (photos, links, descriptions) ──
  let sanityMeta: any[] = []
  try {
    const rawMeta = await client.fetch(`*[_type == "attractionMeta"] {
      _id, name, matchKeyword, photo, officialWebsite, shortDescription, openingHours, rating, category, isPopular, isTrending, longDescription, highlights, tips, duration, location, ageRecommendation
    }`, {}, { cache: 'no-store' })
    // Resolve photo URLs
    sanityMeta = (rawMeta || []).map((m: any) => ({
      ...m,
      photoUrl: m.photo ? urlForImage(m.photo)?.width(800).height(600).url() : null
    }))
  } catch (err) {
    console.error('Error fetching attraction meta from Sanity:', err)
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <span style={{ color: 'var(--gold-accent)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.25em', fontSize: '0.7rem', display: 'inline-block', marginBottom: '0.35rem' }}>
          Quotation Builder
        </span>
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.6rem', color: 'var(--text-dark)', margin: '0 0 0.35rem 0' }}>
          Singapore Attractions Quote
        </h1>
        <p style={{ maxWidth: '500px', margin: '0 auto', opacity: 0.8, fontSize: '0.85rem', lineHeight: 1.4 }}>
          Generate a customized ticket quotation instantly.
        </p>

        {/* Promotions link */}
        <div style={{ marginTop: '1.25rem' }}>
          <a 
            href="/Singapore_Attractions/promotions"
            style={{ 
              background: '#FFF5F5', 
              color: '#C53030', 
              border: '1px solid #FEB2B2', 
              padding: '0.45rem 1.25rem', 
              borderRadius: '20px', 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(229,62,62,0.1)'
            }}
          >
            🔥 Promotions: Limited time discounted attraction deals are active! Click here to view →
          </a>
        </div>
      </div>

      {/* 📣 Rolling Marquee Banner */}
      {bannerSettings.attractionsBannerActive && bannerSettings.attractionsBannerText && (
        <a
          href={`https://wa.me/6594722830?text=${encodeURIComponent(bannerSettings.attractionsBannerWhatsappMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'linear-gradient(90deg, #9a1f2f, #B83A4B)',
            color: 'white',
            padding: '0.75rem 0',
            borderRadius: '8px',
            marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-md)',
            borderLeft: '4px solid var(--gold-accent)',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          <div className="rolling-banner-container">
            <div className="rolling-banner-track" style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '0.03em' }}>
              <span>{bannerSettings.attractionsBannerText}</span>
            </div>
          </div>
        </a>
      )}

      <AttractionsForm
        attractions={attractions}
        sanityBundles={sanityBundles}
        sanityMeta={sanityMeta}
      />

    </div>
  )
}
