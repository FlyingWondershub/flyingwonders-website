import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Secure Online Payment Portal | Flying Wonders',
  description: 'Pay securely for Flying Wonders Singapore travel bookings via ICICI UPI QR, card checkout, or bank transfers.',
  alternates: {
    canonical: 'https://flyingwonders.net/pay',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
