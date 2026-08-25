import type { Metadata } from 'next'
import CurrencyConverterTool from './CurrencyConverterTool'
import AdBanner from '../../components/AdBanner'

export const metadata: Metadata = {
  title: 'SGD to INR Converter — Live Rate Today 2025 | Flying Wonders',
  description: 'Convert Singapore Dollar to Indian Rupee with live exchange rates. Also convert SGD to MYR. Free real-time currency converter for Singapore travellers from India.',
  keywords: [
    'sgd to inr today',
    'singapore dollar to indian rupee',
    'sgd to inr live rate',
    'sgd to myr converter',
    'singapore dollar exchange rate india',
    'currency converter singapore',
    'sgd inr 2025'
  ],
  openGraph: {
    title: 'SGD to INR Live Rate — Currency Converter | Flying Wonders',
    description: 'Live SGD to INR and SGD to MYR exchange rates with trip meal cost estimator.',
    url: 'https://flyingwonders.net/currency-converter',
    siteName: 'Flying Wonders',
    images: [{ url: '/images/hero/singapore-hero-1.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
  alternates: { canonical: 'https://flyingwonders.net/currency-converter' }
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the SGD to INR exchange rate today?',
      acceptedAnswer: { '@type': 'Answer', text: 'The SGD to INR rate fluctuates daily. Our tool fetches the live rate in real-time. As a general reference, 1 SGD is approximately 62–65 INR, but always check the live rate before your trip.' }
    },
    {
      '@type': 'Question',
      name: 'How much cash should I carry for a 4-day Singapore trip from India?',
      acceptedAnswer: { '@type': 'Answer', text: 'For a 4-day Singapore trip with balanced dining, budget around SGD 800–1200 per person including meals, local transport, and shopping. Use our meal estimator to calculate food costs precisely.' }
    },
    {
      '@type': 'Question',
      name: 'What is the best way to exchange currency for Singapore?',
      acceptedAnswer: { '@type': 'Answer', text: 'Money changers in Singapore (especially at Mustafa Centre or Lucky Plaza) typically offer better rates than airport exchanges. You can also use multi-currency travel cards like Wise or Niyo for competitive rates.' }
    },
    {
      '@type': 'Question',
      name: 'Is SGD accepted in Malaysia (Johor Bahru)?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, Singapore Dollar is widely accepted in Johor Bahru, Malaysia, especially near the border. However, the exchange rate may be unfavourable. It is best to convert to MYR for better value.' }
    }
  ]
}

export default function CurrencyConverterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '4rem' }}>
        <section style={{ background: 'linear-gradient(135deg, #1A365D 0%, #0F4C3A 100%)', color: '#FFF', padding: '2.5rem 1.5rem 3rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em', color: '#D4AF37', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Live Exchange Rate</p>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, margin: '0 0 1rem', fontFamily: 'var(--font-playfair), serif' }}>
              SGD to INR Converter — Live Rate Today
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.85, maxWidth: '560px', margin: '0 auto' }}>
              Real-time Singapore Dollar to Indian Rupee and Malaysian Ringgit converter, plus a trip meal budget estimator for your Singapore holiday.
            </p>
          </div>
        </section>

        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <CurrencyConverterTool />

          {/* AdSense Unit below tool */}
          <AdBanner slotId="currency_converter_slot" category="travel-tools" />

          <section style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A365D', marginBottom: '1rem' }}>
              SGD Exchange Rate Guide for Indian Travellers
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.75, marginBottom: '1rem' }}>
              Planning a trip to Singapore from India? Understanding the Singapore Dollar (SGD) exchange rate is essential for budgeting your holiday. Our live converter pulls the real-time SGD to INR rate, so you always have accurate figures for planning meals, shopping, and attraction tickets.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Universal Studios Singapore', sgd: '83–108 SGD', inr: '~₹5,300–6,900' },
                { label: 'Gardens by the Bay (Domes)', sgd: '28 SGD', inr: '~₹1,800' },
                { label: 'Night Safari', sgd: '49 SGD', inr: '~₹3,100' },
                { label: 'Budget Meal (hawker)', sgd: '5–8 SGD', inr: '~₹320–510' },
                { label: 'MRT Single Journey', sgd: '1–3 SGD', inr: '~₹65–190' },
                { label: 'Mid-range Hotel (per night)', sgd: '150–250 SGD', inr: '~₹9,500–16,000' },
              ].map(item => (
                <div key={item.label} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '0.35rem' }}>{item.label}</div>
                  <div style={{ fontWeight: 800, color: '#0F4C3A', fontSize: '1rem' }}>{item.sgd}</div>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '0.2rem' }}>{item.inr}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A365D', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
            {[
              { q: 'What is the SGD to INR exchange rate today?', a: 'Our tool shows the live rate. As a reference, 1 SGD ≈ ₹62–65 INR, but this fluctuates daily with forex markets.' },
              { q: 'How much cash should I carry for a 4-day Singapore trip?', a: 'Budget approximately SGD 800–1,200 per person for a balanced trip including meals, MRT, and attractions. Use our estimator above for a precise figure.' },
              { q: 'What is the best way to exchange currency for Singapore?', a: 'Money changers at Mustafa Centre or Lucky Plaza in Singapore typically offer the best rates. Multi-currency cards like Wise or Niyo are also excellent.' },
              { q: 'Is SGD accepted in Johor Bahru, Malaysia?', a: 'Yes, SGD is widely accepted near the JB border, though at less favourable rates. Converting to MYR is advisable for better value.' },
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
