'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, ShieldAlert } from 'lucide-react'

// Layout & View Components
import AdminSidebar, { AdminWorkspace } from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminOverviewView from '../../components/admin/views/AdminOverviewView'
import AdminPackagesView from '../../components/admin/views/AdminPackagesView'
import AdminOperationsView from '../../components/admin/views/AdminOperationsView'
import AdminFinanceView from '../../components/admin/views/AdminFinanceView'
import AdminMarketingView from '../../components/admin/views/AdminMarketingView'
import AdminSystemView from '../../components/admin/views/AdminSystemView'

// Modals & Utilities
import GroupHotelVoucherModal from '../../components/GroupHotelVoucherModal'

function AdminDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Authentication & Loading
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Navigation State
  const [currentWorkspace, setCurrentWorkspace] = useState<AdminWorkspace>('overview')
  const [currentSubTab, setCurrentSubTab] = useState('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Core Data State
  const [metrics, setMetrics] = useState({ activeAgents: 0, pendingPayments: 0, totalContacts: 0 })
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [proposals, setProposals] = useState<any[]>([])
  const [hotelVouchers, setHotelVouchers] = useState<any[]>([])
  const [loadingVouchers, setLoadingVouchers] = useState(false)
  const [consultingBookings, setConsultingBookings] = useState<any[]>([])
  const [loadingConsulting, setLoadingConsulting] = useState(false)
  const [competitorPrices, setCompetitorPrices] = useState<any[]>([])
  const [refreshingPrices, setRefreshingPrices] = useState(false)

  // Sync Attractions State
  const [syncingAttractions, setSyncingAttractions] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  // Modals & Selected items
  const [voucherModalOpen, setVoucherModalOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<any | null>(null)
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null)

  // Ad Toggles
  const [adBlogEnabled, setAdBlogEnabled] = useState(true)
  const [adTravelToolsEnabled, setAdTravelToolsEnabled] = useState(true)
  const [adTravelNewsEnabled, setAdTravelNewsEnabled] = useState(true)
  const [adBorderTrafficEnabled, setAdBorderTrafficEnabled] = useState(true)
  const [adAirlinePromosEnabled, setAdAirlinePromosEnabled] = useState(true)

  // Load Ad settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAdBlogEnabled(localStorage.getItem('fw_ads_disabled_blog') !== 'true')
      setAdTravelToolsEnabled(localStorage.getItem('fw_ads_disabled_travel-tools') !== 'true')
      setAdTravelNewsEnabled(localStorage.getItem('fw_hide_travel_news') !== 'true')
      setAdBorderTrafficEnabled(localStorage.getItem('fw_hide_border_traffic') !== 'true')
      setAdAirlinePromosEnabled(localStorage.getItem('fw_hide_airline_promos') !== 'true')
    }
  }, [])

  // Backward compatibility: Support URL query parameters or hash anchors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      const wsParam = searchParams.get('workspace') as AdminWorkspace
      const tabParam = searchParams.get('tab')

      if (wsParam) {
        setCurrentWorkspace(wsParam)
        if (tabParam) setCurrentSubTab(tabParam)
        return
      }

      if (hash) {
        if (hash === '#section-packages') {
          setCurrentWorkspace('packages')
          setCurrentSubTab('list')
        } else if (hash === '#section-approvals') {
          setCurrentWorkspace('packages')
          setCurrentSubTab('approvals')
        } else if (hash === '#section-hotel-vouchers') {
          setCurrentWorkspace('operations')
          setCurrentSubTab('vouchers')
        } else if (hash === '#section-consulting') {
          setCurrentWorkspace('operations')
          setCurrentSubTab('consulting')
        } else if (hash === '#section-accounts') {
          setCurrentWorkspace('finance')
          setCurrentSubTab('ledger')
        } else if (hash === '#section-invoices') {
          setCurrentWorkspace('finance')
          setCurrentSubTab('invoices')
        } else if (hash === '#section-payments') {
          setCurrentWorkspace('finance')
          setCurrentSubTab('payments')
        } else if (hash === '#section-newsletters') {
          setCurrentWorkspace('marketing')
          setCurrentSubTab('newsletters')
        } else if (hash === '#section-leads-directory') {
          setCurrentWorkspace('marketing')
          setCurrentSubTab('leads')
        } else if (hash === '#section-job-openings') {
          setCurrentWorkspace('marketing')
          setCurrentSubTab('jobs')
        } else if (hash === '#section-ads') {
          setCurrentWorkspace('marketing')
          setCurrentSubTab('ads')
        } else if (hash === '#section-sitemap') {
          setCurrentWorkspace('system')
          setCurrentSubTab('sitemap')
        } else if (hash === '#section-audit-logs') {
          setCurrentWorkspace('system')
          setCurrentSubTab('audit')
        } else if (hash === '#section-competitor-pricing') {
          setCurrentWorkspace('system')
          setCurrentSubTab('competitor')
        }
      }
    }
  }, [searchParams])

  // Data Fetching
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

        await fetchHotelVouchers()
        await fetchConsultingBookings()
        await fetchCompetitorPrices()
      } else {
        setIsAdmin(false)
      }
    } catch (e) {
      console.error('Error fetching admin data:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchHotelVouchers = async () => {
    setLoadingVouchers(true)
    try {
      const res = await fetch(`/api/hotel-vouchers?cb=${Date.now()}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.vouchers)) {
        setHotelVouchers(data.vouchers)
      }
    } catch (e) {
      console.error('Failed to fetch hotel vouchers:', e)
    } finally {
      setLoadingVouchers(false)
    }
  }

  const fetchConsultingBookings = async () => {
    setLoadingConsulting(true)
    try {
      const res = await fetch(`/api/admin/travel-consulting?cb=${Date.now()}`)
      const json = await res.json()
      if (json.success && Array.isArray(json.bookings)) {
        setConsultingBookings(json.bookings)
      }
    } catch (e) {
      console.error('Failed to fetch consulting bookings:', e)
    } finally {
      setLoadingConsulting(false)
    }
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

  const handleSyncAttractions = async () => {
    setSyncingAttractions(true)
    setSyncMessage(null)
    try {
      const res = await fetch('/api/admin/sync-attractions', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSyncMessage(data.message || `Synced ${data.count} attractions & purged page cache!`)
      } else {
        setSyncMessage(`Error: ${data.error || 'Failed to sync'}`)
      }
    } catch (e: any) {
      setSyncMessage(`Error: ${e.message}`)
    } finally {
      setSyncingAttractions(false)
      setTimeout(() => setSyncMessage(null), 6000)
    }
  }

  const updatePackageStatus = async (proposalId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/packages/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, status })
      })
      const data = await res.json()
      if (data.success) {
        setProposals((prev: any[]) => prev.map(p => (p._id === proposalId ? { ...p, status } : p)))
        if (selectedProposal && selectedProposal._id === proposalId) {
          setSelectedProposal((prev: any) => (prev ? { ...prev, status } : null))
        }
      } else {
        alert(data.error || 'Failed to update package status')
      }
    } catch (e) {
      alert('Error updating package status')
    }
  }

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
      if (!newStatus) localStorage.setItem('fw_hide_travel_news', 'true')
      else localStorage.removeItem('fw_hide_travel_news')
    }
    alert(`Travel News Radar is now ${newStatus ? 'ENABLED 🟢' : 'HIDDEN 🔴'}`)
  }

  const toggleBorderTraffic = () => {
    const newStatus = !adBorderTrafficEnabled
    setAdBorderTrafficEnabled(newStatus)
    if (typeof window !== 'undefined') {
      if (!newStatus) localStorage.setItem('fw_hide_border_traffic', 'true')
      else localStorage.removeItem('fw_hide_border_traffic')
    }
    alert(`Border Traffic Radar is now ${newStatus ? 'ENABLED 🟢' : 'HIDDEN 🔴'}`)
  }

  const toggleAirlinePromos = () => {
    const newStatus = !adAirlinePromosEnabled
    setAdAirlinePromosEnabled(newStatus)
    if (typeof window !== 'undefined') {
      if (!newStatus) localStorage.setItem('fw_hide_airline_promos', 'true')
      else localStorage.removeItem('fw_hide_airline_promos')
    }
    alert(`Airline Promotions Radar is now ${newStatus ? 'ENABLED 🟢' : 'HIDDEN 🔴'}`)
  }

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [])

  // Switch Workspace Helper
  const handleSelectWorkspace = (workspace: AdminWorkspace, subTab?: string) => {
    setCurrentWorkspace(workspace)
    if (subTab) {
      setCurrentSubTab(subTab)
    } else {
      // Default sub-tab for workspace
      switch (workspace) {
        case 'overview':
          setCurrentSubTab('dashboard')
          break
        case 'packages':
          setCurrentSubTab('list')
          break
        case 'operations':
          setCurrentSubTab('vouchers')
          break
        case 'finance':
          setCurrentSubTab('ledger')
          break
        case 'marketing':
          setCurrentSubTab('newsletters')
          break
        case 'system':
          setCurrentSubTab('sitemap')
          break
      }
    }
  }

  // Loading Screen
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#0B1320',
          color: '#E2E8F0',
          gap: '1rem'
        }}
      >
        <Loader2 className="animate-spin" size={42} color="var(--emerald-secondary)" />
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>
          Initializing Flying Wonders Admin Command...
        </div>
      </div>
    )
  }

  // Access Denied Screen
  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#F8FAFC',
          padding: '2rem'
        }}
      >
        <ShieldAlert size={64} color="#E53E3E" style={{ marginBottom: '1rem' }} />
        <h1
          style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: '2.5rem',
            color: '#1E293B',
            marginBottom: '0.5rem'
          }}
        >
          Administrator Access Required
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.05rem', marginBottom: '2rem', textAlign: 'center' }}>
          You must be authenticated with an active administrator account to access this command center.
        </p>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '0.75rem 2rem',
            background: 'var(--emerald-secondary)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Return to Flying Wonders Home
        </button>
      </div>
    )
  }

  // Counts & Calculations
  const pendingApprovalsCount = proposals.filter(p => p.statusChangeRequested).length
  const urgentCount = pendingApprovalsCount + pendingPayments.length

  // Workspace Headers & SubTabs configuration
  const getWorkspaceConfig = () => {
    switch (currentWorkspace) {
      case 'overview':
        return {
          title: 'Executive Cockpit',
          subtitle: 'High-level business health, recent proposals, and instant action queue.',
          subTabs: [
            { id: 'dashboard', label: 'Executive Cockpit' }
          ]
        }
      case 'packages':
        return {
          title: 'Packages & Booking Calendar',
          subtitle: 'Track FIT proposal lifecycles, arrival calendar schedules, and agent requests.',
          subTabs: [
            { id: 'list', label: '📋 Proposal Lifecycle', badge: proposals.length },
            { id: 'calendar', label: '📅 Arrival Calendar' },
            {
              id: 'approvals',
              label: '⚡ Status Approvals',
              badge: pendingApprovalsCount,
              badgeColor: 'urgent' as const
            }
          ]
        }
      case 'operations':
        return {
          title: 'Travel Operations & Logistics',
          subtitle: 'Issue Visa-ready hotel vouchers and manage custom itinerary consulting bookings.',
          subTabs: [
            { id: 'vouchers', label: '🏨 Hotel Vouchers (Visa-Ready)', badge: hotelVouchers.length },
            { id: 'consulting', label: '🧭 Travel Consulting Inquiries', badge: consultingBookings.length }
          ]
        }
      case 'finance':
        return {
          title: 'Finance, Billing & Accounts',
          subtitle: 'Consolidated agency dues, outstanding balances, and customer GST invoices.',
          subTabs: [
            { id: 'ledger', label: '📊 Accounts & Ledger' },
            { id: 'invoices', label: '🧾 Customer Invoices & Receipts' },
            {
              id: 'payments',
              label: '💳 Manual Payments',
              badge: pendingPayments.length,
              badgeColor: 'urgent' as const
            }
          ]
        }
      case 'marketing':
        return {
          title: 'Marketing & Outreach Hub',
          subtitle: 'Manage newsletter broadcasts, inbound leads database, career postings, and ads.',
          subTabs: [
            { id: 'newsletters', label: '✉️ Email Campaigns' },
            { id: 'leads', label: '👥 Leads Directory', badge: metrics.totalContacts },
            { id: 'jobs', label: '💼 Careers & Hiring' },
            { id: 'ads', label: '📢 Ads & Radar Switches' }
          ]
        }
      case 'system':
        return {
          title: 'System & Platform Settings',
          subtitle: 'Interactive site map, Google Sheets sync, competitor price radar, and audit trail.',
          subTabs: [
            { id: 'sitemap', label: '🗺️ Site Map & 51 Routes' },
            { id: 'sync', label: '🔄 Attractions Sheets Sync' },
            { id: 'competitor', label: '🎡 Competitor Ticket Tracker' },
            { id: 'agents', label: '👤 Agent Access', badge: metrics.activeAgents },
            { id: 'audit', label: '🛡️ Audit Trail', badge: logs.length },
            { id: 'exports', label: '📥 Data Exports' }
          ]
        }
    }
  }

  const workspaceConfig = getWorkspaceConfig()

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex' }}>
      
      {/* ── 1. COLLAPSIBLE LUXURY SIDEBAR ── */}
      <AdminSidebar
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={handleSelectWorkspace}
        currentSubTab={currentSubTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        badges={{
          totalProposals: proposals.length,
          pendingApprovals: pendingApprovalsCount,
          pendingPayments: pendingPayments.length,
          hotelVouchers: hotelVouchers.length,
          consultingBookings: consultingBookings.length,
          activeAgents: metrics.activeAgents,
          totalContacts: metrics.totalContacts,
          auditLogs: logs.length
        }}
      />

      {/* ── 2. MAIN WORKSPACE CONTAINER ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        
        {/* Top Header & Sub-Tabs */}
        <AdminHeader
          currentWorkspace={currentWorkspace}
          workspaceTitle={workspaceConfig.title}
          workspaceSubtitle={workspaceConfig.subtitle}
          subTabs={workspaceConfig.subTabs}
          currentSubTab={currentSubTab}
          onSelectSubTab={tabId => setCurrentSubTab(tabId)}
          urgentActionCount={urgentCount}
          onUrgentActionClick={() => {
            if (pendingApprovalsCount > 0) {
              handleSelectWorkspace('packages', 'approvals')
            } else if (pendingPayments.length > 0) {
              handleSelectWorkspace('finance', 'payments')
            }
          }}
          onSyncAttractions={handleSyncAttractions}
          isSyncingAttractions={syncingAttractions}
          syncMessage={syncMessage}
          onRefreshData={fetchData}
          isRefreshing={refreshing}
          onCreateVoucher={() => {
            setEditingVoucher(null)
            setVoucherModalOpen(true)
          }}
        />

        {/* Focused Canvas View (Only renders active workspace!) */}
        <main style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          
          {currentWorkspace === 'overview' && (
            <AdminOverviewView
              metrics={metrics}
              proposals={proposals}
              hotelVouchers={hotelVouchers}
              consultingBookings={consultingBookings}
              pendingPayments={pendingPayments}
              logs={logs}
              onNavigate={handleSelectWorkspace}
              onCreateVoucher={() => {
                setEditingVoucher(null)
                setVoucherModalOpen(true)
              }}
              onSyncAttractions={handleSyncAttractions}
              isSyncing={syncingAttractions}
              onSelectProposal={setSelectedProposal}
            />
          )}

          {currentWorkspace === 'packages' && (
            <AdminPackagesView
              proposals={proposals}
              setProposals={setProposals}
              subTab={currentSubTab}
              onSelectSubTab={setCurrentSubTab}
              updatePackageStatus={updatePackageStatus}
              refreshData={fetchData}
              selectedProposal={selectedProposal}
              setSelectedProposal={setSelectedProposal}
            />
          )}

          {currentWorkspace === 'operations' && (
            <AdminOperationsView
              hotelVouchers={hotelVouchers}
              loadingVouchers={loadingVouchers}
              fetchHotelVouchers={fetchHotelVouchers}
              onEditVoucher={v => {
                setEditingVoucher(v)
                setVoucherModalOpen(true)
              }}
              onCreateVoucher={() => {
                setEditingVoucher(null)
                setVoucherModalOpen(true)
              }}
              consultingBookings={consultingBookings}
              loadingConsulting={loadingConsulting}
              fetchConsultingBookings={fetchConsultingBookings}
              subTab={currentSubTab}
              onSelectSubTab={setCurrentSubTab}
            />
          )}

          {currentWorkspace === 'finance' && (
            <AdminFinanceView
              proposals={proposals}
              pendingPayments={pendingPayments}
              updatePaymentStatus={updatePaymentStatus}
              subTab={currentSubTab}
              onSelectSubTab={setCurrentSubTab}
            />
          )}

          {currentWorkspace === 'marketing' && (
            <AdminMarketingView
              subTab={currentSubTab}
              onSelectSubTab={setCurrentSubTab}
              adBlogEnabled={adBlogEnabled}
              adTravelToolsEnabled={adTravelToolsEnabled}
              adTravelNewsEnabled={adTravelNewsEnabled}
              adBorderTrafficEnabled={adBorderTrafficEnabled}
              adAirlinePromosEnabled={adAirlinePromosEnabled}
              toggleAdCategory={toggleAdCategory}
              toggleTravelNews={toggleTravelNews}
              toggleBorderTraffic={toggleBorderTraffic}
              toggleAirlinePromos={toggleAirlinePromos}
            />
          )}

          {currentWorkspace === 'system' && (
            <AdminSystemView
              subTab={currentSubTab}
              onSelectSubTab={setCurrentSubTab}
              onSyncAttractions={handleSyncAttractions}
              isSyncingAttractions={syncingAttractions}
              syncMessage={syncMessage}
              competitorPrices={competitorPrices}
              isRefreshingPrices={refreshingPrices}
              triggerPriceRefresh={triggerPriceRefresh}
              agents={agents}
              toggleAgentStatus={toggleAgentStatus}
              logs={logs}
            />
          )}

        </main>
      </div>

      {/* ── GROUP HOTEL VOUCHER MODAL ── */}
      <GroupHotelVoucherModal
        isOpen={voucherModalOpen}
        onClose={() => {
          setVoucherModalOpen(false)
          setEditingVoucher(null)
        }}
        onSaved={() => {
          fetchHotelVouchers()
        }}
        existingVoucher={editingVoucher}
      />

    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0B1320' }}>
          <Loader2 className="animate-spin" size={40} color="var(--emerald-secondary)" />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  )
}
