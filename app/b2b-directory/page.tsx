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
  Plus,
  Share2,
  FileDown,
  ChevronRight,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
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
  Check,
  Briefcase,
  Copy,
  Contact2
} from 'lucide-react'
import { client } from '../../sanity/lib/client'

// Region Mapping for Filter Tabs
const REGIONS: { [key: string]: string[] } = {
  'Southeast Asia': ['Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'Philippines', 'Cambodia', 'Myanmar', 'Laos'],
  'East Asia': ['Japan', 'South Korea', 'China', 'Taiwan', 'Hong Kong', 'Macau'],
  'South Asia': ['India', 'Sri Lanka', 'Nepal', 'Maldives'],
  'Middle East': ['UAE', 'Dubai', 'Saudi Arabia', 'Qatar', 'Oman'],
  'Europe': ['United Kingdom', 'France', 'Switzerland', 'Italy', 'Spain'],
  'Americas': ['USA', 'Canada', 'Mexico', 'Brazil'],
}

export default function B2BDirectoryPage() {
  // Customizable Settings from Sanity
  const [settings, setSettings] = useState({
    heroBadgeText: '🌐 Global B2B DMC Directory',
    heroBadgeSubtext: '100% Open & Self-Service',
    heroTitle: 'Global DMC & B2B Partner Directory',
    heroSubtitle: 'Connect directly with local ground handlers, attraction suppliers, and transport providers.',
    searchPlaceholder: 'Search company, city, country...',
    addProfileButtonText: 'Add / Edit Profile',
    noResultsTitle: 'No B2B Partners Found',
    noResultsSubtitle: 'Try clearing filters or be the first partner to register in this region!',
  })

  // Main Data States
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Search States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [selectedDestination, setSelectedDestination] = useState<string>('all')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [selectedService, setSelectedService] = useState<string>('all')
  const [sortOption, setSortOption] = useState<'newest' | 'company'>('newest')

  // Interactive Selection States
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])
  
  // Modals & Drawers
  const [activeProfileModal, setActiveProfileModal] = useState<any | null>(null)
  const [contactModalProfile, setContactModalProfile] = useState<any | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false)
  const [qrModalProfile, setQrModalProfile] = useState<any | null>(null)

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
  const [editSecondaryEmail, setEditSecondaryEmail] = useState('')
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

  // Load Sanity Directory Settings & Saved Bookmarks on Mount
  useEffect(() => {
    fetchDirectorySettings()
    fetchDirectoryProfiles()
    if (typeof window !== 'undefined') {
      try {
        const savedBook = localStorage.getItem('fw_b2b_bookmarks')
        if (savedBook) setBookmarkedIds(JSON.parse(savedBook))
      } catch (e) {}
    }
  }, [sortOption, selectedRegion, selectedDestination, selectedSpecialty])

  const fetchDirectorySettings = async () => {
    try {
      const fetched = await client.fetch(`*[_type == "b2bDirectorySettings"][0]{
        heroBadgeText,
        heroBadgeSubtext,
        heroTitle,
        heroSubtitle,
        searchPlaceholder,
        addProfileButtonText,
        noResultsTitle,
        noResultsSubtitle
      }`)
      if (fetched) {
        setSettings(prev => ({ ...prev, ...fetched }))
      }
    } catch (err) {
      console.warn('Using default directory settings')
    }
  }

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

  // Clipboard Copy Helpers
  const copyToClipboard = (text: string, fieldName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2200)
    }
  }

  // Professional WhatsApp Formatted Copy Function (Supports Both Emails)
  const copyAllContactDetails = (p: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    
    const lines = [
      `🏢 *${p.companyName}*`,
      p.tagline ? `_${p.tagline}_\n` : '',
      p.agentName ? `👤 *Contact Person:* ${p.agentName}` : '',
      p.email ? `✉️ *Primary Email:* ${p.email}` : '',
      p.secondaryEmail ? `✉️ *Secondary Email:* ${p.secondaryEmail}` : '',
      (p.whatsappNumber || p.phone) ? `📞 *Phone / WhatsApp:* ${p.whatsappNumber || p.phone}` : '',
      (p.city || p.country) ? `📍 *Location:* ${p.city ? `${p.city}, ` : ''}${p.country || ''}` : '',
      p.websiteUrl ? `🌐 *Website:* ${p.websiteUrl.startsWith('http') ? p.websiteUrl : `https://${p.websiteUrl}`}` : '',
      (p.destinationsCovered && p.destinationsCovered.length > 0) ? `🗺️ *Destinations:* ${p.destinationsCovered.join(', ')}` : '',
      (p.specialties && p.specialties.length > 0) ? `💼 *Specialties:* ${p.specialties.join(', ')}` : '',
      (p.servicesMatrix && p.servicesMatrix.length > 0) ? `⚡ *Services:* ${p.servicesMatrix.join(', ')}` : '',
      `\n🔗 *Verified B2B Directory Listing*`
    ].filter(Boolean).join('\n')

    copyToClipboard(lines, 'all', e)
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
          setEditSecondaryEmail(existing.secondaryEmail || '')
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
        secondaryEmail: editSecondaryEmail,
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

  // Generate vCard download file
  const downloadVCard = (p: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const vcardData = `BEGIN:VCARD\nVERSION:3.0\nN:${p.agentName || p.companyName};;;;\nFN:${p.agentName || p.companyName}\nORG:${p.companyName}\nTITLE:B2B Travel Partner\nTEL;TYPE=CELL,VOICE:${p.phone || ''}\nEMAIL;TYPE=PREF,INTERNET:${p.email || ''}\n${p.secondaryEmail ? `EMAIL;TYPE=WORK,INTERNET:${p.secondaryEmail}\n` : ''}URL:${p.websiteUrl || ''}\nNOTE:${p.tagline || ''}\nEND:VCARD`
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
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B', paddingBottom: '3rem' }}>
      
      {/* ══ 1. SLIM COMPACT HEADER STRIP ══ */}
      <header style={{ background: 'linear-gradient(135deg, #0F4C3A 0%, #1E1B4B 100%)', color: '#FFF', padding: '1.25rem 1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={20} color="#10B981" /> {settings.heroTitle}
            </h1>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, backdropFilter: 'blur(6px)' }}>
              {settings.heroBadgeSubtext}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {bookmarkedIds.length > 0 && (
              <button
                onClick={() => setShowBookmarksDrawer(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(217, 119, 6, 0.25)', border: '1px solid #F59E0B', color: '#FEF3C7', padding: '0.4rem 0.85rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                <Bookmark size={14} fill="#F59E0B" color="#F59E0B" />
                <span>Shortlist ({bookmarkedIds.length})</span>
              </button>
            )}

            <button
              onClick={() => { setShowEditModal(true); setOtpStep('email'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFF', padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(16,185,129,0.3)' }}
            >
              <Plus size={15} />
              <span>{settings.addProfileButtonText}</span>
            </button>
          </div>

        </div>
      </header>

      {/* ══ 2. SLEEK UNIFIED COMPACT TOOLBAR (SEARCH + FILTERS + REGION CHIPS) ══ */}
      <div style={{ maxWidth: '1280px', margin: '1rem auto 1.5rem', padding: '0 1.5rem' }}>
        <div style={{ background: '#FFF', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* Top Line: Search Input + Select Dropdowns + Sort */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* Sleek Search Input */}
            <div style={{ flex: '1 1 260px', display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
              <Search size={16} color="#0F4C3A" />
              <input
                type="text"
                placeholder={settings.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', padding: '9px 0', outline: 'none', fontSize: '0.85rem', color: '#0F172A', fontWeight: 600 }}
              />
            </div>

            {/* Destination Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
              <MapPin size={14} color="#0F4C3A" />
              <select
                value={selectedDestination}
                onChange={e => setSelectedDestination(e.target.value)}
                style={{ background: 'transparent', border: 'none', padding: '9px 0', fontSize: '0.82rem', fontWeight: 700, color: '#334155', cursor: 'pointer', outline: 'none' }}
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
            </div>

            {/* Specialty Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
              <Briefcase size={14} color="#0F4C3A" />
              <select
                value={selectedSpecialty}
                onChange={e => setSelectedSpecialty(e.target.value)}
                style={{ background: 'transparent', border: 'none', padding: '9px 0', fontSize: '0.82rem', fontWeight: 700, color: '#334155', cursor: 'pointer', outline: 'none' }}
              >
                <option value="all">💼 All Specialties</option>
                <option value="Corporate MICE">Corporate MICE</option>
                <option value="FIT Travel">FIT Travel</option>
                <option value="VIP Transfers">VIP Transfers</option>
                <option value="Overland Tours">Overland Tours</option>
                <option value="Luxury Escapes">Luxury Escapes</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', marginLeft: 'auto' }}>
              <ArrowUpDown size={14} color="#64748B" />
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value as any)}
                style={{ background: 'transparent', border: 'none', padding: '9px 0', fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', cursor: 'pointer', outline: 'none' }}
              >
                <option value="newest">Recently Listed</option>
                <option value="company">Company Name (A-Z)</option>
              </select>
            </div>

          </div>

          {/* Bottom Line: Region Filter Chips */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '0.65rem' }}>
            <button
              onClick={() => setSelectedRegion('all')}
              style={{ padding: '0.45rem 0.85rem', borderRadius: '6px', border: 'none', background: selectedRegion === 'all' ? '#0F4C3A' : '#F1F5F9', color: selectedRegion === 'all' ? '#FFF' : '#475569', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              All Regions ({profiles.length})
            </button>

            {Object.keys(REGIONS).map(reg => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                style={{ padding: '0.45rem 0.85rem', borderRadius: '6px', border: 'none', background: selectedRegion === reg ? '#0F4C3A' : '#F1F5F9', color: selectedRegion === reg ? '#FFF' : '#475569', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {reg}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ══ 3. COMPACT SHOWCASE CARDS GRID ══ */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Sparkles className="animate-spin" size={28} color="#0F4C3A" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: 700, color: '#64748B', fontSize: '0.9rem' }}>Loading B2B Partner Catalog...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div style={{ background: '#FFF', borderRadius: '14px', padding: '3rem 2rem', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <Building2 size={40} color="#94A3B8" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>{settings.noResultsTitle}</h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>{settings.noResultsSubtitle}</p>
            <button
              onClick={() => { setShowEditModal(true); setOtpStep('email'); }}
              style={{ background: '#0F4C3A', color: '#FFF', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              ➕ Create Free Listing
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredProfiles.map(p => {
              const isBookmarked = bookmarkedIds.includes(p._id)

              return (
                <div
                  key={p._id}
                  onClick={() => setActiveProfileModal(p)}
                  style={{ background: '#FFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column' }}
                >
                  {/* Compact Banner Header */}
                  <div style={{ height: '90px', background: `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.55)), url(${p.coverImageUrl || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', padding: '10px' }}>
                    
                    {/* Top Right Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={e => toggleBookmark(p._id, e)}
                        style={{ background: 'rgba(255,255,255,0.92)', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Bookmark partner"
                      >
                        <Bookmark size={13} fill={isBookmarked ? '#D97706' : 'none'} color={isBookmarked ? '#D97706' : '#475569'} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setQrModalProfile(p); }}
                        style={{ background: 'rgba(255,255,255,0.92)', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Generate QR Code"
                      >
                        <QrCode size={13} color="#475569" />
                      </button>
                    </div>

                    {/* Logo Avatar */}
                    <div style={{ position: 'absolute', bottom: '-18px', left: '14px', width: '52px', height: '52px', borderRadius: '12px', border: '2.5px solid #FFF', background: '#FFF', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                      <img src={p.logoUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150'} alt={p.companyName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '1.5rem 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.25 }}>
                        {p.companyName}
                      </h3>
                      {p.tagline && (
                        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '3px 0 0', fontWeight: 600 }}>
                          {p.tagline}
                        </p>
                      )}
                    </div>

                    {/* Location Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#475569', marginBottom: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}>
                        <MapPin size={12} color="#0F4C3A" /> {p.city ? `${p.city}, ` : ''}{p.country || 'Global'}
                      </span>
                      {p.leadTimeNotice && (
                        <span style={{ background: '#DCFCE7', color: '#166534', fontWeight: 800, padding: '1px 6px', borderRadius: '10px', fontSize: '0.68rem' }}>
                          🟢 {p.leadTimeNotice}
                        </span>
                      )}
                    </div>

                    {/* Destinations Covered Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '0.75rem' }}>
                      {(p.destinationsCovered || []).slice(0, 3).map((d: string, idx: number) => (
                        <span key={idx} style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '5px', border: '1px solid #BFDBFE' }}>
                          📍 {d}
                        </span>
                      ))}
                      {(p.destinationsCovered || []).length > 3 && (
                        <span style={{ background: '#F1F5F9', color: '#64748B', fontSize: '0.7rem', fontWeight: 700, padding: '2px 5px', borderRadius: '5px' }}>
                          +{(p.destinationsCovered || []).length - 3}
                        </span>
                      )}
                    </div>

                    {/* Specialties Matrix */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                      {(p.specialties || []).slice(0, 2).map((s: string, idx: number) => (
                        <span key={idx} style={{ background: '#F8FAFC', color: '#334155', fontSize: '0.68rem', fontWeight: 700, padding: '2px 5px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                          💼 {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div style={{ background: '#F8FAFC', padding: '0.6rem 1rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '6px' }}>
                    <a
                      href={`https://api.whatsapp.com/send?phone=${p.whatsappNumber || p.phone}&text=${encodeURIComponent(`Hi ${p.companyName}, I found your B2B profile on the DMC Directory and would like to inquire about B2B rates for ${p.destinationsCovered?.[0] || 'your destination'}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ flex: 1, background: '#25D366', color: '#FFF', textAlign: 'center', padding: '0.45rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                    
                    {/* Clear 📇 Contact Info Button */}
                    <button
                      onClick={e => { e.stopPropagation(); setContactModalProfile(p); }}
                      style={{ background: '#FFF', border: '1px solid #CBD5E1', color: '#0F4C3A', padding: '0.45rem 0.75rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="View Contact Details"
                    >
                      <Contact2 size={13} color="#0F4C3A" /> Contact Info
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ══ 📇 CLEAR INTERACTIVE CONTACT DETAILS MODAL (HIGHER Z-INDEX FOR POPUP OVERLAY) ══ */}
      {contactModalProfile && (
        <div
          onClick={() => setContactModalProfile(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 100005,
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
              width: '480px',
              maxWidth: '92vw',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '1.5rem',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid #E2E8F0'
            }}
          >
            {/* Modal Header & Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={contactModalProfile.logoUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150'} alt="" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>{contactModalProfile.companyName}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>📍 {contactModalProfile.city ? `${contactModalProfile.city}, ` : ''}{contactModalProfile.country}</p>
                </div>
              </div>
              <button onClick={() => setContactModalProfile(null)} style={{ background: '#F1F5F9', border: 'none', color: '#64748B', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {/* Contact Person Name */}
            {contactModalProfile.agentName && (
              <div style={{ background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '0.85rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Contact Representative</span>
                <strong style={{ fontSize: '0.88rem', color: '#0F4C3A' }}>👤 {contactModalProfile.agentName}</strong>
              </div>
            )}

            {/* Contact Information List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              
              {/* Primary Email Address */}
              {contactModalProfile.email && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF', border: '1px solid #E2E8F0', padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <Mail size={15} color="#0F4C3A" />
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Primary Email</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1D4ED8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>{contactModalProfile.email}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <a href={`mailto:${contactModalProfile.email}`} style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '3px 7px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 800, textDecoration: 'none' }}>Email</a>
                    <button onClick={e => copyToClipboard(contactModalProfile.email, 'email', e)} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', padding: '3px 7px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                      {copiedField === 'email' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Secondary Email Address */}
              {contactModalProfile.secondaryEmail && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF', border: '1px solid #E2E8F0', padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <Mail size={15} color="#0F4C3A" />
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Secondary Email</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1D4ED8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>{contactModalProfile.secondaryEmail}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <a href={`mailto:${contactModalProfile.secondaryEmail}`} style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '3px 7px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 800, textDecoration: 'none' }}>Email</a>
                    <button onClick={e => copyToClipboard(contactModalProfile.secondaryEmail, 'secEmail', e)} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', padding: '3px 7px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                      {copiedField === 'secEmail' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Phone / WhatsApp */}
              {(contactModalProfile.phone || contactModalProfile.whatsappNumber) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF', border: '1px solid #E2E8F0', padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={15} color="#0F4C3A" />
                    <div>
                      <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Phone / WhatsApp</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{contactModalProfile.phone || contactModalProfile.whatsappNumber}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <a href={`tel:${contactModalProfile.phone || contactModalProfile.whatsappNumber}`} style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '3px 7px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 800, textDecoration: 'none' }}>Call</a>
                    <button onClick={e => copyToClipboard(contactModalProfile.phone || contactModalProfile.whatsappNumber, 'phone', e)} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', padding: '3px 7px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                      {copiedField === 'phone' ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Website URL */}
              {contactModalProfile.websiteUrl && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF', border: '1px solid #E2E8F0', padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <Globe size={15} color="#0F4C3A" />
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Company Website</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F4C3A', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>{contactModalProfile.websiteUrl}</span>
                    </div>
                  </div>
                  <a href={contactModalProfile.websiteUrl.startsWith('http') ? contactModalProfile.websiteUrl : `https://${contactModalProfile.websiteUrl}`} target="_blank" rel="noopener noreferrer" style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', padding: '3px 7px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                    Visit <ExternalLink size={11} />
                  </a>
                </div>
              )}

            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                onClick={e => copyAllContactDetails(contactModalProfile, e)}
                style={{ width: '100%', padding: '0.6rem', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Copy size={14} /> {copiedField === 'all' ? 'Copied WhatsApp Contact Card! ✓' : 'Copy WhatsApp Format Card'}
              </button>

              <button
                onClick={e => downloadVCard(contactModalProfile, e)}
                style={{ width: '100%', padding: '0.55rem', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#475569', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <FileDown size={13} /> Save to Phone Contacts (.vcf)
              </button>
            </div>

          </div>
        </div>
      )}

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
              width: '780px',
              maxWidth: '95vw',
              maxHeight: '88vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E2E8F0',
              padding: 0
            }}
          >
            {/* Modal Cover Header */}
            <div style={{ height: '170px', background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${activeProfileModal.coverImageUrl || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1000'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', padding: '1.25rem', color: '#FFF' }}>
              <button
                onClick={() => setActiveProfileModal(null)}
                style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#FFF', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>

              <div style={{ position: 'absolute', bottom: '14px', left: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src={activeProfileModal.logoUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150'} alt="" style={{ width: '60px', height: '60px', borderRadius: '12px', border: '2.5px solid #FFF', objectFit: 'cover' }} />
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#FFFFFF' }}>{activeProfileModal.companyName}</h2>
                  <p style={{ margin: '3px 0 0', opacity: 0.9, fontSize: '0.85rem', color: '#F1F5F9' }}>{activeProfileModal.tagline || activeProfileModal.city}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', color: '#0F172A' }}>
              
              {/* Quick Actions Bar */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem' }}>
                <a
                  href={`https://api.whatsapp.com/send?phone=${activeProfileModal.whatsappNumber || activeProfileModal.phone}&text=${encodeURIComponent(`Hi ${activeProfileModal.companyName}, I would like to request B2B partner rates.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: '#25D366', color: '#FFF', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <MessageCircle size={15} /> WhatsApp Partner
                </a>

                <button
                  onClick={e => copyAllContactDetails(activeProfileModal, e)}
                  style={{ background: '#0F4C3A', color: '#FFF', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Copy size={15} /> {copiedField === 'all' ? 'Copied Contact Card! ✓' : 'Copy WhatsApp Format Card'}
                </button>
                
                {activeProfileModal.brochurePdfUrl && (
                  <a
                    href={activeProfileModal.brochurePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#3B82F6', color: '#FFF', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FileDown size={15} /> Download B2B Tariff PDF
                  </a>
                )}
              </div>

              {/* 📇 DIRECT OFFICIAL CONTACT DETAILS SECTION (COMPACT & SLEEK) */}
              <div style={{ background: '#F8FAFC', padding: '1rem 1.15rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 900, color: '#0F4C3A', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📇 Official Business Contact Info
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.83rem' }}>
                  {activeProfileModal.agentName && (
                    <div style={{ background: '#FFF', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Representative</span>
                      <strong style={{ color: '#0F172A', display: 'block', marginTop: '1px' }}>👤 {activeProfileModal.agentName}</strong>
                    </div>
                  )}

                  {activeProfileModal.email && (
                    <div style={{ background: '#FFF', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Primary Email</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginTop: '1px' }}>
                        <a href={`mailto:${activeProfileModal.email}`} style={{ color: '#1D4ED8', fontWeight: 700, textDecoration: 'none', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>✉️ {activeProfileModal.email}</a>
                        <button onClick={e => copyToClipboard(activeProfileModal.email, 'email', e)} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', color: '#475569', fontSize: '0.68rem', fontWeight: 700 }}>
                          {copiedField === 'email' ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeProfileModal.secondaryEmail && (
                    <div style={{ background: '#FFF', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Secondary Email</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginTop: '1px' }}>
                        <a href={`mailto:${activeProfileModal.secondaryEmail}`} style={{ color: '#1D4ED8', fontWeight: 700, textDecoration: 'none', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>✉️ {activeProfileModal.secondaryEmail}</a>
                        <button onClick={e => copyToClipboard(activeProfileModal.secondaryEmail, 'secEmail', e)} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', color: '#475569', fontSize: '0.68rem', fontWeight: 700 }}>
                          {copiedField === 'secEmail' ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}

                  {(activeProfileModal.whatsappNumber || activeProfileModal.phone) && (
                    <div style={{ background: '#FFF', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Phone / WhatsApp</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginTop: '1px' }}>
                        <strong style={{ color: '#0F172A' }}>📞 {activeProfileModal.whatsappNumber || activeProfileModal.phone}</strong>
                        <button onClick={e => copyToClipboard(activeProfileModal.whatsappNumber || activeProfileModal.phone, 'phone', e)} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', color: '#475569', fontSize: '0.68rem', fontWeight: 700 }}>
                          {copiedField === 'phone' ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeProfileModal.websiteUrl && (
                    <div style={{ background: '#FFF', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Website</span>
                      <a href={activeProfileModal.websiteUrl.startsWith('http') ? activeProfileModal.websiteUrl : `https://${activeProfileModal.websiteUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0F4C3A', fontWeight: 700, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '1px' }}>
                        🌐 Visit Site <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Bio */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>About Company & Operational Bio</h4>
                <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {activeProfileModal.aboutCompany || 'No detailed biography provided yet.'}
                </p>
              </div>

              {/* Operational Matrices Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <h5 style={{ margin: '0 0 0.4rem', color: '#0F4C3A', fontWeight: 800, fontSize: '0.82rem' }}>📍 Destinations Covered</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(activeProfileModal.destinationsCovered || []).map((d: string, i: number) => (
                      <span key={i} style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>{d}</span>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <h5 style={{ margin: '0 0 0.4rem', color: '#0F4C3A', fontWeight: 800, fontSize: '0.82rem' }}>💼 Services Provided</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(activeProfileModal.servicesMatrix || []).map((s: string, i: number) => (
                      <span key={i} style={{ background: '#ECFDF5', color: '#047857', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ {s}</span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
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
              width: '560px',
              maxWidth: '95vw',
              maxHeight: '85vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '1.5rem',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E2E8F0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#D97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bookmark size={18} fill="#D97706" /> Saved Partner Shortlist ({bookmarkedIds.length})
              </h3>
              <button onClick={() => setShowBookmarksDrawer(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {profiles.filter(p => bookmarkedIds.includes(p._id)).map(p => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <h4 style={{ margin: '0 0 2px', fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{p.companyName}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>📍 {p.city}, {p.country}</p>
                  </div>
                  <button
                    onClick={() => setActiveProfileModal(p)}
                    style={{ background: '#0F4C3A', color: '#FFF', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    View Partner
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ PROFILE OTP EDIT / SIGNUP FLOATING MODAL (WITH SERVICES IN ENTRY FORM) ══ */}
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
              width: '620px',
              maxWidth: '95vw',
              maxHeight: '88vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '1.5rem',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E2E8F0'
            }}
          >
            {/* Top Close Button (✕) */}
            <button
              onClick={() => setShowEditModal(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: '#F1F5F9',
                border: 'none',
                color: '#475569',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close window without saving"
            >
              <X size={16} />
            </button>

            <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.2rem', fontWeight: 900, color: '#0F4C3A' }}>
              💼 Manage My Company Showcase Profile
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 1.25rem' }}>
              100% open self-service. Verify your primary work email via OTP to create or edit your listing instantly.
            </p>

            {authError && (
              <div style={{ background: '#FFF5F5', color: '#C53030', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '1rem', borderLeft: '4px solid #C53030' }}>
                ⚠️ {authError}
              </div>
            )}

            {otpStep === 'email' && (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>Enter Primary Work Email Address *</label>
                  <input type="email" required placeholder="e.g. agent@travelagency.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '0.65rem', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Cancel / Close</button>
                  <button type="submit" disabled={authLoading} style={{ flex: 2, padding: '0.65rem', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                    {authLoading ? 'Sending OTP...' : 'Send Verification OTP Code ✉️'}
                  </button>
                </div>
              </form>
            )}

            {otpStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <p style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 700 }}>✓ Code sent to: {authEmail}</p>
                {debugOtp && <div style={{ background: '#FEFCBF', padding: '0.65rem', borderRadius: '6px', fontSize: '0.82rem', color: '#744210' }}>Sandbox Code: <strong>{debugOtp}</strong></div>}
                <input type="text" required placeholder="123456" maxLength={6} value={otpCode} onChange={e => setOtpCode(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '2px solid #D97706', fontSize: '1.35rem', textAlign: 'center', letterSpacing: '0.3em', fontWeight: 800, backgroundColor: '#FFF', color: '#0F172A' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '0.65rem', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Cancel / Close</button>
                  <button type="submit" disabled={authLoading} style={{ flex: 2, padding: '0.65rem', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                    {authLoading ? 'Verifying...' : 'Verify OTP & Open Profile Editor 🔓'}
                  </button>
                </div>
              </form>
            )}

            {otpStep === 'form' && (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>Company Name *</label>
                    <input type="text" required value={editCompanyName} onChange={e => setEditCompanyName(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>Contact Person Name</label>
                    <input type="text" value={editAgentName} onChange={e => setEditAgentName(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                </div>

                {/* EMAIL ADDRESSES ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>Primary Email (Verified)</label>
                    <input type="email" disabled value={authEmail} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#F1F5F9', color: '#64748B', fontWeight: 700 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>Secondary Email ID (Optional)</label>
                    <input type="email" placeholder="e.g. ops@travelagency.com" value={editSecondaryEmail} onChange={e => setEditSecondaryEmail(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>Tagline / Slogan</label>
                    <input type="text" placeholder="e.g. Premier Singapore B2B Ground Handler" value={editTagline} onChange={e => setEditTagline(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>Company Website URL</label>
                    <input type="url" placeholder="https://..." value={editWebsite} onChange={e => setEditWebsite(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>City</label>
                    <input type="text" value={editCity} onChange={e => setEditCity(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>Country</label>
                    <input type="text" value={editCountry} onChange={e => setEditCountry(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>WhatsApp Number</label>
                    <input type="tel" value={editWhatsapp} onChange={e => setEditWhatsapp(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>About Company & Operational Bio</label>
                  <textarea rows={2.5} value={editAbout} onChange={e => setEditAbout(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                </div>

                {/* DESTINATIONS, SPECIALTIES & SERVICES PROVIDED */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>Destinations Covered (comma separated)</label>
                    <input type="text" value={editDestinations} onChange={e => setEditDestinations(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>Specialties (comma separated)</label>
                    <input type="text" value={editSpecialties} onChange={e => setEditSpecialties(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>Services Provided (comma separated)</label>
                  <input type="text" placeholder="e.g. Airport Meet & Greet, Fleet Transfers & Coaches, Wholesale Attraction Passes, Hotel Contracting" value={editServices} onChange={e => setEditServices(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                </div>

                {/* File Upload / Link Inputs */}
                <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h5 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#0F4C3A' }}>📷 Media & Brochure Uploads (File Upload or URL)</h5>

                  {/* Logo Upload / URL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>Company Logo</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="text" placeholder="https://..." value={editLogoUrl} onChange={e => setEditLogoUrl(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                      <label style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '0.5rem 0.85rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                        <Upload size={13} /> {uploadingField === 'logo' ? 'Uploading...' : 'Upload Logo'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'logo')} />
                      </label>
                    </div>
                  </div>

                  {/* Cover Image Upload / URL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>Banner Image</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="text" placeholder="https://..." value={editCoverUrl} onChange={e => setEditCoverUrl(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                      <label style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '0.5rem 0.85rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                        <Upload size={13} /> {uploadingField === 'cover' ? 'Uploading...' : 'Upload Banner'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'cover')} />
                      </label>
                    </div>
                  </div>

                  {/* PDF Tariff Upload / URL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: '3px', color: '#334155' }}>B2B Tariff PDF Document</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="text" placeholder="https://..." value={editBrochureUrl} onChange={e => setEditBrochureUrl(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', backgroundColor: '#FFF', color: '#0F172A' }} />
                      <label style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '0.5rem 0.85rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                        <Upload size={13} /> {uploadingField === 'brochure' ? 'Uploading...' : 'Upload PDF'}
                        <input type="file" accept="application/pdf,image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'brochure')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button type="button" onClick={handleDeleteProfile} style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', padding: '0.65rem 1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>Delete Profile</button>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => setShowEditModal(false)} style={{ background: '#F1F5F9', color: '#475569', border: 'none', padding: '0.65rem 1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>Close Without Saving</button>
                    <button type="submit" disabled={authLoading} style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFF', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
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
              width: '340px',
              maxWidth: '92vw',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '1.5rem',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E2E8F0'
            }}
          >
            <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: 900, color: '#0F172A' }}>{qrModalProfile.companyName}</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 1.25rem' }}>Scan or share QR Code to view B2B showcase profile.</p>
            <div style={{ background: '#FFF', padding: '0.85rem', borderRadius: '12px', border: '2.5px solid #E2E8F0', display: 'inline-block', marginBottom: '1.25rem' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/b2b-directory` : 'https://flyingwonders.net/b2b-directory')}`} alt="Profile QR Code" style={{ width: '180px', height: '180px' }} />
            </div>
            <button onClick={() => setQrModalProfile(null)} style={{ width: '100%', padding: '0.65rem', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>Close QR Viewer</button>
          </div>
        </div>
      )}

    </div>
  )
}
