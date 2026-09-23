import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'
import { DEFAULT_SHOPPING_MALLS } from '../../../../utils/shoppingMalls'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN
  if (!token) {
    return NextResponse.json({ success: false, error: 'SANITY_WRITE_TOKEN is missing' }, { status: 500 })
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false
  })

  try {
    const results = []

    for (const mall of DEFAULT_SHOPPING_MALLS) {
      const docId = `shoppingMall-${mall.slug}`
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

      const res = await client.createOrReplace(sanityDoc)
      results.push({ id: res._id, name: res.name })
    }

    revalidatePath('/travel-tools/shopping-malls')
    revalidatePath('/travel-tools/shopping-malls/[slug]', 'page')
    revalidatePath('/travel-tools/shopping-guide')

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${results.length} shopping malls into Sanity CMS`,
      syncedMalls: results
    })
  } catch (err: any) {
    console.error('Error syncing shopping malls to Sanity:', err)
    return NextResponse.json({ success: false, error: err?.message || 'Sync failed' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  // Allow simple GET requests for administrative convenience
  return POST(request)
}
