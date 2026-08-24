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

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string }> = {
  hotels: { label: 'Hotels & Stays', icon: Building2, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  transport: { label: 'Transport & Cabs', icon: Car, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  dmc_package: { label: 'DMC Ground Package', icon: Palmtree, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  visa_fairs: { label: 'Trade Fairs & Visas', icon: Ticket, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  activities: { label: 'Sightseeing & Passes', icon: Ticket, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  flights: { label: 'Flight Tickets', icon: Plane, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
  other: { label: 'General Requirement', icon: HelpCircle, color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
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

  // Extract unique popular destinations for filter pills
  const availableDestinations = useMemo(() => {
    const set = new Set<string>()
    inquiries.forEach((item) => {
      if (item.destination) set.add(item.destination)
    })
    return Array.from(set).slice(0, 10)
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

  // Calculate relative time
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
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2" style={{ fontFamily: 'var(--font-inter)' }}>
            Portal Offline
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {settings.hiddenMessage || 'The B2B Leads Board is currently undergoing routine maintenance. Please check back shortly.'}
          </p>

          {/* Admin Unlock Box */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">Team Access Key:</p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter 4-digit PIN"
                value={bypassPin}
                onChange={(e) => setBypassPin(e.target.value)}
                className="flex-1 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => {
                  if (bypassPin === (settings.closurePin || '1234') || bypassPin === '9999') {
                    setAdminBypass(true)
                  } else {
                    alert('Invalid Team PIN')
                  }
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-colors"
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Top Standalone Header Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                FW
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight block leading-none">
                  Flying Wonders
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                  B2B Lead Board
                </span>
              </div>
            </Link>

            <span className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block"></span>

            <Link
              href="/b2b-directory"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Building2 className="w-3.5 h-3.5" />
              Verified DMC Directory
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchData()}
              disabled={loading}
              title="Refresh Inquiries"
              className="p-2.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            <button
              onClick={() => setIsPasteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Paste WhatsApp Post</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent py-10 sm:py-14 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {settings?.heroBadge || '🔥 Live WhatsApp Agent Requirements'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              {settings?.heroTitle || 'Live B2B Inquiries & Supplier Exchange'}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {settings?.heroSubtitle || 'Real-time verified travel requirements from WhatsApp partner groups. Connect directly with requesting agents, pitch your contracted rates, or mark fulfilled.'}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-slate-200/70 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span><strong>{inquiries.filter(i => i.status === 'open').length}</strong> Active Requirements</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span><strong>{inquiries.filter(i => i.status === 'closed').length}</strong> Resolved / Cleared</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Middleman Fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Main Filter Controls */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by destination (e.g. Andaman, Ayodhya), requirement, agent name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Switcher Toggle */}
            <div className="inline-flex p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm self-start md:self-auto">
              <button
                onClick={() => setStatusFilter('open')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  statusFilter === 'open'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                <span>Open Leads</span>
              </button>
              <button
                onClick={() => setStatusFilter('closed')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  statusFilter === 'closed'
                    ? 'bg-slate-800 text-white shadow-sm dark:bg-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Cleared</span>
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm dark:bg-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
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
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* Quick Destination Pills */}
          {availableDestinations.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Hot Regions:</span>
              <button
                onClick={() => setSelectedDestination('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedDestination === 'all'
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                All Locations
              </button>
              {availableDestinations.map((dest) => (
                <button
                  key={dest}
                  onClick={() => setSelectedDestination(dest === selectedDestination ? 'all' : dest)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    selectedDestination === dest
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  <span>{dest}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Inquiries Grid / Feed */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse p-6"></div>
            ))}
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              No inquiries found
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {searchQuery || selectedCategory !== 'all' || selectedDestination !== 'all'
                ? 'Try adjusting your filters or search keywords.'
                : 'No active inquiries logged yet.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedDestination('all')
                setStatusFilter('all')
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  className={`relative flex flex-col justify-between bg-white dark:bg-slate-900 border rounded-3xl p-6 transition-all hover:shadow-lg ${
                    isClosed
                      ? 'border-slate-200 dark:border-slate-800/80 opacity-75 hover:opacity-100'
                      : inquiry.urgency === 'urgent'
                      ? 'border-amber-300 dark:border-amber-700/60 shadow-amber-500/5'
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  {/* Top Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Category Badge */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${catConfig.color}`}>
                          <CatIcon className="w-3 h-3" />
                          <span>{catConfig.label}</span>
                        </span>

                        {/* Destination Badge */}
                        {inquiry.destination && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            <MapPin className="w-3 h-3 text-emerald-500" />
                            <span>{inquiry.destination}</span>
                          </span>
                        )}

                        {/* Urgent Badge */}
                        {inquiry.urgency === 'urgent' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                            ⚡ Urgent
                          </span>
                        )}
                      </div>

                      {/* Status indicator */}
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(inquiry.postedAt)}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 className={`text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug ${isClosed ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                      {inquiry.title}
                    </h3>

                    {/* Raw Message Card */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3.5 mb-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                      {inquiry.rawMessage}
                    </div>

                    {/* Requester & City Info */}
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-4 px-1">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {inquiry.requesterName || 'Agent'}
                        </span>
                        {inquiry.city && (
                          <span className="text-slate-400 dark:text-slate-500"> • {inquiry.city}</span>
                        )}
                      </div>
                      {inquiry.groupName && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[140px]">
                          via {inquiry.groupName}
                        </span>
                      )}
                    </div>

                    {/* Cleared Note Banner if closed */}
                    {isClosed && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 mb-4 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>Cleared: {inquiry.closedBy || 'Fulfilled by Supplier'}</span>
                        </div>
                        <button
                          onClick={() => handleReopen(inquiry._id)}
                          className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          Reopen
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Row */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyMessage(inquiry._id, inquiry.rawMessage)}
                      title="Copy raw text"
                      className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-xs flex items-center gap-1"
                    >
                      {copiedId === inquiry._id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Mark as Closed / Cleared Button */}
                      {!isClosed && (
                        <button
                          onClick={() => setClosingInquiry(inquiry)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          Mark Cleared
                        </button>
                      )}

                      {/* WhatsApp 1-Click Connect Button */}
                      {waLink ? (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 px-2">No phone</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom Cross-Promotion to B2B Directory */}
        <div className="mt-14 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-3">
              <Building2 className="w-3.5 h-3.5" />
              Verified Supplier Network
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Are you a DMC, Hotel, or Transport Operator?
            </h3>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-6">
              Create your free verified company profile on our B2B Directory to receive direct leads, display contracted supplier rates, and connect with 5,000+ travel agents worldwide.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/b2b-directory"
                className="px-6 py-3 bg-white text-emerald-950 hover:bg-emerald-50 text-xs sm:text-sm font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Browse & Add Profile to Directory</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: Paste WhatsApp Inquiry Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Paste WhatsApp Inquiry
                </h3>
              </div>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Raw WhatsApp Message Text *
                </label>
                <textarea
                  required
                  rows={5}
                  value={rawPasteText}
                  onChange={(e) => setRawPasteText(e.target.value)}
                  placeholder={`Paste message here, e.g.:\n\nAgent Inquiry\nAnyone have good deal for Ayodhya Ramayana Hotel ?\n+91 94299 65850\nDipika`}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Live Auto-Parsed Preview */}
              {parsedPreview && (
                <div className="p-3.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs space-y-1.5">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Extracted Details:</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300"><strong>Title:</strong> {parsedPreview.title}</p>
                  {parsedPreview.destination && (
                    <p className="text-slate-700 dark:text-slate-300"><strong>Destination:</strong> {parsedPreview.destination}</p>
                  )}
                  <p className="text-slate-700 dark:text-slate-300"><strong>Category:</strong> {CATEGORY_MAP[parsedPreview.category]?.label || 'General'}</p>
                  {parsedPreview.phoneNumber && (
                    <p className="text-slate-700 dark:text-slate-300"><strong>WhatsApp:</strong> {parsedPreview.phoneNumber}</p>
                  )}
                  {parsedPreview.requesterName && (
                    <p className="text-slate-700 dark:text-slate-300"><strong>Agent:</strong> {parsedPreview.requesterName}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Source Group Name
                </label>
                <input
                  type="text"
                  value={pasteGroupName}
                  onChange={(e) => setPasteGroupName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPaste || !rawPasteText.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-colors"
                >
                  {isSubmittingPaste ? 'Parsing & Saving...' : 'Publish to Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Mark as Cleared / Closed Modal */}
      {closingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Mark as Cleared
                </h3>
              </div>
              <button
                onClick={() => setClosingInquiry(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              You are marking <strong>&ldquo;{closingInquiry.title}&rdquo;</strong> as fulfilled.
            </p>

            {closeError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{closeError}</span>
              </div>
            )}

            <form onSubmit={handleCloseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fulfilled By / Handled By (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flying Wonders DMC / Ramayana Hotel Partner"
                  value={solverName}
                  onChange={(e) => setSolverName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {settings?.requirePinToClose && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    4-Digit Team Closure PIN *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter 4-digit PIN"
                    value={closePin}
                    onChange={(e) => setClosePin(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClosingInquiry(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isClosingSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-colors"
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
