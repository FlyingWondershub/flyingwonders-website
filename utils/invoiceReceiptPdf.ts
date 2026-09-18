/**
 * Professional Tax Invoice & Payment Receipt PDF Generator
 * Issuer: FLYING WONDERS PRIVATE LIMITED (Bangalore, India)
 * Features:
 * - Crisp High-Resolution Typography & Executive Layout
 * - Large Centered Watermark with 90% Transparency (10% Opacity)
 * - Dual-Currency (SGD & INR), INR Only, or SGD Only toggle
 * - SAC 998553 (Tour Operator Services) Tax Breakdown
 * - ICICI Current Account Remittance & Dynamic UPI QR Code
 * - Accreditation Footer Ribbon
 */

export interface InvoiceLineItem {
  description: string
  subText?: string
  quantity: number
  unitPriceSgd: number
  totalSgd: number
  unitPriceInr?: number
  totalInr?: number
}

export interface PaymentRecord {
  paymentId: string
  date: string
  amountSgd: number
  amountInr?: number
  method: string
  referenceNo?: string
  notes?: string
}

export interface TaxInvoiceData {
  invoiceNumber: string
  invoiceDate: string
  dueDate?: string
  proposalNumber: string
  currencyMode?: 'dual' | 'inr' | 'sgd'
  exchangeRate?: number // SGD to INR rate
  taxMode?: 'inclusive' | 'itemized'
  isInterState?: boolean // true = 5% IGST, false = 2.5% CGST + 2.5% SGST (Karnataka)
  
  // Client / Agent details
  agentName?: string
  companyName?: string
  agentPhone?: string
  agentEmail?: string
  agentGstin?: string
  leadGuestName: string
  leadGuestPhone?: string
  
  // Tour Details
  destination?: string
  travelDates?: string
  nightsCount?: number
  paxCount?: string
  hotelName?: string
  roomType?: string
  
  // Financials
  items: InvoiceLineItem[]
  discountSgd?: number
  payments: PaymentRecord[]
  status?: 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' | 'void'
}

export interface ReceiptData {
  receiptNumber: string
  invoiceNumber: string
  proposalNumber: string
  paymentDate: string
  currencyMode?: 'dual' | 'inr' | 'sgd'
  exchangeRate?: number
  
  payerName: string
  payerPhone?: string
  leadGuestName: string
  
  amountSgd: number
  amountInr?: number
  paymentMethod: string
  referenceNo?: string
  notes?: string
  
  totalContractSgd: number
  totalPaidSgd: number
  balanceDueSgd: number
}

// Brand Colors
const NAVY: [number, number, number] = [10, 34, 64]
const GOLD: [number, number, number] = [196, 156, 60]
const EMERALD: [number, number, number] = [15, 118, 110]
const CRIMSON: [number, number, number] = [184, 58, 75]
const DARK_SLATE: [number, number, number] = [30, 41, 59]
const MUTED_GRAY: [number, number, number] = [100, 116, 139]
const BORDER_LIGHT: [number, number, number] = [226, 232, 240]
const LIGHT_BG: [number, number, number] = [248, 250, 252]
const WHITE: [number, number, number] = [255, 255, 255]

async function loadAssetDataUrl(url: string): Promise<string> {
  if (typeof window === 'undefined') return ''
  try {
    const res = await fetch(url)
    if (res.ok) {
      const blob = await res.blob()
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve((reader.result as string) || '')
        reader.onerror = () => resolve('')
        reader.readAsDataURL(blob)
      })
    }
  } catch (e) {}

  return new Promise<string>((resolve) => {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        } else {
          resolve('')
        }
      }
      img.onerror = () => resolve('')
      img.src = url
    } catch {
      resolve('')
    }
  })
}

async function generateUpiQrDataUrl(amountInr: number, invoiceNum: string): Promise<string> {
  try {
    const QRCode = (await import('qrcode')).default || (await import('qrcode'))
    const upiUri = `upi://pay?pa=233205000112@icici&pn=Flying%20Wonders%20Private%20Limited&am=${amountInr > 0 ? amountInr.toFixed(2) : ''}&cu=INR&tn=${encodeURIComponent(invoiceNum)}`
    return await QRCode.toDataURL(upiUri, {
      margin: 1,
      width: 250,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0A2240',
        light: '#FFFFFF',
      },
    })
  } catch (err) {
    return ''
  }
}

