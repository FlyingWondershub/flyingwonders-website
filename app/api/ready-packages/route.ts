import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'
import { apiVersion, dataset, projectId } from '../../../sanity/env'

const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
})

const imageBuilder = createImageUrlBuilder({ projectId: projectId || '', dataset: dataset || '' })

export const dynamic = 'force-dynamic'
export const revalidate = 60

const FALLBACK_TEMPLATES = [
  {
    _id: 'template-1',
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
          { serviceType: 'arrival', routeDescription: 'Changi Airport to Hotel (Private 13-Seater)', time: '12:00' }
        ],
        attractions: []
      },
      {
        dayNumber: 2,
        dayTitle: 'City Tour & Gardens by the Bay',
        dayDescription: 'Explore Singapore highlights including Merlion Park, Civic District, and Chinatown, followed by the breathtaking Cloud Forest and Flower Dome at Gardens by the Bay.',
        transfers: [
          { serviceType: 'cityTour', routeDescription: 'Half-Day Panoramic City Tour (3 Hours)', time: '09:30' },
          { serviceType: 'interAttraction', routeDescription: 'Hotel to Gardens by the Bay Transfer', time: '14:00' }
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
          { serviceType: 'interAttraction', routeDescription: 'Hotel to Resorts World Sentosa Transfer', time: '09:30' },
          { serviceType: 'interAttraction', routeDescription: 'Sentosa to Mandai Wildlife Reserve', time: '18:00' }
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
          { serviceType: 'departure', routeDescription: 'Hotel to Changi Airport Departure (Private 13-Seater)', time: '15:00' }
        ],
        attractions: []
      }
    ]
  },
  {
    _id: 'template-2',
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
          { serviceType: 'arrival', routeDescription: 'Changi Airport to Hotel (Private 13-Seater)', time: '13:00' }
        ],
        attractions: []
      },
      {
        dayNumber: 2,
        dayTitle: 'Universal Studios Singapore Full Day',
        dayDescription: 'A full day of excitement at Southeast Asia’s only Universal Studios theme park.',
        transfers: [
          { serviceType: 'interAttraction', routeDescription: 'Hotel to Universal Studios Sentosa', time: '09:30' }
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
          { serviceType: 'interAttraction', routeDescription: 'Hotel to Sentosa Island', time: '10:00' }
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
          { serviceType: 'cityTour', routeDescription: 'Half-Day City Tour & Marina Bay Sands Transfer', time: '10:00' }
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
          { serviceType: 'departure', routeDescription: 'Hotel to Changi Airport Departure (Private 13-Seater)', time: '12:00' }
        ],
        attractions: []
      }
    ]
  },
  {
    _id: 'template-3',
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
          { serviceType: 'arrival', routeDescription: 'Changi Airport to Hotel (Private 13-Seater)', time: '13:00' }
        ],
        attractions: []
      },
      {
        dayNumber: 2,
        dayTitle: 'Gardens by the Bay & City Tour',
        dayDescription: 'Half-day panoramic city tour plus Cloud Forest and Flower Dome.',
        transfers: [
          { serviceType: 'cityTour', routeDescription: 'Half-Day Panoramic City Tour (3 Hours)', time: '09:30' },
          { serviceType: 'interAttraction', routeDescription: 'Hotel to Gardens by the Bay', time: '14:00' }
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
          { serviceType: 'interAttraction', routeDescription: 'Hotel to Resorts World Sentosa', time: '09:30' }
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
          { serviceType: 'interAttraction', routeDescription: 'Singapore Hotel to Johor Bahru Cross-Border Transfer', time: '10:00' }
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
          { serviceType: 'departure', routeDescription: 'Johor Bahru Hotel to Changi Airport Departure', time: '11:00' }
        ],
        attractions: []
      }
    ]
  }
]

export async function GET() {
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
        summary,
        startingPriceSGD,
        termsAndInclusions,
        itinerary
      }`
    )

    const resolveCover = (tmpl: any) => ({
      ...tmpl,
      coverImage: tmpl?.coverImage
        ? imageBuilder.image(tmpl.coverImage).auto('format').width(1000).fit('max').url()
        : (tmpl?.coverImage || null)
    })

    if (Array.isArray(sanityTemplates) && sanityTemplates.length > 0) {
      return NextResponse.json({
        success: true,
        templates: sanityTemplates.map(resolveCover),
        source: 'sanity'
      })
    }

    return NextResponse.json({
      success: true,
      templates: FALLBACK_TEMPLATES,
      source: 'fallback'
    })
  } catch (err: any) {
    console.warn('Failed to fetch readyPackageTemplate from Sanity, using fallback:', err?.message)
    return NextResponse.json({
      success: true,
      templates: FALLBACK_TEMPLATES,
      source: 'fallback_on_error'
    })
  }
}
