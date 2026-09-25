'use client'

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  FileText,
  Download,
  Printer,
  CreditCard,
  Search,
  Share2,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Check,
  ChevronRight,
  Receipt,
  Save,
  MessageCircle,
  CheckCircle2
} from 'lucide-react'
import IciciQrModal from '../../components/IciciQrModal'
import { generateTaxInvoicePdf, generatePaymentReceiptPdf, TaxInvoiceData, InvoiceLineItem, PaymentRecord } from '../../utils/invoiceReceiptPdf'

interface ProposalLookupData {
  proposalNumber: string
  invoiceNumber?: string
  invoiceDate?: string
  totalClientPrice?: number
  costBreakdown?: {
    totalClientPrice?: number
  }
  adults?: number
  kids?: number
  nights?: number
  arrivalDate?: string
  hotelName?: string
  roomType?: string
  guestName?: string
  guestPhone?: string
  status?: 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' | 'void'
  _createdAt?: string
  agent?: {
    agentName?: string
    companyName?: string
    phone?: string
    email?: string
  }
  additionalCharges?: Array<{
    itemDescription: string
    chargeType?: string
    date?: string
    amount: number
  }>
  paymentLedger?: Array<{
    paymentId?: string
    date?: string
    amount?: number
    method?: string
    referenceNo?: string
    notes?: string
  }>
}

const PRESET_SERVICES = [
  {
    title: 'Singapore 4N/5D Family Tour Package',
    subText: 'Hotel accommodation with daily breakfast, round-trip airport transfers, and tourist admissions.',
    qty: 2,
    price: 650
  },
  {
    title: 'Universal Studios Singapore + SEA Aquarium Passes',
    subText: 'One-day dated official electronic entry passes.',
    qty: 2,
    price: 110
  },
  {
    title: 'Changi Airport Round-Trip Transfers (Private 13-Seater)',
    subText: 'Dedicated airport arrival and departure transfers with meet-and-greet.',
    qty: 1,
    price: 90
  },
  {
    title: 'Gardens by the Bay Double Conservatories',
    subText: 'Flower Dome + Cloud Forest Avatar Experience direct e-tickets.',
    qty: 2,
    price: 38
  },
  {
    title: 'Singapore Tourist Visa (E-Visa Application)',
    subText: 'Official Singapore ICA submission and verification.',
    qty: 2,
    price: 55
  }
]

