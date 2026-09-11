import React, { useEffect, useState, useCallback } from 'react'
import { StringInputProps, set, unset } from 'sanity'

const FALLBACK_MEALS = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Tasty Corner (Breakfast)',
  'Nandanas Restaurant (Breakfast)',
  'Arya Bhavan - Veg (Lunch / Dinner)',
  'Jubilee / Jalsa : Sentosa (Lunch / Dinner)',
  'Little India (Breakfast)',
  'Little India (Lunch)',
  'Little India (Dinner)'
]

export function LiveMealNameInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props
  const [meals, setMeals] = useState<string[]>(FALLBACK_MEALS)
  const [loading, setLoading] = useState<boolean>(true)
  const [isLive, setIsLive] = useState<boolean>(false)
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    async function fetchLiveMeals() {
      try {
        setLoading(true)
        const res = await fetch('/api/custom-package-catalog?type=meals', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (isMounted && json.success && Array.isArray(json.items) && json.items.length > 0) {
          setMeals(json.items)
          setIsLive(true)
          return
        }
      } catch (err) {
        console.warn('Live meals API fetch fallback to static list:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchLiveMeals()
    return () => { isMounted = false }
  }, [])

  const currentInList = value ? meals.some(m => m.toLowerCase() === value.toLowerCase()) : false

  const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value
    if (selected === '__CUSTOM__') {
      setIsCustomMode(true)
    } else if (selected) {
      onChange(set(selected))
    } else {
      onChange(unset())
    }
  }, [onChange])

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value
    if (nextValue) {
      onChange(set(nextValue))
    } else {
      onChange(unset())
    }
  }, [onChange])

  const filteredMeals = meals.filter(m =>
    !searchFilter || m.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: loading ? '#EAB308' : isLive ? '#10B981' : '#64748B'
          }} />
          <span style={{ fontWeight: 600, color: isLive ? '#059669' : '#475569' }}>
            {loading ? 'Connecting to Google Sheets...' : isLive ? `Live Connected (${meals.length} meal options loaded)` : `Offline Fallback (${meals.length} meals)`}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsCustomMode(!isCustomMode)}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563EB',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0
          }}
        >
          {isCustomMode ? '← Pick from Google Sheet List' : '+ Enter Custom Meal Plan'}
        </button>
      </div>

      {!isCustomMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <input
            type="text"
            placeholder="🔍 Filter meals (e.g. Breakfast, Lunch, Dinner, Sentosa)..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            disabled={readOnly}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '0.82rem',
              background: '#F8FAFC',
              outline: 'none'
            }}
          />

          <select
            value={value || ''}
            onChange={handleSelectChange}
            disabled={readOnly || loading}
            style={{
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #94A3B8',
              fontSize: '0.9rem',
              fontWeight: 500,
              background: '#FFFFFF',
              color: '#0F172A',
              width: '100%',
              cursor: 'pointer'
            }}
          >
            <option value="">-- Choose Meal Option from Google Sheet --</option>
            {filteredMeals.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value="__CUSTOM__">✏️ Other / Custom Name (Type manually)...</option>
          </select>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <input
            type="text"
            placeholder="Enter meal or restaurant name..."
            value={value || ''}
            onChange={handleTextChange}
            disabled={readOnly}
            style={{
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #2563EB',
              fontSize: '0.9rem',
              background: '#FFFFFF',
              color: '#0F172A',
              width: '100%'
            }}
          />
        </div>
      )}

      {value && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#F1F5F9',
          padding: '0.4rem 0.6rem',
          borderRadius: '4px',
          fontSize: '0.8rem',
          color: '#334155'
        }}>
          <span>Selected: <strong>{value}</strong></span>
          {currentInList && (
            <span style={{
              background: '#DCFCE7',
              color: '#166534',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 700
            }}>
              ✓ Matched in Sheet
            </span>
          )}
        </div>
      )}
    </div>
  )
}
