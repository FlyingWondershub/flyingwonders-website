import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  Calendar,
  MapPin,
  Building2,
  Compass,
  Utensils,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Copy,
  Check,
  ChevronRight,
  Clock,
  Star,
  CheckCircle2,
  Info,
  ShieldCheck,
  Share2,
  Bus,
  ArrowLeft
} from 'lucide-react'
import { getCuratedCollectionBySlug, getAllCuratedCollections } from '../../../../utils/curatedCollections'
import CuratedCollectionClient from './CuratedCollectionClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCuratedCollectionBySlug(slug)

  if (!collection) {
    return {
      title: 'Curated Collection Not Found | Flying Wonders',
      description: 'The requested curated tour collection could not be found.',
    }
  }

  const title = `${collection.title} | Curated Tour Essentials & Blueprint`
  const description =
    collection.tagline ||
    collection.overview ||
    `Complete one-page essential itinerary for ${collection.title} featuring hand-picked hotels, attractions, dining, and circuits.`

  return {
    title,
    description,
    keywords: [
      collection.title,
      'Singapore Tour Essentials',
      'Curated Itinerary Singapore',
      'Singapore Malaysia Tour Package',
      collection.category,
      collection.destination,
      'Flying Wonders Services Catalog'
    ],
    openGraph: {
      title,
      description,
      url: `https://flyingwonders.net/services-catalog/collections/${slug}`,
      siteName: 'Flying Wonders',
      images: collection.coverImageUrl ? [collection.coverImageUrl] : ['/images/hero/singapore-hero-1.jpg'],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: collection.coverImageUrl ? [collection.coverImageUrl] : ['/images/hero/singapore-hero-1.jpg'],
    }
  }
}

export async function generateStaticParams() {
  const collections = await getAllCuratedCollections()
  return collections.map((col) => ({
    slug: col.slug,
  }))
}

export default async function CuratedCollectionDetailPage({ params }: Props) {
  const { slug } = await params
  const collection = await getCuratedCollectionBySlug(slug)

  if (!collection) {
    notFound()
  }

  return <CuratedCollectionClient collection={collection} />
}
