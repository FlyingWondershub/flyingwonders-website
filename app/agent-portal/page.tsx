'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  UserCheck,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Menu,
  X
} from 'lucide-react'

export default function AgentPortalPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings'>('dashboard')
  const [activeAgent, setActiveAgent] = useState<any>(null)
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Agency Branding Modal State
  const [showBrandingModal, setShowBrandingModal] = useState(false)
  const [customAgencyName, setCustomAgencyName] = useState('')
  const [customAgencyEmail, setCustomAgencyEmail] = useState('')
  const [customAgencyPhone, setCustomAgencyPhone] = useState('')
  const [customAgencyLogoUrl, setCustomAgencyLogoUrl] = useState('')
  const [brandingLogoFile, setBrandingLogoFile] = useState<File | null>(null)
  const [brandingLogoPreview, setBrandingLogoPreview] = useState('')
  const [brandingUploading, setBrandingUploading] = useState(false)

  // Registration logo state
  const [regLogoFile, setRegLogoFile] = useState<File | null>(null)
  const [regLogoPreview, setRegLogoPreview] = useState('')
  const [regLogoAssetId, setRegLogoAssetId] = useState('')
  const [regUploading, setRegUploading] = useState(false)

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
  
  // Status change request state
  const [statusRequestProposal, setStatusRequestProposal] = useState<any | null>(null)
  const [statusRequestTarget, setStatusRequestTarget] = useState<'confirmed' | 'ignore'>('confirmed')
  const [statusRequestNoteText, setStatusRequestNoteText] = useState('')
  const [statusRequestSubmitting, setStatusRequestSubmitting] = useState(false)
  const [copiedRef, setCopiedRef] = useState<string | null>(null)

  const handleCopyRef = (e: React.MouseEvent, refNum: string) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(refNum)
    setCopiedRef(refNum)
    setTimeout(() => setCopiedRef(null), 2000)
  }

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
          setCustomAgencyLogoUrl(ag.logoUrl || '')
          setBrandingLogoPreview(ag.logoUrl || '')
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

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileNavOpen) {
        setMobileNavOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileNavOpen])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    if (!loginEmail || !loginEmail.includes('@')) {
      setAuthError('Please enter a valid B2B email address.')
      return
    }
    setAuthSubmitting(true)
    try {
      let uploadedLogoAssetId = regLogoAssetId
      if (authMode === 'signup' && regLogoFile && !uploadedLogoAssetId) {
        setRegUploading(true)
        try {
          const fd = new FormData()
          fd.append('file', regLogoFile)
          const uploadRes = await fetch('/api/agent-portal/logo-upload', {
            method: 'POST',
            body: fd,
          })
          const uploadData = await uploadRes.json()
          if (uploadData.success && uploadData.assetId) {
            uploadedLogoAssetId = uploadData.assetId
            setRegLogoAssetId(uploadData.assetId)
          }
        } catch (upErr) {
          console.warn('Logo upload during signup failed, continuing:', upErr)
        } finally {
          setRegUploading(false)
        }
      }

      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          companyName: authMode === 'signup' ? regCompanyName : undefined,
          agentName: authMode === 'signup' ? regAgentName : undefined,
          phone: authMode === 'signup' ? regPhone : undefined,
          logoAssetId: uploadedLogoAssetId || undefined,
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
        setCustomAgencyLogoUrl(ag.logoUrl || '')
        setBrandingLogoPreview(ag.logoUrl || '')
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

  const handleRequestStatusChange = async () => {
    if (!statusRequestProposal) return
    setStatusRequestSubmitting(true)
    try {
      const res = await fetch('/api/proposals/request-status-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: statusRequestProposal._id,
          targetStatus: statusRequestTarget,
          note: statusRequestNoteText
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert('Status change request submitted to Admin successfully!')
        setStatusRequestProposal(null)
        setStatusRequestNoteText('')
        if (activeAgent) {
          fetchAgentProposals(activeAgent.email)
        }
      } else {
        alert(data.error || 'Failed to submit status request')
      }
    } catch (e) {
      alert('Error submitting status request')
    } finally {
      setStatusRequestSubmitting(false)
    }
  }

  const handleSaveBranding = async () => {
    if (!activeAgent) return
    setBrandingUploading(true)
    let newLogoUrl = customAgencyLogoUrl

    if (brandingLogoFile) {
      try {
        const fd = new FormData()
        fd.append('file', brandingLogoFile)
        if (activeAgent.email) {
          fd.append('agentEmail', activeAgent.email)
        }
        const uploadRes = await fetch('/api/agent-portal/logo-upload', {
          method: 'POST',
          body: fd,
        })
        const uploadData = await uploadRes.json()
        if (uploadData.success && uploadData.url) {
          newLogoUrl = uploadData.url
          setCustomAgencyLogoUrl(newLogoUrl)
          setBrandingLogoPreview(newLogoUrl)
        }
      } catch (err) {
        console.error('Failed to upload branding logo:', err)
        alert('Failed to upload agency logo image, but saving text branding.')
      }
    } else if (!brandingLogoPreview) {
      newLogoUrl = ''
      setCustomAgencyLogoUrl('')
    }

    const updated = {
      ...activeAgent,
      companyName: customAgencyName,
      email: customAgencyEmail,
      phone: customAgencyPhone,
      logoUrl: newLogoUrl,
    }
    setActiveAgent(updated)
    localStorage.setItem('fw_b2b_agent', JSON.stringify(updated))
    setBrandingLogoFile(null)
    setBrandingUploading(false)
    setShowBrandingModal(false)
    alert('Agency Branding & Logo updated successfully! Applies across all white-label PDF and WhatsApp proposals.')
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
    <div className="ap-root">
      <style>{`
        .ap-root {
          background: #F8FAFC;
          min-height: 100vh;
          display: flex;
          color: #1E293B;
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          position: relative;
          width: 100%;
          box-sizing: border-box;
        }

        /* ── DESKTOP SIDEBAR ── */
        .ap-sidebar-desktop {
          width: 280px;
          background: #FFFFFF;
          border-right: 1px solid #E2E8F0;
          padding: 1.75rem 1.25rem;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          flex-shrink: 0;
          box-shadow: 2px 0 10px rgba(0,0,0,0.02);
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          box-sizing: border-box;
        }

        /* ── MOBILE APP HEADER BAR ── */
        .ap-mobile-header {
          display: none;
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 40;
          background: #FFFFFF;
          border-bottom: 1px solid #E2E8F0;
          padding: 0.75rem 1rem;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          box-sizing: border-box;
        }

        /* ── MOBILE DRAWER OVERLAY & SHEET ── */
        .ap-drawer-overlay {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(2px);
          z-index: 9999;
          transition: opacity 0.25s ease;
        }
        .ap-drawer-overlay.open {
          display: block;
        }
        .ap-drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 300px;
          max-width: 86vw;
          background: #FFFFFF;
          z-index: 10000;
          box-shadow: 4px 0 25px rgba(0,0,0,0.25);
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          padding: 1.25rem;
          overflow-y: auto;
          box-sizing: border-box;
        }
        .ap-drawer.open {
          transform: translateX(0);
        }

        /* ── MAIN WORKSPACE ── */
        .ap-main {
          flex: 1;
          padding: 2rem 2.5rem;
          overflow-y: auto;
          min-width: 0;
          box-sizing: border-box;
        }

        /* ── KPI & ACTION BAR ── */
        .ap-kpi-desktop {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          borderRadius: 14px;
          padding: 0.65rem 0.85rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          margin-bottom: 1.75rem;
        }
        .ap-kpi-mobile {
          display: none;
        }

        /* ── PROPOSALS CONTAINER ── */
        .ap-proposals-box {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 1.75rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          box-sizing: border-box;
        }
        .ap-proposals-header {
          display: flex;
          justifyContent: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          border-bottom: 1px solid #F1F5F9;
          padding-bottom: 1rem;
          margin-bottom: 1.25rem;
        }
        .ap-filter-scroll {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .ap-filter-scroll::-webkit-scrollbar {
          display: none;
        }

        /* ── DESKTOP TABLE VS MOBILE CARDS ── */
        .ap-table-desktop {
          display: block;
          overflow-x: auto;
        }
        .ap-cards-mobile {
          display: none;
        }
        .ap-booking-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 0.85rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          box-sizing: border-box;
        }

        /* ── STICKY MOBILE BOTTOM NAVIGATION ── */
        .ap-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: #FFFFFF;
          border-top: 1px solid #E2E8F0;
          box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
          padding: 0.45rem 0.5rem calc(0.45rem + env(safe-area-inset-bottom, 0px)) 0.5rem;
          justify-content: space-around;
          align-items: center;
          box-sizing: border-box;
        }
        .ap-bottom-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.2rem;
          padding: 0.35rem 0.25rem;
          border: none;
          background: transparent;
          color: #64748B;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.15s;
        }
        .ap-bottom-nav-item.active {
          color: #B83A4B;
        }

        /* ── MODALS OVERLAYS & CARDS ── */
        .ap-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 1rem;
          box-sizing: border-box;
        }
        .ap-modal-card {
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          max-height: 90vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          box-sizing: border-box;
          position: relative;
        }

        /* ── MOBILE BREAKPOINT (< 768px) ── */
        @media (max-width: 768px) {
          .ap-root {
            flex-direction: column;
          }
          .ap-sidebar-desktop {
            display: none !important;
          }
          .ap-mobile-header {
            display: flex !important;
          }
          .ap-bottom-nav {
            display: flex !important;
          }
          .ap-main {
            padding: 0.85rem 0.75rem 5.5rem 0.75rem !important;
          }
          .ap-greeting-banner {
            margin-bottom: 1.25rem !important;
          }
          .ap-greeting-banner h1 {
            font-size: 1.35rem !important;
          }
          .ap-kpi-desktop {
            display: none !important;
          }
          .ap-kpi-mobile {
            display: flex !important;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
          }
          .ap-proposals-box {
            padding: 1rem 0.85rem !important;
            border-radius: 14px !important;
          }
          .ap-proposals-header {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          .ap-table-desktop {
            display: none !important;
          }
          .ap-cards-mobile {
            display: flex !important;
            flex-direction: column;
            gap: 0.75rem;
          }
          .ap-modal-card {
            padding: 1.25rem 1rem !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }

        /* ── DARK MODE ACCORDANCE (AGENTS.md) ── */
        @media (prefers-color-scheme: dark) {
          .ap-root {
            background: #0B0F19 !important;
            color: #F8FAFC !important;
          }
          .ap-sidebar-desktop,
          .ap-mobile-header,
          .ap-drawer,
          .ap-bottom-nav,
          .ap-kpi-desktop,
          .ap-proposals-box,
          .ap-booking-card,
          .ap-modal-card {
            background: #1E293B !important;
            border-color: #334155 !important;
            color: #F8FAFC !important;
          }
          .ap-greeting-banner h1 {
            color: #F8FAFC !important;
          }
          .ap-greeting-banner p {
            color: #94A3B8 !important;
          }
          .ap-proposals-header h3 {
            color: #F8FAFC !important;
          }
          .ap-booking-card {
            background: #182234 !important;
            border-color: #2D3E56 !important;
          }
        }
      `}</style>

      {/* ── 1. DESKTOP LEFT SIDEBAR ── */}
      <aside className="ap-sidebar-desktop">
        <div>
          {/* Profile & Agency Header Card */}
          <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.85rem' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: activeAgent?.logoUrl ? '#FFFFFF' : 'linear-gradient(135deg, #B83A4B 0%, #0F4C3A 100%)',
                border: activeAgent?.logoUrl ? '2px solid #E2E8F0' : 'none',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(184,58,75,0.15)',
                margin: '0 auto',
                overflow: 'hidden',
                padding: activeAgent?.logoUrl ? '6px' : 0,
              }}>
                {activeAgent?.logoUrl ? (
                  <img src={activeAgent.logoUrl} alt={activeAgent?.companyName || 'Agency Logo'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : companyInitials}
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
              href="/services-catalog"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                color: '#0F4C3A',
                fontWeight: 800,
                fontSize: '0.9rem',
                textDecoration: 'none',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                transition: 'all 0.2s'
              }}
            >
              <Compass size={18} color="#0F4C3A" />
              <span>Services Catalog</span>
              <span style={{ fontSize: '0.62rem', background: '#0F4C3A', color: '#FFF', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: 'auto', fontWeight: 800 }}>LIVE</span>
            </Link>

            <Link
              href="/ready-made"
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
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', background: activeTab === 'bookings' ? '#FFF' : '#E2E8F0', color: activeTab === 'bookings' ? '#B83A4B' : '#0F172A', padding: '0.1rem 0.5rem', borderRadius: '10px', fontWeight: 800 }}>
                {proposals.length}
              </span>
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

          {activeAgent?.role === 'admin' && (
            <Link
              href="/admin-dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                background: '#FEF3C7',
                color: '#B45309',
                fontWeight: 700,
                fontSize: '0.8rem',
                textDecoration: 'none',
                width: '100%',
                marginBottom: '0.5rem'
              }}
            >
              <span>⚙️ Admin Dashboard</span>
            </Link>
          )}

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

      {/* ── 2. MOBILE APP TOP HEADER ── */}
      <header className="ap-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: activeAgent?.logoUrl ? '#FFFFFF' : 'linear-gradient(135deg, #B83A4B 0%, #0F4C3A 100%)',
            border: activeAgent?.logoUrl ? '1.5px solid #CBD5E1' : 'none',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            fontWeight: 800,
            overflow: 'hidden',
            padding: activeAgent?.logoUrl ? '3px' : 0,
            flexShrink: 0
          }}>
            {activeAgent?.logoUrl ? (
              <img src={activeAgent.logoUrl} alt={activeAgent?.companyName || 'Agency'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : companyInitials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
              {activeAgent?.companyName || activeAgent?.agentName || 'Agent Portal'}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
              B2B Partner Workspace
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => activeAgent && fetchAgentProposals(activeAgent.email)}
            disabled={refreshing}
            title="Refresh Bookings"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#FFF',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setMobileNavOpen(prev => !prev)}
            aria-label="Toggle Navigation Menu"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #0F172A',
              background: '#0F172A',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── 3. MOBILE NAVIGATION DRAWER & BACKDROP ── */}
      <div 
        className={`ap-drawer-overlay ${mobileNavOpen ? 'open' : ''}`}
        onClick={() => setMobileNavOpen(false)}
      />
      <aside className={`ap-drawer ${mobileNavOpen ? 'open' : ''}`}>
        <div>
          {/* Drawer Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agent Menu</span>
            <button 
              onClick={() => setMobileNavOpen(false)}
              style={{ border: 'none', background: '#F1F5F9', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Profile Card inside Drawer */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.65rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: activeAgent?.logoUrl ? '#FFFFFF' : 'linear-gradient(135deg, #B83A4B 0%, #0F4C3A 100%)',
                border: activeAgent?.logoUrl ? '2px solid #CBD5E1' : 'none',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: 800,
                margin: '0 auto',
                overflow: 'hidden',
                padding: activeAgent?.logoUrl ? '5px' : 0,
              }}>
                {activeAgent?.logoUrl ? (
                  <img src={activeAgent.logoUrl} alt={activeAgent?.companyName || 'Agency Logo'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : companyInitials}
              </div>
              <button
                onClick={() => {
                  setMobileNavOpen(false)
                  setShowBrandingModal(true)
                }}
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

            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.2rem' }}>
              {activeAgent?.companyName || activeAgent?.agentName || 'Flying Wonders B2B Partner'}
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              Member Since {activeAgent?.createdAt ? new Date(activeAgent.createdAt).toLocaleDateString('en-SG', { month: 'short', year: 'numeric' }) : 'May 2026'}
            </span>
          </div>

          {/* Drawer Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              onClick={() => {
                setActiveTab('dashboard')
                setMobileNavOpen(false)
              }}
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
              }}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('bookings')
                setMobileNavOpen(false)
              }}
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
              }}
            >
              <FileText size={18} />
              <span>My Bookings</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', background: activeTab === 'bookings' ? '#FFF' : '#E2E8F0', color: activeTab === 'bookings' ? '#B83A4B' : '#0F172A', padding: '0.1rem 0.5rem', borderRadius: '10px', fontWeight: 800 }}>
                {proposals.length}
              </span>
            </button>

            <Link
              href="/custom-package"
              onClick={() => setMobileNavOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}
            >
              <Package size={18} />
              <span>Build-Packages</span>
            </Link>

            <Link
              href="/services-catalog"
              onClick={() => setMobileNavOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                color: '#0F4C3A',
                fontWeight: 800,
                fontSize: '0.9rem',
                textDecoration: 'none',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
              }}
            >
              <Compass size={18} color="#0F4C3A" />
              <span>Services Catalog</span>
              <span style={{ fontSize: '0.62rem', background: '#0F4C3A', color: '#FFF', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: 'auto', fontWeight: 800 }}>LIVE</span>
            </Link>

            <Link
              href="/ready-made"
              onClick={() => setMobileNavOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}
            >
              <Compass size={18} />
              <span>Readymade</span>
              <span style={{ fontSize: '0.62rem', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FCA5A5', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: 'auto', fontWeight: 800 }}>NEW</span>
            </Link>
          </nav>
        </div>

        {/* Drawer Bottom Actions */}
        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => {
              setMobileNavOpen(false)
              setShowBrandingModal(true)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <Building2 size={16} color="#0F4C3A" />
            <span>Agency Branding</span>
          </button>

          {activeAgent?.role === 'admin' && (
            <Link
              href="/admin-dashboard"
              onClick={() => setMobileNavOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: '#FEF3C7',
                color: '#B45309',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
                width: '100%',
              }}
            >
              <span>⚙️ Admin Operations Dashboard</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              background: '#FEF2F2',
              color: '#EF4444',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── 4. MAIN WORKSPACE ── */}
      <main className="ap-main">
        
        {/* Top Header Banner */}
        <div className="ap-greeting-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
              {getGreeting()}, <span style={{ color: '#B83A4B' }}>{activeAgent?.agentName?.split(' ')[0] || 'Partner'}</span>!
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0.25rem 0 0' }}>
              Here&apos;s what&apos;s happening with your bookings today.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600, background: '#F1F5F9', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
              📅 {new Date().toLocaleDateString('en-SG', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
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

        {/* ── 5. KPI & ACTION BAR (DESKTOP) ── */}
        {activeTab === 'dashboard' && (
          <div className="ap-kpi-desktop">
            {/* Left Button: Operations Dashboard (if admin) */}
            {activeAgent?.role === 'admin' && (
              <Link
                href="/admin-dashboard"
                style={{
                  background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                  color: '#FFF',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '9px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 6px rgba(217,119,6,0.25)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                title="Admin Operations Dashboard"
              >
                <span>👑</span>
                <span>Operations Dashboard</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>→</span>
              </Link>
            )}

            {/* Center: 5 Compact KPI Chips */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              flex: '1 1 auto',
              justifyContent: 'center'
            }}>
              {/* Today's Bookings */}
              <div style={{
                background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                color: '#FFF',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 2px 5px rgba(220,38,38,0.2)'
              }}>
                <Calendar size={14} color="#FFF" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.95 }}>Today:</span>
                <strong style={{ fontSize: '1.05rem', fontWeight: 900, lineHeight: 1 }}>{todayBookings}</strong>
              </div>

              {/* This Month */}
              <div style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#166534',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}>
                <Calendar size={14} color="#166534" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534' }}>This Month:</span>
                <strong style={{ fontSize: '1.05rem', fontWeight: 900, color: '#166534', lineHeight: 1 }}>{thisMonthBookings}</strong>
              </div>

              {/* Confirmed */}
              <div style={{
                background: '#DCFCE7',
                border: '1px solid #86EFAC',
                color: '#15803D',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}>
                <CheckCircle2 size={14} color="#15803D" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803D' }}>Confirmed:</span>
                <strong style={{ fontSize: '1.05rem', fontWeight: 900, color: '#15803D', lineHeight: 1 }}>{confirmedCount}</strong>
              </div>

              {/* Pending */}
              <div style={{
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                color: '#B45309',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}>
                <Clock size={14} color="#B45309" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#B45309' }}>Pending:</span>
                <strong style={{ fontSize: '1.05rem', fontWeight: 900, color: '#B45309', lineHeight: 1 }}>{pendingCount}</strong>
              </div>

              {/* Total Bookings */}
              <div style={{
                background: '#E0F2FE',
                border: '1px solid #BAE6FD',
                color: '#0369A1',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}>
                <TrendingUp size={14} color="#0369A1" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369A1' }}>Total:</span>
                <strong style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0369A1', lineHeight: 1 }}>{totalCount}</strong>
              </div>
            </div>

            {/* Right Button: Launch Package Builder */}
            <Link
              href="/custom-package"
              style={{
                padding: '0.55rem 1.05rem',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #B83A4B 0%, #9F1239 100%)',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '0.8rem',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(184,58,75,0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <Package size={15} />
              <span>Launch Package Builder ⚙️</span>
            </Link>
          </div>
        )}

        {/* ── 5B. KPI & ACTION GRID (MOBILE) ── */}
        {activeTab === 'dashboard' && (
          <div className="ap-kpi-mobile">
            {/* Mobile CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                href="/custom-package"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #B83A4B 0%, #9F1239 100%)',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 3px 8px rgba(184,58,75,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  minHeight: '44px'
                }}
              >
                <Package size={18} />
                <span>Launch Package Builder ⚙️</span>
              </Link>

              {activeAgent?.role === 'admin' && (
                <Link
                  href="/admin-dashboard"
                  style={{
                    background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                    color: '#FFF',
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 6px rgba(217,119,6,0.25)',
                    minHeight: '42px'
                  }}
                >
                  <span>👑 Operations Dashboard</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>→</span>
                </Link>
              )}
            </div>

            {/* Mobile 2-Column KPI Card Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {/* Today's Bookings (Span 2) */}
              <div style={{
                gridColumn: 'span 2',
                background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                color: '#FFF',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(220,38,38,0.25)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} color="#FFF" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Today&apos;s Bookings</span>
                </div>
                <strong style={{ fontSize: '1.4rem', fontWeight: 900 }}>{todayBookings}</strong>
              </div>

              {/* This Month */}
              <div style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#166534',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} color="#166534" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>This Month</span>
                </div>
                <strong style={{ fontSize: '1.25rem', fontWeight: 900 }}>{thisMonthBookings}</strong>
              </div>

              {/* Total Bookings */}
              <div style={{
                background: '#E0F2FE',
                border: '1px solid #BAE6FD',
                color: '#0369A1',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <TrendingUp size={14} color="#0369A1" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Total Bookings</span>
                </div>
                <strong style={{ fontSize: '1.25rem', fontWeight: 900 }}>{totalCount}</strong>
              </div>

              {/* Confirmed */}
              <div style={{
                background: '#DCFCE7',
                border: '1px solid #86EFAC',
                color: '#15803D',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={14} color="#15803D" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Confirmed</span>
                </div>
                <strong style={{ fontSize: '1.25rem', fontWeight: 900 }}>{confirmedCount}</strong>
              </div>

              {/* Pending */}
              <div style={{
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                color: '#B45309',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} color="#B45309" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Pending</span>
                </div>
                <strong style={{ fontSize: '1.25rem', fontWeight: 900 }}>{pendingCount}</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── 6. RECENT BOOKINGS / MY BOOKINGS SECTION ── */}
        {(activeTab === 'dashboard' || activeTab === 'bookings') && (
          <div className="ap-proposals-box">
            
            {/* Header Controls */}
            <div className="ap-proposals-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="#B83A4B" /> My Saved Bookings & Proposals ({filteredProposals.length})
              </h3>

              {/* Status Filter Badges (Smooth Touch Scrollable on Mobile) */}
              <div className="ap-filter-scroll">
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
                      padding: '0.4rem 0.85rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: bookingFilter === f.id ? 'none' : '1px solid #CBD5E1',
                      background: bookingFilter === f.id ? '#0F172A' : '#F8FAFC',
                      color: bookingFilter === f.id ? '#FFF' : '#475569',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
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
                placeholder="🔍 Search by Guest Name, Phone Number, or Proposal Ref..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '16px',
                  outline: 'none',
                  background: '#F8FAFC',
                  boxSizing: 'border-box'
                }}
              />
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* Table & Mobile Cards */}
            {loading ? (
              <p style={{ textAlign: 'center', color: '#64748B', padding: '2.5rem 0', fontSize: '0.9rem' }}>Loading your booking records...</p>
            ) : filteredProposals.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748B', padding: '2.5rem 1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#334155' }}>No matching bookings found</p>
                <p style={{ fontSize: '0.8rem', margin: 0 }}>Try clearing your search or selecting a different status filter.</p>
              </div>
            ) : (
              <>
                {/* ── DESKTOP 7-COLUMN DATA TABLE ── */}
                <div className="ap-table-desktop">
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
                          <tr key={p._id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                            <td style={{ padding: '0.75rem 0.85rem' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Link
                                  href={`/custom-package?ref=${p.proposalNumber}`}
                                  title={`Open ${p.proposalNumber} in Custom Builder Workspace`}
                                  style={{
                                    fontWeight: 800,
                                    color: '#B83A4B',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    fontSize: '0.88rem',
                                    letterSpacing: '0.02em',
                                    transition: 'all 0.15s ease'
                                  }}
                                  className="hover:underline"
                                >
                                  <span>{p.proposalNumber}</span>
                                  <ExternalLink size={12} style={{ opacity: 0.65 }} />
                                </Link>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyRef(e, p.proposalNumber)}
                                  title={copiedRef === p.proposalNumber ? "Copied!" : "Copy Proposal Ref"}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    color: copiedRef === p.proposalNumber ? '#059669' : '#94A3B8',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    transition: 'color 0.15s'
                                  }}
                                >
                                  {copiedRef === p.proposalNumber ? <CheckCircle2 size={12} color="#059669" /> : <Copy size={12} />}
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem 0.85rem' }}>
                              <strong style={{ color: '#0F172A', display: 'block' }}>{p.guestName || 'Valued Guest'}</strong>
                              {p.guestPhone ? (
                                <a
                                  href={`https://wa.me/${p.guestPhone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Chat on WhatsApp"
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#059669',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  📞 {p.guestPhone}
                                </a>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>No phone</span>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem 0.85rem', color: '#334155' }}>
                              {p.adults || 2} Adult{p.adults > 1 ? 's' : ''}{p.kids > 0 ? ` + ${p.kids} Child` : ''} · {p.nights || 3}N
                            </td>
                            <td style={{ padding: '0.75rem 0.85rem', color: '#0284C7', fontWeight: 600 }}>
                              📅 {p.arrivalDate || 'TBD'}
                            </td>
                            <td style={{ padding: '0.75rem 0.85rem' }}>
                              <strong style={{ color: '#166534', display: 'block' }}>S$ {(p.costBreakdown?.totalClientPrice || p.totalClientPrice || 0).toLocaleString()}</strong>
                              {(p.costBreakdown?.totalClientPriceINR || p.totalClientPriceINR) && (
                                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>≈ ₹{(p.costBreakdown?.totalClientPriceINR || p.totalClientPriceINR || 0).toLocaleString('en-IN')}</span>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem 0.85rem' }}>
                              <span style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '12px',
                                fontSize: '0.73rem',
                                fontWeight: 800,
                                background: isConfirmed ? '#DCFCE7' : (isCompleted ? '#E0E7FF' : '#FEF3C7'),
                                color: isConfirmed ? '#166534' : (isCompleted ? '#3730A3' : '#92400E'),
                                display: 'inline-block'
                              }}>
                                {isConfirmed ? '🟢 Confirmed' : (isCompleted ? '✅ Completed' : '🔵 Pending')}
                              </span>
                              {p.statusChangeRequested && (
                                <div style={{
                                  fontSize: '0.68rem',
                                  color: '#D97706',
                                  fontWeight: 700,
                                  marginTop: '0.25rem',
                                  background: '#FEF3C7',
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: '4px',
                                  display: 'inline-block'
                                }}>
                                  ⏳ Pending: {p.requestedStatus === 'ignore' ? 'Closed' : 'Confirmed'}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                {isConfirmed && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const { generateTaxInvoicePdf } = await import('../../utils/invoiceReceiptPdf')
                                      const price = p.costBreakdown?.totalClientPrice || p.totalClientPrice || 0
                                      const adults = p.adults || 2
                                      const kids = p.kids || 0
                                      await generateTaxInvoicePdf({
                                        invoiceNumber: p.invoiceNumber || `INV-${new Date().getFullYear()}-${p.proposalNumber.split('-').pop() || '0001'}`,
                                        invoiceDate: p.invoiceDate || new Date().toISOString().split('T')[0],
                                        proposalNumber: p.proposalNumber,
                                        currencyMode: 'dual',
                                        exchangeRate: 63.5,
                                        companyName: activeAgent?.companyName,
                                        agentName: activeAgent?.agentName,
                                        agentPhone: activeAgent?.phone,
                                        agentEmail: activeAgent?.email,
                                        leadGuestName: p.guestName || 'Valued Guest',
                                        leadGuestPhone: p.guestPhone,
                                        destination: 'Singapore',
                                        travelDates: `${p.arrivalDate || 'TBD'} (${p.nights || 3}N/${(p.nights || 3) + 1}D)`,
                                        nightsCount: p.nights || 3,
                                        paxCount: `${adults} Adults${kids > 0 ? `, ${kids} Child` : ''}`,
                                        hotelName: p.hotelName || 'Standard Hotel',
                                        roomType: p.roomType || 'Standard Room',
                                        items: [
                                          {
                                            description: `Singapore Tour Package (${p.nights || 3}N/${(p.nights || 3) + 1}D)`,
                                            subText: `Accommodations, transfers, and sightseeing admissions for ${adults + kids} Pax.`,
                                            quantity: adults + kids,
                                            unitPriceSgd: Math.round(price / Math.max(1, adults + kids)),
                                            totalSgd: price,
                                          }
                                        ],
                                        payments: (p.paymentLedger || []).map((pay: any) => ({
                                          paymentId: pay.paymentId,
                                          date: pay.date ? new Date(pay.date).toLocaleDateString('en-SG') : new Date().toLocaleDateString('en-SG'),
                                          amountSgd: Number(pay.amount) || 0,
                                          method: pay.method || 'Bank Transfer',
                                          referenceNo: pay.referenceNo,
                                          notes: pay.notes,
                                        })),
                                        status: p.status,
                                      })
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      padding: '0.35rem 0.65rem',
                                      borderRadius: '6px',
                                      background: '#ECFDF5',
                                      color: '#065F46',
                                      border: '1px solid #A7F3D0',
                                      fontWeight: 700,
                                      fontSize: '0.76rem',
                                      cursor: 'pointer',
                                    }}
                                    title="Download Official Tax Invoice PDF"
                                  >
                                    🧾 Invoice
                                  </button>
                                )}

                                {!p.statusChangeRequested && (pStatus === 'pending' || pStatus === 'followup') && (
                                  <button
                                    onClick={() => {
                                      setStatusRequestProposal(p)
                                      setStatusRequestTarget('confirmed')
                                      setStatusRequestNoteText('')
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      padding: '0.35rem 0.75rem',
                                      borderRadius: '6px',
                                      background: '#0F4C3A',
                                      color: '#FFF',
                                      border: 'none',
                                      fontWeight: 700,
                                      fontSize: '0.78rem',
                                      cursor: 'pointer',
                                      transition: 'background 0.15s'
                                    }}
                                  >
                                    ⏳ Confirm
                                  </button>
                                )}
                              </div>
                            </td>

                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── MOBILE TOUCH-FRIENDLY BOOKING CARDS ── */}
                <div className="ap-cards-mobile">
                  {filteredProposals.map((p, idx) => {
                    const pStatus = p.status || 'pending'
                    const isConfirmed = pStatus === 'confirmed' || pStatus === 'scheduled'
                    const isCompleted = pStatus === 'completed'

                    return (
                      <div key={p._id || idx} className="ap-booking-card">
                        {/* Top Row: Ref & Status Pill */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Link
                              href={`/custom-package?ref=${p.proposalNumber}`}
                              title={`Open ${p.proposalNumber} in Custom Builder`}
                              style={{
                                fontWeight: 900,
                                color: '#B83A4B',
                                fontSize: '0.98rem',
                                letterSpacing: '0.02em',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <span>{p.proposalNumber}</span>
                              <ExternalLink size={13} style={{ opacity: 0.65 }} />
                            </Link>
                            <button
                              type="button"
                              onClick={(e) => handleCopyRef(e, p.proposalNumber)}
                              title={copiedRef === p.proposalNumber ? "Copied!" : "Copy Proposal Ref"}
                              style={{
                                background: copiedRef === p.proposalNumber ? '#DCFCE7' : '#F1F5F9',
                                border: '1px solid',
                                borderColor: copiedRef === p.proposalNumber ? '#86EFAC' : '#CBD5E1',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                padding: '0.2rem 0.35rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                fontSize: '0.68rem',
                                color: copiedRef === p.proposalNumber ? '#166534' : '#475569',
                              }}
                            >
                              {copiedRef === p.proposalNumber ? <CheckCircle2 size={11} color="#059669" /> : <Copy size={11} />}
                            </button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              background: isConfirmed ? '#DCFCE7' : (isCompleted ? '#E0E7FF' : '#FEF3C7'),
                              color: isConfirmed ? '#166534' : (isCompleted ? '#3730A3' : '#92400E'),
                              display: 'inline-block'
                            }}>
                              {isConfirmed ? '🟢 Confirmed' : (isCompleted ? '✅ Completed' : '🔵 Pending')}
                            </span>
                            {p.statusChangeRequested && (
                              <span style={{
                                fontSize: '0.7rem',
                                color: '#D97706',
                                fontWeight: 700,
                                background: '#FEF3C7',
                                border: '1px solid #FDE68A',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '6px'
                              }}>
                                ⏳ Pending: {p.requestedStatus === 'ignore' ? 'Closed' : 'Confirmed'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Guest Info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.25rem' }}>
                          <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>
                            👤 {p.guestName || 'Valued Guest'}
                          </strong>
                          {p.guestPhone ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                              <a href={`tel:${p.guestPhone}`} style={{ fontSize: '0.82rem', color: '#0284C7', textDecoration: 'none', fontWeight: 700 }}>
                                📞 {p.guestPhone}
                              </a>
                              <a
                                href={`https://wa.me/${p.guestPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Chat on WhatsApp"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: '4px',
                                  background: '#DCFCE7',
                                  border: '1px solid #86EFAC',
                                  color: '#166534',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  gap: '0.2rem'
                                }}
                              >
                                💬 WhatsApp
                              </a>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>No phone</span>
                          )}
                        </div>

                        {/* 3-Pill Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', background: '#F8FAFC', padding: '0.65rem 0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>ARRIVAL</span>
                            <strong style={{ fontSize: '0.78rem', color: '#0284C7' }}>📅 {p.arrivalDate || 'TBD'}</strong>
                          </div>
                          <div style={{ borderLeft: '1px solid #CBD5E1', borderRight: '1px solid #CBD5E1' }}>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>PAX & STAY</span>
                            <strong style={{ fontSize: '0.78rem', color: '#334155' }}>{p.adults || 2}A{p.kids > 0 ? `+${p.kids}C` : ''} · {p.nights || 3}N</strong>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>PRICE</span>
                            <strong style={{ fontSize: '0.85rem', color: '#166534' }}>S$ {(p.costBreakdown?.totalClientPrice || p.totalClientPrice || 0).toLocaleString()}</strong>
                          </div>
                        </div>

                        {/* Actions */}
                        {!p.statusChangeRequested && (pStatus === 'pending' || pStatus === 'followup') && (
                          <div style={{ marginTop: '0.2rem' }}>
                            <button
                              onClick={() => {
                                setStatusRequestProposal(p)
                                setStatusRequestTarget('confirmed')
                                setStatusRequestNoteText('')
                              }}
                              style={{
                                width: '100%',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.3rem',
                                padding: '0.6rem 0.85rem',
                                borderRadius: '8px',
                                background: '#0F4C3A',
                                color: '#FFF',
                                border: 'none',
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                minHeight: '40px'
                              }}
                            >
                              ⏳ Change Status
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

          </div>
        )}

      </main>

      {/* ── 7. STICKY MOBILE BOTTOM NAVIGATION BAR ── */}
      <nav className="ap-bottom-nav">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`ap-bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`ap-bottom-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
        >
          <div style={{ position: 'relative' }}>
            <FileText size={20} />
            {proposals.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-8px',
                background: '#B83A4B',
                color: '#FFF',
                fontSize: '0.62rem',
                fontWeight: 800,
                borderRadius: '10px',
                padding: '0.05rem 0.35rem',
                lineHeight: 1.2
              }}>
                {proposals.length}
              </span>
            )}
          </div>
          <span>Bookings</span>
        </button>

        <Link
          href="/custom-package"
          className="ap-bottom-nav-item"
          style={{ color: '#0F4C3A' }}
        >
          <Package size={20} />
          <span>Build</span>
        </Link>

        <button
          onClick={() => setMobileNavOpen(true)}
          className="ap-bottom-nav-item"
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </nav>

      {/* ── 8. AGENCY BRANDING MODAL ── */}
      {showBrandingModal && (
        <div className="ap-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowBrandingModal(false) }}>
          <div className="ap-modal-card" style={{ width: '500px', maxWidth: '94vw', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} color="#B83A4B" /> White-Label Agency Branding
              </h3>
              <button onClick={() => setShowBrandingModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B', padding: '0.25rem' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.83rem', color: '#64748B', marginTop: 0, marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Your agency branding will appear on all client-facing PDF quotes, itinerary documents, and WhatsApp copy text.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Agency Logo Upload & Preview */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Agency Logo (PDF & Itineraries)</label>
                {brandingLogoPreview ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', flexWrap: 'wrap' }}>
                    <div style={{ width: '80px', height: '50px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '4px' }}>
                      <img src={brandingLogoPreview} alt="Agency Logo Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: '130px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B' }}>Logo Attached</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Renders high-contrast on PDF proposals</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <label style={{ cursor: 'pointer', padding: '0.45rem 0.75rem', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <UploadCloud size={14} /> Replace
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          style={{ display: 'none' }}
                          onChange={e => {
                            const f = e.target.files?.[0]
                            if (f) {
                              setBrandingLogoFile(f)
                              setBrandingLogoPreview(URL.createObjectURL(f))
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setBrandingLogoFile(null)
                          setBrandingLogoPreview('')
                          setCustomAgencyLogoUrl('')
                        }}
                        style={{ padding: '0.45rem 0.75rem', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#E11D48', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.25rem', border: '2px dashed #CBD5E1', borderRadius: '10px', background: '#F8FAFC', cursor: 'pointer', textAlign: 'center' }}>
                    <UploadCloud size={24} color="#64748B" style={{ marginBottom: '0.4rem' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Upload Agency Logo</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>PNG, JPG, SVG or WebP • Recommended transparent background</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) {
                          setBrandingLogoFile(f)
                          setBrandingLogoPreview(URL.createObjectURL(f))
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Agency / Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Flying Wonders Private Limited"
                  value={customAgencyName}
                  onChange={e => setCustomAgencyName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Agency Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. info.flyingwonders@gmail.com"
                  value={customAgencyEmail}
                  onChange={e => setCustomAgencyEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Agency Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9886171251"
                  value={customAgencyPhone}
                  onChange={e => setCustomAgencyPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowBrandingModal(false)}
                style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', minHeight: '42px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={brandingUploading}
                onClick={handleSaveBranding}
                style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', background: '#B83A4B', color: '#FFF', fontWeight: 700, cursor: brandingUploading ? 'not-allowed' : 'pointer', fontSize: '0.85rem', minHeight: '42px' }}
              >
                {brandingUploading ? 'Saving Logo & Branding...' : 'Save Branding Settings'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── 9. AGENT OTP LOGIN MODAL ── */}
      {showLoginModal && (
        <div className="ap-modal-overlay">
          <div className="ap-modal-card" style={{ width: '440px', maxWidth: '94vw', padding: '2rem 1.75rem', textAlign: 'center' }}>
            <button
              onClick={() => {
                setShowLoginModal(false)
                window.location.href = '/'
              }}
              style={{
                position: 'absolute',
                top: '0.85rem',
                right: '0.85rem',
                background: 'transparent',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: '#94A3B8',
                padding: '0.35rem',
                lineHeight: 1
              }}
              title="Close and return to Home"
            >
              ✕
            </button>

            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', color: '#B83A4B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem', fontWeight: 800 }}>
              🔑
            </div>

            <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              B2B Agent Portal Login
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.25rem', lineHeight: 1.4 }}>
              Enter your registered B2B email to receive a single-use OTP verification code.
            </p>

            {/* Toggle Tab */}
            {otpStep === 'email' && (
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #E2E8F0', marginBottom: '1.25rem', paddingBottom: '2px' }}>
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
              <div style={{ background: '#FFF5F5', color: '#C53030', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.25rem', borderLeft: '4px solid #C53030', textAlign: 'left' }}>
                ⚠️ {authError}
                {(authError.toLowerCase().includes('account not found') || authError.toLowerCase().includes('register')) && (
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                    style={{ display: 'block', marginTop: '0.5rem', background: '#C53030', color: '#FFF', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
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
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '16px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem', color: '#475569' }}>Agent Name *</label>
                      <input 
                        type="text" required placeholder="e.g. Amit Kumar"
                        value={regAgentName} onChange={e => setRegAgentName(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '16px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem', color: '#475569' }}>Phone / WhatsApp Number *</label>
                      <input 
                        type="tel" required placeholder="e.g. +91 9886171251"
                        value={regPhone} onChange={e => setRegPhone(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '16px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem', color: '#475569' }}>
                        Agency Logo <span style={{ fontWeight: 400, color: '#94A3B8' }}>(Optional)</span>
                      </label>
                      {regLogoPreview ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                          <div style={{ width: '50px', height: '36px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <img src={regLogoPreview} alt="Logo preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 700, flex: 1 }}>Logo selected</span>
                          <button
                            type="button"
                            onClick={() => { setRegLogoFile(null); setRegLogoPreview(''); setRegLogoAssetId(''); }}
                            style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.75rem', border: '1px dashed #CBD5E1', borderRadius: '8px', background: '#F8FAFC', cursor: 'pointer', fontSize: '0.78rem', color: '#475569' }}>
                          <UploadCloud size={16} color="#64748B" />
                          <span>Choose Agency Logo (PNG, JPG, SVG)</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            style={{ display: 'none' }}
                            onChange={e => {
                              const f = e.target.files?.[0]
                              if (f) {
                                setRegLogoFile(f)
                                setRegLogoPreview(URL.createObjectURL(f))
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem', color: '#475569' }}>Work Email Address *</label>
                  <input
                    type="email"
                    placeholder="Registered B2B Email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={authSubmitting}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#B83A4B', color: '#FFF', fontWeight: 800, fontSize: '0.9rem', cursor: authSubmitting ? 'not-allowed' : 'pointer', marginTop: '0.5rem', minHeight: '44px' }}
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
                  placeholder="Enter 6-digit OTP"
                  required
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.25em', fontWeight: 800, outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setOtpStep('email')}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', color: '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', minHeight: '44px' }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={authSubmitting}
                    style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#0F4C3A', color: '#FFF', fontWeight: 800, fontSize: '0.9rem', cursor: authSubmitting ? 'not-allowed' : 'pointer', minHeight: '44px' }}
                  >
                    {authSubmitting ? 'Verifying...' : 'Verify & Log In 🔓'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ── 10. STATUS CHANGE REQUEST MODAL ── */}
      {statusRequestProposal && (
        <div className="ap-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setStatusRequestProposal(null) }}>
          <div className="ap-modal-card" style={{ width: '450px', maxWidth: '94vw', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                Request Status Change
              </h3>
              <button onClick={() => setStatusRequestProposal(null)} style={{ border: 'none', background: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B', padding: '0.25rem' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: 0, marginBottom: '1rem' }}>
              Submit a request to update proposal <strong>{statusRequestProposal.proposalNumber}</strong> ({statusRequestProposal.guestName || 'Valued Guest'}).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Target Status *</label>
                <select
                  value={statusRequestTarget}
                  onChange={e => setStatusRequestTarget(e.target.value as any)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="confirmed">🟢 Confirmed</option>
                  <option value="ignore">Ignore / Closed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Reason / Note for Admin</label>
                <textarea
                  placeholder="e.g. Guest paid booking deposit via bank transfer. Ref #998311."
                  value={statusRequestNoteText}
                  onChange={e => setStatusRequestNoteText(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '16px', outline: 'none', height: '80px', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => setStatusRequestProposal(null)}
                style={{ padding: '0.6rem 1.15rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', color: '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', minHeight: '42px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestStatusChange}
                disabled={statusRequestSubmitting}
                style={{ padding: '0.6rem 1.35rem', borderRadius: '8px', border: 'none', background: '#0F4C3A', color: '#FFF', fontWeight: 800, fontSize: '0.85rem', cursor: statusRequestSubmitting ? 'not-allowed' : 'pointer', minHeight: '42px' }}
              >
                {statusRequestSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
