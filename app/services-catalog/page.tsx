'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import * as XLSX from 'xlsx'
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

// Fallback items if Sanity b2bServiceMedia is empty
const DEFAULT_MEDIA_ITEMS = [
  // Restaurants
  {
    _id: 'rest-1',
    category: 'restaurant',
    title: 'Jumbo Seafood East Coast',
    subtitle: 'Iconic Singapore Chilli Crab & Seafood',
    destination: 'Singapore',
    cuisineType: 'Seafood / Local Specialty',
    description: 'Renowned award-winning Singaporean dining spot facing the East Coast sea. Famous for Chilli Crab, Black Pepper Crab, and Cereal Prawns. Ideal for FIT and Group dining.',
    coverImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
    features: ['Seafood Specialist', 'Halal Options Available', 'VIP Private Rooms', 'Sea Facing'],
  },
  {
    _id: 'rest-2',
    category: 'restaurant',
    title: 'The Song of India / Royal Indian Dining',
    subtitle: 'Authentic Fine Dining & Buffet',
    destination: 'Singapore',
    cuisineType: 'North & South Indian Fine Dining',
    description: 'Luxurious Indian dining experience catering to Corporate MICE and FIT groups with custom Jain, Veg, and Non-Veg menus.',
    coverImageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop',
    features: ['Strict Pure Veg / Jain Available', 'MICE Group Buffets', 'Central Location'],
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
  const [settings, setSettings] = useState({
    isPageHidden: false,
    hideHotels: false,
    hideAttractions: false,
    hideRestaurants: false,
    hideGuides: false,
    hideTours: false,
    hidePackages: false,
    heroTitle: 'Singapore & Malaysia Destination Services Catalog',
    heroSubtitle: 'Explore our complete inventory of Hotels, Attractions, Dining, Licensed Guides, and Tour Circuits.',
  })

  // Active Category Filter Tab
  const [activeTab, setActiveTab] = useState<'all' | 'hotels' | 'attractions' | 'restaurants' | 'guides' | 'tours' | 'packages'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Data Loading States
  const [loading, setLoading] = useState(true)
  const [hotels, setHotels] = useState<any[]>([])
  const [attractions, setAttractions] = useState<any[]>([])
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [activeMediaModal, setActiveMediaModal] = useState<any | null>(null)
  const [activeAttractionModal, setActiveAttractionModal] = useState<any | null>(null)

  // Fetch Sanity Settings, Google Sheets Hotels, Live Attractions API, and Sanity Media Items
  useEffect(() => {
    loadAllCatalogData()
  }, [])

  const loadAllCatalogData = async () => {
    setLoading(true)

    // 1. Fetch Sanity Settings & Section Toggles
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
        heroSubtitle
      }`)
      if (fetchedSettings) {
        setSettings(prev => ({ ...prev, ...fetchedSettings }))
      }
    } catch (e) {
      console.warn('Using default catalog settings')
    }

    // 2. Fetch Hotels from Google Sheets Workbook (Hotel sheet)
    try {
      const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=xlsx'
      const response = await fetch(sheetUrl)
      if (response.ok) {
        const buffer = await response.arrayBuffer()
        const wb = XLSX.read(buffer, { type: 'array' })
        const hotelSheet = wb.Sheets['Hotel'] || wb.Sheets['HOTEL'] || wb.Sheets['Hotels']
        if (hotelSheet) {
          const rawHotels: any[] = XLSX.utils.sheet_to_json(hotelSheet)
          const parsed = rawHotels.map((h, idx) => ({
            id: `hotel-${idx}`,
            name: h['Hotel Name'] || h['Hotel'] || h['NAME'] || `Partner Hotel ${idx + 1}`,
            star: h['Star Rating'] || h['Star'] || h['Category'] || '4-Star',
            location: h['City'] || h['Location'] || h['Area'] || 'Singapore',
            roomType: h['Room Category'] || h['Room Type'] || 'Deluxe Room',
            amenities: [h['Breakfast'] ? 'Breakfast Included' : 'Buffet Breakfast Available', 'Free Wi-Fi', 'Swimming Pool'].filter(Boolean)
          }))
          setHotels(parsed)
        }
      }
    } catch (e) {
      console.warn('Failed to load Google Sheets hotel list')
    }

    // 3. Fetch Live Attractions from API (INFORMATIONAL ONLY MODE)
    try {
      const res = await fetch('/api/attractions-live')
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.tickets)) {
          setAttractions(data.tickets)
        }
      }
    } catch (e) {
      console.warn('Failed to load live attractions')
    }

    // 4. Fetch Sanity b2bServiceMedia items (resolving direct uploaded files and image assets)
    try {
      const fetchedMedia = await client.fetch(`*[_type == "b2bServiceMedia"]{
        _id,
        category,
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
        cuisineType
      }`)
      
      if (fetchedMedia && fetchedMedia.length > 0) {
        const normalized = fetchedMedia.map((m: any) => ({
          ...m,
          coverImageUrl: m.coverImageFile || m.coverImageUrl,
          videoUrl: m.videoFileUrl || m.videoUrl,
        }))
        setMediaItems([...normalized, ...DEFAULT_MEDIA_ITEMS])
      } else {
        setMediaItems(DEFAULT_MEDIA_ITEMS)
      }
    } catch (e) {
      setMediaItems(DEFAULT_MEDIA_ITEMS)
    }

    setLoading(false)
  }

  // Filtered List computations based on activeTab & searchQuery
  const filteredHotels = useMemo(() => {
    if (settings.hideHotels) return []
    const q = searchQuery.toLowerCase().trim()
    return hotels.filter(h => !q || h.name.toLowerCase().includes(q) || h.location.toLowerCase().includes(q))
  }, [hotels, searchQuery, settings.hideHotels])

  const filteredAttractions = useMemo(() => {
    if (settings.hideAttractions) return []
    const q = searchQuery.toLowerCase().trim()
    return attractions.filter(a => !q || a.name.toLowerCase().includes(q) || (a.category || '').toLowerCase().includes(q))
  }, [attractions, searchQuery, settings.hideAttractions])

  const filteredRestaurants = useMemo(() => {
    if (settings.hideRestaurants) return []
    const q = searchQuery.toLowerCase().trim()
    return mediaItems.filter(m => m.category === 'restaurant' && (!q || m.title.toLowerCase().includes(q) || (m.cuisineType || '').toLowerCase().includes(q)))
  }, [mediaItems, searchQuery, settings.hideRestaurants])

  const filteredGuides = useMemo(() => {
    if (settings.hideGuides) return []
    const q = searchQuery.toLowerCase().trim()
    return mediaItems.filter(m => m.category === 'guide' && (!q || m.title.toLowerCase().includes(q) || (m.destination || '').toLowerCase().includes(q)))
  }, [mediaItems, searchQuery, settings.hideGuides])

  const filteredTours = useMemo(() => {
    if (settings.hideTours) return []
    const q = searchQuery.toLowerCase().trim()
    return mediaItems.filter(m => m.category === 'tour' && (!q || m.title.toLowerCase().includes(q) || (m.duration || '').toLowerCase().includes(q)))
  }, [mediaItems, searchQuery, settings.hideTours])

  const filteredPackages = useMemo(() => {
    if (settings.hidePackages) return []
    const q = searchQuery.toLowerCase().trim()
    return mediaItems.filter(m => m.category === 'package' && (!q || m.title.toLowerCase().includes(q) || (m.destination || '').toLowerCase().includes(q)))
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
            
            {/* ══ SECTION A: HOTELS (FROM GOOGLE SHEETS) ══ */}
            {(!settings.hideHotels && (activeTab === 'all' || activeTab === 'hotels')) && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={22} color="#0F4C3A" /> Partner Hotels (Singapore & Malaysia)
                  </h2>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, background: '#F1F5F9', padding: '3px 10px', borderRadius: '12px' }}>
                    Synced from Google Sheets Master Inventory
                  </span>
                </div>

                {filteredHotels.length === 0 ? (
                  <div style={{ background: '#FFF', padding: '2rem', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                    No hotels match your query.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    {filteredHotels.map((h) => (
                      <div key={h.id} style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>{h.name}</h3>
                          <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '0.7rem', fontWeight: 800, padding: '2px 7px', borderRadius: '5px', flexShrink: 0 }}>
                            ★ {h.star}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} color="#0F4C3A" /> {h.location}
                        </p>
                        <div style={{ background: '#F8FAFC', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '0.85rem' }}>
                          <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Room Category</span>
                          <strong style={{ fontSize: '0.82rem', color: '#0F172A' }}>{h.roomType}</strong>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                          {(h.amenities || []).map((am: string, i: number) => (
                            <span key={i} style={{ background: '#ECFDF5', color: '#047857', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>✓ {am}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ══ SECTION B: ATTRACTIONS (LIVE SUPPLIER API - INFORMATIONAL ONLY NO BOOKING/PRICE) ══ */}
            {(!settings.hideAttractions && (activeTab === 'all' || activeTab === 'attractions')) && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Compass size={22} color="#0F4C3A" /> Live Attraction Inventory (Informational Catalogue)
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, fontWeight: 600 }}>
                      ℹ️ Informational Showcase only. Direct booking actions and retail pricing are disabled in this section.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 800, background: '#DCFCE7', padding: '3px 10px', borderRadius: '12px' }}>
                    🟢 Live Supplier API Connected
                  </span>
                </div>

                {filteredAttractions.length === 0 ? (
                  <div style={{ background: '#FFF', padding: '2rem', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                    No attractions match your query.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    {filteredAttractions.map((a) => (
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
                            <span style={{ color: '#0F4C3A', fontWeight: 800 }}>ℹ️ Catalogue Info Only</span>
                          </div>
                        </div>
                      </div>
                    ))}
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

            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 900, color: '#0F4C3A' }}>{activeMediaModal.title}</h3>
            <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>📍 {activeMediaModal.destination}</p>

            {activeMediaModal.coverImageUrl && (
              <img src={activeMediaModal.coverImageUrl} alt="" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #E2E8F0' }} />
            )}

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>Overview & Highlights</h4>
              <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                {activeMediaModal.description}
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h5 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#0F4C3A' }}>Key Inclusions & Capabilities</h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {(activeMediaModal.features || []).map((ft: string, idx: number) => (
                  <span key={idx} style={{ background: '#ECFDF5', color: '#047857', padding: '3px 8px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 700 }}>✓ {ft}</span>
                ))}
              </div>
            </div>
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

            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.35rem', fontWeight: 900, color: '#0F4C3A' }}>{activeAttractionModal.name}</h3>

            {/* Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>Attraction Description & Highlights</h4>
              <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                {stripHtml(activeAttractionModal.description) || 'Official attraction details synced from live supplier API.'}
              </p>
            </div>

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
              <div style={{ background: '#FFFBEB', padding: '1rem', borderRadius: '12px', border: '1px solid #FDE68A' }}>
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

