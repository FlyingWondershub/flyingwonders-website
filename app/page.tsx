import Link from 'next/link'
import { client } from '../sanity/lib/client'
import MetricsCounter from '../components/MetricsCounter'
import HeroBackground from '../components/HeroBackground'
import BentoGridSection from '../components/BentoGridSection'
import { getLiveExchangeRate } from '../utils/exchange'
import AdBanner from '../components/AdBanner'

export const revalidate = 600 // Revalidate home page every 10 minutes

export default async function Home() {
  let settings = {
    heroTitle: 'Where the Future Lives. Experience Singapore.',
    heroSubtitle: 'Discover a global hub of innovation, Michelin-starred heritage, and luxury living wrapped inside a city of tomorrow.',
    whatsappNumber: '+919886171251',
    itinerarySectionTitle: 'Itinerary of Wonders',
    card1Tagline: 'Gastronomy & Culture',
    card1Header: 'The Culinary Capital',
    card1Story: 'Where standard dining becomes an extraordinary feast. From grabbing a plate at Michelin-starred hawker stall to elite Sky dining overlooking the horizon.',
    card1Image: 'https://plus.unsplash.com/premium_photo-1672363353881-68c8ff594e25?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c2luZ2Fwb3JlJTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D',
    card1VideoType: 'youtube' as 'youtube' | 'file' | 'none',
    card1VideoUrl: 'https://www.youtube.com/watch?v=PpA9iIt0kGs',
    card1VideoFileUrl: undefined as string | undefined,
    card2Tagline: 'Sustainability',
    card2Header: 'The City in Nature',
    card2Story: 'Forget what you know about urban spaces. Immerse yourself in an eco-futuristic paradise driven by towering vertical gardens and bioluminescent indoor waterfalls',
    card2Image: 'https://images.unsplash.com/photo-1516496636080-14fb876e029d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Z2FyZGVucyUyMGJ5JTIwdGhlJTIwYmF5fGVufDB8fDB8fHww',
    card2VideoType: 'none' as 'youtube' | 'file' | 'none',
    card2VideoUrl: '',
    card2VideoFileUrl: undefined as string | undefined,
    card3Tagline: 'Entertainment & Wellness',
    card3Header: 'The Urban Playground',
    card3Story: 'Unleash your passions in a vibrant global hub. Experience world-class entertainment and activities alongside unexpected coastal wellness sanctuaries',
    card3Image: 'https://images.unsplash.com/photo-1540086916044-196dc42d62c0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHNlbnRvc2F8ZW58MHx8MHx8fDA%3D',
    card3VideoType: 'youtube' as 'youtube' | 'file' | 'none',
    card3VideoUrl: 'https://www.youtube.com/watch?v=kij3n1iikKc',
    card3VideoFileUrl: undefined as string | undefined,
    hideAiPlanner: false
  }

  try {
    // Fetch both the singleton document (where new video fields were saved in Studio) and the original legacy document (where original images/content reside)
    const [singletonSettings, legacySettings] = await Promise.all([
      client.fetch(`*[_type == "siteSettings" && _id == "siteSettings"][0]{
        heroTitle,
        heroSubtitle,
        itinerarySectionTitle,
        card1Tagline,
        card1Header,
        card1Story,
        card1Image,
        card1VideoType,
        card1VideoUrl,
        "card1VideoFileUrl": card1VideoFile.asset->url,
        card2Tagline,
        card2Header,
        card2Story,
        card2Image,
        card2VideoType,
        card2VideoUrl,
        "card2VideoFileUrl": card2VideoFile.asset->url,
        card3Tagline,
        card3Header,
        card3Story,
        card3Image,
        card3VideoType,
        card3VideoUrl,
        "card3VideoFileUrl": card3VideoFile.asset->url,
        hideAiPlanner
      }`),
      client.fetch(`*[_type == "siteSettings" && _id != "siteSettings" && !(_id in path("drafts.**"))][0]{
        heroTitle,
        heroSubtitle,
        itinerarySectionTitle,
        card1Tagline,
        card1Header,
        card1Story,
        card1Image,
        card2Tagline,
        card2Header,
        card2Story,
        card2Image,
        card3Tagline,
        card3Header,
        card3Story,
        card3Image
      }`)
    ])

    // Clean placeholder images that Sanity schema default values might inject
    const isSchemaPlaceholder = (url?: string) => {
      if (!url) return true
      return url.includes('photo-1555939594-58d7cb561ad1') ||
             url.includes('photo-1518684079-3c830dcef090') ||
             url.includes('photo-1512453979798-5ea266f8880c')
    }

    // Apply legacy document first (which has the real production text and images)
    if (legacySettings) {
      settings = { ...settings, ...legacySettings }
    }

    // Then apply singleton settings (only taking images if they aren't schema placeholders)
    if (singletonSettings) {
      const {
        card1Image,
        card2Image,
        card3Image,
        ...restSingleton
      } = singletonSettings

      settings = {
        ...settings,
        ...restSingleton,
        ...(card1Image && !isSchemaPlaceholder(card1Image) ? { card1Image } : {}),
        ...(card2Image && !isSchemaPlaceholder(card2Image) ? { card2Image } : {}),
        ...(card3Image && !isSchemaPlaceholder(card3Image) ? { card3Image } : {})
      }
    }

    const fetchedContact = await client.fetch(`*[_type == "globalContact"][0]{
      whatsappNumber
    }`)
    if (fetchedContact?.whatsappNumber) {
      settings.whatsappNumber = fetchedContact.whatsappNumber
    }
  } catch (err) {
    console.error('Error fetching site settings from Sanity, using defaults:', err)
  }

  let exchangeRate = 74.81
  try {
    exchangeRate = await getLiveExchangeRate()
  } catch (exErr) {
    console.error('Failed to get dynamic rate on home page:', exErr)
  }

  const formatHeroTitle = (title: string) => {
    let line1 = title
    let line2 = ''
    
    if (title.includes(' - ')) {
      const parts = title.split(' - ')
      line1 = parts[0] + ' -'
      line2 = parts.slice(1).join(' - ')
    } else if (title.includes('-')) {
      const parts = title.split('-')
      line1 = parts[0] + '-'
      line2 = parts.slice(1).join('-')
    }

    const renderColoredSingapore = (text: string) => {
      if (!text.includes('Singapore')) {
        return text
      }
      const parts = text.split('Singapore')
      return (
        <>
          {parts[0]}
          <span style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic', color: 'var(--gold-accent)' }}>Singapore</span>
          {parts[1]}
        </>
      )
    }

    return (
      <>
        <span style={{ display: 'block' }}>{renderColoredSingapore(line1)}</span>
        {line2 && <span style={{ display: 'block', marginTop: '0.75rem', fontFamily: 'var(--font-playfair), serif', fontWeight: 300 }}>{renderColoredSingapore(line2)}</span>}
      </>
    )
  }

  return (
    <div>
      {/* 🛑 Section 1: The Hero (The First Impression) */}
      <section style={{ 
        position: 'relative', 
        height: '95vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden' 
      }}>
        
        {/* CSS Crossfade Background with High-quality Unsplash Images */}
        <HeroBackground />
        
        <div className="container container-wide" style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: 'white', marginTop: '-1.5rem' }}>
          <span style={{ 
            color: 'var(--gold-accent)', 
            textTransform: 'uppercase', 
            fontWeight: 700, 
            letterSpacing: '0.25em',
            fontSize: '0.75rem',
            display: 'inline-block',
            marginBottom: '1.25rem'
          }}>
            Singapore Destination Management Specialist
          </span>
          <h1 style={{ 
            fontSize: 'calc(2.6rem + 2.5vw)', 
            textShadow: '0 4px 30px rgba(0,0,0,0.5)', 
            letterSpacing: '-0.01em', 
            marginBottom: '2rem',
            lineHeight: 1.15,
            fontWeight: 400,
            fontFamily: 'var(--font-playfair), serif',
          }}>
            {formatHeroTitle(settings.heroTitle)}
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            maxWidth: '600px', 
            margin: '0 auto 3.5rem auto', 
            opacity: 0.9, 
            fontWeight: 300, 
            lineHeight: 1.7,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            letterSpacing: '0.02em',
          }}>
            {settings.heroSubtitle}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/packages" className="btn btn-primary">Plan Your Journey</Link>
            {!settings.hideAiPlanner && (
              <Link href="/ai-planner" className="btn btn-secondary" style={{ 
                background: 'rgba(255,255,255,0.1)', 
                color: 'white', 
                border: '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.2rem' }}>✨</span> AI Journey Planner
              </Link>
            )}
            <Link href="/events" className="btn btn-secondary" style={{ 
              background: 'rgba(255,255,255,0.1)', 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.1rem' }}>📅</span> Trade Shows & Events
            </Link>
          </div>
        </div>
      </section>

      {/* 🏙️ Section 2: The Core Pillars (Interactive Bento-Grid with Video Playback) */}
      <BentoGridSection
        sectionTitle={settings.itinerarySectionTitle}
        cards={[
          {
            tagline: settings.card1Tagline,
            header: settings.card1Header,
            story: settings.card1Story,
            image: settings.card1Image,
            gradient: 'linear-gradient(to top, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.1))',
            videoType: settings.card1VideoType || 'youtube',
            videoUrl: settings.card1VideoUrl || 'https://www.youtube.com/watch?v=PpA9iIt0kGs',
            videoFileUrl: settings.card1VideoFileUrl,
          },
          {
            tagline: settings.card2Tagline,
            header: settings.card2Header,
            story: settings.card2Story,
            image: settings.card2Image,
            gradient: 'linear-gradient(to top, rgba(15,76,58,0.95) 20%, rgba(0,0,0,0.1))',
            videoType: settings.card2VideoType || 'none',
            videoUrl: settings.card2VideoUrl || '',
            videoFileUrl: settings.card2VideoFileUrl,
          },
          {
            tagline: settings.card3Tagline,
            header: settings.card3Header,
            story: settings.card3Story,
            image: settings.card3Image,
            gradient: 'linear-gradient(to top, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.1))',
            videoType: settings.card3VideoType || 'youtube',
            videoUrl: settings.card3VideoUrl || 'https://www.youtube.com/watch?v=kij3n1iikKc',
            videoFileUrl: settings.card3VideoFileUrl,
          },
        ]}
      />

      {/* 🛍️ Section 3: The Curated Marketplace */}
      <section style={{ padding: '8rem 0', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
        <div className="container container-wide">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ color: 'var(--crimson-primary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.85rem' }}>
                Signature Collections
              </span>
              <h2 style={{ fontSize: '3rem', color: 'var(--text-dark)', margin: '0.25rem 0 0 0' }}>Curated Luxuries</h2>
            </div>
            <Link href="/packages" style={{ color: 'var(--crimson-primary)', fontWeight: 700, textDecoration: 'none', borderBottom: '2px solid var(--crimson-primary)', paddingBottom: '2px' }}>
              View All Experiences →
            </Link>
          </div>
          
          <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
            {[
              { 
                id: "exotic_4d3n",
                title: "Exotic 4Days - 3Nights", 
                priceVal: 600,
                priceSuffix: " / person",
                imageUrl: "/images/hero/singapore-hero-1.jpg",
                desc: "Explore Singapore in a compact, action-packed 4 Days, 3 Nights budget-friendly tour featuring city highlights, Night Safari, Gardens by the Bay, and Sentosa."
              },
              { 
                id: "classic_5d4n",
                title: "Singapore Explorer Classic 5D4N", 
                priceVal: 850,
                priceSuffix: " / person",
                imageUrl: "/images/hero/singapore-hero-2.jpg",
                desc: "Experience Singapore in style. Includes premium 4* hotel stays, Gardens by the Bay, Night Safari, Universal Studios, and Marina Bay Sands."
              },
              { 
                id: "solo_exploration_4d3n",
                title: "Solo Exploration 4D3N (Private)", 
                priceVal: 1000,
                priceSuffix: " / person",
                imageUrl: "/images/hero/singapore-hero-3.jpg",
                desc: "Experience Singapore at your own pace with a premium private-transfer solo package featuring Museum of Ice Cream, Sentosa, and Universal Studios."
              }
            ].map((product, idx) => (
              <div key={idx} className="glass hover-lift" style={{ 
                minWidth: '320px', 
                maxWidth: '380px',
                borderRadius: '4px', /* Crisp corners */
                overflow: 'hidden', 
                scrollSnapAlign: 'start', 
                flexShrink: 0, 
                background: 'var(--bg-main)',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(0,0,0,0.06)'
              }}>
                <div style={{ height: '220px', backgroundImage: `url(${product.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                </div>
                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{product.title}</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.75, flex: 1, marginBottom: '1.5rem' }}>{product.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ color: 'var(--crimson-primary)', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-inter), sans-serif' }}>
                        ₹ {Math.round(product.priceVal * exchangeRate).toLocaleString('en-IN')}{product.priceSuffix}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--emerald-secondary)', fontWeight: 700, opacity: 0.85 }}>
                        (S$ {product.priceVal}{product.priceSuffix})
                      </span>
                    </div>
                    <Link href={`/book?packageId=${product.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Book Now</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AdSense Unit */}
          <AdBanner slotId="home_mid_slot" category="general" style={{ marginTop: '3.5rem' }} />
        </div>
      </section>

      {/* 📈 Section 4: Social Proof & Metrics (The Trust Builder) */}
      <section style={{ padding: '8rem 0', background: 'var(--bg-dark)' }}>
        <div className="container container-wide">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem' }}>
            <MetricsCounter prefix="#" end={1} label="World's Safest & Cleanest Travel Destination" />
            <MetricsCounter end={94} suffix="%" label="Visitor Satisfaction & Return Intent Index" />
            <MetricsCounter end={100} suffix="%" label="English-Covered Public Signs & Services" />
          </div>
        </div>
      </section>
    </div>
  )
}
