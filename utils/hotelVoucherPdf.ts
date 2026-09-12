/**
 * Hotel Confirmation Voucher PDF Generator
 * Produces Embassy / Consular Visa-Compliant Vouchers and Master Group Vouchers.
 * Strict compliance with Flying Wonders Pvt Ltd branding and visa standards.
 */

export interface HotelGuest {
  title?: string
  fullName: string
  passportNumber?: string
  nationality?: string
  guestType?: string
}

export interface HotelRoomAllocation {
  roomNumber: string
  roomType: string
  bedding?: string
  mealBasis?: string
  checkInDate?: string
  checkOutDate?: string
  guests: HotelGuest[]
}

export interface HotelVoucherData {
  voucherNumber: string
  groupName?: string
  hotelName: string
  hotelAddress?: string
  hotelPhone?: string
  hotelEmail?: string
  starRating?: string
  hotelConfirmationNo?: string
  checkInDate: string
  checkInTime?: string
  checkOutDate: string
  checkOutTime?: string
  nights: number
  mealPlan?: string
  bookingStatus?: string
  paymentStatus?: string
  rooms: HotelRoomAllocation[]
  specialRequests?: string
  proposalNumber?: string
  agentName?: string
  agentEmail?: string
  agentPhone?: string
}

const NAVY: [number, number, number] = [10, 34, 64]
const GOLD: [number, number, number] = [196, 156, 60]
const EMERALD_DARK: [number, number, number] = [22, 101, 52]
const EMERALD_BG: [number, number, number] = [220, 252, 231]
const SLATE: [number, number, number] = [44, 62, 80]
const LIGHT_BG: [number, number, number] = [248, 250, 252]
const BORDER_GRAY: [number, number, number] = [203, 213, 225]
const TEXT_DARK: [number, number, number] = [15, 23, 42]
const TEXT_MUTED: [number, number, number] = [71, 85, 105]
const WHITE: [number, number, number] = [255, 255, 255]
const PRIMARY_BLUE: [number, number, number] = [2, 132, 199]
const FOREST_GREEN: [number, number, number] = [21, 128, 61]

/**
 * Generate a dynamic QR Code Data URL linking to the public verification portal
 */
async function generateQrDataUrl(refNumber: string): Promise<string> {
  try {
    const QRCode = (await import('qrcode')).default || (await import('qrcode'))
    const verifyUrl = `https://flyingwonders.net/verify-voucher?ref=${encodeURIComponent(refNumber)}`
    return await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 200,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0A2240',
        light: '#FFFFFF',
      },
    })
  } catch (err) {
    console.error('Failed to generate QR code for voucher:', err)
    return ''
  }
}

/**
 * Preload Flying Wonders logo with 90% transparency (0.10 opacity) for watermark
 */
async function getWatermarkLogoDataUrl(): Promise<string> {
  if (typeof window === 'undefined') return ''
  return new Promise((resolve) => {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width || 500
        canvas.height = img.height || 500
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 0.10 // 90% transparent / 10% opacity watermark
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/png'))
        } else {
          resolve('')
        }
      }
      img.onerror = () => resolve('')
      img.src = '/images/logo.png'
    } catch {
      resolve('')
    }
  })
}

/**
 * Preload the official accreditation footer banner (Image 3)
 */
async function getFooterAccreditationsDataUrl(): Promise<string> {
  if (typeof window === 'undefined') return ''
  return new Promise((resolve) => {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width || 800
        canvas.height = img.height || 200
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/png'))
        } else {
          resolve('')
        }
      }
      img.onerror = () => resolve('')
      img.src = '/images/voucher-footer-accreditations.png'
    } catch {
      resolve('')
    }
  })
}

/**
 * Embed watermark logo in the center of the current page
 */
function drawWatermark(doc: any, watermarkDataUrl: string) {
  if (!watermarkDataUrl) return
  try {
    // Center of A4 page: width 210mm, height 297mm. Watermark size: 105mm x 105mm
    doc.addImage(watermarkDataUrl, 'PNG', 52.5, 96, 105, 105, undefined, 'FAST')
  } catch (e) {}
}

/**
 * Draws the official Flying Wonders Header as per Image 2
 */
