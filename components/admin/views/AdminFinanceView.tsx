'use client'

import React, { useState } from 'react'
import {
  DollarSign,
  FileSpreadsheet,
  CreditCard,
  Download,
  Search,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert
} from 'lucide-react'
import CustomerInvoiceManager from '../CustomerInvoiceManager'

interface AdminFinanceViewProps {
  proposals: any[]
  pendingPayments: any[]
  updatePaymentStatus: (paymentId: string, status: string) => Promise<void>
  subTab: string
  onSelectSubTab: (subTabId: string) => void
}

export default function AdminFinanceView({
  proposals,
  pendingPayments,
  updatePaymentStatus,
  subTab,
  onSelectSubTab
}: AdminFinanceViewProps) {
  // Ledger state
  const [accountFilter, setAccountFilter] = useState<'all' | 'unpaid' | 'partial' | 'settled' | 'overpaid'>('all')
  const [accountSearch, setAccountSearch] = useState('')
  const [accountsViewMode, setAccountsViewMode] = useState<'agent' | 'individual'>('agent')
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({})

  const toggleAgent = (key: string) => {
    setExpandedAgents(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Financial calculations
  const confirmedProps = proposals.filter(
    p => p.status === 'confirmed' || p.status === 'scheduled' || p.status === 'completed'
  )

  let totalReceivablesDue = 0
  let totalCreditBalance = 0
  let totalCollected = 0
  let totalContractValue = 0

  const enrichedProps = confirmedProps.map(p => {
    const basePrice = Number(p.totalClientPrice || p.costBreakdown?.totalClientPrice) || 0
    const totalAddons = (p.additionalCharges || []).reduce((sum: number, c: any) => {
      const amt = Number(c.amount) || 0
      return c.chargeType === 'Discount' || c.chargeType === 'Refund' ? sum - amt : sum + amt
    }, 0)
    const adjustedPrice = basePrice + totalAddons
    const totalPaid = (p.paymentLedger || []).reduce(
      (sum: number, pay: any) => sum + (Number(pay.amount) || 0),
      0
    )

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

    return {
      ...p,
      basePrice,
      totalAddons,
      adjustedPrice,
      totalPaid,
      balanceDue,
      excessPaid,
      rawDiff,
      settlementStatus
    }
  })

  const filteredAccounts = enrichedProps.filter(p => {
    const matchesStatus = accountFilter === 'all' ? true : p.settlementStatus === accountFilter
    const term = accountSearch.toLowerCase().trim()
    const matchesSearch =
      !term ||
      (p.proposalNumber && p.proposalNumber.toLowerCase().includes(term)) ||
      (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(term)) ||
      (p.guestName && p.guestName.toLowerCase().includes(term)) ||
      (p.agent?.companyName && p.agent.companyName.toLowerCase().includes(term))

    return matchesStatus && matchesSearch
  })

  const unsettledCount = enrichedProps.filter(p => p.balanceDue > 0).length
  const overpaidCount = enrichedProps.filter(p => p.excessPaid > 0).length

  // Group by Agent
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
        proposals: []
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      
      {/* ── SUB-TAB 1: ACCOUNTS & LEDGER ── */}
      {subTab === 'ledger' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E293B', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>
                Accounts & Financial Ledger
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.84rem', margin: '0.25rem 0 0 0' }}>
                Real-time tracking of confirmed proposal contract values, payments collected, and outstanding balances due.
              </p>
            </div>

            <a
              href="/api/admin/export-accounts"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                background: '#0F4C3A',
                color: '#FFF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.8rem',
                boxShadow: '0 2px 6px rgba(15,76,58,0.2)'
              }}
            >
              <Download size={14} /> Export Accounts CSV
            </a>
          </div>

          {/* 4 Financial KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
              background: '#F8FAFC',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Outstanding Receivables
              </span>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: totalReceivablesDue > 0 ? '#DC2626' : '#166534',
                  marginTop: '0.2rem'
                }}
              >
                S$ {totalReceivablesDue.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Across {unsettledCount} pending bookings</span>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Excess / Credit Balance
              </span>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: totalCreditBalance > 0 ? '#7C3AED' : '#64748B',
                  marginTop: '0.2rem'
                }}
              >
                S$ {totalCreditBalance.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                {overpaidCount > 0 ? `${overpaidCount} overpaid accounts` : 'Zero excess payments'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Revenue Collected
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#166534', marginTop: '0.2rem' }}>
                S$ {totalCollected.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>All part & full payments</span>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Confirmed Contract Value
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E293B', marginTop: '0.2rem' }}>
                S$ {totalContractValue.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{confirmedProps.length} confirmed package bookings</span>
            </div>
          </div>

          {/* Controls: Mode Switcher, Status Filters, Search */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* View Mode Toggle */}
              <div style={{ display: 'inline-flex', background: '#E2E8F0', padding: '0.2rem', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAccountsViewMode('agent')}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    background: accountsViewMode === 'agent' ? '#0F4C3A' : 'transparent',
                    color: accountsViewMode === 'agent' ? '#FFF' : '#475569',
                    transition: 'all 0.15s ease'
                  }}
                >
                  🏢 By Agent ({agentGroupList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAccountsViewMode('individual')}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.76rem',
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
                  { id: 'overpaid', label: `🔵 Credit (${enrichedProps.filter(p => p.settlementStatus === 'overpaid').length})` }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setAccountFilter(f.id as any)}
                    style={{
                      padding: '0.35rem 0.7rem',
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
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search Invoice, Ref, Guest, Agent..."
                value={accountSearch}
                onChange={e => setAccountSearch(e.target.value)}
                style={{
                  padding: '0.45rem 0.85rem 0.45rem 2rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.82rem',
                  width: '260px',
                  background: '#FFF',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Ledger Table / Agent Consolidated Cards */}
          {filteredAccounts.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748B', padding: '3rem 0', fontSize: '0.88rem' }}>
              No matching accounts or pending balances found.
            </div>
          ) : accountsViewMode === 'agent' ? (
            /* Agent Consolidated Dues View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {agentGroupList.map((ag: any, agIdx: number) => {
                const isExpanded = expandedAgents[ag.agentKey] ?? true
                const netPosition = ag.totalBilled - ag.totalPaid
                const isDue = netPosition > 0
                const isCredit = netPosition < 0

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
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
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
                            {isDue ? `⚠️ S$ ${netPosition.toLocaleString()} Due` : (isCredit ? `🔵 +S$ ${Math.abs(netPosition).toLocaleString()} Credit` : '🟢 Fully Settled')}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span>Contact: <strong>{ag.agentName}</strong></span>
                          {ag.email && <span>✉️ {ag.email}</span>}
                          {ag.phone && <span>📞 {ag.phone}</span>}
                          <span>📦 <strong>{ag.proposals.length}</strong> Bookings ({ag.totalPax} Pax)</span>
                        </div>
                      </div>

                      {/* Totals & WhatsApp */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Billed</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B' }}>S$ {ag.totalBilled.toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Paid</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534' }}>S$ {ag.totalPaid.toLocaleString()}</div>
                        </div>

                        {ag.phone && (
                          <a
                            href={`https://wa.me/${ag.phone.replace(/[^0-9]/g, '')}?text=${waStatement}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '0.35rem 0.75rem',
                              background: '#25D366',
                              color: '#FFF',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <MessageSquare size={13} />
                            <span>Send Dues</span>
                          </a>
                        )}

                        <button
                          onClick={() => toggleAgent(ag.agentKey)}
                          style={{
                            background: 'none',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '0.3rem 0.6rem',
                            cursor: 'pointer',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#475569'
                          }}
                        >
                          {isExpanded ? 'Hide Bookings ▲' : `View ${ag.proposals.length} Bookings ▼`}
                        </button>
                      </div>
                    </div>

                    {/* Bookings Sub-Table */}
                    {isExpanded && (
                      <div style={{ overflowX: 'auto', background: '#FFFFFF' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase', background: '#F8FAFC' }}>
                              <th style={{ padding: '0.55rem 0.75rem' }}>Ref & Invoice</th>
                              <th style={{ padding: '0.55rem 0.75rem' }}>Guest Name</th>
                              <th style={{ padding: '0.55rem 0.75rem' }}>Travel Dates</th>
                              <th style={{ padding: '0.55rem 0.75rem' }}>Contract Value</th>
                              <th style={{ padding: '0.55rem 0.75rem' }}>Amount Paid</th>
                              <th style={{ padding: '0.55rem 0.75rem' }}>Balance Due</th>
                              <th style={{ padding: '0.55rem 0.75rem' }}>Status</th>
                              <th style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ag.proposals.map((p: any) => {
                              const badge =
                                p.settlementStatus === 'settled'
                                  ? { label: '🟢 Settled', bg: '#DCFCE7', color: '#166534' }
                                  : p.settlementStatus === 'overpaid'
                                  ? { label: `🔵 +S$${p.excessPaid} Credit`, bg: '#EDE9FE', color: '#6D28D9' }
                                  : p.settlementStatus === 'partial'
                                  ? { label: '🟡 Partial', bg: '#FEF3C7', color: '#92400E' }
                                  : { label: '🔴 Unpaid', bg: '#FEE2E2', color: '#991B1B' }

                              return (
                                <tr key={p._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                  <td style={{ padding: '0.55rem 0.75rem' }}>
                                    <strong style={{ color: '#0F172A' }}>{p.proposalNumber}</strong>
                                    {p.invoiceNumber && (
                                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{p.invoiceNumber}</div>
                                    )}
                                  </td>
                                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#1E293B' }}>
                                    {p.guestName || 'Guest'}
                                  </td>
                                  <td style={{ padding: '0.55rem 0.75rem', color: '#64748B' }}>
                                    {p.arrivalDate || 'TBD'} ({p.nights || 0}N)
                                  </td>
                                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#0F172A' }}>
                                    S$ {p.adjustedPrice.toLocaleString()}
                                  </td>
                                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#166534' }}>
                                    S$ {p.totalPaid.toLocaleString()}
                                  </td>
                                  <td
                                    style={{
                                      padding: '0.55rem 0.75rem',
                                      fontWeight: 800,
                                      color: p.balanceDue > 0 ? '#DC2626' : p.excessPaid > 0 ? '#7C3AED' : '#166534'
                                    }}
                                  >
                                    {p.excessPaid > 0
                                      ? `+S$ ${p.excessPaid.toLocaleString()} (Credit)`
                                      : `S$ ${p.balanceDue.toLocaleString()}`}
                                  </td>
                                  <td style={{ padding: '0.55rem 0.75rem' }}>
                                    <span
                                      style={{
                                        padding: '0.15rem 0.45rem',
                                        borderRadius: '10px',
                                        fontSize: '0.68rem',
                                        fontWeight: 800,
                                        background: badge.bg,
                                        color: badge.color
                                      }}
                                    >
                                      {badge.label}
                                    </span>
                                  </td>
                                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
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
            /* Individual Bookings View */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', color: '#475569', borderBottom: '2px solid #E2E8F0', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Invoice / Ref</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Guest Name</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Agent / Partner</th>
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
                      p.settlementStatus === 'settled'
                        ? { label: '🟢 Fully Settled', bg: '#DCFCE7', color: '#166534' }
                        : p.settlementStatus === 'overpaid'
                        ? { label: `🔵 +S$${p.excessPaid} Credit`, bg: '#EDE9FE', color: '#6D28D9' }
                        : p.settlementStatus === 'partial'
                        ? { label: '🟡 Partially Paid', bg: '#FEF3C7', color: '#92400E' }
                        : { label: '🔴 Unpaid (100%)', bg: '#FEE2E2', color: '#991B1B' }

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
                          {p.agent?.companyName || p.agent?.agentName || 'B2C Direct'}
                        </td>
                        <td style={{ padding: '0.7rem 0.75rem', fontWeight: 700, color: '#1E293B' }}>
                          S$ {p.adjustedPrice.toLocaleString()}
                        </td>
                        <td style={{ padding: '0.7rem 0.75rem', fontWeight: 800, color: '#166534' }}>
                          S$ {p.totalPaid.toLocaleString()}
                        </td>
                        <td
                          style={{
                            padding: '0.7rem 0.75rem',
                            fontWeight: 900,
                            color: p.balanceDue > 0 ? '#DC2626' : p.excessPaid > 0 ? '#7C3AED' : '#166534'
                          }}
                        >
                          {p.excessPaid > 0
                            ? `+S$ ${p.excessPaid.toLocaleString()} (Credit)`
                            : `S$ ${p.balanceDue.toLocaleString()}`}
                        </td>
                        <td style={{ padding: '0.7rem 0.75rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: badge.bg,
                              color: badge.color
                            }}
                          >
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
      )}

      {/* ── SUB-TAB 2: CUSTOMER INVOICES & RECEIPTS ── */}
      {subTab === 'invoices' && (
        <div>
          <CustomerInvoiceManager />
        </div>
      )}

      {/* ── SUB-TAB 3: PENDING MANUAL PAYMENTS ── */}
      {subTab === 'payments' && (
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
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              Pending Manual Payment Proofs & Approvals
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
              Verify bank transfers, UTR transaction codes, and UPI payment slips submitted by agents or travelers.
            </p>
          </div>

          {pendingPayments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>No Payments Pending Verification</h3>
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.25rem' }}>All customer wire transfers and UPI slips are verified.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '0.74rem', textTransform: 'uppercase', background: '#F8FAFC' }}>
                    <th style={{ padding: '0.75rem' }}>Booking Reference</th>
                    <th style={{ padding: '0.75rem' }}>Amount (₹ INR)</th>
                    <th style={{ padding: '0.75rem' }}>UTR / Bank Reference</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#0F172A' }}>
                        {p.bookingReference || 'N/A'}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 800, color: '#166534', fontSize: '0.95rem' }}>
                        ₹{p.amountInr}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'monospace', color: '#334155' }}>
                        {p.utrNumber}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => updatePaymentStatus(p._id, 'verified')}
                            style={{
                              background: '#16A34A',
                              color: '#FFF',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.4rem 0.85rem',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.76rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <CheckCircle size={14} /> Verify & Settle
                          </button>
                          <button
                            onClick={() => updatePaymentStatus(p._id, 'rejected')}
                            style={{
                              background: '#EF4444',
                              color: '#FFF',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.4rem 0.85rem',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.76rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <XCircle size={14} /> Reject
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

    </div>
  )
}
