'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Calendar,
  MapPin,
  Building2,
  Compass,
  Utensils,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Copy,
  Check,
  ChevronRight,
  Clock,
  Star,
  CheckCircle2,
  Info,
  ShieldCheck,
  Share2,
  Bus,
  ArrowLeft,
  X,
  ChevronDown,
  Award
} from 'lucide-react'
import { CuratedCollectionData } from '../../../../utils/curatedCollections'

interface Props {
  collection: CuratedCollectionData
}

export default function CuratedCollectionClient({ collection }: Props) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedBlurb, setCopiedBlurb] = useState(false)
  const [showNewsletterModal, setShowNewsletterModal] = useState(false)
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({ 'day-1': true })

  const toggleDay = (key: string) => {
    setExpandedDays((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const expandAllDays = () => {
    const all: Record<string, boolean> = {}
    collection.itinerarySchedule?.forEach((_, i) => {
      all[`day-${i + 1}`] = true
    })
    setExpandedDays(all)
  }

  const collapseAllDays = () => {
    setExpandedDays({})
  }

  const whatsappMessage = encodeURIComponent(
    collection.customWhatsAppMessage?.replace('{collectionTitle}', collection.title) ||
      `Hi Flying Wonders! I would like to inquire about customized pricing, availability, and group bookings for the ${collection.title} Curated Collection.`
  )
  const whatsappUrl = `https://wa.me/919886171251?text=${whatsappMessage}`

  const copyUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const copyNewsletterText = () => {
    const text =
      collection.newsletterTeaser ||
      `✨ ${collection.title} (${collection.duration})\n\n${collection.tagline}\n\n👉 Complete One-Page Essentials Guide: https://flyingwonders.net/services-catalog/collections/${collection.slug}\n\n💬 Inquire on WhatsApp: https://wa.me/919886171251`
    navigator.clipboard.writeText(text)
    setCopiedBlurb(true)
    setTimeout(() => setCopiedBlurb(false), 2500)
  }

  const hotelsCount = collection.featuredHotels?.length || 0
  const attrCount = collection.featuredAttractions?.length || 0
  const diningCount = collection.featuredDining?.length || 0
  const shoppingCount = collection.featuredShopping?.length || 0
  const toursCount = collection.featuredTours?.length || 0
  const daysCount = collection.itinerarySchedule?.length || 0

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B', paddingBottom: '6rem' }}>
      
      {/* ── 1. BREADCRUMBS & TOP BAR ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid #E2E8F0', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: '1440px', width: '94%', margin: '0 auto', padding: '0.75rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748B', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={13} color="#94A3B8" />
            <Link href="/services-catalog" style={{ color: '#64748B', textDecoration: 'none' }}>Catalog</Link>
            <ChevronRight size={13} color="#94A3B8" />
            <Link href="/services-catalog/collections" style={{ color: '#64748B', textDecoration: 'none' }}>Collections</Link>
            <ChevronRight size={13} color="#94A3B8" />
            <span style={{ color: '#0F172A', fontWeight: 800, maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {collection.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowNewsletterModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', background: '#F1F5F9', border: '1px solid #E2E8F0', cursor: 'pointer' }}
            >
              <Share2 size={13} color="#2563EB" />
              <span>Newsletter Teaser</span>
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, color: '#FFF', background: '#10B981', textDecoration: 'none', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
            >
              <MessageCircle size={14} /> Inquire Package
            </a>
          </div>
        </div>
      </div>

      {/* ── 2. HERO SHOWCASE ── */}
      <section style={{ background: '#0F172A', color: '#FFF', position: 'relative', overflow: 'hidden', borderBottom: '1px solid #1E293B' }}>
        {/* Background Image with Gradient Overlay */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {collection.coverImageUrl ? (
            <img
              src={collection.coverImageUrl}
              alt={collection.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25, transform: 'scale(1.03)' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1E1B4B 0%, #0F4C3A 100%)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0F172A 0%, rgba(15,23,42,0.7) 60%, transparent 100%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1440px', width: '94%', margin: '0 auto', padding: '3.5rem 0 4rem' }}>
          <div style={{ maxWidth: '850px' }}>
            {/* Top Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{ background: '#F59E0B', color: '#0F172A', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 12px', borderRadius: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                {collection.badge || 'CURATED ESSENTIALS'}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.15)', color: '#FFF', fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: '14px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                {collection.duration}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(56,189,248,0.2)', color: '#38BDF8', fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: '14px', border: '1px solid rgba(56,189,248,0.3)' }}>
                <MapPin size={12} color="#38BDF8" /> {collection.destination}
              </span>
              {collection.targetAudience && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.1)', color: '#E2E8F0', fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <Award size={12} color="#FBBF24" /> Target: {collection.targetAudience}
                </span>
              )}
            </div>

            {/* Collection Title */}
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', margin: '0 0 0.75rem', letterSpacing: '-0.02em', color: '#FFF', lineHeight: 1.2 }}>
              {collection.title}
            </h1>

            {/* Tagline */}
            {collection.tagline && (
              <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: '#E2E8F0', lineHeight: 1.6, margin: '0 0 1.75rem' }}>
                {collection.tagline}
              </p>
            )}

            {/* Inclusions Counter Grid */}
            <div className="hero-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '12px 16px', maxWidth: '680px', marginBottom: '2rem', backdropFilter: 'blur(6px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#60A5FA" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Duration</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF' }}>{daysCount} Days</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#34D399" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Hotels</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF' }}>{hotelsCount} Stays</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={18} color="#FBBF24" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Attractions</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF' }}>{attrCount} Sights</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Utensils size={18} color="#F472B6" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Dining</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF' }}>{diningCount} Spots</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={18} color="#C084FC" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Shopping</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF' }}>{shoppingCount} Hubs</div>
                </div>
              </div>
            </div>

            {/* Quick Hero Actions */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#10B981', color: '#FFF', padding: '0.8rem 1.6rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', boxShadow: '0 4px 15px rgba(16,185,129,0.35)' }}
              >
                <MessageCircle size={18} /> Inquire This Collection via WhatsApp
              </a>

              <button
                onClick={() => setShowNewsletterModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', color: '#FFF', border: '1px solid rgba(255,255,255,0.25)', padding: '0.8rem 1.3rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <Share2 size={16} color="#38BDF8" /> Copy for Newsletter
              </button>

              <button
                onClick={copyUrl}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.2)', padding: '0.8rem 1.2rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                {copiedLink ? <Check size={16} color="#34D399" /> : <Copy size={16} />}
                <span>{copiedLink ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. STICKY CATEGORY NAVIGATION BAR ── */}
      <div style={{ position: 'sticky', top: '53px', zIndex: 30, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ maxWidth: '1440px', width: '94%', margin: '0 auto', display: 'flex', gap: '8px', overflowX: 'auto', padding: '0.65rem 0', scrollbarWidth: 'none' }}>
          <a
            href="#section-overview"
            style={{ padding: '0.45rem 0.95rem', borderRadius: '20px', background: '#F1F5F9', color: '#334155', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Overview
          </a>
          {daysCount > 0 && (
            <a
              href="#section-itinerary"
              style={{ padding: '0.45rem 0.95rem', borderRadius: '20px', background: '#F1F5F9', color: '#334155', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              📅 Day-by-Day Blueprint ({daysCount})
            </a>
          )}
          {hotelsCount > 0 && (
            <a
              href="#section-hotels"
              style={{ padding: '0.45rem 0.95rem', borderRadius: '20px', background: '#F1F5F9', color: '#334155', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              🏨 Curated Stays ({hotelsCount})
            </a>
          )}
          {attrCount > 0 && (
            <a
              href="#section-attractions"
              style={{ padding: '0.45rem 0.95rem', borderRadius: '20px', background: '#F1F5F9', color: '#334155', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              🎡 Attractions ({attrCount})
            </a>
          )}
          {diningCount > 0 && (
            <a
              href="#section-dining"
              style={{ padding: '0.45rem 0.95rem', borderRadius: '20px', background: '#F1F5F9', color: '#334155', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              🍽️ Dining ({diningCount})
            </a>
          )}
          {shoppingCount > 0 && (
            <a
              href="#section-shopping"
              style={{ padding: '0.45rem 0.95rem', borderRadius: '20px', background: '#F1F5F9', color: '#334155', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              🛍️ Retail ({shoppingCount})
            </a>
          )}
          {toursCount > 0 && (
            <a
              href="#section-tours"
              style={{ padding: '0.45rem 0.95rem', borderRadius: '20px', background: '#F1F5F9', color: '#334155', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              🚍 Tour Circuit ({toursCount})
            </a>
          )}
          {collection.insiderTips && collection.insiderTips.length > 0 && (
            <a
              href="#section-tips"
              style={{ padding: '0.45rem 0.95rem', borderRadius: '20px', background: '#F1F5F9', color: '#334155', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              💡 Curator Tips
            </a>
          )}
        </div>
      </div>

      {/* ── 4. MAIN CONTENT BODY ── */}
      <main style={{ maxWidth: '1440px', width: '94%', margin: '2.5rem auto 0', display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
        
        {/* 1. Overview & Standout Inclusions */}
        <section id="section-overview" style={{ scrollMarginTop: '110px' }}>
          <div className="collection-overview-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563EB', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} /> The Curator Narrative
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: '0 0 1rem' }}>
                Why this collection was engineered
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, margin: '0 0 1.25rem' }}>
                {collection.overview}
              </p>

              {collection.targetAudience && (
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '1rem', fontSize: '0.85rem', color: '#1E3A8A' }}>
                  <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <ShieldCheck size={16} color="#2563EB" /> Recommended Traveler Profile:
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.5 }}>{collection.targetAudience}</p>
                </div>
              )}
            </div>

            {/* Inclusions Box */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={18} color="#F59E0B" /> Standout Inclusions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {collection.highlights?.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: '#334155' }}>
                    <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ lineHeight: 1.45 }}>{h}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #F1F5F9' }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#10B981', color: '#FFF', padding: '0.65rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
                >
                  <MessageCircle size={15} /> Quick WhatsApp Inquiry
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Day-by-Day Itinerary Blueprint */}
        {daysCount > 0 && (
          <section id="section-itinerary" style={{ scrollMarginTop: '110px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563EB', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> Turnkey Blueprint
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                  Day-by-Day Tour Itinerary
                </h2>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={expandAllDays}
                  style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '0.78rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAllDays}
                  style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '0.78rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
                >
                  Collapse All
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {collection.itinerarySchedule?.map((day, idx) => {
                const key = day._key || `day-${idx + 1}`
                const isExpanded = !!expandedDays[key]

                return (
                  <div
                    key={key}
                    style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
                  >
                    <button
                      onClick={() => toggleDay(key)}
                      style={{ width: '100%', padding: '1.25rem', background: 'none', border: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ background: '#0F4C3A', color: '#FFF', fontSize: '0.75rem', fontWeight: 900, padding: '4px 10px', borderRadius: '8px', flexShrink: 0 }}>
                          {day.day || `Day ${idx + 1}`}
                        </span>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A' }}>
                            {day.title}
                          </div>
                          {!isExpanded && day.description && (
                            <div style={{ fontSize: '0.78rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '600px', marginTop: '2px' }}>
                              {day.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <ChevronDown
                        size={18}
                        color="#94A3B8"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
                      />
                    </button>

                    {isExpanded && (
                      <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #F1F5F9' }}>
                        {day.description && (
                          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '1rem 0' }}>
                            {day.description}
                          </p>
                        )}

                        <div className="day-schedule-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '0.5rem' }}>
                          {day.morning && (
                            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '10px', fontSize: '0.8rem' }}>
                              <span style={{ fontWeight: 800, color: '#92400E', display: 'block', marginBottom: '4px' }}>🌅 Morning Plan</span>
                              <p style={{ margin: 0, color: '#451A03', lineHeight: 1.45 }}>{day.morning}</p>
                            </div>
                          )}
                          {day.afternoon && (
                            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '10px', fontSize: '0.8rem' }}>
                              <span style={{ fontWeight: 800, color: '#1E40AF', display: 'block', marginBottom: '4px' }}>☀️ Afternoon Plan</span>
                              <p style={{ margin: 0, color: '#172554', lineHeight: 1.45 }}>{day.afternoon}</p>
                            </div>
                          )}
                          {day.evening && (
                            <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '12px', padding: '10px', fontSize: '0.8rem' }}>
                              <span style={{ fontWeight: 800, color: '#3730A3', display: 'block', marginBottom: '4px' }}>🌙 Evening Plan</span>
                              <p style={{ margin: 0, color: '#1E1B4B', lineHeight: 1.45 }}>{day.evening}</p>
                            </div>
                          )}
                        </div>

                        {day.recommendedDining && (
                          <div style={{ marginTop: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 12px', fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Utensils size={14} color="#EC4899" style={{ flexShrink: 0 }} />
                            <span><strong>Recommended Dining:</strong> {day.recommendedDining}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 3. Curated Hotels */}
        {hotelsCount > 0 && (
          <section id="section-hotels" style={{ scrollMarginTop: '110px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10B981', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={14} /> Selected Stays
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                Curated Partner Hotels
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {collection.featuredHotels?.map((h) => {
                const img = h.coverImageUrl || h.photoUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'
                return (
                  <div
                    key={h._id}
                    style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ position: 'relative', height: '200px', width: '100%', background: '#0F172A' }}>
                        <img src={img} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(15,23,42,0.85)', color: '#FBBF24', fontSize: '0.75rem', fontWeight: 800, padding: '4px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={12} fill="#FBBF24" /> {h.starRating || '4-Star'}
                        </div>
                      </div>

                      <div style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: '0 0 0.4rem' }}>
                          {h.name}
                        </h3>
                        {h.hotelAddress && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.75rem' }}>
                            <MapPin size={12} color="#EF4444" style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.hotelAddress}</span>
                          </div>
                        )}
                        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.55, margin: '0 0 1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {h.description || h.shortDescription}
                        </p>

                        {h.features && h.features.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {h.features.slice(0, 4).map((f, i) => (
                              <span key={i} style={{ background: '#F1F5F9', color: '#334155', fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      {h.slug ? (
                        <Link href={`/services-catalog/hotels/${h.slug}`} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          View Details <ChevronRight size={13} />
                        </Link>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Partner Hotel</span>
                      )}

                      <a
                        href={`https://wa.me/919886171251?text=Hi%20Flying%20Wonders!%20I%20would%20like%20to%20inquire%20about%20rates%20for%20${encodeURIComponent(h.name)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#10B981', color: '#FFF', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none' }}
                      >
                        <MessageCircle size={13} /> Inquire Rates
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 4. Curated Attractions */}
        {attrCount > 0 && (
          <section id="section-attractions" style={{ scrollMarginTop: '110px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F59E0B', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={14} /> Must-Do Experiences
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                Curated Attractions & Sightseeing
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {collection.featuredAttractions?.map((a) => {
                const img = a.coverImageUrl || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop'
                return (
                  <div
                    key={a._id}
                    style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ height: '180px', width: '100%', background: '#0F172A', overflow: 'hidden' }}>
                        <img src={img} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>

                      <div style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: '0 0 0.5rem', lineHeight: 1.35 }}>
                          {a.name}
                        </h3>

                        {a.timings && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.65rem' }}>
                            <Clock size={12} color="#2563EB" style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.timings}</span>
                          </div>
                        )}

                        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.55, margin: '0 0 1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {a.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      {a.slug ? (
                        <Link href={`/services-catalog/attractions/${a.slug}`} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          View Guide <ChevronRight size={13} />
                        </Link>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Instant E-Voucher</span>
                      )}

                      <a
                        href={`https://wa.me/919886171251?text=Hi%20Flying%20Wonders!%20I%20would%20like%20to%20inquire%20about%20tickets%20for%20${encodeURIComponent(a.name)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#10B981', color: '#FFF', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none' }}
                      >
                        <MessageCircle size={13} /> Ticket Desk
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 5. Curated Dining */}
        {diningCount > 0 && (
          <section id="section-dining" style={{ scrollMarginTop: '110px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#EC4899', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Utensils size={14} /> Culinary Highlights
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                Curated Dining & Food Gems
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {collection.featuredDining?.map((d) => (
                <div
                  key={d._id}
                  style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                          {d.name}
                        </h3>
                        {d.cuisineType && (
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', marginTop: '2px' }}>
                            {d.cuisineType}
                          </div>
                        )}
                      </div>
                      {d.priceTier && (
                        <span style={{ background: '#F1F5F9', color: '#0F172A', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                          {d.priceTier}
                        </span>
                      )}
                    </div>

                    {d.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.75rem' }}>
                        <MapPin size={12} color="#EF4444" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.address}</span>
                      </div>
                    )}

                    <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.55, margin: '0 0 1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {d.description}
                    </p>

                    {d.dietaryTypes && d.dietaryTypes.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {d.dietaryTypes.map((dt, i) => (
                          <span key={i} style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                            {dt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    {d.slug ? (
                      <Link href={`/services-catalog/restaurants/${d.slug}`} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        Menu & Reviews <ChevronRight size={13} />
                      </Link>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Verified Group Dining</span>
                    )}

                    <a
                      href={`https://wa.me/919886171251?text=Hi%20Flying%20Wonders!%20I%20would%20like%20to%20reserve%20group%20dining%20at%20${encodeURIComponent(d.name)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#10B981', color: '#FFF', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none' }}
                    >
                      <MessageCircle size={13} /> Reserve Table
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Curated Shopping */}
        {shoppingCount > 0 && (
          <section id="section-shopping" style={{ scrollMarginTop: '110px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8B5CF6', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingBag size={14} /> Retail & Souvenirs
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                Curated Shopping & Outlet Hubs
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {collection.featuredShopping?.map((m) => (
                <div
                  key={m._id}
                  style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: '0 0 0.35rem' }}>
                      {m.name}
                    </h3>
                    {m.heroSubtitle && (
                      <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.75rem', lineHeight: 1.45 }}>{m.heroSubtitle}</p>
                    )}

                    {m.mrtStation && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', color: '#334155', fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px' }}>
                        <MapPin size={12} color="#2563EB" /> MRT: {m.mrtStation}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    {m.slug ? (
                      <Link href={`/travel-tools/shopping-malls/${m.slug}`} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        Explore Mall <ChevronRight size={13} />
                      </Link>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>9% GST Refundable</span>
                    )}

                    <Link
                      href="/travel-tools/shopping-guide"
                      style={{ background: '#F8FAFC', color: '#334155', border: '1px solid #CBD5E1', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}
                    >
                      GST Refund Guide
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Curated Tours Circuit */}
        {toursCount > 0 && (
          <section id="section-tours" style={{ scrollMarginTop: '110px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4F46E5', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bus size={14} /> Underpinning Circuit
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                Curated Guided Tour Package
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {collection.featuredTours?.map((t) => (
                <div
                  key={t._id}
                  style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '3px 8px', borderRadius: '6px' }}>
                        {t.duration || 'LAND CIRCUIT'}
                      </span>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: '6px 0 0' }}>
                        {t.name}
                      </h3>
                    </div>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#10B981', color: '#FFF', padding: '0.55rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none' }}
                    >
                      <MessageCircle size={15} /> Inquire Full Circuit
                    </a>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1rem' }}>
                    {t.description}
                  </p>

                  {t.features && t.features.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                      {t.features.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#334155' }}>
                          <CheckCircle2 size={14} color="#10B981" style={{ flexShrink: 0 }} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Curator Insider Tips */}
        {collection.insiderTips && collection.insiderTips.length > 0 && (
          <section id="section-tips" style={{ scrollMarginTop: '110px' }}>
            <div style={{ background: '#FFFBEB', borderRadius: '20px', border: '1px solid #FDE68A', padding: '1.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#92400E', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={16} /> Curator Logistics Checklist
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#78350F', margin: '0 0 1.25rem' }}>
                Insider Tips for This Collection
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {collection.insiderTips.map((tip, i) => (
                  <div key={i} style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #FEF3C7', padding: '1rem', fontSize: '0.82rem', color: '#451A03', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontWeight: 800, color: '#D97706', display: 'block', marginBottom: '4px' }}>
                      Pro-Tip #{i + 1}
                    </span>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 9. Bottom CTA Card */}
        <section style={{ background: 'linear-gradient(135deg, #0F4C3A 0%, #1E1B4B 100%)', borderRadius: '20px', padding: '3rem 1.5rem', color: '#FFF', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <span style={{ display: 'inline-block', background: '#F59E0B', color: '#0F172A', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 12px', borderRadius: '14px', marginBottom: '0.75rem' }}>
              Ready to Book or Customize?
            </span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', margin: '0 0 0.75rem' }}>
              Get Instant Rates for {collection.title}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#E2E8F0', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              Our operations team responds in minutes on WhatsApp with exact dates, hotel room allocations, and special group discounts.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#10B981', color: '#FFF', padding: '0.8rem 1.6rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', boxShadow: '0 4px 15px rgba(16,185,129,0.35)' }}
              >
                <MessageCircle size={18} /> Chat with Concierge on WhatsApp
              </a>
              <Link
                href="/services-catalog/collections"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: '#FFF', padding: '0.8rem 1.3rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <ArrowLeft size={16} /> Other Collections
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── 5. STICKY MOBILE BOTTOM BAR ── */}
      <div className="mobile-floating-bar" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(255,255,255,0.98)', borderTop: '1px solid #E2E8F0', padding: '10px 14px', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', backdropFilter: 'blur(8px)' }}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#10B981', color: '#FFF', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none' }}
        >
          <MessageCircle size={16} /> Inquire via WhatsApp
        </a>

        <button
          onClick={() => setShowNewsletterModal(true)}
          style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Share for Newsletter"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* ── 6. NEWSLETTER COPY MODAL ── */}
      {showNewsletterModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '560px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB' }}>
                <Share2 size={18} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                  Newsletter & Email Teaser
                </h3>
              </div>
              <button
                onClick={() => setShowNewsletterModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem' }}>
              Copy and paste this snippet directly into your Brevo, Mailchimp, or WhatsApp newsletter campaigns:
            </p>

            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '1rem', fontSize: '0.8rem', color: '#1E293B', fontFamily: 'monospace', whiteSpace: 'pre-line', lineHeight: 1.55, maxHeight: '220px', overflowY: 'auto' }}>
              {collection.newsletterTeaser ||
                `✨ ${collection.title} (${collection.duration})\n\n${collection.tagline}\n\n👉 Complete One-Page Essentials Guide: https://flyingwonders.net/services-catalog/collections/${collection.slug}\n\n💬 Inquire on WhatsApp: https://wa.me/919886171251`}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.25rem' }}>
              <button
                onClick={() => setShowNewsletterModal(false)}
                style={{ padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.8rem', fontWeight: 700, color: '#64748B', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={copyNewsletterText}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.55rem 1.25rem', borderRadius: '8px', border: 'none', background: '#2563EB', color: '#FFF', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
              >
                {copiedBlurb ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedBlurb ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Mobile CSS Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .collection-overview-grid {
            grid-template-columns: 1fr !important;
          }
          .hero-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .day-schedule-grid {
            grid-template-columns: 1fr !important;
          }
          .mobile-floating-bar {
            display: flex !important;
            gap: 8px !important;
          }
        }
      `}</style>

    </div>
  )
}
