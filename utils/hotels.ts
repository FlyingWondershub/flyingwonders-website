import { client } from '../sanity/lib/client'
import type { TravelShort } from './packages'
import type { AppDetails } from '../components/AppDownloadCard'

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
  mustDoThings?: string[]
  timings?: string
  tipsAndTricks?: string[]
  appDetails?: AppDetails
  shorts?: TravelShort[]
  isDisplayed?: boolean
}

/**
 * Normalizes raw hotel names from Google Sheets / legacy data:
 * - Extracts and removes leading star prefixes ("4* V Hotel lavendar" -> "V Hotel Lavender")
 * - Corrects known spelling variants ("lavendar" -> "Lavender", "tyrwhitt" -> "Tyrwhitt", "Boss Hotel" -> "Hotel Boss Singapore", "chancellor" -> "Hotel Chancellor @ Orchard")
 */
export function cleanHotelName(rawName: string): { cleanName: string; detectedStar?: string } {
  if (!rawName) return { cleanName: 'Partner Hotel' }

  let name = rawName.trim()
  let detectedStar: string | undefined = undefined

  // Detect star rating from name prefixes like "5*", "4*", "3*", "4 Star", "5-Star"
  const starMatch = name.match(/^([1-5])\s*(\*|-star|star)\s*/i)
  if (starMatch) {
    detectedStar = `${starMatch[1]}-Star`
    name = name.replace(/^([1-5])\s*(\*|-star|star)\s*/i, '').trim()
  } else if (/^budget\s*\/\s*value\s*hotel/i.test(name)) {
    detectedStar = '3-Star'
    name = name.replace(/^budget\s*\/\s*value\s*hotel\s*-\s*/i, 'Budget Hotel ').trim()
  }

  // Normalize common naming typos and variations
  name = name
    .replace(/\blavendar\b/gi, 'Lavender')
    .replace(/\btyrwhitt\b/gi, 'Tyrwhitt')
    .replace(/\bBoss Hotel\b/gi, 'Hotel Boss Singapore')
    .replace(/^Hotel Boss$/i, 'Hotel Boss Singapore')
    .replace(/^Marina Bay Sands$/i, 'Marina Bay Sands Singapore')
    .replace(/\bHotel Chancellor\b/gi, 'Hotel Chancellor @ Orchard')
    .replace(/^Hotel Chancellor @ Orchard Singapore$/i, 'Hotel Chancellor @ Orchard')
    .replace(/\bAlbert Court\b/gi, 'Village Hotel Albert Court')
    .replace(/\bVillage Hotel Village Hotel\b/gi, 'Village Hotel')
    .replace(/\s+/g, ' ')
    .trim()

  return { cleanName: name, detectedStar }
}

/**
 * Generates a clean URL slug from any hotel name or slug input:
 * - Strips leading star prefixes ("4-v-hotel-lavendar" -> "v-hotel-lavender")
 * - Corrects spelling variants ("lavendar" -> "lavender")
 */
