'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Trash2,
  Download,
  Printer,
  FileSpreadsheet,
  Upload,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  Share2,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles
} from 'lucide-react'
import * as XLSX from 'xlsx'
import {
  generateMasterGroupVoucherPdf,
  generateAllVisaVouchersPdf,
  generateSingleRoomVisaPdf,
  HotelVoucherData,
  HotelRoomAllocation,
  HotelGuest
} from '../utils/hotelVoucherPdf'

interface GroupHotelVoucherModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
  existingVoucher?: any | null
}

const POPULAR_PARTNER_HOTELS = [
  {
    name: 'V Hotel Lavender',
    address: '70 Jellicoe Road, Lavender, Singapore 208767',
    phone: '+65 6340 1188',
    email: 'contact@vhotel.sg',
    starRating: '4-Star',
    checkInTime: '15:00 hrs',
    checkOutTime: '11:00 hrs',
  },
  {
    name: 'Hotel Boss Singapore',
    address: '500 Jalan Sultan, Singapore 199020',
    phone: '+65 6809 0000',
    email: 'contact@hotelboss.sg',
    starRating: '4-Star',
    checkInTime: '15:00 hrs',
    checkOutTime: '11:00 hrs',
  },
  {
    name: 'Furama RiverFront Singapore',
    address: '405 Havelock Road, Singapore 169633',
    phone: '+65 6333 8898',
    email: 'riverfront@furama.com',
    starRating: '4-Star',
    checkInTime: '15:00 hrs',
    checkOutTime: '12:00 hrs',
  },
  {
    name: 'Village Hotel Bugis by Far East Hospitality',
    address: '390 Victoria Street, Singapore 188061',
    phone: '+65 6297 2828',
    email: 'reseasy@fareast.com.sg',
    starRating: '4-Star',
    checkInTime: '14:00 hrs',
    checkOutTime: '12:00 hrs',
  },
  {
    name: 'Marina Bay Sands Singapore',
    address: '10 Bayfront Avenue, Marina Bay, Singapore 018956',
    phone: '+65 6688 8868',
    email: 'room.reservations@marinabaysands.com',
    starRating: '5-Star',
    checkInTime: '15:00 hrs',
    checkOutTime: '11:00 hrs',
  },
  {
    name: 'PARKROYAL on Beach Road',
    address: '7500 Beach Road, Singapore 199591',
    phone: '+65 6505 5666',
    email: 'enquiry.prsin@parkroyalhotels.com',
    starRating: '4-Star',
    checkInTime: '15:00 hrs',
    checkOutTime: '12:00 hrs',
  },
  {
    name: 'Hotel Chancellor @ Orchard',
    address: '28 Cavenagh Road, Orchard, Singapore 229635',
    phone: '+65 6688 8888',
    email: 'reservations@ghihotels.com.sg',
    starRating: '3-Star',
    checkInTime: '15:00 hrs',
    checkOutTime: '11:00 hrs',
  },
  {
    name: 'ibis budget Singapore Selegie',
    address: '183 Selegie Road, Singapore 188332',
    phone: '+65 6337 7888',
    email: 'res@ibisbudget.sg',
    starRating: '3-Star',
    checkInTime: '15:00 hrs',
    checkOutTime: '12:00 hrs',
  }
]

