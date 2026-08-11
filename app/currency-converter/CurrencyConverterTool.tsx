'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

export default function CurrencyConverterTool() {
  const [sgdRate, setSgdRate] = useState<number | null>(null)
  const [myrRate, setMyrRate] = useState<number | null>(null)
  const [sgdAmount, setSgdAmount] = useState('100')
  const [loading, setLoading] = useState(true)
  const [adults, setAdults] = useState(2)
  const [kids, setKids] = useState(0)
  const [days, setDays] = useState(4)

  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(r => r.json())
      .then(d => {
        if (d.sgdToInr) setSgdRate(d.sgdToInr)
        if (d.sgdToMyr) setMyrRate(d.sgdToMyr)
      })
      .catch(() => { setSgdRate(63.5); setMyrRate(3.48) })
      .finally(() => setLoading(false))
  }, [])

  const inrAmount = sgdRate ? (parseFloat(sgdAmount) * sgdRate).toFixed(0) : '—'
  const myrAmount = myrRate ? (parseFloat(sgdAmount) * myrRate).toFixed(2) : '—'

  const MEAL = { breakfast: 12, lunch: 17, dinner: 17 }
  const totalPax = adults + kids
  const mealCostPerDay = (MEAL.breakfast + MEAL.lunch + MEAL.dinner) * totalPax
  const totalMealCost = mealCostPerDay * days
  const totalMealINR = sgdRate ? Math.round(totalMealCost * sgdRate) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Converter */}
      <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #1A365D 0%, #0F4C3A 100%)', padding: '1.25rem 2rem', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>💱 SGD Converter</span>
          {!loading && sgdRate && <span style={{ fontSize: '0.82rem', opacity: 0.85 }}>Live: 1 SGD = ₹{sgdRate.toFixed(2)} · MYR {myrRate?.toFixed(4)}</span>}
          {loading && <span style={{ fontSize: '0.82rem', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Fetching rate...</span>}
        </div>
        <div style={{ padding: '1.75rem 2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount in SGD (S$)</label>
            <input type="number" min="1" value={sgdAmount} onChange={e => setSgdAmount(e.target.value)}
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1.2rem', fontWeight: 800, color: '#0F4C3A', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: '#F0FDF4', borderRadius: '10px', padding: '1.1rem', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Indian Rupee (₹)</div>
              <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#0F172A' }}>₹{loading ? '...' : parseFloat(sgdAmount) ? Number(inrAmount).toLocaleString('en-IN') : '—'}</div>
            </div>
            <div style={{ background: '#EFF6FF', borderRadius: '10px', padding: '1.1rem', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Malaysian Ringgit (RM)</div>
              <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#0F172A' }}>RM {loading ? '...' : myrAmount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Estimator */}
      <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)', padding: '1.25rem 2rem', color: '#FFF' }}>
          <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>🍽️ Trip Meal Cost Estimator</span>
        </div>
        <div style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Adults', value: adults, set: setAdults },
              { label: 'Children', value: kids, set: setKids },
              { label: 'Trip Days', value: days, set: setDays },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                <input type="number" min={0} max={label === 'Trip Days' ? 30 : 20} value={value}
                  onChange={e => set(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <div style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid #DDD6FE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6D28D9', fontWeight: 700 }}>Total Estimated Meal Cost</div>
                <div style={{ fontSize: '0.72rem', color: '#8B5CF6', marginTop: '0.2rem' }}>B: S${MEAL.breakfast} · L: S${MEAL.lunch} · D: S${MEAL.dinner} per person/day</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: '1.6rem', color: '#4C1D95' }}>S$ {totalMealCost.toFixed(0)}</div>
                {totalMealINR && <div style={{ fontSize: '0.85rem', color: '#6D28D9', fontWeight: 600 }}>≈ ₹{totalMealINR.toLocaleString('en-IN')}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
