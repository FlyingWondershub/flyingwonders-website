'use client'

import { useEffect, useState } from 'react'

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
  slotId = '1234567890',
  format = 'auto',
  style,
  className = '',
  fallbackTitle = '✈️ Book Singapore & Malaysia Tours & Activities',
  fallbackSub = 'Best Price Guarantee on Universal Studios, Gardens by the Bay, Cable Car & Private Transfers.',
  fallbackLink = '/instant-quote',
  fallbackCta = 'Explore Packages & Prices →',
  category = 'general'
}: AdBannerProps) {
  const [adEnabled, setAdEnabled] = useState(true)
  const [adLoaded, setAdLoaded] = useState(false)
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-3967023851392009'

  useEffect(() => {
    // Check if ads are enabled for this category in local/site settings
    if (typeof window !== 'undefined') {
      try {
        const disabled = localStorage.getItem(`fw_ads_disabled_${category}`)
        if (disabled === 'true') {
          setAdEnabled(false)
          return
        }
      } catch (e) {}

      // Try triggering Google AdSense push
      try {
        if (window && (window as any).adsbygoogle && publisherId) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
          setAdLoaded(true)
        }
      } catch (err) {
        // Fallback display active
      }
    }
  }, [category, publisherId])

  if (!adEnabled) return null

  return (
    <div
      className={`fw-ad-container ${className}`}
      style={{
        margin: '2rem 0',
        padding: '1.25rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(15, 76, 58, 0.04) 0%, rgba(184, 58, 75, 0.04) 100%)',
        border: '1px dashed #CBD5E1',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}
      >
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#94A3B8',
            background: 'rgba(255,255,255,0.7)',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid #E2E8F0'
          }}
        >
          Sponsored / Advertisement
        </span>
      </div>

      {/* Google AdSense Script slot */}
      <div style={{ minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', textAlign: 'center' }}
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />

        {/* High-Converting Native Travel Affiliate Fallback Card */}
        {!adLoaded && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '0.5rem 0.25rem'
            }}
          >
            <div style={{ flex: '1 1 300px' }}>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                {fallbackTitle}
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.4 }}>
                {fallbackSub}
              </p>
            </div>
            <a
              href={fallbackLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                background: '#0F4C3A',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(15, 76, 58, 0.2)'
              }}
            >
              {fallbackCta}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
