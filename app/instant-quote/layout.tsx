import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Instant Singapore Tour Package Quote & Price Calculator | Flying Wonders',
  description: 'Calculate instant customized Singapore package estimates including hotels, transfers, attractions, and visa costs.',
  alternates: {
    canonical: 'https://flyingwonders.net/instant-quote',
  },
}

export default function InstantQuoteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
