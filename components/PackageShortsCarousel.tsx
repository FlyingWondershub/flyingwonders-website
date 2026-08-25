'use client'

import React, { useState, useEffect, useRef } from 'react'
import type { TravelShort } from '../utils/packages'
import { DEFAULT_SINGAPORE_SHORTS } from '../utils/packages'
import ShortsModalPlayer from './ShortsModalPlayer'

interface PackageShortsCarouselProps {
  destination?: string
  curatedShorts?: TravelShort[]
}

export default function PackageShortsCarousel({
  destination = 'Singapore',
  curatedShorts
}: PackageShortsCarouselProps) {
  const [shorts, setShorts] = useState<TravelShort[]>(curatedShorts || DEFAULT_SINGAPORE_SHORTS)
  const [loading, setLoading] = useState(!curatedShorts)
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // If curated shorts were passed explicitly, use them directly
    if (curatedShorts && curatedShorts.length > 0) {
      setShorts(curatedShorts)
      setLoading(false)
      return
    }

    let isMounted = true

    async function loadShorts() {
      try {
        const res = await fetch(`/api/shorts?destination=${encodeURIComponent(destination)}`)
        if (res.ok) {
          const data = await res.json()
          if (isMounted && data.shorts && data.shorts.length > 0) {
            setShorts(data.shorts)
          }
        }
      } catch (err) {
        console.warn('Failed to load dynamic shorts, using fallback:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadShorts()
    return () => {
      isMounted = false
    }
  }, [destination, curatedShorts])

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (shorts.length === 0) return null

  return (
    <section style={{ margin: '3.5rem 0' }}>
      {/* ── Section Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.25rem' }}>✨</span>
            <h3
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(1.35rem, 3vw, 1.75rem)',
                fontWeight: 700,
                color: 'var(--text-dark)',
                margin: 0
              }}
            >
              In-depth experience
            </h3>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '0.9rem',
              color: 'var(--text-muted, #64748B)',
              margin: 0
            }}
          >
            Quick Shorts from fellow travellers — a glimpse of what to expect in {destination}.
          </p>
        </div>

        {/* Carousel Prev/Next Navigation Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Scroll shorts left"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid var(--glass-border, #CBD5E1)',
              background: 'var(--bg-secondary, #F8FAFC)',
              color: 'var(--text-dark)',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Scroll shorts right"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid var(--glass-border, #CBD5E1)',
              background: 'var(--bg-secondary, #F8FAFC)',
              color: 'var(--text-dark)',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            ›
          </button>
        </div>
      </div>

      {/* ── Horizontal Scrollable Carousel ── */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '1.15rem',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingBottom: '0.75rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {shorts.map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => setActiveModalIndex(index)}
            style={{
              flex: '0 0 auto',
              width: 'clamp(175px, 26vw, 215px)',
              height: 'clamp(305px, 46vw, 375px)',
              scrollSnapAlign: 'start',
              position: 'relative',
              borderRadius: '18px',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.15)',
              border: '1px solid var(--glass-border, rgba(255,255,255,0.1))',
              background: '#0a0a0a',
              transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 14px 28px -4px rgba(0, 0, 0, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 24px -6px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Background Thumbnail Poster */}
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />

            {/* Dark Gradient Overlay for Readability */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 100%)',
                pointerEvents: 'none'
              }}
            />

            {/* Top Right Floating Play Indicator */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                paddingLeft: '2px'
              }}
            >
              ▶
            </div>

            {/* Bottom Details (Title, Creator, Views) */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                color: '#FFFFFF'
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  lineHeight: 1.3,
                  margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                }}
              >
                {item.title}
              </p>

              <div
                style={{
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '2px'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                  {item.creator}
                </span>
                {item.views && (
                  <span style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                    {item.views}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Modal Video Player ── */}
      {activeModalIndex !== null && (
        <ShortsModalPlayer
          isOpen={activeModalIndex !== null}
          onClose={() => setActiveModalIndex(null)}
          shorts={shorts}
          currentIndex={activeModalIndex}
          onNavigate={(newIdx) => setActiveModalIndex(newIdx)}
        />
      )}
    </section>
  )
}