function drawHeader(doc: any, voucher: HotelVoucherData, subtitle: string) {
  const PW = 210
  const ML = 14
  const MR = 196
  const CW = MR - ML

  // Top White Header Card with clean border & professional blue accent
  doc.setFillColor(...WHITE)
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.4)
  doc.roundedRect(ML, 6, CW, 28, 1.5, 1.5, 'FD')

  // Top Sky/Royal Blue accent bar on the header card
  doc.setFillColor(...PRIMARY_BLUE)
  doc.rect(ML, 6, CW, 1.4, 'F')

  // Company Name (from Image 2)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...PRIMARY_BLUE)
  doc.text('Flying Wonders Pvt Ltd', ML + 5, 14.5)

  // Tagline (from Image 2: green italic)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(...FOREST_GREEN)
  doc.text('Customizing your travel choices. . .', ML + 76, 14.2)

  // Address (from Image 2)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...SLATE)
  doc.text('📍  74, 4th Cross, SBM Colony, BSK 1st Stage, Bangalore, India – 560050', ML + 5, 19.5)

  // Contacts line (from Image 2)
  doc.text('📞  Contact Channels - India: +91 98861 71251   Singapore: +65 9472 2830    🌐  www.flyingwonders.net', ML + 5, 24.5)

  // Emails line (from Image 2)
  doc.text('✉️  Primary: contact@flyingwonders.net    📧  General: info.flyingwonders@gmail.com', ML + 5, 29.5)

  // Document Title Banner below header
  doc.setFillColor(...LIGHT_BG)
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.roundedRect(ML, 37, CW, 14, 1.5, 1.5, 'FD')

  doc.setTextColor(...NAVY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.text(subtitle.toUpperCase(), ML + 4, 43.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...TEXT_MUTED)
  doc.text('OFFICIAL DOCUMENT ISSUED FOR EMBASSY VISA APPLICATION & HOTEL FRONT DESK CHECK-IN', ML + 4, 48)

  // Reference Block (Right Aligned)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...NAVY)
  doc.text(`Voucher Ref: ${voucher.voucherNumber}`, MR - 4, 43, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(180, 83, 9)
  doc.text(`CRS / Conf: ${voucher.hotelConfirmationNo || 'CONFIRMED ON ARRIVAL'}`, MR - 4, 48, { align: 'right' })
}

/**
 * Draws the official Footer as per Image 3 with Accreditation Badges, CIN, and QR Code
 */
function drawFooter(
  doc: any,
  pageNum: number,
  totalPages: number,
  qrDataUrl?: string,
  footerAccreditationUrl?: string
) {
  const PW = 210
  const PH = 297
  const ML = 14
  const MR = 196
  const CW = MR - ML
  const FY = PH - 32 // Footer start Y

  // Top border line
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.4)
  doc.line(ML, FY, MR, FY)

  // Accreditation Image Banner (Image 3)
  const accW = qrDataUrl ? CW - 24 : CW
  const accH = 19
  if (footerAccreditationUrl) {
    try {
      doc.addImage(footerAccreditationUrl, 'PNG', ML, FY + 1.5, accW, accH, undefined, 'FAST')
    } catch (e) {}
  } else {
    // Text Fallback matching Image 3 if image is not loaded
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...SLATE)
    doc.text('Company Incorporation number: U63090KA2016PTC095564', ML, FY + 10)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...NAVY)
    doc.text('Flying Wonders: Singapore DMC | B2B Specialist', ML, FY + 16)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...TEXT_MUTED)
    doc.text('Est. 2012 | Evolved 2016 | Global 2024', ML + accW, FY + 16, { align: 'right' })
  }

  // Live Verification QR Code on Bottom Right
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', MR - 18, FY + 2, 18, 18)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(5.8)
      doc.setTextColor(...NAVY)
      doc.text('SCAN TO VERIFY LIVE', MR - 9, FY + 21.5, { align: 'center' })
    } catch (e) {}
  }

  // Page Numbers & Issue Date
  const issueDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...TEXT_MUTED)
  doc.text(`Issued: ${issueDate}  |  Page ${pageNum} of ${totalPages}`, ML, PH - 6)
  doc.text('www.flyingwonders.net  •  Official Accommodation Confirmation Document', MR, PH - 6, { align: 'right' })
}

/**
 * Common Hotel Information Card
 */
