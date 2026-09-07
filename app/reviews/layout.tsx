import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Traveler & Agent Reviews | Flying Wonders Singapore DMC',
  description: 'Read verified traveler reviews and B2B partner testimonials for Flying Wonders Singapore holiday packages, attraction tickets, and group tours.',
  keywords: [
    'Flying Wonders Reviews',
    'Singapore DMC Testimonials',
    'Singapore Tour Reviews',
    'Singapore B2B Travel Agent Feedback'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/reviews',
  },
  openGraph: {
    title: 'Traveler & Partner Reviews | Flying Wonders Singapore',
    description: 'Read verified traveler reviews and partner ratings for Flying Wonders Singapore holidays.',
    url: 'https://flyingwonders.net/reviews',
    siteName: 'Flying Wonders',
    images: [
      {
        url: '/images/hero/singapore-hero-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Flying Wonders Reviews',
      }
    ],
    type: 'website',
  },
}

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