export function slugifyHotelName(name: string): string {
  if (!name) return 'partner-hotel'
  
  const { cleanName } = cleanHotelName(name)
  
  let slug = cleanName
    .toLowerCase()
    .trim()
    .replace(/\blavendar\b/g, 'lavender')
    .replace(/@/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Remove leading numbers followed by hyphen if it represents a star prefix
  slug = slug.replace(/^[1-5]-(hotel-boss|v-hotel|marina-bay|village-hotel|dorsett|grand-copthorne|holiday-inn|ibis|aqueen|hotel-mi|mercure|serangoon|one-farrer|hotel-chancellor)/i, '$1')

  return slug
}

export function normalizeHotelSlug(rawSlug: string): string {
  if (!rawSlug) return ''
  let s = rawSlug.toLowerCase().trim()
  s = s.replace(/^[1-5]-star-/i, '')
  s = s.replace(/^[1-5]-/i, '')
  s = s.replace(/lavendar/g, 'lavender')
  if (s === 'boss-hotel' || s === 'hotel-boss') return 'hotel-boss-singapore'
  if (s === 'albert-court' || s === 'ibis-styles-albert-court') return 'village-hotel-albert-court'
  if (s === 'marina-bay-sands') return 'marina-bay-sands-singapore'
  if (s === 'chancellor' || s === 'hotel-chancellor' || s === 'hotel-chancellor-orchard-singapore') return 'hotel-chancellor-orchard'
  return s
}

export const DEFAULT_HOTELS: HotelData[] = [
  {
    _id: 'hotel-chancellor-orchard',
    slug: 'hotel-chancellor-orchard',
    name: 'Hotel Chancellor @ Orchard',
    subtitle: 'Prime Orchard Road Shopping Belt · 5 Mins Walk to Somerset MRT (NS23)',
    star: '3.5-Star / 4-Star',
    location: 'Singapore',
    roomType: 'Deluxe Room / Premier Queen / Family Triple',
    hotelAddress: '28 Cavenagh Road, Orchard / Somerset, Singapore 229635',
    description: 'Centrally located in the prestigious Orchard Road shopping enclave, Hotel Chancellor @ Orchard offers contemporary comfort with unbeatable city access. Featuring a spectacular rooftop outdoor swimming pool overlooking the Somerset skyline, in-room instant hot/cold filtered water dispensers, the all-day dining Bistro @ Chancellor Cafe, and 24-hour reception just 5 minutes walk from Somerset MRT Station (NS23) and Orchard Central.',
    coverImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=ANgyFcQDhLE',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop'
    ],
    features: [
      'Rooftop Outdoor Skyline Pool',
      'In-Room Filtered Hot/Cold Water Tap',
      '5 Mins Sheltered Walk to Somerset MRT',
      'Bistro @ Chancellor Halal & International Buffet',
      'Free High-Speed Wi-Fi',
      '24/7 Concierge Support'
    ],
    mustDoThings: [
      'Relax at the Rooftop Outdoor Swimming Pool with panoramic Orchard city views',
      'Enjoy Daily International Buffet Breakfast at Bistro @ Chancellor Cafe',
      'Step right into Orchard Road shopping: Orchard Central, 313@Somerset, Takashimaya, and Paragon',
      'Take an evening architectural stroll through historic Emerald Hill Peranakan shophouse heritage enclave just behind the hotel',
      'Explore late-night Japanese ramen & izakaya dining at adjacent Cuppage Plaza'
    ],
    timings: 'Check-In: From 3:00 PM | Check-Out: Until 12:00 PM (Noon) | Breakfast: 6:30 AM – 10:00 AM Daily | Rooftop Pool: 7:00 AM – 9:00 PM',
    tipsAndTricks: [
      'Somerset MRT Connection: Walk through the covered Cuppage Terrace pathway to access Somerset MRT (NS23) within 5–7 minutes without exposure to tropical rain or heat.',
      'In-Room Filtered Hot Water: Every room is equipped with an instant hot/cold purified water dispenser tap—super convenient for instant tea, coffee, and baby formula milk.',
      'B2B Wholesale Advantage: Popular corporate and family FIT hotel offering high-availability wholesale room allotments through Flying Wonders DMC.',
      'Late Check-out / Luggage Storage: Free secure luggage storage is available at the 24-hour reception desk if you have an evening flight out of Changi Airport.'
    ],
    appDetails: {
      appName: 'Hotel Chancellor Digital Concierge & Singapore Travel Apps',
      appDescription: 'Instant WhatsApp guest support, Grab ride booking, and MyICA SG Arrival Card mobile tools.',
      appFeatures: [
        '24/7 WhatsApp B2B & Guest Concierge Desk',
        'Direct Taxi / Grab Fare Estimation',
        'Offline Orchard Shopping & Dining Guide'
      ]
    },
    roomCategories: [
      'Deluxe Queen Room (18 sqm)',
      'Deluxe Twin Room (2 Single Beds)',
      'Premier King Room with City View (22 sqm)',
      'Family Triple Room with Balcony (1 Queen + 1 Single Bed)'
    ],
    shorts: [
      {
        id: 'hc-short-1',
        title: 'Hotel Chancellor @ Orchard Rooftop Pool & Orchard View 🇸🇬',
        creator: 'SingaporeHotels',
        views: '210K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop',
        youtubeVideoId: 'ANgyFcQDhLE'
      }
    ],
    isDisplayed: true
  },
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
    videoUrl: 'https://www.youtube.com/watch?v=ANgyFcQDhLE',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop'
    ],
    features: ['Outdoor Skyline Pool', '5 Mins Walk to Lavender MRT', 'Halal-Certified Food Court', '24/7 Gym', 'Free High-Speed Wi-Fi', 'Daily Buffet Breakfast'],
    mustDoThings: [
      'Swim at the Sky Terrace Outdoor Pool overlooking the Singapore skyline',
      'Enjoy 24-hour dining options at the on-site halal food court and Founder Bak Kut Teh',
      'Walk 5 minutes to Bugis Junction and Kampong Glam heritage quarter'
    ],
    timings: 'Check-In: From 3:00 PM | Check-Out: Until 11:00 AM | Pool: 7:00 AM – 9:00 PM',
    tipsAndTricks: [
      'Take the East-West green line directly from Changi Airport to Lavender MRT Station (EW11), Exit B is 300m from the lobby.',
      'Family rooms with balconies offer great views of Kampong Glam and Marina Bay Sands.'
    ],
    roomCategories: ['Superior Double Room', 'Premier Queen with Balcony', 'Family Triple / Quad Room', 'Executive King Suite'],
    shorts: [
      {
        id: 'hb-short-1',
        title: 'Hotel Boss Singapore Sky Pool & City View 🇸🇬',
        creator: 'SingaporeHotels',
        views: '320K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop',
        youtubeVideoId: 'ANgyFcQDhLE'
      },
      {
        id: 'hb-short-2',
        title: 'Hotel Boss Room Tour & Lavender MRT Walk 🚶‍♂️',
        creator: 'TravelVibesSG',
        views: '180K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop',
        youtubeVideoId: 'YdQkn0X-5q0'
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
    videoUrl: 'https://www.youtube.com/watch?v=ANgyFcQDhLE',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop'
    ],
    features: ['Direct Lavender MRT Link', 'Direct Train to Changi Airport', 'Sky Terrace Pool', 'Currency Exchange Desk', '24/7 Concierge'],
    mustDoThings: [
      'Enjoy seamless direct indoor access to Lavender MRT train platform',
      'Take a dip in the 4th-floor landscaped sky pool and garden terrace',
      'Sample multi-cuisine dishes at Kopitiam food court directly beneath the hotel'
    ],
    timings: 'Check-In: From 3:00 PM | Check-Out: Until 11:00 AM | Pool: 7:00 AM – 9:00 PM',
    tipsAndTricks: [
      'Zero rain exposure: The MRT station escalator opens right inside the hotel lobby building.',
      'Direct East-West green line train straight to City Hall, Raffles Place, and Jurong East.'
    ],
    roomCategories: ['Superior Queen Room', 'Premier Twin Room', 'Triple Family Room'],
    shorts: [
      {
        id: 'vh-short-1',
        title: 'Direct MRT Access at V Hotel Lavender Singapore 🚇',
        creator: 'SingaporeTransit',
        views: '240K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop',
        youtubeVideoId: 'ANgyFcQDhLE'
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
    videoUrl: 'https://www.youtube.com/watch?v=YdQkn0X-5q0',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'
    ],
    features: ['World-Famous 57F Infinity Pool', 'Sands SkyPark Access', 'Celebrity Chef Dining', 'Direct Bayfront MRT Link', 'Luxury Banyan Tree Spa'],
    mustDoThings: [
      'Swim in the world-famous 57th floor Rooftop Infinity Pool overlooking Marina Bay',
      'Watch sunset from the Sands SkyPark Observation Deck',
      'Dine at celebrity chef restaurants (Gordon Ramsay Bread Street Kitchen, CUT by Wolfgang Puck, Spago)'
    ],
    timings: 'Check-In: From 3:00 PM | Check-Out: Until 11:00 AM | Infinity Pool: 6:00 AM – 12:00 AM (Midnight)',
    tipsAndTricks: [
      'Infinity pool access is exclusively reserved for registered hotel room key card holders.',
      'Direct underground connection to Bayfront MRT Station (DT16/CE1).'
    ],
    roomCategories: ['Deluxe City View', 'Sands Premier Suite', 'Club King with SkyPark Access', 'Presidential Harbour Suite'],
    shorts: [
      {
        id: 'mbs-short-1',
        title: '57th Floor Infinity Pool at Marina Bay Sands 🏊‍♂️✨',
        creator: 'LuxuryTravelSG',
        views: '2.4M views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&auto=format&fit=crop',
        youtubeVideoId: 'YdQkn0X-5q0'
      },
      {
        id: 'mbs-short-2',
        title: 'Sands SkyPark Observation Deck Sunset View 🌅',
        creator: 'VisitSingapore',
        views: '850K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop',
        youtubeVideoId: '20vUdgKaWPE'
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
    _id: 'village-hotel-albert-court',
    slug: 'village-hotel-albert-court',
    name: 'Village Hotel Albert Court by Far East Hospitality',
    subtitle: 'Straits Heritage Hotel · 3 Mins Walk to Rochor & Little India MRT',
    star: '4-Star',
    location: 'Singapore',
    roomType: 'Superior Room / Deluxe Heritage Room',
    hotelAddress: '180 Albert Street, Rochor / Little India Heritage Enclave, Singapore 189971',
    description: 'Imbued with rich Straits Chinese and Peranakan heritage charm, Village Hotel Albert Court is a distinguished 4-star boutique-style sanctuary situated in the vibrant cultural corridor of Rochor and Little India. Featuring charming restored shophouses, 210 elegant guestrooms with timber furnishings, outdoor relaxation courtyard, twin indoor jacuzzis, fitness gymnasium, and celebrated international dining.',
    coverImageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=ANgyFcQDhLE',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'
    ],
    features: ['Peranakan Straits Heritage Architecture', '3 Mins Walk to Rochor MRT', '3 Mins to Little India MRT', 'Twin Indoor Relaxation Jacuzzis', '24/7 Fitness Center', 'Free High-Speed Wi-Fi', 'Daily Buffet Breakfast'],
    roomCategories: ['Superior Room', 'Deluxe Room with Heritage Décor', 'Premier Room', 'Family Quad Room'],
    shorts: [
      {
        id: 'vhac-short-1',
        title: 'Village Hotel Albert Court Heritage & MRT Walk 🇸🇬',
        creator: 'SingaporeHotels',
        views: '195K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop',
        youtubeVideoId: 'ANgyFcQDhLE'
      }
    ],
    isDisplayed: true
  },
  {
    _id: 'dorsett-singapore',
    slug: 'dorsett-singapore',
    name: 'Dorsett Singapore',
    subtitle: 'Direct Outram Park MRT Access (3 Train Lines) · Chinatown Heritage Hub',
    star: '4-Star',
    location: 'Singapore',
    roomType: 'Dorsett Room / Deluxe Balcony',
    hotelAddress: '333 New Bridge Road, Chinatown / Outram Park, Singapore 088765',
    description: 'Strategically situated directly above Outram Park MRT interchange station (connecting the East-West, North-East, and Thomson-East Coast Lines), Dorsett Singapore is a sophisticated 4-star upscale hotel nestled at the historic cultural crossroad of Chinatown. Featuring 285 stylishly designed modern guestrooms with full-height windows, a sparkling 30-meter outdoor swimming pool with integrated jacuzzi, modern fitness center, and high-speed Wi-Fi.',
    coverImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=ANgyFcQDhLE',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop'
    ],
    features: ['Direct Outram Park MRT Link (3 Lines)', '30m Outdoor Swimming Pool & Jacuzzi', 'Chinatown Heritage & Dining', '24/7 Gym', 'Free High-Speed Wi-Fi', 'Daily Buffet Breakfast'],
    roomCategories: ['Dorsett Room', 'Deluxe Room with Balcony', 'Loft Room with High Ceiling', 'Executive King Suite'],
    shorts: [
      {
        id: 'ds-short-1',
        title: 'Direct MRT Link & Room Tour at Dorsett Singapore 🚇✨',
        creator: 'SingaporeTraveler',
        views: '145K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop',
        youtubeVideoId: 'ANgyFcQDhLE'
      }
    ],
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
      mustDoThings,
      timings,
      tipsAndTricks,
      appDetails,
      shorts,
      isDisplayed
    }`)

    const normalizedSanity: HotelData[] = (sanityHotels || []).map(h => {
      const { cleanName, detectedStar } = cleanHotelName(h.title)
      return {
        _id: h._id,
        slug: h.slug || slugifyHotelName(cleanName),
        name: cleanName,
        subtitle: h.subtitle,
        star: h.starRating || detectedStar || '4-Star',
        location: h.destination || 'Singapore',
        hotelAddress: h.hotelAddress,
        description: h.description || `${cleanName} partner hotel in ${h.destination || 'Singapore'}.`,
        coverImageUrl: h.coverImageFile || h.coverImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        videoUrl: h.videoFileUrl || h.videoUrl,
        galleryImageUrls: h.galleryUploaded || h.galleryImageUrls || [],
        features: h.features || [],
        roomCategories: h.roomCategories || [],
        mustDoThings: h.mustDoThings || [],
        timings: h.timings,
        tipsAndTricks: h.tipsAndTricks || [],
        appDetails: h.appDetails,
        shorts: h.shorts || [],
        isDisplayed: h.isDisplayed !== false
      }
    })

    // Combine with DEFAULT_HOTELS for any missing ones
    const sanitySlugs = new Set(normalizedSanity.map(h => normalizeHotelSlug(h.slug)))
    const missingDefaults = DEFAULT_HOTELS.filter(d => !sanitySlugs.has(normalizeHotelSlug(d.slug)))
    return [...normalizedSanity, ...missingDefaults]
  } catch (err) {
    return DEFAULT_HOTELS
  }
}

export async function getHotelBySlug(rawSlug: string): Promise<HotelData | null> {
  const all = await getAllHotels()
  const targetSlug = normalizeHotelSlug(rawSlug)
  
  // 1. Direct match on normalized slug
  const directMatch = all.find(h => 
    normalizeHotelSlug(h.slug) === targetSlug || 
    slugifyHotelName(h.name) === targetSlug
  )
  if (directMatch) return directMatch

  // 2. Fuzzy substring match (e.g. "chancellor" matching "hotel-chancellor-orchard", "boss" matching "hotel-boss-singapore")
  const fuzzyMatch = all.find(h => {
    const s = normalizeHotelSlug(h.slug)
    return s.includes(targetSlug) || targetSlug.includes(s)
  })
  if (fuzzyMatch) return fuzzyMatch

  // 3. Fallback: Check if it's a generic partner hotel from the spreadsheet
  const { cleanName, detectedStar } = cleanHotelName(rawSlug.replace(/-/g, ' '))
  return {
    _id: `dynamic-${rawSlug}`,
    slug: rawSlug,
    name: cleanName,
    subtitle: `${detectedStar || '4-Star'} Partner Hotel · Singapore`,
    star: detectedStar || '4-Star',
    location: 'Singapore',
    roomType: 'Deluxe Room / Twin Room',
    hotelAddress: 'Singapore / Malaysia Destination Network',
    description: `${cleanName} is a verified partner hotel offering comfortable accommodations, daily buffet breakfast options, high-speed Wi-Fi, and convenient transit links for leisure and corporate travelers.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop',
    features: ['Daily Buffet Breakfast Available', 'Free High-Speed Wi-Fi', 'Swimming Pool', '24/7 Concierge Support'],
    mustDoThings: ['Comfortable stay in prime city location', 'Daily buffet breakfast', 'Convenient transit access'],
    timings: 'Check-In: From 3:00 PM | Check-Out: Until 12:00 PM',
    tipsAndTricks: ['Check-in online or present booking voucher at front desk.'],
    roomCategories: ['Standard Room', 'Deluxe Room', 'Family Room'],
    isDisplayed: true
  }
}