function drawHotelDetailsCard(doc: any, voucher: HotelVoucherData, startY: number): number {
  const ML = 14
  const MR = 196
  const CW = MR - ML
  let y = startY

  // Status Badges Bar
  doc.setFillColor(...EMERALD_BG)
  doc.roundedRect(ML, y, CW / 2 - 2, 8, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...EMERALD_DARK)
  doc.text(`STATUS: ${(voucher.bookingStatus || 'CONFIRMED & GUARANTEED').toUpperCase()}`, ML + 4, y + 5.5)

  doc.setFillColor(254, 243, 199)
  doc.roundedRect(ML + CW / 2 + 2, y, CW / 2 - 2, 8, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(180, 83, 9)
  doc.text(`BILLING: ${(voucher.paymentStatus || 'PREPAID / BILLED TO FLYING WONDERS DMC').toUpperCase()}`, ML + CW / 2 + 6, y + 5.5)

  y += 11

  // Hotel Card Outer Box
  doc.setFillColor(...WHITE)
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.roundedRect(ML, y, CW, 36, 2, 2, 'FD')

  // Hotel Name & Rating
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...NAVY)
  doc.text(voucher.hotelName, ML + 5, y + 6.5)

  if (voucher.starRating) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...GOLD)
    doc.text(`[ ${voucher.starRating} Rating ]`, MR - 5, y + 6.5, { align: 'right' })
  }

  // Address
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  doc.setTextColor(...TEXT_MUTED)
  const addrText = voucher.hotelAddress || 'Centrally located partner property'
  const addrLines = doc.splitTextToSize(`Address: ${addrText}`, CW - 10)
  doc.text(addrLines, ML + 5, y + 11.5)

  // Direct Contact (Critical for Visa verification)
  const contactY = y + 12 + addrLines.length * 3.6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.8)
  doc.setTextColor(...NAVY)
  doc.text('Hotel Front Desk / Verification Contact:', ML + 5, contactY)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_DARK)
  const phoneText = voucher.hotelPhone ? `Tel: ${voucher.hotelPhone}` : 'Tel: Front Desk'
  const emailText = voucher.hotelEmail ? `Email: ${voucher.hotelEmail}` : 'Email: reservations@hotel.com'
  doc.text(`${phoneText}   |   ${emailText}`, ML + 5, contactY + 4.2)

  // Dates & Nights Strip
  const datesY = y + 25
  doc.setFillColor(...LIGHT_BG)
  doc.rect(ML + 0.3, datesY, CW - 0.6, 10.7, 'F')
  doc.setDrawColor(...BORDER_GRAY)
  doc.line(ML, datesY, MR, datesY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.2)
  doc.setTextColor(...NAVY)

  // Check In
  doc.text('CHECK-IN DATE & TIME:', ML + 5, datesY + 4)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.6)
  doc.setTextColor(...TEXT_DARK)
  doc.text(`${voucher.checkInDate} (From ${voucher.checkInTime || '15:00 hrs'})`, ML + 5, datesY + 8)

  // Check Out
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.2)
  doc.setTextColor(...NAVY)
  doc.text('CHECK-OUT DATE & TIME:', ML + 65, datesY + 4)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.6)
  doc.setTextColor(...TEXT_DARK)
  doc.text(`${voucher.checkOutDate} (Until ${voucher.checkOutTime || '11:00 hrs'})`, ML + 65, datesY + 8)

  // Nights & Meal Basis
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.2)
  doc.setTextColor(...NAVY)
  doc.text('TOTAL NIGHTS & MEALS:', ML + 125, datesY + 4)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.6)
  doc.setTextColor(...TEXT_DARK)
  doc.text(`${voucher.nights} Night(s)  •  ${voucher.mealPlan || 'Daily Buffet Breakfast'}`, ML + 125, datesY + 8)

  return y + 40
}

/**
 * Helper to normalize Room Number without duplication (e.g. "Room Double Room" -> "Room Double", "Room 01" -> "Room 01")
 */
function cleanRoomLabel(rawNumber: string, defaultIndex: number): string {
  if (!rawNumber) return `Room ${(defaultIndex + 1).toString().padStart(2, '0')}`
  const stripped = rawNumber.trim().replace(/^room\s*/i, '').trim()
  return stripped ? `Room ${stripped}` : `Room ${(defaultIndex + 1).toString().padStart(2, '0')}`
}

/**
 * GENERATE MASTER GROUP VOUCHER (FOR GROUP LEADER / HOTEL FRONT DESK)
 */
