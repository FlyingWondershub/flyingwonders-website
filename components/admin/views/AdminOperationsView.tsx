'use client'

import React, { useState } from 'react'
import {
  Building2,
  Calendar,
  Search,
  RefreshCw,
  Plus,
  Download,
  Printer,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertTriangle,
  MessageSquare
} from 'lucide-react'
import {
  generateMasterGroupVoucherPdf,
  generateAllVisaVouchersPdf,
  generateSingleRoomVisaPdf
} from '../../../utils/hotelVoucherPdf'

interface AdminOperationsViewProps {
  hotelVouchers: any[]
  loadingVouchers: boolean
  fetchHotelVouchers: () => Promise<void>
  onEditVoucher: (voucher: any) => void
  onCreateVoucher: () => void
  consultingBookings: any[]
  loadingConsulting: boolean
  fetchConsultingBookings: () => Promise<void>
  subTab: string
  onSelectSubTab: (subTabId: string) => void
}

export default function AdminOperationsView({
  hotelVouchers,
  loadingVouchers,
  fetchHotelVouchers,
  onEditVoucher,
  onCreateVoucher,
  consultingBookings,
  loadingConsulting,
  fetchConsultingBookings,
  subTab,
  onSelectSubTab
}: AdminOperationsViewProps) {
  const [voucherSearch, setVoucherSearch] = useState('')
  const [voucherFilter, setVoucherFilter] = useState('all')

  // Total calculations for hotel vouchers
  const totalRooms = hotelVouchers.reduce((sum, v) => sum + (v.rooms?.length || 0), 0)
  const totalPassports = hotelVouchers.reduce(
    (sum, v) =>
      sum + (v.rooms || []).reduce((acc: number, r: any) => acc + (r.guests?.length || 0), 0),
    0
  )
  const confirmedVouchers = hotelVouchers.filter(
    v => v.bookingStatus === 'Confirmed & Guaranteed'
  ).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      
      {/* ── SUB-TAB 1: HOTEL VOUCHERS (VISA-READY) ── */}
      {subTab === 'vouchers' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          {/* Header & Quick stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0A2240', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>
                Group Hotel Confirmation Vouchers (Visa-Ready)
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.84rem', margin: '0.25rem 0 0 0' }}>
                Generate official Embassy & Consulate visa vouchers with guest passport mapping, hotel CRS codes, and live QR verification.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={fetchHotelVouchers}
                disabled={loadingVouchers}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.5rem 0.85rem',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={13} className={loadingVouchers ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>

              <button
                onClick={onCreateVoucher}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.15rem',
                  background: '#0A2240',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '7px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(10, 34, 64, 0.2)'
                }}
              >
                <Plus size={15} />
                <span>+ Create Group Voucher</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Issued Vouchers
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A2240', marginTop: '0.2rem' }}>
                {hotelVouchers.length}
              </div>
            </div>

            <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                Confirmed & Guaranteed
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#14532D', marginTop: '0.2rem' }}>
                {confirmedVouchers}
              </div>
            </div>

            <div style={{ background: '#EFF6FF', padding: '1rem', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '0.72rem', color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase' }}>
                Rooms Under Voucher
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E3A8A', marginTop: '0.2rem' }}>
                {totalRooms}
              </div>
            </div>

            <div style={{ background: '#FFFBEB', padding: '1rem', borderRadius: '10px', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>
                Guest Passports Mapped
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#78350F', marginTop: '0.2rem' }}>
                {totalPassports}
              </div>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
              <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by Voucher Ref, Hotel, Group Name, CRS..."
                value={voucherSearch}
                onChange={e => setVoucherSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.82rem',
                  color: '#0F172A',
                  background: '#FFF'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['all', 'Confirmed & Guaranteed', 'Pending'].map(st => (
                <button
                  key={st}
                  onClick={() => setVoucherFilter(st)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: voucherFilter === st ? '#0A2240' : '#CBD5E1',
                    background: voucherFilter === st ? '#0A2240' : '#FFF',
                    color: voucherFilter === st ? '#FFF' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {st === 'all' ? 'All Status' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loadingVouchers ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748B' }}>
              <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 0.5rem' }} />
              <div>Loading hotel vouchers...</div>
            </div>
          ) : hotelVouchers.length === 0 ? (
            <div style={{ background: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: '12px', padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <Building2 size={40} color="#94A3B8" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ color: '#334155', margin: '0 0 0.4rem', fontSize: '1.1rem' }}>No Group Hotel Vouchers Created Yet</h3>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
                Generate Embassy-compliant vouchers with rooming lists, CRS codes, and verification QR links.
              </p>
              <button
                onClick={onCreateVoucher}
                style={{
                  padding: '0.6rem 1.5rem',
                  background: '#0A2240',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Create First Group Hotel Voucher
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', color: '#475569', borderBottom: '2px solid #E2E8F0', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem' }}>Voucher Ref</th>
                    <th style={{ padding: '0.75rem' }}>Group / Delegation</th>
                    <th style={{ padding: '0.75rem' }}>Hotel & Property</th>
                    <th style={{ padding: '0.75rem' }}>Dates & Nights</th>
                    <th style={{ padding: '0.75rem' }}>Rooms & Pax</th>
                    <th style={{ padding: '0.75rem' }}>CRS Conf No</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hotelVouchers
                    .filter(v => {
                      const matchesF = voucherFilter === 'all' || v.bookingStatus === voucherFilter
                      const s = voucherSearch.toLowerCase().trim()
                      const matchesS =
                        !s ||
                        (v.voucherNumber && v.voucherNumber.toLowerCase().includes(s)) ||
                        (v.hotelName && v.hotelName.toLowerCase().includes(s)) ||
                        (v.groupName && v.groupName.toLowerCase().includes(s)) ||
                        (v.hotelConfirmationNo && v.hotelConfirmationNo.toLowerCase().includes(s))
                      return matchesF && matchesS
                    })
                    .map((v: any) => {
                      const totalGuests = (v.rooms || []).reduce(
                        (acc: number, r: any) => acc + (r.guests?.length || 0),
                        0
                      )

                      return (
                        <tr key={v._id || v.voucherNumber} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 800, color: '#0A2240' }}>
                            <div>{v.voucherNumber}</div>
                            {v.proposalNumber && (
                              <div style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600 }}>
                                Ref: {v.proposalNumber}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', color: '#1E293B', fontWeight: 600 }}>
                            {v.groupName || 'Tour Group'}
                          </td>
                          <td style={{ padding: '0.75rem', color: '#0F172A' }}>
                            <div style={{ fontWeight: 700 }}>{v.hotelName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                              {v.starRating || '4-Star'} • {v.mealPlan || 'Breakfast'}
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', color: '#334155' }}>
                            <div>{v.checkInDate} → {v.checkOutDate}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{v.nights} Nights</div>
                          </td>
                          <td style={{ padding: '0.75rem', color: '#0F172A' }}>
                            <strong>{v.rooms?.length || 0} Rooms</strong>
                            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{totalGuests} Guests</div>
                          </td>
                          <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#B45309', fontWeight: 700 }}>
                            {v.hotelConfirmationNo || 'TBD'}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: v.bookingStatus === 'Confirmed & Guaranteed' ? '#DCFCE7' : '#FEF3C7',
                                color: v.bookingStatus === 'Confirmed & Guaranteed' ? '#166534' : '#92400E'
                              }}
                            >
                              {v.bookingStatus || 'Confirmed'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                              <button
                                onClick={() => onEditVoucher(v)}
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  background: '#F1F5F9',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  color: '#334155',
                                  cursor: 'pointer'
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => generateMasterGroupVoucherPdf(v)}
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  background: '#0A2240',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  color: '#FFF',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem'
                                }}
                                title="Download Master Group PDF"
                              >
                                <Download size={11} />
                                <span>Master</span>
                              </button>
                              <button
                                onClick={() => generateAllVisaVouchersPdf(v)}
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  background: '#C49C3C',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  color: '#0A2240',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem'
                                }}
                                title="Download All Visa Dossier PDFs"
                              >
                                <Printer size={11} />
                                <span>Visa Dossier</span>
                              </button>
                              <a
                                href={`/verify-voucher?ref=${encodeURIComponent(v.voucherNumber)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  padding: '0.3rem 0.5rem',
                                  background: '#E2E8F0',
                                  borderRadius: '6px',
                                  color: '#0A2240',
                                  display: 'inline-flex',
                                  alignItems: 'center'
                                }}
                                title="Open Live Verification Gateway"
                              >
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 2: TRAVEL CONSULTING LEADS ── */}
      {subTab === 'consulting' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Travel Consulting Inquiries & Leads
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                Inbound itinerary planning requests captured from the public /travel-consulting booking engine.
              </p>
            </div>

            <button
              onClick={fetchConsultingBookings}
              disabled={loadingConsulting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#166534',
                borderRadius: '7px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} className={loadingConsulting ? 'animate-spin' : ''} />
              <span>Refresh Inquiries</span>
            </button>
          </div>

          {loadingConsulting ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
              <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto 0.5rem' }} />
              <div>Fetching consulting inquiries...</div>
            </div>
          ) : consultingBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94A3B8' }}>
              <Calendar size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
              <h3 style={{ color: '#334155', margin: '0 0 0.35rem', fontSize: '1.05rem' }}>No Consulting Leads Yet</h3>
              <p style={{ fontSize: '0.84rem', margin: 0 }}>Inquiries booked via /travel-consulting will appear here automatically.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem' }}>Booking ID / Client</th>
                    <th style={{ padding: '0.75rem' }}>Consulting Package</th>
                    <th style={{ padding: '0.75rem' }}>Requested Slot</th>
                    <th style={{ padding: '0.75rem' }}>Assigned Specialist</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Direct Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {consultingBookings.map(b => (
                    <tr key={b._id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <strong style={{ display: 'block', color: '#0F172A', fontSize: '0.85rem' }}>
                          {b.bookingId || b._id.slice(0, 8)}
                        </strong>
                        <span style={{ color: '#334155', fontWeight: 600 }}>{b.clientName}</span>{' '}
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>({b.userRole || 'Traveler'})</span>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{b.clientEmail}</div>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <strong style={{ display: 'block', color: '#0F4C3A' }}>{b.packageTitle}</strong>
                        <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>{b.packagePrice}</span>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span style={{ fontWeight: 700, color: '#334155' }}>{b.preferredDate || 'Date TBD'}</span>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{b.preferredTimeWindow}</div>
                        <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>
                          🌐 {b.preferredLanguage || 'English'}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {b.assignedConsultant ? (
                          <span style={{ fontWeight: 700, color: '#0F4C3A' }}>👤 {b.assignedConsultant.name}</span>
                        ) : (
                          <span style={{ color: '#D97706', fontSize: '0.75rem', fontWeight: 700 }}>
                            ⚠️ Unassigned
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background:
                              b.status === 'completed' || b.status === 'fee_credited'
                                ? '#ECFDF5'
                                : b.status === 'assigned'
                                ? '#EFF6FF'
                                : '#FEF3C7',
                            color:
                              b.status === 'completed' || b.status === 'fee_credited'
                                ? '#047857'
                                : b.status === 'assigned'
                                ? '#1D4ED8'
                                : '#B45309'
                          }}
                        >
                          {b.status === 'assigned'
                            ? '✅ Assigned'
                            : b.status === 'completed'
                            ? '🎉 Completed'
                            : b.status === 'fee_credited'
                            ? '🏷️ Fee Credited'
                            : '⏳ Pending'}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        {b.clientPhone && (
                          <a
                            href={`https://wa.me/${b.clientPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.35rem 0.7rem',
                              background: '#25D366',
                              color: '#FFFFFF',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '0.76rem',
                              fontWeight: 700
                            }}
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
