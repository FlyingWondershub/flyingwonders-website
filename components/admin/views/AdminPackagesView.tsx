'use client'

import React, { useState } from 'react'
import {
  Package,
  Calendar,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react'

interface AdminPackagesViewProps {
  proposals: any[]
  setProposals: React.Dispatch<React.SetStateAction<any[]>>
  subTab: string
  onSelectSubTab: (subTabId: string) => void
  updatePackageStatus: (proposalId: string, status: string) => Promise<void>
  refreshData: () => Promise<void>
  selectedProposal: any | null
  setSelectedProposal: (proposal: any | null) => void
}

export default function AdminPackagesView({
  proposals,
  setProposals,
  subTab,
  onSelectSubTab,
  updatePackageStatus,
  refreshData,
  selectedProposal,
  setSelectedProposal
}: AdminPackagesViewProps) {
  // Table filters & search
  const [packageFilter, setPackageFilter] = useState('all')
  const [packageSearch, setPackageSearch] = useState('')
  const [pageSize, setPageSize] = useState<number | 'all'>(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date())

  // Calculations
  const pendingApprovals = proposals.filter(p => p.statusChangeRequested)
  const confirmedPackages = proposals.filter(p => p.status === 'confirmed')
  const scheduledPackages = proposals.filter(p => p.status === 'scheduled')
  const completedPackages = proposals.filter(p => p.status === 'completed')
  const followupPackages = proposals.filter(p => p.status === 'followup')
  const pendingPackages = proposals.filter(p => !p.status || p.status === 'pending')
  const ignoredPackages = proposals.filter(p => p.status === 'ignore')

  // Filter logic
  const filteredProposals = proposals.filter(p => {
    const pStatus = p.status || 'pending'
    const matchesFilter = packageFilter === 'all' || pStatus === packageFilter
    const term = packageSearch.toLowerCase().trim()
    const matchesSearch =
      !term ||
      (p.proposalNumber && p.proposalNumber.toLowerCase().includes(term)) ||
      (p.guestName && p.guestName.toLowerCase().includes(term)) ||
      (p.agent?.email && p.agent.email.toLowerCase().includes(term)) ||
      (p.agent?.companyName && p.agent.companyName.toLowerCase().includes(term))
    return matchesFilter && matchesSearch
  })

  // Pagination
  const totalPages =
    pageSize === 'all' ? 1 : Math.max(1, Math.ceil(filteredProposals.length / (pageSize as number)))

  const paginatedProposals =
    pageSize === 'all'
      ? filteredProposals
      : filteredProposals.slice(
          (currentPage - 1) * (pageSize as number),
          currentPage * (pageSize as number)
        )

  const areAllRowsExpanded =
    paginatedProposals.length > 0 && paginatedProposals.every(p => !!expandedIds[p._id])

  const toggleAllPackageRows = () => {
    if (areAllRowsExpanded) {
      setExpandedIds({})
    } else {
      const next: Record<string, boolean> = { ...expandedIds }
      paginatedProposals.forEach(p => {
        next[p._id] = true
      })
      setExpandedIds(next)
    }
  }

  const toggleRow = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Calendar Helpers
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const getStatusBadge = (st: string = 'pending') => {
    switch (st) {
      case 'confirmed':
        return { label: '🟢 Confirmed', bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' }
      case 'scheduled':
        return { label: '💜 Scheduled', bg: '#F3E8FF', color: '#6B21A8', border: '#E9D8FD' }
      case 'completed':
        return { label: '✅ Completed', bg: '#EDE9FE', color: '#4C1D95', border: '#D8B4FE' }
      case 'followup':
        return { label: '🟡 Follow-Up', bg: '#FEF9C3', color: '#854D0E', border: '#FEF08A' }
      case 'ignore':
        return { label: '⚪ Ignored', bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' }
      default:
        return { label: '🔵 Pending', bg: '#E0F2FE', color: '#075985', border: '#BAE6FD' }
    }
  }

  const getLatestTimestamp = (p: any) => {
    const created = p._createdAt ? new Date(p._createdAt).getTime() : 0
    const updated = p._updatedAt ? new Date(p._updatedAt).getTime() : 0
    const latestTime = Math.max(created, updated)
    if (!latestTime) return 'N/A'
    const isUpdate = updated > created
    const formatted = new Date(latestTime).toLocaleString('en-SG', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    return `${isUpdate ? 'Upd' : 'Cre'}: ${formatted}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      
      {/* ── SUB-TAB 1: LIFECYCLE LIST VIEW ── */}
      {subTab === 'list' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          {/* Filter Pills & Search */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem'
            }}
          >
            {/* Status Pills */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `All (${proposals.length})` },
                { id: 'pending', label: `🔵 Pending (${pendingPackages.length})` },
                { id: 'followup', label: `🟡 Follow-Up (${followupPackages.length})` },
                { id: 'confirmed', label: `🟢 Confirmed (${confirmedPackages.length})` },
                { id: 'scheduled', label: `💜 Scheduled (${scheduledPackages.length})` },
                { id: 'completed', label: `✅ Completed (${completedPackages.length})` },
                { id: 'ignore', label: `⚪ Ignored (${ignoredPackages.length})` }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    setPackageFilter(f.id)
                    setCurrentPage(1)
                  }}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    border: packageFilter === f.id ? '1px solid #0F172A' : '1px solid #E2E8F0',
                    background: packageFilter === f.id ? '#0F172A' : '#F8FAFC',
                    color: packageFilter === f.id ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Controls: Expand Rows, Show count, Search */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={toggleAllPackageRows}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '7px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid #CBD5E1',
                  background: areAllRowsExpanded ? '#F1F5F9' : '#FFFFFF',
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                title={areAllRowsExpanded ? 'Collapse all rows' : 'Expand all rows'}
              >
                {areAllRowsExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                <span>{areAllRowsExpanded ? 'Collapse Rows' : 'Expand Rows'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
                <span>Show:</span>
                {[15, 30, 50, 'all'].map(sz => (
                  <button
                    key={String(sz)}
                    onClick={() => {
                      setPageSize(sz as any)
                      setCurrentPage(1)
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '5px',
                      border: pageSize === sz ? 'none' : '1px solid #E2E8F0',
                      background: pageSize === sz ? 'var(--emerald-secondary)' : '#FFFFFF',
                      color: pageSize === sz ? '#FFFFFF' : '#64748B',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {sz === 'all' ? 'All' : sz}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Search guest, FW ref, agent..."
                  value={packageSearch}
                  onChange={e => {
                    setPackageSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  style={{
                    padding: '0.45rem 0.85rem 0.45rem 2rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    width: '230px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredProposals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8', fontSize: '0.9rem' }}>
              No proposals match your search or filter.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.65rem 0.35rem', width: '30px', textAlign: 'center' }}>
                      <button
                        onClick={toggleAllPackageRows}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B', padding: 0 }}
                      >
                        {areAllRowsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </th>
                    <th style={{ padding: '0.65rem 0.65rem' }}>Proposal Ref</th>
                    <th style={{ padding: '0.65rem 0.65rem' }}>Guest Name</th>
                    <th style={{ padding: '0.65rem 0.65rem' }}>Agent / Partner</th>
                    <th style={{ padding: '0.65rem 0.65rem' }}>Arrival Date</th>
                    <th style={{ padding: '0.65rem 0.65rem' }}>Total Cost (SGD / ₹)</th>
                    <th style={{ padding: '0.65rem 0.65rem' }}>Activity</th>
                    <th style={{ padding: '0.65rem 0.65rem' }}>Current Status</th>
                    <th style={{ padding: '0.65rem 0.65rem' }}>Admin Status Override</th>
                    <th style={{ padding: '0.65rem 0.65rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProposals.map(p => {
                    const badge = getStatusBadge(p.status)
                    const isExpanded = !!expandedIds[p._id]

                    return (
                      <React.Fragment key={p._id}>
                        <tr
                          style={{
                            borderBottom: isExpanded ? 'none' : '1px solid #F1F5F9',
                            background: isExpanded ? '#F8FAFC' : 'transparent',
                            transition: 'background 0.12s ease'
                          }}
                        >
                          <td style={{ padding: '0.65rem 0.35rem', textAlign: 'center' }}>
                            <button
                              onClick={() => toggleRow(p._id)}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </td>
                          <td style={{ padding: '0.65rem 0.65rem', fontWeight: 800, color: 'var(--crimson-primary)' }}>
                            <a
                              href={`/custom-package?ref=${p.proposalNumber}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--crimson-primary)', textDecoration: 'none' }}
                              title="Open proposal quoter"
                            >
                              {p.proposalNumber}
                            </a>
                          </td>
                          <td style={{ padding: '0.65rem 0.65rem', fontWeight: 700, color: '#1E293B' }}>
                            {p.guestName || 'Unnamed Guest'}
                            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>
                              {p.adults || 2} Adults, {p.kids || 0} Kids
                            </div>
                          </td>
                          <td style={{ padding: '0.65rem 0.65rem', color: '#475569' }}>
                            <span style={{ fontWeight: 600, display: 'block', color: '#0F172A' }}>
                              {p.agent?.companyName || 'B2B Partner'}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{p.agent?.email || 'N/A'}</span>
                          </td>
                          <td style={{ padding: '0.65rem 0.65rem', color: '#334155' }}>
                            <span style={{ fontWeight: 600 }}>{p.arrivalDate || 'Not set'}</span>
                            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{p.nights || 0} Nights</div>
                          </td>
                          <td style={{ padding: '0.65rem 0.65rem' }}>
                            <span style={{ fontWeight: 800, color: '#0F4C3A', display: 'block' }}>
                              S$ {Number(p.totalClientPrice || 0).toLocaleString()}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                              ₹{Number(p.costBreakdown?.totalClientPriceINR || 0).toLocaleString()}
                            </span>
                          </td>
                          <td style={{ padding: '0.65rem 0.65rem', color: '#64748B', fontSize: '0.72rem' }}>
                            {getLatestTimestamp(p)}
                          </td>
                          <td style={{ padding: '0.65rem 0.65rem' }}>
                            <span
                              style={{
                                padding: '0.2rem 0.55rem',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`
                              }}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td style={{ padding: '0.65rem 0.65rem' }}>
                            <select
                              value={p.status || 'pending'}
                              onChange={e => updatePackageStatus(p._id, e.target.value)}
                              style={{
                                padding: '0.3rem 0.5rem',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                background: '#FFFFFF',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="pending">🔵 Pending</option>
                              <option value="followup">🟡 Follow-Up</option>
                              <option value="confirmed">🟢 Confirmed</option>
                              <option value="scheduled">💜 Scheduled</option>
                              <option value="completed">✅ Completed</option>
                              <option value="ignore">⚪ Ignored</option>
                            </select>
                          </td>
                          <td style={{ padding: '0.65rem 0.65rem', textAlign: 'right' }}>
                            <button
                              onClick={() => setSelectedProposal(p)}
                              style={{
                                padding: '0.3rem 0.65rem',
                                background: '#F1F5F9',
                                border: '1px solid #CBD5E1',
                                borderRadius: '6px',
                                color: '#1E293B',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Details
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Breakdown Drawer */}
                        {isExpanded && (
                          <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                            <td colSpan={10} style={{ padding: '1rem 1.5rem' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', background: '#FFFFFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                
                                {/* Cost & Margins */}
                                <div>
                                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                    💰 Financial Breakdown
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.78rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ color: '#64748B' }}>Total Client Price (SGD):</span>
                                      <strong style={{ color: '#0F4C3A' }}>S$ {Number(p.totalClientPrice || 0).toLocaleString()}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ color: '#64748B' }}>INR Approx:</span>
                                      <strong>₹{Number(p.costBreakdown?.totalClientPriceINR || 0).toLocaleString()}</strong>
                                    </div>
                                    {p.costBreakdown?.totalNetCost && (
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748B' }}>DMC Net Cost:</span>
                                        <span>S$ {Number(p.costBreakdown.totalNetCost).toLocaleString()}</span>
                                      </div>
                                    )}
                                    {p.costBreakdown?.marginSGD && (
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748B' }}>Markup Margin:</span>
                                        <span style={{ color: '#16A34A', fontWeight: 700 }}>+S$ {Number(p.costBreakdown.marginSGD).toLocaleString()}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Hotel & Stay */}
                                <div>
                                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                    🏨 Accommodation & Flights
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                                    <div><strong>Selected Hotel:</strong> {p.hotelOption || p.selectedHotel?.name || 'Land Package Only (No Hotel)'}</div>
                                    <div style={{ marginTop: '0.25rem' }}><strong>Room Type:</strong> {p.roomType || 'Standard'} ({p.roomsCount || 1} Rooms)</div>
                                    {p.flightDetails && (
                                      <div style={{ marginTop: '0.25rem' }}><strong>Flight:</strong> {p.flightDetails}</div>
                                    )}
                                  </div>
                                </div>

                                {/* Attractions Count & Links */}
                                <div>
                                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                    🎡 Itinerary & Direct Links
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <div><strong>Attractions Included:</strong> {p.attractions?.length || 0} Items</div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                      <a
                                        href={`/custom-package?ref=${p.proposalNumber}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                          padding: '0.35rem 0.75rem',
                                          background: '#0F4C3A',
                                          color: '#FFF',
                                          borderRadius: '6px',
                                          textDecoration: 'none',
                                          fontSize: '0.74rem',
                                          fontWeight: 700,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.3rem'
                                        }}
                                      >
                                        <ExternalLink size={12} /> Open Quoter
                                      </a>
                                    </div>
                                  </div>
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
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.25rem',
                borderTop: '1px solid #E2E8F0',
                paddingTop: '0.85rem'
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Showing {(currentPage - 1) * (pageSize as number) + 1} to{' '}
                {Math.min(currentPage * (pageSize as number), filteredProposals.length)} of{' '}
                {filteredProposals.length} proposals
              </div>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.35rem 0.75rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    background: currentPage === 1 ? '#F8FAFC' : '#FFFFFF',
                    color: currentPage === 1 ? '#94A3B8' : '#1E293B',
                    fontSize: '0.76rem',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 700 }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.35rem 0.75rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    background: currentPage === totalPages ? '#F8FAFC' : '#FFFFFF',
                    color: currentPage === totalPages ? '#94A3B8' : '#1E293B',
                    fontSize: '0.76rem',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 2: ARRIVAL CALENDAR VIEW ── */}
      {subTab === 'calendar' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          {/* Calendar Month Navigation */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              background: '#F8FAFC',
              padding: '0.75rem 1.25rem',
              borderRadius: '9px',
              border: '1px solid #E2E8F0'
            }}
          >
            <button
              onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: '#334155',
                fontSize: '0.82rem'
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1E293B', fontWeight: 800 }}>
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: '#334155',
                fontSize: '0.82rem'
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          {/* Grid Header Days */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '0.74rem',
              color: '#64748B',
              marginBottom: '0.5rem'
            }}
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ padding: '0.35rem', textTransform: 'uppercase' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day Grid Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {/* Empty cells before month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} style={{ background: '#F8FAFC', minHeight: '90px', borderRadius: '8px', opacity: 0.5 }} />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`

              const dayProposals = proposals.filter(p => {
                if (p.arrivalDate && p.arrivalDate.trim() === dateStr) return true
                return false
              })

              return (
                <div
                  key={dayNum}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    minHeight: '95px',
                    borderRadius: '8px',
                    padding: '0.45rem',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.35rem' }}>
                    {dayNum}
                  </div>

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
                            borderRadius: '5px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            border: `1px solid ${badge.border}`
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

      {/* ── SUB-TAB 3: PENDING APPROVALS ── */}
      {subTab === 'approvals' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              Agent Package Status Request Approvals
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
              Review B2B partner requests to confirm packages or mark as closed.
            </p>
          </div>

          {pendingApprovals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>All Caught Up!</h3>
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                There are no pending proposal status requests from agents.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem' }}>Proposal</th>
                    <th style={{ padding: '0.75rem' }}>Agent / Partner</th>
                    <th style={{ padding: '0.75rem' }}>Guest Details</th>
                    <th style={{ padding: '0.75rem' }}>Current Status</th>
                    <th style={{ padding: '0.75rem' }}>Requested Status</th>
                    <th style={{ padding: '0.75rem' }}>Agent Note</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((p, idx) => (
                    <tr key={p._id || idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 800, color: 'var(--crimson-primary)' }}>
                        <a
                          href={`/custom-package?ref=${p.proposalNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--crimson-primary)', textDecoration: 'none' }}
                        >
                          {p.proposalNumber}
                        </a>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span style={{ fontWeight: 700, display: 'block', color: '#1E293B' }}>
                          {p.agent?.companyName || p.agent?.agentName || 'B2B Partner'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748B' }}>{p.agent?.email || 'No email'}</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span style={{ fontWeight: 700, display: 'block', color: '#1E293B' }}>{p.guestName || 'Guest'}</span>
                        <span style={{ fontSize: '0.74rem', color: '#64748B' }}>{p.guestPhone || 'No phone'}</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{getStatusBadge(p.status).label}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            background: p.requestedStatus === 'confirmed' ? '#DCFCE7' : '#FEE2E2',
                            color: p.requestedStatus === 'confirmed' ? '#166534' : '#991B1B'
                          }}
                        >
                          {p.requestedStatus === 'ignore' ? 'Ignore / Closed' : '🟢 Confirmed'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#475569', fontStyle: p.statusRequestNote ? 'normal' : 'italic' }}>
                        {p.statusRequestNote || 'No note provided'}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
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
                                    refreshData()
                                  } else {
                                    alert(resJson.error || 'Failed to approve request')
                                  }
                                } catch (e) {
                                  alert('Error approving request')
                                }
                              }
                            }}
                            style={{
                              padding: '0.4rem 0.85rem',
                              background: '#0F4C3A',
                              color: '#FFF',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.76rem',
                              cursor: 'pointer'
                            }}
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
                                    refreshData()
                                  } else {
                                    alert(resJson.error || 'Failed to deny request')
                                  }
                                } catch (e) {
                                  alert('Error denying request')
                                }
                              }
                            }}
                            style={{
                              padding: '0.4rem 0.85rem',
                              background: '#EF4444',
                              color: '#FFF',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.76rem',
                              cursor: 'pointer'
                            }}
                          >
                            Deny
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {selectedProposal && (
        <div
          onClick={() => setSelectedProposal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '0.85rem',
                marginBottom: '1.1rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold-accent)', textTransform: 'uppercase' }}>
                  Package Proposal Details
                </div>
                <h2 style={{ fontSize: '1.4rem', color: '#1E293B', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>
                  {selectedProposal.proposalNumber}
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.15rem' }}>
                  Guest: {selectedProposal.guestName || 'N/A'}
                </div>
              </div>
              <button
                onClick={() => setSelectedProposal(null)}
                style={{
                  border: 'none',
                  background: '#F1F5F9',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                ✕
              </button>
            </div>

            {/* Status Change Strip */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>ADMIN STATUS UPDATE</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginTop: '0.1rem' }}>
                  Current: {getStatusBadge(selectedProposal.status).label}
                </div>
              </div>
              <select
                value={selectedProposal.status || 'pending'}
                onChange={e => updatePackageStatus(selectedProposal._id, e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--emerald-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  background: '#FFF',
                  cursor: 'pointer'
                }}
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
              <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>ARRIVAL DATE</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginTop: '0.15rem' }}>
                  {selectedProposal.arrivalDate || 'Not set'}
                </div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>STAY DURATION</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginTop: '0.15rem' }}>
                  {selectedProposal.nights} Nights ({selectedProposal.adults || 2} Adults, {selectedProposal.kids || 0} Kids)
                </div>
              </div>
              <div style={{ background: '#F0FDF4', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700 }}>TOTAL CLIENT PRICE (SGD)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#166534', marginTop: '0.15rem' }}>
                  S$ {selectedProposal.totalClientPrice || 0}
                </div>
              </div>
              <div style={{ background: '#F0FDF4', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700 }}>APPROX PRICE (INR ₹)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#166534', marginTop: '0.15rem' }}>
                  ₹{(selectedProposal.costBreakdown?.totalClientPriceINR || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Timestamp Audit */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#475569',
                marginBottom: '1.25rem'
              }}
            >
              <div>⏱️ {getLatestTimestamp(selectedProposal)}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                Created: {selectedProposal._createdAt ? new Date(selectedProposal._createdAt).toLocaleString() : 'N/A'} | Updated: {selectedProposal._updatedAt ? new Date(selectedProposal._updatedAt).toLocaleString() : 'N/A'}
              </div>
            </div>

            {/* Agent info */}
            {selectedProposal.agent && (
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Agent Info</div>
                <div style={{ fontSize: '0.82rem', color: '#1E293B' }}>Company: <strong>{selectedProposal.agent.companyName || 'B2B Partner'}</strong></div>
                <div style={{ fontSize: '0.82rem', color: '#1E293B' }}>Email: {selectedProposal.agent.email}</div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem' }}>
              <a
                href={`/custom-package?ref=${selectedProposal.proposalNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.55rem 1.1rem',
                  background: 'var(--emerald-secondary)',
                  color: '#FFF',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700
                }}
              >
                <ExternalLink size={14} /> Open Full Proposal Page
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