export async function generateMasterGroupVoucherPdf(voucher: HotelVoucherData): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })

  const PW = 210
  const PH = 297
  const ML = 14
  const MR = 196
  const CW = MR - ML

  // Preload assets
  const [qrDataUrl, watermarkUrl, footerAccreditationUrl] = await Promise.all([
    generateQrDataUrl(voucher.voucherNumber),
    getWatermarkLogoDataUrl(),
    getFooterAccreditationsDataUrl(),
  ])

  // Page 1 Watermark
  drawWatermark(doc, watermarkUrl)

  // Page 1 Header
  drawHeader(doc, voucher, 'Group Master Hotel Accommodation Voucher')
  let curY = drawHotelDetailsCard(doc, voucher, 54)

  // Group Summary Box
  doc.setFillColor(...LIGHT_BG)
  doc.setDrawColor(...BORDER_GRAY)
  doc.roundedRect(ML, curY, CW, 18, 1.5, 1.5, 'FD')

  const totalRooms = voucher.rooms.length
  const totalGuests = voucher.rooms.reduce((acc, r) => acc + (r.guests?.length || 0), 0)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...NAVY)
  doc.text('GROUP SPECIFICATION:', ML + 4, curY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  doc.setTextColor(...TEXT_DARK)
  doc.text(`Group / Delegation: ${voucher.groupName || 'Tour Group Booking'}`, ML + 4, curY + 9.5)
  doc.text(`Total Rooms Blocked: ${totalRooms} Room(s)`, ML + 4, curY + 14)

  doc.text(`Total Group Occupants: ${totalGuests} Confirmed Passenger(s)`, ML + 95, curY + 9.5)
  if (voucher.agentName) {
    doc.text(`Tour Leader / B2B Agent: ${voucher.agentName} ${voucher.agentPhone ? `(${voucher.agentPhone})` : ''}`, ML + 95, curY + 14)
  }

  curY += 22

  // Group Rooming List Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...NAVY)
  doc.text('MASTER GROUP ROOMING ROSTER & OCCUPANCY DETAILS', ML, curY + 4)
  curY += 6

  // Exact 5 Columns required by user:
  // 1. Room # (24mm)
  // 2. Room Category (42mm)
  // 3. Occupant full name (60mm)
  // 4. Passport number (30mm)
  // 5. Nationality (26mm)
  const drawTableHeader = (yPos: number) => {
    doc.setFillColor(...NAVY)
    doc.rect(ML, yPos, CW, 6.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...WHITE)
    doc.text('ROOM #', ML + 3, yPos + 4.5)
    doc.text('ROOM CATEGORY', ML + 26, yPos + 4.5)
    doc.text('OCCUPANT FULL NAME', ML + 70, yPos + 4.5)
    doc.text('PASSPORT NUMBER', ML + 132, yPos + 4.5)
    doc.text('NATIONALITY', ML + 162, yPos + 4.5)
  }

  drawTableHeader(curY)
  curY += 6.5

  let pageNum = 1

  // Loop through rooms and occupants
  voucher.rooms.forEach((room, rIdx) => {
    const guests = room.guests && room.guests.length > 0 ? room.guests : [{ fullName: 'TBD Guest', title: 'Mr' }]
    const rowHeight = Math.max(8, guests.length * 6.5)

    // Check page break
    if (curY + rowHeight > PH - 40) {
      drawFooter(doc, pageNum, 2, qrDataUrl, footerAccreditationUrl)
      doc.addPage()
      pageNum++
      drawWatermark(doc, watermarkUrl)
      drawHeader(doc, voucher, 'Group Master Hotel Accommodation Voucher (Cont.)')
      curY = 56
      drawTableHeader(curY)
      curY += 6.5
    }

    // Zebra striping
    if (rIdx % 2 === 1) {
      doc.setFillColor(248, 250, 252)
      doc.rect(ML, curY, CW, rowHeight, 'F')
    }

    doc.setDrawColor(...BORDER_GRAY)
    doc.line(ML, curY + rowHeight, MR, curY + rowHeight)

    // Column 1: Room #
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...NAVY)
    const displayRoomText = cleanRoomLabel(room.roomNumber, rIdx)
    doc.text(displayRoomText, ML + 3, curY + 5)

    // Column 2: Room Category (wrapped safely)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.2)
    doc.setTextColor(...TEXT_DARK)
    const categoryLines = doc.splitTextToSize(room.roomType || 'Standard Room', 40)
    doc.text(categoryLines, ML + 26, curY + 5)

    // Columns 3, 4, 5: Guest Rows in this room
    guests.forEach((g, gIdx) => {
      const gY = curY + 5 + gIdx * 5.8

      // Occupant full name
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(...TEXT_DARK)
      const nameStr = `${g.title ? `${g.title} ` : ''}${g.fullName}`.toUpperCase()
      const nameLines = doc.splitTextToSize(nameStr, 58)
      doc.text(nameLines[0] || nameStr, ML + 70, gY)

      // Passport number
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...NAVY)
      doc.text(g.passportNumber || 'N/A', ML + 132, gY)

      // Nationality
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.2)
      doc.setTextColor(...TEXT_MUTED)
      doc.text(g.nationality || 'INDIAN', ML + 162, gY)
    })

    curY += rowHeight
  })

  // Special Requests Box if space permits
  if (voucher.specialRequests && curY < PH - 52) {
    curY += 4
    doc.setFillColor(254, 250, 235)
    doc.roundedRect(ML, curY, CW, 11, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(180, 83, 9)
    doc.text('SPECIAL REQUESTS & INSTRUCTIONS:', ML + 4, curY + 4)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(69, 26, 3)
    doc.text(voucher.specialRequests, ML + 4, curY + 7.8, { maxWidth: CW - 8 })
  }

  // Draw footer on all pages
  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    drawFooter(doc, p, totalPages, qrDataUrl, footerAccreditationUrl)
  }

  // Download PDF
  const cleanFileName = `Hotel_Master_Voucher_${voucher.voucherNumber}_${(voucher.groupName || 'Group').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  doc.save(cleanFileName)
}

/**
 * GENERATE SINGLE ROOM VISA VOUCHER (1-PAGE EMBASSY-COMPLIANT CERTIFICATE)
 */
export async function generateSingleRoomVisaPdf(voucher: HotelVoucherData, roomIndex: number): Promise<void> {
  const room = voucher.rooms[roomIndex]
  if (!room) return

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })

  const PW = 210
  const ML = 14
  const MR = 196
  const CW = MR - ML

  // Preload assets
  const [qrDataUrl, watermarkUrl, footerAccreditationUrl] = await Promise.all([
    generateQrDataUrl(voucher.voucherNumber),
    getWatermarkLogoDataUrl(),
    getFooterAccreditationsDataUrl(),
  ])

  // Watermark
  drawWatermark(doc, watermarkUrl)

  // Header (from Image 2)
  drawHeader(doc, voucher, 'Visa Application Accommodation Confirmation')

  // Hotel Details Card
  let curY = drawHotelDetailsCard(doc, voucher, 54)

  // Allocated Room & Visa Applicant Details Section
  doc.setFillColor(...LIGHT_BG)
  doc.setDrawColor(...BORDER_GRAY)
  doc.roundedRect(ML, curY, CW, 13, 1.5, 1.5, 'FD')

  const displayRoomTitle = cleanRoomLabel(room.roomNumber, roomIndex)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...NAVY)
  doc.text(`CONFIRMED ROOM ALLOCATION: ${displayRoomTitle.toUpperCase()}`, ML + 4, curY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.6)
  doc.setTextColor(...TEXT_DARK)
  doc.text(`Category: ${room.roomType || 'Standard Room'}   |   Meal: ${room.mealBasis || voucher.mealPlan || 'Buffet Breakfast'}`, ML + 4, curY + 9.8)

  curY += 17

  // Visa Applicants Table Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text('REGISTERED OCCUPANTS & VISA APPLICANTS', ML, curY + 4)
  curY += 6

  // Exact 5 Columns required by user:
  // Room #, Room Category, Occupant full name, Passport number, Nationality
  doc.setFillColor(...NAVY)
  doc.rect(ML, curY, CW, 6.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...WHITE)
  doc.text('ROOM #', ML + 3, curY + 4.5)
  doc.text('ROOM CATEGORY', ML + 26, curY + 4.5)
  doc.text('OCCUPANT FULL NAME', ML + 70, curY + 4.5)
  doc.text('PASSPORT NUMBER', ML + 132, curY + 4.5)
  doc.text('NATIONALITY', ML + 162, curY + 4.5)
  curY += 6.5

  const guests = room.guests && room.guests.length > 0 ? room.guests : [{ fullName: 'Applicant Name', title: 'Mr' }]

  guests.forEach((guest, gIdx) => {
    const rowH = 10
    if (gIdx % 2 === 1) {
      doc.setFillColor(248, 250, 252)
      doc.rect(ML, curY, CW, rowH, 'F')
    }
    doc.setDrawColor(...BORDER_GRAY)
    doc.line(ML, curY + rowH, MR, curY + rowH)

    // Room #
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...NAVY)
    doc.text(displayRoomTitle, ML + 3, curY + 6.5)

    // Room Category
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.2)
    doc.setTextColor(...TEXT_DARK)
    const catLines = doc.splitTextToSize(room.roomType || 'Standard Room', 40)
    doc.text(catLines, ML + 26, curY + 6.5)

    // Occupant Full Name
    const fullName = `${guest.title ? `${guest.title} ` : ''}${guest.fullName}`.toUpperCase()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.8)
    doc.setTextColor(...TEXT_DARK)
    doc.text(fullName, ML + 70, curY + 6.5)

    // Passport Number
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.8)
    doc.setTextColor(...NAVY)
    doc.text(guest.passportNumber || 'N/A', ML + 132, curY + 6.5)

    // Nationality
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...TEXT_DARK)
    doc.text(guest.nationality || 'INDIAN', ML + 162, curY + 6.5)

    curY += rowH
  })

  curY += 6

  // Formal Guarantee Statement Box for Embassy Consulates (No STB, No Pte Ltd)
  doc.setFillColor(254, 250, 235)
  doc.setDrawColor(245, 158, 11)
  doc.setLineWidth(0.4)
  doc.roundedRect(ML, curY, CW, 29, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(180, 83, 9)
  doc.text('FORMAL GUARANTEE & DECLARATION FOR VISA ISSUING AUTHORITIES', ML + 5, curY + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.2)
  doc.setTextColor(69, 26, 3)
  const declText =
    `This is to certify that the above-named guest(s) have confirmed and guaranteed hotel accommodation booked through Flying Wonders Pvt Ltd for the entire specified itinerary duration. The hotel accommodation expenses have been prepaid and guaranteed under our tour operator billing facility. No room tariff remains payable by the guest(s) upon check-in.`
  const declLines = doc.splitTextToSize(declText, CW - 10)
  doc.text(declLines, ML + 5, curY + 10.5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...NAVY)
  doc.text(`Authorized by: Inbound Operations Desk, Flying Wonders Pvt Ltd  •  CIN: U63090KA2016PTC095564`, ML + 5, curY + 25)

  // Footer with Image 3 Badges and QR Code
  drawFooter(doc, 1, 1, qrDataUrl, footerAccreditationUrl)

  // Download
  const primaryGuestName = (guests[0]?.fullName || `Room_${roomIndex + 1}`).replace(/[^a-zA-Z0-9]/g, '_')
  const fileName = `Visa_Hotel_Voucher_${voucher.voucherNumber}_${primaryGuestName}.pdf`
  doc.save(fileName)
}

/**
 * GENERATE ALL VISA VOUCHERS (MULTI-PAGE DOSSIER WITH 1 PAGE PER ROOM)
 */
export async function generateAllVisaVouchersPdf(voucher: HotelVoucherData): Promise<void> {
  if (!voucher.rooms || voucher.rooms.length === 0) return

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })

  const PW = 210
  const ML = 14
  const MR = 196
  const CW = MR - ML

  // Preload assets
  const [qrDataUrl, watermarkUrl, footerAccreditationUrl] = await Promise.all([
    generateQrDataUrl(voucher.voucherNumber),
    getWatermarkLogoDataUrl(),
    getFooterAccreditationsDataUrl(),
  ])

  const totalPages = voucher.rooms.length

  voucher.rooms.forEach((room, roomIndex) => {
    if (roomIndex > 0) {
      doc.addPage()
    }

    // Watermark
    drawWatermark(doc, watermarkUrl)

    const displayRoomTitle = cleanRoomLabel(room.roomNumber, roomIndex)

    // Header
    drawHeader(doc, voucher, `Visa Accommodation Voucher (${displayRoomTitle})`)

    // Hotel Details Card
    let curY = drawHotelDetailsCard(doc, voucher, 54)

    // Room Allocation Box
    doc.setFillColor(...LIGHT_BG)
    doc.setDrawColor(...BORDER_GRAY)
    doc.roundedRect(ML, curY, CW, 13, 1.5, 1.5, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...NAVY)
    doc.text(`CONFIRMED ROOM ALLOCATION: ${displayRoomTitle.toUpperCase()}`, ML + 4, curY + 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.6)
    doc.setTextColor(...TEXT_DARK)
    doc.text(`Category: ${room.roomType || 'Standard Room'}   |   Meal: ${room.mealBasis || voucher.mealPlan || 'Buffet Breakfast'}`, ML + 4, curY + 9.8)

    curY += 17

    // Table Header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...NAVY)
    doc.text('REGISTERED OCCUPANTS & VISA APPLICANTS', ML, curY + 4)
    curY += 6

    // Exact 5 Columns: Room #, Room Category, Occupant full name, Passport number, Nationality
    doc.setFillColor(...NAVY)
    doc.rect(ML, curY, CW, 6.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...WHITE)
    doc.text('ROOM #', ML + 3, curY + 4.5)
    doc.text('ROOM CATEGORY', ML + 26, curY + 4.5)
    doc.text('OCCUPANT FULL NAME', ML + 70, curY + 4.5)
    doc.text('PASSPORT NUMBER', ML + 132, curY + 4.5)
    doc.text('NATIONALITY', ML + 162, curY + 4.5)
    curY += 6.5

    const guests = room.guests && room.guests.length > 0 ? room.guests : [{ fullName: 'Applicant Name', title: 'Mr' }]

    guests.forEach((guest, gIdx) => {
      const rowH = 10
      if (gIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252)
        doc.rect(ML, curY, CW, rowH, 'F')
      }
      doc.setDrawColor(...BORDER_GRAY)
      doc.line(ML, curY + rowH, MR, curY + rowH)

      // Room #
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(...NAVY)
      doc.text(displayRoomTitle, ML + 3, curY + 6.5)

      // Room Category
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.2)
      doc.setTextColor(...TEXT_DARK)
      const catLines = doc.splitTextToSize(room.roomType || 'Standard Room', 40)
      doc.text(catLines, ML + 26, curY + 6.5)

      // Occupant Full Name
      const fullName = `${guest.title ? `${guest.title} ` : ''}${guest.fullName}`.toUpperCase()
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.8)
      doc.setTextColor(...TEXT_DARK)
      doc.text(fullName, ML + 70, curY + 6.5)

      // Passport Number
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.8)
      doc.setTextColor(...NAVY)
      doc.text(guest.passportNumber || 'N/A', ML + 132, curY + 6.5)

      // Nationality
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...TEXT_DARK)
      doc.text(guest.nationality || 'INDIAN', ML + 162, curY + 6.5)

      curY += rowH
    })

    curY += 6

    // Formal Guarantee Statement Box
    doc.setFillColor(254, 250, 235)
    doc.setDrawColor(245, 158, 11)
    doc.setLineWidth(0.4)
    doc.roundedRect(ML, curY, CW, 29, 2, 2, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(180, 83, 9)
    doc.text('FORMAL GUARANTEE & DECLARATION FOR VISA ISSUING AUTHORITIES', ML + 5, curY + 5.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.2)
    doc.setTextColor(69, 26, 3)
    const declText =
      `This is to certify that the above-named guest(s) have confirmed and guaranteed hotel accommodation booked through Flying Wonders Pvt Ltd for the entire specified itinerary duration. The hotel accommodation expenses have been prepaid and guaranteed under our tour operator billing facility. No room tariff remains payable by the guest(s) upon check-in.`
    const declLines = doc.splitTextToSize(declText, CW - 10)
    doc.text(declLines, ML + 5, curY + 10.5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...NAVY)
    doc.text(`Authorized by: Inbound Operations Desk, Flying Wonders Pvt Ltd  •  CIN: U63090KA2016PTC095564`, ML + 5, curY + 25)

    // Footer
    drawFooter(doc, roomIndex + 1, totalPages, qrDataUrl, footerAccreditationUrl)
  })

  // Download complete dossier
  const fileName = `All_Visa_Vouchers_Dossier_${voucher.voucherNumber}_${(voucher.groupName || 'Group').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  doc.save(fileName)
}
