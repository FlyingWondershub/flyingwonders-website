'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import AdBanner from '../../components/AdBanner'
import { client } from '../../sanity/lib/client'
import { 
  FileText, 
  Globe, 
  Calculator, 
  CheckSquare, 
  Utensils, 
  Clock, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Compass, 
  Sparkles,
  Phone,
  HelpCircle,
  Bus,
  Plane,
  Search,
  Loader2,
  Newspaper,
  Rss,
  EyeOff,
  Car,
  RefreshCw,
  Camera,
  Star,
  Share2,
  Printer,
  ThumbsUp,
  MessageSquare,
  X,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

// Helper function to format YouTube embed URLs
function getYouTubeEmbedUrl(url: string) {
  if (!url) return ''
  if (url.includes('embed/')) return url
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url
}

// ══ REUSABLE COMMUNITY LIKES, COMMENTS, SHARE & SAVE FOOTER FOR EVERY TOOL ══
function ToolCommunityFooter({ toolId, toolName, summaryText }: { toolId: string; toolName: string; summaryText: string }) {
  const [likes, setLikes] = useState<number>(35)
  const [isLiked, setIsLiked] = useState<boolean>(false)
  const [comments, setComments] = useState<any[]>([])
  const [showComments, setShowComments] = useState<boolean>(false)
  const [name, setName] = useState<string>('')
  const [role, setRole] = useState<string>('Traveler')
  const [commentText, setCommentText] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSaved, setIsSaved] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLikes = localStorage.getItem(`fw_tool_likes_${toolId}`)
      if (savedLikes) {
        setLikes(parseInt(savedLikes, 10))
        setIsLiked(true)
      }
      const savedKit = JSON.parse(localStorage.getItem('fw_saved_tools') || '[]')
      if (savedKit.includes(toolId)) setIsSaved(true)
    }

    fetch(`/api/travel-tools/comments?toolId=${toolId}`)
      .then(res => res.json())
      .then(data => {
        if (data.comments && Array.isArray(data.comments)) {
          setComments(data.comments)
        }
      })
      .catch(() => {})
  }, [toolId])

  const handleLike = () => {
    if (isLiked) return
    const newCount = likes + 1
    setLikes(newCount)
    setIsLiked(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`fw_tool_likes_${toolId}`, newCount.toString())
    }
  }

  const toggleSaveKit = () => {
    if (typeof window === 'undefined') return
    const savedKit: string[] = JSON.parse(localStorage.getItem('fw_saved_tools') || '[]')
    let nextKit: string[]
    if (savedKit.includes(toolId)) {
      nextKit = savedKit.filter(id => id !== toolId)
      setIsSaved(false)
    } else {
      nextKit = [...savedKit, toolId]
      setIsSaved(true)
    }
    localStorage.setItem('fw_saved_tools', JSON.stringify(nextKit))
    window.dispatchEvent(new Event('storage'))
  }

  const handleShareWhatsApp = () => {
    const text = `*Flying Wonders Travel Tool - ${toolName}*\n\n${summaryText}\n\nExplore live travel tools here: https://flyingwonders.net/travel-tools#${toolId}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !commentText.trim()) return
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/travel-tools/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, authorName: name, authorRole: role, commentText })
      })
      const json = await res.json()
      if (json.success && json.comment) {
        setComments(prev => [json.comment, ...prev])
        setCommentText('')
      }
    } catch (e) {
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        {/* Upvote & Comments Drawer Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleLike}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: isLiked ? '1px solid #10B981' : '1px solid #CBD5E1',
              background: isLiked ? '#ECFDF5' : '#F8FAFC',
              color: isLiked ? '#047857' : '#475569',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <ThumbsUp size={13} color={isLiked ? '#047857' : '#475569'} /> {isLiked ? 'Helpful!' : 'Helpful?'} ({likes})
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: '1px solid #CBD5E1',
              background: '#F8FAFC',
              color: '#475569',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <MessageSquare size={13} color="#475569" /> Tips & Discussion ({comments.length})
          </button>
        </div>

        {/* Share & Save to Trip Kit Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={toggleSaveKit}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: isSaved ? '1px solid #F59E0B' : '1px solid #CBD5E1',
              background: isSaved ? '#FEF3C7' : '#F8FAFC',
              color: isSaved ? '#B45309' : '#475569',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Star size={13} color={isSaved ? '#B45309' : '#475569'} fill={isSaved ? '#B45309' : 'none'} />
            {isSaved ? 'Saved in Trip Kit' : 'Save to Trip Kit'}
          </button>

          <button
            onClick={handleShareWhatsApp}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: '1px solid #22C55E',
              background: '#22C55E',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Share2 size={13} color="#FFF" /> WhatsApp
          </button>
        </div>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', marginTop: '1rem', border: '1px solid #E2E8F0' }}>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 800, color: '#0F4C3A', display: 'flex', alignItems: 'center', gap: '6px' }}>
            💬 Traveler & Agent Tips ({comments.length})
          </h4>

          {/* Comment List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
            {comments.map((c, i) => (
              <div key={c._id || i} style={{ background: '#FFF', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <strong style={{ fontSize: '0.8rem', color: '#0F172A' }}>{c.authorName}</strong>
                  <span style={{ fontSize: '0.68rem', background: '#ECFDF5', color: '#047857', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {c.authorRole || 'Traveler'}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#334155', margin: 0, lineHeight: 1.4 }}>{c.commentText}</p>
              </div>
            ))}
          </div>

          {/* Submit New Tip Form */}
          <form onSubmit={handlePostComment} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Your Name..."
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem', outline: 'none' }}
              />
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem', outline: 'none', background: '#FFF' }}
              >
                <option value="Traveler">🧳 Traveler / Tourist</option>
                <option value="Travel Agent">🛡️ Registered Agent</option>
              </select>
            </div>
            <textarea
              placeholder="Share your travel tip or experience..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              required
              rows={2}
              style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem', outline: 'none', resize: 'vertical' }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ alignSelf: 'flex-end', background: '#0F4C3A', color: '#FFF', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
            >
              {isSubmitting ? 'Posting...' : 'Post Travel Tip'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function TravelToolsPage() {
  // Official Arrival Cards Tab: SGAC (default), MDAC, or Air Suvidha
  const [arrivalCardTab, setArrivalCardTab] = useState<'sgac' | 'mdac' | 'airsuvidha'>('sgac')
  
  // Real-time Search Filter
  const [searchFilter, setSearchFilter] = useState<string>('')
  
  // Saved Trip Kit Modal Drawer State
  const [showTripKitModal, setShowTripKitModal] = useState<boolean>(false)
  const [savedKitIds, setSavedKitIds] = useState<string[]>([])

  // Category Scroller Ref
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollScroller = (direction: 'left' | 'right') => {
    if (scrollerRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250
      scrollerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const updateKit = () => {
      if (typeof window !== 'undefined') {
        const kit = JSON.parse(localStorage.getItem('fw_saved_tools') || '[]')
        setSavedKitIds(kit)
      }
    }
    updateKit()
    window.addEventListener('storage', updateKit)
    return () => window.removeEventListener('storage', updateKit)
  }, [])

  // Sanity Dynamic Settings
  const [sanitySettings, setSanitySettings] = useState<{
    heroTitle?: string
    heroSubtitle?: string
    hideOfficialPortals?: boolean
    hideScamAdvisory?: boolean
    hideVisaChecklist?: boolean
    hideCurrencyConverter?: boolean
    hideMealEstimator?: boolean
    hideInteractiveChecklist?: boolean
    hideAttractionAllocator?: boolean
    hideFlightTracker?: boolean
    sgacOfficialLink?: string
    mdacOfficialLink?: string
    sgVisaStatusLink?: string
    airSuvidhaLink?: string
    hideAirSuvidha?: boolean
    hideTravelNews?: boolean
    hideBorderTraffic?: boolean
    hideAirlinePromotions?: boolean
  }>({})

  // Airline Promotions State
  const [airlinePromos, setAirlinePromos] = useState<any[]>([])
  const [promoLoading, setPromoLoading] = useState<boolean>(true)
  const [promoFilter, setPromoFilter] = useState<'all' | 'sia' | 'ex-india' | 'budget'>('all')
  const [hideAirlinePromos, setHideAirlinePromos] = useState<boolean>(false)

  // Live Border Traffic State
  const [borderData, setBorderData] = useState<any>(null)
  const [borderLoading, setBorderLoading] = useState<boolean>(true)
  const [borderRefreshing, setBorderRefreshing] = useState<boolean>(false)
  const [hideBorderTraffic, setHideBorderTraffic] = useState<boolean>(false)

  const fetchBorderTraffic = async () => {
    setBorderRefreshing(true)
    try {
      const res = await fetch(`/api/border-traffic?cb=${Date.now()}`)
      const json = await res.json()
      if (json.data) setBorderData(json.data)
    } catch (err) {
      console.error('Border traffic fetch error:', err)
    } finally {
      setBorderLoading(false)
      setBorderRefreshing(false)
    }
  }

  // Active Tool Section for Sticky Navigator Bar
  const [activeToolSection, setActiveToolSection] = useState<string>('tool-official-portals')

  // Travel News Radar State
  const [newsList, setNewsList] = useState<any[]>([])
  const [newsLoading, setNewsLoading] = useState<boolean>(true)
  const [hideNewsRadar, setHideNewsRadar] = useState<boolean>(false)

  const scrollToTool = (id: string) => {
    setActiveToolSection(id)
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -130
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  // AirLabs Live Flight Search State
  const [flightNumberInput, setFlightNumberInput] = useState<string>('')
  const [flightLoading, setFlightLoading] = useState<boolean>(false)
  const [flightResult, setFlightResult] = useState<any>(null)
  const [flightError, setFlightError] = useState<string | null>(null)

  // Currency Calculator States
  const [amountSgd, setAmountSgd] = useState<number>(100)
  const [sgdToInrRate, setSgdToInrRate] = useState<number>(74.50)
  const [sgdToMyrRate, setSgdToMyrRate] = useState<number>(3.35)
  const [rateLoaded, setRateLoaded] = useState<boolean>(false)

  // Meal Estimator States
  const [days, setDays] = useState<number>(4)
  const [adults, setAdults] = useState<number>(2)
  const [kids, setKids] = useState<number>(0)
  const [diningStyle, setDiningStyle] = useState<'budget' | 'balanced' | 'luxury'>('balanced')

  // Interactive Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    passport: true,
    sgac: false,
    mdac: false,
    insurance: true,
    tickets: true,
    adapter: false,
    forex: false,
    sim: false
  })

  // Live Visa Checker State
  const [visaPassport, setVisaPassport] = useState('')
  const [visaDestination, setVisaDestination] = useState('')
  const [visaLoading, setVisaLoading] = useState(false)
  const [visaResult, setVisaResult] = useState<any>(null)
  const [visaError, setVisaError] = useState<string | null>(null)

  const handleVisaCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!visaPassport || !visaDestination) return
    setVisaLoading(true)
    setVisaResult(null)
    setVisaError(null)
    try {
      const res = await fetch('/api/visa-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passport: visaPassport, destination: visaDestination })
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Failed to fetch visa data.')
      setVisaResult(json.data)
    } catch (err: any) {
      setVisaError(err.message || 'Error checking visa requirements.')
    } finally {
      setVisaLoading(false)
    }
  }

  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(res => res.json())
      .then(data => {
        if (data.rate) {
          setSgdToInrRate(data.rate)
          setRateLoaded(true)
        }
      })
      .catch(err => console.error('Exchange rate fetch error:', err))

    client.fetch(`*[_type == "travelTools"][0]`)
      .then(res => {
        if (res) setSanitySettings(res)
      })
      .catch(err => console.error('Travel tools Sanity fetch error:', err))

    fetchBorderTraffic()

    fetch('/api/airline-promotions')
      .then(res => res.json())
      .then(data => {
        if (data.deals) setAirlinePromos(data.deals)
      })
      .catch(err => console.error('Airline promotions fetch error:', err))
      .finally(() => setPromoLoading(false))

    fetch('/api/travel-news')
      .then(res => res.json())
      .then(data => {
        if (data.articles) setNewsList(data.articles)
      })
      .catch(err => console.error('Travel news fetch error:', err))
      .finally(() => setNewsLoading(false))
  }, [])

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const completedCount = Object.values(checkedItems).filter(Boolean).length
  const totalCount = Object.keys(checkedItems).length
  const readinessPercent = Math.round((completedCount / totalCount) * 100)

  const dailyAdultMeal = diningStyle === 'budget' ? 25 : (diningStyle === 'balanced' ? 55 : 130)
  const dailyChildMeal = dailyAdultMeal * 0.6
  const totalMealCostSgd = Math.round((adults * dailyAdultMeal + kids * dailyChildMeal) * days)
  const totalMealCostInr = Math.round(totalMealCostSgd * sgdToInrRate)

  const handleSearchFlight = async (e?: React.FormEvent, codeOverride?: string) => {
    if (e) e.preventDefault()
    const targetCode = (codeOverride || flightNumberInput).trim()
    if (!targetCode) return
    setFlightLoading(true)
    setFlightError(null)
    setFlightResult(null)

    try {
      const res = await fetch(`/api/flights?flight_iata=${encodeURIComponent(targetCode)}`)
      const json = await res.json()
      if (!res.ok || json.error) {
        setFlightError(json.error || 'Flight not found or invalid flight number.')
      } else if (json.data) {
        setFlightResult(json.data)
      } else {
        setFlightError('No flight data returned for this flight number.')
      }
    } catch (err: any) {
      setFlightError('Failed to fetch live flight details. Please try again.')
    } finally {
      setFlightLoading(false)
    }
  }

  const sgacLink = sanitySettings.sgacOfficialLink || 'https://eservices.ica.gov.sg/sgarrivalcard/'
  const mdacLink = sanitySettings.mdacOfficialLink || 'https://imigresen-online.imi.gov.my/mdac/main'
  const sgVisaLink = sanitySettings.sgVisaStatusLink || 'https://eservices.ica.gov.sg/save/sso/login.xhtml'
  const airSuvidhaLink = sanitySettings.airSuvidhaLink || 'https://www.airsuvidha.app.nic.in/'

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* 1. HERO HEADER WITH TRIP KIT BUTTON */}
      <section style={{ 
        background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)', 
        color: '#FFF', 
        padding: '2rem 1.5rem 2.2rem', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={24} color="#D4AF37" /> Flying Wonders Travel Tools & Community
            </h1>

            {/* Saved Trip Kit Drawer Trigger */}
            <button
              onClick={() => setShowTripKitModal(true)}
              style={{
                background: '#F59E0B',
                color: '#FFF',
                border: 'none',
                padding: '0.55rem 1.1rem',
                borderRadius: '20px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
              }}
            >
              <Star size={16} fill="#FFF" /> My Saved Trip Kit ({savedKitIds.length})
            </button>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#E2E8F0', margin: 0, opacity: 0.9, lineHeight: 1.5 }}>
            Real-time Flight Radar, Official SGAC & MDAC Arrival Cards, Visa Requirement Checkers, Live Exchange Rates & Community Travel Tips.
          </p>

          {/* Quick Search Input */}
          <div style={{ maxWidth: '520px', margin: '1.25rem auto 0', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search travel tools, SGAC, visa guides, currency or flight status..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '30px', border: 'none', fontSize: '0.9rem', outline: 'none', background: '#FFF', color: '#0F172A', fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
            />
            <Search size={18} color="#0F4C3A" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>
      </section>

      {/* 🧭 STICKY TOOL CATEGORY BAR WITH HORIZONTAL SCROLLER BUTTONS */}
      <div
        style={{
          position: 'sticky',
          top: '70px',
          zIndex: 90,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
          padding: '0.65rem 1rem'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            position: 'relative'
          }}
        >
          {/* Scroll Left Button */}
          <button
            onClick={() => scrollScroller('left')}
            title="Scroll Left"
            style={{ background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
          >
            <ChevronLeft size={16} color="#475569" />
          </button>

          {/* Category Items Horizontal Scroller */}
          <div
            ref={scrollerRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'thin',
              WebkitOverflowScrolling: 'touch',
              flex: 1,
              padding: '2px 0'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', marginRight: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Compass size={14} color="#059669" /> Tools:
            </span>

            {[
              { id: 'tool-official-portals', label: '🇸🇬 SGAC & MDAC (Arrival Cards)', show: !sanitySettings.hideOfficialPortals },
              { id: 'tool-visa-checker', label: '🛂 Visa Checker', show: true },
              { id: 'tool-flight-radar', label: '✈️ Flight Radar', show: !sanitySettings.hideFlightTracker },
              { id: 'tool-airline-promos', label: '🎟️ Airline Deals', show: !sanitySettings.hideAirlinePromotions && !hideAirlinePromos },
              { id: 'tool-border-traffic', label: '🚗 Border Traffic', show: !sanitySettings.hideBorderTraffic && !hideBorderTraffic },
              { id: 'tool-visa-checklist', label: '📋 Visa Checklists', show: !sanitySettings.hideVisaChecklist },
              { id: 'tool-currency-converter', label: '🧮 Currency & Meal Estimator', show: !sanitySettings.hideCurrencyConverter },
              { id: 'tool-packing-checklist', label: '🎒 Packing List', show: !sanitySettings.hideInteractiveChecklist },
              { id: 'tool-news-radar', label: '📰 Travel News', show: !sanitySettings.hideTravelNews && !hideNewsRadar },
              { id: 'tool-time-allocator', label: '⏱️ Time Allocator', show: !sanitySettings.hideAttractionAllocator }
            ].filter(item => item.show).map(item => (
              <button
                key={item.id}
                onClick={() => scrollToTool(item.id)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  border: activeToolSection === item.id ? '1px solid #059669' : '1px solid #CBD5E1',
                  background: activeToolSection === item.id ? '#F0FDF4' : '#F8FAFC',
                  color: activeToolSection === item.id ? '#166534' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeToolSection === item.id ? '0 2px 6px rgba(5,150,105,0.15)' : 'none'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollScroller('right')}
            title="Scroll Right"
            style={{ background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
          >
            <ChevronRight size={16} color="#475569" />
          </button>

        </div>
      </div>

      {/* TOP ADSENSE BANNER SPACE */}
      <div style={{ maxWidth: '1200px', margin: '1.5rem auto 0', padding: '0 1.5rem' }}>
        <AdBanner slotId="7788990011" format="horizontal" />
      </div>

      <div style={{ maxWidth: '1200px', margin: '2rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        
        {/* 🇸🇬 OFFICIAL SGAC & MDAC ARRIVAL CARDS SECTION (ACTIVE BY DEFAULT) */}
        {!sanitySettings.hideOfficialPortals && (
          <div id="tool-official-portals" style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '2.5rem' }}>
            
            {/* Header & Country Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F4C3A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShieldCheck size={24} color="#059669" /> Official Singapore & Malaysia Arrival Cards (SGAC & MDAC)
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0', fontWeight: 600 }}>
                  Mandatory zero-fee arrival card portals for all international travelers entering Singapore & Malaysia.
                </p>
              </div>

              {/* SGAC vs MDAC vs Air Suvidha Toggle Tabs (SGAC ACTIVE BY DEFAULT) */}
              <div style={{ display: 'flex', gap: '6px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
                <button
                  onClick={() => setArrivalCardTab('sgac')}
                  style={{
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: arrivalCardTab === 'sgac' ? '#0F4C3A' : 'transparent',
                    color: arrivalCardTab === 'sgac' ? '#FFF' : '#475569',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  🇸🇬 SGAC (Singapore)
                </button>
                <button
                  onClick={() => setArrivalCardTab('mdac')}
                  style={{
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: arrivalCardTab === 'mdac' ? '#0F4C3A' : 'transparent',
                    color: arrivalCardTab === 'mdac' ? '#FFF' : '#475569',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  🇲🇾 MDAC (Malaysia)
                </button>
                <button
                  onClick={() => setArrivalCardTab('airsuvidha')}
                  style={{
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: arrivalCardTab === 'airsuvidha' ? '#0F4C3A' : 'transparent',
                    color: arrivalCardTab === 'airsuvidha' ? '#FFF' : '#475569',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  🇮🇳 Air Suvidha (India)
                </button>
              </div>
            </div>

            {/* TAB CONTENT: 🇸🇬 SGAC SINGAPORE ARRIVAL CARD (DEFAULT) */}
            {arrivalCardTab === 'sgac' && (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1.5rem', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ background: '#059669', color: '#FFF', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '5px', textTransform: 'uppercase' }}>
                      🇸🇬 Singapore ICA Portal • 100% Free
                    </span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#166534', margin: '0.4rem 0 0.25rem' }}>
                      SG Arrival Card (SGAC) Electronic Submission
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#14532D', margin: '0 0 1rem', lineHeight: 1.5, maxWidth: '680px' }}>
                      All foreign visitors (including Indian, Chinese, US, UK, & Australian passport holders) MUST submit the electronic SG Arrival Card within <strong>3 days prior to arrival</strong> in Singapore.
                    </p>
                    
                    <ul style={{ margin: '0 0 1.25rem', paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#166534', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>✓ Zero government fee (Do NOT pay scam agencies charging $30-$80).</li>
                      <li>✓ Instant QR confirmation sent to your email.</li>
                      <li>✓ Passport must have at least 6 months validity from entry date.</li>
                    </ul>
                  </div>

                  <a
                    href={sgacLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'linear-gradient(135deg, #0F4C3A 0%, #059669 100%)',
                      color: '#FFF',
                      padding: '0.85rem 1.75rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(5,150,105,0.3)'
                    }}
                  >
                    <span>Submit Official SGAC</span> <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 🇲🇾 MDAC MALAYSIA DIGITAL ARRIVAL CARD */}
            {arrivalCardTab === 'mdac' && (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '1.5rem', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ background: '#1D4ED8', color: '#FFF', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '5px', textTransform: 'uppercase' }}>
                      🇲🇾 Malaysia Immigration Portal • 100% Free
                    </span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1E40AF', margin: '0.4rem 0 0.25rem' }}>
                      Malaysia Digital Arrival Card (MDAC) Submission
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#1E3A8A', margin: '0 0 1rem', lineHeight: 1.5, maxWidth: '680px' }}>
                      Mandatory for all foreign travelers entering Malaysia via Kuala Lumpur (KLIA), Penang, or Woodlands/Tuas land checkpoints. Submit online within <strong>3 days before arrival</strong>.
                    </p>
                    
                    <ul style={{ margin: '0 0 1.25rem', paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#1E40AF', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>✓ Zero fee on official Malaysian Immigration MDAC website.</li>
                      <li>✓ Indian & Chinese passport holders enjoy 30-day visa exemption through 2026.</li>
                      <li>✓ Print or save PDF PIN confirmation on mobile for border officer inspection.</li>
                    </ul>
                  </div>

                  <a
                    href={mdacLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)',
                      color: '#FFF',
                      padding: '0.85rem 1.75rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(29,78,216,0.3)'
                    }}
                  >
                    <span>Submit Official MDAC</span> <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 🇮🇳 AIR SUVIDHA (INDIA TRAVEL PORTAL) */}
            {arrivalCardTab === 'airsuvidha' && (
              <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '1.5rem', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ background: '#EA580C', color: '#FFF', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '5px', textTransform: 'uppercase' }}>
                      🇮🇳 India Civil Aviation Portal • 100% Free
                    </span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#C2410C', margin: '0.4rem 0 0.25rem' }}>
                      Air Suvidha Self-Declaration & Entry Guidelines
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#9A3412', margin: '0 0 1rem', lineHeight: 1.5, maxWidth: '680px' }}>
                      Official health declaration and arrival guidelines portal for passengers travelling to India (Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kochi, Kolkata).
                    </p>
                    
                    <ul style={{ margin: '0 0 1.25rem', paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#C2410C', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>✓ Official Ministry of Civil Aviation self-declaration portal.</li>
                      <li>✓ Check destination airport health protocols & quarantine updates.</li>
                      <li>✓ Direct access to New Delhi Airport (MoCA) portal.</li>
                    </ul>
                  </div>

                  <a
                    href={airSuvidhaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'linear-gradient(135deg, #C2410C 0%, #EA580C 100%)',
                      color: '#FFF',
                      padding: '0.85rem 1.75rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(234,88,12,0.3)'
                    }}
                  >
                    <span>Open Official Air Suvidha</span> <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            )}

            <ToolCommunityFooter toolId="official-portals" toolName="Official SGAC & MDAC Arrival Cards" summaryText="Mandatory zero-fee electronic arrival card submission for Singapore & Malaysia." />
          </div>
        )}

        {/* 🛂 LIVE PASSPORT VISA CHECKER */}
        <div id="tool-visa-checker" style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A365D', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={22} color="#059669" /> Live Passport Visa Requirement Checker
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#718096', margin: '0.25rem 0 0' }}>
                Check instant visa rules for 190+ nationalities entering Singapore, Malaysia, Thailand, Indonesia, and UAE.
              </p>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#ECFDF5', color: '#047857', padding: '0.25rem 0.65rem', borderRadius: '12px', fontWeight: 700 }}>
              Updated 2026 Regulations
            </span>
          </div>

          <form onSubmit={handleVisaCheck} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <select
              value={visaPassport}
              onChange={e => setVisaPassport(e.target.value)}
              required
              style={{ flex: '1 1 200px', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.9rem', fontWeight: 600, outline: 'none' }}
            >
              <option value="">-- Select Your Passport Country --</option>
              <option value="IN">🇮🇳 India</option>
              <option value="CN">🇨🇳 China</option>
              <option value="US">🇺🇸 United States</option>
              <option value="GB">🇬🇧 United Kingdom</option>
              <option value="AU">🇦🇺 Australia</option>
              <option value="MY">🇲🇾 Malaysia</option>
              <option value="ID">🇮🇩 Indonesia</option>
            </select>

            <select
              value={visaDestination}
              onChange={e => setVisaDestination(e.target.value)}
              required
              style={{ flex: '1 1 200px', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.9rem', fontWeight: 600, outline: 'none' }}
            >
              <option value="">-- Select Destination --</option>
              <option value="SG">🇸🇬 Singapore</option>
              <option value="MY">🇲🇾 Malaysia</option>
              <option value="TH">🇹🇭 Thailand</option>
              <option value="ID">🇮🇩 Indonesia</option>
              <option value="AE">🇦🇪 United Arab Emirates (Dubai)</option>
            </select>

            <button
              type="submit"
              disabled={visaLoading}
              style={{ padding: '0.75rem 1.75rem', borderRadius: '8px', border: 'none', background: '#0F4C3A', color: '#FFF', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              {visaLoading ? 'Checking...' : 'Check Visa Rules'}
            </button>
          </form>

          {visaResult && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1.25rem', borderRadius: '12px', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#166534', fontSize: '1rem', fontWeight: 800 }}>
                {visaResult.visa_required ? '🛂 Visa Required' : '🎉 Visa Free / eVoucher Entry'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#14532D', lineHeight: 1.5 }}>
                {visaResult.text_details || visaResult.summary || 'Official entry guidelines fetched.'}
              </p>
            </div>
          )}

          <ToolCommunityFooter toolId="visa-checker" toolName="Live Visa Requirement Checker" summaryText="Instant visa rules for 190+ nationalities entering Singapore, Malaysia & SE Asia." />
        </div>

        {/* IN-FEED ADSENSE BANNER SPACE */}
        <div style={{ margin: '2.5rem 0' }}>
          <AdBanner slotId="7788990022" format="horizontal" />
        </div>

        {/* ✈️ AIRLABS LIVE FLIGHT RADAR & STATUS TRACKER */}
        {!sanitySettings.hideFlightTracker && (
          <div id="tool-flight-radar" style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A365D', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Plane size={22} color="#059669" /> AirLabs Real-Time Flight Radar & Changi Status
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#718096', margin: '0.25rem 0 0' }}>
                  Track live flight status, arrivals, departures, terminals, and gates in real time.
                </p>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', padding: '0.25rem 0.65rem', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} /> Live AirLabs Data
              </span>
            </div>

            <form onSubmit={handleSearchFlight} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div style={{ flex: '1 1 280px', position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Enter Flight Number (e.g. SQ423, 6E53, AI380, MH601)..." 
                  value={flightNumberInput}
                  onChange={e => setFlightNumberInput(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.92rem', fontWeight: 600, background: '#F8FAFC' }}
                />
                <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <button 
                type="submit"
                disabled={flightLoading}
                style={{ padding: '0.75rem 1.75rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0F4C3A 0%, #059669 100%)', color: '#FFF', fontWeight: 700, fontSize: '0.9rem', cursor: flightLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 3px 10px rgba(5,150,105,0.2)' }}
              >
                {flightLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                <span>Track Flight</span>
              </button>
            </form>

            <ToolCommunityFooter toolId="flight-radar" toolName="Live Flight Radar" summaryText="Track live Singapore & Malaysia flights, arrivals, departures, and gate numbers." />
          </div>
        )}

        {/* 🧮 CURRENCY CONVERTER & MEAL ESTIMATOR */}
        {!sanitySettings.hideCurrencyConverter && (
          <div id="tool-currency-converter" style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A365D', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Calculator size={22} color="#059669" /> Live SGD / INR / MYR Currency Converter & Daily Meal Estimator
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              
              {/* Currency Converter */}
              <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F4C3A', textTransform: 'uppercase' }}>💱 Currency Calculator</span>
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>SGD Amount</label>
                    <input
                      type="number"
                      value={amountSgd}
                      onChange={e => setAmountSgd(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '1rem', fontWeight: 700 }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Equivalent INR:</span>
                    <strong style={{ fontSize: '1rem', color: '#0F4C3A' }}>₹{Math.round(amountSgd * sgdToInrRate).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Meal Budget Estimator */}
              <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F4C3A', textTransform: 'uppercase' }}>🍽️ Meal Budget Estimator</span>
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>Adults ({adults}) & Kids ({kids})</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F4C3A' }}>{days} Days</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Total Meal Budget:</span>
                    <strong style={{ fontSize: '1rem', color: '#0F4C3A' }}>SGD ${totalMealCostSgd} (₹{totalMealCostInr.toLocaleString()})</strong>
                  </div>
                </div>
              </div>

            </div>

            <ToolCommunityFooter toolId="currency-converter" toolName="Live Currency & Meal Estimator" summaryText="Calculate live SGD to INR rates and estimate daily food expenses for Singapore & Malaysia." />
          </div>
        )}

        {/* 🎒 PACKING & TRAVEL PREPARATION CHECKLIST */}
        {!sanitySettings.hideInteractiveChecklist && (
          <div id="tool-packing-checklist" style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A365D', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckSquare size={22} color="#059669" /> Interactive Singapore & Malaysia Travel Packing Checklist
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#718096', margin: '0.25rem 0 0' }}>
                  Check off essential travel documents, electronic gear, and arrival forms.
                </p>
              </div>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.4rem 0.85rem', borderRadius: '12px', textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700, display: 'block' }}>Trip Readiness</span>
                <strong style={{ fontSize: '1rem', color: '#15803D' }}>{readinessPercent}% Ready</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {[
                { key: 'passport', label: 'Passport (6+ Months Validity)' },
                { key: 'sgac', label: 'SG Arrival Card (SGAC)' },
                { key: 'mdac', label: 'Malaysia Digital Arrival Card (MDAC)' },
                { key: 'insurance', label: 'Travel Insurance Documents' },
                { key: 'tickets', label: 'Flight & Attraction eVouchers' },
                { key: 'adapter', label: 'UK 3-Pin Universal Adapter' },
                { key: 'forex', label: 'SGD / MYR Forex Cash & Cards' },
                { key: 'sim', label: 'eSIM / Local Tourist SIM' }
              ].map(item => (
                <div
                  key={item.key}
                  onClick={() => toggleCheck(item.key)}
                  style={{
                    background: checkedItems[item.key] ? '#ECFDF5' : '#F8FAFC',
                    border: checkedItems[item.key] ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: checkedItems[item.key] ? '#047857' : '#475569'
                  }}
                >
                  <CheckCircle2 size={18} color={checkedItems[item.key] ? '#059669' : '#94A3B8'} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <ToolCommunityFooter toolId="packing-checklist" toolName="Singapore & Malaysia Packing Checklist" summaryText="Essential 8-item travel checklist for Singapore & Malaysia trips." />
          </div>
        )}

        {/* BOTTOM ADSENSE BANNER SPACE */}
        <div style={{ margin: '2.5rem 0' }}>
          <AdBanner slotId="7788990033" format="horizontal" />
        </div>

      </div>

      {/* ══ MY SAVED TRIP KIT MODAL DRAWER WITH FULL PRINTABLE SUMMARY ══ */}
      {showTripKitModal && (
        <div
          onClick={() => setShowTripKitModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(6px)',
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
              width: '680px',
              maxWidth: '94vw',
              maxHeight: '88vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '2rem',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid #E2E8F0'
            }}
          >
            <button onClick={() => setShowTripKitModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', color: '#64748B', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>

            {/* Printable Branding Header */}
            <div style={{ borderBottom: '2px solid #0F4C3A', paddingBottom: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#0F4C3A', fontWeight: 900, fontSize: '1.15rem', letterSpacing: '0.05em' }}>FLYING WONDERS</span>
                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                  ⭐ My Official Travel Kit & Checklist
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px' }}>
                {new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Complete Summary Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* 1. Official Arrival Card Portals */}
              <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                <strong style={{ fontSize: '0.88rem', color: '#166534', display: 'block', marginBottom: '0.4rem' }}>
                  🇸🇬 Singapore & 🇲🇾 Malaysia Official Arrival Cards
                </strong>
                <p style={{ fontSize: '0.78rem', color: '#14532D', margin: '0 0 0.5rem', lineHeight: 1.55 }}>
                  • <strong>SGAC (Singapore):</strong> Submit free at <a href={sgacLink} target="_blank" rel="noreferrer" style={{ color: '#059669', fontWeight: 700 }}>ica.gov.sg</a> within 3 days before entry.
                  <br />
                  • <strong>MDAC (Malaysia):</strong> Submit free at <a href={mdacLink} target="_blank" rel="noreferrer" style={{ color: '#1D4ED8', fontWeight: 700 }}>imigresen.gov.my</a> within 3 days before entry.
                  <br />
                  • <strong>Air Suvidha (India):</strong> Official declaration portal at <a href={airSuvidhaLink} target="_blank" rel="noreferrer" style={{ color: '#EA580C', fontWeight: 700 }}>airsuvidha.gov.in</a>.
                </p>
              </div>

              {/* 2. Packing Checklist Summary */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <strong style={{ fontSize: '0.88rem', color: '#0F4C3A', display: 'block', marginBottom: '0.4rem' }}>
                  🎒 Packing Readiness Status ({readinessPercent}% Completed)
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {[
                    { key: 'passport', label: 'Passport (6+ Mos Validity)' },
                    { key: 'sgac', label: 'SG Arrival Card (SGAC)' },
                    { key: 'mdac', label: 'Malaysia MDAC' },
                    { key: 'insurance', label: 'Travel Insurance' },
                    { key: 'tickets', label: 'Flight & Attraction Tickets' },
                    { key: 'adapter', label: 'UK 3-Pin Adapter' },
                    { key: 'forex', label: 'SGD / MYR Currency' },
                    { key: 'sim', label: 'eSIM / Tourist SIM' }
                  ].map(item => (
                    <span key={item.key} style={{ fontSize: '0.75rem', color: checkedItems[item.key] ? '#047857' : '#94A3B8', fontWeight: 700 }}>
                      {checkedItems[item.key] ? '✅' : '⬜'} {item.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3. Currency & Daily Meal Summary */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <strong style={{ fontSize: '0.88rem', color: '#0F4C3A', display: 'block', marginBottom: '0.4rem' }}>
                  💱 Currency & Estimated Food Expense Summary
                </strong>
                <p style={{ fontSize: '0.78rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                  • <strong>Exchange Rate:</strong> 1 SGD ≈ ₹{sgdToInrRate} INR
                  <br />
                  • <strong>Estimated Food Budget ({adults} Adults, {kids} Kids, {days} Days):</strong> SGD ${totalMealCostSgd} (Approx. ₹{totalMealCostInr.toLocaleString()})
                </p>
              </div>

              {/* Saved Tools Specific Items */}
              {savedKitIds.length > 0 && (
                <div style={{ background: '#FFFBEB', padding: '1rem', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                  <strong style={{ fontSize: '0.88rem', color: '#92400E', display: 'block', marginBottom: '0.4rem' }}>
                    ⭐ Saved Tools List ({savedKitIds.length})
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {savedKitIds.map(id => (
                      <span key={id} style={{ background: '#FEF3C7', color: '#B45309', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>
                        ✓ {id.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => window.print()}
                style={{ background: '#0F4C3A', color: '#FFF', border: 'none', padding: '0.65rem 1.4rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(15,76,58,0.25)' }}
              >
                <Printer size={16} /> Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
