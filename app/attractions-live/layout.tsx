import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Singapore Attraction Tickets & Booking | Flying Wonders',
  description: 'Book instant barcoded e-tickets to Universal Studios Singapore, Gardens by the Bay, Night Safari, and Singapore Cable Car.',
  alternates: {
    canonical: 'https://flyingwonders.net/attractions-live',
  },
}

export default function AttractionsLiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
