'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { client } from '../../sanity/lib/client'
import { 
  Sparkles, 
  CheckCircle2, 
  Video, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Globe, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Users, 
  BadgePercent,
  PhoneCall,
  UserCheck,
  Check,
  X,
  Loader2
} from 'lucide-react'

export default function TravelConsultingPage() {
  const [activeSegment, setActiveSegment] = useState<'all' | 'b2c' | 'b2b'>('all')
  const [sanityPackages, setSanityPackages] = useState<any[]>([])
  const [sanityConsultants, setSanityConsultants] = useState<any[]>([])
  const [sanitySettings, setSanitySettings] = useState<any>({})

  // Modal State for Booking Consultation
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false)
  const [selectedPkg, setSelectedPkg] = useState<any>(null)
  
  // Booking Form Fields
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [userRole, setUserRole] = useState<'Traveler' | 'Travel Agent'>('Traveler')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTimeWindow, setPreferredTimeWindow] = useState('Morning (9:00 AM – 12:00 PM SGT)')
  const [preferredLanguage, setPreferredLanguage] = useState('English')
  const [tripDetails, setTripDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<any>(null)

  useEffect(() => {
    // Fetch Sanity Consultants
    client.fetch(`*[_type == "travelConsultant" && isActive != false]{
      _id,
      name,
      title,
      bio,
      languages,
      whatsappNumber,
      "avatarUrl": avatar.asset->url
    }`)
    .then(res => { if (res) setSanityConsultants(res) })
    .catch(() => {})

    // Fetch Sanity Packages
    client.fetch(`*[_type == "travelConsultingPackage"] | order(order asc){
      _id,
      title,
      subtitle,
      priceSgd,
      priceInr,
      inclusions,
      badgeText,
      targetAudience
    }`)
    .then(res => { if (res) setSanityPackages(res) })
    .catch(() => {})

    // Fetch Settings
    client.fetch(`*[_type == "travelConsultingSettings"][0]`)
    .then(res => { if (res) setSanitySettings(res) })
    .catch(() => {})
  }, [])

  const defaultPackages = [
    {
      id: 'pkg-plan',
      title: 'Plan & Prepare Consultation',
      subtitle: 'Ideal for custom trip planning, hotel selection, and entry clearance.',
      priceSgd: 45,
      priceInr: 2499,
      badgeText: 'Most Popular for Families',
      targetAudience: 'b2c',
      inclusions: [
        '30-Min 1-on-1 Consultation Call with SG DMC Specialist',
        'Custom day-by-day itinerary tailored to budget & preferences',
        'Hotel, Fine Dining, & Attraction recommendations',
        'Official SGAC / MDAC pre-arrival clearance guidance',
        '100% Fee Credited on package or ticket booking'
      ]
    },
    {
      id: 'pkg-vip',
      title: 'VIP Journey & On-Ground Support',
      subtitle: 'Complete trip guidance with 24/7 live assistance during travel.',
      priceSgd: 89,
      priceInr: 4999,
      badgeText: '24/7 WhatsApp Concierge',
      targetAudience: 'b2c',
      inclusions: [
        'Everything in Plan & Prepare',
        '24/7 Live WhatsApp Concierge during your trip in SG & MY',
        'Real-time Changi flight radar & border traffic updates',
        'Priority restaurant & attraction slot reservations',
        'Emergency local DMC helpline in Singapore',
        '100% Fee Credited on final package booking'
      ]
    },
    {
      id: 'pkg-b2b',
      title: 'B2B Travel Agent Circuit Strategy',
      subtitle: 'Custom DMC multi-city circuit planning & net rates for travel agents.',
      priceSgd: 139,
      priceInr: 7999,
      badgeText: 'Designed for Travel Agents',
      targetAudience: 'b2b',
      inclusions: [
        'Dedicated DMC Account Manager for Travel Agents',
        'Custom white-label itinerary with agent branding & logo',
        'Supplier Net Rate Sheet breakdown (Hotels, Transport, Vouchers)',
        'Priority quotation turnaround (< 2 Hours)',
        '100% Fee Credited toward agent invoice balance'
      ]
    }
  ]

  const displayPackages = sanityPackages.length > 0 ? sanityPackages : defaultPackages
  const filteredPackages = displayPackages.filter(p => {
    if (activeSegment === 'all') return true
    return p.targetAudience === activeSegment || p.targetAudience === 'all'
  })

  const defaultConsultants = [
    {
      name: 'Rohan Sharma',
      title: 'Senior Singapore DMC Specialist',
      bio: 'Over 12 years of experience organizing bespoke Singapore holiday circuits, Sentosa VIP experiences, and Changi transfers.',
      languages: ['English', 'Hindi', 'Tamil'],
      avatarUrl: '/images/team/rohan.jpg'
    },
    {
      name: 'Agnes V.',
      title: 'Malaysia & B2B Circuit Consultant',
      bio: 'Specialist in multi-city Singapore-Kuala Lumpur-Penang circuits, group dining logistics, and B2B agent partnerships.',
      languages: ['English', 'Italian', 'Polish'],
      avatarUrl: '/images/team/agnes.jpg'
    }
  ]

  const displayConsultants = sanityConsultants.length > 0 ? sanityConsultants : defaultConsultants

  const handleOpenBookingModal = (pkg: any) => {
    setSelectedPkg(pkg)
    setBookingSuccess(null)
    setShowBookingModal(true)
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName || !clientEmail || !clientPhone) return
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/travel-consulting/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientPhone,
          userRole,
          packageTitle: selectedPkg?.title || 'General Consultation',
          packagePrice: selectedPkg ? `SGD $${selectedPkg.priceSgd} / ₹${selectedPkg.priceInr.toLocaleString()}` : '',
          preferredDate,
          preferredTimeWindow,
          preferredLanguage,
          tripDetails
        })
      })
      const json = await res.json()
      if (json.success) {
        setBookingSuccess(json)
      } else {
        alert(json.error || 'Failed to submit consultation request.')
      }
    } catch (err: any) {
      alert('Error submitting request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '6rem' }}>
      
      {/* 1. HERO HEADER */}
      <section style={{
        background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)',
        color: '#FFF',
        padding: '1.75rem 1.25rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(212, 175, 55, 0.2)', border: '1px solid #D4AF37', padding: '0.3rem 0.85rem', borderRadius: '30px', fontSize: '0.78rem', fontWeight: 800, color: '#FDE68A', marginBottom: '0.85rem' }}>
            <BadgePercent size={14} color="#FDE68A" /> 100% Fee Credited Back Upon Booking
          </div>

          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, margin: '0 0 0.5rem', lineHeight: 1.2 }}>
            {sanitySettings.heroTitle || 'Tailored Travel Consulting for Singapore & Malaysia'}
          </h1>

          <p style={{ fontSize: '0.92rem', color: '#E2E8F0', margin: '0 auto 1.25rem', opacity: 0.9, lineHeight: 1.5, maxWidth: '720px' }}>
            {sanitySettings.heroSubtitle || 'Bespoke 1-on-1 itinerary planning, VIP on-ground support, and B2B circuit strategies from local DMC experts. 100% of your fee is credited back on your final booking balance.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleOpenBookingModal(defaultPackages[0])}
              style={{ background: '#D4AF37', color: '#0F172A', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '30px', fontWeight: 900, fontSize: '0.88rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)' }}
            >
              <span>Schedule 1-on-1 Call</span> <ArrowRight size={16} />
            </button>

            <a
              href="https://api.whatsapp.com/send?phone=919886171251&text=Hi%20Flying%20Wonders,%20I%20would%20like%20to%20inquire%20about%20Travel%20Consulting."
              target="_blank"
              rel="noreferrer"
              style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFF', border: '1px solid rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)', padding: '0.65rem 1.35rem', borderRadius: '30px', fontWeight: 800, fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>WhatsApp DMC Desk</span>
            </a>
          </div>

        </div>
      </section>

      {/* 2. DUAL AUDIENCE SEGMENT SWITCHER */}
      <div style={{ maxWidth: '1140px', margin: '-1.25rem auto 1.75rem', padding: '0 1.25rem', position: 'relative', zIndex: 10 }}>
        <div style={{ background: '#FFF', padding: '0.4rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          
          <button
            onClick={() => setActiveSegment('all')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: activeSegment === 'all' ? '#0F4C3A' : 'transparent',
              color: activeSegment === 'all' ? '#FFF' : '#475569',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Globe size={15} /> All Tiers
          </button>

          <button
            onClick={() => setActiveSegment('b2c')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: activeSegment === 'b2c' ? '#0F4C3A' : 'transparent',
              color: activeSegment === 'b2c' ? '#FFF' : '#475569',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🧳 Leisure & Family
          </button>

          <button
            onClick={() => setActiveSegment('b2b')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: activeSegment === 'b2b' ? '#0F4C3A' : 'transparent',
              color: activeSegment === 'b2b' ? '#FFF' : '#475569',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🛡️ Travel Agents (B2B)
          </button>

        </div>
      </div>

      {/* 3. TIERED CONSULTING PACKAGES GRID */}
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.3rem' }}>
            Select Your Consultation Tier
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
            Every rupee & dollar paid is 100% credited back when you book your trip or tickets with Flying Wonders.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredPackages.map(pkg => (
            <div
              key={pkg._id || pkg.id}
              style={{
                background: '#FFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '1.5rem',
                boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {pkg.badgeText && (
                <span style={{ position: 'absolute', top: '-12px', right: '16px', background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)', color: '#FFF', fontSize: '0.7rem', fontWeight: 900, padding: '3px 10px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {pkg.badgeText}
                </span>
              )}

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F4C3A', margin: '0 0 0.3rem' }}>
                  {pkg.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 1.25rem', lineHeight: 1.4 }}>
                  {pkg.subtitle}
                </p>

                {/* PRICING BOX: INR MAIN FONT, SGD SMALL FONT SECONDARY */}
                <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1.25rem', display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '1.6rem', color: '#0F172A', fontWeight: 900 }}>
                    ₹{pkg.priceInr.toLocaleString()} INR
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 700 }}>
                    (${pkg.priceSgd} SGD)
                  </span>
                </div>

                <ul style={{ margin: '0 0 1.5rem', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {pkg.inclusions?.map((inc: string, i: number) => (
                    <li key={i} style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.35 }}>
                      <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleOpenBookingModal(pkg)}
                style={{
                  width: '100%',
                  background: '#0F4C3A',
                  color: '#FFF',
                  border: 'none',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(15,76,58,0.2)'
                }}
              >
                <Calendar size={16} /> Schedule & Pay Deposit
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* 4. MEET OUR DMC CONSULTANTS SHOWCASE */}
      <div style={{ maxWidth: '1140px', margin: '4rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ background: '#FFF', borderRadius: '24px', padding: '2.5rem 2rem', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              On-The-Ground DMC Authority
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: '0.3rem 0 0' }}>
              Meet Our Singapore & Malaysia Destination Consultants
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {displayConsultants.map((c, i) => (
              <div key={i} style={{ background: '#F8FAFC', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E2E8F0', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#0F4C3A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0, overflow: 'hidden' }}>
                  {c.avatarUrl ? (
                    <img src={c.avatarUrl} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    c.name.slice(0, 2).toUpperCase()
                  )}
                </div>

                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 2px' }}>{c.name}</h4>
                  <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                    {c.title}
                  </span>
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 0.75rem', lineHeight: 1.45 }}>
                    {c.bio}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {c.languages?.map((lang: string, idx: number) => (
                      <span key={idx} style={{ background: '#FFF', border: '1px solid #CBD5E1', color: '#334155', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                        🌐 {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* 5. 100% FEE CREDIT CALCULATOR WIDGET */}
      <div style={{ maxWidth: '960px', margin: '3.5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)', border: '1px solid #A7F3D0', borderRadius: '20px', padding: '2rem', textAlign: 'center' }}>
          <BadgePercent size={32} color="#059669" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#064E3B', margin: '0 0 0.5rem' }}>
            How Does the 100% Consulting Fee Credit Work?
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#047857', margin: '0 auto 1.25rem', maxWidth: '680px', lineHeight: 1.5 }}>
            {sanitySettings.feeCreditPolicy || 'When you complete a consulting session with our team, 100% of your consulting payment (e.g. ₹2,499 / $45 SGD) is recorded in your profile. When you book your hotels, attraction tickets, or tour package with Flying Wonders, the entire amount is automatically deducted from your final invoice balance!'}
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', background: '#FFF', padding: '0.75rem 1.5rem', borderRadius: '30px', border: '1px solid #A7F3D0', fontWeight: 800, fontSize: '0.88rem', color: '#064E3B' }}>
            <span>Consulting Fee Paid</span> ➔ <span>Credited as Booking Discount</span> = <span>Net Consulting Cost: $0 FREE!</span>
          </div>
        </div>
      </div>

      {/* ══ BOOKING & SLOT REQUEST MODAL ══ */}
      {showBookingModal && (
        <div
          onClick={() => setShowBookingModal(false)}
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
              width: '620px',
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
            <button onClick={() => setShowBookingModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', color: '#64748B', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>

            <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.25rem', fontWeight: 900, color: '#0F4C3A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={22} color="#059669" /> Schedule {selectedPkg?.title || 'Consultation'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.25rem' }}>
              Select your preferred date, time window, and language. Our admin team will confirm your exact slot and assign your DMC consultant.
            </p>

            {bookingSuccess ? (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ margin: '0 0 0.4rem', color: '#166534', fontSize: '1.1rem', fontWeight: 800 }}>
                  Consultation Request Received!
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#14532D', margin: '0 0 0.75rem' }}>
                  Booking Reference: <strong>{bookingSuccess.bookingId}</strong>
                </p>
                <p style={{ fontSize: '0.8rem', color: '#166534', margin: 0 }}>
                  Our Singapore DMC admin team will review your request, assign your consultant, and send your meeting confirmation link via WhatsApp and email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Category Segment</label>
                  <select
                    value={userRole}
                    onChange={e => setUserRole(e.target.value as any)}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 600, outline: 'none', background: '#FFF' }}
                  >
                    <option value="Traveler">🧳 Leisure / Family Traveler</option>
                    <option value="Travel Agent">🛡️ Registered Travel Agent (B2B)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>WhatsApp / Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Preferred Date *</label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={e => setPreferredDate(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Preferred Time Window *</label>
                    <select
                      value={preferredTimeWindow}
                      onChange={e => setPreferredTimeWindow(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }}
                    >
                      <option value="Morning (9:00 AM – 12:00 PM SGT)">Morning (9:00 AM – 12:00 PM SGT)</option>
                      <option value="Afternoon (1:00 PM – 5:00 PM SGT)">Afternoon (1:00 PM – 5:00 PM SGT)</option>
                      <option value="Evening (6:00 PM – 9:00 PM SGT)">Evening (6:00 PM – 9:00 PM SGT)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Preferred Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={e => setPreferredLanguage(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }}
                  >
                    <option value="English">🌐 English</option>
                    <option value="Hindi">🇮🇳 Hindi</option>
                    <option value="Tamil">🇮🇳 Tamil</option>
                    <option value="Malay">🇲🇾 Malay</option>
                    <option value="Mandarin">🇨🇳 Mandarin</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Trip Notes & Destinations (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Tell us your travel dates, pax count, or specific requirements (e.g., 2 Adults + 2 Kids, 4N Singapore + 3N KL)..."
                    value={tripDetails}
                    onChange={e => setTripDetails(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ marginTop: '0.5rem', background: '#0F4C3A', color: '#FFF', border: 'none', padding: '0.85rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  <span>{isSubmitting ? 'Submitting Request...' : 'Confirm Request & Reserve Slot'}</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
