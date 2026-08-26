import { client } from '../sanity/lib/client'
import type { TravelShort } from './packages'

export interface HotelData {
  _id: string
  slug: string
  name: string
  subtitle?: string
  star: string
  location: string
  roomType?: string
  hotelAddress?: string
  description: string
  coverImageUrl: string
  videoUrl?: string
  galleryImageUrls?: string[]
  features?: string[]
  roomCategories?: string[]
  shorts?: TravelShort[]
  isDisplayed?: boolean
}

export function slugifyHotelName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const DEFAULT_HOTELS: HotelData[] = [
  {
    _id: 'hotel-boss',
    slug: 'hotel-boss-singapore',
    name: 'Hotel Boss Singapore',
    subtitle: 'Victoria Street / Jalan Sultan (Near Lavender MRT)',
    star: '4-Star',
    location: 'Singapore',
    roomType: 'Superior Double / Premier Queen',
    hotelAddress: '500 Jalan Sultan (Near Lavender & Bugis MRT), Singapore 199020',
    description: 'Centrally located along Victoria Street and Jalan Sultan, Hotel Boss is a premier 4-star destination hotel featuring 1,500 modern guest rooms, an expansive outdoor swimming pool overlooking the city skyline, a 24-hour fitness gym, and an array of halal and international dining options just 5 minutes walk from Lavender and Bugis MRT stations.',
    coverImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop'
    ],
    features: ['Outdoor Skyline Pool', '5 Mins Walk to Lavender MRT', 'Halal-Certified Food Court', '24/7 Gym', 'Free High-Speed Wi-Fi', 'Daily Buffet Breakfast'],
    roomCategories: ['Superior Double Room', 'Premier Queen with Balcony', 'Family Triple / Quad Room', 'Executive King Suite'],
    shorts: [
      {
        id: 'hb-short-1',
        title: 'Hotel Boss Singapore Sky Pool & City View 🇸🇬',
        creator: 'SingaporeHotels',
        views: '320K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop',
        youtubeVideoId: 'kYJzX9Qz8oM'
      },
      {
        id: 'hb-short-2',
        title: 'Hotel Boss Room Tour & Lavender MRT Walk 🚶‍♂️',
        creator: 'TravelVibesSG',
        views: '180K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop',
        youtubeVideoId: 't5A5L_e1Q9k'
      }
    ],
    isDisplayed: true
  },
  {
    _id: 'v-hotel-lavender',
    slug: 'v-hotel-lavender',
    name: 'V Hotel Lavender',
    subtitle: 'Directly Above Lavender MRT Station (East-West Green Line)',
    star: '4-Star',
    location: 'Singapore',
    roomType: 'Superior Queen / Premier Twin',
    hotelAddress: '70 Jellicoe Road (Above Lavender MRT), Singapore 208767',
    description: 'Located directly above Lavender MRT Station with direct train access to Changi Airport and Bugis, V Hotel Lavender is one of Singapore\'s most popular transit and leisure hubs featuring a breezy sky terrace swimming pool, modern minimalist rooms, fitness center, and multi-cuisine food court.',
    coverImageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop'
    ],
    features: ['Direct Lavender MRT Link', 'Direct Train to Changi Airport', 'Sky Terrace Pool', 'Currency Exchange Desk', '24/7 Concierge'],
    roomCategories: ['Superior Queen Room', 'Premier Twin Room', 'Triple Family Room'],
    shorts: [
      {
        id: 'vh-short-1',
        title: 'Direct MRT Access at V Hotel Lavender Singapore 🚇',
        creator: 'SingaporeTransit',
        views: '240K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop',
        youtubeVideoId: 'kYJzX9Qz8oM'
      }
    ],
    isDisplayed: true
  },
  {
    _id: 'marina-bay-sands',
    slug: 'marina-bay-sands-singapore',
    name: 'Marina Bay Sands Singapore',
    subtitle: 'World-Renowned Integrated Luxury Resort & Sands SkyPark',
    star: '5-Star',
    location: 'Singapore',
    roomType: 'Deluxe City View / Sands Premier Suite',
    hotelAddress: '10 Bayfront Avenue, Marina Bay, Singapore 018956',
    description: 'World-famous luxury integrated resort featuring the legendary 57th-floor Rooftop Infinity Pool, Sands SkyPark Observation Deck, Michelin-starred dining, The Shoppes luxury promenade, and spacious designer suites overlooking Marina Bay and Gardens by the Bay.',
    coverImageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=t5A5L_e1Q9k',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'
    ],
    features: ['World-Famous 57F Infinity Pool', 'Sands SkyPark Access', 'Celebrity Chef Dining', 'Direct Bayfront MRT Link', 'Luxury Banyan Tree Spa'],
    roomCategories: ['Deluxe City View', 'Sands Premier Suite', 'Club King with SkyPark Access', 'Presidential Harbour Suite'],
    shorts: [
      {
        id: 'mbs-short-1',
        title: '57th Floor Infinity Pool at Marina Bay Sands 🏊‍♂️✨',
        creator: 'LuxuryTravelSG',
        views: '2.4M views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&auto=format&fit=crop',
        youtubeVideoId: 't5A5L_e1Q9k'
      },
      {
        id: 'mbs-short-2',
        title: 'Sands SkyPark Observation Deck Sunset View 🌅',
        creator: 'VisitSingapore',
        views: '850K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop',
        youtubeVideoId: 'x6d3XQc0G4s'
      }
    ],
    isDisplayed: true
  },
  {
    _id: 'village-hotel-bugis',
    slug: 'village-hotel-bugis',
    name: 'Village Hotel Bugis by Far East Hospitality',
    subtitle: 'Heritage & Shopping Heart of Arab Street & Bugis',
    star: '4-Star',
    location: 'Singapore',
    roomType: 'Superior Room / Deluxe Family Room',
    hotelAddress: '390 Victoria Street, Bugis, Singapore 188061',
    description: 'Set in the cultural and shopping haven of Arab Street, Haji Lane, and Bugis Junction, Village Hotel Bugis features spacious family rooms, outdoor swimming pool, halal-certified international buffet dining at The Landmark, and effortless train connectivity.',
    coverImageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&auto=format&fit=crop',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop'
    ],
    features: ['Arab Street & Haji Lane Location', 'Halal Buffet Dining', 'Spacious Family Rooms', 'Bugis MRT Station (5 mins)', 'Swimming Pool'],
    roomCategories: ['Superior Room', 'Deluxe Room', 'Family Room with Kids Amenities'],
    isDisplayed: true
  },
  {
    _id: 'grand-copthorne-waterfront',
    slug: 'grand-copthorne-waterfront-hotel',
    name: 'Grand Copthorne Waterfront Hotel',
    subtitle: 'Scenic Singapore River & Robertson Quay Luxury',
    star: '5-Star',
    location: 'Singapore',
    roomType: 'Superior City View / Deluxe Waterfront',
    hotelAddress: '392 Havelock Road, Singapore 169663',
    description: 'Award-winning 5-star riverfront hotel along historical Singapore River and Robertson Quay, offering panoramic river and city skyline vistas, refined Italian and Asian dining, executive club lounge, and resort swimming pool.',
    coverImageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&auto=format&fit=crop',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop'
    ],
    features: ['Singapore River Views', 'Promenade Waterfront Dining', 'Resort Pool & Jacuzzi', 'Havelock MRT Connection'],
    roomCategories: ['Superior City View', 'Deluxe Waterfront Room', 'Club Executive Suite'],
    isDisplayed: true
  },
  {
    _id: 'berjaya-times-square',
    slug: 'berjaya-times-square-hotel-kuala-lumpur',
    name: 'Berjaya Times Square Hotel Kuala Lumpur',
    subtitle: 'Integrated with Indoor Theme Park & Shopping Hub',
    star: '5-Star',
    location: 'Malaysia',
    roomType: 'Studio Suite / Superior 2-Bedroom',
    hotelAddress: '1 Jalan Imbi, Bukit Bintang, 55100 Kuala Lumpur, Malaysia',
    description: 'Premier Kuala Lumpur hotel integrated with Berjaya Times Square Shopping Mall and Indoor Theme Park, featuring rooftop pool, squash courts, and monorail link right at the doorstep.',
    coverImageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&auto=format&fit=crop',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'
    ],
    features: ['Integrated with Indoor Theme Park', 'Imbi Monorail Station Access', 'Rooftop Swimming Pool', 'Bukit Bintang Golden Triangle'],
    roomCategories: ['Studio Suite', 'Superior 2-Bedroom Suite', 'Club Premier Room'],
    isDisplayed: true
  }
]

