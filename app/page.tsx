import Link from 'next/link'
import { client } from '../sanity/lib/client'
import MetricsCounter from '../components/MetricsCounter'

export const revalidate = 60 // Revalidate home page every minute

export default async function Home() {
  let settings = {
    heroTitle: 'Where the Future Lives. Experience Singapore.',
    heroSubtitle: 'Discover a global hub of innovation, Michelin-starred heritage, and luxury living wrapped inside a city of tomorrow.',
    whatsappNumber: '+919886171251'
  }

  try {
    const fetchedSettings = await client.fetch(`*[_type == "siteSettings"][0]{
      heroTitle,
      heroSubtitle,
      whatsappNumber
    }`)
    if (fetchedSettings) {
      settings = { ...settings, ...fetchedSettings }
    }
  } catch (err) {
    console.error('Error fetching site settings from Sanity, using defaults:', err)
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
        <div className="hero-crossfade">
          <div className="bg-img" style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=80')",
            filter: 'brightness(0.45)' 
          }}></div>
          <div className="bg-img" style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1600&q=80')",
            filter: 'brightness(0.45)' 
          }}></div>
        </div>
        
        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: 'white' }}>
          <span style={{ 
            color: 'var(--gold-accent)', 
            textTransform: 'uppercase', 
            fontWeight: 700, 
            letterSpacing: '0.2em',
            fontSize: '0.9rem',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            Destination Management Specialist
          </span>
          <h1 style={{ 
            fontSize: 'calc(2.5rem + 2vw)', 
            textShadow: '0 4px 20px rgba(0,0,0,0.8)', 
            letterSpacing: '-0.02em', 
            marginBottom: '1.5rem',
            lineHeight: 1.15
          }}>
            {settings.heroTitle}
          </h1>
          <p style={{ 
            fontSize: 'calc(1rem + 0.3vw)', 
            maxWidth: '800px', 
            margin: '0 auto 3rem auto', 
            opacity: 0.95, 
            fontWeight: 400, 
            lineHeight: 1.6,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)' 
          }}>
            {settings.heroSubtitle}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book" className="btn btn-primary">Plan Your Journey</Link>
            <Link href="/about" className="btn btn-ghost">Explore Business & Investment</Link>
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
            letterSpacing: '0.15em',
            fontSize: '0.85rem',
            display: 'block',
            textAlign: 'center',
            marginBottom: '0.5rem'
          }}>
            Singapore At A Glance
          </span>
          <h2 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '4rem', color: 'var(--text-dark)' }}>
            The Pillars of Excellence
          </h2>
          
          <div className="bento-grid">
            {/* Card 1 */}
            <div className="bento-card hover-lift" style={{ 
              backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.1)), url(https://images.unsplash.com/photo-1626804475315-992d9d1ef035?auto=format&fit=crop&w=600&q=80)', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center', 
              color: 'white' 
            }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ color: 'var(--gold-accent)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>GASTRONOMY & CULTURE</span>
                <h3 style={{ fontSize: '1.6rem', color: '#FFF', margin: '0.25rem 0 0.5rem 0' }}>The Culinary & Culture Capital</h3>
                <p style={{ opacity: 0.9, fontSize: '0.95rem', fontWeight: 300 }}>Taste the world in one square mile. From Michelin-starred hawker stalls to elite sky dining reservations.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bento-card hover-lift" style={{ 
              backgroundImage: 'linear-gradient(to top, rgba(0,70,30,0.95) 20%, rgba(0,0,0,0.1)), url(https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80)', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center', 
              color: 'white' 
            }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ color: '#A3E635', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>SUSTAINABILITY</span>
                <h3 style={{ fontSize: '1.6rem', color: '#FFF', margin: '0.25rem 0 0.5rem 0' }}>The Blueprint of Tomorrow</h3>
                <p style={{ opacity: 0.9, fontSize: '0.95rem', fontWeight: 300 }}>Navigate an eco-futuristic paradise driven by high-density vertical gardens and intelligent smart infrastructure.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bento-card hover-lift" style={{ background: 'var(--bg-dark)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ color: 'var(--gold-accent)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>FINANCE & ASSETS</span>
                <h3 style={{ fontSize: '1.6rem', color: 'var(--gold-accent)', margin: '0.25rem 0 0.5rem 0' }}>The Global Sandbox</h3>
                <p style={{ opacity: 0.85, fontSize: '0.95rem', fontWeight: 300 }}>Scale, invest, and compound wealth in the world's most business-friendly, tax-efficient gateway economy.</p>
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
                title: "Exclusive Heritage & Hawker VIP Food Tour", 
                price: "From ₹8,500/person",
                imageUrl: "https://images.unsplash.com/photo-1626804475315-992d9d1ef035?auto=format&fit=crop&w=500&q=80",
                desc: "Go behind the scenes of Singapore's iconic street food culture with an expert culinary historian guide."
              },
              { 
                title: "Luxury Sentosa Superyacht Yacht Charter", 
                price: "From ₹1,20,000/charter",
                imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=500&q=80",
                desc: "Sail around Singapore's Southern Islands on a crewed luxury catamaran with premium champagne."
              },
              { 
                title: "Artisanal Botanicals & Bespoke Shopping Experience", 
                price: "Bespoke Quote",
                imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=80",
                desc: "Access private ateliers and custom-blend perfume oils infused with rare Singapore orchids."
              }
            ].map((product, idx) => (
              <div key={idx} className="glass hover-lift" style={{ 
                minWidth: '320px', 
                maxWidth: '380px',
                borderRadius: '16px', 
                overflow: 'hidden', 
                scrollSnapAlign: 'start', 
                flexShrink: 0, 
                background: 'var(--bg-main)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ height: '220px', backgroundImage: `url(${product.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                </div>
                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{product.title}</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.75, flex: 1, marginBottom: '1.5rem' }}>{product.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--emerald-secondary)', fontWeight: 800, fontSize: '0.95rem' }}>{product.price}</span>
                    <Link href="/book" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Book Now</Link>
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
            <MetricsCounter prefix="#" end={1} label="Easiest Place to Do Business Worldwide" />
            <MetricsCounter end={6} suffix="M+" label="Annual Moments of Wonder" />
            <MetricsCounter end={50} suffix="%+" label="Green Canopy: The Greenest Urban City on Earth" />
          </div>
        </div>
      </section>
    </div>
  )
}
