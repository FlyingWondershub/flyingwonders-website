'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Compass,
  MapPin,
  Clock,
  Sparkles,
  Play,
  ImageIcon,
  Check,
  Share2,
  ArrowLeft,
  Package,
  MessageCircle,
  ShieldCheck,
  Ticket,
  Lightbulb,
  CheckCircle2,
  Smartphone,
  X
} from 'lucide-react'
import { AttractionData } from '../utils/attractions'
import PackageShortsCarousel from './PackageShortsCarousel'
import AppDownloadCard from './AppDownloadCard'
import ImageGalleryLightbox from './ImageGalleryLightbox'

export default function AttractionDetailClient({ attraction }: { attraction: AttractionData }) {
  const [copied, setCopied] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return ''
    try {
      if (url.includes('/embed/')) {
        const separator = url.includes('?') ? '&' : '?'
        return `${url}${separator}rel=0&modestbranding=1&enablejsapi=1&cc_load_policy=0&iv_load_policy=3`
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1&cc_load_policy=0&iv_load_policy=3`
      }
      if (url.includes('youtube.com/shorts/')) {
        const id = url.split('shorts/')[1]?.split('?')[0]?.split('&')[0]
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1&cc_load_policy=0&iv_load_policy=3`
      }
      if (url.includes('youtube.com/watch')) {
        const v = new URL(url).searchParams.get('v')
        if (v) return `https://www.youtube.com/embed/${v}?rel=0&modestbranding=1&enablejsapi=1&cc_load_policy=0&iv_load_policy=3`
      }
      const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)
      if (match && match[2]?.length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?rel=0&modestbranding=1&enablejsapi=1&cc_load_policy=0&iv_load_policy=3`
      }
    } catch (e) {}
    return url
  }

  const targetWhatsappNumber = (attraction.whatsappNumber || '919886171251').replace(/[^0-9]/g, '')
  const whatsappMsgText = attraction.whatsappMessage || `Hi Flying Wonders! I would like to inquire about B2B tickets, availability, and group rates for ${attraction.name}.`
  const whatsappMsg = encodeURIComponent(whatsappMsgText)

  const allPhotos = [
    attraction.coverImageUrl,
    ...(attraction.galleryImageUrls || [])
  ].filter(Boolean)

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B', paddingBottom: '3rem' }}>
      
      {/* ── 1. BREADCRUMBS & TOP BAR ── */}
      <div className="detail-topbar-container">
        <div style={{ maxWidth: '1600px', width: '96%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748B', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/services-catalog" style={{ color: '#64748B', textDecoration: 'none' }}>Services Catalog</Link>
            <span>/</span>
            <Link href="/services-catalog" style={{ color: '#0F4C3A', fontWeight: 700, textDecoration: 'none' }}>Attractions</Link>
            <span>/</span>
            <span style={{ color: '#0F172A', fontWeight: 800 }}>{attraction.name}</span>
          </div>

          <div className="detail-topbar-actions">
            <button
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFF',
                color: copied ? '#15803D' : '#334155',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} color="#15803D" /> : <Share2 size={14} />}
              <span className="detail-topbar-label-full">{copied ? 'Link Copied!' : 'Share Attraction'}</span>
              <span className="detail-topbar-label-short">{copied ? 'Copied!' : 'Share'}</span>
            </button>

            <Link
              href="/services-catalog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #0F4C3A',
                background: '#0F4C3A',
                color: '#FFF',
                fontSize: '0.8rem',
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              <ArrowLeft size={14} />
              <span>Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. HERO SHOWCASE BANNER ── */}
      <section style={{ maxWidth: '1600px', width: '96%', margin: '1.25rem auto', padding: '0 0.5rem' }}>
        <div style={{
          position: 'relative',
          minHeight: '320px',
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundImage: `linear-gradient(to top, rgba(15,23,42,0.94) 0%, rgba(15,23,42,0.45) 50%, rgba(15,23,42,0.2) 100%), url(${attraction.coverImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'clamp(1.25rem, 3.5vw, 2.5rem)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#FEF3C7', color: '#B45309', fontWeight: 900, fontSize: '0.82rem', padding: '4px 10px', borderRadius: '8px' }}>
              ★ {attraction.starRating || '4.9'}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#FFF', fontWeight: 700, fontSize: '0.82rem', padding: '4px 12px', borderRadius: '8px', backdropFilter: 'blur(6px)' }}>
              <Compass size={13} style={{ display: 'inline', marginRight: '4px' }} /> {attraction.category || 'Theme Park'}
            </span>
            <span style={{ background: '#DCFCE7', color: '#15803D', fontWeight: 800, fontSize: '0.78rem', padding: '4px 10px', borderRadius: '8px' }}>
              <ShieldCheck size={13} style={{ display: 'inline', marginRight: '4px' }} /> Verified DMC Direct Entry
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, color: '#FFFFFF', margin: '0 0 0.5rem', letterSpacing: '-0.02em', lineHeight: 1.15, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
            {attraction.name}
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#E2E8F0', margin: 0, fontWeight: 500, maxWidth: '800px', overflowWrap: 'break-word' }}>
            📍 {attraction.locationAddress || attraction.subtitle || attraction.destination}
          </p>
        </div>
      </section>

      {/* ── 3. QUICK SECTION NAVIGATION LINKS ── */}
      <section style={{ maxWidth: '1600px', width: '96%', margin: '0 auto 1.5rem', padding: '0 0.5rem' }}>
        <div className="quick-jump-grid" style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '0.85rem 1rem',
          boxShadow: '0 4px 16px -2px rgba(0,0,0,0.05)'
        }}>
          {/* 1. Must Do */}
          <a
            href="#must-do"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('must-do')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="quick-jump-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div className="quick-jump-icon" style={{ background: '#DCFCE7' }}>
                <Sparkles size={19} color="#15803D" />
              </div>
              <div style={{ minWidth: 0 }}>
                <strong className="quick-jump-title">Must Do</strong>
                <span className="quick-jump-sub">Top Rides & Highlights</span>
              </div>
            </div>
            <span className="quick-jump-arrow" style={{ color: '#059669' }}>↓</span>
          </a>

          {/* 2. Mobile App download */}
          <a
            href="#app-download"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('app-download')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="quick-jump-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div className="quick-jump-icon" style={{ background: '#DBEAFE' }}>
                <Smartphone size={19} color="#2563EB" />
              </div>
              <div style={{ minWidth: 0 }}>
                <strong className="quick-jump-title">Mobile App</strong>
                <span className="quick-jump-sub">Official Guides & Maps</span>
              </div>
            </div>
            <span className="quick-jump-arrow" style={{ color: '#2563EB' }}>↓</span>
          </a>

          {/* 3. Location & get there */}
          <a
            href="#location-directions"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('location-directions')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="quick-jump-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div className="quick-jump-icon" style={{ background: '#FEF3C7' }}>
                <MapPin size={19} color="#D97706" />
              </div>
              <div style={{ minWidth: 0 }}>
                <strong className="quick-jump-title">Location & MRT</strong>
                <span className="quick-jump-sub">Map & Transit Directions</span>
              </div>
            </div>
            <span className="quick-jump-arrow" style={{ color: '#D97706' }}>↓</span>
          </a>

          {/* 4. In-dept experience */}
          <a
            href="#in-depth-experience"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('in-depth-experience')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="quick-jump-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div className="quick-jump-icon" style={{ background: '#F3E8FF' }}>
                <Play size={19} color="#9333EA" fill="#9333EA" />
              </div>
              <div style={{ minWidth: 0 }}>
                <strong className="quick-jump-title">Video Tour</strong>
                <span className="quick-jump-sub">4K Tour & Shorts</span>
              </div>
            </div>
            <span className="quick-jump-arrow" style={{ color: '#9333EA' }}>↓</span>
          </a>
        </div>
      </section>

      {/* ── 4. MAIN CONTENT: 2-COLUMN LAYOUT (WIDE-SCREEN 1600PX) ── */}
      <div className="catalog-detail-grid" style={{ maxWidth: '1600px', width: '96%', margin: '0 auto', padding: '0 0.5rem' }}>
        
        {/* LEFT COLUMN: Overview, Must-Dos, Timings, Pro-Tips, Video, App & Gallery */}
        <div className="catalog-detail-main" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', minWidth: 0, width: '100%', maxWidth: '100%' }}>
          
          {/* Overview Section */}
          <div className="detail-content-card">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={20} color="#0F4C3A" /> Attraction Overview
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
              {attraction.description}
            </p>
          </div>

          {/* MUST-DO THINGS & SIGNATURE EXPERIENCES */}
          {attraction.mustDoThings && attraction.mustDoThings.length > 0 && (
            <div id="must-do" className="detail-content-card" style={{ scrollMarginTop: '100px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.35rem' }}>✨</span>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Must-Do Things & Signature Experiences
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
                    Top recommended rides, shows, exhibits, and encounters you cannot miss.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {attraction.mustDoThings.map((item, idx) => (
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
          )}

          {/* TIMINGS TO VISIT & SUGGESTED DURATION */}
          {attraction.timings && (
            <div className="detail-content-card">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="#0F4C3A" /> Operating Hours & Best Timings to Visit
              </h2>

              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#15803D', color: '#FFF', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                    Open Today
                  </span>
                  <strong style={{ fontSize: '0.92rem', color: '#166534' }}>
                    {attraction.timings}
                  </strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #DCFCE7' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Suggested Time Needed</span>
                    <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>{attraction.duration || 'Full Day (6–8 Hours)'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Best Entry Slot</span>
                    <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>Morning at Opening or Pre-booked Slot</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TIPS & TRIPS / PRO-TIPS & PRACTICAL GUIDE */}
          {attraction.tipsAndTricks && attraction.tipsAndTricks.length > 0 && (
            <div className="detail-content-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <Lightbulb size={22} color="#D97706" />
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Tips & Trips (Insider Visitor Advice)
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
                    Pro-tips on queue-skipping, baggage lockers, weather gear, and transport directions.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '0.85rem' }}>
                {attraction.tipsAndTricks.map((tip, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FEFCE8',
                      border: '1px solid #FEF08A',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#713F12', lineHeight: 1.5, fontWeight: 600 }}>
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── IN-DEPTH EXPERIENCE: VIDEO SHOWCASE & SHORTS ── */}
          <div id="in-depth-experience" style={{ scrollMarginTop: '100px', display: 'flex', flexDirection: 'column', gap: '1.75rem', minWidth: 0, width: '100%', maxWidth: '100%' }}>
            {/* VIDEO SHOWCASE TOUR */}
            {attraction.videoUrl && (
              <div className="detail-content-card">
                <div style={{ marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Play size={20} color="#EF4444" fill="#EF4444" /> 4K Video Walkthrough & Tour
                  </h2>
                </div>

                {attraction.videoUrl.includes('youtube.com') || attraction.videoUrl.includes('youtu.be') ? (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', background: '#000' }}>
                    <iframe
                      src={getYouTubeEmbedUrl(attraction.videoUrl)}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                ) : (
                  <video
                    controls
                    playsInline
                    src={attraction.videoUrl}
                    style={{ width: '100%', maxHeight: '420px', borderRadius: '12px', background: '#000', border: '1px solid #E2E8F0' }}
                  />
                )}
              </div>
            )}

            {/* YOUTUBE SHORTS CAROUSEL */}
            {attraction.shorts && attraction.shorts.length > 0 && (
              <div className="detail-content-card" style={{ minWidth: 0, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                <PackageShortsCarousel
                  destination={attraction.destination || 'Singapore'}
                  curatedShorts={attraction.shorts}
                />
              </div>
            )}
          </div>

          {/* OFFICIAL MOBILE VISITOR APP DOWNLOAD CARD */}
          <div id="app-download" style={{ scrollMarginTop: '100px' }}>
            <AppDownloadCard
              appDetails={attraction.appDetails || {
                appName: `${attraction.name} Visitor Guide`,
                appDescription: 'Official interactive park map, live queue wait times, and daily presentation reminder alarms.',
                appStoreUrl: 'https://apps.apple.com/sg/app/mysentosa/id1671526843',
                playStoreUrl: 'https://play.google.com/store/apps/details?id=sg.com.sentosa.app.sentosaislander',
                appFeatures: [
                  'Interactive GPS Wayfinding Map',
                  'Live Presentation Timers & Reminders',
                  'Mobile Food Ordering & Halal Guides',
                  'Digital E-Voucher QR Entry Wallet'
                ]
              }}
            />
          </div>

          {/* ── INTERACTIVE GOOGLE MAP & HOW TO GET THERE ── */}
          <div id="location-directions" className="detail-content-card" style={{ scrollMarginTop: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={20} color="#0F4C3A" /> Location & How to Get There
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
                  Interactive Google Map and public transit arrival directions.
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.name + ' ' + (attraction.locationAddress || attraction.destination))}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textDecoration: 'none'
                }}
              >
                <span>Open in Google Maps</span> ↗
              </a>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#334155', margin: '0 0 1rem', lineHeight: 1.5 }}>
              📍 <strong>Official Address:</strong> {attraction.locationAddress || attraction.subtitle || 'Resorts World Sentosa, 8 Sentosa Gateway, Singapore 098269'}
            </p>

            {/* Responsive Google Maps Iframe */}
            <div style={{ position: 'relative', width: '100%', height: 'clamp(250px, 45vw, 340px)', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <iframe
                src={attraction.mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(attraction.name + ' ' + (attraction.locationAddress || attraction.destination))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                style={{ width: '100%', height: '100%', border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Transit Connection Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.85rem' }}>
              <div style={{ background: '#F8FAFC', padding: '0.9rem 1.1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                  🚆 Nearest MRT Station
                </span>
                <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>
                  {attraction.transitInfo?.mrtStation || 'HarbourFront MRT (NE1/CC29)'}
                </strong>
              </div>

              <div style={{ background: '#F8FAFC', padding: '0.9rem 1.1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                  🚝 Monorail / Shuttle Link
                </span>
                <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>
                  {attraction.transitInfo?.busLines || 'Sentosa Express from VivoCity L3 to Resorts World'}
                </strong>
              </div>
            </div>
          </div>

          {/* AVAILABLE TICKET VARIANTS & SUB-TICKETS */}
          {attraction.subTickets && attraction.subTickets.length > 0 && (
            <div className="detail-content-card">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={20} color="#0F4C3A" /> Available Ticket Options & Variants
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {attraction.subTickets.map((st, idx) => (
                  <div key={idx} style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block' }}>{st.typeTitle}</strong>
                      {st.validityPeriodText && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Validity: {st.validityPeriodText}</span>}
                    </div>
                    <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.72rem', fontWeight: 800, padding: '3px 9px', borderRadius: '6px' }}>
                      {st.bookingType || 'Instant eVoucher'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PHOTO GALLERY */}
          {allPhotos.length > 0 && (
            <div className="detail-content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={20} color="#0F4C3A" /> High-Resolution Photo Gallery ({allPhotos.length})
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#0F4C3A', fontWeight: 700 }}>
                  Click any photo to open slider & swipe →
                </span>
              </div>
              <div className="detail-photo-grid">
                {allPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    style={{
                      height: '130px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid #E2E8F0',
                      position: 'relative',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.03)'
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <img src={url} alt={`${attraction.name} Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s ease' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Action Card & WhatsApp Inquiry */}
        <div className="catalog-detail-sidebar">
          
          <div className="detail-content-card" style={{ background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)', color: '#FFF', boxShadow: '0 8px 25px rgba(15,76,58,0.2)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.85rem' }}>
              <Sparkles size={13} color="#10B981" /> Wholesale DMC Inquiries
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFF', margin: '0 0 0.5rem' }}>
              Plan Your Visit to {attraction.name}
            </h3>

            <p style={{ fontSize: '0.85rem', color: '#E2E8F0', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Include this attraction into a tailor-made Singapore itinerary or request group booking allotments from our ground operations team.
            </p>

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
                href={`https://wa.me/${targetWhatsappNumber}?text=${whatsappMsg}`}
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
                <span>Inquire on WhatsApp</span>
              </a>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#A7F3D0', margin: '0 0 0.65rem' }}>
                Key Inclusions & Benefits:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(attraction.features || ['Instant Confirmation', 'Turnstile QR Entry', 'Free Lockers']).map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#F1F5F9' }}>
                    <Check size={13} color="#10B981" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── 5. LIGHTBOX SLIDER FOR FULL-SIZE PHOTOS ── */}
      <ImageGalleryLightbox
        images={allPhotos}
        initialIndex={lightboxIndex ?? 0}
        title={attraction.name}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      />

    </div>
  )
}
