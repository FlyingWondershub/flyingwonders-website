import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Corporate Travel Desk & MICE Management | Flying Wonders',
  description: 'Your Strategic Outsourced Corporate Travel Desk. Specialized business travel management, MICE, and offsites for SMEs, IT/ITeS firms, and Indian enterprises.',
  keywords: [
    'Corporate Travel Desk',
    'SME Business Travel India',
    'Corporate MICE Singapore',
    'Company Offsite Organizers',
    'Outsourced Corporate Travel Management',
    'Business Travel Desk Bangalore',
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/corporate-travel',
  },
  openGraph: {
    title: 'Corporate Travel Desk & MICE Management | Flying Wonders',
    description: 'Specialized business travel management for SMEs and growing Indian enterprises.',
    url: 'https://flyingwonders.net/corporate-travel',
    siteName: 'Flying Wonders',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      'name': 'Corporate Travel & MICE Management Desk',
      'provider': {
        '@type': 'TravelAgency',
        'name': 'Flying Wonders Pvt Ltd',
        'url': 'https://flyingwonders.net'
      },
      'serviceType': 'Corporate Travel Management',
      'areaServed': ['India', 'Singapore', 'Malaysia', 'Thailand'],
      'description': 'Outsourced corporate travel desk providing flight and hotel bookings, corporate policy compliance, VIP concierge, and end-to-end MICE event logistics.'
    },
    {
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How does Flying Wonders help SMEs manage corporate business travel?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Flying Wonders acts as an outsourced corporate travel desk, providing direct concierge booking support, automated policy compliance, zero retainer overheads, and consolidated monthly GST invoicing for Indian enterprises.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Do you organize international corporate retreats and MICE events?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes, we specialize in organizing end-to-end corporate offsites, dealer meets, and incentive trips in Singapore, Malaysia, Thailand, and South India, including flight blockings, conference venues, gala dinners, and visa processing.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What payment terms and GST invoicing support are provided for corporate clients?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'We provide 100% compliant Indian GST invoices for input tax credit, centralized company billing options, and flexible credit terms for verified corporate accounts.'
          }
        }
      ]
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://flyingwonders.net/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Corporate Travel', 'item': 'https://flyingwonders.net/corporate-travel' }
      ]
    }
  ]
}

export default function CorporateTravelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
