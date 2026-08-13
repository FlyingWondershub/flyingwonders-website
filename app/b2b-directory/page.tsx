'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Globe,
  MapPin,
  MessageCircle,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  Star,
  Plus,
  Share2,
  FileDown,
  ChevronRight,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  Send,
  SlidersHorizontal,
  Layers,
  ArrowUpDown,
  Bookmark,
  QrCode,
  Users,
  Award,
  Video,
  Image as ImageIcon,
  Upload,
  Check
} from 'lucide-react'

// Region Mapping for Filter Tabs
const REGIONS: { [key: string]: string[] } = {
  'Southeast Asia': ['Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'Philippines', 'Cambodia', 'Myanmar', 'Laos'],
  'East Asia': ['Japan', 'South Korea', 'China', 'Taiwan', 'Hong Kong', 'Macau'],
  'South Asia': ['India', 'Sri Lanka', 'Nepal', 'Maldives'],
  'Middle East': ['UAE', 'Dubai', 'Saudi Arabia', 'Qatar', 'Oman'],
  'Europe': ['United Kingdom', 'France', 'Switzerland', 'Italy', 'Spain'],
  'Americas': ['USA', 'Canada', 'Mexico', 'Brazil'],
}

const CURRENCIES: { [key: string]: { symbol: string, rate: number } } = {
  SGD: { symbol: 'S$', rate: 1.0 },
  USD: { symbol: '$', rate: 0.74 },
  INR: { symbol: '₹', rate: 63.5 },
  EUR: { symbol: '€', rate: 0.69 },
  MYR: { symbol: 'RM', rate: 3.48 },
  THB: { symbol: '฿', rate: 26.2 },
  IDR: { symbol: 'Rp', rate: 11800 },
}

export default function B2BDirectoryPage() {
  // Main Data States
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Search States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [selectedDestination, setSelectedDestination] = useState<string>('all')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [selectedService, setSelectedService] = useState<string>('all')
  const [sortOption, setSortOption] = useState<'recommended' | 'newest'>('recommended')
  const [currency, setCurrency] = useState<string>('SGD')

  // Interactive Selection States
  const [rfqList, setRfqList] = useState<string[]>([])
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])
  
  // Modals & Drawers
  const [activeProfileModal, setActiveProfileModal] = useState<any | null>(null)
  const [showRfqDrawer, setShowRfqDrawer] = useState(false)
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false)
  const [qrModalProfile, setQrModalProfile] = useState<any | null>(null)

  // Peer Endorsement Form Modal
  const [endorseModalProfile, setEndorseModalProfile] = useState<any | null>(null)
  const [endorserEmail, setEndorserEmail] = useState('')
  const [endorserCompany, setEndorserCompany] = useState('')
  const [endorserName, setEndorserName] = useState('')
  const [endorseComment, setEndorseComment] = useState('')
  const [endorseSubmitting, setEndorseSubmitting] = useState(false)

  // Joint RFQ Form States
  const [rfqName, setRfqName] = useState('')
  const [rfqEmail, setRfqEmail] = useState('')
  const [rfqCompany, setRfqCompany] = useState('')
  const [rfqPhone, setRfqPhone] = useState('')
  const [rfqDestination, setRfqDestination] = useState('')
  const [rfqPax, setRfqPax] = useState('2-6 Pax')
  const [rfqDates, setRfqDates] = useState('')
  const [rfqNotes, setRfqNotes] = useState('')
  const [rfqStatus, setRfqStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  // Self-Service Profile Edit / Signup Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [otpStep, setOtpStep] = useState<'email' | 'otp' | 'form'>('email')
  const [authEmail, setAuthEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [debugOtp, setDebugOtp] = useState<string | null>(null)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  // Edit Form Fields
  const [editCompanyName, setEditCompanyName] = useState('')
  const [editTagline, setEditTagline] = useState('')
  const [editAgentName, setEditAgentName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editWhatsapp, setEditWhatsapp] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editCountry, setEditCountry] = useState('')
  const [editLogoUrl, setEditLogoUrl] = useState('')
  const [editCoverUrl, setEditCoverUrl] = useState('')
  const [editAbout, setEditAbout] = useState('')
  const [editDestinations, setEditDestinations] = useState<string>('Singapore, Malaysia')
  const [editSpecialties, setEditSpecialties] = useState<string>('Corporate MICE, FIT Travel, VIP Transfers')
  const [editServices, setEditServices] = useState<string>('Airport Meet & Greet, Fleet Transfers & Coaches, Wholesale Attraction Passes')
  const [editLanguages, setEditLanguages] = useState<string>('English, Hindi, Mandarin')
  const [editFleet, setEditFleet] = useState<string>('VIP MPV (7-Seater), 45-Seater Coach')
  const [editPayments, setEditPayments] = useState<string>('PayNow, Bank Transfer (Wire), Credit Card')
  const [editBrochureUrl, setEditBrochureUrl] = useState('')
  const [editVideoUrl, setEditVideoUrl] = useState('')
  const [editWebsite, setEditWebsite] = useState('')
  const [editPkgTitle, setEditPkgTitle] = useState('')
  const [editPkgPrice, setEditPkgPrice] = useState('')

  // Load Saved Bookmarks & Directory Data on Mount
  useEffect(() => {
    fetchDirectoryProfiles()
    if (typeof window !== 'undefined') {
      try {
        const savedBook = localStorage.getItem('fw_b2b_bookmarks')
        if (savedBook) setBookmarkedIds(JSON.parse(savedBook))
      } catch (e) {}
    }
  }, [sortOption, selectedRegion, selectedDestination, selectedSpecialty])

  const fetchDirectoryProfiles = async () => {
    setLoading(true)
    try {
      let url = `/api/b2b-directory?sort=${sortOption}`
      if (searchQuery) url += `&query=${encodeURIComponent(searchQuery)}`
      if (selectedDestination !== 'all') url += `&destination=${encodeURIComponent(selectedDestination)}`
      if (selectedSpecialty !== 'all') url += `&specialty=${encodeURIComponent(selectedSpecialty)}`
      if (selectedService !== 'all') url += `&service=${encodeURIComponent(selectedService)}`

      const res = await fetch(url)
      const data = await res.json()
      if (res.ok && data.success) {
        setProfiles(data.profiles || [])
      }
    } catch (err) {
      console.error('Failed to load catalog profiles', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter Profiles client-side when searching query or region
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      // Region Filter
      if (selectedRegion !== 'all') {
        const regionCountries = REGIONS[selectedRegion] || []
        const hasDest = Array.isArray(p.destinationsCovered) && p.destinationsCovered.some((d: string) =>
          regionCountries.some(rc => d.toLowerCase().includes(rc.toLowerCase()))
        )
        const hasCountry = regionCountries.some(rc => (p.country || '').toLowerCase().includes(rc.toLowerCase()))
        if (!hasDest && !hasCountry) return false
      }
      return true
    })
  }, [profiles, selectedRegion])

  // Toggle Bookmark
  const toggleBookmark = (profileId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setBookmarkedIds(prev => {
      const next = prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId]
      if (typeof window !== 'undefined') {
        localStorage.setItem('fw_b2b_bookmarks', JSON.stringify(next))
      }
      return next
    })
  }

  // Toggle RFQ Selection
  const toggleRfqSelection = (profileId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setRfqList(prev => prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId])
  }

  // File Upload Handler for Logo, Cover, and Brochure
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'logo' | 'cover' | 'brochure') => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingField(targetField)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/b2b-directory/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.success && data.url) {
        if (targetField === 'logo') setEditLogoUrl(data.url)
        if (targetField === 'cover') setEditCoverUrl(data.url)
        if (targetField === 'brochure') setEditBrochureUrl(data.url)
      } else {
        alert(data.error || 'File upload failed')
      }
    } catch (err) {
      alert('Error uploading file')
    } finally {
      setUploadingField(null)
    }
  }

  // Send Peer Recommendation
  const handleSubmitEndorsement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!endorseModalProfile || !endorserEmail || !endorserCompany) return
    setEndorseSubmitting(true)
    try {
      const res = await fetch('/api/b2b-directory/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: endorseModalProfile._id,
          recommenderEmail: endorserEmail,
          recommenderCompany: endorserCompany,
          recommenderName: endorserName,
          comment: endorseComment
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert('Thank you! Peer recommendation posted successfully.')
        setEndorseModalProfile(null)
        setEndorserEmail('')
        setEndorserCompany('')
        setEndorserName('')
        setEndorseComment('')
        fetchDirectoryProfiles()
      } else {
        alert(data.error || 'Failed to submit recommendation')
      }
    } catch (err) {
      alert('Network error submitting recommendation')
    } finally {
      setEndorseSubmitting(false)
    }
  }

  // Send Joint RFQ Inquiry
  const handleSendJointRfq = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rfqList.length === 0 || !rfqEmail) return
    setRfqStatus('submitting')
    try {
      const targetEmails = profiles.filter(p => rfqList.includes(p._id)).map(p => p.email).filter(Boolean)
      const res = await fetch('/api/b2b-directory/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmails,
          senderName: rfqName,
          senderEmail: rfqEmail,
          senderCompany: rfqCompany,
          senderPhone: rfqPhone,
          destination: rfqDestination,
          paxCount: rfqPax,
          travelDates: rfqDates,
          notes: rfqNotes
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setRfqStatus('success')
        alert(`Joint B2B Inquiry sent to ${targetEmails.length} DMC partners!`)
        setShowRfqDrawer(false)
        setRfqList([])
      } else {
        throw new Error(data.error || 'Failed to dispatch inquiry')
      }
    } catch (err: any) {
      setRfqStatus('error')
      alert(err.message || 'Error sending RFQ inquiry')
    }
  }

  // Self-Service OTP Login & Edit Triggers (Neutral Email Source)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authEmail) return
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, source: 'b2b-directory', isDirectory: true })
      })
      const data = await res.json()
      setOtpStep('otp')
      if (data.debugOtp) setDebugOtp(data.debugOtp)
    } catch (err) {
      setAuthError('Failed to send verification code')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, otp: otpCode })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setOtpStep('form')
        // Pre-fill if profile already exists in current list
        const existing = profiles.find(p => (p.email || '').toLowerCase() === authEmail.toLowerCase())
        if (existing) {
          setEditCompanyName(existing.companyName || '')
          setEditTagline(existing.tagline || '')
          setEditAgentName(existing.agentName || '')
          setEditPhone(existing.phone || '')
          setEditWhatsapp(existing.whatsappNumber || '')
          setEditCity(existing.city || '')
          setEditCountry(existing.country || '')
          setEditLogoUrl(existing.logoUrl || '')
          setEditCoverUrl(existing.coverImageUrl || '')
          setEditAbout(existing.aboutCompany || '')
          setEditDestinations((existing.destinationsCovered || []).join(', '))
          setEditSpecialties((existing.specialties || []).join(', '))
          setEditServices((existing.servicesMatrix || []).join(', '))
          setEditLanguages((existing.languagesSupported || []).join(', '))
          setEditFleet((existing.fleetTypes || []).join(', '))
          setEditPayments((existing.paymentMethods || []).join(', '))
          setEditBrochureUrl(existing.brochurePdfUrl || '')
          setEditVideoUrl(existing.videoUrl || '')
          setEditWebsite(existing.websiteUrl || '')
        }
      } else {
        setAuthError(data.error || 'Invalid OTP verification code')
      }
    } catch (err) {
      setAuthError('OTP Verification Failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editCompanyName || !authEmail) return
    setAuthLoading(true)
    try {
      const payload = {
        companyName: editCompanyName,
        tagline: editTagline,
        agentName: editAgentName,
        email: authEmail,
        phone: editPhone,
        whatsappNumber: editWhatsapp || editPhone,
        city: editCity,
        country: editCountry,
        logoUrl: editLogoUrl,
        coverImageUrl: editCoverUrl,
        aboutCompany: editAbout,
        destinationsCovered: editDestinations.split(',').map(s => s.trim()).filter(Boolean),
        specialties: editSpecialties.split(',').map(s => s.trim()).filter(Boolean),
        servicesMatrix: editServices.split(',').map(s => s.trim()).filter(Boolean),
        languagesSupported: editLanguages.split(',').map(s => s.trim()).filter(Boolean),
        fleetTypes: editFleet.split(',').map(s => s.trim()).filter(Boolean),
        paymentMethods: editPayments.split(',').map(s => s.trim()).filter(Boolean),
        brochurePdfUrl: editBrochureUrl,
        videoUrl: editVideoUrl,
        websiteUrl: editWebsite,
        packageHighlights: editPkgTitle ? [{ title: editPkgTitle, duration: '3N/4D', startingPrice: Number(editPkgPrice) || 250 }] : []
      }

      const res = await fetch('/api/b2b-directory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert(data.message || 'Profile published successfully!')
        setShowEditModal(false)
        fetchDirectoryProfiles()
      } else {
        alert(data.error || 'Failed to publish profile')
      }
    } catch (err) {
      alert('Error saving catalog profile')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleDeleteProfile = async () => {
    if (!confirm('Are you sure you want to permanently remove your B2B Directory showcase profile?')) return
    setAuthLoading(true)
    try {
      const res = await fetch(`/api/b2b-directory?email=${encodeURIComponent(authEmail)}`, { method: 'DELETE' })
      if (res.ok) {
        alert('Profile removed from catalog.')
        setShowEditModal(false)
        fetchDirectoryProfiles()
      }
    } catch (err) {}
    setAuthLoading(false)
  }

  // Format Currency Helper
  const formatPrice = (sgdAmount: number) => {
    const curr = CURRENCIES[currency] || CURRENCIES.SGD
    const val = Math.round(sgdAmount * curr.rate)
    return `${curr.symbol}${val.toLocaleString()}`
  }

  // Generate vCard download file
  const downloadVCard = (p: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const vcardData = `BEGIN:VCARD\nVERSION:3.0\nN:${p.agentName || p.companyName};;;;\nFN:${p.agentName || p.companyName}\nORG:${p.companyName}\nTITLE:B2B Travel Partner\nTEL;TYPE=CELL,VOICE:${p.phone || ''}\nEMAIL;TYPE=PREF,INTERNET:${p.email || ''}\nURL:${p.websiteUrl || ''}\nNOTE:${p.tagline || ''}\nEND:VCARD`
    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${(p.companyName || 'B2B-Partner').replace(/\s+/g, '_')}.vcf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B', paddingBottom: '6rem' }}>
      
      {/* ══ HERO & BRAND HEADER BAR ══ */}
      <section style={{ background: 'linear-gradient(135deg, #0F4C3A 0%, #1E1B4B 50%, #312E81 100%)', color: '#FFF', padding: '4.5rem 1.5rem 6rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                🌐 Global B2B DMC Directory
              </span>
              <span style={{ background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)', color: '#FFF', padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800 }}>
                100% Open & Self-Service
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Currency Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Globe size={15} color="#F59E0B" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Currency:</span>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  style={{ background: 'transparent', color: '#FFF', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
                >
                  {Object.keys(CURRENCIES).map(curr => (
                    <option key={curr} value={curr} style={{ color: '#000' }}>{curr} ({CURRENCIES[curr].symbol})</option>
                  ))}
                </select>
              </div>

              {/* Bookmark Shortlist Drawer Toggle */}
              {bookmarkedIds.length > 0 && (
                <button
                  onClick={() => setShowBookmarksDrawer(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(217, 119, 6, 0.25)', border: '1px solid #F59E0B', color: '#FEF3C7', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <Bookmark size={15} fill="#F59E0B" color="#F59E0B" />
                  <span>Saved Shortlist ({bookmarkedIds.length})</span>
                </button>
              )}

              {/* Add / Manage My Company Profile */}
              <button
                onClick={() => { setShowEditModal(true); setOtpStep('email'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFF', padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
              >
                <Plus size={18} />
                <span>Add / Edit My Company Profile</span>
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.75rem', fontWeight: 900, lineHeight: 1.2, margin: '0 0 1rem', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              Discover Verified Global DMCs & Travel Partners
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#E2E8F0', margin: '0 0 2.25rem', lineHeight: 1.6, opacity: 0.9 }}>
              Connect directly with verified local ground handlers, wholesale attraction suppliers, and transport providers across 70+ countries. Zero middleman fees.
            </p>

            {/* 🔍 SEARCH & FILTER BAR */}
            <div style={{ background: '#FFF', padding: '10px', borderRadius: '14px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', gap: '10px', background: '#F1F5F9', padding: '0 14px', borderRadius: '10px' }}>
                <Search size={18} color="#64748B" />
                <input
                  type="text"
                  placeholder="Search by Company Name, City, or Country..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', padding: '12px 0', outline: 'none', fontSize: '0.92rem', color: '#0F172A', fontWeight: 600 }}
                />
              </div>

              <select
                value={selectedDestination}
                onChange={e => setSelectedDestination(e.target.value)}
                style={{ background: '#F1F5F9', border: 'none', padding: '0 14px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700, color: '#334155', cursor: 'pointer', outline: 'none' }}
              >
                <option value="all">🌍 All Destinations</option>
                <option value="Singapore">Singapore</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Thailand">Thailand</option>
                <option value="Indonesia">Indonesia / Bali</option>
                <option value="Japan">Japan</option>
                <option value="India">India</option>
                <option value="UAE">UAE / Dubai</option>
              </select>

              <select
                value={selectedSpecialty}
                onChange={e => setSelectedSpecialty(e.target.value)}
                style={{ background: '#F1F5F9', border: 'none', padding: '0 14px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700, color: '#334155', cursor: 'pointer', outline: 'none' }}
              >
                <option value="all">💼 All Specialties</option>
                <option value="Corporate MICE">Corporate MICE</option>
                <option value="FIT Travel">FIT Travel</option>
                <option value="VIP Transfers">VIP Transfers</option>
                <option value="Overland Tours">Overland Tours</option>
                <option value="Luxury Escapes">Luxury Escapes</option>
              </select>

              <button
                onClick={fetchDirectoryProfiles}
                style={{ background: 'linear-gradient(135deg, #0F4C3A 0%, #059669 100%)', color: '#FFF', border: 'none', padding: '0 1.5rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Search Catalog
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ INTERACTIVE REGION FILTER TABS ══ */}
      <div style={{ maxWidth: '1240px', margin: '-2rem auto 2.5rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ background: '#FFF', padding: '0.75rem', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', display: 'flex', gap: '8px', overflowX: 'auto', border: '1px solid #E2E8F0' }}>
          <button
            onClick={() => setSelectedRegion('all')}
            style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: selectedRegion === 'all' ? '#0F4C3A' : 'transparent', color: selectedRegion === 'all' ? '#FFF' : '#475569', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            All Regions ({profiles.length})
          </button>

          {Object.keys(REGIONS).map(reg => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: selectedRegion === reg ? '#0F4C3A' : 'transparent', color: selectedRegion === reg ? '#FFF' : '#475569', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* ══ SORT & QUICK ACTIONS TOOLBAR ══ */}
      <div style={{ maxWidth: '1240px', margin: '0 auto 2rem', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155' }}>
            Showing <strong>{filteredProfiles.length}</strong> Partner Profiles
          </span>
          {rfqList.length > 0 && (
            <button
              onClick={() => setShowRfqDrawer(true)}
              style={{ background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={14} /> Joint RFQ ({rfqList.length})
            </button>
          )}
        </div>

        {/* Sort Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpDown size={15} color="#64748B" />
          <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>Sort By:</span>
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value as any)}
            style={{ background: '#FFF', border: '1px solid #CBD5E1', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}
          >
            <option value="recommended">Most Recommended (⭐ Peer Endorsed)</option>
            <option value="newest">Recently Listed</option>
          </select>
        </div>
      </div>

      {/* ══ CATALOG CARDS GRID ══ */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <Sparkles className="animate-spin" size={32} color="#0F4C3A" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 700, color: '#64748B' }}>Loading B2B Partner Catalog...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <Building2 size={48} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>No B2B Partners Found</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>Try clearing filters or be the first partner to register in this region!</p>
            <button
              onClick={() => { setShowEditModal(true); setOtpStep('email'); }}
              style={{ background: '#0F4C3A', color: '#FFF', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
            >
              ➕ Create Free Listing
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.75rem' }}>
            {filteredProfiles.map(p => {
              const isBookmarked = bookmarkedIds.includes(p._id)
              const isRfqSelected = rfqList.includes(p._id)
              const recCount = (p.recommendations || []).length

              return (
                <div
                  key={p._id}
                  onClick={() => setActiveProfileModal(p)}
                  style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', display: 'flex', flexDirection: 'column' }}
                >
                  {/* Banner / Cover Header */}
                  <div style={{ height: '120px', background: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${p.coverImageUrl || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', padding: '12px' }}>
                    
                    {/* Top Right Action Badges */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={e => toggleBookmark(p._id, e)}
                        style={{ background: 'rgba(255,255,255,0.9)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Bookmark partner"
                      >
                        <Bookmark size={15} fill={isBookmarked ? '#D97706' : 'none'} color={isBookmarked ? '#D97706' : '#475569'} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setQrModalProfile(p); }}
                        style={{ background: 'rgba(255,255,255,0.9)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Generate QR Code"
                      >
                        <QrCode size={15} color="#475569" />
                      </button>
                    </div>

                    {/* Logo Avatar Overlay */}
                    <div style={{ position: 'absolute', bottom: '-24px', left: '16px', width: '64px', height: '64px', borderRadius: '14px', border: '3px solid #FFF', background: '#FFF', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                      <img src={p.logoUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150'} alt={p.companyName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '2rem 1.25rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                          {p.companyName}
                        </h3>
                      </div>
                      {p.tagline && (
                        <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0', fontWeight: 600 }}>
                          {p.tagline}
                        </p>
                      )}
                    </div>

                    {/* Location & Response Speed */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: '#475569', marginBottom: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                        <MapPin size={13} color="#0F4C3A" /> {p.city ? `${p.city}, ` : ''}{p.country || 'Global'}
                      </span>
                      {p.leadTimeNotice && (
                        <span style={{ background: '#DCFCE7', color: '#166534', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem' }}>
                          🟢 {p.leadTimeNotice}
                        </span>
                      )}
                    </div>

                    {/* Destinations Covered Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1rem' }}>
                      {(p.destinationsCovered || []).slice(0, 4).map((d: string, idx: number) => (
                        <span key={idx} style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.73rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                          📍 {d}
                        </span>
                      ))}
                      {(p.destinationsCovered || []).length > 4 && (
                        <span style={{ background: '#F1F5F9', color: '#64748B', fontSize: '0.73rem', fontWeight: 700, padding: '2px 6px', borderRadius: '6px' }}>
                          +{(p.destinationsCovered || []).length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Package Highlight Preview if present */}
                    {Array.isArray(p.packageHighlights) && p.packageHighlights.length > 0 && (
                      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.6rem 0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', display: 'block', letterSpacing: '0.05em' }}>Starting B2B Rate</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400E' }}>{p.packageHighlights[0].title}</span>
                          <strong style={{ fontSize: '0.9rem', color: '#0F4C3A', fontWeight: 900 }}>{formatPrice(p.packageHighlights[0].startingPrice || 250)}</strong>
                        </div>
                      </div>
                    )}

                    {/* Social Proof Bar (Peer Recommendations & RFQ) */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed #E2E8F0', paddingTop: '0.75rem', marginTop: 'auto' }}>
                      <span style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={13} fill="#D97706" /> {recCount} Peer Endorsed
                      </span>

                      <button
                        onClick={e => toggleRfqSelection(p._id, e)}
                        style={{ background: isRfqSelected ? '#FEF3C7' : '#F1F5F9', color: isRfqSelected ? '#92400E' : '#475569', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {isRfqSelected ? '✓ Selected for RFQ' : '+ Joint RFQ'}
                      </button>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div style={{ background: '#F8FAFC', padding: '0.75rem 1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '8px' }}>
                    <a
                      href={`https://api.whatsapp.com/send?phone=${p.whatsappNumber || p.phone}&text=${encodeURIComponent(`Hi ${p.companyName}, I found your B2B profile on the DMC Directory and would like to inquire about B2B rates for ${p.destinationsCovered?.[0] || 'your destination'}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ flex: 1, background: '#25D366', color: '#FFF', textAlign: 'center', padding: '0.5rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                    <button
                      onClick={e => downloadVCard(p, e)}
                      style={{ background: '#FFF', border: '1px solid #CBD5E1', color: '#475569', padding: '0.5rem 0.75rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                      title="Download contact vCard"
                    >
                      <FileDown size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ══ PROFILE DETAIL FLOATING MODAL ══ */}
      {activeProfileModal && (
        <div
          onClick={() => setActiveProfileModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '840px',
              maxWidth: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E2E8F0',
              padding: 0
            }}
          >
            {/* Modal Cover Header */}
            <div style={{ height: '200px', background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${activeProfileModal.coverImageUrl || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1000'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', padding: '1.5rem', color: '#FFF' }}>
              <button
                onClick={() => setActiveProfileModal(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#FFF', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>

              <div style={{ position: 'absolute', bottom: '16px', left: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={activeProfileModal.logoUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150'} alt="" style={{ width: '72px', height: '72px', borderRadius: '16px', border: '3px solid #FFF', objectFit: 'cover' }} />
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: '#FFFFFF' }}>{activeProfileModal.companyName}</h2>
                  <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '0.9rem', color: '#F1F5F9' }}>{activeProfileModal.tagline || activeProfileModal.city}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem', backgroundColor: '#FFFFFF', color: '#0F172A' }}>
              
              {/* Quick Actions Bar */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.25rem' }}>
                <a
                  href={`https://api.whatsapp.com/send?phone=${activeProfileModal.whatsappNumber || activeProfileModal.phone}&text=${encodeURIComponent(`Hi ${activeProfileModal.companyName}, I would like to request B2B partner rates.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: '#25D366', color: '#FFF', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <MessageCircle size={16} /> WhatsApp Partner
                </a>
                
                {activeProfileModal.brochurePdfUrl && (
                  <a
                    href={activeProfileModal.brochurePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#3B82F6', color: '#FFF', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <FileDown size={16} /> Download B2B Tariff PDF
                  </a>
                )}

                <button
                  onClick={() => setEndorseModalProfile(activeProfileModal)}
                  style={{ background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Star size={16} fill="#92400E" /> Endorse / Recommend
                </button>
              </div>

              {/* Company Bio */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>About Company & Operational Expertise</h4>
                <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {activeProfileModal.aboutCompany || 'No detailed biography provided yet.'}
                </p>
              </div>

              {/* Operational Matrices Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <h5 style={{ margin: '0 0 0.75rem', color: '#0F4C3A', fontWeight: 800, fontSize: '0.9rem' }}>📍 Destinations Covered</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(activeProfileModal.destinationsCovered || []).map((d: string, i: number) => (
                      <span key={i} style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>{d}</span>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <h5 style={{ margin: '0 0 0.75rem', color: '#0F4C3A', fontWeight: 800, fontSize: '0.9rem' }}>💼 Services Provided</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(activeProfileModal.servicesMatrix || []).map((s: string, i: number) => (
                      <span key={i} style={{ background: '#ECFDF5', color: '#047857', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>✓ {s}</span>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <h5 style={{ margin: '0 0 0.75rem', color: '#0F4C3A', fontWeight: 800, fontSize: '0.9rem' }}>🚌 Transport & Languages</h5>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 4px' }}><strong>Fleet:</strong> {(activeProfileModal.fleetTypes || []).join(', ') || 'Custom Fleet'}</p>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0 }}><strong>Languages:</strong> {(activeProfileModal.languagesSupported || []).join(', ') || 'English'}</p>
                </div>
              </div>

              {/* Peer Endorsements Section */}
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
                  ⭐ Peer Endorsements ({(activeProfileModal.recommendations || []).length})
                </h4>
                {(!activeProfileModal.recommendations || activeProfileModal.recommendations.length === 0) ? (
                  <p style={{ fontSize: '0.88rem', color: '#64748B', fontStyle: 'italic' }}>No peer recommendations posted yet. Be the first partner to endorse this agency!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {activeProfileModal.recommendations.map((rec: any, idx: number) => (
                      <div key={idx} style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '1rem', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '0.9rem', color: '#92400E' }}>{rec.recommenderCompany} ({rec.recommenderName || 'Agent'})</strong>
                          <span style={{ fontSize: '0.75rem', color: '#B45309' }}>{rec.createdAt}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#78350F' }}>"{rec.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ ENDORSEMENT FORM FLOATING MODAL ══ */}
      {endorseModalProfile && (
        <div
          onClick={() => setEndorseModalProfile(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '500px',
              maxWidth: '92vw',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E2E8F0'
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>⭐ Endorse {endorseModalProfile.companyName}</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.25rem' }}>Post a verified peer recommendation for this travel partner.</p>
            <form onSubmit={handleSubmitEndorsement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Your Agency Name *" required value={endorserCompany} onChange={e => setEndorserCompany(e.target.value)} style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', backgroundColor: '#FFF', color: '#0F172A' }} />
              <input type="text" placeholder="Your Name *" required value={endorserName} onChange={e => setEndorserName(e.target.value)} style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', backgroundColor: '#FFF', color: '#0F172A' }} />
              <input type="email" placeholder="Your Work Email *" required value={endorserEmail} onChange={e => setEndorserEmail(e.target.value)} style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', backgroundColor: '#FFF', color: '#0F172A' }} />
              <textarea placeholder="Recommendation Note (e.g. Great ground handling and reliable pickups)" rows={3} value={endorseComment} onChange={e => setEndorseComment(e.target.value)} style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', backgroundColor: '#FFF', color: '#0F172A' }} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEndorseModalProfile(null)} style={{ flex: 1, padding: '0.75rem', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={endorseSubmitting} style={{ flex: 2, padding: '0.75rem', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                  {endorseSubmitting ? 'Posting...' : 'Post Recommendation ⭐'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ JOINT B2B RFQ FLOATING DRAWER ══ */}
      {showRfqDrawer && (
        <div
          onClick={() => setShowRfqDrawer(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '600px',
              maxWidth: '95vw',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E2E8F0'
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: 900, color: '#0F172A' }}>📩 Joint B2B Request for Quote</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.25rem' }}>
              Broadcast your inquiry to the <strong>{rfqList.length} selected partner agency(ies)</strong>.
            </p>
            <form onSubmit={handleSendJointRfq} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input type="text" placeholder="Your Agency Name *" required value={rfqCompany} onChange={e => setRfqCompany(e.target.value)} style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                <input type="text" placeholder="Your Name *" required value={rfqName} onChange={e => setRfqName(e.target.value)} style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', backgroundColor: '#FFF', color: '#0F172A' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input type="email" placeholder="Your Work Email *" required value={rfqEmail} onChange={e => setRfqEmail(e.target.value)} style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                <input type="tel" placeholder="WhatsApp Number *" required value={rfqPhone} onChange={e => setRfqPhone(e.target.value)} style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', backgroundColor: '#FFF', color: '#0F172A' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input type="text" placeholder="Target Destination *" required value={rfqDestination} onChange={e => setRfqDestination(e.target.value)} style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                <input type="text" placeholder="Estimated Pax (e.g. 15 Pax)" value={rfqPax} onChange={e => setRfqPax(e.target.value)} style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', backgroundColor: '#FFF', color: '#0F172A' }} />
              </div>
              <textarea placeholder="Inquiry Details / Dates / Special Requirements" rows={3} value={rfqNotes} onChange={e => setRfqNotes(e.target.value)} style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', backgroundColor: '#FFF', color: '#0F172A' }} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowRfqDrawer(false)} style={{ flex: 1, padding: '0.75rem', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={rfqStatus === 'submitting'} style={{ flex: 2, padding: '0.75rem', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                  {rfqStatus === 'submitting' ? 'Broadcasting...' : 'Broadcast RFQ Inquiry 📩'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ SAVED BOOKMARKS DRAWER ══ */}
      {showBookmarksDrawer && (
        <div
          onClick={() => setShowBookmarksDrawer(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '600px',
              maxWidth: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '2rem',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E2E8F0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#D97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bookmark size={20} fill="#D97706" /> Saved Partner Shortlist ({bookmarkedIds.length})
              </h3>
              <button onClick={() => setShowBookmarksDrawer(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {profiles.filter(p => bookmarkedIds.includes(p._id)).map(p => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <h4 style={{ margin: '0 0 2px', fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{p.companyName}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>📍 {p.city}, {p.country}</p>
                  </div>
                  <button
                    onClick={() => setActiveProfileModal(p)}
                    style={{ background: '#0F4C3A', color: '#FFF', border: 'none', padding: '0.45rem 1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    View Partner
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ PROFILE OTP EDIT / SIGNUP FLOATING MODAL ══ */}
      {showEditModal && (
        <div
          onClick={() => setShowEditModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '640px',
              maxWidth: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '2rem',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E2E8F0'
            }}
          >
            {/* Top Close Button (✕) */}
            <button
              onClick={() => setShowEditModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F1F5F9',
                border: 'none',
                color: '#475569',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close window without saving"
            >
              <X size={18} />
            </button>

            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem', fontWeight: 900, color: '#0F4C3A' }}>
              💼 Manage My Company Showcase Profile
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0 0 1.5rem' }}>
              100% open self-service. Verify your work email via OTP to create or edit your listing instantly.
            </p>

            {authError && (
              <div style={{ background: '#FFF5F5', color: '#C53030', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.25rem', borderLeft: '4px solid #C53030' }}>
                ⚠️ {authError}
              </div>
            )}

            {otpStep === 'email' && (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>Enter Work Email Address *</label>
                  <input type="email" required placeholder="e.g. agent@travelagency.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Cancel / Close</button>
                  <button type="submit" disabled={authLoading} style={{ flex: 2, padding: '0.75rem', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                    {authLoading ? 'Sending OTP...' : 'Send Verification OTP Code ✉️'}
                  </button>
                </div>
              </form>
            )}

            {otpStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.88rem', color: '#166534', fontWeight: 700 }}>✓ Code sent to: {authEmail}</p>
                {debugOtp && <div style={{ background: '#FEFCBF', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: '#744210' }}>Sandbox Code: <strong>{debugOtp}</strong></div>}
                <input type="text" required placeholder="123456" maxLength={6} value={otpCode} onChange={e => setOtpCode(e.target.value)} style={{ padding: '0.85rem', borderRadius: '8px', border: '2px solid #D97706', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.3em', fontWeight: 800, backgroundColor: '#FFF', color: '#0F172A' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Cancel / Close</button>
                  <button type="submit" disabled={authLoading} style={{ flex: 2, padding: '0.75rem', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                    {authLoading ? 'Verifying...' : 'Verify OTP & Open Profile Editor 🔓'}
                  </button>
                </div>
              </form>
            )}

            {otpStep === 'form' && (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Company Name *</label>
                    <input type="text" required value={editCompanyName} onChange={e => setEditCompanyName(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Contact Person Name</label>
                    <input type="text" value={editAgentName} onChange={e => setEditAgentName(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Tagline / Slogan</label>
                  <input type="text" placeholder="e.g. Premier Singapore B2B Ground Handler" value={editTagline} onChange={e => setEditTagline(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>City</label>
                    <input type="text" value={editCity} onChange={e => setEditCity(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Country</label>
                    <input type="text" value={editCountry} onChange={e => setEditCountry(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>WhatsApp Number</label>
                    <input type="tel" value={editWhatsapp} onChange={e => setEditWhatsapp(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>About Company & Operational Bio</label>
                  <textarea rows={3} value={editAbout} onChange={e => setEditAbout(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Destinations Covered (comma separated)</label>
                    <input type="text" value={editDestinations} onChange={e => setEditDestinations(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Specialties (comma separated)</label>
                    <input type="text" value={editSpecialties} onChange={e => setEditSpecialties(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                </div>

                {/* File Upload / Link Inputs */}
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#0F4C3A' }}>📷 Media & Brochure Uploads (File Upload or URL)</h5>

                  {/* Logo Upload / URL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Company Logo (Upload File or Paste Image URL)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder="https://..." value={editLogoUrl} onChange={e => setEditLogoUrl(e.target.value)} style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                      <label style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '0.65rem 1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                        <Upload size={14} /> {uploadingField === 'logo' ? 'Uploading...' : 'Upload Logo'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'logo')} />
                      </label>
                    </div>
                  </div>

                  {/* Cover Image Upload / URL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>Banner / Cover Image (Upload File or Paste Image URL)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder="https://..." value={editCoverUrl} onChange={e => setEditCoverUrl(e.target.value)} style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                      <label style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '0.65rem 1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                        <Upload size={14} /> {uploadingField === 'cover' ? 'Uploading...' : 'Upload Banner'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'cover')} />
                      </label>
                    </div>
                  </div>

                  {/* PDF Tariff Upload / URL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>B2B Tariff PDF Document (Upload PDF or Paste Link)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder="https://..." value={editBrochureUrl} onChange={e => setEditBrochureUrl(e.target.value)} style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                      <label style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '0.65rem 1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                        <Upload size={14} /> {uploadingField === 'brochure' ? 'Uploading...' : 'Upload Tariff PDF'}
                        <input type="file" accept="application/pdf,image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'brochure')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={handleDeleteProfile} style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Delete Profile</button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => setShowEditModal(false)} style={{ background: '#F1F5F9', color: '#475569', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Close Without Saving</button>
                    <button type="submit" disabled={authLoading} style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFF', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                      {authLoading ? 'Publishing...' : 'Publish Profile Live 🚀'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══ QR CODE GENERATOR FLOATING MODAL ══ */}
      {qrModalProfile && (
        <div
          onClick={() => setQrModalProfile(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '380px',
              maxWidth: '92vw',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '2rem',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E2E8F0'
            }}
          >
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>{qrModalProfile.companyName}</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.5rem' }}>Scan or share QR Code to view B2B showcase profile.</p>
            <div style={{ background: '#FFF', padding: '1rem', borderRadius: '16px', border: '2px solid #E2E8F0', display: 'inline-block', marginBottom: '1.5rem' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/b2b-directory` : 'https://flyingwonders.net/b2b-directory')}`} alt="Profile QR Code" style={{ width: '200px', height: '200px' }} />
            </div>
            <button onClick={() => setQrModalProfile(null)} style={{ width: '100%', padding: '0.75rem', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>Close QR Viewer</button>
          </div>
        </div>
      )}

    </div>
  )
}
