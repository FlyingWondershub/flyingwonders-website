import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live B2B Travel Inquiries & Leads Board | Flying Wonders DMC',
  description: 'Real-time verified travel agent inquiries and supplier requirements from WhatsApp partner groups. Connect directly with requesting agents, hotels, transport, and DMCs.',
  keywords: [
    'B2B Travel Leads',
    'WhatsApp Travel Inquiries',
    'DMC Support Each Other',
    'Travel Agent Requirements',
    'B2B DMC Supplier Exchange',
    'Hotel Deal Requests',
    'Transport Requirements'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/b2b-leads',
  },
  openGraph: {
    title: 'Live B2B Travel Inquiries & Leads Board | Flying Wonders',
    description: 'Real-time verified travel agent inquiries and supplier requirements. Connect directly via WhatsApp.',
    url: 'https://flyingwonders.net/b2b-leads',
    siteName: 'Flying Wonders',
    locale: 'en_US',
    type: 'website',
  },
}

export default function B2BLeadsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {children}
    </div>
  )
}
