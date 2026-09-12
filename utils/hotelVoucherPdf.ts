/**
 * Hotel Confirmation Voucher PDF Generator
 * Produces Embassy / Consular Visa-Compliant Vouchers and Master Group Vouchers.
 * High-definition typography, true-to-life aspect ratio logos, and crisp layout.
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
const DIVIDER_LINE: [number, number, number] = [226, 232, 240]
const TEXT_DARK: [number, number, number] = [15, 23, 42]
const TEXT_MUTED: [number, number, number] = [71, 85, 105]
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
  } catch (e) {
    // Fallback to Image element
  }

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

async function generateQrDataUrl(refNumber: string): Promise<string> {
  try {
    const QRCode = (await import('qrcode')).default || (await import('qrcode'))
    const verifyUrl = 'https://flyingwonders.net/verify-voucher?ref=' + encodeURIComponent(refNumber)
    return await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 250,
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

function drawWatermark(doc: any, watermarkDataUrl: string) {
  if (!watermarkDataUrl) return
  try {
    doc.saveGraphicsState()
    doc.setGState(new (doc as any).GState({ opacity: 0.085 }))
    doc.addImage(watermarkDataUrl, 'PNG', 55, 120, 100, 100, undefined, 'FAST')
    doc.restoreGraphicsState()
  } catch (e) {
    console.warn('Watermark error:', e)
  }
}

function drawHeader(
  doc: any,
  voucher: HotelVoucherData,
  subtitle: string,
  headerLetterheadUrl?: string
): number {
  const PW = 210
  const ML = 14
  const MR = 196
  const CW = MR - ML

  if (headerLetterheadUrl) {
    try {
      const headW = 148
      const headH = headW / 4.3953
      const headX = (PW - headW) / 2
      doc.addImage(headerLetterheadUrl, 'PNG', headX, 6, headW, headH, undefined, 'FAST')
    } catch (e) {}
  } else {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(0, 112, 186)
    doc.text('Flying Wonders Pvt Ltd', PW / 2, 12, { align: 'center' })

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9.5)
    doc.setTextColor(21, 128, 61)
    doc.text('Customizing your travel choices. . .', PW / 2, 17, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...SLATE)
    doc.text('Office: 74, 4th Cross, SBM Colony, BSK 1st Stage, Bangalore, India - 560050', PW / 2, 23, { align: 'center' })
    doc.text('India: +91 98861 71251   |   Singapore: +65 9472 2830   |   Web: www.flyingwonders.net', PW / 2, 28, { align: 'center' })
    doc.text('Primary: contact@flyingwonders.net   |   General: info.flyingwonders@gmail.com', PW / 2, 33, { align: 'center' })
  }

  const bannerY = 42
  doc.setFillColor(...LIGHT_BG)
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.roundedRect(ML, bannerY, CW, 14, 1.5, 1.5, 'FD')

  doc.setTextColor(...NAVY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.text(subtitle.toUpperCase(), ML + 4, bannerY + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TEXT_MUTED)
  doc.text('OFFICIAL DOCUMENT ISSUED FOR EMBASSY VISA APPLICATION & HOTEL FRONT DESK CHECK-IN', ML + 4, bannerY + 10.5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text('Voucher Ref: ' + voucher.voucherNumber, MR - 4, bannerY + 5.5, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(180, 83, 9)
  doc.text('CRS / Conf: ' + (voucher.hotelConfirmationNo || 'CONFIRMED ON ARRIVAL'), MR - 4, bannerY + 10.5, { align: 'right' })

  return bannerY + 17
}

function drawFooter(
  doc: any,
  pageNum: number,
  totalPages: number,
  qrDataUrl?: string,
  footerAccreditationUrl?: string,
  voucherNumber?: string
) {
  const PW = 210
  const PH = 297
  const ML = 14
  const MR = 196
  const FY = 252

  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.35)
  doc.line(ML, FY - 2, MR, FY - 2)

  const footW = 145
  const footH = footW / 4.675
  if (footerAccreditationUrl) {
    try {
      doc.addImage(footerAccreditationUrl, 'PNG', ML, FY, footW, footH, undefined, 'FAST')
    } catch (e) {}
  } else {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...SLATE)
    doc.text('Company Incorporation number: U63090KA2016PTC095564', ML, FY + 12)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...NAVY)
    doc.text('Flying Wonders: Singapore DMC | B2B Specialist', ML, FY + 19)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...TEXT_MUTED)
    doc.text('Est. 2012 | Evolved 2016 | Global 2024', ML + footW, FY + 19, { align: 'right' })
  }

  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', MR - 26, FY + 1, 26, 26, undefined, 'FAST')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.2)
      doc.setTextColor(...NAVY)
      doc.text('SCAN TO VERIFY LIVE', MR - 13, FY + 29.5, { align: 'center' })
    } catch (e) {}
  }

  const issueDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.8)
  doc.setTextColor(100, 116, 139)
  doc.text('Issued: ' + issueDate + '  |  Ref: ' + (voucherNumber || '') + '  |  Page ' + pageNum + ' of ' + totalPages, ML, PH - 2.5)
  doc.text('www.flyingwonders.net  •  Official Accommodation Confirmation Document', MR, PH - 2.5, { align: 'right' })
}

function drawHotelDetailsCard(doc: any, voucher: HotelVoucherData, startY: number): number {
  const ML = 14
  const MR = 196
  const CW = MR - ML
  let y = startY

  doc.setFillColor(...EMERALD_BG)
  doc.roundedRect(ML, y, CW / 2 - 2, 8, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.2)
  doc.setTextColor(...EMERALD_DARK)
  doc.text('STATUS: ' + (voucher.bookingStatus || 'CONFIRMED & GUARANTEED').toUpperCase(), ML + 4, y + 5.5)

  doc.setFillColor(254, 243, 199)
  doc.roundedRect(ML + CW / 2 + 2, y, CW / 2 - 2, 8, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.2)
  doc.setTextColor(180, 83, 9)
  doc.text('BILLING: ' + (voucher.paymentStatus || 'PREPAID / BILLED TO FLYING WONDERS DMC').toUpperCase(), ML + CW / 2 + 6, y + 5.5)

  y += 11

  doc.setFillColor(...WHITE)
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.roundedRect(ML, y, CW, 35, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...NAVY)
  doc.text(voucher.hotelName, ML + 5, y + 6.5)

  if (voucher.starRating) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...GOLD)
    doc.text('[ ' + voucher.starRating + ' Rating ]', MR - 5, y + 6.5, { align: 'right' })
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_MUTED)
  const addrText = voucher.hotelAddress || 'Centrally located partner property'
  const addrLines = doc.splitTextToSize('Address: ' + addrText, CW - 10)
  doc.text(addrLines, ML + 5, y + 11.5)

  const contactY = y + 16.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...NAVY)
  doc.text('Hotel Front Desk / Verification Contact:', ML + 5, contactY)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_DARK)
  const phoneText = voucher.hotelPhone ? ('Tel: ' + voucher.hotelPhone) : 'Tel: Front Desk'
  const emailText = voucher.hotelEmail ? ('Email: ' + voucher.hotelEmail) : 'Email: reservations@hotel.com'
  doc.text(phoneText + '   |   ' + emailText, ML + 5, contactY + 4.3)

  const datesY = y + 24
  doc.setFillColor(...LIGHT_BG)
  doc.rect(ML + 0.3, datesY, CW - 0.6, 10.5, 'F')
  doc.setDrawColor(...BORDER_GRAY)
  doc.line(ML, datesY, MR, datesY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...NAVY)

  doc.text('CHECK-IN DATE & TIME:', ML + 5, datesY + 4)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_DARK)
  doc.text(voucher.checkInDate + ' (From ' + (voucher.checkInTime || '15:00 hrs') + ')', ML + 5, datesY + 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...NAVY)
  doc.text('CHECK-OUT DATE & TIME:', ML + 65, datesY + 4)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_DARK)
  doc.text(voucher.checkOutDate + ' (Until ' + (voucher.checkOutTime || '11:00 hrs') + ')', ML + 65, datesY + 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...NAVY)
  doc.text('TOTAL NIGHTS & MEALS:', ML + 125, datesY + 4)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_DARK)
  doc.text(voucher.nights + ' Night(s)  •  ' + (voucher.mealPlan || 'Daily Buffet Breakfast'), ML + 125, datesY + 8)

  return y + 38
}

function cleanRoomLabel(rawNumber: string, defaultIndex: number): string {
  if (!rawNumber) return 'Room ' + (defaultIndex + 1)
  const trimmed = rawNumber.trim()
  const numMatch = trimmed.match(/\d+/)
  if (numMatch) {
    return 'Room ' + numMatch[0]
  }
  if (
    trimmed.length <= 12 &&
    !trimmed.toLowerCase().includes('double') &&
    !trimmed.toLowerCase().includes('twin') &&
    !trimmed.toLowerCase().includes('deluxe')
  ) {
    return trimmed.startsWith('Room') ? trimmed : ('Room ' + trimmed)
  }
  return 'Room ' + (defaultIndex + 1)
}

export async function generateMasterGroupVoucherPdf(voucher: HotelVoucherData): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })

  const PW = 210
  const ML = 14
  const MR = 196
  const CW = MR - ML

  const [qrDataUrl, watermarkUrl, headerLetterheadUrl, footerAccreditationUrl] = await Promise.all([
    generateQrDataUrl(voucher.voucherNumber),
    loadAssetDataUrl('/images/logo.png'),
    loadAssetDataUrl('/images/voucher-header-letterhead.png'),
    loadAssetDataUrl('/images/voucher-footer-accreditations.png'),
  ])

  drawWatermark(doc, watermarkUrl)
  drawHeader(doc, voucher, 'Group Master Hotel Accommodation Voucher', headerLetterheadUrl)
  let curY = drawHotelDetailsCard(doc, voucher, 59)

  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.roundedRect(ML, curY, CW, 16, 1.5, 1.5, 'S')

  const totalRooms = voucher.rooms.length
  const totalGuests = voucher.rooms.reduce((acc, r) => acc + (r.guests?.length || 0), 0)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.2)
  doc.setTextColor(...NAVY)
  doc.text('GROUP SPECIFICATION:', ML + 4, curY + 4.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_DARK)
  doc.text('Group / Delegation: ' + (voucher.groupName || 'Tour Group Booking'), ML + 4, curY + 9)
  doc.text('Total Rooms Blocked: ' + totalRooms + ' Room(s)', ML + 4, curY + 13.5)

  doc.text('Total Group Occupants: ' + totalGuests + ' Confirmed Passenger(s)', ML + 95, curY + 9)
  if (voucher.agentName) {
    doc.text('Tour Leader / B2B Agent: ' + voucher.agentName + (voucher.agentPhone ? (' (' + voucher.agentPhone + ')') : ''), ML + 95, curY + 13.5)
  }

  curY += 19

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...NAVY)
  doc.text('MASTER GROUP ROOMING ROSTER & OCCUPANCY DETAILS', ML, curY + 4)
  curY += 6

  const drawTableHeader = (yPos: number) => {
    doc.setFillColor(...NAVY)
    doc.rect(ML, yPos, CW, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...WHITE)
    doc.text('ROOM #', ML + 3, yPos + 4.8)
    doc.text('ROOM CATEGORY', ML + 23, yPos + 4.8)
    doc.text('OCCUPANT FULL NAME', ML + 63, yPos + 4.8)
    doc.text('PASSPORT NUMBER', ML + 125, yPos + 4.8)
    doc.text('NATIONALITY', ML + 160, yPos + 4.8)
  }

  drawTableHeader(curY)
  curY += 7

  let pageNum = 1

  voucher.rooms.forEach((room, rIdx) => {
    const guests = room.guests && room.guests.length > 0 ? room.guests : [{ fullName: 'TBD Guest', title: 'Mr' }]
    const rowHeight = Math.max(8, guests.length * 6)

    if (curY + rowHeight > 248) {
      doc.addPage()
      pageNum++
      drawWatermark(doc, watermarkUrl)
      drawHeader(doc, voucher, 'Group Master Hotel Accommodation Voucher (Cont.)', headerLetterheadUrl)
      curY = 59
      drawTableHeader(curY)
      curY += 7
    }

    doc.setDrawColor(...DIVIDER_LINE)
    doc.setLineWidth(0.3)
    doc.line(ML, curY + rowHeight, MR, curY + rowHeight)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.2)
    doc.setTextColor(...NAVY)
    const displayRoomText = cleanRoomLabel(room.roomNumber, rIdx)
    doc.text(displayRoomText, ML + 3, curY + 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...TEXT_DARK)
    const categoryLines = doc.splitTextToSize(room.roomType || 'Standard Room', 36)
    doc.text(categoryLines, ML + 23, curY + 5)

    guests.forEach((g, gIdx) => {
      const gY = curY + 5 + gIdx * 5.6

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.2)
      doc.setTextColor(...TEXT_DARK)
      const nameStr = ((g.title ? (g.title + ' ') : '') + g.fullName).toUpperCase()
      const nameLines = doc.splitTextToSize(nameStr, 58)
      doc.text(nameLines[0] || nameStr, ML + 63, gY)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.2)
      doc.setTextColor(...NAVY)
      doc.text(g.passportNumber || 'N/A', ML + 125, gY)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...TEXT_DARK)
      doc.text(g.nationality || 'INDIAN', ML + 160, gY)
    })

    curY += rowHeight
  })

  if (voucher.specialRequests && curY < 242) {
    curY += 3
    doc.setFillColor(254, 250, 235)
    doc.setDrawColor(253, 230, 138)
    doc.roundedRect(ML, curY, CW, 9.5, 1, 1, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.2)
    doc.setTextColor(180, 83, 9)
    doc.text('SPECIAL REQUESTS & INSTRUCTIONS:', ML + 3, curY + 3.8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.2)
    doc.setTextColor(69, 26, 3)
    doc.text(voucher.specialRequests, ML + 3, curY + 7.2, { maxWidth: CW - 6 })
  }

  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    drawFooter(doc, p, totalPages, qrDataUrl, footerAccreditationUrl, voucher.voucherNumber)
  }

  const cleanFileName = 'Hotel_Master_Voucher_' + voucher.voucherNumber + '_' + (voucher.groupName || 'Group').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf'
  doc.save(cleanFileName)
}

export async function generateSingleRoomVisaPdf(voucher: HotelVoucherData, roomIndex: number): Promise<void> {
  const room = voucher.rooms[roomIndex]
  if (!room) return

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })

  const PW = 210
  const ML = 14
  const MR = 196
  const CW = MR - ML

  const [qrDataUrl, watermarkUrl, headerLetterheadUrl, footerAccreditationUrl] = await Promise.all([
    generateQrDataUrl(voucher.voucherNumber),
    loadAssetDataUrl('/images/logo.png'),
    loadAssetDataUrl('/images/voucher-header-letterhead.png'),
    loadAssetDataUrl('/images/voucher-footer-accreditations.png'),
  ])

  drawWatermark(doc, watermarkUrl)
  drawHeader(doc, voucher, 'Visa Application Accommodation Confirmation', headerLetterheadUrl)
  let curY = drawHotelDetailsCard(doc, voucher, 59)

  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.roundedRect(ML, curY, CW, 14, 1.5, 1.5, 'S')

  const displayRoomTitle = cleanRoomLabel(room.roomNumber, roomIndex)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.8)
  doc.setTextColor(...NAVY)
  doc.text('CONFIRMED ROOM ALLOCATION: ' + displayRoomTitle.toUpperCase(), ML + 4, curY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_DARK)
  doc.text(
    'Category: ' + (room.roomType || 'Standard Room') + '   |   Bedding: ' + (room.bedding || 'Standard') + '   |   Meal: ' + (room.mealBasis || voucher.mealPlan || 'Buffet Breakfast'),
    ML + 4,
    curY + 10
  )

  curY += 17

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...NAVY)
  doc.text('REGISTERED OCCUPANTS & VISA APPLICANTS', ML, curY + 4)
  curY += 6

  doc.setFillColor(...NAVY)
  doc.rect(ML, curY, CW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...WHITE)
  doc.text('ROOM #', ML + 3, curY + 4.8)
  doc.text('ROOM CATEGORY', ML + 23, curY + 4.8)
  doc.text('OCCUPANT FULL NAME', ML + 63, curY + 4.8)
  doc.text('PASSPORT NUMBER', ML + 125, curY + 4.8)
  doc.text('NATIONALITY', ML + 160, curY + 4.8)
  curY += 7

  const guests = room.guests && room.guests.length > 0 ? room.guests : [{ fullName: 'Applicant Name', title: 'Mr' }]

  guests.forEach((guest) => {
    const rowH = 10
    doc.setDrawColor(...DIVIDER_LINE)
    doc.setLineWidth(0.3)
    doc.line(ML, curY + rowH, MR, curY + rowH)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.2)
    doc.setTextColor(...NAVY)
    doc.text(displayRoomTitle, ML + 3, curY + 6.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...TEXT_DARK)
    const catLines = doc.splitTextToSize(room.roomType || 'Standard Room', 36)
    doc.text(catLines, ML + 23, curY + 6.5)

    const fullName = ((guest.title ? (guest.title + ' ') : '') + guest.fullName).toUpperCase()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.2)
    doc.setTextColor(...TEXT_DARK)
    doc.text(fullName, ML + 63, curY + 6.5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.2)
    doc.setTextColor(...NAVY)
    doc.text(guest.passportNumber || 'N/A', ML + 125, curY + 6.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...TEXT_DARK)
    doc.text(guest.nationality || 'INDIAN', ML + 160, curY + 6.5)

    curY += rowH
  })

  curY += 8

  doc.setFillColor(254, 250, 235)
  doc.setDrawColor(245, 158, 11)
  doc.setLineWidth(0.4)
  doc.roundedRect(ML, curY, CW, 30, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.2)
  doc.setTextColor(180, 83, 9)
  doc.text('FORMAL GUARANTEE & DECLARATION FOR VISA ISSUING AUTHORITIES', ML + 5, curY + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.6)
  doc.setTextColor(69, 26, 3)
  const declText =
    'This is to certify that the above-named guest(s) have confirmed and guaranteed hotel accommodation booked through Flying Wonders Pvt Ltd for the entire specified itinerary duration. The hotel accommodation expenses have been prepaid and guaranteed under our tour operator billing facility. No room tariff remains payable by the guest(s) upon check-in.'
  const declLines = doc.splitTextToSize(declText, CW - 10)
  doc.text(declLines, ML + 5, curY + 11)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.4)
  doc.setTextColor(...NAVY)
  doc.text('Authorized by: Inbound Operations Desk, Flying Wonders Pvt Ltd   •   CIN: U63090KA2016PTC095564', ML + 5, curY + 26)

  drawFooter(doc, 1, 1, qrDataUrl, footerAccreditationUrl, voucher.voucherNumber)

  const primaryGuestName = (guests[0]?.fullName || ('Room_' + (roomIndex + 1))).replace(/[^a-zA-Z0-9]/g, '_')
  const fileName = 'Visa_Hotel_Voucher_' + voucher.voucherNumber + '_' + primaryGuestName + '.pdf'
  doc.save(fileName)
}

export async function generateAllVisaVouchersPdf(voucher: HotelVoucherData): Promise<void> {
  if (!voucher.rooms || voucher.rooms.length === 0) return

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })

  const PW = 210
  const ML = 14
  const MR = 196
  const CW = MR - ML

  const [qrDataUrl, watermarkUrl, headerLetterheadUrl, footerAccreditationUrl] = await Promise.all([
    generateQrDataUrl(voucher.voucherNumber),
    loadAssetDataUrl('/images/logo.png'),
    loadAssetDataUrl('/images/voucher-header-letterhead.png'),
    loadAssetDataUrl('/images/voucher-footer-accreditations.png'),
  ])

  const totalPages = voucher.rooms.length

  voucher.rooms.forEach((room, roomIndex) => {
    if (roomIndex > 0) {
      doc.addPage()
    }

    drawWatermark(doc, watermarkUrl)
    const displayRoomTitle = cleanRoomLabel(room.roomNumber, roomIndex)
    drawHeader(doc, voucher, 'Visa Accommodation Voucher (' + displayRoomTitle + ')', headerLetterheadUrl)
    let curY = drawHotelDetailsCard(doc, voucher, 59)

    doc.setDrawColor(...BORDER_GRAY)
    doc.setLineWidth(0.3)
    doc.roundedRect(ML, curY, CW, 14, 1.5, 1.5, 'S')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.8)
    doc.setTextColor(...NAVY)
    doc.text('CONFIRMED ROOM ALLOCATION: ' + displayRoomTitle.toUpperCase(), ML + 4, curY + 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...TEXT_DARK)
    doc.text(
      'Category: ' + (room.roomType || 'Standard Room') + '   |   Bedding: ' + (room.bedding || 'Standard') + '   |   Meal: ' + (room.mealBasis || voucher.mealPlan || 'Buffet Breakfast'),
      ML + 4,
      curY + 10
    )

    curY += 17

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...NAVY)
    doc.text('REGISTERED OCCUPANTS & VISA APPLICANTS', ML, curY + 4)
    curY += 6

    doc.setFillColor(...NAVY)
    doc.rect(ML, curY, CW, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...WHITE)
    doc.text('ROOM #', ML + 3, curY + 4.8)
    doc.text('ROOM CATEGORY', ML + 23, curY + 4.8)
    doc.text('OCCUPANT FULL NAME', ML + 63, curY + 4.8)
    doc.text('PASSPORT NUMBER', ML + 125, curY + 4.8)
    doc.text('NATIONALITY', ML + 160, curY + 4.8)
    curY += 7

    const guests = room.guests && room.guests.length > 0 ? room.guests : [{ fullName: 'Applicant Name', title: 'Mr' }]

    guests.forEach((guest) => {
      const rowH = 10
      doc.setDrawColor(...DIVIDER_LINE)
      doc.setLineWidth(0.3)
      doc.line(ML, curY + rowH, MR, curY + rowH)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.2)
      doc.setTextColor(...NAVY)
      doc.text(displayRoomTitle, ML + 3, curY + 6.5)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...TEXT_DARK)
      const catLines = doc.splitTextToSize(room.roomType || 'Standard Room', 36)
      doc.text(catLines, ML + 23, curY + 6.5)

      const fullName = ((guest.title ? (guest.title + ' ') : '') + guest.fullName).toUpperCase()
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.2)
      doc.setTextColor(...TEXT_DARK)
      doc.text(fullName, ML + 63, curY + 6.5)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.2)
      doc.setTextColor(...NAVY)
      doc.text(guest.passportNumber || 'N/A', ML + 125, curY + 6.5)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...TEXT_DARK)
      doc.text(guest.nationality || 'INDIAN', ML + 160, curY + 6.5)

      curY += rowH
    })

    curY += 8

    doc.setFillColor(254, 250, 235)
    doc.setDrawColor(245, 158, 11)
    doc.setLineWidth(0.4)
    doc.roundedRect(ML, curY, CW, 30, 2, 2, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.2)
    doc.setTextColor(180, 83, 9)
    doc.text('FORMAL GUARANTEE & DECLARATION FOR VISA ISSUING AUTHORITIES', ML + 5, curY + 5.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.6)
    doc.setTextColor(69, 26, 3)
    const declText =
      'This is to certify that the above-named guest(s) have confirmed and guaranteed hotel accommodation booked through Flying Wonders Pvt Ltd for the entire specified itinerary duration. The hotel accommodation expenses have been prepaid and guaranteed under our tour operator billing facility. No room tariff remains payable by the guest(s) upon check-in.'
    const declLines = doc.splitTextToSize(declText, CW - 10)
    doc.text(declLines, ML + 5, curY + 11)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.4)
    doc.setTextColor(...NAVY)
    doc.text('Authorized by: Inbound Operations Desk, Flying Wonders Pvt Ltd   •   CIN: U63090KA2016PTC095564', ML + 5, curY + 26)

    drawFooter(doc, roomIndex + 1, totalPages, qrDataUrl, footerAccreditationUrl, voucher.voucherNumber)
  })

  const fileName = 'All_Visa_Vouchers_Dossier_' + voucher.voucherNumber + '_' + (voucher.groupName || 'Group').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf'
  doc.save(fileName)
}
