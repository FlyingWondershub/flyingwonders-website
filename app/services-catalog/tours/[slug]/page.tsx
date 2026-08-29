import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllTours, getTourBySlug, slugifyTourTitle } from '../../../../utils/tours'
import AdBanner from '../../../../components/AdBanner'
import TourDetailClient from '../../../../components/TourDetailClient'

export const revalidate = 600

export async function generateStaticParams() {
  const tours = await getAllTours()
  return tours.map(t => ({
    slug: t.slug || slugifyTourTitle(t.title)
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tour = await getTourBySlug(slug)

  if (!tour) {
    return {
      title: 'Tour Circuit Not Found | Flying Wonders Singapore',
      description: 'The requested destination tour circuit could not be found.'
    }
  }

  const imageUrl = tour.coverImageUrl.startsWith('http')
    ? tour.coverImageUrl
    : `https://flyingwonders.net${tour.coverImageUrl}`

  return {
    title: `${tour.title} — 1-Day Itinerary & Booking Guide | Flying Wonders`,
    description: `${tour.description.slice(0, 160)}... Full-day timetable, attraction tickets, route map, and B2B wholesale rates.`,
    keywords: [
      tour.title,
      `${tour.destination} Day Tour`,
      `${tour.title} Itinerary`,
      'Singapore 1-Day Tour',
      'Singapore Sightseeing Circuit',
      'Singapore B2B DMC Tour Packages',
      'Singapore Group Tour Itinerary'
    ],
    openGraph: {
      title: `${tour.title} | Flying Wonders Tour Itinerary`,
      description: tour.description,
      url: `https://flyingwonders.net/services-catalog/tours/${tour.slug || slugifyTourTitle(tour.title)}`,
      siteName: 'Flying Wonders',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: tour.title,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tour.title} | Flying Wonders Singapore`,
      description: tour.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://flyingwonders.net/services-catalog/tours/${tour.slug || slugifyTourTitle(tour.title)}`
    }
  }
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tour = await getTourBySlug(slug)

  if (!tour) {
    notFound()
  }

  // Structured Data (JSON-LD) for Tour Itinerary SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.description,
    image: tour.coverImageUrl,
    touristType: 'Leisure / Family / Group Sightseeing',
    offers: {
      '@type': 'Offer',
      price: tour.groupPricing?.adultEstimate || 150,
      priceCurrency: tour.groupPricing?.currency || 'SGD',
      availability: 'https://schema.org/InStock',
    },
    itinerary: {
      '@type': 'ItemList',
      itemListElement: (tour.itineraryTimeline || []).map((step, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: `${step.time}: ${step.title}`,
        description: step.description,
      }))
    },
    provider: {
      '@type': 'TravelAgency',
      name: 'Flying Wonders Private Limited',
      url: 'https://flyingwonders.net'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TourDetailClient tour={tour} />
      <div className="no-print" style={{ maxWidth: '1200px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>
        <AdBanner slotId="tour_detail_bottom_slot" category="b2b" />
      </div>
    </>
  )
}
