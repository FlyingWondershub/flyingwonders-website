import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | Flying Wonders DMC',
  description: 'Find answers to common questions regarding Singapore attraction tickets, B2B wholesale rates, visa processing, ICICI UPI payments, and refund policies.',
  alternates: {
    canonical: 'https://flyingwonders.net/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) | Flying Wonders',
    description: 'Everything you need to know about booking with Flying Wonders Singapore DMC.',
    url: 'https://flyingwonders.net/faq',
    siteName: 'Flying Wonders',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Who is Flying Wonders?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Flying Wonders is a registered Singapore Destination Management Company (DMC) with dual operational offices in Singapore and India, providing ground transfers, B2B wholesale rates, and custom holiday packages.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Do you offer B2B wholesale rates for Travel Agents?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes! Registered travel agents get instant access to net B2B rates, custom markup sliders, and white-label PDF/WhatsApp proposal generators via our B2B Portal.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What payment methods do you accept?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'We accept zero-fee ICICI Bank UPI transfers (Google Pay, PhonePe, Paytm, BHIM), direct bank transfers, and international credit/debit cards with 0% extra gateway surcharge.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How fast will I receive my Singapore E-Tickets after paying?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Once payment is verified by our accounts desk with ICICI Bank, official barcoded E-Tickets are dispatched instantly to your WhatsApp & Email.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Do you provide airport transfers and private vehicle charters in Singapore?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes, we operate private 7-seater Combi vans, 13-seater HiAce, and 40-seater coaches for Changi Airport transfers, hotel drop-offs, and cross-border trips to Malaysia.'
          }
        }
      ]
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://flyingwonders.net/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'FAQ', 'item': 'https://flyingwonders.net/faq' }
      ]
    }
  ]
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  )
}
