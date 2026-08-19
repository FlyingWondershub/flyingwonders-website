import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Karnataka Tour Packages & KSTDC Tours | Bengaluru HOHO Bus | Flying Wonders',
  description: 'Explore Karnataka tour packages with Flying Wonders. Official KSTDC circuits, Mysuru Palace, Hampi UNESCO ruins, Coorg coffee hills, Kabini safari, Gokarna beaches, and Bengaluru Hop-On Hop-Off (HOHO) double-decker bus. Instant WhatsApp booking.',
  keywords: [
    'Karnataka Tour Packages',
    'KSTDC Tour Packages',
    'KSTDC bus tours Bangalore',
    'Bangalore Hop on Hop off bus',
    'KSTDC HOHO service Bangalore',
    'Ambaari double decker bus Bangalore',
    'Mysore tour package from Bangalore',
    'Hampi tour package',
    'Coorg tour package from Bangalore',
    'Kabini safari package',
    'Gokarna Murudeshwar tour package',
    'Belur Halebidu tour',
    'Karnataka Tourism packages',
    'Flying Wonders Karnataka',
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/karnataka',
  },
  openGraph: {
    title: 'Karnataka Tour Packages & KSTDC Tours | Bengaluru HOHO Bus | Flying Wonders',
    description: 'Explore the best of Karnataka: Mysuru, Hampi UNESCO ruins, Coorg hills, Gokarna coast, Kabini safaris, and the Bengaluru HOHO double-decker city tour. Book directly via WhatsApp.',
    url: 'https://flyingwonders.net/karnataka',
    siteName: 'Flying Wonders',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600100397608-f010f443b81a?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'Karnataka Tour Packages — Flying Wonders',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karnataka Tour Packages & KSTDC HOHO Bus Tours | Flying Wonders',
    description: 'Explore Mysuru, Hampi, Coorg, Kabini, Gokarna & Bengaluru HOHO Ambaari Bus tours. Instant WhatsApp assistance.',
    images: ['https://images.unsplash.com/photo-1600100397608-f010f443b81a?w=1200&auto=format&fit=crop&q=80'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'TouristDestination',
      name: 'Karnataka, India',
      description: 'One State, Many Worlds — World-famous heritage in Hampi and Badami, royal palaces in Mysuru, lush coffee estates in Coorg, and pristine beaches in Gokarna.',
      url: 'https://flyingwonders.net/karnataka',
      touristType: ['Heritage', 'Wildlife', 'Ecotourism', 'Pilgrimage', 'City Tour'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the Bengaluru Hop-On Hop-Off (HOHO) Bus service?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The KSTDC Ambaari Hop-On Hop-Off (HOHO) double-decker bus is a tourist sightseeing service covering Bengaluru’s Central Business District landmarks including Vidhana Soudha, High Court, Visvesvaraya Museum, Kasturba Road, and Cubbon Park. Tickets are priced at ₹180 per person with departures from Ravindra Kalakshetra between 10:30 AM and 8:00 PM.',
          },
        },
        {
          '@type': 'Question',
          name: 'How can I book Karnataka & KSTDC tour packages?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can book private customized packages, tempo travellers, and assisted KSTDC tour circuits directly via Flying Wonders on WhatsApp (+65 9689 0101 / India desk). Our team assists with itinerary planning, hotel stays (Mayura / JLR), private cabs, and safari permits.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which are the most popular Karnataka tour circuits?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Top circuits include: 1. Royal Mysuru & Srirangapatna (1-2 Days), 2. North Karnataka UNESCO Circuit covering Hampi, Badami, Pattadakal, Aihole (4-5 Days), 3. Coorg & Chikmagalur Coffee Valleys (3-4 Days), 4. Coastal Karnataka & Gokarna-Murudeshwar (4-5 Days), and 5. Kabini & Bandipur Wildlife Safaris (3 Days).',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the best time to visit Karnataka?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'October to March is the ideal season for heritage sites (Hampi, Badami, Mysuru) and wildlife safaris (Kabini, Bandipur). July to September (Monsoon) is magnificent for waterfalls like Jog Falls, Abbey Falls, and the Western Ghats.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://flyingwonders.net/' },
        { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://flyingwonders.net/services-catalog' },
        { '@type': 'ListItem', position: 3, name: 'Karnataka Tour Packages', item: 'https://flyingwonders.net/karnataka' },
      ],
    },
  ],
}

export default function KarnatakaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
