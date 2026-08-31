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

    // Only push if a valid numeric slot ID is supplied and adsbygoogle is active
    if (!pushedRef.current && isNumericSlot) {
      try {
        if ((window as any).adsbygoogle) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
          pushedRef.current = true
          setAdLoaded(true)
        }
      } catch (err) {
        // Silent fallback
      }
    }
  }, [category, publisherId, isNumericSlot])

  if (!adEnabled) return null

  // If no valid numeric slot ID is configured (pre-approval phase), render nothing to keep the layout clean for Google AdSense policy review
  if (!isNumericSlot) {
    return null
  }

  return (
    <div
      className={`fw-ad-container ${className}`}
      style={{
        margin: '2rem 0',
        padding: '0.75rem',
        borderRadius: '12px',
        background: 'transparent',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-inter), sans-serif',
        textAlign: 'center',
        minHeight: '90px',
        ...style
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', textAlign: 'center' }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
