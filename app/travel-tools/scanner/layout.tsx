import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Passport Scanner & Air Ticketing Tool | Flying Wonders DMC',
  description:
    'Free, 100% private in-browser passport scanner for air tickets and hotel bookings. Instantly capture ICAO 9303 MRZ details, check 6-month validity, and 1-click copy airline booking formats.',
  keywords: [
    'Passport Scanner',
    'Passport MRZ Reader',
    'Air Ticket Passport Capture',
    'Hotel Booking Passport Scanner',
    'ICAO 9303 Checksum Validator',
    'Airline Passenger Manifest Generator',
    'Flying Wonders DMC Travel Tools',
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/travel-tools/scanner',
  },
  openGraph: {
    title: 'Passport Scanner & Air Ticketing Tool | Flying Wonders DMC',
    description:
      'Free, unlimited passport scanner for travel agents, flight ticketing, and hotel reservations. 100% private in-browser OCR with checksum verification.',
    url: 'https://flyingwonders.net/travel-tools/scanner',
    siteName: 'Flying Wonders DMC',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

export default function PassportScannerLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Flying Wonders Passport Scanner & Travel Data Capture Tool',
    url: 'https://flyingwonders.net/travel-tools/scanner',
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Any',
    description:
      'Free in-browser passport scanner and ICAO 9303 MRZ reader for air tickets and hotel vouchers. Zero data upload, 100% private client-side processing.',
    provider: {
      '@type': 'TravelAgency',
      name: 'Flying Wonders DMC',
      url: 'https://flyingwonders.net',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  )
}
