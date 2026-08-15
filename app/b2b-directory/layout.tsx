import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Singapore B2B Travel Agent Directory & Wholesale Rates | Flying Wonders DMC',
  description: 'Exclusive Singapore DMC B2B agent portal. Access wholesale rates for Universal Studios, Gardens by the Bay, custom itineraries, and direct contact details.',
  keywords: [
    'Singapore B2B Travel Agent',
    'Singapore DMC Wholesale Rates',
    'B2B Singapore Attraction Tickets',
    'Singapore Travel Agent Directory',
    'Flying Wonders B2B Portal'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/b2b-directory',
  },
  openGraph: {
    title: 'Singapore B2B Travel Agent Directory | Flying Wonders',
    description: 'Exclusive B2B access to wholesale rates, custom itineraries, and attraction tickets for Singapore.',
    url: 'https://flyingwonders.net/b2b-directory',
    siteName: 'Flying Wonders',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

export default function B2BDirectoryLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Singapore B2B Travel Agent Directory',
    'url': 'https://flyingwonders.net/b2b-directory',
    'description': 'A comprehensive directory of B2B wholesale rates and services provided by Flying Wonders DMC for travel agents.',
    'audience': {
      '@type': 'Audience',
      'audienceType': 'Travel Agents'
    },
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
