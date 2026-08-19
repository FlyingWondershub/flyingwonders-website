'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPin, Clock, Calendar, Users, DollarSign, CheckCircle2, ChevronDown,
  ChevronUp, Sparkles, Compass, Bus, ShieldCheck, HeartHandshake, PhoneCall,
  Send, AlertCircle, Award, ArrowRight, Star, ExternalLink, Shield, Coffee,
  Camera, Landmark, Trees, Waves, Mountain, Sun, Filter, X, Tag
} from 'lucide-react'
import { client } from '../../sanity/lib/client'

interface PackageCircuit {
  _id?: string
  id?: string
  title: string
  slug?: { current?: string } | string
  subtitle: string
  category: 'heritage' | 'hills' | 'wildlife' | 'coastal' | 'temple' | 'city'
  duration: string
  route: string
  priceINR: number
  priceSGD: number
  badge?: string
  rating: number
  reviewsCount: number
  imageUrl?: string
  highlights: string[]
  inclusions: string[]
  departureCity?: string
  kstdcCode?: string
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
  heroBadge: 'One State • Many Worlds • Official KSTDC Circuits',
  heroTitle: 'Explore Magnificent Karnataka Tour Packages',
  heroSubtitle: 'From royal palaces in Mysuru and 3 UNESCO heritage sites in Hampi & Hoysala temples, to lush coffee hills in Coorg, Kabini tiger safaris, and the iconic Bengaluru Double-Decker HOHO Bus.',
  hohoTitle: 'Bengaluru Hop-On Hop-Off (HOHO) Ambaari Double-Decker',
  hohoPriceINR: 180,
  hohoTimings: '10:30 AM – 8:00 PM',
  hohoBoardingHub: 'Ravindra Kalakshetra, JC Road, Bengaluru',
}

