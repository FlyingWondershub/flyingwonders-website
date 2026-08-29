import { client } from '../sanity/lib/client'
import type { TravelShort } from './packages'
import type { AppDetails } from '../components/AppDownloadCard'

export interface TimelineStop {
  time: string
  title: string
  description: string
  badge?: string
  attractionSlug?: string
  transitNote?: string
}

export interface DiningOption {
  restaurantName: string
  cuisine: string
  location: string
  isHalal?: boolean
  isVegetarian?: boolean
}

export interface GroupPricing {
  adultEstimate: number
  childEstimate: number
  currency?: string
  pricingNote?: string
}

export interface TourData {
  _id: string
  slug: string
  title: string
  subtitle?: string
  category: string
  destination: string
  duration: string
  description: string
  coverImageUrl: string
  videoUrl?: string
  galleryImageUrls?: string[]
  features?: string[]
  mustDoThings?: string[]
  itineraryTimeline?: TimelineStop[]
  googleMapsRouteUrl?: string
  routeWaypoints?: string[]
  diningOptions?: DiningOption[]
  groupPricing?: GroupPricing
  timings?: string
  tipsAndTricks?: string[]
  appDetails?: AppDetails
  shorts?: TravelShort[]
  whatsappNumber?: string
  whatsappMessage?: string
  isDisplayed?: boolean
}

export function cleanTourTitle(rawTitle: string): string {
  if (!rawTitle) return 'Singapore Day Tour'
  return rawTitle
    .replace(/^Singapore\s*-\s*/i, '')
    .replace(/^Malaysia\s*-\s*/i, '')
    .trim()
}

