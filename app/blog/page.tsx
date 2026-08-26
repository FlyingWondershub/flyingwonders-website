import type { Metadata } from 'next'
import BlogFeedClient from './BlogFeedClient'
import { getAllBlogArticles } from '../../utils/blog'

export const revalidate = 600 // ISR: revalidate every 10 minutes

export const metadata: Metadata = {
  title: 'Singapore Travel Guides, Itineraries & Insider Stories | Flying Wonders',
  description: 'Explore curated Singapore travel guides, attraction ticket tips, hawker food guides, hotel reviews, and transport hacks written by Flying Wonders DMC specialists.',
  keywords: [
    'Singapore Travel Blog',
    'Singapore Guides',
    'Singapore Attractions Guide 2026',
    'Singapore Itinerary',
    'Universal Studios Singapore Tips',
    'Gardens by the Bay Guide'
  ],
  alternates: {
    canonical: 'https://flyingwonders.net/blog',
  },
  openGraph: {
    title: 'Singapore Travel Guides & Stories | Flying Wonders DMC',
    description: 'Insider attraction tips, hawker secrets, itineraries, and transport hacks curated by Flying Wonders DMC specialists.',
    url: 'https://flyingwonders.net/blog',
    siteName: 'Flying Wonders',
    images: [
      {
        url: '/images/hero/singapore-hero-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Flying Wonders Singapore Travel Blog'
      }
    ],
    type: 'website',
  },
}

export default async function BlogFeedPage() {
  const articles = await getAllBlogArticles()

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', minHeight: '80vh', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Blog Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.75rem, 5vw, 2.3rem)', color: 'var(--emerald-secondary)', margin: '0 0 0.4rem 0', lineHeight: '1.2' }}>
          Singapore Travel Guides & Stories
        </h1>
        <p style={{ color: 'var(--text-dark)', opacity: 0.85, maxWidth: '650px', margin: '0 auto', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', lineHeight: '1.5' }}>
          Insider attraction tips, hawker secrets, itineraries, and transport hacks curated by Flying Wonders DMC specialists.
        </p>
      </div>

      {/* Pre-rendered Interactive Blog Feed Client */}
      <BlogFeedClient initialArticles={articles} />

    </div>
  )
}
