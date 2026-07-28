'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import IciciQrModal from '../../components/IciciQrModal'

interface Attraction {
  id: string
  name: string
  adultPrice: number
  childPrice: number
}

interface SanityBundle {
  _id: string
  label: string
  emoji: string
  description: string
  adultQty: number
  childQty: number
  attractionKeywords: string[]
}

interface SanityMeta {
  _id: string
  name?: string
  matchKeyword: string
  photoUrl: string | null
  officialWebsite: string | null
  shortDescription: string | null
  openingHours: string | null
  rating: number | null
  category: string | null
  isPopular: boolean
  isTrending: boolean
  longDescription?: string | null
  highlights?: string[] | null
  tips?: string | null
  duration?: string | null
  location?: string | null
  ageRecommendation?: string | null
}

type QuantityState = Record<string, { adult: number; child: number }>
type DateState = Record<string, string>

// ─── Static Fallback Data ─────────────────────────────────────────────────────

const STATIC_BUNDLES = [
  { _id: 'b1', label: 'Best 3-Day Combo', emoji: '🏆', description: 'The top highlights — Gardens, Night Safari & Universal Studios', adultQty: 2, childQty: 0, attractionKeywords: ['gardens', 'night safari', 'universal'] },
  { _id: 'b2', label: 'Family Pack', emoji: '👨‍👩‍👧‍👦', description: 'Zoo, Bird Paradise, Night Safari & Madame Tussauds', adultQty: 2, childQty: 2, attractionKeywords: ['zoo', 'bird paradise', 'night safari', 'tussauds'] },
  { _id: 'b3', label: 'Couple Pack', emoji: '💑', description: 'Romantic MBS SkyPark, Cable Car & Gardens by the Bay', adultQty: 2, childQty: 0, attractionKeywords: ['sands', 'cable car', 'gardens'] },
]

const CATEGORY_MAP: Record<string, string[]> = {
  'Theme Parks': ['universal', 'luge', 'skyhelix', 'ifly', 'flyer', 'cable car', 'duck'],
  'Nature': ['gardens', 'floral fantasy', 'cloud forest', 'flower dome', 'night safari', 'zoo', 'bird paradise', 'river wonders', 'botanic'],
  'Culture': ['mbs', 'sands', 'science centre', 'omni', 'heritage', 'museum', 'art science', 'national'],
  'Adventure': ['ifly', 'skyhelix', 'luge', 'skyline', 'trick eye', 'duck'],
  'Family': ['universal', 'zoo', 'bird paradise', 'night safari', 'ice cream', 'tussauds', 'aquarium', 'oceanarium', 'jewel', 'canopy'],
}

function getCategory(name: string, meta?: SanityMeta): string {
  if (meta?.category) return meta.category
  const lower = name.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(k => lower.includes(k))) return cat
  }
  return 'Other'
}

const STATIC_RATINGS: Record<string, number> = {
  universal: 4.8, gardens: 4.7, 'night safari': 4.9, zoo: 4.7, 'bird paradise': 4.8,
  'river wonders': 4.6, luge: 4.7, tussauds: 4.5, 'ice cream': 4.6, aquarium: 4.6,
  oceanarium: 4.5, mbs: 4.7, sands: 4.7, ifly: 4.8, flyer: 4.5, 'science centre': 4.4,
  jewel: 4.8, duck: 4.3, skyhelix: 4.6,
}

function getRating(name: string, meta?: SanityMeta): number {
  if (meta?.rating) return meta.rating
  const lower = name.toLowerCase()
  for (const [key, rating] of Object.entries(STATIC_RATINGS)) {
    if (lower.includes(key)) return rating
  }
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return parseFloat((4.2 + (sum % 4) * 0.1).toFixed(1))
}

function getBookedCount(name: string): number {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return 18 + (sum % 63)
}

const STATIC_POPULAR = ['universal', 'night safari', 'gardens', 'bird paradise', 'zoo']
const STATIC_TRENDING = ['skyhelix', 'river wonders', 'ice cream', 'jewel', 'bird paradise']

const PHOTO_MAP: Record<string, string> = {
  universal: 'https://images.unsplash.com/photo-1597239451578-de1e29e0c6d3?auto=format&fit=crop&w=600&q=80',
  gardens: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80',
  'night safari': 'https://images.unsplash.com/photo-1565190466-6f2f3e24d380?auto=format&fit=crop&w=600&q=80',
  zoo: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=600&q=80',
  'bird paradise': 'https://images.unsplash.com/photo-1520638023360-9a99de59e82c?auto=format&fit=crop&w=600&q=80',
  'river wonders': 'https://images.unsplash.com/photo-1581375321224-79da6fd32f6e?auto=format&fit=crop&w=600&q=80',
  luge: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80',
  tussauds: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80',
  'ice cream': 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80',
  aquarium: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80',
  mbs: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80',
  ifly: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
  flyer: 'https://images.unsplash.com/photo-1561470508-fd4df1ed90b2?auto=format&fit=crop&w=600&q=80',
  'science centre': 'https://images.unsplash.com/photo-1532094349884-543559137ea3?auto=format&fit=crop&w=600&q=80',
  jewel: 'https://images.unsplash.com/photo-1600420673889-c6d4f64bdf5c?auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80',
}

function getPhoto(name: string, meta?: SanityMeta): string {
  if (meta?.photoUrl) return meta.photoUrl
  const lower = name.toLowerCase()
  for (const [key, url] of Object.entries(PHOTO_MAP)) {
    if (lower.includes(key)) return url
  }
  return PHOTO_MAP.default
}

