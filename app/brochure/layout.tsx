import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Singapore Travel Brochure & Itineraries | Flying Wonders DMC',
  description: 'Download the comprehensive Singapore travel brochure and wholesale B2B itinerary tariff booklet from Flying Wonders.',
  alternates: {
    canonical: 'https://flyingwonders.net/brochure',
  },
}

export default function BrochureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
