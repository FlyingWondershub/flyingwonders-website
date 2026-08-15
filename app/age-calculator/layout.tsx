import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Singapore Ticket Age Calculator | Flying Wonders DMC',
  description: 'Instantly calculate infant, child, and adult ticket categories for Singapore Airlines, Universal Studios, and Gardens by the Bay.',
  keywords: [
    'Singapore Ticket Age Calculator',
    'Universal Studios Child Age',
    'Singapore Airlines Infant Ticket',
    'Gardens by the Bay Child Age'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/age-calculator',
  },
  openGraph: {
    title: 'Singapore Ticket Age Calculator',
    description: 'Instantly calculate ticket categories for attractions and flights.',
    url: 'https://flyingwonders.net/age-calculator',
    siteName: 'Flying Wonders',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

export default function AgeCalculatorLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Singapore Attraction & Flight Ticket Age Calculator',
    'url': 'https://flyingwonders.net/age-calculator',
    'applicationCategory': 'TravelApplication',
    'operatingSystem': 'Any',
    'description': 'A tool to calculate exact age at the time of travel to determine infant, child, or adult ticket categories for Singapore attractions and flights.',
    'provider': {
      '@type': 'TravelAgency',
      'name': 'Flying Wonders'
    }
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  )
}
