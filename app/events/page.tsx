'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { client } from '../../sanity/lib/client'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Video, 
  Image as ImageIcon, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  Sparkles, 
  Send, 
  Users, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Building,
  Award,
  Play,
  X
} from 'lucide-react'

// Demo Fallback Data for Trade Shows
const FALLBACK_EVENTS = [
  {
    _key: 'event-1',
    title: 'IITM International Travel Fair 2026',
    status: 'upcoming',
    startDate: '2026-09-18',
    endDate: '2026-09-20',
    city: 'Bengaluru, India',
    venue: 'BIEC (Bangalore International Exhibition Centre)',
    boothNumber: 'Hall 2 · Stand B-142',
    summary: 'Connecting with leading South Indian travel agents, corporate buyers, and MICE organizers. Showcasing 2026 Singapore & Malaysia wholesale B2B rates.',
    meetingBookingUrl: 'https://calendly.com',
    teamMembers: [
      { name: 'Karthik Raja', role: 'Head of Contracting & Operations', phone: '+65 9472 2830' },
      { name: 'Sanjay Kumar', role: 'B2B Regional Manager (India)', phone: '+91 98861 71251' }
    ],
    takeaways: [
      'Singapore B2B Group MICE demands increased by 35% for Q3/Q4 2026.',
      'Rise in demand for Singapore + Malaysia cross-border private luxury transfers.',
      'SME corporate travel buyers prioritizing instant automated quote software.'
    ],
    downloadableFiles: [
      { title: 'IITM 2026 Singapore DMC B2B Tariff Deck.pdf', category: 'tariff', externalUrl: '#' },
      { title: 'SME Corporate Travel Benchmark Report 2026.pdf', category: 'insights', externalUrl: '#' }
    ]
  },
  {
    _key: 'event-2',
    title: '68th TAAI Annual Convention & Expo',
    status: 'past',
    startDate: '2025-11-12',
    endDate: '2025-11-15',
    city: 'Singapore',
    venue: 'Marina Bay Sands Expo & Convention Centre',
    boothNumber: 'Grand Ballroom · Table T-88',
    summary: 'Host DMC partner presentation for 500+ top Indian travel agency delegates. Insights on Singapore Sustainable Tourism and Jewel Changi experiences.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    gallery: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80'
    ],
    takeaways: [
      'Over 220 active B2B travel agent contracts executed during TAAI Singapore.',
      'Unveiled Flying Wonders Instant Custom Package Engine for B2B Partners.',
      'Keynote speech delivered on streamlining Singapore visa & entry declaration.'
    ],
    downloadableFiles: [
      { title: 'TAAI 2025 Official Meeting Minutes & Summary.pdf', category: 'minutes', externalUrl: '#' },
      { title: 'TAAI Convention Presentation Deck.pdf', category: 'presentation', externalUrl: '#' }
    ]
  }
]

