import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllReadyPackages, getReadyPackageBySlug } from '../../../utils/readyPackages'
import { getLiveExchangeRate } from '../../../utils/exchange'
import { Suspense } from 'react'
import ReadyMadeDetailClient from './ReadyMadeDetailClient'

export const revalidate = 600

export async function generateStaticParams() {
  const packages = await getAllReadyPackages()
  return packages.map(pkg => ({
    slug: pkg.slug
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const pkg = await getReadyPackageBySlug(slug)

  if (!pkg) {
    return {
      title: 'Ready-Made Land Package Not Found | Flying Wonders Singapore',
      description: 'The requested Singapore B2B land package could not be found.'
    }
  }

  const ogImageUrl = typeof pkg.coverImage === 'string' && pkg.coverImage
    ? pkg.coverImage
    : 'https://flyingwonders.net/images/hero/singapore-hero-1.jpg'

  return {
    title: `${pkg.title} (Starting S$ ${pkg.startingPriceSGD}) | Flying Wonders Singapore DMC`,
    description: `${pkg.summary} ... B2B Land Package Only (No Hotels). Dedicated 13-Seater Minibus & SIC transfers, instant quotation & PDF.`,
    keywords: [
      pkg.title,
      'Singapore Land Package',
      'Singapore B2B DMC',
      'Singapore Tour Package No Hotels',
      `${pkg.nightsCount + 1}D ${pkg.nightsCount}N Singapore Itinerary`,
      'Singapore Minibus Sightseeing'
    ],
    openGraph: {
      title: `${pkg.title} — Singapore B2B Land Package | Flying Wonders`,
      description: pkg.summary,
      url: `https://flyingwonders.net/ready-made/${pkg.slug}`,
      siteName: 'Flying Wonders',
      images: [
        {
          url: ogImageUrl,
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
      title: `${pkg.title} | Flying Wonders Singapore DMC`,
      description: pkg.summary,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `https://flyingwonders.net/ready-made/${pkg.slug}`
    }
  }
}

export default async function ReadyMadeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pkg = await getReadyPackageBySlug(slug)

  if (!pkg) {
    notFound()
  }

  let exchangeRate = 74.81
  try {
    exchangeRate = await getLiveExchangeRate()
  } catch (e) {}

  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>Loading Land Package...</div>}>
      <ReadyMadeDetailClient pkg={pkg} exchangeRate={exchangeRate} />
    </Suspense>
  )
}
