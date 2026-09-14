import { client } from '../sanity/lib/client'
import { urlForImage } from '../sanity/lib/image'

export interface ReadyPackageDayTransfer {
  serviceType: string
  routeDescription?: string
  vehicleType?: string
  time?: string
  hours?: number
  transferPriceModality?: string
  pickupNotes?: string
  dropNotes?: string
}

export interface ReadyPackageDayAttraction {
  attractionName: string
  time?: string
  inclusionsNotes?: string
  isOptional?: boolean
}

export interface ReadyPackageDay {
  dayNumber: number
  dayTitle: string
  dayDescription?: string
  transfers?: ReadyPackageDayTransfer[]
  attractions?: ReadyPackageDayAttraction[]
}

export interface ReadyPackageTemplate {
  _id: string
  title: string
  slug: string
  nightsCount: number
  category: string
  badgeText?: string
  coverImage?: string | any
  videoUrl?: string | null
  summary: string
  startingPriceSGD: number
  termsAndInclusions?: string
  transferPricingOption?: string
  itinerary: ReadyPackageDay[]
}

export const FALLBACK_READY_PACKAGES: ReadyPackageTemplate[] = [
  {
    _id: 'template-1',
    slug: '3n-4d-singapore-highlights-city-essentials',
    title: '3N/4D Singapore Highlights & City Essentials',
    nightsCount: 3,
    category: 'popular',
    badgeText: 'BESTSELLER',
    startingPriceSGD: 485,
    summary: 'Airport Transfers + Half Day City Tour + Gardens by the Bay (2 Domes) + Night Safari with Tram.',
    coverImage: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop&q=80',
    termsAndInclusions: 'Terms & Inclusions:\n\n📌 Land Package Only: Hotel accommodation is not included.\n🚐 Transfers: Airport arrival & departure transfers are provided by Private 13-Seater Minibus. Sightseeing transfers are as selected (SIC / Private 13-Seater). Surcharges applicable for flights between 22:00 - 07:00 hours.\nℹ️ Customizations: For hotel room bookings, meal plans, licensed English/Hindi guides, or coach upgrades for groups >12 Pax, please contact DMC.',
    itinerary: [
      {
        dayNumber: 1,
        dayTitle: 'Arrival & Welcome Transfer',
        dayDescription: 'Welcome to Singapore! Meet our chauffeur at Changi Airport for a direct private transfer to your city hotel. Rest of the day is at your leisure.',
        transfers: [
          { serviceType: 'arrival', routeDescription: 'Changi Airport to Hotel (Private 13-Seater)', vehicleType: 'Private 13-Seater Minibus', time: '12:00' }
        ],
        attractions: []
      },
      {
        dayNumber: 2,
        dayTitle: 'City Tour & Gardens by the Bay',
        dayDescription: 'Explore Singapore highlights including Merlion Park, Civic District, and Chinatown, followed by the breathtaking Cloud Forest and Flower Dome at Gardens by the Bay.',
        transfers: [
          { serviceType: 'cityTour', routeDescription: 'Half-Day Panoramic City Tour (3 Hours)', vehicleType: 'Private 13-Seater Minibus', time: '09:30' },
          { serviceType: 'interAttraction', routeDescription: 'Hotel to Gardens by the Bay Transfer', vehicleType: 'Private 13-Seater Minibus', time: '14:00' }
        ],
        attractions: [
          { attractionName: 'Gardens by the Bay - Flower Dome & Cloud Forest', time: '14:30', inclusionsNotes: 'Includes 2 Domes Admission' }
        ]
      },
      {
        dayNumber: 3,
        dayTitle: 'Sentosa & Night Safari Experience',
        dayDescription: 'Visit Universal Studios Singapore for a day of thrilling rides, and end your evening with the world-famous Night Safari wildlife tram journey.',
        transfers: [
          { serviceType: 'interAttraction', routeDescription: 'Hotel to Resorts World Sentosa Transfer', vehicleType: 'Private 13-Seater Minibus', time: '09:30' },
          { serviceType: 'interAttraction', routeDescription: 'Sentosa to Mandai Wildlife Reserve', vehicleType: 'Private 13-Seater Minibus', time: '18:00' }
        ],
        attractions: [
          { attractionName: 'Universal Studios Singapore', time: '10:00', inclusionsNotes: 'Full-Day Admission Ticket' },
          { attractionName: 'Night Safari with Tram Ride', time: '19:15', inclusionsNotes: 'Includes Guided Tram Ride' }
        ]
      },
      {
        dayNumber: 4,
        dayTitle: 'Leisure & Departure Transfer',
        dayDescription: 'Enjoy your morning at leisure for shopping along Orchard Road or Bugis before your scheduled private transfer to Changi Airport.',
        transfers: [
          { serviceType: 'departure', routeDescription: 'Hotel to Changi Airport Departure (Private 13-Seater)', vehicleType: 'Private 13-Seater Minibus', time: '15:00' }
        ],
        attractions: []
      }
    ]
  },
  {
    _id: 'template-2',
    slug: '4n-5d-sentosa-thrill-universal-studios-special',
    title: '4N/5D Sentosa Thrill & Universal Studios Special',
    nightsCount: 4,
    category: 'family',
    badgeText: 'FAMILY FAVORITE',
    startingPriceSGD: 720,
    summary: 'Universal Studios Full Day Pass + S.E.A. Aquarium + Wings of Time + Marina Bay Sands SkyPark.',
    coverImage: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&auto=format&fit=crop&q=80',
    termsAndInclusions: 'Terms & Inclusions:\n\n📌 Land Package Only: Hotel accommodation is not included.\n🚐 Transfers: Airport arrival & departure transfers are provided by Private 13-Seater Minibus. Sightseeing transfers are as selected (SIC / Private 13-Seater). Surcharges applicable for flights between 22:00 - 07:00 hours.\nℹ️ Customizations: For hotel room bookings, meal plans, licensed English/Hindi guides, or coach upgrades for groups >12 Pax, please contact DMC.',
    itinerary: [
      {
        dayNumber: 1,
        dayTitle: 'Arrival & Hotel Check-in',
        dayDescription: 'Arrival at Changi Airport and private transfer to hotel.',
        transfers: [
          { serviceType: 'arrival', routeDescription: 'Changi Airport to Hotel (Private 13-Seater)', vehicleType: 'Private 13-Seater Minibus', time: '13:00' }
        ],
        attractions: []
      },
      {
        dayNumber: 2,
        dayTitle: 'Universal Studios Singapore Full Day',
        dayDescription: 'A full day of excitement at Southeast Asia’s only Universal Studios theme park.',
        transfers: [
          { serviceType: 'interAttraction', routeDescription: 'Hotel to Universal Studios Sentosa', vehicleType: 'Private 13-Seater Minibus', time: '09:30' }
        ],
        attractions: [
          { attractionName: 'Universal Studios Singapore', time: '10:00', inclusionsNotes: 'One-Day Pass' }
        ]
      },
      {
        dayNumber: 3,
        dayTitle: 'S.E.A. Aquarium & Wings of Time',
        dayDescription: 'Marvel at over 100,000 marine animals at S.E.A. Aquarium, followed by the Wings of Time open-sea laser night show.',
        transfers: [
          { serviceType: 'interAttraction', routeDescription: 'Hotel to Sentosa Island', vehicleType: 'Private 13-Seater Minibus', time: '10:00' }
        ],
        attractions: [
          { attractionName: 'S.E.A. Aquarium', time: '10:30', inclusionsNotes: 'Admission Ticket' },
          { attractionName: 'Wings of Time', time: '19:40', inclusionsNotes: 'Standard Seat Admission' }
        ]
      },
      {
        dayNumber: 4,
        dayTitle: 'MBS SkyPark & Marina Bay',
        dayDescription: 'Panoramic 360-degree views of Singapore skyline from the Marina Bay Sands SkyPark Observation Deck.',
        transfers: [
          { serviceType: 'cityTour', routeDescription: 'Half-Day City Tour & Marina Bay Sands Transfer', vehicleType: 'Private 13-Seater Minibus', time: '10:00' }
        ],
        attractions: [
          { attractionName: 'Marina Bay Sands SkyPark', time: '15:00', inclusionsNotes: 'Observation Deck Admission' }
        ]
      },
      {
        dayNumber: 5,
        dayTitle: 'Departure Transfer',
        dayDescription: 'Private transfer from hotel to Changi Airport.',
        transfers: [
          { serviceType: 'departure', routeDescription: 'Hotel to Changi Airport Departure (Private 13-Seater)', vehicleType: 'Private 13-Seater Minibus', time: '12:00' }
        ],
        attractions: []
      }
    ]
  },
  {
    _id: 'template-3',
    slug: '5n-6d-grand-singapore-malaysia-cross-border-escape',
    title: '5N/6D Grand Singapore & Malaysia Cross-Border Escape',
    nightsCount: 5,
    category: 'luxury',
    badgeText: 'LUXURY DMC',
    startingPriceSGD: 1050,
    summary: 'Full Singapore Highlights + Private Cross-Border Transfer to Johor Bahru / Desaru Coast.',
    coverImage: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop&q=80',
    termsAndInclusions: 'Terms & Inclusions:\n\n📌 Land Package Only: Hotel accommodation is not included.\n🚐 Transfers: Airport arrival & departure transfers are provided by Private 13-Seater Minibus. Sightseeing transfers are as selected (SIC / Private 13-Seater). Cross-border legs are strictly Private. Surcharges applicable for flights between 22:00 - 07:00 hours.\nℹ️ Customizations: For hotel room bookings, meal plans, licensed English/Hindi guides, or coach upgrades for groups >12 Pax, please contact DMC.',
    itinerary: [
      {
        dayNumber: 1,
        dayTitle: 'Arrival & Private Minibus Transfer',
        dayDescription: 'Arrival at Changi Airport and private transfer to city hotel.',
        transfers: [
          { serviceType: 'arrival', routeDescription: 'Changi Airport to Hotel (Private 13-Seater)', vehicleType: 'Private 13-Seater Minibus', time: '13:00' }
        ],
        attractions: []
      },
      {
        dayNumber: 2,
        dayTitle: 'Gardens by the Bay & City Tour',
        dayDescription: 'Half-day panoramic city tour plus Cloud Forest and Flower Dome.',
        transfers: [
          { serviceType: 'cityTour', routeDescription: 'Half-Day Panoramic City Tour (3 Hours)', vehicleType: 'Private 13-Seater Minibus', time: '09:30' },
          { serviceType: 'interAttraction', routeDescription: 'Hotel to Gardens by the Bay', vehicleType: 'Private 13-Seater Minibus', time: '14:00' }
        ],
        attractions: [
          { attractionName: 'Gardens by the Bay - Flower Dome & Cloud Forest', time: '14:30', inclusionsNotes: '2 Domes Ticket' }
        ]
      },
      {
        dayNumber: 3,
        dayTitle: 'Universal Studios Singapore',
        dayDescription: 'Full day adventure at Universal Studios Sentosa.',
        transfers: [
          { serviceType: 'interAttraction', routeDescription: 'Hotel to Resorts World Sentosa', vehicleType: 'Private 13-Seater Minibus', time: '09:30' }
        ],
        attractions: [
          { attractionName: 'Universal Studios Singapore', time: '10:00', inclusionsNotes: '1-Day Admission' }
        ]
      },
      {
        dayNumber: 4,
        dayTitle: 'Cross-Border Private Transfer to Johor Bahru',
        dayDescription: 'Private cross-border transfer across the Singapore-Malaysia causeway to Johor Bahru.',
        transfers: [
          { serviceType: 'interAttraction', routeDescription: 'Singapore Hotel to Johor Bahru Cross-Border Transfer', vehicleType: 'Private 13-Seater Minibus', time: '10:00' }
        ],
        attractions: []
      },
      {
        dayNumber: 5,
        dayTitle: 'Desaru Coast Leisure Day',
        dayDescription: 'Free day to explore Desaru Coast beaches or Johor Premium Outlets.',
        transfers: [],
        attractions: []
      },
      {
        dayNumber: 6,
        dayTitle: 'Return Departure Transfer to Changi Airport',
        dayDescription: 'Cross-border private return transfer to Singapore Changi Airport for departure.',
        transfers: [
          { serviceType: 'departure', routeDescription: 'Johor Bahru Hotel to Changi Airport Departure', vehicleType: 'Private 13-Seater Minibus', time: '11:00' }
        ],
        attractions: []
      }
    ]
  }
]

