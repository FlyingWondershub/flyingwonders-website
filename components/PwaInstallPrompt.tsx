'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface PwaInstallPromptProps {
  hidePwaPrompt?: boolean
}

export default function PwaInstallPrompt({ hidePwaPrompt }: PwaInstallPromptProps) {
  const pathname = usePathname()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Only allow prompt on /about and /travel-tools pages
  const isTargetPage = pathname === '/about' || pathname === '/travel-tools' || pathname?.startsWith('/about/') || pathname?.startsWith('/travel-tools/')

  useEffect(() => {
    // Register Service Worker globally on mount
    if ('serviceWorker' in navigator) {
      if (document.readyState === 'complete') {
        navigator.serviceWorker.register('/sw.js').catch(() => {})
      } else {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(() => {})
        })
      }
    }

    if (hidePwaPrompt || !isTargetPage) {
      setIsVisible(false)
      return
    }

    // Check if app is already running in standalone/installed mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true

    if (isStandalone) {
      setIsVisible(false)
      return
    }

    // Check if user recently dismissed
    const dismissedAt = localStorage.getItem('fw_pwa_prompt_dismissed')
    if (dismissedAt) {
      const hoursPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60)
      if (hoursPassed < 24) {
        setIsVisible(false)
        return
      }
    }

    // Handler for native Chrome/Android install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show prompt on target pages (/about and /travel-tools) whenever app is not installed
    setIsVisible(true)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [pathname, isTargetPage, hidePwaPrompt])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setIsVisible(false)
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    } else {
      // Fallback instruction for browsers without direct prompt API (e.g. Safari iOS or Desktop)
      alert(
        "To install Flying Wonders app:\n\n" +
        "• Chrome / Edge: Click the 'Install' icon in your browser address bar (top right).\n" +
        "• Safari (iOS): Tap the Share button below and select 'Add to Home Screen'."
      )
      handleDismiss()
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('fw_pwa_prompt_dismissed', Date.now().toString())
  }

  if (hidePwaPrompt || !isTargetPage || !isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        width: 'calc(100% - 32px)',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08)',
        padding: '24px',
        fontFamily: 'var(--font-inter), system-ui, -apple-system, sans-serif',
        animation: 'pwaSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        border: '1px solid rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Top Banner Row: Logo, Title & Close X */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Custom Teal/Emerald Icon Box with Phone Icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              backgroundColor: '#0F4C3A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(15, 76, 58, 0.25)'
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
              <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
            </svg>
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.02em' }}>
              Add FlyingWonders
            </h3>
          </div>
        </div>

        {/* Dismiss Close Icon */}
        <button
          onClick={handleDismiss}
          aria-label="Close prompt"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888888',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}
        >
          ✕
        </button>
      </div>

      {/* Description text */}
      <p style={{ margin: '14px 0 16px 0', fontSize: '0.92rem', color: '#555555', lineHeight: 1.5, fontWeight: 400 }}>
        Add to your home screen for quick access, offline support, and a native app experience.
      </p>

      {/* Feature Badges */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <span
          style={{
            backgroundColor: '#E6F4F1',
            color: '#0F4C3A',
            fontSize: '0.78rem',
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: '16px'
          }}
        >
          Offline Mode
        </span>
        <span
          style={{
            backgroundColor: '#E6F4F1',
            color: '#0F4C3A',
            fontSize: '0.78rem',
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: '16px'
          }}
        >
          Quick Access
        </span>
        <span
          style={{
            backgroundColor: '#E6F4F1',
            color: '#0F4C3A',
            fontSize: '0.78rem',
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: '16px'
          }}
        >
          No App Store
        </span>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleDismiss}
          style={{
            flex: 1,
            padding: '12px 18px',
            borderRadius: '14px',
            border: '1px solid #D1D5DB',
            backgroundColor: '#FFFFFF',
            color: '#374151',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Not now
        </button>

        <button
          onClick={handleInstallClick}
          style={{
            flex: 1,
            padding: '12px 18px',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: '#0F4C3A',
            color: '#FFFFFF',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(15, 76, 58, 0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Add
        </button>
      </div>

      <style jsx global>{`
        @keyframes pwaSlideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 40px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  )
}
