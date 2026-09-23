import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllShoppingMalls, getShoppingMallBySlug } from '../../../../utils/shoppingMalls'
import ShoppingMallDetailClient from '../../../../components/ShoppingMallDetailClient'
import AdBanner from '../../../../components/AdBanner'

export const revalidate = 600

export async function generateStaticParams() {
  const malls = await getAllShoppingMalls()
  return malls.map(m => ({
    slug: m.slug
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const mall = await getShoppingMallBySlug(slug)

  if (!mall) {
    return {
      title: 'Shopping Mall Not Found | Flying Wonders Singapore',
      description: 'The requested Singapore shopping destination could not be found.'
    }
  }

  const imageUrl = mall.coverImageUrl.startsWith('http')
    ? mall.coverImageUrl
    : `https://flyingwonders.net${mall.coverImageUrl}`

  return {
    title: `${mall.name} — Visitor Shopping Guide, Timings, Stores & Map | Flying Wonders`,
    description: `${mall.overview.slice(0, 155)}... Top stores, brand discounts, MRT directions, pro-tips, and 9% GST refund guide.`,
    keywords: [
      mall.name,
      `${mall.name} Singapore`,
      `${mall.name} opening hours`,
      `${mall.name} stores`,
      `${mall.name} brands`,
      `${mall.name} MRT`,
      'Singapore shopping mall',
      'Singapore factory outlet',
      'Singapore shopping guide',
      'eTRS GST tax refund Singapore'
    ],
    openGraph: {
      title: `${mall.name} | Singapore Tourist Shopping Guide · Flying Wonders`,
      description: mall.tagline || mall.overview.slice(0, 160),
      url: `https://flyingwonders.net/travel-tools/shopping-malls/${mall.slug}`,
      siteName: 'Flying Wonders',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: mall.name,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${mall.name} | Flying Wonders Singapore`,
      description: mall.tagline || mall.overview.slice(0, 160),
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://flyingwonders.net/travel-tools/shopping-malls/${mall.slug}`
    }
  }
}

export default async function ShoppingMallDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mall = await getShoppingMallBySlug(slug)

  if (!mall) {
    notFound()
  }

  // Schema.org Structured Data for ShoppingCenter / TouristAttraction
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ShoppingCenter',
    name: mall.name,
    alternateName: mall.alternateName,
    description: mall.overview,
    image: mall.coverImageUrl,
    priceRange: mall.budgetTier,
    address: {
      '@type': 'PostalAddress',
      streetAddress: mall.locationAddress,
      addressLocality: 'Singapore',
      addressCountry: 'SG'
    },
    openingHours: mall.timings,
    amenityFeature: mall.facilities.map(f => ({
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
      <ShoppingMallDetailClient mall={mall} />
      <div style={{ maxWidth: '1600px', width: '96%', margin: '2rem auto 4rem', padding: '0 0.5rem' }}>
        <AdBanner slotId="shopping_mall_detail_bottom_slot" category="b2b" />
      </div>
    </>
  )
}
