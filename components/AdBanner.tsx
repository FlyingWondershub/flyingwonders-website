'use client'

import { useEffect, useState, useRef } from 'react'

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
  slotId,
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
  const pushedRef = useRef(false)
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-3967023851392009'

  // Validate if slotId is a valid 8-12 digit AdSense numeric ID
  const isNumericSlot = Boolean(slotId && /^\d{8,12}$/.test(slotId))

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const disabled = localStorage.getItem(`fw_ads_disabled_${category}`)
      if (disabled === 'true') {
        setAdEnabled(false)
        return
      }
    } catch (e) {}

    // Only push if adsbygoogle is defined and we haven't already pushed for this unit
    if (!pushedRef.current && isNumericSlot) {
      try {
        if ((window as any).adsbygoogle) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
          pushedRef.current = true
          setAdLoaded(true)
        }
      } catch (err) {
        // Fallback display active
      }
    }
  }, [category, publisherId, isNumericSlot])

  if (!adEnabled) return null

  return (
    <div
      className={`fw-ad-container ${className}`}
      style={{
        margin: '2rem 0',
        padding: '1.25rem',
        borderRadius: '16px',
        background: 'var(--card-bg, rgba(15, 76, 58, 0.03))',
        border: '1px dashed var(--glass-border, #CBD5E1)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-inter), sans-serif',
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
            color: 'var(--text-muted, #94A3B8)',
            background: 'var(--bg-secondary, rgba(255,255,255,0.7))',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid var(--glass-border, #E2E8F0)'
          }}
        >
          Sponsored / Recommendation
        </span>
      </div>

      <div style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Google AdSense Script slot (only if valid numeric slot is provided) */}
        {isNumericSlot && (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', textAlign: 'center' }}
            data-ad-client={publisherId}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        )}

        {/* High-Converting Native Travel Affiliate Fallback Card */}
        {(!isNumericSlot || !adLoaded) && (
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
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark, #0F172A)' }}>
                {fallbackTitle}
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #64748B)', lineHeight: 1.4 }}>
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
                background: 'var(--emerald-secondary, #0F4C3A)',
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
