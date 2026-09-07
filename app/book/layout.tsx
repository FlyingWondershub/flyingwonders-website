import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book Your Singapore Tour Package | Flying Wonders',
  description: 'Complete your Singapore travel package reservation with direct bank transfers and instant booking confirmation.',
  alternates: {
    canonical: 'https://flyingwonders.net/book',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
