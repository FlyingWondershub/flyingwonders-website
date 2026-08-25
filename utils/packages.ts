import { client } from '../sanity/lib/client'

export interface ItineraryActivity {
  time: string
  desc: string
}

export interface ItineraryDay {
  day: number
  title: string
  activities: ItineraryActivity[]
}

export interface TravelShort {
  id: string
  title: string
  creator: string
  views?: string
  thumbnailUrl: string
  youtubeVideoId: string
}

export interface TravelPackage {
  _id: string
  slug?: string
  title: string
  tier: 'budget' | 'premium' | 'solo' | 'groups' | string
  price: number
  description: string
  image: string | any
  hotelOptions?: string
  destination?: string
  itinerary: ItineraryDay[]
  shorts?: TravelShort[]
  showTripSchedule?: boolean
  showShorts?: boolean
}

export const DEFAULT_SINGAPORE_SHORTS: TravelShort[] = [
  {
    id: 'sg-short-1',
    title: 'Jewel Changi Airport Rain Vortex & Canopy Park 🇸🇬',
    creator: 'VisitSingapore',
    views: '1.8M views',
    thumbnailUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80',
    youtubeVideoId: 'x6d3XQc0G4s'
  },
  {
    id: 'sg-short-2',
    title: 'Gardens by the Bay Light Show Spectacular ✨',
    creator: 'Explore The World',
    views: '890K views',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&w=600&q=80',
    youtubeVideoId: 'dO1zZ9c3N90'
  },
  {
    id: 'sg-short-3',
    title: 'Marina Bay Sands SkyPark & Infinity Pool Vibe 🌆',
    creator: 'Travel Asia Today',
    views: '1.2M views',
    thumbnailUrl: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=600&q=80',
    youtubeVideoId: 'r53Q6P6h0dY'
  },
  {
    id: 'sg-short-4',
    title: 'Sentosa Island Cable Car & Beach Club Guide 🏖️',
    creator: 'Jake & Kaylee Travel',
    views: '650K views',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80',
    youtubeVideoId: 'V9P7b9mZtqU'
  },
  {
    id: 'sg-short-5',
    title: 'Famous Singapore Hainanese Chicken Rice & Street Food 🍜',
    creator: 'Foodie Explorer',
    views: '2.4M views',
    thumbnailUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80',
    youtubeVideoId: 'Jb2z8c2k5y0'
  }
]

