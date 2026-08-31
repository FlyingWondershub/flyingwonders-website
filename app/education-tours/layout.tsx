import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Singapore Educational Tours for Schools, Colleges & MBA | Flying Wonders',
  description: 'Curated Singapore educational study circuits for K-12 schools, Engineering colleges, and MBA business schools. Hands-on STEM labs, sustainability masterclasses at Marina Barrage, and campus visits to Science Centre, SUTD, SMU, NTU, and NUS.',
  keywords: [
    'Singapore Educational Tours',
    'Singapore School Trips from India',
    'STEM Educational Tours Singapore',
    'Singapore College Study Tours',
    'Singapore MBA Academic Immersion',
    'Science Centre Singapore School Visit',
    'NUS NTU Campus Tour for Students',
    'SUTD Design Thinking Workshop Singapore',
    'Marina Barrage Water Sustainability Tour',
    'Singapore Discovery Centre Student Delegation',
    'Student Group Travel Singapore DMC',
    'Flying Wonders Educational Tours'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/education-tours',
  },
  openGraph: {
    title: 'Singapore Educational Tours & Academic Immersions | Flying Wonders',
    description: 'Custom experiential study circuits for Schools (K–12), Colleges, and MBA Business Schools. Direct laboratory access, faculty briefings, and 1:10 complimentary chaperone packages.',
    url: 'https://flyingwonders.net/education-tours',
    siteName: 'Flying Wonders',
    images: [
      {
        url: '/images/hero/singapore-hero-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Singapore Educational Tours for Schools and Universities — Flying Wonders',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Singapore Educational Tours for Schools & Colleges | Flying Wonders',
    description: 'Curated STEM, sustainability, and university study circuits in Singapore with 1:10 free teacher chaperones and verified safety protocols.',
    images: ['/images/hero/singapore-hero-1.jpg'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'TouristTrip',
      name: 'Singapore Educational Tours & Academic Immersions',
      description: 'Experiential academic immersion circuits in Singapore curated for K-12 Schools, Engineering Colleges, and MBA Business Schools with visits to Science Centre, Discovery Centre, Marina Barrage, SUTD, SMU, NTU, and NUS.',
      provider: {
        '@type': 'TravelAgency',
        name: 'Flying Wonders',
        url: 'https://flyingwonders.net',
        telephone: '+91-98861-71251',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Singapore & Bangalore',
          addressCountry: 'Singapore'
        }
      },
      touristType: ['Students', 'Schools', 'Colleges', 'Universities', 'MBA Cohorts'],
      offers: {
        '@type': 'Offer',
        priceCurrency: 'SGD',
        price: '580',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-01-01'
      }
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How many complimentary slots do teachers or chaperones receive?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Flying Wonders provides 1 complimentary chaperone package (twin-sharing accommodation, all meals, admissions, and coach travel) for every 10 paying students (1:10 ratio).'
          }
        },
        {
          '@type': 'Question',
          name: 'Can itineraries be customized to match specific school curriculums (IB, CBSE, IGCSE, B.Tech)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Daily workshops, laboratory sessions, and guided walkthroughs are tailored to align with specific syllabus learning outcomes such as IB Environmental Systems, CBSE Physics, B.Tech IoT/Robotics, or MBA FinTech.'
          }
        },
        {
          '@type': 'Question',
          name: 'What safety and emergency protocols are in place in Singapore?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Singapore is universally recognized as the world’s safest country for student travel. Flying Wonders provides 24/7 dedicated on-ground tour managers, comprehensive student travel medical & emergency evacuation insurance, and direct hospital network partnerships.'
          }
        },
        {
          '@type': 'Question',
          name: 'Do you cater to dietary requirements like Halal, Pure Vegetarian, and Jain meals?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. All student meal itineraries are fully customized with certified Halal, Pure Vegetarian, Vegan, or Jain meal options prepared by licensed food partners throughout Singapore.'
          }
        }
      ]
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://flyingwonders.net/' },
        { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://flyingwonders.net/services-catalog' },
        { '@type': 'ListItem', position: 3, name: 'Education Tours Singapore', item: 'https://flyingwonders.net/education-tours' }
      ]
    }
  ]
}

export default function EducationToursLayout({ children }: { children: React.ReactNode }) {
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
