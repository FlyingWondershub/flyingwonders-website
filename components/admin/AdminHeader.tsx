'use client'

import React from 'react'
import {
  FileSpreadsheet,
  RefreshCw,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldCheck
} from 'lucide-react'
import { AdminWorkspace } from './AdminSidebar'

interface SubTabItem {
  id: string
  label: string
  badge?: number
  badgeColor?: 'urgent' | 'neutral'
}

interface AdminHeaderProps {
  currentWorkspace: AdminWorkspace
  workspaceTitle: string
  workspaceSubtitle: string
  subTabs: SubTabItem[]
  currentSubTab: string
  onSelectSubTab: (subTabId: string) => void
  urgentActionCount: number
  onUrgentActionClick: () => void
  onSyncAttractions: () => void
  isSyncingAttractions: boolean
  syncMessage: string | null
  onRefreshData: () => void
  isRefreshing: boolean
  onCreateVoucher?: () => void
}

export default function AdminHeader({
  currentWorkspace,
  workspaceTitle,
  workspaceSubtitle,
  subTabs,
  currentSubTab,
  onSelectSubTab,
  urgentActionCount,
  onUrgentActionClick,
  onSyncAttractions,
  isSyncingAttractions,
  syncMessage,
  onRefreshData,
  isRefreshing,
  onCreateVoucher
}: AdminHeaderProps) {
  return (
    <header
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '1.25rem 2rem 0 2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}
    >
      {/* Top Row: Title, Urgent Action Pill & Global Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '1.65rem',
                color: '#1E293B',
                margin: 0,
                fontWeight: 800,
                letterSpacing: '-0.3px'
              }}
            >
              {workspaceTitle}
            </h1>

            {/* Admin Verified Badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.2rem 0.5rem',
                background: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                fontSize: '0.68rem',
                fontWeight: 700
              }}
            >
              <ShieldCheck size={12} /> Live Command
            </span>
          </div>
          <p
            style={{
              color: '#64748B',
              fontSize: '0.84rem',
              margin: '0.25rem 0 0 0',
              fontWeight: 500
            }}
          >
            {workspaceSubtitle}
          </p>
        </div>

        {/* Global Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Urgent Action Pill */}
          {urgentActionCount > 0 && (
            <button
              onClick={onUrgentActionClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.9rem',
                background: '#FEF2F2',
                color: '#991B1B',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(239, 68, 68, 0.1)',
                animation: 'pulse 2s infinite'
              }}
              title="Click to view pending items requiring admin action"
            >
              <AlertTriangle size={15} color="#DC2626" />
              <span>{urgentActionCount} Actions Required</span>
            </button>
          )}

          {/* Quick Create Voucher button (when in operations or overview) */}
          {onCreateVoucher && (
            <button
              onClick={onCreateVoucher}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 0.95rem',
                background: '#0F4C3A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(15, 76, 58, 0.2)'
              }}
            >
              <Plus size={15} />
              <span>Create Hotel Voucher</span>
            </button>
          )}

          {/* Sync Sheets & Cache */}
          <button
            onClick={onSyncAttractions}
            disabled={isSyncingAttractions}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              background: '#F0FDF4',
              color: '#065F46',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: isSyncingAttractions ? 'not-allowed' : 'pointer'
            }}
            title="Fetch latest attractions from Google Sheets and purge ISR page caches"
          >
            <FileSpreadsheet size={15} className={isSyncingAttractions ? 'animate-spin' : ''} />
            <span>{isSyncingAttractions ? 'Syncing...' : 'Sync Sheets'}</span>
          </button>

          {/* Refresh Data */}
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#334155',
              cursor: isRefreshing ? 'not-allowed' : 'pointer'
            }}
            title="Refresh database records"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncMessage && (
        <div
          style={{
            marginBottom: '0.75rem',
            padding: '0.55rem 0.85rem',
            borderRadius: '7px',
            background: syncMessage.startsWith('Error') ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${syncMessage.startsWith('Error') ? '#FECACA' : '#BBF7D0'}`,
            color: syncMessage.startsWith('Error') ? '#991B1B' : '#166534',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {syncMessage.startsWith('Error') ? <XCircle size={15} /> : <CheckCircle size={15} />}
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Bottom Row: Sub-Tab Pills Navigation */}
      {subTabs.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            overflowX: 'auto',
            paddingBottom: '0.1rem'
          }}
        >
          {subTabs.map(tab => {
            const isActive = currentSubTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onSelectSubTab(tab.id)}
                style={{
                  padding: '0.55rem 1rem',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--emerald-secondary)' : '2px solid transparent',
                  background: 'transparent',
                  color: isActive ? '#0F172A' : '#64748B',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      padding: '0.08rem 0.45rem',
                      borderRadius: '10px',
                      background: tab.badgeColor === 'urgent' ? '#FEE2E2' : isActive ? '#E2E8F0' : '#F1F5F9',
                      color: tab.badgeColor === 'urgent' ? '#991B1B' : isActive ? '#0F172A' : '#64748B'
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </header>
  )
}