const DEFAULT_PACKAGES: PackageCircuit[] = [
  {
    id: 'bangalore-hoho',
    title: 'Bengaluru HOHO City Darshan (Ambaari Double-Decker)',
    subtitle: 'Hop-on Hop-off open-top double-decker city tour covering Bengaluru’s iconic heritage landmarks.',
    category: 'city',
    duration: '1 Day (10:30 AM – 8:00 PM)',
    route: 'Ravindra Kalakshetra → Cubbon Park → Visvesvaraya Museum → Vidhana Soudha → High Court',
    priceINR: 180,
    priceSGD: 3,
    badge: 'KSTDC Flagship',
    rating: 4.8,
    reviewsCount: 1420,
    imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=80',
    highlights: [
      'Circular double-decker bus with panoramic glass & open rooftop',
      'Hop off and re-board at major landmark stops along the CBD',
      'Covers Vidhana Soudha, High Court, Visvesvaraya Museum, Kasturba Road',
      'Departures every 30-45 mins from Ravindra Kalakshetra'
    ],
    inclusions: ['Full-Day HOHO Bus Access', 'Audio / Conductor Guide', 'City Tourist Route Map'],
    kstdcCode: 'KSTDC-HOHO',
    departureCity: 'Bengaluru'
  },
  {
    id: 'mysore-palace-heritage',
    title: 'Royal Mysuru & Srirangapatna Heritage Day Tour',
    subtitle: 'Step into the grandeur of the Wadiyar Dynasty with palaces, illuminated gardens, and historic battle sites.',
    category: 'heritage',
    duration: '1 Day (6:00 AM – 10:30 PM)',
    route: 'Bengaluru → Srirangapatna → Mysore Palace → Chamundi Hills → Brindavan Gardens → Bengaluru',
    priceINR: 850,
    priceSGD: 14,
    badge: 'Most Popular',
    rating: 4.9,
    reviewsCount: 2350,
    imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f443b81a?w=800&auto=format&fit=crop&q=80',
    highlights: [
      'Guided tour of the world-famous Mysore Palace (Amba Vilas)',
      'Darshan at Chamundeshwari Temple atop Chamundi Hills',
      'Tipu Sultan Summer Palace & historic Srirangapatna fort',
      'Musical fountain evening show at Brindavan Gardens (KRS)'
    ],
    inclusions: ['AC Coach / Private Cab', 'Experienced Driver-Guide', 'Toll, Parking & State Taxes'],
    kstdcCode: 'KSTDC-MYS01',
    departureCity: 'Bengaluru'
  },
  {
    id: 'north-karnataka-unesco',
    title: 'North Karnataka UNESCO Heritage Circuit (Hampi & Badami)',
    subtitle: 'An awe-inspiring journey through the Vijayanagara ruins, Badami cave temples, and Chalukyan architecture.',
    category: 'heritage',
    duration: '4 Nights / 5 Days',
    route: 'Bengaluru → Chitradurga Fort → Badami → Aihole → Pattadakal → Vijayapura (Gol Gumbaz) → Hampi → Bengaluru',
    priceINR: 8950,
    priceSGD: 145,
    badge: 'UNESCO Circuit',
    rating: 5.0,
    reviewsCount: 980,
    imageUrl: 'https://images.unsplash.com/photo-1609137144822-04e40562e6d9?w=800&auto=format&fit=crop&q=80',
    highlights: [
      'Explore Hampi Stone Chariot, Virupaksha Temple, Lotus Mahal & Tungabhadra River',
      '6th-century rock-cut Badami Cave Temples overlooking Agastya Lake',
      'UNESCO World Heritage monuments of Pattadakal and cradle of temple art at Aihole',
      'Acoustic marvel at Gol Gumbaz Whispering Gallery in Vijayapura'
    ],
    inclusions: ['4 Nights KSTDC Mayura / 3★ Hotel Stay', 'Daily Breakfast', 'AC Transport for Entire Circuit', 'Sightseeing & Guide Assistance'],
    kstdcCode: 'KSTDC-NKT04',
    departureCity: 'Bengaluru'
  },
  {
    id: 'coorg-coffee-valley',
    title: 'Coorg & Chikmagalur Coffee Valley Retreat',
    subtitle: 'Unwind in the Scotland of India amidst sprawling coffee plantations, cascading waterfalls, and misty peaks.',
    category: 'hills',
    duration: '3 Nights / 4 Days',
    route: 'Bengaluru → Bylakuppe Tibetan Camp → Madikeri (Coorg) → Abbey Falls → Chikmagalur → Mullayanagiri → Bengaluru',
    priceINR: 9200,
    priceSGD: 150,
    badge: 'Top Hill Station',
    rating: 4.9,
    reviewsCount: 1640,
    imageUrl: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=800&auto=format&fit=crop&q=80',
    highlights: [
      'Golden Temple & Namdroling Monastery in Bylakuppe',
      'Dubare Elephant Camp river rafting & elephant interaction',
      'Sunset at Raja’s Seat & roaring Abbey Waterfalls',
      'Trek to Mullayanagiri (Highest peak in Karnataka) & Baba Budangiri'
    ],
    inclusions: ['3 Nights Plantation Resort / 3★ Hotel', 'Breakfast Included', 'Private Sanitized AC Sedan / SUV', 'Coffee Estate Walk'],
    kstdcCode: 'KSTDC-CRG03',
    departureCity: 'Bengaluru'
  },
  {
    id: 'coastal-gokarna-murudeshwar',
    title: 'Coastal Karnataka & Gokarna Beach Trail',
    subtitle: 'Golden sandy beaches, monumental coastal temples, and breathtaking Western Ghats sea views.',
    category: 'coastal',
    duration: '4 Nights / 5 Days',
    route: 'Bengaluru → Udupi Sri Krishna Matha → St. Mary’s Island → Murudeshwar → Gokarna (Om Beach) → Jog Falls → Bengaluru',
    priceINR: 11500,
    priceSGD: 185,
    badge: 'Beaches & Temples',
    rating: 4.8,
    reviewsCount: 890,
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80',
    highlights: [
      'Gigantic 123-ft Shiva statue and Rajagopuram at Murudeshwar Beach',
      'Scenic Om Beach, Kudle Beach, and Mahabaleshwar Temple in Gokarna',
      'Hexagonal volcanic rock formations on St. Mary’s Island',
      'Spectacular Jog Falls (India’s 2nd highest plunge waterfall)'
    ],
    inclusions: ['4 Nights Beachfront / Mayura Resort Stays', 'Daily Breakfast', 'AC Transport & Sightseeing', 'Driver Allowances & Tolls'],
    kstdcCode: 'KSTDC-CST05',
    departureCity: 'Bengaluru'
  },
  {
    id: 'kabini-bandipur-wildlife',
    title: 'Kabini & Bandipur Tiger Safari Circuit',
    subtitle: 'Encounter wild Asiatic elephants, leopards, and Royal Bengal tigers in Karnataka’s premier jungle corridors.',
    category: 'wildlife',
    duration: '2 Nights / 3 Days',
    route: 'Bengaluru → Bandipur Tiger Reserve → Kabini (Nagarhole National Park) → Bengaluru',
    priceINR: 14500,
    priceSGD: 235,
    badge: 'Jungle Safaris',
    rating: 4.9,
    reviewsCount: 750,
    imageUrl: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=800&auto=format&fit=crop&q=80',
    highlights: [
      '2 Jungle Jeep Safaris inside Bandipur & Nagarhole Tiger Reserves',
      'Kabini River boat safari for elephant herds and aquatic birdlife',
      'Stay at scenic Jungle Lodges & Resorts (JLR) or eco-wilderness retreat',
      'Naturalist-guided forest walks and bonfire evening sessions'
    ],
    inclusions: ['2 Nights Eco-Resort / JLR Partner Stay', 'All Meals (Breakfast, Lunch & Dinner)', '2 Forest Safari Permits & Gypsy Rides', 'Bengaluru Transfers'],
    kstdcCode: 'KSTDC-KBN02',
    departureCity: 'Bengaluru'
  },
  {
    id: 'hoysala-grandeur-belur',
    title: 'Hoysala Architectural Wonders (Belur, Halebidu & Shravanabelagola)',
    subtitle: 'Witness the zenith of ancient stone craftsmanship with 12th-century Hoysala temples and the giant monolithic Bahubali.',
    category: 'heritage',
    duration: '2 Days / 1 Night',
    route: 'Bengaluru → Shravanabelagola → Belur (Chennakeshava) → Halebidu (Hoysaleswara) → Bengaluru',
    priceINR: 3850,
    priceSGD: 62,
    badge: 'UNESCO 2023 Inscribed',
    rating: 4.9,
    reviewsCount: 1120,
    imageUrl: 'https://images.unsplash.com/photo-1627894006066-b45785012543?w=800&auto=format&fit=crop&q=80',
    highlights: [
      '57-ft monolithic Gommateshwara Bahubali statue at Shravanabelagola',
      'Intricate soapstone carvings & star-shaped base at Belur Chennakeshava Temple',
      'Twin Hoysaleswara & Shantaleswara shrines in Halebidu',
      'UNESCO World Heritage Sacred Ensembles of the Hoysalas'
    ],
    inclusions: ['1 Night Hotel Stay in Hassan / Belur', 'Breakfast Included', 'Private AC Cab / KSTDC Tour', 'Driver Allowance & Parking'],
    kstdcCode: 'KSTDC-HYS02',
    departureCity: 'Bengaluru'
  },
  {
    id: 'bangalore-mysore-ooty-triangle',
    title: 'Golden Triangle (Bengaluru – Mysuru – Ooty Nilgiri Hills)',
    subtitle: 'The quintessential South India holiday combining royal palace history, lush wildlife transit, and cool hill breeze.',
    category: 'hills',
    duration: '4 Nights / 5 Days',
    route: 'Bengaluru → Srirangapatna → Mysuru → Bandipur Transit → Ooty → Coonoor (Toy Train) → Bengaluru',
    priceINR: 12800,
    priceSGD: 205,
    badge: 'All-Time Classic',
    rating: 4.8,
    reviewsCount: 3100,
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
    highlights: [
      'Royal Mysore Palace, Chamundi Hill & Brindavan Gardens illumination',
      'Scenic Mudumalai / Bandipur tiger reserve forest road crossing',
      'Ooty Botanical Gardens, Ooty Lake boating & Doddabetta Viewpoint',
      'Historic UNESCO Nilgiri Mountain Railway Toy Train experience to Coonoor'
    ],
    inclusions: ['4 Nights 3★ Hotel Accommodations', 'Daily Breakfast', 'Dedicated Private AC Cab for 5 Days', 'Sightseeing as per Itinerary'],
    kstdcCode: 'KSTDC-TRG05',
    departureCity: 'Bengaluru'
  }
]

