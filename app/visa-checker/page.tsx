import type { Metadata } from 'next'
import VisaCheckerTool from './VisaCheckerTool'
import AdBanner from '../../components/AdBanner'

export const metadata: Metadata = {
  title: 'Visa Requirements Checker — Do I Need a Visa? | Flying Wonders',
  description: 'Instantly check visa requirements between any two countries. Find out if Indians need a visa for Singapore, Malaysia, Japan, UAE and 200+ destinations. Free live visa checker tool.',
  keywords: [
    'visa requirements checker',
    'do indians need visa for singapore',
    'india to singapore visa',
    'india to malaysia visa free',
    'visa on arrival countries for india',
    'singapore visa for indian passport',
    'e-visa requirements',
    'travel visa checker tool 2025'
  ],
  openGraph: {
    title: 'Live Visa Requirements Checker | Flying Wonders',
    description: 'Check visa requirements for 200+ country pairs instantly. Powered by real-time data.',
    url: 'https://flyingwonders.net/visa-checker',
    siteName: 'Flying Wonders',
    images: [{ url: '/images/hero/singapore-hero-1.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
  alternates: { canonical: 'https://flyingwonders.net/visa-checker' }
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do Indians need a visa for Singapore?',
      acceptedAnswer: { '@type': 'Answer', text: 'Indian passport holders require a visa to enter Singapore. You can apply for a Singapore tourist visa (30-day single entry) online or through a registered travel agent. The visa fee is approximately SGD 30.' }
    },
    {
      '@type': 'Question',
      name: 'Do Indians need a visa for Malaysia?',
      acceptedAnswer: { '@type': 'Answer', text: 'As of December 2023, Indian passport holders enjoy visa-free entry to Malaysia for up to 30 days for tourism purposes under a special bilateral arrangement.' }
    },
    {
      '@type': 'Question',
      name: 'Which countries offer visa on arrival for Indian passport holders?',
      acceptedAnswer: { '@type': 'Answer', text: 'Indian passport holders can get visa on arrival in countries including Thailand, Sri Lanka, Maldives, Indonesia, and several others. Always verify current requirements before travel.' }
    },
    {
      '@type': 'Question',
      name: 'How do I use the visa checker tool?',
      acceptedAnswer: { '@type': 'Answer', text: 'Enter your passport country as a 2-letter ISO code (e.g. IN for India) and your destination country code (e.g. SG for Singapore), then click Check Visa. Results show visa type, maximum stay duration, and official links.' }
    },
    {
      '@type': 'Question',
      name: 'Is the visa information accurate and up to date?',
      acceptedAnswer: { '@type': 'Answer', text: 'Our visa data is sourced from a regularly updated international database. However, visa policies can change. Always verify with the official embassy or consulate before making travel plans.' }
    }
  ]
}

const toolSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visa Requirements Checker',
  url: 'https://flyingwonders.net/visa-checker',
  description: 'Free live tool to check visa requirements between any two countries using 2-letter ISO country codes.',
  applicationCategory: 'TravelApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  provider: { '@type': 'TravelAgency', name: 'Flying Wonders', url: 'https://flyingwonders.net' }
}

export default function VisaCheckerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />

      <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '4rem' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)', color: '#FFF', padding: '2.5rem 1.5rem 3rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em', color: '#D4AF37', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Travel Tool · 200+ Countries</p>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, margin: '0 0 1rem', fontFamily: 'var(--font-playfair), serif' }}>
              Live Visa Requirements Checker
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.85, maxWidth: '560px', margin: '0 auto' }}>
              Instantly find out if you need a visa, visa on arrival, or e-visa for your destination — for any passport, any country.
            </p>
          </div>
        </section>

        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          {/* Tool Widget */}
          <VisaCheckerTool />

          {/* AdSense Unit below tool */}
          <AdBanner slotId="visa_checker_slot" category="travel-tools" />

          {/* Info Section */}
          <section style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A365D', marginBottom: '1rem' }}>
              About This Visa Checker
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.75, marginBottom: '1rem' }}>
              Our visa requirements checker uses live international travel data to instantly tell you whether you need a visa, can get one on arrival, apply for an e-visa, or enter visa-free. Simply enter your passport country and destination using standard 2-letter ISO codes.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
              {[
                { flag: '🇮🇳', label: 'India', code: 'IN' },
                { flag: '🇸🇬', label: 'Singapore', code: 'SG' },
                { flag: '🇲🇾', label: 'Malaysia', code: 'MY' },
                { flag: '🇯🇵', label: 'Japan', code: 'JP' },
                { flag: '🇦🇪', label: 'UAE', code: 'AE' },
                { flag: '🇹🇭', label: 'Thailand', code: 'TH' },
                { flag: '🇬🇧', label: 'UK', code: 'GB' },
                { flag: '🇺🇸', label: 'USA', code: 'US' },
              ].map(c => (
                <div key={c.code} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.6rem 0.85rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: '0.2rem' }}>{c.flag}</span>
                  {c.label} <span style={{ color: '#94A3B8' }}>({c.code})</span>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A365D', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
            {[
              { q: 'Do Indians need a visa for Singapore?', a: 'Yes, Indian passport holders require a visa for Singapore. You can apply online or through a registered travel agent. The tourist visa allows a 30-day stay.' },
              { q: 'Do Indians need a visa for Malaysia?', a: 'No — as of December 2023, Indian passport holders enjoy visa-free entry to Malaysia for up to 30 days for tourism.' },
              { q: 'Which countries offer visa on arrival for Indian passport holders?', a: 'Thailand, Sri Lanka, Maldives, Indonesia, Cambodia, and several others offer visa on arrival to Indian nationals. Always verify before travel.' },
              { q: 'How do I find my country ISO code?', a: 'Use 2-letter codes: IN = India, SG = Singapore, MY = Malaysia, JP = Japan, AE = UAE, TH = Thailand, US = USA, GB = United Kingdom.' },
              { q: 'Is this tool free to use?', a: 'Yes, completely free. No registration required.' },
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