export const DEFAULT_PACKAGES: TravelPackage[] = [
  {
    _id: 'exotic_4d3n',
    slug: 'exotic-4d3n',
    title: 'Exotic 4Days - 3Nights',
    tier: 'budget',
    price: 600,
    description: 'Explore the best of Singapore in this compact, action-packed 4 Days, 3 Nights budget-friendly tour. Includes stay at standard 3* hotels on Orchard Road or Lavender, seamless transfers, local sightseeing, Night Safari tram rides, Gardens by the Bay domes, Sentosa Island adventures, and Universal Studios!',
    image: '/images/hero/singapore-hero-1.jpg',
    hotelOptions: '3* / Hotel Chancellor Orchard Road / Hotel Boss / Hotel V Lavender',
    itinerary: [
      {
        day: 1,
        title: "Arrival, City Tour & Night Safari",
        activities: [
          { time: "08:00 - 09:00", desc: "Pickup From Airport & Drop at Indian Restaurant for Breakfast" },
          { time: "09:00 - 10:00", desc: "Breakfast @ Indian Restaurant" },
          { time: "10:00 - 12:45", desc: "Half Day City Tour Covering Merlion, Buddha Temple & Nearby Places" },
          { time: "13:00 - 14:00", desc: "Lunch @ Indian Restaurant" },
          { time: "14:30", desc: "Drop at Hotel - Hotel Check-in (Standard Check-in time is 3PM)" },
          { time: "17:30 - 18:30", desc: "Pickup from Hotel & drop to Night Safari Campus" },
          { time: "19:00 - 21:00", desc: "Night Safari With Tram Ride - Entry Ticket Provided" },
          { time: "20:45 - 21:45", desc: "Start from Night Safari & Enter Dinner @ Indian Restaurant" },
          { time: "22:00 - 22:45", desc: "Drop to Hotel, Overnight Stay" }
        ]
      },
      {
        day: 2,
        title: "Gardens by the Bay & Sentosa Island",
        activities: [
          { time: "08:00", desc: "Breakfast at Stay Hotel" },
          { time: "09:00 - 09:30", desc: "Pickup from Hotel & drop to Gardens by the Bay" },
          { time: "09:30 - 12:30", desc: "Cloud Forest & Flower Dome - Entry Tickets Provided, Visit Sky Tree" },
          { time: "12:30 - 13:00", desc: "Pickup from Hotel & drop for Lunch @ Indian Restaurant" },
          { time: "13:30 - 14:30", desc: "Lunch at Indian Restaurant" },
          { time: "14:45 - 15:15", desc: "Start to Sentosa Island" },
          { time: "15:15 - 20:00", desc: "Madame Tussauds 4 in 1, Cable Car, Wings of Time (7:40PM Slot) - Entry Tickets Provided" },
          { time: "20:30 - 21:00", desc: "Pickup from Beach Station Coach point, Drop to Indian Restaurant" },
          { time: "21:00 - 22:00", desc: "Dinner at Indian Restaurant" },
          { time: "22:15 - 22:30", desc: "Drop to Hotel, Overnight Stay" }
        ]
      },
      {
        day: 3,
        title: "Universal Studios Thrills",
        activities: [
          { time: "08:00", desc: "Breakfast at Stay Hotel" },
          { time: "09:30 - 10:15", desc: "Pickup from Hotel & drop to Universal Studios" },
          { time: "10:30", desc: "Universal Studios - Entry Tickets provided" },
          { time: "13:00", desc: "Lunch coupon or meal allowance provided" },
          { time: "19:00 - 19:30", desc: "Pickup from Universal Studios & drop for dinner at Indian Restaurant" },
          { time: "20:00 - 21:00", desc: "Dinner at Indian Restaurant" },
          { time: "21:30 - 22:00", desc: "Drop to Hotel, Overnight Stay" }
        ]
      },
      {
        day: 4,
        title: "Shopping, Checkout & Departure",
        activities: [
          { time: "08:00", desc: "Breakfast at Stay Hotel" },
          { time: "10:00", desc: "Free & Easy / Shopping Time" },
          { time: "12:00", desc: "Hotel Checkout" },
          { time: "13:00", desc: "Transfer to Airport / Explore Jewel Changi" },
          { time: "18:00", desc: "Collect Boarding Pass & Depart with Singapore Memories" }
        ]
      }
    ]
  },
  {
    _id: 'classic_5d4n',
    slug: 'classic-5d4n',
    title: 'Singapore Explorer Classic 5D4N',
    tier: 'premium',
    price: 850,
    description: 'Experience Singapore in style. Includes premium 4* hotel stays, Sentosa Luge ride, Gardens by the Bay, Night Safari, Universal Studios VIP experience, and Marina Bay Sands SkyPark observations.',
    image: '/images/hero/singapore-hero-2.jpg',
    hotelOptions: '4* / Orchard Rendezvous Hotel / Grand Copthorne Waterfront',
    itinerary: [
      {
        day: 1,
        title: "Arrival & Marina Bay Sands Light Show",
        activities: [
          { time: "10:00", desc: "Airport pickup and drop to 4* luxury hotel" },
          { time: "18:00", desc: "Visit Marina Bay Sands SkyPark Observation Deck" },
          { time: "20:00", desc: "Watch the Spectra Light & Water Show" }
        ]
      },
      {
        day: 2,
        title: "Gardens by the Bay & Night Safari",
        activities: [
          { time: "09:00", desc: "Explore Gardens by the Bay Flower Dome & Cloud Forest" },
          { time: "18:00", desc: "Night Safari guided tram tour & Creatures of the Night show" }
        ]
      },
      {
        day: 3,
        title: "Universal Studios & Sentosa Skyhelix",
        activities: [
          { time: "10:00", desc: "Full day Universal Studios Singapore with express passes" },
          { time: "18:00", desc: "Ride the open-air Sentosa Skyhelix ride at Sunset" }
        ]
      },
      {
        day: 4,
        title: "Singapore Zoo & River Wonders",
        activities: [
          { time: "09:00", desc: "Explore the Singapore Zoo and River Wonders Amazon Quest boat ride" },
          { time: "19:00", desc: "Gourmet local dinner along Singapore River" }
        ]
      },
      {
        day: 5,
        title: "Jewel Changi Canopy & Departure",
        activities: [
          { time: "10:00", desc: "Visit Jewel Changi Canopy Park & Rain Vortex" },
          { time: "14:00", desc: "Airport drop for outbound departure" }
        ]
      }
    ]
  },
  {
    _id: 'solo_exploration_4d3n',
    slug: 'solo-exploration-4d3n',
    title: 'Solo Exploration 4Days - 3Nights - Private Transfers',
    tier: 'solo',
    price: 1000,
    description: 'Experience Singapore at your own pace with a premium private-transfer solo package. Includes standard 3* hotel stays on Orchard Road or Lavender, private airport/hotel transfers, half-day city highlights tour, Gardens by the Bay double domes entrance, Museum of Ice Cream tickets, Sentosa Island adventure, and full-day Universal Studios Singapore admission!',
    image: '/images/hero/singapore-hero-3.jpg',
    hotelOptions: '3* / Hotel Chancellor Orchard Road / Hotel Boss / Hotel V Lavender',
    itinerary: [
      {
        day: 1,
        title: "Arrival, City Highlights & Gardens by the Bay",
        activities: [
          { time: "08:00 - 09:00", desc: "Pickup From Airport & Drop baggage at hotel" },
          { time: "10:00 - 12:45", desc: "Half Day City Tour Covering Merlion, Buddha Temple & Nearby Places" },
          { time: "14:30", desc: "Drop at Hotel - Hotel Check-in (Standard Check-in time is 3PM)" },
          { time: "15:00 - 15:30", desc: "Pickup from Hotel & drop to Gardens by the Bay" },
          { time: "15:30 - 20:30", desc: "Cloud Forest & Flower Dome - Entry Tickets Provided, Visit Sky Tree" },
          { time: "20:45 - 21:45", desc: "Drop to Hotel, Overnight Stay" }
        ]
      },
      {
        day: 2,
        title: "Museum of Ice Cream & Sentosa Island",
        activities: [
          { time: "08:00", desc: "Breakfast at Stay Hotel" },
          { time: "09:00 - 09:30", desc: "Pickup from Hotel & drop to Museum of Icecream" },
          { time: "09:30 - 12:30", desc: "Explore Museum of Icecream - Place of Happiness" },
          { time: "12:45 - 13:15", desc: "Start to Sentosa Island" },
          { time: "13:15 - 20:00", desc: "Madame Tussauds, Cable Car, spend time on beach, Wings of time show" },
          { time: "20:30 - 21:00", desc: "Pickup from Beach Station Coach point - Drop to Hotel" }
        ]
      },
      {
        day: 3,
        title: "Universal Studios Singapore",
        activities: [
          { time: "08:00", desc: "Breakfast at Stay Hotel" },
          { time: "09:30 - 10:15", desc: "Pickup from Hotel & drop to Universal Studios" },
          { time: "10:30", desc: "Universal Studios - Entry Tickets provided" },
          { time: "13:00", desc: "Lunch coupon or meal allowance provided" },
          { time: "20:00 - 20:30", desc: "Pickup from Universal Studios & drop to Hotel" }
        ]
      },
      {
        day: 4,
        title: "Leisure, Shopping & Departure",
        activities: [
          { time: "08:00", desc: "Breakfast at Stay Hotel" },
          { time: "10:00", desc: "Free & Easy / Shopping Time" },
          { time: "12:00", desc: "Hotel Checkout" },
          { time: "13:00", desc: "Transfer to Airport / Explore Jewel Changi" },
          { time: "18:00", desc: "Collect Boarding Pass & Depart with Singapore Memories" }
        ]
      }
    ]
  },
  {
    _id: 'marvelous_singapore_5d4n',
    slug: 'marvelous-singapore-5d4n',
    title: 'Marvelous Singapore 5Days - 4Nights',
    tier: 'groups',
    price: 950,
    description: 'The ultimate Singapore family and group getaway! Includes standard 3* hotel stays on Orchard Road or Lavender, city tours, double dome access at Gardens by the Bay, Museum of Ice Cream, Bird Paradise, Night Safari, full-day Universal Studios Singapore tickets, Sentosa cable cars, Madame Tussauds, S.E.A. Aquarium, and Wings of Time shows!',
    image: '/images/hero/singapore-hero-4.jpg',
    hotelOptions: '3* / Hotel Chancellor Orchard Road / Hotel Boss / Hotel V Lavender',
    itinerary: [
      {
        day: 1,
        title: "Arrival, City Highlights & Gardens by the Bay",
        activities: [
          { time: "08:00 - 09:00", desc: "Pickup From Airport & Drop at Indian Restaurant for Breakfast" },
          { time: "09:00 - 10:00", desc: "Breakfast @ Indian Restaurant" },
          { time: "10:00 - 12:45", desc: "Half Day City Tour Covering Merlion, Buddha Temple & Nearby Places" },
          { time: "13:00 - 14:00", desc: "Lunch @ Indian Restaurant" },
          { time: "14:30", desc: "Drop at Hotel - Hotel Check-in (Standard Check-in time is 3PM)" },
          { time: "16:30 - 17:00", desc: "Pickup from Hotel & drop to Gardens by the bay" },
          { time: "17:00 - 20:30", desc: "Cloud Forest & Flower Dome - Entry Tickets Provided, Visit Sky Tree" },
          { time: "20:45 - 21:00", desc: "Start back from Gardens, Drop to Indian restaurant" },
          { time: "22:00 - 22:45", desc: "Drop to Hotel, Overnight Stay" }
        ]
      },
      {
        day: 2,
        title: "Museum of Ice Cream, Bird Paradise & Night Safari",
        activities: [
          { time: "08:00", desc: "Breakfast at Stay Hotel" },
          { time: "09:00 - 09:30", desc: "Pickup from Hotel & drop to Museum Of Icecream" },
          { time: "09:30 - 12:30", desc: "Museum of Singapore - Entry Tickets provided" },
          { time: "12:30 - 13:00", desc: "Pickup from Hotel & drop for Lunch @ Indian Restaurant" },
          { time: "13:30 - 14:30", desc: "Lunch at Indian Restaurant" },
          { time: "14:45 - 15:15", desc: "Pickup for Bird Paradise" },
          { time: "15:15 - 18:00", desc: "Bird Paradise - Entry Tickets Provided" },
          { time: "18:00 - 18:30", desc: "Shuttle to Night Safari" },
          { time: "19:00 - 21:00", desc: "Night Safari - Entry Tickets Provided" },
          { time: "21:00 - 22:00", desc: "Dinner at Indian Restaurant" },
          { time: "22:15 - 22:30", desc: "Drop to Hotel, Overnight Stay" }
        ]
      },
      {
        day: 3,
        title: "Universal Studios Thrills",
        activities: [
          { time: "08:00", desc: "Breakfast at Stay Hotel" },
          { time: "09:30 - 10:15", desc: "Pickup from Hotel & drop to Universal Studios" },
          { time: "10:30", desc: "Universal Studios - Entry Tickets provided" },
          { time: "13:00", desc: "Lunch coupon or meal allowance provided" },
          { time: "19:00 - 19:30", desc: "Pickup from Universal Studios & drop for dinner at Indian Restaurant" },
          { time: "20:00 - 21:00", desc: "Dinner at Indian Restaurant" },
          { time: "21:30 - 22:00", desc: "Drop to Hotel, Overnight Stay" }
        ]
      },
      {
        day: 4,
        title: "Sentosa Island, Madame Tussauds, Aquarium & Wings of Time",
        activities: [
          { time: "08:00", desc: "Breakfast at Stay Hotel" },
          { time: "11:00 - 11:30", desc: "Start to Sentosa Island" },
          { time: "11:30 - 12:15", desc: "Cable Car - Mount Faber Station - Entry Tickets Provided" },
          { time: "12:15 - 13:15", desc: "Madame Tussaud Entry Tickets Provided" },
          { time: "13:30 - 14:30", desc: "Lunch at Indian Restaurant" },
          { time: "15:00 - 17:00", desc: "Oceanarium - Entry Tickets provided (Optional Dolphin Island)" },
          { time: "19:00 - 20:00", desc: "Wings of Time - Entry Tickets provided" },
          { time: "20:30 - 21:00", desc: "Pickup from Beach Station Coach point, Drop to Indian Restaurant" },
          { time: "21:00 - 22:00", desc: "Dinner at Indian Restaurant" },
          { time: "22:15 - 22:30", desc: "Drop to Hotel, Overnight Stay" }
        ]
      },
      {
        day: 5,
        title: "Leisure, Shopping & Departure",
        activities: [
          { time: "08:00", desc: "Breakfast at Stay Hotel" },
          { time: "10:00", desc: "Free & Easy / Shopping Time" },
          { time: "12:00", desc: "Hotel Checkout" },
          { time: "13:00", desc: "Transfer to Airport / Explore Jewel Changi" },
          { time: "18:00", desc: "Collect Boarding Pass & Depart with Singapore Memories" }
        ]
      }
    ]
  }
]

