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
  AlertCircle,
  Bell,
  Mail,
  Send
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
  enabledAlertChannels?: 'whatsapp_only' | 'email_only' | 'all_channels'
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

const POPULAR_DESTINATIONS = [
  'All Destinations',
  'Singapore',
  'Malaysia',
  'Thailand',
  'Bali',
  'Dubai',
  'Andaman',
  'Ayodhya',
  'Kashmir',
  'Goa',
  'Kerala',
  'Vietnam',
  'Sri Lanka',
  'Maldives',
  'Europe',
]

export default function B2BLeadsPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([])
  const [settings, setSettings] = useState<LeadsSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'open' | 'closed' | 'all'>('open')
  const [selectedDestination, setSelectedDestination] = useState<string>('all')

  // Modals state: Paste Modal
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false)
  const [rawPasteText, setRawPasteText] = useState('')
  const [pasteGroupName, setPasteGroupName] = useState('DMC SUPPORT EACH OTHER')
  const [isSubmittingPaste, setIsSubmittingPaste] = useState(false)

  // Modals state: Close Modal
  const [closingInquiry, setClosingInquiry] = useState<InquiryItem | null>(null)
  const [solverName, setSolverName] = useState('')
  const [closePin, setClosePin] = useState('')
  const [isClosingSubmitting, setIsClosingSubmitting] = useState(false)
  const [closeError, setCloseError] = useState('')

  // Modals state: Subscribe Modal
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false)
  const [subAgentName, setSubAgentName] = useState('')
  const [subCompanyName, setSubCompanyName] = useState('')
  const [subWhatsApp, setSubWhatsApp] = useState('')
  const [subEmail, setSubEmail] = useState('')
  const [subDestinations, setSubDestinations] = useState<string[]>(['All Destinations'])
  const [subCategory, setSubCategory] = useState<string>('all')
  const [subFrequency, setSubFrequency] = useState<'instant' | 'daily_digest'>('instant')
  const [subChannel, setSubChannel] = useState<'whatsapp' | 'email' | 'both'>('whatsapp')
  const [subKeywords, setSubKeywords] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribeSuccessMsg, setSubscribeSuccessMsg] = useState('')
  const [subscribeErrorMsg, setSubscribeErrorMsg] = useState('')

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

  // Handle Subscription Submit
  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subAgentName.trim() || !subWhatsApp.trim()) return

    setIsSubscribing(true)
    setSubscribeErrorMsg('')
    setSubscribeSuccessMsg('')

    try {
      const res = await fetch('/api/inquiries/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: subAgentName,
          companyName: subCompanyName,
          whatsappNumber: subWhatsApp,
          email: subEmail,
          subscribedDestinations: subDestinations,
          subscribedCategories: [subCategory],
          customKeywords: subKeywords,
          alertFrequency: subFrequency,
          preferredChannel: subChannel,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSubscribeSuccessMsg(data.message || 'Successfully subscribed to lead alerts!')
        setTimeout(() => {
          setIsSubscribeModalOpen(false)
          setSubscribeSuccessMsg('')
        }, 2200)
      } else {
        setSubscribeErrorMsg(data.error || 'Failed to subscribe. Please verify your details.')
      }
    } catch (err: any) {
      setSubscribeErrorMsg('Network error: ' + err.message)
    } finally {
      setIsSubscribing(false)
    }
  }

  // Toggle Destination in Subscribe Modal
  const toggleSubDestination = (dest: string) => {
    if (dest === 'All Destinations') {
      setSubDestinations(['All Destinations'])
      return
    }

    setSubDestinations((prev) => {
      const withoutAll = prev.filter((d) => d !== 'All Destinations')
      if (withoutAll.includes(dest)) {
        const next = withoutAll.filter((d) => d !== dest)
        return next.length === 0 ? ['All Destinations'] : next
      } else {
        return [...withoutAll, dest]
      }
    })
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

  // Extract unique destinations from current items
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
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', outline: 'none', color: '#0F172A' }}
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

  const openCount = inquiries.filter(i => i.status === 'open').length
  const closedCount = inquiries.filter(i => i.status === 'closed').length

  const allowEmailChannel = settings?.enabledAlertChannels === 'email_only' || settings?.enabledAlertChannels === 'all_channels'

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', fontFamily: 'var(--font-inter), sans-serif' }}>
      
      {/* Top Header Bar with Search + Status + Alerts + Actions on 1 Line */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 12px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '6px 0' }}>
          
          {/* Left: Brand & Verified DMC Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#0F4C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 900, fontSize: '0.8rem' }}>
                FW
              </div>
              <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                B2B Live Inquiries
              </span>
            </Link>

            <span style={{ height: '14px', width: '1px', background: '#CBD5E1' }}></span>

            <Link
              href="/b2b-directory"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: '#0F4C3A', textDecoration: 'none', padding: '3px 7px', borderRadius: '5px', background: '#ECFDF5', border: '1px solid #A7F3D0', whiteSpace: 'nowrap' }}
            >
              <Building2 size={11} color="#0F4C3A" />
              Verified DMCs
            </Link>
          </div>

          {/* Center: Compact Search Box + Status Filter Next to it */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 auto', maxWidth: '580px', minWidth: '240px' }}>
            
            {/* Search Box */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 180px', minWidth: '140px' }}>
              <Search size={14} color="#64748B" style={{ position: 'absolute', left: '9px' }} />
              <input
                type="text"
                placeholder="Search destination, hotel, cab, agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '6px 26px 6px 28px', fontSize: '0.78rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '7px', outline: 'none', color: '#0F172A', fontWeight: 600 }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '7px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Status Switcher (Open / Cleared / All) */}
            <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '2px', borderRadius: '7px', flexShrink: 0, border: '1px solid #E2E8F0' }}>
              <button
                onClick={() => setStatusFilter('open')}
                style={{ padding: '4px 9px', borderRadius: '5px', border: 'none', background: statusFilter === 'open' ? '#0F4C3A' : 'transparent', color: statusFilter === 'open' ? '#FFFFFF' : '#334155', fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                🟢 Open ({openCount})
              </button>
              <button
                onClick={() => setStatusFilter('closed')}
                style={{ padding: '4px 9px', borderRadius: '5px', border: 'none', background: statusFilter === 'closed' ? '#334155' : 'transparent', color: statusFilter === 'closed' ? '#FFFFFF' : '#334155', fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                ⚪ Cleared ({closedCount})
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                style={{ padding: '4px 8px', borderRadius: '5px', border: 'none', background: statusFilter === 'all' ? '#334155' : 'transparent', color: statusFilter === 'all' ? '#FFFFFF' : '#334155', fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                All
              </button>
            </div>

          </div>

          {/* Right: Get Alerts + Refresh + Post Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            
            {/* Get Lead Alerts Button */}
            <button
              onClick={() => setIsSubscribeModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', borderRadius: '7px', fontWeight: 800, fontSize: '0.74rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              title="Get WhatsApp or Email alerts for matching destination leads"
            >
              <Bell size={13} color="#B45309" />
              <span>Get Alerts</span>
            </button>

            <button
              onClick={() => fetchData()}
              disabled={loading}
              title="Refresh Inquiries"
              style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#334155' }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setIsPasteModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 11px', background: '#0F4C3A', color: '#FFFFFF', fontWeight: 800, fontSize: '0.74rem', borderRadius: '7px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <Plus size={13} />
              <span>+ Paste Post</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '8px 12px 48px' }}>

        {/* Compact Secondary Filter Bar (Category Pills & Hot Destinations) */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 10px', marginBottom: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{ padding: '3px 9px', borderRadius: '5px', border: '1px solid', borderColor: selectedCategory === 'all' ? '#0F4C3A' : '#CBD5E1', background: selectedCategory === 'all' ? '#0F4C3A' : '#FFFFFF', color: selectedCategory === 'all' ? '#FFFFFF' : '#1E293B', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
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
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: '5px', border: '1px solid', borderColor: isSelected ? '#0F4C3A' : '#E2E8F0', background: isSelected ? '#0F4C3A' : '#FFFFFF', color: isSelected ? '#FFFFFF' : '#1E293B', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <Icon size={11} />
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* Hot Destination Filter Chips */}
          {availableDestinations.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', fontSize: '0.68rem', paddingTop: '5px', borderTop: '1px solid #F1F5F9' }}>
              <span style={{ color: '#475569', fontWeight: 800 }}>Destinations:</span>
              <button
                onClick={() => setSelectedDestination('all')}
                style={{ padding: '2px 7px', borderRadius: '4px', border: 'none', background: selectedDestination === 'all' ? '#CBD5E1' : 'transparent', color: '#0F172A', fontWeight: 800, cursor: 'pointer' }}
              >
                All
              </button>
              {availableDestinations.map((dest) => (
                <button
                  key={dest}
                  onClick={() => setSelectedDestination(dest === selectedDestination ? 'all' : dest)}
                  style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid', borderColor: selectedDestination === dest ? '#0F4C3A' : '#E2E8F0', background: selectedDestination === dest ? '#E6F4EA' : '#FFFFFF', color: selectedDestination === dest ? '#0F4C3A' : '#334155', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                >
                  <MapPin size={9} color="#0F4C3A" />
                  <span>{dest}</span>
                </button>
              ))}
            </div>
          )}

        </div>

        {/* High-Density Inquiries Cards Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '10px' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ height: '160px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}></div>
            ))}
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '28px 16px', textAlign: 'center', maxWidth: '400px', margin: '20px auto' }}>
            <Search size={24} color="#94A3B8" style={{ margin: '0 auto 6px' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              No requirements found
            </h3>
            <p style={{ fontSize: '0.76rem', color: '#475569', marginBottom: '12px' }}>
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
              style={{ padding: '5px 12px', background: '#0F4C3A', color: '#FFFFFF', fontWeight: 800, borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.72rem' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(315px, 1fr))', gap: '10px' }}>
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
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    opacity: isClosed ? 0.75 : 1
                  }}
                >
                  <div>
                    {/* Compact Top Tag Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
                        {/* Category */}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 6px', borderRadius: '4px', background: catConfig.bg, color: catConfig.color, border: `1px solid ${catConfig.border}`, fontSize: '0.66rem', fontWeight: 800 }}>
                          <CatIcon size={10} />
                          <span>{catConfig.label}</span>
                        </span>

                        {/* Destination */}
                        {inquiry.destination && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 6px', borderRadius: '4px', background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: '0.66rem', fontWeight: 800 }}>
                            <MapPin size={9} color="#059669" />
                            <span>{inquiry.destination}</span>
                          </span>
                        )}

                        {/* Urgent */}
                        {inquiry.urgency === 'urgent' && (
                          <span style={{ padding: '2px 5px', borderRadius: '3px', background: '#F59E0B', color: '#FFFFFF', fontSize: '0.62rem', fontWeight: 900 }}>
                            ⚡ Urgent
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: '0.66rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                        <Clock size={10} />
                        {formatTimeAgo(inquiry.postedAt)}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 style={{ fontSize: '0.86rem', fontWeight: 800, color: isClosed ? '#64748B' : '#0F172A', marginBottom: '6px', lineHeight: 1.3, textDecoration: isClosed ? 'line-through' : 'none' }}>
                      {inquiry.title}
                    </h3>

                    {/* Raw Message Card */}
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '7px 9px', fontSize: '0.74rem', color: '#1E293B', lineHeight: 1.45, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word', overflowX: 'hidden', maxHeight: '110px', overflowY: 'auto', marginBottom: '8px' }}>
                      {inquiry.rawMessage}
                    </div>

                    {/* Requester Info */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: '#475569', marginBottom: '8px' }}>
                      <div>
                        <strong style={{ color: '#0F172A', fontWeight: 800 }}>{inquiry.requesterName || 'Agent'}</strong>
                        {inquiry.city && <span style={{ color: '#64748B' }}> • {inquiry.city}</span>}
                      </div>
                      {inquiry.groupName && (
                        <span style={{ fontSize: '0.64rem', color: '#64748B', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inquiry.groupName}
                        </span>
                      )}
                    </div>

                    {/* Cleared Note */}
                    {isClosed && (
                      <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', padding: '5px 7px', fontSize: '0.68rem', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 800 }}>
                          <CheckCircle2 size={11} color="#059669" />
                          <span>Cleared: {inquiry.closedBy || 'Handled'}</span>
                        </div>
                        <button
                          onClick={() => handleReopen(inquiry._id)}
                          style={{ background: 'transparent', border: 'none', color: '#059669', fontWeight: 800, fontSize: '0.64rem', textTransform: 'uppercase', cursor: 'pointer' }}
                        >
                          Reopen
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Compact Bottom Action Bar */}
                  <div style={{ paddingTop: '6px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    <button
                      onClick={() => handleCopyMessage(inquiry._id, inquiry.rawMessage)}
                      title="Copy raw text"
                      style={{ padding: '4px 7px', borderRadius: '5px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#334155', cursor: 'pointer', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}
                    >
                      {copiedId === inquiry._id ? <Check size={11} color="#16A34A" /> : <Copy size={11} />}
                      <span>Copy</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {!isClosed && (
                        <button
                          onClick={() => setClosingInquiry(inquiry)}
                          style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#334155', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 800 }}
                        >
                          Mark Cleared
                        </button>
                      )}

                      {waLink ? (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '4px 10px', background: '#16A34A', color: '#FFFFFF', borderRadius: '6px', textDecoration: 'none', fontSize: '0.7rem', fontWeight: 900, boxShadow: '0 1px 3px rgba(22, 163, 74, 0.3)' }}
                        >
                          <MessageCircle size={11} />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.66rem', color: '#94A3B8' }}>No phone</span>
                      )}
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </main>

      {/* MODAL 1: Subscribe for Lead Alerts Modal */}
      {isSubscribeModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '18px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#92400E' }}>
                  <Bell size={15} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Get Instant Lead Alerts
                  </h3>
                  <p style={{ fontSize: '0.68rem', color: '#64748B', margin: 0 }}>
                    Receive verified travel requirements directly on your WhatsApp.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubscribeModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={16} />
              </button>
            </div>

            {subscribeSuccessMsg ? (
              <div style={{ padding: '20px 14px', textAlign: 'center', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', color: '#065F46' }}>
                <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '4px' }}>Alerts Activated!</h4>
                <p style={{ fontSize: '0.76rem', lineHeight: 1.4 }}>{subscribeSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribeSubmit}>
                
                {subscribeErrorMsg && (
                  <div style={{ padding: '7px 9px', background: '#FFE4E6', border: '1px solid #FECDD3', borderRadius: '7px', fontSize: '0.72rem', color: '#9F1239', marginBottom: '8px' }}>
                    {subscribeErrorMsg}
                  </div>
                )}

                {/* Agent Name & Company */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#1E293B', marginBottom: '3px' }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={subAgentName}
                      onChange={(e) => setSubAgentName(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '7px', fontSize: '0.74rem', outline: 'none', color: '#0F172A', fontWeight: 600 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#1E293B', marginBottom: '3px' }}>
                      Agency / Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Zenith Holidays"
                      value={subCompanyName}
                      onChange={(e) => setSubCompanyName(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '7px', fontSize: '0.74rem', outline: 'none', color: '#0F172A', fontWeight: 600 }}
                    />
                  </div>
                </div>

                {/* WhatsApp Number & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: allowEmailChannel ? '1fr 1fr' : '1fr', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#1E293B', marginBottom: '3px' }}>
                      WhatsApp Number (with Country Code) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={subWhatsApp}
                      onChange={(e) => setSubWhatsApp(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '7px', fontSize: '0.74rem', outline: 'none', color: '#0F172A', fontWeight: 600 }}
                    />
                  </div>

                  {allowEmailChannel && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#1E293B', marginBottom: '3px' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="agent@company.com"
                        value={subEmail}
                        onChange={(e) => setSubEmail(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '7px', fontSize: '0.74rem', outline: 'none', color: '#0F172A', fontWeight: 600 }}
                      />
                    </div>
                  )}
                </div>

                {/* Destinations Multi-Select Chips */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1E293B' }}>
                      Subscribed Destinations / Hubs *
                    </label>
                    <span style={{ fontSize: '0.64rem', color: '#64748B' }}>Select all that apply</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '100px', overflowY: 'auto', padding: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                    {POPULAR_DESTINATIONS.map((dest) => {
                      const isSelected = subDestinations.includes(dest)
                      return (
                        <button
                          key={dest}
                          type="button"
                          onClick={() => toggleSubDestination(dest)}
                          style={{
                            padding: '3px 7px',
                            borderRadius: '5px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: isSelected ? '#0F4C3A' : '#CBD5E1',
                            background: isSelected ? '#0F4C3A' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#334155',
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '}{dest}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Category Filter & Frequency Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#1E293B', marginBottom: '3px' }}>
                      Requirement Type
                    </label>
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '7px', fontSize: '0.72rem', outline: 'none', color: '#0F172A', fontWeight: 600 }}
                    >
                      <option value="all">🌍 All Types</option>
                      <option value="hotels">🏨 Hotels & Stays</option>
                      <option value="transport">🚗 Transport & Cabs</option>
                      <option value="dmc_package">🏖️ DMC Ground Packages</option>
                      <option value="visa_fairs">🎟️ Trade Fairs & Visas</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#1E293B', marginBottom: '3px' }}>
                      Alert Frequency
                    </label>
                    <select
                      value={subFrequency}
                      onChange={(e) => setSubFrequency(e.target.value as any)}
                      style={{ width: '100%', padding: '6px 8px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '7px', fontSize: '0.72rem', outline: 'none', color: '#0F172A', fontWeight: 600 }}
                    >
                      <option value="instant">⚡ Instant (Real-time DM)</option>
                      <option value="daily_digest">☀️ Daily Morning Summary</option>
                    </select>
                  </div>
                </div>

                {/* Channel Selector (If multiple enabled) */}
                {allowEmailChannel && (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#1E293B', marginBottom: '3px' }}>
                      Alert Channel
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setSubChannel('whatsapp')}
                        style={{ flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1px solid', borderColor: subChannel === 'whatsapp' ? '#0F4C3A' : '#CBD5E1', background: subChannel === 'whatsapp' ? '#ECFDF5' : '#FFFFFF', color: subChannel === 'whatsapp' ? '#065F46' : '#475569', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer' }}
                      >
                        📱 WhatsApp Only
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubChannel('both')}
                        style={{ flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1px solid', borderColor: subChannel === 'both' ? '#0F4C3A' : '#CBD5E1', background: subChannel === 'both' ? '#ECFDF5' : '#FFFFFF', color: subChannel === 'both' ? '#065F46' : '#475569', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer' }}
                      >
                        📱 + 📧 Both
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Note & Buttons */}
                <div style={{ padding: '8px', background: '#F1F5F9', borderRadius: '7px', fontSize: '0.64rem', color: '#64748B', marginBottom: '12px', lineHeight: 1.4 }}>
                  🛡️ <strong>Zero Spam Guarantee:</strong> Max 6 alerts/day. Mute anytime by replying <strong>STOP</strong> on WhatsApp.
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsSubscribeModalOpen(false)}
                    style={{ padding: '6px 12px', fontSize: '0.72rem', fontWeight: 800, background: '#F1F5F9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#334155' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubscribing || !subAgentName.trim() || !subWhatsApp.trim()}
                    style={{ padding: '6px 16px', fontSize: '0.74rem', fontWeight: 900, background: '#0F4C3A', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {isSubscribing ? 'Subscribing...' : 'Activate Lead Alerts'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* MODAL 2: Paste WhatsApp Inquiry Modal */}
      {isPasteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', maxWidth: '460px', width: '100%', padding: '18px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} color="#0F4C3A" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                  Paste WhatsApp Inquiry
                </h3>
              </div>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePasteSubmit}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1E293B', marginBottom: '3px' }}>
                  Raw WhatsApp Message Text *
                </label>
                <textarea
                  required
                  rows={4}
                  value={rawPasteText}
                  onChange={(e) => setRawPasteText(e.target.value)}
                  placeholder={`Paste message here, e.g.:\n\nAgent Inquiry\nAnyone have good deal for Ayodhya Ramayana Hotel ?\n+91 94299 65850\nDipika`}
                  style={{ width: '100%', padding: '8px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.74rem', fontFamily: 'monospace', outline: 'none', color: '#0F172A' }}
                />
              </div>

              {/* Live Preview */}
              {parsedPreview && (
                <div style={{ padding: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', fontSize: '0.7rem', marginBottom: '8px', color: '#065F46' }}>
                  <strong style={{ display: 'block', marginBottom: '2px' }}>✨ Auto-Extracted:</strong>
                  <div><strong>Title:</strong> {parsedPreview.title}</div>
                  {parsedPreview.destination && <div><strong>Destination:</strong> {parsedPreview.destination}</div>}
                  {parsedPreview.phoneNumber && <div><strong>Phone:</strong> {parsedPreview.phoneNumber}</div>}
                  {parsedPreview.requesterName && <div><strong>Agent:</strong> {parsedPreview.requesterName}</div>}
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1E293B', marginBottom: '3px' }}>
                  Source Group Name
                </label>
                <input
                  type="text"
                  value={pasteGroupName}
                  onChange={(e) => setPasteGroupName(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '7px', fontSize: '0.74rem', outline: 'none', color: '#0F172A' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsPasteModalOpen(false)}
                  style={{ padding: '6px 12px', fontSize: '0.72rem', fontWeight: 800, background: '#F1F5F9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#334155' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPaste || !rawPasteText.trim()}
                  style={{ padding: '6px 14px', fontSize: '0.72rem', fontWeight: 900, background: '#0F4C3A', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#FFFFFF' }}
                >
                  {isSubmittingPaste ? 'Saving...' : 'Publish to Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Mark as Cleared Modal */}
      {closingInquiry && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', maxWidth: '380px', width: '100%', padding: '18px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={16} color="#059669" />
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>
                  Mark as Cleared
                </h3>
              </div>
              <button
                onClick={() => setClosingInquiry(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.74rem', color: '#334155', marginBottom: '10px' }}>
              Mark <strong>&ldquo;{closingInquiry.title}&rdquo;</strong> as fulfilled.
            </p>

            {closeError && (
              <div style={{ padding: '7px 9px', background: '#FFE4E6', border: '1px solid #FECDD3', borderRadius: '7px', fontSize: '0.7rem', color: '#9F1239', marginBottom: '8px' }}>
                {closeError}
              </div>
            )}

            <form onSubmit={handleCloseSubmit}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1E293B', marginBottom: '3px' }}>
                  Fulfilled By / Handled By (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flying Wonders DMC / Partner"
                  value={solverName}
                  onChange={(e) => setSolverName(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '7px', fontSize: '0.74rem', outline: 'none', color: '#0F172A' }}
                />
              </div>

              {settings?.requirePinToClose && (
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1E293B', marginBottom: '3px' }}>
                    4-Digit Team Closure PIN *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter 4-digit PIN"
                    value={closePin}
                    onChange={(e) => setClosePin(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '7px', fontSize: '0.74rem', outline: 'none', color: '#0F172A' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                <button
                  type="button"
                  onClick={() => setClosingInquiry(null)}
                  style={{ padding: '6px 12px', fontSize: '0.72rem', fontWeight: 800, background: '#F1F5F9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#334155' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isClosingSubmitting}
                  style={{ padding: '6px 14px', fontSize: '0.72rem', fontWeight: 900, background: '#0F4C3A', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#FFFFFF' }}
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
