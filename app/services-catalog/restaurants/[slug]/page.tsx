import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllRestaurants, getRestaurantBySlug, slugifyRestaurantName } from '../../../../utils/restaurants'
import AdBanner from '../../../../components/AdBanner'
import RestaurantDetailClient from '../../../../components/RestaurantDetailClient'

export const revalidate = 600

export async function generateStaticParams() {
  const restaurants = await getAllRestaurants()
  return restaurants.map(r => ({
    slug: r.slug || slugifyRestaurantName(r.name)
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const restaurant = await getRestaurantBySlug(slug)

  if (!restaurant) {
    return {
      title: 'Restaurant Not Found | Flying Wonders Singapore',
      description: 'The requested dining destination could not be found.'
    }
  }

  const imageUrl = restaurant.coverImageUrl.startsWith('http')
    ? restaurant.coverImageUrl
    : `https://flyingwonders.net${restaurant.coverImageUrl}`

  return {
    title: `${restaurant.name} — Menu, Buffet & Guide | Flying Wonders`,
    description: `${restaurant.shortDescription || restaurant.longDescription.slice(0, 160)}... Must-try dishes, operating hours, buffet pricing, and reservation guide.`,
    keywords: [
      restaurant.name,
      `${restaurant.name} Singapore`,
      `${restaurant.name} Buffet`,
      `${restaurant.name} Menu`,
      `${restaurant.name} Must Try Dishes`,
      `${restaurant.cuisineType} Singapore`,
      'Singapore Best Restaurants',
      'Singapore Dining Guide'
    ],
    openGraph: {
      title: `${restaurant.name} | Flying Wonders Singapore Dining Guide`,
      description: restaurant.shortDescription || restaurant.longDescription.slice(0, 160),
      url: `https://flyingwonders.net/services-catalog/restaurants/${restaurant.slug || slugifyRestaurantName(restaurant.name)}`,
      siteName: 'Flying Wonders',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: restaurant.name,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${restaurant.name} | Flying Wonders Singapore`,
      description: restaurant.shortDescription || restaurant.longDescription.slice(0, 160),
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://flyingwonders.net/services-catalog/restaurants/${restaurant.slug || slugifyRestaurantName(restaurant.name)}`
    }
  }
}

export default async function RestaurantDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const restaurant = await getRestaurantBySlug(slug)

  if (!restaurant) {
    notFound()
  }

  // Structured Data (JSON-LD) for Restaurant SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.longDescription || restaurant.shortDescription,
    image: restaurant.coverImageUrl,
    servesCuisine: restaurant.cuisineType,
    priceRange: restaurant.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address,
      addressLocality: restaurant.destination,
      addressCountry: restaurant.destination.includes('Malaysia') ? 'MY' : 'SG'
    },
    ...(restaurant.starRating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: restaurant.starRating,
        bestRating: '5',
        ratingCount: '150'
      }
    } : {}),
    ...(restaurant.menuUrl ? { hasMenu: restaurant.menuUrl } : {}),
    ...(restaurant.phone ? { telephone: restaurant.phone } : {})
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RestaurantDetailClient restaurant={restaurant} />
      <div style={{ maxWidth: '1440px', width: '96%', margin: '2rem auto 4rem', padding: '0 0.5rem' }}>
        <AdBanner slotId="restaurant_detail_bottom_slot" category="b2b" />
      </div>
    </>
  )
}
