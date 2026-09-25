import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Customer Invoice Portal & Generator | Flying Wonders DMC',
  description: 'View, verify, pay, and download official Tax Invoices and Payment Receipts for Flying Wonders Singapore travel packages and services.',
  alternates: {
    canonical: 'https://flyingwonders.net/invoice',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
