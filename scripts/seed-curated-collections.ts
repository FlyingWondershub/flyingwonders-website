import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

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

async function seedCuratedCollections() {
  console.log('🚀 Seeding Curated Collections to Sanity...')
  console.log(`📍 Project: ${projectId} | Dataset: ${dataset}\n`)

  // First fetch real IDs from Sanity for references
  const hotels = await client.fetch(`*[_type in ["b2bServiceMedia", "hotelMeta"] && (category == "hotel" || _type == "hotelMeta")]{ _id, title, name, "slug": slug.current }`)
  const attractions = await client.fetch(`*[_type in ["b2bServiceMedia", "attractionMeta"] && (category == "attraction" || _type == "attractionMeta")]{ _id, title, name, "slug": slug.current }`)
  const restaurants = await client.fetch(`*[_type in ["restaurantMeta", "b2bServiceMedia"] && (category == "restaurant" || _type == "restaurantMeta")]{ _id, title, name, "slug": slug.current }`)
  const malls = await client.fetch(`*[_type == "shoppingMall"]{ _id, name, "slug": slug.current }`)
  const tours = await client.fetch(`*[_type in ["b2bServiceMedia", "readyPackageTemplate"] && (category == "tour" || _type == "readyPackageTemplate")]{ _id, title, name, "slug": slug.current }`)

  console.log(`Available references: ${hotels.length} hotels, ${attractions.length} attractions, ${restaurants.length} dining, ${malls.length} malls, ${tours.length} tours.`)

  const findHotel = (match: string) => hotels.find((h: any) => (h.title || h.name || '').toLowerCase().includes(match.toLowerCase()))?._id
  const findAttraction = (match: string) => attractions.find((a: any) => (a.title || a.name || '').toLowerCase().includes(match.toLowerCase()))?._id
  const findRestaurant = (match: string) => restaurants.find((r: any) => (r.title || r.name || '').toLowerCase().includes(match.toLowerCase()))?._id
  const findMall = (match: string) => malls.find((m: any) => (m.name || '').toLowerCase().includes(match.toLowerCase()))?._id
  const findTour = (match: string) => tours.find((t: any) => (t.title || t.name || '').toLowerCase().includes(match.toLowerCase()))?._id

  // 1. Singapore Family Wonder Essentials
  const hotelBossId = findHotel('Boss') || hotels[0]?._id
  const hotelLavenderId = findHotel('Lavender') || hotels[1]?._id
  const seaAquariumId = findAttraction('sea-aquarium') || findAttraction('Oceanarium') || attractions[0]?._id
  const gardensId = findAttraction('gardens-by-the-bay') || attractions[1]?._id
  const nightSafariId = findAttraction('night-safari') || attractions[2]?._id
  const sentosaTourId = findTour('sentosa') || tours[0]?._id
  const mandaiTourId = findTour('mandai') || tours[1]?._id
  const anandaBhavanId = findRestaurant('ananda') || restaurants[0]?._id
  const bismillahBiryaniId = findRestaurant('bismillah') || restaurants[1]?._id
  const immMallId = findMall('imm') || malls[0]?._id
  const bugisMallId = findMall('bugis') || malls[1]?._id

  const collections = [
    {
      _id: 'collection-singapore-family-wonder-essentials-4d3n',
      _type: 'curatedCollection',
      title: 'Singapore Family Wonder Essentials (4D3N)',
      slug: { _type: 'slug', current: 'singapore-family-wonder-essentials-4d3n' },
      tagline: 'Handcrafted 4-Day Family Vacation Kit: Sentosa Escapes, Mandai Wildlife & Child-Friendly Heritage Stays',
      category: 'family',
      badge: 'FAMILY FAVORITE',
      duration: '4 Days / 3 Nights',
      destination: 'Singapore',
      coverImageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&auto=format&fit=crop',
      targetAudience: 'Families traveling with kids & grandparents seeking convenient MRT-linked stays, high-energy theme parks, and wholesome dining.',
      overview: 'Designed exclusively for family travelers, this complete single-page blueprint combines the very best of Sentosa Island thrill rides with the magical Mandai Wildlife reserves. Every hotel, restaurant, and attraction is vetted for stroller access, family room configurations, and stress-free logistics.',
      highlights: [
        'Stay at Lavender/Victoria Street MRT hubs with expansive swimming pools and spacious family suites',
        'Includes Resorts World Sentosa, Oceanarium (S.E.A. Aquarium), and Mandai Night Safari Tram',
        'Curated kid-friendly dining with authentic South/North Indian and certified Halal buffet favorites',
        'Seamless logistics with sheltered walkway connectivity and dedicated coach transfer options'
      ],
      featuredHotels: [hotelBossId, hotelLavenderId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `hotel-${id}` })),
      featuredAttractions: [seaAquariumId, gardensId, nightSafariId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `attr-${id}` })),
      featuredDining: [anandaBhavanId, bismillahBiryaniId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `dining-${id}` })),
      featuredShopping: [immMallId, bugisMallId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `mall-${id}` })),
      featuredTours: [sentosaTourId, mandaiTourId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `tour-${id}` })),
      itinerarySchedule: [
        {
          _key: 'day-1',
          day: 'Day 1',
          title: 'Arrival, Hotel Check-in & Gardens by the Bay Twilight',
          description: 'Smooth airport transfer to your hotel. Unpack and recharge, then head to the world-famous Supertree Grove for the Garden Rhapsody light and sound spectacle.',
          morning: 'Touchdown at Changi Airport, private transfer & early check-in at Hotel Boss / V Hotel Lavender.',
          afternoon: 'Explore Jewel Changi Rain Vortex or take a refreshing dip at the hotel skyline pool.',
          evening: 'Visit Gardens by the Bay Flower Dome & Cloud Forest; catch the 7:45 PM Supertree light show.',
          recommendedDining: 'Bismillah Biryani / Satay by the Bay'
        },
        {
          _key: 'day-2',
          day: 'Day 2',
          title: 'Resorts World Sentosa & S.E.A. Aquarium Adventure',
          description: 'A full day of thrilling marine encounters and island adventures. Marvel at 100,000+ marine animals before catching sunset at Siloso Beach.',
          morning: 'Sentosa Express monorail from VivoCity; enter Oceanarium / S.E.A. Aquarium.',
          afternoon: 'Universal Studios Singapore or Sentosa Skyline Luge & Skyride.',
          evening: 'Spectacular Wings of Time fireworks and laser show on the open ocean.',
          recommendedDining: 'Malaysian Food Street @ Resorts World Sentosa'
        },
        {
          _key: 'day-3',
          day: 'Day 3',
          title: 'Mandai Wildlife Reserve & World-Famous Night Safari',
          description: 'Immerse in Singapore’s award-winning nature sanctuaries. Experience the brand new Bird Paradise in the afternoon and the nocturnal Night Safari by tram at dusk.',
          morning: 'Leisurely buffet breakfast; explore Bugis Street Market for souvenirs.',
          afternoon: 'Bird Paradise Mandai with 8 walkthrough aviaries and penguin feeding.',
          evening: 'Guided Night Safari open-air tram ride through 6 geographical zones.',
          recommendedDining: 'Ananda Bhavan Pure Vegetarian / Ulu Ulu Safari Restaurant'
        },
        {
          _key: 'day-4',
          day: 'Day 4',
          title: 'Retail Outlets, Souvenir Splurge & Departure',
          description: 'Final souvenir and electronics shopping before heading to Changi Airport for tax refunds (eTRS) and onward flight home.',
          morning: 'Outlet shopping at IMM (up to 80% off designer brands) or Chinatown Heritage Street.',
          afternoon: 'Hotel checkout, luggage storage, and transfer to Changi Airport.',
          evening: 'Changi Airport duty-free shopping and departure flight.',
          recommendedDining: 'Jewel Changi Canopy Park Food Court'
        }
      ],
      insiderTips: [
        'Download the Mandai App in advance to reserve your Night Safari tram slot and show times.',
        'Use contactless Mastercard/Visa directly at MRT fare gates—no need to buy individual tickets for kids above 0.9m.',
        'Pack light rain ponchos and insulated water flasks; Singapore tap water is 100% potable and filtered.'
      ],
      newsletterTeaser: 'Planning a hassle-free family vacation to Singapore? Our new 4D3N Singapore Family Wonder Essentials collection bundles hand-picked MRT-connected hotels, Sentosa S.E.A. Aquarium, Mandai Night Safari, and kid-approved dining in one turnkey guide. Click to view the day-by-day plan and get instant WhatsApp group rates!',
      customWhatsAppMessage: 'Hi Flying Wonders! I would like to inquire about customized pricing and booking for the Singapore Family Wonder Essentials (4D3N) Curated Collection.',
      isPublished: true,
      isFeatured: true,
      order: 1
    },

    // 2. Singapore & Malaysia Twin Destination Explorer
    {
      _id: 'collection-singapore-malaysia-cross-border-5d4n',
      _type: 'curatedCollection',
      title: 'Singapore & Malaysia Twin Destination Explorer (5D4N)',
      slug: { _type: 'slug', current: 'singapore-malaysia-cross-border-5d4n' },
      tagline: 'The Ultimate Cross-Border Overland Circuit: Marina Bay Skyline, Malacca UNESCO Heritage & Genting SkyWorlds',
      category: 'cross-border',
      badge: 'TOP SELLER',
      duration: '5 Days / 4 Nights',
      destination: 'Cross Border',
      coverImageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&auto=format&fit=crop',
      targetAudience: 'Travelers who want to cover two incredible Southeast Asian countries seamlessly in a single trip with VIP highway coach transfers.',
      overview: 'Why choose between Singapore and Malaysia when you can effortlessly experience both? This signature cross-border collection features 2 nights in modern Singapore and 2 nights in Kuala Lumpur & Genting Highlands, unified by smooth highway coach logistics and border immigration guidance.',
      highlights: [
        'Comprehensive 2-nation itinerary covering Singapore, historical Malacca, Genting Highlands & KL',
        'VIP air-conditioned highway coach transfer with Tuas / Woodlands checkpoint assistance',
        'Iconic stays at V Hotel Lavender Singapore and Berjaya Times Square Hotel Kuala Lumpur',
        'Cable car rides to Genting SkyWorlds, Petronas Twin Towers photo stop, and Batu Caves rainbow stairs'
      ],
      featuredHotels: [hotelLavenderId, hotelBossId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `hotel-${id}` })),
      featuredAttractions: [gardensId, seaAquariumId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `attr-${id}` })),
      featuredDining: [bismillahBiryaniId, anandaBhavanId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `dining-${id}` })),
      featuredShopping: [bugisMallId, immMallId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `mall-${id}` })),
      featuredTours: [sentosaTourId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `tour-${id}` })),
      itinerarySchedule: [
        {
          _key: 'day-1',
          day: 'Day 1',
          title: 'Singapore Arrival & Marina Bay Twilight Walk',
          description: 'Arrive in the Lion City, check into V Hotel Lavender, and soak in the dazzling Marina Bay Sands skyline.',
          morning: 'Changi Airport arrival & hotel check-in.',
          afternoon: 'City orientation, Merlion Park & Helix Bridge.',
          evening: 'Gardens by the Bay Supertrees & Marina Bay light show.',
          recommendedDining: 'Lau Pa Sat Hawker Market'
        },
        {
          _key: 'day-2',
          day: 'Day 2',
          title: 'Sentosa Island Escapade & Singapore City Sights',
          description: 'Explore the thrill of Sentosa Island, S.E.A. Aquarium, and take the scenic Singapore Cable Car.',
          morning: 'Sentosa Island cable car arrival and S.E.A. Aquarium.',
          afternoon: 'Sentosa beach relaxation, Madame Tussauds or Skyline Luge.',
          evening: 'Bugis Street night market shopping & dinner.',
          recommendedDining: 'Bismillah Biryani / Zam Zam Singapore'
        },
        {
          _key: 'day-3',
          day: 'Day 3',
          title: 'Cross-Border Overland Coach to Malacca & Kuala Lumpur',
          description: 'Scenic highway transfer across the Singapore Strait. En route stop at UNESCO-listed Malacca Dutch Square and Jonker Walk before arriving in Kuala Lumpur.',
          morning: 'Border clearance via Tuas checkpoint; comfortable AC VIP coach transfer.',
          afternoon: 'Malacca Heritage walk: Christ Church, Stadthuys, and A Famosa fort.',
          evening: 'Arrive in Kuala Lumpur; check-in at Berjaya Times Square Hotel Bukit Bintang.',
          recommendedDining: 'Jonker Street Nyonya Laksa & Cendol'
        },
        {
          _key: 'day-4',
          day: 'Day 4',
          title: 'Genting Highlands, Batu Caves & KL Golden Triangle',
          description: 'Ascend the misty Titiwangsa mountains via the Awana SkyWay cable car to Genting Highlands, then visit the towering Murugan statue at Batu Caves.',
          morning: 'Scenic drive to Batu Caves; photo stop at the 272 colorful limestone steps.',
          afternoon: 'Awana SkyWay glass-bottom gondola to Genting Highlands & Skytropolis.',
          evening: 'Petronas Twin Towers illuminated night photo stop and Jalan Alor street food feast.',
          recommendedDining: 'Jalan Alor Street Food Enclave'
        },
        {
          _key: 'day-5',
          day: 'Day 5',
          title: 'Kuala Lumpur City Orientation & KLIA Departure',
          description: 'King’s Palace photo stop, National Mosque, Independence Square, and souvenir shopping before departure transfer to KLIA.',
          morning: 'KL City Tour: Merdeka Square, Sultan Abdul Samad Building, Central Market.',
          afternoon: 'Bukit Bintang shopping and airport transfer to KLIA.',
          evening: 'Departure flight from Kuala Lumpur International Airport.',
          recommendedDining: 'Central Market Food Court / Old Town White Coffee'
        }
      ],
      insiderTips: [
        'Complete the Malaysia Digital Arrival Card (MDAC) online 3 days before crossing the border.',
        'Carry physical passports with minimum 6 months validity at all times during the overland checkpoint crossing.',
        'Dress modestly with knees and shoulders covered when visiting Batu Caves.'
      ],
      newsletterTeaser: 'Experience two dynamic nations in one five-day journey! Our Singapore & Malaysia Twin Destination Explorer collection combines Singapore’s futuristic skyline with Malacca UNESCO heritage and Kuala Lumpur Golden Triangle. Includes VIP overland coach and border transit guidance. Discover the complete blueprint now!',
      customWhatsAppMessage: 'Hi Flying Wonders! I would like to inquire about customized pricing and booking for the Singapore & Malaysia Twin Destination Explorer (5D4N) Curated Collection.',
      isPublished: true,
      isFeatured: true,
      order: 2
    },

    // 3. Singapore Corporate MICE & VIP Delegation Essentials
    {
      _id: 'collection-singapore-corporate-mice-vip-3d2n',
      _type: 'curatedCollection',
      title: 'Singapore Corporate MICE & Executive Delegation Essentials (3D2N)',
      slug: { _type: 'slug', current: 'singapore-corporate-mice-vip-3d2n' },
      tagline: 'Turnkey 3-Day Business & Incentive Kit: Waterfront 5-Star Stays, Private Yachting & Executive Banquets',
      category: 'corporate',
      badge: 'EXECUTIVE EDITION',
      duration: '3 Days / 2 Nights',
      destination: 'Singapore',
      coverImageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&auto=format&fit=crop',
      targetAudience: 'Corporate HR leaders, MICE event organizers, and executive business delegations seeking refined hospitality, private meeting spaces, and prestige dinners.',
      overview: 'Engineered specifically for corporate incentive trips, board retreats, and association delegations. This collection pairs world-class riverfront 5-star hospitality at Grand Copthorne Waterfront with private networking experiences, bespoke city tours, and high-capacity banquet options.',
      highlights: [
        '5-Star Riverfront accommodation with dedicated executive club lounge and conference facilities',
        'Private charter Singapore River cruise and Sands SkyPark Observation Deck delegation access',
        'Curated executive networking dinners with certified halal, vegetarian, and international menus',
        'Fast-track GST tax compliance invoices, single-point group billing, and on-ground team support'
      ],
      featuredHotels: [hotelBossId, hotelLavenderId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `hotel-${id}` })),
      featuredAttractions: [gardensId, seaAquariumId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `attr-${id}` })),
      featuredDining: [anandaBhavanId, bismillahBiryaniId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `dining-${id}` })),
      featuredShopping: [bugisMallId, immMallId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `mall-${id}` })),
      featuredTours: [sentosaTourId].filter(Boolean).map(id => ({ _type: 'reference', _ref: id, _key: `tour-${id}` })),
      itinerarySchedule: [
        {
          _key: 'day-1',
          day: 'Day 1',
          title: 'VIP Arrival, Executive Check-in & Singapore River Welcome Cruise',
          description: 'Dedicated airport meet-and-greet with luxury coach transfer. Check into Grand Copthorne Waterfront Hotel followed by a chartered sunset cruise along Clarke Quay.',
          morning: 'Changi VIP Arrival, baggage handling, and check-in at Grand Copthorne Waterfront.',
          afternoon: 'Executive lounge briefing and leisure stroll along Robertson Quay promenade.',
          evening: 'Private chartered Singapore River electric boat cruise; welcome cocktail dinner.',
          recommendedDining: 'Waterfront Promenade Executive Banquet'
        },
        {
          _key: 'day-2',
          day: 'Day 2',
          title: 'Conference Session / Team Building & Marina Bay Gala Evening',
          description: 'Morning corporate seminar or team-building scavenger hunt; evening VIP reception at Sands SkyPark overlooking the city lights.',
          morning: 'Breakfast buffet & half-day strategy meeting in hotel ballroom with AV support.',
          afternoon: 'Gardens by the Bay Flower Dome VIP guided walkthrough.',
          evening: 'Exclusive gala dinner with panoramic skyline views across Marina Bay.',
          recommendedDining: 'Shahi Maharani Royal Dining / Marina Bay Sands'
        },
        {
          _key: 'day-3',
          day: 'Day 3',
          title: 'Executive Shopping, Jewel Changi Experience & Departure',
          description: 'Suntec City or Marina Bay Sands Shoppes luxury retail tour, followed by Jewel Changi delegation lunch before departure.',
          morning: 'High-end retail & tech shopping at Suntec City / The Shoppes at Marina Bay Sands.',
          afternoon: 'Transfer to Changi Airport Terminal; private lounge access and duty-free shopping.',
          evening: 'Departure flights.',
          recommendedDining: 'Jewel Changi Private Dining'
        }
      ],
      insiderTips: [
        'Ask our operations team for consolidated GST tax invoices with Singapore company registration details.',
        'Private coach transfers can be arranged with police-escorted drop-offs for high-profile ministerial delegations.',
        'Early baggage check-in is available at Jewel Changi up to 24 hours prior to scheduled flights.'
      ],
      newsletterTeaser: 'Planning a high-impact corporate retreat or MICE delegation in Singapore? Our new Singapore Corporate MICE & VIP Delegation Essentials collection delivers 5-star riverfront stays, chartered networking cruises, and turnkey logistics under one single-point invoice. Request your corporate quote today!',
      customWhatsAppMessage: 'Hi Flying Wonders! I would like to inquire about group rates, meeting spaces, and custom arrangements for the Singapore Corporate MICE & VIP Delegation Essentials (3D2N) Collection.',
      isPublished: true,
      isFeatured: true,
      order: 3
    }
  ]

  for (const col of collections) {
    console.log(`⏳ Upserting Collection [${col.title}] (ID: ${col._id})...`)
    await client.createOrReplace(col)
    console.log(`✅ Upserted [${col.title}] successfully!`)
  }

  console.log(`\n🎉 Successfully seeded ${collections.length} Curated Collections into Sanity!`)
}

seedCuratedCollections().catch(err => {
  console.error('❌ Failed to seed collections:', err)
  process.exit(1)
})