function drawCenterWatermark(doc: any, watermarkDataUrl: string) {
  if (!watermarkDataUrl) return
  try {
    doc.saveGraphicsState()
    doc.setGState(new (doc as any).GState({ opacity: 0.05 })) // Ultra-subtle watermark ensuring crisp text readability
    doc.addImage(watermarkDataUrl, 'PNG', 45, 88, 120, 120, undefined, 'FAST')
    doc.restoreGraphicsState()
  } catch (e) {
    console.warn('Watermark error:', e)
  }
}

function drawAccreditationFooter(doc: any, footerAccreditationUrl: string, pageNum: number, totalPages: number) {
  const ML = 14
  const MR = 196
  const FY = 270

  doc.setDrawColor(...BORDER_LIGHT)
  doc.setLineWidth(0.35)
  doc.line(ML, FY - 2, MR, FY - 2)

  const footW = 145
  const footH = footW / 4.675
  if (footerAccreditationUrl) {
    try {
      doc.addImage(footerAccreditationUrl, 'PNG', ML, FY, footW, footH, undefined, 'FAST')
    } catch (e) {}
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...MUTED_GRAY)
  doc.text(`Page ${pageNum} of ${totalPages}`, MR, FY + 10, { align: 'right' })
  doc.text('Subject to Bangalore Jurisdiction', MR, FY + 15, { align: 'right' })
}

function drawIndianEntityHeader(doc: any, logoUrl: string, docTitle: string, docSubtitle?: string): number {
  const ML = 14
  const MR = 196

  doc.setFillColor(248, 250, 252)
  doc.roundedRect(ML, 8, MR - ML, 32, 2, 2, 'F')
  doc.setDrawColor(...BORDER_LIGHT)
  doc.setLineWidth(0.4)
  doc.roundedRect(ML, 8, MR - ML, 32, 2, 2, 'S')

  if (logoUrl) {
    try {
      doc.addImage(logoUrl, 'PNG', ML + 3, 10.5, 25, 25, undefined, 'FAST')
    } catch (e) {}
  }

  const textX = logoUrl ? (ML + 31) : (ML + 4)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...NAVY)
  doc.text('FLYING WONDERS PRIVATE LIMITED', textX, 15)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...DARK_SLATE)
  doc.text('#74, 4th Cross, SBM Colony, BSK 1st Stage, Bangalore - 560050, Karnataka, India', textX, 19.5)
  doc.text('CIN: U63090KA2016PTC095564  |  GSTIN: 29AACCF8829R1ZN (State: 29 - Karnataka)', textX, 23.5)
  doc.text('Email: info.flyingwonders@gmail.com / contact@flyingwonders.net  |  Web: www.flyingwonders.net', textX, 27.5)
  doc.text('India: +91 9886171251  |  Singapore Support: +65 94722830', textX, 31.5)

  const badgeW = docSubtitle ? 52 : 44
  const badgeH = docSubtitle ? 16 : 13
  const badgeX = MR - badgeW - 3
  const badgeY = 17.5 - (badgeH / 2)

  doc.setFillColor(...NAVY)
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...WHITE)
  
  if (docSubtitle) {
    doc.text(docTitle, badgeX + (badgeW / 2), badgeY + 6.8, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.8)
    doc.setTextColor(226, 232, 240)
    doc.text(docSubtitle, badgeX + (badgeW / 2), badgeY + 12, { align: 'center' })
  } else {
    doc.text(docTitle, badgeX + (badgeW / 2), badgeY + 8.5, { align: 'center' })
  }

  return 44
}

/**
 * Generate Comprehensive Tax Invoice PDF
 */
