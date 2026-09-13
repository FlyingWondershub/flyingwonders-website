'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  Filter,
  Calendar,
  Users,
  CheckCircle2,
  MessageCircle,
  FileDown,
  CopyCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Clock,
  MapPin,
  Bus,
  ShieldAlert,
  ExternalLink,
  ChevronDown,
  Plus,
  X,
  Layers,
  ArrowUpDown,
  Check
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface VehicleItem {
  type: string
  vehicleType?: string
  transferType?: string
  rateType?: string
  serviceName?: string
  compositeKey?: string
  pricePerTransfer: number
}

interface AttractionItem {
  name: string
  adultPrice: number
  childPrice: number
  area?: string
  rateType?: string
}

const DEFAULT_TERMS = `Terms & Inclusions:

1. Land Package Only: Hotel accommodation is not included.
2. Transfers: Airport arrival & departure transfers are provided by Private 13-Seater Minibus. Sightseeing transfers are as selected (SIC / Private 13-Seater). Surcharges applicable for flights between 22:00 - 07:00 hours.
3. Customizations: For hotel room bookings, meal plans, licensed English/Hindi guides, or coach upgrades for groups >12 Pax, please contact DMC.`

function cleanPdfText(text: string): string {
  if (!text) return ''
  return text
    .replace(/https?:\/\/(www\.)?flyingwonders\.net\/sgac/gi, '(SG Arrival Card: flyingwonders.net/sgac)')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}]/gu, '')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/[\u0080-\u009F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[📌🚐ℹ️⚡🏨👤🌙📞💰💵📅🎟️🚗🛬🛫🏙️🌴⏱️]/g, '')
    .replace(/\s+([,.:;!?])/g, '$1')
    .replace(/,\s*,+/g, ', ')
    .replace(/\.\s*\.+/g, '. ')
    .replace(/Tip\s*:\s*/gi, 'Tip: ')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/--+/g, '—')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getEmbedVideoInfo(rawUrl?: string | null): { type: 'youtube' | 'vimeo' | 'mp4' | null; embedUrl: string | null } {
  if (!rawUrl) return { type: null, embedUrl: null }
  const trimmed = rawUrl.trim()

  // YouTube match (watch?v=, youtu.be/, shorts/, embed/)
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&rel=0&modestbranding=1`
    }
  }

  // Vimeo match
  const vmMatch = trimmed.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/)
  if (vmMatch && vmMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1&muted=1`
    }
  }

  // Direct video file (mp4, webm, ogg, Sanity cdn asset)
  return {
    type: 'mp4',
    embedUrl: trimmed
  }
}

const LOCAL_ATTRACTION_FALLBACKS: Record<string, string> = {
  universal: '/images/attractions/universal-studios-singapore/cover.jpg',
  gardens: '/images/attractions/gardens-by-the-bay/cover.jpg',
  dome: '/images/attractions/gardens-by-the-bay/cover.jpg',
  cloud: '/images/attractions/gardens-by-the-bay/gallery-1.jpg',
  flower: '/images/attractions/gardens-by-the-bay/gallery-2.jpg',
  'night safari': '/images/attractions/night-safari-singapore/cover.jpg',
  night: '/images/attractions/night-safari-singapore/cover.jpg',
  zoo: '/images/attractions/singapore-zoo/cover.jpg',
  'bird paradise': '/images/attractions/bird-paradise-singapore/cover.jpg',
  bird: '/images/attractions/bird-paradise-singapore/cover.jpg',
  'river wonders': '/images/attractions/river-wonders-singapore/cover.jpg',
  river: '/images/attractions/river-wonders-singapore/cover.jpg',
  aquarium: '/images/attractions/sea-aquarium-singapore/cover.jpg',
  sea: '/images/attractions/sea-aquarium-singapore/cover.jpg',
  luge: '/images/attractions/sentosa-skyline-luge/cover.jpg',
  skyline: '/images/attractions/sentosa-skyline-luge/cover.jpg',
  'cable car': '/images/attractions/singapore-cable-car/cover.jpg',
  cable: '/images/attractions/singapore-cable-car/cover.jpg',
  sentosa: '/images/attractions/singapore-cable-car/cover.jpg',
  wings: '/images/attractions/singapore-cable-car/gallery-1.jpg',
  flyer: '/images/attractions/singapore-flyer/cover.jpg',
  mbs: '/images/hero/singapore-hero-1.jpg',
  sands: '/images/hero/singapore-hero-1.jpg',
  skypark: '/images/hero/singapore-hero-1.jpg',
  marina: '/images/hero/singapore-hero-1.jpg',
  city: '/images/hero/singapore-hero-2.jpg',
  merlion: '/images/hero/singapore-hero-2.jpg',
  jewel: '/images/hero/singapore-hero-4.jpg'
}

function getLocalAttractionPhoto(name: string): string | null {
  if (!name) return null
  const lower = name.toLowerCase().trim()
  for (const [key, path] of Object.entries(LOCAL_ATTRACTION_FALLBACKS)) {
    if (lower.includes(key)) return path
  }
  return null
}

const LOCAL_TRANSFER_FALLBACKS: Record<string, string> = {
  'city tour': '/images/transfers/city-tour.jpg',
  'citytour': '/images/transfers/city-tour.jpg',
  'city-tour': '/images/transfers/city-tour.jpg',
  'sightseeing': '/images/transfers/city-tour.jpg',
  '13-seater': '/images/transfers/13-seater-minibus.jpg',
  '13 seater': '/images/transfers/13-seater-minibus.jpg',
  'minibus': '/images/transfers/13-seater-minibus.jpg',
  'hiace': '/images/transfers/13-seater-minibus.jpg',
  'sedan': '/images/transfers/sedan.jpg',
  'camry': '/images/transfers/sedan.jpg',
  'medium coach': '/images/transfers/medium-coach.jpg',
  '24-seater': '/images/transfers/medium-coach.jpg',
  'full coach': '/images/transfers/full-coach.jpg',
  '45-seater': '/images/transfers/full-coach.jpg',
  'super coach': '/images/transfers/medium-coach.jpg',
  '55-seater': '/images/transfers/medium-coach.jpg',
  'sic': '/images/transfers/13-seater-minibus.jpg'
}

function getLocalTransferPhoto(nameOrType: string): string | null {
  if (!nameOrType) return null
  const lower = nameOrType.toLowerCase().trim()
  for (const [key, path] of Object.entries(LOCAL_TRANSFER_FALLBACKS)) {
    if (lower.includes(key)) return path
  }
  return null
}

