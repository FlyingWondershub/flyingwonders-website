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
  ShoppingBag,
  Lightbulb,
  CheckCircle2,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Tag,
  DollarSign,
  Utensils,
  HelpCircle,
  ExternalLink
} from 'lucide-react'
import type { ShoppingMallData } from '../utils/shoppingMalls'
import PackageShortsCarousel from './PackageShortsCarousel'
import AppDownloadCard from './AppDownloadCard'
import ImageGalleryLightbox from './ImageGalleryLightbox'

export default function ShoppingMallDetailClient({ mall }: { mall: ShoppingMallData }) {
  const [copied, setCopied] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return ''
    try {
      if (url.includes('/embed/')) return url
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]
        return `https://www.youtube.com/embed/${id}?rel=0&enablejsapi=1`
      }
      if (url.includes('youtube.com/shorts/')) {
        const id = url.split('shorts/')[1]?.split('?')[0]?.split('&')[0]
        return `https://www.youtube.com/embed/${id}?rel=0&enablejsapi=1`
      }
      if (url.includes('youtube.com/watch')) {
        const v = new URL(url).searchParams.get('v')
        if (v) return `https://www.youtube.com/embed/${v}?rel=0&enablejsapi=1`
      }
      const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)
      if (match && match[2]?.length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?rel=0&enablejsapi=1`
      }
    } catch (e) {}
    return url
  }

  const targetWhatsappNumber = (mall.whatsappNumber || '919886171251').replace(/[^0-9]/g, '')
  const whatsappMsgText = mall.whatsappMessage || `Hi Flying Wonders! I would like to inquire about customized shopping tour transfers, itinerary planning, and visitor assistance for ${mall.name}.`
  const whatsappMsg = encodeURIComponent(whatsappMsgText)

  const allPhotos = [
    mall.coverImageUrl,
    ...(mall.galleryImageUrls || [])
  ].filter(Boolean)

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B', paddingBottom: '3.5rem' }}>
      
      {/* ── 1. BREADCRUMBS & TOP BAR (WIDE-SCREEN) ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0.85rem 1.5rem' }}>
        <div style={{ maxWidth: '1600px', width: '96%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#64748B', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/travel-tools" style={{ color: '#64748B', textDecoration: 'none' }}>Travel Tools</Link>
            <span>/</span>
            <Link href="/travel-tools/shopping-malls" style={{ color: '#0F4C3A', fontWeight: 700, textDecoration: 'none' }}>Shopping Malls</Link>
            <span>/</span>
            <span style={{ color: '#0F172A', fontWeight: 800 }}>{mall.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFF',
                color: copied ? '#15803D' : '#334155',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {copied ? <Check size={14} color="#15803D" /> : <Share2 size={14} />}
              <span>{copied ? 'Link Copied!' : 'Share Mall Guide'}</span>
            </button>

            <Link
              href="/travel-tools/shopping-guide"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #0F4C3A',
                background: '#0F4C3A',
                color: '#FFF',
                fontSize: '0.8rem',
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              <ShoppingBag size={14} />
              <span>Singapore Shopping Guide</span>
            </Link>

            <Link
              href="/travel-tools/shopping-malls"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#F1F5F9',
                color: '#334155',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <ArrowLeft size={14} />
              <span>All Malls</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. HERO SHOWCASE BANNER (WIDE-SCREEN 1600PX) ── */}
      <section style={{ maxWidth: '1600px', width: '96%', margin: '1.5rem auto', padding: '0 0.5rem' }}>
        <div style={{
          position: 'relative',
          minHeight: '380px',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundImage: `linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.55) 50%, rgba(15,23,42,0.25) 100%), url(${mall.coverImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'clamp(1.5rem, 4vw, 3rem)',
          boxShadow: '0 12px 35px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#FEF3C7', color: '#B45309', fontWeight: 900, fontSize: '0.84rem', padding: '5px 12px', borderRadius: '8px' }}>
              ★ {mall.starRating} {mall.reviewCount && `(${mall.reviewCount})`}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#FFF', fontWeight: 700, fontSize: '0.84rem', padding: '5px 14px', borderRadius: '8px', backdropFilter: 'blur(6px)' }}>
              <Compass size={14} style={{ display: 'inline', marginRight: '5px' }} /> {mall.category}
            </span>
            <span style={{ background: '#DCFCE7', color: '#15803D', fontWeight: 800, fontSize: '0.8rem', padding: '5px 12px', borderRadius: '8px' }}>
              <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px' }} /> Verified Tourist Shopping Guide
            </span>
            <span style={{ background: '#DBEAFE', color: '#1E40AF', fontWeight: 800, fontSize: '0.8rem', padding: '5px 12px', borderRadius: '8px' }}>
              Price Tier: {mall.budgetTier}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, color: '#FFFFFF', margin: '0 0 0.5rem', letterSpacing: '-0.02em', lineHeight: 1.15, fontFamily: 'var(--font-playfair), serif' }}>
            {mall.name} {mall.alternateName && <span style={{ fontSize: '0.55em', fontWeight: 400, opacity: 0.9, fontFamily: 'var(--font-inter), sans-serif', marginLeft: '8px' }}>({mall.alternateName})</span>}
          </h1>

          <p style={{ fontSize: '1rem', color: '#E2E8F0', margin: '0 0 0.75rem', fontWeight: 500, maxWidth: '950px', lineHeight: 1.5 }}>
            {mall.tagline}
          </p>

          <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0, fontWeight: 500 }}>
            📍 {mall.locationAddress} · {mall.district}
          </p>
        </div>
      </section>

      {/* ── 3. QUICK SECTION NAVIGATION JUMP LINKS (WIDE-SCREEN) ── */}
      <section style={{ maxWidth: '1600px', width: '96%', margin: '0 auto 2rem', padding: '0 0.5rem' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '0.9rem 1.15rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '0.85rem',
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
              gap: '10px',
              padding: '0.85rem 1.15rem',
              borderRadius: '12px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textDecoration: 'none',
              color: '#0F172A',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={19} color="#15803D" />
              </div>
              <div>
                <strong style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', display: 'block', lineHeight: 1.2 }}>Must Do</strong>
                <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Top Stores & Highlights</span>
              </div>
            </div>
            <span style={{ fontSize: '1rem', color: '#059669', fontWeight: 800 }}>↓</span>
          </a>

          {/* 2. Mobile App Download */}
          <a
            href="#app-download"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('app-download')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '0.85rem 1.15rem',
              borderRadius: '12px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textDecoration: 'none',
              color: '#0F172A',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Smartphone size={19} color="#2563EB" />
              </div>
              <div>
                <strong style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', display: 'block', lineHeight: 1.2 }}>Mobile App download</strong>
                <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Official Guides & Maps</span>
              </div>
            </div>
            <span style={{ fontSize: '1rem', color: '#2563EB', fontWeight: 800 }}>↓</span>
          </a>

          {/* 3. Location & Get There */}
          <a
            href="#location-directions"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('location-directions')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '0.85rem 1.15rem',
              borderRadius: '12px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textDecoration: 'none',
              color: '#0F172A',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={19} color="#D97706" />
              </div>
              <div>
                <strong style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', display: 'block', lineHeight: 1.2 }}>Location & get there</strong>
                <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Map & Transit Directions</span>
              </div>
            </div>
            <span style={{ fontSize: '1rem', color: '#D97706', fontWeight: 800 }}>↓</span>
          </a>

          {/* 4. In-Depth Experience */}
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
              gap: '10px',
              padding: '0.85rem 1.15rem',
              borderRadius: '12px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textDecoration: 'none',
              color: '#0F172A',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Play size={19} color="#9333EA" fill="#9333EA" />
              </div>
              <div>
                <strong style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', display: 'block', lineHeight: 1.2 }}>In-depth experience</strong>
                <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>4K Tour & Shorts</span>
              </div>
            </div>
            <span style={{ fontSize: '1rem', color: '#9333EA', fontWeight: 800 }}>↓</span>
          </a>
        </div>
      </section>

      {/* ── 4. MAIN CONTENT: 2-COLUMN WIDE GRID (1600PX) ── */}
      <div style={{ maxWidth: '1600px', width: '96%', margin: '0 auto', padding: '0 0.5rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Overview, Must-Dos, Top Brands, Timings, Pro-Tips, Video, App & Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Overview Section */}
          <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass size={22} color="#0F4C3A" /> Mall & Destination Overview
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
              {mall.overview}
            </p>

            {/* Key Value Proposition Highlights */}
            {mall.keyHighlights && mall.keyHighlights.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9' }}>
                {mall.keyHighlights.map((hl, i) => (
                  <div key={i} style={{ background: '#F8FAFC', padding: '1rem 1.15rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{hl.title}</strong>
                      {hl.badge && (
                        <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                          {hl.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5 }}>{hl.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MUST-DO THINGS & SIGNATURE EXPERIENCES */}
          {mall.mustDoThings && mall.mustDoThings.length > 0 && (
            <div id="must-do" style={{ scrollMarginTop: '100px', background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✨</span>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Must-Do Things & Signature Experiences
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0' }}>
                    Top recommended stores, bargain corners, exhibits, and encounters you cannot miss.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {mall.mustDoThings.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '1.1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px'
                    }}
                  >
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#0F4C3A', color: '#FFF', fontSize: '0.82rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      {idx + 1}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: '#1E293B', lineHeight: 1.55, fontWeight: 600 }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STORE DIRECTORY & TOP BRAND CATEGORIES */}
          {mall.topStoresAndBrands && mall.topStoresAndBrands.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag size={20} color="#0F4C3A" /> Top Stores, Outlets & Brand Directory
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0' }}>
                    Curated retailer breakdown with typical discount ranges and floor locations.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {mall.topStoresAndBrands.map((cat, i) => (
                  <div key={i} style={{ background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '6px' }}>
                      <strong style={{ fontSize: '0.98rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🏷️ {cat.categoryName}
                      </strong>
                      {cat.discountBadge && (
                        <span style={{ background: '#FEF3C7', color: '#B45309', fontWeight: 800, fontSize: '0.78rem', padding: '3px 10px', borderRadius: '6px' }}>
                          {cat.discountBadge}
                        </span>
                      )}
                    </div>
                    {cat.description && (
                      <p style={{ margin: '0 0 0.85rem', fontSize: '0.82rem', color: '#64748B', fontStyle: 'italic' }}>
                        {cat.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {cat.brands.map((b, bIdx) => (
                        <span key={bIdx} style={{ background: '#FFF', color: '#1E293B', padding: '5px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, border: '1px solid #CBD5E1', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                          ✓ {b}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TIMINGS TO VISIT & OPERATING HOURS */}
          <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={22} color="#0F4C3A" /> Operating Hours & Best Timings to Visit
            </h2>

            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '14px', padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: '#15803D', color: '#FFF', fontSize: '0.78rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                  Open Today
                </span>
                <strong style={{ fontSize: '1rem', color: '#166534' }}>
                  {mall.timings}
                </strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid #DCFCE7' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Suggested Time Needed</span>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{mall.recommendedDuration}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Optimal Entry Slot</span>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{mall.bestTimeToVisit}</strong>
                </div>
                {mall.peakCrowdTimes && (
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#B45309', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>⚠️ Peak Crowd Notice</span>
                    <strong style={{ fontSize: '0.85rem', color: '#92400E' }}>{mall.peakCrowdTimes}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TIPS & TRICKS / INSIDER SHOPPING ADVICE */}
          {mall.tipsAndTricks && mall.tipsAndTricks.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <Lightbulb size={24} color="#D97706" />
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Tips & Tricks (Insider Visitor Advice)
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0' }}>
                    Pro-tips on tourist discount booklets, eTRS GST refunds, size hunting, and bag security.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {mall.tipsAndTricks.map((tip, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FEFCE8',
                      border: '1px solid #FEF08A',
                      borderRadius: '12px',
                      padding: '1.15rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>💡</span>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#713F12', lineHeight: 1.55, fontWeight: 600 }}>
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── IN-DEPTH EXPERIENCE: VIDEO SHOWCASE TOUR & SHORTS ── */}
          <div id="in-depth-experience" style={{ scrollMarginTop: '100px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* 4K VIDEO TOUR */}
            {mall.videoUrl && (
              <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Play size={22} color="#EF4444" fill="#EF4444" /> 4K Video Walkthrough & Tour
                  </h2>
                  <a
                    href={mall.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      textDecoration: 'none'
                    }}
                  >
                    <span>Watch on YouTube</span> ↗
                  </a>
                </div>

                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '14px', boxShadow: '0 6px 20px rgba(0,0,0,0.08)', background: '#000' }}>
                  <iframe
                    src={getYouTubeEmbedUrl(mall.videoUrl)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </div>
            )}

            {/* CURATED SHORTS CAROUSEL */}
            {mall.shorts && mall.shorts.length > 0 && (
              <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <PackageShortsCarousel
                  destination={mall.name}
                  curatedShorts={mall.shorts}
                />
              </div>
            )}
          </div>

          {/* OFFICIAL MOBILE VISITOR APP DOWNLOAD CARD */}
          <div id="app-download" style={{ scrollMarginTop: '100px' }}>
            <AppDownloadCard
              appDetails={mall.appDetails || {
                appName: `${mall.name} Guide`,
                appDescription: 'Official interactive mall map, store directories, and exclusive tourist discount vouchers.',
                appStoreUrl: 'https://apps.apple.com/sg',
                playStoreUrl: 'https://play.google.com/store',
                appFeatures: [
                  'Turn-by-Turn Indoor 3D Mall Navigation',
                  'Exclusive Member Discount E-Coupons',
                  'Direct Receipt Scanning for Tourist Loyalty STAR$',
                  'Real-time Parking & Restaurant Wait Times'
                ]
              }}
            />
          </div>

          {/* ── INTERACTIVE GOOGLE MAP & TRANSIT INSTRUCTIONS ── */}
          <div id="location-directions" style={{ scrollMarginTop: '100px', background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={22} color="#0F4C3A" /> Location & How to Get There
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0' }}>
                  Interactive Google Map, nearest MRT station, and public transit arrival directions.
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mall.name + ' ' + mall.locationAddress)}`}
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
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textDecoration: 'none'
                }}
              >
                <span>Open in Google Maps</span> ↗
              </a>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#334155', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
              📍 <strong>Official Physical Address:</strong> {mall.locationAddress}
            </p>

            {/* Responsive Google Maps Iframe */}
            <div style={{ position: 'relative', width: '100%', height: '360px', borderRadius: '14px', overflow: 'hidden', border: '1px solid #E2E8F0', marginBottom: '1.35rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <iframe
                src={mall.mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(mall.name + ' Singapore')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                style={{ width: '100%', height: '100%', border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Transit Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1.1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  🚆 Nearest MRT Station
                </span>
                <strong style={{ fontSize: '0.92rem', color: '#0F172A', display: 'block' }}>
                  {mall.nearestMrt.station} ({mall.nearestMrt.line})
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                  {mall.nearestMrt.exit} · {mall.nearestMrt.walkingTime}
                </span>
              </div>

              {mall.busLines && (
                <div style={{ background: '#F8FAFC', padding: '1.1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    🚌 Connecting Bus Services
                  </span>
                  <strong style={{ fontSize: '0.92rem', color: '#0F172A', display: 'block' }}>
                    {mall.busLines}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', marginTop: '2px' }}>
                    Direct alight outside entrance
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* DINING & FOOD COURT HIGHLIGHTS */}
          {mall.diningHighlights && (
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Utensils size={22} color="#0F4C3A" /> Dining & Food Court Recommendations
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                {mall.diningHighlights.description}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mall.diningHighlights.topPicks.map((pick, pIdx) => (
                  <div key={pIdx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.9rem 1.15rem', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '1.1rem' }}>🍽️</span>
                    <span style={{ fontSize: '0.88rem', color: '#1E293B', fontWeight: 600, lineHeight: 1.5 }}>{pick}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PHOTO GALLERY */}
          {allPhotos.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={22} color="#0F4C3A" /> High-Resolution Photo Gallery ({allPhotos.length})
                </h2>
                <span style={{ fontSize: '0.78rem', color: '#0F4C3A', fontWeight: 700 }}>
                  Click any photo to open full-screen slider →
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {allPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    style={{
                      height: '140px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid #E2E8F0',
                      position: 'relative',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.03)'
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <img src={url} alt={`${mall.name} Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
          {mall.faqs && mall.faqs.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={22} color="#0F4C3A" /> Frequently Asked Questions
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mall.faqs.map((faq, fIdx) => {
                  const isOpen = openFaqIndex === fIdx
                  return (
                    <div key={fIdx} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '1rem 1.25rem',
                          background: isOpen ? '#F1F5F9' : '#F8FAFC',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          color: '#0F172A'
                        }}
                      >
                        <span>{faq.question}</span>
                        {isOpen ? <ChevronUp size={18} color="#0F4C3A" /> : <ChevronDown size={18} color="#64748B" />}
                      </button>
                      {isOpen && (
                        <div style={{ padding: '1rem 1.25rem', background: '#FFF', fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, borderTop: '1px solid #E2E8F0' }}>
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Sticky Sidebar, Quick Facts, DMC Wholesale Inquiries & Itinerary Pairings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'sticky', top: '1.5rem' }}>
          
          {/* 1. Quick Facts Card */}
          <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📋 Destination Quick Facts
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>Category</span>
                <span style={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: 800 }}>{mall.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>Price Indicator</span>
                <span style={{ fontSize: '0.85rem', color: '#B45309', fontWeight: 900 }}>{mall.budgetTier}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>Recommended Stay</span>
                <span style={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: 800 }}>{mall.recommendedDuration}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>Nearest MRT</span>
                <span style={{ fontSize: '0.82rem', color: '#0F4C3A', fontWeight: 800 }}>{mall.nearestMrt.station}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>eTRS Tax Refund</span>
                <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                  Eligible (9% GST)
                </span>
              </div>
            </div>
          </div>

          {/* 2. Action Card: Plan Your Visit & DMC Concierge */}
          <div style={{ background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)', color: '#FFF', borderRadius: '18px', padding: '1.75rem', boxShadow: '0 8px 25px rgba(15,76,58,0.2)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.85rem' }}>
              <Sparkles size={13} color="#10B981" /> Wholesale DMC Inquiries
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFF', margin: '0 0 0.5rem', fontFamily: 'var(--font-playfair), serif' }}>
              Visit {mall.name}
            </h3>

            <p style={{ fontSize: '0.85rem', color: '#E2E8F0', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Include this shopping destination into your customized Singapore package with private air-conditioned coach transfers and luggage storage.
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
                <span>Build Custom Itinerary ⚙️</span>
              </Link>

              <Link
                href="/travel-tools/shopping-guide"
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
                <ShoppingBag size={17} />
                <span>GST Refund Calculator 💸</span>
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

            {/* Inclusions */}
            {mall.facilities && mall.facilities.length > 0 && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#A7F3D0', margin: '0 0 0.65rem' }}>
                  Available Amenities & Facilities:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {mall.facilities.map((fac, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#F1F5F9' }}>
                      <Check size={13} color="#10B981" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Nearby Itinerary Pairings */}
          {mall.nearbyAttractions && mall.nearbyAttractions.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.85rem' }}>
                🔗 Same-Day Itinerary Pairings
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mall.nearbyAttractions.map((pair, pIdx) => (
                  <div key={pIdx} style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>{pair.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800 }}>{pair.distance}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: 1.45 }}>{pair.travelTip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ── 5. LIGHTBOX SLIDER FOR FULL-SIZE PHOTOS ── */}
      <ImageGalleryLightbox
        images={allPhotos}
        initialIndex={lightboxIndex ?? 0}
        title={mall.name}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      />

    </div>
  )
}