export default function EventsPage() {
  const [sanityData, setSanityData] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'past'>('all')
  const [meetingModalEvent, setMeetingModalEvent] = useState<any>(null)
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({})

  // Gated Lead Magnet Form States
  const [leadForm, setLeadForm] = useState({ name: '', company: '', email: '', inquiryType: 'Outsourced Corporate Travel Desk' })
  const [leadSubmitting, setLeadSubmitting] = useState(false)
  const [leadSuccess, setLeadSuccess] = useState(false)

  // Booking Meeting Modal Form States
  const [bookingForm, setBookingForm] = useState({ agentName: '', company: '', email: '', phone: '', preferredTime: '' })
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    client.fetch(`*[_type == "eventsPage"][0]`)
      .then(res => {
        if (res) setSanityData(res)
      })
      .catch(err => console.error('Sanity Events Page fetch error:', err))
  }, [])

  const eventsList = (sanityData?.events && sanityData.events.length > 0) ? sanityData.events : FALLBACK_EVENTS
  const filteredEvents = eventsList.filter((ev: any) => {
    if (ev.hideEvent) return false
    if (selectedTab === 'upcoming') return ev.status === 'upcoming'
    if (selectedTab === 'past') return ev.status === 'past'
    return true
  })

  const toggleAccordion = (key: string) => {
    setOpenAccordion(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLeadSubmitting(true)
    setTimeout(() => {
      setLeadSubmitting(false)
      setLeadSuccess(true)
    }, 800)
  }

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBookingSubmitting(true)
    setTimeout(() => {
      setBookingSubmitting(false)
      setBookingSuccess(true)
    }, 800)
  }

  if (sanityData?.hidePage) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Trade Shows & Events Page</h2>
        <p>This page is currently offline for maintenance.</p>
        <Link href="/" style={{ color: '#059669', fontWeight: 700 }}>Return to Homepage</Link>
      </div>
    )
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '6rem' }}>
      
      {/* 1. HERO SECTION */}
      {!sanityData?.hideHero && (
        <section style={{ 
          background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)', 
          color: '#FFF', 
          padding: '4.5rem 1.5rem 6rem', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '950px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <span style={{ 
              background: 'rgba(212, 175, 55, 0.15)', 
              color: '#D4AF37', 
              border: '1px solid rgba(212, 175, 55, 0.3)', 
              padding: '0.35rem 0.95rem', 
              borderRadius: '20px', 
              fontSize: '0.78rem', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.12em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '1.25rem'
            }}>
              <Sparkles size={14} /> Flying Wonders Global DMC Roadshow
            </span>
            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: 800, margin: '0.5rem 0 1.25rem', lineHeight: 1.2 }}>
              {sanityData?.heroTitle || 'Driving Global Travel Connections: Flying Wonders on the Road'}
            </h1>
            <p style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: '780px', margin: '0 auto 2.25rem', lineHeight: 1.6, fontWeight: 300 }}>
              {sanityData?.heroSubtitle || 'Meet our executive DMC team at leading international travel trade shows, B2B conventions, and industry expos across Singapore, India, and Southeast Asia.'}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a 
                href="#upcoming-events" 
                style={{ 
                  background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)', 
                  color: '#111', 
                  fontWeight: 800, 
                  fontSize: '0.92rem', 
                  padding: '0.85rem 1.85rem', 
                  borderRadius: '8px', 
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Calendar size={18} /> Book a Meeting at Our Next Event
              </a>
              <a 
                href="#past-highlights" 
                style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  color: '#FFF', 
                  border: '1px solid rgba(255,255,255,0.25)', 
                  fontWeight: 700, 
                  fontSize: '0.92rem', 
                  padding: '0.85rem 1.85rem', 
                  borderRadius: '8px', 
                  textDecoration: 'none',
                  backdropFilter: 'blur(5px)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Video size={18} /> View Past Highlights
              </a>
            </div>
          </div>
        </section>
      )}

      <div style={{ maxWidth: '1200px', margin: '-2.5rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>

        {/* SECTION FILTER TABS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <button
            type="button"
            onClick={() => setSelectedTab('all')}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '30px',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              background: selectedTab === 'all' ? '#0F4C3A' : '#FFF',
              color: selectedTab === 'all' ? '#FFF' : '#4A5568',
              boxShadow: selectedTab === 'all' ? '0 4px 12px rgba(15,76,58,0.2)' : '0 1px 3px rgba(0,0,0,0.08)'
            }}
          >
            All Trade Shows ({eventsList.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('upcoming')}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '30px',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              background: selectedTab === 'upcoming' ? '#0F4C3A' : '#FFF',
              color: selectedTab === 'upcoming' ? '#FFF' : '#4A5568',
              boxShadow: selectedTab === 'upcoming' ? '0 4px 12px rgba(15,76,58,0.2)' : '0 1px 3px rgba(0,0,0,0.08)'
            }}
          >
            🗓️ Upcoming Conventions
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('past')}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '30px',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              background: selectedTab === 'past' ? '#0F4C3A' : '#FFF',
              color: selectedTab === 'past' ? '#FFF' : '#4A5568',
              boxShadow: selectedTab === 'past' ? '0 4px 12px rgba(15,76,58,0.2)' : '0 1px 3px rgba(0,0,0,0.08)'
            }}
          >
            📹 Past Recaps & Highlights
          </button>
        </div>

        {/* 2. UPCOMING EVENTS & LIVE MEETING SCHEDULER */}
        {!sanityData?.hideUpcomingEvents && (selectedTab === 'all' || selectedTab === 'upcoming') && (
          <section id="upcoming-events" style={{ marginBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                B2B Networking
              </span>
              <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', fontWeight: 800, color: '#1A365D', margin: '0.25rem 0' }}>
                Upcoming Trade Shows & Conventions
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
              {filteredEvents.filter((ev: any) => ev.status === 'upcoming').map((ev: any) => (
                <div key={ev._key || ev.title} style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ padding: '1.75rem' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <span style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                        UPCOMING EXPO
                      </span>
                      {ev.boothNumber && (
                        <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                          📍 {ev.boothNumber}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1A365D', margin: '0 0 0.85rem', lineHeight: 1.3 }}>
                      {ev.title}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} color="#059669" />
                        <span><strong>Dates:</strong> {ev.startDate} {ev.endDate ? `to ${ev.endDate}` : ''}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} color="#059669" />
                        <span><strong>City/Venue:</strong> {ev.city} — {ev.venue}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                      {ev.summary}
                    </p>

                    {/* Attending DMC Team Members */}
                    {ev.teamMembers && ev.teamMembers.length > 0 && (
                      <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1A365D', display: 'block', marginBottom: '0.35rem' }}>
                          👥 Attending Flying Wonders DMC Team:
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.78rem', color: '#475569' }}>
                          {ev.teamMembers.map((m: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span><strong>{m.name}</strong> ({m.role})</span>
                              {m.phone && <a href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>WhatsApp 💬</a>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  <div style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: '1.25rem 1.75rem', display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setMeetingModalEvent(ev)}
                      style={{ 
                        flex: 1, 
                        background: 'linear-gradient(135deg, #0F4C3A 0%, #059669 100%)', 
                        color: '#FFF', 
                        padding: '0.75rem 1rem', 
                        borderRadius: '8px', 
                        fontWeight: 800, 
                        fontSize: '0.88rem', 
                        border: 'none', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 3px 8px rgba(5,150,105,0.2)'
                      }}
                    >
                      <Clock size={16} /> Schedule 15-Min Meeting
                    </button>

                    {ev.meetingBookingUrl && (
                      <a
                        href={ev.meetingBookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: '#FFF', border: '1px solid #CBD5E1', color: '#334155', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Open External Booking"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. INTERACTIVE MEDIA & EVENT RECAPS (SEO & SOCIAL PROOF ENGINE) */}
        {!sanityData?.hidePastHighlights && (selectedTab === 'all' || selectedTab === 'past') && (
          <section id="past-highlights" style={{ marginBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ color: '#2563EB', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Event Archives & Takeaways
              </span>
              <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', fontWeight: 800, color: '#1A365D', margin: '0.25rem 0' }}>
                Past Event Highlights & Industry Insights
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {filteredEvents.filter((ev: any) => ev.status === 'past' || selectedTab === 'past').map((ev: any) => (
                <div key={ev._key || ev.title} style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '2rem' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    
                    {/* Media Container (Video / Cover) */}
                    <div>
                      {ev.videoUrl ? (
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', background: '#000' }}>
                          <iframe 
                            src={ev.videoUrl} 
                            title={ev.title} 
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: '220px', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                          <Video size={40} />
                        </div>
                      )}

                      {/* Photo Grid Lightbox */}
                      {ev.gallery && ev.gallery.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
                          {ev.gallery.map((imgUrl: string, gIdx: number) => (
                            <div 
                              key={gIdx}
                              onClick={() => setLightboxImg(imgUrl)}
                              style={{ height: '75px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #CBD5E1' }}
                            >
                              <img src={imgUrl} alt={`${ev.title} recap ${gIdx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content Brief & Takeaways */}
                    <div>
                      <span style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                        PAST HIGHLIGHT · {ev.city}
                      </span>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A365D', margin: '0.5rem 0' }}>
                        {ev.title}
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                        {ev.summary}
                      </p>

                      {/* Key Industry Takeaways */}
                      {ev.takeaways && ev.takeaways.length > 0 && (
                        <div style={{ background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '1.15rem', marginBottom: '1.25rem' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#0F4C3A', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                            <Award size={16} /> Key Industry Takeaways Observed:
                          </strong>
                          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                            {ev.takeaways.map((item: string, idx: number) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Downloadable Collateral & Minutes */}
                      {ev.downloadableFiles && ev.downloadableFiles.length > 0 && (
                        <div>
                          <strong style={{ fontSize: '0.82rem', color: '#1A365D', display: 'block', marginBottom: '0.5rem' }}>
                            📄 Downloadable Event Collateral & Minutes:
                          </strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {ev.downloadableFiles.map((f: any, fIdx: number) => (
                              <a
                                key={fIdx}
                                href={f.externalUrl || '#'}
                                target="_blank"
                                rel="noreferrer"
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between', 
                                  background: '#FFF', 
                                  border: '1px solid #CBD5E1', 
                                  padding: '0.55rem 0.85rem', 
                                  borderRadius: '6px', 
                                  fontSize: '0.82rem', 
                                  color: '#0F4C3A', 
                                  fontWeight: 700, 
                                  textDecoration: 'none' 
                                }}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <FileText size={15} color="#059669" /> {f.title}
                                </span>
                                <Download size={14} color="#059669" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. KNOWLEDGE HUB & GATED LEAD MAGNET */}
        {!sanityData?.hideLeadMagnet && (
          <section style={{ background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', padding: '2.5rem', marginBottom: '4rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
              
              <div>
                <span style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                  EXCLUSIVE B2B INDUSTRY REPORT
                </span>
                <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2rem', fontWeight: 800, color: '#1A365D', margin: '0.5rem 0 1rem' }}>
                  Missed Us at the Booth?
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Download the <strong>2026 SME & Corporate Travel Benchmark Report</strong> (Presented by Flying Wonders at TAAI & IITM Expos). Gain key data on Singapore wholesale pricing, cross-border transfer tariffs, and DMC partnership perks.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} color="#059669" /> Includes 2026 Wholesale Singapore & Malaysia Tariff Guide
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} color="#059669" /> MICE Group Incentive Package Comparison Matrix
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} color="#059669" /> Fast-Track Visa & Entry Declaration Workflow
                  </div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem' }}>
                {leadSuccess ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <CheckCircle size={48} color="#059669" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A365D' }}>Report Request Received!</h3>
                    <p style={{ fontSize: '0.88rem', color: '#475569' }}>Our B2B DMC Desk has emailed the 2026 Benchmark Report & B2B Tariff Deck to your email address.</p>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1A365D', margin: 0 }}>
                      Download Benchmark Report & Tariff
                    </h3>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Full Name *</label>
                      <input 
                        type="text" required placeholder="e.g. Rahul Sharma" value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Company / Agency Name *</label>
                      <input 
                        type="text" required placeholder="e.g. Zenith Travels Pvt Ltd" value={leadForm.company} onChange={e => setLeadForm({ ...leadForm, company: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Work Email *</label>
                      <input 
                        type="email" required placeholder="name@company.com" value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Inquiry Type</label>
                      <select 
                        value={leadForm.inquiryType} onChange={e => setLeadForm({ ...leadForm, inquiryType: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', outline: 'none', background: '#FFF' }}
                      >
                        <option value="Outsourced Corporate Travel Desk">Outsourced Corporate Travel Desk</option>
                        <option value="B2B Travel DMC Partnership">B2B Travel DMC Partnership</option>
                        <option value="General MICE Inquiry">General MICE Inquiry</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      disabled={leadSubmitting}
                      style={{ 
                        background: 'linear-gradient(135deg, #0F4C3A 0%, #059669 100%)', 
                        color: '#FFF', 
                        fontWeight: 800, 
                        fontSize: '0.9rem', 
                        padding: '0.75rem', 
                        borderRadius: '8px', 
                        border: 'none', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                      }}
                    >
                      <Download size={16} /> {leadSubmitting ? 'Generating Package...' : 'Download Report & Connect'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </section>
        )}

      </div>

      {/* 5. STICKY FOOTER B2B CONTACT BANNER */}
      {!sanityData?.hideFooterCTA && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0F172A', color: '#FFF', padding: '0.85rem 1.5rem', zIndex: 100, borderTop: '2px solid #D4AF37', boxShadow: '0 -4px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Attending an ongoing Travel Expo right now? Connect directly with our Expo Operations Team!</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a 
                href="https://wa.me/6594722830?text=Hi%20Flying%20Wonders%20Team%2C%20I%20am%20at%20the%20travel%20expo%20and%20would%20like%20to%20connect!" 
                target="_blank" 
                rel="noreferrer"
                style={{ background: '#25D366', color: '#FFF', padding: '0.45rem 1rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <MessageSquare size={15} /> Instant WhatsApp Connect
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MEETING BOOKING MODAL */}
      {meetingModalEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setMeetingModalEvent(null)}>
          <div style={{ background: '#FFF', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '2rem', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            
            <button 
              type="button" 
              onClick={() => setMeetingModalEvent(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <X size={20} color="#64748B" />
            </button>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle size={48} color="#059669" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A365D' }}>15-Min Meeting Reserved!</h3>
                <p style={{ fontSize: '0.88rem', color: '#475569' }}>Our team at <strong>{meetingModalEvent.title}</strong> will confirm your booth appointment via WhatsApp & Email.</p>
                <button type="button" onClick={() => setMeetingModalEvent(null)} style={{ background: '#0F4C3A', color: '#FFF', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '6px', fontWeight: 700, marginTop: '1rem', cursor: 'pointer' }}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Booth Meeting Request</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A365D', margin: '0.2rem 0 0' }}>
                    Schedule at {meetingModalEvent.title}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>📍 {meetingModalEvent.boothNumber || meetingModalEvent.venue}</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Your Name *</label>
                  <input 
                    type="text" required placeholder="e.g. Vikram Patel" value={bookingForm.agentName} onChange={e => setBookingForm({ ...bookingForm, agentName: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Company / Agency *</label>
                  <input 
                    type="text" required placeholder="e.g. Global Holidays" value={bookingForm.company} onChange={e => setBookingForm({ ...bookingForm, company: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>Work Email *</label>
                    <input 
                      type="email" required placeholder="email@domain.com" value={bookingForm.email} onChange={e => setBookingForm({ ...bookingForm, email: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>WhatsApp Phone *</label>
                    <input 
                      type="text" required placeholder="+91 9876543210" value={bookingForm.phone} onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={bookingSubmitting}
                  style={{ 
                    background: 'linear-gradient(135deg, #0F4C3A 0%, #059669 100%)', 
                    color: '#FFF', 
                    fontWeight: 800, 
                    fontSize: '0.9rem', 
                    padding: '0.75rem', 
                    borderRadius: '8px', 
                    border: 'none', 
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  {bookingSubmitting ? 'Confirming...' : 'Confirm 15-Min Meeting Appointment'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* LIGHTBOX POPUP */}
      {lightboxImg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setLightboxImg(null)}>
          <div style={{ position: 'relative', maxWidth: '900px', width: '100%', maxHeight: '90vh' }}>
            <button type="button" onClick={() => setLightboxImg(null)} style={{ position: 'absolute', top: '-2rem', right: 0, color: '#FFF', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={28} />
            </button>
            <img src={lightboxImg} alt="Event recap preview" style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
        </div>
      )}

    </div>
  )
}
