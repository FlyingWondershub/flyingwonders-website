import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Study in Singapore for Indian Students | Free Guidance | Flying Wonders',
  description: 'Expert guide to studying in Singapore. Explore NUS, NTU, SMU & more. Free consultation for Indian students on courses, costs, MOE scholarships, Student\'s Pass visa process, and post-study work rights.',
  keywords: [
    'Study in Singapore',
    'Study in Singapore for Indian Students',
    'Singapore Universities Admission',
    'NUS NTU SMU Admission India',
    'Cost of studying in Singapore',
    'Singapore Student Visa Process',
    'Singapore Student Pass SOLAR',
    'MOE Tuition Grant Singapore',
    'Singapore scholarships international students',
    'IELTS free admission Singapore',
    'Study abroad Singapore from India',
    'Flying Wonders education consultant Singapore',
  ],
  alternates: {
    canonical: 'https://www.flyingwonders.net/study-in-singapore',
  },
  openGraph: {
    title: 'Study in Singapore for Indian Students | Free Guidance | Flying Wonders',
    description: 'Free expert consultation to study at NUS, NTU, SMU and more. Explore costs, MOE scholarships, Student\'s Pass visa, and career pathways in Singapore.',
    url: 'https://www.flyingwonders.net/study-in-singapore',
    siteName: 'Flying Wonders',
    images: [
      {
        url: '/images/hero/singapore-hero-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Study in Singapore — Flying Wonders Education Consultancy',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study in Singapore | Free Expert Guidance | Flying Wonders',
    description: 'Explore Singapore universities, courses, costs, and scholarships. Free consultation for Indian students.',
    images: ['/images/hero/singapore-hero-1.jpg'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is IELTS required for admission in Singapore?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No — many colleges and universities in Singapore offer internal English assessments instead of requiring IELTS. This is one of Singapore\'s biggest advantages over the UK or Australia, where IELTS is mandatory.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I work part-time while studying in Singapore?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Students enrolled in full-time courses at approved institutions can work up to 16 hours per week during semesters, and full-time during scheduled vacation periods.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the MOE Tuition Grant?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Ministry of Education (MOE) Tuition Grant is a government subsidy that reduces tuition fees by up to 75% for international students, in exchange for a 3-year bond to work for a Singapore-registered company after graduation.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Flying Wonders charge any fee for guidance?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No — our education consultation service is completely free for students. Flying Wonders is an authorised partner of several Singapore institutions, so we earn a referral fee from the university, not from you.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the minimum budget required to study in Singapore?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A conservative annual budget including tuition (Bachelor\'s level), accommodation, food, transport and miscellaneous expenses would be approximately SGD 25,000 – 40,000 per year.',
          },
        },
      ],
    },
    {
      '@type': 'EducationalOrganization',
      name: 'Flying Wonders — Singapore Education Consultancy',
      url: 'https://www.flyingwonders.net/study-in-singapore',
      description: 'Free expert education consultancy helping Indian and international students study at Singapore\'s top universities including NUS, NTU, SMU, Curtin, and SIM.',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+65-9689-0101',
        contactType: 'Customer Service',
        availableLanguage: ['English', 'Hindi', 'Tamil'],
      },
      areaServed: ['India', 'Malaysia', 'Indonesia', 'Singapore'],
      knowsAbout: ['Study in Singapore', 'Student Visa Singapore', 'MOE Tuition Grant', 'NUS Admission', 'NTU Admission'],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.flyingwonders.net/' },
        { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.flyingwonders.net/services-catalog' },
        { '@type': 'ListItem', position: 3, name: 'Study in Singapore', item: 'https://www.flyingwonders.net/study-in-singapore' },
      ],
    },
  ],
}

export default function StudyInSingaporeLayout({ children }: { children: React.ReactNode }) {
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
