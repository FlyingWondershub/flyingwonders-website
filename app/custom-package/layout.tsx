import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'B2B Custom Package Builder & Itinerary Generator | Flying Wonders',
  description: 'Design and customize Singapore & regional travel itineraries with live tariff calculators, hotel selection, and instant PDF proposals.',
  alternates: {
    canonical: 'https://flyingwonders.net/custom-package',
  },
}

export default function CustomPackageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
