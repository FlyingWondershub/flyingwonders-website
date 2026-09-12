/**
 * Hotel Confirmation Voucher PDF Generator
 * Produces Embassy / Consular Visa-Compliant Vouchers and Master Group Vouchers.
 */

export interface HotelGuest {
  title?: string
  fullName: string
  passportNumber?: string
  nationality?: string
  guestType?: string // 'Adult' | 'Child'
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
 * Draws the official Flying Wonders Header on any page
 */
function drawHeader(doc: any, voucher: HotelVoucherData, subtitle: string) {
  const PW = 210
  const ML = 14
  const MR = 196
  const CW = MR - ML

  // Top Navy Header Bar
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, PW, 24, 'F')

  // Gold Accent Line
  doc.setFillColor(...GOLD)
  doc.rect(0, 24, PW, 1.8, 'F')

  // Agency Brand
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('FLYING WONDERS TRAVEL DMC', ML, 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(220, 230, 245)
  doc.text('Singapore Inbound Operator & Global Ground DMC | Web: flyingwonders.net | Email: info.flyingwonders@gmail.com | SG: +65 94722830', ML, 16)
  doc.text('STB Licensed Destination Specialist | Singapore · Malaysia · International Tours', ML, 20.5)

  // Document Title Banner below header
  doc.setFillColor(...LIGHT_BG)
  doc.rect(ML, 29, CW, 14, 'F')
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.rect(ML, 29, CW, 14, 'S')

  doc.setTextColor(...NAVY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(subtitle.toUpperCase(), ML + 4, 35.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TEXT_MUTED)
  doc.text('OFFICIAL DOCUMENT ISSUED FOR EMBASSY VISA APPLICATION & HOTEL FRONT DESK CHECK-IN', ML + 4, 40)

  // Reference Block (Right Aligned)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text(`Voucher Ref: ${voucher.voucherNumber}`, MR - 4, 35, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(180, 83, 9)
  doc.text(`CRS / Conf: ${voucher.hotelConfirmationNo || 'CONFIRMED ON ARRIVAL'}`, MR - 4, 40, { align: 'right' })
}

/**
 * Draws the official Footer with verification text & security stamp
 */
function drawFooter(doc: any, pageNum: number, totalPages: number, qrDataUrl?: string) {
  const PW = 210
  const PH = 297
  const ML = 14
  const MR = 196
  const CW = MR - ML
  const FY = PH - 24

  // Top border line
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.4)
  doc.line(ML, FY, MR, FY)

  // QR Code on bottom right if available
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', MR - 18, FY + 2, 18, 18)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6)
      doc.setTextColor(...NAVY)
      doc.text('SCAN TO VERIFY LIVE', MR - 9, FY + 21.5, { align: 'center' })
    } catch (e) {}
  }

  // Official Stamp Box (Left)
  doc.setDrawColor(22, 101, 52)
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(ML, FY + 2, 60, 18, 1.5, 1.5, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(22, 101, 52)
  doc.text('OFFICIAL VERIFIED BOOKING', ML + 30, FY + 6.5, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(51, 65, 85)
  doc.text('FLYING WONDERS PTE LTD · SINGAPORE', ML + 30, FY + 10.5, { align: 'center' })
  doc.text('Operations Desk · Authenticity Guaranteed', ML + 30, FY + 14, { align: 'center' })
  doc.text('STB Travel Agent License TA-03451', ML + 30, FY + 17.5, { align: 'center' })

  // Middle Guarantee Notice
  const midW = CW - 60 - 24
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...TEXT_MUTED)
  doc.text(
    'This document serves as formal proof of confirmed and guaranteed hotel accommodation for visa purposes. The reservation is billed to Flying Wonders DMC. For embassy inquiries, contact info.flyingwonders@gmail.com.',
    ML + 64,
    FY + 6,
    { maxWidth: midW }
  )

  const issueDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...NAVY)
  doc.text(`Issued: ${issueDate}  |  Page ${pageNum} of ${totalPages}`, ML + 64, FY + 18)
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
  doc.roundedRect(ML, y, CW, 38, 2, 2, 'FD')

  // Hotel Name & Rating
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...NAVY)
  doc.text(voucher.hotelName, ML + 5, y + 7)

  if (voucher.starRating) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...GOLD)
    doc.text(`[ ${voucher.starRating} Rating ]`, MR - 5, y + 7, { align: 'right' })
  }

  // Address
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_MUTED)
  const addrText = voucher.hotelAddress || 'Centrally located partner property'
  const addrLines = doc.splitTextToSize(`Address: ${addrText}`, CW - 10)
  doc.text(addrLines, ML + 5, y + 12.5)

  // Direct Contact (Critical for Visa verification)
  const contactY = y + 13 + addrLines.length * 3.8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...NAVY)
  doc.text('Hotel Front Desk / Verification Contact:', ML + 5, contactY)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_DARK)
  const phoneText = voucher.hotelPhone ? `Tel: ${voucher.hotelPhone}` : 'Tel: +65 Front Desk'
  const emailText = voucher.hotelEmail ? `Email: ${voucher.hotelEmail}` : 'Email: reservations@hotel.com'
  doc.text(`${phoneText}   |   ${emailText}`, ML + 5, contactY + 4.5)

  // Dates & Nights Strip
  const datesY = y + 26
  doc.setFillColor(...LIGHT_BG)
  doc.rect(ML + 0.3, datesY, CW - 0.6, 11.7, 'F')
  doc.setDrawColor(...BORDER_GRAY)
  doc.line(ML, datesY, MR, datesY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...NAVY)

  // Check In
  doc.text('CHECK-IN DATE & TIME:', ML + 5, datesY + 4.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_DARK)
  doc.text(`${voucher.checkInDate} (From ${voucher.checkInTime || '15:00 hrs'})`, ML + 5, datesY + 9)

  // Check Out
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...NAVY)
  doc.text('CHECK-OUT DATE & TIME:', ML + 65, datesY + 4.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_DARK)
  doc.text(`${voucher.checkOutDate} (Until ${voucher.checkOutTime || '11:00 hrs'})`, ML + 65, datesY + 9)

  // Nights & Meal Basis
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...NAVY)
  doc.text('TOTAL NIGHTS & MEALS:', ML + 125, datesY + 4.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_DARK)
  doc.text(`${voucher.nights} Night(s)  •  ${voucher.mealPlan || 'Daily Buffet Breakfast'}`, ML + 125, datesY + 9)

  return y + 42
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

  const qrDataUrl = await generateQrDataUrl(voucher.voucherNumber)

  // Page 1
  drawHeader(doc, voucher, 'Group Master Hotel Accommodation Voucher')
  let curY = drawHotelDetailsCard(doc, voucher, 46)

  // Group Summary Box
  doc.setFillColor(...LIGHT_BG)
  doc.setDrawColor(...BORDER_GRAY)
  doc.roundedRect(ML, curY, CW, 20, 1.5, 1.5, 'FD')

  const totalRooms = voucher.rooms.length
  const totalGuests = voucher.rooms.reduce((acc, r) => acc + (r.guests?.length || 0), 0)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...NAVY)
  doc.text('GROUP SPECIFICATION:', ML + 4, curY + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_DARK)
  doc.text(`Group / Delegation: ${voucher.groupName || 'Tour Group Booking'}`, ML + 4, curY + 10)
  doc.text(`Total Rooms Blocked: ${totalRooms} Room(s)`, ML + 4, curY + 15)

  doc.text(`Total Group Occupants: ${totalGuests} Confirmed Passenger(s)`, ML + 95, curY + 10)
  if (voucher.agentName) {
    doc.text(`Tour Leader / B2B Agent: ${voucher.agentName} ${voucher.agentPhone ? `(${voucher.agentPhone})` : ''}`, ML + 95, curY + 15)
  }

  curY += 24

  // Group Rooming List Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...NAVY)
  doc.text('MASTER GROUP ROOMING ROSTER & OCCUPANCY DETAILS', ML, curY + 4)
  curY += 6

  // Table Columns
  const drawTableHeader = (yPos: number) => {
    doc.setFillColor(...NAVY)
    doc.rect(ML, yPos, CW, 6.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...WHITE)
    doc.text('ROOM #', ML + 3, yPos + 4.5)
    doc.text('ROOM CATEGORY & BEDDING', ML + 20, yPos + 4.5)
    doc.text('OCCUPANT FULL NAME (AS PER PASSPORT)', ML + 75, yPos + 4.5)
    doc.text('PASSPORT NO.', ML + 138, yPos + 4.5)
    doc.text('TYPE / NAT.', ML + 168, yPos + 4.5)
  }

  drawTableHeader(curY)
  curY += 6.5

  let pageNum = 1

  // Loop through rooms and guests
  voucher.rooms.forEach((room, rIdx) => {
    const guests = room.guests && room.guests.length > 0 ? room.guests : [{ fullName: 'TBD Guest', title: 'Mr' }]
    const rowHeight = Math.max(7, guests.length * 6)

    // Check page break
    if (curY + rowHeight > PH - 32) {
      drawFooter(doc, pageNum, 2, qrDataUrl)
      doc.addPage()
      pageNum++
      drawHeader(doc, voucher, 'Group Master Hotel Accommodation Voucher (Cont.)')
      curY = 48
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

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...NAVY)
    doc.text(`Room ${room.roomNumber || (rIdx + 1).toString().padStart(2, '0')}`, ML + 3, curY + 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...TEXT_DARK)
    doc.text(room.roomType || 'Standard Room', ML + 20, curY + 4.2)
    if (room.bedding) {
      doc.setFontSize(6.5)
      doc.setTextColor(...TEXT_MUTED)
      doc.text(`[${room.bedding}]`, ML + 20, curY + 7.5)
    }

    // List all guests in this room
    guests.forEach((g, gIdx) => {
      const gY = curY + 4.5 + gIdx * 5.2
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(...TEXT_DARK)
      const nameStr = `${g.title ? `${g.title} ` : ''}${g.fullName}`
      doc.text(nameStr.toUpperCase(), ML + 75, gY)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...NAVY)
      doc.text(g.passportNumber || 'N/A', ML + 138, gY)

      doc.setFontSize(6.5)
      doc.setTextColor(...TEXT_MUTED)
      doc.text(`${g.guestType || 'Adult'} (${g.nationality || 'IND'})`, ML + 168, gY)
    })

    curY += rowHeight
  })

  // Special Requests / Remarks if space permits
  if (voucher.specialRequests && curY < PH - 45) {
    curY += 4
    doc.setFillColor(254, 250, 235)
    doc.roundedRect(ML, curY, CW, 12, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(180, 83, 9)
    doc.text('SPECIAL REQUESTS & INSTRUCTIONS:', ML + 4, curY + 4.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(69, 26, 3)
    doc.text(voucher.specialRequests, ML + 4, curY + 8.5, { maxWidth: CW - 8 })
  }

  // Draw footer on all pages
  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    drawFooter(doc, p, totalPages, qrDataUrl)
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

  const qrDataUrl = await generateQrDataUrl(voucher.voucherNumber)

  // Header
  drawHeader(doc, voucher, 'Visa Application Accommodation Confirmation')

  // Hotel Details Card
  let curY = drawHotelDetailsCard(doc, voucher, 46)

  // Allocated Room & Visa Applicant Details Section
  doc.setFillColor(...LIGHT_BG)
  doc.setDrawColor(...BORDER_GRAY)
  doc.roundedRect(ML, curY, CW, 14, 1.5, 1.5, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text(`CONFIRMED ROOM ALLOCATION: ROOM #${room.roomNumber || (roomIndex + 1).toString().padStart(2, '0')}`, ML + 4, curY + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_DARK)
  doc.text(`Category: ${room.roomType || 'Standard Room'}   |   Bedding: ${room.bedding || 'Twin / Double'}   |   Meal: ${room.mealBasis || voucher.mealPlan || 'Buffet Breakfast'}`, ML + 4, curY + 10.5)

  curY += 18

  // Visa Applicants Table Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...NAVY)
  doc.text('REGISTERED OCCUPANTS & VISA APPLICANTS', ML, curY + 4)
  curY += 6

  // Table header
  doc.setFillColor(...NAVY)
  doc.rect(ML, curY, CW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...WHITE)
  doc.text('#', ML + 3, curY + 4.8)
  doc.text('APPLICANT FULL NAME (AS PER PASSPORT)', ML + 12, curY + 4.8)
  doc.text('PASSPORT NUMBER', ML + 105, curY + 4.8)
  doc.text('NATIONALITY', ML + 145, curY + 4.8)
  doc.text('CATEGORY', ML + 172, curY + 4.8)
  curY += 7

  const guests = room.guests && room.guests.length > 0 ? room.guests : [{ fullName: 'Applicant Name', title: 'Mr' }]

  guests.forEach((guest, gIdx) => {
    const rowH = 11
    if (gIdx % 2 === 1) {
      doc.setFillColor(248, 250, 252)
      doc.rect(ML, curY, CW, rowH, 'F')
    }
    doc.setDrawColor(...BORDER_GRAY)
    doc.line(ML, curY + rowH, MR, curY + rowH)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...NAVY)
    doc.text(`${gIdx + 1}`, ML + 3, curY + 7)

    const fullName = `${guest.title ? `${guest.title} ` : ''}${guest.fullName}`.toUpperCase()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...TEXT_DARK)
    doc.text(fullName, ML + 12, curY + 7)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...NAVY)
    doc.text(guest.passportNumber || 'N/A', ML + 105, curY + 7)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...TEXT_DARK)
    doc.text(guest.nationality || 'INDIAN', ML + 145, curY + 7)
    doc.text(guest.guestType || 'Adult', ML + 172, curY + 7)

    curY += rowH
  })

  curY += 6

  // Formal Guarantee Statement Box for Embassy Consulates
  doc.setFillColor(254, 250, 235)
  doc.setDrawColor(245, 158, 11)
  doc.setLineWidth(0.4)
  doc.roundedRect(ML, curY, CW, 32, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(180, 83, 9)
  doc.text('FORMAL GUARANTEE & DECLARATION FOR VISA ISSUING AUTHORITIES', ML + 5, curY + 6)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(69, 26, 3)
  const declText =
    `This is to certify that the above-named guest(s) have confirmed and guaranteed hotel accommodation booked through Flying Wonders Travel DMC for the entire specified itinerary duration. The hotel accommodation expenses have been prepaid and guaranteed under our tour operator billing facility. No room tariff remains payable by the guest(s) upon check-in.`
  const declLines = doc.splitTextToSize(declText, CW - 10)
  doc.text(declLines, ML + 5, curY + 11.5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...NAVY)
  doc.text(`Authorized by: Inbound Operations Desk, Flying Wonders Pte Ltd  •  Singapore Tourism Board TA-03451`, ML + 5, curY + 28)

  // Footer with QR Code
  drawFooter(doc, 1, 1, qrDataUrl)

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

  const qrDataUrl = await generateQrDataUrl(voucher.voucherNumber)
  const totalPages = voucher.rooms.length

  voucher.rooms.forEach((room, roomIndex) => {
    if (roomIndex > 0) {
      doc.addPage()
    }

    // Header
    drawHeader(doc, voucher, `Visa Accommodation Voucher (Room ${room.roomNumber || roomIndex + 1})`)

    // Hotel Details Card
    let curY = drawHotelDetailsCard(doc, voucher, 46)

    // Room Allocation Box
    doc.setFillColor(...LIGHT_BG)
    doc.setDrawColor(...BORDER_GRAY)
    doc.roundedRect(ML, curY, CW, 14, 1.5, 1.5, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...NAVY)
    doc.text(`CONFIRMED ROOM ALLOCATION: ROOM #${room.roomNumber || (roomIndex + 1).toString().padStart(2, '0')}`, ML + 4, curY + 5.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...TEXT_DARK)
    doc.text(`Category: ${room.roomType || 'Standard Room'}   |   Bedding: ${room.bedding || 'Twin / Double'}   |   Meal: ${room.mealBasis || voucher.mealPlan || 'Buffet Breakfast'}`, ML + 4, curY + 10.5)

    curY += 18

    // Table Header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...NAVY)
    doc.text('REGISTERED OCCUPANTS & VISA APPLICANTS', ML, curY + 4)
    curY += 6

    doc.setFillColor(...NAVY)
    doc.rect(ML, curY, CW, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...WHITE)
    doc.text('#', ML + 3, curY + 4.8)
    doc.text('APPLICANT FULL NAME (AS PER PASSPORT)', ML + 12, curY + 4.8)
    doc.text('PASSPORT NUMBER', ML + 105, curY + 4.8)
    doc.text('NATIONALITY', ML + 145, curY + 4.8)
    doc.text('CATEGORY', ML + 172, curY + 4.8)
    curY += 7

    const guests = room.guests && room.guests.length > 0 ? room.guests : [{ fullName: 'Applicant Name', title: 'Mr' }]

    guests.forEach((guest, gIdx) => {
      const rowH = 11
      if (gIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252)
        doc.rect(ML, curY, CW, rowH, 'F')
      }
      doc.setDrawColor(...BORDER_GRAY)
      doc.line(ML, curY + rowH, MR, curY + rowH)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...NAVY)
      doc.text(`${gIdx + 1}`, ML + 3, curY + 7)

      const fullName = `${guest.title ? `${guest.title} ` : ''}${guest.fullName}`.toUpperCase()
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(...TEXT_DARK)
      doc.text(fullName, ML + 12, curY + 7)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...NAVY)
      doc.text(guest.passportNumber || 'N/A', ML + 105, curY + 7)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...TEXT_DARK)
      doc.text(guest.nationality || 'INDIAN', ML + 145, curY + 7)
      doc.text(guest.guestType || 'Adult', ML + 172, curY + 7)

      curY += rowH
    })

    curY += 6

    // Formal Guarantee Statement Box for Embassy Consulates
    doc.setFillColor(254, 250, 235)
    doc.setDrawColor(245, 158, 11)
    doc.setLineWidth(0.4)
    doc.roundedRect(ML, curY, CW, 32, 2, 2, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(180, 83, 9)
    doc.text('FORMAL GUARANTEE & DECLARATION FOR VISA ISSUING AUTHORITIES', ML + 5, curY + 6)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(69, 26, 3)
    const declText =
      `This is to certify that the above-named guest(s) have confirmed and guaranteed hotel accommodation booked through Flying Wonders Travel DMC for the entire specified itinerary duration. The hotel accommodation expenses have been prepaid and guaranteed under our tour operator billing facility. No room tariff remains payable by the guest(s) upon check-in.`
    const declLines = doc.splitTextToSize(declText, CW - 10)
    doc.text(declLines, ML + 5, curY + 11.5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...NAVY)
    doc.text(`Authorized by: Inbound Operations Desk, Flying Wonders Pte Ltd  •  Singapore Tourism Board TA-03451`, ML + 5, curY + 28)

    // Footer
    drawFooter(doc, roomIndex + 1, totalPages, qrDataUrl)
  })

  // Download complete dossier
  const fileName = `All_Visa_Vouchers_Dossier_${voucher.voucherNumber}_${(voucher.groupName || 'Group').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  doc.save(fileName)
}
