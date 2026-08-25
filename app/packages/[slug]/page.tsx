import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllPackages, getPackageBySlug, normalizeSlug } from '../../../utils/packages'
import { getLiveExchangeRate } from '../../../utils/exchange'
import { urlForImage } from '../../../sanity/lib/image'
import AdBanner from '../../../components/AdBanner'
import PackageDetailClient from './PackageDetailClient'

export const revalidate = 600

export async function generateStaticParams() {
  const packages = await getAllPackages()
  return packages.map(pkg => ({
    slug: pkg.slug || normalizeSlug(pkg._id)
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)

  if (!pkg) {
    return {
      title: 'Package Not Found | Flying Wonders Singapore',
      description: 'The requested Singapore tour package could not be found.'
    }
  }

  const imageUrl = typeof pkg.image === 'string' 
    ? (pkg.image.startsWith('http') ? pkg.image : `https://flyingwonders.net${pkg.image}`)
    : (pkg.image ? urlForImage(pkg.image).url() : 'https://flyingwonders.net/images/hero/singapore-hero-1.jpg')

  return {
    title: `${pkg.title} (SGD ${pkg.price}) | Flying Wonders Singapore DMC`,
    description: `${pkg.description.slice(0, 160)}... B2B wholesale rates, verified hotels, and private transfers.`,
    keywords: [
      pkg.title,
      'Singapore Tour Package',
      `${pkg.title} Itinerary`,
      'Singapore Holiday Package 2026',
      'Singapore DMC India Rates'
    ],
    openGraph: {
      title: `${pkg.title} — Singapore Tour Package | Flying Wonders`,
      description: pkg.description,
      url: `https://flyingwonders.net/packages/${pkg.slug || normalizeSlug(pkg._id)}`,
      siteName: 'Flying Wonders',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: pkg.title,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pkg.title} | Flying Wonders Singapore`,
      description: pkg.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://flyingwonders.net/packages/${pkg.slug || normalizeSlug(pkg._id)}`
    }
  }
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)

  if (!pkg) {
    notFound()
  }

  let exchangeRate = 74.81
  try {
    exchangeRate = await getLiveExchangeRate()
  } catch (err) {
    console.error('Error fetching live exchange rate:', err)
  }

  const inrPrice = Math.round(pkg.price * exchangeRate)
  const cleanSlug = pkg.slug || normalizeSlug(pkg._id)

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: pkg.title,
    description: pkg.description,
    touristType: pkg.tier,
    offers: {
      '@type': 'Offer',
      price: pkg.price,
      priceCurrency: 'SGD',
      availability: 'https://schema.org/InStock',
      validFrom: '2026-01-01',
      url: `https://flyingwonders.net/packages/${cleanSlug}`,
      seller: {
        '@type': 'TravelAgency',
        name: 'Flying Wonders Private Limited',
        url: 'https://flyingwonders.net'
      }
    },
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: pkg.itinerary.length,
      itemListElement: pkg.itinerary.map((day, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: `Day ${day.day}: ${day.title}`,
        description: day.activities.map(a => `${a.time} - ${a.desc}`).join(' | ')
      }))
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />
      <PackageDetailClient 
        pkg={pkg} 
        exchangeRate={exchangeRate} 
        inrPrice={inrPrice} 
        cleanSlug={cleanSlug} 
      />
    </>
  )
}
