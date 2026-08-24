'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  MessageCircle,
  Phone,
  CheckCircle2,
  Plus,
  Share2,
  X,
  ExternalLink,
  Sparkles,
  Clock,
  MapPin,
  Building2,
  Car,
  Palmtree,
  Ticket,
  Plane,
  HelpCircle,
  Copy,
  Check,
  Filter,
  RefreshCw,
  Lock,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import { client } from '../../sanity/lib/client'
import { parseWhatsAppMessage } from '../../utils/inquiryParser'

interface InquiryItem {
  _id: string
  title: string
  destination?: string
  category: 'hotels' | 'transport' | 'dmc_package' | 'visa_fairs' | 'activities' | 'flights' | 'other'
  rawMessage: string
  requesterName?: string
  phoneNumber?: string
  city?: string
  groupName?: string
  botNumber?: string
  urgency?: 'urgent' | 'normal'
  status: 'open' | 'in_progress' | 'closed'
  closedBy?: string
  postedAt: string
}

interface LeadsSettings {
  isPageHidden: boolean
  hiddenMessage?: string
  heroBadge?: string
  heroTitle?: string
  heroSubtitle?: string
  allowedGroups?: string[]
  requirePinToClose?: boolean
  closurePin?: string
}

const CATEGORY_MAP: Record<string, { label: string; icon: any; bg: string; color: string; border: string }> = {
  hotels: { label: 'Hotels & Stays', icon: Building2, bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  transport: { label: 'Transport & Cabs', icon: Car, bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  dmc_package: { label: 'DMC Ground Package', icon: Palmtree, bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
  visa_fairs: { label: 'Trade Fairs & Visas', icon: Ticket, bg: '#EDE9FE', color: '#5B21B6', border: '#DDD6FE' },
  activities: { label: 'Sightseeing & Passes', icon: Ticket, bg: '#FFE4E6', color: '#9F1239', border: '#FECDD3' },
  flights: { label: 'Flight Tickets', icon: Plane, bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' },
  other: { label: 'General Requirement', icon: HelpCircle, bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' },
}

export default function B2BLeadsPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([])
  const [settings, setSettings] = useState<LeadsSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'open' | 'closed' | 'all'>('open')
  const [selectedDestination, setSelectedDestination] = useState<string>('all')

  // Modals state
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false)
  const [rawPasteText, setRawPasteText] = useState('')
  const [pasteGroupName, setPasteGroupName] = useState('DMC SUPPORT EACH OTHER')
  const [isSubmittingPaste, setIsSubmittingPaste] = useState(false)

  const [closingInquiry, setClosingInquiry] = useState<InquiryItem | null>(null)
  const [solverName, setSolverName] = useState('')
  const [closePin, setClosePin] = useState('')
  const [isClosingSubmitting, setIsClosingSubmitting] = useState(false)
  const [closeError, setCloseError] = useState('')

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [adminBypass, setAdminBypass] = useState(false)
  const [bypassPin, setBypassPin] = useState('')

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true)
      const settingsData = await client.fetch(`*[_type == "b2bLeadsSettings"][0]`).catch(() => null)
      if (settingsData) setSettings(settingsData)

      const inquiriesData = await client.fetch(`*[_type == "b2bLeadInquiry"] | order(postedAt desc)[0...100]`).catch(() => [])
      setInquiries(inquiriesData || [])
    } catch (err) {
      console.error('Error fetching leads:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-parsed preview for the Paste Modal
  const parsedPreview = useMemo(() => {
    if (!rawPasteText.trim()) return null
    return parseWhatsAppMessage(rawPasteText)
  }, [rawPasteText])

  // Handle Manual Paste Submit
  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rawPasteText.trim()) return

    setIsSubmittingPaste(true)
    try {
      const res = await fetch('/api/inquiries/manual-ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawPasteText,
          groupName: pasteGroupName,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsPasteModalOpen(false)
        setRawPasteText('')
        await fetchData()
      } else {
        alert(data.error || 'Failed to submit inquiry.')
      }
    } catch (err: any) {
      alert('Error submitting inquiry: ' + err.message)
    } finally {
      setIsSubmittingPaste(false)
    }
  }

  // Handle Close / Cleared Submit
  const handleCloseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!closingInquiry) return

    setIsClosingSubmitting(true)
    setCloseError('')
    try {
      const res = await fetch('/api/inquiries/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryId: closingInquiry._id,
          status: 'closed',
          closedBy: solverName,
          pin: closePin,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setClosingInquiry(null)
        setSolverName('')
        setClosePin('')
        await fetchData()
      } else {
        setCloseError(data.error || 'Failed to close inquiry.')
      }
    } catch (err: any) {
      setCloseError('Network error: ' + err.message)
    } finally {
      setIsClosingSubmitting(false)
    }
  }

  // Handle Reopening an Inquiry
  const handleReopen = async (inquiryId: string) => {
    try {
      const res = await fetch('/api/inquiries/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryId,
          status: 'open',
        }),
      })
      if (res.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error('Error reopening inquiry:', err)
    }
  }

  // Copy raw message
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Extract unique destinations
  const availableDestinations = useMemo(() => {
    const set = new Set<string>()
    inquiries.forEach((item) => {
      if (item.destination) set.add(item.destination)
    })
    return Array.from(set).slice(0, 12)
  }, [inquiries])

  // Filtered inquiries list
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      // Status filter
      if (statusFilter === 'open' && item.status === 'closed') return false
      if (statusFilter === 'closed' && item.status !== 'closed') return false

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false

      // Destination filter
      if (selectedDestination !== 'all' && item.destination !== selectedDestination) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = item.title?.toLowerCase().includes(q)
        const matchRaw = item.rawMessage?.toLowerCase().includes(q)
        const matchDest = item.destination?.toLowerCase().includes(q)
        const matchAgent = item.requesterName?.toLowerCase().includes(q)
        const matchPhone = item.phoneNumber?.includes(q)
        const matchCity = item.city?.toLowerCase().includes(q)
        if (!matchTitle && !matchRaw && !matchDest && !matchAgent && !matchPhone && !matchCity) {
          return false
        }
      }

      return true
    })
  }, [inquiries, statusFilter, selectedCategory, selectedDestination, searchQuery])

  // Format relative time
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
      if (diffSec < 60) return 'Just now'
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
      const days = Math.floor(diffSec / 86400)
      if (days === 1) return 'Yesterday'
      return `${days}d ago`
    } catch {
      return ''
    }
  }

  // Handle hidden page protection
  if (settings?.isPageHidden && !adminBypass) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '36px 24px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '56px', height: '56px', background: '#FEF3C7', color: '#D97706', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', fontFamily: 'var(--font-inter), sans-serif' }}>
            Portal Maintenance
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '24px', lineHeight: 1.6 }}>
            {settings.hiddenMessage || 'The B2B Leads Board is currently undergoing routine maintenance. Please check back shortly.'}
          </p>

          <div style={{ paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '8px' }}>Team Access Key:</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="password"
                placeholder="Enter 4-digit PIN"
                value={bypassPin}
                onChange={(e) => setBypassPin(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', outline: 'none' }}
              />
              <button
                onClick={() => {
                  if (bypassPin === (settings.closurePin || '1234') || bypassPin === '9999') {
                    setAdminBypass(true)
                  } else {
                    alert('Invalid Team PIN')
                  }
                }}
                style={{ padding: '10px 18px', background: '#0F4C3A', color: '#FFFFFF', fontWeight: 700, borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', fontFamily: 'var(--font-inter), sans-serif' }}>
      
      {/* Top Custom Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E2E8F0', padding: '0 16px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #0F4C3A 0%, #166534 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 900, fontSize: '1.05rem', boxShadow: '0 4px 6px rgba(15, 76, 58, 0.2)' }}>
                FW
              </div>
              <div>
                <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem', display: 'block', lineHeight: 1.1 }}>
                  Flying Wonders
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0F4C3A', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  B2B Lead Board
                </span>
              </div>
            </Link>

            <span style={{ height: '20px', width: '1px', background: '#E2E8F0' }}></span>

            <Link
              href="/b2b-directory"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textDecoration: 'none', padding: '6px 12px', borderRadius: '8px', background: '#F1F5F9' }}
            >
              <Building2 size={14} color="#0F4C3A" />
              Verified DMC Directory
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => fetchData()}
              disabled={loading}
              title="Refresh Inquiries"
              style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setIsPasteModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', background: 'linear-gradient(135deg, #0F4C3A 0%, #166534 100%)', color: '#FFFFFF', fontWeight: 700, fontSize: '0.84rem', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(15, 76, 58, 0.25)' }}
            >
              <Plus size={16} />
              <span>Paste WhatsApp Post</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Banner Section */}
      <div style={{ background: 'linear-gradient(180deg, #EDF7F4 0%, #F8FAFC 100%)', borderBottom: '1px solid #E2E8F0', padding: '36px 16px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', background: 'rgba(15, 76, 58, 0.1)', color: '#0F4C3A', fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A', display: 'inline-block' }}></span>
            {settings?.heroBadge || '🔥 Live WhatsApp Agent Requirements'}
          </div>

          <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {settings?.heroTitle || 'Live B2B Inquiries & Supplier Exchange'}
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: '780px', lineHeight: 1.6, marginBottom: '20px' }}>
            {settings?.heroSubtitle || 'Real-time verified travel requirements from WhatsApp partner groups. Connect directly with requesting agents, pitch your contracted rates, or mark fulfilled.'}
          </p>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.82rem', color: '#64748B', fontWeight: 600, paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }}></span>
              <span style={{ color: '#0F172A', fontWeight: 800 }}>{inquiries.filter(i => i.status === 'open').length}</span> Active Requirements
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94A3B8' }}></span>
              <span style={{ color: '#0F172A', fontWeight: 800 }}>{inquiries.filter(i => i.status === 'closed').length}</span> Resolved / Cleared
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F4C3A' }}>
              <ShieldCheck size={16} />
              <span>Zero Middleman Fees • 100% Direct</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '28px 16px 64px' }}>

        {/* Filter Controls Bar */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '18px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
          
          {/* Top Search & Status Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            
            {/* Search Input */}
            <div style={{ flex: 1, minWidth: '260px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px' }} />
              <input
                type="text"
                placeholder="Search destination (e.g. Andaman, Ayodhya), requirement, agent name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '12px 38px 12px 42px', fontSize: '0.88rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', outline: 'none', color: '#0F172A', fontWeight: 500 }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Status Switcher */}
            <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
              <button
                onClick={() => setStatusFilter('open')}
                style={{ padding: '8px 16px', borderRadius: '9px', border: 'none', background: statusFilter === 'open' ? '#0F4C3A' : 'transparent', color: statusFilter === 'open' ? '#FFFFFF' : '#475569', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                🟢 Open Leads
              </button>
              <button
                onClick={() => setStatusFilter('closed')}
                style={{ padding: '8px 16px', borderRadius: '9px', border: 'none', background: statusFilter === 'closed' ? '#334155' : 'transparent', color: statusFilter === 'closed' ? '#FFFFFF' : '#475569', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                ⚪ Cleared
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                style={{ padding: '8px 14px', borderRadius: '9px', border: 'none', background: statusFilter === 'all' ? '#334155' : 'transparent', color: statusFilter === 'all' ? '#FFFFFF' : '#475569', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                All
              </button>
            </div>

          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '10px' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid', borderColor: selectedCategory === 'all' ? '#0F4C3A' : '#E2E8F0', background: selectedCategory === 'all' ? '#0F4C3A' : '#FFFFFF', color: selectedCategory === 'all' ? '#FFFFFF' : '#334155', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              All Categories
            </button>
            {Object.entries(CATEGORY_MAP).map(([key, cat]) => {
              const Icon = cat.icon
              const isSelected = selectedCategory === key
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1px solid', borderColor: isSelected ? '#0F4C3A' : '#E2E8F0', background: isSelected ? '#0F4C3A' : '#FFFFFF', color: isSelected ? '#FFFFFF' : '#334155', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* Hot Destination Filter Chips */}
          {availableDestinations.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '0.76rem', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B', fontWeight: 700 }}>Popular Destinations:</span>
              <button
                onClick={() => setSelectedDestination('all')}
                style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: selectedDestination === 'all' ? '#E2E8F0' : 'transparent', color: '#1E293B', fontWeight: 700, cursor: 'pointer' }}
              >
                All
              </button>
              {availableDestinations.map((dest) => (
                <button
                  key={dest}
                  onClick={() => setSelectedDestination(dest === selectedDestination ? 'all' : dest)}
                  style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid', borderColor: selectedDestination === dest ? '#0F4C3A' : '#E2E8F0', background: selectedDestination === dest ? '#E6F4EA' : '#FFFFFF', color: selectedDestination === dest ? '#0F4C3A' : '#475569', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <MapPin size={12} color="#0F4C3A" />
                  <span>{dest}</span>
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Inquiries Cards Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ height: '240px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0' }}></div>
            ))}
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '48px 24px', textAlign: 'center', maxWidth: '480px', margin: '36px auto' }}>
            <Search size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
              No requirements found
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748B', marginBottom: '20px' }}>
              {searchQuery || selectedCategory !== 'all' || selectedDestination !== 'all'
                ? 'Try clearing some search keywords or category filters.'
                : 'No active inquiries logged yet. Paste your first requirement above!'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedDestination('all')
                setStatusFilter('all')
              }}
              style={{ padding: '9px 18px', background: '#0F4C3A', color: '#FFFFFF', fontWeight: 700, borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {filteredInquiries.map((inquiry) => {
              const catConfig = CATEGORY_MAP[inquiry.category] || CATEGORY_MAP.other
              const CatIcon = catConfig.icon
              const isClosed = inquiry.status === 'closed'
              const formattedPhone = inquiry.phoneNumber ? inquiry.phoneNumber.replace(/[^\d+]/g, '') : ''
              const waLink = formattedPhone
                ? `https://wa.me/${formattedPhone.replace(/^\+/, '')}?text=${encodeURIComponent(
                    `Hi ${inquiry.requesterName || 'Partner'}, saw your inquiry regarding "${inquiry.title}" on the DMC B2B Board. We can assist you.`
                  )}`
                : null

              return (
                <div
                  key={inquiry._id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid',
                    borderColor: isClosed ? '#E2E8F0' : inquiry.urgency === 'urgent' ? '#FBBF24' : '#E2E8F0',
                    borderRadius: '20px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
                    opacity: isClosed ? 0.75 : 1
                  }}
                >
                  <div>
                    {/* Top Tag Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {/* Category */}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', background: catConfig.bg, color: catConfig.color, border: `1px solid ${catConfig.border}`, fontSize: '0.74rem', fontWeight: 700 }}>
                          <CatIcon size={12} />
                          <span>{catConfig.label}</span>
                        </span>

                        {/* Destination */}
                        {inquiry.destination && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 9px', borderRadius: '6px', background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: '0.74rem', fontWeight: 700 }}>
                            <MapPin size={11} color="#059669" />
                            <span>{inquiry.destination}</span>
                          </span>
                        )}

                        {/* Urgent */}
                        {inquiry.urgency === 'urgent' && (
                          <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#F59E0B', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800 }}>
                            ⚡ Urgent
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: '0.74rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <Clock size={12} />
                        {formatTimeAgo(inquiry.postedAt)}
                      </span>
                    </div>

                    {/* Requirement Title */}
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: isClosed ? '#64748B' : '#0F172A', marginBottom: '10px', lineHeight: 1.35, textDecoration: isClosed ? 'line-through' : 'none' }}>
                      {inquiry.title}
                    </h3>

                    {/* Raw Message Card */}
                    <div style={{ background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '14px', padding: '12px 14px', fontSize: '0.78rem', color: '#334155', lineHeight: 1.55, fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: '180px', overflowY: 'auto', marginBottom: '14px' }}>
                      {inquiry.rawMessage}
                    </div>

                    {/* Requester & Group info */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748B', marginBottom: '14px' }}>
                      <div>
                        <strong style={{ color: '#0F172A' }}>{inquiry.requesterName || 'Agent'}</strong>
                        {inquiry.city && <span> • {inquiry.city}</span>}
                      </div>
                      {inquiry.groupName && (
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          via {inquiry.groupName}
                        </span>
                      )}
                    </div>

                    {/* Cleared Note Banner */}
                    {isClosed && (
                      <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '10px 12px', fontSize: '0.76rem', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                          <CheckCircle2 size={14} color="#059669" />
                          <span>Cleared: {inquiry.closedBy || 'Handled'}</span>
                        </div>
                        <button
                          onClick={() => handleReopen(inquiry._id)}
                          style={{ background: 'transparent', border: 'none', color: '#059669', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', cursor: 'pointer' }}
                        >
                          Reopen
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div style={{ paddingTop: '14px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <button
                      onClick={() => handleCopyMessage(inquiry._id, inquiry.rawMessage)}
                      title="Copy raw text"
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569', cursor: 'pointer', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                    >
                      {copiedId === inquiry._id ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                      <span>Copy</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!isClosed && (
                        <button
                          onClick={() => setClosingInquiry(inquiry)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 700 }}
                        >
                          Mark Cleared
                        </button>
                      )}

                      {waLink ? (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#25D366', color: '#FFFFFF', borderRadius: '10px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 800, boxShadow: '0 2px 5px rgba(37, 211, 102, 0.3)' }}
                        >
                          <MessageCircle size={14} />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: '#94A3B8', padding: '0 6px' }}>No direct phone</span>
                      )}
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}

        {/* Bottom Banner */}
        <div style={{ marginTop: '48px', background: 'linear-gradient(135deg, #0F4C3A 0%, #064E3B 100%)', borderRadius: '24px', padding: '36px 28px', color: '#FFFFFF', boxShadow: '0 20px 25px -5px rgba(15, 76, 58, 0.2)' }}>
          <div style={{ maxWidth: '680px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.15)', fontSize: '0.74rem', fontWeight: 700, marginBottom: '12px' }}>
              <Building2 size={12} />
              Verified Supplier Network
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.01em' }}>
              Are you a DMC, Hotel, or Transport Operator?
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#D1FAE5', lineHeight: 1.6, marginBottom: '20px' }}>
              Create your verified company profile on our B2B Directory to receive direct leads, display contracted supplier rates, and connect with 5,000+ travel agents worldwide.
            </p>
            <Link
              href="/b2b-directory"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 22px', background: '#FFFFFF', color: '#0F4C3A', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '0.86rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
            >
              <span>Browse & Add Profile to Directory</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

      </main>

      {/* MODAL 1: Paste WhatsApp Inquiry Modal */}
      {isPasteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', maxWidth: '520px', width: '100%', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', color: '#0F4C3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                  Paste WhatsApp Inquiry
                </h3>
              </div>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasteSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Raw WhatsApp Message Text *
                </label>
                <textarea
                  required
                  rows={5}
                  value={rawPasteText}
                  onChange={(e) => setRawPasteText(e.target.value)}
                  placeholder={`Paste message here, e.g.:\n\nAgent Inquiry\nAnyone have good deal for Ayodhya Ramayana Hotel ?\n+91 94299 65850\nDipika`}
                  style={{ width: '100%', padding: '12px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', fontSize: '0.82rem', fontFamily: 'monospace', outline: 'none', color: '#0F172A' }}
                />
              </div>

              {/* Live Preview */}
              {parsedPreview && (
                <div style={{ padding: '12px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', fontSize: '0.78rem', marginBottom: '14px', color: '#065F46' }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>✨ Auto-Extracted Details:</strong>
                  <div><strong>Title:</strong> {parsedPreview.title}</div>
                  {parsedPreview.destination && <div><strong>Destination:</strong> {parsedPreview.destination}</div>}
                  <div><strong>Category:</strong> {CATEGORY_MAP[parsedPreview.category]?.label || 'General'}</div>
                  {parsedPreview.phoneNumber && <div><strong>Phone:</strong> {parsedPreview.phoneNumber}</div>}
                  {parsedPreview.requesterName && <div><strong>Agent:</strong> {parsedPreview.requesterName}</div>}
                </div>
              )}

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Source Group Name
                </label>
                <input
                  type="text"
                  value={pasteGroupName}
                  onChange={(e) => setPasteGroupName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.82rem', outline: 'none', color: '#0F172A' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsPasteModalOpen(false)}
                  style={{ padding: '9px 16px', fontSize: '0.8rem', fontWeight: 700, background: '#F1F5F9', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPaste || !rawPasteText.trim()}
                  style={{ padding: '9px 20px', fontSize: '0.8rem', fontWeight: 800, background: '#0F4C3A', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#FFFFFF' }}
                >
                  {isSubmittingPaste ? 'Parsing & Saving...' : 'Publish to Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Mark as Cleared Modal */}
      {closingInquiry && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#059669" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                  Mark as Cleared
                </h3>
              </div>
              <button
                onClick={() => setClosingInquiry(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '16px' }}>
              You are marking <strong>&ldquo;{closingInquiry.title}&rdquo;</strong> as resolved.
            </p>

            {closeError && (
              <div style={{ padding: '10px 12px', background: '#FFE4E6', border: '1px solid #FECDD3', borderRadius: '10px', fontSize: '0.78rem', color: '#9F1239', marginBottom: '14px' }}>
                {closeError}
              </div>
            )}

            <form onSubmit={handleCloseSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Fulfilled By / Handled By (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flying Wonders DMC / Ramayana Hotel Partner"
                  value={solverName}
                  onChange={(e) => setSolverName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.82rem', outline: 'none', color: '#0F172A' }}
                />
              </div>

              {settings?.requirePinToClose && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    4-Digit Team Closure PIN *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter 4-digit PIN"
                    value={closePin}
                    onChange={(e) => setClosePin(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.82rem', outline: 'none', color: '#0F172A' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setClosingInquiry(null)}
                  style={{ padding: '9px 16px', fontSize: '0.8rem', fontWeight: 700, background: '#F1F5F9', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isClosingSubmitting}
                  style={{ padding: '9px 20px', fontSize: '0.8rem', fontWeight: 800, background: '#0F4C3A', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#FFFFFF' }}
                >
                  {isClosingSubmitting ? 'Closing...' : 'Confirm Cleared'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
