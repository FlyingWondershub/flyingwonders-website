'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Building2,
  Compass,
  Utensils,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Copy,
  Check,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Bus,
  Share2,
  X,
  BookOpen,
  Layers,
  ChevronDown
} from 'lucide-react'
import { TourEssentialsShowcase } from '../utils/tourEssentials'

interface Props {
  showcase: TourEssentialsShowcase
  showCatalogToggle?: boolean
  onToggleFullCatalog?: () => void
}

export default function TourEssentialsShowcaseView({ showcase, showCatalogToggle, onToggleFullCatalog }: Props) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedSnippet, setCopiedSnippet] = useState(false)
  const [showNewsletterModal, setShowNewsletterModal] = useState(false)

  const whatsappMessage = encodeURIComponent(
    showcase.customWhatsAppMessage ||
      `Hi Flying Wonders! I am browsing the Tour Essentials Showcase and would like to inquire about customized pricing and booking.`
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
      showcase.newsletterSnippet ||
      `✨ ${showcase.title}\n${showcase.heroSubtitle}\n\n👉 Complete Essentials Guide: https://flyingwonders.net/tour-essentials\n\n💬 Inquire on WhatsApp: https://wa.me/919886171251`
    navigator.clipboard.writeText(text)
    setCopiedSnippet(true)
    setTimeout(() => setCopiedSnippet(false), 2500)
  }

  const colCount = showcase.featuredCollections?.length || 0
  const hotelCount = showcase.featuredHotels?.length || 0
  const attrCount = showcase.featuredAttractions?.length || 0
  const diningCount = showcase.featuredDining?.length || 0
  const mallCount = showcase.featuredShoppingMalls?.length || 0
  const tourCount = showcase.featuredTours?.length || 0

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B', paddingBottom: '5rem' }}>
      
      {/* ── 1. BREADCRUMBS & TOP ACTIONS BAR ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid #E2E8F0', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: '1440px', width: '94%', margin: '0 auto', padding: '0.75rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748B', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={13} color="#94A3B8" />
            <Link href="/services-catalog" style={{ color: '#64748B', textDecoration: 'none' }}>Services Catalog</Link>
            <ChevronRight size={13} color="#94A3B8" />
            <span style={{ color: '#0F172A', fontWeight: 800 }}>Tour Essentials Showcase</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showCatalogToggle && onToggleFullCatalog ? (
              <button
                onClick={onToggleFullCatalog}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', background: '#F1F5F9', border: '1px solid #CBD5E1', cursor: 'pointer' }}
              >
                <Layers size={13} color="#2563EB" />
                <span>Browse Full 100+ Inventory</span>
              </button>
            ) : (
              <Link
                href="/services-catalog"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', background: '#F1F5F9', border: '1px solid #CBD5E1', textDecoration: 'none' }}
              >
                <Layers size={13} color="#2563EB" />
                <span>Master Catalog</span>
              </Link>
            )}

            <button
              onClick={() => setShowNewsletterModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', background: '#FEF3C7', border: '1px solid #FDE68A', cursor: 'pointer' }}
            >
              <Share2 size={13} color="#D97706" />
              <span>Newsletter Teaser</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, color: '#FFF', background: '#10B981', textDecoration: 'none', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
            >
              <MessageCircle size={14} /> WhatsApp Concierge
            </a>
          </div>
        </div>
      </div>

      {/* ── 2. HERO HEADER ── */}
      <header style={{ background: 'linear-gradient(135deg, #0F4C3A 0%, #1E1B4B 100%)', color: '#FFF', padding: '3.5rem 1.5rem 4rem', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, color: '#FBBF24', marginBottom: '1rem', border: '1px solid rgba(251,191,36,0.3)' }}>
            <Sparkles size={14} color="#FBBF24" /> {showcase.heroBadge || 'CURATED SHOWCASE · 2026 EDITION'}
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', margin: '0 0 0.75rem', letterSpacing: '-0.02em', color: '#FFF', lineHeight: 1.2 }}>
            {showcase.heroTitle || showcase.title}
          </h1>

          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: '#E2E8F0', margin: '0 auto 1.75rem', lineHeight: 1.6, maxWidth: '780px' }}>
            {showcase.heroSubtitle}
          </p>

          {/* Inclusions Stats Strip */}
          <div className="hero-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '12px 16px', maxWidth: '820px', margin: '0 auto 2rem', backdropFilter: 'blur(6px)' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Collections</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF' }}>{colCount} Blueprints</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Top Hotels</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF' }}>{hotelCount} Stays</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Must-Do Sights</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF' }}>{attrCount} Sights</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Dining Spots</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF' }}>{diningCount} Spots</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Shopping Malls</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF' }}>{mallCount} Hubs</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Tour Circuits</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF' }}>{tourCount} Packages</div>
            </div>
          </div>

          {/* Quick Hero Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#10B981', color: '#FFF', padding: '0.8rem 1.6rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', boxShadow: '0 4px 15px rgba(16,185,129,0.35)' }}
            >
              <MessageCircle size={18} /> Inquire Full Showcase via WhatsApp
            </a>

            <button
              onClick={() => setShowNewsletterModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', color: '#FFF', border: '1px solid rgba(255,255,255,0.25)', padding: '0.8rem 1.3rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <Share2 size={16} color="#38BDF8" /> Copy for Newsletter
            </button>
          </div>

        </div>
      </header>

      {/* ── 3. STICKY CATEGORY JUMP ANCHOR BAR ── */}
      <div style={{ position: 'sticky', top: '53px', zIndex: 30, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ maxWidth: '1440px', width: '94%', margin: '0 auto', display: 'flex', gap: '8px', overflowX: 'auto', padding: '0.65rem 0', scrollbarWidth: 'none' }}>
          {colCount > 0 && (
            <a href="#showcase-collections" style={{ padding: '0.45rem 0.95rem', borderRadius: '20px', background: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              ✨ Curated Collections ({colCount})
            </a>
          )}
          {hotelCount > 0 && (
            <a href="#showcase-hotels" style={{ padding: '0.45rem 0.95rem', borderRadius: '20px', background: '#F1F5F9', color: '#334155', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              🏨 Selected Hotels ({hotelCount})
            </a>
          )}
          {attrCount > 0 && (
            <a href="#showcase-attractions" style={{ padding: '0.45rem 0.95rem', borderRadius: '20px', background: '#F1F5F9', color: '#334155', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              🎡 Selected Attractions ({attrCount})
            </a>
          )}
          {diningCount > 0 && (
            <a href="#showcase-dining" style={{ padding: '0.45rem 0.95rem', borderRadius: '20px', background: '#F1F5F9', color: '#334155', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              🍽️ Selected Dining ({diningCount})
            </a>
          )}
          {mallCount > 0 && (
            <a href="#showcase-shopping" style={{ padding: '0.45rem 0.95rem', borderRadius: '20px', background: '#F1F5F9', color: '#334155', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              🛍️ Selected Malls ({mallCount})
            </a>
          )}
          {tourCount > 0 && (
            <a href="#showcase-tours" style={{ padding: '0.45rem 0.95rem', borderRadius: '20px', background: '#F1F5F9', color: '#334155', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              🚍 Selected Circuits ({tourCount})
            </a>
          )}
        </div>
      </div>

      {/* ── 4. MAIN CURATED SHOWCASE BODY ── */}
      <main style={{ maxWidth: '1440px', width: '94%', margin: '2.5rem auto 0', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* ── SECTION 1: FEATURED CURATED COLLECTIONS ── */}
        {colCount > 0 && (
          <section id="showcase-collections" style={{ scrollMarginTop: '110px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#D97706', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#D97706" /> Turnkey Trip Plans
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                  Featured Curated Collections
                </h2>
              </div>
              <Link href="/services-catalog/collections" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                View All Collections <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {showcase.featuredCollections?.map((col) => (
                <div
                  key={col._id}
                  style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ position: 'relative', height: '190px', width: '100%', background: '#0F172A', overflow: 'hidden' }}>
                      {col.coverImageUrl && (
                        <img src={col.coverImageUrl} alt={col.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)' }} />
                      
                      <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ background: '#F59E0B', color: '#0F172A', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '10px' }}>
                          {col.badge || 'CURATED'}
                        </span>
                        <span style={{ background: 'rgba(15,23,42,0.8)', color: '#FFF', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)' }}>
                          {col.duration}
                        </span>
                      </div>

                      <div style={{ position: 'absolute', bottom: '10px', left: '10px', display: 'flex', alignItems: 'center', gap: '4px', color: '#FFF', fontSize: '0.75rem', fontWeight: 700 }}>
                        <MapPin size={12} color="#EF4444" /> {col.destination}
                      </div>
                    </div>

                    <div style={{ padding: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: '0 0 0.4rem', lineHeight: 1.35 }}>
                        <Link href={`/services-catalog/collections/${col.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {col.title}
                        </Link>
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: '0 0 0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {col.tagline}
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #F1F5F9' }}>
                    <Link
                      href={`/services-catalog/collections/${col.slug}`}
                      style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#0F4C3A', color: '#FFF', padding: '0.65rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none' }}
                    >
                      <span>Explore 1-Page Blueprint</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 2: SELECTED HOTELS ── */}
        {hotelCount > 0 && (
          <section id="showcase-hotels" style={{ scrollMarginTop: '110px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10B981', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={14} /> Selected Stays
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                Selected Partner Hotels
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {showcase.featuredHotels?.map((h) => {
                const img = h.coverImageUrl || h.photoUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'
                return (
                  <div
                    key={h._id}
                    style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ position: 'relative', height: '180px', width: '100%', background: '#0F172A' }}>
                        <img src={img} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(15,23,42,0.85)', color: '#FBBF24', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={12} fill="#FBBF24" /> {h.starRating || '4-Star'}
                        </div>
                      </div>

                      <div style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: '0 0 0.35rem' }}>
                          {h.name}
                        </h3>
                        {h.hotelAddress && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.65rem' }}>
                            <MapPin size={12} color="#EF4444" style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.hotelAddress}</span>
                          </div>
                        )}
                        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: '0 0 0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {h.description || h.shortDescription}
                        </p>
                      </div>
                    </div>

                    <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      {h.slug ? (
                        <Link href={`/services-catalog/hotels/${h.slug}`} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          Details <ChevronRight size={13} />
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
                        <MessageCircle size={13} /> Inquire
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── SECTION 3: SELECTED ATTRACTIONS ── */}
        {attrCount > 0 && (
          <section id="showcase-attractions" style={{ scrollMarginTop: '110px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F59E0B', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={14} /> Must-Do Sights
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                Selected Attractions & Experiences
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {showcase.featuredAttractions?.map((a) => {
                const img = a.coverImageUrl || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop'
                return (
                  <div
                    key={a._id}
                    style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ height: '170px', width: '100%', background: '#0F172A', overflow: 'hidden' }}>
                        <img src={img} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>

                      <div style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: '0 0 0.4rem', lineHeight: 1.35 }}>
                          {a.name}
                        </h3>

                        {a.timings && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.5rem' }}>
                            <Clock size={12} color="#2563EB" style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.timings}</span>
                          </div>
                        )}

                        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {a.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      {a.slug ? (
                        <Link href={`/services-catalog/attractions/${a.slug}`} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          Guide <ChevronRight size={13} />
                        </Link>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Instant E-Pass</span>
                      )}

                      <a
                        href={`https://wa.me/919886171251?text=Hi%20Flying%20Wonders!%20I%20would%20like%20to%20inquire%20about%20tickets%20for%20${encodeURIComponent(a.name)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#10B981', color: '#FFF', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none' }}
                      >
                        <MessageCircle size={13} /> Tickets
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── SECTION 4: SELECTED DINING ── */}
        {diningCount > 0 && (
          <section id="showcase-dining" style={{ scrollMarginTop: '110px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#EC4899', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Utensils size={14} /> Selected Dining
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                Selected Dining & Hawker Gems
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {showcase.featuredDining?.map((d) => (
                <div
                  key={d._id}
                  style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '0.4rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                        {d.name}
                      </h3>
                      {d.priceTier && (
                        <span style={{ background: '#F1F5F9', color: '#0F172A', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                          {d.priceTier}
                        </span>
                      )}
                    </div>

                    {d.cuisineType && (
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', marginBottom: '0.4rem' }}>
                        {d.cuisineType}
                      </div>
                    )}

                    <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: '0 0 0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {d.description}
                    </p>
                  </div>

                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    {d.slug ? (
                      <Link href={`/services-catalog/restaurants/${d.slug}`} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none' }}>
                        Menu Guide →
                      </Link>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Group Dining</span>
                    )}

                    <a
                      href={`https://wa.me/919886171251?text=Hi%20Flying%20Wonders!%20I%20would%20like%20to%20reserve%20group%20dining%20at%20${encodeURIComponent(d.name)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#10B981', color: '#FFF', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none' }}
                    >
                      <MessageCircle size={13} /> Reserve
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 5: SELECTED SHOPPING ── */}
        {mallCount > 0 && (
          <section id="showcase-shopping" style={{ scrollMarginTop: '110px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8B5CF6', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingBag size={14} /> Retail & Outlets
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                Selected Shopping Malls
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {showcase.featuredShoppingMalls?.map((m) => (
                <div
                  key={m._id}
                  style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: '0 0 0.35rem' }}>
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

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {m.slug ? (
                      <Link href={`/travel-tools/shopping-malls/${m.slug}`} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none' }}>
                        Mall Guide →
                      </Link>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>9% GST Refund</span>
                    )}

                    <Link
                      href="/travel-tools/shopping-guide"
                      style={{ background: '#F8FAFC', color: '#334155', border: '1px solid #CBD5E1', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}
                    >
                      eTRS Tax Refund
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 6: SELECTED TOUR CIRCUITS ── */}
        {tourCount > 0 && (
          <section id="showcase-tours" style={{ scrollMarginTop: '110px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4F46E5', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bus size={14} /> Guided Land Circuits
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                Selected Guided Tour Packages
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {showcase.featuredTours?.map((t) => (
                <div
                  key={t._id}
                  style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
                >
                  <div style={{ maxWidth: '800px' }}>
                    <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '6px' }}>
                      {t.duration || 'LAND CIRCUIT'}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: '6px 0 0.35rem' }}>
                      {t.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                      {t.description}
                    </p>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#10B981', color: '#FFF', padding: '0.65rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none', flexShrink: 0 }}
                  >
                    <MessageCircle size={15} /> Inquire Circuit
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── BOTTOM CALLOUT: WANT FULL INVENTORY? ── */}
        <section style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #0F4C3A 100%)', borderRadius: '20px', padding: '2.5rem', color: '#FFF', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <span style={{ display: 'inline-block', background: '#F59E0B', color: '#0F172A', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 12px', borderRadius: '14px', marginBottom: '0.75rem' }}>
              B2B Travel Trade & Custom Itineraries
            </span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', margin: '0 0 0.75rem' }}>
              Need More Options or Full Inventory?
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#E2E8F0', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              Explore our complete directory of 60+ attractions, 24 partner hotels, licensed guides, and custom FIT land quoter tools.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/services-catalog?tab=all"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFF', color: '#0F172A', padding: '0.75rem 1.4rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none' }}
              >
                <Layers size={15} color="#2563EB" /> Browse Master Directory (100+)
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#10B981', color: '#FFF', padding: '0.75rem 1.4rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none' }}
              >
                <MessageCircle size={15} /> WhatsApp Operations Desk
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* ── 5. NEWSLETTER COPY MODAL ── */}
      {showNewsletterModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '560px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB' }}>
                <Share2 size={18} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
                  Newsletter & Email Teaser Snippet
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
              {showcase.newsletterSnippet ||
                `✨ ${showcase.title}\n${showcase.heroSubtitle}\n\n👉 Complete Essentials Guide: https://flyingwonders.net/tour-essentials\n\n💬 Inquire on WhatsApp: https://wa.me/919886171251`}
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
                {copiedSnippet ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedSnippet ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Mobile CSS Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .hero-stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .hero-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

    </div>
  )
}
