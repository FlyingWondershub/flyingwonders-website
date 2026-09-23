import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { DEFAULT_SHOPPING_MALLS } from '../utils/shoppingMalls'

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

async function seedShoppingMalls() {
  console.log(`🚀 Starting Sanity seed for ${DEFAULT_SHOPPING_MALLS.length} shopping malls...`)
  console.log(`📍 Project: ${projectId} | Dataset: ${dataset}\n`)

  for (const mall of DEFAULT_SHOPPING_MALLS) {
    const docId = `shoppingMall-${mall.slug}`
    console.log(`⏳ Upserting [${mall.name}] (ID: ${docId})...`)

    const sanityDoc: any = {
      _id: docId,
      _type: 'shoppingMall',
      name: mall.name,
      slug: {
        _type: 'slug',
        current: mall.slug
      },
      alternateName: mall.alternateName || '',
      tagline: mall.tagline || '',
      category: mall.category || 'Outlet & Discount Mall',
      budgetTier: mall.budgetTier || '$$',
      starRating: mall.starRating || '4.8',
      reviewCount: mall.reviewCount || '10,000+ Reviews',
      coverImageUrl: mall.coverImageUrl || '',
      galleryImages: mall.galleryImageUrls || [],
      overview: mall.overview || '',
      mustDoThings: mall.mustDoThings || [],
      keyHighlights: (mall.keyHighlights || []).map((h, i) => ({
        _key: `kh-${i}`,
        title: h.title,
        description: h.description,
        badge: h.badge || ''
      })),
      topStoresAndBrands: (mall.topStoresAndBrands || []).map((b, i) => ({
        _key: `sb-${i}`,
        categoryName: b.categoryName,
        discountBadge: b.discountBadge || '',
        brands: b.brands || [],
        description: b.description || ''
      })),
      timings: mall.timings || '10:00 AM – 10:00 PM Daily',
      bestTimeToVisit: mall.bestTimeToVisit || '',
      peakCrowdTimes: mall.peakCrowdTimes || '',
      recommendedDuration: mall.recommendedDuration || '2 to 4 Hours',
      tipsAndTricks: mall.tipsAndTricks || [],
      appDetails: mall.appDetails ? {
        appName: mall.appDetails.appName || '',
        appDescription: mall.appDetails.appDescription || '',
        appStoreUrl: mall.appDetails.appStoreUrl || '',
        playStoreUrl: mall.appDetails.playStoreUrl || '',
        appFeatures: mall.appDetails.appFeatures || []
      } : undefined,
      videoUrl: mall.videoUrl || '',
      shorts: (mall.shorts || []).map((s, i) => ({
        _key: `short-${i}`,
        id: s.id,
        title: s.title,
        duration: (s as any).duration || '0:50',
        creator: s.creator || 'Singapore Explorer',
        thumbnailUrl: s.thumbnailUrl || '',
        youtubeVideoId: s.youtubeVideoId || ''
      })),
      locationAddress: mall.locationAddress || '',
      mapEmbedUrl: mall.mapEmbedUrl || '',
      nearestMrt: mall.nearestMrt ? {
        station: mall.nearestMrt.station || '',
        line: mall.nearestMrt.line || '',
        exit: mall.nearestMrt.exit || '',
        walkingTime: mall.nearestMrt.walkingTime || ''
      } : undefined,
      busLines: mall.busLines || '',
      diningHighlights: mall.diningHighlights ? {
        description: mall.diningHighlights.description || '',
        topPicks: mall.diningHighlights.topPicks || []
      } : undefined,
      facilities: mall.facilities || [],
      nearbyAttractions: (mall.nearbyAttractions || []).map((a, i) => ({
        _key: `na-${i}`,
        name: a.name,
        distance: a.distance || '',
        travelTip: a.travelTip || ''
      })),
      faqs: (mall.faqs || []).map((f, i) => ({
        _key: `faq-${i}`,
        question: f.question,
        answer: f.answer
      })),
      isDisplayed: true
    }

    try {
      const res = await client.createOrReplace(sanityDoc)
      console.log(`✅ [${res.name}] created/replaced successfully! ID: ${res._id}`)
    } catch (err: any) {
      console.error(`❌ Failed to upsert [${mall.name}]:`, err?.message || err)
    }
  }

  console.log('\n🎉 Finished seeding all shopping malls into Sanity CMS!')
}

seedShoppingMalls().catch(console.error)
