import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'
import { apiVersion, dataset, projectId } from '../../../sanity/env'

const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: true,
})

const imageBuilder = createImageUrlBuilder({ projectId: projectId || '', dataset: dataset || '' })

export const revalidate = 600

export async function GET() {
  try {
    const [attractions, transfers, guides, hotels, meals] = await Promise.all([
      client.fetch(
        `*[_type == "attractionMeta"] {
          _id,
          name,
          matchKeyword,
          photo,
          shortDescription,
          longDescription,
          highlights,
          tips,
          rating,
          category,
          openingHours,
          duration,
          location,
          ageRecommendation
        }`,
        {},
        { next: { revalidate: 600 } }
      ),
      client.fetch(
        `*[_type == "transferMeta"] {
          _id,
          name,
          photo,
          shortDescription,
          longDescription,
          passengerCapacity,
          luggageCapacity,
          vehicleCategory,
          features
        }`,
        {},
        { next: { revalidate: 600 } }
      ),
      client.fetch(
        `*[_type == "guideMeta"] {
          _id,
          name,
          photo,
          shortDescription,
          longDescription,
          duration,
          languages,
          certifications
        }`,
        {},
        { next: { revalidate: 600 } }
      ),
      client.fetch(
        `*[_type == "hotelMeta"] {
          _id,
          name,
          starRating,
          photo,
          shortDescription,
          longDescription,
          addressLocation,
          amenities,
          checkInTime,
          checkOutTime
        }`,
        {},
        { next: { revalidate: 600 } }
      ),
      client.fetch(
        `*[_type == "mealMeta"] {
          _id,
          name,
          mealType,
          photo,
          shortDescription,
          longDescription,
          cuisine,
          dietaryBadges
        }`,
        {},
        { next: { revalidate: 600 } }
      ),
    ])

    const resolvePhoto = (item: any) => ({
      ...item,
      photoUrl: item?.photo
        ? imageBuilder.image(item.photo).auto('format').width(1000).fit('max').url()
        : null
    })

    return NextResponse.json({
      success: true,
      attractions: (attractions || []).map(resolvePhoto),
      transfers: (transfers || []).map(resolvePhoto),
      guides: (guides || []).map(resolvePhoto),
      hotels: (hotels || []).map(resolvePhoto),
      meals: (meals || []).map(resolvePhoto)
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
      }
    })
  } catch (err: any) {
    console.error('Error fetching custom package meta from Sanity:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to fetch custom package meta',
      attractions: [],
      transfers: [],
      guides: [],
      hotels: [],
      meals: []
    })
  }
}