export function slugifyTourTitle(title: string): string {
  if (!title) return 'singapore-day-tour'
  const cleaned = cleanTourTitle(title)
  return cleaned
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeTourSlug(rawSlug: string): string {
  if (!rawSlug) return ''
  let s = rawSlug.toLowerCase().trim()
  if (s === 'sentosa' || s === 'sentosa-tour' || s === 'sentosa-1-day' || s === 'sentosa-day-tour') return 'sentosa-all-day-circuit'
  if (s === 'mandai' || s === 'wildlife' || s === 'mandai-safari' || s === 'zoo-tour') return 'mandai-wildlife-safari'
  if (s === 'city-tour' || s === 'city-flyer' || s === 'flyer-tour') return 'singapore-city-flyer-tour'
  return s
}

export const DEFAULT_TOURS: TourData[] = [
  // ── 1. SENTOSA ALL-DAY MEGA CIRCUIT ──
  {
    _id: 'b2b-tour-sentosa-all-day-circuit',
    slug: 'sentosa-all-day-circuit',
    title: 'Sentosa All-Day Mega Experience (USS + Cable Car + Luge + Wings of Time)',
    subtitle: 'Universal Studios Singapore · Mount Faber Cable Car · Skyline Luge · Wings of Time Fireworks',
    category: 'tour',
    destination: 'Sentosa Island, Singapore',
    duration: 'Full Day (10:00 AM – 9:00 PM / 11 Hours)',
    description: 'The ultimate all-inclusive Sentosa Island 1-day circuit designed for families, thrill-seekers, and groups. Glide across Keppel Bay on the scenic Singapore Cable Car Sky Pass, immerse yourself in world-class movie rides at Universal Studios Singapore, race downhill on the gravity-powered Skyline Luge, and end with the spectacular Wings of Time seaside fireworks show.',
    coverImageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=F_fK8C_V0q8',
    features: [
      'Singapore Cable Car Sky Pass (Mount Faber & Sentosa Lines)',
      'Universal Studios Singapore Full-Day E-Ticket Turnstile Access',
      'Skyline Luge & Skyride (3 or 4 Downhill Gravity Rides)',
      'Wings of Time Multi-Sensory Fireworks & Laser Show (8:30 PM)',
      'Complimentary Sentosa Express Monorail & Island Beach Shuttle',
      'Instant Mobile QR Code Entry & WhatsApp Operations Support'
    ],
    mustDoThings: [
      'Ride Battlestar Galactica: Human vs Cylon & TRANSFORMERS 3D in USS',
      'Glide 100 meters above the harbour on the Singapore Cable Car Sky Pass',
      'Race friends & family downhill through 4 neon-lit gravity tracks at Skyline Luge',
      'Watch laser lights, dancing water fountains, and seaside fireworks at Wings of Time',
      'Savor authentic local delights along Siloso Beach and Malaysian Food Street'
    ],
    itineraryTimeline: [
      {
        time: '10:00 AM – 10:30 AM',
        title: 'Scenic Cable Car Arrival into Sentosa',
        description: 'Board the Mount Faber Line at HarbourFront Tower 2 / Mount Faber Station. Soar 100m above sea level with 360° panoramas across Keppel Bay, Resorts World Sentosa, and lush rainforest canopies before touching down at Sentosa Station.',
        badge: '🚠 Scenic Transit',
        attractionSlug: 'singapore-cable-car',
        transitNote: '5-min stroll or 1 stop on Sentosa Express to Resorts World Station'
      },
      {
        time: '10:30 AM – 4:45 PM',
        title: 'Universal Studios Singapore (USS) Full-Day Immersion',
        description: 'Enter with direct turnstile QR code. Conquer 6 themed zones including Hollywood, New York, Sci-Fi City (TRANSFORMERS 3D & Battlestar Galactica), Ancient Egypt (Revenge of the Mummy), The Lost World (Jurassic Park Rapids Adventure), and Far Far Away.',
        badge: '🎢 Thrill Coasters & Shows',
        attractionSlug: 'universal-studios-singapore',
        transitNote: 'Take Sentosa Express monorail from Resorts World to Beach Station (5 mins)'
      },
      {
        time: '5:00 PM – 7:00 PM',
        title: 'Sentosa Skyline Luge & Scenic Skyride',
        description: 'Board the open-air 4-seater Skyride chairlift to Imbiah Lookout, then take the driver seat in your gravity-propelled Luge cart. Navigate purpose-built tracks with hairpin corners, tunnels, and downhill slopes all the way to Siloso Beach.',
        badge: '🏎️ Gravity Luge Racing',
        attractionSlug: 'sentosa-skyline-luge',
        transitNote: 'Direct 3-minute walk to Siloso Beach dining promenade'
      },
      {
        time: '7:15 PM – 8:15 PM',
        title: 'Beachfront Sunset Dinner & Relax',
        description: 'Unwind along Siloso Beach with ocean views and refreshing beverages. Enjoy local favorites at Good Old Days Food Court (Halal certified) or beachfront bistro cuisine.',
        badge: '🍽️ Sunset Dining',
        transitNote: '2-minute walk to Wings of Time amphitheatre entrance'
      },
      {
        time: '8:30 PM – 9:00 PM',
        title: 'Wings of Time Pyrotechnics & Laser Finale',
        description: 'Experience an award-winning open-sea night spectacular featuring giant water screens, dazzling 3D projection mapping, laser choreography, and a grand pyrotechnic fireworks finale set against the dark Singapore Strait.',
        badge: '🎆 Multi-Sensory Fireworks Show',
        transitNote: 'Board Sentosa Express at Beach Station back to VivoCity / HarbourFront MRT'
      }
    ],
    googleMapsRouteUrl: 'https://www.google.com/maps/dir/HarbourFront+Tower+2,+Singapore/Universal+Studios+Singapore,+8+Sentosa+Gateway,+Singapore/Skyline+Luge+Singapore,+45+Siloso+Beach+Walk,+Singapore/Wings+of+Time,+50+Beach+View,+Singapore',
    routeWaypoints: [
      'HarbourFront Tower 2 Cable Car Station',
      'Universal Studios Singapore (Resorts World Sentosa)',
      'Skyline Luge & Skyride (Imbiah Lookout / Beach Station)',
      'Wings of Time Seaside Amphitheatre (Siloso Beach)'
    ],
    diningOptions: [
      {
        restaurantName: 'Goldilocks (USS Far Far Away)',
        cuisine: 'Halal Certified Crispy Fried Chicken, Burgers & Waffles',
        location: 'Inside Universal Studios Singapore',
        isHalal: true,
        isVegetarian: false
      },
      {
        restaurantName: 'Malaysian Food Street',
        cuisine: 'Authentic Penang Char Kway Teow, Claypot Rice & Roti Canai',
        location: 'Resorts World Sentosa Level 1 Waterfront',
        isHalal: false,
        isVegetarian: true
      },
      {
        restaurantName: 'Good Old Days Food Court',
        cuisine: 'Halal-certified Singapore Laksa, Chicken Rice & Vegetarian Briyani',
        location: 'Beach Station Sentosa (Right opposite Wings of Time)',
        isHalal: true,
        isVegetarian: true
      }
    ],
    groupPricing: {
      adultEstimate: 165,
      childEstimate: 135,
      currency: 'SGD',
      pricingNote: 'Includes Mount Faber Cable Car Sky Pass + Universal Studios Admission + 3-Ride Skyline Luge + Wings of Time Standard Seat. Excludes personal meals and optional Universal Express passes.'
    },
    timings: '10:00 AM – 9:00 PM Daily (Best starting time: 9:45 AM at HarbourFront Tower 2).',
    tipsAndTricks: [
      'Universal Express Pass Hack: Add Express Pass during peak summer & school holidays to skip 60+ min wait times on Transformers & Mummy.',
      'Single Rider Lines: If your group does not mind sitting separately, use Single Rider lanes in USS to cut wait times by up to 70%.',
      'Rain Poncho: Bring a light rain poncho for Jurassic Park Rapids Adventure to stay dry.',
      'Wings of Time Seat Allocation: Arrive at the amphitheatre gate 15 minutes before showtime (8:15 PM) for prime central viewing.'
    ],
    appDetails: {
      appName: 'Universal Studios Singapore & MySentosa Official Apps',
      appDescription: 'Interactive GPS wayfinding maps, live attraction wait times, presentation alarms, and mobile dining guides.',
      appStoreUrl: 'https://apps.apple.com/sg/app/universal-studios-singapore/id1462742095',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.rwsentosa.UniversalSG',
      appFeatures: [
        'Live Ride Wait Times in Universal Studios',
        'Interactive Sentosa Island GPS Navigator',
        'Wings of Time Digital E-Ticket Barcode Access',
        'Mobile Food Pre-Ordering & Halal Filters'
      ]
    },
    shorts: [
      {
        id: 'sentosa-short-1',
        title: 'Battlestar Galactica Roller Coaster Thrills 🎢',
        creator: 'ThemeParkRider',
        views: '1.2M views',
        thumbnailUrl: 'https://i.ytimg.com/vi/InG_z_39Fcw/hqdefault.jpg',
        youtubeVideoId: 'InG_z_39Fcw'
      },
      {
        id: 'sentosa-short-2',
        title: 'Sentosa Skyline Luge Downhill Night POV 🏎️',
        creator: 'SingaporeExplorer',
        views: '850K views',
        thumbnailUrl: 'https://i.ytimg.com/vi/dc9Oy8uNTkM/hqdefault.jpg',
        youtubeVideoId: 'dc9Oy8uNTkM'
      },
      {
        id: 'sentosa-short-3',
        title: 'Wings of Time Spectacular Fireworks Finale 🎆',
        creator: 'SentosaOfficial',
        views: '920K views',
        thumbnailUrl: 'https://i.ytimg.com/vi/tpq4QHg6GxE/hqdefault.jpg',
        youtubeVideoId: 'tpq4QHg6GxE'
      }
    ],
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
      'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800',
      'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?w=800'
    ],
    isDisplayed: true
  },

  // ── 2. MANDAI WILDLIFE RESERVE SAFARI ODYSSEY ──
  {
    _id: 'b2b-tour-mandai-wildlife-safari',
    slug: 'mandai-wildlife-safari',
    title: 'Mandai Wildlife Nature & Safari Day Expedition (Bird Paradise + Zoo + Night Safari)',
    subtitle: 'Bird Paradise · Singapore Zoo Rainforest Tram · Night Safari Twilight Expedition',
    category: 'tour',
    destination: 'Mandai Wildlife Reserve, Singapore',
    duration: 'Full Day & Night Combo (9:00 AM – 9:30 PM / 12.5 Hours)',
    description: 'An extraordinary full-day eco-safari discovering the crown jewels of the Mandai Wildlife Reserve. Journey through 8 massive walk-in aviaries at the brand-new Bird Paradise, embark on a guided tram safari through the world-famous open-concept Singapore Zoo, and enter the mysterious nocturnal realm of Night Safari under moonlight.',
    coverImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=kYJm0wR4m6o',
    features: [
      'Bird Paradise Admission with 8 Walk-In Aviaries & Wings of the World Show',
      'Singapore Zoo Admission + Unlimited Rainforest Tram Rides',
      'Night Safari Admission + Multi-Sensory Guided Night Tram Safari',
      'Creatures of the Night Presentation Reserved Amphitheatre Seating',
      'Mandai Wildlife West Dining & Retail Promenade Access',
      'Direct Digital QR Voucher Entry at all Turnstiles'
    ],
    mustDoThings: [
      'Hand-feed colorful lories and nectar parrots in the giant Lory Loft aviary',
      'Watch sea lions glide and perform conservation stunts at Splash Safari in Singapore Zoo',
      'Walk inside Fragile Forest biodome surrounded by free-ranging lemurs, flying foxes & mousedeer',
      'Ride the open-sided Night Safari tram past roaming Malayan tigers, Asian elephants & rhinos',
      'Sample the authentic Indian buffet & Asian specialties at Ulu Ulu Safari Restaurant'
    ],
    itineraryTimeline: [
      {
        time: '9:00 AM – 1:00 PM',
        title: 'Morning Exploration: Bird Paradise',
        description: 'Immerse yourself in Asia’s largest bird park. Walk through Heart of Africa, Kuok Group Asian Wing, and Australian Outback. Catch the signature "Wings of the World" presentation at the Sky Amphitheatre at 12:30 PM.',
        badge: '🦜 Aviary Walkthroughs & Show',
        attractionSlug: 'bird-paradise-singapore',
        transitNote: '3-minute walk to Mandai Wildlife West dining promenade'
      },
      {
        time: '1:00 PM – 2:15 PM',
        title: 'Lunch Break at Mandai Wildlife West',
        description: 'Enjoy casual dining at the newly opened retail hub with options like A&W, Birds of Paradise Gelato, Pavilion Banana Leaf (South Indian vegetarian), and Collin’s Western Grill.',
        badge: '🍽️ Lunch & Refreshments',
        transitNote: 'Free 5-minute internal electric shuttle to Singapore Zoo / River Wonders entrance'
      },
      {
        time: '2:30 PM – 5:45 PM',
        title: 'Afternoon Adventure: Singapore Zoo',
        description: 'Step into the world’s foremost open-concept zoo. Board the unlimited tram tour, visit the Fragile Forest biodome, see White Tigers and Proboscis Monkeys, and attend the Splash Safari presentation at 5:00 PM.',
        badge: '🦁 Rainforest Tram & Animals',
        attractionSlug: 'singapore-zoo',
        transitNote: 'Direct 2-minute stroll across the plaza to Night Safari entrance'
      },
      {
        time: '6:00 PM – 7:15 PM',
        title: 'Early Dinner at Ulu Ulu Safari Restaurant',
        description: 'Dine in rustic safari ambiance before twilight. Features Halal-certified local buffet stations and Indian vegetarian/Jain curry spreads.',
        badge: '🍽️ Safari Dining Buffet',
        transitNote: 'Proceed directly to Night Safari boarding turnstiles'
      },
      {
        time: '7:30 PM – 9:30 PM',
        title: 'Evening Odyssey: Night Safari',
        description: 'Embark on a 40-minute guided audio tram journey through 6 geographical habitats from the Himalayan Foothills to the Southeast Asian Rainforest. Afterwards, explore the East Lodge and Fishing Cat walking trails to observe nocturnal wildlife up close.',
        badge: '🐾 Nocturnal Tram Safari & Show',
        attractionSlug: 'night-safari-singapore',
        transitNote: 'Board Khatib Mandai Shuttle or private coach back to hotel'
      }
    ],
    googleMapsRouteUrl: 'https://www.google.com/maps/dir/Bird+Paradise,+Singapore/Mandai+Wildlife+West,+Singapore/Singapore+Zoo,+Mandai+Lake+Road,+Singapore/Night+Safari,+Mandai+Lake+Road,+Singapore',
    routeWaypoints: [
      'Bird Paradise (Mandai Wildlife Reserve)',
      'Mandai Wildlife West Hub',
      'Singapore Zoo Main Entrance',
      'Night Safari Entrance & Tram Station'
    ],
    diningOptions: [
      {
        restaurantName: 'Pavilion Banana Leaf (Mandai West)',
        cuisine: 'Authentic South Indian Veg & Non-Veg Biryani, Dosas & Curries',
        location: 'Mandai Wildlife West Hub (Outside Park Gates)',
        isHalal: true,
        isVegetarian: true
      },
      {
        restaurantName: 'Ah Meng Restaurant (Singapore Zoo)',
        cuisine: 'Local Hainanese Chicken Rice, Laksa & Dim Sum',
        location: 'Central Plaza inside Singapore Zoo',
        isHalal: true,
        isVegetarian: false
      },
      {
        restaurantName: 'Ulu Ulu Safari Restaurant (Night Safari)',
        cuisine: 'Extensive Asian & Indian Buffet with live cooking counters',
        location: 'Night Safari Entrance Courtyard',
        isHalal: true,
        isVegetarian: true
      }
    ],
    groupPricing: {
      adultEstimate: 148,
      childEstimate: 118,
      currency: 'SGD',
      pricingNote: 'Includes multi-park admission to Bird Paradise, Singapore Zoo, and Night Safari with unlimited tram rides. Food and optional hotel transfers are additional.'
    },
    timings: '9:00 AM – 9:30 PM Daily (Best entry: 9:00 AM at Bird Paradise).',
    tipsAndTricks: [
      'Mandai Mobile App: Download the official Mandai App beforehand to set instant reminders for all animal presentation schedules.',
      'Show Times: "Wings of the World" at Bird Paradise is at 12:30 PM; "Splash Safari" at Zoo is at 5:00 PM; "Creatures of the Night" at Night Safari is at 7:30 PM and 9:00 PM.',
      'Bug Spray & Hydration: Carry mosquito repellent and a reusable water bottle (free chilled water refilling stations throughout all parks).'
    ],
    appDetails: {
      appName: 'Mandai Wildlife Reserve Official App',
      appDescription: 'Live presentation timers, interactive GPS wayfinding maps for all 4 parks, and digital ticket barcodes.',
      appStoreUrl: 'https://apps.apple.com/sg/app/mandai-wildlife-reserve/id6445837575',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.mandai.mfa',
      appFeatures: [
        'Interactive GPS Rainforest Wayfinding Map',
        'Show Reminders & Keeper Presentation Alarms',
        'Digital Admission E-Ticket QR Wallet',
        'Mobile Food Ordering at Mandai West'
      ]
    },
    shorts: [
      {
        id: 'mandai-short-1',
        title: 'Bird Paradise Heart of Africa Giant Aviary 🦜',
        creator: 'MandaiWildlife',
        views: '740K views',
        thumbnailUrl: 'https://i.ytimg.com/vi/WIKnSv-OI_Q/hqdefault.jpg',
        youtubeVideoId: 'WIKnSv-OI_Q'
      },
      {
        id: 'mandai-short-2',
        title: 'Night Safari Guided Tram Expedition Experience 🐾',
        creator: 'SingaporeWild',
        views: '1.1M views',
        thumbnailUrl: 'https://i.ytimg.com/vi/InG_z_39Fcw/hqdefault.jpg',
        youtubeVideoId: 'InG_z_39Fcw'
      }
    ],
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800',
      'https://images.unsplash.com/photo-1544979590-37e9b47eb705?w=800',
      'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800'
    ],
    isDisplayed: true
  },

  // ── 3. SINGAPORE CITY HERITAGE & SCENIC FLYER ──
  {
    _id: 'b2b-tour-singapore-city-flyer-tour',
    slug: 'singapore-city-flyer-tour',
    title: 'Singapore City Sights, Heritage Trail & Singapore Flyer Twilight Tour',
    subtitle: 'Civic District · Merlion Waterfront · Chinatown Heritage · Singapore Flyer Twilight Flight',
    category: 'tour',
    destination: 'Civic District & Marina Bay, Singapore',
    duration: 'Half-Day to Twilight (2:00 PM – 7:30 PM / 5.5 Hours)',
    description: 'The quintessential Singapore introduction combining colonial heritage, multicultural enclaves, and futuristic city skylines. Explore the historic Civic District, snap photos at Merlion Park, immerse in the cultural tapestry of Chinatown, and take flight on the iconic Singapore Flyer giant observation wheel at twilight.',
    coverImageUrl: 'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=wX8oO9g7Ckg',
    features: [
      'Civic District & Padang Historic Guided Drive-Through',
      'Merlion Park Waterfront Iconic Photo Stop',
      'Chinatown Heritage Exploration & Buddha Tooth Relic Temple',
      'Time Capsule Interactive Multi-Sensory Digital Exhibit',
      'Singapore Flyer Scenic Flight (165-Meter Giant Observation Wheel)',
      'AC Coach / Van Transfer Options with Professional Guide'
    ],
    mustDoThings: [
      'Take the famous perspective photo with the water-spouting Merlion statue',
      'Marvel at the sacred gold relic inside the Buddha Tooth Relic Temple in Chinatown',
      'Experience Singapore’s 700-year history through the futuristic Time Capsule multi-sensory domes',
      'Enjoy 360-degree sunset and twilight views 165 meters above Marina Bay from the Singapore Flyer',
      'Stroll through Lau Pa Sat Satay Street for sizzling charcoal skewers after the flight'
    ],
    itineraryTimeline: [
      {
        time: '2:00 PM – 2:45 PM',
        title: 'Civic District & Colonial Heritage Drive',
        description: 'Meet your guide or coach and drive past the historic Padang, Supreme Court, City Hall, and Victoria Theatre. Learn about Sir Stamford Raffles’ landing and Singapore’s modern transformation.',
        badge: '🏛️ Historic Architecture',
        transitNote: '5-minute drive to Merlion Park coach bay'
      },
      {
        time: '2:45 PM – 3:30 PM',
        title: 'Merlion Park Waterfront Photo Stop',
        description: 'Stroll along the waterfront promenade at the mouth of the Singapore River. Capture unobstructed photos of the 8.6m Merlion with Marina Bay Sands, the ArtScience Museum, and the financial skyline in the background.',
        badge: '📸 Iconic Photo Stop',
        transitNote: '10-minute drive to South Bridge Road, Chinatown'
      },
      {
        time: '3:45 PM – 5:15 PM',
        title: 'Chinatown Cultural Heritage Walk',
        description: 'Walk through traditional shophouses, souvenir alleys on Pagoda Street, and visit the stunning Tang-styled Buddha Tooth Relic Temple & Museum. Sample traditional snacks like kaya toast and egg tarts.',
        badge: '🏯 Cultural Heritage',
        transitNote: '15-minute transfer to Singapore Flyer Terminal on Raffles Avenue'
      },
      {
        time: '5:30 PM – 6:30 PM',
        title: 'Time Capsule Multi-Sensory Experience',
        description: 'Embark on an immersive, interactive journey led by R65, a time-traveling robot companion. Walk through digital light tunnels and spatial audio storytelling Singapore’s maritime history from fishing village to world metropolis.',
        badge: '🔮 Digital Tech Exhibit',
        attractionSlug: 'singapore-flyer',
        transitNote: 'Direct boarding ramp up to Singapore Flyer capsule'
      },
      {
        time: '6:30 PM – 7:30 PM',
        title: 'Singapore Flyer Twilight Scenic Flight',
        description: 'Step into an air-conditioned, UV-protected glass capsule for a gentle 30-minute rotation soaring 165 meters above the ground. Watch the sun dip over the Marina Bay skyline and the city lights turn on across the island.',
        badge: '🎡 360° Sky Observation',
        attractionSlug: 'singapore-flyer',
        transitNote: 'Option to take a 5-minute taxi to Lau Pa Sat for satay dinner'
      }
    ],
    googleMapsRouteUrl: 'https://www.google.com/maps/dir/National+Gallery+Singapore,+1+St+Andrew\'s+Rd,+Singapore/Merlion+Park,+1+Fullerton+Rd,+Singapore/Buddha+Tooth+Relic+Temple,+288+South+Bridge+Rd,+Singapore/Singapore+Flyer,+30+Raffles+Ave,+Singapore',
    routeWaypoints: [
      'National Gallery / Civic District (Padang)',
      'Merlion Park (Fullerton Heritage)',
      'Buddha Tooth Relic Temple (Chinatown)',
      'Time Capsule & Singapore Flyer (Raffles Avenue)'
    ],
    diningOptions: [
      {
        restaurantName: 'Chinatown Complex Food Centre',
        cuisine: 'World-famous Michelin street food stalls, Liao Fan Hawker Chan, Claypot Rice',
        location: 'Smith Street, Chinatown',
        isHalal: false,
        isVegetarian: true
      },
      {
        restaurantName: 'Singapore Flyer Sky View Pavilion',
        cuisine: 'Dim Sum & Cantonese Seafood with waterfront views',
        location: 'Level 1 Singapore Flyer Terminal',
        isHalal: false,
        isVegetarian: true
      },
      {
        restaurantName: 'Lau Pa Sat Satay Street',
        cuisine: 'Al-fresco Charcoal grilled Chicken & Mutton Satay, Roti Prata & Teh Tarik',
        location: 'Boon Tat Street (5 mins from Flyer)',
        isHalal: true,
        isVegetarian: true
      }
    ],
    groupPricing: {
      adultEstimate: 68,
      childEstimate: 48,
      currency: 'SGD',
      pricingNote: 'Includes Singapore Flyer Flight + Time Capsule Ticket + Guided Heritage Walk. Transport coach available as optional add-on.'
    },
    timings: '2:00 PM – 7:30 PM Daily (Best starting time: 2:00 PM for optimal sunset flight).',
    tipsAndTricks: [
      'Golden Hour Flight: Board the Flyer around 6:30 PM – 6:45 PM to catch both the sunset over Marina Bay and the glittering night city skyline lights.',
      'Temple Dress Code: Wear clothing covering shoulders and knees when entering the Buddha Tooth Relic Temple (shawls available at the entrance).',
      'Tripod & Cameras: UV-filtered capsule glass is ideal for reflection-free night photography.'
    ],
    appDetails: {
      appName: 'MySentosa & Marina Bay Tourism Guides',
      appDescription: 'Interactive GPS city route navigation, historical audio guides, and e-voucher access.',
      appStoreUrl: 'https://apps.apple.com/sg/app/mysentosa/id1671526843',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=sg.com.sentosa.app.sentosaislander',
      appFeatures: [
        'Marina Bay & Civic District GPS Walking Trail',
        'Time Capsule Audio Tour Companion',
        'Digital Admission Ticket Wallet'
      ]
    },
    shorts: [
      {
        id: 'city-short-1',
        title: 'Singapore Flyer Giant Observation Wheel Views 🎡',
        creator: 'ExploreSingapore',
        views: '680K views',
        thumbnailUrl: 'https://i.ytimg.com/vi/dc9Oy8uNTkM/hqdefault.jpg',
        youtubeVideoId: 'dc9Oy8uNTkM'
      },
      {
        id: 'city-short-2',
        title: 'Merlion Park Waterfront & Marina Bay Sands 🦁',
        creator: 'VisitSingapore',
        views: '950K views',
        thumbnailUrl: 'https://i.ytimg.com/vi/tpq4QHg6GxE/hqdefault.jpg',
        youtubeVideoId: 'tpq4QHg6GxE'
      }
    ],
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?w=800',
      'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800',
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'
    ],
    isDisplayed: true
  }
]

