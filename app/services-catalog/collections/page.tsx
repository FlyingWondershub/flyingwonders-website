'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  Search,
  Filter,
  Users,
  Clock,
  Layers,
  ChevronRight,
  Briefcase,
  Heart,
  BookOpen
} from 'lucide-react'
import { getAllCuratedCollections, CuratedCollectionData } from '../../../utils/curatedCollections'

const CATEGORY_TABS = [
  { id: 'all', label: 'All Collections' },
  { id: 'family', label: '👨‍👩‍👧‍👦 Family & Kids' },
  { id: 'cross-border', label: '🚍 Cross-Border (SG + MY)' },
  { id: 'corporate', label: '💼 Corporate MICE' },
  { id: 'culture', label: '🍛 Culture & Food' },
  { id: 'honeymoon', label: '💍 Honeymoon & Couples' },
]

export default function CuratedCollectionsIndexPage() {
  const [collections, setCollections] = useState<CuratedCollectionData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDestination, setSelectedDestination] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllCuratedCollections()
        setCollections(data)
      } catch (err) {
        console.error('Failed to load curated collections:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredCollections = useMemo(() => {
    return collections.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category?.toLowerCase() === selectedCategory.toLowerCase()
      const matchesDestination =
        selectedDestination === 'all' ||
        (selectedDestination === 'Singapore' && item.destination === 'Singapore') ||
        (selectedDestination === 'Malaysia' && item.destination === 'Malaysia') ||
        (selectedDestination === 'Cross Border' && (item.destination === 'Cross Border' || item.destination.includes('+')))
      
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.tagline?.toLowerCase().includes(q) ||
        item.targetAudience?.toLowerCase().includes(q) ||
        item.destination?.toLowerCase().includes(q) ||
        item.highlights?.some((h) => h.toLowerCase().includes(q))

      return matchesCategory && matchesDestination && matchesSearch
    })
  }, [collections, selectedCategory, selectedDestination, searchQuery])

  const copyNewsletterSnippet = (e: React.MouseEvent, item: CuratedCollectionData) => {
    e.preventDefault()
    e.stopPropagation()
    const textToCopy =
      item.newsletterTeaser ||
      `✨ ${item.title} (${item.duration})\n${item.tagline}\n\n👉 View Complete Essentials Guide: https://flyingwonders.net/services-catalog/collections/${item.slug}`
    navigator.clipboard.writeText(textToCopy)
    setCopiedId(item._id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B', paddingBottom: '4rem' }}>
      
      {/* ── 1. BREADCRUMBS & TOP BAR ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid #E2E8F0', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: '1440px', width: '94%', margin: '0 auto', padding: '0.75rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748B', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={13} color="#94A3B8" />
            <Link href="/services-catalog" style={{ color: '#64748B', textDecoration: 'none' }}>Services Catalog</Link>
            <ChevronRight size={13} color="#94A3B8" />
            <span style={{ color: '#0F172A', fontWeight: 800 }}>Curated Collections</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              href="/services-catalog"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', background: '#F1F5F9', border: '1px solid #E2E8F0', textDecoration: 'none' }}
            >
              Master Catalog
            </Link>
            <a
              href="https://wa.me/919886171251?text=Hi%20Flying%20Wonders!%20I%20would%20like%20to%20inquire%20about%20a%20customized%20Curated%20Collection%20for%20our%20group."
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
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, color: '#FBBF24', marginBottom: '1rem', border: '1px solid rgba(251,191,36,0.3)' }}>
            <Sparkles size={14} color="#FBBF24" /> Turnkey Itinerary Essentials
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', margin: '0 0 0.75rem', letterSpacing: '-0.02em', color: '#FFF', lineHeight: 1.2 }}>
            Curated Travel Collections
          </h1>
          <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: '#E2E8F0', margin: '0 auto 1.5rem', lineHeight: 1.6, maxWidth: '720px' }}>
            One-page blueprints hand-crafted for newsletters, corporate proposals, and specialized travel sectors. Each collection bundles recommended hotels, must-do attractions, authentic dining, and guided circuits.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '0.6rem 1.2rem', fontSize: '0.82rem', color: '#CBD5E1', maxWidth: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
            <BookOpen size={16} color="#34D399" style={{ flexShrink: 0 }} />
            <span><strong>Newsletter & Agency Ready:</strong> Click any collection to view the full essentials guide or copy 1-click email teasers.</span>
          </div>
        </div>
      </header>

      {/* ── 3. FILTER & SEARCH CONTROL BAR ── */}
      <div style={{ maxWidth: '1440px', width: '94%', margin: '-2rem auto 2.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', padding: '1.25rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Top Row: Search + Destination Filter */}
            <div className="collection-filter-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              
              {/* Search Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '0 14px', borderRadius: '10px', border: '1px solid #CBD5E1', flex: '1 1 320px', minWidth: '260px' }}>
                <Search size={18} color="#0F4C3A" />
                <input
                  type="text"
                  placeholder="Search collections by theme, title, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', padding: '12px 0', outline: 'none', fontSize: '0.88rem', color: '#0F172A', fontWeight: 600 }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', fontSize: '0.78rem', color: '#64748B', cursor: 'pointer', padding: '4px' }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Destination Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
                  Destination:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['all', 'Singapore', 'Malaysia', 'Cross Border'].map((dest) => (
                    <button
                      key={dest}
                      onClick={() => setSelectedDestination(dest)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: selectedDestination === dest ? '#0F4C3A' : '#F1F5F9',
                        color: selectedDestination === dest ? '#FFF' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {dest === 'all' ? 'All Destinations' : dest}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Row: Sector Category Pills */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
              {CATEGORY_TABS.map((tab) => {
                const isActive = selectedCategory === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    style={{
                      padding: '0.55rem 1.1rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive ? '#2563EB' : '#F8FAFC',
                      color: isActive ? '#FFF' : '#334155',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

          </div>

        </div>
      </div>

      {/* ── 4. COLLECTIONS GRID ── */}
      <main style={{ maxWidth: '1440px', width: '94%', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: 0 }}>
              Curated Itinerary Blueprints
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0' }}>
              Showing {filteredCollections.length} curated collection{filteredCollections.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <Sparkles className="animate-spin" size={36} color="#0F4C3A" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 700, color: '#64748B', fontSize: '0.95rem' }}>Loading Curated Collections...</p>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#FFF', borderRadius: '16px', border: '2px dashed #CBD5E1' }}>
            <Compass size={44} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.5rem' }}>No collections match your filter</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Try adjusting your category, destination, or search query to explore other blueprints.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all')
                setSelectedDestination('all')
                setSearchQuery('')
              }}
              style={{ background: '#0F4C3A', color: '#FFF', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="collection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.75rem' }}>
            {filteredCollections.map((col) => {
              const hotelsCount = col.featuredHotels?.length || 0
              const attrCount = col.featuredAttractions?.length || 0
              const diningCount = col.featuredDining?.length || 0
              const shoppingCount = col.featuredShopping?.length || 0

              return (
                <div
                  key={col._id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  <div>
                    {/* Cover Hero Image & Badges */}
                    <div style={{ position: 'relative', height: '220px', width: '100%', background: '#0F172A', overflow: 'hidden' }}>
                      {col.coverImageUrl ? (
                        <img
                          src={col.coverImageUrl}
                          alt={col.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1E1B4B 0%, #0F4C3A 100%)' }}>
                          <Sparkles size={36} color="#FBBF24" />
                        </div>
                      )}
                      
                      {/* Gradient overlay for readability */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)' }} />

                      {/* Top Badges */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ background: '#F59E0B', color: '#0F172A', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 10px', borderRadius: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                          {col.badge || 'CURATED'}
                        </span>
                        <span style={{ background: 'rgba(15,23,42,0.8)', color: '#FFF', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '14px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                          {col.duration}
                        </span>
                      </div>

                      {/* Destination Pin */}
                      <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '8px', color: '#FFF', fontSize: '0.78rem', fontWeight: 700 }}>
                        <MapPin size={13} color="#EF4444" />
                        <span>{col.destination}</span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div style={{ padding: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0F172A', margin: '0 0 0.5rem', lineHeight: 1.35 }}>
                        <Link href={`/services-catalog/collections/${col.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {col.title}
                        </Link>
                      </h3>

                      <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55, margin: '0 0 1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {col.tagline || col.overview}
                      </p>

                      {/* Stats Matrix */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '8px', textAlign: 'center', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                            <Building2 size={12} color="#2563EB" /> Stays
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>{hotelsCount}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                            <Compass size={12} color="#10B981" /> Sights
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>{attrCount}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                            <Utensils size={12} color="#F59E0B" /> Dine
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>{diningCount}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                            <ShoppingBag size={12} color="#8B5CF6" /> Shop
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>{shoppingCount}</div>
                        </div>
                      </div>

                      {/* Standout Highlights Preview */}
                      {col.highlights && col.highlights.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '0.75rem' }}>
                          {col.highlights.slice(0, 2).map((h, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.78rem', color: '#475569' }}>
                              <span style={{ color: '#10B981', fontWeight: 900, flexShrink: 0 }}>✓</span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom CTA Actions */}
                  <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <Link
                      href={`/services-catalog/collections/${col.slug}`}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '0.65rem 1rem',
                        borderRadius: '10px',
                        background: '#0F4C3A',
                        color: '#FFF',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(15,76,58,0.25)'
                      }}
                    >
                      <span>Explore Essentials</span>
                      <ArrowRight size={14} />
                    </Link>

                    <button
                      type="button"
                      onClick={(e) => copyNewsletterSnippet(e, col)}
                      title="Copy newsletter email teaser snippet"
                      style={{
                        padding: '0.65rem',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        background: '#F8FAFC',
                        color: copiedId === col._id ? '#10B981' : '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {copiedId === col._id ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>

                </div>
              )
            })}
          </div>
        )}

        {/* ── 5. NEWSLETTER CALLOUT BOX ── */}
        <section style={{ marginTop: '4rem', background: 'linear-gradient(135deg, #1E1B4B 0%, #0F4C3A 100%)', borderRadius: '20px', padding: '2.5rem', color: '#FFF', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '800px' }}>
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#FBBF24', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 12px', borderRadius: '14px', marginBottom: '0.75rem' }}>
              For Tour Organizers & Newsletter Editors
            </span>
            <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900, fontFamily: 'var(--font-playfair), Georgia, serif', margin: '0 0 0.5rem' }}>
              Need a Custom Turnkey Collection for Your Campaign?
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#E2E8F0', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              Our destination operations team can create bespoke one-page collections curated specifically for your corporate incentive group, school delegation, or seasonal newsletter promotion.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href="https://wa.me/919886171251?text=Hi%20Flying%20Wonders!%20We%20would%20like%20to%20request%20a%20customized%20Curated%20Collection%20for%20our%20newsletter%20campaign."
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#10B981', color: '#FFF', padding: '0.7rem 1.3rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
              >
                <MessageCircle size={16} /> WhatsApp Operations Desk
              </a>
              <Link
                href="/services-catalog"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: '#FFF', padding: '0.7rem 1.3rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Browse Master Directory
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Embedded Mobile CSS Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .collection-grid {
            grid-template-columns: 1fr !important;
          }
          .collection-filter-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }
        }
      `}</style>

    </div>
  )
}
