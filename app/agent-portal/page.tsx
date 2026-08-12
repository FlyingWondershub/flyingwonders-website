'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  LayoutDashboard, 
  Package, 
  Compass, 
  FileText, 
  LogOut, 
  Edit3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  RefreshCw, 
  Search, 
  Download, 
  Copy, 
  ExternalLink,
  Building2,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react'

export default function AgentPortalPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings'>('dashboard')
  const [activeAgent, setActiveAgent] = useState<any>(null)
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Agency Branding Modal State
  const [showBrandingModal, setShowBrandingModal] = useState(false)
  const [customAgencyName, setCustomAgencyName] = useState('')
  const [customAgencyEmail, setCustomAgencyEmail] = useState('')
  const [customAgencyPhone, setCustomAgencyPhone] = useState('')

  // Bookings Filter & Search
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Login modal state if unauthenticated
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [otpStep, setOtpStep] = useState<'email' | 'otp'>('email')
  const [otpCode, setOtpCode] = useState('')
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [regCompanyName, setRegCompanyName] = useState('')
  const [regAgentName, setRegAgentName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch(`/api/auth/check?cb=${Date.now()}`)
        const authData = await res.json()
        if (authData.authenticated && authData.agent) {
          const ag = authData.agent
          setActiveAgent(ag)
          setCustomAgencyName(ag.companyName || ag.agentName || '')
          setCustomAgencyEmail(ag.email || '')
          setCustomAgencyPhone(ag.phone || '')
          localStorage.setItem('fw_b2b_agent', JSON.stringify(ag))
          fetchAgentProposals(ag.email)
          setLoading(false)
          return
        }
      } catch (e) {
        console.error(e)
      }

      // If server session is false, clear any stale client storage
      localStorage.removeItem('fw_b2b_agent')
      setActiveAgent(null)
      setLoading(false)
      setShowLoginModal(true)
    }

    initSession()
  }, [])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    if (!loginEmail || !loginEmail.includes('@')) {
      setAuthError('Please enter a valid B2B email address.')
      return
    }
    setAuthSubmitting(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          companyName: authMode === 'signup' ? regCompanyName : undefined,
          agentName: authMode === 'signup' ? regAgentName : undefined,
          phone: authMode === 'signup' ? regPhone : undefined,
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setOtpStep('otp')
      } else {
        if (data.error && (data.error.toLowerCase().includes('account not found') || data.error.toLowerCase().includes('register'))) {
          setAuthMode('signup')
        }
        setAuthError(data.error || 'Failed to send OTP. Please ensure your email is registered as an approved B2B Agent.')
      }
    } catch (e) {
      setAuthError('Error sending OTP.')
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode || otpCode.length < 4) {
      alert('Please enter a valid verification code.')
      return
    }
    setAuthSubmitting(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, otp: otpCode })
      })
      const data = await res.json()
      if (res.ok && data.success && data.agent) {
        const ag = data.agent
        setActiveAgent(ag)
        setCustomAgencyName(ag.companyName || ag.agentName || '')
        setCustomAgencyEmail(ag.email || '')
        setCustomAgencyPhone(ag.phone || '')
        localStorage.setItem('fw_b2b_agent', JSON.stringify(ag))
        setShowLoginModal(false)
        fetchAgentProposals(ag.email)
        alert(`Welcome back, ${ag.agentName || ag.companyName}!`)
      } else {
        alert(data.error || 'Invalid OTP code.')
      }
    } catch (e) {
      alert('Error verifying OTP.')
    } finally {
      setAuthSubmitting(false)
    }
  }

  const fetchAgentProposals = async (email: string) => {
    setRefreshing(true)
    try {
      const res = await fetch(`/api/proposals?agentEmail=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (res.ok && Array.isArray(data.list)) {
        setProposals(data.list)
      }
    } catch (err) {
      console.error('Failed to fetch agent proposals:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleSaveBranding = () => {
    if (!activeAgent) return
    const updated = {
      ...activeAgent,
      companyName: customAgencyName,
      email: customAgencyEmail,
      phone: customAgencyPhone
    }
    setActiveAgent(updated)
    localStorage.setItem('fw_b2b_agent', JSON.stringify(updated))
    setShowBrandingModal(false)
    alert('Agency Branding updated successfully! Applies across all white-label PDF and WhatsApp proposals.')
  }

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out of your B2B Agent Account?')) {
      try {
        await fetch('/api/auth/logout', { method: 'POST', cache: 'no-store' })
      } catch (e) {
        console.error('Logout error:', e)
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fw_b2b_agent')
        localStorage.removeItem('fw_agent_branding')
        localStorage.removeItem('attractions_user')
        sessionStorage.clear()
      }
      setActiveAgent(null)
      window.location.replace('/')
    }
  }

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Calculate Metrics
  const todayStr = new Date().toISOString().split('T')[0]
  const currentMonthStr = new Date().toISOString().slice(0, 7)

  const todayBookings = proposals.filter(p => {
    const created = p._createdAt ? p._createdAt.split('T')[0] : ''
    return created === todayStr
  }).length

  const thisMonthBookings = proposals.filter(p => {
    const created = p._createdAt ? p._createdAt.slice(0, 7) : ''
    return created === currentMonthStr
  }).length

  const confirmedCount = proposals.filter(p => p.status === 'confirmed' || p.status === 'scheduled').length
  const pendingCount = proposals.filter(p => !p.status || p.status === 'pending' || p.status === 'followup').length
  const completedCount = proposals.filter(p => p.status === 'completed').length
  const totalCount = proposals.length

  const filteredProposals = proposals.filter(p => {
    const pStatus = p.status || 'pending'
    const matchesFilter = 
      bookingFilter === 'all' ? true :
      bookingFilter === 'confirmed' ? (pStatus === 'confirmed' || pStatus === 'scheduled') :
      bookingFilter === 'pending' ? (pStatus === 'pending' || pStatus === 'followup') :
      bookingFilter === 'completed' ? (pStatus === 'completed') : true

    const term = searchQuery.toLowerCase().trim()
    const matchesSearch = !term ||
      (p.proposalNumber && p.proposalNumber.toLowerCase().includes(term)) ||
      (p.guestName && p.guestName.toLowerCase().includes(term)) ||
      (p.guestPhone && p.guestPhone.toLowerCase().includes(term))

    return matchesFilter && matchesSearch
  })

  // Get Initials for Circle Avatar
  const companyInitials = (activeAgent?.companyName || activeAgent?.agentName || 'FW')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase() || 'FW'

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', color: '#1E293B' }}>
      
      {/* ── 1. LEFT NAVIGATION SIDEBAR ── */}
      <aside style={{
        width: '280px',
        background: '#FFF',
        borderRight: '1px solid #E2E8F0',
        padding: '1.75rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: '2px 0 10px rgba(0,0,0,0.02)'
      }}>
        <div>
          {/* Profile & Agency Header Card */}
          <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.85rem' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #B83A4B 0%, #0F4C3A 100%)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(184,58,75,0.25)',
                margin: '0 auto'
              }}>
                {companyInitials}
              </div>
              <button 
                onClick={() => setShowBrandingModal(true)}
                title="Edit Agency Branding"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: '#FFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <Edit3 size={12} color="#475569" />
              </button>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.2rem' }}>
              {activeAgent?.companyName || activeAgent?.agentName || 'Flying Wonders B2B Partner'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              Member Since {activeAgent?.createdAt ? new Date(activeAgent.createdAt).toLocaleDateString('en-SG', { month: 'short', year: 'numeric' }) : 'May 2026'}
            </span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'dashboard' ? '#B83A4B' : 'transparent',
                color: activeTab === 'dashboard' ? '#FFF' : '#475569',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s'
              }}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <Link
              href="/custom-package"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              <Package size={18} />
              <span>Build-Packages</span>
            </Link>

            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              <Compass size={18} />
              <span>Readymade</span>
              <span style={{ fontSize: '0.62rem', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FCA5A5', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: 'auto', fontWeight: 800 }}>NEW</span>
            </Link>

            <button
              onClick={() => setActiveTab('bookings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'bookings' ? '#B83A4B' : 'transparent',
                color: activeTab === 'bookings' ? '#FFF' : '#475569',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s'
              }}
            >
              <FileText size={18} />
              <span>My Bookings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => setShowBrandingModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <Building2 size={16} color="#0F4C3A" />
            <span>Agency Branding</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: '#EF4444',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── 2. MAIN CENTER WORKSPACE ── */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
        
        {/* Top Header Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {getGreeting()}, <span style={{ color: '#B83A4B' }}>{activeAgent?.agentName?.split(' ')[0] || 'Partner'}</span>!
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748B', margin: '0.25rem 0 0' }}>
              Here&apos;s what&apos;s happening with your bookings today.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
              {new Date().toLocaleDateString('en-SG', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <button
              onClick={() => activeAgent && fetchAgentProposals(activeAgent.email)}
              disabled={refreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #DC2626',
                background: '#FFF',
                color: '#DC2626',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #FCA5A5',
                background: '#FEF2F2',
                color: '#991B1B',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
              title="Sign Out of B2B Agent Account"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* ── METRIC CARDS SECTION (MATCHING SCREENSHOT LAYOUT) ── */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Top Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              
              {/* Today's Bookings (Red Highlight Card) */}
              <div style={{
                background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                color: '#FFF',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 8px 20px rgba(220,38,38,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                    Today&apos;s Bookings
                  </span>
                  <strong style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1 }}>{todayBookings}</strong>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={24} color="#FFF" />
                </div>
              </div>

              {/* This Month */}
              <div style={{
                background: '#FFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                    This Month
                  </span>
                  <strong style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{thisMonthBookings}</strong>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F0FDF4', border: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={24} color="#166534" />
                </div>
              </div>

              {/* Confirmed */}
              <div style={{
                background: '#FFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                    Confirmed
                  </span>
                  <strong style={{ fontSize: '2.4rem', fontWeight: 800, color: '#166534', lineHeight: 1 }}>{confirmedCount}</strong>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={24} color="#22C55E" />
                </div>
              </div>

            </div>

            {/* Bottom Summary Metric Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              
              {/* Confirmed Count */}
              <div style={{ background: '#FFF', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={22} color="#15803D" />
                </div>
                <div>
                  <strong style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', display: 'block', lineHeight: 1 }}>{confirmedCount}</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Confirmed</span>
                </div>
              </div>

              {/* Pending Count */}
              <div style={{ background: '#FFF', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={22} color="#B45309" />
                </div>
                <div>
                  <strong style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', display: 'block', lineHeight: 1 }}>{pendingCount}</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Pending</span>
                </div>
              </div>

              {/* Total Bookings Count */}
              <div style={{ background: '#FFF', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={22} color="#0369A1" />
                </div>
                <div>
                  <strong style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', display: 'block', lineHeight: 1 }}>{totalCount}</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Total Bookings</span>
                </div>
              </div>

            </div>

            {/* ── QUICK START BUILDER PROMPT BANNER ── */}
            <div style={{
              background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)',
              color: '#FFF',
              borderRadius: '16px',
              padding: '1.75rem 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
              marginBottom: '2.5rem',
              boxShadow: '0 10px 25px rgba(15,76,58,0.15)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.35rem', fontFamily: 'system-ui, sans-serif' }}>
                  Ready to build a new custom Singapore or Malaysia package?
                </h3>
                <p style={{ fontSize: '0.88rem', opacity: 0.9, margin: 0, fontWeight: 300 }}>
                  Generate white-label PDF itineraries and instant B2B quotes in under 2 minutes.
                </p>
              </div>

              <Link
                href="/custom-package"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  background: '#B83A4B',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(184,58,75,0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Package size={18} />
                <span>Launch Package Builder ⚙️</span>
              </Link>
            </div>

          </div>
        )}

        {/* ── 3. RECENT BOOKINGS / MY BOOKINGS SECTION ── */}
        {(activeTab === 'dashboard' || activeTab === 'bookings') && (
          <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            
            {/* Header Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="#B83A4B" /> My Saved Bookings & Proposals ({filteredProposals.length})
              </h3>

              {/* Status Filter Badges */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: `All (${proposals.length})` },
                  { id: 'confirmed', label: `🟢 Confirmed (${confirmedCount})` },
                  { id: 'pending', label: `🟡 Pending (${pendingCount})` },
                  { id: 'completed', label: `✅ Completed (${completedCount})` },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setBookingFilter(f.id as any)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: bookingFilter === f.id ? 'none' : '1px solid #E2E8F0',
                      background: bookingFilter === f.id ? '#0F172A' : '#F8FAFC',
                      color: bookingFilter === f.id ? '#FFF' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Search by Guest Name, Phone Number, or Proposal Ref (FW-2026-XXXX)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.5rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#F8FAFC'
                }}
              />
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* Table / List */}
            {loading ? (
              <p style={{ textAlign: 'center', color: '#64748B', padding: '2rem 0', fontSize: '0.9rem' }}>Loading your booking records...</p>
            ) : filteredProposals.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748B', padding: '2rem 0', fontSize: '0.9rem' }}>No matching bookings found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', color: '#475569', borderBottom: '2px solid #E2E8F0' }}>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Proposal Ref</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Guest Name & Contact</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Pax & Nights</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Arrival Date</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Total Price (SGD / ₹)</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Status</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProposals.map((p, idx) => {
                      const pStatus = p.status || 'pending'
                      const isConfirmed = pStatus === 'confirmed' || pStatus === 'scheduled'
                      const isCompleted = pStatus === 'completed'

                      return (
                        <tr key={p._id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.75rem 0.85rem', fontWeight: 800, color: '#B83A4B' }}>
                            {p.proposalNumber}
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem' }}>
                            <strong style={{ color: '#0F172A', display: 'block' }}>{p.guestName || 'Valued Guest'}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.guestPhone || 'No phone'}</span>
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem', color: '#334155' }}>
                            {p.adults || 2} Adult{p.adults > 1 ? 's' : ''}{p.kids > 0 ? ` + ${p.kids} Child` : ''} · {p.nights || 3}N
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem', color: '#0284C7', fontWeight: 600 }}>
                            📅 {p.arrivalDate || 'TBD'}
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem' }}>
                            <strong style={{ color: '#166534', display: 'block' }}>S$ {(p.totalClientPrice || 0).toLocaleString()}</strong>
                            {p.costBreakdown?.totalClientPriceINR && (
                              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>≈ ₹{p.costBreakdown.totalClientPriceINR.toLocaleString('en-IN')}</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem' }}>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.73rem',
                              fontWeight: 800,
                              background: isConfirmed ? '#DCFCE7' : (isCompleted ? '#E0E7FF' : '#FEF3C7'),
                              color: isConfirmed ? '#166534' : (isCompleted ? '#3730A3' : '#92400E')
                            }}>
                              {isConfirmed ? '🟢 Confirmed' : (isCompleted ? '✅ Completed' : '🔵 Pending')}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>
                            <Link
                              href={`/custom-package?ref=${p.proposalNumber}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '6px',
                                background: '#F1F5F9',
                                color: '#0F172A',
                                border: '1px solid #CBD5E1',
                                textDecoration: 'none',
                                fontWeight: 700,
                                fontSize: '0.78rem'
                              }}
                            >
                              <ExternalLink size={13} /> Open
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ── 4. AGENCY BRANDING MODAL ── */}
      {showBrandingModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '2rem',
            width: '500px',
            maxWidth: '90vw',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} color="#B83A4B" /> White-Label Agency Branding
              </h3>
              <button onClick={() => setShowBrandingModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.83rem', color: '#64748B', marginTop: 0, marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Your agency branding will appear on all client-facing PDF quotes, itinerary documents, and WhatsApp copy text.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Agency / Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Flying Wonders Private Limited"
                  value={customAgencyName}
                  onChange={e => setCustomAgencyName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Agency Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. info.flyingwonders@gmail.com"
                  value={customAgencyEmail}
                  onChange={e => setCustomAgencyEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Agency Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9886171251"
                  value={customAgencyPhone}
                  onChange={e => setCustomAgencyPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowBrandingModal(false)}
                style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBranding}
                style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#B83A4B', color: '#FFF', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Save Branding Settings
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── 5. AGENT OTP LOGIN MODAL ── */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '2.25rem 2rem',
            width: '440px',
            maxWidth: '92vw',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            textAlign: 'center'
          }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', color: '#B83A4B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem', fontWeight: 800 }}>
              🔑
            </div>

            <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              B2B Agent Portal Login
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.5rem', lineHeight: 1.4 }}>
              Enter your registered B2B email to receive a single-use OTP verification code.
            </p>

            {/* Toggle Tab */}
            {otpStep === 'email' && (
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #E2E8F0', marginBottom: '1.5rem', paddingBottom: '2px' }}>
                <button 
                  type="button" 
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: 'none', borderBottom: authMode === 'login' ? '3px solid #B83A4B' : 'none', color: authMode === 'login' ? '#B83A4B' : '#718096', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Sign In
                </button>
                <button 
                  type="button" 
                  onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                  style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: 'none', borderBottom: authMode === 'signup' ? '3px solid #B83A4B' : 'none', color: authMode === 'signup' ? '#B83A4B' : '#718096', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Register Agency
                </button>
              </div>
            )}

            {/* Display Errors */}
            {authError && (
              <div style={{ background: '#FFF5F5', color: '#C53030', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '1.25rem', borderLeft: '4px solid #C53030', textAlign: 'left' }}>
                ⚠️ {authError}
                {(authError.toLowerCase().includes('account not found') || authError.toLowerCase().includes('register')) && (
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                    style={{ display: 'block', marginTop: '0.5rem', background: '#C53030', color: '#FFF', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    👉 Click here to Register Agency
                  </button>
                )}
              </div>
            )}

            {otpStep === 'email' ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left' }}>
                {authMode === 'signup' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem', color: '#475569' }}>Company / Agency Name *</label>
                      <input 
                        type="text" required placeholder="e.g. Travel Wonders Inc"
                        value={regCompanyName} onChange={e => setRegCompanyName(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem', color: '#475569' }}>Agent Name *</label>
                      <input 
                        type="text" required placeholder="e.g. Amit Kumar"
                        value={regAgentName} onChange={e => setRegAgentName(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem', color: '#475569' }}>Phone / WhatsApp Number *</label>
                      <input 
                        type="tel" required placeholder="e.g. +91 9886171251"
                        value={regPhone} onChange={e => setRegPhone(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem', color: '#475569' }}>Work Email Address *</label>
                  <input
                    type="email"
                    placeholder="Registered B2B Email (e.g. agent@travelagency.com)"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={authSubmitting}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#B83A4B', color: '#FFF', fontWeight: 800, fontSize: '0.9rem', cursor: authSubmitting ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}
                >
                  {authSubmitting ? 'Sending OTP...' : (authMode === 'signup' ? 'Register & Send Code 📩' : 'Send Verification OTP 📩')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 700 }}>
                  ✓ OTP sent to {loginEmail}
                </span>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP code"
                  required
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1.1rem', textAlign: 'center', letterSpacing: '0.3em', fontWeight: 800, outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setOtpStep('email')}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', color: '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    ← Change Email
                  </button>
                  <button
                    type="submit"
                    disabled={authSubmitting}
                    style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#0F4C3A', color: '#FFF', fontWeight: 800, fontSize: '0.9rem', cursor: authSubmitting ? 'not-allowed' : 'pointer' }}
                  >
                    {authSubmitting ? 'Verifying...' : 'Verify & Log In 🔓'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
