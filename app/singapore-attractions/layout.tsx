import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Singapore Attraction E-Tickets & B2B Rates | Flying Wonders DMC',
  description: 'Book official Singapore attraction tickets. Universal Studios Singapore, Gardens by the Bay, Night Safari, and Cable Car. Instant B2B e-ticket issuance.',
  keywords: [
    'Singapore Attraction Tickets',
    'Universal Studios Singapore E-Tickets',
    'Gardens by the Bay Tickets',
    'Singapore Night Safari B2B Rates',
    'Singapore Tourist Attractions'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/singapore-attractions',
  },
  openGraph: {
    title: 'Singapore Attraction E-Tickets | Flying Wonders DMC',
    description: 'Book official Singapore attraction tickets. Instant e-ticket issuance for B2B agents and travelers.',
    url: 'https://flyingwonders.net/singapore-attractions',
    siteName: 'Flying Wonders',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

export default function AttractionsLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'item': {
          '@type': 'TouristAttraction',
          'name': 'Universal Studios Singapore',
          'url': 'https://flyingwonders.net/singapore-attractions'
        }
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'item': {
          '@type': 'TouristAttraction',
          'name': 'Gardens by the Bay',
          'url': 'https://flyingwonders.net/singapore-attractions'
        }
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'item': {
          '@type': 'TouristAttraction',
          'name': 'Singapore Night Safari',
          'url': 'https://flyingwonders.net/singapore-attractions'
        }
      }
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  )
}
