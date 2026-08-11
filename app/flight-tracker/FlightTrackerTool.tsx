'use client'

import { useState } from 'react'
import { Plane, Search, Loader2, AlertTriangle } from 'lucide-react'

export default function FlightTrackerTool() {
  const [flightNumber, setFlightNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!flightNumber.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch(`/api/flights?flight=${encodeURIComponent(flightNumber.trim().toUpperCase())}`)
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Flight not found.')
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Error fetching flight data.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusStyle = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s.includes('land') || s.includes('arriv') || s.includes('on time')) return { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' }
    if (s.includes('delay')) return { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' }
    if (s.includes('cancel')) return { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' }
    return { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' }
  }

  return (
    <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(135deg, #1A365D 0%, #0F4C3A 100%)', padding: '1.5rem 2rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Plane size={22} color="#D4AF37" />
        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Live Flight Status Tracker</span>
        <span style={{ marginLeft: 'auto', background: 'rgba(212,175,55,0.2)', color: '#D4AF37', fontSize: '0.7rem', fontWeight: 800, padding: '2px 10px', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.4)' }}>LIVE ⚡</span>
      </div>

      <div style={{ padding: '1.75rem 2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 260px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Flight Number</label>
            <input type="text" required placeholder="e.g. SQ405, AI381, 6E16" value={flightNumber}
              onChange={e => setFlightNumber(e.target.value.toUpperCase())}
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ flex: '0 0 auto', padding: '0.85rem 2rem', background: loading ? '#94A3B8' : 'linear-gradient(135deg, #0F4C3A, #059669)', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', boxShadow: loading ? 'none' : '0 4px 12px rgba(5,150,105,0.3)' }}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Searching...</> : <><Search size={16} /> Track Flight</>}
          </button>
        </form>
        <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.75rem' }}>Try: SQ405 (SIN↔DEL) · SQ506 (SIN↔BLR) · AI381 (DEL↔SIN) · 6E16 (BOM↔SIN)</p>

        {error && (
          <div style={{ marginTop: '1.5rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '1rem 1.25rem', color: '#B91C1C', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        {result && (() => {
          const flight = result.data?.[0] || result
          const statusStyle = getStatusStyle(flight.flight_status || '')
          return (
            <div style={{ marginTop: '1.5rem', background: statusStyle.bg, border: `1px solid ${statusStyle.border}`, borderRadius: '14px', padding: '1.5rem 1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#0F172A' }}>{flight.flight?.iata || flightNumber}</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>{flight.airline?.name || 'Airline'}</div>
                </div>
                <span style={{ padding: '0.4rem 1.1rem', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem', color: statusStyle.color, border: `1px solid ${statusStyle.border}`, background: '#FFF' }}>
                  {flight.flight_status || 'Status Unknown'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Departure</div>
                  <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#0F172A' }}>{flight.departure?.iata || '—'}</div>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>{flight.departure?.airport || ''}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.3rem' }}>
                    {flight.departure?.scheduled ? new Date(flight.departure.scheduled).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '1.5rem' }}>✈️</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Arrival</div>
                  <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#0F172A' }}>{flight.arrival?.iata || '—'}</div>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>{flight.arrival?.airport || ''}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.3rem' }}>
                    {flight.arrival?.scheduled ? new Date(flight.arrival.scheduled).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
