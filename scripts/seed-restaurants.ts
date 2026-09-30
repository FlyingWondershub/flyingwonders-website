import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { DEFAULT_RESTAURANTS } from '../utils/restaurants'

const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8xtd7yiv'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

if (!token) {
  console.error('❌ SANITY_WRITE_TOKEN is missing in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false
})

async function seedRestaurants() {
  console.log(`🚀 Starting Sanity seed for ${DEFAULT_RESTAURANTS.length} restaurants & dining catalog items...`)
  console.log(`📍 Project: ${projectId} | Dataset: ${dataset}\n`)

  let successCount = 0

  for (const r of DEFAULT_RESTAURANTS) {
    const docId = `restaurantMeta-${r.slug}`
    console.log(`⏳ Upserting [${r.name}] (ID: ${docId})...`)

    const formattedMustTryDishes = (r.mustTryDishes || []).map((d, i) => {
      if (typeof d === 'string') {
        return {
          _key: `dish-${i}`,
          name: d,
          description: 'Signature house specialty recommended by chef.',
          category: 'Main Course',
          isVegetarian: false,
          isChefSpecial: true
        }
      }
      return {
        _key: `dish-${i}`,
        name: d.name,
        description: d.description || '',
        category: d.category || 'Main Course',
        isVegetarian: Boolean(d.isVegetarian),
        isJainFriendly: Boolean(d.isJainFriendly),
        isChefSpecial: Boolean(d.isChefSpecial)
      }
    })

    const formattedShorts = (r.shorts || []).map((s, i) => ({
      _key: `short-${i}`,
      title: s.title,
      creator: s.creator,
      views: s.views || '200K views',
      thumbnailUrl: s.thumbnailUrl,
      youtubeVideoId: s.youtubeVideoId
    }))

    const sanityDoc: any = {
      _id: docId,
      _type: 'restaurantMeta',
      name: r.name,
      slug: {
        _type: 'slug',
        current: r.slug
      },
      subtitle: r.subtitle || '',
      destination: r.destination || 'Singapore',
      cuisineType: r.cuisineType || 'Dining Experience',
      categories: r.categories || ['indian'],
      dietaryBadges: r.dietaryBadges || [],
      priceRange: r.priceRange || '$$ (SGD 20 – 40)',
      starRating: r.starRating || '4.8',
      reviewCount: r.reviewCount || '1,000+ Reviews',
      shortDescription: r.shortDescription || '',
      longDescription: r.longDescription || '',
      coverImageUrl: r.coverImageUrl || '',
      galleryImageUrls: r.galleryImageUrls || [],
      videoUrl: r.videoUrl || '',
      shorts: formattedShorts,
      mustTryDishes: formattedMustTryDishes,
      features: r.features || [],
      hasBuffet: Boolean(r.hasBuffet),
      buffetHighlight: r.buffetHighlight || '',
      buffetDetails: r.buffetDetails || '',
      address: r.address || '',
      nearestMrt: r.nearestMrt || '',
      timings: r.timings || '11:30 AM – 10:30 PM Daily',
      phone: r.phone || '',
      officialWebsite: r.officialWebsite || '',
      menuUrl: r.menuUrl || '',
      reservationUrl: r.reservationUrl || '',
      googleMapsUrl: r.googleMapsUrl || '',
      tips: r.tips || [],
      isPopular: Boolean(r.isPopular),
      isTrending: Boolean(r.isTrending),
      isDisplayed: r.isDisplayed !== false,
      whatsappNumber: r.whatsappNumber || '',
      whatsappMessage: r.whatsappMessage || ''
    }

    try {
      await client.createOrReplace(sanityDoc)
      console.log(`✅ [${r.name}] successfully written to Sanity!`)
      successCount++
    } catch (err: any) {
      console.error(`❌ Failed to upsert [${r.name}]:`, err?.message || err)
    }
  }

  console.log(`\n🎉 Completed! ${successCount} / ${DEFAULT_RESTAURANTS.length} restaurants successfully synced into Sanity.`)
}

seedRestaurants().catch((err) => {
  console.error('Fatal seeding error:', err)
  process.exit(1)
})
