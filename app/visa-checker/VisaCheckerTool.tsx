'use client'

import { useState } from 'react'
import { Search, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function VisaCheckerTool() {
  const [visaPassport, setVisaPassport] = useState('')
  const [visaDestination, setVisaDestination] = useState('')
  const [visaLoading, setVisaLoading] = useState(false)
  const [visaResult, setVisaResult] = useState<any>(null)
  const [visaError, setVisaError] = useState<string | null>(null)

  const handleVisaCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!visaPassport || !visaDestination) return
    setVisaLoading(true)
    setVisaResult(null)
    setVisaError(null)
    try {
      const res = await fetch('/api/visa-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passport: visaPassport, destination: visaDestination })
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Failed to fetch visa data.')
      setVisaResult(json.data)
    } catch (err: any) {
      setVisaError(err.message || 'Error checking visa requirements.')
    } finally {
      setVisaLoading(false)
    }
  }

  return (
    <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(135deg, #1A365D 0%, #0F4C3A 100%)', padding: '1.5rem 2rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ShieldCheck size={22} color="#D4AF37" />
        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Check Visa Requirements</span>
        <span style={{ marginLeft: 'auto', background: 'rgba(212,175,55,0.2)', color: '#D4AF37', fontSize: '0.7rem', fontWeight: 800, padding: '2px 10px', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.4)' }}>LIVE ⚡</span>
      </div>

      <div style={{ padding: '1.75rem 2rem' }}>
        <form onSubmit={handleVisaCheck} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Passport (ISO code)</label>
            <input type="text" required maxLength={2} placeholder="e.g. IN, SG, US" value={visaPassport}
              onChange={e => setVisaPassport(e.target.value.toUpperCase())}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Destination (ISO code)</label>
            <input type="text" required maxLength={2} placeholder="e.g. SG, JP, AE" value={visaDestination}
              onChange={e => setVisaDestination(e.target.value.toUpperCase())}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={visaLoading}
            style={{ flex: '0 0 auto', padding: '0.75rem 2rem', background: visaLoading ? '#94A3B8' : 'linear-gradient(135deg, #0F4C3A 0%, #059669 100%)', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.95rem', cursor: visaLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', boxShadow: visaLoading ? 'none' : '0 4px 12px rgba(5,150,105,0.3)' }}>
            {visaLoading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Checking...</> : <><Search size={16} /> Check Visa</>}
          </button>
        </form>

        <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.75rem' }}>
          ISO codes: IN = India · SG = Singapore · MY = Malaysia · JP = Japan · AE = UAE · TH = Thailand · US = USA · GB = UK
        </p>

        {visaError && (
          <div style={{ marginTop: '1.5rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '1rem 1.25rem', color: '#B91C1C', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle size={18} /> {visaError}
          </div>
        )}

        {visaResult && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '1.5rem' }}>🛂</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Result</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1A365D' }}>{visaPassport} → {visaDestination}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span style={{
                  padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem', border: '1px solid',
                  background: visaResult.visa === 'visa free' ? '#F0FDF4' : visaResult.visa === 'visa on arrival' ? '#FFFBEB' : visaResult.visa === 'e-visa' ? '#EFF6FF' : '#FEF2F2',
                  color: visaResult.visa === 'visa free' ? '#16A34A' : visaResult.visa === 'visa on arrival' ? '#D97706' : visaResult.visa === 'e-visa' ? '#2563EB' : '#DC2626',
                  borderColor: visaResult.visa === 'visa free' ? '#BBF7D0' : visaResult.visa === 'visa on arrival' ? '#FCD34D' : visaResult.visa === 'e-visa' ? '#BFDBFE' : '#FECACA'
                }}>
                  {visaResult.visa === 'visa free' ? '✅ Visa Free' : visaResult.visa === 'visa on arrival' ? '🟡 Visa on Arrival' : visaResult.visa === 'e-visa' ? '🔵 e-Visa Required' : '🔴 ' + (visaResult.visa || 'Visa Required')}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {visaResult.dur && <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '1rem', border: '1px solid #E2E8F0' }}><div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Max Stay</div><div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>{visaResult.dur} days</div></div>}
              {visaResult.admission && <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '1rem', border: '1px solid #E2E8F0' }}><div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Admission</div><div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>{visaResult.admission}</div></div>}
            </div>

            {(visaResult.evisaLink || visaResult.infoLink) && (
              <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {visaResult.evisaLink && <a href={visaResult.evisaLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>🔵 Apply e-Visa Online →</a>}
                {visaResult.infoLink && <a href={visaResult.infoLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#475569', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>📋 Visa Information →</a>}
              </div>
            )}

            <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '1rem' }}>⚠️ Always verify with the official embassy or consulate before travel. This is indicative data only.</p>
          </div>
        )}
      </div>
    </div>
  )
}
