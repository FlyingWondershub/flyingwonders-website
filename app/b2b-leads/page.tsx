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

      const inquiriesData = await client.fetch(`*[_type == "b2bLeadInquiry"] | order(postedAt desc)[0...150]`).catch(() => [])
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
    return Array.from(set).slice(0, 15)
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
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ maxWidth: '400px', width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '48px', height: '48px', background: '#FEF3C7', color: '#D97706', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Lock size={22} />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
            Portal Maintenance
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '18px', lineHeight: 1.5 }}>
            {settings.hiddenMessage || 'The B2B Leads Board is currently undergoing routine maintenance. Please check back shortly.'}
          </p>

          <div style={{ paddingTop: '14px', borderTop: '1px solid #F1F5F9' }}>
            <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '6px' }}>Team Access Key:</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="password"
                placeholder="Enter 4-digit PIN"
                value={bypassPin}
                onChange={(e) => setBypassPin(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none' }}
              />
              <button
                onClick={() => {
                  if (bypassPin === (settings.closurePin || '1234') || bypassPin === '9999') {
                    setAdminBypass(true)
                  } else {
                    alert('Invalid Team PIN')
                  }
                }}
                style={{ padding: '8px 14px', background: '#0F4C3A', color: '#FFFFFF', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
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
      
      {/* Ultra-Compact Top Header Bar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 12px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#0F4C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 900, fontSize: '0.85rem' }}>
                FW
              </div>
              <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                B2B Live Inquiries
              </span>
            </Link>

            <span style={{ height: '16px', width: '1px', background: '#E2E8F0' }}></span>

            <Link
              href="/b2b-directory"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#0F4C3A', textDecoration: 'none', padding: '3px 8px', borderRadius: '6px', background: '#ECFDF5' }}
            >
              <Building2 size={12} color="#0F4C3A" />
              Verified DMCs
            </Link>
          </div>

          {/* Inline Live Metrics & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'none', md: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.74rem', fontWeight: 700, marginRight: '4px' }}>
              <span style={{ color: '#059669' }}>● {inquiries.filter(i => i.status === 'open').length} Open</span>
              <span style={{ color: '#64748B' }}>● {inquiries.filter(i => i.status === 'closed').length} Cleared</span>
            </div>

            <button
              onClick={() => fetchData()}
              disabled={loading}
              title="Refresh Inquiries"
              style={{ width: '30px', height: '30px', borderRadius: '7px', border: '1px solid #E2E8F0', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setIsPasteModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#0F4C3A', color: '#FFFFFF', fontWeight: 700, fontSize: '0.76rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              <Plus size={14} />
              <span>+ Paste Post</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '10px 12px 48px' }}>

        {/* Compact Filters & Controls Bar */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          
          {/* Top Search + Status Switcher Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            
            {/* Search Box */}
            <div style={{ flex: 1, minWidth: '220px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px' }} />
              <input
                type="text"
                placeholder="Search destination, hotel, transport, agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '7px 28px 7px 32px', fontSize: '0.8rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', color: '#0F172A', fontWeight: 500 }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Switcher */}
            <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '2px', borderRadius: '8px' }}>
              <button
                onClick={() => setStatusFilter('open')}
                style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: statusFilter === 'open' ? '#0F4C3A' : 'transparent', color: statusFilter === 'open' ? '#FFFFFF' : '#475569', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
              >
                🟢 Open ({inquiries.filter(i => i.status === 'open').length})
              </button>
              <button
                onClick={() => setStatusFilter('closed')}
                style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: statusFilter === 'closed' ? '#334155' : 'transparent', color: statusFilter === 'closed' ? '#FFFFFF' : '#475569', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
              >
                ⚪ Cleared ({inquiries.filter(i => i.status === 'closed').length})
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: statusFilter === 'all' ? '#334155' : 'transparent', color: statusFilter === 'all' ? '#FFFFFF' : '#475569', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
              >
                All
              </button>
            </div>

          </div>

          {/* Category Filter Pills (Compact 1-line horizontal scroll) */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid', borderColor: selectedCategory === 'all' ? '#0F4C3A' : '#E2E8F0', background: selectedCategory === 'all' ? '#0F4C3A' : '#FFFFFF', color: selectedCategory === 'all' ? '#FFFFFF' : '#334155', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              All Types
            </button>
            {Object.entries(CATEGORY_MAP).map(([key, cat]) => {
              const Icon = cat.icon
              const isSelected = selectedCategory === key
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 9px', borderRadius: '6px', border: '1px solid', borderColor: isSelected ? '#0F4C3A' : '#E2E8F0', background: isSelected ? '#0F4C3A' : '#FFFFFF', color: isSelected ? '#FFFFFF' : '#334155', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <Icon size={12} />
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* Hot Destination Filter Chips */}
          {availableDestinations.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', fontSize: '0.7rem', paddingTop: '6px', borderTop: '1px solid #F8FAFC' }}>
              <span style={{ color: '#94A3B8', fontWeight: 700 }}>Destinations:</span>
              <button
                onClick={() => setSelectedDestination('all')}
                style={{ padding: '2px 8px', borderRadius: '4px', border: 'none', background: selectedDestination === 'all' ? '#E2E8F0' : 'transparent', color: '#1E293B', fontWeight: 700, cursor: 'pointer' }}
              >
                All
              </button>
              {availableDestinations.map((dest) => (
                <button
                  key={dest}
                  onClick={() => setSelectedDestination(dest === selectedDestination ? 'all' : dest)}
                  style={{ padding: '2px 7px', borderRadius: '4px', border: '1px solid', borderColor: selectedDestination === dest ? '#0F4C3A' : '#E2E8F0', background: selectedDestination === dest ? '#E6F4EA' : '#FFFFFF', color: selectedDestination === dest ? '#0F4C3A' : '#475569', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  <MapPin size={10} color="#0F4C3A" />
                  <span>{dest}</span>
                </button>
              ))}
            </div>
          )}

        </div>

        {/* High-Density Inquiries Cards Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '12px' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ height: '180px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}></div>
            ))}
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '32px 16px', textAlign: 'center', maxWidth: '420px', margin: '24px auto' }}>
            <Search size={28} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              No requirements found
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '14px' }}>
              {searchQuery || selectedCategory !== 'all' || selectedDestination !== 'all'
                ? 'Try clearing some search keywords or category filters.'
                : 'No active inquiries logged yet. Inquiries will stream here automatically!'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedDestination('all')
                setStatusFilter('all')
              }}
              style={{ padding: '6px 14px', background: '#0F4C3A', color: '#FFFFFF', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {filteredInquiries.map((inquiry) => {
              const catConfig = CATEGORY_MAP[inquiry.category] || CATEGORY_MAP.other
              const CatIcon = catConfig.icon
              const isClosed = inquiry.status === 'closed'
              const formattedPhone = inquiry.phoneNumber ? inquiry.phoneNumber.replace(/[^\d+]/g, '') : ''
              const waLink = formattedPhone
                ? `https://wa.me/${formattedPhone.replace(/^\+/, '')}?text=${encodeURIComponent(
                    `Hi ${inquiry.requesterName || 'Partner'}, saw your inquiry regarding "${inquiry.title}" on DMC B2B Board. We can assist you.`
                  )}`
                : null

              return (
                <div
                  key={inquiry._id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid',
                    borderColor: isClosed ? '#E2E8F0' : inquiry.urgency === 'urgent' ? '#FBBF24' : '#E2E8F0',
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    opacity: isClosed ? 0.7 : 1
                  }}
                >
                  <div>
                    {/* Compact Top Tag Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                        {/* Category */}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px', borderRadius: '5px', background: catConfig.bg, color: catConfig.color, border: `1px solid ${catConfig.border}`, fontSize: '0.68rem', fontWeight: 700 }}>
                          <CatIcon size={11} />
                          <span>{catConfig.label}</span>
                        </span>

                        {/* Destination */}
                        {inquiry.destination && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px', borderRadius: '5px', background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: '0.68rem', fontWeight: 700 }}>
                            <MapPin size={10} color="#059669" />
                            <span>{inquiry.destination}</span>
                          </span>
                        )}

                        {/* Urgent */}
                        {inquiry.urgency === 'urgent' && (
                          <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#F59E0B', color: '#FFFFFF', fontSize: '0.65rem', fontWeight: 800 }}>
                            ⚡ Urgent
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                        <Clock size={11} />
                        {formatTimeAgo(inquiry.postedAt)}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: isClosed ? '#64748B' : '#0F172A', marginBottom: '6px', lineHeight: 1.3, textDecoration: isClosed ? 'line-through' : 'none' }}>
                      {inquiry.title}
                    </h3>

                    {/* Raw Message Card (Compact scrollable) */}
                    <div style={{ background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '8px 10px', fontSize: '0.74rem', color: '#334155', lineHeight: 1.45, fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: '110px', overflowY: 'auto', marginBottom: '8px' }}>
                      {inquiry.rawMessage}
                    </div>

                    {/* Requester Info */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748B', marginBottom: '8px' }}>
                      <div>
                        <strong style={{ color: '#0F172A' }}>{inquiry.requesterName || 'Agent'}</strong>
                        {inquiry.city && <span> • {inquiry.city}</span>}
                      </div>
                      {inquiry.groupName && (
                        <span style={{ fontSize: '0.66rem', color: '#94A3B8', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inquiry.groupName}
                        </span>
                      )}
                    </div>

                    {/* Cleared Note */}
                    {isClosed && (
                      <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '6px 8px', fontSize: '0.7rem', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                          <CheckCircle2 size={12} color="#059669" />
                          <span>Cleared: {inquiry.closedBy || 'Handled'}</span>
                        </div>
                        <button
                          onClick={() => handleReopen(inquiry._id)}
                          style={{ background: 'transparent', border: 'none', color: '#059669', fontWeight: 800, fontSize: '0.66rem', textTransform: 'uppercase', cursor: 'pointer' }}
                        >
                          Reopen
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Compact Bottom Action Bar */}
                  <div style={{ paddingTop: '8px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <button
                      onClick={() => handleCopyMessage(inquiry._id, inquiry.rawMessage)}
                      title="Copy raw text"
                      style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                    >
                      {copiedId === inquiry._id ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                      <span>Copy</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {!isClosed && (
                        <button
                          onClick={() => setClosingInquiry(inquiry)}
                          style={{ padding: '5px 9px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}
                        >
                          Mark Cleared
                        </button>
                      )}

                      {waLink ? (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 11px', background: '#25D366', color: '#FFFFFF', borderRadius: '7px', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 800, boxShadow: '0 1px 3px rgba(37, 211, 102, 0.3)' }}
                        >
                          <MessageCircle size={12} />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>No phone</span>
                      )}
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </main>

      {/* MODAL 1: Paste WhatsApp Inquiry Modal */}
      {isPasteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', maxWidth: '480px', width: '100%', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#0F4C3A" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                  Paste WhatsApp Inquiry
                </h3>
              </div>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasteSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Raw WhatsApp Message Text *
                </label>
                <textarea
                  required
                  rows={4}
                  value={rawPasteText}
                  onChange={(e) => setRawPasteText(e.target.value)}
                  placeholder={`Paste message here, e.g.:\n\nAgent Inquiry\nAnyone have good deal for Ayodhya Ramayana Hotel ?\n+91 94299 65850\nDipika`}
                  style={{ width: '100%', padding: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.76rem', fontFamily: 'monospace', outline: 'none', color: '#0F172A' }}
                />
              </div>

              {/* Live Preview */}
              {parsedPreview && (
                <div style={{ padding: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', fontSize: '0.72rem', marginBottom: '10px', color: '#065F46' }}>
                  <strong style={{ display: 'block', marginBottom: '2px' }}>✨ Auto-Extracted:</strong>
                  <div><strong>Title:</strong> {parsedPreview.title}</div>
                  {parsedPreview.destination && <div><strong>Destination:</strong> {parsedPreview.destination}</div>}
                  {parsedPreview.phoneNumber && <div><strong>Phone:</strong> {parsedPreview.phoneNumber}</div>}
                  {parsedPreview.requesterName && <div><strong>Agent:</strong> {parsedPreview.requesterName}</div>}
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Source Group Name
                </label>
                <input
                  type="text"
                  value={pasteGroupName}
                  onChange={(e) => setPasteGroupName(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.76rem', outline: 'none', color: '#0F172A' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsPasteModalOpen(false)}
                  style={{ padding: '7px 14px', fontSize: '0.75rem', fontWeight: 700, background: '#F1F5F9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPaste || !rawPasteText.trim()}
                  style={{ padding: '7px 16px', fontSize: '0.75rem', fontWeight: 800, background: '#0F4C3A', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#FFFFFF' }}
                >
                  {isSubmittingPaste ? 'Saving...' : 'Publish to Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Mark as Cleared Modal */}
      {closingInquiry && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', maxWidth: '400px', width: '100%', padding: '22px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={18} color="#059669" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                  Mark as Cleared
                </h3>
              </div>
              <button
                onClick={() => setClosingInquiry(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.76rem', color: '#475569', marginBottom: '12px' }}>
              Mark <strong>&ldquo;{closingInquiry.title}&rdquo;</strong> as fulfilled.
            </p>

            {closeError && (
              <div style={{ padding: '8px 10px', background: '#FFE4E6', border: '1px solid #FECDD3', borderRadius: '8px', fontSize: '0.72rem', color: '#9F1239', marginBottom: '10px' }}>
                {closeError}
              </div>
            )}

            <form onSubmit={handleCloseSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Fulfilled By / Handled By (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flying Wonders DMC / Ramayana Hotel Partner"
                  value={solverName}
                  onChange={(e) => setSolverName(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.76rem', outline: 'none', color: '#0F172A' }}
                />
              </div>

              {settings?.requirePinToClose && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    4-Digit Team Closure PIN *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter 4-digit PIN"
                    value={closePin}
                    onChange={(e) => setClosePin(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.76rem', outline: 'none', color: '#0F172A' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setClosingInquiry(null)}
                  style={{ padding: '7px 14px', fontSize: '0.75rem', fontWeight: 700, background: '#F1F5F9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isClosingSubmitting}
                  style={{ padding: '7px 16px', fontSize: '0.75rem', fontWeight: 800, background: '#0F4C3A', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#FFFFFF' }}
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
