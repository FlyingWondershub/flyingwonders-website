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
  mapEmbedUrl?: string
  transitInfo?: {
    mrtStation?: string
    busLines?: string
    directions?: string
  }
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
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8197775535567!2d103.8217316757655!3d1.254042898734005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1bf869680373%3A0xb355e1dbbb457e5b!2sUniversal%20Studios%20Singapore!5e0!3m2!1sen!2ssg!4v1700000000000!5m2!1sen!2ssg',
    transitInfo: {
      mrtStation: 'HarbourFront MRT (NE1/CC29) — Exit to VivoCity Level 3',
      busLines: 'Sentosa Express Monorail to Resorts World Station (1 stop) or RWS8 Bus',
      directions: 'Take the MRT to HarbourFront, go to VivoCity Level 3, and take the Sentosa Express monorail directly to Resorts World Station.'
    },
    starRating: '4.9',
    duration: '6 to 8 Hours (Full-Day)',
    description: 'Immerse yourself in the blockbuster thrills of Universal Studios Singapore, Southeast Asia\'s only Universal Studios theme park featuring 24 exhilarating rides, shows, and attractions across 6 uniquely themed zones including Hollywood, New York, Sci-Fi City, Ancient Egypt, The Lost World, and Far Far Away.',
    coverImageUrl: '/images/attractions/universal-studios-singapore/cover.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=j_BoIf1t9wA',
    galleryImageUrls: [
      '/images/attractions/universal-studios-singapore/gallery-1.jpg',
      '/images/attractions/universal-studios-singapore/gallery-2.jpg',
      '/images/attractions/universal-studios-singapore/gallery-3.jpg',
      '/images/attractions/universal-studios-singapore/gallery-4.jpg',
      '/images/attractions/universal-studios-singapore/gallery-5.jpg',
      '/images/attractions/universal-studios-singapore/gallery-6.jpg',
      '/images/attractions/universal-studios-singapore/gallery-7.jpg'
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
        thumbnailUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&auto=format&fit=crop',
        youtubeVideoId: 'j_BoIf1t9wA'
      },
      {
        id: 'uss-short-2',
        title: 'Transformers The Ride 3D Battle at Universal Studios 🇸🇬',
        creator: 'SingaporeAdventures',
        views: '890K views',
        thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Sci-Fi_City_at_Universal_Studios_Singapore.jpg/600px-Sci-Fi_City_at_Universal_Studios_Singapore.jpg',
        youtubeVideoId: 'j_BoIf1t9wA'
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
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.665798485293!2d103.78817747576572!3d1.4023477985842884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da139ef182eead%3A0xc3f8373b5bc25f45!2sNight%20Safari!5e0!3m2!1sen!2ssg!4v1700000000000!5m2!1sen!2ssg',
    transitInfo: {
      mrtStation: 'Khatib MRT (NS14) — Mandai Khatib Shuttle (S$1)',
      busLines: 'Mandai Shuttle from Khatib MRT or Bus 138 from Ang Mo Kio MRT',
      directions: 'Take the North-South Line to Khatib MRT Station, then board the dedicated Mandai Shuttle bus (S$1, 15 minutes direct to Night Safari).'
    },
    starRating: '4.8',
    duration: '3.5 to 4.5 Hours (Evening)',
    description: 'Explore the world’s very first nocturnal wildlife park! Spanning 35 hectares of dense secondary rainforest, Night Safari is home to nearly 900 animals across 100 species—41% of which are threatened. Experience an exhilarating open-air guided tram tour and walking trails illuminated by subtle moonlighting.',
    coverImageUrl: '/images/attractions/night-safari-singapore/cover.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=qk8MkBCwlfE',
    galleryImageUrls: [
      '/images/attractions/night-safari-singapore/gallery-1.jpg',
      '/images/attractions/night-safari-singapore/gallery-2.jpg',
      '/images/attractions/night-safari-singapore/gallery-3.jpg',
      '/images/attractions/night-safari-singapore/gallery-4.jpg',
      '/images/attractions/night-safari-singapore/gallery-5.jpg'
    ],
    features: [
      'Guided 35-Min Tram Safari with Audio Commentary',
      'Creatures of the Night Presentation',
      '4 Immersive Walking Trails in Moonlighting',
      'Direct S$1 Mandai Express Shuttle from Khatib MRT'
    ],
    mustDoThings: [
      'Guided Open-Air Tram Safari through 6 geographical zones',
      'Creatures of the Night Presentation (Amphitheatre show)',
      'Leopard Trail (Spotted leopards, giant flying squirrels, flying foxes in walk-in aviary)',
      'Fishing Cat Trail (Observe nocturnal feline hunting behaviors)',
      'East Lodge Trail (Malayan tigers and babirusas)',
      'Tasmanian Devil Trail (Australia’s iconic nocturnal carnivores)'
    ],
    timings: '7:15 PM – 12:00 AM (Midnight) Daily (Last entry 11:15 PM); Entry time slots: 7:15 PM, 8:15 PM, 9:15 PM, 10:15 PM.',
    tipsAndTricks: [
      'Mandai Shuttle: Take the S$1 express bus from Khatib MRT (NS14) directly to the park in 15 minutes.',
      'Walk Trails First: Walk the 4 walking trails right at 7:15 PM twilight when animals are most active, then take the tram around 9:30 PM after queue crowds subside.',
      'Strict No-Flash Rule: Flash photography is strictly forbidden as it blinds and distresses nocturnal animals—use night mode on your mobile.',
      'Dress Lightly: Wear lightweight breathable clothing and apply mosquito repellent before entering the rainforest.'
    ],
    appDetails: {
      appName: 'Mandai Wildlife Reserve Official App',
      appDescription: 'Interactive GPS wayfinding map, Creatures of the Night show reminder alarms, and mobile food ordering at Ulu Ulu Restaurant.',
      appStoreUrl: 'https://apps.apple.com/app/mandai-wildlife-reserve/id1552865917',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.mandai.app',
      appFeatures: [
        'Live Show Timers & Push Reminders',
        'Interactive GPS Rainforest Walking Trail Map',
        'E-Ticket Mobile Barcode Wallet',
        'Ulu Ulu Safari Restaurant Mobile Ordering'
      ]
    },
    shorts: [
      {
        id: 'ns-short-1',
        title: 'Night Safari Singapore: Night Tram Tour Experience 🐅',
        creator: 'SingaporeWildlife',
        views: '640K views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=600&auto=format&fit=crop',
        youtubeVideoId: 'qk8MkBCwlfE'
      }
    ],
    subTickets: [
      { typeTitle: 'Night Safari Admission + Tram Ride (Adult)', validityPeriodText: 'Fixed Date & Time Slot', bookingType: 'Direct QR Entry' },
      { typeTitle: 'Night Safari Admission + Tram Ride (Child 3-12 yrs)', validityPeriodText: 'Fixed Date & Time Slot', bookingType: 'Direct QR Entry' }
    ],
    isDisplayed: true
  },
  {
    _id: 'attraction-gardens-by-the-bay',
    slug: 'gardens-by-the-bay',
    name: 'Gardens by the Bay Singapore',
    subtitle: 'Futuristic Botanical Wonderland with Supertree Grove & Cloud Forest Waterfall',
    category: 'Nature & Botanical / Marina Bay',
    destination: 'Singapore',
    locationAddress: '18 Marina Gardens Drive, Singapore 018953 (Bayfront MRT)',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8105753066373!2d103.86105377576561!3d1.2815682987062402!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1904937e1633%3A0x62099677b59fca76!2sGardens%20by%20the%20Bay!5e0!3m2!1sen!2ssg!4v1700000000000!5m2!1sen!2ssg',
    transitInfo: {
      mrtStation: 'Bayfront MRT (CE1/DT16) — Exit B / Gardens by the Bay MRT (TE22)',
      busLines: 'Bus 400 from Tanjong Pagar MRT',
      directions: 'Take Downtown Line or Circle Line to Bayfront MRT Station (Exit B) and follow the underground pedestrian link directly into the outdoor gardens.'
    },
    starRating: '4.9',
    duration: '4 to 6 Hours',
    description: 'An internationally acclaimed horticultural showpiece spanning 101 hectares in the heart of Marina Bay. Features two world-record cooled glass conservatories (Flower Dome & Cloud Forest), the 35-meter indoor waterfall mountain, and the towering vertical gardens of Supertree Grove.',
    coverImageUrl: '/images/attractions/gardens-by-the-bay/cover.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=20vUdgKaWPE',
    galleryImageUrls: [
      '/images/attractions/gardens-by-the-bay/gallery-1.jpg',
      '/images/attractions/gardens-by-the-bay/gallery-2.jpg',
      '/images/attractions/gardens-by-the-bay/gallery-3.jpg',
      '/images/attractions/gardens-by-the-bay/gallery-4.jpg',
      '/images/attractions/gardens-by-the-bay/gallery-5.jpg',
      '/images/attractions/gardens-by-the-bay/gallery-6.jpg'
    ],
    features: [
      'Flower Dome (World’s Largest Glass Greenhouse - Guinness World Records)',
      'Cloud Forest 35m Indoor Waterfall & Cloud Walk Canopy',
      'Free Supertree Garden Rhapsody Light Show (7:45 PM & 8:45 PM Daily)',
      'Direct Underground MRT Link at Bayfront Station (CE1/DT16)'
    ],
    mustDoThings: [
      'Cloud Forest: 35-meter-tall indoor mist waterfall and spiral aerial walkways',
      'Flower Dome: Thousand-year-old olive trees, Mediterranean garden, and seasonal floral exhibits',
      'Supertree Grove: Garden Rhapsody music & light choreography at 7:45 PM and 8:45 PM',
      'OCBC Skyway: 22-meter-high walkway suspended between Supertrees',
      'Floral Fantasy: 4 interactive whimsical garden scenes with 4D ride'
    ],
    timings: 'Conservatories (Flower Dome & Cloud Forest): 9:00 AM – 9:00 PM Daily (Last ticket: 8:30 PM); Outdoor Supertree Grove: 5:00 AM – 2:00 AM (Free access).',
    tipsAndTricks: [
      'Bring a Jacket: Conservatories are cooled to 23°C–25°C with high humidity mist in Cloud Forest.',
      'Catch the Light Show: Find a comfortable spot lying on the grass at Supertree Grove 15 minutes before the free 7:45 PM show.',
      'Combo Savings: Pair Flower Dome & Cloud Forest together on a single double-conservatory ticket.'
    ],
    appDetails: {
      appName: 'Gardens by the Bay Mobile App',
      appDescription: 'Interactive botanic guide, plant finder, audio tours, and real-time conservatory queue counters.',
      appStoreUrl: 'https://apps.apple.com/app/gardens-by-the-bay/id1454522046',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.gbtb.gardensbythebay',
      appFeatures: [
        'Interactive Plant & Conservatory Map',
        'Daily Floral Display Schedules',
        'Direct Mobile QR Entry'
      ]
    },
    shorts: [
      {
        id: 'gbtb-short-1',
        title: 'Gardens by the Bay: Cloud Forest 35m Waterfall 🌿',
        creator: 'SingaporeTravelGuide',
        views: '1.8M views',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop',
        youtubeVideoId: '20vUdgKaWPE'
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
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.816666872583!2d103.81883737576562!3d1.2587563987293527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1bf9f73fbfb5%3A0x7d6f51f496aa0e95!2sS.E.A.%20Aquarium!5e0!3m2!1sen!2ssg!4v1700000000000!5m2!1sen!2ssg',
    transitInfo: {
      mrtStation: 'HarbourFront MRT (NE1/CC29) — VivoCity Level 3',
      busLines: 'Sentosa Express Monorail to Resorts World Station',
      directions: 'Take the MRT to HarbourFront, take the Sentosa Express monorail to Resorts World Station, and walk 3 minutes to the aquarium entrance.'
    },
    starRating: '4.7',
    duration: '2.5 to 3.5 Hours',
    description: 'Dive deep into the wonders of the marine realm at S.E.A. Aquarium! Home to over 100,000 marine animals representing 1,000 species across 40 distinct habitats, featuring giant manta rays, scalloped hammerhead sharks, coral reefs, and the awe-inspiring Open Ocean viewing panel.',
    coverImageUrl: '/images/attractions/sea-aquarium-singapore/cover.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=2gAjYk2N-cs',
    galleryImageUrls: [
      '/images/attractions/sea-aquarium-singapore/gallery-1.jpg',
      '/images/attractions/sea-aquarium-singapore/gallery-2.jpg',
      '/images/attractions/sea-aquarium-singapore/gallery-3.jpg',
      '/images/attractions/sea-aquarium-singapore/gallery-4.jpg',
      '/images/attractions/sea-aquarium-singapore/gallery-5.jpg'
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
  },
  {
    _id: 'attraction-singapore-flyer',
    slug: 'singapore-flyer',
    name: 'Singapore Flyer + Time Capsule',
    subtitle: 'Asia’s Largest Giant Observation Wheel with 360° Panoramic Skyline Views',
    category: 'Observation Wheel / Marina Bay',
    destination: 'Singapore',
    locationAddress: '30 Raffles Avenue, Singapore 039803 (Promenade MRT)',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.802319207038!2d103.86082497576566!3d1.2893322986985442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da19a99b45668b%3A0xe54d2417b1b369!2sSingapore%20Flyer!5e0!3m2!1sen!2ssg!4v1700000000000!5m2!1sen!2ssg',
    transitInfo: {
      mrtStation: 'Promenade MRT (CC4/DT15) — Exit A (6 mins walk)',
      busLines: 'Bus 56, 75, 77, 97, 97e, 171, 195 to Promenade Station',
      directions: 'Take Downtown or Circle Line to Promenade MRT Station, take Exit A, and walk 6 minutes along Raffles Avenue to the Singapore Flyer.'
    },
    starRating: '4.8',
    duration: '1.5 to 2.5 Hours',
    description: 'Standing 165 meters tall, the Singapore Flyer offers breathtaking 360-degree panoramic views of Marina Bay, Sentosa Island, and neighboring Malaysia and Indonesia on clear days. Preceded by the Time Capsule immersive visual experience.',
    coverImageUrl: '/images/attractions/singapore-flyer/cover.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=3fpIf4gkEpU',
    galleryImageUrls: [
      '/images/attractions/singapore-flyer/gallery-1.jpg',
      '/images/attractions/singapore-flyer/gallery-2.jpg',
      '/images/attractions/singapore-flyer/gallery-3.jpg'
    ],
    features: ['30-Min Scenic Flight', 'Time Capsule Interactive Exhibition', 'Marina Bay Panoramic Views', 'Air-Conditioned Glass Capsules'],
    mustDoThings: [
      'Experience the 30-minute giant observation flight over Marina Bay',
      'Walk through the multi-sensory Time Capsule exhibition',
      'Enjoy sunset flights between 6:30 PM and 7:30 PM for golden hour photos'
    ],
    timings: '10:00 AM – 10:00 PM Daily (Last flight: 9:30 PM); Best Time: 6:45 PM for sunset & night lights transition.',
    tipsAndTricks: [
      'Take MRT to Promenade Station (CC4/DT15), Exit A—it is a scenic 6-minute walk to the Flyer entrance.',
      'Combine with Gardens by the Bay via the Helix Bridge connecting directly to Marina Bay Sands.'
    ],
    isDisplayed: true
  },
  {
    _id: 'attraction-bird-paradise',
    slug: 'bird-paradise-singapore',
    name: 'Bird Paradise Singapore (Mandai Wildlife Reserve)',
    category: 'Wildlife & Nature / Mandai',
    destination: 'Singapore',
    locationAddress: '20 Mandai Lake Road, Singapore 729825',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.665798485293!2d103.78817747576572!3d1.4023477985842884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da139ef182eead%3A0xc3f8373b5bc25f45!2sBird%20Paradise!5e0!3m2!1sen!2ssg!4v1700000000000!5m2!1sen!2ssg',
    transitInfo: {
      mrtStation: 'Khatib MRT (NS14) — Mandai Khatib Shuttle (S$1)',
      busLines: 'Mandai Shuttle from Khatib MRT or Bus 138 from Ang Mo Kio MRT',
      directions: 'Take the North-South Line to Khatib MRT Station, then board the dedicated Mandai Shuttle bus (S$1, 15 minutes direct).'
    },
    starRating: '4.9',
    duration: '3.5 to 5 Hours',
    description: 'Asia’s newest and largest bird park housing 3,500 birds across 8 immersive walk-in aviaries representing dense African rainforests, South American wetlands, Australian eucalyptus forests, and polar penguin coves.',
    coverImageUrl: '/images/attractions/bird-paradise-singapore/cover.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=xMTLU0ffLdA',
    galleryImageUrls: [
      '/images/attractions/bird-paradise-singapore/gallery-1.jpg',
      '/images/attractions/bird-paradise-singapore/gallery-2.jpg',
      '/images/attractions/bird-paradise-singapore/gallery-3.jpg'
    ],
    features: ['8 Immense Walk-In Aviaries', 'Wings of the World Presentation', 'Ocean Network Express Penguin Cove', 'Complimentary In-Park Tram'],
    mustDoThings: [
      'Wings of the World show at Sky Amphitheatre',
      'Kuok Group Asian Aviary & Heart of Africa canopy walk',
      'Feed lorikeets and lories at Lory Loft',
      'Sub-Antarctic cold-climate penguin diving at Penguin Cove'
    ],
    timings: '9:00 AM – 6:00 PM Daily (Last entry 5:00 PM); Best Time: Morning at 9:00 AM for feeding sessions.',
    tipsAndTricks: [
      'Mandai Shuttle: Take the S$1 express shuttle from Khatib MRT (NS14) directly to Bird Paradise in 15 minutes.',
      'Download the Mandai App to set alarms for daily bird presentation timings.'
    ],
    appDetails: {
      appName: 'Mandai Wildlife Reserve App',
      appDescription: 'Live presentation alerts, feeding schedules, GPS map, and tram stops.',
      appStoreUrl: 'https://apps.apple.com/app/mandai-wildlife-reserve/id1552865917',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.mandai.app',
      appFeatures: ['Live Presentation Timers', 'Interactive GPS Aviary Map', 'E-Ticket QR Scanner']
    },
    isDisplayed: true
  },
  {
    _id: 'attraction-river-wonders',
    slug: 'river-wonders-singapore',
    name: 'River Wonders Singapore',
    subtitle: 'Asia’s Only River-Themed Wildlife Park & Giant Panda Forest',
    category: 'River Wildlife & Panda / Mandai',
    destination: 'Singapore',
    locationAddress: '80 Mandai Lake Road, Singapore 729826',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.665798485293!2d103.78817747576572!3d1.4023477985842884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da139ef182eead%3A0xc3f8373b5bc25f45!2sRiver%20Wonders!5e0!3m2!1sen!2ssg!4v1700000000000!5m2!1sen!2ssg',
    transitInfo: {
      mrtStation: 'Khatib MRT (NS14) — Mandai Khatib Shuttle (S$1)',
      busLines: 'Mandai Shuttle from Khatib MRT or Bus 138 from Ang Mo Kio MRT',
      directions: 'Take the North-South Line to Khatib MRT Station, then board the dedicated Mandai Shuttle bus (S$1, 15 minutes direct).'
    },
    starRating: '4.8',
    duration: '2.5 to 4 Hours',
    description: 'Home to the giant pandas Kai Kai & Jia Jia, manatees in the colossal Amazon Flooded Forest, and the popular Amazon River Quest boat ride.',
    coverImageUrl: '/images/attractions/river-wonders-singapore/cover.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=S7ffpuz0iZA',
    galleryImageUrls: [
      '/images/attractions/river-wonders-singapore/gallery-1.jpg',
      '/images/attractions/river-wonders-singapore/gallery-2.jpg',
      '/images/attractions/river-wonders-singapore/gallery-3.jpg',
      '/images/attractions/river-wonders-singapore/gallery-4.jpg'
    ],
    features: ['Giant Panda Forest', 'Amazon Flooded Forest (World’s Largest Freshwater Aquarium)', 'Amazon River Quest Boat Ride', 'Squirrel Monkey Forest'],
    mustDoThings: [
      'Visit Kai Kai & Jia Jia at the climate-controlled Giant Panda Forest',
      'Ride the Amazon River Quest boat to spot jaguars and tapirs',
      'Watch gentle manatees glide in the Amazon Flooded Forest'
    ],
    timings: '10:00 AM – 7:00 PM Daily (Last admission: 6:00 PM).',
    tipsAndTricks: [
      'Book Amazon River Quest boat ride slot early upon entering to avoid long queues.',
      'Combine with Night Safari in the evening since they share the same Mandai transport drop-off.'
    ],
    isDisplayed: true
  },
  {
    _id: 'attraction-skyline-luge',
    slug: 'sentosa-skyline-luge',
    name: 'Sentosa Skyline Luge & Skyride',
    subtitle: 'Once is Never Enough! Gravity-Fueled Racing on 4 Purpose-Built Tracks',
    category: 'Action & Adventure / Sentosa',
    destination: 'Singapore',
    locationAddress: '1 Imbiah Road / 45 Siloso Beach Walk, Sentosa, Singapore 099538',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.824245644558!2d103.81640107576553!3d1.252063898736021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1bf1fbfa8599%3A0xe543e3940170a442!2sSkyline%20Luge%20Singapore!5e0!3m2!1sen!2ssg!4v1700000000000!5m2!1sen!2ssg',
    transitInfo: {
      mrtStation: 'HarbourFront MRT (NE1/CC29) — VivoCity Level 3',
      busLines: 'Sentosa Express Monorail to Beach Station or Imbiah Station',
      directions: 'Take the MRT to HarbourFront, board Sentosa Express monorail to Beach Station or Imbiah Station, and walk 2 minutes to the Luge counter.'
    },
    starRating: '4.8',
    duration: '1.5 to 2.5 Hours',
    description: 'Ride the open-air Skyride chairlift to the top of Imbiah Lookout for coastal sea views, then take the wheel of your three-wheeled gravity Luge cart down 4 thrilling neon-lit downhill tracks.',
    coverImageUrl: '/images/attractions/sentosa-skyline-luge/cover.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=XkbeHOWRK3k',
    galleryImageUrls: [
      '/images/attractions/sentosa-skyline-luge/gallery-1.jpg',
      '/images/attractions/sentosa-skyline-luge/gallery-2.jpg',
      '/images/attractions/sentosa-skyline-luge/gallery-3.jpg',
      '/images/attractions/sentosa-skyline-luge/gallery-4.jpg'
    ],
    features: ['4 Unique Downhill Tracks (Dragon, Jungle, Expedition, Kupu Kupu)', 'Scenic Open Skyride Chairlift', 'Night Luge with Neon LED Lighting'],
    mustDoThings: [
      'Race down the 688m Dragon Track with hairpin corners',
      'Ride Night Luge after 7:00 PM under dazzling multicolor light tunnels',
      'Capture automatic motion photos at high-speed corners'
    ],
    timings: '10:00 AM – 7:30 PM (Sun-Thu) | 10:00 AM – 9:00 PM (Fri-Sat Night Luge); Best Time: 5:30 PM to catch day and night rides.',
    tipsAndTricks: [
      'Buy at least 3 to 4 rides combo—trust us, 1 or 2 rides are never enough once you master the steering!',
      'Reach via Sentosa Express Monorail to Beach Station or Imbiah Station.'
    ],
    isDisplayed: true
  },
  {
    _id: 'attraction-mbs-skypark',
    slug: 'marina-bay-sands-skypark',
    name: 'Marina Bay Sands SkyPark Observation Deck',
    subtitle: 'Perched 56 Storeys Above Singapore’s Glittering Bay Area',
    category: 'Observation Deck / Marina Bay',
    destination: 'Singapore',
    locationAddress: '10 Bayfront Avenue, Hotel Tower 3 Level 56, Singapore 018956',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8093121516085!2d103.85848527576566!3d1.2828230987049618!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da19046c071727%3A0xb35e16543b59ebec!2sMarina%20Bay%20Sands%20SkyPark%20Observation%20Deck!5e0!3m2!1sen!2ssg!4v1700000000000!5m2!1sen!2ssg',
    transitInfo: {
      mrtStation: 'Bayfront MRT (CE1/DT16) — Exit C or D',
      busLines: 'Bus 97, 97E, 133, 106, 518 to Marina Bay Sands',
      directions: 'Take the MRT to Bayfront Station, proceed to Hotel Tower 3 exterior basement concourse, and take the express lift to Level 56.'
    },
    starRating: '4.8',
    duration: '1 to 2 Hours',
    description: 'Located atop the world-famous three towers of Marina Bay Sands, offering unforgettable panoramic vistas of Marina Bay, Singapore Strait, Gardens by the Bay, and the Central Business District.',
    coverImageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=t5A5L_e1Q9k',
    galleryImageUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/MBS_SkyPark_Observation_Deck_View.jpg/1280px-MBS_SkyPark_Observation_Deck_View.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Marina_Bay_Sands_Singapore_Skyline.jpg/1280px-Marina_Bay_Sands_Singapore_Skyline.jpg'
    ],
    features: ['56th-Floor 360° Open Observation Deck', 'Unmatched View of Spectra Light Show', 'Direct Bayfront MRT Link', 'Panoramic Photo Spot'],
    mustDoThings: [
      'Watch the 8:00 PM or 9:00 PM Spectra Light & Water Show from 200m above',
      'Admire the Supertrees glowing in the dark across Gardens by the Bay',
      'Enjoy sunset cocktails at CÉ LA VI lounge'
    ],
    timings: '11:00 AM – 9:00 PM Daily (Best Time: 6:30 PM for sunset & evening lights).',
    tipsAndTricks: [
      'Access is via the exterior basement entrance of Hotel Tower 3.',
      'Infinity Pool access is strictly reserved for in-house hotel guests; SkyPark ticket grants entry to the observation deck.'
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
