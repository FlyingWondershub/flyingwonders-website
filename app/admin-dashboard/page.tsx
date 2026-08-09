'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Download, ShieldAlert, Loader2, CheckCircle, XCircle, Activity, Users,
  DollarSign, RefreshCw, FileText, Map, ExternalLink, Zap, Package, Compass,
  Calendar, Eye, Filter, ChevronLeft, ChevronRight, AlertCircle, Clock,
  ChevronDown, ChevronUp, CalendarCheck, CheckCheck, LayoutDashboard, Database,
  ArrowRight, ShieldCheck, CreditCard, Menu, PanelLeftClose, PanelLeftOpen
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
  
  // Expand / Collapse row tracking
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

  // Calendar State
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date())

  const [refreshing, setRefreshing] = useState(false)
  const [competitorPrices, setCompetitorPrices] = useState<any[]>([])
  const [refreshingPrices, setRefreshingPrices] = useState(false)

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
    { id: 'section-sitemap', label: 'Site Map & Links', icon: Map },
    { id: 'section-payments', label: 'Pending Payments', icon: CreditCard, badge: pendingPayments.length },
    { id: 'section-agents', label: 'Agent Approvals', icon: Users, badge: metrics.activeAgents },
    { id: 'section-exports', label: 'Data Exports', icon: Download },
    { id: 'section-competitor-pricing', label: 'Competitor Tracker', icon: Eye },
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

        {/* ── SECTION 3: SITE MAP & QUICK LINKS MATRIX ── */}
        <div id="section-sitemap" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Map size={20} color="#4A5568" />
            <h2 style={{ fontSize: '1.3rem', color: '#2D3748', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>Site Map & Quick Links</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            
            {/* Core Operations */}
            <div style={{ background: '#FFF', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#2D3748', marginBottom: '0.85rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={16} color="#D69E2E" /> Core Operations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { name: 'Sanity Studio CMS', path: '/studio', desc: 'Manage content & schemas' },
                  { name: 'Singapore Attractions', path: '/singapore-attractions', desc: 'B2B/B2C Quote Builder' },
                  { name: 'Active Promotions', path: '/singapore-attractions/promotions', desc: 'Discounted attraction deals' },
                  { name: 'Competitor price tracker', path: '/api/admin/price-tracker', desc: 'JSON list of competitor prices' },
                ].map(link => (
                  <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: '#F7FAFC', borderRadius: '8px', textDecoration: 'none', color: '#2D3748', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#EDF2F7'} onMouseLeave={e => e.currentTarget.style.background = '#F7FAFC'}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{link.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#718096' }}>{link.desc}</div>
                    </div>
                    <ExternalLink size={15} color="#A0AEC0" />
                  </a>
                ))}
              </div>
            </div>

            {/* Client Tools */}
            <div style={{ background: '#FFF', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#2D3748', marginBottom: '0.85rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Package size={16} color="#3182CE" /> Client Tools
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { name: 'AI Trip Planner', path: '/ai-planner', desc: 'Intelligent itinerary generation' },
                  { name: 'Instant Quote', path: '/instant-quote', desc: 'Quick package estimation' },
                  { name: 'Live Bookings', path: '/attractions-live', desc: 'Real-time booking portal' },
                ].map(link => (
                  <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: '#F7FAFC', borderRadius: '8px', textDecoration: 'none', color: '#2D3748', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#EDF2F7'} onMouseLeave={e => e.currentTarget.style.background = '#F7FAFC'}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{link.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#718096' }}>{link.desc}</div>
                    </div>
                    <ExternalLink size={15} color="#A0AEC0" />
                  </a>
                ))}
              </div>
            </div>

            {/* Public Pages */}
            <div style={{ background: '#FFF', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#2D3748', marginBottom: '0.85rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Compass size={16} color="#38A169" /> Public Pages
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { name: 'Homepage', path: '/', desc: 'Main landing page' },
                  { name: 'Travel Blog', path: '/blog', desc: 'SEO articles and guides' },
                  { name: 'Contact Us', path: '/contact', desc: 'Support and inquiries' },
                ].map(link => (
                  <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: '#F7FAFC', borderRadius: '8px', textDecoration: 'none', color: '#2D3748', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#EDF2F7'} onMouseLeave={e => e.currentTarget.style.background = '#F7FAFC'}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{link.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#718096' }}>{link.desc}</div>
                    </div>
                    <ExternalLink size={15} color="#A0AEC0" />
                  </a>
                ))}
              </div>
            </div>

          </div>
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
