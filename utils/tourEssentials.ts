import { client } from '../sanity/lib/client'

export interface TourEssentialsShowcase {
  _id: string
  title: string
  slug: string
  isDefaultShowcase?: boolean
  heroBadge?: string
  heroTitle?: string
  heroSubtitle?: string
  featuredCollections?: Array<{
    _id: string
    title: string
    slug: string
    tagline?: string
    category?: string
    badge?: string
    duration?: string
    destination?: string
    coverImageUrl?: string
    highlights?: string[]
  }>
  featuredHotels?: Array<{
    _id: string
    name: string
    slug?: string
    starRating?: string
    hotelAddress?: string
    description?: string
    shortDescription?: string
    coverImageUrl?: string
    photoUrl?: string
    features?: string[]
  }>
  featuredAttractions?: Array<{
    _id: string
    name: string
    slug?: string
    description?: string
    coverImageUrl?: string
    features?: string[]
    timings?: string
  }>
  featuredDining?: Array<{
    _id: string
    name: string
    slug?: string
    cuisineType?: string
    dietaryTypes?: string[]
    description?: string
    priceTier?: string
    address?: string
  }>
  featuredShoppingMalls?: Array<{
    _id: string
    name: string
    slug?: string
    heroSubtitle?: string
    category?: string
    mrtStation?: string
  }>
  featuredTours?: Array<{
    _id: string
    name: string
    slug?: string
    duration?: string
    description?: string
    features?: string[]
  }>
  newsletterSnippet?: string
  customWhatsAppMessage?: string
}

const SHOWCASE_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  isDefaultShowcase,
  heroBadge,
  heroTitle,
  heroSubtitle,
  featuredCollections[]->{
    _id,
    title,
    "slug": slug.current,
    tagline,
    category,
    badge,
    duration,
    destination,
    "coverImageUrl": coalesce(coverImage.asset->url, coverImageUrl),
    highlights
  },
  featuredHotels[]->{
    _id,
    "name": coalesce(title, name),
    "slug": slug.current,
    starRating,
    hotelAddress,
    description,
    shortDescription,
    coverImageUrl,
    "photoUrl": photo.asset->url,
    features
  },
  featuredAttractions[]->{
    _id,
    "name": coalesce(title, name),
    "slug": slug.current,
    description,
    coverImageUrl,
    features,
    timings
  },
  featuredDining[]->{
    _id,
    "name": coalesce(name, title),
    "slug": slug.current,
    cuisineType,
    dietaryTypes,
    description,
    priceTier,
    address
  },
  featuredShoppingMalls[]->{
    _id,
    name,
    "slug": slug.current,
    heroSubtitle,
    category,
    mrtStation
  },
  featuredTours[]->{
    _id,
    "name": coalesce(title, name),
    "slug": slug.current,
    duration,
    description,
    features
  },
  newsletterSnippet,
  customWhatsAppMessage
}`

export async function getDefaultTourEssentialsShowcase(): Promise<TourEssentialsShowcase | null> {
  try {
    const data = await client.fetch(
      `*[_type == "tourEssentialsPage" && isDefaultShowcase == true][0] ${SHOWCASE_PROJECTION}`
    )
    if (data) return data

    // Fallback to the latest showcase document if no default toggle is set
    const fallback = await client.fetch(
      `*[_type == "tourEssentialsPage"] | order(_createdAt desc)[0] ${SHOWCASE_PROJECTION}`
    )
    if (fallback) return fallback
  } catch (error) {
    console.error('Error fetching tour essentials showcase from Sanity:', error)
  }
  return null
}

export async function getTourEssentialsShowcaseBySlug(slug: string): Promise<TourEssentialsShowcase | null> {
  try {
    const data = await client.fetch(
      `*[_type == "tourEssentialsPage" && slug.current == $slug][0] ${SHOWCASE_PROJECTION}`,
      { slug }
    )
    if (data) return data
  } catch (error) {
    console.error(`Error fetching tour essentials showcase slug ${slug} from Sanity:`, error)
  }
  return null
}
