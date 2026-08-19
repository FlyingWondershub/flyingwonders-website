'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPin, Clock, Calendar, Users, DollarSign, CheckCircle2, ChevronDown,
  ChevronUp, Sparkles, Compass, Bus, ShieldCheck, HeartHandshake, PhoneCall,
  Send, AlertCircle, Award, ArrowRight, Star, ExternalLink, Shield, Coffee,
  Camera, Landmark, Trees, Waves, Mountain, Sun, Filter, X
} from 'lucide-react'

/* ── Colour Tokens ── */
const EMERALD = '#093E30'
const EMERALD_LIGHT = '#0F4C3A'
const GOLD = '#D4AF37'
const AMBER = '#F59E0B'
const SAND = '#FBF8F3'

interface PackageCircuit {
  id: string
  title: string
  subtitle: string
  category: 'heritage' | 'hills' | 'wildlife' | 'coastal' | 'temple' | 'city'
  duration: string
  route: string
  priceINR: number
  priceSGD: number
  badge?: string
  rating: number
  reviewsCount: number
  imageUrl: string
  highlights: string[]
  inclusions: string[]
  departureCity: string
}

const KARNATAKA_PACKAGES: PackageCircuit[] = [
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
      'Musical musical fountain evening show at Brindavan Gardens (KRS)'
    ],
    inclusions: ['AC Coach / Private Cab', 'Experienced Driver-Guide', 'Toll, Parking & State Taxes'],
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
    departureCity: 'Bengaluru'
  }
]

