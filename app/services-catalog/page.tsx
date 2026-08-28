'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Building2,
  Compass,
  Utensils,
  UserCheck,
  Map,
  Package,
  Search,
  Sparkles,
  ExternalLink,
  X,
  Play,
  Image as ImageIcon,
  CheckCircle2,
  MapPin,
  Clock,
  Star,
  Info,
  ShieldCheck
} from 'lucide-react'
import { client } from '../../sanity/lib/client'
import AdBanner from '../../components/AdBanner'
import { DEFAULT_HOTELS, cleanHotelName, slugifyHotelName } from '../../utils/hotels'
import { DEFAULT_ATTRACTIONS, slugifyAttractionName } from '../../utils/attractions'

// Helper function to strip raw HTML tags and format clean text
function stripHtml(htmlStr?: string) {
  if (!htmlStr) return ''
  return htmlStr
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<ol[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '')
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim()
}

// Helper function to format YouTube embed URLs
function getYouTubeEmbedUrl(url: string) {
  if (!url) return ''
  if (url.includes('embed/')) return url
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url
}

// Fallback items if Sanity b2bServiceMedia is empty
const DEFAULT_MEDIA_ITEMS: any[] = [
  // ── Partner Hotels Showcase ──
  {
    _id: 'hotel-chancellor',
    category: 'hotel',
    slug: 'hotel-chancellor-orchard',
    title: 'Hotel Chancellor @ Orchard',
    subtitle: 'Prime Orchard Road Shopping Belt · 5 Mins Walk to Somerset MRT (NS23)',
    destination: 'Singapore',
    starRating: '3.5-Star / 4-Star',
    hotelAddress: '28 Cavenagh Road, Orchard / Somerset, Singapore 229635',
    description: 'Centrally located in the prestigious Orchard Road shopping enclave, Hotel Chancellor @ Orchard offers contemporary comfort with unbeatable city access. Featuring a spectacular rooftop outdoor swimming pool overlooking the Somerset skyline, in-room instant hot/cold filtered water dispensers, the all-day dining Bistro @ Chancellor Cafe, and 24-hour reception just 5 minutes walk from Somerset MRT Station (NS23) and Orchard Central.',
    coverImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop'
    ],
    features: ['Rooftop Outdoor Skyline Pool', 'In-Room Filtered Hot/Cold Water Tap', '5 Mins Walk to Somerset MRT', 'Bistro @ Chancellor Buffet', 'Free High-Speed Wi-Fi'],
    mustDoThings: [
      'Relax at the Rooftop Outdoor Swimming Pool with panoramic Orchard skyline views',
      'Enjoy Daily International Buffet Breakfast at Bistro @ Chancellor Cafe',
      'Walk 5 minutes to Orchard Central, 313@Somerset, Takashimaya, and Paragon'
    ],
    timings: 'Check-In: From 3:00 PM | Check-Out: Until 12:00 PM (Noon) | Breakfast: 6:30 AM – 10:00 AM',
    tipsAndTricks: [
      'Walk through the sheltered Cuppage Terrace pathway to Somerset MRT (NS23) in 5 minutes.',
      'Every room has an instant hot/cold purified water tap—super convenient for instant tea and formula milk.'
    ],
    roomCategories: ['Deluxe Queen Room', 'Deluxe Twin Room', 'Premier King Room', 'Family Triple Room with Balcony']
  },
  {
    _id: 'hotel-1',
    category: 'hotel',
    slug: 'hotel-boss-singapore',
    title: 'Hotel Boss Singapore',
    subtitle: 'Victoria Street / Jalan Sultan (Lavender MRT)',
    destination: 'Singapore',
    starRating: '4-Star',
    hotelAddress: '500 Jalan Sultan (Near Lavender & Bugis MRT), Singapore 199020',
    description: 'Centrally located along Victoria Street and Jalan Sultan, Hotel Boss is a premier 4-star destination hotel featuring 1,500 modern guest rooms, an expansive outdoor swimming pool overlooking the city skyline, a 24-hour fitness gym, and an array of halal and international dining options just 5 minutes walk from Lavender and Bugis MRT stations.',
    coverImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop'
    ],
    features: ['Outdoor Skyline Pool', '5 Mins Walk to Lavender MRT', 'Halal-Certified Food Court', '24/7 Gym', 'Free High-Speed Wi-Fi'],
    roomCategories: ['Superior Double Room', 'Premier Queen with Balcony', 'Family Triple / Quad Room']
  },
  {
    _id: 'hotel-2',
    category: 'hotel',
    title: 'V Hotel Lavender',
    subtitle: 'Directly Above Lavender MRT Station (East-West Green Line)',
    destination: 'Singapore',
    starRating: '4-Star',
    hotelAddress: '70 Jellicoe Road (Above Lavender MRT), Singapore 208767',
    description: 'Located directly above Lavender MRT Station with direct train access to Changi Airport and Bugis, V Hotel Lavender is one of Singapore\'s most popular transit and leisure hubs featuring a breezy sky terrace swimming pool, modern minimalist rooms, fitness center, and multi-cuisine food court.',
    coverImageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX9Qz8oM',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop'
    ],
    features: ['Direct Lavender MRT Link', 'Direct Train to Changi Airport', 'Sky Terrace Pool', 'Currency Exchange Desk', '24/7 Concierge'],
    roomCategories: ['Superior Queen Room', 'Premier Twin Room', 'Triple Room']
  },
  {
    _id: 'hotel-3',
    category: 'hotel',
    title: 'Marina Bay Sands Singapore',
    subtitle: 'World-Renowned Integrated Luxury Resort & Sands SkyPark',
    destination: 'Singapore',
    starRating: '5-Star',
    hotelAddress: '10 Bayfront Avenue, Marina Bay, Singapore 018956',
    description: 'World-famous luxury integrated resort featuring the legendary 57th-floor Rooftop Infinity Pool, Sands SkyPark Observation Deck, Michelin-starred dining, The Shoppes luxury promenade, and spacious designer suites overlooking Marina Bay and Gardens by the Bay.',
    coverImageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=t5A5L_e1Q9k',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop'
    ],
    features: ['World-Famous 57F Infinity Pool', 'Sands SkyPark Access', 'Celebrity Chef Dining', 'Direct Bayfront MRT Link', 'Luxury Banyan Tree Spa'],
    roomCategories: ['Deluxe City View', 'Sands Premier Suite', 'Club King with SkyPark Access']
  },
  {
    _id: 'hotel-4',
    category: 'hotel',
    title: 'Village Hotel Bugis by Far East Hospitality',
    subtitle: 'Heritage & Shopping Heart of Arab Street & Bugis',
    destination: 'Singapore',
    starRating: '4-Star',
    hotelAddress: '390 Victoria Street, Bugis, Singapore 188061',
    description: 'Set in the cultural and shopping haven of Arab Street, Haji Lane, and Bugis Junction, Village Hotel Bugis features spacious family rooms, outdoor swimming pool, halal-certified international buffet dining at The Landmark, and effortless train connectivity.',
    coverImageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop'
    ],
    features: ['Arab Street & Haji Lane Location', 'Halal Buffet Dining', 'Spacious Family Rooms', 'Bugis MRT Station (5 mins)'],
    roomCategories: ['Superior Room', 'Deluxe Room', 'Family Room with Kids Amenities']
  },
  {
    _id: 'hotel-5',
    category: 'hotel',
    title: 'Grand Copthorne Waterfront Hotel',
    subtitle: 'Scenic Singapore River & Robertson Quay Luxury',
    destination: 'Singapore',
    starRating: '5-Star',
    hotelAddress: '392 Havelock Road, Singapore 169663',
    description: 'Award-winning 5-star riverfront hotel along historical Singapore River and Robertson Quay, offering panoramic river and city skyline vistas, refined Italian and Asian dining, executive club lounge, and resort swimming pool.',
    coverImageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'
    ],
    features: ['Singapore River Views', 'Promenade Waterfront Dining', 'Resort Pool & Jacuzzi', 'Havelock MRT Connection'],
    roomCategories: ['Superior City View', 'Deluxe Waterfront Room', 'Club Executive Suite']
  },
  {
    _id: 'hotel-6',
    category: 'hotel',
    title: 'Berjaya Times Square Hotel Kuala Lumpur',
    subtitle: 'Integrated with Indoor Theme Park & Shopping Hub',
    destination: 'Malaysia',
    starRating: '5-Star',
    hotelAddress: '1 Jalan Imbi, Bukit Bintang, 55100 Kuala Lumpur, Malaysia',
    description: 'Premier Kuala Lumpur hotel integrated with Berjaya Times Square Shopping Mall and Indoor Theme Park, featuring rooftop pool, squash courts, and monorail link right at the doorstep.',
    coverImageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&auto=format&fit=crop',
    features: ['Integrated with Indoor Theme Park', 'Imbi Monorail Station Access', 'Rooftop Swimming Pool', 'Bukit Bintang Golden Triangle'],
    roomCategories: ['Studio Suite', 'Superior 2-Bedroom Suite', 'Club Premier Room']
  },
  // Tour Guides
  {
    _id: 'guide-1',
    category: 'guide',
    title: 'Licensed Singapore English & Hindi STB Guide',
    subtitle: 'Senior STB Certified Destination Specialist',
    destination: 'Singapore',
    spokenLanguages: ['English', 'Hindi', 'Tamil'],
    description: 'Expert STB licensed tour guide with 10+ years experience conducting Heritage, Modern Architecture, and Night Safari orientation tours.',
    coverImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop',
    features: ['STB Certified', 'VIP & Delegation Specialist', 'Customized Itinerary Guide'],
  },
  {
    _id: 'guide-2',
    category: 'guide',
    title: 'Kuala Lumpur & Malacca Heritage Guide',
    subtitle: 'MOTAC Certified Malaysia Tour Guide',
    destination: 'Malaysia',
    spokenLanguages: ['English', 'Malay', 'Mandarin'],
    description: 'Specialist guide for Petronas Towers, Batu Caves, Genting Highlands, and Historic Malacca Dutch Square walking tours.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop',
    features: ['MOTAC Certified', 'Cross-Border Expert', 'Overland Coach Guide'],
  },
  // Tours (2N/3N/4N & City Tours)
  {
    _id: 'tour-1',
    category: 'tour',
    title: '3N/4D Singapore Iconic Highlights & Sentosa Escapes',
    subtitle: 'City Tour + Gardens by the Bay + Universal Studios + Wings of Time',
    destination: 'Singapore',
    duration: '3 Nights / 4 Days',
    description: 'Complete signature Singapore introduction tour featuring City Sightseeing, Civic District, Merlion Park, Gardens by the Bay Domes, and full day at Sentosa Island.',
    coverImageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop',
    features: ['Daily Coach Transfers', 'English/Hindi Guide', 'All Entry Tickets Included'],
  },
  {
    _id: 'tour-2',
    category: 'tour',
    title: '4N/5D Singapore + Genting & KL Overland Expedition',
    subtitle: 'Cross-Border Singapore & Malaysia Deluxe Highway Circuit',
    destination: 'Cross Border',
    duration: '4 Nights / 5 Days',
    description: 'Seamless cross-border circuit spanning Singapore, Tuas Checkpoint, Malacca UNESCO Heritage, Genting Cable Car & Skytropolis, and Kuala Lumpur City Tour.',
    coverImageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&auto=format&fit=crop',
    features: ['VIP MPV / Coach Transfers', 'Border Clearance Support', '24/7 Ground Ops'],
  },
  // Packages
  {
    _id: 'pkg-1',
    category: 'package',
    title: 'Singapore B2B MICE & Incentive Package',
    subtitle: 'Corporate Meetings, Gala Dinners & VIP Transfers',
    destination: 'Singapore',
    duration: '4N/5D Corporate Circuit',
    description: 'Tailored for corporate groups including Marina Bay Sands Convention setup, Night Safari private tram charter, and Sentosa Beach Club Gala.',
    coverImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop',
    features: ['MICE Event Desk', 'Private Gala Venues', 'Dedicated Ops Coordinator'],
  }
]