export async function generateTaxInvoicePdf(invoice: TaxInvoiceData) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  })

  const [logoUrl, watermarkUrl, footerAccreditationUrl] = await Promise.all([
    loadAssetDataUrl('/images/logo.png'),
    loadAssetDataUrl('/images/logo.png'),
    loadAssetDataUrl('/images/voucher-footer-accreditations.png'),
  ])

  const rate = invoice.exchangeRate || 63.5
  const mode = invoice.currencyMode || 'dual'
  const ML = 14
  const MR = 196
  const CW = MR - ML

  // 1. Watermark (drawn first as background layer, ultra-subtle so all text stays 100% on top)
  drawCenterWatermark(doc, watermarkUrl)
  let curY = drawIndianEntityHeader(
    doc,
    logoUrl,
    'TAX INVOICE'
  )

  // 2. Invoice Meta & Billed To Card
  doc.setFillColor(...LIGHT_BG)
  doc.setDrawColor(...BORDER_LIGHT)
  doc.roundedRect(ML, curY, CW, 31, 2, 2, 'FD')

  // Left Column: Invoice Meta
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...NAVY)
  doc.text('INVOICE SPECIFICATION', ML + 4, curY + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...DARK_SLATE)
  doc.text('Invoice No     : ', ML + 4, curY + 11)
  doc.setFont('helvetica', 'bold')
  doc.text(invoice.invoiceNumber, ML + 26, curY + 11)

  doc.setFont('helvetica', 'normal')
  doc.text(`Invoice Date   : ${invoice.invoiceDate}`, ML + 4, curY + 16)
  doc.text(`Due Date       : ${invoice.dueDate || invoice.invoiceDate}`, ML + 4, curY + 21)
  doc.text(`Proposal Ref   : ${invoice.proposalNumber}`, ML + 4, curY + 26)

  // Right Column: Billed To
  const col2X = ML + 95
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...NAVY)
  doc.text('BILLED TO (B2B PARTNER / CLIENT)', col2X, curY + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...DARK_SLATE)
  doc.text('Agency / Payer : ', col2X, curY + 11)
  doc.setFont('helvetica', 'bold')
  doc.text(invoice.companyName || invoice.agentName || 'B2C Direct Client', col2X + 24, curY + 11)

  doc.setFont('helvetica', 'normal')
  if (invoice.agentPhone || invoice.agentEmail) {
    doc.text(`Contact Info   : ${invoice.agentPhone || ''} ${invoice.agentEmail ? `(${invoice.agentEmail})` : ''}`.trim(), col2X, curY + 16)
  }
  doc.text(`Lead Traveler  : ${invoice.leadGuestName} ${invoice.leadGuestPhone ? `(${invoice.leadGuestPhone})` : ''}`, col2X, curY + 21)
  if (invoice.agentGstin) {
    doc.text(`Agent GSTIN    : ${invoice.agentGstin}`, col2X, curY + 26)
  } else {
    doc.text(`Tour Scope     : ${invoice.destination || 'Singapore'} • ${invoice.nightsCount || 3}N/${(invoice.nightsCount || 3) + 1}D • ${invoice.paxCount || 'Family'}`, col2X, curY + 26)
  }

  curY += 35

  // 3. Line Items Table Header
  doc.setFillColor(...NAVY)
  doc.rect(ML, curY, CW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...WHITE)
  doc.text('#', ML + 3, curY + 4.8)
  doc.text('PARTICULARS / TOUR SERVICES DESCRIPTION', ML + 10, curY + 4.8)
  doc.text('QTY', ML + 115, curY + 4.8)

  if (mode === 'dual') {
    doc.text('RATE (SGD)', ML + 130, curY + 4.8)
    doc.text('TOTAL (SGD)', ML + 152, curY + 4.8)
    doc.text('TOTAL (INR)', MR - 3, curY + 4.8, { align: 'right' })
  } else if (mode === 'inr') {
    doc.text('RATE (INR)', ML + 135, curY + 4.8)
    doc.text('TOTAL (INR)', MR - 3, curY + 4.8, { align: 'right' })
  } else {
    doc.text('RATE (SGD)', ML + 135, curY + 4.8)
    doc.text('TOTAL (SGD)', MR - 3, curY + 4.8, { align: 'right' })
  }
  curY += 7

  // 4. Line Items Rows
  let baseTotalSgd = 0
  invoice.items.forEach((item, idx) => {
    const rowH = item.subText ? 10 : 7.5
    doc.setDrawColor(...BORDER_LIGHT)
    doc.setLineWidth(0.3)
    doc.line(ML, curY + rowH, MR, curY + rowH)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...DARK_SLATE)
    doc.text(String(idx + 1), ML + 3, curY + 5)

    doc.setFont('helvetica', 'bold')
    doc.text(item.description, ML + 10, curY + 4.8)
    if (item.subText) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.8)
      doc.setTextColor(...MUTED_GRAY)
      doc.text(item.subText, ML + 10, curY + 8.5)
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...DARK_SLATE)
    doc.text(String(item.quantity), ML + 117, curY + 4.8)

    const itemTotalSgd = item.totalSgd || (item.unitPriceSgd * item.quantity)
    baseTotalSgd += itemTotalSgd
    const itemTotalInr = item.totalInr || Math.round(itemTotalSgd * rate)

    if (mode === 'dual') {
      doc.text(`S$ ${item.unitPriceSgd.toLocaleString()}`, ML + 130, curY + 4.8)
      doc.text(`S$ ${itemTotalSgd.toLocaleString()}`, ML + 152, curY + 4.8)
      doc.text(`Rs. ${itemTotalInr.toLocaleString()}`, MR - 3, curY + 4.8, { align: 'right' })
    } else if (mode === 'inr') {
      doc.text(`Rs. ${Math.round(item.unitPriceSgd * rate).toLocaleString()}`, ML + 135, curY + 4.8)
      doc.text(`Rs. ${itemTotalInr.toLocaleString()}`, MR - 3, curY + 4.8, { align: 'right' })
    } else {
      doc.text(`S$ ${item.unitPriceSgd.toLocaleString()}`, ML + 135, curY + 4.8)
      doc.text(`S$ ${itemTotalSgd.toLocaleString()}`, MR - 3, curY + 4.8, { align: 'right' })
    }

    curY += rowH
  })

  // 5. Financial Summary Calculation
  const discountSgd = invoice.discountSgd || 0
  const adjustedTotalSgd = Math.max(0, baseTotalSgd - discountSgd)
  const adjustedTotalInr = Math.round(adjustedTotalSgd * rate)

  const totalPaidSgd = invoice.payments.reduce((sum, p) => sum + (p.amountSgd || 0), 0)
  const totalPaidInr = Math.round(totalPaidSgd * rate)
  const balanceDueSgd = Math.max(0, adjustedTotalSgd - totalPaidSgd)
  const balanceDueInr = Math.round(balanceDueSgd * rate)

  curY += 2

  // Summary Rows
  const sumLeftX = ML + 95
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...DARK_SLATE)
  doc.text('Subtotal:', sumLeftX, curY + 4)
  if (mode === 'dual') {
    doc.text(`S$ ${baseTotalSgd.toLocaleString()}`, ML + 152, curY + 4)
    doc.text(`Rs. ${Math.round(baseTotalSgd * rate).toLocaleString()}`, MR - 3, curY + 4, { align: 'right' })
  } else if (mode === 'inr') {
    doc.text(`Rs. ${Math.round(baseTotalSgd * rate).toLocaleString()}`, MR - 3, curY + 4, { align: 'right' })
  } else {
    doc.text(`S$ ${baseTotalSgd.toLocaleString()}`, MR - 3, curY + 4, { align: 'right' })
  }
  curY += 5

  if (discountSgd > 0) {
    doc.text('Special DMC Discount / Credit:', sumLeftX, curY + 4)
    doc.setTextColor(...CRIMSON)
    if (mode === 'dual') {
      doc.text(`-S$ ${discountSgd.toLocaleString()}`, ML + 152, curY + 4)
      doc.text(`-Rs. ${Math.round(discountSgd * rate).toLocaleString()}`, MR - 3, curY + 4, { align: 'right' })
    } else if (mode === 'inr') {
      doc.text(`-Rs. ${Math.round(discountSgd * rate).toLocaleString()}`, MR - 3, curY + 4, { align: 'right' })
    } else {
      doc.text(`-S$ ${discountSgd.toLocaleString()}`, MR - 3, curY + 4, { align: 'right' })
    }
    doc.setTextColor(...DARK_SLATE)
    curY += 5
  }

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED_GRAY)
  doc.text('* GST on Tour Operator Services included in tour tariff', sumLeftX, curY + 4)
  curY += 5

  // Grand Total Bar
  doc.setFillColor(...NAVY)
  doc.roundedRect(sumLeftX - 4, curY, CW - (sumLeftX - ML) + 4, 7.5, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...WHITE)
  doc.text('TOTAL CONTRACT VALUE:', sumLeftX, curY + 5)
  if (mode === 'dual') {
    doc.text(`S$ ${adjustedTotalSgd.toLocaleString()}`, ML + 152, curY + 5)
    doc.text(`Rs. ${adjustedTotalInr.toLocaleString()}`, MR - 3, curY + 5, { align: 'right' })
  } else if (mode === 'inr') {
    doc.text(`Rs. ${adjustedTotalInr.toLocaleString()}`, MR - 3, curY + 5, { align: 'right' })
  } else {
    doc.text(`S$ ${adjustedTotalSgd.toLocaleString()}`, MR - 3, curY + 5, { align: 'right' })
  }
  curY += 9

  // Advance Paid & Net Balance
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...DARK_SLATE)
  doc.text('Less Payments Received:', sumLeftX, curY + 4)
  doc.setTextColor(...EMERALD)
  doc.setFont('helvetica', 'bold')
  if (mode === 'dual') {
    doc.text(`S$ ${totalPaidSgd.toLocaleString()}`, ML + 152, curY + 4)
    doc.text(`Rs. ${totalPaidInr.toLocaleString()}`, MR - 3, curY + 4, { align: 'right' })
  } else if (mode === 'inr') {
    doc.text(`Rs. ${totalPaidInr.toLocaleString()}`, MR - 3, curY + 4, { align: 'right' })
  } else {
    doc.text(`S$ ${totalPaidSgd.toLocaleString()}`, MR - 3, curY + 4, { align: 'right' })
  }
  curY += 6

  // Balance Due Banner
  doc.setFillColor(balanceDueSgd === 0 ? 220 : 254, balanceDueSgd === 0 ? 252 : 242, balanceDueSgd === 0 ? 231 : 242)
  doc.roundedRect(sumLeftX - 4, curY, CW - (sumLeftX - ML) + 4, 8, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(balanceDueSgd === 0 ? 22 : 185, balanceDueSgd === 0 ? 101 : 28, balanceDueSgd === 0 ? 52 : 28)
  doc.text('NET BALANCE DUE:', sumLeftX, curY + 5.5)
  if (mode === 'dual') {
    doc.text(`S$ ${balanceDueSgd.toLocaleString()}`, ML + 152, curY + 5.5)
    doc.text(`Rs. ${balanceDueInr.toLocaleString()}`, MR - 3, curY + 5.5, { align: 'right' })
  } else if (mode === 'inr') {
    doc.text(`Rs. ${balanceDueInr.toLocaleString()}`, MR - 3, curY + 5.5, { align: 'right' })
  } else {
    doc.text(`S$ ${balanceDueSgd.toLocaleString()}`, MR - 3, curY + 5.5, { align: 'right' })
  }

  curY += 12

  // 6. Bank Details Card with UPI QR Code
  doc.setFillColor(...LIGHT_BG)
  doc.setDrawColor(...BORDER_LIGHT)
  doc.roundedRect(ML, curY, CW, 36, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...NAVY)
  doc.text('OFFICIAL BANK REMITTANCE PARTICULARS', ML + 4, curY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.2)
  doc.setTextColor(...DARK_SLATE)
  doc.text('Account Name   : FLYING WONDERS PRIVATE LIMITED', ML + 4, curY + 10)
  doc.text('Bank Name      : ICICI Bank Ltd (Current Account)', ML + 4, curY + 14.5)
  doc.text('Account Number : 233205000112', ML + 4, curY + 19)
  doc.text('IFSC Code      : ICIC0002332  |  Branch: JAYANAGAR 8TH BLOCK, BANGALORE, India', ML + 4, curY + 23.5)
  doc.text('BSR Code       : 6390053 (for Wire Remittance)', ML + 4, curY + 28)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(...MUTED_GRAY)
  doc.text(`* Applicable Exchange Rate: S$ 1.00 = Rs. ${rate.toFixed(2)} (Locked at Confirmation)`, ML + 4, curY + 32.5)

  // Dynamic UPI QR Code
  const upiQrDataUrl = await generateUpiQrDataUrl(balanceDueInr, invoice.invoiceNumber)
  if (upiQrDataUrl) {
    try {
      doc.addImage(upiQrDataUrl, 'PNG', MR - 32, curY + 4, 28, 28, undefined, 'FAST')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.5)
      doc.setTextColor(...NAVY)
      doc.text('SCAN TO PAY (UPI)', MR - 18, curY + 34, { align: 'center' })
    } catch (e) {}
  }

  // Stamp / Signatory on Right
  if (invoice.status === 'cancelled' || invoice.status === 'void') {
    doc.saveGraphicsState()
    doc.setGState(new (doc as any).GState({ opacity: 0.3 }))
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(32)
    doc.setTextColor(220, 38, 38)
    doc.text('CANCELLED / VOID', 55, 140, { angle: 30 })
    doc.restoreGraphicsState()
  } else if (balanceDueSgd === 0 && adjustedTotalSgd > 0) {
    doc.saveGraphicsState()
    doc.setGState(new (doc as any).GState({ opacity: 0.25 }))
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(36)
    doc.setTextColor(22, 101, 52)
    doc.text('PAID IN FULL', 65, 140, { angle: 30 })
    doc.restoreGraphicsState()
  }

  // Footer Accreditations
  drawAccreditationFooter(doc, footerAccreditationUrl, 1, 1)

  // Download PDF
  const fileName = `Tax_Invoice_${invoice.invoiceNumber}_${(invoice.leadGuestName || 'Guest').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  doc.save(fileName)
}

/**
 * Generate Official Payment Receipt PDF
 */
export async function generatePaymentReceiptPdf(receipt: ReceiptData) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  })

  const [logoUrl, watermarkUrl, footerAccreditationUrl] = await Promise.all([
    loadAssetDataUrl('/images/logo.png'),
    loadAssetDataUrl('/images/logo.png'),
    loadAssetDataUrl('/images/voucher-footer-accreditations.png'),
  ])

  const rate = receipt.exchangeRate || 63.5
  const mode = receipt.currencyMode || 'dual'
  const ML = 14
  const MR = 196
  const CW = MR - ML

  // 1. Watermark & Header
  drawCenterWatermark(doc, watermarkUrl)
  let curY = drawIndianEntityHeader(
    doc,
    logoUrl,
    'OFFICIAL RECEIPT',
    'Acknowledgment of Remittance'
  )

  // 2. Receipt Particulars Box
  doc.setFillColor(...LIGHT_BG)
  doc.setDrawColor(...BORDER_LIGHT)
  doc.roundedRect(ML, curY, CW, 30, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.2)
  doc.setTextColor(...NAVY)
  doc.text('TRANSACTION RECEIPT SPECIFICATION', ML + 4, curY + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...DARK_SLATE)
  doc.text('Receipt No      : ', ML + 4, curY + 11)
  doc.setFont('helvetica', 'bold')
  doc.text(receipt.receiptNumber, ML + 26, curY + 11)

  doc.setFont('helvetica', 'normal')
  doc.text(`Receipt Date    : ${receipt.paymentDate}`, ML + 4, curY + 16)
  doc.text(`Against Invoice : ${receipt.invoiceNumber}`, ML + 4, curY + 21)
  doc.text(`Proposal Ref    : ${receipt.proposalNumber}`, ML + 4, curY + 26)

  const col2X = ML + 95
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.2)
  doc.setTextColor(...NAVY)
  doc.text('PAYER & GUEST PARTICULARS', col2X, curY + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...DARK_SLATE)
  doc.text('Received From   : ', col2X, curY + 11)
  doc.setFont('helvetica', 'bold')
  doc.text(receipt.payerName, col2X + 24, curY + 11)

  doc.setFont('helvetica', 'normal')
  doc.text(`Payer Contact   : ${receipt.payerPhone || 'On File'}`, col2X, curY + 16)
  doc.text(`Lead Passenger  : ${receipt.leadGuestName}`, col2X, curY + 21)
  doc.text(`Payment Channel : ${receipt.paymentMethod}`, col2X, curY + 26)

  curY += 35

  // 3. Amount Received Hero Box
  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(187, 247, 208)
  doc.setLineWidth(0.6)
  doc.roundedRect(ML, curY, CW, 28, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(21, 128, 61)
  doc.text('AMOUNT RECEIVED WITH THANKS:', ML + 6, curY + 6.5)

  const amtSgd = receipt.amountSgd
  const amtInr = receipt.amountInr || Math.round(amtSgd * rate)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(22, 101, 52)

  if (mode === 'dual') {
    doc.text(`S$ ${amtSgd.toLocaleString()}   |   Rs. ${amtInr.toLocaleString()}`, ML + 6, curY + 14)
  } else if (mode === 'inr') {
    doc.text(`Rs. ${amtInr.toLocaleString()}`, ML + 6, curY + 14)
  } else {
    doc.text(`S$ ${amtSgd.toLocaleString()}`, ML + 6, curY + 14)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...DARK_SLATE)
  doc.text(`Transaction Reference / UTR : ${receipt.referenceNo || 'Direct Bank Credit'}`, ML + 6, curY + 20)
  if (receipt.notes) {
    doc.text(`Remittance Remarks / Purpose: ${receipt.notes}`, ML + 6, curY + 24.5)
  }

  curY += 34

  // 4. Running Account Statement Table
  doc.setFillColor(...NAVY)
  doc.rect(ML, curY, CW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...WHITE)
  doc.text('STATEMENT OF ACCOUNT STANDING (AS OF RECEIPT DATE)', ML + 4, curY + 4.8)
  curY += 7

  const statH = 26
  doc.setFillColor(...LIGHT_BG)
  doc.setDrawColor(...BORDER_LIGHT)
  doc.roundedRect(ML, curY, CW, statH, 0, 0, 'FD')

  const totContractInr = Math.round(receipt.totalContractSgd * rate)
  const totPaidInr = Math.round(receipt.totalPaidSgd * rate)
  const balDueInr = Math.round(receipt.balanceDueSgd * rate)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...DARK_SLATE)
  doc.text('Total Invoice Contract Value:', ML + 4, curY + 6)
  doc.setFont('helvetica', 'bold')
  doc.text(mode === 'dual' ? `S$ ${receipt.totalContractSgd.toLocaleString()}  (Rs. ${totContractInr.toLocaleString()})` : mode === 'inr' ? `Rs. ${totContractInr.toLocaleString()}` : `S$ ${receipt.totalContractSgd.toLocaleString()}`, ML + 75, curY + 6)

  doc.setFont('helvetica', 'normal')
  doc.text('Total Cumulative Payments Credited:', ML + 4, curY + 12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...EMERALD)
  doc.text(mode === 'dual' ? `S$ ${receipt.totalPaidSgd.toLocaleString()}  (Rs. ${totPaidInr.toLocaleString()})` : mode === 'inr' ? `Rs. ${totPaidInr.toLocaleString()}` : `S$ ${receipt.totalPaidSgd.toLocaleString()}`, ML + 75, curY + 12)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(receipt.balanceDueSgd === 0 ? 22 : 185, receipt.balanceDueSgd === 0 ? 101 : 28, receipt.balanceDueSgd === 0 ? 52 : 28)
  doc.text('REMAINING OUTSTANDING BALANCE DUE:', ML + 4, curY + 19)
  doc.text(mode === 'dual' ? `S$ ${receipt.balanceDueSgd.toLocaleString()}  (Rs. ${balDueInr.toLocaleString()})` : mode === 'inr' ? `Rs. ${balDueInr.toLocaleString()}` : `S$ ${receipt.balanceDueSgd.toLocaleString()}`, ML + 75, curY + 19)

  curY += statH + 8

  // 5. Verification Seal & Notes
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(...BORDER_LIGHT)
  doc.roundedRect(ML, curY, CW, 26, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...NAVY)
  doc.text('IMPORTANT REMITTANCE & COMPLIANCE NOTES:', ML + 4, curY + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...DARK_SLATE)
  doc.text('1. This official receipt validates receipt of funds into Flying Wonders Private Limited corporate account.', ML + 4, curY + 10)
  doc.text('2. Confirmed hotel blocks and sightseeing vouchers are released upon fulfillment of agreed milestone terms.', ML + 4, curY + 14.5)
  doc.text('3. This document is system-generated and verified by the Flying Wonders Treasury Division.', ML + 4, curY + 19)

  // Received Seal Box on Right
  doc.setDrawColor(...EMERALD)
  doc.setLineWidth(0.5)
  doc.roundedRect(MR - 50, curY + 3, 46, 20, 1.5, 1.5, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...EMERALD)
  doc.text('RECEIVED WITH THANKS', MR - 27, curY + 9, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...DARK_SLATE)
  doc.text('FLYING WONDERS PVT LTD', MR - 27, curY + 14, { align: 'center' })
  doc.text('Finance & Treasury Dept', MR - 27, curY + 18, { align: 'center' })

  // Accreditation Footer
  drawAccreditationFooter(doc, footerAccreditationUrl, 1, 1)

  const fileName = `Payment_Receipt_${receipt.receiptNumber}_${(receipt.leadGuestName || 'Guest').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  doc.save(fileName)
}

