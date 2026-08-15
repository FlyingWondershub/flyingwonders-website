import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Singapore Itinerary Planner | Flying Wonders DMC',
  description: 'Generate custom AI-powered travel itineraries for Singapore and Malaysia. Optimize your route, meal plans, and attraction schedules instantly.',
  keywords: [
    'Singapore AI Itinerary Planner',
    'AI Travel Planner Singapore',
    'Smart Route Optimizer',
    'Singapore Custom Itinerary'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/ai-planner',
  },
  openGraph: {
    title: 'AI Singapore Itinerary Planner | Flying Wonders',
    description: 'Generate custom AI-powered travel itineraries for Singapore instantly.',
    url: 'https://flyingwonders.net/ai-planner',
    siteName: 'Flying Wonders',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

export default function AIPlannerLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'AI Singapore Itinerary Planner',
    'url': 'https://flyingwonders.net/ai-planner',
    'applicationCategory': 'TravelApplication',
    'operatingSystem': 'Any',
    'description': 'An AI-powered tool to generate custom, optimized travel itineraries for Singapore and Malaysia.',
    'provider': {
      '@type': 'TravelAgency',
      'name': 'Flying Wonders'
    }
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  )
}
