'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Car, AlertTriangle } from 'lucide-react'

interface CheckpointData {
  name: string
  direction: string
  congestion: string
  waitTime?: string
  lastUpdated?: string
  cameraUrl?: string
}

export default function BorderTrafficTool() {
  const [checkpoints, setCheckpoints] = useState<CheckpointData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string>('')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/border-traffic')
      if (!res.ok) throw new Error('Failed to fetch border traffic data.')
      const data = await res.json()
      setCheckpoints(data.checkpoints || data || [])
      setLastRefresh(new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }))
    } catch (err: any) {
      setError(err.message || 'Unable to load live border data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const getCongestionStyle = (level: string) => {
    const l = (level || '').toLowerCase()
    if (l.includes('light') || l.includes('clear') || l.includes('low')) return { bg: '#F0FDF4', border: '#BBF7D0', color: '#16A34A', label: '🟢 Light' }
    if (l.includes('moderate') || l.includes('medium')) return { bg: '#FFFBEB', border: '#FCD34D', color: '#D97706', label: '🟡 Moderate' }
    if (l.includes('heavy') || l.includes('high') || l.includes('severe')) return { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', label: '🔴 Heavy' }
    return { bg: '#F8FAFC', border: '#E2E8F0', color: '#475569', label: level || 'Unknown' }
  }

  return (
    <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(135deg, #1A365D 0%, #0F4C3A 100%)', padding: '1.25rem 2rem', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Car size={20} color="#D4AF37" />
          <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>JB–Singapore Border Traffic</span>
          <span style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', fontSize: '0.7rem', fontWeight: 800, padding: '2px 10px', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.4)' }}>LIVE ⚡</span>
        </div>
        <button onClick={fetchData} disabled={loading} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#FFF', borderRadius: '6px', padding: '0.35rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      <div style={{ padding: '1.75rem 2rem' }}>
        {lastRefresh && <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '1.25rem' }}>Last updated: {lastRefresh} SGT</p>}

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem', display: 'block' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Fetching live border data...</p>
          </div>
        )}

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '1rem 1.25rem', color: '#B91C1C', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        {!loading && !error && checkpoints.length === 0 && (
          <p style={{ color: '#64748B', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>No live checkpoint data available right now. Please try again.</p>
        )}

        {!loading && checkpoints.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {checkpoints.map((cp, i) => {
              const style = getCongestionStyle(cp.congestion)
              return (
                <div key={i} style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#1A365D', fontSize: '1rem' }}>{cp.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>{cp.direction}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: style.color }}>{style.label}</div>
                      {cp.waitTime && <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>Wait: ~{cp.waitTime}</div>}
                    </div>
                  </div>
                  {cp.cameraUrl && (
                    <a href={cp.cameraUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.78rem', color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                      📷 View Live Camera →
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '1rem' }}>
          ⚠️ Data is indicative. Actual wait times may vary. Always check official sources before travel.
        </p>
      </div>
    </div>
  )
}
