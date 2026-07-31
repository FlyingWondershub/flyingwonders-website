'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import ChatBot from './ChatBot'

interface LayoutSettings {
  contactEmail: string
  officeAddress: string
  whatsappNumber: string
  youtubeUrl: string
  instagramUrl: string
  facebookUrl: string
  contactPhoneSingapore: string
  contactPhoneIndia: string
}

interface PageVisibility {
  hideInstantQuote?: boolean
  hideCustomPackage?: boolean
  hideSingaporeAttractions?: boolean
  hidePackages?: boolean
  hideBrochure?: boolean
  hideReviews?: boolean
  hideBlog?: boolean
  hideContact?: boolean
  hideChatbot?: boolean
  hideFaq?: boolean
}

export default function LayoutWrapper({ 
  children,
  initialSettings,
  pageVisibility
}: { 
  children: React.ReactNode
  initialSettings?: LayoutSettings
  pageVisibility?: PageVisibility
}) {
  const pathname = usePathname()
  
  const [subEmail, setSubEmail] = useState('')
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [subMessage, setSubMessage] = useState('')
  const [hideNavBar, setHideNavBar] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Prevent triggering at the top
      if (currentScrollY <= 80) {
        setHideNavBar(false)
        lastScrollY.current = currentScrollY
        return
      }

      // Prevent triggering/flickering at the bottom (within 120px)
      if (currentScrollY + windowHeight >= documentHeight - 120) {
        lastScrollY.current = currentScrollY
        return
      }

      if (currentScrollY > lastScrollY.current) {
        setHideNavBar(true)
      } else {
        setHideNavBar(false)
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubStatus('loading')
    setSubMessage('')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setSubStatus('success')
        setSubMessage(data.message)
        setSubEmail('')
      } else {
        throw new Error(data.error || 'Failed to subscribe')
      }
    } catch (err: any) {
      setSubStatus('error')
      setSubMessage(err.message || 'Something went wrong. Try again.')
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // If we are in Sanity Studio or rendering the brochure, render children without header/footer
  if (pathname?.startsWith('/studio') || pathname === '/brochure') {
    return <>{children}</>
  }

  return (
    <>
      <header className="main-header">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
          
          {/* Top Brand Logo Section */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
            <img 
              src="/images/logo.png" 
              alt="Flying Wonders Logo" 
              style={{ 
                height: '48px', 
                width: 'auto', 
                borderRadius: '50%', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '2px solid var(--gold-accent)'
              }} 
            />
            <span style={{ 
              fontFamily: 'var(--font-playfair), serif', 
              fontSize: '2.1rem', 
              fontWeight: 400, 
              color: 'var(--text-dark)', 
              letterSpacing: '0.22em', 
              lineHeight: 1.1,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}>
              Flying Wonders
            </span>
          </Link>

          {/* Bottom Menu & Action Bar */}
          <div className={`mobile-hide-nav-container ${hideNavBar ? 'mobile-hide-nav' : ''}`} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '0.15rem', paddingBottom: '0.15rem', flexWrap: 'wrap', gap: '0.75rem', transition: 'all 0.3s ease' }}>
            
            {/* Left Action: Agent Portal */}
            <div style={{ flex: '1 0 150px', display: 'flex', alignItems: 'center' }}>
              {!pageVisibility?.hideCustomPackage && (
                <Link href="/custom-package" className="nav-link" style={{ color: 'var(--emerald-secondary)', fontWeight: 700, fontSize: '0.85rem' }}>
                  🔑 Agent Login
                </Link>
              )}
            </div>

            {/* Center Navigation Links */}
            <nav className="nav-menu" style={{ display: 'flex', gap: '1.25rem', margin: 0, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/" className="nav-link">Home</Link>
              {!pageVisibility?.hidePackages && <Link href="/packages" className="nav-link">Packages</Link>}
              {!pageVisibility?.hideInstantQuote && <Link href="/instant-quote" className="nav-link">Instant Quote</Link>}
              <Link href="/about" className="nav-link">About Us</Link>
              <Link href="/travel-tools" className="nav-link">Travel Tools</Link>
              <Link href="/corporate-travel" className="nav-link">Corporate Desk</Link>
              {!pageVisibility?.hideReviews && <Link href="/reviews" className="nav-link">Reviews</Link>}
              {!pageVisibility?.hideBlog && <Link href="/blog" className="nav-link">Blog</Link>}
              {!pageVisibility?.hideContact && <Link href="/contact" className="nav-link">Contact</Link>}
            </nav>

            {/* Right Action: Call to Action */}
            <div style={{ flex: '1 0 150px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Link href="/packages" className="btn btn-primary nav-cta" style={{ margin: 0, padding: '0.25rem 1rem', fontSize: '0.85rem' }}>
                Book Now
              </Link>
            </div>

          </div>

        </div>
      </header>

      <main style={{ minHeight: '80vh' }}>
        {children}
      </main>

      <footer style={{ background: 'var(--bg-dark)', color: 'var(--text-light)', padding: '6rem 0 2rem 0', marginTop: '4rem', borderTop: '4px solid var(--emerald-secondary)' }}>
        <div className="container">
          {/* Lead Magnet Section */}
          <div style={{ background: 'linear-gradient(135deg, var(--crimson-primary) 0%, #4a0000 100%)', padding: '4rem 2rem', borderRadius: '16px', marginBottom: '4rem', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>Unlock the Singapore Insider Guide.</h3>
            <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
              Get exclusive itineraries, investment reports, and hidden local gems delivered weekly.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '1rem', maxWidth: '500px', margin: '0 auto', flexWrap: 'wrap' }}>
              <input 
                type="email" 
                placeholder="Your elite email address" 
                required
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                style={{ flexGrow: 1, padding: '1rem 1.5rem', borderRadius: '4px', border: 'none', fontSize: '1rem', minWidth: '250px', color: '#111' }} 
              />
              <button 
                type="submit" 
                disabled={subStatus === 'loading'}
                style={{ background: 'var(--gold-accent)', color: '#111', fontWeight: 700, padding: '1rem 2.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {subStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {subMessage && (
              <p style={{ 
                color: subStatus === 'success' ? 'var(--gold-accent)' : '#FFF5F5', 
                fontSize: '0.9rem', 
                marginTop: '1.25rem', 
                fontWeight: 600,
                textAlign: 'center'
              }}>
                {subStatus === 'success' ? `✅ ${subMessage}` : `⚠️ ${subMessage}`}
              </p>
            )}
          </div>

          {/* Standard Footer Links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ color: 'var(--gold-accent)', marginBottom: '1rem', fontSize: '1.5rem' }}>Flying Wonders</h3>
              <p style={{ opacity: 0.8, fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
                {initialSettings?.officeAddress || '#74, 4th Cross, SBM Colony,\nBSK 1st Stage, Bangalore, India - 560050'}
              </p>
            </div>
            <div>
              <h3 style={{ color: 'var(--gold-accent)', marginBottom: '1rem', fontSize: '1.5rem' }}>Contact</h3>
              <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                Mobile: {initialSettings?.contactPhoneSingapore || '+65 94722830'} / {initialSettings?.contactPhoneIndia || '+91 9886171251'}<br />
                Email: {initialSettings?.contactEmail || 'info.flyingwonders@gmail.com'}
              </p>
            </div>
            <div>
              <h3 style={{ color: 'var(--gold-accent)', marginBottom: '1rem', fontSize: '1.5rem' }}>Follow Us</h3>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--emerald-secondary)' }}>
                {initialSettings?.youtubeUrl && <a href={initialSettings.youtubeUrl} target="_blank" rel="noreferrer" style={{ transition: 'color 0.2s' }}>YouTube</a>}
                {initialSettings?.instagramUrl && <a href={initialSettings.instagramUrl} target="_blank" rel="noreferrer" style={{ transition: 'color 0.2s' }}>Instagram</a>}
                {initialSettings?.facebookUrl && <a href={initialSettings.facebookUrl} target="_blank" rel="noreferrer" style={{ transition: 'color 0.2s' }}>Facebook</a>}
              </div>
            </div>
          </div>
        </div>
        <div className="container" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <span>© {new Date().getFullYear()} Flying Wonders Pvt Ltd. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {!pageVisibility?.hideFaq && <Link href="/faq" style={{ textDecoration: 'underline', color: '#FFF' }}>FAQ</Link>}
            <Link href="/privacy" style={{ textDecoration: 'underline', color: '#FFF' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ textDecoration: 'underline', color: '#FFF' }}>Terms of Service</Link>
            <Link href="/refund" style={{ textDecoration: 'underline', color: '#FFF' }}>Refund & Cancellation</Link>
          </div>
        </div>
      </footer>

      <button onClick={scrollToTop} className="scroll-top-float" aria-label="Scroll to Top">
        ▲
      </button>

      <a href={`https://wa.me/${(initialSettings?.whatsappNumber || '919886171251').replace(/[^0-9]/g, '')}`} className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
        <svg viewBox="0 0 32 32" width="24" height="24" fill="currentColor">
          <path d="M16 2a13 13 0 0 0-11 20l-2 7 7-2a13 13 0 1 0 6-25zM16 26a11 11 0 0 1-6-2l-1-1-4 1 1-4-1-1a11 11 0 1 1 11 7z"></path>
          <path d="M21 21c-1 1-2 1-3 1-3-1-6-4-7-7 0-1 0-2 1-3l2-1h1l2 3v1l-1 2c1 2 3 4 5 5l2-1h1l2 2v2z"></path>
        </svg>
      </a>

      <ChatBot hideChatbot={pageVisibility?.hideChatbot} />
    </>
  )
}