function InvoicePortalContent() {
  const searchParams = useSearchParams()
  const initialRef = searchParams.get('ref') || searchParams.get('proposal') || ''

  // Active Mode: 'lookup' (Customer Portal) or 'generator' (Create Custom Invoice)
  const [activeTab, setActiveTab] = useState<'lookup' | 'generator'>('lookup')

  // Document Type: Tax Invoice vs Proforma Invoice
  const [docType, setDocType] = useState<'TAX INVOICE' | 'PROFORMA INVOICE'>('TAX INVOICE')

  // --- Lookup State ---
  const [searchRef, setSearchRef] = useState(initialRef)
  const [isLoadingProposal, setIsLoadingProposal] = useState(Boolean(initialRef))
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [loadedProposal, setLoadedProposal] = useState<ProposalLookupData | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // --- Live Rate State ---
  const [exchangeRate, setExchangeRate] = useState<number>(64.5)
  const [currencyMode, setCurrencyMode] = useState<'dual' | 'inr' | 'sgd'>('dual')

  // --- Modal State ---
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)

  // --- QR Code Data URL for Web Preview ---
  const [upiQrPreviewUrl, setUpiQrPreviewUrl] = useState<string>('')

  // --- Generator State (for creating ad-hoc invoices) ---
  const [genInvoiceNum, setGenInvoiceNum] = useState<string>('INV-2026-0001')
  const [genInvoiceDate, setGenInvoiceDate] = useState<string>('2026-09-25')
  const [genDueDate, setGenDueDate] = useState<string>('2026-10-02')
  const [genProposalRef, setGenProposalRef] = useState<string>('FW-PROP-8890')
  
  const [genClientName, setGenClientName] = useState<string>('')
  const [genCompanyName, setGenCompanyName] = useState<string>('')
  const [genClientPhone, setGenClientPhone] = useState<string>('')
  const [genClientEmail, setGenClientEmail] = useState<string>('')
  const [genClientGstin, setGenClientGstin] = useState<string>('')

  const [genLineItems, setGenLineItems] = useState<InvoiceLineItem[]>([
    {
      description: 'Singapore Land Tour Package (4N/5D)',
      subText: 'Hotel accommodation with daily breakfast, airport roundtrip transfers, and tourist admissions.',
      quantity: 2,
      unitPriceSgd: 650,
      totalSgd: 1300
    },
    {
      description: 'Singapore Attraction Pass: Universal Studios + S.E.A Aquarium',
      subText: 'Direct entry one-day admission e-tickets for 2 Pax.',
      quantity: 2,
      unitPriceSgd: 110,
      totalSgd: 220
    }
  ])
  const [genDiscountSgd, setGenDiscountSgd] = useState<number>(50)
  const [genAdvancePaidSgd, setGenAdvancePaidSgd] = useState<number>(500)
  const [genPaymentMethod, setGenPaymentMethod] = useState<string>('ICICI Bank Transfer')
  const [genPaymentRef, setGenPaymentRef] = useState<string>('UTR-ADV-782190')

  // Saving state
  const [isSavingToSystem, setIsSavingToSystem] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null)

  // Declare handleLookup with useCallback
  const handleLookup = useCallback(async (queryRef: string) => {
    const trimmed = queryRef.trim()
    if (!trimmed) return

    setIsLoadingProposal(true)
    setLookupError(null)
    setLoadedProposal(null)

    try {
      const res = await fetch(`/api/proposals?number=${encodeURIComponent(trimmed)}`)
      const data = await res.json()

      if (data.found && data.proposal) {
        setLoadedProposal(data.proposal)
      } else {
        setLookupError(`No matching proposal or invoice found for reference "${trimmed}". Please double-check the ID or create a new invoice.`)
      }
    } catch {
      setLookupError('Network error while looking up invoice. Please try again.')
    } finally {
      setIsLoadingProposal(false)
    }
  }, [])

  // Fetch exchange rate on mount
  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(res => res.json())
      .then(data => {
        if (data.rate && typeof data.rate === 'number') {
          setExchangeRate(data.rate)
        }
      })
      .catch(() => {})
  }, [])

  // Lookup proposal if initialRef is provided in query params
  useEffect(() => {
    if (!initialRef) return
    let isCancelled = false

    fetch(`/api/proposals?number=${encodeURIComponent(initialRef.trim())}`)
      .then(res => res.json())
      .then(data => {
        if (isCancelled) return
        if (data.found && data.proposal) {
          setLoadedProposal(data.proposal)
        } else {
          setLookupError(`No matching proposal or invoice found for reference "${initialRef.trim()}". Please double-check the ID or create a new invoice.`)
        }
      })
      .catch(() => {
        if (!isCancelled) setLookupError('Network error while looking up invoice. Please try again.')
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingProposal(false)
      })

    return () => { isCancelled = true }
  }, [initialRef])

  // Derive active invoice data whether from loaded proposal or generator
  const activeInvoiceData: TaxInvoiceData = useMemo(() => {
    if (activeTab === 'lookup' && loadedProposal) {
      const p = loadedProposal
      const invNum = p.invoiceNumber || (p.proposalNumber ? `INV-${new Date().getFullYear()}-${p.proposalNumber.split('-').pop() || '0001'}` : `INV-${new Date().getFullYear()}-0001`)
      const invDate = p.invoiceDate || (p._createdAt ? p._createdAt.split('T')[0] : '2026-09-25')
      const totalContract = p.totalClientPrice || p.costBreakdown?.totalClientPrice || 0
      const adults = p.adults || 2
      const kids = p.kids || 0
      const totalPax = Math.max(1, adults + kids)

      // Line items
      const items: InvoiceLineItem[] = [
        {
          description: `Singapore Tour Package (${p.nights || 3}N/${(p.nights || 3) + 1}D) - ${p.hotelName || 'Standard Hotel'}`,
          subText: `Accommodations (${p.roomType || 'Standard'}), scheduled transfers, and confirmed sightseeing admissions for ${totalPax} Pax.`,
          quantity: totalPax,
          unitPriceSgd: Math.round(totalContract / totalPax),
          totalSgd: totalContract
        },
        ...(Array.isArray(p.additionalCharges) ? p.additionalCharges.map(c => ({
          description: `Add-On / Change Order: ${c.itemDescription}`,
          subText: `Type: ${c.chargeType || 'Service'} • Added ${c.date ? new Date(c.date).toLocaleDateString('en-SG') : 'Post-Confirmation'}`,
          quantity: 1,
          unitPriceSgd: Number(c.amount) || 0,
          totalSgd: Number(c.amount) || 0
        })) : [])
      ]

      // Payments
      const payments: PaymentRecord[] = Array.isArray(p.paymentLedger) ? p.paymentLedger.map(pay => ({
        paymentId: pay.paymentId || 'PAY-001',
        date: pay.date ? new Date(pay.date).toLocaleDateString('en-SG') : 'Recorded',
        amountSgd: Number(pay.amount) || 0,
        amountInr: Math.round((Number(pay.amount) || 0) * exchangeRate),
        method: pay.method || 'Bank Transfer',
        referenceNo: pay.referenceNo,
        notes: pay.notes
      })) : []

      return {
        invoiceNumber: invNum,
        invoiceDate: invDate,
        dueDate: p.arrivalDate || invDate,
        proposalNumber: p.proposalNumber,
        currencyMode,
        exchangeRate,
        docTitle: docType,
        agentName: p.agent?.agentName,
        companyName: p.agent?.companyName,
        agentPhone: p.agent?.phone,
        agentEmail: p.agent?.email,
        leadGuestName: p.guestName || 'Valued Guest',
        leadGuestPhone: p.guestPhone,
        destination: 'Singapore',
        travelDates: p.arrivalDate ? `${p.arrivalDate} (${p.nights || 3}N/${(p.nights || 3) + 1}D)` : undefined,
        nightsCount: p.nights || 3,
        paxCount: `${adults} Adults${kids > 0 ? `, ${kids} Child` : ''}`,
        hotelName: p.hotelName,
        roomType: p.roomType,
        items,
        discountSgd: 0,
        payments,
        status: p.status || 'confirmed'
      }
    }

    // Default Generator Data
    const genPayments: PaymentRecord[] = genAdvancePaidSgd > 0 ? [
      {
        paymentId: 'RCP-001',
        date: genInvoiceDate,
        amountSgd: genAdvancePaidSgd,
        amountInr: Math.round(genAdvancePaidSgd * exchangeRate),
        method: genPaymentMethod,
        referenceNo: genPaymentRef,
        notes: 'Advance booking deposit'
      }
    ] : []

    return {
      invoiceNumber: genInvoiceNum,
      invoiceDate: genInvoiceDate,
      dueDate: genDueDate,
      proposalNumber: genProposalRef,
      currencyMode,
      exchangeRate,
      docTitle: docType,
      companyName: genCompanyName,
      agentName: genCompanyName ? genClientName : undefined,
      leadGuestName: genClientName || 'Valued Guest',
      leadGuestPhone: genClientPhone,
      agentPhone: genClientPhone,
      agentEmail: genClientEmail,
      agentGstin: genClientGstin,
      destination: 'Singapore',
      items: genLineItems,
      discountSgd: genDiscountSgd,
      payments: genPayments,
      status: 'confirmed'
    }
  }, [
    activeTab,
    loadedProposal,
    exchangeRate,
    currencyMode,
    docType,
    genInvoiceNum,
    genInvoiceDate,
    genDueDate,
    genProposalRef,
    genClientName,
    genCompanyName,
    genClientPhone,
    genClientEmail,
    genClientGstin,
    genLineItems,
    genDiscountSgd,
    genAdvancePaidSgd,
    genPaymentMethod,
    genPaymentRef
  ])

  // Calculate totals
  const subtotalSgd = activeInvoiceData.items.reduce((sum, item) => sum + (item.totalSgd || (item.unitPriceSgd * item.quantity)), 0)
  const discountSgd = activeInvoiceData.discountSgd || 0
  const totalContractSgd = Math.max(0, subtotalSgd - discountSgd)
  const totalPaidSgd = activeInvoiceData.payments.reduce((sum, p) => sum + (p.amountSgd || 0), 0)
  const balanceDueSgd = Math.max(0, totalContractSgd - totalPaidSgd)

  const subtotalInr = Math.round(subtotalSgd * exchangeRate)
  const discountInr = Math.round(discountSgd * exchangeRate)
  const totalContractInr = Math.round(totalContractSgd * exchangeRate)
  const totalPaidInr = Math.round(totalPaidSgd * exchangeRate)
  const balanceDueInr = Math.round(balanceDueSgd * exchangeRate)

  // Generate UPI QR Code URL for preview
  useEffect(() => {
    let isMounted = true
    const generateQr = async () => {
      try {
        const QRCode = (await import('qrcode')).default || (await import('qrcode'))
        const upiUri = `upi://pay?pa=233205000112@icici&pn=Flying%20Wonders%20Private%20Limited&am=${balanceDueInr > 0 ? balanceDueInr.toFixed(2) : ''}&cu=INR&tn=${encodeURIComponent(activeInvoiceData.invoiceNumber)}`
        const url = await QRCode.toDataURL(upiUri, {
          margin: 1,
          width: 200,
          color: {
            dark: '#0A2240',
            light: '#FFFFFF'
          }
        })
        if (isMounted) setUpiQrPreviewUrl(url)
      } catch {
        if (isMounted) setUpiQrPreviewUrl('')
      }
    }
    generateQr()
    return () => { isMounted = false }
  }, [balanceDueInr, activeInvoiceData.invoiceNumber])

  // PDF Handlers
  const handleDownloadInvoicePdf = async () => {
    try {
      await generateTaxInvoicePdf(activeInvoiceData)
    } catch {
      alert('Failed to generate Tax Invoice PDF. Please try again.')
    }
  }

  const handleDownloadReceiptPdf = async (payRecord?: PaymentRecord) => {
    try {
      const rec = payRecord || activeInvoiceData.payments[0]
      if (!rec) {
        alert('No payment record available to generate receipt.')
        return
      }
      await generatePaymentReceiptPdf({
        receiptNumber: rec.paymentId || `RCP-${Date.now().toString().slice(-6)}`,
        invoiceNumber: activeInvoiceData.invoiceNumber,
        proposalNumber: activeInvoiceData.proposalNumber,
        paymentDate: rec.date,
        currencyMode,
        exchangeRate,
        payerName: activeInvoiceData.companyName || activeInvoiceData.agentName || activeInvoiceData.leadGuestName,
        payerPhone: activeInvoiceData.leadGuestPhone || activeInvoiceData.agentPhone,
        leadGuestName: activeInvoiceData.leadGuestName,
        amountSgd: rec.amountSgd,
        amountInr: rec.amountInr || Math.round(rec.amountSgd * exchangeRate),
        paymentMethod: rec.method,
        referenceNo: rec.referenceNo,
        notes: rec.notes,
        totalContractSgd,
        totalPaidSgd,
        balanceDueSgd
      })
    } catch {
      alert('Failed to generate Payment Receipt PDF.')
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/invoice?ref=${encodeURIComponent(activeInvoiceData.invoiceNumber)}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // 1-Click WhatsApp Sharing
  const handleWhatsAppShare = () => {
    const text = `*FLYING WONDERS ${docType}*\n` +
      `• Invoice No: ${activeInvoiceData.invoiceNumber}\n` +
      `• Guest / Payer: ${activeInvoiceData.leadGuestName}\n` +
      `• Total Contract: S$ ${totalContractSgd.toLocaleString()} (₹${totalContractInr.toLocaleString()})\n` +
      `• Payments Credited: S$ ${totalPaidSgd.toLocaleString()} (₹${totalPaidInr.toLocaleString()})\n` +
      `• Net Balance Due: S$ ${balanceDueSgd.toLocaleString()} (₹${balanceDueInr.toLocaleString()})\n` +
      `• Payment Due Date: ${activeInvoiceData.dueDate || activeInvoiceData.invoiceDate}\n` +
      `• View, Download & Pay Online: ${window.location.origin}/invoice?ref=${encodeURIComponent(activeInvoiceData.invoiceNumber)}`

    const phone = activeInvoiceData.leadGuestPhone ? activeInvoiceData.leadGuestPhone.replace(/[^0-9]/g, '') : ''
    const waUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank')
  }

  // Save Ad-Hoc Invoice to System
  const handleSaveToSystem = async () => {
    setIsSavingToSystem(true)
    setSaveSuccessMsg(null)
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalNumber: genProposalRef,
          invoiceNumber: genInvoiceNum,
          invoiceDate: genInvoiceDate,
          guestName: genClientName || 'Valued Guest',
          guestPhone: genClientPhone,
          customAgencyName: genCompanyName,
          agentEmail: genClientEmail,
          costBreakdown: {
            totalClientPrice: totalContractSgd,
            totalClientPriceINR: totalContractInr,
          },
          additionalCharges: [],
          paymentLedger: genAdvancePaidSgd > 0 ? [{
            paymentId: 'PAY-' + Date.now().toString().slice(-5),
            date: genInvoiceDate,
            amount: genAdvancePaidSgd,
            method: genPaymentMethod,
            referenceNo: genPaymentRef,
            notes: 'Advance booking deposit'
          }] : []
        })
      })
      const data = await res.json()
      if (data.success) {
        setSaveSuccessMsg(`Invoice "${genInvoiceNum}" has been successfully saved to the system database! You can now look it up anytime with reference "${genInvoiceNum}".`)
      } else {
        alert(data.error || 'Failed to save invoice to system')
      }
    } catch {
      alert('Network error while saving invoice')
    } finally {
      setIsSavingToSystem(false)
    }
  }

  // Generator Helpers
  const addLineItem = () => {
    setGenLineItems(prev => [
      ...prev,
      {
        description: 'Additional Tour Service / Excursion',
        subText: 'Service particulars and confirmed scheduling.',
        quantity: 1,
        unitPriceSgd: 100,
        totalSgd: 100
      }
    ])
  }

  const removeLineItem = (index: number) => {
    setGenLineItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, val: string | number) => {
    setGenLineItems(prev => {
      const copy = [...prev]
      const row = { ...copy[index], [field]: val }
      if (field === 'quantity' || field === 'unitPriceSgd') {
        const qty = field === 'quantity' ? Number(val) || 0 : row.quantity
        const rate = field === 'unitPriceSgd' ? Number(val) || 0 : row.unitPriceSgd
        row.totalSgd = qty * rate
      }
      copy[index] = row
      return copy
    })
  }

  const applyPresetService = (preset: typeof PRESET_SERVICES[0]) => {
    setGenLineItems(prev => [
      ...prev,
      {
        description: preset.title,
        subText: preset.subText,
        quantity: preset.qty,
        unitPriceSgd: preset.price,
        totalSgd: preset.qty * preset.price
      }
    ])
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary, #F8FAFC)',
      color: 'var(--text-primary, #0F172A)',
      fontFamily: 'var(--font-inter), system-ui, -apple-system, sans-serif',
      padding: '2rem 1rem 4rem 1rem'
    }}>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* Navigation Breadcrumb & Header */}
        <div className="no-print" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748B', marginBottom: '0.35rem' }}>
              <Link href="/" style={{ color: '#0F766E', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
              <ChevronRight size={14} />
              <span>Customer Invoicing & Receipts</span>
            </div>
            <h1 style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--text-primary, #0F172A)',
              fontFamily: 'var(--font-playfair), Georgia, serif',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <FileText color="#0F766E" size={28} />
              Customer Tax Invoice Portal
            </h1>
            <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.88rem', color: '#64748B' }}>
              Official Singapore Destination Management Company (DMC) Tax Invoices, Remittance QR & Payment Receipts
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-secondary, #E2E8F0)',
            padding: '0.3rem',
            borderRadius: '12px',
            gap: '0.3rem'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('lookup')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'lookup' ? '#0A2240' : 'transparent',
                color: activeTab === 'lookup' ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Search size={15} /> Lookup Invoice
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'generator' ? '#0A2240' : 'transparent',
                color: activeTab === 'generator' ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={15} /> Ad-Hoc Invoice Generator
            </button>
          </div>
        </div>

        {/* --- TAB 1: LOOKUP SEARCH BAR --- */}
        {activeTab === 'lookup' && (
          <div className="no-print" style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            marginBottom: '1.75rem'
          }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>
              Search by Invoice Number or Proposal Reference:
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="e.g. INV-2026-FW0142 or FW-2026-XXXX"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLookup(searchRef) }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#0F172A',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleLookup(searchRef)}
                disabled={isLoadingProposal}
                style={{
                  background: '#0F766E',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 6px rgba(15, 118, 110, 0.25)'
                }}
              >
                {isLoadingProposal ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
                Search Invoice
              </button>
            </div>

            {lookupError && (
              <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: '#FEF2F2', border: '1px solid #F87171', borderRadius: '10px', color: '#991B1B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>{lookupError}</span>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: AD-HOC GENERATOR FORM CONTROLS --- */}
        {activeTab === 'generator' && (
          <div className="no-print" style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            marginBottom: '1.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0A2240' }}>
                  Create Customer Invoice On-The-Fly
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Quickly craft an official invoice for customized day tours, attraction passes, or corporate bookings.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleSaveToSystem}
                  disabled={isSavingToSystem}
                  style={{
                    background: '#166534',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 2px 4px rgba(22, 101, 52, 0.2)'
                  }}
                >
                  {isSavingToSystem ? <RefreshCw className="animate-spin" size={13} /> : <Save size={13} />}
                  Save Invoice to System
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const rnd = Math.floor(1000 + Math.random() * 9000).toString()
                    setGenInvoiceNum(`INV-${new Date().getFullYear()}-${rnd}`)
                  }}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <RefreshCw size={12} /> Regenerate Invoice No
                </button>
              </div>
            </div>

            {saveSuccessMsg && (
              <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '10px', color: '#166534', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Grid 1: Meta Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Invoice Number</label>
                <input
                  type="text"
                  value={genInvoiceNum}
                  onChange={(e) => setGenInvoiceNum(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Invoice Date</label>
                <input
                  type="date"
                  value={genInvoiceDate}
                  onChange={(e) => setGenInvoiceDate(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem', color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Payment Due Date</label>
                <input
                  type="date"
                  value={genDueDate}
                  onChange={(e) => setGenDueDate(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem', color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Proposal / Booking Reference</label>
                <input
                  type="text"
                  value={genProposalRef}
                  onChange={(e) => setGenProposalRef(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem', color: '#0F172A' }}
                />
              </div>
            </div>

            {/* Grid 2: Billed To Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Lead Traveler / Client Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Rajesh Sharma"
                  value={genClientName}
                  onChange={(e) => setGenClientName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Agency / Corporate Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Zenith Luxury Vacations"
                  value={genCompanyName}
                  onChange={(e) => setGenCompanyName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem', color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Client Phone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="+91 98860 00000"
                  value={genClientPhone}
                  onChange={(e) => setGenClientPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem', color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Client Email (Optional)</label>
                <input
                  type="email"
                  placeholder="client@flyingwonders.net"
                  value={genClientEmail}
                  onChange={(e) => setGenClientEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem', color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Agent GSTIN / Tax ID (Optional)</label>
                <input
                  type="text"
                  placeholder="29AABCZ1234D1Z5"
                  value={genClientGstin}
                  onChange={(e) => setGenClientGstin(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem', color: '#0F172A' }}
                />
              </div>
            </div>

            {/* Quick Service Presets */}
            <div style={{ marginBottom: '1.25rem', background: '#F1F5F9', padding: '0.75rem 1rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                ⚡ Quick Presets (Click to insert):
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {PRESET_SERVICES.map((p, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => applyPresetService(p)}
                    style={{
                      background: '#FFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#0F766E',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Plus size={11} /> {p.title} (S${p.price})
                  </button>
                ))}
              </div>
            </div>

            {/* Line Items Builder */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>Invoice Line Items (Tariff in SGD):</span>
                <button
                  type="button"
                  onClick={addLineItem}
                  style={{
                    background: '#0F766E',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Plus size={13} /> Add Custom Line Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {genLineItems.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 1fr 1fr 1fr auto',
                    gap: '0.5rem',
                    alignItems: 'center',
                    background: '#F8FAFC',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div>
                      <input
                        type="text"
                        placeholder="Description of Service"
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                        style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.25rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Optional Sub-text or Inclusions details"
                        value={item.subText || ''}
                        onChange={(e) => updateLineItem(idx, 'subText', e.target.value)}
                        style={{ width: '100%', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.75rem', color: '#64748B' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', color: '#64748B' }}>Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                        style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', color: '#64748B' }}>Rate (SGD)</label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPriceSgd}
                        onChange={(e) => updateLineItem(idx, 'unitPriceSgd', e.target.value)}
                        style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', color: '#64748B' }}>Total (SGD)</label>
                      <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', fontWeight: 700, color: '#0A2240' }}>
                        S$ {item.totalSgd.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      {genLineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          style={{ background: '#FEE2E2', border: 'none', color: '#B91C1C', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discounts and Advance Payment */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Partner Discount (SGD)</label>
                <input
                  type="number"
                  min="0"
                  value={genDiscountSgd}
                  onChange={(e) => setGenDiscountSgd(Math.max(0, Number(e.target.value) || 0))}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 700, color: '#B91C1C' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Advance Deposit Paid (SGD)</label>
                <input
                  type="number"
                  min="0"
                  value={genAdvancePaidSgd}
                  onChange={(e) => setGenAdvancePaidSgd(Math.max(0, Number(e.target.value) || 0))}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Payment Method</label>
                <input
                  type="text"
                  value={genPaymentMethod}
                  onChange={(e) => setGenPaymentMethod(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>UTR / Transaction Reference</label>
                <input
                  type="text"
                  value={genPaymentRef}
                  onChange={(e) => setGenPaymentRef(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', color: '#0F172A' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- ACTION TOOLBAR (Top of Invoice Preview) --- */}
        <div className="no-print" style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          background: '#0A2240',
          color: '#FFFFFF',
          padding: '0.85rem 1.25rem',
          borderRadius: '14px',
          marginBottom: '1.25rem',
          boxShadow: '0 4px 14px rgba(10, 34, 64, 0.15)'
        }}>
          {/* Document Type & Currency Toggle */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#CBD5E1' }}>Document:</span>
              <div style={{ display: 'inline-flex', background: '#1E293B', padding: '0.2rem', borderRadius: '8px', border: '1px solid #334155' }}>
                {(['TAX INVOICE', 'PROFORMA INVOICE'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDocType(type)}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: docType === type ? '#0F766E' : 'transparent',
                      color: '#FFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {type === 'TAX INVOICE' ? 'Tax Invoice' : 'Proforma'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#CBD5E1' }}>Currency:</span>
              <div style={{ display: 'inline-flex', background: '#1E293B', padding: '0.2rem', borderRadius: '8px', border: '1px solid #334155' }}>
                {(['dual', 'sgd', 'inr'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setCurrencyMode(mode)}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: currencyMode === mode ? '#0F766E' : 'transparent',
                      color: '#FFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    {mode === 'dual' ? 'Dual (SGD + INR)' : mode.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
              (1 SGD = ₹{exchangeRate.toFixed(2)})
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleDownloadInvoicePdf}
              style={{
                background: '#0F766E',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                padding: '0.55rem 0.95rem',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(15, 118, 110, 0.3)'
              }}
            >
              <Download size={15} /> Download PDF
            </button>

            {activeInvoiceData.payments.length > 0 && (
              <button
                type="button"
                onClick={() => handleDownloadReceiptPdf()}
                style={{
                  background: '#1E293B',
                  color: '#CBD5E1',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  padding: '0.55rem 0.85rem',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Receipt size={15} color="#34D399" /> Receipt PDF
              </button>
            )}

            <button
              type="button"
              onClick={handleWhatsAppShare}
              title="Share invoice summary on WhatsApp"
              style={{
                background: '#25D366',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                padding: '0.55rem 0.85rem',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)'
              }}
            >
              <MessageCircle size={15} /> WhatsApp
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                background: '#1E293B',
                color: '#CBD5E1',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '0.55rem 0.85rem',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Printer size={15} /> Print
            </button>

            {balanceDueSgd > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.55rem 0.95rem',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <CreditCard size={15} /> UPI Pay
                </button>

                <Link
                  href={`/pay?ref=${encodeURIComponent(activeInvoiceData.invoiceNumber)}&amount=${balanceDueSgd}&name=${encodeURIComponent(activeInvoiceData.leadGuestName)}&phone=${encodeURIComponent(activeInvoiceData.leadGuestPhone || '')}&email=${encodeURIComponent(activeInvoiceData.agentEmail || '')}`}
                  style={{
                    background: '#0F766E',
                    color: '#FFF',
                    borderRadius: '8px',
                    padding: '0.55rem 0.85rem',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <CreditCard size={14} /> Card Checkout
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy link to this invoice"
              style={{
                background: copiedLink ? '#10B981' : '#1E293B',
                color: '#FFF',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '0.55rem 0.75rem',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* --- MAIN PRINTABLE INVOICE DOCUMENT --- */}
        <div
          id="printable-invoice"
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #CBD5E1',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            padding: '2.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Watermark Badge */}
          <div style={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-25deg)',
            fontSize: '6rem',
            fontWeight: 900,
            color: balanceDueSgd === 0 ? 'rgba(22, 101, 52, 0.04)' : 'rgba(10, 34, 64, 0.03)',
            userSelect: 'none',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            letterSpacing: '0.1em'
          }}>
            {balanceDueSgd === 0 ? 'PAID IN FULL' : docType}
          </div>

          {/* 1. Header Block */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.5rem',
            background: '#F8FAFC',
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            marginBottom: '1.75rem'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '65px', height: '65px', flexShrink: 0 }}>
                <Image
                  src="/images/logo.png"
                  alt="Flying Wonders Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
              <div>
                <h2 style={{ margin: '0 0 0.2rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0A2240', letterSpacing: '-0.01em' }}>
                  FLYING WONDERS PRIVATE LIMITED
                </h2>
                <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: '1.45' }}>
                  #74, 4th Cross, SBM Colony, BSK 1st Stage, Bangalore - 560050, Karnataka, India<br />
                  <strong>CIN:</strong> U63090KA2016PTC095564 | <strong>GSTIN:</strong> 29AACCF8829R1ZN (State Code: 29 - Karnataka)<br />
                  <strong>Email:</strong> info.flyingwonders@gmail.com | <strong>Web:</strong> www.flyingwonders.net<br />
                  <strong>India Desk:</strong> +91 9886171251 | <strong>Singapore Support:</strong> +65 94722830
                </div>
              </div>
            </div>

            <div style={{
              background: '#0A2240',
              color: '#FFFFFF',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              textAlign: 'center',
              minWidth: '150px'
            }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94A3B8', display: 'block', fontWeight: 700 }}>
                SAC 998553 / TOUR SERVICES
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                {docType}
              </span>
            </div>
          </div>

          {/* 2. Metadata Cards (Invoice Specs & Billed To) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem',
            background: '#F8FAFC',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            marginBottom: '1.75rem'
          }}>
            {/* Left: Invoice Specs */}
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0F766E', display: 'block', marginBottom: '0.5rem' }}>
                INVOICE SPECIFICATION
              </span>
              <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.2rem 0', color: '#64748B', width: '110px' }}>Invoice No:</td>
                    <td style={{ padding: '0.2rem 0', fontWeight: 800, color: '#0A2240' }}>{activeInvoiceData.invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.2rem 0', color: '#64748B' }}>Invoice Date:</td>
                    <td style={{ padding: '0.2rem 0', fontWeight: 600, color: '#1E293B' }}>{activeInvoiceData.invoiceDate}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.2rem 0', color: '#64748B' }}>Payment Due:</td>
                    <td style={{ padding: '0.2rem 0', fontWeight: 700, color: '#B91C1C' }}>{activeInvoiceData.dueDate || activeInvoiceData.invoiceDate}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.2rem 0', color: '#64748B' }}>Proposal Ref:</td>
                    <td style={{ padding: '0.2rem 0', fontWeight: 700, color: '#0F766E' }}>{activeInvoiceData.proposalNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.2rem 0', color: '#64748B' }}>SAC Code:</td>
                    <td style={{ padding: '0.2rem 0', color: '#1E293B' }}>998553 (Tour Operator Services)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right: Billed To */}
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0F766E', display: 'block', marginBottom: '0.5rem' }}>
                BILLED TO (CLIENT / PARTNER)
              </span>
              <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.2rem 0', color: '#64748B', width: '110px' }}>Agency / Payer:</td>
                    <td style={{ padding: '0.2rem 0', fontWeight: 800, color: '#0A2240' }}>
                      {activeInvoiceData.companyName || activeInvoiceData.agentName || 'B2C Direct Client'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.2rem 0', color: '#64748B' }}>Lead Traveler:</td>
                    <td style={{ padding: '0.2rem 0', fontWeight: 600, color: '#1E293B' }}>
                      {activeInvoiceData.leadGuestName} {activeInvoiceData.leadGuestPhone ? `(${activeInvoiceData.leadGuestPhone})` : ''}
                    </td>
                  </tr>
                  {activeInvoiceData.agentGstin && (
                    <tr>
                      <td style={{ padding: '0.2rem 0', color: '#64748B' }}>Agent GSTIN:</td>
                      <td style={{ padding: '0.2rem 0', fontWeight: 600, color: '#0F172A' }}>{activeInvoiceData.agentGstin}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '0.2rem 0', color: '#64748B' }}>Tour Itinerary:</td>
                    <td style={{ padding: '0.2rem 0', color: '#1E293B' }}>
                      {activeInvoiceData.destination || 'Singapore'}
                      {activeInvoiceData.nightsCount ? ` • ${activeInvoiceData.nightsCount}N/${activeInvoiceData.nightsCount + 1}D` : ''}
                      {activeInvoiceData.hotelName ? ` • ${activeInvoiceData.hotelName}` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.2rem 0', color: '#64748B' }}>Settlement:</td>
                    <td style={{ padding: '0.2rem 0' }}>
                      {balanceDueSgd === 0 ? (
                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                          🟢 Fully Settled
                        </span>
                      ) : totalPaidSgd > 0 ? (
                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                          🟡 Partial Payment Received
                        </span>
                      ) : (
                        <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                          🔴 Payment Pending
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Line Items Table */}
          <div style={{ marginBottom: '1.75rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#0A2240', color: '#FFFFFF', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.75rem', width: '35px' }}>#</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>PARTICULARS / TOUR SERVICES DESCRIPTION</th>
                  <th style={{ padding: '0.65rem 0.75rem', width: '60px', textAlign: 'center' }}>QTY</th>
                  {currencyMode === 'dual' ? (
                    <>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>RATE (SGD)</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>TOTAL (SGD)</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>TOTAL (INR)</th>
                    </>
                  ) : currencyMode === 'inr' ? (
                    <>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>RATE (INR)</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>TOTAL (INR)</th>
                    </>
                  ) : (
                    <>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>RATE (SGD)</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>TOTAL (SGD)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {activeInvoiceData.items.map((item, idx) => {
                  const itemTotalSgd = item.totalSgd || (item.unitPriceSgd * item.quantity)
                  const itemTotalInr = Math.round(itemTotalSgd * exchangeRate)
                  const itemRateInr = Math.round(item.unitPriceSgd * exchangeRate)

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#64748B' }}>{idx + 1}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{item.description}</div>
                        {item.subText && (
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                            {item.subText}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                        {item.quantity}
                      </td>
                      {currencyMode === 'dual' ? (
                        <>
                          <td style={{ padding: '0.75rem', textAlign: 'right', color: '#475569' }}>
                            S$ {item.unitPriceSgd.toLocaleString()}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#0A2240' }}>
                            S$ {itemTotalSgd.toLocaleString()}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#0F766E' }}>
                            ₹{itemTotalInr.toLocaleString()}
                          </td>
                        </>
                      ) : currencyMode === 'inr' ? (
                        <>
                          <td style={{ padding: '0.75rem', textAlign: 'right', color: '#475569' }}>
                            ₹{itemRateInr.toLocaleString()}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#0F766E' }}>
                            ₹{itemTotalInr.toLocaleString()}
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: '0.75rem', textAlign: 'right', color: '#475569' }}>
                            S$ {item.unitPriceSgd.toLocaleString()}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#0A2240' }}>
                            S$ {itemTotalSgd.toLocaleString()}
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 4. Financial Calculations & Summary Box */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginBottom: '1.75rem'
          }}>
            <div style={{ width: '100%', maxWidth: '420px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', color: '#475569' }}>
                <span>Subtotal Services:</span>
                <span style={{ fontWeight: 600 }}>
                  {currencyMode === 'dual' ? `S$ ${subtotalSgd.toLocaleString()} | ₹${subtotalInr.toLocaleString()}` : currencyMode === 'inr' ? `₹${subtotalInr.toLocaleString()}` : `S$ ${subtotalSgd.toLocaleString()}`}
                </span>
              </div>

              {discountSgd > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', color: '#B91C1C' }}>
                  <span>Special DMC Discount / Credit:</span>
                  <span style={{ fontWeight: 700 }}>
                    {currencyMode === 'dual' ? `-S$ ${discountSgd.toLocaleString()} | -₹${discountInr.toLocaleString()}` : currencyMode === 'inr' ? `-₹${discountInr.toLocaleString()}` : `-S$ ${discountSgd.toLocaleString()}`}
                  </span>
                </div>
              )}

              <div style={{ fontSize: '0.72rem', fontStyle: 'italic', color: '#64748B', margin: '0.25rem 0 0.5rem 0', textAlign: 'right' }}>
                * 5% GST on Tour Operator Services (SAC 998553) included in tour tariff
              </div>

              {/* Total Contract Banner */}
              <div style={{
                background: '#0A2240',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '0.9rem',
                marginBottom: '0.5rem'
              }}>
                <span>TOTAL CONTRACT VALUE:</span>
                <span>
                  {currencyMode === 'dual' ? `S$ ${totalContractSgd.toLocaleString()} | ₹${totalContractInr.toLocaleString()}` : currencyMode === 'inr' ? `₹${totalContractInr.toLocaleString()}` : `S$ ${totalContractSgd.toLocaleString()}`}
                </span>
              </div>

              {/* Less Payments */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', color: '#166534', fontWeight: 700 }}>
                <span>Less Payments Credited:</span>
                <span>
                  {currencyMode === 'dual' ? `S$ ${totalPaidSgd.toLocaleString()} | ₹${totalPaidInr.toLocaleString()}` : currencyMode === 'inr' ? `₹${totalPaidInr.toLocaleString()}` : `S$ ${totalPaidSgd.toLocaleString()}`}
                </span>
              </div>

              {/* Net Balance Due Banner */}
              <div style={{
                background: balanceDueSgd === 0 ? '#DCFCE7' : '#FEE2E2',
                color: balanceDueSgd === 0 ? '#166534' : '#991B1B',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 900,
                fontSize: '0.95rem',
                marginTop: '0.35rem',
                border: `1px solid ${balanceDueSgd === 0 ? '#86EFAC' : '#FCA5A5'}`
              }}>
                <span>{balanceDueSgd === 0 ? 'NET BALANCE DUE (PAID):' : 'NET BALANCE DUE:'}</span>
                <span>
                  {currencyMode === 'dual' ? `S$ ${balanceDueSgd.toLocaleString()} | ₹${balanceDueInr.toLocaleString()}` : currencyMode === 'inr' ? `₹${balanceDueInr.toLocaleString()}` : `S$ ${balanceDueSgd.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Payments History Ledger (If any) */}
          {activeInvoiceData.payments.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0F766E', display: 'block', marginBottom: '0.4rem' }}>
                OFFICIAL PAYMENT HISTORY LEDGER & RECEIPTS
              </span>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '0.45rem 0.65rem' }}>Receipt / Ref</th>
                      <th style={{ padding: '0.45rem 0.65rem' }}>Date</th>
                      <th style={{ padding: '0.45rem 0.65rem' }}>Method / Channel</th>
                      <th style={{ padding: '0.45rem 0.65rem' }}>Transaction / UTR</th>
                      <th style={{ padding: '0.45rem 0.65rem', textAlign: 'right' }}>Amount Credited</th>
                      <th className="no-print" style={{ padding: '0.45rem 0.65rem', textAlign: 'center' }}>Receipt PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeInvoiceData.payments.map((p, pIdx) => (
                      <tr key={pIdx} style={{ borderTop: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '0.5rem 0.65rem', fontWeight: 700, color: '#0F766E' }}>{p.paymentId}</td>
                        <td style={{ padding: '0.5rem 0.65rem', color: '#334155' }}>{p.date}</td>
                        <td style={{ padding: '0.5rem 0.65rem', color: '#334155' }}>{p.method}</td>
                        <td style={{ padding: '0.5rem 0.65rem', color: '#64748B', fontFamily: 'monospace' }}>{p.referenceNo || 'N/A'}</td>
                        <td style={{ padding: '0.5rem 0.65rem', textAlign: 'right', fontWeight: 700, color: '#166534' }}>
                          S$ {p.amountSgd.toLocaleString()} (₹{Math.round(p.amountSgd * exchangeRate).toLocaleString()})
                        </td>
                        <td className="no-print" style={{ padding: '0.5rem 0.65rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDownloadReceiptPdf(p)}
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#0F766E',
                              cursor: 'pointer'
                            }}
                          >
                            Receipt PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. Remittance Particulars & Dynamic UPI QR Code */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            background: '#F8FAFC',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            alignItems: 'center',
            marginBottom: '1.75rem'
          }}>
            {/* Bank Particulars */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0A2240', display: 'block', marginBottom: '0.4rem' }}>
                OFFICIAL BANK REMITTANCE PARTICULARS
              </span>
              <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: '1.55' }}>
                <strong>Account Name:</strong> FLYING WONDERS PRIVATE LIMITED<br />
                <strong>Bank Name:</strong> ICICI Bank Ltd (Current Account)<br />
                <strong>Account Number:</strong> 233205000112<br />
                <strong>IFSC Code:</strong> ICIC0002332 | <strong>Branch:</strong> Jayanagar 8th Block, Bangalore<br />
                <strong>BSR Code:</strong> 6390053 (for Wire Remittance)<br />
                <span style={{ color: '#64748B', fontStyle: 'italic', fontSize: '0.72rem' }}>
                  * Applicable Exchange Rate: S$ 1.00 = ₹{exchangeRate.toFixed(2)} (Locked at Confirmation)
                </span>
              </div>
            </div>

            {/* UPI QR Box */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              borderLeft: '1px dashed #CBD5E1',
              paddingLeft: '1rem'
            }}>
              {upiQrPreviewUrl ? (
                <>
                  <div style={{ position: 'relative', width: '110px', height: '110px', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '4px', background: '#FFF' }}>
                    <Image
                      src={upiQrPreviewUrl}
                      alt="Scan to Pay via UPI"
                      fill
                      unoptimized
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0A2240', marginTop: '0.4rem' }}>
                    SCAN TO PAY (UPI)
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                    Payable: {balanceDueInr > 0 ? `₹${balanceDueInr.toLocaleString()}` : 'Settled'}
                  </span>
                </>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>UPI QR Available on PDF</div>
              )}
            </div>
          </div>

          {/* 7. Accreditations Footer Ribbon */}
          <div style={{
            borderTop: '1px solid #E2E8F0',
            paddingTop: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.72rem',
            color: '#64748B'
          }}>
            <div style={{ position: 'relative', width: '280px', height: '28px' }}>
              <Image
                src="/images/voucher-footer-accreditations.png"
                alt="Accreditations Ribbon"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>Official Electronic Tax Document • Subject to Bangalore Jurisdiction</div>
              <div style={{ fontWeight: 600, color: '#0F766E' }}>Flying Wonders Singapore DMC Specialist</div>
            </div>
          </div>

        </div>

      </div>

      {/* UPI QR Payment Modal */}
      <IciciQrModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        amountSgd={balanceDueSgd}
        bookingReference={activeInvoiceData.invoiceNumber || activeInvoiceData.proposalNumber}
        initialGuestName={activeInvoiceData.leadGuestName}
        initialEmail={activeInvoiceData.agentEmail || ''}
        initialPhone={activeInvoiceData.leadGuestPhone || activeInvoiceData.agentPhone || ''}
      />
    </div>
  )
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F766E' }}>
        <RefreshCw className="animate-spin" size={28} />
      </div>
    }>
      <InvoicePortalContent />
    </Suspense>
  )
}
