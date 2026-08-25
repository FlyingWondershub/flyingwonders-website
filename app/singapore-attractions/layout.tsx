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
    '@graph': [
      {
        '@type': 'ItemList',
        'name': 'Singapore Top Attractions & E-Tickets',
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
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'item': {
              '@type': 'TouristAttraction',
              'name': 'Singapore Cable Car Sky Pass',
              'url': 'https://flyingwonders.net/singapore-attractions'
            }
          }
        ]
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How fast are Singapore attraction e-tickets delivered after payment?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Once your booking is confirmed, official barcoded e-tickets (for Universal Studios Singapore, Gardens by the Bay, Night Safari, etc.) are dispatched instantly directly to your WhatsApp and Email.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Are Singapore attraction tickets open-dated or fixed-date?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Most attraction tickets including Gardens by the Bay double domes, Singapore Cable Car, and DUKW tours are open-dated for maximum travel flexibility. Capacity-controlled attractions such as Universal Studios Singapore and Night Safari are issued for your chosen visit date.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Can travel agents get B2B wholesale rates for Singapore tickets?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, registered travel agents receive instant net wholesale pricing, customizable markup tools, and white-label PDF proposal generation through the Flying Wonders B2B Agent Portal.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What payment options are available for Indian travelers and agents?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'We accept zero-fee ICICI Bank UPI transfers (Google Pay, PhonePe, Paytm, BHIM) with direct INR settlement, net banking, and international credit/debit cards.'
            }
          }
        ]
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://flyingwonders.net/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Singapore Attractions', 'item': 'https://flyingwonders.net/singapore-attractions' }
        ]
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
