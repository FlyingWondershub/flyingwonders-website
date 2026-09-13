import React, { useEffect, useState, useCallback } from 'react'
import { StringInputProps, set, unset } from 'sanity'

const FALLBACK_TRANSFERS = [
  '13-Seater - Private - group - Arrival / Departure',
  '13-Seater - Private - group - Transfers',
  '13-Seater - Private - group - City tour',
  '13-Seater - Private - group - Disposal',
  'SIC - SIC - per person - City Tour ( 3 hours )',
  'SIC - SIC - per person - Transfers ( Round Trip )'
]

export function LiveTransferNameInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props
  const [transfers, setTransfers] = useState<string[]>(FALLBACK_TRANSFERS)
  const [loading, setLoading] = useState<boolean>(true)
  const [isLive, setIsLive] = useState<boolean>(false)
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    async function fetchLiveTransfers() {
      try {
        setLoading(true)
        const res = await fetch('/api/custom-package-catalog?type=transfers', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (isMounted && json.success && Array.isArray(json.items) && json.items.length > 0) {
          setTransfers(json.items)
          setIsLive(true)
          return
        }
      } catch (err) {
        console.warn('Live transfers API fetch fallback to static list:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchLiveTransfers()
    return () => { isMounted = false }
  }, [])

  const currentInList = value ? transfers.some(t => t.toLowerCase() === value.toLowerCase()) : false

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

  // Filter out large coaches (>12 pax) and sedans - Land Packages strictly use 13-Seater Minibus & SIC
  const eligibleTransfers = transfers.filter(t => {
    const low = t.toLowerCase()
    return !low.includes('24-seater') && !low.includes('45-seater') && !low.includes('sedan') && !low.includes('camry')
  })

  const filteredTransfers = eligibleTransfers.filter(t =>
    !searchFilter || t.toLowerCase().includes(searchFilter.toLowerCase())
  )

  // Categorize for clear optgroups: Strictly 13-Seater Minibus & SIC
  const private13List = filteredTransfers.filter(t => {
    const low = t.toLowerCase()
    return low.includes('13-seater') || (low.includes('13') && low.includes('private'))
  })
  const sicList = filteredTransfers.filter(t => {
    const low = t.toLowerCase()
    return low.includes('sic') || low.includes('seat-in-coach') || low.includes('per person')
  })

  const isValueSic = value ? (value.toLowerCase().includes('sic') || value.toLowerCase().includes('per person')) : false
  const isValue13 = value ? value.toLowerCase().includes('13') : false

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
            {loading ? 'Connecting to Google Sheets...' : isLive ? `Live Connected (${eligibleTransfers.length} transfers)` : `Offline Fallback (${eligibleTransfers.length} transfers)`}
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
          {isCustomMode ? '← Pick from Google Sheet List' : '+ Enter Custom Option'}
        </button>
      </div>

      {!isCustomMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <input
            type="text"
            placeholder="🔍 Filter (e.g. 13-Seater, SIC, City Tour, Arrival)..."
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
            <option value="">-- Choose Transfer from Google Sheet --</option>
            
            {private13List.length > 0 && (
              <optgroup label="🚐 13-Seater Minibus (Private Group Flat Rates)">
                {private13List.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </optgroup>
            )}

            {sicList.length > 0 && (
              <optgroup label="🚌 SIC Seat-In-Coach (Shared Per-Person Rates)">
                {sicList.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </optgroup>
            )}

            <option value="__CUSTOM__">✏️ Other / Custom Name (Type manually)...</option>
          </select>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <input
            type="text"
            placeholder="Vehicle Type - Transfer Type - Rate type - Service Name"
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
          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
            Format: Vehicle Type - Transfer Type - Rate type - Service Name
          </span>
        </div>
      )}

      {value && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
          background: '#F1F5F9',
          padding: '0.5rem 0.7rem',
          borderRadius: '6px',
          fontSize: '0.8rem',
          color: '#334155'
        }}>
          <span>Selected: <strong>{value}</strong></span>
          
          {isValueSic ? (
            <span style={{
              background: '#E0F2FE',
              color: '#0369A1',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🚌 SIC (Shared • Per Person Rate)
            </span>
          ) : isValue13 ? (
            <span style={{
              background: '#DCFCE7',
              color: '#166534',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🚐 13-Seater Minibus (Private • Group Flat Rate)
            </span>
          ) : (
            <span style={{
              background: '#FEF3C7',
              color: '#92400E',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              🚗 Private Group Transfer
            </span>
          )}

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
