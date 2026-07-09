import Link from 'next/link'
import MetricsCounter from '../components/MetricsCounter'

export default function Home() {
  return (
    <div>
      {/* 🛑 Section 1: The Hero (The First Impression) */}
      <section style={{ position: 'relative', height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        
        {/* CSS Crossfade Background simulating cinematic transition */}
        <div className="hero-crossfade">
          <div className="bg-img" style={{ filter: 'brightness(0.5)' }}></div>
          <div className="bg-img" style={{ filter: 'brightness(0.5)' }}></div>
        </div>
        
        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: 'white' }}>
          <h1 style={{ fontSize: '4.5rem', textShadow: '0 4px 20px rgba(0,0,0,0.8)', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
            Where the Future Lives.<br/> Experience Singapore.
          </h1>
          <p style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 3rem auto', opacity: 0.95, fontWeight: 400, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            Discover a global hub of innovation, Michelin-starred heritage, and luxury living wrapped inside a city of tomorrow.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/packages" className="btn btn-primary">Plan Your Journey</Link>
            <Link href="/about" className="btn btn-ghost">Explore Business & Investment</Link>
          </div>
        </div>
      </section>

      {/* 🏙️ Section 2: The Core Pillars (Interactive Bento-Grid) */}
      <section style={{ padding: '8rem 0', background: 'var(--bg-main)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '4rem', color: 'var(--crimson-primary)' }}>Why Singapore?</h2>
          
          <div className="bento-grid">
            {/* Card 1 */}
            <div className="bento-card hover-lift" style={{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1)), url(/images/banner1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', color: 'white' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--gold-accent)' }}>The Culinary & Culture Capital</h3>
                <p style={{ opacity: 0.9, fontSize: '1rem' }}>Taste the world in one square mile. From humble hawker stalls to world-class fine dining.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bento-card hover-lift" style={{ backgroundImage: 'linear-gradient(to top, rgba(0,168,89,0.9), rgba(0,0,0,0.2)), url(/images/banner2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', color: 'white' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 style={{ fontSize: '1.8rem', color: 'white' }}>The Blueprint of Tomorrow</h3>
                <p style={{ opacity: 0.9, fontSize: '1rem' }}>Step into an eco-futuristic paradise driven by smart infrastructure and zero-carbon goals.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bento-card hover-lift" style={{ background: 'var(--bg-dark)', color: 'white', border: '1px solid var(--gold-accent)' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--gold-accent)' }}>The Global Sandbox</h3>
                <p style={{ opacity: 0.9, fontSize: '1rem' }}>Invest, scale, and thrive in the world’s most seamless, business-first economy.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🛍️ Section 3: The Curated Marketplace */}
      <section style={{ padding: '8rem 0', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--text-dark)', margin: 0 }}>Curated Singaporean Luxuries</h2>
            <Link href="/packages" style={{ color: 'var(--crimson-primary)', fontWeight: 600, textDecoration: 'underline' }}>View All Experiences</Link>
          </div>
          
          {/* Static Carousel Layout (To be wired with Sanity in PackageList.tsx ideally) */}
          <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem', scrollSnapType: 'x mandatory' }}>
            
            {[
              { title: "Exclusive Heritage & Hawker VIP Food Tour", price: "Starting at $450" },
              { title: "Luxury Sentosa Yacht Charters", price: "Starting at $2,500" },
              { title: "Artisanal Singapore Botanicals & Fashion Brands", price: "Personal Shopping" }
            ].map((product, idx) => (
              <div key={idx} className="glass hover-lift" style={{ minWidth: '350px', borderRadius: '16px', overflow: 'hidden', scrollSnapAlign: 'start', flexShrink: 0, background: 'var(--bg-main)' }}>
                <div style={{ height: '250px', background: 'var(--emerald-secondary)', opacity: 0.2 }}>
                  {/* Image Placeholder */}
                </div>
                <div style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--text-dark)' }}>{product.title}</h3>
                  <p style={{ color: 'var(--emerald-secondary)', fontWeight: 700, marginBottom: '1.5rem' }}>{product.price}</p>
                  <Link href="/book" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>Secure Access / Book Now</Link>
                </div>
              </div>
            ))}
            
          </div>
        </div>
      </section>

      {/* 📈 Section 4: Social Proof & Metrics (The Trust Builder) */}
      <section style={{ padding: '8rem 0', background: 'var(--bg-dark)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
            <MetricsCounter prefix="#" end={1} label="Easiest Place to Do Business Worldwide" />
            <MetricsCounter end={6} suffix="M+" label="Annual Moments of Wonder" />
            <MetricsCounter end={50} suffix="%+" label="Green Canopy: The Greenest Urban City on Earth" />
          </div>
        </div>
      </section>
    </div>
  )
}
