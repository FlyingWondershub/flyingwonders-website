'use client'

import React, { useRef } from 'react'
import type { TravelPackage, ItineraryActivity } from '../utils/packages'

interface TripScheduleMatrixProps {
  pkg: TravelPackage
}

type TimeSlot = 'morning' | 'afternoon' | 'evening'

interface CategorizedItem {
  type: 'activity' | 'meal' | 'stay' | 'checkout' | 'checkin'
  time?: string
  text: string
}

// Helper to determine time slot safely
function getTimeSlot(timeStr?: string): TimeSlot {
  if (!timeStr || typeof timeStr !== 'string') return 'morning'
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i)
  if (!match) return 'morning'

  let hour = parseInt(match[1], 10)
  const ampm = match[3]?.toLowerCase()

  if (ampm === 'pm' && hour < 12) hour += 12
  if (ampm === 'am' && hour === 12) hour = 0

  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

// Categorize activity by description keywords safely
function categorizeActivity(activity: ItineraryActivity): CategorizedItem {
  const desc = activity?.desc || ''
  const time = activity?.time || ''
  const lower = desc.toLowerCase()

  if (lower.includes('check-out') || lower.includes('checkout') || lower.includes('drop to airport') || lower.includes('departure')) {
    return { type: 'checkout', time, text: desc }
  }
  if (lower.includes('check-in') || lower.includes('check in') || lower.includes('hotel check-in')) {
    return { type: 'checkin', time, text: desc }
  }
  if (lower.includes('breakfast') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('restaurant')) {
    return { type: 'meal', time, text: desc }
  }
  if (lower.includes('stay') || lower.includes('overnight')) {
    return { type: 'stay', time, text: desc }
  }

  return { type: 'activity', time, text: desc }
}

