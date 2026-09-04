import React, { useEffect, useState, useCallback } from 'react'
import { StringInputProps, set, unset } from 'sanity'
import { ATTRACTION_NAMES as FALLBACK_NAMES } from '../schemaTypes/attractionsList'

const GOOGLE_SHEET_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=csv'

export function LiveAttractionNameInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props
  const [attractions, setAttractions] = useState<string[]>(FALLBACK_NAMES)
  const [loading, setLoading] = useState<boolean>(true)
  const [isLive, setIsLive] = useState<boolean>(false)
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false)

  // Fetch live attractions from Google Sheets CSV
  useEffect(() => {
    let isMounted = true
    async function fetchLiveAttractions() {
      try {
        setLoading(true)
        const res = await fetch(GOOGLE_SHEET_CSV)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
        
        const extracted: string[] = []
        const seen = new Set<string>()

        // Parse CSV lines
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i]
          let parts: string[] = []
          let currentPart = ''
          let insideQuote = false
          for (let j = 0; j < line.length; j++) {
            const char = line[j]
            if (char === '"') { insideQuote = !insideQuote }
            else if (char === ',' && !insideQuote) { parts.push(currentPart.trim()); currentPart = '' }
            else { currentPart += char }
          }
          parts.push(currentPart.trim())

          if (parts.length > 0) {
            const rawName = parts[0].replace(/^"|"$/g, '').trim()
            if (rawName && !seen.has(rawName.toLowerCase()) && !rawName.toLowerCase().startsWith('attraction')) {
              seen.add(rawName.toLowerCase())
              extracted.push(rawName)
            }
          }
        }

        if (isMounted && extracted.length > 0) {
          setAttractions(extracted)
          setIsLive(true)
        }
      } catch (err) {
        console.warn('Live Google Sheet fetch in Sanity Studio fallback to static list:', err)
        if (isMounted) setIsLive(false)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchLiveAttractions()
    return () => { isMounted = false }
  }, [])

  // Check if current value exists in attractions list
  const currentInList = value ? attractions.some(a => a.toLowerCase() === value.toLowerCase()) : false

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

  const filteredAttractions = attractions.filter(a => 
    !searchFilter || a.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', fontFamily: 'inherit' }}>
      
      {/* Live Sync Status Header */}
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
            {loading ? 'Connecting to Google Sheets...' : isLive ? `Live Connected (${attractions.length} attractions loaded)` : `Offline Fallback (${attractions.length} attractions)`}
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
          {isCustomMode ? '← Pick from Google Sheet List' : '+ Enter Custom Attraction Name'}
        </button>
      </div>

      {/* Mode 1: Searchable Dropdown Selector */}
      {!isCustomMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {/* Fast Search Filter if list is long */}
          <input
            type="text"
            placeholder="🔍 Filter attractions by keyword..."
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
            <option value="">-- Choose an Attraction from Google Sheet --</option>
            {filteredAttractions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value="__CUSTOM__">✏️ Other / Custom Name (Type manually)...</option>
          </select>
        </div>
      ) : (
        /* Mode 2: Freeform Input */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <input
            type="text"
            placeholder="Enter attraction name exactly as needed..."
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
            Tip: Keep the name close to the Google Sheet wording for seamless matching.
          </span>
        </div>
      )}

      {/* Selected Value Badge */}
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
