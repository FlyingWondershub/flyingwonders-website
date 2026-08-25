import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comprehensive Travel Insurance | Instant Quote & Schengen Visa Compliant Plans',
  description: 'Get instant international and domestic travel insurance quotes with Flying Wonders. Comprehensive medical coverage up to $1M, cashless hospitalisation, baggage loss, trip cancellation protection, and instant policy certificate issuance.',
  keywords: [
    'travel insurance',
    'international travel insurance',
    'schengen visa insurance',
    'medical travel insurance',
    'flight delay compensation insurance',
    'overseas student travel insurance',
    'senior citizen travel insurance',
    'asego travel insurance',
    'flying wonders travel insurance',
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/insurance',
  },
  openGraph: {
    title: 'International Travel Insurance - Flying Wonders',
    description: 'Instant travel insurance quotes with up to $1,000,000 USD medical cover, 24/7 cashless hospital assistance worldwide, trip cancellation protection, and embassy-approved visa certificates.',
    url: 'https://flyingwonders.net/insurance',
    siteName: 'Flying Wonders',
    images: [
      {
        url: 'https://flyingwonders.net/images/insurance-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Flying Wonders Travel Insurance',
      },
    ],
    locale: 'en_SG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Insurance Plans | Flying Wonders',
    description: 'Comprehensive medical coverage, baggage protection & 24/7 global emergency assistance. Compare plans and get covered in minutes.',
    images: ['https://flyingwonders.net/images/insurance-og.jpg'],
  },
}

export default function InsuranceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'InsuranceProduct',
    name: 'Flying Wonders Comprehensive Travel Insurance',
    description: 'Worldwide international travel insurance with emergency medical evacuation, cashless hospital networks, trip cancellation, baggage protection, and Schengen visa compliance.',
    provider: {
      '@type': 'TravelAgency',
      name: 'Flying Wonders Travel',
      url: 'https://flyingwonders.net',
      logo: 'https://flyingwonders.net/icon-512x512.png',
    },
    areaServed: 'Worldwide',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: '450',
      highPrice: '15000',
      offerCount: '4',
    },
  }

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
