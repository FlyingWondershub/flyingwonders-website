'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  Calendar,
  Users,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  Printer,
  Search,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Download
} from 'lucide-react'
import { generateMasterGroupVoucherPdf, generateAllVisaVouchersPdf, generateSingleRoomVisaPdf } from '../../utils/hotelVoucherPdf'

function VoucherVerifyContent() {
  const searchParams = useSearchParams()
  const initialRef = searchParams.get('ref') || ''

  const [inputRef, setInputRef] = useState(initialRef)
  const [activeRef, setActiveRef] = useState(initialRef)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationData, setVerificationData] = useState<any | null>(null)

  const verifyVoucher = async (refNumber: string) => {
    if (!refNumber.trim()) return
    setLoading(true)
    setError(null)
    setVerificationData(null)

    try {
      const res = await fetch(`/api/hotel-vouchers/verify?ref=${encodeURIComponent(refNumber.trim())}`)
      const data = await res.json()
      if (data.success && data.voucher) {
        setVerificationData(data)
      } else {
        setError(data.error || 'No matching confirmed accommodation voucher found for this reference.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to verification server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialRef) {
      verifyVoucher(initialRef)
    }
  }, [initialRef])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputRef.trim()) {
      setActiveRef(inputRef.trim())
      verifyVoucher(inputRef.trim())
    }
  }

  const v = verificationData?.voucher

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #F8FAFC)', color: 'var(--text-primary, #0F172A)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>
        
        {/* Top Header & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#DCFCE7', color: '#166534', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.85rem' }}>
            <ShieldCheck size={16} />
            <span>Official Embassy & Border Control Verification Gateway</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '2.1rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#0A2240' }}>
            Accommodation Voucher Verification
          </h1>
          <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0, fontFamily: 'var(--font-inter), sans-serif' }}>
            Flying Wonders Travel DMC · Singapore Tourism Board Licensed Operator (TA-03451)
          </p>
        </div>

        {/* Search / Input Box */}
        <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={inputRef}
                onChange={(e) => setInputRef(e.target.value)}
                placeholder="Enter Voucher Ref (e.g. FW-HTL-2026-XXXX)..."
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-inter), sans-serif',
                  color: '#0F172A',
                  background: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.75rem',
                background: '#0A2240',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-inter), sans-serif',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {loading ? 'Verifying...' : 'Verify Voucher'}
            </button>
          </form>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#0A2240', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '1rem', color: '#64748B', fontWeight: 600 }}>Authenticating voucher against DMC reservation records...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
            <AlertCircle size={36} color="#DC2626" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ color: '#991B1B', margin: '0 0 0.5rem', fontSize: '1.15rem' }}>Verification Notice</h3>
            <p style={{ color: '#7F1D1D', margin: 0, fontSize: '0.92rem' }}>{error}</p>
            <p style={{ color: '#991B1B', marginTop: '0.75rem', fontSize: '0.82rem' }}>
              Please check the voucher reference number or contact Flying Wonders DMC at <a href="mailto:info.flyingwonders@gmail.com" style={{ color: '#991B1B', fontWeight: 700 }}>info.flyingwonders@gmail.com</a>.
            </p>
          </div>
        )}

        {/* Verified Certificate Card */}
        {v && !loading && (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '2px solid #22C55E', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
            
            {/* Certificate Header Banner */}
            <div style={{ background: '#0A2240', color: '#FFFFFF', padding: '1.5rem', borderBottom: '3px solid #C49C3C' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#22C55E', color: '#FFFFFF', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    <CheckCircle2 size={14} />
                    <span>AUTHENTIC & VERIFIED RESERVATION</span>
                  </div>
                  <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.6rem', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                    {v.hotelName}
                  </h2>
                  <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                    Reference: <strong style={{ color: '#FFFFFF' }}>{v.voucherNumber}</strong>
                    {v.hotelConfirmationNo && (
                      <span style={{ marginLeft: '1rem', color: '#FBBF24' }}>
                        Hotel CRS: <strong>{v.hotelConfirmationNo}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* PDF Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => generateMasterGroupVoucherPdf(v)}
                    style={{
                      padding: '0.55rem 1rem',
                      background: '#C49C3C',
                      color: '#0A2240',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Download size={14} />
                    <span>Master PDF</span>
                  </button>
                  <button
                    onClick={() => generateAllVisaVouchersPdf(v)}
                    style={{
                      padding: '0.55rem 1rem',
                      background: '#FFFFFF',
                      color: '#0A2240',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Printer size={14} />
                    <span>Visa Dossier PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '1.5rem' }}>
              
              {/* Status Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700 }}>RESERVATION STATUS</div>
                  <div style={{ fontSize: '0.95rem', color: '#14532D', fontWeight: 800 }}>🟢 {v.bookingStatus || 'Confirmed & Guaranteed'}</div>
                </div>
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 700 }}>BILLING & PAYMENT STATUS</div>
                  <div style={{ fontSize: '0.95rem', color: '#78350F', fontWeight: 800 }}>💳 {v.paymentStatus || 'Prepaid / Billed to Flying Wonders DMC'}</div>
                </div>
              </div>

              {/* Grid: Hotel & Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                
                {/* Hotel Card */}
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.15rem', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ fontSize: '0.9rem', color: '#0A2240', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.4rem' }}>
                    <Building2 size={16} color="#0A2240" /> Hotel Property Information
                  </h3>
                  <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.4rem' }}>
                      <MapPin size={15} color="#64748B" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{v.hotelAddress || 'Verified Partner Accommodation'}</span>
                    </div>
                    {v.hotelPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                        <Phone size={14} color="#64748B" />
                        <span>{v.hotelPhone}</span>
                      </div>
                    )}
                    {v.hotelEmail && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                        <Mail size={14} color="#64748B" />
                        <span>{v.hotelEmail}</span>
                      </div>
                    )}
                    {v.starRating && (
                      <div style={{ marginTop: '0.5rem', display: 'inline-block', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {v.starRating} Rating
                      </div>
                    )}
                  </div>
                </div>

                {/* Stay Duration Card */}
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.15rem', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ fontSize: '0.9rem', color: '#0A2240', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.4rem' }}>
                    <Calendar size={16} color="#0A2240" /> Stay Duration & Meal Plan
                  </h3>
                  <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#334155' }}>
                    <div>
                      <strong>Check-In:</strong> {v.checkInDate} <span style={{ color: '#64748B' }}>({v.checkInTime || '15:00 hrs'})</span>
                    </div>
                    <div>
                      <strong>Check-Out:</strong> {v.checkOutDate} <span style={{ color: '#64748B' }}>({v.checkOutTime || '11:00 hrs'})</span>
                    </div>
                    <div>
                      <strong>Total Duration:</strong> {v.nights} Night(s)
                    </div>
                    <div>
                      <strong>Meal Basis:</strong> <span style={{ color: '#0A2240', fontWeight: 700 }}>{v.mealPlan || 'Daily Buffet Breakfast'}</span>
                    </div>
                    {v.groupName && (
                      <div style={{ marginTop: '0.4rem' }}>
                        <strong>Group:</strong> {v.groupName}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rooming & Visa Applicants Table */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', color: '#0A2240', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} color="#0A2240" /> Confirmed Room Allocations & Visa Applicants ({v.rooms?.length || 0} Rooms)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {v.rooms && v.rooms.map((room: any, rIdx: number) => (
                    <div key={rIdx} style={{ background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div>
                          <span style={{ fontWeight: 800, color: '#0A2240', fontSize: '0.95rem' }}>
                            Room #{room.roomNumber || (rIdx + 1).toString().padStart(2, '0')}
                          </span>
                          <span style={{ color: '#64748B', fontSize: '0.82rem', marginLeft: '0.75rem' }}>
                            {room.roomType || 'Standard Room'} {room.bedding ? `• ${room.bedding}` : ''}
                          </span>
                        </div>
                        <button
                          onClick={() => generateSingleRoomVisaPdf(v, rIdx)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            background: '#0A2240',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Download size={12} />
                          <span>Room Visa PDF</span>
                        </button>
                      </div>

                      {/* Guest Roster in this room */}
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                          <thead>
                            <tr style={{ background: '#E2E8F0', color: '#334155', textAlign: 'left' }}>
                              <th style={{ padding: '6px 8px', borderRadius: '4px 0 0 4px' }}>Applicant Full Name</th>
                              <th style={{ padding: '6px 8px' }}>Passport Number</th>
                              <th style={{ padding: '6px 8px' }}>Nationality</th>
                              <th style={{ padding: '6px 8px', borderRadius: '0 4px 4px 0' }}>Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {room.guests && room.guests.map((g: any, gIdx: number) => (
                              <tr key={gIdx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                <td style={{ padding: '6px 8px', fontWeight: 700, color: '#0F172A' }}>
                                  {g.title ? `${g.title} ` : ''}{g.fullName}
                                </td>
                                <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#0A2240', fontWeight: 700 }}>
                                  {g.passportNumber || 'N/A'}
                                </td>
                                <td style={{ padding: '6px 8px', color: '#475569' }}>
                                  {g.nationality || 'INDIAN'}
                                </td>
                                <td style={{ padding: '6px 8px', color: '#475569' }}>
                                  {g.guestType || 'Adult'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formal Declaration Notice */}
              <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '10px', padding: '1rem', color: '#78350F', fontSize: '0.82rem', lineHeight: '1.5' }}>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Formal Certification for Visa Authorities & Border Officials:</strong>
                Flying Wonders Pte Ltd confirms that all room accommodation listed on this voucher is confirmed and prepaid under our approved tour operator credit line. No further accommodation payment is required from the guests at check-in. For consular verification inquiries, contact our operations desk at <a href="mailto:info.flyingwonders@gmail.com" style={{ color: '#78350F', fontWeight: 800 }}>info.flyingwonders@gmail.com</a>.
              </div>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94A3B8', fontSize: '0.75rem' }}>
                Verified digitally on {new Date().toUTCString()} · Flying Wonders Travel Portal
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default function VerifyVoucherPage() {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center' }}>Loading verification gateway...</div>}>
      <VoucherVerifyContent />
    </Suspense>
  )
}
