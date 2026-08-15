import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Singapore & Malaysia Tour Packages | Flying Wonders',
  description: 'Book custom Singapore & Malaysia tour packages. B2B wholesale rates, family holiday packages, and luxury corporate retreats.',
  keywords: [
    'Singapore Tour Packages',
    'Malaysia Tour Packages',
    'Singapore B2B Travel Packages',
    'Singapore Family Holiday'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/packages',
  },
  openGraph: {
    title: 'Singapore & Malaysia Tour Packages | Flying Wonders',
    description: 'Book custom Singapore & Malaysia tour packages. B2B wholesale rates and luxury retreats.',
    url: 'https://flyingwonders.net/packages',
    siteName: 'Flying Wonders',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