export function normalizeSlug(idOrSlug: string): string {
  return idOrSlug.toLowerCase().replace(/_/g, '-')
}

export async function getAllPackages(): Promise<TravelPackage[]> {
  let sanityPackages: any[] = []
  try {
    const query = `*[_type == "travelPackage"]{
      _id,
      "slug": slug.current,
      title,
      tier,
      price,
      description,
      image,
      hotelOptions,
      showTripSchedule,
      showShorts,
      itinerary
    }`
    sanityPackages = await client.fetch(query)
  } catch (err) {
    console.error('Failed to fetch packages from Sanity:', err)
  }

  const packagesMap = new Map<string, TravelPackage>()

  DEFAULT_PACKAGES.forEach(pkg => {
    packagesMap.set(pkg._id, { ...pkg, slug: pkg.slug || normalizeSlug(pkg._id) })
  })

  if (Array.isArray(sanityPackages)) {
    sanityPackages.forEach(sanityPkg => {
      const defaultPkg = packagesMap.get(sanityPkg._id)
      const slug = sanityPkg.slug || (defaultPkg ? defaultPkg.slug : normalizeSlug(sanityPkg._id || sanityPkg.title || ''))
      if (defaultPkg) {
        packagesMap.set(sanityPkg._id, {
          ...defaultPkg,
          ...sanityPkg,
          slug,
          image: sanityPkg.image || defaultPkg.image,
          itinerary: (sanityPkg.itinerary && sanityPkg.itinerary.length > 0) ? sanityPkg.itinerary : defaultPkg.itinerary,
          hotelOptions: (sanityPkg.hotelOptions && sanityPkg.hotelOptions.trim()) ? sanityPkg.hotelOptions : defaultPkg.hotelOptions,
        })
      } else {
        packagesMap.set(sanityPkg._id, {
          ...sanityPkg,
          slug: slug || normalizeSlug(sanityPkg._id)
        })
      }
    })
  }

  return Array.from(packagesMap.values())
}

export async function getPackageBySlug(slug: string): Promise<TravelPackage | null> {
  const packages = await getAllPackages()
  const cleanSlug = normalizeSlug(slug)
  return packages.find(p => normalizeSlug(p.slug || p._id) === cleanSlug || normalizeSlug(p._id) === cleanSlug) || null
}
