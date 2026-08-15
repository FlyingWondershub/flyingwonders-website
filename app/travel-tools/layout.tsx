import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Singapore Travel Tools & Web Apps | Flying Wonders DMC',
  description: 'Free interactive travel tools for Singapore. Live flight trackers, SGAC/MDAC official portals, border traffic cameras, and visa checkers.',
  keywords: [
    'Singapore Travel Tools',
    'Flight Tracker Singapore',
    'Woodlands Checkpoint Traffic',
    'SGAC Arrival Card',
    'MDAC Malaysia',
    'Singapore Visa Checker'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/travel-tools',
  },
  openGraph: {
    title: 'Singapore Travel Tools | Flying Wonders',
    description: 'Free interactive travel tools for Singapore: Live flight trackers, SGAC portal, border cameras, and currency converters.',
    url: 'https://flyingwonders.net/travel-tools',
    siteName: 'Flying Wonders',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

export default function TravelToolsLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Flying Wonders Travel Tools Suite',
    'url': 'https://flyingwonders.net/travel-tools',
    'applicationCategory': 'TravelApplication',
    'operatingSystem': 'Any',
    'description': 'A comprehensive suite of free interactive travel tools including live flight trackers, border traffic cameras, visa checkers, and official arrival card portals for Singapore and Malaysia.',
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
