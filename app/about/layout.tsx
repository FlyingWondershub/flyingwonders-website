import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Flying Wonders | Premier Singapore DMC',
  description: 'Learn about Flying Wonders, a leading Destination Management Company (DMC) operating in Singapore and India, providing B2B travel agent partnerships.',
  keywords: [
    'About Flying Wonders',
    'Singapore DMC',
    'Travel Agent Partner Singapore',
    'Destination Management Company'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/about',
  },
  openGraph: {
    title: 'About Flying Wonders | Premier Singapore DMC',
    description: 'Learn about Flying Wonders, a leading Destination Management Company (DMC) operating in Singapore and India.',
    url: 'https://flyingwonders.net/about',
    siteName: 'Flying Wonders',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
