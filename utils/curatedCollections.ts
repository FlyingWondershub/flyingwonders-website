import { client } from '../sanity/lib/client'

export interface CuratedHotel {
  _id: string
  _type?: string
  name: string
  slug?: string
  starRating?: string
  hotelAddress?: string
  description?: string
  shortDescription?: string
  coverImageUrl?: string
  photoUrl?: string
  features?: string[]
  roomCategories?: string[]
}

export interface CuratedAttraction {
  _id: string
  _type?: string
  name: string
  slug?: string
  description?: string
  coverImageUrl?: string
  features?: string[]
  timings?: string
}

export interface CuratedDining {
  _id: string
  _type?: string
  name: string
  slug?: string
  cuisineType?: string
  dietaryTypes?: string[]
  description?: string
  mustTryDishes?: any[]
  priceTier?: string
  address?: string
}

export interface CuratedShopping {
  _id: string
  name: string
  slug?: string
  heroSubtitle?: string
  category?: string
  mrtStation?: string
  address?: string
  features?: string[]
}

export interface CuratedTour {
  _id: string
  _type?: string
  name: string
  slug?: string
  duration?: string
  description?: string
  features?: string[]
}

export interface ItineraryDay {
  _key?: string
  day: string
  title: string
  description: string
  morning?: string
  afternoon?: string
  evening?: string
  recommendedDining?: string
}

export interface CuratedCollectionData {
  _id: string
  title: string
  slug: string
  tagline?: string
  category: string
  badge?: string
  duration: string
  destination: string
  coverImage?: any
  coverImageUrl?: string
  overview?: string
  targetAudience?: string
  highlights?: string[]
  featuredHotels?: CuratedHotel[]
  featuredAttractions?: CuratedAttraction[]
  featuredDining?: CuratedDining[]
  featuredShopping?: CuratedShopping[]
  featuredTours?: CuratedTour[]
  itinerarySchedule?: ItineraryDay[]
  insiderTips?: string[]
  newsletterTeaser?: string
  customWhatsAppMessage?: string
  isPublished?: boolean
  isFeatured?: boolean
  order?: number
}

const COLLECTION_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  tagline,
  category,
  badge,
  duration,
  destination,
  "coverImageUrl": coalesce(coverImage.asset->url, coverImageUrl),
  overview,
  targetAudience,
  highlights,
  featuredHotels[]->{
    _id,
    _type,
    "name": coalesce(title, name),
    "slug": slug.current,
    starRating,
    hotelAddress,
    description,
    shortDescription,
    coverImageUrl,
    "photoUrl": photo.asset->url,
    features,
    roomCategories
  },
  featuredAttractions[]->{
    _id,
    _type,
    "name": coalesce(title, name),
    "slug": slug.current,
    description,
    coverImageUrl,
    features,
    timings
  },
  featuredDining[]->{
    _id,
    _type,
    "name": coalesce(name, title),
    "slug": slug.current,
    cuisineType,
    dietaryTypes,
    description,
    mustTryDishes,
    priceTier,
    address
  },
  featuredShopping[]->{
    _id,
    name,
    "slug": slug.current,
    heroSubtitle,
    category,
    mrtStation,
    address,
    features
  },
  featuredTours[]->{
    _id,
    _type,
    "name": coalesce(title, name),
    "slug": slug.current,
    duration,
    description,
    features
  },
  itinerarySchedule,
  insiderTips,
  newsletterTeaser,
  customWhatsAppMessage,
  isPublished,
  isFeatured,
  order
}`

export async function getAllCuratedCollections(): Promise<CuratedCollectionData[]> {
  try {
    const data = await client.fetch(
      `*[_type == "curatedCollection" && isPublished != false] | order(order asc, _createdAt desc) ${COLLECTION_PROJECTION}`
    )
    if (data && data.length > 0) return data
  } catch (error) {
    console.error('Error fetching curated collections from Sanity:', error)
  }
  return []
}

export async function getCuratedCollectionBySlug(slug: string): Promise<CuratedCollectionData | null> {
  try {
    const data = await client.fetch(
      `*[_type == "curatedCollection" && slug.current == $slug && isPublished != false][0] ${COLLECTION_PROJECTION}`,
      { slug }
    )
    if (data) return data
  } catch (error) {
    console.error(`Error fetching curated collection slug ${slug} from Sanity:`, error)
  }
  return null
}
