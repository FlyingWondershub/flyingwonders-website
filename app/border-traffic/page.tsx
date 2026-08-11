import type { Metadata } from 'next'
import BorderTrafficTool from './BorderTrafficTool'

export const metadata: Metadata = {
  title: 'JB Singapore Border Traffic Live — Woodlands & Tuas Checkpoint | Flying Wonders',
  description: 'Live Johor Bahru Singapore checkpoint wait times. Check Woodlands and Tuas border crossing congestion before you travel. Updated in real time.',
  keywords: [
    'jb singapore border traffic',
    'woodlands checkpoint wait time today',
    'tuas checkpoint live update',
    'johor bahru singapore crossing time',
    'jb causeway traffic now',
    'second link traffic live',
    'singapore malaysia border crossing 2025'
  ],
  openGraph: {
    title: 'JB–Singapore Live Border Traffic | Flying Wonders',
    description: 'Real-time Woodlands & Tuas checkpoint congestion levels. Plan your crossing smart.',
    url: 'https://flyingwonders.net/border-traffic',
    siteName: 'Flying Wonders',
    images: [{ url: '/images/hero/singapore-hero-1.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
  alternates: { canonical: 'https://flyingwonders.net/border-traffic' }
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are the peak hours for Woodlands Checkpoint?',
      acceptedAnswer: { '@type': 'Answer', text: 'Peak hours at Woodlands Checkpoint are typically weekday mornings (7–9am) and evenings (5–8pm), as well as Friday nights and Sunday evenings. Public holidays also see heavy congestion.' }
    },
    {
      '@type': 'Question',
      name: 'Is Tuas Checkpoint less busy than Woodlands?',
      acceptedAnswer: { '@type': 'Answer', text: 'Tuas Second Link (also called the Second Causeway) is generally less congested than Woodlands Checkpoint, especially for private vehicles. However, it is located further west and may add travel time.' }
    },
    {
      '@type': 'Question',
      name: 'How long does it take to cross JB–Singapore border?',
      acceptedAnswer: { '@type': 'Answer', text: 'Crossing times vary from 15 minutes during off-peak hours to 2–3 hours during peak times. Always check live traffic before departure.' }
    },
    {
      '@type': 'Question',
      name: 'Can I walk across the Johor–Singapore Causeway?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, pedestrians can cross via the walkway on the Causeway (Woodlands). Buses (SBS/Causeway Link) also shuttle between JB Sentral and Singapore\'s Woodlands or Queen Street Terminal.' }
    }
  ]
}

export default function BorderTrafficPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '4rem' }}>
        <section style={{ background: 'linear-gradient(135deg, #1A365D 0%, #0F4C3A 100%)', color: '#FFF', padding: '2.5rem 1.5rem 3rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em', color: '#D4AF37', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Live Data · Updated Every Hour</p>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, margin: '0 0 1rem', fontFamily: 'var(--font-playfair), serif' }}>
              JB–Singapore Border Traffic Live
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.85, maxWidth: '560px', margin: '0 auto' }}>
              Check real-time congestion at Woodlands Checkpoint and Tuas Second Link before crossing the Singapore–Johor Bahru border.
            </p>
          </div>
        </section>

        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <BorderTrafficTool />

          <section style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A365D', marginBottom: '1rem' }}>
              How to Cross JB–Singapore Border Smart
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              The Johor Bahru–Singapore border is one of the busiest land crossings in the world, with over 300,000 crossings daily. Timing your crossing correctly can save you hours of waiting. Our live border traffic tool pulls real-time data from official traffic sources so you can plan your trip efficiently.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { title: '🟢 Best Times to Cross', items: ['Mon–Thu: 10am–4pm', 'Weekday mornings before 7am', 'Late night after 11pm'] },
                { title: '🔴 Peak Congestion Times', items: ['Friday evenings 5–10pm', 'Sunday evenings 5–10pm', 'Public holiday weekends'] },
                { title: '🚌 Transport Options', items: ['Causeway Link buses (CW1, CW2)', 'SBS Trans 160/170 buses', 'Private shuttle services'] },
              ].map(card => (
                <div key={card.title} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontWeight: 800, color: '#1A365D', marginBottom: '0.75rem', fontSize: '0.95rem' }}>{card.title}</div>
                  <ul style={{ margin: 0, padding: '0 0 0 1.1rem', color: '#475569', fontSize: '0.85rem', lineHeight: 1.8 }}>
                    {card.items.map(i => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A365D', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
            {[
              { q: 'What are the peak hours for Woodlands Checkpoint?', a: 'Peak hours are weekday mornings (7–9am), evenings (5–8pm), Friday nights, and Sunday evenings. Public holidays also see heavy congestion.' },
              { q: 'Is Tuas Checkpoint less busy than Woodlands?', a: 'Tuas Second Link is generally less congested for private vehicles, but it is further west and adds travel time to central Singapore.' },
              { q: 'How long does crossing the JB–Singapore border take?', a: 'Off-peak: 15–30 minutes. Peak times: 1–3 hours. Always check live traffic before you leave.' },
              { q: 'Can I walk across the Johor–Singapore Causeway?', a: 'Yes! Pedestrians can use the Causeway walkway. Causeway Link and SBS buses also connect JB Sentral to Woodlands and Queen Street terminal.' },
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