export default function TripScheduleMatrix({ pkg }: TripScheduleMatrixProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handleDownload = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const days = pkg?.itinerary || []
  if (days.length === 0) return null

  const destination = pkg.destination || 'Singapore'

  const timeSlots: { key: TimeSlot; label: string; range: string; icon: string }[] = [
    { key: 'morning', label: 'Morning', range: '6 AM – 12 PM', icon: '🌅' },
    { key: 'afternoon', label: 'Afternoon', range: '12 – 5 PM', icon: '☀️' },
    { key: 'evening', label: 'Evening', range: '5 – 10 PM', icon: '🌙' },
  ]

  return (
    <section id="trip-schedule-section" style={{ margin: '3.5rem 0' }}>
      {/* ── Section Top Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '4px', height: '36px', background: '#3B82F6', borderRadius: '4px', marginTop: '4px' }} />
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(1.4rem, 3vw, 1.85rem)',
                fontWeight: 700,
                color: 'var(--text-dark)',
                margin: 0
              }}
            >
              Trip schedule
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontSize: '0.9rem',
                color: 'var(--text-muted, #64748B)',
                margin: '2px 0 0 0'
              }}
            >
              At-a-glance view of your entire trip
            </p>
          </div>
        </div>

        {/* Download Schedule Button */}
        <button
          type="button"
          onClick={handleDownload}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid var(--glass-border, #CBD5E1)',
            background: 'var(--bg-secondary, #F8FAFC)',
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF / Print
        </button>
      </div>

      {/* ── Schedule Matrix Table Container ── */}
      <div
        ref={printRef}
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid var(--glass-border, #E2E8F0)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          background: 'var(--bg-secondary, #FFFFFF)'
        }}
      >
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table
            style={{
              width: '100%',
              minWidth: `${Math.max(680, 160 + days.length * 210)}px`,
              borderCollapse: 'separate',
              borderSpacing: 0,
              fontFamily: 'var(--font-inter), system-ui, sans-serif'
            }}
          >
            {/* ── Header Row (Royal Blue) ── */}
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFFFFF' }}>
                <th
                  style={{
                    width: '140px',
                    padding: '1.1rem 1rem',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    borderRight: '1px solid rgba(255, 255, 255, 0.15)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  TIME
                </th>
                {days.map((dayObj) => (
                  <th
                    key={dayObj.day}
                    style={{
                      padding: '1.1rem 1.25rem',
                      textAlign: 'center',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      borderRight: '1px solid rgba(255, 255, 255, 0.15)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <div>Day {dayObj.day}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.85, marginTop: '2px' }}>
                      {destination}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* ── Table Body ── */}
            <tbody>
              {timeSlots.map((slot, sIdx) => (
                <tr
                  key={slot.key}
                  style={{
                    borderBottom: sIdx < timeSlots.length - 1 ? '1px solid var(--glass-border, #E2E8F0)' : 'none'
                  }}
                >
                  {/* Time Slot Label Column */}
                  <td
                    style={{
                      padding: '1.25rem 0.75rem',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      background: 'var(--bg-main, #F8FAFC)',
                      borderRight: '1px solid var(--glass-border, #E2E8F0)',
                      borderBottom: '1px solid var(--glass-border, #E2E8F0)'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{slot.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-dark)' }}>
                      {slot.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748B)', marginTop: '2px', fontWeight: 600 }}>
                      {slot.range}
                    </div>
                  </td>

                  {/* Day Columns */}
                  {days.map((dayObj) => {
                    const slotActivities = (dayObj?.activities || [])
                      .filter((act) => getTimeSlot(act?.time) === slot.key)
                      .map(categorizeActivity)

                    if (slot.key === 'evening' && dayObj.day < days.length && pkg.hotelOptions) {
                      const hasStay = slotActivities.some(a => a.type === 'stay')
                      if (!hasStay) {
                        const hotelName = typeof pkg.hotelOptions === 'string' 
                          ? (pkg.hotelOptions.split('/')[1]?.trim() || pkg.hotelOptions.trim())
                          : 'Verified 3* / 4* Hotel'
                        slotActivities.push({
                          type: 'stay',
                          text: `STAY: ${hotelName}`
                        })
                      }
                    }

                    return (
                      <td
                        key={dayObj.day}
                        style={{
                          padding: '1rem',
                          verticalAlign: 'top',
                          borderRight: '1px solid var(--glass-border, #E2E8F0)',
                          borderBottom: '1px solid var(--glass-border, #E2E8F0)',
                          background: 'var(--bg-secondary, #FFFFFF)'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {slotActivities.length === 0 ? (
                            <span style={{ color: 'var(--text-muted, #94A3B8)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                              Free leisure time
                            </span>
                          ) : (
                            slotActivities.map((item, idx) => {
                              if (item.type === 'meal') {
                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      padding: '7px 10px',
                                      borderRadius: '8px',
                                      background: '#DCFCE7',
                                      border: '1px solid #86EFAC',
                                      color: '#14532D',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    <span>🍴</span>
                                    <span>{item.text}</span>
                                  </div>
                                )
                              }

                              if (item.type === 'stay' || item.type === 'checkin') {
                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      padding: '7px 10px',
                                      borderRadius: '8px',
                                      background: '#EEF2FF',
                                      border: '1px solid #C7D2FE',
                                      color: '#312E81',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '2px'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span>🏨</span>
                                      <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                                        {item.type === 'checkin' ? 'Check-in' : 'Stay'}
                                      </span>
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: '0.75rem', opacity: 0.9 }}>
                                      {item.text.replace(/hotel check-in/i, '').replace(/stay:/i, '').trim() || item.text}
                                    </div>
                                  </div>
                                )
                              }

                              if (item.type === 'checkout') {
                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      padding: '7px 10px',
                                      borderRadius: '8px',
                                      background: '#FFE4E6',
                                      border: '1px solid #FECDD3',
                                      color: '#9F1239',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    <span>🚪</span>
                                    <span>{item.text}</span>
                                  </div>
                                )
                              }

                              return (
                                <div
                                  key={idx}
                                  style={{
                                    padding: '8px 10px',
                                    borderRadius: '8px',
                                    background: '#FEF9C3',
                                    border: '1px solid #FDE047',
                                    color: '#713F12',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    lineHeight: 1.35,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '6px'
                                  }}
                                >
                                  <span style={{ fontSize: '0.85rem' }}>📍</span>
                                  <div>
                                    {item.time && (
                                      <div style={{ fontSize: '0.68rem', color: '#854D0E', fontWeight: 800, marginBottom: '2px' }}>
                                        {item.time}
                                      </div>
                                    )}
                                    <span>{item.text}</span>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #trip-schedule-section, #trip-schedule-section * {
            visibility: visible;
          }
          #trip-schedule-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          #trip-schedule-section button {
            display: none !important;
          }
        }
      `}</style>
    </section>
  )
}