export function normalizeReadyPackageSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function getEmbedVideoInfo(rawUrl?: string | null): { type: 'youtube' | 'vimeo' | 'mp4' | null; embedUrl: string | null } {
  if (!rawUrl) return { type: null, embedUrl: null }
  const trimmed = rawUrl.trim()

  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&rel=0&modestbranding=1`
    }
  }

  const vmMatch = trimmed.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/)
  if (vmMatch && vmMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1&muted=1`
    }
  }

  return {
    type: 'mp4',
    embedUrl: trimmed
  }
}

export async function getAllReadyPackages(): Promise<ReadyPackageTemplate[]> {
  try {
    const sanityTemplates = await client.fetch(
      `*[_type == "readyPackageTemplate" && !hideTemplate] | order(nightsCount asc) {
        _id,
        title,
        "slug": slug.current,
        nightsCount,
        category,
        badgeText,
        coverImage,
        "videoFileUrl": videoFile.asset->url,
        videoUrl,
        summary,
        startingPriceSGD,
        termsAndInclusions,
        transferPricingOption,
        itinerary
      }`
    )

    if (Array.isArray(sanityTemplates) && sanityTemplates.length > 0) {
      return sanityTemplates.map(tmpl => {
        let coverImg = null
        if (tmpl?.coverImage) {
          try {
            coverImg = urlForImage(tmpl.coverImage).width(1200).fit('max').url()
          } catch (e) {
            coverImg = typeof tmpl.coverImage === 'string' ? tmpl.coverImage : null
          }
        }
        return {
          ...tmpl,
          slug: tmpl?.slug || normalizeReadyPackageSlug(tmpl.title || tmpl._id),
          startingPriceSGD: Number(tmpl?.startingPriceSGD) > 0 ? Number(tmpl.startingPriceSGD) : 485,
          coverImage: coverImg || tmpl?.coverImage || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
          videoUrl: tmpl?.videoFileUrl || tmpl?.videoUrl || null
        }
      })
    }
  } catch (err) {
    console.warn('Failed to fetch ready packages from Sanity, using fallbacks:', err)
  }

  return FALLBACK_READY_PACKAGES
}

