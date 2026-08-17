import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Study in Singapore for Indian Students | Flying Wonders DMC',
  description: 'Comprehensive guide to study in Singapore. Explore top universities, popular courses, costs of study, scholarships (MOE Tuition Grant), visa processes, and B2B educational support.',
  keywords: [
    'Study in Singapore',
    'Study in Singapore for Indian Students',
    'Singapore Universities',
    'Cost of studying in Singapore',
    'Singapore Student Visa Process',
    'NUS Nanyang Curtin SMU'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/study-in-singapore',
  },
  openGraph: {
    title: 'Study in Singapore for Indian Students | Flying Wonders DMC',
    description: 'Explore top universities, popular courses, costs, and visa processes to study in Singapore.',
    url: 'https://flyingwonders.net/study-in-singapore',
    siteName: 'Flying Wonders',
    images: ['/images/hero/singapore-hero-1.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

export default function StudyInSingaporeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