export async function getAllHotels(): Promise<HotelData[]> {
  try {
    // 1. Fetch from Sanity
    const sanityHotels: any[] = await client.fetch(`*[_type == "b2bServiceMedia" && category == "hotel"]{
      _id,
      "slug": slug.current,
      title,
      subtitle,
      destination,
      description,
      "coverImageFile": coverImage.asset->url,
      coverImageUrl,
      "videoFileUrl": videoFile.asset->url,
      videoUrl,
      "galleryUploaded": galleryImages[].asset->url,
      galleryImageUrls,
      features,
      starRating,
      hotelAddress,
      roomCategories,
      shorts,
      isDisplayed
    }`)

    const normalizedSanity: HotelData[] = (sanityHotels || []).map(h => ({
      _id: h._id,
      slug: h.slug || slugifyHotelName(h.title),
      name: h.title,
      subtitle: h.subtitle,
      star: h.starRating || '4-Star',
      location: h.destination || 'Singapore',
      hotelAddress: h.hotelAddress,
      description: h.description || `${h.title} partner hotel in ${h.destination || 'Singapore'}.`,
      coverImageUrl: h.coverImageFile || h.coverImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      videoUrl: h.videoFileUrl || h.videoUrl,
      galleryImageUrls: h.galleryUploaded || h.galleryImageUrls || [],
      features: h.features || [],
      roomCategories: h.roomCategories || [],
      shorts: h.shorts || [],
      isDisplayed: h.isDisplayed !== false
    }))

    // Combine with DEFAULT_HOTELS for any missing ones
    const sanityNames = new Set(normalizedSanity.map(h => h.name.toLowerCase().trim()))
    const missingDefaults = DEFAULT_HOTELS.filter(d => !sanityNames.has(d.name.toLowerCase().trim()))
    return [...normalizedSanity, ...missingDefaults]
  } catch (err) {
    return DEFAULT_HOTELS
  }
}

export async function getHotelBySlug(slug: string): Promise<HotelData | null> {
  const all = await getAllHotels()
  const cleanSlug = slug.toLowerCase().trim()
  const found = all.find(h => h.slug.toLowerCase() === cleanSlug || slugifyHotelName(h.name) === cleanSlug)
  return found || null
}
