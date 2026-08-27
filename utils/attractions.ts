import { client } from '../sanity/lib/client'
import type { TravelShort } from './packages'
import type { AppDetails } from '../components/AppDownloadCard'

export interface AttractionData {
  _id: string
  slug: string
  name: string
  subtitle?: string
  category: string
  destination: string
  locationAddress?: string
  description: string
  duration?: string
  starRating?: string
  coverImageUrl: string
  videoUrl?: string
  galleryImageUrls?: string[]
  features?: string[]
  mustDoThings?: string[]
  timings?: string
  tipsAndTricks?: string[]
  appDetails?: AppDetails
  shorts?: TravelShort[]
  subTickets?: {
    typeTitle: string
    validityPeriodText?: string
    bookingType?: string
  }[]
  isDisplayed?: boolean
}

export function cleanAttractionName(rawName: string): string {
  if (!rawName) return 'Singapore Attraction'
  return rawName
    .replace(/^Singapore\s*-\s*/i, '')
    .replace(/^Malaysia\s*-\s*/i, '')
    .trim()
}

export function slugifyAttractionName(name: string): string {
  if (!name) return 'singapore-attraction'
  const cleaned = cleanAttractionName(name)
  return cleaned
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeAttractionSlug(rawSlug: string): string {
  if (!rawSlug) return ''
  let s = rawSlug.toLowerCase().trim()
  if (s === 'uss' || s === 'universal-studios' || s === 'universal-studio') return 'universal-studios-singapore'
  if (s === 'night-safari' || s === 'mandai-night-safari') return 'night-safari-singapore'
  if (s === 'gardens' || s === 'gardens-by-the-bay-singapore' || s === 'gbtb') return 'gardens-by-the-bay'
  if (s === 'sea-aquarium' || s === 'sea-aquarium-sentosa') return 'sea-aquarium-singapore'
  if (s === 'flyer' || s === 'singapore-flyer-scenic') return 'singapore-flyer'
  if (s === 'zoo' || s === 'singapore-zoo-mandai') return 'singapore-zoo'
  return s
}

export const DEFAULT_ATTRACTIONS: AttractionData[] = [
  {
    _id: 'attraction-uss',
    slug: 'universal-studios-singapore',
    name: 'Universal Studios Singapore (USS)',
    subtitle: 'Southeast Asia’s Premier Movie Theme Park at Resorts World Sentosa',
    category: 'Theme Park / Sentosa Island',
    destination: 'Singapore',
    locationAddress: '8 Sentosa Gateway, Resorts World Sentosa, Sentosa Island, Singapore 098269',
    starRating: '4.9',
    duration: '6 to 8 Hours (Full-Day)',
    description: 'Immerse yourself in the blockbuster thrills of Universal Studios Singapore, Southeast Asia\'s only Universal Studios theme park featuring 24 exhilarating rides, shows, and attractions across 6 uniquely themed zones including Hollywood, New York, Sci-Fi City, Ancient Egypt, The Lost World, and Far Far Away.',
    coverImageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=2J3E-hOwh3A',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1513415564515-763d91423bdd?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'
    ],
    features: [
      'Instant eVoucher Confirmation',
      'Direct Turnstile QR Entry',
      'Skip Queue with Express Pass Option',
      'Free 45-Min Coaster Lockers',
      'Halal & Vegetarian Dining Options'
    ],
    mustDoThings: [
      'Battlestar Galactica: HUMAN vs. CYLON™ (World’s tallest duelling roller coasters with inverted zero-G rolls)',
      'TRANSFORMERS The Ride: The Ultimate 3D Battle (Hyper-realistic 3D thrill motion simulation)',
      'Revenge of the Mummy™ (High-speed indoor dark coaster with sudden drops in total darkness)',
      'Jurassic Park Rapids Adventure™ (River raft ride featuring a 40-foot vertical splash plunge)',
      'WaterWorld™ Live Stunt Show (Death-defying explosions, jet ski thrills, and pyrotechnics)',
      'Shrek 4D Adventure & Far Far Away Fairy Tale Castle',
      'Meet & Greet with Minions, Optimus Prime & Bumblebee'
    ],
    timings: '10:00 AM – 7:00 PM Daily (Extended to 8:00 PM on peak weekends & seasonal events); Best Time: Weekday mornings at 9:45 AM opening.',
    tipsAndTricks: [
      'Universal Express Pass: Highly recommended during school holidays, weekends, and summer travel months to bypass 60+ min wait times.',
      'Single Rider Line Hack: Ride TRANSFORMERS, Revenge of the Mummy, and Jurassic Park via the Single Rider lane if you don’t mind sitting in separate rows—cuts wait times by up to 70%!',
      'Free Lockers: Take advantage of free lockers for up to 45 minutes located next to Revenge of the Mummy and Battlestar Galactica before queueing.',
      'Bring a Poncho: Bring your own lightweight rain poncho or waterproof bag for Jurassic Park Rapids Adventure to avoid paying S$5+ retail inside the park.',
      'Getting There: Take the MRT North-East or Circle Line to HarbourFront Station (NE1/CC29), then take the Sentosa Express monorail from VivoCity Level 3 to Resorts World Station.'
    ],
    appDetails: {
      appName: 'Universal Studios Singapore (Resorts World Sentosa) Official App',
      appDescription: 'Your indispensable companion inside the park: track live ride queue times, view real-time show schedules, navigate with GPS, and pre-order food.',
      appStoreUrl: 'https://apps.apple.com/app/resorts-world-sentosa/id1081753177',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.rwsentosa.mobile',
      appFeatures: [
        'Live Ride Wait Times & Status Updates',
        'Interactive GPS Wayfinding Park Map',
        'Daily Show Timings & Push Notifications',
        'Mobile Dining Pre-Order & Halal Filter',
        'Digital Express Pass Wallet'
      ]
    },
    shorts: [
      {
        id: 'uss-short-1',
        title: 'Battlestar Galactica: Human vs Cylon Coaster POV 🎢',
        creator: 'ThemeParkRider',
        views: '1.2M views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1513415564515-763d91423bdd?w=600&auto=format&fit=crop',
        youtubeVideoId: '2J3E-hOwh3A'
      },
      {
        id: 'uss-short-2',
        title: 'Transformers The Ride 3D Battle at Universal Studios 🇸🇬',
        creator: 'SingaporeAdventures',
        views: '890K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&auto=format&fit=crop',
        youtubeVideoId: 't5A5L_e1Q9k'
      }
    ],
    subTickets: [
      { typeTitle: 'Universal Studios Singapore 1-Day Dated Pass (Adult)', validityPeriodText: 'Fixed Date Admission', bookingType: 'Direct QR Entry' },
      { typeTitle: 'Universal Studios Singapore 1-Day Dated Pass (Child 4-12 yrs)', validityPeriodText: 'Fixed Date Admission', bookingType: 'Direct QR Entry' },
      { typeTitle: 'Universal Express Unlimited Pass Add-On', validityPeriodText: 'Valid on Selected Date', bookingType: 'Skip Queue Access' }
    ],
    isDisplayed: true
  },
  {
    _id: 'attraction-night-safari',
    slug: 'night-safari-singapore',
    name: 'Night Safari Singapore (Mandai Wildlife Reserve)',
    subtitle: 'World’s First Nocturnal Wildlife Safari Park & Rainforest Experience',
    category: 'Wildlife & Safari / Mandai',
    destination: 'Singapore',
    locationAddress: '80 Mandai Lake Road, Mandai Wildlife Reserve, Singapore 729826',
    starRating: '4.8',
    duration: '3.5 to 4.5 Hours (Evening)',
    description: 'Explore the world’s very first nocturnal wildlife park! Spanning 35 hectares of dense secondary rainforest, Night Safari is home to nearly 900 animals across 100 species—41% of which are threatened. Experience an exhilarating open-air guided tram tour and walking trails illuminated by subtle moonlighting.',
    coverImageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&auto=format&fit=crop'
    ],
    features: [
      'Multi-Sensory 35-Min Guided Tram Safari',
      '4 Interconnected Rainforest Walking Trails',
      'Creatures of the Night Presentation',
      'Khatib MRT Shuttle Link (S$1)',
      'Ulu Ulu Authentic Asian Dining'
    ],
    mustDoThings: [
      'Guided Tram Safari Tour (35-minute narrated journey across 6 global habitats from Himalayan Foothills to Equatorial Africa)',
      'Creatures of the Night Show (Fascinating presentation highlighting natural predatory and defense skills of binturongs, civets, and otters)',
      'Leopard Trail & Fishing Cat Trail (Up-close viewing of leopards, giant flying squirrels, and fishing cats hunting in shallow streams)',
      'Tasmanian Devil & Wallaby Trail (Encounter marsupials and nocturnal Australian native fauna under soft moonlight)',
      'East Lodge Trail (Spot Malayan tigers, babirusas, and spotted hyenas in their natural nocturnal habitats)',
      'Ulu Ulu Safari Restaurant (Dine amidst rustic timber ambiance serving Singapore Laksa, Chicken Rice, and Satay)'
    ],
    timings: '7:15 PM – 12:00 AM (Midnight) Daily (Last admission: 11:15 PM). Recommended entry time-slots: 7:15 PM or 8:15 PM.',
    tipsAndTricks: [
      'Mandai Time-Slot Reservation: You MUST pre-book your specific entry time-slot in advance, as park capacity is strictly managed for nocturnal animal welfare.',
      'Walk the Trails First: Do the walking trails right upon entry (between 7:30 PM and 8:45 PM) while natural twilight provides great visibility, then ride the Tram around 9:30 PM when queues drastically shorten.',
      'Strictly No Flash Photography: Flash photography is strictly forbidden as it damages the sensitive eyes of nocturnal creatures. Turn off flash and enable night mode.',
      'Insect Repellent & Umbrella: As Night Safari is nestled in dense natural rainforest, apply DEET-free mosquito repellent and pack a small umbrella for unexpected tropical showers.',
      'Mandai Khatib Shuttle: Take the MRT North-South Line to Khatib Station (NS14), then hop on the Mandai Khatib Shuttle (only S$1, departs every 10–15 mins) directly to the park gates.'
    ],
    appDetails: {
      appName: 'Mandai Wildlife Reserve Official App',
      appDescription: 'Interactive GPS wayfinding map for Night Safari, Singapore Zoo, Bird Paradise, and River Wonders. Includes animal presentation alerts and mobile food ordering.',
      appStoreUrl: 'https://apps.apple.com/app/mandai-wildlife-reserve/id1535497210',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.mandai.app',
      appFeatures: [
        'Interactive Night-Mode GPS Park Map',
        'Show Alarms & Presentation Seat Bookings',
        'Real-Time Tram Queue Status',
        'Audio Guide & Animal Fun Facts',
        'Mobile Food & Beverage Ordering'
      ]
    },
    shorts: [
      {
        id: 'ns-short-1',
        title: 'Night Safari Singapore Guided Tram Tour Experience 🌙🐘',
        creator: 'WildSingapore',
        views: '650K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=600&auto=format&fit=crop',
        youtubeVideoId: 'kYJzX9Qz8oM'
      }
    ],
    subTickets: [
      { typeTitle: 'Night Safari Admission with Tram Ride (Adult)', validityPeriodText: 'Selected Time-Slot', bookingType: 'Time-Slot eVoucher' },
      { typeTitle: 'Night Safari Admission with Tram Ride (Child 3-12 yrs)', validityPeriodText: 'Selected Time-Slot', bookingType: 'Time-Slot eVoucher' }
    ],
    isDisplayed: true
  },
  {
    _id: 'attraction-gardens-by-the-bay',
    slug: 'gardens-by-the-bay',
    name: 'Gardens by the Bay Singapore',
    subtitle: 'World-Famous Futuristic Green Oasis & Cloud Forest Conservatory',
    category: 'Botanical & Architectural / Marina Bay',
    destination: 'Singapore',
    locationAddress: '18 Marina Gardens Drive, Marina Bay, Singapore 018953',
    starRating: '4.9',
    duration: '3 to 5 Hours',
    description: 'An architectural and horticultural marvel spanning 101 hectares in the heart of Marina Bay. Features the world-record Cloud Forest conservatory with a 35-meter indoor waterfall, the climate-controlled Flower Dome, Floral Fantasy, and the iconic Supertree Grove.',
    coverImageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=t5A5L_e1Q9k',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&auto=format&fit=crop'
    ],
    features: [
      'World’s Largest Glass Greenhouse (Flower Dome)',
      '35m Indoor Waterfall & Mist Cloud Walk',
      'Free Supertree Garden Rhapsody Light Show',
      'Direct Bayfront MRT (TE20 / DT16) Connection'
    ],
    mustDoThings: [
      'Cloud Forest Conservatory & 35-Meter Indoor Mountain Waterfall',
      'Flower Dome Conservatory (Ever-changing floral displays and thousand-year-old olive trees)',
      'Supertree Grove Garden Rhapsody Light & Music Show (Daily at 7:45 PM & 8:45 PM - Free to watch)',
      'OCBC Skyway Aerial Walkway suspended 22 meters above ground between Supertrees',
      'Floral Fantasy & 4D Dragonfly Ride'
    ],
    timings: 'Conservatories: 9:00 AM – 9:00 PM Daily (Last ticket sale: 8:00 PM); Outdoor Gardens: 5:00 AM – 2:00 AM (Free access); Best time for Light Show: 7:30 PM.',
    tipsAndTricks: [
      'Bring a Light Jacket: The Flower Dome and Cloud Forest are air-conditioned to 23°C–25°C with high mist levels, which can feel quite chilly.',
      'Supertree Light Show Timings: The Garden Rhapsody show happens twice nightly at 7:45 PM and 8:45 PM. Arrive 20 mins early to find a comfortable grassy viewing spot.',
      'Direct MRT Access: Take the Downtown or Thomson-East Coast Line directly to Bayfront MRT Station (Exit B) or Gardens by the Bay MRT Station (TE22).'
    ],
    appDetails: {
      appName: 'Gardens by the Bay Official App',
      appDescription: 'Interactive GPS wayfinding map, plant scanner identifier, augmented reality flora tours, and ticket booking.',
      appStoreUrl: 'https://apps.apple.com/app/gardens-by-the-bay/id563148107',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.gardensbythebay.app',
      appFeatures: [
        'Interactive Wayfinding & Plant Finder',
        'Garden Rhapsody Show Reminders',
        'AR Interactive Plant Tours',
        'Digital Ticket Wallet'
      ]
    },
    shorts: [
      {
        id: 'gbtb-short-1',
        title: 'Cloud Forest 35m Indoor Waterfall Singapore 🌊🌿',
        creator: 'SingaporeVibes',
        views: '980K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&auto=format&fit=crop',
        youtubeVideoId: 't5A5L_e1Q9k'
      }
    ],
    subTickets: [
      { typeTitle: 'Double Conservatories: Flower Dome + Cloud Forest (Adult)', validityPeriodText: 'Direct QR eVoucher', bookingType: 'Direct Entry' },
      { typeTitle: 'Double Conservatories: Flower Dome + Cloud Forest (Child)', validityPeriodText: 'Direct QR eVoucher', bookingType: 'Direct Entry' }
    ],
    isDisplayed: true
  },
  {
    _id: 'attraction-sea-aquarium',
    slug: 'sea-aquarium-singapore',
    name: 'S.E.A. Aquarium Singapore',
    subtitle: 'One of the World’s Largest Aquariums with 100,000+ Marine Animals',
    category: 'Marine Park / Sentosa Island',
    destination: 'Singapore',
    locationAddress: '8 Sentosa Gateway, Resorts World Sentosa, Sentosa Island, Singapore 098269',
    starRating: '4.7',
    duration: '2.5 to 3.5 Hours',
    description: 'Dive deep into the wonders of the marine realm at S.E.A. Aquarium! Home to over 100,000 marine animals representing 1,000 species across 40 distinct habitats, featuring giant manta rays, scalloped hammerhead sharks, coral reefs, and the awe-inspiring Open Ocean viewing panel.',
    coverImageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop'
    ],
    features: [
      'Massive Open Ocean Viewing Habitat',
      'Shark Seas with Hammerheads & Silvertips',
      'Interactive Discovery Touch Pool',
      'Full Air-Conditioned Comfort'
    ],
    mustDoThings: [
      'Open Ocean Habitat (Massive viewing glass holding over 18 million liters of water and giant manta rays)',
      'Shark Seas Tunnel (Walk beneath dozens of majestic apex predators including hammerheads and nurse sharks)',
      'Coral Garden & Moray Eel Habitat',
      'Discovery Touch Pool (Touch live sea stars and sea cucumbers under keeper supervision)',
      'Ocean Restaurant (Fine dining with front-row panoramic underwater views)'
    ],
    timings: '10:00 AM – 5:00 PM Daily (Last admission: 4:30 PM); Best time: 10:00 AM opening or 2:30 PM afternoon.',
    tipsAndTricks: [
      'Combine with Universal Studios: Located right next door inside Resorts World Sentosa—perfect for a mid-day escape from outdoor afternoon heat.',
      'Feeding Times: Check the daily feeding schedule in the app for manta rays and shark feedings at the Open Ocean window.',
      'Sentosa Express: Take the monorail to Resorts World Station, 3 mins walk from the aquarium entrance.'
    ],
    appDetails: {
      appName: 'Resorts World Sentosa Official App',
      appDescription: 'Live habitat maps, feeding presentation alerts, and digital ticketing.',
      appStoreUrl: 'https://apps.apple.com/app/resorts-world-sentosa/id1081753177',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.rwsentosa.mobile',
      appFeatures: [
        'Feeding Schedules & Show Reminders',
        'Interactive Marine Habitat Map',
        'Direct Turnstile E-Tickets'
      ]
    },
    subTickets: [
      { typeTitle: 'S.E.A. Aquarium 1-Day Admission (Adult)', validityPeriodText: 'Fixed Date Admission', bookingType: 'Direct QR Entry' },
      { typeTitle: 'S.E.A. Aquarium 1-Day Admission (Child)', validityPeriodText: 'Fixed Date Admission', bookingType: 'Direct QR Entry' }
    ],
    isDisplayed: true
  }
]

