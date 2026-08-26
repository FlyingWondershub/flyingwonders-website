import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllHotels, getHotelBySlug, slugifyHotelName } from '../../../../utils/hotels'
import AdBanner from '../../../../components/AdBanner'
import HotelDetailClient from './HotelDetailClient'

export const revalidate = 600

export async function generateStaticParams() {
  const hotels = await getAllHotels()
  return hotels.map(h => ({
    slug: h.slug || slugifyHotelName(h.name)
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const hotel = await getHotelBySlug(slug)

  if (!hotel) {
    return {
      title: 'Partner Hotel Not Found | Flying Wonders Singapore',
      description: 'The requested destination partner hotel could not be found.'
    }
  }

  const imageUrl = hotel.coverImageUrl.startsWith('http') 
    ? hotel.coverImageUrl 
    : `https://flyingwonders.net${hotel.coverImageUrl}`

  return {
    title: `${hotel.name} (${hotel.star}) — B2B Partner Hotel | Flying Wonders`,
    description: `${hotel.description.slice(0, 160)}... Verified DMC wholesale rates, room types, and photos.`,
    keywords: [
      hotel.name,
      `${hotel.name} Singapore`,
      `${hotel.name} B2B Rates`,
      `${hotel.name} Video Tour`,
      'Singapore Partner Hotels',
      'Singapore DMC Wholesale Hotel Rates'
    ],
    openGraph: {
      title: `${hotel.name} (${hotel.star}) | Flying Wonders Partner Hotels`,
      description: hotel.description,
      url: `https://flyingwonders.net/services-catalog/hotels/${hotel.slug || slugifyHotelName(hotel.name)}`,
      siteName: 'Flying Wonders',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: hotel.name,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${hotel.name} | Flying Wonders Singapore`,
      description: hotel.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://flyingwonders.net/services-catalog/hotels/${hotel.slug || slugifyHotelName(hotel.name)}`
    }
  }
}

export default async function HotelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const hotel = await getHotelBySlug(slug)

  if (!hotel) {
    notFound()
  }

  // Structured Data (JSON-LD) for Hotel SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    description: hotel.description,
    image: hotel.coverImageUrl,
    starRating: {
      '@type': 'Rating',
      ratingValue: hotel.star?.includes('5') ? '5' : hotel.star?.includes('4') ? '4' : '3',
      bestRating: '5'
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.hotelAddress || hotel.location,
      addressLocality: hotel.location,
      addressCountry: hotel.location.includes('Malaysia') ? 'MY' : 'SG'
    },
    amenityFeature: (hotel.features || []).map(f => ({
      '@type': 'LocationFeatureSpecification',
      name: f,
      value: true
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HotelDetailClient hotel={hotel} />
      <div style={{ maxWidth: '1200px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>
        <AdBanner slotId="hotel_detail_bottom_slot" category="b2b" />
      </div>
    </>
  )
}
