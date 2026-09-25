'use client'

import React from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  Building2,
  DollarSign,
  Megaphone,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
  Clock,
  CreditCard,
  Mail,
  Users,
  Briefcase,
  Map,
  Activity,
  Globe,
  ExternalLink,
  ChevronRight
} from 'lucide-react'

export type AdminWorkspace = 'overview' | 'packages' | 'operations' | 'finance' | 'marketing' | 'system'

interface AdminSidebarProps {
  currentWorkspace: AdminWorkspace
  onSelectWorkspace: (workspace: AdminWorkspace, subTab?: string) => void
  currentSubTab?: string
  isCollapsed: boolean
  onToggleCollapse: () => void
  badges: {
    totalProposals: number
    pendingApprovals: number
    pendingPayments: number
    hotelVouchers: number
    consultingBookings: number
    activeAgents: number
    totalContacts: number
    auditLogs: number
  }
}

interface SubItem {
  id: string
  label: string
  badge?: number
  badgeColor?: 'urgent' | 'neutral'
}

interface NavGroup {
  id: AdminWorkspace
  label: string
  shortLabel: string
  icon: any
  badge?: number
  badgeColor?: 'urgent' | 'neutral'
  subItems?: SubItem[]
}

export default function AdminSidebar({
  currentWorkspace,
  onSelectWorkspace,
  currentSubTab,
  isCollapsed,
  onToggleCollapse,
  badges
}: AdminSidebarProps) {
  const urgentCount = badges.pendingApprovals + badges.pendingPayments

  const navGroups: NavGroup[] = [
    {
      id: 'overview' as AdminWorkspace,
      label: 'Overview & Cockpit',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      badge: urgentCount > 0 ? urgentCount : undefined,
      badgeColor: 'urgent',
      subItems: [
        { id: 'dashboard', label: 'Executive Cockpit' },
        { id: 'recent', label: 'Recent Activity' }
      ]
    },
    {
      id: 'packages' as AdminWorkspace,
      label: 'Packages & Bookings',
      shortLabel: 'Packages',
      icon: Package,
      badge: badges.totalProposals,
      badgeColor: 'neutral',
      subItems: [
        { id: 'list', label: 'Proposal Lifecycle' },
        { id: 'calendar', label: 'Arrival Calendar' },
        { id: 'approvals', label: 'Pending Approvals', badge: badges.pendingApprovals, badgeColor: 'urgent' }
      ]
    },
    {
      id: 'operations' as AdminWorkspace,
      label: 'Travel Operations',
      shortLabel: 'Operations',
      icon: Building2,
      badge: badges.hotelVouchers + badges.consultingBookings,
      badgeColor: 'neutral',
      subItems: [
        { id: 'vouchers', label: 'Hotel Vouchers (Visa)', badge: badges.hotelVouchers },
        { id: 'consulting', label: 'Consulting Leads', badge: badges.consultingBookings }
      ]
    },
    {
      id: 'finance' as AdminWorkspace,
      label: 'Finance & Accounts',
      shortLabel: 'Finance',
      icon: DollarSign,
      badge: badges.pendingPayments > 0 ? badges.pendingPayments : undefined,
      badgeColor: 'urgent',
      subItems: [
        { id: 'ledger', label: 'Accounts & Ledger' },
        { id: 'invoices', label: 'Customer Invoices' },
        { id: 'payments', label: 'Manual Payments', badge: badges.pendingPayments, badgeColor: 'urgent' }
      ]
    },
    {
      id: 'marketing' as AdminWorkspace,
      label: 'Marketing & Growth',
      shortLabel: 'Marketing',
      icon: Megaphone,
      badge: badges.totalContacts > 0 ? badges.totalContacts : undefined,
      badgeColor: 'neutral',
      subItems: [
        { id: 'newsletters', label: 'Email Campaigns' },
        { id: 'leads', label: 'Leads Directory' },
        { id: 'jobs', label: 'Careers & Hiring' },
        { id: 'ads', label: 'Ads & Radars' }
      ]
    },
    {
      id: 'system' as AdminWorkspace,
      label: 'System & Tools',
      shortLabel: 'System',
      icon: Settings,
      subItems: [
        { id: 'sitemap', label: 'Site Map & 51 Routes' },
        { id: 'sync', label: 'Attractions Sync' },
        { id: 'competitor', label: 'Competitor Rates' },
        { id: 'agents', label: 'Agent Access' },
        { id: 'audit', label: 'Audit Trail', badge: badges.auditLogs },
        { id: 'exports', label: 'Data Exports' }
      ]
    }
  ]

  return (
    <aside
      style={{
        width: isCollapsed ? '72px' : '260px',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        background: '#0B1320', // Deep luxury slate navy
        color: '#E2E8F0',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 16px rgba(0,0,0,0.15)',
        zIndex: 50,
        userSelect: 'none',
        borderRight: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '1.25rem 0.5rem' : '1.25rem 1.1rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.15)'
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '1.18rem',
                fontWeight: 800,
                color: 'var(--gold-accent)',
                letterSpacing: '0.2px',
                whiteSpace: 'nowrap'
              }}
            >
              Flying Wonders
            </span>
            <span
              style={{
                fontSize: '0.66rem',
                color: '#94A3B8',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                fontWeight: 700
              }}
            >
              Admin Command Center
            </span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          style={{
            border: 'none',
            background: 'rgba(255,255,255,0.06)',
            color: '#CBD5E1',
            padding: '0.45rem',
            borderRadius: '7px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
        >
          {isCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      {/* Navigation Workspaces */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          padding: isCollapsed ? '1rem 0.5rem' : '1rem 0.75rem',
          flex: 1
        }}
      >
        {!isCollapsed && (
          <div
            style={{
              fontSize: '0.64rem',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: '#64748B',
              fontWeight: 800,
              paddingLeft: '0.6rem',
              marginBottom: '0.25rem'
            }}
          >
            Workspaces
          </div>
        )}

        {navGroups.map(group => {
          const Icon = group.icon
          const isActive = currentWorkspace === group.id

          return (
            <div key={group.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                onClick={() => onSelectWorkspace(group.id)}
                title={isCollapsed ? group.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  width: '100%',
                  padding: isCollapsed ? '0.75rem 0' : '0.65rem 0.75rem',
                  borderRadius: '9px',
                  border: 'none',
                  background: isActive ? 'var(--emerald-secondary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#CBD5E1',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease-in-out',
                  position: 'relative'
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Icon
                    size={17}
                    color={isActive ? '#FFFFFF' : 'var(--gold-accent)'}
                    style={{ flexShrink: 0 }}
                  />
                  {!isCollapsed && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {group.label}
                    </span>
                  )}
                </div>

                {!isCollapsed && group.badge !== undefined && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.12rem 0.45rem',
                      borderRadius: '12px',
                      background:
                        group.badgeColor === 'urgent'
                          ? '#EF4444'
                          : isActive
                          ? 'rgba(255,255,255,0.25)'
                          : 'rgba(255,255,255,0.08)',
                      color: '#FFFFFF'
                    }}
                  >
                    {group.badge}
                  </span>
                )}
              </button>

              {/* Sub-item pills when workspace is expanded and active */}
              {!isCollapsed && isActive && group.subItems && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.15rem',
                    marginLeft: '1.25rem',
                    paddingLeft: '0.75rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.4rem',
                    borderLeft: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {group.subItems.map(sub => {
                    const isSubActive = currentSubTab === sub.id
                    return (
                      <button
                        key={sub.id}
                        onClick={() => onSelectWorkspace(group.id, sub.id)}
                        style={{
                          background: isSubActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                          color: isSubActive ? '#FFFFFF' : '#94A3B8',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '0.35rem 0.55rem',
                          fontSize: '0.74rem',
                          fontWeight: isSubActive ? 700 : 500,
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.12s ease'
                        }}
                        onMouseEnter={e => {
                          if (!isSubActive) e.currentTarget.style.color = '#E2E8F0'
                        }}
                        onMouseLeave={e => {
                          if (!isSubActive) e.currentTarget.style.color = '#94A3B8'
                        }}
                      >
                        <span>{sub.label}</span>
                        {sub.badge !== undefined && sub.badge > 0 && (
                          <span
                            style={{
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              padding: '0.05rem 0.35rem',
                              borderRadius: '8px',
                              background: sub.badgeColor === 'urgent' ? '#EF4444' : 'rgba(255,255,255,0.15)',
                              color: '#FFFFFF'
                            }}
                          >
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Sidebar Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: isCollapsed ? '0.85rem 0.4rem' : '0.85rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          background: 'rgba(0,0,0,0.15)'
        }}
      >
        <Link
          href="/"
          target="_blank"
          title="Open Public Website in new tab"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: '0.55rem 0.65rem',
            background: 'rgba(255,255,255,0.05)',
            color: '#CBD5E1',
            borderRadius: '7px',
            fontSize: '0.76rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Globe size={15} color="var(--gold-accent)" />
            {!isCollapsed && <span>Public Site</span>}
          </div>
          {!isCollapsed && <ExternalLink size={12} color="#94A3B8" />}
        </Link>

        <Link
          href="/agent-portal"
          target="_blank"
          title="Open B2B Agent Portal"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: '0.55rem 0.65rem',
            background: 'rgba(255,255,255,0.05)',
            color: '#CBD5E1',
            borderRadius: '7px',
            fontSize: '0.76rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Users size={15} color="var(--gold-accent)" />
            {!isCollapsed && <span>Agent Portal</span>}
          </div>
          {!isCollapsed && <ExternalLink size={12} color="#94A3B8" />}
        </Link>
      </div>
    </aside>
  )
}
