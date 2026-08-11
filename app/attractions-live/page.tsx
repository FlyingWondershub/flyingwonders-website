'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SubTicket {
  skuId: string
  typeTitle: string
  badgeLabel?: string
  price: number
  retailPrice: number
  msp?: number | null
  bookingType: string
  validityPeriodText?: string
  minQty: number
  maxQty: number
  remainingStock?: number
  isSoldOut?: boolean
  availableDates?: { [dateStr: string]: { price: number; available: boolean; remaining: number } }
}

interface Ticket {
  id: string
  attractionSku: string
  name: string
  category: string
  imageUrl?: string
  liveRate: number
  markupRate: number
  availability: string
  validity: string
  description?: string
  tnc?: string
  subTickets: SubTicket[]
}

export default function AttractionsLivePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<{ name: string; email: string; company: string } | null>(null)

  // Auth Forms
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [debugOtp, setDebugOtp] = useState<string | null>(null)
  
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'pending'>('idle')
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')

  // Tickets List
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [loadingTickets, setLoadingTickets] = useState(false)

  // Booking Modal & Cart States
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [modalStep, setModalStep] = useState<'options' | 'checkout'>('options')
  const [cartItems, setCartItems] = useState<Array<{
    id: string
    attractionName: string
    attractionSku: string
    skuId: string
    title: string
    badgeLabel?: string
    price: number
    quantity: number
    bookingDate: string
  }>>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [bookingDate, setBookingDate] = useState<string>('')
  const [quantities, setQuantities] = useState<{ [skuId: string]: number }>({})
  const [custName, setCustName] = useState('')
  const [custEmail, setCustEmail] = useState('')
  const [custPhone, setCustPhone] = useState('')
  
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success' | 'error'>('idle')
  const [bookingResult, setBookingResult] = useState<any | null>(null)
  const [bookingError, setBookingError] = useState('')

  // Check auth session on load
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/attractions-auth/check')
        const data = await res.json()
        if (res.ok && data.authenticated) {
          setIsAuthenticated(true)
          setUser(data.user)
          fetchTickets()
        } else {
          setIsAuthenticated(false)
        }
      } catch (err) {
        setIsAuthenticated(false)
      }
    }
    checkSession()
  }, [])

  // Fetch Tickets
  const fetchTickets = async () => {
    setLoadingTickets(true)
    try {
      const res = await fetch('/api/attractions-live')
      const data = await res.json()
      if (res.ok && data.tickets) {
        setTickets(data.tickets)
      }
    } catch (err) {
      console.error('Failed to load live tickets:', err)
    } finally {
      setLoadingTickets(false)
    }
  }

  // Handle Login/Signup submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthMessage('')
    setAuthStatus('loading')

    try {
      const res = await fetch('/api/attractions-auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, company })
      })
      const data = await res.json()

      if (res.ok) {
        if (data.pending) {
          setAuthStatus('pending')
          setAuthMessage(data.message)
        } else {
          setOtpSent(true)
          setAuthStatus('success')
          if (data.debugOtp) {
            setDebugOtp(data.debugOtp)
          }
        }
      } else {
        if (res.status === 404) {
          setIsRegistering(true)
          setAuthStatus('idle')
          setAuthError("Email not registered. Please fill out details below to request portal access.")
        } else {
          throw new Error(data.error || 'Failed to send OTP')
        }
      }
    } catch (err: any) {
      setAuthStatus('idle')
      setAuthError(err.message || 'Something went wrong')
    }
  }

  // Verify OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthStatus('loading')

    try {
      const res = await fetch('/api/attractions-auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setIsAuthenticated(true)
        setUser(data.user)
        fetchTickets()
      } else {
        throw new Error(data.error || 'Verification failed')
      }
    } catch (err: any) {
      setAuthStatus('idle')
      setAuthError(err.message || 'Invalid code')
    }
  }

  // Handle Ticket Booking Order (Cebu Options Style)
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket) return

    // Find selected sub-tickets with quantity > 0
    const selectedItems = selectedTicket.subTickets.filter(st => (quantities[st.skuId] || 0) > 0)

    if (selectedItems.length === 0) {
      setBookingError('Please select at least 1 Adult or Child ticket quantity.')
      return
    }

    setBookingError('')
    setBookingStatus('booking')

    try {
      // Process first selected sub-ticket item (or loop if multiple)
      const targetItem = selectedItems[0]
      const qty = quantities[targetItem.skuId] || 1

      const res = await fetch('/api/attractions-live/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skuId: targetItem.skuId,
          quantity: qty,
          bookingDate: bookingDate,
          customerName: custName,
          customerEmail: custEmail,
          customerPhone: custPhone,
          ticketPrice: targetItem.price
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setBookingStatus('success')
        setBookingResult(data)
      } else {
        throw new Error(data.error || 'Failed to complete order booking.')
      }
    } catch (err: any) {
      setBookingStatus('error')
      setBookingError(err.message || 'Payment or Booking failed.')
    }
  }

  // Filter Categories
  const categories = ['All', ...Array.from(new Set(tickets.map(t => t.category)))]
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat = activeCategory === 'All' || t.category === activeCategory
    return matchesSearch && matchesCat
  })

  // Loading Session State
  if (isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--gold-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.2rem', color: 'var(--text-dark)' }}>Verifying Portal Access...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Render Login/Sign-up card if unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', position: 'relative' }}>
        
        {/* Centered Global Watermark Banner */}
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-25deg)',
          background: 'rgba(184, 58, 75, 0.15)',
          color: 'rgba(184, 58, 75, 0.35)',
          border: '4px dashed rgba(184, 58, 75, 0.25)',
          padding: '2rem 6rem',
          fontSize: '3rem',
          fontWeight: 900,
          letterSpacing: '0.1em',
          zIndex: 9999,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          userSelect: 'none',
          fontFamily: 'var(--font-inter), sans-serif'
        }}>
          Testing in Progress
        </div>

        <div className="glass" style={{ width: '100%', maxWidth: '480px', padding: '3rem 2.5rem', borderRadius: '16px', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-xl)', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2rem', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', lineHeight: 1.2 }}>
              Flying Wonders
            </span>
            <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.75rem', color: 'var(--gold-accent)', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginTop: '4px' }}>
              Live Attractions API Gateway
            </span>
          </div>

          {authError && (
            <div style={{ background: 'rgba(184, 58, 75, 0.1)', color: 'var(--crimson-primary)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(184, 58, 75, 0.2)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              ⚠️ {authError}
            </div>
          )}

          {authStatus === 'pending' && (
            <div style={{ background: 'rgba(197, 168, 128, 0.1)', color: 'var(--gold-accent)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(197, 168, 128, 0.3)', fontSize: '0.9rem', textAlign: 'center' }}>
              ⏳ {authMessage}
            </div>
          )}

          {authStatus !== 'pending' && !otpSent && (
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Email Address</label>
                <input 
                  type="email" required placeholder="name@agency.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-dark)' }}
                />
              </div>

              {isRegistering && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Full Name</label>
                    <input 
                      type="text" required placeholder="John Doe"
                      value={name} onChange={e => setName(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-dark)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Travel Agency / Company</label>
                    <input 
                      type="text" required placeholder="Wanderlust Travels"
                      value={company} onChange={e => setCompany(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-dark)' }}
                    />
                  </div>
                </>
              )}

              <button 
                type="submit" 
                disabled={authStatus === 'loading'}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
              >
                {authStatus === 'loading' ? 'Processing...' : isRegistering ? 'Submit Access Request' : 'Access Live Rates Gateway 🔑'}
              </button>
            </form>
          )}

          {otpSent && (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center', background: 'rgba(15,76,58,0.06)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(15,76,58,0.15)', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--emerald-secondary)' }}>Verification code has been dispatched to:</span>
                <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--crimson-primary)', marginTop: '0.25rem' }}>{email}</strong>
              </div>

              {debugOtp && (
                <div style={{ background: '#FFEBEB', border: '1px solid #FFC5C5', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', fontSize: '0.85rem', color: '#B83A4B' }}>
                  ⚙️ Developer Debug Code: <strong>{debugOtp}</strong>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-dark)', textAlign: 'center' }}>Enter 6-Digit OTP</label>
                <input 
                  type="text" required placeholder="123456" maxLength={6}
                  value={otpCode} onChange={e => setOtpCode(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '2px solid var(--gold-accent)', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.3em', fontWeight: 700, background: 'var(--bg-secondary)', color: 'var(--text-dark)' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={authStatus === 'loading'}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
              >
                {authStatus === 'loading' ? 'Verifying...' : 'Verify Access Token'}
              </button>
            </form>
          )}

        </div>
      </div>
    )
  }

  // Render Authenticated Dashboard
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', position: 'relative' }}>
      
      {/* Centered Global Watermark Banner */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-25deg)',
        background: 'rgba(184, 58, 75, 0.15)',
        color: 'rgba(184, 58, 75, 0.35)',
        border: '4px dashed rgba(184, 58, 75, 0.25)',
        padding: '2rem 6rem',
        fontSize: '3rem',
        fontWeight: 900,
        letterSpacing: '0.1em',
        zIndex: 9999,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        userSelect: 'none',
        fontFamily: 'var(--font-inter), sans-serif'
      }}>
        Testing in Progress
      </div>

      {/* Header Panel (Compact) */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--emerald-secondary) 0%, #061f18 100%)',
        color: 'white',
        padding: '1.5rem 2rem',
        borderRadius: '14px',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        borderLeft: '6px solid var(--gold-accent)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.6rem', marginBottom: '0.2rem', letterSpacing: '0.02em' }}>
            Singapore Attractions Live Feed
          </h2>
          <p style={{ opacity: 0.85, fontSize: '0.85rem', maxWidth: '580px', fontWeight: 300, lineHeight: 1.4, margin: 0 }}>
            Real-time ticketing catalog and net rates integrated directly from attractionsg.com gateway.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#FFF', padding: '0.6rem 1.1rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            🛒 Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'rgba(255,255,255,0.08)', padding: '0.65rem 1.15rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ textAlign: 'right', fontSize: '0.78rem' }}>
              <span style={{ display: 'block', opacity: 0.7, fontSize: '0.7rem' }}>B2B Token Profile</span>
              <strong>{user?.name} ({user?.company})</strong>
            </div>
            <button 
              onClick={() => {
                document.cookie = 'attractions_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
                window.location.reload()
              }}
              className="btn btn-ghost"
              style={{ padding: '0.35rem 0.7rem', fontSize: '0.72rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.3)', color: '#FFF' }}
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="glass" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderRadius: '12px', marginBottom: '2.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
        <input 
          type="text" placeholder="🔍 Search live attractions catalog..."
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-main)', color: 'var(--text-dark)', flexGrow: 1, maxWidth: '400px', fontSize: '0.9rem' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`btn ${activeCategory === cat ? 'btn-primary' : 'glass'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Feed Grid */}
      {loadingTickets ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div style={{ width: '40px', height: '40px', margin: '0 auto 1.5rem', border: '3px solid var(--gold-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ opacity: 0.7 }}>Querying attractionsg.com live pricing feeds...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {filteredTickets.map(t => (
            <div key={t.id} className="glass" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease', overflow: 'hidden', justifyContent: 'space-between' }}>
              <div>
                {/* Top Attraction Image Header */}
                <div style={{ width: '100%', height: '180px', background: '#F1F5F9', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={t.imageUrl || '/images/logo.png'} 
                    alt={t.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', '/images/logo.png')
                    }}
                  />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', background: 'rgba(0,0,0,0.75)', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '10px', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                      🎫 {t.category}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '1.25rem 1.5rem 0' }}>
                  <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.15rem', color: 'var(--text-dark)', marginBottom: '1rem', lineHeight: '1.35', minHeight: '2.7em' }}>
                    {t.name}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px dashed var(--glass-border)', borderBottom: '1px dashed var(--glass-border)', padding: '0.75rem 0', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.8rem', opacity: 0.65 }}>Net Cost Rate:</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--emerald-secondary)', fontWeight: 800 }}>SGD {t.liveRate.toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.78rem', opacity: 0.5 }}>Retail Price (RP):</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--crimson-primary)', textDecoration: 'line-through', opacity: 0.8 }}>SGD {t.markupRate.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                  <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⚡ {t.availability}
                  </span>
                  <span style={{ opacity: 0.6 }}>📅 {t.validity}</span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedTicket(t)
                    setBookingStatus('idle')
                    setBookingResult(null)
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '8px' }}
                >
                  Book E-Ticket 🎟️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MakeMyTrip / Cebu Style Full Detail & Booking Modal */}
      {selectedTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.65)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', overflowY: 'auto' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '1100px', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '2rem', boxShadow: 'var(--shadow-xl)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <button 
              onClick={() => setSelectedTicket(null)}
              title="Close Window"
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#0F172A', border: '1px solid #334155', width: '38px', height: '38px', borderRadius: '50%', fontSize: '1.1rem', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              ✕
            </button>

            {bookingStatus === 'idle' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
                {/* Left Panel: Attraction Image, Title, Description & T&C */}
                <div>
                  <div style={{ width: '100%', height: '300px', borderRadius: '14px', overflow: 'hidden', background: '#F1F5F9', marginBottom: '1.25rem' }}>
                    <img 
                      src={selectedTicket.imageUrl || '/images/logo.png'} 
                      alt={selectedTicket.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute('src', '/images/logo.png')
                      }}
                    />
                  </div>

                  <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '0.4rem', lineHeight: '1.3' }}>
                    {selectedTicket.name}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', fontFamily: 'monospace', marginBottom: '1.25rem' }}>
                    SKU: {selectedTicket.attractionSku}
                  </div>

                  {/* Attraction Description Section */}
                  {selectedTicket.description && (
                    <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Overview & Details</h4>
                      <style>{`
                        .supplier-desc-html span[style*="background"],
                        .supplier-desc-html mark,
                        .supplier-desc-html p[style*="background"] {
                          background-color: transparent !important;
                          color: inherit !important;
                        }
                      `}</style>
                      <div 
                        className="supplier-desc-html"
                        dangerouslySetInnerHTML={{ __html: selectedTicket.description }}
                        style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}
                      />
                    </div>
                  )}

                  {/* Terms & Conditions Section */}
                  {selectedTicket.tnc && (
                    <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '1rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Terms & Conditions</h4>
                      <div 
                        dangerouslySetInnerHTML={{ __html: selectedTicket.tnc }}
                        style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.5', maxHeight: '180px', overflowY: 'auto' }}
                      />
                    </div>
                  )}
                </div>

                {/* Right Panel: Options / Checkout Sidebar */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {bookingError && (
                      <div style={{ background: 'rgba(184,58,75,0.1)', color: 'var(--crimson-primary)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(184,58,75,0.2)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                        ⚠️ {bookingError}
                      </div>
                    )}

                {modalStep === 'options' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {/* Select Date Section (Only rendered for fixed_date tickets) */}
                    {selectedTicket.subTickets?.some(st => st.bookingType === 'fixed_date') && (
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.4rem' }}>Options</h4>
                        <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.3rem' }}>Select Date</label>
                        <input 
                          type="date" required
                          value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'var(--bg-main)', color: 'var(--text-dark)', fontSize: '0.95rem' }}
                        />
                      </div>
                    )}

                    {/* Select Ticket(s) Stacked List */}
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        {selectedTicket.subTickets?.every(st => st.bookingType === 'open_date') ? 'Options' : 'Select ticket(s)'}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                        {selectedTicket.subTickets?.map((st) => {
                          const currentQty = quantities[st.skuId] || 0
                          const isOpenDate = st.bookingType === 'open_date'

                          // Normalize date string to YYYY-MM-DD for map lookup (if fixed_date)
                          const formattedDate = bookingDate ? (bookingDate.includes('/') ? bookingDate.split('/').reverse().join('-') : bookingDate) : ''
                          const dateInfo = (!isOpenDate && formattedDate && st.availableDates) ? st.availableDates[formattedDate] : null
                          
                          // Determine stock and sold out status
                          const isSoldOutForDate = isOpenDate 
                            ? (st.isSoldOut || false)
                            : (bookingDate && st.availableDates ? (dateInfo ? (!dateInfo.available || dateInfo.remaining === 0) : true) : (st.isSoldOut || false))
                          
                          const effectivePrice = dateInfo ? dateInfo.price : st.price
                          const effectiveStock = dateInfo ? dateInfo.remaining : (isOpenDate ? 999 : (st.remainingStock ?? 20))

                          return (
                            <div key={st.skuId} style={{ background: 'var(--bg-main)', border: '1px solid #E2E8F0', padding: '1rem 1.25rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                                  {st.badgeLabel && (
                                    <strong style={{ fontSize: '0.85rem', color: '#1E293B', fontWeight: 800 }}>
                                      {st.badgeLabel}
                                    </strong>
                                  )}
                                </div>
                                <h5 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: '1.35' }}>
                                  {st.typeTitle}
                                </h5>
                                <div style={{ fontSize: '0.72rem', opacity: 0.5, fontFamily: 'monospace', marginTop: '0.2rem' }}>
                                  {st.skuId}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem', fontWeight: 500 }}>
                                  RP SGD{st.retailPrice.toFixed(2)}
                                </div>
                                {st.validityPeriodText && (
                                  <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.2rem', fontWeight: 400 }}>
                                    {st.validityPeriodText}
                                  </div>
                                )}
                                {st.msp && (
                                  <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem', fontWeight: 400 }}>
                                    MSP ${st.msp.toFixed(2)}
                                  </div>
                                )}
                              </div>

                              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                                  ${effectivePrice.toFixed(2)}
                                </div>

                                {/* Plus / Minus Counter Controls & Stock Status */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '6px', overflow: 'hidden', background: '#FFF', opacity: isSoldOutForDate ? 0.5 : 1 }}>
                                    <button
                                      type="button"
                                      disabled={isSoldOutForDate}
                                      onClick={() => setQuantities(prev => ({ ...prev, [st.skuId]: Math.max(0, (prev[st.skuId] || 0) - 1) }))}
                                      style={{ padding: '0.3rem 0.75rem', border: 'none', background: '#F1F5F9', cursor: isSoldOutForDate ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem' }}
                                    >
                                      -
                                    </button>
                                    <span style={{ padding: '0.3rem 0.85rem', fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', minWidth: '32px', textAlign: 'center' }}>
                                      {currentQty}
                                    </span>
                                    <button
                                      type="button"
                                      disabled={isSoldOutForDate || currentQty >= effectiveStock}
                                      onClick={() => setQuantities(prev => ({ ...prev, [st.skuId]: Math.min(effectiveStock, (prev[st.skuId] || 0) + 1) }))}
                                      style={{ padding: '0.3rem 0.75rem', border: 'none', background: '#F1F5F9', cursor: (isSoldOutForDate || currentQty >= effectiveStock) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem' }}
                                    >
                                      +
                                    </button>
                                  </div>

                                  {/* Stock Badge: Remaining: XX (Green) or Sold out (Red) below counter */}
                                  {isSoldOutForDate ? (
                                    <div style={{ width: '100%', background: '#DC2626', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 800, textAlign: 'center', padding: '0.2rem 0.5rem', borderRadius: '4px', marginTop: '0.1rem' }}>
                                      Sold out
                                    </div>
                                  ) : (
                                    <div style={{ width: '100%', background: '#16A34A', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 800, textAlign: 'center', padding: '0.2rem 0.5rem', borderRadius: '4px', marginTop: '0.1rem' }}>
                                      Remaining: {effectiveStock}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Total Calculation & Action Buttons (Add to Cart / Buy Now) */}
                    {(() => {
                      const totalCost = selectedTicket.subTickets?.reduce((sum, st) => sum + (st.price * (quantities[st.skuId] || 0)), 0) || 0
                      return (
                        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                            Total: <strong style={{ color: '#0F172A' }}>SGD{totalCost.toFixed(2)}</strong>
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                              type="button"
                              onClick={() => {
                                const selectedItems = selectedTicket.subTickets.filter(st => (quantities[st.skuId] || 0) > 0)
                                const requiresDate = selectedTicket.subTickets.some(st => st.bookingType === 'fixed_date')
                                if (requiresDate && !bookingDate) {
                                  setBookingError('Please select a travel date first.')
                                  return
                                }
                                if (selectedItems.length === 0) {
                                  setBookingError('Please select at least 1 ticket quantity.')
                                  return
                                }
                                setBookingError('')
                                
                                // Append selected items to cart
                                const newCartEntries = selectedItems.map(st => ({
                                  id: `${st.skuId}-${bookingDate || 'open'}-${Date.now()}`,
                                  attractionName: selectedTicket.name,
                                  attractionSku: selectedTicket.attractionSku,
                                  skuId: st.skuId,
                                  title: st.typeTitle,
                                  badgeLabel: st.badgeLabel,
                                  price: st.price,
                                  quantity: quantities[st.skuId] || 1,
                                  bookingDate: bookingDate || 'Open Date'
                                }))

                                setCartItems(prev => [...prev, ...newCartEntries])
                                setSelectedTicket(null)
                                setIsCartOpen(true)
                              }}
                              style={{ flex: 1, padding: '0.75rem', border: '1px solid #3B82F6', color: '#2563EB', background: '#EFF6FF', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                              Add to Cart
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const selectedItems = selectedTicket.subTickets.filter(st => (quantities[st.skuId] || 0) > 0)
                                const requiresDate = selectedTicket.subTickets.some(st => st.bookingType === 'fixed_date')
                                if (requiresDate && !bookingDate) {
                                  setBookingError('Please select a travel date first.')
                                  return
                                }
                                if (selectedItems.length === 0) {
                                  setBookingError('Please select at least 1 ticket quantity.')
                                  return
                                }
                                setBookingError('')
                                setModalStep('checkout')
                              }}
                              style={{ flex: 1, padding: '0.75rem', border: 'none', color: '#FFFFFF', background: '#22C55E', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(34,197,94,0.3)' }}
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  /* Step 2: Traveler Information & Confirmation */
                  <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <button 
                        type="button" 
                        onClick={() => setModalStep('options')} 
                        style={{ background: 'transparent', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                      >
                        ← Back to Options
                      </button>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.75rem' }}>Lead Traveler Information</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-dark)' }}>Lead Guest Full Name *</label>
                          <input 
                            type="text" required placeholder="John Doe"
                            value={custName} onChange={e => setCustName(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'var(--bg-main)', color: 'var(--text-dark)', fontSize: '0.9rem' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-dark)' }}>Guest Email *</label>
                            <input 
                              type="email" required placeholder="johndoe@email.com"
                              value={custEmail} onChange={e => setCustEmail(e.target.value)}
                              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'var(--bg-main)', color: 'var(--text-dark)', fontSize: '0.9rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-dark)' }}>Guest Mobile *</label>
                            <input 
                              type="text" required placeholder="+91 99999 99999"
                              value={custPhone} onChange={e => setCustPhone(e.target.value)}
                              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'var(--bg-main)', color: 'var(--text-dark)', fontSize: '0.9rem' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary Box */}
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Travel Date: <strong>{bookingDate}</strong></div>
                      {(() => {
                        const totalCost = selectedTicket.subTickets?.reduce((sum, st) => sum + (st.price * (quantities[st.skuId] || 0)), 0) || 0
                        return (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Total B2B Net Cost:</span>
                            <strong style={{ color: 'var(--emerald-secondary)', fontSize: '1.3rem', fontWeight: 800 }}>SGD {totalCost.toFixed(2)}</strong>
                          </div>
                        )
                      })()}
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.85rem', fontWeight: 700, borderRadius: '8px', background: '#22C55E', color: '#FFF', border: 'none' }}
                    >
                      Confirm Purchase & Generate Vouchers ✈️
                    </button>
                  </form>
                )}
                  </div>
                </div>
              </div>
            )}

            {bookingStatus === 'booking' && (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ width: '40px', height: '40px', margin: '0 auto 1.5rem', border: '3px solid var(--gold-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Processing Live Booking...</h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Confirming B2B reseller credits & generating secure PDF tickets...</p>
              </div>
            )}

            {bookingStatus === 'success' && bookingResult && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🎉</span>
                <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.6rem', color: 'var(--emerald-secondary)', marginBottom: '0.5rem' }}>Booking Confirmed!</h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>Your tickets have been successfully generated and B2B credits processed.</p>

                <div style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--glass-border)', padding: '1rem', borderRadius: '8px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.85rem' }}>
                  <div><strong>Order Reference:</strong> {bookingResult.orderRefId}</div>
                  <div><strong>Tracking Reference:</strong> {bookingResult.trackingNo}</div>
                  <div><strong>Total Amount Paid:</strong> S$ {bookingResult.total}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {bookingResult.vouchers && bookingResult.vouchers.map((v: any, idx: number) => (
                    <a 
                      key={idx}
                      href={v.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.8rem', fontWeight: 700 }}
                    >
                      Download PDF E-Voucher #{idx + 1} 🎟️
                    </a>
                  ))}
                  <button 
                    onClick={() => setSelectedTicket(null)}
                    style={{ width: '100%', padding: '0.85rem', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#0F172A', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
                  >
                    Close Window ✕
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Slide-Over Shopping Cart Drawer Modal */}
      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 10005, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-main)', height: '100%', boxShadow: '-4px 0 20px rgba(0,0,0,0.2)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.4rem', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🛒 Shopping Cart
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1rem', color: '#0F172A', cursor: 'pointer', fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🛍️</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>Your cart is empty</h4>
                  <p style={{ fontSize: '0.85rem' }}>Select tickets from the catalog to add them to your order cart.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
                  {cartItems.map((item, idx) => (
                    <div key={item.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setCartItems(prev => prev.filter((_, i) => i !== idx))}
                        style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                      >
                        Remove
                      </button>

                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {item.attractionName}
                      </div>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0' }}>
                        {item.title} {item.badgeLabel}
                      </h5>
                      <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '0.5rem' }}>
                        Date: <strong>{item.bookingDate}</strong> | Qty: <strong>{item.quantity}</strong>
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#16A34A' }}>
                        SGD {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Cart Total Net Cost:</span>
                  <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16A34A' }}>
                    SGD {cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (cartItems.length === 0) return
                    // Populate selectedTicket structure from cart for checkout step
                    const firstCartItem = cartItems[0]
                    setSelectedTicket({
                      id: firstCartItem.id,
                      attractionSku: firstCartItem.attractionSku,
                      name: firstCartItem.attractionName,
                      category: 'Sightseeing',
                      liveRate: firstCartItem.price,
                      markupRate: firstCartItem.price,
                      availability: 'Instant Confirmation',
                      validity: 'Fixed Date',
                      subTickets: cartItems.map(c => ({
                        skuId: c.skuId,
                        typeTitle: c.title,
                        badgeLabel: c.badgeLabel,
                        price: c.price,
                        retailPrice: c.price,
                        bookingType: c.bookingDate === 'Open Date' ? 'open_date' : 'fixed_date',
                        minQty: 1,
                        maxQty: 50
                      }))
                    })

                    // Set quantities map from cart
                    const cartQtyMap: { [skuId: string]: number } = {}
                    cartItems.forEach(c => {
                      cartQtyMap[c.skuId] = c.quantity
                    })
                    setQuantities(cartQtyMap)

                    // Set travel date from first item if available
                    if (firstCartItem.bookingDate && firstCartItem.bookingDate !== 'Open Date') {
                      setBookingDate(firstCartItem.bookingDate)
                    }

                    setIsCartOpen(false)
                    setModalStep('checkout')
                  }}
                  style={{ width: '100%', padding: '0.9rem', background: '#22C55E', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}
                >
                  Checkout Cart Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)}) 🚀
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
