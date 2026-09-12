import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ready-Made Singapore Land Packages (No Hotels) | Flying Wonders DMC',
  description: 'Fixed-price pre-configured B2B Singapore land packages for travel agents. Private 13-seater minibus airport transfers, sightseeing admissions, and instant WhatsApp/PDF proposals without hotels.',
  keywords: [
    'Singapore Land Package',
    'Singapore Land Package No Hotel',
    'B2B Singapore Tour Package',
    'Singapore 13 Seater Minibus Package',
    'Singapore Ground Handling DMC',
    'Singapore Land Tour Itinerary',
    'Singapore Land Package Quotation'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/ready-made',
  },
  openGraph: {
    title: 'Ready-Made Singapore Land Packages | Flying Wonders DMC',
    description: 'Instant B2B Land Package quotations without hotels. 13-Seater Minibus transfers, verified sightseeing admissions, and instant PDF/WhatsApp generation.',
    url: 'https://flyingwonders.net/ready-made',
    siteName: 'Flying Wonders',
    images: [
      {
        url: '/images/hero/singapore-hero-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Flying Wonders Ready-Made Land Packages'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function ReadyMadeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