const STATIC_DESCRIPTIONS: Record<string, string> = {
  universal: 'World-class theme park with thrilling rides, movie-themed zones, and live shows.',
  gardens: 'Futuristic nature wonderland. Explore the Cloud Forest, Flower Dome, and supertrees.',
  'night safari': 'World\'s first nocturnal zoo. Guided tram rides through tropical rainforest habitats after dark.',
  zoo: 'Award-winning open-concept zoo with over 2,800 animals in naturalistic habitats.',
  'bird paradise': 'Asia\'s largest bird park with over 3,500 birds across 400 species in immersive aviaries.',
  'river wonders': 'Asia\'s first river-themed wildlife park. Home to giant pandas and the Amazon River Quest.',
  luge: 'Thrilling gravity-fuelled karts down scenic Sentosa hillside tracks with ocean views.',
  tussauds: 'Get up close to lifelike wax figures of global celebrities and icons.',
  'ice cream': 'A colourful, Instagrammable experience celebrating the joy of ice cream.',
  aquarium: 'One of the world\'s largest aquariums with 800 marine species.',
  mbs: 'Iconic skypark observation deck 55 floors above Marina Bay.',
  ifly: 'Experience the thrill of indoor skydiving in a vertical wind tunnel.',
  flyer: 'Asia\'s largest observation wheel at 165m with panoramic city views.',
  'science centre': 'Hands-on interactive science museum with 1,000+ exhibits across 14 galleries.',
  jewel: 'Magical garden inside Changi Airport featuring the world\'s tallest indoor waterfall.',
  duck: 'The iconic DUKW amphibious vehicle tour — city on road then splash into Marina Bay!',
}

function getDescription(name: string, meta?: SanityMeta): string {
  if (meta?.shortDescription) return meta.shortDescription
  const lower = name.toLowerCase()
  for (const [key, desc] of Object.entries(STATIC_DESCRIPTIONS)) {
    if (lower.includes(key)) return desc
  }
  return 'A must-visit Singapore attraction offering unforgettable experiences for all ages.'
}

const STATIC_HOURS: Record<string, string> = {
  universal: '10:00 AM – 8:00 PM', gardens: '9:00 AM – 9:00 PM', 'night safari': '6:30 PM – 12:00 AM',
  zoo: '8:30 AM – 6:00 PM', 'bird paradise': '9:00 AM – 6:00 PM', 'river wonders': '10:00 AM – 7:00 PM',
  luge: '10:00 AM – 9:30 PM', tussauds: '10:00 AM – 7:30 PM', 'ice cream': '10:00 AM – 10:00 PM',
  flyer: '8:30 AM – 10:30 PM', jewel: '10:00 AM – 10:00 PM',
}

function getHours(name: string, meta?: SanityMeta): string {
  if (meta?.openingHours) return meta.openingHours
  const lower = name.toLowerCase()
  for (const [key, hrs] of Object.entries(STATIC_HOURS)) {
    if (lower.includes(key)) return hrs
  }
  return 'Check official website for timings'
}

