import Image from 'next/image'
import { client } from '../../sanity/lib/client'
import AdBanner from '../../components/AdBanner'

export const revalidate = 60 // Revalidate page every minute

interface Recognition {
  _id: string
  companyName: string
  logoUrl: string
  url: string
}

export default async function AboutPage() {
  // 1. Fetch site settings & recognition logos from Sanity
  let settings = {
    aboutVisionStatement: 'Flying Wonders is Singapore’s premier B2B Destination Management Company, architecting Group tours , high-end MICE execution and hyper-curated leisure experiences for global travel partners ',
    aboutStoryTitle: 'Our Story & Strategy',
    aboutStoryParagraph1: 'Flying Wonders Private Limited is a specialist Destination Management Company (DMC) based in India & Singapore. We design and deliver premium travel experiences across Singapore, South-East Asia and beyond — for leisure groups, corporate travellers and trade partners who demand more than a standard package.',
    aboutStoryParagraph2: 'With direct hotel partnerships, exclusive ground assets and a passionate team of travel architects, we turn every itinerary into a story worth telling. From iconic Singapore sights to hidden regional gems, Flying Wonders brings the destination to life.',
    aboutStrategicAdvantage: 'We operate and maintain office structures in Both India and Singapore , clients benefits from professional service and local expertise.',
    aboutTrustAndComplianceDesk: '24/7 localized rapid-response crisis desk'
  }
  let recognitions: Recognition[] = []

  try {
    const fetchedSettings = await client.fetch(`*[_type == "siteSettings"][0]{
      aboutVisionStatement,
      aboutStoryTitle,
      aboutStoryParagraph1,
      aboutStoryParagraph2,
      aboutStrategicAdvantage,
      aboutTrustAndComplianceDesk
    }`)
    if (fetchedSettings) {
      settings = { ...settings, ...fetchedSettings }
    }

    recognitions = await client.fetch(`*[_type == "recognition"]{
      _id,
      companyName,
      "logoUrl": logo.asset->url,
      url
    }`)
  } catch (err) {
    console.error('Error fetching about page data from Sanity, using defaults:', err)
  }

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* Vision Statement Top Section */}
      <section style={{ 
        position: 'relative', 
        padding: '8rem 0 6rem 0', 
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', 
        color: 'white', 
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative mesh background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 80% 20%, rgba(212,175,55,0.15) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ 
            color: 'var(--gold-accent)', 
            textTransform: 'uppercase', 
            fontWeight: 700, 
            letterSpacing: '0.25em',
            fontSize: '0.8rem',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            Our Vision
          </span>
          <h1 style={{ 
            fontSize: 'calc(1.8rem + 1.2vw)', 
            fontWeight: 400, 
            fontFamily: 'var(--font-playfair), serif', 
            lineHeight: 1.4, 
            maxWidth: '960px', 
            margin: '0 auto', 
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            fontStyle: 'italic',
            letterSpacing: '0.01em'
          }}>
            &ldquo;{settings.aboutVisionStatement.trim()}&rdquo;
          </h1>
        </div>
      </section>

      {/* Strategic Advantage & Story Section */}
      <section style={{ padding: '6rem 0 4rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          
          {/* Left Text Column */}
          <div>
            <h2 style={{ 
              color: 'var(--primary-blue)', 
              fontSize: '2.5rem', 
              marginBottom: '1.5rem', 
              fontFamily: 'var(--font-playfair), serif',
              fontWeight: 400 
            }}>
              {settings.aboutStoryTitle}
            </h2>
            
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.7, color: 'var(--text-dark)', opacity: 0.85 }}>
              {settings.aboutStoryParagraph1}
            </p>

            {/* Strategic Advantage Highlight Box */}
            <div style={{
              background: 'white',
              borderLeft: '4px solid var(--gold-accent)',
              padding: '1.5rem',
              borderRadius: '0 8px 8px 0',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-blue)', fontWeight: 700 }}>
                Strategic Advantage
              </h4>
              <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text-dark)' }}>
                {settings.aboutStrategicAdvantage}
              </p>
            </div>

            <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--text-dark)', opacity: 0.85 }}>
              {settings.aboutStoryParagraph2}
            </p>
          </div>
          
          {/* Right Image Column */}
          <div style={{ 
            position: 'relative', 
            height: '480px', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            boxShadow: 'var(--shadow-xl)',
            border: '8px solid white' 
          }}>
            <Image 
              src="/images/banner2.jpg" 
              alt="Jewel Changi Singapore"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
      </section>

      {/* 🛑 Trust & Compliance Bar (Footer Section) */}
      <section style={{ padding: '2rem 0' }}>
        <div className="container">
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            
            {/* Top: Section Header */}
            <div>
              <span style={{ 
                display: 'block', 
                fontSize: '0.9rem', 
                textTransform: 'uppercase', 
                fontWeight: 700, 
                letterSpacing: '0.2em', 
                color: 'var(--gold-accent)'
              }}>
                Accredited &amp; Registered
              </span>
            </div>

            {/* Bottom: Association / Logo List */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', alignItems: 'center', justifyContent: 'center' }}>
              {recognitions.map((rec) => (
                <a
                  key={rec._id}
                  href={rec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={rec.companyName}
                  className="association-logo"
                >
                  {rec.logoUrl ? (
                    <Image
                      src={rec.logoUrl}
                      alt={rec.companyName}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '4px',
                      background: '#eee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      padding: '2px',
                      color: '#666'
                    }}>
                      {rec.companyName.split(' ')[0]}
                    </div>
                  )}
                </a>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 🛡️ Secure Payments & PCI-DSS Compliance Section */}
      <section style={{ padding: '2rem 0 4rem 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #0F4C3A 0%, #06261d 100%)',
            borderRadius: '16px',
            padding: '3rem 2rem',
            boxShadow: 'var(--shadow-xl)',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background design accents */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 10% 90%, rgba(197, 168, 128, 0.1) 0%, transparent 60%)',
              pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto' }}>
              <span style={{ 
                color: 'var(--gold-accent)', 
                textTransform: 'uppercase', 
                fontWeight: 700, 
                letterSpacing: '0.2em',
                fontSize: '0.82rem',
                display: 'inline-block',
                marginBottom: '0.75rem'
              }}>
                100% Secure Transaction Desk
              </span>
              <h2 style={{ 
                fontFamily: 'var(--font-playfair), serif', 
                fontSize: '2.2rem', 
                marginBottom: '1.25rem',
                fontWeight: 400,
                color: '#FFF'
              }}>
                Safeguarded by Cashfree Payments
              </h2>
              <p style={{ 
                fontSize: '1.05rem', 
                lineHeight: 1.6, 
                opacity: 0.9, 
                marginBottom: '2.5rem' 
              }}>
                Your booking security is our highest priority. All card transactions, UPI payments, and bank transfers on Flying Wonders are processed securely using <strong>Cashfree Payments</strong>—India&apos;s leading bank-grade payment gateway.
              </p>

              {/* Security Features Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: '2rem', 
                textAlign: 'left' 
              }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🛡️</div>
                  <h4 style={{ color: 'var(--gold-accent)', marginBottom: '0.4rem', fontWeight: 700 }}>PCI-DSS Compliant</h4>
                  <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0 }}>Level 1 Payment Card Industry Data Security Standard certification ensures complete cardholder safety.</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🔒</div>
                  <h4 style={{ color: 'var(--gold-accent)', marginBottom: '0.4rem', fontWeight: 700 }}>256-Bit Encryption</h4>
                  <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0 }}>Secure Socket Layer (SSL) encryption protocols safeguard your personal and financial details end-to-end.</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>⚡</div>
                  <h4 style={{ color: 'var(--gold-accent)', marginBottom: '0.4rem', fontWeight: 700 }}>Instant UPI Autopay</h4>
                  <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0 }}>Enjoy zero-fee payments directly from any active BHIM UPI app with automatic real-time transaction verification.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* AdSense Unit */}
      <div className="container" style={{ padding: '2rem 1.5rem 0' }}>
        <AdBanner slotId="about_bottom_slot" category="general" />
      </div>
      
    </div>
  )
}
