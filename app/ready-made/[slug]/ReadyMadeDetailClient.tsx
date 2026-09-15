'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Users,
  Calendar,
  Clock,
  Bus,
  CheckCircle2,
  MessageCircle,
  FileDown,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Share2,
  Sparkles,
  MapPin,
  ChevronRight,
  Sliders
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { ReadyPackageTemplate, getEmbedVideoInfo, calculateLandPackagePrices } from '../../../utils/readyPackages'

interface Props {
  pkg: ReadyPackageTemplate
  otherPackages?: ReadyPackageTemplate[]
  exchangeRate: number
}

function cleanPdfText(text: string): string {
  if (!text) return ''
  return text
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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

          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, targetW, targetH)
          ctx.drawImage(img, dx, dy, dw, dh)

          const format = asJpeg ? 'image/jpeg' : 'image/png'
          const dataUrl = canvas.toDataURL(format, quality)
          resolve({ dataUrl, width: targetW, height: targetH, format })
        } catch (e) {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = src
    })
  } catch (e) {
    return null
  }
}

export default function ReadyMadeDetailClient({ pkg, otherPackages = [], exchangeRate }: Props) {
  const router = useRouter()
  const hasVideo = !!pkg.videoUrl
  const videoInfo = hasVideo ? getEmbedVideoInfo(pkg.videoUrl) : null

  // Default to video if available, else photo
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'photo'>(hasVideo ? 'video' : 'photo')

  // Quoter state
  const searchParams = useSearchParams()
  const urlMode = searchParams?.get('mode')
  const initialMode = urlMode === 'sic' ? 'sic' : (urlMode === 'private13' ? 'private13' : (pkg.transferPricingOption === 'sic_only' || pkg.transferPricingOption === 'both_default_sic' ? 'sic' : 'private13'))

  const [paxAdults, setPaxAdults] = useState(2)
  const [paxKids, setPaxKids] = useState(0)
  const [childAges, setChildAges] = useState<number[]>([])
  const [transferMode, setTransferMode] = useState<'private13' | 'sic'>(initialMode)
  const [markupPercent, setMarkupPercent] = useState(0)
  const [travelDate, setTravelDate] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  useEffect(() => {
    if (urlMode === 'sic' || urlMode === 'private13') {
      setTransferMode(urlMode)
    }
  }, [urlMode])

  // Toast
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedQuote, setCopiedQuote] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [activeAgent, setActiveAgent] = useState<any>(null)

  // Meta & Sheet State
  const [attractionsMeta, setAttractionsMeta] = useState<Record<string, any>>({})
  const [attractionsTariff, setAttractionsTariff] = useState<Record<string, { adult: number; child: number }>>({})
  const [vehiclesList, setVehiclesList] = useState<any[]>([])

  useEffect(() => {
    // Check Agent auth
    fetch(`/api/auth/check?cb=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.agent) setActiveAgent(data.agent)
      })
      .catch(() => {})

    // Load Attraction Meta
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

    // Load Tariff Sheet
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
        } catch (e) {}

        const res = await fetch(sheetUrl)
        if (!res.ok) return
        const buf = await res.arrayBuffer()
        const wb = XLSX.read(new Uint8Array(buf), { type: 'array' })

        // Transfers
        const tSheet = wb.Sheets['Transfers']
        if (tSheet) {
          const rows: any[] = XLSX.utils.sheet_to_json(tSheet)
          const parsed = rows.map(r => ({
            type: `${(r['Vehicle Type'] || '').trim()}${(r['Transfer Type'] || '').trim() ? ` - ${(r['Transfer Type'] || '').trim()}` : ''}`,
            vehicleType: (r['Vehicle Type'] || '').trim(),
            transferType: (r['Transfer Type'] || '').trim(),
            rateType: (r['Rate type'] || r['Rate Type'] || '').trim(),
            serviceName: (r['Service Name'] || r['Service'] || r['Transfers'] || 'Transfers').trim(),
            pricePerTransfer: Number(r['Rate($)'] ?? r['Rate']) || 0
          })).filter(v => v.type && v.pricePerTransfer > 0)
          setVehiclesList(parsed)
        }

        // Attractions
        const aSheet = wb.Sheets['Attraction'] || wb.Sheets['Attractions']
        if (aSheet) {
          const rows: any[] = XLSX.utils.sheet_to_json(aSheet)
          const aMap: Record<string, { adult: number; child: number }> = {}
          rows.forEach(r => {
            const name = (r['Attractions'] || r['Attraction Name'] || r['Attraction'] || '').toString().trim().toLowerCase()
            if (name) {
              aMap[name] = {
                adult: Number(r['Adult'] ?? r['Adult Rate($)'] ?? r['Adult Rate'] ?? r['Rate($)']) || 0,
                child: Number(r['Child'] ?? r['Child Rate($)'] ?? r['Child Rate']) || 0
              }
            }
          })
          setAttractionsTariff(aMap)
        }
      } catch (e) {}
    }
    fetchSheet()
  }, [])

  const handlePaxKidsChange = (newKids: number) => {
    setPaxKids(newKids)
    setChildAges(prev => {
      if (newKids > prev.length) {
        return [...prev, ...Array(newKids - prev.length).fill(6)]
      }
      return prev.slice(0, newKids)
    })
  }

  // Live Price Calculation Engine
  const calculation = useMemo(() => {
    const isPrivate = transferMode === 'private13'
    const baseStarting = Number(pkg.startingPriceSGD) || 485

    // 1. Baseline 2-pax transfer tariffs calculation
    let base2PaxPrivateTransfers = 0
    let base2PaxSicTransfers = 0
    let sicSightseeingPerPax = 0
    let airportTransfersTotal = 0

    ;(pkg.itinerary || []).forEach(day => {
      ;(day.transfers || []).forEach(t => {
        const sType = (t.serviceType || '').toLowerCase()
        const vType = (t.vehicleType || '').toLowerCase()
        const isArr = sType === 'arrival' || vType.includes('arrival')
        const isDep = sType === 'departure' || vType.includes('departure')
        const isCity = sType === 'citytour' || sType === 'city tour' || vType.includes('city')
        const isDisp = sType === 'disposal' || vType.includes('disposal')

        if (isArr || isDep) {
          // Airport Arrival & Departure is always Chauffeured Private 13-Seater Minibus
          airportTransfersTotal += 45
          base2PaxPrivateTransfers += 45
          base2PaxSicTransfers += 45
        } else if (isDisp) {
          const hrs = Number(t.hours) > 0 ? Number(t.hours) : 4
          base2PaxPrivateTransfers += 45 * hrs
          base2PaxSicTransfers += 45 * hrs
        } else if (isCity) {
          base2PaxPrivateTransfers += 120
          base2PaxSicTransfers += 15 * 2 // 2 pax baseline
          sicSightseeingPerPax += 15
        } else {
          base2PaxPrivateTransfers += 45
          base2PaxSicTransfers += 12 * 2 // 2 pax baseline
          sicSightseeingPerPax += 12
        }
      })
    })

    const transferDiffPerAdult2Pax = Math.max(0, Math.round((base2PaxPrivateTransfers - base2PaxSicTransfers) / 2))
    const base2PaxTransferPerAdult = base2PaxPrivateTransfers / 2
    const baselineAttractionsAndMargin = Math.max(100, baseStarting - base2PaxTransferPerAdult)

    let currentTransferPerAdult = 0
    let currentTransferPerChild = 0

    if (isPrivate) {
      // 13-seater minibus vehicle fixed rate shared among paying adults
      currentTransferPerAdult = base2PaxPrivateTransfers / Math.max(1, paxAdults)
      currentTransferPerChild = 0 // Minibus seat already paid by group
    } else {
      // Airport Minibus vehicle shared among adults + sightseeing coach per paying pax
      currentTransferPerAdult = (airportTransfersTotal / Math.max(1, paxAdults)) + sicSightseeingPerPax
      currentTransferPerChild = sicSightseeingPerPax // Seat on SIC coach
    }

    const computedAdultNet = Math.round(baselineAttractionsAndMargin + currentTransferPerAdult)
    const childAttractionsBase = Math.round(baselineAttractionsAndMargin * 0.7)
    const computedChildNet = Math.round(childAttractionsBase + currentTransferPerChild)

    const markupMultiplier = 1 + (markupPercent / 100)
    const adultQuoteSGD = Math.round(computedAdultNet * markupMultiplier)
    const childQuoteSGD = Math.round(computedChildNet * markupMultiplier)

    const totalClientPriceSGD = (adultQuoteSGD * paxAdults) + (childQuoteSGD * paxKids)
    const totalClientPriceINR = Math.round(totalClientPriceSGD * exchangeRate)

    return {
      adultQuoteSGD,
      childQuoteSGD,
      totalClientPriceSGD,
      totalClientPriceINR,
      childTicketCount: paxKids,
      netAdultSGD: computedAdultNet,
      netChildSGD: computedChildNet,
      transferDiffPerAdult2Pax
    }
  }, [pkg, paxAdults, paxKids, transferMode, markupPercent, exchangeRate])

  const showToastMsg = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      showToastMsg('Direct Package link copied to clipboard! 🔗', 'success')
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const handleCopyQuoteText = () => {
    const text = `⭐ *${pkg.title}* (${pkg.nightsCount}N / ${pkg.nightsCount + 1}D B2B Land Package)
📌 *Duration:* ${pkg.nightsCount + 1} Days / ${pkg.nightsCount} Nights (Hotel Not Included)
👥 *Pax:* ${paxAdults} Adult(s)${paxKids > 0 ? ` + ${paxKids} Child(ren)` : ''}
🚐 *Modality:* ${transferMode === 'private13' ? 'Private 13-Seater Minibus (All transfers)' : 'Private Minibus (Airport) + SIC Shared Coach (Sightseeing)'}
💵 *Per Adult:* S$ ${calculation.adultQuoteSGD.toLocaleString()}${paxKids > 0 ? `\n👶 *Per Child:* S$ ${calculation.childQuoteSGD.toLocaleString()}` : ''}
💰 *Total Land Quote:* S$ ${calculation.totalClientPriceSGD.toLocaleString()} (Approx. Rs. ${calculation.totalClientPriceINR.toLocaleString('en-IN')})
🌐 *Full Details & Itinerary:* ${typeof window !== 'undefined' ? window.location.href : `https://flyingwonders.net/ready-made/${pkg.slug}`}`

    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text)
      setCopiedQuote(true)
      showToastMsg('Quote text copied for WhatsApp / Email! 📋', 'success')
      setTimeout(() => setCopiedQuote(false), 2500)
    }
  }

  const handleSendWhatsApp = () => {
    const text = `Hi Flying Wonders, I would like to request/confirm quotation for:
*${pkg.title}*
- Duration: ${pkg.nightsCount}N / ${pkg.nightsCount + 1}D (Land Package Only)
- Pax: ${paxAdults} Adults${paxKids > 0 ? `, ${paxKids} Children` : ''}
- Transfer: ${transferMode === 'private13' ? 'Private 13-Seater Minibus' : 'SIC Shared Coach'}
- Travel Date: ${travelDate || 'TBD'}
- Quoted Price: S$ ${calculation.totalClientPriceSGD.toLocaleString()} (Rs. ${calculation.totalClientPriceINR.toLocaleString('en-IN')})
- Package Link: https://flyingwonders.net/ready-made/${pkg.slug}`

    const url = `https://wa.me/6596890101?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleOpenInBuilder = () => {
    try {
      sessionStorage.setItem('fw_builder_template', JSON.stringify({
        templateId: pkg._id,
        title: pkg.title,
        nightsCount: pkg.nightsCount,
        category: pkg.category,
        itinerary: pkg.itinerary
      }))
    } catch (e) {}
    router.push('/custom-package?from=ready-made')
  }

  // ── HIGH-RESOLUTION PDF GENERATOR (WITH ZERO IMAGE OVERLAPPING) ──
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true)
      showToastMsg('Generating high-resolution Land Package PDF... ⏳', 'info')
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })

      const effectiveRef = `FW-LAND-${pkg.nightsCount}N-${Date.now().toString().slice(-4)}`

      // Preload distinct attraction images
      const distinctNames = Array.from(new Set(
        (pkg.itinerary || []).flatMap(d => (d.attractions || []).map(a => a.attractionName || ''))
      )).filter(Boolean)

      const attractionPhotosMap = new Map<string, string>()
      await Promise.all(
        distinctNames.map(async (name) => {
          const cleanName = cleanPdfText(name)
          const meta = attractionsMeta[cleanName.toLowerCase().trim()] || attractionsMeta[name.toLowerCase().trim()]
          const photoUrl = meta?.photoUrl || '/images/hero/singapore-hero-1.jpg'
          if (photoUrl) {
            const raster = await fetchRasterLogo(photoUrl, 480, 312, true, 0.85, 'cover')
            if (raster?.dataUrl) {
              attractionPhotosMap.set(cleanName.toLowerCase().trim(), raster.dataUrl)
              attractionPhotosMap.set(name.toLowerCase().trim(), raster.dataUrl)
            }
          }
        })
      )

      // Preload transfer card photos
      const transferPhotosMap = new Map<string, string>()
      const transferUrls = [
        '/images/hero/singapore-hero-4.jpg',
        '/images/transfers/13-seater-minibus.jpg',
        '/images/transfers/city-tour.jpg'
      ]
      await Promise.all(
        transferUrls.map(async (url) => {
          const raster = await fetchRasterLogo(url, 480, 312, true, 0.85, 'cover')
          if (raster?.dataUrl) transferPhotosMap.set(url, raster.dataUrl)
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

      // Page 1 Header
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

      setFill(CRIM); doc.roundedRect(PW - 58, 12, 44, 9, 2, 2, 'F')
      font('bold', 7.5); setTxt(WHITE)
      doc.text('LAND PACKAGE ONLY', PW - 36, 17.8, { align: 'center' })

      font('bold', 7.5); setTxt(GOLD)
      doc.text(`Ref: ${effectiveRef}`, PW - 36, 26, { align: 'center' })

      y = 54

      // Guest / Itinerary Overview Card
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
        { label: 'PACKAGE DURATION', val: `${pkg.nightsCount + 1}D / ${pkg.nightsCount}N` },
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

      // Price Bar
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

      // Inclusions & Exclusions
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

      // Included
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

      // Excluded
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

      // Day-by-Day Timeline
      sectionTitle('DAY-BY-DAY LAND ITINERARY')

      ;(pkg.itinerary || []).forEach((day, dIdx) => {
        const dayEvents: any[] = []

        ;(day.transfers || []).forEach(t => {
          const isArr = t.serviceType === 'arrival'
          const isDep = t.serviceType === 'departure'
          const isCity = t.serviceType === 'cityTour'
          const photoUrl = isCity ? '/images/transfers/city-tour.jpg' : (isArr || isDep ? '/images/transfers/13-seater-minibus.jpg' : '/images/hero/singapore-hero-4.jpg')
          const photoData = transferPhotosMap.get(photoUrl) || null

          dayEvents.push({
            time: t.time || '10:00',
            type: 'transfer',
            title: cleanPdfText(t.routeDescription || `${t.serviceType} Transfer`),
            vehicleName: transferMode === 'sic' && !isArr && !isDep ? 'Shared Coach (SIC)' : 'Private 13-Seater Minibus',
            badge: transferMode === 'sic' && !isArr && !isDep ? 'Shared Sightseeing' : 'Private Direct Transfer',
            shortDescription: `Chauffeured transfer with luggage assistance. Surcharges apply between 22:00 - 07:00 hrs.`,
            features: ['Chauffeured Minibus', 'Direct Luggage Assist', 'AC Comfort', 'Punctual Dispatch'],
            photoData
          })
        })

        ;(day.attractions || []).forEach(a => {
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
            shortDescription: meta?.shortDescription || 'World-class Singapore sightseeing experience with confirmed tickets.',
            photoData
          })
        })

        dayEvents.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'))

        checkPage(24)

        setFill(GOLD); doc.roundedRect(ML, y, CW, 7, 2, 2, 'F')
        font('bold', 8.5); setTxt(NAVY)
        doc.text(`DAY ${day.dayNumber || dIdx + 1}: ${(cleanPdfText(day.dayTitle) || 'Tour Day').toUpperCase()}`, ML + 4, y + 4.8)
        y += 9

        dayEvents.forEach(item => {
          if (item.type === 'transfer') {
            const hasPhoto = !!item.photoData
            const imgW = 34
            const imgH = 22
            // Verified math: (CW - imgW - 27) guarantees clean margin without overlapping
            const textW = hasPhoto ? (CW - imgW - 27) : (CW - 25)

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

            const inclusions: string[] = item.features || []
            const incRows = Math.ceil(inclusions.length / 2)
            const incH = inclusions.length > 0 ? (2.8 + incRows * 2.8) : 0

            const contentH = 4 + titleH + badgeH + descH + incH + 3
            const cardH = Math.max(hasPhoto ? 26 : 14, contentH)
            checkPage(cardH + 2)

            setFill([240, 253, 250]); doc.roundedRect(ML, y, CW, cardH, 1.5, 1.5, 'F')
            setDraw(TEAL); doc.setLineWidth(0.3); doc.roundedRect(ML, y, CW, cardH, 1.5, 1.5, 'S')
            setFill(TEAL); doc.rect(ML, y, 2.5, cardH, 'F')

            setFill(TEAL); doc.roundedRect(ML + 5, y + 2.5, 13, 4.5, 1, 1, 'F')
            font('bold', 6.2); setTxt(WHITE)
            doc.text(item.time, ML + 11.5, y + 5.6, { align: 'center' })

            if (hasPhoto && item.photoData) {
              const imgX = MR - imgW - 2
              const imgY = y + (cardH - imgH) / 2
              try {
                doc.addImage(item.photoData, 'JPEG', imgX, imgY, imgW, imgH, undefined, 'MEDIUM')
                setDraw([204, 251, 241]); doc.setLineWidth(0.2)
                doc.rect(imgX, imgY, imgW, imgH, 'S')
              } catch (e) {}
            }

            let ty = y + 5.5
            font('bold', 8.2); setTxt(NAVY)
            doc.text(titleLines, ML + 21, ty)
            ty += titleH

            font('bold', 6.8); setTxt([13, 148, 136])
            doc.text(badgeLines, ML + 21, ty)
            ty += badgeH

            if (descLines.length > 0) {
              font('italic', 6.5); setTxt(TEXT)
              doc.text(descLines, ML + 21, ty)
              ty += descH
            }

            if (inclusions.length > 0) {
              const colW = (textW - 6) / 2
              font('normal', 6.3); setTxt([15, 118, 110])
              for (let i = 0; i < inclusions.length; i += 2) {
                doc.text(`• ${inclusions[i]}`, ML + 21, ty)
                if (inclusions[i + 1]) {
                  doc.text(`• ${inclusions[i + 1]}`, ML + 21 + colW + 3, ty)
                }
                ty += 2.8
              }
            }

            y += cardH + 2
          } else if (item.type === 'attraction') {
            const hasPhoto = !!item.photoData
            const imgW = 34
            const imgH = 22
            // Verified math: (CW - imgW - 28) guarantees clean margin without overlapping
            const textW = hasPhoto ? (CW - imgW - 28) : (CW - 26)

            font('bold', 8.5)
            const titleLines = doc.splitTextToSize(item.title, textW)
            const titleH = titleLines.length * 3.8

            const ticketStr = `Tickets: x${item.adultQty} Adult${item.childQty > 0 ? ` + x${item.childQty} Child` : ''} · ${item.notes}`
            font('normal', 6.8)
            const noteLines = doc.splitTextToSize(ticketStr, textW)
            const noteH = noteLines.length * 3.2

            const descText = item.shortDescription || ''
            font('italic', 6.5)
            const descLines = descText ? doc.splitTextToSize(descText, textW) : []
            const descH = descLines.length > 0 ? descLines.length * 3.0 + 1 : 0

            const contentH = 4 + titleH + noteH + descH + 3
            const cardH = Math.max(hasPhoto ? 26 : 14, contentH)
            checkPage(cardH + 2)

            setFill([255, 252, 242]); doc.roundedRect(ML, y, CW, cardH, 1.5, 1.5, 'F')
            setDraw(GOLD); doc.setLineWidth(0.3); doc.roundedRect(ML, y, CW, cardH, 1.5, 1.5, 'S')
            setFill(GOLD); doc.rect(ML, y, 2.5, cardH, 'F')

            if (hasPhoto && item.photoData) {
              try {
                const imgX = MR - imgW - 2
                const imgY = y + (cardH - imgH) / 2
                doc.addImage(item.photoData, 'JPEG', imgX, imgY, imgW, imgH, undefined, 'MEDIUM')
                setDraw([217, 180, 110]); doc.setLineWidth(0.2)
                doc.rect(imgX, imgY, imgW, imgH, 'S')
              } catch (e) {}
            }

            setFill(GOLD); doc.roundedRect(ML + 5, y + 2.5, 14, 5, 1, 1, 'F')
            font('bold', 6.5); setTxt(NAVY)
            doc.text(item.time, ML + 12, y + 6, { align: 'center' })

            font('bold', 8.5); setTxt(NAVY)
            doc.text(titleLines, ML + 22, y + 6)

            font('normal', 6.8); setTxt([120, 53, 15])
            doc.text(noteLines, ML + 22, y + 6 + titleH)

            if (descLines.length > 0) {
              font('italic', 6.5); setTxt(SLATE)
              doc.text(descLines, ML + 22, y + 6 + titleH + noteH)
            }

            y += cardH + 2.5
          }
        })

        y += 2
      })

      addFooter()

      const cleanFilename = `${(pkg.title || 'Singapore_Land_Package').replace(/[^a-zA-Z0-9_-]/g, '_')}_Quotation.pdf`
      doc.save(cleanFilename)
      showToastMsg('PDF generated and downloaded successfully! 📄', 'success')
    } catch (e: any) {
      console.error('PDF error:', e)
      showToastMsg('Failed to generate PDF. Please try again.', 'error')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const coverUrl = typeof pkg.coverImage === 'string' && pkg.coverImage
    ? pkg.coverImage
    : 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'

  return (
    <div className="rm-page-wrapper" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '6rem' }}>
      <style>{`
        .rm-detail-main {
          max-width: 1440px;
          margin: 2rem auto 0;
          padding: 0 1.5rem;
        }
        .rm-top-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          padding: 1.75rem 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          margin-bottom: 2rem;
        }
        .rm-title {
          font-size: 2.1rem;
          font-weight: 800;
          color: #0A2240;
          margin: 0 0 0.75rem;
          font-family: var(--font-playfair), serif;
          line-height: 1.25;
        }
        .rm-header-inner {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1.25rem;
        }
        .rm-price-badge {
          background: linear-gradient(135deg, #0A2240 0%, #0F4C3A 100%);
          color: #FFF;
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          text-align: right;
          min-width: 220px;
        }
        .rm-detail-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.95fr);
          gap: 2rem;
          align-items: start;
        }
        .rm-media-box {
          background: #091A2F;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          height: 380px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          margin-bottom: 2rem;
        }
        .rm-quoter-card {
          position: sticky;
          top: 2rem;
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 35px rgba(0,0,0,0.08);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .rm-other-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .rm-mobile-floating-bar {
          display: none;
        }

        @media (max-width: 960px) {
          .rm-detail-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 1.5rem !important;
          }
          .rm-quoter-card {
            position: static !important;
            top: unset !important;
          }
        }

        @media (max-width: 768px) {
          .rm-detail-main {
            padding: 0 0.85rem !important;
            margin-top: 1rem !important;
          }
          .rm-top-card {
            padding: 1.15rem 1rem !important;
            border-radius: 12px !important;
            margin-bottom: 1.25rem !important;
          }
          .rm-title {
            font-size: 1.4rem !important;
            line-height: 1.25 !important;
            margin-bottom: 0.5rem !important;
          }
          .rm-header-inner {
            flex-direction: column !important;
            gap: 0.85rem !important;
          }
          .rm-price-badge {
            width: 100% !important;
            text-align: left !important;
            min-width: unset !important;
            padding: 0.85rem 1rem !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          .rm-media-box {
            height: min(58vw, 280px) !important;
            border-radius: 12px !important;
            margin-bottom: 1.25rem !important;
          }
          .rm-quoter-card {
            padding: 1.15rem 1rem !important;
            border-radius: 12px !important;
            gap: 1rem !important;
          }
          .rm-other-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .rm-mobile-floating-bar {
            display: flex !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            background: rgba(10, 34, 64, 0.96) !important;
            backdrop-filter: blur(10px) !important;
            padding: 0.65rem 1rem !important;
            justify-content: space-between !important;
            align-items: center !important;
            z-index: 8999 !important;
            border-top: 1px solid rgba(255,255,255,0.15) !important;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.2) !important;
          }
        }
      `}</style>
      
      {/* ── Toast Notification ── */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: toast.type === 'error' ? '#EF4444' : '#0F4C3A',
          color: '#FFF',
          padding: '0.85rem 1.4rem',
          borderRadius: '10px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          zIndex: 9999,
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Breadcrumb Navigation ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748B', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#0F4C3A', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            <ChevronRight size={14} />
            <Link href="/ready-made" style={{ color: '#0F4C3A', textDecoration: 'none', fontWeight: 600 }}>Ready-Made Land Packages</Link>
            <ChevronRight size={14} />
            <span style={{ color: '#0A2240', fontWeight: 700 }}>{pkg.title}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopyLink}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '20px',
                border: copiedLink ? '1px solid #10B981' : '1px solid #CBD5E1',
                background: copiedLink ? '#ECFDF5' : '#FFFFFF',
                color: copiedLink ? '#047857' : '#0A2240',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Direct Link'}</span>
            </button>

            <Link
              href="/ready-made"
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '20px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0F4C3A',
                fontWeight: 700,
                fontSize: '0.8rem',
                textDecoration: 'none'
              }}
            >
              ← All Land Packages
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Container (Wide Canvas) ── */}
      <main className="rm-detail-main">

        {/* Top Header Card */}
        <div className="rm-top-card">
          <div className="rm-header-inner">
            <div style={{ flex: '1 1 650px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {pkg.badgeText && (
                  <span style={{ background: '#D4AF37', color: '#111', fontWeight: 800, fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {pkg.badgeText}
                  </span>
                )}
                <span style={{ background: '#E6F4EA', color: '#0F4C3A', border: '1px solid #A7F3D0', fontWeight: 800, fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                  🌙 {pkg.nightsCount}N / {pkg.nightsCount + 1}D B2B Land Package
                </span>
                <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontWeight: 800, fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: '6px', textTransform: 'uppercase' }}>
                  ⭐ Hotel Accommodation Excluded
                </span>
              </div>

              <h1 className="rm-title">
                {pkg.title}
              </h1>

              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, margin: 0, textAlign: 'justify' }}>
                {pkg.summary}
              </p>
            </div>

            {/* Price Badge */}
            <div className="rm-price-badge">
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 800, letterSpacing: '0.05em', display: 'block', marginBottom: '0.2rem' }}>
                  Est. Rate ({transferMode === 'sic' ? 'SIC Shared' : 'Private 13-Seater'})
                </span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.1 }}>
                  S$ {calculation.adultQuoteSGD.toLocaleString()}
                </div>
              </div>
              <div className="rm-price-badge-right">
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', display: 'block' }}>
                  Per Adult
                </span>
                <span style={{ fontSize: '0.85rem', color: '#FCD34D', fontWeight: 800 }}>
                  ₹{Math.round(calculation.adultQuoteSGD * exchangeRate).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Grid: Left Column (Media + Itinerary) & Right Column (Interactive Quoter) ── */}
        <div className="rm-detail-grid">
          
          {/* LEFT: Media Container & Day-by-Day Timeline */}
          <div className="rm-left-col">

            {/* Media Box (Cover photo or Video player with Tab switcher) */}
            <div className="rm-media-box">
              {/* Blurred backdrop */}
              <img
                src={coverUrl}
                alt=""
                aria-hidden="true"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(20px)', opacity: 0.45, transform: 'scale(1.15)' }}
              />

              {/* Foreground: Video or Photo */}
              {hasVideo && activeMediaTab === 'video' && videoInfo?.embedUrl ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', zIndex: 2 }}>
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
                      title={`${pkg.title} Video`}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )}
                </div>
              ) : (
                <img
                  src={coverUrl}
                  alt={pkg.title}
                  style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }}
                />
              )}

              {/* Option A Media Switcher Pill (Top Right) */}
              {hasVideo && (
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(10, 34, 64, 0.88)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    zIndex: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.35)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('video')}
                    style={{
                      background: activeMediaTab === 'video' ? '#E11D48' : 'transparent',
                      color: activeMediaTab === 'video' ? '#FFF' : '#CBD5E1',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '4px 12px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    ▶ Video Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('photo')}
                    style={{
                      background: activeMediaTab === 'photo' ? '#0F4C3A' : 'transparent',
                      color: activeMediaTab === 'photo' ? '#FFF' : '#CBD5E1',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '4px 12px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    📷 Photo
                  </button>
                </div>
              )}
            </div>

            {/* Day-by-Day Detailed Itinerary */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '1.75rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              marginBottom: '2rem'
            }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0A2240', margin: '0 0 1.25rem', fontFamily: 'var(--font-playfair), serif' }}>
                Day-by-Day Land Itinerary & Modalities
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {(pkg.itinerary || []).map((day, dIdx) => (
                  <div
                    key={dIdx}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#FFF'
                    }}
                  >
                    {/* Day Header */}
                    <div style={{
                      background: 'linear-gradient(135deg, #0F4C3A 0%, #134E4A 100%)',
                      color: '#FFF',
                      padding: '0.75rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem'
                    }}>
                      <span style={{ background: '#D4AF37', color: '#111', fontWeight: 800, fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        DAY {day.dayNumber || dIdx + 1}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                        {day.dayTitle}
                      </h3>
                    </div>

                    {/* Day Description */}
                    {day.dayDescription && (
                      <p style={{ padding: '0.85rem 1.25rem 0.5rem', margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, textAlign: 'justify' }}>
                        {day.dayDescription}
                      </p>
                    )}

                    {/* Day Items */}
                    <div style={{ padding: '0.75rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      
                      {/* Transfers */}
                      {(day.transfers || []).map((t, tIdx) => (
                        <div
                          key={`t-${tIdx}`}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            background: '#F0FDFA',
                            border: '1px solid #CCFBF1',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '8px',
                            fontSize: '0.82rem'
                          }}
                        >
                          <Bus size={16} color="#0D9488" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                              <strong style={{ color: '#0F766E' }}>
                                {t.routeDescription || `${t.serviceType} Transfer`}
                              </strong>
                              <span style={{ fontSize: '0.72rem', background: '#FFF', border: '1px solid #99F6E4', color: '#0F766E', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                                {t.time || 'Scheduled'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#115E59', marginTop: '2px' }}>
                              Vehicle: {transferMode === 'sic' && t.serviceType !== 'arrival' && t.serviceType !== 'departure' ? 'Shared Sightseeing Coach (SIC)' : 'Private 13-Seater Minibus'}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Attractions */}
                      {(day.attractions || []).map((a, aIdx) => (
                        <div
                          key={`a-${aIdx}`}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            background: '#FFFBEB',
                            border: '1px solid #FEF3C7',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '8px',
                            fontSize: '0.82rem'
                          }}
                        >
                          <MapPin size={16} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                              <strong style={{ color: '#92400E' }}>{a.attractionName}</strong>
                              <span style={{ fontSize: '0.72rem', background: '#FFF', border: '1px solid #FDE68A', color: '#B45309', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                                {a.time || 'Timed Entry'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#78350F', marginTop: '2px' }}>
                              Inclusions: {a.inclusionsNotes || 'Admission Ticket Included'}
                            </div>
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms & Inclusions Box */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0A2240', margin: '0 0 0.85rem' }}>
                📌 Official Inclusions & Operational Terms
              </h3>
              <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {pkg.termsAndInclusions || `• Land Package Only: Hotel stay and international airfare excluded.\n• Transfers: Airport arrival & departure transfers are provided by Private 13-Seater Minibus. Sightseeing transfers are as selected (SIC Coach / Private 13-Seater Minibus).\n• Surcharges: Midnight surcharge applies for transfers between 22:00 - 07:00 hrs.\n• Customizations: For hotel room bookings, meal plans, or licensed guides, please contact Flying Wonders DMC.`}
              </div>
            </div>

          </div>

          {/* RIGHT: Standalone Interactive Land Package Quoter */}
          <div id="rm-quoter-box" className="rm-quoter-card">
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
              <span style={{ color: '#0F4C3A', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Live B2B Land Quoter Engine
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A2240', margin: '0.25rem 0 0', fontFamily: 'var(--font-playfair), serif' }}>
                Calculate Instant Land Quote
              </h2>
            </div>

            {/* Adult & Child Pax */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  👥 Adults (12+ Yrs)
                </label>
                <select
                  value={paxAdults}
                  onChange={e => setPaxAdults(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 700, color: '#0A2240' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                    <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  👶 Children (2-11 Yrs)
                </label>
                <select
                  value={paxKids}
                  onChange={e => handlePaxKidsChange(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 700, color: '#0A2240' }}
                >
                  {[0, 1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Child' : 'Children'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Child Ages if kids > 0 */}
            {paxKids > 0 && (
              <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Child Ages (for accurate attraction tariff tickets):
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {Array.from({ length: paxKids }).map((_, i) => (
                    <select
                      key={i}
                      value={childAges[i] ?? 6}
                      onChange={e => {
                        const val = Number(e.target.value)
                        setChildAges(prev => {
                          const c = [...prev]
                          c[i] = val
                          return c
                        })
                      }}
                      style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(age => (
                        <option key={age} value={age}>Child {i + 1}: {age} yrs</option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>
            )}

            {/* Travel Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                📅 Travel Date
              </label>
              <input
                type="date"
                value={travelDate}
                onChange={e => setTravelDate(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 600, color: '#0A2240' }}
              />
            </div>

            {/* Transfer Modality Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem' }}>
                🚐 Transfer Mode Preference
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setTransferMode('private13')}
                  style={{
                    padding: '0.55rem 0.65rem',
                    borderRadius: '8px',
                    border: transferMode === 'private13' ? '2px solid #0F4C3A' : '1px solid #CBD5E1',
                    background: transferMode === 'private13' ? '#F0FDF4' : '#FFF',
                    color: transferMode === 'private13' ? '#0F4C3A' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 800 }}>Private 13-Seater</div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>Minibus for All Legs</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTransferMode('sic')}
                  style={{
                    padding: '0.55rem 0.65rem',
                    borderRadius: '8px',
                    border: transferMode === 'sic' ? '2px solid #0F4C3A' : '1px solid #CBD5E1',
                    background: transferMode === 'sic' ? '#F0FDF4' : '#FFF',
                    color: transferMode === 'sic' ? '#0F4C3A' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    <span style={{ fontWeight: 800 }}>SIC Coach Mode</span>
                    {calculation.transferDiffPerAdult2Pax > 0 && (
                      <span style={{ fontSize: '0.62rem', background: '#DCFCE7', color: '#15803D', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                        Save ~S${calculation.transferDiffPerAdult2Pax}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>Shared Sightseeing</div>
                </button>
              </div>
            </div>

            {/* Agent Markup Slider */}
            <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                  📊 Client Markup Margin:
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F4C3A' }}>
                  +{markupPercent}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={1}
                value={markupPercent}
                onChange={e => setMarkupPercent(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0F4C3A', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block', marginTop: '2px' }}>
                Adjust markup to produce final guest-facing quote & PDF proposal
              </span>
            </div>

            {/* Guest Name & Phone (Optional for PDF) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Guest Name (for PDF)"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}
              />
              <input
                type="text"
                placeholder="Guest Phone / Email"
                value={guestPhone}
                onChange={e => setGuestPhone(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}
              />
            </div>

            {/* Price Calculation Output Box */}
            <div style={{
              background: 'linear-gradient(135deg, #0A2240 0%, #0F4C3A 100%)',
              color: '#FFF',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              boxShadow: '0 4px 15px rgba(10,34,64,0.15)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: 700 }}>Per Adult Quote:</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>S$ {calculation.adultQuoteSGD.toLocaleString()}</span>
              </div>

              {paxKids > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: 700 }}>Per Child Quote:</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>S$ {calculation.childQuoteSGD.toLocaleString()}</span>
                </div>
              )}

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700 }}>
                    Total Land Package
                  </span>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFF' }}>
                    S$ {calculation.totalClientPriceSGD.toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Approx INR</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#D4AF37' }}>
                    ₹ {calculation.totalClientPriceINR.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Dock */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0F4C3A 0%, #059669 100%)',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: isGeneratingPdf ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(5,150,105,0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                <FileDown size={16} />
                <span>{isGeneratingPdf ? 'Generating High-Res PDF...' : 'Download Land Proposal (PDF)'}</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  style={{
                    background: '#047857',
                    color: '#FFF',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    padding: '0.55rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp Quote</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyQuoteText}
                  style={{
                    background: copiedQuote ? '#ECFDF5' : '#F1F5F9',
                    color: copiedQuote ? '#047857' : '#0A2240',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    padding: '0.55rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  {copiedQuote ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copiedQuote ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleOpenInBuilder}
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  padding: '0.55rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  marginTop: '0.25rem'
                }}
              >
                <span>⚙️</span> Customize with Hotels in Builder ➔
              </button>
            </div>

          </div>

        </div>

        {/* ── Explore Other Singapore Land Packages ── */}
        {otherPackages && otherPackages.length > 0 && (
          <div style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '2px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#0F4C3A', fontWeight: 800, letterSpacing: '0.05em' }}>
                  Singapore DMC Land Itineraries
                </span>
                <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#0A2240', fontFamily: 'var(--font-playfair), serif' }}>
                  Explore Other Ready-Made Land Packages
                </h2>
              </div>
              <Link
                href="/ready-made"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#0F4C3A',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textDecoration: 'none'
                }}
              >
                View All Land Packages ➔
              </Link>
            </div>

            <div className="rm-other-grid">
              {otherPackages.map(oPkg => {
                const oPricing = calculateLandPackagePrices(oPkg)
                return (
                  <div
                    key={oPkg._id}
                    style={{
                      background: '#FFF',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      overflow: 'hidden',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ position: 'relative', height: '190px', background: '#091A2F' }}>
                        <img
                          src={oPkg.coverImage || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'}
                          alt={oPkg.title}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                        <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(15,76,58,0.92)', color: '#FFF', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                          🌙 {oPkg.nightsCount}N / {oPkg.nightsCount + 1}D
                        </span>
                        {oPkg.badgeText && (
                          <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#D4AF37', color: '#111', fontSize: '0.68rem', fontWeight: 800, padding: '2px 7px', borderRadius: '6px' }}>
                            {oPkg.badgeText}
                          </span>
                        )}
                      </div>

                      <div style={{ padding: '1rem 1.15rem 0.5rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0A2240', margin: '0 0 0.4rem', lineHeight: 1.3 }}>
                          {oPkg.title}
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.45, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {oPkg.summary}
                        </p>
                        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>From:</span>
                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669' }}>
                            S$ {oPricing.pricePrivate.toLocaleString()}{' '}
                            <span style={{ fontSize: '0.72rem', color: '#D4AF37', fontWeight: 700 }}>
                              (₹{Math.round(oPricing.pricePrivate * exchangeRate).toLocaleString('en-IN')})
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '0.85rem 1.15rem 1.15rem' }}>
                      <Link
                        href={`/ready-made/${oPkg.slug || oPkg._id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: 'linear-gradient(135deg, #0F4C3A 0%, #059669 100%)',
                          color: '#FFF',
                          padding: '0.55rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          textDecoration: 'none'
                        }}
                      >
                        <span>⚡</span> View Land Quote & Itinerary ➔
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </main>

      {/* ── Mobile Floating Action Bar ── */}
      <div className="rm-mobile-floating-bar">
        <div>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {transferMode === 'sic' ? 'SIC Shared' : 'Private 13-Seater'}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.18rem', fontWeight: 800, color: '#FFF' }}>
              S$ {calculation.totalClientPriceSGD.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#FCD34D', fontWeight: 700 }}>
              (₹{calculation.totalClientPriceINR.toLocaleString('en-IN')})
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('rm-quoter-box')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFF',
              border: 'none',
              padding: '0.45rem 0.8rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.76rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'var(--font-inter), sans-serif'
            }}
          >
            ⚡ Quote
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#FFF',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.76rem',
              cursor: isGeneratingPdf ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'var(--font-inter), sans-serif'
            }}
          >
            <FileDown size={14} />
            <span>PDF</span>
          </button>
        </div>
      </div>
    </div>
  )
}