export async function getAllTours(): Promise<TourData[]> {
  try {
    const [sanityTours, catalogSettings, globalContact]: [any[], any, any] = await Promise.all([
      client.fetch(`*[_type == "b2bServiceMedia" && category == "tour"]{
        _id,
        "slug": slug.current,
        title,
        subtitle,
        destination,
        duration,
        description,
        "coverImageFile": coverImage.asset->url,
        coverImageUrl,
        "videoFileUrl": videoFile.asset->url,
        videoUrl,
        "galleryUploaded": galleryImages[].asset->url,
        galleryImageUrls,
        features,
        mustDoThings,
        itineraryTimeline,
        googleMapsRouteUrl,
        routeWaypoints,
        diningOptions,
        groupPricing,
        timings,
        tipsAndTricks,
        appDetails,
        shorts,
        whatsappNumber,
        whatsappMessage,
        isDisplayed
      }`),
      client.fetch(`*[_type == "b2bServiceCatalogSettings" && !(_id in path("drafts.**"))] | order(_updatedAt desc)[0]{ whatsappNumber, whatsappMessageTemplate }`).catch(() => null),
      client.fetch(`*[_type == "globalContact" && !(_id in path("drafts.**"))] | order(_updatedAt desc)[0]{ whatsappNumber, whatsapp }`).catch(() => null)
    ])

    const generalContactPhone = (globalContact?.whatsappNumber || globalContact?.whatsapp || '919886171251').replace(/[^0-9]/g, '')
    const globalWhatsappNumber = (catalogSettings?.whatsappNumber ? catalogSettings.whatsappNumber.replace(/[^0-9]/g, '') : '') || generalContactPhone
    const globalTemplate = catalogSettings?.whatsappMessageTemplate || 'Hi Flying Wonders! I would like to inquire about B2B rates and group booking availability for {serviceName}.'

    const normalizedSanity: TourData[] = (sanityTours || []).map(t => {
      const cleanTitle = cleanTourTitle(t.title)
      const formattedMessage = t.whatsappMessage || globalTemplate.replace(/{serviceName}/g, cleanTitle).replace(/{destination}/g, t.destination || 'Singapore')
      const targetPhone = t.whatsappNumber ? t.whatsappNumber.replace(/[^0-9]/g, '') : globalWhatsappNumber
      return {
        _id: t._id,
        slug: t.slug || slugifyTourTitle(cleanTitle),
        title: cleanTitle,
        subtitle: t.subtitle,
        category: 'tour',
        destination: t.destination || 'Singapore',
        duration: t.duration || 'Full Day (8–10 Hours)',
        description: t.description || `${cleanTitle} tour circuit in ${t.destination || 'Singapore'}.`,
        coverImageUrl: t.coverImageFile || t.coverImageUrl || 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800',
        videoUrl: t.videoFileUrl || t.videoUrl,
        galleryImageUrls: t.galleryUploaded || t.galleryImageUrls || [],
        features: t.features || [],
        mustDoThings: t.mustDoThings || [],
        itineraryTimeline: t.itineraryTimeline || [],
        googleMapsRouteUrl: t.googleMapsRouteUrl,
        routeWaypoints: t.routeWaypoints || [],
        diningOptions: t.diningOptions || [],
        groupPricing: t.groupPricing,
        timings: t.timings,
        tipsAndTricks: t.tipsAndTricks || [],
        appDetails: t.appDetails,
        shorts: t.shorts || [],
        whatsappNumber: targetPhone,
        whatsappMessage: formattedMessage,
        isDisplayed: t.isDisplayed !== false
      }
    })

    const sanitySlugs = new Set(normalizedSanity.map(t => normalizeTourSlug(t.slug)))
    const missingDefaults = DEFAULT_TOURS.filter(d => !sanitySlugs.has(normalizeTourSlug(d.slug)))
    return [...normalizedSanity, ...missingDefaults]
  } catch (err) {
    return DEFAULT_TOURS
  }
}

