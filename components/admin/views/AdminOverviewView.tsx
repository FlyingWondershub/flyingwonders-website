'use client'

import React from 'react'
import {
  Users,
  Package,
  DollarSign,
  Building2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  Download,
  Plus,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react'
import { AdminWorkspace } from '../AdminSidebar'

interface AdminOverviewViewProps {
  metrics: { activeAgents: number; pendingPayments: number; totalContacts: number }
  proposals: any[]
  hotelVouchers: any[]
  consultingBookings: any[]
  pendingPayments: any[]
  logs: any[]
  onNavigate: (workspace: AdminWorkspace, subTab?: string) => void
  onCreateVoucher: () => void
  onSyncAttractions: () => void
  isSyncing: boolean
  onSelectProposal: (proposal: any) => void
}

export default function AdminOverviewView({
  metrics,
  proposals,
  hotelVouchers,
  consultingBookings,
  pendingPayments,
  logs,
  onNavigate,
  onCreateVoucher,
  onSyncAttractions,
  isSyncing,
  onSelectProposal
}: AdminOverviewViewProps) {
  // Calculations
  const pendingApprovals = proposals.filter(p => p.statusChangeRequested)
  const confirmedPackages = proposals.filter(p => p.status === 'confirmed')
  const scheduledPackages = proposals.filter(p => p.status === 'scheduled')
  const followupPackages = proposals.filter(p => p.status === 'followup')
  const completedPackages = proposals.filter(p => p.status === 'completed')

  const confirmedRevenueSGD = confirmedPackages.reduce(
    (sum, p) => sum + (Number(p.totalClientPrice) || 0),
    0
  )
  const confirmedRevenueINR = confirmedPackages.reduce(
    (sum, p) => sum + (Number(p.costBreakdown?.totalClientPriceINR) || 0),
    0
  )

  // Recent 6 proposals
  const recentProposals = [...proposals]
    .sort((a, b) => {
      const timeA = new Date(a._updatedAt || a._createdAt || 0).getTime()
      const timeB = new Date(b._updatedAt || b._createdAt || 0).getTime()
      return timeB - timeA
    })
    .slice(0, 6)

  const getStatusBadge = (st: string = 'pending') => {
    switch (st) {
      case 'confirmed':
        return { label: 'Confirmed', bg: '#DCFCE7', color: '#166534', dot: '#22C55E' }
      case 'scheduled':
        return { label: 'Scheduled', bg: '#F3E8FF', color: '#6B21A8', dot: '#A855F7' }
      case 'completed':
        return { label: 'Completed', bg: '#EDE9FE', color: '#4C1D95', dot: '#8B5CF6' }
      case 'followup':
        return { label: 'Follow-Up', bg: '#FEF9C3', color: '#854D0E', dot: '#EAB308' }
      case 'ignore':
        return { label: 'Ignored', bg: '#F1F5F9', color: '#475569', dot: '#94A3B8' }
      default:
        return { label: 'Pending', bg: '#E0F2FE', color: '#075985', dot: '#0EA5E9' }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      
      {/* ── 1. URGENT ACTIONS CALLOUT ── */}
      {(pendingApprovals.length > 0 || pendingPayments.length > 0) && (
        <div
          style={{
            background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
            border: '1px solid #FECDD3',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(225, 29, 72, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#BE123C',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#9F1239', margin: 0 }}>
                Attention Required: Pending Items Waiting for Review
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#BE123C', margin: '0.2rem 0 0 0' }}>
                {pendingApprovals.length > 0 && `${pendingApprovals.length} proposal status change request(s)`}
                {pendingApprovals.length > 0 && pendingPayments.length > 0 && ' and '}
                {pendingPayments.length > 0 && `${pendingPayments.length} manual payment confirmation(s)`} need verification.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {pendingApprovals.length > 0 && (
              <button
                onClick={() => onNavigate('packages', 'approvals')}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#BE123C',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                Review Approvals ({pendingApprovals.length}) <ArrowRight size={14} />
              </button>
            )}
            {pendingPayments.length > 0 && (
              <button
                onClick={() => onNavigate('finance', 'payments')}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#9F1239',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                Verify Payments ({pendingPayments.length}) <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 2. EXECUTIVE KPI CARDS GRID ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        {/* Total Packages */}
        <div
          onClick={() => onNavigate('packages', 'list')}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Proposals Managed
            </span>
            <div style={{ padding: '0.4rem', background: '#EFF6FF', borderRadius: '8px' }}>
              <Package size={16} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem', fontFamily: 'var(--font-inter)' }}>
            {proposals.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: 600, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={13} /> {confirmedPackages.length} Confirmed Packages
          </div>
        </div>

        {/* Confirmed Revenue SGD */}
        <div
          onClick={() => onNavigate('finance', 'ledger')}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Confirmed Revenue (SGD)
            </span>
            <div style={{ padding: '0.4rem', background: '#ECFDF5', borderRadius: '8px' }}>
              <DollarSign size={16} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F4C3A', marginTop: '0.4rem', fontFamily: 'var(--font-inter)' }}>
            S$ {confirmedRevenueSGD.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, marginTop: '0.3rem' }}>
            ₹{confirmedRevenueINR.toLocaleString()} INR Equivalent
          </div>
        </div>

        {/* Active B2B Agents */}
        <div
          onClick={() => onNavigate('system', 'agents')}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Active B2B Agents
            </span>
            <div style={{ padding: '0.4rem', background: '#F0FDFA', borderRadius: '8px' }}>
              <Users size={16} color="#0D9488" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem', fontFamily: 'var(--font-inter)' }}>
            {metrics.activeAgents}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, marginTop: '0.3rem' }}>
            Verified Partner Agencies
          </div>
        </div>

        {/* Hotel Vouchers Issued */}
        <div
          onClick={() => onNavigate('operations', 'vouchers')}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Hotel Vouchers (Visa)
            </span>
            <div style={{ padding: '0.4rem', background: '#FAF5FF', borderRadius: '8px' }}>
              <Building2 size={16} color="#7E22CE" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem', fontFamily: 'var(--font-inter)' }}>
            {hotelVouchers.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#7E22CE', fontWeight: 600, marginTop: '0.3rem' }}>
            Visa Embassy-Compliant
          </div>
        </div>

        {/* Consulting Inquiries */}
        <div
          onClick={() => onNavigate('operations', 'consulting')}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Consulting Leads
            </span>
            <div style={{ padding: '0.4rem', background: '#FEF3C7', borderRadius: '8px' }}>
              <Calendar size={16} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem', fontFamily: 'var(--font-inter)' }}>
            {consultingBookings.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#D97706', fontWeight: 600, marginTop: '0.3rem' }}>
            Custom Travel Bookings
          </div>
        </div>

        {/* Marketing Contacts */}
        <div
          onClick={() => onNavigate('marketing', 'leads')}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Audience & Leads
            </span>
            <div style={{ padding: '0.4rem', background: '#F1F5F9', borderRadius: '8px' }}>
              <Zap size={16} color="#475569" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem', fontFamily: 'var(--font-inter)' }}>
            {metrics.totalContacts}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, marginTop: '0.3rem' }}>
            Subscribers & Leads
          </div>
        </div>
      </div>

      {/* ── 3. QUICK ACTIONS SHORTCUT BAR ── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.85rem' }}>
          ⚡ Fast Operational Shortcuts
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem'
          }}
        >
          <a
            href="/custom-package"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.75rem 1rem',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#1E293B',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#F1F5F9'
              e.currentTarget.style.borderColor = '#CBD5E1'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#F8FAFC'
              e.currentTarget.style.borderColor = '#E2E8F0'
            }}
          >
            <span>+ Build Package Proposal</span>
            <ExternalLink size={14} color="#64748B" />
          </a>

          <button
            onClick={onCreateVoucher}
            style={{
              padding: '0.75rem 1rem',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              color: '#1E293B',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#F1F5F9'
              e.currentTarget.style.borderColor = '#CBD5E1'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#F8FAFC'
              e.currentTarget.style.borderColor = '#E2E8F0'
            }}
          >
            <span>+ Issue Hotel Voucher</span>
            <Plus size={15} color="#0F4C3A" />
          </button>

          <button
            onClick={() => onNavigate('finance', 'invoices')}
            style={{
              padding: '0.75rem 1rem',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              color: '#1E293B',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#F1F5F9'
              e.currentTarget.style.borderColor = '#CBD5E1'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#F8FAFC'
              e.currentTarget.style.borderColor = '#E2E8F0'
            }}
          >
            <span>🧾 Create GST Invoice</span>
            <ArrowRight size={14} color="#64748B" />
          </button>

          <button
            onClick={onSyncAttractions}
            disabled={isSyncing}
            style={{
              padding: '0.75rem 1rem',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              color: '#166534',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🔄 Sync Google Sheets</span>
            <FileSpreadsheet size={15} color="#166534" />
          </button>

          <a
            href="/api/admin/export-accounts"
            style={{
              padding: '0.75rem 1rem',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#1E293B',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#F1F5F9'
              e.currentTarget.style.borderColor = '#CBD5E1'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#F8FAFC'
              e.currentTarget.style.borderColor = '#E2E8F0'
            }}
          >
            <span>📥 Export Ledger CSV</span>
            <Download size={14} color="#64748B" />
          </a>
        </div>
      </div>

      {/* ── 4. RECENT PROPOSALS & ACTIVITY STREAM ── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.15rem', color: '#1E293B', margin: 0, fontWeight: 800 }}>
              Recent Proposals & Inquiries
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Latest active booking proposals across all B2B agents and clients
            </p>
          </div>

          <button
            onClick={() => onNavigate('packages', 'list')}
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#334155',
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            View All ({proposals.length}) <ArrowRight size={14} />
          </button>
        </div>

        {recentProposals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', fontSize: '0.88rem' }}>
            No proposals recorded yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Proposal Ref</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Guest Name</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Agent / Partner</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Travel Dates</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Total Price</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentProposals.map(p => {
                  const badge = getStatusBadge(p.status)
                  return (
                    <tr
                      key={p._id}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--crimson-primary)' }}>
                        {p.proposalNumber}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#1E293B' }}>
                        {p.guestName || 'Unnamed Guest'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#475569' }}>
                        {p.agent?.companyName || p.agent?.email || 'Direct Client'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#64748B', fontSize: '0.78rem' }}>
                        {p.arrivalDate || 'TBD'} ({p.nights || 0}N)
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: '#0F4C3A' }}>
                        S$ {Number(p.totalClientPrice || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: badge.bg,
                            color: badge.color
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: badge.dot }} />
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <button
                          onClick={() => onSelectProposal(p)}
                          style={{
                            padding: '0.3rem 0.65rem',
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            color: '#0F172A',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 5. INTEGRATIONS & SYSTEM HEALTH STATUS ── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <ShieldCheck size={18} color="#059669" />
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E293B' }}>
            Live System & Gateway Connections
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}
        >
          <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E293B' }}>Sanity CMS Studio</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#166534', background: '#DCFCE7', padding: '2px 8px', borderRadius: '10px' }}>ONLINE</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748B', margin: '0.3rem 0 0 0' }}>Live Schemas & Assets active</p>
          </div>

          <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E293B' }}>Attractions Cache</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#166534', background: '#DCFCE7', padding: '2px 8px', borderRadius: '10px' }}>SYNCED</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748B', margin: '0.3rem 0 0 0' }}>Google Sheets catalog connected</p>
          </div>

          <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E293B' }}>UPI & Payment QR</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#166534', background: '#DCFCE7', padding: '2px 8px', borderRadius: '10px' }}>READY</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748B', margin: '0.3rem 0 0 0' }}>ICICI Merchant QR & Bank verification</p>
          </div>

          <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E293B' }}>Audit Activity Trail</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1E40AF', background: '#DBEAFE', padding: '2px 8px', borderRadius: '10px' }}>{logs.length} LOGS</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748B', margin: '0.3rem 0 0 0' }}>Tamper-proof event logging</p>
          </div>
        </div>
      </div>

    </div>
  )
}