export async function getAllAttractions(): Promise<AttractionData[]> {
  try {
    const sanityAttractions: any[] = await client.fetch(`*[_type == "b2bServiceMedia" && category == "attraction"]{
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
      duration,
      starRating,
      hotelAddress,
      mustDoThings,
      timings,
      tipsAndTricks,
      appDetails,
      shorts,
      isDisplayed
    }`)

    const normalizedSanity: AttractionData[] = (sanityAttractions || []).map(a => {
      const cleanName = cleanAttractionName(a.title)
      return {
        _id: a._id,
        slug: a.slug || slugifyAttractionName(cleanName),
        name: cleanName,
        subtitle: a.subtitle,
        category: a.subtitle || 'Singapore Attraction',
        destination: a.destination || 'Singapore',
        locationAddress: a.hotelAddress,
        starRating: a.starRating || '4.8',
        duration: a.duration || '3 to 5 Hours',
        description: a.description || `${cleanName} experience in ${a.destination || 'Singapore'}.`,
        coverImageUrl: a.coverImageFile || a.coverImageUrl || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
        videoUrl: a.videoFileUrl || a.videoUrl,
        galleryImageUrls: a.galleryUploaded || a.galleryImageUrls || [],
        features: a.features || [],
        mustDoThings: a.mustDoThings || [],
        timings: a.timings,
        tipsAndTricks: a.tipsAndTricks || [],
        appDetails: a.appDetails,
        shorts: a.shorts || [],
        isDisplayed: a.isDisplayed !== false
      }
    })

    const sanitySlugs = new Set(normalizedSanity.map(a => normalizeAttractionSlug(a.slug)))
    const missingDefaults = DEFAULT_ATTRACTIONS.filter(d => !sanitySlugs.has(normalizeAttractionSlug(d.slug)))
    return [...normalizedSanity, ...missingDefaults]
  } catch (err) {
    return DEFAULT_ATTRACTIONS
  }
}

