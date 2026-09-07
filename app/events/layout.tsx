import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Singapore Events, Festivals & Concerts 2026 | Flying Wonders',
  description: 'Explore upcoming concerts, cultural festivals, exhibitions, and sporting events in Singapore with Flying Wonders travel packages.',
  alternates: {
    canonical: 'https://flyingwonders.net/events',
  },
  openGraph: {
    title: 'Singapore Events & Festivals Calendar 2026 | Flying Wonders',
    description: 'Upcoming concerts, exhibitions, and cultural festivals in Singapore.',
    url: 'https://flyingwonders.net/events',
    siteName: 'Flying Wonders',
    type: 'website',
  },
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
