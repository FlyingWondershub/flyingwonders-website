import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tailored Travel Consulting for Singapore & Malaysia | Flying Wonders DMC',
  description: 'Book a 1-on-1 video consultation with local Singapore & Malaysia DMC experts. Custom itineraries, VIP on-ground support, and B2B agent circuits. 100% of your fee is credited on booking!',
  keywords: [
    'Singapore Travel Consulting',
    'Malaysia Travel Consultant',
    'Singapore DMC Specialist',
    'Custom Singapore Itinerary Call',
    'B2B Singapore Agent Consultation',
    'Flying Wonders Travel Consulting'
  ],
  openGraph: {
    title: 'Tailored Travel Consulting | Flying Wonders Singapore & Malaysia DMC',
    description: 'Bespoke 1-on-1 travel consulting with licensed local destination experts. 100% fee credited on booking!',
    url: 'https://flyingwonders.net/travel-consulting',
    siteName: 'Flying Wonders',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tailored Travel Consulting | Flying Wonders',
    description: 'Bespoke 1-on-1 travel consulting with licensed local destination experts.',
    images: ['/images/hero/singapore-hero-1.jpg'],
  }
}

export default function TravelConsultingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
