import React, { useEffect, useState, useMemo } from 'react'
import { NumberInputProps, set, unset, useFormValue } from 'sanity'

interface AttractionPriceInfo {
  name: string
  adultPrice: number
  childPrice: number
}

const FALLBACK_PRICES: Record<string, number> = {
  'universal studios singapore': 76,
  'gardens by the bay': 46,
  'flower dome & cloud forest': 46,
  'night safari with tram': 48,
  'singapore flyer': 40,
  'marina bay sands skypark': 32,
  's.e.a. aquarium': 43,
  'sentosa cable car': 28,
  'wings of time': 18,
  'bird paradise': 44,
  'river wonders': 40,
  'singapore zoo': 44,
  'madame tussauds': 35,
}

export function LandPackagePriceSummary(props: NumberInputProps) {
  const { value, onChange, readOnly } = props
  const rawItinerary = useFormValue(['itinerary']) as any[] | undefined
  const itinerary = useMemo(() => Array.isArray(rawItinerary) ? rawItinerary : [], [rawItinerary])

  const [attractionPrices, setAttractionPrices] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function loadPrices() {
      try {
        const res = await fetch('/api/custom-package-catalog', { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          if (active && Array.isArray(json.attractions)) {
            const map = new Map<string, number>()
            json.attractions.forEach((a: any) => {
              if (a.name && typeof a.adultPrice === 'number') {
                map.set(a.name.toLowerCase().trim(), a.adultPrice)
              }
            })
            setAttractionPrices(map)
          }
        }
      } catch (err) {
        console.warn('Failed to load attraction prices in Sanity Studio:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadPrices()
    return () => { active = false }
  }, [])

  // Calculate transfers & attractions breakdown
  const calculation = useMemo(() => {
    let transferCost = 0
    let attractionCostPerAdult = 0
    let attractionItemsCount = 0
    let transferItemsCount = 0

    itinerary.forEach(day => {
      (day.transfers || []).forEach((tr: any) => {
        transferItemsCount++
        const sType = tr.serviceType || 'interAttraction'
        if (sType === 'arrival' || sType === 'departure') {
          transferCost += 45 // 13-Seater Minibus standard rate
        } else if (sType === 'cityTour') {
          transferCost += 120 // 13-Seater City Tour
        } else {
          transferCost += 45 // 13-Seater Interline
        }
      })

      (day.attractions || []).forEach((a: any) => {
        attractionItemsCount++
        const aName = (a.attractionName || '').toLowerCase().trim()
        let price = attractionPrices.get(aName)
        if (price === undefined) {
          // Check fallback dictionary
          for (const [key, p] of Object.entries(FALLBACK_PRICES)) {
            if (aName.includes(key) || key.includes(aName)) {
              price = p
              break
            }
          }
        }
        attractionCostPerAdult += (price || 40)
      })
    })

    // Baseline calculation for standard 2-pax quote:
    // Total group cost = transfers group cost + (attractions per adult * 2)
    const baseGroupCost2Pax = transferCost + (attractionCostPerAdult * 2)
    const startingPerPax2Pax = Math.round(baseGroupCost2Pax / 2)

    return {
      transferCost,
      attractionCostPerAdult,
      attractionItemsCount,
      transferItemsCount,
      baseGroupCost2Pax,
      startingPerPax2Pax,
    }
  }, [itinerary, attractionPrices])

  const handleApplyCalculatedPrice = () => {
    if (calculation.startingPerPax2Pax > 0) {
      onChange(set(calculation.startingPerPax2Pax))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      
      {/* Live Calculated Price Breakdown Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        color: '#FFFFFF',
        boxShadow: '0 4px 14px rgba(15, 76, 58, 0.18)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1rem' }}>⚡</span>
            <strong style={{ fontSize: '0.9rem', color: '#FCD34D' }}>Live Land Package Net Calculator</strong>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '10px', color: '#E2E8F0' }}>
            {loading ? 'Fetching Rates...' : '13-Seater + Sheet Rates'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#CBD5E1', textTransform: 'uppercase' }}>🚗 13-Seater Transfers ({calculation.transferItemsCount})</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFF' }}>S$ {calculation.transferCost}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#CBD5E1', textTransform: 'uppercase' }}>🎟️ Attractions / Adult ({calculation.attractionItemsCount})</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFF' }}>S$ {calculation.attractionCostPerAdult}</div>
          </div>
          <div style={{ background: 'rgba(252, 211, 77, 0.15)', border: '1px solid rgba(252, 211, 77, 0.3)', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#FCD34D', textTransform: 'uppercase', fontWeight: 700 }}>Est. Starting Net (2 Pax)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FCD34D' }}>
              S$ {calculation.startingPerPax2Pax} <span style={{ fontSize: '0.72rem', fontWeight: 400, color: '#FFF' }}>/ person</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#E2E8F0', opacity: 0.9 }}>
            Total 2-Pax Group Net: S$ {calculation.baseGroupCost2Pax}
          </span>
          <button
            type="button"
            onClick={handleApplyCalculatedPrice}
            style={{
              background: '#FCD34D',
              color: '#0F4C3A',
              border: 'none',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ⚡ Set S$ {calculation.startingPerPax2Pax} as Starting Price
          </button>
        </div>
      </div>

      {/* Actual Number Input Field */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="number"
          min="0"
          value={value === undefined ? '' : value}
          readOnly={readOnly}
          onChange={e => {
            const val = parseFloat(e.target.value)
            if (isNaN(val)) {
              onChange(unset())
            } else {
              onChange(set(val))
            }
          }}
          placeholder="Starting Price in SGD"
          style={{
            flex: 1,
            padding: '0.55rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #CBD5E1',
            fontSize: '0.9rem',
            color: '#0F172A',
            fontWeight: 700,
            background: '#FFF'
          }}
        />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>SGD / Pax</span>
      </div>

    </div>
  )
}
