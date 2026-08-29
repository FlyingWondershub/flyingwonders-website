'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Compass,
  MapPin,
  Clock,
  Sparkles,
  Play,
  Check,
  Share2,
  ArrowLeft,
  Package,
  MessageCircle,
  ShieldCheck,
  Ticket,
  Lightbulb,
  CheckCircle2,
  Printer,
  Navigation,
  Utensils,
  CloudSun,
  Users,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { TourData, DEFAULT_TOURS } from '../utils/tours'
import PackageShortsCarousel from './PackageShortsCarousel'
import AppDownloadCard from './AppDownloadCard'

export default function TourDetailClient({ tour }: { tour: TourData }) {
  const [copied, setCopied] = useState(false)
  
  // Interactive Pax Calculator State
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [includeTransfers, setIncludeTransfers] = useState(false)
  const [includeGuide, setIncludeGuide] = useState(false)

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handlePrintPdf = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return ''
    try {
      if (url.includes('/embed/')) return url
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]
        return `https://www.youtube.com/embed/${id}?rel=0`
      }
      if (url.includes('youtube.com/watch')) {
        const match = url.match(/[?&]v=([^&]+)/)
        if (match && match[1]) return `https://www.youtube.com/embed/${match[1]}?rel=0`
      }
    } catch (e) {}
    return url
  }

  // Price calculations
  const baseAdultPrice = tour.groupPricing?.adultEstimate || 150
  const baseChildPrice = tour.groupPricing?.childEstimate || 120
  const transferAddon = includeTransfers ? 140 : 0
  const guideAddon = includeGuide ? 220 : 0
  const calculatedTotal = (adults * baseAdultPrice) + (children * baseChildPrice) + transferAddon + guideAddon

  const targetWhatsappNumber = (tour.whatsappNumber || '919886171251').replace(/[^0-9]/g, '')
  
  const customWhatsappMessage = encodeURIComponent(
    `Hi Flying Wonders! I would like to request a B2B group quote for "${tour.title}".\n` +
    `• Adults: ${adults}\n` +
    `• Children: ${children}\n` +
    `• Private Van Transfer: ${includeTransfers ? 'Yes' : 'No'}\n` +
    `• Tour Guide: ${includeGuide ? 'Yes' : 'No'}\n` +
    `• Estimated Total: S$${calculatedTotal}\n` +
    `Please advise confirmed agent rates and availability.`
  )

  const relatedTours = DEFAULT_TOURS.filter(t => t.slug !== tour.slug)

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B', paddingBottom: '3rem' }}>
      
      {/* ── 1. BREADCRUMBS & TOP ACTION BAR ── */}
      <div className="no-print" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0.85rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748B', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/services-catalog" style={{ color: '#64748B', textDecoration: 'none' }}>Services Catalog</Link>
            <span>/</span>
            <Link href="/services-catalog?tab=tours" style={{ color: '#64748B', textDecoration: 'none' }}>Tours & Day Circuits</Link>
            <span>/</span>
            <strong style={{ color: '#0F4C3A' }}>{tour.title}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrintPdf}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#F1F5F9',
                color: '#334155',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Printer size={15} />
              <span>Print / Client PDF</span>
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: copied ? '#ECFDF5' : '#FFF',
                color: copied ? '#059669' : '#475569',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Share2 size={15} />
              <span>{copied ? 'Link Copied! ✓' : 'Share Tour'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. HERO BANNER ── */}
      <section style={{ maxWidth: '1200px', margin: '1.5rem auto 1.5rem', padding: '0 1.5rem' }}>
        <div style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          minHeight: '340px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '2.5rem 2rem',
          background: `linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.45) 60%, rgba(0,0,0,0.15) 100%), url(${tour.coverImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
            <span style={{
              background: '#0F4C3A',
              color: '#FFF',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Sparkles size={13} /> Official 1-Day Tour Circuit
            </span>

            <span style={{
              background: '#1D4ED8',
              color: '#FFF',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Clock size={13} /> {tour.duration}
            </span>

            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              color: '#FFF',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <MapPin size={13} /> {tour.destination}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '0 0 0.5rem',
            lineHeight: 1.2,
            fontFamily: 'var(--font-playfair), serif',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}>
            {tour.title}
          </h1>

          {tour.subtitle && (
            <p style={{ fontSize: '1rem', color: '#E2E8F0', margin: 0, fontWeight: 500, maxWidth: '750px', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              {tour.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* ── 3. QUICK SECTION NAVIGATION LINKS ── */}
      <section className="no-print" style={{ maxWidth: '1200px', margin: '0 auto 2rem', padding: '0 1.5rem' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '0.85rem 1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          boxShadow: '0 4px 16px -2px rgba(0,0,0,0.05)'
        }}>
          {/* 1. Must Do */}
          <a
            href="#must-do"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('must-do')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textDecoration: 'none',
              color: '#0F172A',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#15803D" />
              <div>
                <strong style={{ fontSize: '0.86rem', display: 'block' }}>Key Highlights</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Must-Do Inclusions</span>
              </div>
            </div>
            <span style={{ fontSize: '0.9rem', color: '#059669', fontWeight: 800 }}>↓</span>
          </a>

          {/* 2. Hourly Circuit Timeline */}
          <a
            href="#timeline-route"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('timeline-route')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textDecoration: 'none',
              color: '#0F172A',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#2563EB" />
              <div>
                <strong style={{ fontSize: '0.86rem', display: 'block' }}>Hourly Timeline</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Full-Day Circuit</span>
              </div>
            </div>
            <span style={{ fontSize: '0.9rem', color: '#2563EB', fontWeight: 800 }}>↓</span>
          </a>

          {/* 3. Route & Wayfinding */}
          <a
            href="#route-directions"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('route-directions')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textDecoration: 'none',
              color: '#0F172A',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} color="#D97706" />
              <div>
                <strong style={{ fontSize: '0.86rem', display: 'block' }}>Route & Transit</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Google Maps GPS</span>
              </div>
            </div>
            <span style={{ fontSize: '0.9rem', color: '#D97706', fontWeight: 800 }}>↓</span>
          </a>

          {/* 4. 4K Video & Shorts */}
          <a
            href="#in-depth-experience"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('in-depth-experience')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textDecoration: 'none',
              color: '#0F172A',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={18} color="#9333EA" fill="#9333EA" />
              <div>
                <strong style={{ fontSize: '0.86rem', display: 'block' }}>4K Video & Shorts</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Walkthrough Reels</span>
              </div>
            </div>
            <span style={{ fontSize: '0.9rem', color: '#9333EA', fontWeight: 800 }}>↓</span>
          </a>

          {/* 5. Dining Guide */}
          <a
            href="#dining-guide"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('dining-guide')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textDecoration: 'none',
              color: '#0F172A',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Utensils size={18} color="#EA580C" />
              <div>
                <strong style={{ fontSize: '0.86rem', display: 'block' }}>Halal & Dining</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Route Pitstops</span>
              </div>
            </div>
            <span style={{ fontSize: '0.9rem', color: '#EA580C', fontWeight: 800 }}>↓</span>
          </a>
        </div>
      </section>

      {/* ── 4. MAIN CONTENT: 2-COLUMN LAYOUT ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* LEFT COLUMN: Overview, Highlights, Timeline, Maps, Video, Dining, Tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', gridColumn: 'span 2' }}>
          
          {/* Overview Section */}
          <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={20} color="#0F4C3A" /> Circuit Overview & Strategy
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
              {tour.description}
            </p>
          </div>

          {/* MUST-DO EXPERIENCES & INCLUSIONS */}
          <div id="must-do" style={{ scrollMarginTop: '100px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.35rem' }}>✨</span>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Signature Inclusions & Must-Experience Highlights
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
                  Complete package components included in this 1-day itinerary circuit.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(tour.features || tour.mustDoThings || []).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '1rem 1.15rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0F4C3A', color: '#FFF', fontSize: '0.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    {idx + 1}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.55, fontWeight: 600 }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── HOURLY CIRCUIT TIMELINE ── */}
          {tour.itineraryTimeline && tour.itineraryTimeline.length > 0 && (
            <div id="timeline-route" style={{ scrollMarginTop: '100px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={22} color="#2563EB" /> Step-by-Step Hourly Circuit Timeline
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
                    Time-stamped master itinerary optimized for seamless transit and zero wasted queue time.
                  </p>
                </div>

                <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px' }}>
                  {tour.itineraryTimeline.length} Chronological Stops
                </span>
              </div>

              <div style={{ position: 'relative', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {/* Vertical timeline spine */}
                <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '7px', width: '2px', background: '#CBD5E1' }} />

                {tour.itineraryTimeline.map((stop, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    {/* Circle marker on line */}
                    <div style={{
                      position: 'absolute',
                      left: '-1.5rem',
                      top: '4px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#2563EB',
                      border: '3px solid #FFF',
                      boxShadow: '0 0 0 2px #93C5FD'
                    }} />

                    <div style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '0.45rem' }}>
                        <span style={{ background: '#DBEAFE', color: '#1E40AF', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                          ⏱️ {stop.time}
                        </span>

                        {stop.badge && (
                          <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                            {stop.badge}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.5rem' }}>
                        {stop.title}
                      </h3>

                      <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
                        {stop.description}
                      </p>

                      {/* Linked Attraction Chip & Transit Note */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '0.65rem', borderTop: '1px solid #E2E8F0' }}>
                        {stop.attractionSlug ? (
                          <Link
                            href={`/services-catalog/attractions/${stop.attractionSlug}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#0F4C3A',
                              color: '#FFF',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              textDecoration: 'none'
                            }}
                          >
                            <span>Explore {stop.title.split('(')[0].trim()} Guide</span>
                            <ExternalLink size={12} />
                          </Link>
                        ) : <div />}

                        {stop.transitNote && (
                          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Navigation size={13} color="#D97706" /> {stop.transitNote}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MULTI-STOP ROUTE NAVIGATOR & GOOGLE MAPS ── */}
          <div id="route-directions" style={{ scrollMarginTop: '100px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={20} color="#0F4C3A" /> Circuit Route Navigator & Transit Plan
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
                  Sequential waypoints connecting each stop with Google Maps turn-by-turn routing.
                </p>
              </div>

              {tour.googleMapsRouteUrl && (
                <a
                  href={tour.googleMapsRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    border: '1px solid #BFDBFE'
                  }}
                >
                  <span>Open Full Route in Google Maps</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>

            {/* Waypoint Steps */}
            {tour.routeWaypoints && tour.routeWaypoints.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {tour.routeWaypoints.map((wp, idx) => (
                  <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#D97706', color: '#FFF', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Stop {idx + 1}</span>
                      <strong style={{ fontSize: '0.82rem', color: '#0F172A' }}>{wp}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Embedded Google Map */}
            <div style={{ position: 'relative', paddingBottom: '45%', height: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <iframe
                title="Circuit Map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(tour.routeWaypoints?.[0] || tour.destination)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          {/* ── 4K VIDEO TOUR & SHORTS REELS ── */}
          <div id="in-depth-experience" style={{ scrollMarginTop: '100px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {tour.videoUrl && (
              <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Play size={20} color="#EF4444" fill="#EF4444" /> 4K Cinematic Tour Walkthrough
                  </h2>
                  <a
                    href={tour.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textDecoration: 'none'
                    }}
                  >
                    <span>Watch on YouTube</span> ↗
                  </a>
                </div>

                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', background: '#000' }}>
                  <iframe
                    src={getYouTubeEmbedUrl(tour.videoUrl)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* YOUTUBE SHORTS CAROUSEL */}
            {tour.shorts && tour.shorts.length > 0 && (
              <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <PackageShortsCarousel
                  destination={tour.destination}
                  curatedShorts={tour.shorts}
                />
              </div>
            )}
          </div>

          {/* ── RECOMMENDED DINING & DIETARY GUIDE ── */}
          {tour.diningOptions && tour.diningOptions.length > 0 && (
            <div id="dining-guide" style={{ scrollMarginTop: '100px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <Utensils size={22} color="#EA580C" />
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Recommended Dining Pitstops (Halal & Vegetarian Friendly)
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
                    Vetted food spots and refreshment stops located directly along this circuit.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {tour.diningOptions.map((d, idx) => (
                  <div key={idx} style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '12px', padding: '1.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.92rem', color: '#9A3412' }}>{d.restaurantName}</strong>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {d.isHalal && <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>HALAL</span>}
                        {d.isVegetarian && <span style={{ background: '#FEF08A', color: '#854D0E', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>VEG</span>}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#7C2D12', margin: '0 0 0.4rem', fontWeight: 600 }}>{d.cuisine}</p>
                    <span style={{ fontSize: '0.74rem', color: '#9A3412', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {d.location}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PRO-TIPS & WEATHER READINESS ── */}
          {tour.tipsAndTricks && tour.tipsAndTricks.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <Lightbulb size={22} color="#D97706" />
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Insider Pro-Tips & Rain-Proof Indoor Hacks
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
                    Practical logistics advice from our local Singapore operations team.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                {tour.tipsAndTricks.map((tip, idx) => (
                  <div key={idx} style={{ background: '#FEFCE8', border: '1px solid #FEF08A', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#713F12', lineHeight: 1.5, fontWeight: 600 }}>
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OFFICIAL MOBILE VISITOR APP CARD */}
          {tour.appDetails && (
            <AppDownloadCard appDetails={tour.appDetails} />
          )}

          {/* ── NEXT-DAY COMBINATION CIRCUITS ── */}
          <div className="no-print" style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#0F4C3A" /> Combine with Next-Day Tour Circuits
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {relatedTours.map((rt) => (
                <Link
                  key={rt._id}
                  href={`/services-catalog/tours/${rt.slug}`}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '1.15rem',
                    textDecoration: 'none',
                    color: '#0F172A',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span style={{ background: '#DBEAFE', color: '#1E40AF', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px' }}>
                      {rt.duration}
                    </span>
                    <strong style={{ fontSize: '0.92rem', color: '#0F172A', display: 'block', lineHeight: 1.3, marginBottom: '6px' }}>
                      {rt.title}
                    </strong>
                    <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                      {rt.subtitle || rt.destination}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1rem', color: '#0F4C3A', fontWeight: 800, fontSize: '0.8rem' }}>
                    <span>View Itinerary</span>
                    <ChevronRight size={14} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: STICKY B2B POWER CARD ── */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{
            background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)',
            color: '#FFF',
            borderRadius: '18px',
            padding: '1.75rem',
            boxShadow: '0 8px 25px rgba(15,76,58,0.2)',
            position: 'sticky',
            top: '2rem'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.85rem' }}>
              <ShieldCheck size={13} color="#10B981" /> Wholesale DMC Tour Circuit
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFF', margin: '0 0 0.5rem' }}>
              B2B Group & FIT Booking
            </h3>

            <p style={{ fontSize: '0.82rem', color: '#E2E8F0', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Instant wholesale e-tickets and optional private vehicle transfers for trade partners.
            </p>

            {/* Interactive Pax & Price Calculator */}
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0' }}>Adults (12+ yrs):</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.2)', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
                  >-</button>
                  <strong style={{ fontSize: '0.95rem', minWidth: '20px', textAlign: 'center' }}>{adults}</strong>
                  <button
                    onClick={() => setAdults(adults + 1)}
                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.2)', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
                  >+</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0' }}>Children (3–11 yrs):</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.2)', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
                  >-</button>
                  <strong style={{ fontSize: '0.95rem', minWidth: '20px', textAlign: 'center' }}>{children}</strong>
                  <button
                    onClick={() => setChildren(children + 1)}
                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.2)', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
                  >+</button>
                </div>
              </div>

              {/* Optional Add-on Toggles */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#F1F5F9', cursor: 'pointer', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <input
                  type="checkbox"
                  checked={includeTransfers}
                  onChange={(e) => setIncludeTransfers(e.target.checked)}
                />
                <span>Add Private 7-Seater Van (+S$140)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#F1F5F9', cursor: 'pointer', marginTop: '0.4rem' }}>
                <input
                  type="checkbox"
                  checked={includeGuide}
                  onChange={(e) => setIncludeGuide(e.target.checked)}
                />
                <span>Add Licensed Tourist Guide (+S$220)</span>
              </label>

              <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#A7F3D0', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Estimated Package</span>
                  <strong style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFF' }}>S${calculatedTotal}</strong>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>for {adults + children} Total Pax</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                href="/custom-package"
                style={{
                  background: '#B83A4B',
                  color: '#FFF',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(184,58,75,0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Package size={17} />
                <span>Build Custom Package ⚙️</span>
              </Link>

              <Link
                href="/singapore-attractions"
                style={{
                  background: '#0284C7',
                  color: '#FFF',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(2,132,199,0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Ticket size={17} />
                <span>Book Attraction Tickets 🎟️</span>
              </Link>

              <a
                href={`https://wa.me/${targetWhatsappNumber}?text=${customWhatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: '#FFF',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(37,211,102,0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                <MessageCircle size={17} />
                <span>Request B2B Rate on WhatsApp</span>
              </a>
            </div>

            {/* Transfer Sizing Guide */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#A7F3D0', margin: '0 0 0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={14} /> Group & Vehicle Transfer Sizing:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: '#E2E8F0' }}>
                <div>• <strong>FIT (1–3 Pax):</strong> Standard Sedan or MRT transit</div>
                <div>• <strong>Small Family (4–6 Pax):</strong> 7-Seater Toyota Alphard / Maxicab</div>
                <div>• <strong>MICE / Leisure (10–40 Pax):</strong> 13-Seater Minibus or 45-Seater Coach</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-Only Footer for PDF Downloads */}
      <div className="print-only" style={{ display: 'none', marginTop: '2rem', padding: '1rem', borderTop: '1px solid #CBD5E1', fontSize: '0.8rem', color: '#64748B' }}>
        <p>Itinerary prepared by <strong>Flying Wonders Private Limited</strong> — Singapore B2B Destination Management Company.</p>
        <p>Contact: +91 9886171251 / +65 9472 2830 | Website: https://flyingwonders.net</p>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print, header, footer, nav, .whatsapp-float {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: #FFFFFF !important;
            color: #000000 !important;
          }
          div, section {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  )
}