export async function getReadyPackageBySlug(slugOrId: string): Promise<ReadyPackageTemplate | null> {
  const all = await getAllReadyPackages()
  const clean = slugOrId.toLowerCase().trim()
  return all.find(p => p.slug === clean || p._id === clean || normalizeReadyPackageSlug(p.title) === clean) || null
}

export function calculateLandPackagePrices(pkg: any) {
  const baseStarting = Number(pkg?.startingPriceSGD) || 485
  let privateTransferCost = 0
  let sicTransferCost = 0

  ;(pkg?.itinerary || []).forEach((day: any) => {
    ;(day.transfers || []).forEach((tr: any) => {
      const sType = (tr.serviceType || '').toLowerCase()
      const vType = (tr.vehicleType || '').toLowerCase()
      const isArr = sType === 'arrival' || vType.includes('arrival')
      const isDep = sType === 'departure' || vType.includes('departure')
      const isCity = sType === 'citytour' || sType === 'city tour' || vType.includes('city')
      const isDisp = sType === 'disposal' || vType.includes('disposal')

      if (isArr || isDep) {
        // Airport is strictly Private 13-Seater Minibus
        privateTransferCost += 45
        sicTransferCost += 45
      } else if (isDisp) {
        const hrs = Number(tr.hours) > 0 ? Number(tr.hours) : 4
        privateTransferCost += 45 * hrs
        sicTransferCost += 45 * hrs
      } else if (isCity) {
        // City tour: S$ 120 flat vehicle vs S$ 15/person for SIC (x2 pax)
        privateTransferCost += 120
        sicTransferCost += 15 * 2
      } else {
        // Inter-attraction: S$ 45 flat vehicle vs S$ 12/person for SIC (x2 pax)
        privateTransferCost += 45
        sicTransferCost += 12 * 2
      }
    })
  })

  // Transfer difference per adult for standard 2-pax quote
  const transferDiffPerAdult = Math.max(0, Math.round((privateTransferCost - sicTransferCost) / 2))
  const pricePrivate = baseStarting
  const priceSic = Math.max(150, baseStarting - transferDiffPerAdult)

  return {
    pricePrivate,
    priceSic,
    transferDiffPerAdult
  }
}