export async function getTourBySlug(rawSlug: string): Promise<TourData | null> {
  const all = await getAllTours()
  const targetSlug = normalizeTourSlug(rawSlug)

  // 1. Direct match on normalized slug
  const directMatch = all.find(t =>
    normalizeTourSlug(t.slug) === targetSlug ||
    slugifyTourTitle(t.title) === targetSlug
  )
  if (directMatch) return directMatch

  // 2. Fuzzy substring match
  const fuzzyMatch = all.find(t => {
    const s = normalizeTourSlug(t.slug)
    return s.includes(targetSlug) || targetSlug.includes(s)
  })
  if (fuzzyMatch) return fuzzyMatch

  // 3. Fallback generic tour item
  const cleanTitle = cleanTourTitle(rawSlug.replace(/-/g, ' '))
  return {
    _id: `dynamic-${rawSlug}`,
    slug: rawSlug,
    title: cleanTitle,
    subtitle: 'Verified 1-Day Tour Circuit · Singapore',
    category: 'tour',
    destination: 'Singapore',
    duration: 'Full Day (8–10 Hours)',
    description: `${cleanTitle} is a curated 1-day sightseeing circuit in Singapore featuring signature attractions, convenient transit logistics, and memorable experiences.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=1200&auto=format&fit=crop',
    features: ['Instant Confirmation', 'Mobile Turnstile QR Entry', 'Verified B2B DMC Supplier Rates'],
    mustDoThings: ['Signature sightseeing experience', 'Interactive photo opportunities', 'Family-friendly highlights'],
    timings: '10:00 AM – 7:00 PM Daily',
    tipsAndTricks: [
      'Book entry in advance to guarantee your preferred time slot.',
      'Check public transit MRT connections for fastest access.'
    ],
    isDisplayed: true
  }
}