export default function GroupHotelVoucherModal({
  isOpen,
  onClose,
  onSaved,
  existingVoucher,
}: GroupHotelVoucherModalProps) {
  const [saving, setSaving] = useState(false)
  const [importingProposal, setImportingProposal] = useState(false)
  const [proposalQuery, setProposalQuery] = useState('')

  // Form State
  const [docId, setDocId] = useState<string | undefined>(undefined)
  const [voucherNumber, setVoucherNumber] = useState('')
  const [groupName, setGroupName] = useState('')
  const [proposalNumber, setProposalNumber] = useState('')
  const [hotelName, setHotelName] = useState('')
  const [hotelAddress, setHotelAddress] = useState('')
  const [hotelPhone, setHotelPhone] = useState('')
  const [hotelEmail, setHotelEmail] = useState('')
  const [starRating, setStarRating] = useState('4-Star')
  const [hotelConfirmationNo, setHotelConfirmationNo] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkInTime, setCheckInTime] = useState('15:00 hrs')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [checkOutTime, setCheckOutTime] = useState('11:00 hrs')
  const [nights, setNights] = useState(3)
  const [mealPlan, setMealPlan] = useState('Daily Buffet Breakfast (CP)')
  const [bookingStatus, setBookingStatus] = useState('Confirmed & Guaranteed')
  const [paymentStatus, setPaymentStatus] = useState('Prepaid / Billed to Flying Wonders DMC')
  const [agentName, setAgentName] = useState('')
  const [agentEmail, setAgentEmail] = useState('')
  const [agentPhone, setAgentPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('Non-smoking rooms requested. Luggage storage upon early arrival. Indian vegetarian breakfast required for group.')

  // Rooms State
  const [rooms, setRooms] = useState<HotelRoomAllocation[]>([
    {
      roomNumber: '01',
      roomType: 'Deluxe Twin Room',
      bedding: 'Twin Beds',
      guests: [
        { title: 'Mr', fullName: 'Rajesh Kumar', passportNumber: 'M8492019', nationality: 'INDIAN', guestType: 'Adult' },
        { title: 'Mrs', fullName: 'Sunita Kumar', passportNumber: 'M8492020', nationality: 'INDIAN', guestType: 'Adult' },
      ],
    },
    {
      roomNumber: '02',
      roomType: 'Deluxe Twin Room',
      bedding: 'Twin Beds',
      guests: [
        { title: 'Mr', fullName: 'Amitabh Sharma', passportNumber: 'N1928374', nationality: 'INDIAN', guestType: 'Adult' },
        { title: 'Mr', fullName: 'Vikas Verma', passportNumber: 'P9283741', nationality: 'INDIAN', guestType: 'Adult' },
      ],
    },
  ])

  useEffect(() => {
    if (existingVoucher) {
      setDocId(existingVoucher._id)
      setVoucherNumber(existingVoucher.voucherNumber || '')
      setGroupName(existingVoucher.groupName || '')
      setProposalNumber(existingVoucher.proposalNumber || '')
      setHotelName(existingVoucher.hotelName || '')
      setHotelAddress(existingVoucher.hotelAddress || '')
      setHotelPhone(existingVoucher.hotelPhone || '')
      setHotelEmail(existingVoucher.hotelEmail || '')
      setStarRating(existingVoucher.starRating || '4-Star')
      setHotelConfirmationNo(existingVoucher.hotelConfirmationNo || '')
      setCheckInDate(existingVoucher.checkInDate || '')
      setCheckInTime(existingVoucher.checkInTime || '15:00 hrs')
      setCheckOutDate(existingVoucher.checkOutDate || '')
      setCheckOutTime(existingVoucher.checkOutTime || '11:00 hrs')
      setNights(Number(existingVoucher.nights) || 3)
      setMealPlan(existingVoucher.mealPlan || 'Daily Buffet Breakfast (CP)')
      setBookingStatus(existingVoucher.bookingStatus || 'Confirmed & Guaranteed')
      setPaymentStatus(existingVoucher.paymentStatus || 'Prepaid / Billed to Flying Wonders DMC')
      setAgentName(existingVoucher.agentName || '')
      setAgentEmail(existingVoucher.agentEmail || '')
      setAgentPhone(existingVoucher.agentPhone || '')
      setSpecialRequests(existingVoucher.specialRequests || '')
      if (Array.isArray(existingVoucher.rooms) && existingVoucher.rooms.length > 0) {
        setRooms(existingVoucher.rooms)
      }
    } else {
      // New Voucher Defaults
      const y = new Date().getFullYear()
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
      setDocId(undefined)
      setVoucherNumber(`FW-HTL-${y}-${rand}`)
      // Default dates 14 days from today
      const d1 = new Date()
      d1.setDate(d1.getDate() + 14)
      const d2 = new Date(d1)
      d2.setDate(d2.getDate() + 3)
      setCheckInDate(d1.toISOString().split('T')[0])
      setCheckOutDate(d2.toISOString().split('T')[0])
      setNights(3)
    }
  }, [existingVoucher, isOpen])

  if (!isOpen) return null

  // Auto calculate nights when dates change
  const handleDateChange = (type: 'in' | 'out', val: string) => {
    if (type === 'in') {
      setCheckInDate(val)
      if (val && checkOutDate) {
        const diff = Math.round((new Date(checkOutDate).getTime() - new Date(val).getTime()) / (1000 * 60 * 60 * 24))
        if (diff > 0) setNights(diff)
      }
    } else {
      setCheckOutDate(val)
      if (checkInDate && val) {
        const diff = Math.round((new Date(val).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))
        if (diff > 0) setNights(diff)
      }
    }
  }

  // Handle Partner Hotel Selection
  const handleSelectPartnerHotel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = POPULAR_PARTNER_HOTELS.find(h => h.name === e.target.value)
    if (selected) {
      setHotelName(selected.name)
      setHotelAddress(selected.address)
      setHotelPhone(selected.phone)
      setHotelEmail(selected.email)
      setStarRating(selected.starRating)
      setCheckInTime(selected.checkInTime)
      setCheckOutTime(selected.checkOutTime)
    }
  }

  // Import from Proposal
  const handleImportProposal = async () => {
    if (!proposalQuery.trim()) return
    setImportingProposal(true)
    try {
      const res = await fetch(`/api/proposals?number=${encodeURIComponent(proposalQuery.trim())}`)
      const data = await res.json()
      if (data.success && data.proposal) {
        const p = data.proposal
        setProposalNumber(p.proposalNumber)
        if (p.guestName && !groupName) setGroupName(`${p.guestName} Group Tour`)
        if (p.hotelName) {
          setHotelName(p.hotelName)
          const matched = POPULAR_PARTNER_HOTELS.find(h => h.name.toLowerCase().includes(p.hotelName.toLowerCase()))
          if (matched) {
            setHotelAddress(matched.address)
            setHotelPhone(matched.phone)
            setHotelEmail(matched.email)
            setStarRating(matched.starRating)
          }
        }
        if (p.arrivalDate) {
          setCheckInDate(p.arrivalDate)
          const n = Number(p.nights) || 3
          setNights(n)
          const d2 = new Date(p.arrivalDate)
          d2.setDate(d2.getDate() + n)
          setCheckOutDate(d2.toISOString().split('T')[0])
        }
        if (p.agent?.agentName) setAgentName(p.agent.agentName)
        if (p.agent?.email) setAgentEmail(p.agent.email)
        if (p.agent?.phone) setAgentPhone(p.agent.phone)

        // Pre-create room slots if roomCount is known
        const rCount = Number(p.roomCount) || 1
        const rType = p.roomType || 'Standard Room'
        const newRooms: HotelRoomAllocation[] = []
        for (let i = 1; i <= rCount; i++) {
          newRooms.push({
            roomNumber: i.toString().padStart(2, '0'),
            roomType: rType,
            bedding: 'Twin / King',
            guests: i === 1 && p.guestName ? [{ title: 'Mr', fullName: p.guestName, guestType: 'Adult' }] : [],
          })
        }
        if (newRooms.length > 0) setRooms(newRooms)
        alert(`Successfully imported details from proposal ${p.proposalNumber}!`)
      } else {
        alert(data.error || 'Proposal not found')
      }
    } catch (e: any) {
      alert(`Failed to import proposal: ${e.message}`)
    } finally {
      setImportingProposal(false)
    }
  }

  // Room Management
  const addRoom = () => {
    const nextNum = (rooms.length + 1).toString().padStart(2, '0')
    setRooms(prev => [
      ...prev,
      {
        roomNumber: nextNum,
        roomType: rooms[0]?.roomType || 'Deluxe Twin Room',
        bedding: 'Twin Beds',
        guests: [{ title: 'Mr', fullName: '', nationality: 'INDIAN', guestType: 'Adult' }],
      },
    ])
  }

  const removeRoom = (idx: number) => {
    setRooms(prev => prev.filter((_, i) => i !== idx))
  }

  const updateRoomField = (idx: number, field: keyof HotelRoomAllocation, val: any) => {
    setRooms(prev => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)))
  }

  // Guest Management
  const addGuestToRoom = (roomIdx: number) => {
    setRooms(prev =>
      prev.map((r, i) =>
        i === roomIdx
          ? {
              ...r,
              guests: [...(r.guests || []), { title: 'Mr', fullName: '', nationality: 'INDIAN', guestType: 'Adult' }],
            }
          : r
      )
    )
  }

  const removeGuestFromRoom = (roomIdx: number, guestIdx: number) => {
    setRooms(prev =>
      prev.map((r, i) =>
        i === roomIdx
          ? {
              ...r,
              guests: r.guests.filter((_, gi) => gi !== guestIdx),
            }
          : r
      )
    )
  }

  const updateGuestField = (roomIdx: number, guestIdx: number, field: keyof HotelGuest, val: any) => {
    setRooms(prev =>
      prev.map((r, i) =>
        i === roomIdx
          ? {
              ...r,
              guests: r.guests.map((g, gi) => (gi === guestIdx ? { ...g, [field]: val } : g)),
            }
          : r
      )
    )
  }

  // Download Sample Excel Template
  const downloadSampleExcel = () => {
    const sampleData = [
      ['Room #', 'Category', 'Bedding', 'Title', 'Full Name', 'Passport No', 'Nationality', 'Type'],
      ['01', 'Deluxe Twin', 'Twin Beds', 'Mr', 'Rajesh Kumar', 'M8492019', 'INDIAN', 'Adult'],
      ['01', 'Deluxe Twin', 'Twin Beds', 'Mrs', 'Sunita Kumar', 'M8492020', 'INDIAN', 'Adult'],
      ['02', 'Deluxe Twin', 'Twin Beds', 'Mr', 'Amitabh Sharma', 'N1928374', 'INDIAN', 'Adult'],
      ['02', 'Deluxe Twin', 'Twin Beds', 'Mr', 'Vikas Verma', 'P9283741', 'INDIAN', 'Adult'],
      ['03', 'Executive King', 'King Bed', 'Dr', 'Sanjay Patel', 'R7654321', 'INDIAN', 'Adult'],
    ]
    const ws = XLSX.utils.aoa_to_sheet(sampleData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Rooming_List')
    XLSX.writeFile(wb, 'Sample_Group_Rooming_List_Template.xlsx')
  }

  // Upload & Parse Excel / CSV Rooming List
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsName = wb.SheetNames[0]
        const ws = wb.Sheets[wsName]
        const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 })

        if (!rawRows || rawRows.length < 2) {
          alert('Uploaded file is empty or missing headers')
          return
        }

        // Header mapping
        const headers = rawRows[0].map((h: any) => (h || '').toString().toLowerCase().trim())
        const roomCol = headers.findIndex((h: string) => h.includes('room'))
        const catCol = headers.findIndex((h: string) => h.includes('cat') || h.includes('type'))
        const bedCol = headers.findIndex((h: string) => h.includes('bed'))
        const titleCol = headers.findIndex((h: string) => h.includes('title'))
        const nameCol = headers.findIndex((h: string) => h.includes('name') || h.includes('guest'))
        const passCol = headers.findIndex((h: string) => h.includes('pass') || h.includes('ppt'))
        const natCol = headers.findIndex((h: string) => h.includes('nat') || h.includes('country'))
        const typeCol = headers.findIndex((h: string) => h.includes('adult') || h.includes('type') || h.includes('pax'))

        const roomMap: Record<string, HotelRoomAllocation> = {}

        for (let i = 1; i < rawRows.length; i++) {
          const row = rawRows[i]
          if (!row || row.length === 0) continue

          const rNum = (row[roomCol] || `Room ${i}`).toString().trim()
          const rCat = catCol !== -1 && row[catCol] ? row[catCol].toString().trim() : 'Deluxe Twin Room'
          const rBed = bedCol !== -1 && row[bedCol] ? row[bedCol].toString().trim() : 'Twin Beds'

          const gTitle = titleCol !== -1 && row[titleCol] ? row[titleCol].toString().trim() : 'Mr'
          const gName = nameCol !== -1 && row[nameCol] ? row[nameCol].toString().trim() : ''
          const gPass = passCol !== -1 && row[passCol] ? row[passCol].toString().trim().toUpperCase() : ''
          const gNat = natCol !== -1 && row[natCol] ? row[natCol].toString().trim().toUpperCase() : 'INDIAN'
          const gType = typeCol !== -1 && row[typeCol] ? row[typeCol].toString().trim() : 'Adult'

          if (!roomMap[rNum]) {
            roomMap[rNum] = {
              roomNumber: rNum,
              roomType: rCat,
              bedding: rBed,
              guests: [],
            }
          }

          if (gName) {
            roomMap[rNum].guests.push({
              title: gTitle,
              fullName: gName,
              passportNumber: gPass,
              nationality: gNat,
              guestType: gType,
            })
          }
        }

        const parsedRooms = Object.values(roomMap)
        if (parsedRooms.length > 0) {
          setRooms(parsedRooms)
          alert(`Successfully imported ${parsedRooms.length} rooms from Excel / CSV!`)
        } else {
          alert('Could not find room or guest entries in the file.')
        }
      } catch (err: any) {
        alert(`Failed to parse file: ${err.message}`)
      }
    }
    reader.readAsBinaryString(file)
  }

  // Assemble Data Object
  const getPayload = (): HotelVoucherData => ({
    voucherNumber,
    groupName,
    hotelName,
    hotelAddress,
    hotelPhone,
    hotelEmail,
    starRating,
    hotelConfirmationNo,
    checkInDate,
    checkInTime,
    checkOutDate,
    checkOutTime,
    nights,
    mealPlan,
    bookingStatus,
    paymentStatus,
    rooms,
    specialRequests,
    proposalNumber,
    agentName,
    agentEmail,
    agentPhone,
  })

  // Save Voucher to API
  const handleSave = async () => {
    if (!hotelName.trim()) {
      alert('Please enter or select a Hotel Name')
      return
    }
    if (!checkInDate || !checkOutDate) {
      alert('Please specify Check-in and Check-out dates')
      return
    }

    setSaving(true)
    try {
      const payload: any = getPayload()
      if (docId) payload._id = docId

      const res = await fetch('/api/hotel-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        alert('Hotel Voucher saved successfully! 🟢')
        if (onSaved) onSaved()
        onClose()
      } else {
        alert(data.error || 'Failed to save voucher')
      }
    } catch (e: any) {
      alert(`Error saving voucher: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Copy WhatsApp Share
  const handleCopyWhatsApp = () => {
    const data = getPayload()
    const verifyUrl = `https://flyingwonders.net/verify-voucher?ref=${encodeURIComponent(data.voucherNumber)}`
    const text = `🏨 *OFFICIAL HOTEL CONFIRMATION VOUCHER*
*Ref:* ${data.voucherNumber}
*Hotel:* ${data.hotelName} (${data.starRating || '4-Star'})
*CRS Conf No:* ${data.hotelConfirmationNo || 'Confirmed'}
*Dates:* ${data.checkInDate} to ${data.checkOutDate} (${data.nights} Nights)
*Rooms:* ${data.rooms.length} Rooms | *Meals:* ${data.mealPlan}
*Status:* ${data.bookingStatus} (Prepaid by Flying Wonders DMC)

🔍 *Live Visa Verification Portal:*
${verifyUrl}

_Authorized by Flying Wonders Travel DMC Singapore (STB TA-03451)_`

    navigator.clipboard.writeText(text)
    alert('Pre-formatted WhatsApp confirmation message copied to clipboard! 📋')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10, 34, 64, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '1080px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        
        {/* Modal Header */}
        <div style={{ background: '#0A2240', color: '#FFFFFF', padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #C49C3C' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#C49C3C', color: '#0A2240', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              <ShieldCheck size={13} />
              <span>Embassy & Visa Ready</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700 }}>
              {docId ? 'Edit Group Hotel Confirmation Voucher' : 'Create Group Hotel Confirmation Voucher'}
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
              Voucher Reference: <strong style={{ color: '#FFFFFF' }}>{voucherNumber}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
              title="Close"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#F8FAFC' }}>
          
          {/* Quick Import from Proposal Banner */}
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={20} color="#2563EB" />
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#1E3A8A' }}>Import from Existing Proposal / Package Quote:</strong>
                <div style={{ fontSize: '0.78rem', color: '#3B82F6' }}>Auto-populate hotel, guest count, nights, and arrival dates directly from a Flying Wonders proposal.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="e.g. FW-2026-XXXX"
                value={proposalQuery}
                onChange={(e) => setProposalQuery(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #93C5FD', fontSize: '0.85rem', width: '160px', color: '#0F172A', background: '#FFFFFF' }}
              />
              <button
                type="button"
                onClick={handleImportProposal}
                disabled={importingProposal}
                style={{ padding: '0.45rem 1rem', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                {importingProposal ? 'Importing...' : 'Auto Fill'}
              </button>
            </div>
          </div>

          {/* Section 1: Group & Hotel Property Details */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#0A2240', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.4rem' }}>
              <Building2 size={16} color="#0A2240" /> Group & Property Credentials
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {/* Group Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Group / Delegation Name</label>
                <input
                  type="text"
                  placeholder="e.g. St. Joseph Educational Tour 2026"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                />
              </div>

              {/* Quick Partner Hotel Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Partner Hotel Quick Selector</label>
                <select
                  onChange={handleSelectPartnerHotel}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                >
                  <option value="">-- Choose Singapore Partner Hotel --</option>
                  {POPULAR_PARTNER_HOTELS.map(h => (
                    <option key={h.name} value={h.name}>{h.name} ({h.starRating})</option>
                  ))}
                </select>
              </div>

              {/* Hotel Name (Editable) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Hotel Name *</label>
                <input
                  type="text"
                  placeholder="e.g. V Hotel Lavender"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                />
              </div>

              {/* Star Rating */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Star Rating</label>
                <select
                  value={starRating}
                  onChange={(e) => setStarRating(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                >
                  <option value="3-Star">3-Star</option>
                  <option value="4-Star">4-Star</option>
                  <option value="5-Star">5-Star</option>
                  <option value="Boutique / Heritage">Boutique / Heritage</option>
                  <option value="Luxury Resort">Luxury Resort</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {/* Hotel Physical Address */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Hotel Physical Address (Essential for Visas) *</label>
                <input
                  type="text"
                  placeholder="Complete postal address with postal code & country"
                  value={hotelAddress}
                  onChange={(e) => setHotelAddress(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                />
              </div>

              {/* Hotel Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Hotel Telephone / Front Desk</label>
                <input
                  type="text"
                  placeholder="e.g. +65 6340 1188"
                  value={hotelPhone}
                  onChange={(e) => setHotelPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                />
              </div>

              {/* Hotel Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Hotel Reservation Email</label>
                <input
                  type="text"
                  placeholder="e.g. reservations@hotel.com"
                  value={hotelEmail}
                  onChange={(e) => setHotelEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                />
              </div>
            </div>

            {/* Hotel CRS Confirmation Number */}
            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#92400E', marginBottom: '4px' }}>
                  Hotel CRS / Reservation Confirmation PNR (Proof of Blocked Rooms for Visa Officers) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. IHG-9842109 or HTL-CONF-78210"
                  value={hotelConfirmationNo}
                  onChange={(e) => setHotelConfirmationNo(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #F59E0B', fontSize: '0.88rem', fontWeight: 700, color: '#78350F', background: '#FFFFFF' }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#78350F', maxWidth: '340px' }}>
                ⚠️ Embassies cross-reference this internal CRS number to guarantee rooms are actively blocked and non-speculative.
              </div>
            </div>

          </div>

          {/* Section 2: Dates, Durations, Status & Inclusions */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#0A2240', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.4rem' }}>
              <Calendar size={16} color="#0A2240" /> Stay Duration, Timings & Guarantee Policy
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Check-In Date *</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => handleDateChange('in', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Check-In Policy Time</label>
                <input
                  type="text"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Check-Out Date *</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => handleDateChange('out', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Check-Out Policy Time</label>
                <input
                  type="text"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Total Nights</label>
                <input
                  type="number"
                  min="1"
                  value={nights}
                  onChange={(e) => setNights(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Meal Plan / Basis</label>
                <select
                  value={mealPlan}
                  onChange={(e) => setMealPlan(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                >
                  <option value="Daily Buffet Breakfast (CP)">Daily Buffet Breakfast (CP)</option>
                  <option value="Room Only (EP)">Room Only (EP)</option>
                  <option value="Half Board - Breakfast & Dinner (MAP)">Half Board - Breakfast & Dinner (MAP)</option>
                  <option value="Full Board - All Meals (AP)">Full Board - All Meals (AP)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Booking Status</label>
                <select
                  value={bookingStatus}
                  onChange={(e) => setBookingStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                >
                  <option value="Confirmed & Guaranteed">🟢 Confirmed & Guaranteed</option>
                  <option value="Pending">🟡 Pending</option>
                  <option value="Cancelled">🔴 Cancelled</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Billing / Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', background: '#FFFFFF' }}
                >
                  <option value="Prepaid / Billed to Flying Wonders DMC">Prepaid / Billed to Flying Wonders DMC</option>
                  <option value="Prepaid by B2B Partner Agency">Prepaid by B2B Partner Agency</option>
                  <option value="Direct Guest Settlement">Direct Guest Settlement</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Rooming List & Occupants */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={18} color="#0A2240" />
                <h3 style={{ fontSize: '0.98rem', color: '#0A2240', margin: 0 }}>
                  Group Rooming List & Occupant Passports ({rooms.length} Rooms, {rooms.reduce((acc, r) => acc + (r.guests?.length || 0), 0)} Guests)
                </h3>
              </div>

              {/* Bulk Excel Tools */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={downloadSampleExcel}
                  style={{
                    padding: '0.4rem 0.75rem',
                    background: '#F1F5F9',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Download size={13} />
                  <span>Sample Excel Template</span>
                </button>

                <label
                  style={{
                    padding: '0.4rem 0.75rem',
                    background: '#DCFCE7',
                    color: '#166534',
                    border: '1px solid #BBF7D0',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Upload size={13} />
                  <span>Import Excel / CSV List</span>
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleExcelUpload} style={{ display: 'none' }} />
                </label>

                <button
                  type="button"
                  onClick={addRoom}
                  style={{
                    padding: '0.4rem 0.85rem',
                    background: '#0A2240',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Plus size={13} />
                  <span>Add Room</span>
                </button>
              </div>
            </div>

            {/* Room Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {rooms.map((room, rIdx) => (
                <div key={rIdx} style={{ background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '1rem' }}>
                  {/* Room Row Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, color: '#0A2240', fontSize: '0.9rem', background: '#E2E8F0', padding: '2px 8px', borderRadius: '4px' }}>
                        Room #{room.roomNumber}
                      </span>
                      <input
                        type="text"
                        placeholder="Category (e.g. Deluxe Twin)"
                        value={room.roomType}
                        onChange={(e) => updateRoomField(rIdx, 'roomType', e.target.value)}
                        style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', width: '170px' }}
                      />
                      <input
                        type="text"
                        placeholder="Bedding (e.g. Twin Beds)"
                        value={room.bedding || ''}
                        onChange={(e) => updateRoomField(rIdx, 'bedding', e.target.value)}
                        style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', width: '130px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => generateSingleRoomVisaPdf(getPayload(), rIdx)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          background: '#C49C3C',
                          color: '#0A2240',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Download size={11} />
                        <span>Room Visa PDF</span>
                      </button>
                      {rooms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoom(rIdx)}
                          style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}
                          title="Remove Room"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Guests Table inside Room */}
                  <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: '#E2E8F0', color: '#475569', textAlign: 'left' }}>
                          <th style={{ padding: '6px 8px', width: '70px' }}>Title</th>
                          <th style={{ padding: '6px 8px' }}>Full Name (As per Passport) *</th>
                          <th style={{ padding: '6px 8px', width: '140px' }}>Passport Number *</th>
                          <th style={{ padding: '6px 8px', width: '100px' }}>Nationality</th>
                          <th style={{ padding: '6px 8px', width: '90px' }}>Type</th>
                          <th style={{ padding: '6px 8px', width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {room.guests && room.guests.map((guest, gIdx) => (
                          <tr key={gIdx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                            <td style={{ padding: '4px 6px' }}>
                              <select
                                value={guest.title || 'Mr'}
                                onChange={(e) => updateGuestField(rIdx, gIdx, 'title', e.target.value)}
                                style={{ width: '100%', padding: '0.3rem 0.4rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                              >
                                <option value="Mr">Mr</option>
                                <option value="Mrs">Mrs</option>
                                <option value="Ms">Ms</option>
                                <option value="Master">Master</option>
                                <option value="Dr">Dr</option>
                              </select>
                            </td>
                            <td style={{ padding: '4px 6px' }}>
                              <input
                                type="text"
                                placeholder="Full Name"
                                value={guest.fullName}
                                onChange={(e) => updateGuestField(rIdx, gIdx, 'fullName', e.target.value)}
                                style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: 600 }}
                              />
                            </td>
                            <td style={{ padding: '4px 6px' }}>
                              <input
                                type="text"
                                placeholder="e.g. M8492019"
                                value={guest.passportNumber || ''}
                                onChange={(e) => updateGuestField(rIdx, gIdx, 'passportNumber', e.target.value.toUpperCase())}
                                style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700 }}
                              />
                            </td>
                            <td style={{ padding: '4px 6px' }}>
                              <input
                                type="text"
                                value={guest.nationality || 'INDIAN'}
                                onChange={(e) => updateGuestField(rIdx, gIdx, 'nationality', e.target.value.toUpperCase())}
                                style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                              />
                            </td>
                            <td style={{ padding: '4px 6px' }}>
                              <select
                                value={guest.guestType || 'Adult'}
                                onChange={(e) => updateGuestField(rIdx, gIdx, 'guestType', e.target.value)}
                                style={{ width: '100%', padding: '0.3rem 0.4rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                              >
                                <option value="Adult">Adult</option>
                                <option value="Child">Child</option>
                                <option value="Infant">Infant</option>
                              </select>
                            </td>
                            <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => removeGuestFromRoom(rIdx, gIdx)}
                                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                                title="Remove Occupant"
                              >
                                <X size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={() => addGuestToRoom(rIdx)}
                    style={{
                      padding: '0.25rem 0.65rem',
                      background: '#FFFFFF',
                      color: '#0A2240',
                      border: '1px dashed #94A3B8',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Plus size={11} />
                    <span>Add Room Occupant</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Remarks & Contact */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#0A2240', margin: '0 0 1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.4rem' }}>
              Special Requests & Tour Leader Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Tour Leader / B2B Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Contact Phone / WhatsApp</label>
                <input
                  type="text"
                  value={agentPhone}
                  onChange={(e) => setAgentPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  value={agentEmail}
                  onChange={(e) => setAgentEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Special Requests & Group Dietary Instructions</label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
              />
            </div>
          </div>

        </div>

        {/* Modal Sticky Footer Actions */}
        <div style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '1rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          
          {/* Quick PDF & Share Generators */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => generateMasterGroupVoucherPdf(getPayload())}
              style={{
                padding: '0.6rem 1rem',
                background: '#0A2240',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Download size={15} />
              <span>Master Group PDF</span>
            </button>

            <button
              type="button"
              onClick={() => generateAllVisaVouchersPdf(getPayload())}
              style={{
                padding: '0.6rem 1rem',
                background: '#C49C3C',
                color: '#0A2240',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Printer size={15} />
              <span>All Visa Vouchers Dossier</span>
            </button>

            <button
              type="button"
              onClick={handleCopyWhatsApp}
              style={{
                padding: '0.6rem 1rem',
                background: '#25D366',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Share2 size={15} />
              <span>Copy WhatsApp</span>
            </button>

            <a
              href={`/verify-voucher?ref=${encodeURIComponent(voucherNumber)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.6rem 0.85rem',
                background: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>Live Verify Link</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Save / Close */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.6rem 1.25rem', background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '0.6rem 1.75rem',
                background: '#166534',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>{saving ? 'Saving...' : 'Save & Publish Voucher'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