export default function ServicesCatalogPage() {
  // Sanity Settings & Toggles State
  const [settings, setSettings] = useState<{
    isPageHidden: boolean
    hideHotels: boolean
    hideAttractions: boolean
    hideRestaurants: boolean
    hideGuides: boolean
    hideTours: boolean
    hidePackages: boolean
    heroTitle: string
    heroSubtitle: string
    hiddenHotelNames: string[]
  }>({
    isPageHidden: false,
    hideHotels: false,
    hideAttractions: false,
    hideRestaurants: false,
    hideGuides: false,
    hideTours: false,
    hidePackages: false,
    heroTitle: 'Singapore & Malaysia Destination Services Catalog',
    heroSubtitle: 'Explore our complete inventory of Hotels, Attractions, Dining, Licensed Guides, and Tour Circuits.',
    hiddenHotelNames: []
  })

  // State Stores (Pre-populated with instant defaults for sub-100ms first paint)
  const [attractions, setAttractions] = useState<any[]>([])
  const [mediaItems, setMediaItems] = useState<any[]>(DEFAULT_MEDIA_ITEMS)
  const [loading, setLoading] = useState(false)

  // Interactive UI State
  const [activeTab, setActiveTab] = useState<'all' | 'hotels' | 'attractions' | 'restaurants' | 'guides' | 'tours' | 'packages'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMediaModal, setActiveMediaModal] = useState<any | null>(null)
  const [activeAttractionModal, setActiveAttractionModal] = useState<any | null>(null)

  // Fetch all live data sources in parallel on mount
  useEffect(() => {
    // 1. Instant hydration from persistent storage if available
    try {
      const cached = localStorage.getItem('fw_services_catalog_cache') || sessionStorage.getItem('fw_services_catalog_cache')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.settings) setSettings(parsed.settings)
        if (parsed.attractions?.length) setAttractions(parsed.attractions)
        if (parsed.mediaItems?.length) setMediaItems(parsed.mediaItems)
      }
    } catch (e) {}

    loadAllCatalogData()
  }, [])

  const loadAllCatalogData = async () => {
    // Define individual parallel fetchers
    const fetchSettings = async () => {
      try {
        const fetchedSettings = await client.fetch(`*[_type == "b2bServiceCatalogSettings"][0]{
          isPageHidden,
          hideHotels,
          hideAttractions,
          hideRestaurants,
          hideGuides,
          hideTours,
          hidePackages,
          heroTitle,
          heroSubtitle,
          hiddenHotelNames
        }`)
        if (fetchedSettings) {
          setSettings(prev => ({ ...prev, ...fetchedSettings }))
          return fetchedSettings
        }
      } catch (e) {
        console.warn('Using default catalog settings')
      }
      return null
    }

    const fetchAttractions = async () => {
      try {
        const res = await fetch('/api/attractions-live')
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.tickets)) {
            setAttractions(data.tickets)
            return data.tickets
          }
        }
      } catch (e) {
        console.warn('Failed to load live attractions')
      }
      return null
    }

    const fetchMedia = async () => {
      try {
        const fetchedMedia = await client.fetch(`*[_type == "b2bServiceMedia"]{
          _id,
          category,
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
          spokenLanguages,
          cuisineType,
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
        
        if (fetchedMedia && fetchedMedia.length > 0) {
          const normalized = fetchedMedia.map((m: any) => ({
            ...m,
            coverImageUrl: m.coverImageFile || m.coverImageUrl,
            videoUrl: m.videoFileUrl || m.videoUrl,
          }))
          const userCategories = new Set(normalized.map((x: any) => x.category))
          const remainingFallbacks = DEFAULT_MEDIA_ITEMS.filter((d: any) => !userCategories.has(d.category))
          const finalMedia = [...normalized, ...remainingFallbacks]
          setMediaItems(finalMedia)
          return finalMedia
        } else {
          setMediaItems(DEFAULT_MEDIA_ITEMS)
          return DEFAULT_MEDIA_ITEMS
        }
      } catch (e) {
        setMediaItems(DEFAULT_MEDIA_ITEMS)
        return DEFAULT_MEDIA_ITEMS
      }
    }

    // Execute queries concurrently in parallel
    const [settledSettings, settledAttractions, settledMedia] = await Promise.allSettled([
      fetchSettings(),
      fetchAttractions(),
      fetchMedia()
    ])

    // Save snapshot to localStorage for instant sub-second render on subsequent visits
    try {
      const cachePayload = {
        settings: settledSettings.status === 'fulfilled' ? settledSettings.value : null,
        attractions: settledAttractions.status === 'fulfilled' ? settledAttractions.value : null,
        mediaItems: settledMedia.status === 'fulfilled' ? settledMedia.value : null,
        timestamp: Date.now()
      }
      localStorage.setItem('fw_services_catalog_cache', JSON.stringify(cachePayload))
      sessionStorage.setItem('fw_services_catalog_cache', JSON.stringify(cachePayload))
    } catch (e) {}

    setLoading(false)
  }

  // Filtered List computations based on activeTab & searchQuery
  const filteredHotels = useMemo(() => {
    if (settings.hideHotels) return []
    const q = searchQuery.toLowerCase().trim()
    const hiddenNames = (settings.hiddenHotelNames || []).map(n => n.toLowerCase().trim()).filter(Boolean)

    return mediaItems.filter(m => {
      if (m.category !== 'hotel' || m.isDisplayed === false) return false
      const titleLower = (m.title || '').toLowerCase().trim()
      const destinationLower = (m.destination || '').toLowerCase().trim()

      if (hiddenNames.some(hn => titleLower.includes(hn) || hn.includes(titleLower))) {
        return false
      }

      return !q || titleLower.includes(q) || destinationLower.includes(q)
    })
  }, [mediaItems, searchQuery, settings.hideHotels, settings.hiddenHotelNames])

  const filteredAttractions = useMemo(() => {
    if (settings.hideAttractions) return []
    const q = searchQuery.toLowerCase().trim()
    return attractions.filter(a => !q || a.name.toLowerCase().includes(q) || (a.category || '').toLowerCase().includes(q))
  }, [attractions, searchQuery, settings.hideAttractions])

  const filteredRestaurants = useMemo(() => {
    if (settings.hideRestaurants) return []
    const q = searchQuery.toLowerCase().trim()
    return mediaItems.filter(m => m.category === 'restaurant' && m.isDisplayed !== false && (!q || m.title.toLowerCase().includes(q) || (m.cuisineType || '').toLowerCase().includes(q)))
  }, [mediaItems, searchQuery, settings.hideRestaurants])

  const filteredGuides = useMemo(() => {
    if (settings.hideGuides) return []
    const q = searchQuery.toLowerCase().trim()
    return mediaItems.filter(m => m.category === 'guide' && m.isDisplayed !== false && (!q || m.title.toLowerCase().includes(q) || (m.destination || '').toLowerCase().includes(q)))
  }, [mediaItems, searchQuery, settings.hideGuides])

  const filteredTours = useMemo(() => {
    if (settings.hideTours) return []
    const q = searchQuery.toLowerCase().trim()
    return mediaItems.filter(m => m.category === 'tour' && m.isDisplayed !== false && (!q || m.title.toLowerCase().includes(q) || (m.duration || '').toLowerCase().includes(q)))
  }, [mediaItems, searchQuery, settings.hideTours])

  const filteredPackages = useMemo(() => {
    if (settings.hidePackages) return []
    const q = searchQuery.toLowerCase().trim()
    return mediaItems.filter(m => m.category === 'package' && m.isDisplayed !== false && (!q || m.title.toLowerCase().includes(q) || (m.destination || '').toLowerCase().includes(q)))
  }, [mediaItems, searchQuery, settings.hidePackages])

  // Total Item Counts for Badges
  const totalHotelsCount = filteredHotels.length
  const totalAttractionsCount = filteredAttractions.length
  const totalRestaurantsCount = filteredRestaurants.length
  const totalGuidesCount = filteredGuides.length
  const totalToursCount = filteredTours.length
  const totalPackagesCount = filteredPackages.length

  // If entire page is toggled hidden in Sanity
  if (settings.isPageHidden) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#FFF', padding: '3rem 2rem', borderRadius: '16px', border: '1px solid #E2E8F0', maxWidth: '460px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <Building2 size={48} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.5rem' }}>Services Catalog Under Maintenance</h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
            This service showcase catalog is currently hidden by directory administrators. Please check back later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B', paddingBottom: '4rem' }}>
      
      {/* ══ 1. HERO HEADER STRIP ══ */}
      <header style={{ background: 'linear-gradient(135deg, #0F4C3A 0%, #1E1B4B 100%)', color: '#FFF', padding: '2rem 1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.65rem', backdropFilter: 'blur(6px)' }}>
              <Compass size={14} color="#10B981" /> Official Destination Inventory
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.4rem', letterSpacing: '-0.02em', color: '#FFF' }}>
              {settings.heroTitle}
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#E2E8F0', margin: 0, opacity: 0.9, maxWidth: '680px', lineHeight: 1.5 }}>
              {settings.heroSubtitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              href="/packages"
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#FFF', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Package size={15} /> View Packages
            </Link>
            <Link
              href="/agent-portal"
              style={{ background: '#10B981', color: '#FFF', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
            >
              <ShieldCheck size={15} /> Agent Portal
            </Link>
          </div>
        </div>
      </header>

      {/* ══ 2. UNIFIED SEARCH & CATEGORY TAB BAR ══ */}
      <div style={{ maxWidth: '1280px', margin: '1.5rem auto', padding: '0 1.5rem' }}>
        <div style={{ background: '#FFF', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Real-time Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '0 14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
            <Search size={18} color="#0F4C3A" />
            <input
              type="text"
              placeholder="Search hotels, attractions, dining spots, guides, or tours..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', background: 'transparent', border: 'none', padding: '12px 0', outline: 'none', fontSize: '0.9rem', color: '#0F172A', fontWeight: 600 }}
            />
          </div>

          {/* Section Category Tabs (Respects Sanity Individual Hide Toggles) */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            
            <button
              onClick={() => setActiveTab('all')}
              style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', background: activeTab === 'all' ? '#0F4C3A' : '#F1F5F9', color: activeTab === 'all' ? '#FFF' : '#475569', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🌐 All Services</span>
            </button>

            {!settings.hideHotels && (
              <button
                onClick={() => setActiveTab('hotels')}
                style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', background: activeTab === 'hotels' ? '#0F4C3A' : '#F1F5F9', color: activeTab === 'hotels' ? '#FFF' : '#475569', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Building2 size={15} /> Hotels ({totalHotelsCount})
              </button>
            )}

            {!settings.hideAttractions && (
              <button
                onClick={() => setActiveTab('attractions')}
                style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', background: activeTab === 'attractions' ? '#0F4C3A' : '#F1F5F9', color: activeTab === 'attractions' ? '#FFF' : '#475569', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Compass size={15} /> Attractions ({totalAttractionsCount})
              </button>
            )}

            {!settings.hideRestaurants && (
              <button
                onClick={() => setActiveTab('restaurants')}
                style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', background: activeTab === 'restaurants' ? '#0F4C3A' : '#F1F5F9', color: activeTab === 'restaurants' ? '#FFF' : '#475569', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Utensils size={15} /> Restaurants ({totalRestaurantsCount})
              </button>
            )}

            {!settings.hideGuides && (
              <button
                onClick={() => setActiveTab('guides')}
                style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', background: activeTab === 'guides' ? '#0F4C3A' : '#F1F5F9', color: activeTab === 'guides' ? '#FFF' : '#475569', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <UserCheck size={15} /> Tour Guides ({totalGuidesCount})
              </button>
            )}

            {!settings.hideTours && (
              <button
                onClick={() => setActiveTab('tours')}
                style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', background: activeTab === 'tours' ? '#0F4C3A' : '#F1F5F9', color: activeTab === 'tours' ? '#FFF' : '#475569', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Map size={15} /> Tours (2N/3N/4N) ({totalToursCount})
              </button>
            )}

            {!settings.hidePackages && (
              <button
                onClick={() => setActiveTab('packages')}
                style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', background: activeTab === 'packages' ? '#0F4C3A' : '#F1F5F9', color: activeTab === 'packages' ? '#FFF' : '#475569', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Package size={15} /> Packages ({totalPackagesCount})
              </button>
            )}

          </div>

        </div>
      </div>

      {/* ══ 3. SHOWCASE INVENTORY CONTENT GRID ══ */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <Sparkles className="animate-spin" size={32} color="#0F4C3A" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 700, color: '#64748B', fontSize: '0.95rem' }}>Loading Singapore & Malaysia Destination Inventory...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* ══ SECTION A: HOTELS (FROM GOOGLE SHEETS & SANITY MEDIA) ══ */}
            {(!settings.hideHotels && (activeTab === 'all' || activeTab === 'hotels')) && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={22} color="#0F4C3A" /> Partner Hotels (Singapore & Malaysia)
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, fontWeight: 600 }}>
                      📸 Click any hotel to inspect photo galleries, room amenities, and video walkthrough tours.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, background: '#F1F5F9', padding: '3px 10px', borderRadius: '12px' }}>
                    Managed via Sanity CMS
                  </span>
                </div>

                {filteredHotels.length === 0 ? (
                  <div style={{ background: '#FFF', padding: '2rem', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                    No hotels match your query.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {filteredHotels.map((h) => {
                      const finalSlug = h.slug || slugifyHotelName(h.title)
                      const finalTitle = h.title
                      const targetStar = h.starRating || '4-Star'
                      const coverImg = h.coverImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'
                      const roomTypeDisplay = (h.roomCategories && h.roomCategories.length > 0) ? h.roomCategories[0] : 'Deluxe Room / Suites'

                      const modalData = {
                        ...h,
                        slug: finalSlug,
                        title: finalTitle,
                        starRating: targetStar,
                        destination: h.destination || 'Singapore',
                        features: h.features || ['Breakfast Included', 'Free Wi-Fi', 'Swimming Pool'],
                        hotelAddress: h.hotelAddress || `${h.destination || 'Singapore'}`
                      }

                      return (
                        <div 
                          key={h._id || finalSlug} 
                          onClick={() => setActiveMediaModal(modalData)}
                          style={{ 
                            background: '#FFF', 
                            borderRadius: '14px', 
                            border: '1px solid #E2E8F0', 
                            overflow: 'hidden',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.04)', 
                            display: 'flex', 
                            flexDirection: 'column',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                          }}
                        >
                          {/* Hotel Card Image Banner */}
                          <div style={{ height: '140px', background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.65)), url(${coverImg})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ background: 'rgba(15,23,42,0.8)', color: '#FFF', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>
                                <MapPin size={11} style={{ display: 'inline', marginRight: '3px' }} /> {h.destination || 'Singapore'}
                              </span>
                              <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '0.7rem', fontWeight: 800, padding: '2px 7px', borderRadius: '5px' }}>
                                ★ {targetStar}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                              <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#FFF', margin: 0, lineHeight: 1.25, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                                {finalTitle}
                              </h3>
                              {h.videoUrl && (
                                <span style={{ background: 'rgba(239, 68, 68, 0.9)', color: '#FFF', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Play size={10} fill="#FFF" /> Video
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Hotel Details Body */}
                          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ background: '#F8FAFC', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Room Categories</span>
                                <strong style={{ fontSize: '0.8rem', color: '#0F172A' }}>{roomTypeDisplay}</strong>
                              </div>
                              <Link
                                href={`/services-catalog/hotels/${finalSlug}`}
                                onClick={e => e.stopPropagation()}
                                style={{
                                  fontSize: '0.72rem',
                                  color: '#0F4C3A',
                                  fontWeight: 800,
                                  background: '#ECFDF5',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <span>Page</span> →
                              </Link>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                              {(h.features || []).slice(0, 3).map((am: string, i: number) => (
                                <span key={i} style={{ background: '#F1F5F9', color: '#334155', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>✓ {am}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            {/* AdSense Unit */}
            <AdBanner slotId="services_catalog_mid_slot" category="b2b" style={{ margin: '2rem 0' }} />

            {/* ══ SECTION B: ATTRACTIONS (LIVE SUPPLIER API + FEATURED SPOTLIGHT) ══ */}
            {(!settings.hideAttractions && (activeTab === 'all' || activeTab === 'attractions')) && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Compass size={22} color="#0F4C3A" /> Featured Attractions & Live Ticket Inventory
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, fontWeight: 600 }}>
                      ✨ Explore must-do rides, operating hours, pro-tips, and official visitor apps.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 800, background: '#DCFCE7', padding: '3px 10px', borderRadius: '12px' }}>
                    🟢 Live Supplier API Connected
                  </span>
                </div>

                {/* ── FEATURED ATTRACTIONS SPOTLIGHT ROW ── */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1rem' }}>⭐</span>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F4C3A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Flagship Featured Attractions
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {DEFAULT_ATTRACTIONS.map((fa) => (
                      <div
                        key={fa._id}
                        onClick={() => setActiveAttractionModal(fa)}
                        style={{
                          background: '#FFFFFF',
                          borderRadius: '14px',
                          border: '2px solid #BBF7D0',
                          overflow: 'hidden',
                          boxShadow: '0 4px 15px rgba(16,185,129,0.08)',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                        }}
                      >
                        <div style={{ height: '140px', background: `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.75)), url(${fa.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ background: '#0F4C3A', color: '#FFF', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                              ★ Featured Spotlight
                            </span>
                            <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '0.7rem', fontWeight: 800, padding: '2px 7px', borderRadius: '5px' }}>
                              ★ {fa.starRating}
                            </span>
                          </div>
                          <div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#FFF', margin: '0 0 2px', lineHeight: 1.2, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                              {fa.name}
                            </h4>
                            <span style={{ fontSize: '0.72rem', color: '#E2E8F0', fontWeight: 600 }}>⏱️ {fa.duration}</span>
                          </div>
                        </div>

                        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 0.85rem', lineHeight: 1.45 }}>
                            {fa.description.slice(0, 110)}...
                          </p>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem' }}>
                            {(fa.features || []).slice(0, 2).map((ft, i) => (
                              <span key={i} style={{ background: '#ECFDF5', color: '#047857', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                                ✓ {ft}
                              </span>
                            ))}
                            {fa.appDetails && (
                              <span style={{ background: '#EFF6FF', color: '#2563EB', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                                📱 App Guide
                              </span>
                            )}
                          </div>

                          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid #F1F5F9' }}>
                            <span style={{ fontSize: '0.72rem', color: '#0F4C3A', fontWeight: 700 }}>Full Guide & App</span>
                            <Link
                              href={`/services-catalog/attractions/${fa.slug}`}
                              onClick={e => e.stopPropagation()}
                              style={{
                                fontSize: '0.75rem',
                                color: '#FFF',
                                fontWeight: 800,
                                background: '#0F4C3A',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>View Page</span> →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── ALL LIVE ATTRACTIONS INVENTORY GRID ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1rem' }}>📋</span>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#475569', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Complete Live Attraction Catalog ({filteredAttractions.length})
                  </h3>
                </div>

                {filteredAttractions.length === 0 ? (
                  <div style={{ background: '#FFF', padding: '2rem', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                    No attractions match your query.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    {filteredAttractions.map((a) => {
                      const attractionSlug = slugifyAttractionName(a.name)
                      return (
                        <div key={a.id} onClick={() => setActiveAttractionModal(a)} style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                          <div style={{ height: '140px', background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${a.imageUrl || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <span style={{ background: 'rgba(15,23,42,0.75)', color: '#FFF', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backdropFilter: 'blur(4px)', alignSelf: 'flex-start' }}>
                              📍 {a.category || 'Singapore Attraction'}
                            </span>
                            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#FFF', margin: 0, lineHeight: 1.25, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                              {a.name}
                            </h3>
                          </div>

                          <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 0.75rem', lineHeight: 1.45 }}>
                              {a.description ? (stripHtml(a.description).length > 110 ? `${stripHtml(a.description).substring(0, 110)}...` : stripHtml(a.description)) : 'Official Singapore & Malaysia attraction experience.'}
                            </p>

                            <div style={{ marginTop: 'auto', background: '#F8FAFC', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.72rem', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span><strong>Validity:</strong> {a.validity || 'Instant eVoucher'}</span>
                              <Link
                                href={`/services-catalog/attractions/${attractionSlug}`}
                                onClick={e => e.stopPropagation()}
                                style={{ color: '#0F4C3A', fontWeight: 800, textDecoration: 'none' }}
                              >
                                <span>Details</span> →
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ══ SECTION C: RESTAURANTS (PHOTO/VIDEO SHOWCASE) ══ */}
            {(!settings.hideRestaurants && (activeTab === 'all' || activeTab === 'restaurants')) && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Utensils size={22} color="#0F4C3A" /> Partner Restaurants & Dining ({filteredRestaurants.length})
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {filteredRestaurants.map((r) => (
                    <div key={r._id} onClick={() => setActiveMediaModal(r)} style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: '150px', background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${r.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ background: '#0F4C3A', color: '#FFF', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                          🍽️ {r.cuisineType || r.destination}
                        </span>
                        {r.videoUrl && (
                          <span style={{ background: '#EF4444', color: '#FFF', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Play size={10} fill="#FFF" /> Video Tour
                          </span>
                        )}
                      </div>

                      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', margin: '0 0 3px' }}>{r.title}</h3>
                        <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.75rem', fontWeight: 600 }}>{r.subtitle || r.destination}</p>
                        <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.85rem', lineHeight: 1.45 }}>{r.description}</p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                          {(r.features || []).map((ft: string, idx: number) => (
                            <span key={idx} style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>✓ {ft}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ══ SECTION D: TOUR GUIDES (PROFILES & LANGUAGES) ══ */}
            {(!settings.hideGuides && (activeTab === 'all' || activeTab === 'guides')) && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserCheck size={22} color="#0F4C3A" /> Licensed Tour Guides ({filteredGuides.length})
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {filteredGuides.map((g) => (
                    <div key={g._id} onClick={() => setActiveMediaModal(g)} style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: '150px', background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${g.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ background: '#D97706', color: '#FFF', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                          🚩 Licensed Guide
                        </span>
                      </div>

                      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', margin: '0 0 3px' }}>{g.title}</h3>
                        <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.75rem', fontWeight: 600 }}>📍 {g.destination}</p>
                        <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.85rem', lineHeight: 1.45 }}>{g.description}</p>
                        
                        <div style={{ background: '#F8FAFC', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginTop: 'auto' }}>
                          <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Languages Spoken</span>
                          <strong style={{ fontSize: '0.8rem', color: '#0F4C3A' }}>🗣️ {(g.spokenLanguages || ['English']).join(', ')}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ══ SECTION E: TOURS (2N / 3N / 4N & CITY TOURS) ══ */}
            {(!settings.hideTours && (activeTab === 'all' || activeTab === 'tours')) && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Map size={22} color="#0F4C3A" /> Tours (2N/3N/4N & City Sightseeing) ({filteredTours.length})
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {filteredTours.map((t) => (
                    <div key={t._id} onClick={() => setActiveMediaModal(t)} style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: '160px', background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.65)), url(${t.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ background: '#1D4ED8', color: '#FFF', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                          🚍 {t.duration || '2N/3D Tour'}
                        </span>
                      </div>

                      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', margin: '0 0 4px', lineHeight: 1.3 }}>{t.title}</h3>
                        <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.75rem', fontWeight: 600 }}>📍 {t.destination}</p>
                        <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.85rem', lineHeight: 1.45 }}>{t.description}</p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                          {(t.features || []).map((ft: string, idx: number) => (
                            <span key={idx} style={{ background: '#ECFDF5', color: '#047857', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>✓ {ft}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ══ SECTION F: B2B PACKAGES ══ */}
            {(!settings.hidePackages && (activeTab === 'all' || activeTab === 'packages')) && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={22} color="#0F4C3A" /> B2B Signature Packages ({filteredPackages.length})
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {filteredPackages.map((p) => (
                    <div key={p._id} onClick={() => setActiveMediaModal(p)} style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: '160px', background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.65)), url(${p.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ background: '#0F4C3A', color: '#FFF', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                          📦 B2B Package Circuit
                        </span>
                      </div>

                      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', margin: '0 0 4px', lineHeight: 1.3 }}>{p.title}</h3>
                        <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.75rem', fontWeight: 600 }}>{p.duration || 'Multi-day Circuit'}</p>
                        <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.85rem', lineHeight: 1.45 }}>{p.description}</p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                          {(p.features || []).map((ft: string, idx: number) => (
                            <span key={idx} style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>✓ {ft}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </main>

      {/* ══ ITEM DETAIL & MEDIA GALLERY POPUP MODAL ══ */}
      {activeMediaModal && (
        <div
          onClick={() => setActiveMediaModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '640px',
              maxWidth: '92vw',
              maxHeight: '88vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '1.5rem',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid #E2E8F0'
            }}
          >
            <button onClick={() => setActiveMediaModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: '#F1F5F9', border: 'none', color: '#64748B', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '0.35rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0F4C3A' }}>{activeMediaModal.title}</h3>
              {activeMediaModal.starRating && (
                <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '0.75rem', fontWeight: 800, padding: '3px 9px', borderRadius: '6px', flexShrink: 0 }}>
                  ★ {activeMediaModal.starRating}
                </span>
              )}
            </div>

            <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
              📍 {activeMediaModal.hotelAddress || activeMediaModal.subtitle || activeMediaModal.destination}
            </p>

            {/* Cover Image */}
            {activeMediaModal.coverImageUrl && !activeMediaModal.videoUrl && (
              <img src={activeMediaModal.coverImageUrl} alt="" style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #E2E8F0' }} />
            )}

            {/* Video Showcase Player */}
            {activeMediaModal.videoUrl && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Play size={16} color="#EF4444" fill="#EF4444" /> Video Showcase Tour
                </h4>
                {activeMediaModal.videoUrl.includes('youtube.com') || activeMediaModal.videoUrl.includes('youtu.be') ? (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <iframe
                      src={getYouTubeEmbedUrl(activeMediaModal.videoUrl)}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video
                    controls
                    autoPlay
                    muted
                    playsInline
                    src={activeMediaModal.videoUrl}
                    style={{ width: '100%', maxHeight: '360px', borderRadius: '12px', background: '#000', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  />
                )}
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>Overview & Highlights</h4>
              <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                {activeMediaModal.description}
              </p>
            </div>

            {/* Photo Gallery Grid */}
            {((activeMediaModal.galleryUploaded && activeMediaModal.galleryUploaded.length > 0) || (activeMediaModal.galleryImageUrls && activeMediaModal.galleryImageUrls.length > 0)) && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={16} color="#0F4C3A" /> Photo Gallery
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                  {(activeMediaModal.galleryUploaded || activeMediaModal.galleryImageUrls || []).map((imgUrl: string, idx: number) => (
                    <img key={idx} src={imgUrl} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                  ))}
                </div>
              </div>
            )}

            {/* Room Categories (For Hotels) */}
            {activeMediaModal.roomCategories && activeMediaModal.roomCategories.length > 0 && (
              <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '10px', border: '1px solid #BBF7D0', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <h5 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#166534' }}>Available Room Categories & Suites</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {activeMediaModal.roomCategories.map((rc: string, idx: number) => (
                    <span key={idx} style={{ background: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 700 }}>🛏️ {rc}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: activeMediaModal.slug ? '1rem' : '0' }}>
              <h5 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#0F4C3A' }}>Key Inclusions & Amenities</h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {(activeMediaModal.features || []).map((ft: string, idx: number) => (
                  <span key={idx} style={{ background: '#ECFDF5', color: '#047857', padding: '3px 8px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 700 }}>✓ {ft}</span>
                ))}
              </div>
            </div>

            {activeMediaModal.slug && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link
                  href={`/services-catalog/hotels/${activeMediaModal.slug}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '8px',
                    background: '#0F4C3A',
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(15,76,58,0.2)'
                  }}
                >
                  <span>Open Full Hotel Page & Gallery</span> →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ══ ATTRACTION FULL DETAILS POPUP MODAL (INFORMATIONAL MODE NO PRICES/BOOKING) ══ */}
      {activeAttractionModal && (
        <div
          onClick={() => setActiveAttractionModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '720px',
              maxWidth: '94vw',
              maxHeight: '88vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '1.5rem',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid #E2E8F0'
            }}
          >
            <button onClick={() => setActiveAttractionModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: '#F1F5F9', border: 'none', color: '#64748B', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>

            {/* Modal Cover Image */}
            {activeAttractionModal.imageUrl && (
              <img src={activeAttractionModal.imageUrl} alt="" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #E2E8F0' }} />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
              <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                📍 {activeAttractionModal.category || 'Singapore Attraction'}
              </span>
              <span style={{ background: '#F1F5F9', color: '#475569', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                ⏳ Validity: {activeAttractionModal.validity || 'Instant eVoucher'}
              </span>
            </div>

            <h3 style={{ margin: '0 0 0.6rem', fontSize: '1.35rem', fontWeight: 900, color: '#0F4C3A' }}>{activeAttractionModal.name}</h3>

            {/* Direct Link to Full Experience & App Guide (Top Placement) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <Link
                href={`/services-catalog/attractions/${activeAttractionModal.slug || slugifyAttractionName(activeAttractionModal.name)}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.65rem 1.15rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0F4C3A 0%, #166534 100%)',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  boxShadow: '0 3px 10px rgba(15,76,58,0.25)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <span>Open Full Experience Guide & App Download</span> →
              </Link>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>Attraction Description & Highlights</h4>
              <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                {stripHtml(activeAttractionModal.description) || 'Official attraction details synced from live supplier API.'}
              </p>
            </div>

            {/* Must-Do Things & Highlights */}
            {activeAttractionModal.mustDoThings && activeAttractionModal.mustDoThings.length > 0 && (
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', fontWeight: 800, color: '#0F4C3A' }}>
                  ✨ Must-Do Highlights & Signature Rides
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {activeAttractionModal.mustDoThings.slice(0, 4).map((item: string, idx: number) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.8rem', color: '#1E293B' }}>
                      <span style={{ color: '#0F4C3A', fontWeight: 800 }}>•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Operating Hours & Timings */}
            {activeAttractionModal.timings && (
              <div style={{ background: '#F0FDF4', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #BBF7D0', marginBottom: '1.25rem' }}>
                <strong style={{ fontSize: '0.82rem', color: '#166534', display: 'block' }}>
                  🕒 Operating Hours & Timings:
                </strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#15803D' }}>
                  {activeAttractionModal.timings}
                </p>
              </div>
            )}

            {/* Sub-tickets / Options Available (INFORMATIONAL MODE WITHOUT PRICES) */}
            {Array.isArray(activeAttractionModal.subTickets) && activeAttractionModal.subTickets.length > 0 && (
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.65rem', fontSize: '0.88rem', fontWeight: 800, color: '#0F4C3A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🎫 Available Ticket Options & Variants ({activeAttractionModal.subTickets.length})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {activeAttractionModal.subTickets.map((st: any, idx: number) => (
                    <div key={st.skuId || idx} style={{ background: '#FFF', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.82rem', color: '#0F172A', display: 'block' }}>{st.typeTitle}</strong>
                        {st.validityPeriodText && <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Validity: {st.validityPeriodText}</span>}
                      </div>
                      <span style={{ background: '#ECFDF5', color: '#047857', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '5px' }}>
                        {st.bookingType || 'Available Option'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            {activeAttractionModal.tnc && (
              <div style={{ background: '#FFFBEB', padding: '1rem', borderRadius: '12px', border: '1px solid #FDE68A', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.85rem', fontWeight: 800, color: '#92400E' }}>⚠️ Terms & Entry Guidelines</h4>
                <p style={{ fontSize: '0.78rem', color: '#78350F', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {stripHtml(activeAttractionModal.tnc)}
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}

