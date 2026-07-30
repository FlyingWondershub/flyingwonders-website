import Link from 'next/link'
import { client } from '../sanity/lib/client'
import MetricsCounter from '../components/MetricsCounter'
import HeroBackground from '../components/HeroBackground'
import { getLiveExchangeRate } from '../utils/exchange'

export const revalidate = 60 // Revalidate home page every minute

export default async function Home() {
  let settings = {
    heroTitle: 'Where the Future Lives. Experience Singapore.',
    heroSubtitle: 'Discover a global hub of innovation, Michelin-starred heritage, and luxury living wrapped inside a city of tomorrow.',
    whatsappNumber: '+919886171251',
    itinerarySectionTitle: 'The Itinerary for Wonders',
    card1Tagline: 'SENSORY JOURNEYS',
    card1Header: 'Taste the World in a Single Square Mile',
    card1Story: 'A collision of cross-cultural heritage and culinary artistry. Lose yourself in the generational smoke of legendary hawker street stalls, or ascend to the stars for avant-garde dining suspended high above the glittering skyline.',
    card1Image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    card2Tagline: 'REGENERATIVE EXPLORATION',
    card2Header: "The World's Finest City in Nature",
    card2Story: 'Step into a living blueprint for tomorrow’s travel. Wander through an eco-futuristic wonderland where high-density vertical gardens breathe alongside bioluminescent glass domes, redefining the boundary between urban luxury and the wild.',
    card2Image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    card3Tagline: 'THE BLEISURE ESCAPE',
    card3Header: 'Where Global Ambition Meets Uncharted Play',
    card3Story: 'The ultimate playground for the modern global traveler. Effortlessly transition from high-stakes networking summits in architectural marvels to pulse-pounding nightlife, world-class Grand Prix weekends, and sun-soaked offshore island retreats.',
    card3Image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80',
    hideAiPlanner: false
  }

  try {
    const fetchedSettings = await client.fetch(`*[_type == "siteSettings"][0]{
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
      card3Image,
      hideAiPlanner
    }`)
    if (fetchedSettings) {
      settings = { ...settings, ...fetchedSettings }
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
        
        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: 'white', marginTop: '-1.5rem' }}>
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
          </div>
        </div>
      </section>

      {/* 🏙️ Section 2: The Core Pillars (Interactive Bento-Grid) */}
      <section style={{ padding: '8rem 0', background: 'var(--bg-main)' }}>
        <div className="container">
          <span style={{ 
            color: 'var(--crimson-primary)', 
            textTransform: 'uppercase', 
            fontWeight: 700, 
            letterSpacing: '0.2em',
            fontSize: '0.8rem',
            display: 'block',
            textAlign: 'center',
            marginBottom: '0.5rem'
          }}>
            Singapore At A Glance
          </span>
          <h2 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '4rem', color: 'var(--text-dark)' }}>
            {settings.itinerarySectionTitle}
          </h2>
          
          <div className="bento-grid">
            {/* Card 1 */}
            <div className="bento-card hover-lift" style={{ 
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.1)), url(${settings.card1Image})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              colorScheme: 'dark'
            }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ 
                  color: 'var(--gold-accent)', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em',
                  display: 'block',
                  marginBottom: '0.35rem'
                }}>{settings.card1Tagline}</span>
                <h3 style={{ 
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', 
                  color: '#FFFFFF', 
                  margin: '0 0 0.5rem 0',
                  lineHeight: 1.25,
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontWeight: 500
                }}>{settings.card1Header}</h3>
                <p style={{ 
                  color: 'rgba(255,255,255,0.88)', 
                  fontSize: '0.92rem', 
                  fontWeight: 300, 
                  lineHeight: 1.65,
                  margin: 0
                }}>{settings.card1Story}</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bento-card hover-lift" style={{ 
              backgroundImage: `linear-gradient(to top, rgba(15,76,58,0.95) 20%, rgba(0,0,0,0.1)), url(${settings.card2Image})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              colorScheme: 'dark'
            }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ 
                  color: 'var(--gold-accent)', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em',
                  display: 'block',
                  marginBottom: '0.35rem'
                }}>{settings.card2Tagline}</span>
                <h3 style={{ 
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', 
                  color: '#FFFFFF', 
                  margin: '0 0 0.5rem 0',
                  lineHeight: 1.25,
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontWeight: 500
                }}>{settings.card2Header}</h3>
                <p style={{ 
                  color: 'rgba(255,255,255,0.88)', 
                  fontSize: '0.92rem', 
                  fontWeight: 300, 
                  lineHeight: 1.65,
                  margin: 0
                }}>{settings.card2Story}</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bento-card hover-lift" style={{ 
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.1)), url(${settings.card3Image})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              colorScheme: 'dark'
            }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ 
                  color: 'var(--gold-accent)', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em',
                  display: 'block',
                  marginBottom: '0.35rem'
                }}>{settings.card3Tagline}</span>
                <h3 style={{ 
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', 
                  color: '#FFFFFF', 
                  margin: '0 0 0.5rem 0',
                  lineHeight: 1.25,
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontWeight: 500
                }}>{settings.card3Header}</h3>
                <p style={{ 
                  color: 'rgba(255,255,255,0.88)', 
                  fontSize: '0.92rem', 
                  fontWeight: 300, 
                  lineHeight: 1.65,
                  margin: 0
                }}>{settings.card3Story}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🛍️ Section 3: The Curated Marketplace */}
      <section style={{ padding: '8rem 0', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
        <div className="container">
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
        </div>
      </section>

      {/* 📈 Section 4: Social Proof & Metrics (The Trust Builder) */}
      <section style={{ padding: '8rem 0', background: 'var(--bg-dark)' }}>
        <div className="container">
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
