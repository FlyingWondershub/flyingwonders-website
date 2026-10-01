import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'
import { DEFAULT_RESTAURANTS } from '../../../../utils/restaurants'

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

    for (const r of DEFAULT_RESTAURANTS) {
      const docId = `restaurantMeta-${r.slug}`

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
        id: s.id,
        title: s.title,
        duration: (s as any).duration || '0:50',
        creator: s.creator || 'Singapore Dining Guide',
        thumbnailUrl: s.thumbnailUrl || '',
        youtubeVideoId: s.youtubeVideoId || ''
      }))

      const sanityDoc: any = {
        _id: docId,
        _type: 'restaurantMeta',
        name: r.name,
        subtitle: r.subtitle || '',
        slug: {
          _type: 'slug',
          current: r.slug
        },
        cuisineType: r.cuisineType || 'Indian',
        dietaryBadges: r.dietaryBadges || ['Vegetarian Options'],
        priceRange: r.priceRange || '$$',
        starRating: r.starRating || '4.8',
        reviewCount: r.reviewCount || '2,500+ Reviews',
        isPopular: Boolean(r.isPopular),
        hasBuffet: Boolean(r.hasBuffet),
        buffetHighlight: r.buffetHighlight || '',
        buffetDetails: r.buffetDetails || '',
        coverImageUrl: r.coverImageUrl || '',
        galleryImages: r.galleryImageUrls || [],
        videoUrl: r.videoUrl || '',
        shorts: formattedShorts,
        shortDescription: r.shortDescription || '',
        longDescription: r.longDescription || '',
        mustTryDishes: formattedMustTryDishes,
        features: r.features || [],
        address: r.address || '',
        nearestMrt: r.nearestMrt || '',
        googleMapsUrl: r.googleMapsUrl || '',
        timings: r.timings || '11:30 AM – 10:30 PM Daily',
        phone: r.phone || '',
        officialWebsite: r.officialWebsite || '',
        website: r.officialWebsite || '',
        reservationUrl: r.reservationUrl || '',
        menuUrl: r.menuUrl || '',
        whatsappNumber: r.whatsappNumber || '919886171251',
        whatsappMessage: r.whatsappMessage || `Hi Flying Wonders! I would like to inquire about group table reservations and special rates for ${r.name}.`,
        tips: r.tips || [],
        isDisplayed: r.isDisplayed !== false
      }

      const res = await client.createOrReplace(sanityDoc)
      results.push(res._id)
    }

    // Purge cached paths
    revalidatePath('/services-catalog')
    revalidatePath('/services-catalog/restaurants')
    revalidatePath('/sitemap.xml')

    return NextResponse.json({
      success: true,
      message: `Successfully synced & refreshed ${results.length} restaurants into Sanity CMS dataset '${dataset}'!`,
      count: results.length,
      syncedRestaurants: results
    })
  } catch (error: any) {
    console.error('Error syncing restaurants to Sanity:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
