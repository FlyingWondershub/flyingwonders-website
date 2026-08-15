import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Flying Wonders | Singapore DMC Support',
  description: 'Get in touch with Flying Wonders via WhatsApp, Email, or Phone. Expert Singapore DMC support for B2B agents and travelers in India and Singapore.',
  keywords: [
    'Contact Flying Wonders',
    'Singapore DMC Contact',
    'Travel Agent Support Singapore'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/contact',
  },
  openGraph: {
    title: 'Contact Flying Wonders | Singapore DMC',
    description: 'Get in touch with Flying Wonders via WhatsApp, Email, or Phone.',
    url: 'https://flyingwonders.net/contact',
    siteName: 'Flying Wonders',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'name': 'Contact Flying Wonders',
    'url': 'https://flyingwonders.net/contact',
    'description': 'Contact page for Flying Wonders DMC'
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  )
}