export default function KarnatakaPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeModalPackage, setActiveModalPackage] = useState<PackageCircuit | null>(null)
  const [selectedTravelDate, setSelectedTravelDate] = useState<string>('')
  const [selectedTravelers, setSelectedTravelers] = useState<number>(2)
  const [customNotes, setCustomNotes] = useState<string>('')
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null)

  const filteredPackages = activeCategory === 'all'
    ? KARNATAKA_PACKAGES
    : KARNATAKA_PACKAGES.filter(p => p.category === activeCategory)

  const buildWhatsAppLink = (pkg: PackageCircuit, customMsg?: string) => {
    let msg = `Namaskara! 🙏 I am interested in booking the *${pkg.title}* (${pkg.duration}).\n\n`
    msg += `📍 *Route:* ${pkg.route}\n`
    msg += `💰 *Est. Price:* ₹${pkg.priceINR.toLocaleString()} (approx S$ ${pkg.priceSGD}) per person\n`
    if (selectedTravelDate) msg += `📅 *Preferred Date:* ${selectedTravelDate}\n`
    if (selectedTravelers) msg += `👥 *Number of Pax:* ${selectedTravelers} Travelers\n`
    if (customNotes) msg += `📝 *Notes/Customization:* ${customNotes}\n`
    msg += `\nPlease share detailed itinerary, hotel options, and booking availability. Thank you!`
    return `https://wa.me/6596890101?text=${encodeURIComponent(msg)}`
  }

  const buildGeneralWhatsAppLink = () => {
    const msg = `Namaskara! 🙏 I would like to plan a custom Karnataka tour package with Flying Wonders.\n\nPlease connect me with your Karnataka travel specialist.`
    return `https://wa.me/6596890101?text=${encodeURIComponent(msg)}`
  }

  const buildHohoWhatsAppLink = () => {
    const msg = `Namaskara! 🙏 I would like to book/enquire about the *Bengaluru Hop-On Hop-Off (HOHO) Ambaari Double-Decker Bus Tour* (₹180/pax).\n\nPlease share departure timings and seat availability.`
    return `https://wa.me/6596890101?text=${encodeURIComponent(msg)}`
  }

  return (
    <div style={{ background: '#FFF', color: '#1E293B', minHeight: '100vh' }}>
      
      {/* ── Breadcrumb Navigation ── */}
      <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '0.75rem 1.5rem', fontSize: '0.82rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B' }}>
          <Link href="/" style={{ color: '#0F4C3A', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <span>/</span>
          <Link href="/services-catalog" style={{ color: '#0F4C3A', textDecoration: 'none', fontWeight: 600 }}>Services</Link>
          <span>/</span>
          <span style={{ color: '#1E293B', fontWeight: 700 }}>Karnataka Tour Packages</span>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #093E30 0%, #0F4C3A 60%, #1A365D 100%)',
        color: '#FFF',
        padding: 'clamp(3.5rem, 8vw, 5.5rem) 1.5rem',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative background pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(15,76,58,0.3) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(212,175,55,0.18)', border: '1px solid rgba(212,175,55,0.4)', padding: '0.35rem 0.9rem', borderRadius: '30px', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.9rem' }}>🇮🇳</span>
            <span style={{ color: '#FDE047', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              One State • Many Worlds • Official KSTDC Circuits
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            margin: '0 0 1.25rem',
            maxWidth: '850px'
          }}>
            Explore Magnificent <span style={{ color: '#FDE047' }}>Karnataka</span> Tour Packages
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            lineHeight: 1.6,
            maxWidth: '750px',
            color: '#E2E8F0',
            fontWeight: 300,
            margin: '0 0 2rem'
          }}>
            From royal palaces in Mysuru and 3 UNESCO heritage sites in Hampi & Hoysala temples, to lush coffee hills in Coorg, Kabini tiger safaris, and the iconic Bengaluru Double-Decker HOHO Bus. Book your verified Karnataka holiday directly on WhatsApp.
          </p>

          {/* Feature Highlights Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '2.5rem' }}>
            {[
              '👑 Royal Mysuru Palace',
              '🏛️ Hampi & Badami UNESCO Ruins',
              '☕ Coorg & Chikmagalur Coffee Hills',
              '🚌 Bengaluru HOHO Double-Decker (₹180)',
              '🐅 Kabini & Bandipur Tiger Safaris',
              '🏖️ Gokarna & Murudeshwar Coast',
              '⚡ Direct WhatsApp Booking'
            ].map((pill, idx) => (
              <span
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#F8FAFC'
                }}
              >
                {pill}
              </span>
            ))}
          </div>

          {/* Dual Action CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <a
              href={buildGeneralWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: '#25D366',
                color: '#FFF',
                padding: '0.85rem 1.8rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(37,211,102,0.35)',
                transition: 'transform 0.2s'
              }}
            >
              <span>💬</span> Book Karnataka Tour on WhatsApp
            </a>

            <a
              href="#circuits"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#FFF',
                padding: '0.85rem 1.6rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none',
                transition: 'background 0.2s'
              }}
            >
              <span>📋</span> View 8+ Tour Circuits
            </a>
          </div>

        </div>
      </section>

      {/* ── Key Trust Metric Strip ── */}
      <section style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '1.75rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F4C3A' }}>3+</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>UNESCO World Heritage Sites</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F4C3A' }}>100%</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>KSTDC Circuit Verified Routes</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F4C3A' }}>₹180</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>Bengaluru HOHO Bus Starting Fare</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F4C3A' }}>4.9 ★</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>Guest Satisfaction Score</div>
          </div>
        </div>
      </section>

      {/* ── SPOTLIGHT: Bengaluru Hop-On Hop-Off (HOHO) Ambaari Bus ── */}
      <section style={{ padding: 'clamp(3rem, 6vw, 4.5rem) 1.5rem', background: '#FFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 40%, #FFFBEB 100%)',
            borderRadius: '24px',
            border: '2px solid #F59E0B',
            padding: 'clamp(2rem, 5vw, 3rem)',
            boxShadow: '0 12px 36px rgba(245,158,11,0.15)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center'
          }}>
            
            {/* Left Content */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#D97706', color: '#FFF', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                <Bus size={15} /> KSTDC Official City Sightseeing
              </div>

              <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, color: '#78350F', margin: '0 0 1rem', lineHeight: 1.2 }}>
                Bengaluru Hop-On Hop-Off (HOHO) Ambaari Double-Decker
              </h2>

              <p style={{ fontSize: '0.95rem', color: '#92400E', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Experience India’s Silicon Valley from the open rooftop of the famous <strong>KSTDC Ambaari Double-Decker bus</strong>. Travel across Bengaluru’s Central Business District with complete flexibility to hop off, explore museums and palaces, and re-board the next circular bus.
              </p>

              {/* Key Highlights Table / Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#FFF', padding: '0.85rem', borderRadius: '12px', border: '1px solid #FCD34D' }}>
                  <div style={{ fontSize: '0.7rem', color: '#B45309', fontWeight: 800, textTransform: 'uppercase' }}>Ticket Fare</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#78350F' }}>₹180 / pax</div>
                  <div style={{ fontSize: '0.68rem', color: '#92400E' }}>Kids &lt; 5 years Free</div>
                </div>

                <div style={{ background: '#FFF', padding: '0.85rem', borderRadius: '12px', border: '1px solid #FCD34D' }}>
                  <div style={{ fontSize: '0.7rem', color: '#B45309', fontWeight: 800, textTransform: 'uppercase' }}>Operating Hours</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#78350F' }}>10:30 AM – 8 PM</div>
                  <div style={{ fontSize: '0.68rem', color: '#92400E' }}>Multiple circular trips</div>
                </div>

                <div style={{ background: '#FFF', padding: '0.85rem', borderRadius: '12px', border: '1px solid #FCD34D' }}>
                  <div style={{ fontSize: '0.7rem', color: '#B45309', fontWeight: 800, textTransform: 'uppercase' }}>Boarding Point</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#78350F' }}>Ravindra Kalakshetra</div>
                  <div style={{ fontSize: '0.68rem', color: '#92400E' }}>Town Hall / JC Road</div>
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
                    padding: '0.75rem 1.4rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(15,76,58,0.25)'
                  }}
                >
                  <span>💬</span> Book HOHO Bus on WhatsApp
                </a>

                <span style={{ fontSize: '0.78rem', color: '#92400E', fontWeight: 600 }}>
                  ⚡ Instant WhatsApp ticket reservation & assistance
                </span>
              </div>

            </div>

            {/* Right: Route Stops Visual Box */}
            <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #FCD34D', padding: '1.5rem', boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}>
              
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <MapPin size={18} color="#D97706" /> HOHO Ambaari Route Stops:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#F59E0B', color: '#FFF', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      {item.step}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.82rem', color: '#1E293B', display: 'block' }}>{item.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── Interactive Tour Circuits Section ── */}
      <section id="circuits" style={{ padding: 'clamp(3rem, 6vw, 4.5rem) 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ background: '#E0F2FE', color: '#0369A1', fontSize: '0.75rem', fontWeight: 800, padding: '0.3rem 0.85rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Handcrafted Karnataka Circuits
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, color: '#0F4C3A', margin: '0.6rem 0 0.5rem' }}>
              Popular Karnataka Tour Packages
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748B', maxWidth: '650px', margin: '0 auto' }}>
              Select a circuit below. Every tour package can be booked directly or fully customized with private cabs, tempo travellers, and handpicked resort stays.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}>
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
                  padding: '0.5rem 1.1rem',
                  borderRadius: '24px',
                  border: activeCategory === tab.id ? 'none' : '1px solid #CBD5E1',
                  background: activeCategory === tab.id ? '#0F4C3A' : '#FFF',
                  color: activeCategory === tab.id ? '#FFF' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.85rem',
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
            {filteredPackages.map(pkg => (
              <div
                key={pkg.id}
                style={{
                  background: '#FFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                
                <div>
                  {/* Card Image Banner */}
                  <div style={{ height: '200px', width: '100%', position: 'relative', overflow: 'hidden', background: '#1E293B' }}>
                    <img
                      src={pkg.imageUrl}
                      alt={pkg.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)' }} />
                    
                    {pkg.badge && (
                      <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#D4AF37', color: '#111', fontWeight: 800, fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {pkg.badge}
                      </span>
                    )}

                    <span style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(9,62,48,0.92)', color: '#FFF', fontWeight: 800, fontSize: '0.76rem', padding: '0.3rem 0.75rem', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                      ⏱️ {pkg.duration}
                    </span>
                  </div>

                  {/* Card Content Body */}
                  <div style={{ padding: '1.4rem' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                        {pkg.title}
                      </h3>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 1rem' }}>
                      {pkg.subtitle}
                    </p>

                    {/* Route Details Box */}
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F4C3A', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                        📍 Tour Route:
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.4, fontWeight: 500 }}>
                        {pkg.route}
                      </div>
                    </div>

                    {/* Key Highlights */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Trip Highlights:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                        {pkg.highlights.slice(0, 3).map((hl, hIdx) => (
                          <li key={hIdx} style={{ marginBottom: '0.25rem' }}>{hl}</li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>

                {/* Card Footer: Pricing & Action Buttons */}
                <div style={{ padding: '1.1rem 1.4rem', borderTop: '1px solid #F1F5F9', background: '#FAFBFD', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Starting From</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F4C3A' }}>
                        ₹{pkg.priceINR.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                        (~S${pkg.priceSGD}) / pax
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveModalPackage(pkg)}
                      style={{
                        padding: '0.5rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        background: '#FFF',
                        color: '#334155',
                        fontWeight: 700,
                        fontSize: '0.78rem',
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
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        background: '#25D366',
                        color: '#FFF',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        boxShadow: '0 2px 8px rgba(37,211,102,0.25)'
                      }}
                    >
                      <span>💬</span> Book Now
                    </a>
                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Why Tour Karnataka with Flying Wonders ── */}
      <section style={{ padding: 'clamp(3rem, 6vw, 4.5rem) 1.5rem', background: '#FFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.75rem', fontWeight: 800, padding: '0.3rem 0.85rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Why Flying Wonders
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, color: '#0F4C3A', margin: '0.6rem 0 0.5rem' }}>
              The Flying Wonders Difference
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>
              We bring Singapore DMC operational excellence, transparent pricing, and 24/7 dedicated trip support to your Karnataka journey.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            
            <div style={{ background: '#F8FAFC', padding: '1.75rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                🏛️
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>
                Official KSTDC Routes
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                We partner with government certified operators, ensuring authentic heritage routes, priority entry at monuments, and verified KSTDC Mayura hotel stays.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.75rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                🚗
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>
                Private Chauffeur & Cabs
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Choose from sanitized Innova Crysta, Ertiga, Tempo Travellers, or luxury coaches with experienced local drivers who know every mountain pass and highway.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.75rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E0E7FF', color: '#4338CA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                🌿
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>
                Jungle Lodges & Resorts (JLR)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Priority booking support for iconic wildlife properties like Kabini River Lodge, Bandipur Safari Lodge, and Dubare Elephant Camp with assured safari slots.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.75rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FCE7F3', color: '#BE185D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                💬
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>
                Instant WhatsApp Booking
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                No complex checkout forms or hidden fees. Chat with our travel experts on WhatsApp to customize dates, hotels, and vehicle preferences instantly.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── Best Time to Visit & Climate Guide ── */}
      <section style={{ padding: 'clamp(3rem, 6vw, 4rem) 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.75rem', fontWeight: 800, padding: '0.3rem 0.85rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Travel Advisory
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 900, color: '#0F4C3A', margin: '0.6rem 0 0.5rem' }}>
              Best Seasons to Visit Karnataka
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            
            <div style={{ background: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>☀️ 🍂</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>
                Winter & Post-Monsoon (Oct – Mar)
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '0.15rem 0.55rem', borderRadius: '12px', display: 'inline-block', marginBottom: '0.75rem' }}>
                Peak Season • Pleasant & Cool
              </span>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Ideal for exploring Hampi & Badami ruins, Mysore Palace illumination, and open-jeep tiger safaris in Kabini & Bandipur.
              </p>
            </div>

            <div style={{ background: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🌧️ 🌈</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>
                Monsoon Season (Jul – Sep)
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284C7', background: '#E0F2FE', padding: '0.15rem 0.55rem', borderRadius: '12px', display: 'inline-block', marginBottom: '0.75rem' }}>
                Waterfalls & Rainforests
              </span>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Magical time for Jog Falls, Abbey Falls, Agumbe rainforests, and lush green coffee plantations in Coorg & Chikmagalur.
              </p>
            </div>

            <div style={{ background: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🌄 ☕</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>
                Summer Hill Escapes (Apr – Jun)
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '0.15rem 0.55rem', borderRadius: '12px', display: 'inline-block', marginBottom: '0.75rem' }}>
                Cool Mountain Getaways
              </span>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Escape the city heat in the cool breeze of Madikeri, Mullayanagiri peak, Kemmanagundi, and Ooty Nilgiri corridors.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section style={{ padding: 'clamp(3rem, 6vw, 4.5rem) 1.5rem', background: '#FFF' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ background: '#E0E7FF', color: '#3730A3', fontSize: '0.75rem', fontWeight: 800, padding: '0.3rem 0.85rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Got Questions?
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 900, color: '#0F4C3A', margin: '0.6rem 0 0.5rem' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                q: 'How does the Bengaluru HOHO Double-Decker bus ticket work?',
                a: 'The Bengaluru HOHO (Ambaari) bus operates on a circular route starting from Ravindra Kalakshetra (JC Road) between 10:30 AM and 8:00 PM. A single ₹180 ticket allows you to ride the double-decker bus, hop off at any of the designated tourist stops (like Vidhana Soudha, High Court, Visvesvaraya Museum), explore at your pace, and hop back onto any following Ambaari bus throughout the day.'
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
                    background: '#F8FAFC',
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
                      padding: '1.1rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      color: '#0F172A',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} color="#0F4C3A" /> : <ChevronDown size={18} color="#64748B" />}
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 1.25rem 1.1rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ── Final Call to Action Banner ── */}
      <section style={{
        background: 'linear-gradient(135deg, #093E30 0%, #0F4C3A 100%)',
        color: '#FFF',
        padding: 'clamp(3rem, 6vw, 4.5rem) 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ background: 'rgba(212,175,55,0.2)', color: '#FDE047', fontSize: '0.75rem', fontWeight: 800, padding: '0.3rem 0.85rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Plan Your Journey Today
          </span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0.8rem 0 1rem' }}>
            Ready to Discover Karnataka?
          </h2>
          <p style={{ fontSize: '1rem', color: '#E2E8F0', maxWidth: '600px', margin: '0 auto 2rem', fontWeight: 300 }}>
            Chat with our Karnataka tour specialists on WhatsApp. Get instant itinerary customization, transparent pricing, and hotel recommendations within 15 minutes.
          </p>

          <a
            href={buildGeneralWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: '#25D366',
              color: '#FFF',
              padding: '0.9rem 2.2rem',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(37,211,102,0.35)'
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
            maxWidth: '620px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
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

            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F4C3A', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              {activeModalPackage.category.toUpperCase()} • {activeModalPackage.duration}
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.5rem', lineHeight: 1.3 }}>
              {activeModalPackage.title}
            </h3>

            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {activeModalPackage.subtitle}
            </p>

            {/* Inclusions Strip */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F4C3A', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Included in Package:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.78rem', color: '#334155' }}>
                {activeModalPackage.inclusions.map((inc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={14} color="#166534" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Customizer Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Preferred Date</label>
                  <input
                    type="date"
                    value={selectedTravelDate}
                    onChange={e => setSelectedTravelDate(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Travelers (Pax)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={selectedTravelers}
                    onChange={e => setSelectedTravelers(parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Special Requests / Vehicle Preference</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Need private Innova Crysta, 4-star resort in Madikeri, veg food only..."
                  value={customNotes}
                  onChange={e => setCustomNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none', resize: 'none' }}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Starting Price</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F4C3A' }}>
                  ₹{activeModalPackage.priceINR.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>(~S${activeModalPackage.priceSGD})</span>
                </div>
              </div>

              <a
                href={buildWhatsAppLink(activeModalPackage)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#25D366',
                  color: '#FFF',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(37,211,102,0.3)'
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