export async function getAttractionBySlug(rawSlug: string): Promise<AttractionData | null> {
  const all = await getAllAttractions()
  const targetSlug = normalizeAttractionSlug(rawSlug)

  const directMatch = all.find(a =>
    normalizeAttractionSlug(a.slug) === targetSlug ||
    slugifyAttractionName(a.name) === targetSlug
  )
  if (directMatch) return directMatch

  const fuzzyMatch = all.find(a => {
    const s = normalizeAttractionSlug(a.slug)
    return s.includes(targetSlug) || targetSlug.includes(s)
  })
  if (fuzzyMatch) return fuzzyMatch

  const cleanName = cleanAttractionName(rawSlug.replace(/-/g, ' '))
  return {
    _id: `dynamic-${rawSlug}`,
    slug: rawSlug,
    name: cleanName,
    subtitle: 'Verified Destination Attraction · Singapore',
    category: 'Attraction / Sightseeing',
    destination: 'Singapore',
    locationAddress: 'Singapore Destination Network',
    starRating: '4.8',
    duration: '3 to 4 Hours',
    description: `${cleanName} is a top destination attraction in Singapore offering immersive sightseeing, interactive exhibits, and memorable travel experiences.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&auto=format&fit=crop',
    features: ['Instant eVoucher Confirmation', 'Mobile QR Entry', 'Verified B2B DMC Supplier Rates'],
    mustDoThings: ['Signature sightseeing experience', 'Interactive photo opportunities', 'Family-friendly highlights'],
    timings: '10:00 AM – 7:00 PM Daily',
    tipsAndTricks: [
      'Book entry in advance to guarantee your preferred time slot.',
      'Check public transit MRT connections for fastest access.'
    ],
    isDisplayed: true
  }
}