// Helper to fetch and rasterize images for high-resolution PDF generation
const fetchRasterLogo = async (
  url: string,
  maxWidth = 480,
  maxHeight = 312,
  asJpeg = true,
  quality = 0.85,
  fitMode: 'contain' | 'cover' | 'scale' = 'cover'
): Promise<{ dataUrl: string; width: number; height: number; format: string } | null> => {
  if (!url) return null
  try {
    let src = url
    if (url.startsWith('http')) {
      try {
        const proxyRes = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`)
        if (proxyRes.ok) {
          const pData = await proxyRes.json()
          if (pData.success && pData.base64) src = pData.base64
        }
      } catch (pe) {}
    }
    return await new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        try {
          const origW = img.naturalWidth || img.width || 400
          const origH = img.naturalHeight || img.height || 200

          let targetW = maxWidth
          let targetH = maxHeight
          let dx = 0
          let dy = 0
          let dw = maxWidth
          let dh = maxHeight

          if (fitMode === 'cover') {
            const scale = Math.max(maxWidth / origW, maxHeight / origH)
            dw = Math.round(origW * scale)
            dh = Math.round(origH * scale)
            dx = Math.round((maxWidth - dw) / 2)
            dy = Math.round((maxHeight - dh) / 2)
          } else if (fitMode === 'contain') {
            const scale = Math.min(maxWidth / origW, maxHeight / origH)
            dw = Math.round(origW * scale)
            dh = Math.round(origH * scale)
            dx = Math.round((maxWidth - dw) / 2)
            dy = Math.round((maxHeight - dh) / 2)
          } else {
            const scale = Math.min(1, maxWidth / origW, maxHeight / origH)
            targetW = Math.max(1, Math.round(origW * scale))
            targetH = Math.max(1, Math.round(origH * scale))
            dx = 0
            dy = 0
            dw = targetW
            dh = targetH
          }

          const canvas = document.createElement('canvas')
          canvas.width = targetW
          canvas.height = targetH
          const ctx = canvas.getContext('2d')
          if (!ctx) return resolve(null)

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          if (asJpeg) {
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, targetW, targetH)
          }
          ctx.drawImage(img, dx, dy, dw, dh)

          const format = asJpeg ? 'JPEG' : 'PNG'
          const mimeType = asJpeg ? 'image/jpeg' : 'image/png'
          const dataUrl = canvas.toDataURL(mimeType, quality)

          resolve({
            dataUrl,
            width: targetW,
            height: targetH,
            format
          })
        } catch (e) {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = src
    })
  } catch (err) {
    return null
  }
}

export default function ReadyMadePackagesPage() {
  const router = useRouter()

  // Data States
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [vehiclesList, setVehiclesList] = useState<VehicleItem[]>([])
  const [attractionsList, setAttractionsList] = useState<AttractionItem[]>([])
  const [attractionsMeta, setAttractionsMeta] = useState<Record<string, any>>({})
  const [sgdToInrRate, setSgdToInrRate] = useState(63.5)
  const [activeAgent, setActiveAgent] = useState<any | null>(null)

  // Filter States
  const [filterDuration, setFilterDuration] = useState<'all' | '3' | '4' | '5'>('all')
  const [filterCategory, setFilterCategory] = useState<'all' | 'popular' | 'family' | 'luxury' | 'budget' | 'mice'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMediaTabs, setActiveMediaTabs] = useState<Record<string, 'photo' | 'video'>>({})

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast({ message, type })
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3800)
  }

  // Modal States
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)
  const [paxAdults, setPaxAdults] = useState(2)
  const [paxKids, setPaxKids] = useState(0)
  const [childAges, setChildAges] = useState<number[]>([])
  const [transferMode, setTransferMode] = useState<'private13' | 'sic'>('private13')
  const [markupPercent, setMarkupPercent] = useState(0)
  const [travelDate, setTravelDate] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [daywiseItinerary, setDaywiseItinerary] = useState<any[]>([])

  // Modal Sub-interactions & Saving
  const [currentProposalRef, setCurrentProposalRef] = useState<string>('')
  const [savedProposalNum, setSavedProposalNum] = useState<string | null>(null)
  const [savingProposal, setSavingProposal] = useState(false)
  const [newTransferHours, setNewTransferHours] = useState(4)
  const [attractionModalDay, setAttractionModalDay] = useState<number | null>(null)
  const [searchAttraction, setSearchAttraction] = useState('')
  const [newTransferDay, setNewTransferDay] = useState<number | null>(null)
  const [newTransferType, setNewTransferType] = useState('interAttraction')
  const [newTransferRoute, setNewTransferRoute] = useState('')
  const [newTransferTime, setNewTransferTime] = useState('14:00')
  const [termsText, setTermsText] = useState(DEFAULT_TERMS)
  const [showTerms, setShowTerms] = useState(false)
  const [copiedWA, setCopiedWA] = useState(false)
  const [sendingWA, setSendingWA] = useState(false)
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null)
  const [sendingCardId, setSendingCardId] = useState<string | null>(null)

  // Admin Check for Net Pricing Visibility
  const [isAdminOverride, setIsAdminOverride] = useState(false)

  const isAdmin = useMemo(() => {
    if (isAdminOverride) return true
    if (!activeAgent) return false
    const email = (activeAgent.email || '').toLowerCase().trim()
    return email === 'info.flyingwonders@gmail.com' ||
           activeAgent.role === 'admin' ||
           activeAgent.isAdmin === true
  }, [activeAgent, isAdminOverride])

  // Fetch Templates, Rates & Agent on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('admin') === 'true' || params.get('mode') === 'admin') {
        setIsAdminOverride(true)
      }
      try {
        const stored = localStorage.getItem('fw_b2b_agent')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed) {
            const email = (parsed.email || '').toLowerCase().trim()
            if (email === 'info.flyingwonders@gmail.com' || parsed.role === 'admin' || parsed.isAdmin === true) {
              setIsAdminOverride(true)
            }
            if (!activeAgent) {
              setActiveAgent(parsed)
            }
          }
        }
      } catch (e) {}
    }

    // 1. Fetch Ready Package Templates
    fetch('/api/ready-packages')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.templates)) {
          setTemplates(data.templates)
        }
      })
      .catch(err => console.error('Failed to load ready packages:', err))
      .finally(() => setLoading(false))

    // 2. Fetch Live Currency Exchange Rate
    fetch('/api/exchange-rate')
      .then(res => res.json())
      .then(data => {
        if (typeof data.rate === 'number' && data.rate > 0) {
          setSgdToInrRate(data.rate)
        }
      })
      .catch(() => {})

    // 3. Fetch Auth Check
    fetch(`/api/auth/check?cb=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.agent) {
          setActiveAgent(data.agent)
        }
      })
      .catch(() => {})

    // 4. Fetch Custom Package Meta (Attraction photos & editorial descriptions)
    fetch('/api/custom-package-meta')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.attractions)) {
          const metaMap: Record<string, any> = {}
          data.attractions.forEach((m: any) => {
            if (m.name) metaMap[m.name.toLowerCase().trim()] = m
            if (m.matchKeyword) metaMap[m.matchKeyword.toLowerCase().trim()] = m
          })
          setAttractionsMeta(metaMap)
        }
      })
      .catch(() => {})

    // 5. Fetch Google Sheet Tariff Workbook
    const fetchSheet = async () => {
      try {
        let sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=xlsx'
        try {
          const sRes = await fetch('/api/site-settings')
          const sData = await sRes.json()
          if (sData.settings?.customPackageSheetUrl || sData.settings?.attractionsSheetUrl) {
            sheetUrl = (sData.settings.customPackageSheetUrl || sData.settings.attractionsSheetUrl)
              .replace(/\/pubhtml.*/gi, '/pub?output=xlsx')
              .replace(/output=csv/gi, 'output=xlsx')
            if (!sheetUrl.includes('output=xlsx')) sheetUrl += '&output=xlsx'
          }
          if (sData.settings?.defaultLandPackageTerms) {
            setTermsText(sData.settings.defaultLandPackageTerms)
          }
        } catch (e) {}

        const res = await fetch(sheetUrl)
        if (!res.ok) return
        const buf = await res.arrayBuffer()
        const wb = XLSX.read(new Uint8Array(buf), { type: 'array' })

        // Transfers
        const tSheet = wb.Sheets['Transfers']
        if (tSheet) {
          const rows: any[] = XLSX.utils.sheet_to_json(tSheet)
          const parsed = rows.map(r => {
            const vType = (r['Vehicle Type'] || '').trim()
            const tType = (r['Transfer Type'] || '').trim()
            const rType = (r['Rate type'] || r['Rate Type'] || '').trim()
            const sName = (r['Service Name'] || r['Service'] || r['Transfers'] || 'Transfers').trim()
            const rate = Number(r['Rate($)'] ?? r['Rate']) || 0
            return {
              type: `${vType}${tType ? ` - ${tType}` : ''}`,
              vehicleType: vType,
              transferType: tType,
              rateType: rType,
              serviceName: sName,
              compositeKey: [vType, tType, rType, sName].filter(Boolean).join(' - '),
              pricePerTransfer: rate
            }
          }).filter(t => t.pricePerTransfer > 0)
          setVehiclesList(parsed)
        }

        // Attractions
        const aSheet = wb.Sheets['Attractions']
        if (aSheet) {
          const rows: any[] = XLSX.utils.sheet_to_json(aSheet)
          const parsed = rows.map(r => {
            const name = (r['Attractions'] || '').trim()
            const adult = Number(r['Adult ($)'] ?? r['Adult']) || 0
            const child = Number(r['Child ($)'] ?? r['Child']) || 0
            const area = r['Area'] || ''
            const rawRateType = String(r['Rate type'] ?? r['Pricing Type'] ?? '').toLowerCase()
            return {
              name,
              adultPrice: adult,
              childPrice: child,
              area,
              rateType: rawRateType.includes('group') ? 'group' : 'person'
            }
          }).filter(a => a.name !== '' && (a.adultPrice > 0 || a.childPrice > 0))
          setAttractionsList(parsed)
        }
      } catch (err) {
        console.error('Failed to parse Google Sheet tariff:', err)
      }
    }
    fetchSheet()
  }, [])

  // Resilient Clipboard Copy Helper (mobile, Safari, iOS, Android, iframe, un-focused windows)
  const copyTextWithFallback = async (text: string): Promise<boolean> => {
    if (!text) return false
    // 1. Try modern Async Clipboard API first
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (e) {
        console.warn('navigator.clipboard.writeText failed, falling back to DOM execCommand:', e)
      }
    }
    // 2. Resilient DOM fallback (safe for iOS Safari, Android Chrome, and desktop)
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.top = '0'
      ta.style.left = '0'
      ta.style.width = '2em'
      ta.style.height = '2em'
      ta.style.padding = '0'
      ta.style.border = 'none'
      ta.style.outline = 'none'
      ta.style.boxShadow = 'none'
      ta.style.background = 'transparent'
      ta.style.opacity = '0.01'
      ta.style.zIndex = '99999'
      ta.style.fontSize = '16px' // Prevents iOS Safari auto-zoom
      ta.setAttribute('readonly', '')
      document.body.appendChild(ta)
      ta.focus({ preventScroll: true })
      ta.select()
      ta.setSelectionRange(0, text.length)

      if (typeof window !== 'undefined' && window.getSelection) {
        const range = document.createRange()
        range.selectNodeContents(ta)
        const sel = window.getSelection()
        if (sel) {
          sel.removeAllRanges()
          sel.addRange(range)
        }
      }

      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch (err) {
      console.error('Fallback clipboard copy failed:', err)
      return false
    }
  }

  // Safe WhatsApp Launcher (avoids browser popup blockers by executing cleanly within user click)
  const openWhatsAppSafely = (text: string, phone?: string) => {
    if (!text) return
    const rawDigits = (phone || '').replace(/[^0-9]/g, '')
    const validPhone = rawDigits.length >= 10 ? rawDigits : ''

    // Guard against URI length limits in WhatsApp Web/Mobile (>1800 chars)
    let waText = text
    if (text.length > 1800) {
      const lines = text.split('\n')
      const summaryHeader = lines.slice(0, 18).join('\n')
      waText = `${summaryHeader}\n\n📋 *Full itemized day-by-day ground itinerary & inclusions copied to your clipboard! Paste (Ctrl+V) here to send.*`
    }

    const encoded = encodeURIComponent(waText)
    const url = validPhone
      ? `https://api.whatsapp.com/send?phone=${validPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`

    try {
      const win = window.open(url, '_blank', 'noopener,noreferrer')
      if (!win) {
        window.location.href = url
      }
    } catch {
      window.location.href = url
    }
  }

  // Intelligent Attraction Matcher for Google Sheet rates
  const findMatchingAttraction = (searchName: string, list: AttractionItem[]) => {
    if (!searchName || !list?.length) return null
    const cleanTarget = searchName.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim()
    
    // 1. Exact
    let found = list.find(item => item.name.toLowerCase().trim() === searchName.toLowerCase().trim())
    if (found) return found

    // 2. Normalized
    found = list.find(item => item.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim() === cleanTarget)
    if (found) return found

    // 3. Substring
    found = list.find(item => {
      const itemClean = item.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim()
      return (itemClean.length > 3 && cleanTarget.includes(itemClean)) || (cleanTarget.length > 3 && itemClean.includes(cleanTarget))
    })
    if (found) return found

    // 4. Token Overlap
    const targetTokens = cleanTarget.split(/\s+/).filter(t => t.length > 2)
    let bestItem: AttractionItem | null = null
    let highestScore = 0
    for (const item of list) {
      const itemTokens = item.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(t => t.length > 2)
      let score = 0
      for (const token of targetTokens) {
        if (itemTokens.includes(token)) score++
      }
      if (score > highestScore && score >= 2) {
        highestScore = score
        bestItem = item
      }
    }
    return bestItem
  }

  // Resolves authentic vehicle name, human-readable route title, and icon based on modality (Private vs SIC)
  const getCleanTransferInfo = (tr: any, mode: 'private13' | 'sic') => {
    const sType = (tr.serviceType || '').toLowerCase()
    const vType = (tr.vehicleType || '').toLowerCase()
    const rDesc = (tr.routeDescription || tr.description || '').trim()

    const isArr = sType === 'arrival' || vType.includes('arrival') || rDesc.toLowerCase().includes('arrival')
    const isDep = sType === 'departure' || vType.includes('departure') || rDesc.toLowerCase().includes('departure')
    const isCity = sType === 'citytour' || sType === 'city_tour' || sType === 'city tour' || vType.includes('city tour') || rDesc.toLowerCase().includes('city tour')
    const isDisp = sType === 'disposal' || vType.includes('disposal') || rDesc.toLowerCase().includes('disposal')

    if (isArr) {
      return {
        category: 'arrival',
        title: rDesc && !['arrival', 'transfer'].includes(rDesc.toLowerCase()) ? rDesc : 'Singapore Changi Airport to Hotel (Arrival Transfer)',
        vehicleName: 'Private 13-Seater Minibus',
        badge: '13-Seater Minibus (Private Arrival)',
        icon: '🛬',
        isAirport: true,
        isDisposal: false,
        photoUrl: '/images/hero/singapore-hero-4.jpg',
        shortDescription: 'Professional airport arrival reception and swift transit to your hotel. Meet your dedicated chauffeur at the arrival hall for direct, relaxing highway transit to your accommodation.',
        features: [
          'Changi Airport Arrival Reception',
          'Luggage Loading & Chauffeur Assistance',
          'Direct Express Highway Transit to Hotel',
          'Air-Conditioned 13-Seater Minibus'
        ]
      }
    }
    if (isDep) {
      return {
        category: 'departure',
        title: rDesc && !['departure', 'transfer'].includes(rDesc.toLowerCase()) ? rDesc : 'Hotel to Singapore Changi Airport (Departure Transfer)',
        vehicleName: 'Private 13-Seater Minibus',
        badge: '13-Seater Minibus (Private Departure)',
        icon: '🛫',
        isAirport: true,
        isDisposal: false,
        photoUrl: '/images/hero/singapore-hero-4.jpg',
        shortDescription: 'Punctual hotel pickup and direct express transit to Singapore Changi Airport. Your chauffeur assists with baggage loading at hotel lobby, ensuring timely arrival at your departure terminal for check-in and GST tax refund.',
        features: [
          'Punctual Hotel Lobby Pickup',
          'Luggage Loading & Chauffeur Assistance',
          'Direct Drop-off at Changi Departure Terminal',
          'Ample Time for Check-in & Tax Refunds'
        ]
      }
    }
    if (isDisp) {
      const hrs = Number(tr.hours) > 0 ? Number(tr.hours) : 4
      return {
        category: 'disposal',
        title: rDesc && !['disposal', 'transfer'].includes(rDesc.toLowerCase()) ? rDesc : `${hrs} Hours Dedicated Vehicle Disposal`,
        vehicleName: 'Private 13-Seater Minibus',
        badge: `${hrs}h Disposal (13-Seater Minibus)`,
        icon: '⏱️',
        isAirport: false,
        isDisposal: true,
        photoUrl: '/images/transfers/13-seater-minibus.jpg',
        shortDescription: `Enjoy total itinerary flexibility with a dedicated 13-Seater minibus and chauffeur on standby for ${hrs} consecutive hours. Ideal for custom shopping sprees, dining excursions, and bespoke sightseeing.`,
        features: [
          `${hrs} Hours Dedicated Chauffeur Standby`,
          'Unlimited Stops Within Singapore',
          'Flexible Route Customized to Your Schedule',
          'Electronic Road Pricing (ERP) Included'
        ]
      }
    }
    if (isCity) {
      return {
        category: 'cityTour',
        title: rDesc && !['citytour', 'city tour', 'city_tour', 'transfer'].includes(rDesc.toLowerCase()) ? rDesc : 'Singapore Half-Day City Highlights Tour (3 Hours)',
        vehicleName: mode === 'sic' ? 'Shared Coach (SIC)' : 'Private 13-Seater Minibus',
        badge: mode === 'sic' ? 'SIC - Shared City Tour' : '13-Seater Minibus (Private)',
        icon: '🏙️',
        isAirport: false,
        isDisposal: false,
        photoUrl: '/images/transfers/city-tour.jpg',
        shortDescription: 'Explore Singapore\'s premier landmarks with a 3-hour guided city orientation tour covering Civic District, Merlion Park, Marina Bay waterfront, and cultural heritage precincts.',
        features: [
          '3-Hour Guided City Orientation',
          'Merlion Park & Marina Bay Lookout',
          'Historic Civic District & Chinatown',
          mode === 'sic' ? 'Shared Coach (Seat-In-Coach)' : '13-Seater Private Minibus'
        ]
      }
    }
    // Default: Point-to-Point Inter-attraction sightseeing transfer
    let cleanTitle = rDesc
    const lowerR = rDesc.toLowerCase()
    if (!rDesc || ['interattraction', 'transfer', 'point-to-point'].includes(lowerR)) {
      cleanTitle = 'Point-to-Point Sightseeing Transfer'
    } else if (lowerR === 'onwards' || lowerR === 'onward') {
      cleanTitle = 'Sightseeing Transfer (Onward Journey)'
    } else if (lowerR === 'return') {
      cleanTitle = 'Sightseeing Return Transfer (To Hotel)'
    }

    return {
      category: 'interAttraction',
      title: cleanTitle,
      vehicleName: mode === 'sic' ? 'Shared Coach (SIC)' : 'Private 13-Seater Minibus',
      badge: mode === 'sic' ? 'SIC - Shared Sightseeing Transfer' : '13-Seater Minibus (Private)',
      icon: '🚗',
      isAirport: false,
      isDisposal: false,
      photoUrl: '/images/transfers/13-seater-minibus.jpg',
      shortDescription: 'Comfortable, air-conditioned point-to-point transit across Singapore with door-to-door pickup and drop-off by experienced chauffeur.',
      features: [
        'Direct Door-to-Door Transit',
        'Air-Conditioned Comfort',
        'Dedicated Luggage Space',
        'Professional Chauffeur Navigation'
      ]
    }
  }

  // Open Quoter Modal for a Template
  const openModal = (tmpl: any) => {
    if (!tmpl) return
    setSelectedTemplate(tmpl)
    setPaxAdults(2)
    setPaxKids(0)
    setChildAges([])
    // Determine initial mode from template policy or assigned transfers in Studio
    let initialMode: 'private13' | 'sic' = 'private13'
    if (tmpl.transferPricingOption === 'sic_only' || tmpl.transferPricingOption === 'both_default_sic') {
      initialMode = 'sic'
    } else if (tmpl.transferPricingOption === 'private_only' || tmpl.transferPricingOption === 'both_default_private') {
      initialMode = 'private13'
    } else {
      // Auto-detect from template transfers assigned in Studio
      const hasAnySic = Array.isArray(tmpl.itinerary) && tmpl.itinerary.some((d: any) => 
        (d.transfers || []).some((t: any) => (t.vehicleType || '').toLowerCase().includes('sic'))
      )
      initialMode = hasAnySic ? 'sic' : 'private13'
    }
    setTransferMode(initialMode)
    setMarkupPercent(0)
    setTravelDate('')
    setGuestName('')
    setGuestPhone('')
    const initialRef = `FW-LAND-${Math.floor(100000 + Math.random() * 900000)}`
    setCurrentProposalRef(initialRef)
    setSavedProposalNum(null)
    setSavingProposal(false)
    setNewTransferHours(4)

    if (tmpl.termsAndInclusions) {
      setTermsText(tmpl.termsAndInclusions)
    }

    if (Array.isArray(tmpl.itinerary)) {
      const cloned = tmpl.itinerary.map((d: any, idx: number) => ({
        dayNumber: d.dayNumber || (idx + 1),
        dayTitle: d.dayTitle || `Day ${idx + 1}`,
        dayDescription: d.dayDescription || '',
        transfers: Array.isArray(d.transfers) ? d.transfers.map((t: any) => {
          const info = getCleanTransferInfo(t, initialMode)
          return {
            serviceType: t.serviceType || 'interAttraction',
            routeDescription: t.routeDescription || t.description || info.title,
            time: t.time || '10:00',
            vehicleType: (t.vehicleType && !t.vehicleType.includes(' - group - ') && !t.vehicleType.includes('SIC - SIC')) ? t.vehicleType : info.vehicleName,
            hours: t.hours || (t.serviceType === 'disposal' ? 4 : undefined)
          }
        }) : [],
        attractions: Array.isArray(d.attractions) ? d.attractions.map((a: any) => {
          const matched = findMatchingAttraction(a.attractionName || '', attractionsList)
          return {
            attractionName: a.attractionName || '',
            adultPrice: a.adultPrice || matched?.adultPrice || 0,
            childPrice: a.childPrice || matched?.childPrice || 0,
            time: a.time || '10:00',
            inclusionsNotes: a.inclusionsNotes || '',
            isOptional: !!a.isOptional
          }
        }) : []
      }))
      setDaywiseItinerary(cloned)
    } else {
      setDaywiseItinerary([])
    }
  }

  // Reactive Calculation
  const calculation = useMemo(() => {
    if (!selectedTemplate) return null

    const totalPax = paxAdults + paxKids
    const isOverCapacity = totalPax > 12

    // 1. Transfer Rates
    const v13Arr = vehiclesList.find(v => (v.vehicleType?.toLowerCase().includes('13') || v.type?.toLowerCase().includes('13')) && (v.serviceName?.toLowerCase().includes('arrival') || v.type?.toLowerCase().includes('arrival')))
    const v13Dep = vehiclesList.find(v => (v.vehicleType?.toLowerCase().includes('13') || v.type?.toLowerCase().includes('13')) && (v.serviceName?.toLowerCase().includes('departure') || v.type?.toLowerCase().includes('departure')))
    const v13City = vehiclesList.find(v => (v.vehicleType?.toLowerCase().includes('13') || v.type?.toLowerCase().includes('13')) && (v.serviceName?.toLowerCase().includes('city') || v.type?.toLowerCase().includes('city')))
    const v13Xfer = vehiclesList.find(v => (v.vehicleType?.toLowerCase().includes('13') || v.type?.toLowerCase().includes('13')) && (v.serviceName?.toLowerCase().includes('transfer') || v.type?.toLowerCase().includes('transfer')))
    const v13Disposal = vehiclesList.find(v => (v.vehicleType?.toLowerCase().includes('13') || v.type?.toLowerCase().includes('13')) && (v.serviceName?.toLowerCase().includes('disposal') || v.type?.toLowerCase().includes('disposal')))

    const rate13Arrival = v13Arr?.pricePerTransfer || 45
    const rate13Departure = v13Dep?.pricePerTransfer || 45
    const rate13City = v13City?.pricePerTransfer || 120
    const rate13Transfer = v13Xfer?.pricePerTransfer || 45
    const rate13Disposal = v13Disposal?.pricePerTransfer || 45

    const isSic = (v: any) => {
      const vType = (v?.vehicleType || '').toLowerCase()
      const tType = (v?.transferType || '').toLowerCase()
      const rType = (v?.rateType || '').toLowerCase()
      const sName = (v?.serviceName || '').toLowerCase()
      const full = `${v?.type || ''} ${v?.compositeKey || ''} ${sName}`.toLowerCase()
      if (
        full.includes('13-seater') ||
        full.includes('24-seater') ||
        full.includes('45-seater') ||
        full.includes('55-seater') ||
        full.includes('sedan') ||
        tType === 'private'
      ) {
        return false
      }
      return (
        vType === 'sic' ||
        tType === 'sic' ||
        rType.includes('per person') ||
        full.includes('sic') ||
        full.includes('seat-in-coach') ||
        full.includes('seat in coach')
      )
    }
    const sicCity = vehiclesList.find(v => isSic(v) && (v.serviceName?.toLowerCase().includes('city') || v.type?.toLowerCase().includes('city')))
    const sicXfer = vehiclesList.find(v => isSic(v) && (v.serviceName?.toLowerCase().includes('transfer') || v.type?.toLowerCase().includes('transfer') || v.serviceName?.toLowerCase().includes('round')))
    const rateSicCity = sicCity?.pricePerTransfer || 15
    const rateSicXfer = sicXfer?.pricePerTransfer || 12

    let transferArrivalCost = 0
    let transferDepartureCost = 0
    let sightseeingTransfersCost = 0

    daywiseItinerary.forEach((d: any) => {
      (d.transfers || []).forEach((tr: any) => {
        const info = getCleanTransferInfo(tr, transferMode)
        if (info.category === 'arrival') {
          transferArrivalCost += rate13Arrival
        } else if (info.category === 'departure') {
          transferDepartureCost += rate13Departure
        } else if (info.category === 'disposal') {
          const hours = Number(tr.hours) > 0 ? Number(tr.hours) : 4
          sightseeingTransfersCost += rate13Disposal * hours
        } else if (info.category === 'cityTour') {
          sightseeingTransfersCost += transferMode === 'sic' ? rateSicCity * Math.max(1, totalPax) : rate13City
        } else {
          sightseeingTransfersCost += transferMode === 'sic' ? rateSicXfer * Math.max(1, totalPax) : rate13Transfer
        }
      })
    })

    const totalTransfersNet = transferArrivalCost + transferDepartureCost + sightseeingTransfersCost

    // 2. Attraction Rates
    let adultTicketCount = paxAdults
    let childTicketCount = 0
    let infantCount = 0

    for (let i = 0; i < paxKids; i++) {
      const age = childAges[i] ?? 5
      if (age <= 2) infantCount++
      else if (age >= 13) adultTicketCount++
      else childTicketCount++
    }

    let totalAttractionsNet = 0
    daywiseItinerary.forEach((d: any) => {
      (d.attractions || []).forEach((a: any) => {
        if (!a.isOptional) {
          const matched = findMatchingAttraction(a.attractionName || '', attractionsList)
          const adPrice = a.adultPrice || matched?.adultPrice || 0
          const chPrice = a.childPrice || matched?.childPrice || 0
          totalAttractionsNet += (adPrice * adultTicketCount) + (chPrice * childTicketCount)
        }
      })
    })

    const totalNetCostSGD = totalTransfersNet + totalAttractionsNet
    const markupFactor = 1 + (markupPercent / 100)
    const totalClientPriceSGD = Math.round(totalNetCostSGD * markupFactor)
    const totalClientPriceINR = Math.round(totalClientPriceSGD * sgdToInrRate)

    const effectiveTotalSeats = Math.max(1, adultTicketCount + childTicketCount)
    const adultQuoteSGD = Math.round(totalClientPriceSGD / (effectiveTotalSeats || 1))
    const childQuoteSGD = childTicketCount > 0 ? Math.round(adultQuoteSGD * 0.75) : 0

    return {
      totalPax,
      isOverCapacity,
      transferArrivalCost,
      transferDepartureCost,
      sightseeingTransfersCost,
      totalTransfersNet,
      rate13Arrival,
      rate13Departure,
      rate13City,
      rate13Transfer,
      rate13Disposal,
      rateSicCity,
      rateSicXfer,
      adultTicketCount,
      childTicketCount,
      infantCount,
      totalAttractionsNet,
      totalNetCostSGD,
      totalClientPriceSGD,
      totalClientPriceINR,
      adultQuoteSGD,
      childQuoteSGD
    }
  }, [selectedTemplate, daywiseItinerary, paxAdults, paxKids, childAges, transferMode, markupPercent, vehiclesList, attractionsList, sgdToInrRate])

  // Attraction & Transfer Management inside Modal
  const addAttractionToDay = (dIdx: number, attr: AttractionItem) => {
    setDaywiseItinerary(prev => {
      const next = [...prev]
      if (next[dIdx]) {
        next[dIdx] = {
          ...next[dIdx],
          attractions: [
            ...(next[dIdx].attractions || []),
            {
              attractionName: attr.name,
              adultPrice: attr.adultPrice || 0,
              childPrice: attr.childPrice || 0,
              time: '14:00',
              inclusionsNotes: 'Admission Ticket Included',
              isOptional: false
            }
          ]
        }
      }
      return next
    })
    setAttractionModalDay(null)
    setSearchAttraction('')
    showToast(`Added ${attr.name} to Day ${dIdx + 1}! 🎟️`, 'success')
  }

  const removeAttractionFromDay = (dIdx: number, aIdx: number) => {
    setDaywiseItinerary(prev => {
      const next = [...prev]
      if (next[dIdx]) {
        next[dIdx] = {
          ...next[dIdx],
          attractions: (next[dIdx].attractions || []).filter((_: any, i: number) => i !== aIdx)
        }
      }
      return next
    })
  }

  const addTransferToDay = (dIdx: number) => {
    if (!newTransferRoute.trim()) {
      showToast('Please enter transfer route description', 'error')
      return
    }
    setDaywiseItinerary(prev => {
      const next = [...prev]
      if (next[dIdx]) {
        next[dIdx] = {
          ...next[dIdx],
          transfers: [
            ...(next[dIdx].transfers || []),
            {
              serviceType: newTransferType,
              routeDescription: newTransferRoute.trim(),
              time: newTransferTime || '14:00',
              hours: newTransferType === 'disposal' ? (newTransferHours || 4) : undefined
            }
          ]
        }
      }
      return next
    })
    setNewTransferDay(null)
    setNewTransferRoute('')
    setNewTransferHours(4)
    showToast(`Added transfer to Day ${dIdx + 1}! 🚗`, 'success')
  }

  const updateTransferHours = (dIdx: number, tIdx: number, hours: number) => {
    const validHours = Math.max(1, Math.min(24, hours || 4))
    setDaywiseItinerary(prev => {
      const next = [...prev]
      if (next[dIdx] && next[dIdx].transfers?.[tIdx]) {
        const trs = [...next[dIdx].transfers]
        trs[tIdx] = { ...trs[tIdx], hours: validHours }
        next[dIdx] = { ...next[dIdx], transfers: trs }
      }
      return next
    })
  }

  const removeTransferFromDay = (dIdx: number, tIdx: number) => {
    setDaywiseItinerary(prev => {
      const next = [...prev]
      if (next[dIdx]) {
        next[dIdx] = {
          ...next[dIdx],
          transfers: (next[dIdx].transfers || []).filter((_: any, i: number) => i !== tIdx)
        }
      }
      return next
    })
  }

  // Handle Save Proposal Directly from Ready-Made Modal
  const handleSaveProposal = async () => {
    if (!selectedTemplate || !calculation) return
    setSavingProposal(true)
    try {
      const payload = {
        proposalNumber: savedProposalNum || currentProposalRef || undefined,
        isTemplateBased: true,
        templateName: selectedTemplate.title || 'Singapore Land Package',
        agentEmail: activeAgent?.email,
        agentId: activeAgent?._id,
        guestName: guestName.trim() || 'Valued Guest',
        guestPhone: guestPhone.trim() || '',
        adults: paxAdults,
        kids: paxKids,
        childAges,
        arrivalDate: travelDate || new Date().toISOString().split('T')[0],
        nights: selectedTemplate.nightsCount || 3,
        hotelRequired: false,
        transferMode,
        markupPercent,
        itineraryNotes: termsText,
        costBreakdown: {
          roomCostTotal: 0,
          suppCostTotal: 0,
          transportTotal: calculation.totalTransfersNet,
          attractionTotal: calculation.totalAttractionsNet,
          mealTotal: 0,
          guideTotal: 0,
          netCost: calculation.totalNetCostSGD,
          totalClientPrice: calculation.totalClientPriceSGD,
          totalClientPriceINR: calculation.totalClientPriceINR,
          adultQuote: calculation.adultQuoteSGD,
          childQuote: calculation.childQuoteSGD
        },
        itinerary: daywiseItinerary.map((d: any) => ({
          ...d,
          transfers: (d.transfers || []).map((tr: any) => {
            const info = getCleanTransferInfo(tr, transferMode)
            return {
              ...tr,
              routeDescription: info.title,
              vehicleType: info.vehicleName,
              serviceType: info.category
            }
          })
        }))
      }

      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSavedProposalNum(data.proposalNumber)
        setCurrentProposalRef(data.proposalNumber)
        showToast(`Proposal ${data.proposalNumber} saved successfully! 🎉`, 'success')
      } else {
        showToast(data.error || 'Failed to save proposal.', 'error')
      }
    } catch (err: any) {
      console.error('handleSaveProposal error:', err)
      showToast('Error saving proposal: ' + (err?.message || 'Network error'), 'error')
    } finally {
      setSavingProposal(false)
    }
  }

  // Shared WhatsApp Text Generator
  const generateWhatsAppProposalText = (params: {
    title: string
    nightsCount: number
    paxAdults: number
    paxKids: number
    childAges?: number[]
    travelDate?: string
    guestName?: string
    guestPhone?: string
    transferMode?: string
    totalPriceSGD: number
    totalPriceINR: number
    adultQuoteSGD: number
    childQuoteSGD?: number
    childTicketCount?: number
    itinerary?: any[]
    terms?: string
    agentCompany?: string
    proposalNumber?: string
  }): string => {
    try {
      const pNum = params.proposalNumber || currentProposalRef || `FW-LAND-${Math.floor(100000 + Math.random() * 900000)}`
      const sep = '━━━━━━━━━━━━━━━━━━━━━━━━━━'
      const title = params.title || 'Singapore Land Package'
      const childAgeStr = (params.paxKids > 0 && params.childAges && params.childAges.length > 0)
        ? ` (Ages: ${params.childAges.slice(0, params.paxKids).join(', ')} yrs)`
        : ''
      const privateTransLabel = 'Private 13-Seater Minibus'
      const sicTransLabel = 'Shared Coach (SIC)'
      const modeLabel = params.transferMode === 'sic' ? sicTransLabel : privateTransLabel

      let t = `✈️ *SINGAPORE LAND PACKAGE ITINERARY*  (Ref: ${pNum})\n`
      t += `*${title}*\n`
      t += `${sep}\n`
      t += `👤 *Guest Name:* ${params.guestName || 'Valued Guest'}\n`
      if (params.guestPhone) t += `📞 *Guest Contact:* ${params.guestPhone}\n`
      t += `👥 *Pax:* ${params.paxAdults} Adult${params.paxAdults !== 1 ? 's' : ''}${params.paxKids > 0 ? ` & ${params.paxKids} Child${params.paxKids !== 1 ? 'ren' : ''}${childAgeStr}` : ''}\n`
      t += `📅 *Travel Date:* ${params.travelDate || 'TBD'} (${params.nightsCount}N/${params.nightsCount + 1}D Land Package)\n`
      t += `🏨 *Hotel:* Not Included (Land Package Only)\n`
      t += `🚐 *Airport Transfers:* ${privateTransLabel} (Arrival & Departure)\n`
      t += `🚌 *Tour Transfers:* ${modeLabel}\n`
      t += `${sep}\n\n`

      t += `💰 *PACKAGE PRICE SUMMARY:*\n`
      t += `💵 *Total Package:* S$ ${(params.totalPriceSGD ?? 0).toLocaleString()}  _(≈ ₹${(params.totalPriceINR ?? 0).toLocaleString('en-IN')})_\n`
      t += `👤 *Per Adult:* S$ ${(params.adultQuoteSGD ?? 0).toLocaleString()}`
      if ((params.childTicketCount ?? 0) > 0 && (params.childQuoteSGD ?? 0) > 0) {
        t += `  |  👶 *Per Child:* S$ ${params.childQuoteSGD!.toLocaleString()}`
      }
      t += `\n${sep}\n\n`

      t += `📅 *DAY-BY-DAY ITINERARY:*\n`
      const itin = Array.isArray(params.itinerary) ? params.itinerary : []
      itin.forEach((day: any, idx: number) => {
        t += `\n*Day ${day.dayNumber || idx + 1}: ${day.dayTitle || 'Tour Day'}*\n`
        if (day.dayDescription) t += `  _${day.dayDescription}_\n`

        const dayItems: { time: string; text: string }[] = []
        ;(day.transfers || []).forEach((tr: any) => {
          const info = getCleanTransferInfo(tr, params.transferMode === 'sic' ? 'sic' : 'private13')
          const timeStr = tr.time ? `${tr.time} — ` : ''
          dayItems.push({
            time: tr.time || '10:00',
            text: `  ${info.icon} ${timeStr}${info.title} (${info.vehicleName})\n`
          })
        })
        ;(day.attractions || []).forEach((attr: any) => {
          const timeStr = attr.time ? `${attr.time} — ` : ''
          const optStr = attr.isOptional ? ' [OPTIONAL]' : ''
          const notes = attr.inclusionsNotes ? ` · ${attr.inclusionsNotes}` : ''
          dayItems.push({
            time: attr.time || '14:00',
            text: `  🎟️ ${timeStr}${attr.attractionName}${optStr}${notes}\n`
          })
        })
        dayItems.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'))
        dayItems.forEach(item => { t += item.text })
      })

      t += `\n${sep}\n`
      const tContent = params.terms || DEFAULT_TERMS
      t += `📌 *${tContent}*\n`
      t += `${sep}\n`
      if (params.agentCompany) {
        t += `🏢 *Quoted by Partner:* ${params.agentCompany}\n`
      }
      t += `_Powered by Flying Wonders Singapore DMC_`
      return t
    } catch (err) {
      console.error('generateWhatsAppProposalText error:', err)
      return ''
    }
  }

  // Generate WhatsApp Text for Modal
  const generateWhatsAppText = () => {
    if (!selectedTemplate) return ''
    const calc = calculation || {
      totalClientPriceSGD: selectedTemplate.startingPriceSGD || 0,
      totalClientPriceINR: Math.round((selectedTemplate.startingPriceSGD || 0) * sgdToInrRate),
      adultQuoteSGD: Math.round((selectedTemplate.startingPriceSGD || 0) / Math.max(1, paxAdults)),
      childQuoteSGD: 0,
      childTicketCount: 0
    }
    return generateWhatsAppProposalText({
      title: selectedTemplate.title || 'Singapore Land Package',
      nightsCount: selectedTemplate.nightsCount || 3,
      paxAdults,
      paxKids,
      childAges,
      travelDate,
      guestName: guestName.trim() || 'Valued Guest',
      guestPhone: guestPhone.trim(),
      transferMode,
      totalPriceSGD: calc.totalClientPriceSGD ?? 0,
      totalPriceINR: calc.totalClientPriceINR ?? 0,
      adultQuoteSGD: calc.adultQuoteSGD ?? 0,
      childQuoteSGD: calc.childQuoteSGD ?? 0,
      childTicketCount: calc.childTicketCount ?? 0,
      itinerary: daywiseItinerary,
      terms: termsText,
      agentCompany: activeAgent?.companyName,
      proposalNumber: savedProposalNum || currentProposalRef
    })
  }

  // Generate WhatsApp Text for Package Card (Standard 2-Pax Quote)
  const generateCardWhatsAppText = (tmpl: any): string => {
    if (!tmpl) return ''
    const startingSGD = tmpl.startingPriceSGD || 0
    const startingINR = Math.round(startingSGD * sgdToInrRate)
    const adultQuote = Math.round(startingSGD / 2)

    return generateWhatsAppProposalText({
      title: tmpl.title || 'Singapore Land Package',
      nightsCount: tmpl.nightsCount || 3,
      paxAdults: 2,
      paxKids: 0,
      childAges: [],
      travelDate: 'TBD (Customizable)',
      transferMode: 'private13',
      totalPriceSGD: startingSGD,
      totalPriceINR: startingINR,
      adultQuoteSGD: adultQuote,
      childQuoteSGD: 0,
      childTicketCount: 0,
      itinerary: tmpl.itinerary || [],
      terms: tmpl.termsAndInclusions || DEFAULT_TERMS,
      agentCompany: activeAgent?.companyName
    })
  }

  // Handle WhatsApp Copy (Modal)
  const handleCopyWhatsApp = async () => {
    try {
      const text = generateWhatsAppText()
      if (!text) {
        showToast('No package details available to copy.', 'error')
        return
      }
      const success = await copyTextWithFallback(text)
      if (success) {
        setCopiedWA(true)
        setTimeout(() => setCopiedWA(false), 3000)
        showToast('Land Package WhatsApp Proposal copied to clipboard! 📋', 'success')
      } else {
        showToast('Failed to copy. Please copy manually or check clipboard permissions.', 'error')
      }
    } catch (err: any) {
      console.error('handleCopyWhatsApp error:', err)
      showToast('Error preparing WhatsApp proposal: ' + (err?.message || 'Error'), 'error')
    }
  }

  // Handle WhatsApp Send (Modal) - Synchronous launch to prevent popup blocking
  const handleSendWhatsApp = () => {
    try {
      const text = generateWhatsAppText()
      if (!text) {
        showToast('No package details available to send.', 'error')
        return
      }
      setSendingWA(true)
      setTimeout(() => setSendingWA(false), 3000)

      // 1. Open WhatsApp synchronously immediately
      openWhatsAppSafely(text, guestPhone)

      // 2. Automatically copy full itemized proposal to clipboard in parallel
      copyTextWithFallback(text).then(copied => {
        if (copied) {
          showToast('Opening WhatsApp... Full proposal also copied to clipboard! 💬📋', 'success')
        } else {
          showToast('Opening WhatsApp with Land Package proposal! 💬', 'info')
        }
      }).catch(() => {
        showToast('Opening WhatsApp with Land Package proposal! 💬', 'info')
      })
    } catch (err: any) {
      console.error('handleSendWhatsApp error:', err)
      showToast('Error preparing WhatsApp proposal: ' + (err?.message || 'Error'), 'error')
    }
  }

  // Handle WhatsApp Copy (Card Level)
  const handleCardCopyWhatsApp = async (tmpl: any) => {
    try {
      const text = generateCardWhatsAppText(tmpl)
      if (!text) {
        showToast('No package details available to copy.', 'error')
        return
      }
      const success = await copyTextWithFallback(text)
      if (success) {
        const id = tmpl._id || tmpl.title
        setCopiedCardId(id)
        setTimeout(() => setCopiedCardId(null), 3000)
        showToast(`Copied "${tmpl.title}" WhatsApp proposal! 📋`, 'success')
      } else {
        showToast('Failed to copy. Please try again.', 'error')
      }
    } catch (err: any) {
      console.error('handleCardCopyWhatsApp error:', err)
      showToast('Could not copy proposal: ' + (err?.message || 'Error'), 'error')
    }
  }

  // Handle WhatsApp Send (Card Level)
  const handleCardSendWhatsApp = (tmpl: any) => {
    try {
      const text = generateCardWhatsAppText(tmpl)
      if (!text) {
        showToast('No package details available to send.', 'error')
        return
      }
      const id = tmpl._id || tmpl.title
      setSendingCardId(id)
      setTimeout(() => setSendingCardId(null), 3000)

      // Open synchronously
      openWhatsAppSafely(text)

      // Copy full proposal
      copyTextWithFallback(text).then(copied => {
        if (copied) {
          showToast(`Opening WhatsApp... "${tmpl.title}" copied to clipboard! 💬📋`, 'success')
        } else {
          showToast('Opening WhatsApp! 💬', 'info')
        }
      }).catch(() => {
        showToast('Opening WhatsApp! 💬', 'info')
      })
    } catch (err: any) {
      console.error('handleCardSendWhatsApp error:', err)
      showToast('Could not open WhatsApp: ' + (err?.message || 'Error'), 'error')
    }
  }

  // Handle PDF Generation
  const handleDownloadPDF = async () => {
    if (!selectedTemplate || !calculation) return
    try {
      showToast('Generating high-resolution Land Package PDF... ⏳', 'info')
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })

      const effectiveRef = savedProposalNum || currentProposalRef || `FW-LAND-${selectedTemplate.nightsCount}N`

      // Preload attraction card photos (480x312 px cover: zero distortion, retina print quality)
      const distinctAttractionNames = Array.from(new Set(
        daywiseItinerary.flatMap((d: any) => (d.attractions || []).map((a: any) => a.attractionName || ''))
      )).filter(Boolean)

      const attractionPhotosMap = new Map<string, string>()
      await Promise.all(
        distinctAttractionNames.map(async (name) => {
          const cleanName = cleanPdfText(name)
          const meta = attractionsMeta[cleanName.toLowerCase().trim()] || attractionsMeta[name.toLowerCase().trim()]
          const photoUrl = meta?.photoUrl || getLocalAttractionPhoto(cleanName) || getLocalAttractionPhoto(name)
          if (photoUrl) {
            const raster = await fetchRasterLogo(photoUrl, 480, 312, true, 0.85, 'cover')
            if (raster?.dataUrl) {
              attractionPhotosMap.set(name.toLowerCase().trim(), raster.dataUrl)
              attractionPhotosMap.set(cleanName.toLowerCase().trim(), raster.dataUrl)
            }
          }
        })
      )

      // Preload transfer card photos (480x312 px cover: zero distortion, retina print quality)
      const transferPhotosMap = new Map<string, string>()
      const transferImageUrls = [
        '/images/hero/singapore-hero-4.jpg',
        '/images/transfers/13-seater-minibus.jpg',
        '/images/transfers/city-tour.jpg'
      ]
      await Promise.all(
        transferImageUrls.map(async (url) => {
          const raster = await fetchRasterLogo(url, 480, 312, true, 0.85, 'cover')
          if (raster?.dataUrl) {
            transferPhotosMap.set(url, raster.dataUrl)
          }
        })
      )

      const PW = 210
      const PH = 297
      const ML = 14
      const MR = 196
      const CW = MR - ML

      const NAVY: [number, number, number] = [10, 34, 64]
      const GOLD: [number, number, number] = [196, 156, 60]
      const GOLD_L: [number, number, number] = [249, 240, 210]
      const CRIM: [number, number, number] = [140, 30, 50]
      const TEAL: [number, number, number] = [32, 100, 96]
      const SLATE: [number, number, number] = [44, 62, 80]
      const TEXT: [number, number, number] = [30, 41, 59]
      const LGRAY: [number, number, number] = [245, 247, 250]
      const WHITE: [number, number, number] = [255, 255, 255]

      let y = 0
      let pageNum = 1

      const setFill = (c: [number, number, number]) => doc.setFillColor(c[0], c[1], c[2])
      const setDraw = (c: [number, number, number]) => doc.setDrawColor(c[0], c[1], c[2])
      const setTxt = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2])
      const font = (w: 'normal' | 'bold' | 'italic', s: number) => {
        doc.setFont('Helvetica', w)
        doc.setFontSize(s)
      }

      const addHeader = () => {
        setFill(NAVY); doc.rect(0, 0, PW, 12, 'F')
        setFill(GOLD); doc.rect(0, 12, PW, 1.2, 'F')
        font('bold', 7.5); setTxt(WHITE)
        doc.text('FLYING WONDERS · SINGAPORE DMC', ML, 8.5)
        font('normal', 7); setTxt(GOLD)
        doc.text('B2B LAND PACKAGE PROPOSAL (NO HOTELS)', PW / 2, 8.5, { align: 'center' })
        doc.text(`Ref: ${effectiveRef}`, MR, 8.5, { align: 'right' })
      }

      const addFooter = () => {
        const fy = PH - 12
        setFill(NAVY); doc.rect(0, fy - 2, PW, 14, 'F')
        setFill(GOLD); doc.rect(0, fy - 2, PW, 0.8, 'F')
        font('normal', 7); setTxt(GOLD)
        doc.text('Flying Wonders · Land Package DMC', ML, fy + 3)
        setTxt(WHITE)
        doc.text(`Page ${pageNum}`, PW / 2, fy + 3, { align: 'center' })
        const today = new Date().toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' })
        font('normal', 7); setTxt(WHITE)
        doc.text(`Generated: ${today}`, MR, fy + 3, { align: 'right' })
      }

      const checkPage = (need = 14) => {
        if (y + need > PH - 20) {
          addFooter()
          doc.addPage()
          pageNum++
          addHeader()
          y = 20
        }
      }

      const sectionTitle = (title: string) => {
        checkPage(16)
        y += 2
        setFill(NAVY); doc.rect(ML, y, CW, 7.5, 'F')
        setFill(GOLD); doc.rect(ML, y, 3, 7.5, 'F')
        font('bold', 9); setTxt(WHITE)
        doc.text(title.toUpperCase(), ML + 6, y + 5.2)
        y += 11
      }

      // ── PAGE 1: COVER HEADER ──
      setFill(NAVY); doc.rect(0, 0, PW, 46, 'F')
      setFill(GOLD); doc.rect(0, 46, PW, 2, 'F')

      font('bold', 15); setTxt(WHITE)
      const agencyName = (activeAgent?.companyName || 'FLYING WONDERS').toUpperCase()
      doc.text(agencyName, ML, 18)

      font('italic', 8.5); setTxt(GOLD)
      doc.text('Singapore Destination Management Specialist · B2B Land Packages', ML, 25)

      font('normal', 7.5); setTxt([200, 215, 230])
      const phone = activeAgent?.phone || '+65 9689 0101'
      const email = activeAgent?.email || 'info.flyingwonders@gmail.com'
      doc.text(`Tel: ${phone}   |   Email: ${email}   |   Web: flyingwonders.com`, ML, 37)

      // Clean luxury badge in top right (Eliminates awkward rotated text!)
      setFill(CRIM); doc.roundedRect(PW - 58, 12, 44, 9, 2, 2, 'F')
      font('bold', 7.5); setTxt(WHITE)
      doc.text('LAND PACKAGE ONLY', PW - 36, 17.8, { align: 'center' })

      font('bold', 7.5); setTxt(GOLD)
      doc.text(`Ref: ${effectiveRef}`, PW - 36, 26, { align: 'center' })

      y = 54

      // ── GUEST / ITINERARY OVERVIEW CARD ──
      setFill(GOLD_L); doc.roundedRect(ML, y, CW, 36, 3, 3, 'F')
      setDraw(GOLD); doc.setLineWidth(0.6); doc.roundedRect(ML, y, CW, 36, 3, 3, 'S')

      font('bold', 8.5); setTxt(CRIM)
      doc.text('QUOTATION PREPARED FOR', ML + 4, y + 6)
      font('bold', 13); setTxt(NAVY)
      doc.text(guestName ? `${guestName} ${guestPhone ? `(${guestPhone})` : ''}` : 'Valued Guest', ML + 4, y + 13)

      const childAgeStr = paxKids > 0 && childAges.length > 0 ? ` (Ages: ${childAges.slice(0, paxKids).join(',')})` : ''
      const chips = [
        { label: 'PAX CAPACITY', val: `${paxAdults} Adult${paxAdults !== 1 ? 's' : ''}${paxKids > 0 ? ` + ${paxKids} Child${childAgeStr}` : ''}` },
        { label: 'TRAVEL DATE', val: travelDate ? new Date(travelDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD' },
        { label: 'PACKAGE DURATION', val: `${selectedTemplate.nightsCount + 1}D / ${selectedTemplate.nightsCount}N` },
        { label: 'HOTEL STAY', val: 'Not Included (Land Only)' },
      ]
      const chipW = CW / chips.length
      chips.forEach((c, i) => {
        const cx = ML + i * chipW
        setFill(WHITE); doc.roundedRect(cx + 2, y + 18, chipW - 4, 14, 2, 2, 'F')
        font('bold', 6.5); setTxt(SLATE)
        doc.text(c.label, cx + (chipW / 2), y + 23, { align: 'center' })
        font('bold', 7.5); setTxt(NAVY)
        doc.text(c.val, cx + (chipW / 2), y + 29, { align: 'center' })
      })

      y += 42

      // ── LAND PACKAGE PRICE BAR ──
      setFill(NAVY); doc.roundedRect(ML, y, CW, 20, 2.5, 2.5, 'F')
      const priceCols = [
        { lbl: 'PER ADULT (SGD)', val: `S$ ${calculation.adultQuoteSGD.toLocaleString()}` },
        { lbl: calculation.childTicketCount > 0 ? 'PER CHILD (SGD)' : 'TOTAL PACKAGE', val: calculation.childTicketCount > 0 ? `S$ ${calculation.childQuoteSGD.toLocaleString()}` : `S$ ${calculation.totalClientPriceSGD.toLocaleString()}` },
        { lbl: 'INR EQUIVALENT', val: `Rs. ${calculation.totalClientPriceINR.toLocaleString('en-IN')}` }
      ]
      const pcW = CW / priceCols.length
      priceCols.forEach((pc, i) => {
        const px = ML + i * pcW
        if (i > 0) { setDraw(GOLD); doc.setLineWidth(0.3); doc.line(px, y + 3, px, y + 17) }
        font('normal', 7); setTxt(GOLD)
        doc.text(pc.lbl, px + pcW / 2, y + 6.5, { align: 'center' })
        font('bold', 12); setTxt(WHITE)
        doc.text(pc.val, px + pcW / 2, y + 15, { align: 'center' })
      })

      y += 26

      // ── INCLUSIONS & EXCLUSIONS ──
      sectionTitle('LAND PACKAGE INCLUSIONS & EXCLUSIONS')

      const inclItems = [
        'Land Package Only (Hotel Accommodation excluded)',
        transferMode === 'sic'
          ? 'Airport Arrival & Departure by Private 13-Seater Minibus; Sightseeing by Shared Coach (SIC)'
          : 'Airport Arrival & Departure + All Sightseeing by Private 13-Seater Minibus',
        'English-speaking driver assistance for scheduled transfers',
      ]
      const exclItems = [
        'Hotel Accommodation & Daily Breakfast',
        'International / Domestic Airfare',
        'Meals (Lunch / Dinner) & Personal Expenses',
        'Licensed Tour Guide (Available on Request)',
        'Midnight Transfer Surcharge (22:00 - 07:00)',
        'Singapore Entry Visa Fees & Travel Insurance'
      ]

      const colW = (CW - 4) / 2
      const boxH = 36
      checkPage(boxH + 4)

      // INCLUDED
      setFill([230, 248, 237]); doc.roundedRect(ML, y, colW, boxH, 2, 2, 'F')
      setDraw(TEAL); doc.setLineWidth(0.5); doc.roundedRect(ML, y, colW, boxH, 2, 2, 'S')
      setFill(TEAL); doc.rect(ML, y, 2.5, boxH, 'F')
      font('bold', 8); setTxt(TEAL)
      doc.text('INCLUDED IN THIS LAND PACKAGE', ML + 5, y + 5.5)
      let curY = y + 11
      font('normal', 6.8); setTxt(SLATE)
      inclItems.forEach(item => {
        const lines = doc.splitTextToSize(`• ${item}`, colW - 8)
        doc.text(lines, ML + 5, curY)
        curY += lines.length * 3.5
      })

      // EXCLUDED
      const exX = ML + colW + 4
      setFill([255, 240, 240]); doc.roundedRect(exX, y, colW, boxH, 2, 2, 'F')
      setDraw(CRIM); doc.setLineWidth(0.5); doc.roundedRect(exX, y, colW, boxH, 2, 2, 'S')
      setFill(CRIM); doc.rect(exX, y, 2.5, boxH, 'F')
      font('bold', 8); setTxt(CRIM)
      doc.text('EXCLUDED FROM THIS PACKAGE', exX + 5, y + 5.5)
      let curExY = y + 11
      font('normal', 6.8); setTxt(SLATE)
      exclItems.forEach(item => {
        const lines = doc.splitTextToSize(`• ${item}`, colW - 8)
        doc.text(lines, exX + 5, curExY)
        curExY += lines.length * 3.5
      })

      y += boxH + 6

      // ── DAY-BY-DAY ITINERARY ──
      sectionTitle('DAY-BY-DAY LAND ITINERARY')

      daywiseItinerary.forEach((day: any, dIdx: number) => {
        // 1. Merge transfers and attractions into a unified chronological day timeline
        const dayEvents: any[] = []

        ;(day.transfers || []).forEach((t: any) => {
          const info = getCleanTransferInfo(t, transferMode)
          const photoData = transferPhotosMap.get(info.photoUrl) || null
          dayEvents.push({
            time: t.time || '10:00',
            type: 'transfer',
            category: info.category,
            title: cleanPdfText(info.title),
            vehicleName: info.vehicleName,
            badge: info.badge,
            hours: t.hours,
            shortDescription: info.shortDescription,
            features: info.features,
            photoData
          })
        })

        ;(day.attractions || []).forEach((a: any) => {
          const rawName = a.attractionName || 'Attraction'
          const cleanName = cleanPdfText(rawName)
          const meta = attractionsMeta[cleanName.toLowerCase().trim()] || attractionsMeta[rawName.toLowerCase().trim()]
          const photoData = attractionPhotosMap.get(cleanName.toLowerCase().trim()) || attractionPhotosMap.get(rawName.toLowerCase().trim()) || null

          dayEvents.push({
            time: a.time || '14:00',
            type: 'attraction',
            title: cleanName,
            adultQty: paxAdults,
            childQty: paxKids,
            notes: a.inclusionsNotes ? cleanPdfText(a.inclusionsNotes) : 'Admission Ticket Included',
            isOptional: !!a.isOptional,
            meta,
            photoData
          })
        })

        // 2. Sort strictly chronologically by 24h time!
        dayEvents.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'))

        checkPage(24)

        // Day Header
        setFill(GOLD); doc.roundedRect(ML, y, CW, 7, 2, 2, 'F')
        font('bold', 8.5); setTxt(NAVY)
        doc.text(`DAY ${day.dayNumber || dIdx + 1}: ${(cleanPdfText(day.dayTitle) || 'Tour Day').toUpperCase()}`, ML + 4, y + 4.8)
        y += 9

        // Render each item chronologically
        dayEvents.forEach((item: any) => {
          if (item.type === 'transfer') {
            const hasPhoto = !!item.photoData
            const imgW = 34
            const imgH = 22
            const textW = hasPhoto ? CW - imgW - 14 : CW - 24

            font('bold', 8.2)
            const titleLines = doc.splitTextToSize(item.title, textW)
            const titleH = titleLines.length * 3.6

            font('bold', 6.8)
            const badgeStr = `Service: ${item.vehicleName} · ${item.badge}`
            const badgeLines = doc.splitTextToSize(badgeStr, textW)
            const badgeH = badgeLines.length * 3.0

            const descText = item.shortDescription || ''
            font('italic', 6.5)
            const descLines = descText ? doc.splitTextToSize(descText, textW) : []
            const descH = descLines.length > 0 ? descLines.length * 2.9 + 1 : 0

            const inclusions: string[] = Array.isArray(item.features) ? item.features : []
            const incRows = Math.ceil(inclusions.length / 2)
            const incH = inclusions.length > 0 ? (2.8 + incRows * 2.8) : 0

            const contentH = 4 + titleH + badgeH + descH + incH + 3
            const cardH = Math.max(hasPhoto ? 26 : 14, contentH)
            checkPage(cardH + 2)

            // Card container: Subtle luxury teal card
            setFill([240, 253, 250]); doc.roundedRect(ML, y, CW, cardH, 1.5, 1.5, 'F')
            setDraw(TEAL); doc.setLineWidth(0.3); doc.roundedRect(ML, y, CW, cardH, 1.5, 1.5, 'S')
            setFill(TEAL); doc.rect(ML, y, 2.5, cardH, 'F')

            // Time pill
            setFill(TEAL); doc.roundedRect(ML + 5, y + 2.5, 13, 4.5, 1, 1, 'F')
            font('bold', 6.2); setTxt(WHITE)
            doc.text(item.time, ML + 11.5, y + 5.6, { align: 'center' })

            // Transfer Photo (on the right)
            if (hasPhoto && item.photoData) {
              const imgX = MR - imgW - 2
              const imgY = y + (cardH - imgH) / 2
              try {
                doc.addImage(item.photoData, 'JPEG', imgX, imgY, imgW, imgH, undefined, 'MEDIUM')
                setDraw([204, 251, 241]); doc.setLineWidth(0.2)
                doc.rect(imgX, imgY, imgW, imgH, 'S')
              } catch (e) {}
            }

            // Route Title
            let ty = y + 5.5
            font('bold', 8.2); setTxt(NAVY)
            doc.text(titleLines, ML + 21, ty)
            ty += titleH

            // Vehicle Badge
            font('bold', 6.8); setTxt([13, 148, 136])
            doc.text(badgeLines, ML + 21, ty)
            ty += badgeH

            // Editorial Narrative
            if (descLines.length > 0) {
              font('italic', 6.5); setTxt(TEXT)
              doc.text(descLines, ML + 21, ty)
              ty += descH
            }

            // Features Inclusions (2 columns)
            if (inclusions.length > 0) {
              const colW = (textW - 22) / 2
              font('normal', 6.3); setTxt([15, 118, 110])
              for (let i = 0; i < inclusions.length; i += 2) {
                doc.text(`• ${inclusions[i]}`, ML + 21, ty)
                if (inclusions[i + 1]) {
                  doc.text(`• ${inclusions[i + 1]}`, ML + 21 + colW, ty)
                }
                ty += 2.8
              }
            }

            y += cardH + 2
          } else if (item.type === 'attraction') {
            const hasPhoto = !!item.photoData
            const imgW = 34
            const imgH = 22
            const textW = hasPhoto ? CW - imgW - 14 : CW - 28

            font('bold', 8.5)
            const titleLines = doc.splitTextToSize(item.title, textW)
            const titleH = titleLines.length * 3.8

            const ticketStr = `Tickets: x${item.adultQty} Adult${item.childQty > 0 ? ` + x${item.childQty} Child` : ''} · ${item.notes}`
            font('normal', 6.8)
            const noteLines = doc.splitTextToSize(ticketStr, textW)
            const noteH = noteLines.length * 3.2

            const descText = item.meta?.shortDescription || ''
            font('italic', 6.5)
            const descLines = descText ? doc.splitTextToSize(descText, textW) : []
            const descH = descLines.length > 0 ? descLines.length * 3.0 + 1 : 0

            const contentH = 4 + titleH + noteH + descH + 3
            const cardH = Math.max(hasPhoto ? 26 : 14, contentH)
            checkPage(cardH + 2)

            // Card container
            setFill([255, 252, 242]); doc.roundedRect(ML, y, CW, cardH, 1.5, 1.5, 'F')
            setDraw(GOLD); doc.setLineWidth(0.3); doc.roundedRect(ML, y, CW, cardH, 1.5, 1.5, 'S')
            setFill(GOLD); doc.rect(ML, y, 2.5, cardH, 'F')

            // Optional photo
            if (hasPhoto && item.photoData) {
              try {
                const imgX = MR - imgW - 2
                const imgY = y + (cardH - imgH) / 2
                doc.addImage(item.photoData, 'JPEG', imgX, imgY, imgW, imgH, undefined, 'MEDIUM')
                setDraw([217, 180, 110]); doc.setLineWidth(0.2)
                doc.rect(imgX, imgY, imgW, imgH, 'S')
              } catch (e) {}
            }

            // Time pill
            setFill(GOLD); doc.roundedRect(ML + 5, y + 2.5, 14, 5, 1, 1, 'F')
            font('bold', 6.5); setTxt(NAVY)
            doc.text(item.time, ML + 12, y + 6, { align: 'center' })

            // Attraction Title
            font('bold', 8.5); setTxt(NAVY)
            doc.text(titleLines, ML + 22, y + 6)

            // Tickets & Inclusions note
            font('normal', 6.8); setTxt([120, 53, 15])
            doc.text(noteLines, ML + 22, y + 6 + titleH)

            // Editorial description if available
            if (descLines.length > 0) {
              font('italic', 6.5); setTxt(SLATE)
              doc.text(descLines, ML + 22, y + 6 + titleH + noteH)
            }

            y += cardH + 2.5
          }
        })

        y += 2
      })

      // ── TERMS & CONDITIONS CARD (Clean Full-Width, High Contrast, Zero Overlap) ──
      let readyTerms = [
        'Land Package Only: Hotel accommodation is not included.',
        'Transfers: Airport arrival & departure transfers are provided by Private 13-Seater Minibus. Sightseeing transfers are as selected (SIC / Private 13-Seater). Surcharges applicable for flights between 22:00 - 07:00 hours.',
        'Customizations: For hotel room bookings, meal plans, licensed English/Hindi guides, or coach upgrades for groups >12 Pax, please contact DMC.'
      ]
      if (termsText && termsText.trim()) {
        const parsed = termsText
          .trim()
          .split('\n')
          .map((l: string) => cleanPdfText(l.trim().replace(/^Terms & Inclusions:?\s*/i, '').replace(/^[•\-\*\d\.\s]+\s*/, '').trim()))
          .filter(Boolean)
        if (parsed.length > 0) readyTerms = parsed
      }

      font('normal', 6.8)
      let totalTermLines = 0
      const splitTerms = readyTerms.map((t: string, i: number) => {
        const cleanT = cleanPdfText(t)
        const l = doc.splitTextToSize(`${i + 1}.  ${cleanT}`, CW - 12)
        totalTermLines += l.length
        return l
      })
      const termCardH = Math.max(22, 7.5 + totalTermLines * 3.4 + 3)
      checkPage(termCardH + 3)

      setFill([248, 250, 252]); doc.roundedRect(ML, y, CW, termCardH, 2, 2, 'F')
      setDraw([226, 232, 240]); doc.setLineWidth(0.4); doc.roundedRect(ML, y, CW, termCardH, 2, 2, 'S')
      setFill(NAVY); doc.rect(ML, y, 2.5, termCardH, 'F')

      font('bold', 8); setTxt(NAVY)
      doc.text('TERMS & CONDITIONS · IMPORTANT BOOKING NOTES', ML + 5, y + 5.2)

      let tY = y + 9.2
      splitTerms.forEach((lines: string[]) => {
        font('normal', 6.8); setTxt(SLATE)
        doc.text(lines, ML + 5, tY)
        tY += lines.length * 3.3 + 0.8
      })
      y += termCardH + 3

      addFooter()
      const sanitizedGuest = (guestName || 'Proposal').trim().replace(/[^a-zA-Z0-9_-]/g, '_')
      doc.save(`FW-LAND-${sanitizedGuest}-${effectiveRef}.pdf`)
      showToast('Land Package PDF downloaded successfully! 📄', 'success')
    } catch (err) {
      console.error('PDF generation error:', err)
      showToast('Failed to generate PDF. Please try again.', 'error')
    }
  }

  // Load into full builder
  const handleOpenInBuilder = (tmpl: any) => {
    if (!tmpl) return
    const isModalTmpl = selectedTemplate && selectedTemplate._id === tmpl._id
    const draft = {
      templateTitle: tmpl.title || '',
      nightsCount: tmpl.nightsCount || 3,
      guestName: isModalTmpl ? (guestName || '') : '',
      guestPhone: isModalTmpl ? (guestPhone || '') : '',
      adults: isModalTmpl ? (paxAdults || 2) : 2,
      kids: isModalTmpl ? (paxKids || 0) : 0,
      childAges: isModalTmpl ? (childAges || []) : [],
      arrivalDate: isModalTmpl ? (travelDate || '') : '',
      transferMode: isModalTmpl ? transferMode : 'private13',
      itinerary: (isModalTmpl && Array.isArray(daywiseItinerary) && daywiseItinerary.length > 0)
        ? daywiseItinerary.map((d: any) => ({
            ...d,
            transfers: (d.transfers || []).map((tr: any) => {
              const info = getCleanTransferInfo(tr, transferMode)
              return {
                ...tr,
                routeDescription: info.title,
                vehicleType: info.vehicleName,
                serviceType: info.category
              }
            })
          }))
        : (tmpl.itinerary || []),
      termsAndInclusions: isModalTmpl ? termsText : (tmpl.termsAndInclusions || '')
    }
    try {
      sessionStorage.setItem('pending_ready_template', JSON.stringify(draft))
    } catch (e) {
      console.warn('Could not store pending_ready_template:', e)
    }
    router.push(`/custom-package?template=${encodeURIComponent(tmpl.title || '')}`)
  }

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      if (t.hideTemplate) return false
      if (filterDuration !== 'all' && String(t.nightsCount) !== filterDuration) return false
      if (filterCategory !== 'all' && t.category !== filterCategory) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = (t.title || '').toLowerCase().includes(q)
        const matchSummary = (t.summary || '').toLowerCase().includes(q)
        const matchItin = Array.isArray(t.itinerary) && t.itinerary.some((d: any) =>
          (d.dayTitle || '').toLowerCase().includes(q) ||
          (d.attractions || []).some((a: any) => (a.attractionName || '').toLowerCase().includes(q))
        )
        return matchTitle || matchSummary || matchItin
      }
      return true
    })
  }, [templates, filterDuration, filterCategory, searchQuery])

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#1E293B', fontFamily: 'var(--font-inter), sans-serif' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          background: toast.type === 'error' ? '#EF4444' : toast.type === 'info' ? '#3B82F6' : '#10B981',
          color: '#FFF',
          fontSize: '0.88rem',
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Banner (Compact Executive Layout on Wide Canvas) */}
      <section style={{
        background: 'linear-gradient(135deg, #0A2240 0%, #0F4C3A 100%)',
        color: '#FFF',
        padding: '1.25rem 1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: '1540px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(196,156,60,0.2)', border: '1px solid rgba(196,156,60,0.45)', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
              <Sparkles size={12} /> Ready-Made B2B Land Packages (No Hotels)
            </div>

            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem', lineHeight: 1.2 }}>
              Instant Singapore Land Package Quotations
            </h1>

            <p style={{ fontSize: '0.86rem', color: '#CBD5E1', maxWidth: '820px', lineHeight: 1.45, margin: 0 }}>
              Pre-configured B2B ground itineraries tailored for travel partners. Includes private 13-seater minibus airport transfers, verified sightseeing admissions, and SIC or private tour transport—<strong>without hotel accommodation</strong>.
            </p>
          </div>

          {/* Value Highlights Pill Row (Compact) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
              <Bus size={14} color="#FCD34D" />
              <span>Private 13-Seater Transfers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
              <Users size={14} color="#FCD34D" />
              <span>Optimized for FITs up to 12 Pax</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
              <CheckCircle2 size={14} color="#FCD34D" />
              <span>Instant WhatsApp & PDF Proposals</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area (Wide Canvas) */}
      <main style={{ maxWidth: '1540px', margin: '0 auto', padding: '1.25rem 1.5rem 3.5rem' }}>
        
        {/* Controls: Filters & Search */}
        <div style={{ background: '#FFF', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            
            {/* Duration Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration:</span>
              {(['all', '3', '4', '5'] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFilterDuration(d)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: filterDuration === d ? '#0F4C3A' : '#F1F5F9',
                    color: filterDuration === d ? '#FFF' : '#475569',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {d === 'all' ? 'All Durations' : `${d}N / ${parseInt(d) + 1}D`}
                </button>
              ))}
            </div>

            {/* Live Search Bar */}
            <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 300px', maxWidth: '400px' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search packages, attractions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 1rem 0.55rem 2.25rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  outline: 'none',
                  fontSize: '0.85rem',
                  background: '#FFF',
                  color: '#1E293B',
                  fontFamily: 'var(--font-inter), sans-serif'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  ✕
                </button>
              )}
            </div>

          </div>

          {/* Theme / Category Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Theme:</span>
            {(['all', 'popular', 'family', 'luxury', 'budget', 'mice'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  background: filterCategory === cat ? '#0F4C3A' : '#F1F5F9',
                  color: filterCategory === cat ? '#FFF' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat === 'all' ? 'All Themes' : cat}
              </button>
            ))}
          </div>

        </div>

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <p style={{ fontWeight: 700 }}>Loading Ready-Made Packages...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTemplates.length === 0 && (
          <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.5rem' }}>No Packages Match Your Filter</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Try clearing your search query or selecting &quot;All Durations&quot; to see available ready-made itineraries.
            </p>
            <button
              type="button"
              onClick={() => { setFilterDuration('all'); setFilterCategory('all'); setSearchQuery('') }}
              style={{ padding: '0.6rem 1.25rem', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Package Card Grid (Wide Canvas: 3-4 cards across on modern desktop) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {filteredTemplates.map(tmpl => {
            const tmplId = tmpl._id || tmpl.title
            const hasVideo = !!tmpl.videoUrl
            const activeTab = (hasVideo && activeMediaTabs[tmplId]) ? activeMediaTabs[tmplId] : 'photo'
            const videoInfo = hasVideo ? getEmbedVideoInfo(tmpl.videoUrl) : null

            return (
            <div
              key={tmplId}
              onClick={() => openModal(tmpl)}
              style={{
                background: '#FFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <div>
                {/* Cover Image / Video: 100% Uncropped with ambient backdrop */}
                <div style={{ height: '220px', width: '100%', position: 'relative', overflow: 'hidden', background: '#091A2F' }}>
                  {/* Blurred ambient backdrop to fill letterboxing seamlessly */}
                  <img
                    src={tmpl.coverImage || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'}
                    alt=""
                    aria-hidden="true"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(16px)', opacity: 0.45, transform: 'scale(1.15)' }}
                  />

                  {/* Media Content: Video Embed or Foreground Image */}
                  {hasVideo && activeTab === 'video' && videoInfo?.embedUrl ? (
                    <div
                      style={{ position: 'relative', width: '100%', height: '100%', background: '#000', zIndex: 2 }}
                      onClick={e => e.stopPropagation()}
                    >
                      {videoInfo.type === 'mp4' ? (
                        <video
                          src={videoInfo.embedUrl}
                          controls
                          playsInline
                          preload="metadata"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <iframe
                          src={videoInfo.embedUrl}
                          title={`${tmpl.title} Video Preview`}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      )}
                    </div>
                  ) : (
                    /* Foreground Image: 100% uncropped */
                    <img
                      src={tmpl.coverImage || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'}
                      alt={tmpl.title}
                      style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }}
                    />
                  )}

                  {/* Badge Text */}
                  {tmpl.badgeText && (
                    <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: '#D4AF37', color: '#111', fontWeight: 800, fontSize: '0.72rem', padding: '0.22rem 0.6rem', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', zIndex: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                      {tmpl.badgeText}
                    </span>
                  )}

                  {/* Option A: Interactive Media Switcher Pill [ 📷 Photo | ▶ Video ] */}
                  {hasVideo && (
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        background: 'rgba(10, 34, 64, 0.85)',
                        backdropFilter: 'blur(8px)',
                        padding: '3px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        zIndex: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.35)'
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMediaTabs(prev => ({ ...prev, [tmplId]: 'photo' }))
                        }}
                        style={{
                          background: activeTab === 'photo' ? '#0F4C3A' : 'transparent',
                          color: activeTab === 'photo' ? '#FFF' : '#CBD5E1',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '3px 8px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        📷 Photo
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMediaTabs(prev => ({ ...prev, [tmplId]: 'video' }))
                        }}
                        style={{
                          background: activeTab === 'video' ? '#E11D48' : 'transparent',
                          color: activeTab === 'video' ? '#FFF' : '#CBD5E1',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '3px 8px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        ▶ Video
                      </button>
                    </div>
                  )}

                  {/* Duration Pill */}
                  <span style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', background: 'rgba(15,76,58,0.92)', color: '#FFF', fontWeight: 800, fontSize: '0.75rem', padding: '0.25rem 0.7rem', borderRadius: '16px', backdropFilter: 'blur(6px)', zIndex: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>
                    🌙 {tmpl.nightsCount}N / {tmpl.nightsCount + 1}D Land
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '1.25rem 1.35rem 1rem' }}>
                  <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0A2240', margin: '0 0 0.5rem', lineHeight: 1.3 }}>
                    {tmpl.title}
                  </h2>

                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55, margin: '0 0 1.15rem', textAlign: 'justify', textJustify: 'inter-word' }}>
                    {tmpl.summary}
                  </p>

                  {/* Highlights overview: Stacked vertically one below the other */}
                  {Array.isArray(tmpl.itinerary) && tmpl.itinerary.length > 0 && (
                    <div style={{ background: '#F8FAFC', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F4C3A', display: 'block', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Included Daywise Highlights:
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {tmpl.itinerary.map((d: any, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: '0.5rem',
                              background: '#FFF',
                              border: '1px solid #E2E8F0',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.76rem'
                            }}
                          >
                            <span style={{
                              fontWeight: 800,
                              color: '#0F4C3A',
                              background: '#E6F4EA',
                              border: '1px solid #A7F3D0',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              fontSize: '0.68rem',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}>
                              Day {idx + 1}
                            </span>
                            <span style={{ color: '#1E293B', fontWeight: 600, lineHeight: 1.35, textAlign: 'justify', flex: 1 }}>
                              {d.dayTitle || `Day ${idx + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Starting Price SGD / INR */}
                  {tmpl.startingPriceSGD > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Est. Starting Rate:</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                        S$ {tmpl.startingPriceSGD.toLocaleString()}{' '}
                        <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 600 }}>
                          (₹{Math.round(tmpl.startingPriceSGD * sgdToInrRate).toLocaleString('en-IN')})
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ padding: '1rem 1.25rem 1.25rem', borderTop: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => openModal(tmpl)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #0F4C3A 0%, #059669 100%)',
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 3px 8px rgba(5,150,105,0.2)'
                  }}
                >
                  <span>⚡</span> Instant Land Quote (No Hotels)
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCardCopyWhatsApp(tmpl)
                    }}
                    title="Quick copy 2-Pax standard land quote for WhatsApp"
                    style={{
                      background: copiedCardId === (tmpl._id || tmpl.title) ? '#059669' : '#FEF3C7',
                      color: copiedCardId === (tmpl._id || tmpl.title) ? '#FFF' : '#92400E',
                      border: '1px solid ' + (copiedCardId === (tmpl._id || tmpl.title) ? '#059669' : '#FDE68A'),
                      padding: '0.45rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s ease',
                      fontFamily: 'var(--font-inter), sans-serif'
                    }}
                  >
                    {copiedCardId === (tmpl._id || tmpl.title) ? <Check size={13} /> : <CopyCheck size={13} />}
                    <span>{copiedCardId === (tmpl._id || tmpl.title) ? 'Copied! ✓' : 'Copy WA'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCardSendWhatsApp(tmpl)
                    }}
                    title="Send standard quote directly on WhatsApp"
                    style={{
                      background: sendingCardId === (tmpl._id || tmpl.title) ? '#047857' : '#D1FAE5',
                      color: sendingCardId === (tmpl._id || tmpl.title) ? '#FFF' : '#065F46',
                      border: '1px solid ' + (sendingCardId === (tmpl._id || tmpl.title) ? '#047857' : '#A7F3D0'),
                      padding: '0.45rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s ease',
                      fontFamily: 'var(--font-inter), sans-serif'
                    }}
                  >
                    <MessageCircle size={13} />
                    <span>{sendingCardId === (tmpl._id || tmpl.title) ? 'Opening... 💬' : 'WhatsApp'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenInBuilder(tmpl)
                  }}
                  style={{
                    width: '100%',
                    background: '#FFF',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    padding: '0.45rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span>⚙️</span> Customize with Hotels in Builder
                </button>
              </div>

            </div>
            )
          })}
        </div>

      </main>

      {/* ── LAND PACKAGE QUOTER MODAL ── */}
      {selectedTemplate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setSelectedTemplate(null)}
        >
          <div
            style={{
              background: '#FFF',
              borderRadius: '14px',
              maxWidth: '1360px',
              width: '96vw',
              height: '92vh',
              maxHeight: '94vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header (Ultra-Compact Streamlined Bar) */}
            <div style={{
              background: 'linear-gradient(135deg, #0A2240 0%, #0F4C3A 100%)',
              color: '#FFF',
              padding: '0.65rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-playfair), serif' }}>
                  {selectedTemplate.title}
                </h3>
                <span style={{ background: 'rgba(255,255,255,0.15)', color: '#FFF', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                  🌙 {selectedTemplate.nightsCount}N / {selectedTemplate.nightsCount + 1}D (Max 12 Pax)
                </span>
                <span style={{ background: '#D4AF37', color: '#111', fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Land Package Only
                </span>
                <span style={{ background: savedProposalNum ? '#059669' : '#0284C7', color: '#FFF', fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                  Ref: {savedProposalNum || currentProposalRef}
                </span>
                {isAdmin && (
                  <span style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    👑 Admin Mode
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#E2E8F0', background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span>👤 <strong style={{ color: '#FCD34D' }}>{guestName.trim() || 'Valued Guest'}</strong></span>
                  {guestPhone.trim() && <span>· 📞 {guestPhone.trim()}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  title="Close Quoter"
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FFF', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              {/* Over 12 Pax Warning Banner */}
              {calculation && calculation.isOverCapacity && (
                <div style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldAlert size={24} color="#DC2626" />
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#991B1B', display: 'block' }}>
                        Group size ({calculation.totalPax} Pax) exceeds 12-Pax capacity!
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#B91C1C' }}>
                        Ready-made land packages use 13-seater minibuses. For groups &gt;12 pax, please use our Custom Builder to select 20, 40, or 45-seater coaches.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenInBuilder(selectedTemplate)}
                    style={{ background: '#DC2626', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Open in Builder Workspace →
                  </button>
                </div>
              )}

              {/* Top Controls Toolbar: Traveler Details + Transport Policy */}
              <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Guest Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', background: '#FFF', color: '#1E293B', fontFamily: 'var(--font-inter), sans-serif' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Guest Phone</label>
                    <input
                      type="text"
                      placeholder="+91 9876543210"
                      value={guestPhone}
                      onChange={e => setGuestPhone(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', background: '#FFF', color: '#1E293B', fontFamily: 'var(--font-inter), sans-serif' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Arrival Date</label>
                    <input
                      type="date"
                      value={travelDate}
                      onChange={e => setTravelDate(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', background: '#FFF', color: '#1E293B', fontFamily: 'var(--font-inter), sans-serif' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Adults (1-12)</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '6px', height: '32px' }}>
                      <button type="button" onClick={() => setPaxAdults(p => Math.max(1, p - 1))} style={{ padding: '0 0.55rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 800, color: '#475569', height: '100%' }}>−</button>
                      <span style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: '0.82rem' }}>{paxAdults}</span>
                      <button type="button" onClick={() => setPaxAdults(p => Math.min(12, p + 1))} style={{ padding: '0 0.55rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 800, color: '#475569', height: '100%' }}>+</button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Children (0-11)</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '6px', height: '32px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const next = Math.max(0, paxKids - 1)
                          setPaxKids(next)
                          setChildAges(prev => prev.slice(0, next))
                        }}
                        style={{ padding: '0 0.55rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 800, color: '#475569', height: '100%' }}
                      >
                        −
                      </button>
                      <span style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: '0.82rem' }}>{paxKids}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = Math.min(11, paxKids + 1)
                          setPaxKids(next)
                          setChildAges(prev => {
                            const c = [...prev]
                            while (c.length < next) c.push(5)
                            return c
                          })
                        }}
                        style={{ padding: '0 0.55rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 800, color: '#475569', height: '100%' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Transport Policy</label>
                    <div style={{ display: 'flex', height: '32px', alignItems: 'center' }}>
                      {selectedTemplate?.transferPricingOption === 'private_only' ? (
                        <span style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800, background: '#0F4C3A', color: '#FFF', whiteSpace: 'nowrap' }}>
                          🚐 Fixed Private 13-Seater
                        </span>
                      ) : selectedTemplate?.transferPricingOption === 'sic_only' ? (
                        <span style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800, background: '#0F4C3A', color: '#FFF', whiteSpace: 'nowrap' }}>
                          🚌 Fixed SIC Sightseeing
                        </span>
                      ) : (
                        <div style={{ display: 'inline-flex', background: '#E2E8F0', padding: '2px', borderRadius: '6px', width: '100%' }}>
                          <button
                            type="button"
                            onClick={() => setTransferMode('private13')}
                            style={{
                              flex: 1,
                              padding: '0.25rem 0.45rem',
                              borderRadius: '5px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              border: 'none',
                              cursor: 'pointer',
                              background: transferMode === 'private13' ? '#0F4C3A' : 'transparent',
                              color: transferMode === 'private13' ? '#FFF' : '#475569',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            🚐 13-Seater
                          </button>
                          <button
                            type="button"
                            onClick={() => setTransferMode('sic')}
                            style={{
                              flex: 1,
                              padding: '0.25rem 0.45rem',
                              borderRadius: '5px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              border: 'none',
                              cursor: 'pointer',
                              background: transferMode === 'sic' ? '#0F4C3A' : 'transparent',
                              color: transferMode === 'sic' ? '#FFF' : '#475569',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            🚌 SIC
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Child Ages row (conditional) */}
                {paxKids > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.35rem', borderTop: '1px dashed #CBD5E1' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400E' }}>👶 Child Ages:</span>
                    {Array.from({ length: paxKids }).map((_, i) => (
                      <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#FFFDF5', border: '1px solid #FDE68A', padding: '1px 5px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#78350F' }}>C{i + 1}:</span>
                        <input
                          type="number"
                          min="0"
                          max="17"
                          value={childAges[i] ?? 5}
                          onChange={e => {
                            const val = Math.max(0, parseInt(e.target.value) || 0)
                            setChildAges(prev => {
                              const copy = [...prev]
                              copy[i] = val
                              return copy
                            })
                          }}
                          style={{ width: '38px', padding: '1px 2px', borderRadius: '3px', border: '1px solid #CBD5E1', fontSize: '0.72rem', textAlign: 'center', fontWeight: 800, background: '#FFF', color: '#1E293B' }}
                        />
                        <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>yr</span>
                      </div>
                    ))}
                    <span style={{ fontSize: '0.68rem', color: '#A16207', marginLeft: 'auto' }}>
                      * 0-2 yrs: Free · 3-12 yrs: Child · 13+ yrs: Adult
                    </span>
                  </div>
                )}
              </div>

              {/* Day-by-Day Itinerary Editor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0A2240', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Day-by-Day Ground Schedule:
                </span>

                {daywiseItinerary.map((day: any, dIdx: number) => (
                  <div key={dIdx} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.75rem 1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
                    
                    {/* Day Title Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem', paddingBottom: '0.35rem', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span style={{ background: '#0F4C3A', color: '#FFF', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '5px' }}>
                          Day {day.dayNumber || dIdx + 1}
                        </span>
                        <strong style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 800 }}>
                          {day.dayTitle || 'Tour Day'}
                        </strong>
                        {day.dayDescription && (
                          <span style={{ fontSize: '0.74rem', color: '#64748B', fontStyle: 'italic' }}>
                            — {day.dayDescription}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => setNewTransferDay(newTransferDay === dIdx ? null : dIdx)}
                          style={{ background: '#F0F7FF', color: '#1E40AF', border: '1px solid #BFDBFE', padding: '0.2rem 0.55rem', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        >
                          {newTransferDay === dIdx ? '✕ Close' : '+ Transfer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttractionModalDay(dIdx)}
                          style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '0.2rem 0.55rem', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        >
                          + Attraction
                        </button>
                      </div>
                    </div>

                    {/* 2-Column Responsive Grid: Column 1 = Transfers, Column 2 = Sightseeing Admissions */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '0.75rem' }}>
                      
                      {/* Left: Transfers Column */}
                      <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '0.55rem 0.75rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            🚐 Scheduled Transfers ({(day.transfers || []).length})
                          </span>
                        </div>

                        {(day.transfers || []).length === 0 ? (
                          <div style={{ padding: '0.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.72rem', fontStyle: 'italic', background: '#FFF', borderRadius: '6px', border: '1px dashed #CBD5E1' }}>
                            No transfers scheduled on this day.
                          </div>
                        ) : (
                          (day.transfers || []).map((tr: any, tIdx: number) => {
                            const info = getCleanTransferInfo(tr, transferMode)

                            // Calculate admin net cost for transfer
                            let trNet = 45
                            if (info.category === 'arrival') trNet = calculation?.rate13Arrival ?? 45
                            else if (info.category === 'departure') trNet = calculation?.rate13Departure ?? 45
                            else if (info.category === 'disposal') trNet = (calculation?.rate13Disposal ?? 45) * (Number(tr.hours) || 4)
                            else if (info.category === 'cityTour') trNet = transferMode === 'sic' ? (calculation?.rateSicCity ?? 15) * Math.max(1, calculation?.totalPax ?? 1) : (calculation?.rate13City ?? 120)
                            else trNet = transferMode === 'sic' ? (calculation?.rateSicXfer ?? 12) * Math.max(1, calculation?.totalPax ?? 1) : (calculation?.rate13Transfer ?? 45)

                            return (
                              <div key={tIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF', padding: '0.35rem 0.55rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.74rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                  <span style={{ color: '#0F4C3A', fontWeight: 800 }}>{tr.time || '10:00'}</span>
                                  <span style={{ color: '#1E293B', fontWeight: 600 }}>{info.title}</span>
                                  <span style={{ background: info.isAirport ? '#EFF6FF' : info.isDisposal ? '#FEF3C7' : '#F0FDF4', color: info.isAirport ? '#1D4ED8' : info.isDisposal ? '#92400E' : '#15803D', padding: '1px 5px', borderRadius: '4px', fontSize: '0.66rem', fontWeight: 700 }}>
                                    {info.badge}
                                  </span>
                                  {info.isDisposal && (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#FEF3C7', padding: '1px 5px', borderRadius: '4px', border: '1px solid #FCD34D' }}>
                                      <span style={{ fontSize: '0.66rem', color: '#92400E', fontWeight: 700 }}>Hrs:</span>
                                      <input
                                        type="number"
                                        min="1"
                                        max="24"
                                        value={tr.hours || 4}
                                        onChange={e => updateTransferHours(dIdx, tIdx, parseInt(e.target.value) || 4)}
                                        style={{ width: '38px', padding: '1px 2px', borderRadius: '3px', border: '1px solid #CBD5E1', fontSize: '0.7rem', textAlign: 'center', fontWeight: 800, background: '#FFF', color: '#1E293B' }}
                                      />
                                    </div>
                                  )}
                                  {isAdmin && (
                                    <span
                                      title="Admin Tariff Net Cost"
                                      style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', padding: '1px 5px', borderRadius: '4px', fontSize: '0.66rem', fontWeight: 800, whiteSpace: 'nowrap' }}
                                    >
                                      Admin Net: S$ {trNet}
                                    </span>
                                  )}
                                </div>
                                {!info.isAirport && (
                                  <button
                                    type="button"
                                    onClick={() => removeTransferFromDay(dIdx, tIdx)}
                                    title="Remove Transfer"
                                    style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: '0.75rem', padding: '0 4px' }}
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            )
                          })
                        )}

                        {/* Inline New Transfer Box */}
                        {newTransferDay === dIdx && (
                          <div style={{ marginTop: '0.4rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '0.55rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1E40AF' }}>
                                + Add Transfer to Day {dIdx + 1}
                              </span>
                              {isAdmin && (() => {
                                let liveNet = 0
                                let liveDesc = ''
                                if (newTransferType === 'disposal') {
                                  liveNet = (calculation?.rate13Disposal ?? 45) * newTransferHours
                                  liveDesc = `(${newTransferHours} hrs × S$${calculation?.rate13Disposal ?? 45})`
                                } else if (newTransferType === 'cityTour') {
                                  liveNet = transferMode === 'sic' ? (calculation?.rateSicCity ?? 15) * Math.max(1, calculation?.totalPax ?? 1) : (calculation?.rate13City ?? 120)
                                  liveDesc = transferMode === 'sic' ? `(SIC ${calculation?.totalPax || 1} Pax × S$${calculation?.rateSicCity ?? 15})` : `(13-Seater S$${calculation?.rate13City ?? 120})`
                                } else {
                                  liveNet = transferMode === 'sic' ? (calculation?.rateSicXfer ?? 12) * Math.max(1, calculation?.totalPax ?? 1) : (calculation?.rate13Transfer ?? 45)
                                  liveDesc = transferMode === 'sic' ? `(SIC ${calculation?.totalPax || 1} Pax × S$${calculation?.rateSicXfer ?? 12})` : `(13-Seater S$${calculation?.rate13Transfer ?? 45})`
                                }
                                return (
                                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#92400E', background: '#FEF3C7', border: '1px solid #FCD34D', padding: '1px 6px', borderRadius: '4px' }}>
                                    Net: S$ {liveNet} {liveDesc}
                                  </span>
                                )
                              })()}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: newTransferType === 'disposal' ? '1fr 1.3fr 70px 60px auto' : '1fr 1.5fr 75px auto', gap: '0.35rem', alignItems: 'center' }}>
                              <select
                                value={newTransferType}
                                onChange={e => setNewTransferType(e.target.value)}
                                style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.72rem', background: '#FFF', color: '#1E293B' }}
                              >
                                <option value="interAttraction">Interline / Point-to-Point</option>
                                <option value="cityTour">City Tour</option>
                                <option value="disposal">Disposal</option>
                              </select>
                              <input
                                type="text"
                                placeholder="Route (e.g. Hotel to Sentosa)"
                                value={newTransferRoute}
                                onChange={e => setNewTransferRoute(e.target.value)}
                                style={{ padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.72rem', background: '#FFF', color: '#1E293B' }}
                              />
                              <input
                                type="text"
                                placeholder="14:00"
                                value={newTransferTime}
                                onChange={e => setNewTransferTime(e.target.value)}
                                style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.72rem', background: '#FFF', color: '#1E293B', textAlign: 'center' }}
                              />
                              {newTransferType === 'disposal' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <span style={{ fontSize: '0.68rem', color: '#1E40AF', fontWeight: 700 }}>H:</span>
                                  <input
                                    type="number"
                                    min="1"
                                    max="24"
                                    value={newTransferHours}
                                    onChange={e => setNewTransferHours(Math.max(1, parseInt(e.target.value) || 4))}
                                    style={{ width: '38px', padding: '0.3rem 2px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.72rem', textAlign: 'center', fontWeight: 700, background: '#FFF', color: '#1E293B' }}
                                  />
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: '3px' }}>
                                <button
                                  type="button"
                                  onClick={() => addTransferToDay(dIdx)}
                                  style={{ background: '#1D4ED8', color: '#FFF', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Add
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNewTransferDay(null)}
                                  style={{ background: '#E2E8F0', color: '#475569', border: 'none', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Attractions Column */}
                      <div style={{ background: '#FFFDF7', borderRadius: '8px', padding: '0.55rem 0.75rem', border: '1px solid #FEF3C7', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            🎟️ Sightseeing Admissions ({(day.attractions || []).length})
                          </span>
                        </div>

                        {(day.attractions || []).length === 0 ? (
                          <div style={{ padding: '0.5rem', textAlign: 'center', color: '#B45309', opacity: 0.7, fontSize: '0.72rem', fontStyle: 'italic', background: '#FFF', borderRadius: '6px', border: '1px dashed #FDE68A' }}>
                            No admission tickets scheduled (Leisure / Transit day).
                          </div>
                        ) : (
                          (day.attractions || []).map((attr: any, aIdx: number) => {
                            const matched = findMatchingAttraction(attr.attractionName || '', attractionsList)
                            const adPrice = attr.adultPrice || matched?.adultPrice || 0
                            const chPrice = attr.childPrice || matched?.childPrice || 0
                            const adPax = calculation?.adultTicketCount ?? paxAdults
                            const chPax = calculation?.childTicketCount ?? paxKids
                            const dayAttrTotal = (adPrice * adPax) + (chPrice * chPax)
                            return (
                              <div key={aIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF', padding: '0.35rem 0.55rem', borderRadius: '6px', border: '1px solid #FDE68A', fontSize: '0.74rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                    <span style={{ color: '#B45309', fontWeight: 800 }}>{attr.time || '10:00'}</span>
                                    <span style={{ color: '#1E293B', fontWeight: 700 }}>{attr.attractionName}</span>
                                    {attr.isOptional && (
                                      <span style={{ background: '#F59E0B', color: '#FFF', padding: '1px 4px', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 800 }}>
                                        OPTIONAL
                                      </span>
                                    )}
                                  </div>
                                  {attr.inclusionsNotes && (
                                    <span style={{ fontSize: '0.68rem', color: '#78716C', display: 'block' }}>
                                      {attr.inclusionsNotes}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                  {matched && (
                                    <span style={{ fontSize: '0.7rem', color: '#92400E', fontWeight: 700 }}>
                                      Ad: S${adPrice} | Ch: S${chPrice}
                                    </span>
                                  )}
                                  {isAdmin && (
                                    <span
                                      title="Admin Tariff Net Cost"
                                      style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', padding: '1px 5px', borderRadius: '4px', fontSize: '0.66rem', fontWeight: 800, whiteSpace: 'nowrap' }}
                                    >
                                      Net: S$ {dayAttrTotal}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeAttractionFromDay(dIdx, aIdx)}
                                    title="Remove Attraction"
                                    style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: '0.75rem', padding: '0 4px' }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {/* Master Attraction Picker Modal Overlay */}
              {attractionModalDay !== null && (
                <div
                  style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                  onClick={() => setAttractionModalDay(null)}
                >
                  <div
                    style={{ background: '#FFF', borderRadius: '12px', maxWidth: '500px', width: '100%', maxHeight: '75vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div style={{ padding: '1rem 1.25rem', background: '#0F4C3A', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                        Select Attraction to Add (Day {attractionModalDay + 1})
                      </span>
                      <button type="button" onClick={() => setAttractionModalDay(null)} style={{ border: 'none', background: 'transparent', color: '#FFF', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                    </div>
                    <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #E2E8F0' }}>
                      <input
                        type="text"
                        placeholder="Search attractions from Google Sheet..."
                        value={searchAttraction}
                        onChange={e => setSearchAttraction(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.82rem', background: '#FFF', color: '#1E293B', fontFamily: 'var(--font-inter), sans-serif' }}
                      />
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1.25rem' }}>
                      {attractionsList
                        .filter(a => !searchAttraction || a.name.toLowerCase().includes(searchAttraction.toLowerCase()))
                        .map((attr, aIdx) => {
                          const adPax = calculation?.adultTicketCount ?? paxAdults
                          const chPax = calculation?.childTicketCount ?? paxKids
                          const totalAttrNet = (attr.adultPrice * adPax) + (attr.childPrice * chPax)
                          return (
                            <div key={aIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0', borderBottom: '1px solid #F1F5F9' }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1E293B' }}>{attr.name}</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                  Adult: S${attr.adultPrice} | Child: S${attr.childPrice}
                                </div>
                                {isAdmin && (
                                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#92400E', background: '#FEF3C7', border: '1px solid #FCD34D', padding: '1px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '0.2rem' }}>
                                    🏷️ Admin Net: S$ {totalAttrNet} ({adPax} Ad × S${attr.adultPrice} + {chPax} Ch × S${attr.childPrice})
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => addAttractionToDay(attractionModalDay, attr)}
                                style={{ background: '#0F4C3A', color: '#FFF', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                + Add
                              </button>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* Proposal Terms & Footer Disclaimer (Collapsible Accordion to save canvas space) */}
              <div style={{ background: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setShowTerms(!showTerms)}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: 'none',
                    padding: '0.45rem 0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#475569'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    📌 Terms & Inclusions Disclaimer
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 600 }}>
                    {showTerms ? '▲ Hide Terms' : '▼ View / Customize Terms'}
                  </span>
                </button>
                {showTerms && (
                  <div style={{ padding: '0.65rem 0.85rem', background: '#FFF', borderTop: '1px solid #E2E8F0' }}>
                    <textarea
                      value={termsText}
                      onChange={e => setTermsText(e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.74rem',
                        color: '#334155',
                        lineHeight: 1.5,
                        fontFamily: 'var(--font-inter), sans-serif'
                      }}
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Sticky Valuation & Action Footer (Ultra-Compact Streamlined Single-Row Bar) */}
            {calculation && (
              <div style={{
                background: '#0A2240',
                color: '#FFF',
                padding: '0.45rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.65rem',
                boxShadow: '0 -4px 16px rgba(0,0,0,0.15)',
                flexShrink: 0
              }}>
                {/* Left: Financial Valuation Streamline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                  {isAdmin && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '0.66rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net:</span>
                      <strong style={{ fontSize: '0.88rem', color: '#CBD5E1' }}>S$ {calculation.totalNetCostSGD.toLocaleString()}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>Markup:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={markupPercent}
                      onChange={e => setMarkupPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{
                        width: '46px',
                        padding: '0.15rem 0.25rem',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        background: '#FFF',
                        color: '#0A2240',
                        fontFamily: 'var(--font-inter), sans-serif'
                      }}
                    />
                    <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>%</span>
                  </div>

                  <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '0.75rem', display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.66rem', opacity: 0.75, textTransform: 'uppercase' }}>Client Total:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FCD34D', lineHeight: 1 }}>
                      S$ {calculation.totalClientPriceSGD.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.8, color: '#E2E8F0' }}>
                      (≈ ₹{calculation.totalClientPriceINR.toLocaleString('en-IN')})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', opacity: 0.9, background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                    <span>Quote: <strong>S$ {calculation.adultQuoteSGD}</strong>/Ad</span>
                    {calculation.childTicketCount > 0 && (
                      <span> · <strong>S$ {calculation.childQuoteSGD}</strong>/Ch</span>
                    )}
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSaveProposal()
                    }}
                    disabled={savingProposal}
                    title="Save land package proposal directly to Sanity"
                    style={{
                      background: savedProposalNum ? '#059669' : '#0284C7',
                      color: '#FFF',
                      border: 'none',
                      height: '32px',
                      padding: '0 0.7rem',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: savingProposal ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'all 0.2s ease',
                      boxShadow: savedProposalNum ? '0 0 10px rgba(5, 150, 105, 0.5)' : 'none'
                    }}
                  >
                    <span>{savingProposal ? 'Saving... ⏳' : savedProposalNum ? `Saved (${savedProposalNum}) ✓` : '💾 Save'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyWhatsApp()
                    }}
                    title="Copy WhatsApp Itinerary"
                    style={{
                      background: copiedWA ? '#059669' : '#F59E0B',
                      color: '#FFF',
                      border: 'none',
                      height: '32px',
                      padding: '0 0.7rem',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {copiedWA ? <Check size={13} color="#FFF" /> : <CopyCheck size={13} color="#FFF" />}
                    <span>{copiedWA ? 'Copied! ✓' : 'Copy WA'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSendWhatsApp()
                    }}
                    title="Direct WhatsApp to Guest"
                    style={{
                      background: sendingWA ? '#047857' : '#10B981',
                      color: '#FFF',
                      border: 'none',
                      height: '32px',
                      padding: '0 0.7rem',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <MessageCircle size={13} color="#FFF" />
                    <span>{sendingWA ? 'Opening... 💬' : 'WhatsApp'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownloadPDF()
                    }}
                    title="Download Professional PDF"
                    style={{
                      background: '#2563EB',
                      color: '#FFF',
                      border: 'none',
                      height: '32px',
                      padding: '0 0.7rem',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <FileDown size={13} color="#FFF" />
                    <span>PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenInBuilder(selectedTemplate)
                    }}
                    title="Add hotel rooms and customize further in full builder"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      color: '#FFF',
                      border: '1px solid rgba(255,255,255,0.25)',
                      height: '32px',
                      padding: '0 0.7rem',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ⚙️ With Hotel
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
