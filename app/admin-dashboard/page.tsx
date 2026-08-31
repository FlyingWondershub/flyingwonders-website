'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Download, ShieldAlert, Loader2, CheckCircle, XCircle, Activity, Users,
  DollarSign, RefreshCw, FileText, Map, ExternalLink, Zap, Package, Compass,
  Calendar, Eye, Filter, ChevronLeft, ChevronRight, AlertCircle, Clock,
  ChevronDown, ChevronUp, CalendarCheck, CheckCheck, LayoutDashboard, Database,
  ArrowRight, ShieldCheck, CreditCard, Menu, PanelLeftClose, PanelLeftOpen, Megaphone,
  Wrench, Globe, ShoppingBag, FileSpreadsheet
} from 'lucide-react'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('metrics')
  
  // Sidebar Width Adjustment State
  const [sidebarWidth, setSidebarWidth] = useState(250) // Default 250px
  const [isCollapsed, setIsCollapsed] = useState(true)
  const isResizingRef = useRef(false)

  const router = useRouter()

  const [metrics, setMetrics] = useState({ activeAgents: 0, pendingPayments: 0, totalContacts: 0 })
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])

  // ── Package Lifecycle State ──
  const [proposals, setProposals] = useState<any[]>([])
  const [packageFilter, setPackageFilter] = useState('all')
  const [packageSearch, setPackageSearch] = useState('')
  const [packageViewMode, setPackageViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null)
  
  // ── Accounts & Ledger State ──
  const [accountFilter, setAccountFilter] = useState<'all' | 'unpaid' | 'partial' | 'settled' | 'overpaid'>('all')
  const [accountSearch, setAccountSearch] = useState('')
  const [accountsViewMode, setAccountsViewMode] = useState<'agent' | 'individual'>('agent')
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({})
  
  // Expand / Collapse row tracking
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

  // Calendar State
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date())

  const [refreshing, setRefreshing] = useState(false)
  const [competitorPrices, setCompetitorPrices] = useState<any[]>([])
  const [refreshingPrices, setRefreshingPrices] = useState(false)

  // ── Travel Consulting Requests State ──
  const [consultingBookings, setConsultingBookings] = useState<any[]>([])
  const [loadingConsulting, setLoadingConsulting] = useState(false)

  const fetchConsultingBookings = async () => {
    setLoadingConsulting(true)
    try {
      const res = await fetch('/api/admin/travel-consulting')
      const json = await res.json()
      if (json.success && Array.isArray(json.bookings)) {
        setConsultingBookings(json.bookings)
      }
    } catch (e) {
    } finally {
      setLoadingConsulting(false)
    }
  }

  useEffect(() => {
    fetchConsultingBookings()
  }, [])

  // Ad Management Toggles State
  const [adBlogEnabled, setAdBlogEnabled] = useState(true)
  const [adTravelToolsEnabled, setAdTravelToolsEnabled] = useState(true)
  const [adTravelNewsEnabled, setAdTravelNewsEnabled] = useState(true)
  const [adBorderTrafficEnabled, setAdBorderTrafficEnabled] = useState(true)
  const [adAirlinePromosEnabled, setAdAirlinePromosEnabled] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAdBlogEnabled(localStorage.getItem('fw_ads_disabled_blog') !== 'true')
      setAdTravelToolsEnabled(localStorage.getItem('fw_ads_disabled_travel-tools') !== 'true')
      setAdTravelNewsEnabled(localStorage.getItem('fw_hide_travel_news') !== 'true')
      setAdBorderTrafficEnabled(localStorage.getItem('fw_hide_border_traffic') !== 'true')
      setAdAirlinePromosEnabled(localStorage.getItem('fw_hide_airline_promos') !== 'true')
    }
  }, [])

  const toggleAdCategory = (category: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    if (category === 'blog') setAdBlogEnabled(newStatus)
    if (category === 'travel-tools') setAdTravelToolsEnabled(newStatus)
    
    if (typeof window !== 'undefined') {
      if (!newStatus) {
        localStorage.setItem(`fw_ads_disabled_${category}`, 'true')
      } else {
        localStorage.removeItem(`fw_ads_disabled_${category}`)
      }
    }
    alert(`Ad placement for ${category} is now ${newStatus ? 'ENABLED 🟢' : 'DISABLED 🔴'}`)
  }

  const toggleTravelNews = () => {
    const newStatus = !adTravelNewsEnabled
    setAdTravelNewsEnabled(newStatus)
    if (typeof window !== 'undefined') {
      if (!newStatus) {
        localStorage.setItem('fw_hide_travel_news', 'true')
      } else {
        localStorage.removeItem('fw_hide_travel_news')
      }
    }
    alert(`Travel News Radar on /travel-tools is now ${newStatus ? 'ENABLED 🟢' : 'DISABLED / HIDDEN 🔴'}`)
  }

  const toggleBorderTraffic = () => {
    const newStatus = !adBorderTrafficEnabled
    setAdBorderTrafficEnabled(newStatus)
    if (typeof window !== 'undefined') {
      if (!newStatus) {
        localStorage.setItem('fw_hide_border_traffic', 'true')
      } else {
        localStorage.removeItem('fw_hide_border_traffic')
      }
    }
    alert(`Border Traffic Radar on /travel-tools is now ${newStatus ? 'ENABLED 🟢' : 'DISABLED / HIDDEN 🔴'}`)
  }

  const toggleAirlinePromos = () => {
    const newStatus = !adAirlinePromosEnabled
    setAdAirlinePromosEnabled(newStatus)
    if (typeof window !== 'undefined') {
      if (!newStatus) {
        localStorage.setItem('fw_hide_airline_promos', 'true')
      } else {
        localStorage.removeItem('fw_hide_airline_promos')
      }
    }
    alert(`Airline Promotions Radar on /travel-tools is now ${newStatus ? 'ENABLED 🟢' : 'DISABLED / HIDDEN 🔴'}`)
  }

  const fetchCompetitorPrices = async () => {
    try {
      const res = await fetch(`/api/admin/price-tracker?cb=${Date.now()}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setCompetitorPrices(data)
      }
    } catch (err) {
      console.error('Failed to fetch competitor prices:', err)
    }
  }

  const triggerPriceRefresh = async () => {
    setRefreshingPrices(true)
    try {
      const res = await fetch('/api/admin/price-tracker', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        await fetchCompetitorPrices()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setRefreshingPrices(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Sidebar drag handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return
      const newWidth = Math.max(70, Math.min(400, e.clientX))
      setSidebarWidth(newWidth)
      if (newWidth <= 90) {
        setIsCollapsed(true)
      } else {
        setIsCollapsed(false)
      }
    }

    const handleMouseUp = () => {
      isResizingRef.current = false
      document.body.style.cursor = 'default'
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    isResizingRef.current = true
    document.body.style.cursor = 'col-resize'
  }

  const toggleSidebarCollapse = () => {
    if (isCollapsed) {
      setIsCollapsed(false)
      setSidebarWidth(250)
    } else {
      setIsCollapsed(true)
      setSidebarWidth(70)
    }
  }

  const fetchData = async () => {
    setRefreshing(true)
    try {
      const cb = Date.now()
      const [authRes, metRes, payRes, agentRes, logRes, propRes] = await Promise.all([
        fetch(`/api/auth/check?cb=${cb}`),
        fetch(`/api/admin/metrics?cb=${cb}`),
        fetch(`/api/admin/payments/pending?cb=${cb}`),
        fetch(`/api/admin/agents?cb=${cb}`),
        fetch(`/api/admin/audit-logs?cb=${cb}`),
        fetch(`/api/proposals?listAll=true&cb=${cb}`)
      ])

      const authData = await authRes.json()
      if (authData.authenticated && authData.agent?.role === 'admin') {
        setIsAdmin(true)
        setMetrics(await metRes.json())
        setPendingPayments(await payRes.json())
        setAgents(await agentRes.json())
        setLogs(await logRes.json())

        const propData = await propRes.json()
        if (propData.success && Array.isArray(propData.list)) {
          setProposals(propData.list)
        }
        await fetchCompetitorPrices()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      await fetch('/api/admin/payments/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status })
      })
      fetchData()
    } catch (e) {
      alert('Failed to update payment status')
    }
  }

  const toggleAgentStatus = async (agentId: string, currentState: boolean) => {
    try {
      await fetch('/api/admin/agents/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, isActive: !currentState })
      })
      fetchData()
    } catch (e) {
      alert('Failed to toggle agent status')
    }
  }

  // ── Update Package Status (Admin Only) ──
  const updatePackageStatus = async (proposalId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/packages/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, status })
      })
      const data = await res.json()
      if (data.success) {
        setProposals((prev: any[]) => prev.map(p => p._id === proposalId ? { ...p, status } : p))
        if (selectedProposal && selectedProposal._id === proposalId) {
          setSelectedProposal((prev: any) => prev ? { ...prev, status } : null)
        }
      } else {
        alert(data.error || 'Failed to update package status')
      }
    } catch (e) {
      alert('Error updating package status')
    }
  }

  // Scroll to section helper
  const scrollToSection = (sectionId: string, filter?: string) => {
    setActiveTab(sectionId)
    if (filter) {
      setPackageFilter(filter)
    }
    const elem = document.getElementById(sectionId)
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="var(--emerald-secondary)" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#F7FAFC' }}>
        <ShieldAlert size={64} color="#E53E3E" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.5rem', color: '#2D3748', marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ color: '#4A5568', fontSize: '1.1rem', marginBottom: '2rem' }}>You must log in as an administrator to view this page.</p>
        <button
          onClick={() => router.push('/')}
          style={{ padding: '0.75rem 2rem', background: 'var(--emerald-secondary)', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
        >
          Return Home
        </button>
      </div>
    )
  }

  // ── Package Analytics Calculations ──
  const totalPackages = proposals.length
  const confirmedPackages = proposals.filter(p => p.status === 'confirmed')
  const scheduledPackages = proposals.filter(p => p.status === 'scheduled')
  const completedPackages = proposals.filter(p => p.status === 'completed')
  const followupPackages = proposals.filter(p => p.status === 'followup')
  const pendingPackages = proposals.filter(p => !p.status || p.status === 'pending')
  const ignoredPackages = proposals.filter(p => p.status === 'ignore')
  
  const pendingApprovalsCount = proposals.filter(p => p.statusChangeRequested).length

  const confirmedRevenueSGD = confirmedPackages.reduce((sum, p) => sum + (Number(p.totalClientPrice) || 0), 0)
  const confirmedRevenueINR = confirmedPackages.reduce((sum, p) => sum + (Number(p.costBreakdown?.totalClientPriceINR) || 0), 0)

  // Filtered Proposals
  const filteredProposals = proposals.filter(p => {
    const pStatus = p.status || 'pending'
    const matchesFilter = packageFilter === 'all' || pStatus === packageFilter
    const term = packageSearch.toLowerCase()
    const matchesSearch = !term ||
      (p.proposalNumber && p.proposalNumber.toLowerCase().includes(term)) ||
      (p.guestName && p.guestName.toLowerCase().includes(term)) ||
      (p.agent?.email && p.agent.email.toLowerCase().includes(term))
    return matchesFilter && matchesSearch
  })

  // Calendar Helpers
  const year = currentMonthDate.getFullYear()
  const month = currentMonthDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const getStatusBadge = (st: string = 'pending') => {
    switch (st) {
      case 'confirmed': return { label: '🟢 Confirmed',   bg: '#C6F6D5', color: '#22543D' }
      case 'scheduled': return { label: '💜 Scheduled',   bg: '#E9D8FD', color: '#553C9A' }
      case 'completed': return { label: '✅ Completed',   bg: '#D6BCFA', color: '#322659' }
      case 'followup':  return { label: '🟡 Follow-Up',   bg: '#FEFCBF', color: '#744210' }
      case 'ignore':    return { label: '⚪ Ignored',     bg: '#EDF2F7', color: '#4A5568' }
      default:          return { label: '🔵 Pending',     bg: '#EBF4FF', color: '#2B6CB0' }
    }
  }

  // Helper to format creation / last updated time compactly (e.g. "Upd: 29 Jul 11:45 AM")
  const getLatestTimestamp = (p: any) => {
    const created = p._createdAt ? new Date(p._createdAt).getTime() : 0
    const updated = p._updatedAt ? new Date(p._updatedAt).getTime() : 0
    const latestTime = Math.max(created, updated)
    if (!latestTime) return 'N/A'
    const isUpdate = updated > created
    const formatted = new Date(latestTime).toLocaleString('en-SG', {
      day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
    return `${isUpdate ? 'Upd' : 'Cre'}: ${formatted}`
  }

  // Navigation Items for Left Menu
  const navItems = [
    { id: 'section-metrics', label: 'KPI Overview', icon: LayoutDashboard },
    { id: 'section-packages', label: 'Packages & Calendar', icon: Package, badge: totalPackages },
    { id: 'section-approvals', label: 'Pending Approvals', icon: Clock, badge: pendingApprovalsCount },
    { id: 'section-accounts', label: 'Accounts & Ledger', icon: DollarSign },
    { id: 'section-sitemap', label: 'Site Map & Links', icon: Map },
    { id: 'section-payments', label: 'Pending Payments', icon: CreditCard, badge: pendingPayments.length },
    { id: 'section-consulting', label: 'Travel Consulting Leads', icon: Calendar },
    { id: 'section-agents', label: 'Agent Approvals', icon: Users, badge: metrics.activeAgents },
    { id: 'section-exports', label: 'Data Exports', icon: Download },
    { id: 'section-competitor-pricing', label: 'Competitor Tracker', icon: Eye },
    { id: 'section-ads', label: 'Ads & Monetization', icon: Megaphone },
    { id: 'section-audit-logs', label: 'Audit Logs', icon: ShieldCheck, badge: logs.length },
  ]

  const actualWidth = isCollapsed ? 70 : sidebarWidth

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAFC', display: 'flex' }}>
      
      {/* ── LEFT SIDEBAR NAVIGATION MENU (RESIZABLE & COLLAPSIBLE) ── */}
      <aside style={{
        width: `${actualWidth}px`,
        transition: isResizingRef.current ? 'none' : 'width 0.2s ease',
        background: '#1A202C',
        color: '#E2E8F0',
        padding: isCollapsed ? '1.5rem 0.5rem' : '1.5rem 0.85rem',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
        zIndex: 100,
        userSelect: 'none'
      }}>
        
        {/* Resize Handle Bar on right edge */}
        <div
          onMouseDown={startResizing}
          title="Drag left/right to resize navigation bar width"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '6px',
            height: '100%',
            cursor: 'col-resize',
            background: 'transparent',
            zIndex: 10
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--emerald-secondary)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        />

        {/* Brand Header & Toggle Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          paddingBottom: '1.2rem',
          borderBottom: '1px solid #2D3748',
          marginBottom: '1.25rem'
        }}>
          {!isCollapsed && (
            <div>
              <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-accent)', whiteSpace: 'nowrap' }}>
                Flying Wonders
              </div>
              <div style={{ fontSize: '0.68rem', color: '#A0AEC0', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Admin Command
              </div>
            </div>
          )}
          
          <button
            onClick={toggleSidebarCollapse}
            title={isCollapsed ? "Expand sidebar width" : "Collapse sidebar"}
            style={{ border: 'none', background: '#2D3748', color: '#A0AEC0', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Preset Width Quick Buttons (Visible when expanded) */}
        {!isCollapsed && actualWidth > 180 && (
          <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1rem', background: '#2D3748', padding: '0.2rem', borderRadius: '6px' }}>
            <button onClick={() => { setIsCollapsed(false); setSidebarWidth(200); }} style={{ flex: 1, border: 'none', background: sidebarWidth <= 210 ? 'var(--emerald-secondary)' : 'transparent', color: '#FFF', fontSize: '0.65rem', fontWeight: 700, borderRadius: '4px', cursor: 'pointer', padding: '0.2rem' }}>Compact</button>
            <button onClick={() => { setIsCollapsed(false); setSidebarWidth(260); }} style={{ flex: 1, border: 'none', background: sidebarWidth > 210 && sidebarWidth <= 290 ? 'var(--emerald-secondary)' : 'transparent', color: '#FFF', fontSize: '0.65rem', fontWeight: 700, borderRadius: '4px', cursor: 'pointer', padding: '0.2rem' }}>Normal</button>
            <button onClick={() => { setIsCollapsed(false); setSidebarWidth(320); }} style={{ flex: 1, border: 'none', background: sidebarWidth > 290 ? 'var(--emerald-secondary)' : 'transparent', color: '#FFF', fontSize: '0.65rem', fontWeight: 700, borderRadius: '4px', cursor: 'pointer', padding: '0.2rem' }}>Wide</button>
          </div>
        )}

        {/* Menu Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          {!isCollapsed && (
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#718096', fontWeight: 800, paddingLeft: '0.5rem', marginBottom: '0.35rem' }}>
              Navigation
            </div>
          )}
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                title={isCollapsed ? `${item.label} (${item.badge ?? ''})` : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  width: '100%',
                  padding: isCollapsed ? '0.65rem 0' : '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'var(--emerald-secondary)' : 'transparent',
                  color: isActive ? '#FFF' : '#CBD5E0',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease-in-out'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#2D3748' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <Icon size={16} color={isActive ? '#FFF' : 'var(--gold-accent)'} />
                  {!isCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                </div>
                {!isCollapsed && item.badge !== undefined && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#2D3748',
                    color: isActive ? '#FFF' : '#A0AEC0'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ borderTop: '1px solid #2D3748', paddingTop: '0.85rem', marginTop: '1rem' }}>
          <button
            onClick={() => router.push('/')}
            title="Return to main public website"
            style={{ width: '100%', padding: '0.5rem', background: '#2D3748', color: '#CBD5E0', border: 'none', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
          >
            ← {!isCollapsed && 'Main Site'}
          </button>
        </div>
      </aside>

      {/* ── MAIN DASHBOARD CONTENT AREA ── */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: '1400px', overflowX: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.1rem', color: '#2D3748', margin: 0 }}>Admin Operations Dashboard</h1>
            <p style={{ color: '#4A5568', fontSize: '0.92rem', margin: '0.25rem 0 0 0' }}>Manage package lifecycles, booking calendar, approvals & audit logs.</p>
          </div>
          <button 
            onClick={fetchData} 
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>

        {/* ── SECTION 1: ULTRA-COMPACT KPI METRICS ROW ── */}
        <div id="section-metrics" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <LayoutDashboard size={18} color="var(--emerald-secondary)" />
            <h2 style={{ fontSize: '1.2rem', color: '#2D3748', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>Key Performance Indicators</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.5rem' }}>
            
            {/* 1. Active Agents */}
            <div style={{ background: '#FFF', padding: '0.45rem 0.65rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                <div style={{ padding: '0.25rem', background: '#E6FFFA', borderRadius: '6px' }}><Users color="#319795" size={13} /></div>
                <h3 style={{ margin: 0, color: '#718096', fontSize: '0.68rem', fontWeight: 600 }}>Active Agents</h3>
              </div>
              <button
                onClick={() => scrollToSection('section-agents')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '1.15rem', fontWeight: 800, color: '#319795', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                title="Click to view agent approvals section"
              >
                {metrics.activeAgents} <ArrowRight size={12} />
              </button>
            </div>

            {/* 2. Total Saved Packages */}
            <div style={{ background: '#FFF', padding: '0.45rem 0.65rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                <div style={{ padding: '0.25rem', background: '#EBF4FF', borderRadius: '6px' }}><Package color="#3182CE" size={13} /></div>
                <h3 style={{ margin: 0, color: '#718096', fontSize: '0.68rem', fontWeight: 600 }}>Total Packages</h3>
              </div>
              <button
                onClick={() => scrollToSection('section-packages', 'all')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '1.15rem', fontWeight: 800, color: '#3182CE', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                title="Click to view all packages"
              >
                {totalPackages} <ArrowRight size={12} />
              </button>
            </div>

            {/* 3. Confirmed Packages */}
            <div style={{ background: '#FFF', padding: '0.45rem 0.65rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                <div style={{ padding: '0.25rem', background: '#C6F6D5', borderRadius: '6px' }}><CheckCircle color="#22543D" size={13} /></div>
                <h3 style={{ margin: 0, color: '#718096', fontSize: '0.68rem', fontWeight: 600 }}>Confirmed</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <button
                  onClick={() => scrollToSection('section-packages', 'confirmed')}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '1.15rem', fontWeight: 800, color: '#22543D', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                  title="Click to filter confirmed packages"
                >
                  {confirmedPackages.length} <ArrowRight size={12} />
                </button>
                <span style={{ fontSize: '0.62rem', color: '#718096', fontWeight: 600, whiteSpace: 'nowrap' }}>S${confirmedRevenueSGD}</span>
              </div>
            </div>

            {/* 4. Scheduled Packages */}
            <div style={{ background: '#FFF', padding: '0.45rem 0.65rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                <div style={{ padding: '0.25rem', background: '#E9D8FD', borderRadius: '6px' }}><CalendarCheck color="#553C9A" size={13} /></div>
                <h3 style={{ margin: 0, color: '#718096', fontSize: '0.68rem', fontWeight: 600 }}>Scheduled</h3>
              </div>
              <button
                onClick={() => scrollToSection('section-packages', 'scheduled')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '1.15rem', fontWeight: 800, color: '#553C9A', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                title="Click to filter scheduled packages"
              >
                {scheduledPackages.length} <ArrowRight size={12} />
              </button>
            </div>

            {/* 5. Completed Packages */}
            <div style={{ background: '#FFF', padding: '0.45rem 0.65rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                <div style={{ padding: '0.25rem', background: '#D6BCFA', borderRadius: '6px' }}><CheckCheck color="#322659" size={13} /></div>
                <h3 style={{ margin: 0, color: '#718096', fontSize: '0.68rem', fontWeight: 600 }}>Completed</h3>
              </div>
              <button
                onClick={() => scrollToSection('section-packages', 'completed')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '1.15rem', fontWeight: 800, color: '#322659', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                title="Click to filter completed packages"
              >
                {completedPackages.length} <ArrowRight size={12} />
              </button>
            </div>

            {/* 6. Follow-Up Needed */}
            <div style={{ background: '#FFF', padding: '0.45rem 0.65rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                <div style={{ padding: '0.25rem', background: '#FEFCBF', borderRadius: '6px' }}><Clock color="#B7791F" size={13} /></div>
                <h3 style={{ margin: 0, color: '#718096', fontSize: '0.68rem', fontWeight: 600 }}>Follow-Up</h3>
              </div>
              <button
                onClick={() => scrollToSection('section-packages', 'followup')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '1.15rem', fontWeight: 800, color: '#B7791F', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                title="Click to filter follow-up packages"
              >
                {followupPackages.length} <ArrowRight size={12} />
              </button>
            </div>

            {/* 7. Pending Payments */}
            <div style={{ background: '#FFF', padding: '0.45rem 0.65rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                <div style={{ padding: '0.25rem', background: '#FED7D7', borderRadius: '6px' }}><CreditCard color="#9B2C2C" size={13} /></div>
                <h3 style={{ margin: 0, color: '#718096', fontSize: '0.68rem', fontWeight: 600 }}>Pending Pay</h3>
              </div>
              <button
                onClick={() => scrollToSection('section-payments')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '1.15rem', fontWeight: 800, color: '#9B2C2C', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                title="Click to view pending payments"
              >
                {pendingPayments.length} <ArrowRight size={12} />
              </button>
            </div>

          </div>
        </div>

        {/* ── SECTION 2: SAVED PACKAGES LIFECYCLE & CALENDAR MANAGER ── */}
        <div id="section-packages" style={{ background: '#FFF', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '2.5rem', border: '1px solid #EDF2F7' }}>
          
          {/* Header Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: '#2D3748', margin: 0, fontFamily: 'var(--font-playfair), serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package color="var(--emerald-secondary)" size={20} /> Packages Lifecycle & Calendar
              </h2>
              <p style={{ color: '#718096', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>
                Lifecycle Sequence: Pending ➔ Follow-Up ➔ Confirmed (Admin) ➔ Scheduled ➔ Completed.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {/* View Switcher */}
              <div style={{ background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.2rem', display: 'flex', gap: '0.2rem' }}>
                <button
                  onClick={() => setPackageViewMode('list')}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', background: packageViewMode === 'list' ? 'var(--emerald-secondary)' : 'transparent', color: packageViewMode === 'list' ? '#FFF' : '#4A5568', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  📋 List Manager
                </button>
                <button
                  onClick={() => setPackageViewMode('calendar')}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', background: packageViewMode === 'calendar' ? 'var(--emerald-secondary)' : 'transparent', color: packageViewMode === 'calendar' ? '#FFF' : '#4A5568', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  📅 Arrival Calendar
                </button>
              </div>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `All (${proposals.length})` },
                { id: 'pending', label: `🔵 Pending (${pendingPackages.length})` },
                { id: 'followup', label: `🟡 Follow-Up (${followupPackages.length})` },
                { id: 'confirmed', label: `🟢 Confirmed (${confirmedPackages.length})` },
                { id: 'scheduled', label: `💜 Scheduled (${scheduledPackages.length})` },
                { id: 'completed', label: `✅ Completed (${completedPackages.length})` },
                { id: 'ignore', label: `⚪ Ignored (${ignoredPackages.length})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setPackageFilter(f.id)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '16px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    border: packageFilter === f.id ? 'none' : '1px solid #E2E8F0',
                    background: packageFilter === f.id ? '#2D3748' : '#F7FAFC',
                    color: packageFilter === f.id ? '#FFF' : '#4A5568',
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="🔍 Search guest, FW number, agent..."
              value={packageSearch}
              onChange={e => setPackageSearch(e.target.value)}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.82rem', width: '230px', outline: 'none' }}
            />
          </div>

          {/* VIEW MODE 1: LIST MANAGER WITH EXPAND / COLLAPSE */}
          {packageViewMode === 'list' && (
            <div style={{ overflowX: 'auto' }}>
              {filteredProposals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#A0AEC0', fontSize: '0.88rem' }}>No packages match the selected criteria.</div>
              ) : (
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#718096' }}>
                      <th style={{ padding: '0.5rem 0.3rem', width: '25px' }}></th>
                      <th style={{ padding: '0.5rem 0.65rem' }}>Proposal Ref</th>
                      <th style={{ padding: '0.5rem 0.65rem' }}>Guest Name</th>
                      <th style={{ padding: '0.5rem 0.65rem' }}>Agent / Company</th>
                      <th style={{ padding: '0.5rem 0.65rem' }}>Arrival Date</th>
                      <th style={{ padding: '0.5rem 0.65rem' }}>Total Cost (SGD / ₹)</th>
                      <th style={{ padding: '0.5rem 0.65rem' }}>Latest Activity</th>
                      <th style={{ padding: '0.5rem 0.65rem' }}>Current Status</th>
                      <th style={{ padding: '0.5rem 0.65rem' }}>Set Lifecycle Status</th>
                      <th style={{ padding: '0.5rem 0.65rem', textAlign: 'right' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProposals.map(p => {
                      const badge = getStatusBadge(p.status)
                      const isExpanded = !!expandedIds[p._id]
                      const latestTimestamp = getLatestTimestamp(p)
                      const agentCompany = p.agent?.companyName || p.agent?.agentName || 'B2C Direct'

                      return (
                        <React.Fragment key={p._id}>
                          <tr style={{ borderBottom: isExpanded ? 'none' : '1px solid #EDF2F7', background: isExpanded ? '#F7FAFC' : p.status === 'confirmed' ? '#F0FFF4' : 'transparent' }}>
                            <td style={{ padding: '0.5rem 0.2rem', textAlign: 'center' }}>
                              <button
                                onClick={() => toggleExpand(p._id)}
                                title={isExpanded ? 'Collapse details' : 'Expand details'}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#718096', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            </td>
                            <td style={{ padding: '0.5rem 0.65rem', fontWeight: 700, color: '#2D3748' }}>{p.proposalNumber}</td>
                            <td style={{ padding: '0.5rem 0.65rem', fontWeight: 600 }}>{p.guestName || 'Guest'}</td>
                            <td style={{ padding: '0.5rem 0.65rem', color: '#4A5568', fontWeight: 600 }}>
                              <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', background: p.agent?.companyName ? '#EBF4FF' : '#F7FAFC', border: '1px solid #E2E8F0', fontSize: '0.72rem' }}>
                                👤 {agentCompany}
                              </span>
                            </td>
                            <td style={{ padding: '0.5rem 0.65rem', color: p.arrivalDate ? '#2B6CB0' : '#A0AEC0', fontWeight: 600 }}>
                              {p.arrivalDate ? `📅 ${p.arrivalDate}` : 'Not set'}
                            </td>
                            <td style={{ padding: '0.5rem 0.65rem' }}>
                              <div style={{ fontWeight: 800, color: '#22543D' }}>S$ {p.totalClientPrice || 0}</div>
                              {p.costBreakdown?.totalClientPriceINR && (
                                <div style={{ fontSize: '0.68rem', color: '#718096' }}>₹{p.costBreakdown.totalClientPriceINR.toLocaleString()}</div>
                              )}
                            </td>
                            <td style={{ padding: '0.5rem 0.65rem', fontSize: '0.72rem', color: '#718096', fontWeight: 600 }}>
                              {latestTimestamp}
                            </td>
                            <td style={{ padding: '0.5rem 0.65rem' }}>
                              <span style={{ padding: '0.15rem 0.45rem', borderRadius: '8px', fontSize: '0.71rem', fontWeight: 700, background: badge.bg, color: badge.color }}>
                                {badge.label}
                              </span>
                            </td>
                            <td style={{ padding: '0.5rem 0.65rem' }}>
                              <select
                                value={p.status || 'pending'}
                                onChange={e => updatePackageStatus(p._id, e.target.value)}
                                style={{ padding: '0.25rem 0.4rem', borderRadius: '6px', border: '1px solid #CBD5E0', fontSize: '0.73rem', fontWeight: 700, background: '#FFF', cursor: 'pointer' }}
                              >
                                <option value="pending">🔵 Pending</option>
                                <option value="followup">🟡 Follow-Up Needed</option>
                                <option value="confirmed">🟢 Confirmed (Admin)</option>
                                <option value="scheduled">💜 Scheduled</option>
                                <option value="completed">✅ Completed</option>
                                <option value="ignore">⚪ Ignore / Closed</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.5rem 0.65rem', textAlign: 'right' }}>
                              <button
                                onClick={() => setSelectedProposal(p)}
                                style={{ border: '1px solid #CBD5E0', background: '#FFF', padding: '0.25rem 0.55rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.73rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                              >
                                <Eye size={12} /> Modal
                              </button>
                            </td>
                          </tr>

                          {/* EXPANDABLE INLINE PANEL */}
                          {isExpanded && (
                            <tr style={{ borderBottom: '1px solid #EDF2F7', background: '#F7FAFC' }}>
                              <td colSpan={10} style={{ padding: '0.75rem 1rem' }}>
                                <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                  
                                  <div>
                                    <div style={{ fontSize: '0.7rem', color: '#718096', fontWeight: 700, textTransform: 'uppercase' }}>Stay & Guests</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2D3748', marginTop: '0.15rem' }}>
                                      {p.nights || 3} Nights — {p.adults || 2} Adults, {p.kids || 0} Kids
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#4A5568', marginTop: '0.1rem' }}>
                                      Hotel: {p.hotelName || 'No hotel selected'} ({p.roomType || 'Standard'})
                                    </div>
                                  </div>

                                  <div>
                                    <div style={{ fontSize: '0.7rem', color: '#718096', fontWeight: 700, textTransform: 'uppercase' }}>Price Breakdown</div>
                                    <div style={{ fontSize: '0.78rem', color: '#4A5568', marginTop: '0.15rem' }}>
                                      Rooms: S${p.costBreakdown?.roomCostTotal || 0} · Transport: S${p.costBreakdown?.transportTotal || 0}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#4A5568', marginTop: '0.1rem' }}>
                                      Attractions: S${p.costBreakdown?.attractionTotal || 0} · Meals: S${p.costBreakdown?.mealTotal || 0}
                                    </div>
                                  </div>

                                  <div>
                                    <div style={{ fontSize: '0.7rem', color: '#718096', fontWeight: 700, textTransform: 'uppercase' }}>Timestamp Audit</div>
                                    <div style={{ fontSize: '0.75rem', color: '#4A5568', marginTop: '0.15rem' }}>
                                      Created: {p._createdAt ? new Date(p._createdAt).toLocaleString() : 'N/A'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#4A5568', marginTop: '0.1rem' }}>
                                      Last Modified: {p._updatedAt ? new Date(p._updatedAt).toLocaleString() : 'N/A'}
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                    <a
                                      href={`/custom-package?ref=${p.proposalNumber}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', background: '#0F4C3A', color: '#FFF', borderRadius: '6px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                                    >
                                      💳 Open Ledger
                                    </a>
                                    <a
                                      href={`/custom-package?ref=${p.proposalNumber}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', background: '#2B6CB0', color: '#FFF', borderRadius: '6px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                                    >
                                      <ExternalLink size={13} /> Open Link
                                    </a>
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* VIEW MODE 2: ARRIVAL CALENDAR */}
          {packageViewMode === 'calendar' && (
            <div>
              {/* Calendar Month Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: '#F7FAFC', padding: '0.65rem 1rem', borderRadius: '8px' }}>
                <button
                  onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4A5568', fontSize: '0.85rem' }}
                >
                  <ChevronLeft size={16} /> Previous Month
                </button>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#2D3748', fontWeight: 800 }}>
                  {monthNames[month]} {year}
                </h3>
                <button
                  onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4A5568', fontSize: '0.85rem' }}
                >
                  Next Month <ChevronRight size={16} />
                </button>
              </div>

              {/* Grid Header Days */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#718096', marginBottom: '0.4rem' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={{ padding: '0.3rem' }}>{d}</div>)}
              </div>

              {/* Grid Day Cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {/* Empty cells before 1st day */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ background: '#FAF5FF', minHeight: '80px', borderRadius: '6px', opacity: 0.4 }} />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                  
                  // Find proposals matching this arrival date
                  const dayProposals = filteredProposals.filter(p => {
                    if (p.arrivalDate && p.arrivalDate.trim() === dateStr) return true
                    return false
                  })

                  return (
                    <div key={dayNum} style={{ background: '#F7FAFC', border: '1px solid #EDF2F7', minHeight: '85px', borderRadius: '6px', padding: '0.35rem', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.25rem' }}>{dayNum}</div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', overflowY: 'auto', flex: 1 }}>
                        {dayProposals.map(p => {
                          const badge = getStatusBadge(p.status)
                          return (
                            <div
                              key={p._id}
                              onClick={() => setSelectedProposal(p)}
                              style={{
                                background: badge.bg,
                                color: badge.color,
                                padding: '0.15rem 0.35rem',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                border: '1px solid rgba(0,0,0,0.05)'
                              }}
                              title={`${p.proposalNumber} — ${p.guestName || 'Guest'} (S$ ${p.totalClientPrice})`}
                            >
                              {p.proposalNumber}: {p.guestName || 'Guest'}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* ── SECTION: PENDING STATUS REQUEST APPROVALS ── */}
        <div id="section-approvals" style={{ background: '#FFF', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '2.5rem', border: '1px solid #EDF2F7' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#2D3748', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-playfair), serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock color="var(--emerald-secondary)" size={20} /> Pending Status Request Approvals ({pendingApprovalsCount})
          </h2>
          <p style={{ color: '#718096', fontSize: '0.82rem', margin: '0 0 1.25rem 0' }}>
            B2B Agents can request package status updates. Review and click Accept or Deny to apply changes.
          </p>

          {pendingApprovalsCount === 0 ? (
            <p style={{ color: '#718096', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
              🎉 No pending status change requests. All caught up!
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F7FAFC', color: '#4A5568', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '0.75rem' }}>Proposal</th>
                    <th style={{ padding: '0.75rem' }}>Agent</th>
                    <th style={{ padding: '0.75rem' }}>Guest</th>
                    <th style={{ padding: '0.75rem' }}>Current Status</th>
                    <th style={{ padding: '0.75rem' }}>Requested Status</th>
                    <th style={{ padding: '0.75rem' }}>Agent Note</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.filter(p => p.statusChangeRequested).map((p, idx) => {
                    return (
                      <tr key={p._id || idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: '#B83A4B' }}>
                          {p.proposalNumber}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ fontWeight: 600, display: 'block', color: '#2D3748' }}>{p.agent?.companyName || p.agent?.agentName || 'B2B Partner'}</span>
                          <span style={{ fontSize: '0.75rem', color: '#718096' }}>{p.agent?.email || 'No email'}</span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ fontWeight: 600, display: 'block', color: '#2D3748' }}>{p.guestName || 'Guest'}</span>
                          <span style={{ fontSize: '0.75rem', color: '#718096' }}>{p.guestPhone || 'No phone'}</span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {getStatusBadge(p.status).label}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            background: p.requestedStatus === 'confirmed' ? '#DCFCE7' : '#FEE2E2',
                            color: p.requestedStatus === 'confirmed' ? '#166534' : '#991B1B'
                          }}>
                            {p.requestedStatus === 'ignore' ? 'Ignore / Closed' : '🟢 Confirmed'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#4A5568', fontStyle: p.statusRequestNote ? 'normal' : 'italic' }}>
                          {p.statusRequestNote || 'No note provided'}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={async () => {
                                if (confirm(`Approve status change to "${p.requestedStatus}" for ${p.proposalNumber}?`)) {
                                  try {
                                    const res = await fetch('/api/admin/packages/approve-status-change', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ proposalId: p._id, action: 'approve' })
                                    })
                                    const resJson = await res.json()
                                    if (resJson.success) {
                                      alert('Request approved successfully!')
                                      fetchData()
                                    } else {
                                      alert(resJson.error || 'Failed to approve request')
                                    }
                                  } catch (e) {
                                    alert('Error approving request')
                                  }
                                }
                              }}
                              style={{ padding: '0.35rem 0.75rem', background: '#319795', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Deny status change request for ${p.proposalNumber}?`)) {
                                  try {
                                    const res = await fetch('/api/admin/packages/approve-status-change', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ proposalId: p._id, action: 'deny' })
                                    })
                                    const resJson = await res.json()
                                    if (resJson.success) {
                                      alert('Request denied successfully!')
                                      fetchData()
                                    } else {
                                      alert(resJson.error || 'Failed to deny request')
                                    }
                                  } catch (e) {
                                    alert('Error denying request')
                                  }
                                }
                              }}
                              style={{ padding: '0.35rem 0.75rem', background: '#E53E3E', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Deny
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── SECTION 3: SITE MAP & QUICK LINKS MATRIX ── */}
        <div id="section-sitemap" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Map size={20} color="#4A5568" />
            <h2 style={{ fontSize: '1.3rem', color: '#2D3748', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>Site Map & Comprehensive Quick Links</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            
            {/* 1. Core Operations & B2B Portals */}
            <div style={{ background: '#FFF', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#2D3748', marginBottom: '0.85rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={16} color="#D69E2E" /> Operations & B2B Portals
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {[
                  { name: 'Sanity Studio CMS', path: '/studio', desc: 'Manage database schemas & live content' },
                  { name: 'B2B Agent Portal', path: '/agent-portal', desc: 'Partner agent workspace & dashboard' },
                  { name: 'Custom Package Builder', path: '/custom-package', desc: 'FIT custom tour quotation engine' },
                  { name: 'B2B Travel Directory', path: '/b2b-directory', desc: 'Verified agencies & DMC directory' },
                  { name: 'B2B Leads & RFQs', path: '/b2b-leads', desc: 'Live buyer inquiries & trade leads' },
                  { name: 'B2B Partnership Hub', path: '/b2b', desc: 'Trade partner registration & perks' },
                  { name: 'Card Scanner / Contact Ingest', path: '/add-contact', desc: 'Optical card reader & contact save' },
                  { name: 'Competitor Price Tracker', path: '/api/admin/price-tracker', desc: 'Real-time JSON market price tracker' },
                ].map(link => (
                  <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.75rem', background: '#F7FAFC', borderRadius: '8px', textDecoration: 'none', color: '#2D3748', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#EDF2F7'} onMouseLeave={e => e.currentTarget.style.background = '#F7FAFC'}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{link.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#718096' }}>{link.desc}</div>
                    </div>
                    <ExternalLink size={14} color="#A0AEC0" />
                  </a>
                ))}
              </div>
            </div>

            {/* 2. Interactive Travel Tools & Utilities */}
            <div style={{ background: '#FFF', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#2D3748', marginBottom: '0.85rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Wrench size={16} color="#3182CE" /> Interactive Travel Tools
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {[
                  { name: 'Travel Tools Master Hub', path: '/travel-tools', desc: 'Complete interactive utility suite' },
                  { name: 'Visa Requirements Checker', path: '/visa-checker', desc: 'Live Singapore & Malaysia entry rules' },
                  { name: 'SGD / INR Currency Converter', path: '/currency-converter', desc: 'Live exchange rates with conversion' },
                  { name: 'Causeway Border Traffic', path: '/border-traffic', desc: 'Tuas & Woodlands live traffic cameras' },
                  { name: 'Changi Flight Tracker', path: '/flight-tracker', desc: 'Real-time flight arrival & departure radar' },
                  { name: 'Traveler Age Calculator', path: '/age-calculator', desc: 'Infant, child & adult fare categorization' },
                  { name: 'AI Trip & Itinerary Planner', path: '/ai-planner', desc: 'Intelligent AI-generated itineraries' },
                  { name: 'Instant Package Estimator', path: '/instant-quote', desc: 'Rapid pricing & budget calculator' },
                ].map(link => (
                  <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.75rem', background: '#F7FAFC', borderRadius: '8px', textDecoration: 'none', color: '#2D3748', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#EDF2F7'} onMouseLeave={e => e.currentTarget.style.background = '#F7FAFC'}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{link.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#718096' }}>{link.desc}</div>
                    </div>
                    <ExternalLink size={14} color="#A0AEC0" />
                  </a>
                ))}
              </div>
            </div>

            {/* 3. Services & Tour Catalogs */}
            <div style={{ background: '#FFF', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#2D3748', marginBottom: '0.85rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShoppingBag size={16} color="#805AD5" /> Services & Catalogs
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {[
                  { name: 'Services Catalog', path: '/services-catalog', desc: 'Master multi-category service directory' },
                  { name: 'Singapore Attractions', path: '/singapore-attractions', desc: 'Attractions catalog & quote builder' },
                  { name: 'Active Promotions', path: '/singapore-attractions/promotions', desc: 'Discounted attraction deals & passes' },
                  { name: 'Live Attraction Booking', path: '/attractions-live', desc: 'Direct instant e-ticket issuance' },
                  { name: 'Curated Tour Packages', path: '/packages', desc: 'Exotic, Classic & Explorer packages' },
                  { name: 'Travel & Medical Insurance', path: '/insurance', desc: 'Policy quotation & instant issuance' },
                  { name: 'Travel Consulting', path: '/travel-consulting', desc: '1-on-1 personalized itinerary planning' },
                  { name: 'Study in Singapore', path: '/study-in-singapore', desc: 'Educational & student immersion tours' },
                  { name: 'Education Tours & Immersions', path: '/education-tours', desc: 'School, College & MBA study circuits' },
                  { name: 'Karnataka Specialist Hub', path: '/karnataka', desc: 'Direct Karnataka to Singapore tours' },
                  { name: 'Corporate Travel & MICE', path: '/corporate-travel', desc: 'Corporate delegations & events' },
                ].map(link => (
                  <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.75rem', background: '#F7FAFC', borderRadius: '8px', textDecoration: 'none', color: '#2D3748', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#EDF2F7'} onMouseLeave={e => e.currentTarget.style.background = '#F7FAFC'}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{link.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#718096' }}>{link.desc}</div>
                    </div>
                    <ExternalLink size={14} color="#A0AEC0" />
                  </a>
                ))}
              </div>
            </div>

            {/* 4. Public, Booking & Marketing */}
            <div style={{ background: '#FFF', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#2D3748', marginBottom: '0.85rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Globe size={16} color="#38A169" /> Public, Booking & Info
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {[
                  { name: 'Main Landing Page', path: '/', desc: 'Public homepage & hero showcase' },
                  { name: 'Direct Booking Checkout', path: '/book', desc: 'Package reservation & traveler checkout' },
                  { name: 'Online Payments & QR', path: '/pay', desc: 'Card checkout & ICICI UPI QR portal' },
                  { name: 'Travel Brochure', path: '/brochure', desc: 'Downloadable marketing materials' },
                  { name: 'Travel Blog & Articles', path: '/blog', desc: 'SEO travel guides & insights' },
                  { name: 'Guest Reviews & Ratings', path: '/reviews', desc: 'Verified traveler testimonials' },
                  { name: 'Singapore Events Calendar', path: '/events', desc: 'Festivals, concerts & exhibitions' },
                  { name: 'About Flying Wonders', path: '/about', desc: 'Company vision, mission & team' },
                  { name: 'Contact & Support', path: '/contact', desc: 'Singapore & India contact info' },
                  { name: 'FAQ Help Center', path: '/faq', desc: 'Frequently asked customer questions' },
                  { name: 'Terms, Privacy & Refund', path: '/terms', desc: 'Legal agreements, Privacy & Refund' },
                ].map(link => (
                  <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.75rem', background: '#F7FAFC', borderRadius: '8px', textDecoration: 'none', color: '#2D3748', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#EDF2F7'} onMouseLeave={e => e.currentTarget.style.background = '#F7FAFC'}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{link.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#718096' }}>{link.desc}</div>
                    </div>
                    <ExternalLink size={14} color="#A0AEC0" />
                  </a>
                ))}
              </div>
            </div>

            {/* 5. Data Exports & Operational Reports */}
            <div style={{ background: '#FFF', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#2D3748', marginBottom: '0.85rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileSpreadsheet size={16} color="#E53E3E" /> Data Exports & Reports
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {[
                  { name: 'Export Accounts Ledger CSV', path: '/api/admin/export-accounts', desc: 'Contract value, paid & pending balance' },
                  { name: 'Export B2B Agents CSV', path: '/api/admin/export-agents', desc: 'All registered agency partners' },
                  { name: 'Export Captured Contacts CSV', path: '/api/admin/export-contacts', desc: 'Optical business card contact list' },
                  { name: 'Export Payment Ledger CSV', path: '/api/admin/export-payments', desc: 'All logged and verified transactions' },
                ].map(link => (
                  <a key={link.path} href={link.path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.75rem', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px', textDecoration: 'none', color: '#991B1B', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'} onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>📥 {link.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#B91C1C' }}>{link.desc}</div>
                    </div>
                    <Download size={14} color="#991B1B" />
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── ACCOUNTS & FINANCIAL LEDGER REPORT ── */}
        <div id="section-accounts" style={{ background: '#FFF', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0', marginBottom: '2.5rem' }}>
          
          {/* Header & Export Link */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', margin: 0, color: '#1E293B', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={22} color="#166534" /> Accounts & Pending Balances Report
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                Real-time tracking of confirmed proposal contract values, payments collected, and outstanding balances due.
              </span>
            </div>

            <a 
              href="/api/admin/export-accounts" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', background: '#0F4C3A', color: '#FFF', textDecoration: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', boxShadow: '0 2px 8px rgba(15,76,58,0.2)' }}
            >
              <Download size={15} /> Export Accounts CSV
            </a>
          </div>

          {(() => {
            const confirmedProps = proposals.filter(p => p.status === 'confirmed' || p.status === 'scheduled' || p.status === 'completed')
            
            let totalReceivablesDue = 0
            let totalCreditBalance = 0
            let totalCollected = 0
            let totalContractValue = 0

            const enrichedProps = confirmedProps.map(p => {
              const basePrice = Number(p.totalClientPrice || p.costBreakdown?.totalClientPrice) || 0
              const totalAddons = (p.additionalCharges || []).reduce((sum: number, c: any) => {
                const amt = Number(c.amount) || 0
                return (c.chargeType === 'Discount' || c.chargeType === 'Refund') ? sum - amt : sum + amt
              }, 0)
              const adjustedPrice = basePrice + totalAddons
              const totalPaid = (p.paymentLedger || []).reduce((sum: number, pay: any) => sum + (Number(pay.amount) || 0), 0)
              
              const rawDiff = adjustedPrice - totalPaid
              const balanceDue = rawDiff > 0 ? rawDiff : 0
              const excessPaid = rawDiff < 0 ? Math.abs(rawDiff) : 0

              totalContractValue += adjustedPrice
              totalCollected += totalPaid
              totalReceivablesDue += balanceDue
              totalCreditBalance += excessPaid

              let settlementStatus: 'unpaid' | 'partial' | 'settled' | 'overpaid' = 'unpaid'
              if (adjustedPrice > 0) {
                if (rawDiff === 0) settlementStatus = 'settled'
                else if (rawDiff < 0) settlementStatus = 'overpaid'
                else if (totalPaid > 0) settlementStatus = 'partial'
                else settlementStatus = 'unpaid'
              } else if (totalPaid > 0) {
                settlementStatus = 'overpaid'
              }

              return { ...p, basePrice, totalAddons, adjustedPrice, totalPaid, balanceDue, excessPaid, rawDiff, settlementStatus }
            })

            const filteredAccounts = enrichedProps.filter(p => {
              const matchesStatus = accountFilter === 'all' ? true : p.settlementStatus === accountFilter
              const term = accountSearch.toLowerCase().trim()
              const matchesSearch = !term ||
                (p.proposalNumber && p.proposalNumber.toLowerCase().includes(term)) ||
                (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(term)) ||
                (p.guestName && p.guestName.toLowerCase().includes(term)) ||
                (p.agent?.companyName && p.agent.companyName.toLowerCase().includes(term))

              return matchesStatus && matchesSearch
            })

            const unsettledCount = enrichedProps.filter(p => p.balanceDue > 0).length
            const overpaidCount = enrichedProps.filter(p => p.excessPaid > 0).length

            // Group filtered accounts by Agent
            const agentGroups = filteredAccounts.reduce((acc: Record<string, any>, p: any) => {
              const agentKey = p.agent?.companyName || p.agent?.agentName || 'B2C Direct / In-House'
              if (!acc[agentKey]) {
                acc[agentKey] = {
                  agentKey,
                  companyName: p.agent?.companyName || (p.agent?.agentName ? p.agent.agentName : 'B2C Direct / In-House'),
                  agentName: p.agent?.agentName || 'Direct Guest',
                  email: p.agent?.email || '',
                  phone: p.agent?.phone || '',
                  totalBilled: 0,
                  totalPaid: 0,
                  totalDue: 0,
                  totalExcess: 0,
                  totalPax: 0,
                  proposals: [],
                }
              }
              acc[agentKey].totalBilled += p.adjustedPrice
              acc[agentKey].totalPaid += p.totalPaid
              acc[agentKey].totalDue += p.balanceDue
              acc[agentKey].totalExcess += p.excessPaid
              acc[agentKey].totalPax += (Number(p.adults) || 2) + (Number(p.kids) || 0)
              acc[agentKey].proposals.push(p)
              return acc
            }, {})

            const agentGroupList: any[] = Object.values(agentGroups)

            return (
              <div>
                {/* Metrics Summary Row (4 Cards) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Outstanding Receivables</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: totalReceivablesDue > 0 ? '#DC2626' : '#166534', marginTop: '0.2rem' }}>
                      S$ {totalReceivablesDue.toLocaleString()}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Across {unsettledCount} pending bookings</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Excess / Credit Balance</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: totalCreditBalance > 0 ? '#7C3AED' : '#64748B', marginTop: '0.2rem' }}>
                      S$ {totalCreditBalance.toLocaleString()}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{overpaidCount > 0 ? `${overpaidCount} overpaid / credit accounts` : 'Zero excess payments'}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total Revenue Collected</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534', marginTop: '0.2rem' }}>
                      S$ {totalCollected.toLocaleString()}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>All part & full payments received</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Confirmed Contract Value</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1E293B', marginTop: '0.2rem' }}>
                      S$ {totalContractValue.toLocaleString()}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{confirmedProps.length} confirmed package bookings</span>
                  </div>

                </div>

                {/* View Mode & Filter Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  
                  {/* Left: View Mode Toggle & Status Filter Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {/* View Mode Toggle */}
                    <div style={{ display: 'inline-flex', background: '#E2E8F0', padding: '0.2rem', borderRadius: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setAccountsViewMode('agent')}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: accountsViewMode === 'agent' ? '#0F4C3A' : 'transparent',
                          color: accountsViewMode === 'agent' ? '#FFF' : '#475569',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        🏢 Consolidated by Agent ({agentGroupList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountsViewMode('individual')}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: accountsViewMode === 'individual' ? '#0F4C3A' : 'transparent',
                          color: accountsViewMode === 'individual' ? '#FFF' : '#475569',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        📋 Individual Bookings ({filteredAccounts.length})
                      </button>
                    </div>

                    {/* Status Filter Badges */}
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {[
                        { id: 'all', label: `All (${enrichedProps.length})` },
                        { id: 'unpaid', label: `🔴 Unpaid (${enrichedProps.filter(p => p.settlementStatus === 'unpaid').length})` },
                        { id: 'partial', label: `🟡 Partial (${enrichedProps.filter(p => p.settlementStatus === 'partial').length})` },
                        { id: 'settled', label: `🟢 Settled (${enrichedProps.filter(p => p.settlementStatus === 'settled').length})` },
                        { id: 'overpaid', label: `🔵 Credit / Excess (${enrichedProps.filter(p => p.settlementStatus === 'overpaid').length})` }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setAccountFilter(f.id as any)}
                          style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            border: accountFilter === f.id ? 'none' : '1px solid #CBD5E1',
                            background: accountFilter === f.id ? '#0F172A' : '#F8FAFC',
                            color: accountFilter === f.id ? '#FFF' : '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Input */}
                  <input
                    type="text"
                    placeholder="🔍 Search Invoice, Ref, Guest, or Agent..."
                    value={accountSearch}
                    onChange={e => setAccountSearch(e.target.value)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.82rem',
                      width: '280px',
                      maxWidth: '100%',
                      background: '#FFF'
                    }}
                  />

                </div>

                {/* Ledger Accounts Table / Agent Consolidated Cards */}
                {filteredAccounts.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748B', padding: '2rem 0', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    No matching accounts or pending balances found.
                  </p>
                ) : accountsViewMode === 'agent' ? (
                  /* ── Consolidated Agent Dues View ── */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {agentGroupList.map((ag: any, agIdx: number) => {
                      const isExpanded = expandedAgents[ag.agentKey] ?? true
                      const netPosition = ag.totalBilled - ag.totalPaid
                      const isDue = netPosition > 0
                      const isCredit = netPosition < 0

                      // Build WhatsApp Statement Text
                      const waStatement = encodeURIComponent(
                        `🏢 *STATEMENT OF DUES — ${ag.companyName}*\n` +
                        `━━━━━━━━━━━━━━━━━━━━━\n` +
                        `📊 *Total Confirmed Packages:* ${ag.proposals.length} Guests (${ag.totalPax} Pax)\n` +
                        `💵 *Total Contract Value:* S$ ${ag.totalBilled.toLocaleString()}\n` +
                        `✅ *Total Payments Received:* S$ ${ag.totalPaid.toLocaleString()}\n` +
                        (isDue ? `⚠️ *NET OUTSTANDING DUE:* S$ ${netPosition.toLocaleString()}\n` : '') +
                        (isCredit ? `🔵 *CREDIT BALANCE ON ACCOUNT:* S$ ${Math.abs(netPosition).toLocaleString()}\n` : '') +
                        (!isDue && !isCredit ? `🟢 *ACCOUNT STATUS:* Fully Settled (S$ 0)\n` : '') +
                        `━━━━━━━━━━━━━━━━━━━━━\n` +
                        `*Guest Breakdown:*\n` +
                        ag.proposals.map((p: any) => {
                          const statusStr = p.rawDiff > 0 ? `Due: S$${p.balanceDue.toLocaleString()}` : (p.rawDiff < 0 ? `Credit: +S$${p.excessPaid.toLocaleString()}` : `Settled`)
                          return `• *${p.guestName || 'Guest'}* (Ref: ${p.proposalNumber}) — Billed: S$${p.adjustedPrice.toLocaleString()} | Paid: S$${p.totalPaid.toLocaleString()} | ${statusStr}`
                        }).join('\n') +
                        `\n━━━━━━━━━━━━━━━━━━━━━\n` +
                        `Flying Wonders Operations Desk`
                      )

                      return (
                        <div 
                          key={ag.agentKey || agIdx} 
                          style={{
                            background: '#FFF',
                            borderRadius: '12px',
                            border: `1.5px solid ${isDue ? '#FECACA' : (isCredit ? '#DDD6FE' : '#E2E8F0')}`,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Agent Header Summary Row */}
                          <div 
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '1rem',
                              padding: '1rem 1.25rem',
                              background: isDue ? '#FFF5F5' : (isCredit ? '#F5F3FF' : '#F8FAFC'),
                              borderBottom: isExpanded ? '1px solid #E2E8F0' : 'none'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                <span style={{ fontSize: '1.1rem' }}>🏢</span>
                                <strong style={{ fontSize: '1rem', color: '#0F172A' }}>{ag.companyName}</strong>
                                <span 
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '12px',
                                    background: isDue ? '#FEE2E2' : (isCredit ? '#EDE9FE' : '#DCFCE7'),
                                    color: isDue ? '#991B1B' : (isCredit ? '#6D28D9' : '#166534')
                                  }}
                                >
                                  {isDue ? `⚠️ S$ ${netPosition.toLocaleString()} Due` : (isCredit ? `🔵 +S$ ${Math.abs(netPosition).toLocaleString()} Credit Balance` : '🟢 Fully Settled')}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <span>👤 Contact: <strong>{ag.agentName}</strong></span>
                                {ag.email && <span>✉️ {ag.email}</span>}
                                {ag.phone && <span>📞 {ag.phone}</span>}
                                <span>📦 <strong>{ag.proposals.length}</strong> Bookings ({ag.totalPax} Pax)</span>
                              </div>
                            </div>

                            {/* Financial Totals & Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Total Billed</div>
                                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B' }}>S$ {ag.totalBilled.toLocaleString()}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Total Paid</div>
                                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534' }}>S$ {ag.totalPaid.toLocaleString()}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                                  {isCredit ? 'Credit Balance' : 'Outstanding Balance'}
                                </div>
                                <div 
                                  style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 900,
                                    color: isDue ? '#DC2626' : (isCredit ? '#7C3AED' : '#166534')
                                  }}
                                >
                                  {isCredit ? `+S$ ${Math.abs(netPosition).toLocaleString()}` : `S$ ${netPosition.toLocaleString()}`}
                                </div>
                              </div>

                              {/* WhatsApp Reminder Button */}
                              <a
                                href={`https://api.whatsapp.com/send?text=${waStatement}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Send Consolidated Statement on WhatsApp"
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  background: '#25D366',
                                  color: '#FFF',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}
                              >
                                💬 WhatsApp Dues
                              </a>

                              {/* Toggle Accordion */}
                              <button
                                type="button"
                                onClick={() => setExpandedAgents(prev => ({ ...prev, [ag.agentKey]: !isExpanded }))}
                                style={{
                                  border: '1px solid #CBD5E1',
                                  background: '#FFF',
                                  color: '#334155',
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                {isExpanded ? '▲ Hide Guests' : `▼ View ${ag.proposals.length} Guests`}
                              </button>
                            </div>
                          </div>

                          {/* Nested Guest Proposals Table */}
                          {isExpanded && (
                            <div style={{ overflowX: 'auto', padding: '0.5rem 1rem 1rem' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                                <thead>
                                  <tr style={{ background: '#F8FAFC', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '0.5rem 0.65rem' }}>Guest Name</th>
                                    <th style={{ padding: '0.5rem 0.65rem' }}>Ref / Invoice</th>
                                    <th style={{ padding: '0.5rem 0.65rem' }}>Travel Dates / Pax</th>
                                    <th style={{ padding: '0.5rem 0.65rem' }}>Contract Price</th>
                                    <th style={{ padding: '0.5rem 0.65rem' }}>Paid</th>
                                    <th style={{ padding: '0.5rem 0.65rem' }}>Balance Due / Credit</th>
                                    <th style={{ padding: '0.5rem 0.65rem' }}>Settlement</th>
                                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'right' }}>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {ag.proposals.map((p: any, pIdx: number) => {
                                    const badge = 
                                      p.settlementStatus === 'settled' ? { label: '🟢 Settled', bg: '#DCFCE7', color: '#166534' } :
                                      p.settlementStatus === 'overpaid' ? { label: `🔵 +S$${p.excessPaid} Credit`, bg: '#EDE9FE', color: '#6D28D9' } :
                                      p.settlementStatus === 'partial' ? { label: '🟡 Partial', bg: '#FEF3C7', color: '#92400E' } :
                                      { label: '🔴 Unpaid', bg: '#FEE2E2', color: '#991B1B' }

                                    return (
                                      <tr key={p._id || pIdx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '0.55rem 0.65rem' }}>
                                          <strong style={{ color: '#1E293B', display: 'block' }}>{p.guestName || 'Guest'}</strong>
                                          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{p.guestPhone || ''}</span>
                                        </td>
                                        <td style={{ padding: '0.55rem 0.65rem' }}>
                                          <span style={{ fontSize: '0.72rem', color: '#B83A4B', fontWeight: 700, display: 'block' }}>Ref: {p.proposalNumber}</span>
                                          <span style={{ fontSize: '0.7rem', color: '#475569' }}>{p.invoiceNumber || 'INV Pending'}</span>
                                        </td>
                                        <td style={{ padding: '0.55rem 0.65rem', color: '#475569' }}>
                                          <div>{p.arrivalDate ? `Arr: ${p.arrivalDate}` : 'Dates TBA'}</div>
                                          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{p.adults || 2}A {p.kids ? `${p.kids}C` : ''} ({p.nights || 3}N)</span>
                                        </td>
                                        <td style={{ padding: '0.55rem 0.65rem', fontWeight: 700, color: '#1E293B' }}>
                                          S$ {p.adjustedPrice.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '0.55rem 0.65rem', fontWeight: 700, color: '#166534' }}>
                                          S$ {p.totalPaid.toLocaleString()}
                                        </td>
                                        <td 
                                          style={{ 
                                            padding: '0.55rem 0.65rem', 
                                            fontWeight: 800, 
                                            color: p.balanceDue > 0 ? '#DC2626' : (p.excessPaid > 0 ? '#7C3AED' : '#166534') 
                                          }}
                                        >
                                          {p.excessPaid > 0 ? `+S$ ${p.excessPaid.toLocaleString()} (Credit)` : `S$ ${p.balanceDue.toLocaleString()}`}
                                        </td>
                                        <td style={{ padding: '0.55rem 0.65rem' }}>
                                          <span style={{ padding: '0.15rem 0.45rem', borderRadius: '10px', fontSize: '0.68rem', fontWeight: 800, background: badge.bg, color: badge.color }}>
                                            {badge.label}
                                          </span>
                                        </td>
                                        <td style={{ padding: '0.55rem 0.65rem', textAlign: 'right' }}>
                                          <a
                                            href={`/custom-package?ref=${p.proposalNumber}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              padding: '0.25rem 0.55rem',
                                              borderRadius: '4px',
                                              background: '#0F4C3A',
                                              color: '#FFF',
                                              textDecoration: 'none',
                                              fontWeight: 700,
                                              fontSize: '0.72rem'
                                            }}
                                          >
                                            💳 Ledger
                                          </a>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  /* ── Individual Bookings View ── */
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#F1F5F9', color: '#475569', borderBottom: '2px solid #E2E8F0' }}>
                          <th style={{ padding: '0.65rem 0.75rem' }}>Invoice / Ref</th>
                          <th style={{ padding: '0.65rem 0.75rem' }}>Guest Name</th>
                          <th style={{ padding: '0.65rem 0.75rem' }}>Agent / Company</th>
                          <th style={{ padding: '0.65rem 0.75rem' }}>Contract Price (S$)</th>
                          <th style={{ padding: '0.65rem 0.75rem' }}>Paid (S$)</th>
                          <th style={{ padding: '0.65rem 0.75rem' }}>Balance Due / Credit</th>
                          <th style={{ padding: '0.65rem 0.75rem' }}>Settlement</th>
                          <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Manage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAccounts.map((p, idx) => {
                          const badge = 
                            p.settlementStatus === 'settled' ? { label: '🟢 Fully Settled', bg: '#DCFCE7', color: '#166534' } :
                            p.settlementStatus === 'overpaid' ? { label: `🔵 +S$${p.excessPaid} Credit`, bg: '#EDE9FE', color: '#6D28D9' } :
                            p.settlementStatus === 'partial' ? { label: '🟡 Partially Paid', bg: '#FEF3C7', color: '#92400E' } :
                            { label: '🔴 Unpaid (100%)', bg: '#FEE2E2', color: '#991B1B' }

                          const agentCompany = p.agent?.companyName || p.agent?.agentName || 'B2C Direct'

                          return (
                            <tr key={p._id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '0.7rem 0.75rem' }}>
                                <strong style={{ color: '#0F172A', display: 'block' }}>{p.invoiceNumber || 'INV Pending'}</strong>
                                <span style={{ fontSize: '0.72rem', color: '#B83A4B', fontWeight: 700 }}>Ref: {p.proposalNumber}</span>
                              </td>
                              <td style={{ padding: '0.7rem 0.75rem' }}>
                                <strong style={{ color: '#1E293B', display: 'block' }}>{p.guestName || 'Guest'}</strong>
                                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{p.guestPhone || ''}</span>
                              </td>
                              <td style={{ padding: '0.7rem 0.75rem', color: '#334155', fontWeight: 600 }}>
                                {agentCompany}
                              </td>
                              <td style={{ padding: '0.7rem 0.75rem', fontWeight: 700, color: '#1E293B' }}>
                                S$ {p.adjustedPrice.toLocaleString()}
                                {p.totalAddons !== 0 && (
                                  <span style={{ display: 'block', fontSize: '0.68rem', color: p.totalAddons > 0 ? '#15803D' : '#B91C1C' }}>
                                    Base S${p.basePrice} ({p.totalAddons > 0 ? `+S$${p.totalAddons}` : `-S$${Math.abs(p.totalAddons)}`})
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '0.7rem 0.75rem', fontWeight: 800, color: '#166534' }}>
                                S$ {p.totalPaid.toLocaleString()}
                              </td>
                              <td 
                                style={{ 
                                  padding: '0.7rem 0.75rem', 
                                  fontWeight: 900, 
                                  color: p.balanceDue > 0 ? '#DC2626' : (p.excessPaid > 0 ? '#7C3AED' : '#166534') 
                                }}
                              >
                                {p.excessPaid > 0 ? `+S$ ${p.excessPaid.toLocaleString()} (Credit)` : `S$ ${p.balanceDue.toLocaleString()}`}
                              </td>
                              <td style={{ padding: '0.7rem 0.75rem' }}>
                                <span style={{ padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800, background: badge.bg, color: badge.color }}>
                                  {badge.label}
                                </span>
                              </td>
                              <td style={{ padding: '0.7rem 0.75rem', textAlign: 'right' }}>
                                <a
                                  href={`/custom-package?ref=${p.proposalNumber}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    padding: '0.35rem 0.75rem',
                                    borderRadius: '6px',
                                    background: '#0F4C3A',
                                    color: '#FFF',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.76rem'
                                  }}
                                >
                                  💳 Open Ledger
                                </a>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })()}

        </div>

        {/* ── SECTION 4 & 5 & 6: PAYMENTS, AGENTS, EXPORTS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* PENDING PAYMENTS */}
            <div id="section-payments" style={{ background: '#FFF', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#2D3748', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={18} color="#9B2C2C" /> Pending Manual Payments
              </h2>
              {pendingPayments.length === 0 ? <p style={{ color: '#718096', fontSize: '0.85rem' }}>No pending payments to verify.</p> : (
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#718096' }}>
                      <th style={{ padding: '0.65rem 0' }}>Ref</th>
                      <th style={{ padding: '0.65rem 0' }}>Amount</th>
                      <th style={{ padding: '0.65rem 0' }}>UTR Number</th>
                      <th style={{ padding: '0.65rem 0' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayments.map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                        <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>{p.bookingReference || 'N/A'}</td>
                        <td style={{ padding: '0.75rem 0', fontWeight: 700, color: '#22543D' }}>₹{p.amountInr}</td>
                        <td style={{ padding: '0.75rem 0', fontFamily: 'monospace' }}>{p.utrNumber}</td>
                        <td style={{ padding: '0.75rem 0', display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => updatePaymentStatus(p._id, 'verified')} style={{ background: '#48BB78', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0.35rem 0.65rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}><CheckCircle size={13} /> Verify</button>
                          <button onClick={() => updatePaymentStatus(p._id, 'rejected')} style={{ background: '#F56565', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0.35rem 0.65rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}><XCircle size={13} /> Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* TRAVEL CONSULTING LEADS MANAGEMENT */}
            <div id="section-consulting" style={{ background: '#FFF', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#2D3748', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={18} color="#059669" /> Travel Consulting Requests ({consultingBookings.length})
                </h2>
                <button onClick={fetchConsultingBookings} style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              {consultingBookings.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#718096', margin: 0 }}>No consulting requests received yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#718096' }}>
                        <th style={{ padding: '0.65rem 0' }}>Ref / Client</th>
                        <th style={{ padding: '0.65rem 0' }}>Package & Fee</th>
                        <th style={{ padding: '0.65rem 0' }}>Requested Slot</th>
                        <th style={{ padding: '0.65rem 0' }}>Assigned Specialist</th>
                        <th style={{ padding: '0.65rem 0' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultingBookings.map(b => (
                        <tr key={b._id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                          <td style={{ padding: '0.75rem 0' }}>
                            <strong style={{ display: 'block', color: '#0F172A' }}>{b.bookingId || b._id.slice(0, 8)}</strong>
                            <span>{b.clientName} ({b.userRole || 'Traveler'})</span><br/>
                            <a href={`https://wa.me/${b.clientPhone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#059669', textDecoration: 'none', fontWeight: 700 }}>
                              💬 {b.clientPhone}
                            </a>
                          </td>

                          <td style={{ padding: '0.75rem 0' }}>
                            <strong style={{ display: 'block', color: '#0F4C3A' }}>{b.packageTitle}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{b.packagePrice}</span>
                          </td>

                          <td style={{ padding: '0.75rem 0' }}>
                            <span style={{ fontWeight: 700, color: '#334155' }}>{b.preferredDate || 'Date TBD'}</span><br/>
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{b.preferredTimeWindow}</span><br/>
                            <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>🌐 {b.preferredLanguage}</span>
                          </td>

                          <td style={{ padding: '0.75rem 0' }}>
                            {b.assignedConsultant ? (
                              <span style={{ fontWeight: 700, color: '#0F4C3A' }}>👤 {b.assignedConsultant.name}</span>
                            ) : (
                              <span style={{ color: '#D97706', fontSize: '0.75rem', fontWeight: 700 }}>⚠️ Unassigned</span>
                            )}
                          </td>

                          <td style={{ padding: '0.75rem 0' }}>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: b.status === 'completed' || b.status === 'fee_credited' ? '#ECFDF5' : b.status === 'assigned' ? '#EFF6FF' : '#FEF3C7',
                              color: b.status === 'completed' || b.status === 'fee_credited' ? '#047857' : b.status === 'assigned' ? '#1D4ED8' : '#B45309'
                            }}>
                              {b.status === 'assigned' ? '✅ Assigned' : b.status === 'completed' ? '🎉 Completed' : b.status === 'fee_credited' ? '🏷️ Fee Credited' : '⏳ Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* B2B AGENT APPROVALS */}
            <div id="section-agents" style={{ background: '#FFF', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#2D3748', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={18} color="#319795" /> B2B Agent Approvals & Status
              </h2>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#718096' }}>
                    <th style={{ padding: '0.65rem 0' }}>Company</th>
                    <th style={{ padding: '0.65rem 0' }}>Email</th>
                    <th style={{ padding: '0.65rem 0' }}>Status</th>
                    <th style={{ padding: '0.65rem 0' }}>Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map(a => (
                    <tr key={a._id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                      <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>{a.companyName}</td>
                      <td style={{ padding: '0.75rem 0' }}>{a.email}</td>
                      <td style={{ padding: '0.75rem 0' }}>
                        <span style={{ padding: '0.15rem 0.45rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: a.isActive ? '#C6F6D5' : '#FED7D7', color: a.isActive ? '#22543D' : '#742A2A' }}>
                          {a.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0' }}>
                        <button onClick={() => toggleAgentStatus(a._id, a.isActive)} style={{ background: '#E2E8F0', border: 'none', borderRadius: '6px', padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                          {a.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DATA EXPORTS */}
            <div id="section-exports" style={{ background: '#FFF', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#2D3748', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Download size={18} color="#2B6CB0" /> Data Exports & Reports
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a href="/api/admin/export-agents" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', background: '#2B6CB0', color: '#FFF', textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem' }}><Download size={15} /> Export Agents CSV</a>
                <a href="/api/admin/export-contacts" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', background: '#2B6CB0', color: '#FFF', textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem' }}><Download size={15} /> Export Contacts CSV</a>
                <a href="/api/admin/export-payments" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', background: '#2B6CB0', color: '#FFF', textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem' }}><Download size={15} /> Export Payments CSV</a>
              </div>
            </div>

            {/* COMPETITOR TICKET PRICE TRACKER */}
            <div id="section-competitor-pricing" style={{ background: '#FFF', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#2D3748', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                  🎡 Competitor Ticket Tracker
                </h2>
                <button 
                  onClick={triggerPriceRefresh} 
                  disabled={refreshingPrices}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.85rem', background: 'var(--emerald-secondary)', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}
                >
                  <RefreshCw className={refreshingPrices ? "animate-spin" : ""} size={12} />
                  {refreshingPrices ? 'Refreshing...' : 'Fetch Live Rates'}
                </button>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.85rem' }}>
                Showing comparative ticket rates for <strong>Universal Studios Singapore - Fixed Date</strong>:
              </div>

              {competitorPrices.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', background: '#F7FAFC', borderRadius: '8px', color: '#718096', fontSize: '0.82rem' }}>
                  No rates loaded. Click &quot;Fetch Live Rates&quot; to load comparative pricing.
                </div>
              ) : (
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#718096' }}>
                      <th style={{ padding: '0.5rem 0' }}>Platform</th>
                      <th style={{ padding: '0.5rem 0' }}>Adult Price</th>
                      <th style={{ padding: '0.5rem 0' }}>Child Price</th>
                      <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Booking Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitorPrices.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #EDF2F7' }}>
                        <td style={{ padding: '0.6rem 0', fontWeight: 700, textTransform: 'uppercase', color: '#2B6CB0' }}>{p.platform}</td>
                        <td style={{ padding: '0.6rem 0', fontWeight: 700, color: '#2D3748' }}>S$ {p.adultPrice}</td>
                        <td style={{ padding: '0.6rem 0', color: '#4A5568' }}>S$ {p.childPrice}</td>
                        <td style={{ padding: '0.6rem 0', textAlign: 'right' }}>
                          <a href={p.bookingUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-accent)', fontWeight: 700, textDecoration: 'underline' }}>
                            View Page ↗
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ADS & MONETIZATION MANAGEMENT */}
          <div id="section-ads" style={{ background: '#FFF', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A202C', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Megaphone size={20} color="#0F4C3A" /> Ad Placement & Monetization Controls
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#718096', margin: '0.2rem 0 0' }}>
                  Control Google AdSense & native travel affiliate banner visibility across website categories.
                </p>
              </div>
              <a
                href="/ads.txt"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.4rem 0.85rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>View Live ads.txt</span>
                <ExternalLink size={13} />
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {/* Blog Ads Toggle */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>Travel Blog Articles (/blog)</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: adBlogEnabled ? '#DCFCE7' : '#FEE2E2', color: adBlogEnabled ? '#166534' : '#991B1B' }}>
                    {adBlogEnabled ? 'ACTIVE 🟢' : 'DISABLED 🔴'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 1rem', lineHeight: 1.4 }}>
                  In-article native ad slots & category feed leaderboard banners.
                </p>
                <button
                  onClick={() => toggleAdCategory('blog', adBlogEnabled)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: 'none', background: adBlogEnabled ? '#EF4444' : '#10B981', color: '#FFF', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  {adBlogEnabled ? 'Disable Blog Ads' : 'Enable Blog Ads'}
                </button>
              </div>

              {/* Travel Tools Ads Toggle */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>Travel Tools Page (/travel-tools)</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: adTravelToolsEnabled ? '#DCFCE7' : '#FEE2E2', color: adTravelToolsEnabled ? '#166534' : '#991B1B' }}>
                    {adTravelToolsEnabled ? 'ACTIVE 🟢' : 'DISABLED 🔴'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 1rem', lineHeight: 1.4 }}>
                  Sidebar & inline banners on Currency Converter & Pre-Departure checklist.
                </p>
                <button
                  onClick={() => toggleAdCategory('travel-tools', adTravelToolsEnabled)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: 'none', background: adTravelToolsEnabled ? '#EF4444' : '#10B981', color: '#FFF', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  {adTravelToolsEnabled ? 'Disable Tools Ads' : 'Enable Tools Ads'}
                </button>
              </div>

              {/* Global Travel News Radar Toggle */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>Global Travel News Radar</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: adTravelNewsEnabled ? '#DCFCE7' : '#FEE2E2', color: adTravelNewsEnabled ? '#166534' : '#991B1B' }}>
                    {adTravelNewsEnabled ? 'VISIBLE 🟢' : 'HIDDEN 🔴'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 1rem', lineHeight: 1.4 }}>
                  Live RSS travel news feed section on /travel-tools page.
                </p>
                <button
                  onClick={toggleTravelNews}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: 'none', background: adTravelNewsEnabled ? '#EF4444' : '#10B981', color: '#FFF', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  {adTravelNewsEnabled ? 'Hide News Radar' : 'Show News Radar'}
                </button>
              </div>

              {/* Singapore-Malaysia Border Traffic Radar Toggle */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>Border Traffic & Cameras</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: adBorderTrafficEnabled ? '#DCFCE7' : '#FEE2E2', color: adBorderTrafficEnabled ? '#166534' : '#991B1B' }}>
                    {adBorderTrafficEnabled ? 'VISIBLE 🟢' : 'HIDDEN 🔴'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 1rem', lineHeight: 1.4 }}>
                  Live Woodlands & Tuas LTA camera feeds and wait-times on /travel-tools.
                </p>
                <button
                  onClick={toggleBorderTraffic}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: 'none', background: adBorderTrafficEnabled ? '#EF4444' : '#10B981', color: '#FFF', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  {adBorderTrafficEnabled ? 'Hide Border Traffic' : 'Show Border Traffic'}
                </button>
              </div>

              {/* Live Airline Promotions Radar Toggle */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>Airline Promotions Radar</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: adAirlinePromosEnabled ? '#DCFCE7' : '#FEE2E2', color: adAirlinePromosEnabled ? '#166534' : '#991B1B' }}>
                    {adAirlinePromosEnabled ? 'VISIBLE 🟢' : 'HIDDEN 🔴'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 1rem', lineHeight: 1.4 }}>
                  Live SIA, IndiGo, Air India & Scoot promotional flight deal cards on /travel-tools.
                </p>
                <button
                  onClick={toggleAirlinePromos}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: 'none', background: adAirlinePromosEnabled ? '#EF4444' : '#10B981', color: '#FFF', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  {adAirlinePromosEnabled ? 'Hide Airline Promos' : 'Show Airline Promos'}
                </button>
              </div>
            </div>
          </div>

          {/* AUDIT LOGS */}
          <div id="section-audit-logs" style={{ background: '#FFF', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7', height: 'fit-content', maxHeight: '800px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#2D3748', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Activity size={16} /> Audit Trail</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {logs.length === 0 ? <p style={{ color: '#718096', fontSize: '0.82rem' }}>No logs recorded yet.</p> : logs.map(log => (
                <div key={log._id} style={{ padding: '0.75rem', background: '#F7FAFC', borderRadius: '8px', borderLeft: '4px solid #3182CE' }}>
                  <div style={{ fontSize: '0.72rem', color: '#718096', marginBottom: '0.15rem' }}>{new Date(log.timestamp).toLocaleString()}</div>
                  <div style={{ fontWeight: 600, color: '#2D3748', fontSize: '0.82rem', marginBottom: '0.1rem' }}>{log.action}</div>
                  <div style={{ fontSize: '0.78rem', color: '#4A5568' }}>{log.email}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── PACKAGE DETAIL MODAL ── */}
        {selectedProposal && (
          <div onClick={() => setSelectedProposal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: '16px', maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem', marginBottom: '1.1rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold-accent)', textTransform: 'uppercase' }}>Package Proposal Details</div>
                  <h2 style={{ fontSize: '1.3rem', color: '#2D3748', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>{selectedProposal.proposalNumber}</h2>
                  <div style={{ fontSize: '0.82rem', color: '#718096', marginTop: '0.15rem' }}>Guest: {selectedProposal.guestName || 'N/A'}</div>
                </div>
                <button onClick={() => setSelectedProposal(null)} style={{ border: 'none', background: '#EDF2F7', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 700 }}>✕</button>
              </div>

              {/* Status Change Strip */}
              <div style={{ background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#718096', fontWeight: 700 }}>ADMIN STATUS UPDATE</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2D3748', marginTop: '0.1rem' }}>
                    Current: {getStatusBadge(selectedProposal.status).label}
                  </div>
                </div>
                <select
                  value={selectedProposal.status || 'pending'}
                  onChange={e => updatePackageStatus(selectedProposal._id, e.target.value)}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--emerald-secondary)', fontSize: '0.82rem', fontWeight: 800, background: '#FFF', cursor: 'pointer' }}
                >
                  <option value="pending">🔵 Pending</option>
                  <option value="followup">🟡 Follow-Up Needed</option>
                  <option value="confirmed">🟢 Confirmed (Admin Only)</option>
                  <option value="scheduled">💜 Scheduled</option>
                  <option value="completed">✅ Completed</option>
                  <option value="ignore">⚪ Ignore / Closed</option>
                </select>
              </div>

              {/* Details Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#F7FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#718096', fontWeight: 700 }}>ARRIVAL DATE</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2D3748', marginTop: '0.15rem' }}>{selectedProposal.arrivalDate || 'Not set'}</div>
                </div>
                <div style={{ background: '#F7FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#718096', fontWeight: 700 }}>STAY DURATION</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2D3748', marginTop: '0.15rem' }}>{selectedProposal.nights} Nights ({selectedProposal.adults || 2} Adults, {selectedProposal.kids || 0} Kids)</div>
                </div>
                <div style={{ background: '#F0FFF4', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#22543D', fontWeight: 700 }}>TOTAL CLIENT PRICE (SGD)</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#22543D', marginTop: '0.15rem' }}>S$ {selectedProposal.totalClientPrice || 0}</div>
                </div>
                <div style={{ background: '#F0FFF4', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#22543D', fontWeight: 700 }}>APPROX PRICE (INR ₹)</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#22543D', marginTop: '0.15rem' }}>₹{(selectedProposal.costBreakdown?.totalClientPriceINR || 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Timestamp Audit */}
              <div style={{ background: '#F7FAFC', border: '1px solid #E2E8F0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', color: '#4A5568', marginBottom: '1.25rem' }}>
                <div>⏱️ {getLatestTimestamp(selectedProposal)}</div>
                <div style={{ fontSize: '0.72rem', color: '#718096', marginTop: '0.1rem' }}>
                  Created: {selectedProposal._createdAt ? new Date(selectedProposal._createdAt).toLocaleString() : 'N/A'} | Updated: {selectedProposal._updatedAt ? new Date(selectedProposal._updatedAt).toLocaleString() : 'N/A'}
                </div>
              </div>

              {/* Agent info */}
              {selectedProposal.agent && (
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.3rem' }}>Agent Info</div>
                  <div style={{ fontSize: '0.82rem', color: '#2D3748' }}>Company: <strong>{selectedProposal.agent.companyName || 'B2B Partner'}</strong></div>
                  <div style={{ fontSize: '0.82rem', color: '#2D3748' }}>Email: {selectedProposal.agent.email}</div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem' }}>
                <a
                  href={`/custom-package?ref=${selectedProposal.proposalNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.55rem 1.1rem', background: '#2B6CB0', color: '#FFF', borderRadius: '8px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700 }}
                >
                  <ExternalLink size={14} /> Open Full Proposal Page
                </a>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  )
}