function getOfficialLink(name: string, meta?: SanityMeta): string {
  if (meta?.officialWebsite) return meta.officialWebsite
  const lc = name.toLowerCase()
  if (lc.includes('universal')) return 'https://www.rwsentosa.com/en/attractions/universal-studios-singapore'
  if (lc.includes('gardens') || lc.includes('cloud f') || lc.includes('flower dome')) return 'https://www.gardensbythebay.com.sg/'
  if (lc.includes('night safari')) return 'https://www.mandai.com/en/night-safari.html'
  if (lc.includes('zoo')) return 'https://www.mandai.com/en/singapore-zoo.html'
  if (lc.includes('bird paradise')) return 'https://www.mandai.com/en/bird-paradise.html'
  if (lc.includes('river wonders')) return 'https://www.mandai.com/en/river-wonders.html'
  if (lc.includes('luge')) return 'https://www.skylineluge.com/en/sentosa/'
  if (lc.includes('tussauds')) return 'https://www.madametussauds.com/singapore/'
  if (lc.includes('ice cream') || lc.includes('icecream')) return 'https://www.museumoficecream.com/singapore'
  if (lc.includes('aquarium') || lc.includes('oceanarium')) return 'https://www.rwsentosa.com/en/attractions/sea-aquarium'
  if (lc.includes('mbs') || lc.includes('sands')) return 'https://www.marinabaysands.com/attractions/sands-skypark.html'
  if (lc.includes('ifly')) return 'https://www.iflysingapore.com/'
  if (lc.includes('flyer')) return 'https://www.singaporeflyer.com/'
  if (lc.includes('science centre')) return 'https://www.science.edu.sg/'
  if (lc.includes('jewel')) return 'https://www.jewelchangiairport.com/'
  if (lc.includes('duck')) return 'https://www.ducktours.com.sg/'
  return `https://www.google.com/search?q=${encodeURIComponent(name + ' Singapore official website')}`
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <span style={{ color: '#F59E0B', fontSize: '0.7rem' }}>
      {'★'.repeat(full)}{half ? '½' : ''}
      <span style={{ color: 'var(--text-dark)', opacity: 0.7, marginLeft: '4px', fontSize: '0.72rem', fontWeight: 700 }}>{rating.toFixed(1)}</span>
    </span>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AttractionsForm({
  attractions,
  sanityBundles = [],
  sanityMeta = []
}: {
  attractions: Attraction[]
  sanityBundles?: SanityBundle[]
  sanityMeta?: SanityMeta[]
}) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [quantities, setQuantities] = useState<QuantityState>({})
  const [dates, setDates] = useState<DateState>({})
  const [lightbox, setLightbox] = useState<Attraction | null>(null)
  const [itineraryMode, setItineraryMode] = useState(false)
  const [itinerary, setItinerary] = useState<Record<number, string[]>>({ 1: [], 2: [], 3: [], 4: [] })
  const [activeDay, setActiveDay] = useState(1)
  const [shareToast, setShareToast] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [isIciciModalOpen, setIsIciciModalOpen] = useState(false)
  const [hideIciciAttractions, setHideIciciAttractions] = useState(false)

  // Fetch site settings to check hideIciciAttractions toggle
  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.hideIciciAttractions) {
          setHideIciciAttractions(true)
        }
      })
      .catch(() => {})
  }, [])

  // Undo stack — stores up to 10 previous states
  const historyRef = useRef<Array<{ quantities: QuantityState; dates: DateState }>>([])
  const pushHistory = useCallback((q: QuantityState, d: DateState) => {
    historyRef.current = [...historyRef.current.slice(-9), { quantities: q, dates: d }]
  }, [])

  // ── Load from URL query string ──
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    const d = params.get('d')
    if (q) { try { setQuantities(JSON.parse(decodeURIComponent(q))) } catch {} }
    if (d) { try { setDates(JSON.parse(decodeURIComponent(d))) } catch {} }
  }, [])

  // ── Quantity helpers ──
  const handleQtyChange = (id: string, type: 'adult' | 'child', amount: number) => {
    setQuantities(prev => {
      pushHistory(prev, dates)
      const current = prev[id] || { adult: 0, child: 0 }
      const newVal = Math.max(0, current[type] + amount)
      if (newVal === 0 && current[type === 'adult' ? 'child' : 'adult'] === 0) {
        const next = { ...prev }; delete next[id]; return next
      }
      return { ...prev, [id]: { ...current, [type]: newVal } }
    })
  }

  const handleDateChange = (id: string, value: string) => {
    pushHistory(quantities, dates)
    setDates(prev => ({ ...prev, [id]: value }))
  }

  const removeItem = (id: string) => {
    pushHistory(quantities, dates)
    setQuantities(prev => { const next = { ...prev }; delete next[id]; return next })
    setDates(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  const handleUndo = () => {
    if (historyRef.current.length === 0) return
    const prev = historyRef.current[historyRef.current.length - 1]
    historyRef.current = historyRef.current.slice(0, -1)
    setQuantities(prev.quantities)
    setDates(prev.dates)
  }

  const handleClear = () => {
    if (!clearConfirm) { setClearConfirm(true); setTimeout(() => setClearConfirm(false), 3000); return }
    pushHistory(quantities, dates)
    setQuantities({})
    setDates({})
    setClearConfirm(false)
  }

  // ── Bundles — use Sanity data if available, fall back to static ──
  const bundles = sanityBundles.length > 0 ? sanityBundles : STATIC_BUNDLES

  const applyBundle = (bundle: SanityBundle | typeof STATIC_BUNDLES[0]) => {
    pushHistory(quantities, dates)
    const newQtys: QuantityState = { ...quantities }
    bundle.attractionKeywords.forEach(kw => {
      const match = attractions.find(a => a.name.toLowerCase().includes(kw))
      if (match) newQtys[match.id] = { adult: bundle.adultQty, child: bundle.childQty }
    })
    setQuantities(newQtys)
  }

  // ── Smart Multi-Tier Meta & Photo Matching ──
  const getMeta = (name: string): SanityMeta | undefined => {
    if (!sanityMeta || sanityMeta.length === 0) return undefined
    const normName = name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

    // Tier 1: Direct exact match on Sanity record name
    const exactName = sanityMeta.find(m => m.name && m.name.toLowerCase().trim() === name.toLowerCase().trim())
    if (exactName) return exactName

    // Tier 2: Sanity name inclusion (either direction)
    const nameInclusion = sanityMeta.find(m => {
      if (!m.name) return false
      const normMName = m.name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
      return normName.includes(normMName) || normMName.includes(normName)
    })
    if (nameInclusion) return nameInclusion

    // Tier 3: Match keyword inclusion (stripped of punctuation/hyphens)
    const kwMatch = sanityMeta.find(m => {
      if (!m.matchKeyword) return false
      const normKw = m.matchKeyword.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
      if (!normKw) return false
      return normName.includes(normKw) || normKw.includes(normName)
    })
    if (kwMatch) return kwMatch

    // Tier 4: Significant Word Token Overlap
    const stopWords = new Set(['ticket', 'tickets', 'entry', 'fixed', 'date', 'combo', 'peak', 'non', 'singapore', 'show', 'slot', 'time', 'with', 'for', 'and', 'the', 'pass'])
    const nameTokens = normName.split(' ').filter(w => w.length > 2 && !stopWords.has(w))

    let bestMeta: SanityMeta | undefined = undefined
    let maxScore = 0

    for (const m of sanityMeta) {
      const targetText = `${m.name || ''} ${m.matchKeyword || ''}`.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
      let score = 0
      for (const token of nameTokens) {
        if (targetText.includes(token)) score++
      }
      if (score > maxScore && score >= 1) {
        maxScore = score
        bestMeta = m
      }
    }

    return bestMeta
  }

  // ── Filter ──
  const CATEGORIES = ['All', 'Theme Parks', 'Nature', 'Culture', 'Adventure', 'Family']
  const filtered = attractions.filter(attr => {
    const meta = getMeta(attr.name)
    return attr.name.toLowerCase().includes(search.toLowerCase()) &&
      (activeCategory === 'All' || getCategory(attr.name, meta) === activeCategory)
  })

  // ── Selected items ──
  const selectedItems = Object.entries(quantities).map(([id, qtys]) => {
    const attr = attractions.find(a => a.id === id)
    const adultCost = (attr?.adultPrice || 0) * qtys.adult
    const childCost = (attr?.childPrice || 0) * qtys.child
    const isFixedDate = attr?.name.toLowerCase().includes('fixed date') || false
    return { id, name: attr?.name || '', adult: qtys.adult, child: qtys.child, adultPrice: attr?.adultPrice || 0, childPrice: attr?.childPrice || 0, total: adultCost + childCost, isFixedDate, date: dates[id] || '' }
  }).filter(item => item.adult > 0 || item.child > 0)

  const grandTotal = selectedItems.reduce((sum, item) => sum + item.total, 0)
  const missingDates = selectedItems.filter(item => item.isFixedDate && !item.date)
  const canUndo = historyRef.current.length > 0

  // ── WhatsApp + Email notification ──
  const handleCreateOrder = async () => {
    if (selectedItems.length === 0) { alert('Please select at least one attraction.'); return }
    if (missingDates.length > 0) { alert(`Please select travel dates for:\n${missingDates.map(i => `• ${i.name}`).join('\n')}`); return }

    // Build WhatsApp message
    let message = '🎡 *Flying Wonders — Attractions Quotation*\n\n'
    selectedItems.forEach(item => {
      message += `• *${item.name}*`
      if (item.isFixedDate && item.date) message += ` — Date: ${item.date}`
      message += '\n'
      if (item.adult > 0) message += `  ↳ ${item.adult} Adult${item.adult > 1 ? 's' : ''} @ S$ ${item.adultPrice} ea.\n`
      if (item.child > 0) message += `  ↳ ${item.child} Child${item.child > 1 ? 'ren' : ''} @ S$ ${item.childPrice} ea.\n`
      message += `  Subtotal: S$ ${item.total}\n\n`
    })
    message += `💰 *Grand Total: S$ ${grandTotal}*\n\nKindly confirm availability and proceed with booking. Thank you!`

    // Fire email notification (non-blocking)
    fetch('/api/attractions-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedItems, grandTotal })
    }).catch(() => {}) // Silently ignore errors

    // Open WhatsApp immediately
    window.open(`https://wa.me/6594722830?text=${encodeURIComponent(message)}`, '_blank')
  }

  // ── PDF Print ──
  const handlePrint = () => {
    if (selectedItems.length === 0) { alert('Please select tickets before downloading a quote.'); return }
    window.print()
  }

  // ── Share Quote ──
  const handleShare = () => {
    if (selectedItems.length === 0) { alert('Please select tickets first.'); return }
    const url = new URL(window.location.href)
    url.searchParams.set('q', encodeURIComponent(JSON.stringify(quantities)))
    url.searchParams.set('d', encodeURIComponent(JSON.stringify(dates)))
    navigator.clipboard.writeText(url.toString()).then(() => {
      setShareToast(true)
      setTimeout(() => setShareToast(false), 3000)
    })
  }

  // ── Itinerary ──
  const addToDay = (attrName: string, day: number) => {
    setItinerary(prev => {
      const existing = prev[day] || []
      if (existing.includes(attrName)) return prev
      return { ...prev, [day]: [...existing, attrName] }
    })
  }
  const removeFromDay = (attrName: string, day: number) => {
    setItinerary(prev => ({ ...prev, [day]: (prev[day] || []).filter(a => a !== attrName) }))
  }

  return (
    <>
      {/* ── Print Styles ── */}
      <style>{`
        @media screen { #print-quote { display: none; } }
        .bundle-card:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important; }
        .attr-card:hover { transform: translateY(-2px); }
        .qty-btn:hover { background: var(--gold-accent) !important; color: white !important; }
        .trash-btn { opacity: 0.5; transition: opacity 0.2s, color 0.2s; }
        .trash-btn:hover { opacity: 1; color: var(--crimson-primary) !important; }

        /* ── Mobile Cart Drawer ── */
        .mobile-fab {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 8000;
          background: linear-gradient(135deg, #0F4C3A 0%, #1a6b52 100%);
          color: white;
          padding: 1rem 1.5rem;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          box-shadow: 0 -4px 24px rgba(0,0,0,0.25);
          border-top: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          user-select: none;
        }
        .mobile-fab-pulse {
          animation: fab-pulse 0.4s ease;
        }
        @keyframes fab-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        .cart-drawer-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.55);
          z-index: 9000; display: flex; flex-direction: column; justify-content: flex-end;
        }
        .cart-drawer {
          background: var(--bg-main);
          border-radius: 20px 20px 0 0;
          padding: 1.5rem 1.25rem 2rem;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 -8px 40px rgba(0,0,0,0.2);
          animation: slide-up 0.28s cubic-bezier(0.32,0.72,0,1);
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .cart-drawer-handle {
          width: 40px; height: 4px;
          background: var(--glass-border);
          border-radius: 2px;
          margin: 0 auto 1.25rem;
        }
        /* ── Category pills — horizontal scroll on mobile ── */
        .category-pills-wrap {
          display: flex; gap: 0.5rem; flex-wrap: wrap;
        }
        /* ── Bundles horizontal scroll on mobile ── */
        .bundles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1rem;
        }
        /* ── Compact mobile card ── */
        .attr-card-photo { display: block; }
        .attr-card-compact { display: none; }
        /* ── Desktop sidebar visible, mobile fab hidden ── */
        .desktop-sidebar { display: block; }

        @media (max-width: 768px) {
          .mobile-fab { display: flex; }
          .desktop-sidebar { display: none; }
          .category-pills-wrap {
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 4px;
          }
          .category-pills-wrap::-webkit-scrollbar { display: none; }
          .bundles-grid {
            display: flex;
            overflow-x: auto;
            gap: 0.85rem;
            padding-bottom: 0.5rem;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .bundles-grid::-webkit-scrollbar { display: none; }
          .bundles-grid .bundle-card {
            min-width: 240px;
            scroll-snap-align: start;
            flex-shrink: 0;
          }
          /* Compact horizontal card on mobile */
          .attr-card-photo { display: none !important; }
          .attr-card-compact { display: flex !important; }
          /* Body padding for FAB */
          .attractions-builder-body { padding-bottom: 90px; }
        }
      `}</style>

      {/* ── Print Quote Overlay ── */}
      <div id="print-quote">
        <div style={{ textAlign: 'center', borderBottom: '2px solid #B83A4B', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', color: '#0F4C3A', margin: 0 }}>Flying Wonders</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.85rem' }}>Singapore Attractions Quotation • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#0F4C3A', color: 'white' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Attraction</th>
              <th style={{ padding: '0.75rem' }}>Date</th>
              <th style={{ padding: '0.75rem' }}>Adults</th>
              <th style={{ padding: '0.75rem' }}>Children</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>SGD</th>
            </tr>
          </thead>
          <tbody>
            {selectedItems.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
                <td style={{ padding: '0.75rem' }}>{item.name}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.date || (item.isFixedDate ? '⚠ Required' : '—')}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.adult || '—'}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.child || '—'}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700 }}>{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#0F4C3A', color: 'white' }}>
              <td colSpan={4} style={{ padding: '0.75rem', fontWeight: 700 }}>Grand Total</td>
              <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 800, fontSize: '1.1rem' }}>SGD {grandTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#888', textAlign: 'center' }}>
          Preliminary quotation. Final prices subject to availability. Contact: info.flyingwonders@gmail.com
        </p>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (() => { const meta = getMeta(lightbox.name); return (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-main)', height: '100%', overflowY: 'auto', boxShadow: '-8px 0 40px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '240px', backgroundImage: `url(${getPhoto(lightbox.name, meta)})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
                <span style={{ background: 'var(--gold-accent)', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '12px', textTransform: 'uppercase' }}>{getCategory(lightbox.name, meta)}</span>
              </div>
            </div>
            <div style={{ padding: '2rem', flex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.5rem', color: 'var(--text-dark)', margin: '0 0 0.5rem' }}>{lightbox.name}</h2>
              <Stars rating={getRating(lightbox.name, meta)} />
              <p style={{ marginTop: '1rem', color: 'var(--text-dark)', opacity: 0.85, lineHeight: 1.7, fontSize: '0.95rem' }}>
                {meta?.longDescription || getDescription(lightbox.name, meta)}
              </p>

              {meta?.highlights && meta.highlights.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>✨ Highlights</h3>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, color: 'var(--text-dark)', opacity: 0.85, fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {meta.highlights.map((h, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{h}</li>)}
                  </ul>
                </div>
              )}

              {meta?.tips && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#FFFBEB', borderLeft: '4px solid #F6E05E', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#B7791F', marginBottom: '0.25rem' }}>💡 Insider Tip</div>
                  <div style={{ fontSize: '0.85rem', color: '#744210', lineHeight: 1.5 }}>{meta.tips}</div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                {[
                  { icon: '📍', label: 'Location', value: meta?.location || 'Singapore' },
                  { icon: '🕐', label: 'Opening Hours', value: getHours(lightbox.name, meta) },
                  { icon: '⏳', label: 'Duration', value: meta?.duration || 'Flexible' },
                  { icon: '👨‍👩‍👧‍👦', label: 'Age & Accessibility', value: meta?.ageRecommendation || 'Suitable for all ages' },
                  { icon: '💰', label: 'Ticket Price (SGD)', value: `Adult: S$ ${lightbox.adultPrice}  |  Child: S$ ${lightbox.childPrice}` },
                  { icon: '🔥', label: 'Popularity', value: `${getBookedCount(lightbox.name)} people booked this week` },
                ].map(row => (
                  <div key={row.label} style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.2rem' }}>{row.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.25rem' }}>{row.label}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 600 }}>{row.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <a href={getOfficialLink(lightbox.name, meta)} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '2rem', padding: '0.85rem', width: '100%', textDecoration: 'none', fontWeight: 700 }}>
                Official Website ↗
              </a>
            </div>
          </div>
        </div>
      )})()}

      {/* ── Mobile Floating Cart Button (hidden on desktop) ── */}
      <div
        className={`mobile-fab${selectedItems.length > 0 ? ' mobile-fab-pulse' : ''}`}
        onClick={() => setCartOpen(true)}
        role="button"
        aria-label={`Open cart — ${selectedItems.length} items selected`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <span style={{ fontSize: '1.4rem' }}>🛒</span>
            {selectedItems.length > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--gold-accent)', color: '#111', fontSize: '0.65rem', fontWeight: 800, minWidth: '18px', height: '18px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                {selectedItems.length}
              </span>
            )}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 600 }}>
              {selectedItems.length === 0 ? 'No tickets selected' : `${selectedItems.length} ticket${selectedItems.length > 1 ? 's' : ''} selected`}
            </div>
            {grandTotal > 0 && (
              <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.02em' }}>S$ {grandTotal}</div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {missingDates.length > 0 && (
            <span style={{ background: 'rgba(255,100,80,0.3)', color: '#ffa', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>⚠ {missingDates.length} date{missingDates.length > 1 ? 's' : ''}</span>
          )}
          <span style={{ background: 'var(--gold-accent)', color: '#111', fontWeight: 700, fontSize: '0.78rem', padding: '0.45rem 1rem', borderRadius: '8px', whiteSpace: 'nowrap' }}>
            View Cart ↑
          </span>
        </div>
      </div>

      {/* ── Mobile Cart Drawer ── */}
      {cartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="cart-drawer-handle" />

            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>🛒 Quotation Summary</h3>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={handleUndo} disabled={historyRef.current.length === 0} title="Undo" style={{ border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-dark)', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: historyRef.current.length === 0 ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 700, opacity: historyRef.current.length === 0 ? 0.4 : 1 }}>↩ Undo</button>
                <button onClick={handleClear} disabled={selectedItems.length === 0} style={{ border: `1px solid ${clearConfirm ? 'var(--crimson-primary)' : 'var(--glass-border)'}`, background: clearConfirm ? 'rgba(184,58,75,0.08)' : 'var(--bg-secondary)', color: clearConfirm ? 'var(--crimson-primary)' : 'var(--text-dark)', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 700, opacity: selectedItems.length === 0 ? 0.4 : 1 }}>{clearConfirm ? '⚠ Confirm?' : '🗑 Clear'}</button>
              </div>
            </div>

            {/* Missing dates warning */}
            {missingDates.length > 0 && (
              <div style={{ background: 'rgba(184,58,75,0.08)', border: '1px solid rgba(184,58,75,0.2)', borderRadius: '8px', padding: '0.65rem 0.9rem', fontSize: '0.8rem', color: 'var(--crimson-primary)', fontWeight: 600, marginBottom: '1rem' }}>
                ⚠️ {missingDates.length} Fixed-Date ticket{missingDates.length > 1 ? 's' : ''} need a date — set it on the card
              </div>
            )}

            {/* Items list */}
            {selectedItems.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem 0', fontSize: '0.9rem' }}>No tickets selected yet.<br/>Tap + on any attraction card.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {selectedItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)', lineHeight: 1.3 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.2rem' }}>
                        {item.adult > 0 && `${item.adult} Adult${item.adult > 1 ? 's' : ''}`}{item.adult > 0 && item.child > 0 && ' + '}{item.child > 0 && `${item.child} Child${item.child > 1 ? 'ren' : ''}`}
                      </div>
                      {item.isFixedDate && (
                        <div style={{ fontSize: '0.72rem', color: item.date ? 'var(--emerald-secondary)' : 'var(--crimson-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
                          {item.date ? `📅 ${item.date}` : '⚠️ Date Required'}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-dark)' }}>S$ {item.total}</span>
                      <button className="trash-btn" onClick={() => removeItem(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-dark)', padding: '2px', display: 'flex', alignItems: 'center' }}><TrashIcon /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grand Total */}
            <div style={{ borderTop: '2px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Grand Total:</span>
              <span style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--emerald-secondary)' }}>S$ {grandTotal}</span>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => { handleCreateOrder(); setCartOpen(false) }}
              disabled={selectedItems.length === 0 || missingDates.length > 0}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', opacity: selectedItems.length === 0 || missingDates.length > 0 ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.18 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.638 1.986 14.162.96 11.537.96 6.097.96 1.674 5.33 1.671 10.76c-.001 1.702.46 3.36 1.336 4.819l-.982 3.582 3.682-.967zm12.19-7.009c-.304-.152-1.8-.888-2.078-.989-.278-.101-.481-.152-.682.152-.202.304-.78.989-.957 1.191-.177.202-.354.228-.658.076-.304-.152-1.283-.473-2.443-1.508-.903-.805-1.512-1.8-1.689-2.105-.177-.304-.019-.469.133-.62.137-.136.304-.354.456-.531.152-.177.202-.304.304-.506.101-.202.051-.38-.025-.531-.076-.152-.682-1.644-.935-2.251-.246-.593-.497-.513-.682-.522-.177-.008-.38-.01-.582-.01-.202 0-.531.076-.81.38-.278.304-1.062 1.037-1.062 2.529 0 1.491 1.087 2.934 1.239 3.136.152.202 2.14 3.264 5.183 4.577.724.313 1.29.5 1.73.64.727.23 1.388.198 1.91.12.583-.087 1.8-.737 2.053-1.449.253-.712.253-1.32.177-1.449-.076-.129-.278-.206-.582-.358z"/></svg>
              Book via WhatsApp
            </button>

            {!hideIciciAttractions && (
              <button
                onClick={() => { setIsIciciModalOpen(true); setCartOpen(false) }}
                disabled={selectedItems.length === 0 || grandTotal <= 0}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  marginBottom: '0.75rem',
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: selectedItems.length === 0 || grandTotal <= 0 ? 'not-allowed' : 'pointer',
                  opacity: selectedItems.length === 0 || grandTotal <= 0 ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                📱 Pay via ICICI UPI QR
              </button>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <button onClick={handlePrint} className="btn glass" style={{ padding: '0.7rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)' }}>🖨️ PDF Quote</button>
              <button onClick={handleShare} className="btn glass" style={{ padding: '0.7rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)' }}>🔗 Share Link</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Share Toast ── */}

      {shareToast && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: '#0F4C3A', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 700, zIndex: 9999, boxShadow: '0 8px 30px rgba(0,0,0,0.2)', fontSize: '0.9rem' }}>
          ✅ Quote link copied to clipboard!
        </div>
      )}



      {/* ── Search + Category Filters ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '2rem', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
        <input
          type="text"
          placeholder="🔍 Search attractions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 220px', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.95rem', background: 'var(--bg-main)', color: 'var(--text-dark)', outline: 'none', fontFamily: 'inherit' }}
        />
        <div className="category-pills-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={activeCategory === cat ? 'btn btn-primary' : 'btn glass'} style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem', borderRadius: '6px', fontWeight: 600, flexShrink: 0 }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Builder Layout ── */}
      <div className="builder-layout attractions-builder-body">

        {/* Left: Attraction Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5, gridColumn: '1/-1' }}>No attractions found for &quot;{search}&quot;</div>
          ) : filtered.map(attr => {
            const meta = getMeta(attr.name)
            const qty = quantities[attr.id] || { adult: 0, child: 0 }
            const dateVal = dates[attr.id] || ''
            const itemTotal = (qty.adult * attr.adultPrice) + (qty.child * attr.childPrice)
            const isFixedDate = attr.name.toLowerCase().includes('fixed date')
            const isPopular = meta ? meta.isPopular : STATIC_POPULAR.some(k => attr.name.toLowerCase().includes(k))
            const isTrending = meta ? meta.isTrending : STATIC_TRENDING.some(k => attr.name.toLowerCase().includes(k))
            const isSelected = qty.adult > 0 || qty.child > 0

            return (
              <div key={attr.id} className="attr-card glass" style={{ borderRadius: '12px', overflow: 'hidden', border: isSelected ? '2px solid var(--gold-accent)' : '1px solid var(--glass-border)', background: 'var(--bg-main)', boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column' }}>
              {/* Desktop Photo (hidden on mobile) */}
              <div className="attr-card-photo" style={{ position: 'relative', height: '155px', backgroundImage: `url(${getPhoto(attr.name, meta)})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer' }} onClick={() => setLightbox(attr)}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
                  <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {isPopular && <span style={{ background: 'var(--crimson-primary)', color: 'white', fontSize: '0.62rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '10px' }}>⭐ Most Popular</span>}
                    {isTrending && <span style={{ background: 'var(--gold-accent)', color: 'white', fontSize: '0.62rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '10px' }}>🔥 Trending</span>}
                  </div>
                  <div style={{ position: 'absolute', bottom: '0.6rem', left: '0.75rem' }}>
                    <span style={{ background: 'rgba(0,0,0,0.45)', color: 'white', fontSize: '0.65rem', padding: '0.2rem 0.55rem', borderRadius: '8px', backdropFilter: 'blur(4px)', fontWeight: 600 }}>{getCategory(attr.name, meta)}</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setLightbox(attr) }} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', fontSize: '0.75rem', cursor: 'pointer', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ℹ</button>
                </div>

              {/* Mobile Compact Header (thumbnail + name side by side, shown only on mobile) */}
              <div className="attr-card-compact" style={{ alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem 0', display: 'none' }}>
                <div
                  onClick={() => setLightbox(attr)}
                  style={{ width: '60px', height: '60px', borderRadius: '8px', backgroundImage: `url(${getPhoto(attr.name, meta)})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, cursor: 'pointer', border: '1px solid var(--glass-border)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    {isPopular && <span style={{ background: 'var(--crimson-primary)', color: 'white', fontSize: '0.58rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '8px' }}>⭐ Popular</span>}
                    {isTrending && <span style={{ background: 'var(--gold-accent)', color: 'white', fontSize: '0.58rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '8px' }}>🔥 Trending</span>}
                  </div>
                  <div onClick={() => setLightbox(attr)} style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)', lineHeight: 1.3, cursor: 'pointer' }}>{attr.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dark)', opacity: 0.65, marginTop: '0.15rem' }}>Ad: S${attr.adultPrice} · Ch: S${attr.childPrice}</div>
                </div>
                {itemTotal > 0 && <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--emerald-secondary)', flexShrink: 0 }}>S$ {itemTotal}</span>}
              </div>

              {/* Card Body (shared desktop + mobile) */}

                <div style={{ padding: '1rem 1.1rem 1.1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <h3 onClick={() => setLightbox(attr)} style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0, cursor: 'pointer', lineHeight: 1.3, flex: 1, textDecoration: 'underline', textDecorationColor: 'var(--gold-accent)', textDecorationStyle: 'dotted' }}>{attr.name}</h3>
                    {itemTotal > 0 && <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--emerald-secondary)', whiteSpace: 'nowrap' }}>S$ {itemTotal}</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stars rating={getRating(attr.name, meta)} />
                    <span style={{ fontSize: '0.68rem', color: 'var(--emerald-secondary)', fontWeight: 600 }}>🔥 {getBookedCount(attr.name)} this week</span>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-dark)', opacity: 0.7, fontWeight: 600 }}>
                    Adult: S$ {attr.adultPrice} &nbsp;•&nbsp; Child: S$ {attr.childPrice}
                  </div>

                  {/* Qty Controls */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                    {(['adult', 'child'] as const).map(type => (
                      <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.7 }}>{type === 'adult' ? 'Adult' : 'Child'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--glass-border)', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                          <button className="qty-btn" type="button" onClick={() => handleQtyChange(attr.id, type, -1)} style={{ border: 'none', background: 'transparent', padding: '0.28rem 0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)', transition: 'background 0.15s' }}>−</button>
                          <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)' }}>{qty[type]}</span>
                          <button className="qty-btn" type="button" onClick={() => handleQtyChange(attr.id, type, 1)} style={{ border: 'none', background: 'transparent', padding: '0.28rem 0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)', transition: 'background 0.15s' }}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Date picker */}
                  {isFixedDate && isSelected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: !dateVal ? 'var(--crimson-primary)' : 'var(--emerald-secondary)' }}>
                        {!dateVal ? '⚠️ Date Required' : '📅 Date Set'}
                      </span>
                      <input type="date" value={dateVal} onChange={e => handleDateChange(attr.id, e.target.value)} style={{ padding: '0.3rem 0.5rem', border: !dateVal ? '1.5px solid var(--crimson-primary)' : '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-dark)' }} />
                    </div>
                  )}

                  {isSelected && (
                    <button onClick={() => setItineraryMode(true)} style={{ marginTop: '0.1rem', fontSize: '0.7rem', color: 'var(--gold-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textAlign: 'left', padding: 0 }}>
                      📅 Add to Day Planner →
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: Sticky Summary Panel — desktop only */}
        <div className="desktop-sidebar" style={{ position: 'sticky', top: '150px', height: 'fit-content' }}>
          <div className="glass" style={{ background: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.75rem', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Summary header + Undo/Clear */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-dark)', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>Quotation Summary</h3>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  title="Undo last action"
                  style={{ border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-dark)', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: canUndo ? 'pointer' : 'not-allowed', fontSize: '0.78rem', fontWeight: 700, opacity: canUndo ? 1 : 0.4, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  ↩ Undo
                </button>
                <button
                  onClick={handleClear}
                  disabled={selectedItems.length === 0}
                  title={clearConfirm ? 'Click again to confirm clear' : 'Clear all selections'}
                  style={{ border: `1px solid ${clearConfirm ? 'var(--crimson-primary)' : 'var(--glass-border)'}`, background: clearConfirm ? 'rgba(184,58,75,0.08)' : 'var(--bg-secondary)', color: clearConfirm ? 'var(--crimson-primary)' : 'var(--text-dark)', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer', fontSize: '0.78rem', fontWeight: 700, opacity: selectedItems.length === 0 ? 0.4 : 1, transition: 'all 0.2s' }}
                >
                  {clearConfirm ? '⚠ Confirm?' : '🗑 Clear'}
                </button>
              </div>
            </div>

            {/* Missing dates warning */}
            {missingDates.length > 0 && (
              <div style={{ background: 'rgba(184,58,75,0.08)', border: '1px solid rgba(184,58,75,0.2)', borderRadius: '8px', padding: '0.7rem 0.9rem', fontSize: '0.8rem', color: 'var(--crimson-primary)', fontWeight: 600 }}>
                ⚠️ {missingDates.length} Fixed-Date ticket{missingDates.length > 1 ? 's' : ''} need a date
              </div>
            )}

            {selectedItems.length === 0 ? (
              <div style={{ opacity: 0.5, fontSize: '0.88rem', textAlign: 'center', padding: '1.25rem 0' }}>No tickets selected. Pick attractions on the left.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '260px', overflowY: 'auto' }}>
                {selectedItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.83rem', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.3 }}>{item.name}</div>
                      <div style={{ fontSize: '0.76rem', opacity: 0.7, marginTop: '0.15rem' }}>
                        {item.adult > 0 && `${item.adult} Ad`}{item.adult > 0 && item.child > 0 && ' + '}{item.child > 0 && `${item.child} Ch`}
                      </div>
                      {item.isFixedDate && (
                        <div style={{ fontSize: '0.73rem', color: item.date ? 'var(--emerald-secondary)' : 'var(--crimson-primary)', fontWeight: 600 }}>
                          {item.date ? `📅 ${item.date}` : '⚠️ Date Required'}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>S$ {item.total}</span>
                      <button
                        className="trash-btn"
                        onClick={() => removeItem(item.id)}
                        title={`Remove ${item.name}`}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-dark)', padding: '2px', display: 'flex', alignItems: 'center' }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: '2px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-dark)' }}>Grand Total:</span>
              <span style={{ fontWeight: 800, fontSize: '1.55rem', color: 'var(--emerald-secondary)' }}>S$ {grandTotal}</span>
            </div>

            {/* Action Buttons */}
            <button onClick={handleCreateOrder} disabled={selectedItems.length === 0 || missingDates.length > 0} className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '0.88rem', fontWeight: 700, opacity: selectedItems.length === 0 || missingDates.length > 0 ? 0.6 : 1, cursor: selectedItems.length === 0 || missingDates.length > 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.18 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.638 1.986 14.162.96 11.537.96 6.097.96 1.674 5.33 1.671 10.76c-.001 1.702.46 3.36 1.336 4.819l-.982 3.582 3.682-.967zm12.19-7.009c-.304-.152-1.8-.888-2.078-.989-.278-.101-.481-.152-.682.152-.202.304-.78.989-.957 1.191-.177.202-.354.228-.658.076-.304-.152-1.283-.473-2.443-1.508-.903-.805-1.512-1.8-1.689-2.105-.177-.304-.019-.469.133-.62.137-.136.304-.354.456-.531.152-.177.202-.304.304-.506.101-.202.051-.38-.025-.531-.076-.152-.682-1.644-.935-2.251-.246-.593-.497-.513-.682-.522-.177-.008-.38-.01-.582-.01-.202 0-.531.076-.81.38-.278.304-1.062 1.037-1.062 2.529 0 1.491 1.087 2.934 1.239 3.136.152.202 2.14 3.264 5.183 4.577.724.313 1.29.5 1.73.64.727.23 1.388.198 1.91.12.583-.087 1.8-.737 2.053-1.449.253-.712.253-1.32.177-1.449-.076-.129-.278-.206-.582-.358z"/></svg>
              Book via WhatsApp
            </button>

            {!hideIciciAttractions && (
              <button
                onClick={() => setIsIciciModalOpen(true)}
                disabled={selectedItems.length === 0 || grandTotal <= 0}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  marginTop: '0.65rem',
                  marginBottom: '0.65rem',
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: selectedItems.length === 0 || grandTotal <= 0 ? 'not-allowed' : 'pointer',
                  opacity: selectedItems.length === 0 || grandTotal <= 0 ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                📱 Pay via ICICI UPI QR
              </button>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <button onClick={handlePrint} className="btn glass" style={{ padding: '0.65rem', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dark)' }}>🖨️ PDF Quote</button>
              <button onClick={handleShare} className="btn glass" style={{ padding: '0.65rem', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dark)' }}>🔗 Share</button>
            </div>

            <button onClick={() => setItineraryMode(m => !m)} className="btn glass" style={{ padding: '0.6rem', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dark)', width: '100%' }}>
              📅 {itineraryMode ? 'Hide' : 'Open'} Day Planner
            </button>
          </div>
        </div>
      </div>

      {/* ── Itinerary Day Planner ── */}
      {itineraryMode && (
        <div className="glass" style={{ marginTop: '3rem', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'var(--bg-main)', padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>📅 Day-by-Day Itinerary Planner</h3>
          <p style={{ fontSize: '0.88rem', opacity: 0.7, marginBottom: '1.5rem' }}>Assign your selected attractions to specific days of your trip.</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map(day => (
              <button key={day} onClick={() => setActiveDay(day)} className={activeDay === day ? 'btn btn-primary' : 'btn glass'} style={{ padding: '0.55rem 1.25rem', fontWeight: 700, fontSize: '0.85rem', borderRadius: '8px' }}>
                Day {day} {itinerary[day]?.length > 0 && `(${itinerary[day].length})`}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--gold-accent)' }}>+ Assign to Day {activeDay}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {selectedItems.map(item => {
                  const alreadyInDay = itinerary[activeDay]?.includes(item.name)
                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.9rem', background: alreadyInDay ? 'rgba(15,76,58,0.08)' : 'var(--bg-secondary)', borderRadius: '8px', border: `1px solid ${alreadyInDay ? 'var(--emerald-secondary)' : 'var(--glass-border)'}`, fontSize: '0.83rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)', flex: 1 }}>{item.name}</span>
                      <button onClick={() => alreadyInDay ? removeFromDay(item.name, activeDay) : addToDay(item.name, activeDay)} style={{ border: 'none', background: alreadyInDay ? 'var(--emerald-secondary)' : 'var(--crimson-primary)', color: 'white', padding: '0.25rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, marginLeft: '0.75rem', whiteSpace: 'nowrap' }}>
                        {alreadyInDay ? '✓ Added' : '+ Add'}
                      </button>
                    </div>
                  )
                })}
                {selectedItems.length === 0 && <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>Select tickets above first.</p>}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--gold-accent)' }}>Day {activeDay} Plan</h4>
              {itinerary[activeDay]?.length === 0 ? (
                <div style={{ opacity: 0.5, fontSize: '0.88rem', padding: '1.5rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--glass-border)' }}>Nothing planned for Day {activeDay} yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {itinerary[activeDay].map((name, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.9rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--gold-accent)', minWidth: '20px' }}>{i + 1}.</span>
                      <span style={{ flex: 1, fontSize: '0.83rem', color: 'var(--text-dark)', fontWeight: 600 }}>{name}</span>
                      <button onClick={() => removeFromDay(name, activeDay)} style={{ border: 'none', background: 'transparent', color: 'var(--crimson-primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ICICI Bank UPI QR Payment Modal */}
      <IciciQrModal
        isOpen={isIciciModalOpen}
        onClose={() => setIsIciciModalOpen(false)}
        amountSgd={grandTotal}
        bookingReference={`FW-ATTR-${Math.floor(100000 + Math.random() * 900000)}`}
      />
    </>
  )
}
