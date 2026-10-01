import React from 'react'
import { Metadata } from 'next'
import { getDefaultTourEssentialsShowcase } from '../../utils/tourEssentials'
import TourEssentialsShowcaseView from '../../components/TourEssentialsShowcaseView'

export const revalidate = 300 // Revalidate every 5 minutes

export async function generateMetadata(): Promise<Metadata> {
  const showcase = await getDefaultTourEssentialsShowcase()

  const title = showcase?.title
    ? `${showcase.title} | Flying Wonders`
    : 'Singapore & Malaysia Tour Essentials Guide (2026 Edition) | Flying Wonders'

  const description =
    showcase?.heroSubtitle ||
    'A hand-picked editor shortlist of signature travel collections, premier partner hotels, iconic attractions, authentic dining, and retail hubs in Singapore & Malaysia.'

  return {
    title,
    description,
    keywords: [
      'Singapore Tour Essentials',
      'Malaysia Tour Essentials',
      'Curated Tour Guide',
      'Singapore Essentials Guide',
      'Singapore Hotel Shortlist',
      'Best Singapore Attractions 2026',
      'Flying Wonders Services Catalog'
    ],
    openGraph: {
      title,
      description,
      url: 'https://flyingwonders.net/tour-essentials',
      siteName: 'Flying Wonders',
      images: ['/images/hero/singapore-hero-1.jpg'],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/hero/singapore-hero-1.jpg'],
    },
    alternates: {
      canonical: 'https://flyingwonders.net/tour-essentials',
    }
  }
}

export default async function TourEssentialsPage() {
  const showcase = await getDefaultTourEssentialsShowcase()

  if (!showcase) {
    return (
      <div style={{ padding: '5rem 2rem', textAlign: 'center', background: '#F8FAFC', minHeight: '80vh', fontFamily: 'var(--font-inter), sans-serif' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>Tour Essentials Showcase Initializing</h2>
        <p style={{ color: '#64748B', maxWidth: '480px', margin: '0.75rem auto 1.5rem' }}>
          Our destination team is currently compiling the active essentials cards. Please check back shortly.
        </p>
      </div>
    )
  }

  return <TourEssentialsShowcaseView showcase={showcase} />
}
