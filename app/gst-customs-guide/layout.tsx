import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GST Refund & India Customs Duty Calculator | Flying Wonders',
  description: 'Claim Singapore GST refund (9%) & Dubai VAT refund (5%) at the airport. Calculate India customs duty for Indian tourists arriving from Singapore & Dubai. Interactive calculators, duty-free limits, prohibited items & printable checklist.',
  keywords: [
    'Singapore GST refund Changi airport',
    'Dubai VAT refund tourist',
    'India customs duty calculator',
    'customs duty India from Singapore',
    'customs duty India from Dubai',
    'tourist refund scheme Singapore',
    'Planet Tax Free Dubai',
    'India duty free allowance',
    'GST refund calculator Singapore',
    'customs duty calculator India',
    'Annex I Annex II customs India',
    'ATITHI app customs India',
    'gold customs duty India'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/gst-customs-guide',
  },
  openGraph: {
    title: 'GST Refund & India Customs Duty Calculator | Flying Wonders',
    description: 'Claim your Singapore/Dubai tax refunds at the airport. Know your Indian customs duty-free limits. Interactive calculators for GST refund, customs duty, price comparison & currency declaration.',
    url: 'https://flyingwonders.net/gst-customs-guide',
    siteName: 'Flying Wonders',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

export default function GstCustomsGuideLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'GST Refund & India Customs Duty Calculator',
    'url': 'https://flyingwonders.net/gst-customs-guide',
    'applicationCategory': 'FinanceApplication',
    'operatingSystem': 'Any',
    'description': 'Interactive calculators for Singapore GST refund, Dubai VAT refund, India customs duty, and price comparison for Indian tourists traveling to Singapore and Dubai.',
    'provider': {
      '@type': 'TravelAgency',
      'name': 'Flying Wonders',
      'url': 'https://flyingwonders.net'
    }
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can tourists claim GST refund in Singapore?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Under Singapore\'s Tourist Refund Scheme (TRS), tourists can claim a 9% GST refund on goods purchased from eTRS-participating retailers. Minimum spend is SGD 100 at a single retailer on the same day. Claim at eTRS self-help kiosks at Changi Airport before departure.' }
      },
      {
        '@type': 'Question',
        name: 'What is the duty-free allowance for Indian tourists returning from Singapore?',
        acceptedAnswer: { '@type': 'Answer', text: 'Indian passengers returning from Singapore (Annex-I country) get a duty-free allowance of ₹50,000. This covers general goods. Alcohol is limited to 2 litres, and cigarettes to 100 sticks. Gold has separate limits: 20g for males (₹50,000 value) and 40g for females (₹1,00,000 value).' }
      },
      {
        '@type': 'Question',
        name: 'What is the duty-free allowance from Dubai for Indian customs?',
        acceptedAnswer: { '@type': 'Answer', text: 'Dubai/UAE falls under Annex-II for Indian customs, so the duty-free allowance is only ₹15,000 — significantly lower than the ₹50,000 from Singapore (Annex-I). Alcohol and tobacco limits remain the same at 2 litres and 100 cigarettes respectively.' }
      },
      {
        '@type': 'Question',
        name: 'How do I claim VAT refund at Dubai airport?',
        acceptedAnswer: { '@type': 'Answer', text: 'Shop at retailers displaying the Tax-Free logo, get a Tax-Free Tag on your receipt, then visit Planet Tax Free validation kiosks at the airport. Minimum spend is AED 250 per receipt. Refunds can be collected as cash (max AED 10,000/day) or credited to your card within 3-5 business days.' }
      },
      {
        '@type': 'Question',
        name: 'What happens if I don\'t declare goods at Indian customs?',
        acceptedAnswer: { '@type': 'Answer', text: 'Failing to declare goods above the duty-free limit can result in confiscation of goods, customs duty plus a penalty of up to 5 times the duty amount. Undeclared gold may lead to confiscation and criminal proceedings under the Customs Act.' }
      }
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  )
}
