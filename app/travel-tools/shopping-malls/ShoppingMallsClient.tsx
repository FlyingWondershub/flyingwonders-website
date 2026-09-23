'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Sparkles,
  MapPin,
  Clock,
  Search,
  ArrowRight,
  ShieldCheck,
  Compass,
  Star,
  Tag,
  DollarSign,
  HelpCircle,
  ChevronRight,
  CreditCard,
  Percent,
  CheckCircle2
} from 'lucide-react'
import type { ShoppingMallData } from '../../../utils/shoppingMalls'
import AdBanner from '../../../components/AdBanner'

interface ShoppingMallsClientProps {
  initialMalls: ShoppingMallData[]
}

export default function ShoppingMallsClient({ initialMalls }: ShoppingMallsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: `All Destinations (${initialMalls.length})` },
    { id: 'outlet', label: 'Outlet & Factory Clearance' },
    { id: 'superstore', label: '24/7 Mega Superstores' },
    { id: 'street', label: 'Street Markets & Bargains' },
    { id: 'luxury', label: 'Ultra-Luxury Flagships' },
    { id: 'belt', label: 'Orchard Shopping Belt' },
    { id: 'heritage', label: 'Heritage & Souvenirs' }
  ]

  const filteredMalls = useMemo(() => {
    return initialMalls.filter(mall => {
      const matchesSearch =
        mall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mall.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mall.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mall.topStoresAndBrands || []).some(c => (c.brands || []).some(b => b.toLowerCase().includes(searchQuery.toLowerCase())))

      if (!matchesSearch) return false

      if (selectedCategory === 'all') return true
      if (selectedCategory === 'outlet') return mall.category.includes('Outlet')
      if (selectedCategory === 'superstore') return mall.category.includes('24/7')
      if (selectedCategory === 'street') return mall.category.includes('Street')
      if (selectedCategory === 'luxury') return mall.category.includes('Luxury')
      if (selectedCategory === 'belt') return mall.category.includes('Belt')
      if (selectedCategory === 'heritage') return mall.category.includes('Heritage')

      return true
    })
  }, [initialMalls, searchQuery, selectedCategory])

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B', paddingBottom: '4rem' }}>
      
      {/* ── 1. BREADCRUMBS & TOP BAR ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0.85rem 1.5rem' }}>
        <div style={{ maxWidth: '1600px', width: '96%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#64748B' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/travel-tools" style={{ color: '#64748B', textDecoration: 'none' }}>Travel Tools</Link>
            <span>/</span>
            <span style={{ color: '#0F172A', fontWeight: 800 }}>Singapore Shopping Malls & Markets</span>
          </div>

          <Link
            href="/travel-tools/shopping-guide"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #059669 0%, #0F4C3A 100%)',
              color: '#FFF',
              fontSize: '0.82rem',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(15,76,58,0.2)'
            }}
          >
            <Sparkles size={14} color="#FDE68A" />
            <span>Master Singapore Shopping Guide & 9% GST Refund →</span>
          </Link>
        </div>
      </div>

      {/* ── 2. HERO HEADER (WIDE-SCREEN 1600PX) ── */}
      <section style={{ 
        background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)', 
        color: '#FFF', 
        padding: '3rem 1.5rem 3.5rem', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1600px', width: '96%', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '1rem', backdropFilter: 'blur(8px)' }}>
            <ShoppingBag size={15} color="#D4AF37" /> Singapore Tourist Shopping & Outlet Directory
          </div>

          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.15 }}>
            Singapore Shopping Malls & Iconic Street Markets
          </h1>

          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: '#E2E8F0', maxWidth: '850px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Discover Singapore’s premier retail hubs: from 80% designer factory outlets at IMM and the 24/7 maze of Mustafa Centre to the bargain stalls of Bugis and ultra-luxury flagships of Marina Bay Sands.
          </p>

          {/* Search Bar */}
          <div style={{ maxWidth: '650px', margin: '0 auto', position: 'relative' }}>
            <Search size={20} color="#64748B" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search mall name, brand (Coach, Nike, LV), or district (Jurong, Orchard)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1.25rem 1rem 3.25rem',
                borderRadius: '50px',
                border: 'none',
                fontSize: '0.95rem',
                outline: 'none',
                boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                color: '#1E293B',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </section>

      {/* ── 3. FILTER PILLS (WIDE-SCREEN) ── */}
      <section style={{ maxWidth: '1600px', width: '96%', margin: '-1.5rem auto 2.5rem', padding: '0 0.5rem', position: 'relative', zIndex: 3 }}>
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
        }}>
          {categories.map(cat => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '0.55rem 1.15rem',
                  borderRadius: '25px',
                  border: isActive ? '1px solid #0F4C3A' : '1px solid #E2E8F0',
                  background: isActive ? '#0F4C3A' : '#F8FAFC',
                  color: isActive ? '#FFF' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* ── 4. FEATURED PROMO: MASTER SHOPPING GUIDE & 9% GST REFUND ── */}
      <section style={{ maxWidth: '1600px', width: '96%', margin: '0 auto 2.5rem', padding: '0 0.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #EFF6FF 100%)',
          borderRadius: '20px',
          border: '1px solid #A7F3D0',
          padding: '1.75rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 4px 15px rgba(15,76,58,0.06)'
        }}>
          <div style={{ maxWidth: '850px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#DCFCE7', color: '#15803D', padding: '3px 10px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              <Percent size={13} /> Official Tourist Benefit
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#064E3B', margin: '0 0 0.4rem', fontFamily: 'var(--font-playfair), serif' }}>
              The Ultimate Singapore Shopping Guide & 9% GST Refund Playbook
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0, lineHeight: 1.55 }}>
              Planning your shopping itinerary? Explore our curated 4-day shopping routes, Singapore sales calendar (GSS, Year-End, Black Friday), signature homegrown brands, and step-by-step eTRS tax refund calculator.
            </p>
          </div>

          <Link
            href="/travel-tools/shopping-guide"
            style={{
              background: '#0F4C3A',
              color: '#FFF',
              padding: '0.85rem 1.6rem',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.92rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 6px 18px rgba(15,76,58,0.25)',
              whiteSpace: 'nowrap'
            }}
          >
            <span>Open Shopping Guide & Calculator</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── 5. DESTINATIONS GRID: CARDS FOR EACH MALL (WIDE-SCREEN 1600PX) ── */}
      <section style={{ maxWidth: '1600px', width: '96%', margin: '0 auto', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>
              Featured Singapore Shopping Hubs ({filteredMalls.length})
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '3px 0 0' }}>
              Click anywhere on a mall card to open the complete full-page visitor guide, brand directory, MRT map, and insider pro-tips.
            </p>
          </div>
        </div>

        {filteredMalls.length === 0 ? (
          <div style={{ background: '#FFF', borderRadius: '18px', padding: '3.5rem 2rem', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <ShoppingBag size={40} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#1E293B', margin: '0 0 0.5rem' }}>No shopping destinations match your search</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0 0 1.5rem' }}>Try clearing your search query or selecting &quot;All Destinations&quot;.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
              style={{ background: '#0F4C3A', color: '#FFF', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: '1.75rem'
          }}>
            {filteredMalls.map(mall => (
              <Link
                key={mall._id}
                href={`/travel-tools/shopping-malls/${mall.slug}`}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                  transition: 'all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.boxShadow = '0 14px 32px rgba(15,76,58,0.12)'
                  e.currentTarget.style.borderColor = '#0F4C3A'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.04)'
                  e.currentTarget.style.borderColor = '#E2E8F0'
                }}
              >
                {/* Cover Image Container */}
                <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden', background: '#0F172A' }}>
                  <img
                    src={mall.coverImageUrl}
                    alt={mall.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1.0)' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)' }} />
                  
                  {/* Category Pill */}
                  <span style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(15,23,42,0.82)', color: '#FFF', fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', backdropFilter: 'blur(6px)' }}>
                    {mall.category}
                  </span>

                  {/* Rating & Budget Badges */}
                  <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '6px' }}>
                    <span style={{ background: '#FEF3C7', color: '#B45309', fontSize: '0.76rem', fontWeight: 900, padding: '3px 8px', borderRadius: '6px' }}>
                      ★ {mall.starRating}
                    </span>
                    <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.76rem', fontWeight: 900, padding: '3px 8px', borderRadius: '6px' }}>
                      {mall.budgetTier}
                    </span>
                  </div>

                  {/* Mall Name on Image Bottom */}
                  <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFF', margin: '0 0 2px', lineHeight: 1.2, fontFamily: 'var(--font-playfair), serif' }}>
                      {mall.name}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#CBD5E1', display: 'block' }}>
                      📍 {mall.district}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {mall.tagline}
                  </p>

                  {/* Key Highlights Mini Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
                    {(mall.keyHighlights || []).slice(0, 3).map((hl, i) => (
                      <span key={i} style={{ background: '#F1F5F9', color: '#334155', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '5px' }}>
                        ✓ {hl.title}
                      </span>
                    ))}
                  </div>

                  {/* Logistics Strip */}
                  <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginTop: 'auto', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#0F172A', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.9rem' }}>🚇</span>
                      <strong>{mall.nearestMrt?.station || 'MRT Station'}</strong>
                      {mall.nearestMrt?.walkingTime && (
                        <span style={{ color: '#059669', fontWeight: 700 }}>({mall.nearestMrt.walkingTime})</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#64748B' }}>
                      <Clock size={13} color="#64748B" />
                      <span>{mall.timings}</span>
                    </div>
                  </div>

                  {/* Direct Link Visual CTA */}
                  <div
                    style={{
                      background: '#0F4C3A',
                      color: '#FFF',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(15,76,58,0.18)'
                    }}
                  >
                    <span>Explore Mall Guide & Tips</span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── 6. BOTTOM ADVERTISEMENT SLOT ── */}
      <div style={{ maxWidth: '1600px', width: '96%', margin: '3.5rem auto 0', padding: '0 0.5rem' }}>
        <AdBanner slotId="shopping_malls_hub_bottom_slot" category="b2b" />
      </div>

    </div>
  )
}
