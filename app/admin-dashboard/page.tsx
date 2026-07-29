'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Download, ShieldAlert, Loader2, CheckCircle, XCircle, Activity, Users,
  DollarSign, RefreshCw, FileText, Map, ExternalLink, Zap, Package, Compass,
  Calendar, Eye, Filter, ChevronLeft, ChevronRight, AlertCircle, Clock,
  ChevronDown, ChevronUp, CalendarCheck, CheckCheck, LayoutDashboard, Database,
  ArrowRight, ShieldCheck, CreditCard
} from 'lucide-react'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('metrics')
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

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const fetchData = async () => {
    setRefreshing(true)
    try {
      const [authRes, metRes, payRes, agentRes, logRes, propRes] = await Promise.all([
        fetch('/api/auth/check'),
        fetch('/api/admin/metrics'),
        fetch('/api/admin/payments/pending'),
        fetch('/api/admin/agents'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/proposals?listAll=true')
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

  // Helper to format creation / last updated time (whichever is latest)
  const getLatestTimestamp = (p: any) => {
    const created = p._createdAt ? new Date(p._createdAt).getTime() : 0
    const updated = p._updatedAt ? new Date(p._updatedAt).getTime() : 0
    const latestTime = Math.max(created, updated)
    if (!latestTime) return 'N/A'
    const isUpdate = updated > created
    const formatted = new Date(latestTime).toLocaleString('en-SG', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
    return `${isUpdate ? 'Updated' : 'Created'}: ${formatted}`
  }

  // Navigation Items for Left Menu
  const navItems = [
    { id: 'section-metrics', label: 'Dashboard KPI Overview', icon: LayoutDashboard },
    { id: 'section-packages', label: 'Package Lifecycle & Calendar', icon: Package, badge: totalPackages },
    { id: 'section-sitemap', label: 'Site Map & Quick Links', icon: Map },
    { id: 'section-payments', label: 'Pending Payments', icon: CreditCard, badge: pendingPayments.length },
    { id: 'section-agents', label: 'B2B Agent Approvals', icon: Users, badge: metrics.activeAgents },
    { id: 'section-exports', label: 'Data Exports', icon: Download },
    { id: 'section-audit-logs', label: 'Security & Audit Logs', icon: ShieldCheck, badge: logs.length },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAFC', display: 'flex' }}>
      
      {/* ── LEFT SIDEBAR NAVIGATION MENU ── */}
      <aside style={{
        width: '270px',
        background: '#1A202C',
        color: '#E2E8F0',
        padding: '2rem 1rem',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
        zIndex: 100
      }}>
        {/* Brand Logo Header */}
        <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #2D3748', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
          <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-accent)' }}>
            Flying Wonders
          </div>
          <div style={{ fontSize: '0.75rem', color: '#A0AEC0', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '0.2rem' }}>
            Admin Command Center
          </div>
        </div>

        {/* Menu Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#718096', fontWeight: 800, paddingLeft: '0.75rem', marginBottom: '0.5rem' }}>
            Navigation
          </div>
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'var(--emerald-secondary)' : 'transparent',
                  color: isActive ? '#FFF' : '#CBD5E0',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease-in-out'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#2D3748' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Icon size={17} color={isActive ? '#FFF' : 'var(--gold-accent)'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
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
        <div style={{ borderTop: '1px solid #2D3748', paddingTop: '1rem', marginTop: '1.5rem', paddingLeft: '0.5rem' }}>
          <button
            onClick={() => router.push('/')}
            style={{ width: '100%', padding: '0.6rem', background: '#2D3748', color: '#CBD5E0', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            ← Return to Main Site
          </button>
        </div>
      </aside>

      {/* ── MAIN DASHBOARD CONTENT AREA ── */}
      <main style={{ flex: 1, padding: '2.5rem 3rem', maxWidth: '1350px', overflowX: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.3rem', color: '#2D3748', margin: 0 }}>Admin Operations Dashboard</h1>
            <p style={{ color: '#4A5568', fontSize: '1rem', margin: '0.35rem 0 0 0' }}>Manage package lifecycles, booking calendar, approvals & audit logs.</p>
          </div>
          <button 
            onClick={fetchData} 
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>

        {/* ── SECTION 1: COMPACT KPI METRICS ROW ── */}
        <div id="section-metrics" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <LayoutDashboard size={20} color="var(--emerald-secondary)" />
            <h2 style={{ fontSize: '1.3rem', color: '#2D3748', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>Key Performance Indicators</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.9rem' }}>
            
            {/* 1. Active Agents */}
            <div style={{ background: '#FFF', padding: '0.85rem 1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <div style={{ padding: '0.4rem', background: '#E6FFFA', borderRadius: '8px' }}><Users color="#319795" size={15} /></div>
                <h3 style={{ margin: 0, color: '#718096', fontSize: '0.76rem', fontWeight: 600 }}>Active Agents</h3>
              </div>
              <button
                onClick={() => scrollToSection('section-agents')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '1.4rem', fontWeight: 800, color: '#319795', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                title="Click to view agent approvals section"
              >
                {metrics.activeAgents} <ArrowRight size={14} />
              </button>
            </div>

            {/* 2. Total Saved Packages */}
            <div style={{ background: '#FFF', padding: '0.85rem 1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <div style={{ padding: '0.4rem', background: '#EBF4FF', borderRadius: '8px' }}><Package color="#3182CE" size={15} /></div>
                <h3 style={{ margin: 0, color: '#718096', fontSize: '0.76rem', fontWeight: 600 }}>Total Packages</h3>
              </div>
              <button
                onClick={() => scrollToSection('section-packages', 'all')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '1.4rem', fontWeight: 800, color: '#3182CE', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                title="Click to view all packages"
              >
                {totalPackages} <ArrowRight size={14} />
              </button>
            </div>

            {/* 3. Confirmed Packages */}
            <div style={{ background: '#FFF', padding: '0.85rem 1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <div style={{ padding: '0.4rem', background: '#C6F6D5', borderRadius: '8px' }}><CheckCircle color="#22543D" size={15} /></div>
                <h3 style={{ margin: 0, color: '#718096', fontSize: '0.76rem', fontWeight: 600 }}>Confirmed</h3>
              </div>
              <button
                onClick={() => scrollToSection('section-packages', 'confirmed')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '1.4rem', fontWeight: 800, color: '#22543D', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                title="Click to filter confirmed packages"
              >
                {confirmedPackages.length} <ArrowRight size={14} />
              </button>
              <div style={{ fontSize: '0.68rem', color: '#718096', marginTop: '0.1rem', fontWeight: 600 }}>S$ {confirmedRevenueSGD.toLocaleString()} (₹{confirmedRevenueINR.toLocaleString()})</div>
            </div>

            {/* 4. Scheduled Packages */}
            <div style={{ background: '#FFF', padding: '0.85rem 1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <div style={{ padding: '0.4rem', background: '#E9D8FD', borderRadius: '8px' }}><CalendarCheck color="#553C9A" size={15} /></div>
                <h3 style={{ margin: 0, color: '#718096', fontSize: '0.76rem', fontWeight: 600 }}>Scheduled</h3>
              </div>
              <button
                onClick={() => scrollToSection('section-packages', 'scheduled')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '1.4rem', fontWeight: 800, color: '#553C9A', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                title="Click to filter scheduled packages"
              >
                {scheduledPackages.length} <ArrowRight size={14} />
              </button>
            </div>

            {/* 5. Completed Packages */}
            <div style={{ background: '#FFF', padding: '0.85rem 1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <div style={{ padding: '0.4rem', background: '#D6BCFA', borderRadius: '8px' }}><CheckCheck color="#322659" size={15} /></div>
                <h3 style={{ margin: 0, color: '#718096', fontSize: '0.76rem', fontWeight: 600 }}>Completed</h3>
              </div>
              <button
                onClick={() => scrollToSection('section-packages', 'completed')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '1.4rem', fontWeight: 800, color: '#322659', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                title="Click to filter completed packages"
              >
                {completedPackages.length} <ArrowRight size={14} />
              </button>
            </div>

            {/* 6. Follow-Up Needed */}
            <div style={{ background: '#FFF', padding: '0.85rem 1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <div style={{ padding: '0.4rem', background: '#FEFCBF', borderRadius: '8px' }}><Clock color="#B7791F" size={15} /></div>
                <h3 style={{ margin: 0, color: '#718096', fontSize: '0.76rem', fontWeight: 600 }}>Follow-Up</h3>
              </div>
              <button
                onClick={() => scrollToSection('section-packages', 'followup')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '1.4rem', fontWeight: 800, color: '#B7791F', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                title="Click to filter follow-up packages"
              >
                {followupPackages.length} <ArrowRight size={14} />
              </button>
            </div>

            {/* 7. Pending Payments */}
            <div style={{ background: '#FFF', padding: '0.85rem 1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <div style={{ padding: '0.4rem', background: '#FED7D7', borderRadius: '8px' }}><CreditCard color="#9B2C2C" size={15} /></div>
                <h3 style={{ margin: 0, color: '#718096', fontSize: '0.76rem', fontWeight: 600 }}>Pending Pay</h3>
              </div>
              <button
                onClick={() => scrollToSection('section-payments')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '1.4rem', fontWeight: 800, color: '#9B2C2C', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                title="Click to view pending payments"
              >
                {pendingPayments.length} <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>

        {/* ── SECTION 2: SAVED PACKAGES LIFECYCLE & CALENDAR MANAGER ── */}
        <div id="section-packages" style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '3rem', border: '1px solid #EDF2F7' }}>
          
          {/* Header Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#2D3748', margin: 0, fontFamily: 'var(--font-playfair), serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package color="var(--emerald-secondary)" size={22} /> Packages Lifecycle & Calendar
              </h2>
              <p style={{ color: '#718096', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                Lifecycle Sequence: Pending ➔ Follow-Up ➔ Confirmed (Admin) ➔ Scheduled ➔ Completed.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {/* View Switcher */}
              <div style={{ background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.2rem', display: 'flex', gap: '0.2rem' }}>
                <button
                  onClick={() => setPackageViewMode('list')}
                  style={{ padding: '0.45rem 0.9rem', borderRadius: '6px', border: 'none', background: packageViewMode === 'list' ? 'var(--emerald-secondary)' : 'transparent', color: packageViewMode === 'list' ? '#FFF' : '#4A5568', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  📋 List Manager
                </button>
                <button
                  onClick={() => setPackageViewMode('calendar')}
                  style={{ padding: '0.45rem 0.9rem', borderRadius: '6px', border: 'none', background: packageViewMode === 'calendar' ? 'var(--emerald-secondary)' : 'transparent', color: packageViewMode === 'calendar' ? '#FFF' : '#4A5568', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  📅 Arrival Calendar
                </button>
              </div>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
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
                    padding: '0.4rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.76rem',
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
              style={{ padding: '0.45rem 0.9rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', width: '250px', outline: 'none' }}
            />
          </div>

          {/* VIEW MODE 1: LIST MANAGER WITH EXPAND / COLLAPSE */}
          {packageViewMode === 'list' && (
            <div style={{ overflowX: 'auto' }}>
              {filteredProposals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#A0AEC0', fontSize: '0.9rem' }}>No packages match the selected criteria.</div>
              ) : (
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#718096' }}>
                      <th style={{ padding: '0.75rem 0.5rem', width: '35px' }}></th>
                      <th style={{ padding: '0.75rem' }}>Proposal Ref</th>
                      <th style={{ padding: '0.75rem' }}>Guest Name</th>
                      <th style={{ padding: '0.75rem' }}>Arrival Date</th>
                      <th style={{ padding: '0.75rem' }}>Total Cost (SGD / ₹)</th>
                      <th style={{ padding: '0.75rem' }}>Latest Activity</th>
                      <th style={{ padding: '0.75rem' }}>Current Status</th>
                      <th style={{ padding: '0.75rem' }}>Set Lifecycle Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProposals.map(p => {
                      const badge = getStatusBadge(p.status)
                      const isExpanded = !!expandedIds[p._id]
                      const latestTimestamp = getLatestTimestamp(p)

                      return (
                        <React.Fragment key={p._id}>
                          <tr style={{ borderBottom: isExpanded ? 'none' : '1px solid #EDF2F7', background: isExpanded ? '#F7FAFC' : p.status === 'confirmed' ? '#F0FFF4' : 'transparent' }}>
                            <td style={{ padding: '0.85rem 0.3rem', textAlign: 'center' }}>
                              <button
                                onClick={() => toggleExpand(p._id)}
                                title={isExpanded ? 'Collapse details' : 'Expand details'}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#718096', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </td>
                            <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#2D3748' }}>{p.proposalNumber}</td>
                            <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>{p.guestName || 'Guest'}</td>
                            <td style={{ padding: '0.85rem 0.75rem', color: p.arrivalDate ? '#2B6CB0' : '#A0AEC0', fontWeight: 600 }}>
                              {p.arrivalDate ? `📅 ${p.arrivalDate}` : 'Not set'}
                            </td>
                            <td style={{ padding: '0.85rem 0.75rem' }}>
                              <div style={{ fontWeight: 800, color: '#22543D' }}>S$ {p.totalClientPrice || 0}</div>
                              {p.costBreakdown?.totalClientPriceINR && (
                                <div style={{ fontSize: '0.75rem', color: '#718096' }}>₹{p.costBreakdown.totalClientPriceINR.toLocaleString()}</div>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.75rem', color: '#718096', fontWeight: 600 }}>
                              {latestTimestamp}
                            </td>
                            <td style={{ padding: '0.85rem 0.75rem' }}>
                              <span style={{ padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: badge.bg, color: badge.color }}>
                                {badge.label}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 0.75rem' }}>
                              <select
                                value={p.status || 'pending'}
                                onChange={e => updatePackageStatus(p._id, e.target.value)}
                                style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E0', fontSize: '0.78rem', fontWeight: 700, background: '#FFF', cursor: 'pointer' }}
                              >
                                <option value="pending">🔵 Pending</option>
                                <option value="followup">🟡 Follow-Up Needed</option>
                                <option value="confirmed">🟢 Confirmed (Admin)</option>
                                <option value="scheduled">💜 Scheduled</option>
                                <option value="completed">✅ Completed</option>
                                <option value="ignore">⚪ Ignore / Closed</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                              <button
                                onClick={() => setSelectedProposal(p)}
                                style={{ border: '1px solid #CBD5E0', background: '#FFF', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <Eye size={14} /> Full Modal
                              </button>
                            </td>
                          </tr>

                          {/* EXPANDABLE INLINE PANEL */}
                          {isExpanded && (
                            <tr style={{ borderBottom: '1px solid #EDF2F7', background: '#F7FAFC' }}>
                              <td colSpan={9} style={{ padding: '1rem 1.5rem' }}>
                                <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                                  
                                  <div>
                                    <div style={{ fontSize: '0.72rem', color: '#718096', fontWeight: 700, textTransform: 'uppercase' }}>Stay & Guests</div>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2D3748', marginTop: '0.2rem' }}>
                                      {p.nights || 3} Nights — {p.adults || 2} Adults, {p.kids || 0} Kids
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#4A5568', marginTop: '0.15rem' }}>
                                      Hotel: {p.hotelName || 'No hotel selected'} ({p.roomType || 'Standard'})
                                    </div>
                                  </div>

                                  <div>
                                    <div style={{ fontSize: '0.72rem', color: '#718096', fontWeight: 700, textTransform: 'uppercase' }}>Price Breakdown</div>
                                    <div style={{ fontSize: '0.8rem', color: '#4A5568', marginTop: '0.2rem' }}>
                                      Rooms: S${p.costBreakdown?.roomCostTotal || 0} · Transport: S${p.costBreakdown?.transportTotal || 0}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#4A5568', marginTop: '0.15rem' }}>
                                      Attractions: S${p.costBreakdown?.attractionTotal || 0} · Meals: S${p.costBreakdown?.mealTotal || 0}
                                    </div>
                                  </div>

                                  <div>
                                    <div style={{ fontSize: '0.72rem', color: '#718096', fontWeight: 700, textTransform: 'uppercase' }}>Timestamp Audit</div>
                                    <div style={{ fontSize: '0.78rem', color: '#4A5568', marginTop: '0.2rem' }}>
                                      Created: {p._createdAt ? new Date(p._createdAt).toLocaleString() : 'N/A'}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#4A5568', marginTop: '0.15rem' }}>
                                      Last Modified: {p._updatedAt ? new Date(p._updatedAt).toLocaleString() : 'N/A'}
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <a
                                      href={`/custom-package/proposal/${p.proposalNumber}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.45rem 0.9rem', background: '#2B6CB0', color: '#FFF', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700 }}
                                    >
                                      <ExternalLink size={14} /> Open Link
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: '#F7FAFC', padding: '0.75rem 1.25rem', borderRadius: '10px' }}>
                <button
                  onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#4A5568' }}
                >
                  <ChevronLeft size={18} /> Previous Month
                </button>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2D3748', fontWeight: 800 }}>
                  {monthNames[month]} {year}
                </h3>
                <button
                  onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#4A5568' }}
                >
                  Next Month <ChevronRight size={18} />
                </button>
              </div>

              {/* Grid Header Days */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#718096', marginBottom: '0.5rem' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={{ padding: '0.4rem' }}>{d}</div>)}
              </div>

              {/* Grid Day Cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {/* Empty cells before 1st day */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ background: '#FAF5FF', minHeight: '90px', borderRadius: '8px', opacity: 0.4 }} />
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
                    <div key={dayNum} style={{ background: '#F7FAFC', border: '1px solid #EDF2F7', minHeight: '95px', borderRadius: '8px', padding: '0.4rem', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.3rem' }}>{dayNum}</div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', flex: 1 }}>
                        {dayProposals.map(p => {
                          const badge = getStatusBadge(p.status)
                          return (
                            <div
                              key={p._id}
                              onClick={() => setSelectedProposal(p)}
                              style={{
                                background: badge.bg,
                                color: badge.color,
                                padding: '0.2rem 0.4rem',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
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
        <div id="section-sitemap" style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Map size={22} color="#4A5568" />
            <h2 style={{ fontSize: '1.4rem', color: '#2D3748', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>Site Map & Quick Links</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Core Operations */}
            <div style={{ background: '#FFF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#2D3748', marginBottom: '1rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} color="#D69E2E" /> Core Operations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { name: 'Sanity Studio CMS', path: '/studio', desc: 'Manage content & schemas' },
                  { name: 'Singapore Attractions', path: '/singapore-attractions', desc: 'B2B/B2C Quote Builder' },
                  { name: 'Active Promotions', path: '/singapore-attractions/promotions', desc: 'Discounted attraction deals' },
                ].map(link => (
                  <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F7FAFC', borderRadius: '8px', textDecoration: 'none', color: '#2D3748', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#EDF2F7'} onMouseLeave={e => e.currentTarget.style.background = '#F7FAFC'}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{link.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>{link.desc}</div>
                    </div>
                    <ExternalLink size={16} color="#A0AEC0" />
                  </a>
                ))}
              </div>
            </div>

            {/* Client Tools */}
            <div style={{ background: '#FFF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#2D3748', marginBottom: '1rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={18} color="#3182CE" /> Client Tools
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { name: 'AI Trip Planner', path: '/ai-planner', desc: 'Intelligent itinerary generation' },
                  { name: 'Instant Quote', path: '/instant-quote', desc: 'Quick package estimation' },
                  { name: 'Live Bookings', path: '/Attractions_live', desc: 'Real-time booking portal' },
                ].map(link => (
                  <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F7FAFC', borderRadius: '8px', textDecoration: 'none', color: '#2D3748', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#EDF2F7'} onMouseLeave={e => e.currentTarget.style.background = '#F7FAFC'}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{link.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>{link.desc}</div>
                    </div>
                    <ExternalLink size={16} color="#A0AEC0" />
                  </a>
                ))}
              </div>
            </div>

            {/* Public Pages */}
            <div style={{ background: '#FFF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#2D3748', marginBottom: '1rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={18} color="#38A169" /> Public Pages
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { name: 'Homepage', path: '/', desc: 'Main landing page' },
                  { name: 'Travel Blog', path: '/blog', desc: 'SEO articles and guides' },
                  { name: 'Contact Us', path: '/contact', desc: 'Support and inquiries' },
                ].map(link => (
                  <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F7FAFC', borderRadius: '8px', textDecoration: 'none', color: '#2D3748', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#EDF2F7'} onMouseLeave={e => e.currentTarget.style.background = '#F7FAFC'}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{link.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>{link.desc}</div>
                    </div>
                    <ExternalLink size={16} color="#A0AEC0" />
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── SECTION 4 & 5 & 6: PAYMENTS, AGENTS, EXPORTS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* PENDING PAYMENTS */}
            <div id="section-payments" style={{ background: '#FFF', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#2D3748', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} color="#9B2C2C" /> Pending Manual Payments
              </h2>
              {pendingPayments.length === 0 ? <p style={{ color: '#718096', fontSize: '0.9rem' }}>No pending payments to verify.</p> : (
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#718096' }}>
                      <th style={{ padding: '0.75rem 0' }}>Ref</th>
                      <th style={{ padding: '0.75rem 0' }}>Amount</th>
                      <th style={{ padding: '0.75rem 0' }}>UTR Number</th>
                      <th style={{ padding: '0.75rem 0' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayments.map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                        <td style={{ padding: '0.85rem 0', fontWeight: 600 }}>{p.bookingReference || 'N/A'}</td>
                        <td style={{ padding: '0.85rem 0', fontWeight: 700, color: '#22543D' }}>₹{p.amountInr}</td>
                        <td style={{ padding: '0.85rem 0', fontFamily: 'monospace' }}>{p.utrNumber}</td>
                        <td style={{ padding: '0.85rem 0', display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => updatePaymentStatus(p._id, 'verified')} style={{ background: '#48BB78', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0.4rem 0.75rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}><CheckCircle size={14} /> Verify</button>
                          <button onClick={() => updatePaymentStatus(p._id, 'rejected')} style={{ background: '#F56565', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0.4rem 0.75rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}><XCircle size={14} /> Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* B2B AGENT APPROVALS */}
            <div id="section-agents" style={{ background: '#FFF', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#2D3748', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} color="#319795" /> B2B Agent Approvals & Status
              </h2>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#718096' }}>
                    <th style={{ padding: '0.75rem 0' }}>Company</th>
                    <th style={{ padding: '0.75rem 0' }}>Email</th>
                    <th style={{ padding: '0.75rem 0' }}>Status</th>
                    <th style={{ padding: '0.75rem 0' }}>Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map(a => (
                    <tr key={a._id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                      <td style={{ padding: '0.85rem 0', fontWeight: 600 }}>{a.companyName}</td>
                      <td style={{ padding: '0.85rem 0' }}>{a.email}</td>
                      <td style={{ padding: '0.85rem 0' }}>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: a.isActive ? '#C6F6D5' : '#FED7D7', color: a.isActive ? '#22543D' : '#742A2A' }}>
                          {a.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0' }}>
                        <button onClick={() => toggleAgentStatus(a._id, a.isActive)} style={{ background: '#E2E8F0', border: 'none', borderRadius: '6px', padding: '0.35rem 0.85rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                          {a.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DATA EXPORTS */}
            <div id="section-exports" style={{ background: '#FFF', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#2D3748', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={20} color="#2B6CB0" /> Data Exports & Reports
              </h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="/api/admin/export-agents" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#2B6CB0', color: '#FFF', textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}><Download size={16} /> Export Agents CSV</a>
                <a href="/api/admin/export-contacts" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#2B6CB0', color: '#FFF', textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}><Download size={16} /> Export Contacts CSV</a>
                <a href="/api/admin/export-payments" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#2B6CB0', color: '#FFF', textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}><Download size={16} /> Export Payments CSV</a>
              </div>
            </div>
          </div>

          {/* AUDIT LOGS */}
          <div id="section-audit-logs" style={{ background: '#FFF', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7', height: 'fit-content', maxHeight: '800px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#2D3748', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={18} /> Audit Trail</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {logs.length === 0 ? <p style={{ color: '#718096', fontSize: '0.85rem' }}>No logs recorded yet.</p> : logs.map(log => (
                <div key={log._id} style={{ padding: '0.85rem', background: '#F7FAFC', borderRadius: '8px', borderLeft: '4px solid #3182CE' }}>
                  <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.2rem' }}>{new Date(log.timestamp).toLocaleString()}</div>
                  <div style={{ fontWeight: 600, color: '#2D3748', fontSize: '0.85rem', marginBottom: '0.15rem' }}>{log.action}</div>
                  <div style={{ fontSize: '0.8rem', color: '#4A5568' }}>{log.email}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── PACKAGE DETAIL MODAL ── */}
        {selectedProposal && (
          <div onClick={() => setSelectedProposal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: '16px', maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-accent)', textTransform: 'uppercase' }}>Package Proposal Details</div>
                  <h2 style={{ fontSize: '1.4rem', color: '#2D3748', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>{selectedProposal.proposalNumber}</h2>
                  <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.2rem' }}>Guest: {selectedProposal.guestName || 'N/A'}</div>
                </div>
                <button onClick={() => setSelectedProposal(null)} style={{ border: 'none', background: '#EDF2F7', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 700 }}>✕</button>
              </div>

              {/* Status Change Strip */}
              <div style={{ background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 700 }}>ADMIN STATUS UPDATE</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2D3748', marginTop: '0.15rem' }}>
                    Current: {getStatusBadge(selectedProposal.status).label}
                  </div>
                </div>
                <select
                  value={selectedProposal.status || 'pending'}
                  onChange={e => updatePackageStatus(selectedProposal._id, e.target.value)}
                  style={{ padding: '0.45rem 0.8rem', borderRadius: '8px', border: '1px solid var(--emerald-secondary)', fontSize: '0.85rem', fontWeight: 800, background: '#FFF', cursor: 'pointer' }}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#F7FAFC', padding: '0.9rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#718096', fontWeight: 700 }}>ARRIVAL DATE</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2D3748', marginTop: '0.2rem' }}>{selectedProposal.arrivalDate || 'Not set'}</div>
                </div>
                <div style={{ background: '#F7FAFC', padding: '0.9rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#718096', fontWeight: 700 }}>STAY DURATION</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2D3748', marginTop: '0.2rem' }}>{selectedProposal.nights} Nights ({selectedProposal.adults || 2} Adults, {selectedProposal.kids || 0} Kids)</div>
                </div>
                <div style={{ background: '#F0FFF4', padding: '0.9rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#22543D', fontWeight: 700 }}>TOTAL CLIENT PRICE (SGD)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#22543D', marginTop: '0.2rem' }}>S$ {selectedProposal.totalClientPrice || 0}</div>
                </div>
                <div style={{ background: '#F0FFF4', padding: '0.9rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#22543D', fontWeight: 700 }}>APPROX PRICE (INR ₹)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#22543D', marginTop: '0.2rem' }}>₹{(selectedProposal.costBreakdown?.totalClientPriceINR || 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Timestamp Audit */}
              <div style={{ background: '#F7FAFC', border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: '#4A5568', marginBottom: '1.5rem' }}>
                <div>⏱️ {getLatestTimestamp(selectedProposal)}</div>
                <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.15rem' }}>
                  Created: {selectedProposal._createdAt ? new Date(selectedProposal._createdAt).toLocaleString() : 'N/A'} | Updated: {selectedProposal._updatedAt ? new Date(selectedProposal._updatedAt).toLocaleString() : 'N/A'}
                </div>
              </div>

              {/* Agent info */}
              {selectedProposal.agent && (
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.35rem' }}>Agent Info</div>
                  <div style={{ fontSize: '0.85rem', color: '#2D3748' }}>Company: <strong>{selectedProposal.agent.companyName || 'B2B Partner'}</strong></div>
                  <div style={{ fontSize: '0.85rem', color: '#2D3748' }}>Email: {selectedProposal.agent.email}</div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                <a
                  href={`/custom-package/proposal/${selectedProposal.proposalNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.6rem 1.2rem', background: '#2B6CB0', color: '#FFF', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}
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