// Banner Quick-Jump Navigation Items
const BANNER_QUICK_LINKS = [
  { label: '🚌 Bengaluru HOHO Bus (₹180)', targetId: 'bangalore-hoho' },
  { label: '👑 Royal Mysuru Palace', targetId: 'mysore-palace-heritage' },
  { label: '🏛️ Hampi & Badami UNESCO', targetId: 'north-karnataka-unesco' },
  { label: '☕ Coorg & Chikmagalur Hills', targetId: 'coorg-coffee-valley' },
  { label: '🏖️ Gokarna & Murudeshwar', targetId: 'coastal-gokarna-murudeshwar' },
  { label: '🐅 Kabini Tiger Safari', targetId: 'kabini-bandipur-wildlife' },
  { label: '🛕 Belur-Halebidu Hoysala', targetId: 'hoysala-grandeur-belur' },
  { label: '🚂 Mysuru-Ooty Triangle', targetId: 'bangalore-mysore-ooty-triangle' },
]

export default function KarnatakaPage() {
  const [settings, setSettings] = useState<KarnatakaSettings>(DEFAULT_SETTINGS)
  const [packages, setPackages] = useState<PackageCircuit[]>(DEFAULT_PACKAGES)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeModalPackage, setActiveModalPackage] = useState<PackageCircuit | null>(null)
  const [selectedTravelDate, setSelectedTravelDate] = useState<string>('')
  const [selectedTravelers, setSelectedTravelers] = useState<number>(2)
  const [customNotes, setCustomNotes] = useState<string>('')
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null)
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null)

  // Fetch Sanity settings & packages on mount
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
      }
    }
    loadSanityData()
  }, [])

  const whatsappPhone = (settings.whatsappNumber || '6596890101').replace(/[^0-9]/g, '')

  const scrollToCard = (targetId: string) => {
    const el = document.getElementById(targetId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedCardId(targetId)
      setTimeout(() => setHighlightedCardId(null), 2500)
    }
  }

  const filteredPackages = activeCategory === 'all'
    ? packages
    : packages.filter(p => p.category === activeCategory)

  const buildWhatsAppLink = (pkg: PackageCircuit) => {
    let msg = `Namaskara! 🙏 I am interested in booking the *${pkg.title}* (${pkg.duration}).\n\n`
    if (pkg.kstdcCode) msg += `🔖 *KSTDC Ref:* ${pkg.kstdcCode}\n`
    msg += `📍 *Route:* ${pkg.route}\n`
    msg += `💰 *Est. Price:* ₹${pkg.priceINR?.toLocaleString()} (approx S$ ${pkg.priceSGD}) per person\n`
    if (selectedTravelDate) msg += `📅 *Preferred Date:* ${selectedTravelDate}\n`
    if (selectedTravelers) msg += `👥 *Number of Pax:* ${selectedTravelers} Travelers\n`
    if (customNotes) msg += `📝 *Notes/Customization:* ${customNotes}\n`
    msg += `\nPlease share detailed itinerary, hotel options, and booking availability. Thank you!`
    return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(msg)}`
  }

  const buildGeneralWhatsAppLink = () => {
    const msg = `Namaskara! 🙏 I would like to plan a custom Karnataka tour package with Flying Wonders.\n\nPlease connect me with your Karnataka travel specialist.`
    return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(msg)}`
  }

  const buildHohoWhatsAppLink = () => {
    const msg = `Namaskara! 🙏 I would like to book/enquire about the *Bengaluru Hop-On Hop-Off (HOHO) Ambaari Double-Decker Bus Tour* (₹${settings.hohoPriceINR || 180}/pax).\n\nPlease share departure timings and seat availability.`
    return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div style={{ background: '#FFF', color: '#1E293B', minHeight: '100vh' }}>
      
      {/* ── Breadcrumb Navigation ── */}
      <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '0.65rem 1.5rem', fontSize: '0.8rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B' }}>
          <Link href="/" style={{ color: '#0F4C3A', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <span>/</span>
          <Link href="/services-catalog" style={{ color: '#0F4C3A', textDecoration: 'none', fontWeight: 600 }}>Services</Link>
          <span>/</span>
          <span style={{ color: '#1E293B', fontWeight: 700 }}>Karnataka Tour Packages</span>
        </div>
      </div>

      {/* ── Compact Header Banner ── */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #093E30 0%, #0F4C3A 60%, #1A365D 100%)',
        color: '#FFF',
        padding: 'clamp(2rem, 4vw, 3rem) 1.5rem',
        overflow: 'hidden'
      }}>
        {/* Decorative backdrop glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(15,76,58,0.3) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            
            {/* Left Header Column */}
            <div style={{ flex: '1 1 600px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', padding: '0.25rem 0.75rem', borderRadius: '20px', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem' }}>🇮🇳</span>
                <span style={{ color: '#FDE047', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {settings.heroBadge || 'One State • Many Worlds • Official KSTDC Circuits'}
                </span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: 'clamp(1.8rem, 3.8vw, 2.8rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                margin: '0 0 0.75rem'
              }}>
                {settings.heroTitle || 'Explore Magnificent Karnataka Tour Packages'}
              </h1>

              <p style={{
                fontSize: 'clamp(0.88rem, 1.4vw, 0.98rem)',
                lineHeight: 1.5,
                maxWidth: '680px',
                color: '#E2E8F0',
                fontWeight: 300,
                margin: '0 0 1.25rem'
              }}>
                {settings.heroSubtitle || 'From royal palaces in Mysuru and UNESCO heritage ruins in Hampi, to misty coffee plantations in Coorg and the Bengaluru Double-Decker HOHO Bus. Book your verified Karnataka tour directly on WhatsApp.'}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <a
                  href={buildGeneralWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#25D366',
                    color: '#FFF',
                    padding: '0.65rem 1.4rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    textDecoration: 'none',
                    boxShadow: '0 6px 18px rgba(37,211,102,0.3)',
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
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#FFF',
                    padding: '0.65rem 1.2rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textDecoration: 'none'
                  }}
                >
                  <span>📋</span> View All Packages ({packages.length})
                </a>
              </div>
            </div>

            {/* Right Mini Trust Box */}
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', padding: '1rem 1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FDE047' }}>3+</div>
                <div style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>UNESCO Sites</div>
              </div>
              <div style={{ width: '1px', height: '35px', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FDE047' }}>₹180</div>
                <div style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>HOHO Bus</div>
              </div>
              <div style={{ width: '1px', height: '35px', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FDE047' }}>4.9★</div>
                <div style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>Guest Rating</div>
              </div>
            </div>

          </div>

          {/* ── Banner Interactive Quick-Links to Cards ── */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: '#CBD5E1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              ⚡ Quick Jump to Package Details:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {BANNER_QUICK_LINKS.map((link, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToCard(link.targetId)}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '16px',
                    fontSize: '0.76rem',
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
      <section id="bangalore-hoho" style={{ padding: 'clamp(2.5rem, 5vw, 3.5rem) 1.5rem', background: '#FFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 40%, #FFFBEB 100%)',
            borderRadius: '20px',
            border: '2px solid #F59E0B',
            padding: 'clamp(1.75rem, 4vw, 2.5rem)',
            boxShadow: '0 10px 30px rgba(245,158,11,0.15)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'center'
          }}>
            
            {/* Left Content */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#D97706', color: '#FFF', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
                <Bus size={14} /> Official KSTDC Double-Decker Service
              </div>

              <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: '#78350F', margin: '0 0 0.85rem', lineHeight: 1.2 }}>
                {settings.hohoTitle || 'Bengaluru Hop-On Hop-Off (HOHO) Ambaari Double-Decker'}
              </h2>

              <p style={{ fontSize: '0.9rem', color: '#92400E', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Explore Bengaluru’s iconic Central Business District from the open rooftop of the <strong>KSTDC Ambaari Double-Decker bus</strong>. Enjoy complete flexibility to hop off at museums, galleries, and government heritage buildings, then board any following circular bus.
              </p>

              {/* Key Highlights Info Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#FFF', padding: '0.75rem', borderRadius: '10px', border: '1px solid #FCD34D' }}>
                  <div style={{ fontSize: '0.68rem', color: '#B45309', fontWeight: 800, textTransform: 'uppercase' }}>Ticket Fare</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#78350F' }}>₹{settings.hohoPriceINR || 180} / pax</div>
                  <div style={{ fontSize: '0.65rem', color: '#92400E' }}>Kids &lt; 5 years Free</div>
                </div>

                <div style={{ background: '#FFF', padding: '0.75rem', borderRadius: '10px', border: '1px solid #FCD34D' }}>
                  <div style={{ fontSize: '0.68rem', color: '#B45309', fontWeight: 800, textTransform: 'uppercase' }}>Operating Hours</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#78350F' }}>{settings.hohoTimings || '10:30 AM – 8 PM'}</div>
                  <div style={{ fontSize: '0.65rem', color: '#92400E' }}>Multiple circular trips</div>
                </div>

                <div style={{ background: '#FFF', padding: '0.75rem', borderRadius: '10px', border: '1px solid #FCD34D' }}>
                  <div style={{ fontSize: '0.68rem', color: '#B45309', fontWeight: 800, textTransform: 'uppercase' }}>Boarding Hub</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#78350F' }}>Ravindra Kalakshetra</div>
                  <div style={{ fontSize: '0.65rem', color: '#92400E' }}>Town Hall / JC Road</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <a
                  href={buildHohoWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#0F4C3A',
                    color: '#FFF',
                    padding: '0.7rem 1.3rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(15,76,58,0.25)'
                  }}
                >
                  <span>💬</span> Book HOHO Bus on WhatsApp
                </a>

                <span style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 600 }}>
                  ⚡ Instant WhatsApp ticket reservation & route map
                </span>
              </div>

            </div>

            {/* Right: Route Stops Visual Box */}
            <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #FCD34D', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <MapPin size={17} color="#D97706" /> HOHO Ambaari Circular Stops:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
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
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#F59E0B', color: '#FFF', fontSize: '0.68rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      {item.step}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.8rem', color: '#1E293B', display: 'block' }}>{item.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── Tour Circuits Grid Section ── */}
      <section id="circuits" style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ background: '#E0F2FE', color: '#0369A1', fontSize: '0.72rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Handcrafted KSTDC & Custom Tours
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, color: '#0F4C3A', margin: '0.5rem 0 0.4rem' }}>
              Karnataka Tour Packages
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', maxWidth: '650px', margin: '0 auto' }}>
              Choose an official circuit below. Every tour can be booked directly or fully customized with private cabs, tempo travellers, and handpicked resort stays.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '2rem' }}>
            {[
              { id: 'all', label: '🌟 All Circuits' },
              { id: 'heritage', label: '🏛️ Heritage & UNESCO' },
              { id: 'hills', label: '☕ Hills & Coffee' },
              { id: 'wildlife', label: '🐅 Wildlife & Jungle' },
              { id: 'coastal', label: '🏖️ Coastal & Beaches' },
              { id: 'city', label: '🚌 Bengaluru City' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '20px',
                  border: activeCategory === tab.id ? 'none' : '1px solid #CBD5E1',
                  background: activeCategory === tab.id ? '#0F4C3A' : '#FFF',
                  color: activeCategory === tab.id ? '#FFF' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: activeCategory === tab.id ? '0 4px 12px rgba(15,76,58,0.2)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Packages Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' }}>
            {filteredPackages.map(pkg => {
              const cardId = pkg.id || (typeof pkg.slug === 'string' ? pkg.slug : pkg.slug?.current) || pkg._id || ''
              const isCardHighlighted = highlightedCardId === cardId

              return (
                <div
                  key={pkg._id || pkg.id || cardId}
                  id={cardId}
                  style={{
                    background: '#FFF',
                    borderRadius: '16px',
                    border: isCardHighlighted ? '2.5px solid #D4AF37' : '1px solid #E2E8F0',
                    boxShadow: isCardHighlighted ? '0 0 25px rgba(212,175,55,0.45)' : '0 4px 18px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    transform: isCardHighlighted ? 'scale(1.02)' : 'none'
                  }}
                >
                  
                  <div>
                    {/* Card Image Banner */}
                    <div style={{ height: '190px', width: '100%', position: 'relative', overflow: 'hidden', background: '#1E293B' }}>
                      <img
                        src={pkg.imageUrl || 'https://images.unsplash.com/photo-1600100397608-f010f443b81a?w=800&auto=format&fit=crop&q=80'}
                        alt={pkg.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.7) 100%)' }} />
                      
                      {pkg.badge && (
                        <span style={{ position: 'absolute', top: '0.85rem', left: '0.85rem', background: '#D4AF37', color: '#111', fontWeight: 800, fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {pkg.badge}
                        </span>
                      )}

                      {pkg.kstdcCode && (
                        <span style={{ position: 'absolute', top: '0.85rem', right: '0.85rem', background: 'rgba(0,0,0,0.65)', color: '#FDE047', fontWeight: 800, fontSize: '0.68rem', padding: '0.2rem 0.55rem', borderRadius: '8px', backdropFilter: 'blur(4px)' }}>
                          {pkg.kstdcCode}
                        </span>
                      )}

                      <span style={{ position: 'absolute', bottom: '0.85rem', right: '0.85rem', background: 'rgba(9,62,48,0.92)', color: '#FFF', fontWeight: 800, fontSize: '0.74rem', padding: '0.25rem 0.65rem', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
                        ⏱️ {pkg.duration}
                      </span>
                    </div>

                    {/* Card Content Body */}
                    <div style={{ padding: '1.25rem' }}>
                      
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem', lineHeight: 1.3 }}>
                        {pkg.title}
                      </h3>

                      <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 0.85rem' }}>
                        {pkg.subtitle}
                      </p>

                      {/* Route Details Box */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.55rem 0.75rem', marginBottom: '0.85rem' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0F4C3A', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                          📍 Tour Circuit:
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.4, fontWeight: 500 }}>
                          {pkg.route}
                        </div>
                      </div>

                      {/* Key Highlights */}
                      <div style={{ marginBottom: '0.85rem' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Trip Highlights:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
                          {pkg.highlights.slice(0, 3).map((hl, hIdx) => (
                            <li key={hIdx} style={{ marginBottom: '0.2rem' }}>{hl}</li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  </div>

                  {/* Card Footer: Pricing & Action Buttons */}
                  <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #F1F5F9', background: '#FAFBFD', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
                    
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Starting From</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F4C3A' }}>
                          ₹{pkg.priceINR?.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                          (~S${pkg.priceSGD})
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => setActiveModalPackage(pkg)}
                        style={{
                          padding: '0.45rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          background: '#FFF',
                          color: '#334155',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer'
                        }}
                      >
                        Details
                      </button>

                      <a
                        href={buildWhatsAppLink(pkg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '0.45rem 0.9rem',
                          borderRadius: '6px',
                          background: '#25D366',
                          color: '#FFF',
                          fontWeight: 800,
                          fontSize: '0.78rem',
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

      {/* ── Why Tour Karnataka with Flying Wonders ── */}
      <section style={{ padding: 'clamp(2.5rem, 5vw, 3.5rem) 1.5rem', background: '#FFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.72rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Why Flying Wonders
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', fontWeight: 900, color: '#0F4C3A', margin: '0.5rem 0 0.4rem' }}>
              The Flying Wonders Difference
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>
              We bring Singapore DMC operational standards, verified KSTDC partnerships, and 24/7 dedicated trip support to your Karnataka holiday.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            
            <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>
                🏛️
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>
                Official KSTDC Routes
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Authentic government-certified routes, priority entry at historic monuments, and verified KSTDC Mayura hotel stays.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>
                🚗
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>
                Sanitized Private Cabs
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Toyota Innova Crysta, Ertiga, and Tempo Travellers with courteous local driver-guides who know every ghat road.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#E0E7FF', color: '#4338CA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>
                🌿
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>
                Jungle Lodges & Resorts (JLR)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Priority booking support for iconic wildlife properties like Kabini River Lodge and Bandipur Safari Lodge with assured jeep permits.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FCE7F3', color: '#BE185D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>
                💬
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>
                Instant WhatsApp Booking
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                No complex checkout forms or hidden fees. Chat with our Karnataka travel team on WhatsApp to confirm dates & pricing instantly.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ background: '#E0E7FF', color: '#3730A3', fontSize: '0.72rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Got Questions?
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#0F4C3A', margin: '0.5rem 0 0.4rem' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {[
              {
                q: 'How does the Bengaluru HOHO Double-Decker bus ticket work?',
                a: `The Bengaluru HOHO (Ambaari) bus operates on a circular route starting from Ravindra Kalakshetra (JC Road) between 10:30 AM and 8:00 PM. A single ₹${settings.hohoPriceINR || 180} ticket allows you to ride the double-decker bus, hop off at any of the designated tourist stops (like Vidhana Soudha, High Court, Visvesvaraya Museum), explore at your pace, and hop back onto any following Ambaari bus throughout the day.`
              },
              {
                q: 'Can we customize Karnataka tour packages with private vehicles?',
                a: 'Yes! While standard KSTDC coach tours have fixed itineraries, Flying Wonders specializes in private customized family tours. We provide dedicated AC Sedans, Toyota Innova Crysta, and 12/20-seater Tempo Travellers with flexible departure times, customized pick-up points, and resort upgrades.'
              },
              {
                q: 'Are forest safari permits included in the Kabini / Bandipur packages?',
                a: 'Yes. Our Kabini and Bandipur packages include pre-arranged forest department safari slots (Jeep Safari / Boat Safari) guided by certified naturalists, ensuring guaranteed entry into core wildlife zones.'
              },
              {
                q: 'What is the payment and booking process since API bookings are routed via WhatsApp?',
                a: 'Simply click "Book on WhatsApp" on any package. Our dedicated Karnataka travel desk will confirm availability for your dates, share hotel options (Mayura / 3★ / 4★ / Resorts), and provide a secure digital payment link (UPI / Credit Card / Bank Transfer).'
              },
              {
                q: 'Are guide services available in English, Hindi, and Kannada?',
                a: 'Yes. All our tour chauffeurs and monument guides are fluent in English, Hindi, and Kannada, offering rich historical commentary at sites like Hampi, Badami, and Belur.'
              }
            ].map((faq, idx) => {
              const isOpen = activeFaqIndex === idx
              return (
                <div
                  key={idx}
                  style={{
                    background: '#FFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} color="#0F4C3A" /> : <ChevronDown size={16} color="#64748B" />}
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 1.25rem 1rem', fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
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
        padding: 'clamp(2.5rem, 5vw, 3.5rem) 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <span style={{ background: 'rgba(212,175,55,0.2)', color: '#FDE047', fontSize: '0.72rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Plan Your Journey Today
          </span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 900, margin: '0.6rem 0 0.75rem' }}>
            Ready to Discover Karnataka?
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#E2E8F0', maxWidth: '580px', margin: '0 auto 1.5rem', fontWeight: 300 }}>
            Chat with our Karnataka tour specialists on WhatsApp. Get instant itinerary customization, transparent pricing, and hotel recommendations within 15 minutes.
          </p>

          <a
            href={buildGeneralWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#25D366',
              color: '#FFF',
              padding: '0.8rem 1.8rem',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '0.92rem',
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(37,211,102,0.35)'
            }}
          >
            <span>💬</span> Chat with Karnataka Specialist
          </a>
        </div>
      </section>

      {/* ── Modal: Package Details & WhatsApp Quote Customizer ── */}
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
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            
            <button
              type="button"
              onClick={() => setActiveModalPackage(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F4C3A', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              {activeModalPackage.category.toUpperCase()} • {activeModalPackage.duration} {activeModalPackage.kstdcCode ? `• ${activeModalPackage.kstdcCode}` : ''}
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.4rem', lineHeight: 1.3 }}>
              {activeModalPackage.title}
            </h3>

            <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1rem' }}>
              {activeModalPackage.subtitle}
            </p>

            {/* Inclusions Strip */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F4C3A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Included in Package:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.75rem', color: '#334155' }}>
                {activeModalPackage.inclusions.map((inc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={13} color="#166534" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Customizer Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Preferred Travel Date</label>
                  <input
                    type="date"
                    value={selectedTravelDate}
                    onChange={e => setSelectedTravelDate(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Number of Travelers (Pax)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={selectedTravelers}
                    onChange={e => setSelectedTravelers(parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Special Requests / Vehicle Preference</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Need private Innova Crysta, 4-star resort in Madikeri, veg food only..."
                  value={customNotes}
                  onChange={e => setCustomNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none', resize: 'none' }}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Starting Price</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F4C3A' }}>
                  ₹{activeModalPackage.priceINR?.toLocaleString()} <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>(~S${activeModalPackage.priceSGD})</span>
                </div>
              </div>

              <a
                href={buildWhatsAppLink(activeModalPackage)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#25D366',
                  color: '#FFF',
                  padding: '0.7rem 1.3rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(37,211,102,0.3)'
                }}
              >
                <span>💬</span> Confirm & Enquire on WhatsApp
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
