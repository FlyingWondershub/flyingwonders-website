import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Singapore & Malaysia Destination Services Catalog 2026 | Flying Wonders',
  description: 'Explore our complete destination management inventory for Singapore & Malaysia: Hotels, Attractions, Partner Restaurants, Licensed Tour Guides, 2N/3N/4N City Tours, and B2B Package Circuits.',
  keywords: [
    'Singapore Services Catalog',
    'Singapore Hotel Inventory',
    'Singapore Attraction Catalogue',
    'Singapore Indian Restaurants Group Dining',
    'Singapore Licensed Tour Guides',
    'Malaysia B2B Tour Packages',
    'Singapore City Tours 2N 3N 4N'
  ],
  openGraph: {
    title: 'Singapore & Malaysia Services Catalog | Flying Wonders DMC',
    description: 'Browse complete inventory of Hotels, Attractions, Dining, Tour Guides, and Short Tours in Singapore & Malaysia.',
    url: 'https://flyingwonders.net/services-catalog',
    siteName: 'Flying Wonders',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Singapore & Malaysia Services Catalog | Flying Wonders',
    description: 'Browse complete inventory of Hotels, Attractions, Dining, Tour Guides, and Short Tours in Singapore & Malaysia.',
    images: ['/images/hero/singapore-hero-1.jpg'],
  }
}

export default function ServicesCatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
