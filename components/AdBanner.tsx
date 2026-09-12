'use client'

import React from 'react'
import Link from 'next/link'

interface AdBannerProps {
  slotId?: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal'
  style?: React.CSSProperties
  className?: string
  fallbackTitle?: string
  fallbackSub?: string
  fallbackLink?: string
  fallbackCta?: string
  category?: string
}

export default function AdBanner({
  style,
  className = '',
  fallbackTitle = '✈️ Direct Singapore Attraction E-Tickets & B2B Packages',
  fallbackSub = 'Instant barcoded turnstile entry for Universal Studios Singapore, Gardens by the Bay, Night Safari & private luxury transfers with zero booking fees.',
  fallbackLink = '/singapore-attractions',
  fallbackCta = 'Explore E-Tickets & Rates →',
  category = 'general'
}: AdBannerProps) {
  // Category-specific spotlight customizer
  let title = fallbackTitle
  let subtitle = fallbackSub
  let link = fallbackLink
  let cta = fallbackCta
  let badge = '⭐ Verified DMC Recommendation'

  if (category === 'hotels' || category === 'stay') {
    title = '🏨 Singapore B2B Partner Hotels & Executive Suites'
    subtitle = 'Contracted wholesale room allotments at Hotel Boss, Orchard Rendezvous, Village Bugis, and V Hotel Lavender.'
    link = '/services-catalog'
    cta = 'View Hotel Tariffs →'
    badge = '🏨 Direct Hotel Rates'
  } else if (category === 'transport' || category === 'transfers') {
    title = '🚐 Changi Airport & Malaysia Cross-Border Private Transfers'
    subtitle = 'Guaranteed on-time private Toyota Alphard, Combi & Coach transfers between Changi, Marina Bay, Sentosa & Johor Bahru.'
    link = '/services-catalog'
    cta = 'Book Ground Transport →'
    badge = '⚡ Rapid Changi Transfers'
  } else if (category === 'packages' || category === 'tours') {
    title = '🌴 Custom Singapore Tour Packages & Group Circuits'
    subtitle = 'Exotic 4D3N, Classic 5D4N, and Solo Explorer curated holiday itineraries crafted by local Singapore travel architects.'
    link = '/packages'
    cta = 'Customize Your Trip →'
    badge = '💎 Luxury Curated Tours'
  }

  return (
    <div
      className={`fw-recommendation-card glass ${className}`}
      style={{
        margin: '2.5rem 0',
        padding: '1.5rem 1.75rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(15, 76, 58, 0.06) 0%, rgba(212, 160, 23, 0.1) 100%)',
        border: '1.5px solid var(--emerald-secondary, #0F4C3A)',
        boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.04))',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-inter), sans-serif',
        ...style
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--emerald-secondary, #0F4C3A)',
            background: 'rgba(15, 76, 58, 0.1)',
            padding: '3px 10px',
            borderRadius: '20px',
            border: '1px solid rgba(15, 76, 58, 0.2)'
          }}
        >
          {badge}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dark, #0F172A)', opacity: 0.65, fontWeight: 600 }}>
          Flying Wonders Official Desk
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          paddingTop: '0.25rem'
        }}
      >
        <div style={{ flex: '1 1 340px' }}>
          <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark, #0F172A)', lineHeight: 1.35 }}>
            {title}
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dark, #0F172A)', opacity: 0.85, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link
            href={link}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.35rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(15, 76, 58, 0.2)'
            }}
          >
            {cta}
          </Link>
          <a
            href="https://wa.me/919886171251?text=Hi%20Flying%20Wonders%2C%20I%20would%20like%20to%20inquire%20about%20Singapore%20packages%20and%20rates."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              background: '#25D366',
              color: '#FFF',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(37,211,102,0.25)'
            }}
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
