'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPin, Clock, Calendar, Users, DollarSign, CheckCircle2, ChevronDown,
  ChevronUp, Sparkles, Compass, Bus, ShieldCheck, HeartHandshake, PhoneCall,
  Send, AlertCircle, Award, ArrowRight, Star, ExternalLink, Shield, Coffee,
  Camera, Landmark, Trees, Waves, Mountain, Sun, Filter, X, Tag, ListFilter,
  FileText, Info, AlertTriangle, ChevronRight, Image as ImageIcon
} from 'lucide-react'
import { client } from '../../sanity/lib/client'
import { urlForImage } from '../../sanity/lib/image'

interface ItineraryItem {
  timeOrDay: string
  title: string
  description?: string
  places?: string[]
}

interface PackageCircuit {
  _id?: string
  id?: string
  title: string
  slug?: { current?: string } | string
  kstdcUrl?: string
  kstdcCode?: string
  subtitle: string
  category: 'city' | 'heritage' | 'hills' | 'coastal' | 'pilgrimage'
  duration: string
  departureTime?: string
  returnTime?: string
  departureLocation?: string
  operatingDays?: string
  placesCovered?: string[]
  priceINR: number
  priceSGD: number
  badge?: string
  rating: number
  reviewsCount: number
  image?: any
  imageUrl?: string
  highlights: string[]
  inclusions: string[]
  exclusions?: string[]
  importantNotes?: string[]
  itinerary?: ItineraryItem[]
}

interface KarnatakaSettings {
  whatsappNumber?: string
  heroBadge?: string
  heroTitle?: string
  heroSubtitle?: string
  hohoTitle?: string
  hohoPriceINR?: number
  hohoTimings?: string
  hohoBoardingHub?: string
}

const DEFAULT_SETTINGS: KarnatakaSettings = {
  whatsappNumber: '6596890101',
  heroBadge: 'One State • Many Worlds • Official KSTDC Bengaluru Circuits',
  heroTitle: 'Official Karnataka Tour Packages from Bengaluru',
  heroSubtitle: 'Explore royal palaces, UNESCO ruins, misty coffee hills, coastal temples, and the Bengaluru HOHO Double-Decker bus. Instant WhatsApp booking & customized family departures.',
  hohoTitle: 'Bengaluru Hop-On Hop-Off (HOHO) Ambaari Double-Decker',
  hohoPriceINR: 180,
  hohoTimings: '10:30 AM – 8:00 PM',
  hohoBoardingHub: 'Ravindra Kalakshetra, JC Road, Bengaluru',
}

// Banner Quick Jump Navigation Items
const BANNER_QUICK_LINKS = [
  { label: '🚌 HOHO Double-Decker (₹180)', targetId: 'bangalore-hoho-service' },
  { label: '🏛️ Bengaluru City Day Tour (₹340)', targetId: 'bengaluru-city-tour' },
  { label: '🐅 Bannerghatta Safari & ISKCON', targetId: 'bengaluru-full-day-trip' },
  { label: '👑 Mysuru Palace & KRS (₹850)', targetId: 'mysuru-sight-seeing-from-bengaluru' },
  { label: '🛕 Belur-Halebidu Hoysala', targetId: 'world-heritage-monuments-tour-belur-halebeedu-shravanabelagola' },
  { label: '🏰 North Karnataka (Hampi-Badami)', targetId: 'north-karnataka-tour-hampi-badami-bijapur' },
  { label: '☕ Coorg Nature Holiday', targetId: 'coorg-nature-holiday-bengaluru' },
  { label: '🏖️ Goa-Gokarna-Jog Falls', targetId: 'goa-gokarna-jog-falls-tour' },
  { label: '🚂 Mysuru-Ooty Classic', targetId: 'bengaluru-mysuru-ooty-package-tour' },
  { label: '🙏 Tirupathi Balaji Package', targetId: 'tirupathi-balaji-package-bengaluru' },
]

