import type { Metadata } from 'next'
import FlightTrackerTool from './FlightTrackerTool'

export const metadata: Metadata = {
  title: 'Singapore Flight Tracker — Changi Airport Live Status | Flying Wonders',
  description: 'Track Singapore Changi Airport flights in real time. Check flight arrival and departure status by flight number. Live flight tracker for SQ, AI, EK, QR and all airlines.',
  keywords: [
    'singapore flight tracker',
    'changi airport live flight status',
    'track flight by number',
    'singapore airlines flight tracker',
    'SQ flight status live',
    'changi airport arrivals departures',
    'flight tracker singapore 2025',
    'india to singapore flight status'
  ],
  openGraph: {
    title: 'Live Singapore Flight Tracker — Changi Airport | Flying Wonders',
    description: 'Real-time flight status for all airlines at Singapore Changi Airport.',
    url: 'https://flyingwonders.net/flight-tracker',
    siteName: 'Flying Wonders',
    images: [{ url: '/images/hero/singapore-hero-1.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
  alternates: { canonical: 'https://flyingwonders.net/flight-tracker' }
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I track my Singapore Airlines flight?',
      acceptedAnswer: { '@type': 'Answer', text: 'Enter your Singapore Airlines flight number (e.g. SQ405) in the flight tracker above and click Search. You will see the real-time flight status, departure and arrival times, and current position.' }
    },
    {
      '@type': 'Question',
      name: 'What is the flight time from India to Singapore?',
      acceptedAnswer: { '@type': 'Answer', text: 'Flight time from India to Singapore varies by city: from Chennai or Bangalore it is approximately 4.5–5 hours. From Mumbai it is around 5.5 hours, and from Delhi approximately 6 hours.' }
    },
    {
      '@type': 'Question',
      name: 'Which airlines fly from India to Singapore?',
      acceptedAnswer: { '@type': 'Answer', text: 'Singapore Airlines (SQ), Air India (AI), IndiGo (6E), Scoot (TR), SpiceJet, Vistara, and several other carriers operate direct and one-stop flights between Indian cities and Singapore Changi Airport (SIN).' }
    },
    {
      '@type': 'Question',
      name: 'How far in advance can I track a flight?',
      acceptedAnswer: { '@type': 'Answer', text: 'Our tracker shows live and scheduled status for flights within a 24–48 hour window. For flights beyond that timeframe, check the airline\'s website directly.' }
    }
  ]
}

export default function FlightTrackerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '4rem' }}>
        <section style={{ background: 'linear-gradient(135deg, #1A365D 0%, #0F4C3A 100%)', color: '#FFF', padding: '2.5rem 1.5rem 3rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em', color: '#D4AF37', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Live · Changi Airport (SIN)</p>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, margin: '0 0 1rem', fontFamily: 'var(--font-playfair), serif' }}>
              Singapore Flight Tracker
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.85, maxWidth: '560px', margin: '0 auto' }}>
              Track any flight to or from Singapore Changi Airport in real time. Enter a flight number to see live arrival and departure status.
            </p>
          </div>
        </section>

        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <FlightTrackerTool />

          <section style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A365D', marginBottom: '1rem' }}>
              Popular India–Singapore Flight Numbers
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
              {[
                { airline: 'Singapore Airlines', route: 'BLR → SIN', code: 'SQ 506' },
                { airline: 'Singapore Airlines', route: 'DEL → SIN', code: 'SQ 405' },
                { airline: 'Singapore Airlines', route: 'BOM → SIN', code: 'SQ 425' },
                { airline: 'Air India', route: 'DEL → SIN', code: 'AI 381' },
                { airline: 'IndiGo', route: 'BOM → SIN', code: '6E 16' },
                { airline: 'Scoot', route: 'BLR → SIN', code: 'TR 502' },
              ].map(f => (
                <div key={f.code} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 800, color: '#0F4C3A', fontSize: '1rem', marginBottom: '0.2rem' }}>{f.code}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{f.airline}</div>
                  <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginTop: '0.2rem' }}>{f.route}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A365D', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
            {[
              { q: 'How do I track my Singapore Airlines flight?', a: 'Enter your SQ flight number (e.g. SQ405) in the tracker above. You\'ll see real-time status including departure, arrival, and delays.' },
              { q: 'What is the flight time from India to Singapore?', a: 'From Bangalore/Chennai: ~4.5–5h. From Mumbai: ~5.5h. From Delhi: ~6h.' },
              { q: 'Which airlines fly from India to Singapore?', a: 'Singapore Airlines (SQ), Air India (AI), IndiGo (6E), Scoot (TR), Vistara, and SpiceJet all operate India–Singapore routes.' },
              { q: 'How do I find flight number format?', a: 'Airline code (2 letters) + flight number. Example: SQ for Singapore Airlines, AI for Air India, 6E for IndiGo, TR for Scoot. Check your ticket or booking confirmation.' },
            ].map((faq, i) => (
              <details key={i} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '0.75rem' }}>
                <summary style={{ fontWeight: 700, color: '#1A365D', cursor: 'pointer', fontSize: '0.95rem' }}>{faq.q}</summary>
                <p style={{ color: '#475569', lineHeight: 1.7, marginTop: '0.6rem', fontSize: '0.9rem' }}>{faq.a}</p>
              </details>
            ))}
          </section>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <a href="/travel-tools" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', background: 'linear-gradient(135deg, #0F4C3A, #059669)', color: '#FFF', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
              ← View All Travel Tools
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
