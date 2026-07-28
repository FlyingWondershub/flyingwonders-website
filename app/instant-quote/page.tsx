'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Destination {
  id: number
  name: string
  country: string
}

interface Zone {
  id: number
  code: string
  name: string
  zone_type: string
}

interface Hotel {
  hotel_id: number
  name: string
  star_rating: number
  category: string
  address: string
  city: string
  amenities: string[]
  lead_price: number
  currency: string
}

interface Tour {
  tour_id: number
  name: string
  category: string
  short_description: string
  lead_price: number
  currency: string
  instant_confirmation: boolean
  mobile_voucher: boolean
}

interface TransferRoute {
  id: number
  route_name: string
  from_zone: { name: string }
  to_zone: { name: string }
  services: {
    private?: {
      available: boolean
      from_price: number
      currency: string
    }
  }
}

export default function InstantQuotePage() {
  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [regCompanyName, setRegCompanyName] = useState('')
  const [regAgentName, setRegAgentName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [debugCode, setDebugCode] = useState<string | null>(null)
  const [smtpError, setSmtpError] = useState<string | null>(null)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [activeAgent, setActiveAgent] = useState<{ companyName?: string; agentName?: string; email?: string; phone?: string } | null>(null)

  // Portal tabs and lookup states
  const [activeTab, setActiveTab] = useState<'hotels' | 'tours' | 'transfers'>('hotels')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [loadingMetadata, setLoadingMetadata] = useState(false)

  // Search parameters
  const [selectedCityId, setSelectedCityId] = useState<number | ''>('')
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7) // Default 7 days from now
    return d.toISOString().split('T')[0]
  })
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 9) // Default 9 days from now
    return d.toISOString().split('T')[0]
  })
  const [roomsCount, setRoomsCount] = useState(1)
  const [adultsCount, setAdultsCount] = useState(2)
  const [childrenCount, setChildrenCount] = useState(0)

  // Transfers search parameters
  const [fromZoneId, setFromZoneId] = useState<number | ''>('')
  const [toZoneId, setToZoneId] = useState<number | ''>('')
  const [transferDate, setTransferDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  })

  // Results states
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [tours, setTours] = useState<Tour[]>([])
  const [transfers, setTransfers] = useState<TransferRoute[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  // Custom inquiry states
  const [inquiryText, setInquiryText] = useState('')
  const [inquiryName, setInquiryName] = useState('')
  const [inquiryEmail, setInquiryEmail] = useState('')
  const [inquiryPhone, setInquiryPhone] = useState('')
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  // Page visibility state
  const [isPageDisabled, setIsPageDisabled] = useState(false)

  useEffect(() => {
    async function checkVisibility() {
      try {
        const res = await fetch('/api/site-settings')
        const data = await res.json()
        if (data.settings?.hideInstantQuote) {
          setIsPageDisabled(true)
        }
      } catch (err) {}
    }
    checkVisibility()
  }, [])

  // Verify Session Check on load
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/check')
        const data = await res.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
          setActiveAgent(data.agent)
        } else {
          setIsAuthenticated(false)
        }
      } catch (err) {
        setIsAuthenticated(false)
      }
    }
    checkSession()
  }, [])

  // Auto-populate inquiry form when agent loaded
  useEffect(() => {
    if (activeAgent) {
      setInquiryName(activeAgent.agentName || '')
      setInquiryEmail(activeAgent.email || '')
      setInquiryPhone(activeAgent.phone || '')
    }
  }, [activeAgent])

  // Fetch cities/zones metadata once authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    async function fetchMetadata() {
      setLoadingMetadata(true)
      try {
        // Fetch Destinations
        const destRes = await fetch('/api/external/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'destinations' })
        })
        const destData = await destRes.json()
        if (destData.success && destData.data) {
          setDestinations(destData.data)
          // Default to Singapore (id: 1) if available
          const hasSg = destData.data.find((d: Destination) => d.id === 1)
          setSelectedCityId(hasSg ? 1 : destData.data[0]?.id || '')
        }

        // Fetch Zones
        const zoneRes = await fetch('/api/external/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'zones' })
        })
        const zoneData = await zoneRes.json()
        if (zoneData.success && zoneData.data?.zones) {
          setZones(zoneData.data.zones)
          // Default to Changi Airport (id: 59) and Singapore Hotels (id: 60) if present
          const hasChangi = zoneData.data.zones.find((z: Zone) => z.id === 59)
          const hasHotels = zoneData.data.zones.find((z: Zone) => z.id === 60)
          setFromZoneId(hasChangi ? 59 : '')
          setToZoneId(hasHotels ? 60 : '')
        }
      } catch (err) {
        console.error('Failed to load API metadata', err)
      } finally {
        setLoadingMetadata(false)
      }
    }
    fetchMetadata()
  }, [isAuthenticated])

  // Auth: Send Verification OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    setDebugCode(null)
    setSmtpError(null)

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          companyName: authMode === 'signup' ? regCompanyName : undefined,
          agentName: authMode === 'signup' ? regAgentName : undefined,
          phone: authMode === 'signup' ? regPhone : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code')
      }

      setOtpSent(true)
      if (data.debugOtp) {
        setDebugCode(data.debugOtp)
      }
      if (data.smtpError) {
        setSmtpError(data.smtpError)
      }
    } catch (err: any) {
      setAuthError(err.message || 'Something went wrong')
    } finally {
      setAuthLoading(false)
    }
  }

  // Auth: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, otp: otpCode }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setIsAuthenticated(true)
      setActiveAgent(data.agent)
    } catch (err: any) {
      setAuthError(err.message || 'OTP verification failed')
    } finally {
      setAuthLoading(false)
    }
  }

  // Auth: Log Out
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setIsAuthenticated(false)
    setActiveAgent(null)
    setOtpSent(false)
    setOtpCode('')
    setDebugCode(null)
    setSmtpError(null)
  }

  // Search: Hotels
  const searchHotels = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCityId) return
    setSearchLoading(true)
    setSearchError('')
    setHotels([])

    try {
      const res = await fetch('/api/external/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'hotels',
          city_id: selectedCityId,
          check_in: checkIn,
          check_out: checkOut,
          adults: adultsCount,
          children: childrenCount,
          rooms: roomsCount
        })
      })
      const data = await res.json()
      if (data.success) {
        setHotels(data.data || [])
        if (!data.data || data.data.length === 0) {
          setSearchError('No hotels matched your selection in this destination.')
        }
      } else {
        throw new Error(data.error || 'Failed to search hotels')
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error occurred while querying hotels.')
    } finally {
      setSearchLoading(false)
    }
  }

  // Search: Tours
  const searchTours = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCityId) return
    setSearchLoading(true)
    setSearchError('')
    setTours([])

    try {
      const res = await fetch('/api/external/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tours',
          city_id: selectedCityId
        })
      })
      const data = await res.json()
      if (data.success) {
        const list = data.data?.tours || data.data || []
        setTours(list)
        if (list.length === 0) {
          setSearchError('No tours/activities matched this destination.')
        }
      } else {
        throw new Error(data.error || 'Failed to search tours')
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error occurred while querying tours.')
    } finally {
      setSearchLoading(false)
    }
  }

  // Search: Transfers
  const searchTransfers = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromZoneId || !toZoneId) return
    setSearchLoading(true)
    setSearchError('')
    setTransfers([])

    try {
      const res = await fetch('/api/external/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'transfers',
          from_zone_id: fromZoneId,
          to_zone_id: toZoneId,
          date: transferDate
        })
      })
      const data = await res.json()
      if (data.success) {
        const routesList = data.data?.routes || []
        setTransfers(routesList)
        if (routesList.length === 0) {
          setSearchError('No transfer services available for this route selection.')
        }
      } else {
        throw new Error(data.error || 'Failed to search transfers')
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error occurred while querying transfers.')
    } finally {
      setSearchLoading(false)
    }
  }

  // Submit Inquiry (Web3Forms fallback / Sanity log)
  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setInquiryStatus('submitting')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName,
          email: inquiryEmail,
          phone: inquiryPhone,
          message: `[Instant Quote Portal Rate Inquiry]\n\nAgent: ${inquiryName}\nCompany: ${activeAgent?.companyName || 'N/A'}\n\nEnquiry Notes:\n${inquiryText}`
        })
      })

      if (res.ok) {
        setInquiryStatus('success')
        setInquiryText('')
      } else {
        throw new Error('Failed to send contact inquiry.')
      }
    } catch (err) {
      setInquiryStatus('error')
    }
  }

  // Check if page is hidden in Sanity Studio
  if (isPageDisabled) {
    return (
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div className="glass" style={{ padding: '3rem', borderRadius: '16px', background: '#FFF', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-lg)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔒</span>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
            Instant Quote Unavailable
          </h2>
          <p style={{ color: '#718096', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            This page is currently undergoing maintenance or has been hidden by the site administrator. Please explore our published packages or contact us directly.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
              Return to Home
            </Link>
            <Link href="/packages" className="btn" style={{ padding: '0.75rem 1.5rem', fontWeight: 700, border: '1px solid #CBD5E1', color: '#4A5568' }}>
              View Packages
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Verification helper: display loading screen
  if (isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--gold-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.2rem', color: 'var(--text-dark)' }}>Verifying B2B Session...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Login Required Panel
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
          
          {/* Diagonal Banner */}
          <div style={{
            position: 'absolute',
            top: '18px',
            right: '-38px',
            background: 'var(--crimson-primary)',
            color: 'white',
            padding: '5px 40px',
            fontSize: '0.6rem',
            fontWeight: 800,
            transform: 'rotate(45deg)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            zIndex: 10,
            whiteSpace: 'nowrap'
          }}>
            Testing in Progress
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2rem', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', lineHeight: 1.2 }}>
              Flying Wonders
            </span>
            <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.7rem', color: 'var(--gold-accent)', letterSpacing: '0.3em', textTransform: 'uppercase', display: 'block', marginTop: '4px' }}>
              Singapore B2B API Portal
            </span>
            <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.75rem', color: 'var(--text-dark)', opacity: 0.8, display: 'block', marginTop: '12px', fontWeight: 600 }}>
              Internal B2B Agent Portal. Use "Agent Login"
            </span>
          </div>

          {!otpSent && (
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #E2E8F0', marginBottom: '2rem', paddingBottom: '2px' }}>
              <button 
                type="button" 
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: 'none', borderBottom: authMode === 'login' ? '3px solid var(--crimson-primary)' : 'none', color: authMode === 'login' ? 'var(--crimson-primary)' : '#718096', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Sign In
              </button>
              <button 
                type="button" 
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: 'none', borderBottom: authMode === 'signup' ? '3px solid var(--crimson-primary)' : 'none', color: authMode === 'signup' ? 'var(--crimson-primary)' : '#718096', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Register Agency
              </button>
            </div>
          )}

          {authError && (
            <div style={{ background: '#FFF5F5', color: '#C53030', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem', borderLeft: '4px solid #C53030' }}>
              ⚠️ {authError}
            </div>
          )}

          {debugCode && (
            <div style={{ background: '#FEFCBF', color: '#744210', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid #F6E05E' }}>
              ℹ️ <strong>Development Sandbox Mode:</strong> {smtpError ? `Email dispatch failed: ${smtpError}.` : 'We detected that your SMTP configuration is empty.'} Enter this code to verify: <strong style={{ fontSize: '1.2rem', color: '#000' }}>{debugCode}</strong>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {authMode === 'signup' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#4A5568' }}>Company / Agency Name *</label>
                    <input 
                      type="text" required placeholder="e.g. Travel Wonders Inc"
                      value={regCompanyName} onChange={e => setRegCompanyName(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#4A5568' }}>Agent Contact Name *</label>
                    <input 
                      type="text" required placeholder="e.g. Ramesh Kumar"
                      value={regAgentName} onChange={e => setRegAgentName(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#4A5568' }}>Phone / WhatsApp *</label>
                    <input 
                      type="tel" required placeholder="e.g. +91 9876543210"
                      value={regPhone} onChange={e => setRegPhone(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                </>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#4A5568' }}>Work Email Address *</label>
                <input 
                  type="email" required placeholder="name@youragency.com"
                  value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={authLoading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontWeight: 700, marginTop: '0.5rem' }}
              >
                {authLoading ? 'Sending...' : authMode === 'login' ? 'Sign In Key 🔑' : 'Register Partner Account 💼'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem', color: '#4A5568' }}>We have sent a 6-digit OTP code to:</p>
                <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--crimson-primary)', marginTop: '0.25rem' }}>{authEmail}</strong>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#4A5568', textAlign: 'center' }}>Enter Verification Code</label>
                <input 
                  type="text" required placeholder="123456" maxLength={6}
                  value={otpCode} onChange={e => setOtpCode(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '2px solid var(--gold-accent)', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.3em', fontWeight: 700 }}
                />
              </div>

              <button 
                type="submit" 
                disabled={authLoading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
              >
                {authLoading ? 'Verifying...' : 'Verify & Log In Key 🔑'}
              </button>

              <button 
                type="button" 
                onClick={() => { setOtpSent(false); setDebugCode(null); setSmtpError(null); }}
                style={{ background: 'transparent', border: 'none', color: '#718096', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', marginTop: '0.5rem' }}
              >
                Change Email Address
              </button>
            </form>
          )}

        </div>
      </div>
    )
  }

  // Dashboard Interface
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
      
      {/* Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--crimson-primary) 0%, #3e040b 100%)',
        color: 'white',
        padding: '3rem 2rem',
        borderRadius: '16px',
        marginBottom: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
        borderLeft: '8px solid var(--gold-accent)',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: '1.5rem', right: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right', color: 'white', fontSize: '0.8rem' }}>
            <span style={{ display: 'block', opacity: 0.6 }}>B2B Token Session active:</span>
            <strong>{activeAgent?.agentName} ({activeAgent?.companyName})</strong>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
          >
            Logout
          </button>
        </div>

        <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
          B2B Instant Rate Lookup
        </h2>
        <p style={{ opacity: 0.9, fontSize: '0.95rem', maxWidth: '600px', fontWeight: 300, lineHeight: 1.5 }}>
          Fetch real-time inventory rates and private vehicle route pricing directly from our B2B API gateway.
        </p>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #E2E8F0', marginBottom: '2rem' }}>
        <button
          onClick={() => { setActiveTab('hotels'); setSearchError(''); }}
          style={{ padding: '1rem 1.5rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'hotels' ? '4px solid var(--crimson-primary)' : 'none', color: activeTab === 'hotels' ? 'var(--crimson-primary)' : '#4A5568', fontWeight: 700, cursor: 'pointer' }}
        >
          🏨 Hotels Search
        </button>
        <button
          onClick={() => { setActiveTab('tours'); setSearchError(''); }}
          style={{ padding: '1rem 1.5rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'tours' ? '4px solid var(--crimson-primary)' : 'none', color: activeTab === 'tours' ? 'var(--crimson-primary)' : '#4A5568', fontWeight: 700, cursor: 'pointer' }}
        >
          🎟️ Tours & Attractions
        </button>
        <button
          onClick={() => { setActiveTab('transfers'); setSearchError(''); }}
          style={{ padding: '1rem 1.5rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'transfers' ? '4px solid var(--crimson-primary)' : 'none', color: activeTab === 'transfers' ? 'var(--crimson-primary)' : '#4A5568', fontWeight: 700, cursor: 'pointer' }}
        >
          🚗 Transfers Rates
        </button>
      </div>

      {/* Main Form and Output Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Search Results Area */}
        <div>
          {/* 1. Form Panels */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '12px', background: '#FFF', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
            {loadingMetadata ? (
              <p style={{ fontSize: '0.9rem', color: '#718096', fontStyle: 'italic' }}>Syncing global API destinations...</p>
            ) : (
              <>
                {/* A. Hotels Search Form */}
                {activeTab === 'hotels' && (
                  <form onSubmit={searchHotels}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Destination City *</label>
                        <select 
                          value={selectedCityId} onChange={e => setSelectedCityId(parseInt(e.target.value))}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF' }}
                        >
                          {destinations.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.country})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Rooms</label>
                        <input 
                          type="number" min="1" max="10" value={roomsCount} onChange={e => setRoomsCount(parseInt(e.target.value))}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Check In *</label>
                        <input 
                          type="date" required value={checkIn} onChange={e => setCheckIn(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Check Out *</label>
                        <input 
                          type="date" required value={checkOut} onChange={e => setCheckOut(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Adults *</label>
                        <input 
                          type="number" min="1" max="20" value={adultsCount} onChange={e => setAdultsCount(parseInt(e.target.value))}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Children</label>
                        <input 
                          type="number" min="0" max="10" value={childrenCount} onChange={e => setChildrenCount(parseInt(e.target.value))}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={searchLoading} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem' }}>
                      {searchLoading ? 'Searching Hotels...' : 'Search Live Hotels 🏨'}
                    </button>
                  </form>
                )}

                {/* B. Tours Search Form */}
                {activeTab === 'tours' && (
                  <form onSubmit={searchTours}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Destination City *</label>
                        <select 
                          value={selectedCityId} onChange={e => setSelectedCityId(parseInt(e.target.value))}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF' }}
                        >
                          {destinations.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.country})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button type="submit" disabled={searchLoading} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem' }}>
                      {searchLoading ? 'Loading Tours...' : 'Load Live Tours & Activities 🎟️'}
                    </button>
                  </form>
                )}

                {/* C. Transfers Search Form */}
                {activeTab === 'transfers' && (
                  <form onSubmit={searchTransfers}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Pickup Location Zone *</label>
                        <select 
                          value={fromZoneId} onChange={e => setFromZoneId(parseInt(e.target.value))}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF' }}
                        >
                          <option value="">Select Pickup Zone</option>
                          {zones.map(z => (
                            <option key={z.id} value={z.id}>{z.name} ({z.code})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Dropoff Location Zone *</label>
                        <select 
                          value={toZoneId} onChange={e => setToZoneId(parseInt(e.target.value))}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF' }}
                        >
                          <option value="">Select Dropoff Zone</option>
                          {zones.map(z => (
                            <option key={z.id} value={z.id}>{z.name} ({z.code})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Transfer Date *</label>
                        <input 
                          type="date" required value={transferDate} onChange={e => setTransferDate(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={searchLoading} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem' }}>
                      {searchLoading ? 'Searching Transfers...' : 'Search Live Transfers 🚗'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          {/* 2. Error Display */}
          {searchError && (
            <div style={{ background: '#FFF5F5', color: '#C53030', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #C53030', marginBottom: '2rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>⚠️ Search Notice:</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>{searchError}</p>
            </div>
          )}

          {/* 3. Skeleton Loading */}
          {searchLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="glass" style={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.5)' }}>
                  <div style={{ width: '40%', height: '18px', background: '#E2E8F0', borderRadius: '4px', marginBottom: '0.75rem' }}></div>
                  <div style={{ width: '70%', height: '14px', background: '#EDF2F7', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
                  <div style={{ width: '20%', height: '16px', background: '#E2E8F0', borderRadius: '4px' }}></div>
                </div>
              ))}
            </div>
          )}

          {/* 4. Hotels List Render */}
          {activeTab === 'hotels' && hotels.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {hotels.map(h => (
                <div key={h.hotel_id} className="glass" style={{ background: '#FFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>
                      {h.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginTop: '0.25rem' }}>
                      {'★'.repeat(h.star_rating)} Rating
                    </span>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: '0.5rem 0' }}>📍 {h.address}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {h.amenities?.map((amenity, aIdx) => (
                        <span key={aIdx} style={{ fontSize: '0.7rem', background: '#F7FAFC', border: '1px solid #E2E8F0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          ✓ {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6 }}>From (Per Room)</span>
                    <strong style={{ fontSize: '1.8rem', color: 'var(--crimson-primary)' }}>{h.currency} {h.lead_price}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. Tours List Render */}
          {activeTab === 'tours' && tours.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {tours.map(t => (
                <div key={t.tour_id} className="glass" style={{ background: '#FFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, paddingRight: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>
                      {t.name}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: '#319795', background: '#E6FFFA', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.35rem', fontWeight: 700 }}>
                      Category: {t.category || 'Sightseeing'}
                    </span>
                    <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: '0.75rem 0 0 0', lineHeight: 1.4 }}>
                      {t.short_description}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                      {t.instant_confirmation && <span style={{ fontSize: '0.7rem', color: '#2F855A' }}>⚡ Instant Confirm</span>}
                      {t.mobile_voucher && <span style={{ fontSize: '0.7rem', color: '#2F855A' }}>📱 Mobile Voucher</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '120px' }}>
                    <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6 }}>Price (Head)</span>
                    <strong style={{ fontSize: '1.8rem', color: 'var(--crimson-primary)' }}>{t.currency} {t.lead_price}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 6. Transfers List Render */}
          {activeTab === 'transfers' && transfers.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {transfers.map(tr => (
                <div key={tr.id} className="glass" style={{ background: '#FFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>
                      {tr.route_name || 'Transfer Service'}
                    </h4>
                    <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: '0.5rem 0' }}>
                      📍 <strong>Pickup:</strong> {tr.from_zone?.name} <br />
                      🏁 <strong>Dropoff:</strong> {tr.to_zone?.name}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {tr.services?.private?.available ? (
                      <>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--emerald-secondary)', fontWeight: 700 }}>🚗 Private Service</span>
                        <strong style={{ fontSize: '1.8rem', color: 'var(--crimson-primary)' }}>
                          {tr.services.private.currency} {tr.services.private.from_price}
                        </strong>
                      </>
                    ) : (
                      <span style={{ color: '#E53E3E', fontSize: '0.85rem' }}>Sold Out</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Sidebar Inquiry Form */}
        <div className="glass" style={{ padding: '2rem 1.5rem', borderRadius: '16px', background: '#FFF', border: '1px solid #E2E8F0', position: 'sticky', top: '100px' }}>
          <h3 style={{ color: 'var(--crimson-primary)', marginBottom: '0.75rem', fontSize: '1.25rem', fontFamily: 'var(--font-playfair), serif' }}>
            📥 Partner Rate Query
          </h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1.5rem', lineHeight: 1.4 }}>
            Interested in booking one of these live items? Send us a query with your references to instantly log it in Sanity.
          </p>

          {inquiryStatus === 'success' ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
              <strong style={{ color: 'var(--emerald-secondary)', display: 'block', marginBottom: '0.5rem' }}>Inquiry Sent Successfully!</strong>
              <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Our team has been notified. We will reach back to Ramesh/Travel Wonders within 2 hours.</p>
              <button 
                onClick={() => setInquiryStatus('idle')} 
                className="btn btn-ghost" 
                style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.8rem' }}
              >
                Send Another Query
              </button>
            </div>
          ) : (
            <form onSubmit={handleInquiry} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: '#4A5568' }}>Agent Name *</label>
                <input 
                  type="text" required placeholder="Agent Name" value={inquiryName} onChange={e => setInquiryName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: '#4A5568' }}>Work Email *</label>
                <input 
                  type="email" required placeholder="Email Address" value={inquiryEmail} onChange={e => setInquiryEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: '#4A5568' }}>Phone / WhatsApp *</label>
                <input 
                  type="text" required placeholder="Phone Number" value={inquiryPhone} onChange={e => setInquiryPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: '#4A5568' }}>Enquiry Notes / Custom Requests *</label>
                <textarea 
                  required
                  placeholder="Enter details of the hotel name, tour, or transfers you wish to verify and package (e.g. Requesting booking for DMC Certification Test Hotel on 20th July...)"
                  rows={4}
                  value={inquiryText} onChange={e => setInquiryText(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              {inquiryStatus === 'error' && (
                <p style={{ color: '#C53030', fontSize: '0.75rem', margin: 0 }}>⚠️ Failed to submit query. Please check your network connection.</p>
              )}

              <button 
                type="submit" 
                disabled={inquiryStatus === 'submitting'}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.5rem' }}
              >
                {inquiryStatus === 'submitting' ? 'Submitting...' : 'Submit Rate Inquiry ✉️'}
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  )
}
