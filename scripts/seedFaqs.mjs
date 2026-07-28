import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const token = process.env.SANITY_WRITE_TOKEN
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8xtd7yiv'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

if (!token) {
  console.error('SANITY_WRITE_TOKEN is missing in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false
})

const FAQS_TO_SEED = [
  {
    question: 'Who is Flying Wonders?',
    answer: 'Flying Wonders is a registered Singapore Destination Management Company (DMC) with dual operational offices in Singapore and India, providing ground transfers, B2B wholesale rates, and custom holiday packages.',
    category: 'general',
    sortOrder: 1,
    isActive: true
  },
  {
    question: 'Do you offer B2B wholesale rates for Travel Agents?',
    answer: 'Yes! Registered travel agents get instant access to net B2B rates, custom markup sliders, and white-label PDF/WhatsApp proposal generators via our B2B Portal (/custom-package).',
    category: 'general',
    sortOrder: 2,
    isActive: true
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept zero-fee ICICI Bank UPI transfers (Google Pay, PhonePe, Paytm, BHIM), direct bank transfers, and international credit/debit cards.',
    category: 'payments',
    sortOrder: 3,
    isActive: true
  },
  {
    question: 'How is the SGD to INR exchange rate calculated?',
    answer: 'Package and ticket prices configured in SGD are converted to INR in real-time based on live international central bank exchange rates (Frankfurter API) plus your configured markup.',
    category: 'payments',
    sortOrder: 4,
    isActive: true
  },
  {
    question: 'Is there any hidden gateway fee for paying via ICICI UPI QR?',
    answer: 'No! Paying via our ICICI Bank UPI QR code carries 0% transaction or gateway surcharge fees.',
    category: 'payments',
    sortOrder: 5,
    isActive: true
  },
  {
    question: 'Are attraction tickets open-dated or fixed-date?',
    answer: 'Most tickets (like Gardens by the Bay, Cable Car, and DUKW Tour) are open-dated for maximum travel flexibility. Time-slot specific attractions (like Universal Studios or Night Safari) are issued for your chosen travel dates.',
    category: 'tickets',
    sortOrder: 6,
    isActive: true
  },
  {
    question: 'How fast will I receive my Singapore E-Tickets after paying?',
    answer: 'Once your UTR reference or payment is verified by our accounts desk with ICICI Bank, your official barcoded E-Tickets are dispatched instantly to your WhatsApp & Email.',
    category: 'tickets',
    sortOrder: 7,
    isActive: true
  },
  {
    question: 'Can I customize my day-by-day attraction itinerary?',
    answer: 'Yes! Use our interactive Singapore Attractions Builder (/singapore-attractions) to pick tickets, assign trip dates, and generate an instant PDF quote.',
    category: 'tickets',
    sortOrder: 8,
    isActive: true
  },
  {
    question: 'Do you provide airport transfers and private vehicle charters?',
    answer: 'Yes, we operate private 7-seater Combi vans, 13-seater HiAce, and 40-seater coaches for seamless Changi Airport transfers and hotel drop-offs.',
    category: 'visas',
    sortOrder: 9,
    isActive: true
  },
  {
    question: 'Do you assist with Singapore Visas?',
    answer: 'We connect you with an Authorized Visa Agent for Visas and usual Singapore Visa processing time is 5 working days.',
    category: 'visas',
    sortOrder: 10,
    isActive: true
  },
  {
    question: 'What is your cancellation and refund policy?',
    answer: 'Non-issued tickets and flexible packages can be cancelled according to our official Refund & Cancellation Policy.',
    category: 'refunds',
    sortOrder: 11,
    isActive: true
  },
  {
    question: 'What happens if an outdoor attraction is closed due to heavy rain?',
    answer: 'Singapore attractions operate rain or shine. For severe weather closures, date adjustments or alternative indoor ticket replacements are arranged by our ground desk.',
    category: 'refunds',
    sortOrder: 12,
    isActive: true
  }
]

async function seed() {
  console.log('Seeding FAQs to Sanity...')
  for (const faq of FAQS_TO_SEED) {
    const existing = await client.fetch(`*[_type == "faqItem" && question == $q][0]`, { q: faq.question })
    if (existing) {
      console.log(`Updating existing FAQ: "${faq.question}"`)
      await client.patch(existing._id).set(faq).commit()
    } else {
      console.log(`Creating new FAQ: "${faq.question}"`)
      await client.create({ _type: 'faqItem', ...faq })
    }
  }
  console.log('Successfully seeded all FAQs into Sanity!')
}

seed().catch(err => {
  console.error('Error seeding FAQs:', err)
  process.exit(1)
})
