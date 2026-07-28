'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Ticket {
  id: string
  name: string
  category: string
  liveRate: number
  markupRate: number
  availability: string
  validity: string
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

  // Booking Modal States
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [bookingDate, setBookingDate] = useState('')
  const [quantity, setQuantity] = useState('1')
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

  // Handle Ticket Booking Order
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket) return

    setBookingError('')
    setBookingStatus('booking')

    try {
      const res = await fetch('/api/attractions-live/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skuId: selectedTicket.id,
          quantity: parseInt(quantity),
          bookingDate: bookingDate,
          customerName: custName,
          customerEmail: custEmail,
          customerPhone: custPhone,
          ticketPrice: selectedTicket.liveRate
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

      {/* Header Panel */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--emerald-secondary) 0%, #061f18 100%)',
        color: 'white',
        padding: '3rem 2.5rem',
        borderRadius: '16px',
        marginBottom: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
        borderLeft: '8px solid var(--gold-accent)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2rem'
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
            Singapore Attractions Live Feed
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', maxWidth: '600px', fontWeight: 300, lineHeight: 1.5 }}>
            Real-time ticketing catalog and net rates integrated directly from attractionsg.com gateway.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.06)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
            <span style={{ display: 'block', opacity: 0.7 }}>Secure B2B Token Profile:</span>
            <strong>{user?.name} ({user?.company})</strong>
          </div>
          <button 
            onClick={() => {
              document.cookie = 'attractions_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
              window.location.reload()
            }}
            className="btn btn-ghost"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '4px' }}
          >
            Disconnect
          </button>
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
            <div key={t.id} className="glass" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', padding: '1.75rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease', justifyContent: 'space-between', minHeight: '340px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', background: 'var(--bg-secondary)', color: 'var(--gold-accent)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🎫 {t.category}
                </span>
                <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.25rem', color: 'var(--text-dark)', marginTop: '0.75rem', marginBottom: '1rem', lineHeight: '1.3' }}>
                  {t.name}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px dashed var(--glass-border)', borderBottom: '1px dashed var(--glass-border)', padding: '0.75rem 0', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ opacity: 0.6 }}>API Live Cost Rate:</span>
                    <strong style={{ color: 'var(--emerald-secondary)' }}>S$ {t.liveRate.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ opacity: 0.6 }}>Suggested Retail Price (SRP):</span>
                    <strong style={{ color: 'var(--crimson-primary)' }}>S$ {t.markupRate.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--emerald-secondary)', fontWeight: 600 }}>⚡ {t.availability}</span>
                  <span style={{ opacity: 0.6 }}>📅 {t.validity}</span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedTicket(t)
                    setBookingStatus('idle')
                    setBookingResult(null)
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.6rem', fontSize: '0.8rem' }}
                >
                  Book E-Ticket 🎟️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MakeMyTrip Style Booking Modal */}
      {selectedTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '540px', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '2.5rem', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
            
            <button 
              onClick={() => setSelectedTicket(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', fontSize: '1.5rem', color: 'var(--text-dark)', cursor: 'pointer', opacity: 0.7 }}
            >
              ✕
            </button>

            {bookingStatus === 'idle' && (
              <>
                <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                  Book Live Tickets
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--gold-accent)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                  {selectedTicket.name}
                </p>

                {bookingError && (
                  <div style={{ background: 'rgba(184,58,75,0.1)', color: 'var(--crimson-primary)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(184,58,75,0.2)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    ⚠️ {bookingError}
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-dark)' }}>Travel Date</label>
                      <input 
                        type="date" required
                        value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-dark)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-dark)' }}>Ticket Quantity</label>
                      <input 
                        type="number" required min={1} max={50}
                        value={quantity} onChange={e => setQuantity(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-dark)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-dark)' }}>Traveler Name</label>
                    <input 
                      type="text" required placeholder="John Doe"
                      value={custName} onChange={e => setCustName(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-dark)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-dark)' }}>Traveler Email</label>
                      <input 
                        type="email" required placeholder="johndoe@email.com"
                        value={custEmail} onChange={e => setCustEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-dark)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-dark)' }}>Traveler Mobile</label>
                      <input 
                        type="text" required placeholder="+91 99999 99999"
                        value={custPhone} onChange={e => setCustPhone(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-dark)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>Est. Total (Live Rate):</span>
                    <strong style={{ color: 'var(--emerald-secondary)', fontSize: '1.25rem' }}>S$ {(selectedTicket.liveRate * parseInt(quantity || '0')).toFixed(2)}</strong>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
                  >
                    Confirm Purchase (B2B Credits) ✈️
                  </button>
                </form>
              </>
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
                    className="btn btn-ghost"
                    style={{ width: '100%', padding: '0.75rem', borderColor: 'var(--glass-border)' }}
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