export default function KarnatakaPage() {
  const [settings, setSettings] = useState<KarnatakaSettings>(DEFAULT_SETTINGS)
  const [packages, setPackages] = useState<PackageCircuit[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeCardTabs, setActiveCardTabs] = useState<Record<string, 'details' | 'itinerary'>>({})
  const [activeModalPackage, setActiveModalPackage] = useState<PackageCircuit | null>(null)
  const [modalTab, setModalTab] = useState<'details' | 'itinerary'>('details')
  const [selectedTravelDate, setSelectedTravelDate] = useState<string>('')
  const [selectedTravelers, setSelectedTravelers] = useState<number>(2)
  const [customNotes, setCustomNotes] = useState<string>('')
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null)
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null)

  // Fetch live Sanity settings & packages on mount
  useEffect(() => {
    async function loadSanityData() {
      try {
        const [sanitySettings, sanityPackages] = await Promise.all([
          client.fetch(`*[_type == "karnatakaSettings"][0]`),
          client.fetch(`*[_type == "karnatakaPackage"] | order(order asc)`)
        ])

        if (sanitySettings) {
          setSettings(prev => ({ ...prev, ...sanitySettings }))
        }
        if (Array.isArray(sanityPackages) && sanityPackages.length > 0) {
          setPackages(sanityPackages.map(p => ({
            ...p,
            id: p.slug?.current || p._id || p.id
          })))
        }
      } catch (err) {
        console.error('Error fetching Karnataka data from Sanity:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSanityData()
  }, [])

  const whatsappPhone = (settings.whatsappNumber || '6596890101').replace(/[^0-9]/g, '')

  const resolvePackageImage = (pkg: PackageCircuit): string => {
    if (pkg.image && (pkg.image.asset || pkg.image._ref)) {
      try {
        const url = urlForImage(pkg.image)?.width(900).height(560).quality(85).url()
        if (url) return url
      } catch (e) {
        // fallback
      }
    }
    return pkg.imageUrl || 'https://images.unsplash.com/photo-1600100397608-f010f443b81a?w=900&auto=format&fit=crop&q=80'
  }

  const scrollToCard = (targetId: string) => {
    const el = document.getElementById(targetId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedCardId(targetId)
      setTimeout(() => setHighlightedCardId(null), 2500)
    }
  }

  const toggleCardTab = (cardId: string, tab: 'details' | 'itinerary') => {
    setActiveCardTabs(prev => ({ ...prev, [cardId]: tab }))
  }

  const filteredPackages = activeCategory === 'all'
    ? packages
    : packages.filter(p => p.category === activeCategory)

  const buildWhatsAppLink = (pkg: PackageCircuit) => {
    let msg = `Namaskara! 🙏 I am interested in booking the tour package: *${pkg.title}* (${pkg.duration}).\n\n`
    if (pkg.kstdcCode) msg += `🔖 *Tour Ref:* ${pkg.kstdcCode}\n`
    msg += `💰 *Tariff:* ₹${pkg.priceINR?.toLocaleString()} (approx S$ ${pkg.priceSGD}) per person\n`
    if (selectedTravelDate) msg += `📅 *Preferred Travel Date:* ${selectedTravelDate}\n`
    if (selectedTravelers) msg += `👥 *Number of Pax:* ${selectedTravelers} Travelers\n`
    if (customNotes) msg += `📝 *Notes/Customization:* ${customNotes}\n`
    msg += `\nPlease confirm seat availability, pickup details, and hotel booking options. Thank you!`
    return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(msg)}`
  }

  const buildGeneralWhatsAppLink = () => {
    const msg = `Namaskara! 🙏 I would like to enquire about Karnataka tour packages from Bengaluru.\n\nPlease connect me with your travel desk.`
    return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(msg)}`
  }

  const buildHohoWhatsAppLink = () => {
    const msg = `Namaskara! 🙏 I would like to book the *Bengaluru Hop-On Hop-Off (HOHO) Ambaari Double-Decker Bus Tour* (₹${settings.hohoPriceINR || 180}/pax).\n\nPlease share boarding timings and seat reservation details.`
    return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div style={{ background: '#F8FAFC', color: '#1E293B', minHeight: '100vh' }}>
      
      {/* ── Breadcrumb Navigation ── */}
      <div style={{ background: '#FFF', borderBottom: '1px solid #E2E8F0', padding: '0.6rem 1.5rem', fontSize: '0.78rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B' }}>
          <Link href="/" style={{ color: '#0F4C3A', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <span>/</span>
          <Link href="/services-catalog" style={{ color: '#0F4C3A', textDecoration: 'none', fontWeight: 600 }}>Services</Link>
          <span>/</span>
          <span style={{ color: '#0F172A', fontWeight: 700 }}>Karnataka Tour Packages</span>
        </div>
      </div>

      {/* ── Compact Header Banner ── */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #093E30 0%, #0F4C3A 55%, #173650 100%)',
        color: '#FFF',
        padding: 'clamp(1.75rem, 3.2vw, 2.5rem) 1.5rem',
        overflow: 'hidden'
      }}>
        {/* Subtle backdrop pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(15,76,58,0.25) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            
            {/* Left Header Column */}
            <div style={{ flex: '1 1 640px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(212,175,55,0.22)', border: '1px solid rgba(212,175,55,0.45)', padding: '0.2rem 0.7rem', borderRadius: '16px', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem' }}>🇮🇳</span>
                <span style={{ color: '#FDE047', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {settings.heroBadge || 'One State • Many Worlds • Official KSTDC Bengaluru Circuits'}
                </span>
              </div>

              {/* Pure High-Contrast White Heading */}
              <h1 style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: 'clamp(1.75rem, 3.4vw, 2.5rem)',
                fontWeight: 900,
                lineHeight: 1.2,
                color: '#FFFFFF',
                margin: '0 0 0.55rem',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                Explore Magnificent <span style={{ color: '#FDE047' }}>Karnataka</span> Tour Packages
              </h1>

              <p style={{
                fontSize: 'clamp(0.85rem, 1.25vw, 0.94rem)',
                lineHeight: 1.5,
                maxWidth: '680px',
                color: '#F1F5F9',
                fontWeight: 400,
                margin: '0 0 1rem'
              }}>
                {settings.heroSubtitle || 'Explore royal palaces, UNESCO ruins, misty coffee hills, coastal temples, and the Bengaluru HOHO Double-Decker bus. Instant WhatsApp booking & customized family departures.'}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
                <a
                  href={buildGeneralWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: '#25D366',
                    color: '#FFF',
                    padding: '0.6rem 1.35rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
                    transition: 'transform 0.15s'
                  }}
                >
                  <span>💬</span> Book via WhatsApp
                </a>

                <a
                  href="#circuits"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#FFF',
                    padding: '0.6rem 1.15rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    textDecoration: 'none',
                    transition: 'background 0.15s'
                  }}
                >
                  <span>📋</span> View All Packages ({packages.length})
                </a>
              </div>
            </div>

            {/* Right Mini Trust Box */}
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', padding: '0.85rem 1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FDE047' }}>11+</div>
                <div style={{ fontSize: '0.68rem', color: '#E2E8F0', fontWeight: 600 }}>Tour Circuits</div>
              </div>
              <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FDE047' }}>₹180</div>
                <div style={{ fontSize: '0.68rem', color: '#E2E8F0', fontWeight: 600 }}>HOHO Bus</div>
              </div>
              <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FDE047' }}>4.9★</div>
                <div style={{ fontSize: '0.68rem', color: '#E2E8F0', fontWeight: 600 }}>Guest Rating</div>
              </div>
            </div>

          </div>

          {/* ── Banner Interactive Quick-Links to Cards ── */}
          <div style={{ marginTop: '1.1rem', paddingTop: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: '0.68rem', color: '#CBD5E1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>
              ⚡ Quick Jump to Tour Itinerary & Details:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {BANNER_QUICK_LINKS.map((link, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToCard(link.targetId)}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    padding: '0.28rem 0.65rem',
                    borderRadius: '12px',
                    fontSize: '0.73rem',
                    fontWeight: 600,
                    color: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(212,175,55,0.35)'
                    e.currentTarget.style.color = '#FFF'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                    e.currentTarget.style.color = '#F8FAFC'
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── SPOTLIGHT: Bengaluru Hop-On Hop-Off (HOHO) Ambaari Bus ── */}
      <section id="bangalore-hoho-service" style={{ padding: 'clamp(2rem, 4vw, 3rem) 1.5rem', background: '#FFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 45%, #FFFBEB 100%)',
            borderRadius: '18px',
            border: '2px solid #F59E0B',
            padding: 'clamp(1.5rem, 3vw, 2.25rem)',
            boxShadow: '0 8px 24px rgba(245,158,11,0.12)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem',
            alignItems: 'center'
          }}>
            
            {/* Left Content */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#D97706', color: '#FFF', padding: '0.2rem 0.65rem', borderRadius: '16px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
                <Bus size={13} /> Official Double-Decker Service Ref: KSTDC-HOHO
              </div>

              <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.4rem, 2.8vw, 2rem)', fontWeight: 900, color: '#78350F', margin: '0 0 0.65rem', lineHeight: 1.25 }}>
                {settings.hohoTitle || 'Bengaluru Hop-On Hop-Off (HOHO) Ambaari Double-Decker'}
              </h2>

              <p style={{ fontSize: '0.86rem', color: '#92400E', lineHeight: 1.55, marginBottom: '1.1rem' }}>
                Explore Bengaluru’s iconic Central Business District from the open rooftop of the <strong>Ambaari Double-Decker bus</strong>. Enjoy complete flexibility to hop off at museums, galleries, and government heritage buildings, then board any following circular bus.
              </p>

              {/* Key Highlights Info Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', marginBottom: '1.1rem' }}>
                <div style={{ background: '#FFF', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid #FCD34D' }}>
                  <div style={{ fontSize: '0.66rem', color: '#B45309', fontWeight: 800, textTransform: 'uppercase' }}>Ticket Fare</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#78350F' }}>₹{settings.hohoPriceINR || 180} / pax</div>
                  <div style={{ fontSize: '0.65rem', color: '#92400E' }}>Kids &lt; 5 years Free</div>
                </div>

                <div style={{ background: '#FFF', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid #FCD34D' }}>
                  <div style={{ fontSize: '0.66rem', color: '#B45309', fontWeight: 800, textTransform: 'uppercase' }}>Operating Hours</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#78350F' }}>{settings.hohoTimings || '10:30 AM – 8 PM'}</div>
                  <div style={{ fontSize: '0.65rem', color: '#92400E' }}>Regular circular trips</div>
                </div>

                <div style={{ background: '#FFF', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid #FCD34D' }}>
                  <div style={{ fontSize: '0.66rem', color: '#B45309', fontWeight: 800, textTransform: 'uppercase' }}>Boarding Hub</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#78350F' }}>Ravindra Kalakshetra</div>
                  <div style={{ fontSize: '0.65rem', color: '#92400E' }}>Town Hall / JC Road</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
                <a
                  href={buildHohoWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: '#0F4C3A',
                    color: '#FFF',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(15,76,58,0.25)'
                  }}
                >
                  <span>💬</span> Book HOHO Bus on WhatsApp
                </a>

                <span style={{ fontSize: '0.74rem', color: '#92400E', fontWeight: 600 }}>
                  ⚡ Instant WhatsApp ticket reservation & seat check
                </span>
              </div>

            </div>

            {/* Right: Route Stops Visual Box */}
            <div style={{ background: '#FFF', borderRadius: '14px', border: '1px solid #FCD34D', padding: '1.15rem', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="#D97706" /> HOHO Ambaari Circular Stops:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {[
                  { step: '1', title: 'Ravindra Kalakshetra', desc: 'Main Boarding & Ticket Hub (JC Road / Town Hall)' },
                  { step: '2', title: 'Corporation & Hudson Circle', desc: 'Historic Bangalore City Corporation corridor' },
                  { step: '3', title: 'Kasturba Road & Cubbon Park', desc: 'Lush green lung space of Bengaluru' },
                  { step: '4', title: 'Visvesvaraya Industrial & Tech Museum', desc: 'Interactive science exhibits & art gallery' },
                  { step: '5', title: 'M. Chinnaswamy Cricket Stadium', desc: 'World-famous cricket arena & MG Road junction' },
                  { step: '6', title: 'General Post Office (GPO)', desc: 'Colonial heritage architecture' },
                  { step: '7', title: 'High Court of Karnataka (Attara Kacheri)', desc: 'Magnificent red neoclassical building' },
                  { step: '8', title: 'Vidhana Soudha', desc: 'Imposing seat of Karnataka State Legislature' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#F59E0B', color: '#FFF', fontSize: '0.64rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      {item.step}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.78rem', color: '#1E293B', display: 'block' }}>{item.title}</strong>
                      <span style={{ fontSize: '0.68rem', color: '#64748B' }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── Tour Circuits Grid Section ── */}
      <section id="circuits" style={{ padding: 'clamp(2rem, 4vw, 3.5rem) 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <span style={{ background: '#E0F2FE', color: '#0369A1', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.7rem', borderRadius: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Handcrafted Circuits
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900, color: '#0F4C3A', margin: '0.45rem 0 0.35rem' }}>
              Karnataka Tour Packages from Bengaluru
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748B', maxWidth: '650px', margin: '0 auto' }}>
              View detailed places covered, timings, and day-by-day itineraries. Every tour package can be booked directly or customized with private family vehicles.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.75rem' }}>
            {[
              { id: 'all', label: `🌟 All Packages (${packages.length})` },
              { id: 'city', label: '🚌 Bengaluru City & HOHO' },
              { id: 'heritage', label: '🏛️ Heritage & UNESCO' },
              { id: 'hills', label: '☕ Hills & Nature' },
              { id: 'coastal', label: '🏖️ Coastal & Waterfalls' },
              { id: 'pilgrimage', label: '🙏 Pilgrimage & Temples' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '20px',
                  border: activeCategory === tab.id ? 'none' : '1px solid #CBD5E1',
                  background: activeCategory === tab.id ? '#0F4C3A' : '#FFF',
                  color: activeCategory === tab.id ? '#FFF' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: activeCategory === tab.id ? '0 4px 10px rgba(15,76,58,0.2)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Packages Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {filteredPackages.map(pkg => {
              const cardId = pkg.id || (typeof pkg.slug === 'string' ? pkg.slug : pkg.slug?.current) || pkg._id || ''
              const isCardHighlighted = highlightedCardId === cardId
              const currentTab = activeCardTabs[cardId] || 'details'
              const coverImg = resolvePackageImage(pkg)

              return (
                <div
                  key={pkg._id || pkg.id || cardId}
                  id={cardId}
                  style={{
                    background: '#FFF',
                    borderRadius: '14px',
                    border: isCardHighlighted ? '2.5px solid #D4AF37' : '1px solid #E2E8F0',
                    boxShadow: isCardHighlighted ? '0 0 25px rgba(212,175,55,0.45)' : '0 2px 12px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    transform: isCardHighlighted ? 'scale(1.02)' : 'none'
                  }}
                >
                  
                  <div>
                    {/* ── CARD HERO IMAGE SHOWCASE (16:9) ── */}
                    <div style={{ height: '195px', width: '100%', position: 'relative', overflow: 'hidden', background: '#0F172A' }}>
                      <img
                        src={coverImg}
                        alt={pkg.title}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
                      />

                      {/* Scrim overlay for contrast */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)',
                        pointerEvents: 'none'
                      }} />

                      {/* Top Left: Tour Code & Badge */}
                      <div style={{ position: 'absolute', top: '0.65rem', left: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {pkg.kstdcCode && (
                          <span style={{
                            background: '#0F4C3A',
                            color: '#FFF',
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            padding: '0.18rem 0.5rem',
                            borderRadius: '6px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            letterSpacing: '0.04em'
                          }}>
                            {pkg.kstdcCode}
                          </span>
                        )}
                        {pkg.badge && (
                          <span style={{
                            background: '#D4AF37',
                            color: '#0F172A',
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            padding: '0.18rem 0.5rem',
                            borderRadius: '6px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                          }}>
                            {pkg.badge}
                          </span>
                        )}
                      </div>

                      {/* Bottom Left: Duration Pill */}
                      <span style={{
                        position: 'absolute',
                        bottom: '0.65rem',
                        left: '0.65rem',
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(6px)',
                        color: '#FFF',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.18rem 0.55rem',
                        borderRadius: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        ⏱️ {pkg.duration}
                      </span>

                      {/* Bottom Right: Starting Tariff Badge */}
                      <span style={{
                        position: 'absolute',
                        bottom: '0.65rem',
                        right: '0.65rem',
                        background: 'rgba(9,62,48,0.92)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(212,175,55,0.4)',
                        color: '#FDE047',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        padding: '0.18rem 0.55rem',
                        borderRadius: '10px'
                      }}>
                        ₹{pkg.priceINR?.toLocaleString()} (~S${pkg.priceSGD})
                      </span>
                    </div>

                    {/* Card Content Body */}
                    <div style={{ padding: '1.15rem' }}>
                      
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.35rem', lineHeight: 1.3 }}>
                        {pkg.title}
                      </h3>

                      <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.45, margin: '0 0 0.75rem' }}>
                        {pkg.subtitle}
                      </p>

                      {/* Timings & Departure Hub info */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.55rem 0.7rem', marginBottom: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.72rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
                          <Clock size={13} color="#0F4C3A" />
                          <span><strong>Dep:</strong> {pkg.departureTime || 'TBA'} | <strong>Ret:</strong> {pkg.returnTime || 'TBA'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B' }}>
                          <MapPin size={13} color="#D97706" />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {pkg.departureLocation || 'BMTC Yeshwanthpura, Bengaluru'}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Tabs within Card: Details vs Itinerary */}
                      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: '0.7rem' }}>
                        <button
                          type="button"
                          onClick={() => toggleCardTab(cardId, 'details')}
                          style={{
                            flex: 1,
                            padding: '0.35rem',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: currentTab === 'details' ? '#0F4C3A' : '#64748B',
                            borderBottom: currentTab === 'details' ? '2px solid #0F4C3A' : '2px solid transparent',
                            cursor: 'pointer'
                          }}
                        >
                          📋 Details & Inclusions
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCardTab(cardId, 'itinerary')}
                          style={{
                            flex: 1,
                            padding: '0.35rem',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: currentTab === 'itinerary' ? '#0F4C3A' : '#64748B',
                            borderBottom: currentTab === 'itinerary' ? '2px solid #0F4C3A' : '2px solid transparent',
                            cursor: 'pointer'
                          }}
                        >
                          🗺️ Itinerary ({pkg.itinerary?.length || 0})
                        </button>
                      </div>

                      {/* Tab 1: Details View */}
                      {currentTab === 'details' && (
                        <div style={{ fontSize: '0.74rem', color: '#475569' }}>
                          {pkg.placesCovered && pkg.placesCovered.length > 0 && (
                            <div style={{ marginBottom: '0.6rem' }}>
                              <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                📍 Places Covered ({pkg.placesCovered.length}):
                              </strong>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                {pkg.placesCovered.map((place, pIdx) => (
                                  <span key={pIdx} style={{ background: '#F1F5F9', color: '#334155', padding: '0.12rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem' }}>
                                    {place}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                              ✅ Inclusions:
                            </strong>
                            <ul style={{ margin: 0, paddingLeft: '1rem', lineHeight: 1.4 }}>
                              {pkg.inclusions.slice(0, 3).map((inc, iIdx) => (
                                <li key={iIdx}>{inc}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Itinerary Timeline View */}
                      {currentTab === 'itinerary' && (
                        <div style={{ fontSize: '0.72rem', color: '#475569', maxHeight: '160px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                          {pkg.itinerary && pkg.itinerary.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {pkg.itinerary.map((item, idx) => (
                                <div key={idx} style={{ borderLeft: '2px solid #0F4C3A', paddingLeft: '0.5rem' }}>
                                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.7rem' }}>
                                    <span style={{ color: '#D97706' }}>{item.timeOrDay}</span> — {item.title}
                                  </div>
                                  {item.description && (
                                    <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.1rem' }}>
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontStyle: 'italic', color: '#94A3B8' }}>Detailed itinerary available on inquiry.</p>
                          )}
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Card Footer: Tariff & Actions */}
                  <div style={{ padding: '0.85rem 1.15rem', borderTop: '1px solid #F1F5F9', background: '#FAFBFD', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    
                    <div>
                      <div style={{ fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Starting Tariff</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F4C3A' }}>
                          ₹{pkg.priceINR?.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                          (~S${pkg.priceSGD})
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalPackage(pkg)
                          setModalTab('details')
                        }}
                        style={{
                          padding: '0.4rem 0.7rem',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          background: '#FFF',
                          color: '#334155',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          cursor: 'pointer'
                        }}
                      >
                        Full Details
                      </button>

                      <a
                        href={buildWhatsAppLink(pkg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '0.4rem 0.85rem',
                          borderRadius: '6px',
                          background: '#25D366',
                          color: '#FFF',
                          fontWeight: 800,
                          fontSize: '0.76rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          boxShadow: '0 2px 8px rgba(37,211,102,0.2)'
                        }}
                      >
                        <span>💬</span> Book Now
                      </a>
                    </div>

                  </div>

                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section style={{ padding: 'clamp(2rem, 4vw, 3.5rem) 1.5rem', background: '#FFF', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <span style={{ background: '#E0E7FF', color: '#3730A3', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.7rem', borderRadius: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Travel Guidelines
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 900, color: '#0F4C3A', margin: '0.45rem 0 0.35rem' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              {
                q: 'Where is the main boarding location for tour packages in Bengaluru?',
                a: 'Most tour packages depart from the Booking Counter at the BMTC Bus Stand, Yeshwanthpura, Bengaluru. The Hop-On Hop-Off (HOHO) Ambaari double-decker bus departs from Ravindra Kalakshetra on JC Road (opposite Town Hall).'
              },
              {
                q: 'Can we customize tours with private cabs or tempo travellers for our family?',
                a: 'Yes! Flying Wonders provides both standard coach tour bookings and private customized chauffeur-driven tours (Toyota Innova Crysta, Ertiga, Tempo Traveller) with door-to-door Bengaluru pickup and flexible sightseeing timings.'
              },
              {
                q: 'What identity documents are mandatory for passengers?',
                a: 'All passengers (including children) must carry valid original government-issued photo ID proof (Aadhaar Card, Passport, Driving License, or Voter ID). For Tirupathi packages, ID verification is strictly enforced by TTD scanning counters.'
              },
              {
                q: 'How does the booking process work since checkout routes to WhatsApp?',
                a: 'Click "Book Now" or "Full Details" on any package. It generates a pre-filled WhatsApp message with the exact tour code, route, and your preferred dates. Our team checks real-time seat availability, provides digital payment links (UPI / Cards), and sends your confirmed ticket voucher.'
              }
            ].map((faq, idx) => {
              const isOpen = activeFaqIndex === idx
              return (
                <div
                  key={idx}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '0.9rem 1.15rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      color: '#0F172A',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} color="#0F4C3A" /> : <ChevronDown size={16} color="#64748B" />}
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 1.15rem 0.9rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.55 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ── Final Call to Action ── */}
      <section style={{
        background: 'linear-gradient(135deg, #093E30 0%, #0F4C3A 100%)',
        color: '#FFF',
        padding: 'clamp(2.2rem, 4vw, 3.2rem) 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <span style={{ background: 'rgba(212,175,55,0.2)', color: '#FDE047', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.7rem', borderRadius: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Book Your Karnataka Holiday
          </span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)', fontWeight: 900, color: '#FFFFFF', margin: '0.5rem 0 0.65rem' }}>
            Need Assistance with Tour Bookings?
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#E2E8F0', maxWidth: '580px', margin: '0 auto 1.35rem', fontWeight: 300 }}>
            Chat with our Karnataka tour specialists on WhatsApp. Get instant seat availability, customized vehicle options, and hotel recommendations.
          </p>

          <a
            href={buildGeneralWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#25D366',
              color: '#FFF',
              padding: '0.75rem 1.75rem',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '0.9rem',
              textDecoration: 'none',
              boxShadow: '0 6px 18px rgba(37,211,102,0.35)'
            }}
          >
            <span>💬</span> Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* ── Full Modal: Details & Itinerary Tabs with WhatsApp Customizer ── */}
      {activeModalPackage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '18px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            
            {/* Modal Image Header (16:9) */}
            <div style={{ height: '220px', width: '100%', position: 'relative', overflow: 'hidden', background: '#0F172A' }}>
              <img
                src={resolvePackageImage(activeModalPackage)}
                alt={activeModalPackage.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)' }} />

              <button
                type="button"
                onClick={() => setActiveModalPackage(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#FFF',
                  zIndex: 10
                }}
              >
                <X size={16} />
              </button>

              {/* Title & Badges on Header */}
              <div style={{ position: 'absolute', bottom: '0.85rem', left: '1.15rem', right: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                  {activeModalPackage.kstdcCode && (
                    <span style={{ background: '#0F4C3A', color: '#FFF', fontSize: '0.66rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {activeModalPackage.kstdcCode}
                    </span>
                  )}
                  <span style={{ background: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: '0.66rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    {activeModalPackage.duration}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFF', margin: 0, lineHeight: 1.25 }}>
                  {activeModalPackage.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.35rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.45, margin: '0 0 0.85rem' }}>
                {activeModalPackage.subtitle}
              </p>

              {/* Modal Navigation Tabs: Details vs Itinerary */}
              <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: '1.15rem' }}>
                <button
                  type="button"
                  onClick={() => setModalTab('details')}
                  style={{
                    padding: '0.45rem 0.9rem',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: modalTab === 'details' ? '#0F4C3A' : '#64748B',
                    borderBottom: modalTab === 'details' ? '2.5px solid #0F4C3A' : '2.5px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  📋 Overview & Inclusions
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('itinerary')}
                  style={{
                    padding: '0.45rem 0.9rem',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: modalTab === 'itinerary' ? '#0F4C3A' : '#64748B',
                    borderBottom: modalTab === 'itinerary' ? '2.5px solid #0F4C3A' : '2.5px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  🗺️ Full Itinerary Timeline ({activeModalPackage.itinerary?.length || 0})
                </button>
              </div>

              {/* Modal Tab 1: Details & Inclusions */}
              {modalTab === 'details' && (
                <div>
                  {/* Timings & Departure Hub info */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.74rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
                      <Clock size={13} color="#0F4C3A" />
                      <span><strong>Departure:</strong> {activeModalPackage.departureTime || 'TBA'} | <strong>Return:</strong> {activeModalPackage.returnTime || 'TBA'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B' }}>
                      <MapPin size={13} color="#D97706" />
                      <span><strong>Boarding:</strong> {activeModalPackage.departureLocation || 'BMTC Yeshwanthpura, Bengaluru'}</span>
                    </div>
                  </div>

                  {/* Places Covered */}
                  {activeModalPackage.placesCovered && activeModalPackage.placesCovered.length > 0 && (
                    <div style={{ marginBottom: '0.85rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        📍 Places Covered:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {activeModalPackage.placesCovered.map((place, idx) => (
                          <span key={idx} style={{ background: '#F1F5F9', color: '#334155', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem' }}>
                            {place}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inclusions & Exclusions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '8px', padding: '0.65rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        ✅ Inclusions:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '0.9rem', fontSize: '0.72rem', color: '#166534', lineHeight: 1.4 }}>
                        {activeModalPackage.inclusions.map((inc, i) => (
                          <li key={i}>{inc}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ background: '#FFF5F5', border: '1px solid #FEE2E2', borderRadius: '8px', padding: '0.65rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        ❌ Exclusions:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '0.9rem', fontSize: '0.72rem', color: '#991B1B', lineHeight: 1.4 }}>
                        {(activeModalPackage.exclusions || ['Monument Entry Fees', 'Personal Meals']).map((exc, e) => (
                          <li key={e}>{exc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Important Notes */}
                  {activeModalPackage.importantNotes && activeModalPackage.importantNotes.length > 0 && (
                    <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '0.55rem 0.75rem', marginBottom: '0.85rem', fontSize: '0.72rem', color: '#92400E' }}>
                      <strong>⚠️ Passenger Guidelines:</strong>
                      <ul style={{ margin: '0.15rem 0 0', paddingLeft: '0.9rem' }}>
                        {activeModalPackage.importantNotes.map((note, nIdx) => (
                          <li key={nIdx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Tab 2: Full Itinerary Timeline */}
              {modalTab === 'itinerary' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '0.85rem' }}>
                  {activeModalPackage.itinerary && activeModalPackage.itinerary.length > 0 ? (
                    activeModalPackage.itinerary.map((item, idx) => (
                      <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F4C3A' }}>
                            {item.timeOrDay}
                          </span>
                          <strong style={{ fontSize: '0.78rem', color: '#0F172A' }}>
                            {item.title}
                          </strong>
                        </div>
                        {item.description && (
                          <p style={{ fontSize: '0.74rem', color: '#475569', margin: '0 0 0.3rem', lineHeight: 1.4 }}>
                            {item.description}
                          </p>
                        )}
                        {item.places && item.places.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {item.places.map((pl, p) => (
                              <span key={p} style={{ background: '#E2E8F0', color: '#334155', fontSize: '0.66rem', padding: '0.08rem 0.35rem', borderRadius: '4px' }}>
                                📍 {pl}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ fontStyle: 'italic', color: '#94A3B8' }}>Detailed itinerary available on WhatsApp enquiry.</p>
                  )}
                </div>
              )}

              {/* Quick Customizer Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Preferred Travel Date</label>
                    <input
                      type="date"
                      value={selectedTravelDate}
                      onChange={e => setSelectedTravelDate(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Number of Travelers (Pax)</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={selectedTravelers}
                      onChange={e => setSelectedTravelers(parseInt(e.target.value) || 1)}
                      style={{ width: '100%', padding: '0.4rem 0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Special Requests / Vehicle Preference</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Need private Innova Crysta, 4-star resort upgrade, AC sleeper coach..."
                    value={customNotes}
                    onChange={e => setCustomNotes(e.target.value)}
                    style={{ width: '100%', padding: '0.4rem 0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem', outline: 'none', resize: 'none' }}
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Starting Tariff</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F4C3A' }}>
                    ₹{activeModalPackage.priceINR?.toLocaleString()} <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>(~S${activeModalPackage.priceSGD})</span>
                  </div>
                </div>

                <a
                  href={buildWhatsAppLink(activeModalPackage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#25D366',
                    color: '#FFF',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(37,211,102,0.3)'
                  }}
                >
                  <span>💬</span> Confirm & Enquire on WhatsApp
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}
