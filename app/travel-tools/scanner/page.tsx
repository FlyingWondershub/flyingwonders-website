'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Camera,
  Upload,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Trash2,
  RefreshCw,
  Plane,
  Building2,
  ShieldCheck,
  Clock,
  User,
  Calendar,
  Globe2,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
  Edit2
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { scanPassportImageInBrowser, scanPassportWithAiVision } from '../../../utils/passportOcr'
import { ParsedPassportData, findAndParseMrzInText } from '../../../utils/mrzParser'

export default function PassportScannerPage() {
  const [passengers, setPassengers] = useState<ParsedPassportData[]>([])
  const [scanMode, setScanMode] = useState<'ai' | 'local'>('ai')
  const [scanning, setScanning] = useState(false)
  const [progressStatus, setProgressStatus] = useState('')
  const [progressPercent, setProgressPercent] = useState(0)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [manualMrzOpen, setManualMrzOpen] = useState(false)
  const [manualMrzText, setManualMrzText] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const updatePassengerField = (idx: number, field: keyof ParsedPassportData, val: any) => {
    setPassengers(prev =>
      prev.map((p, i) => {
        if (i !== idx) return p
        const updated = { ...p, [field]: val }

        // Recalculate GDS name if name or title changes
        if (field === 'fullName' || field === 'title') {
          const names = (updated.fullName || '').trim().split(' ')
          const sName = names.length > 1 ? names[names.length - 1] : names[0] || ''
          const gName = names.length > 1 ? names[0] : ''
          const gdsS = sName.toUpperCase().replace(/[^A-Z]/g, '')
          const gdsG = gName.toUpperCase().replace(/[^A-Z]/g, '')
          updated.airlineGdsFormat = `${gdsS}/${gdsG} ${updated.title || 'MR'}`.trim()
        }
        return updated
      })
    )
  }

  // Listen for Clipboard Paste (Ctrl+V) anywhere on the page
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile()
          if (blob) {
            processImageFile(blob)
            break
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const processImageFile = async (file: File | Blob) => {
    setScanning(true)
    setErrorMessage(null)
    setProgressStatus(scanMode === 'ai' ? 'Connecting to AI Vision scanner...' : 'Initializing local passport scanner...')
    setProgressPercent(15)

    try {
      let data: ParsedPassportData
      if (scanMode === 'ai') {
        try {
          data = await scanPassportWithAiVision(file, (status, pct) => {
            setProgressStatus(status)
            setProgressPercent(pct)
          })
        } catch (aiErr: any) {
          console.warn('AI Vision scan failed, falling back to local MRZ engine:', aiErr.message)
          setProgressStatus('Falling back to local MRZ engine...')
          data = await scanPassportImageInBrowser(file, (status, pct) => {
            setProgressStatus(status)
            setProgressPercent(pct)
          })
        }
      } else {
        data = await scanPassportImageInBrowser(file, (status, pct) => {
          setProgressStatus(status)
          setProgressPercent(pct)
        })
      }

      setPassengers(prev => [data, ...prev])
      setScanning(false)
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Unable to detect passport details. Please make sure the document is clearly visible and well-lit.'
      )
      setScanning(false)
    }
  }

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setScanning(true)
    setErrorMessage(null)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setProgressStatus(`Scanning document ${i + 1} of ${files.length}...`)
      try {
        let data: ParsedPassportData
        if (scanMode === 'ai') {
          try {
            data = await scanPassportWithAiVision(file, (status, pct) => {
              setProgressStatus(`Doc ${i + 1}/${files.length}: ${status}`)
              setProgressPercent(pct)
            })
          } catch {
            data = await scanPassportImageInBrowser(file, (status, pct) => {
              setProgressStatus(`Doc ${i + 1}/${files.length}: ${status}`)
              setProgressPercent(pct)
            })
          }
        } else {
          data = await scanPassportImageInBrowser(file, (status, pct) => {
            setProgressStatus(`Doc ${i + 1}/${files.length}: ${status}`)
            setProgressPercent(pct)
          })
        }
        setPassengers(prev => [data, ...prev])
      } catch (err: any) {
        setErrorMessage(
          `Document ${file.name}: ${err.message || 'MRZ unreadable. Ensure bottom 2 lines are clear.'}`
        )
      }
    }

    setScanning(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const handleManualMrzSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualMrzText.trim()) return

    const parsed = findAndParseMrzInText(manualMrzText.trim())
    if (parsed) {
      setPassengers(prev => [parsed, ...prev])
      setManualMrzText('')
      setManualMrzOpen(false)
      setErrorMessage(null)
    } else {
      setErrorMessage('Could not parse MRZ lines. Please paste valid 44-character passport MRZ lines.')
    }
  }

  const removePassenger = (index: number) => {
    setPassengers(prev => prev.filter((_, i) => i !== index))
  }

  const clearAllPassengers = () => {
    if (window.confirm('Clear all scanned passenger details?')) {
      setPassengers([])
    }
  }

  // Export Manifest to Excel (.xlsx)
  const exportToExcel = () => {
    if (passengers.length === 0) return

    const rows = passengers.map((p, idx) => ({
      'Sr #': idx + 1,
      'Title': p.title,
      'Surname': p.surname,
      'Given Names': p.givenNames,
      'Full Name': p.fullName,
      'Airline GDS Format': p.airlineGdsFormat,
      'Passport Number': p.passportNumber,
      'Nationality': p.nationality,
      'Country Code': p.nationalityCode,
      'Date of Birth': p.dateOfBirthFormatted,
      'Age': p.age,
      'Passenger Category': p.passengerType,
      'Gender': p.sex,
      'Expiry Date': p.expirationDateFormatted,
      '6-Month Validity': p.isValid6Months ? 'VALID (>= 6 Mos)' : 'EXPIRED / EXPIRING SOON',
      'Days Until Expiry': p.daysUntilExpiry,
      'Checksum Status': p.allChecksumsValid ? 'PASSED 100%' : 'WARNING',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Passenger_Manifest')
    const dateStr = new Date().toISOString().split('T')[0]
    XLSX.writeFile(wb, `Passport_Passenger_Manifest_${dateStr}.xlsx`)
  }

  // Copy All Passengers in Airline Reservation Block
  const copyAllAirlineFormat = () => {
    if (passengers.length === 0) return

    const lines = passengers.map((p, i) => {
      return `PAX ${i + 1}: ${p.airlineGdsFormat} | PPT: ${p.passportNumber} | NAT: ${p.nationalityCode} | DOB: ${p.dateOfBirthFormatted} (${p.passengerType}) | EXP: ${p.expirationDateFormatted}`
    })

    copyToClipboard(lines.join('\n'), 'copy-all-airline')
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem', fontFamily: 'var(--font-inter), sans-serif' }}>
      
      {/* ── TOP HERO BANNER ── */}
      <section style={{ background: 'linear-gradient(135deg, #0A2240 0%, #0F4C3A 100%)', color: '#FFF', padding: '2.75rem 1.5rem 3rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(212,175,55,0.18)', border: '1px solid #D4AF37', padding: '0.35rem 0.85rem', borderRadius: '20px', marginBottom: '1rem' }}>
            <Sparkles size={14} color="#D4AF37" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FBD38D', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              100% Free · Unlimited · In-Browser Client-Side Processing
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.75rem)', fontWeight: 800, margin: '0 0 0.85rem', fontFamily: 'var(--font-playfair), serif', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Passport Scanner & Air Ticketing Data Tool
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#E2E8F0', maxWidth: '640px', margin: '0 auto 1.5rem', lineHeight: 1.55 }}>
            Instantly capture traveler details from passport photos or live mobile cameras for air tickets and hotel bookings. Zero typing, zero quotas, and 100% private.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#CBD5E1' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={16} color="#38A169" /> Zero server uploads (PDPA/GDPR Safe)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} color="#38A169" /> ICAO 9303 Checksum Verified
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={16} color="#38A169" /> 6-Month Travel Validity Checker
            </span>
          </div>

        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main style={{ maxWidth: '1080px', margin: '-1.5rem auto 0', padding: '0 1.25rem' }}>

        {/* ── CAPTURE & DROPZONE CARD ── */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 25px rgba(10,34,64,0.06)', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
          
          {/* Scan Engine Mode Selector */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '5px', borderRadius: '12px', border: '1px solid #E2E8F0', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setScanMode('ai')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '9px',
                  border: 'none',
                  background: scanMode === 'ai' ? '#0A2240' : 'transparent',
                  color: scanMode === 'ai' ? '#FFF' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: scanMode === 'ai' ? '0 2px 6px rgba(10,34,64,0.2)' : 'none',
                }}
              >
                <Sparkles size={15} color={scanMode === 'ai' ? '#FBD38D' : '#64748B'} />
                <span>High-Precision AI Vision (Clean · No Extra Characters)</span>
              </button>

              <button
                type="button"
                onClick={() => setScanMode('local')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '9px',
                  border: 'none',
                  background: scanMode === 'local' ? '#0A2240' : 'transparent',
                  color: scanMode === 'local' ? '#FFF' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: scanMode === 'local' ? '0 2px 6px rgba(10,34,64,0.2)' : 'none',
                }}
              >
                <ShieldCheck size={15} color={scanMode === 'local' ? '#48BB78' : '#64748B'} />
                <span>Local In-Browser MRZ (Free · Offline)</span>
              </button>
            </div>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault() }}
            onDrop={(e) => {
              e.preventDefault()
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                processImageFile(e.dataTransfer.files[0])
              }
            }}
            style={{
              border: '2px dashed #0A2240',
              borderRadius: '12px',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              background: '#F8FAFC',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#EBF8FF', color: '#0A2240', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Upload size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', color: '#0A2240', fontWeight: 700, margin: '0 0 0.4rem' }}>
              Drop Passport Photo Here or Browse
            </h3>
            
            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 1.25rem' }}>
              Supports JPG, PNG, WEBP, or multi-file batch uploads. <strong style={{ color: '#0A2240' }}>Tip:</strong> You can also paste an image directly from WhatsApp using <kbd style={{ background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', color: '#1A202C' }}>Ctrl + V</kbd>.
            </p>

            {/* Buttons Row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#0A2240',
                  color: '#FFF',
                  padding: '0.65rem 1.35rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(10,34,64,0.15)',
                }}
              >
                <Upload size={16} />
                <span>Upload Passport File(s)</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={scanning}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#0F4C3A',
                  color: '#FFF',
                  padding: '0.65rem 1.35rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(15,76,58,0.15)',
                }}
              >
                <Camera size={16} />
                <span>Snap with Camera</span>
              </button>

              <button
                type="button"
                onClick={() => setManualMrzOpen(prev => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#F1F5F9',
                  color: '#334155',
                  padding: '0.65rem 1.15rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: '1px solid #CBD5E1',
                  cursor: 'pointer',
                }}
              >
                <Edit2 size={15} />
                <span>Paste MRZ Text</span>
              </button>

            </div>

            {/* Hidden native inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              style={{ display: 'none' }}
              onChange={handleFilesSelected}
            />

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFilesSelected}
            />

          </div>

          {/* Progress Indicator */}
          {scanning && (
            <div style={{ marginTop: '1.5rem', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={16} className="animate-spin" color="#166534" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#166534' }}>{progressStatus}</span>
                </div>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#166534' }}>{progressPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#DCFCE7', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: '#16A34A', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div style={{ marginTop: '1.25rem', background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '1rem', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#991B1B', fontSize: '0.88rem' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Scanning Alert</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Collapsible Manual MRZ Text Box */}
          {manualMrzOpen && (
            <form onSubmit={handleManualMrzSubmit} style={{ marginTop: '1.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.25rem', borderRadius: '10px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Paste 2 Lines of ICAO 9303 Passport MRZ (e.g. from ticket reservation or text scan):
              </label>
              <textarea
                value={manualMrzText}
                onChange={(e) => setManualMrzText(e.target.value)}
                placeholder={"P<INDDOE<<JOHN<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\nL898902C36IND7408122M2904159ZE184226B<<<<<10"}
                rows={3}
                style={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  background: '#FFF',
                  color: '#0F172A',
                  marginBottom: '0.75rem',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setManualMrzOpen(false)}
                  style={{ padding: '0.5rem 0.9rem', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.25rem', background: '#0A2240', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Parse MRZ Lines
                </button>
              </div>
            </form>
          )}

        </div>

        {/* ── SCANNED PASSENGERS LIST SECTION ── */}
        <div style={{ marginBottom: '2.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#0A2240', margin: '0 0 0.2rem', fontFamily: 'var(--font-playfair), serif', fontWeight: 800 }}>
                Captured Passengers ({passengers.length})
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.84rem', margin: 0 }}>
                Formatted for airline GDS booking systems (IndiGo, Air India, Singapore Airlines, Scoot, Amadeus).
              </p>
            </div>

            {passengers.length > 0 && (
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  onClick={copyAllAirlineFormat}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: '#0A2240', color: '#FFF', borderRadius: '8px', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {copiedKey === 'copy-all-airline' ? <Check size={14} color="#48BB78" /> : <Copy size={14} />}
                  <span>{copiedKey === 'copy-all-airline' ? 'Copied All!' : 'Copy Group Flight Block'}</span>
                </button>

                <button
                  onClick={exportToExcel}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: '#0F4C3A', color: '#FFF', borderRadius: '8px', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <FileSpreadsheet size={14} />
                  <span>Export Manifest (.xlsx)</span>
                </button>

                <button
                  onClick={clearAllPassengers}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 0.85rem', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Trash2 size={13} />
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>

          {/* Empty State */}
          {passengers.length === 0 && (
            <div style={{ background: '#FFF', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', border: '1px solid #E2E8F0' }}>
              <Plane size={44} color="#94A3B8" style={{ margin: '0 auto 1rem', opacity: 0.7 }} />
              <h4 style={{ fontSize: '1.15rem', color: '#334155', fontWeight: 700, margin: '0 0 0.4rem' }}>
                No Passports Scanned Yet
              </h4>
              <p style={{ color: '#64748B', fontSize: '0.88rem', maxWidth: '460px', margin: '0 auto 1.25rem' }}>
                Upload a passport photo or snap with your phone camera above. Extracted traveler data, GDS airline copy buttons, and 6-month validity alerts will appear here.
              </p>
            </div>
          )}

          {/* Passenger Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {passengers.map((p, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFF',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                  position: 'relative',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span style={{ background: '#0A2240', color: '#FFF', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                        PAX #{idx + 1}
                      </span>
                      <span style={{ background: '#E0E7FF', color: '#3730A3', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                        {p.passengerType} ({p.age} yrs)
                      </span>
                      <span style={{ background: '#F1F5F9', color: '#475569', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                        {p.sex}
                      </span>
                    </div>

                    {/* Editable Title & Full Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                      <select
                        value={p.title}
                        onChange={(e) => updatePassengerField(idx, 'title', e.target.value)}
                        style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', fontWeight: 700, color: '#0A2240', background: '#FFF' }}
                      >
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                        <option value="Mstr">Mstr</option>
                      </select>
                      <input
                        type="text"
                        value={p.fullName}
                        onChange={(e) => updatePassengerField(idx, 'fullName', e.target.value.toUpperCase())}
                        title="Click to edit name if needed"
                        placeholder="Full Name as per Passport"
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          color: '#0A2240',
                          minWidth: '240px',
                          flex: 1,
                          background: '#FFF',
                        }}
                      />
                    </div>

                    {/* Airline GDS String */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Airline GDS Name:</span>
                      <code style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                        {p.airlineGdsFormat}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(p.airlineGdsFormat, `gds-${idx}`)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.25rem 0.55rem', fontSize: '0.75rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                      >
                        {copiedKey === `gds-${idx}` ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                        <span>{copiedKey === `gds-${idx}` ? 'Copied' : 'Copy GDS'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const block = `PASSENGER: ${p.airlineGdsFormat}\nPASSPORT NO: ${p.passportNumber}\nNATIONALITY: ${p.nationality} (${p.nationalityCode})\nDOB: ${p.dateOfBirthFormatted} (${p.passengerType})\nEXPIRY: ${p.expirationDateFormatted}\nVALIDITY: ${p.isValid6Months ? 'VALID' : 'EXPIRING'}`
                        copyToClipboard(block, `block-${idx}`)
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {copiedKey === `block-${idx}` ? <Check size={13} color="#48BB78" /> : <Copy size={13} />}
                      <span>{copiedKey === `block-${idx}` ? 'Copied Block' : 'Copy All Details'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removePassenger(idx)}
                      title="Remove Passenger"
                      style={{ background: '#FEE2E2', border: 'none', borderRadius: '6px', padding: '0.4rem', color: '#991B1B', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Details Matrix */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  
                  {/* Passport No */}
                  <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Passport Number</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                      <input
                        type="text"
                        value={p.passportNumber}
                        onChange={(e) => updatePassengerField(idx, 'passportNumber', e.target.value.toUpperCase().trim())}
                        style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A2240', letterSpacing: '0.05em', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '2px 6px', width: '130px' }}
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(p.passportNumber, `pass-${idx}`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '2px' }}
                      >
                        {copiedKey === `pass-${idx}` ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.35rem', fontSize: '0.72rem', color: p.passportNumberCheckValid ? '#16A34A' : '#DC2626' }}>
                      <CheckCircle2 size={12} />
                      <span>{p.passportNumberCheckValid ? 'Verified' : 'Unverified'}</span>
                    </div>
                  </div>

                  {/* Nationality */}
                  <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Nationality</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input
                        type="text"
                        value={p.nationality}
                        onChange={(e) => updatePassengerField(idx, 'nationality', e.target.value)}
                        style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0A2240', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '2px 6px', width: '130px' }}
                      />
                      <span style={{ fontSize: '0.82rem', color: '#64748B' }}>({p.nationalityCode})</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.35rem' }}>
                      Issuing State: {p.issuingCountry}
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Date of Birth</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                      <input
                        type="text"
                        value={p.dateOfBirthFormatted}
                        onChange={(e) => updatePassengerField(idx, 'dateOfBirthFormatted', e.target.value)}
                        style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0A2240', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '2px 6px', width: '130px' }}
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(p.dateOfBirthFormatted, `dob-${idx}`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '2px' }}
                      >
                        {copiedKey === `dob-${idx}` ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.35rem' }}>
                      Age: {p.age} years ({p.passengerType})
                    </div>
                  </div>

                  {/* Passport Expiry & 6-Month Status */}
                  <div style={{ background: p.isValid6Months ? '#F0FDF4' : '#FEF2F2', padding: '0.75rem 1rem', borderRadius: '8px', border: `1px solid ${p.isValid6Months ? '#BBF7D0' : '#FECACA'}` }}>
                    <div style={{ fontSize: '0.72rem', color: p.isValid6Months ? '#166534' : '#991B1B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Date of Expiry
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                      <input
                        type="text"
                        value={p.expirationDateFormatted}
                        onChange={(e) => updatePassengerField(idx, 'expirationDateFormatted', e.target.value)}
                        style={{ fontSize: '0.95rem', fontWeight: 700, color: p.isValid6Months ? '#166534' : '#991B1B', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '2px 6px', width: '130px' }}
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(p.expirationDateFormatted, `exp-${idx}`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.isValid6Months ? '#166534' : '#991B1B', padding: '2px' }}
                      >
                        {copiedKey === `exp-${idx}` ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.35rem', fontSize: '0.72rem', fontWeight: 700, color: p.isValid6Months ? '#15803D' : '#DC2626' }}>
                      {p.isValid6Months ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Valid for Travel ({p.daysUntilExpiry} days left)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={12} />
                          <span>WARNING: &lt; 6 Mos Left ({p.daysUntilExpiry} days)</span>
                        </>
                      )}
                    </div>
                  </div>

                </div>

                {/* Raw MRZ string expandable */}
                <details style={{ fontSize: '0.75rem', color: '#64748B', background: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Show Raw ICAO 9303 MRZ Lines</summary>
                  <pre style={{ margin: '0.5rem 0 0', fontFamily: 'monospace', fontSize: '0.8rem', color: '#0F172A', background: '#FFF', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', overflowX: 'auto' }}>
                    {p.rawMrzLines.join('\n')}
                  </pre>
                </details>

              </div>
            ))}
          </div>

        </div>

        {/* ── QUICK LINK TO HOTEL VOUCHERS IN ADMIN DASHBOARD ── */}
        <div style={{ background: 'linear-gradient(135deg, #0A2240 0%, #1A365D 100%)', borderRadius: '14px', padding: '1.75rem', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Building2 size={20} color="#D4AF37" />
              <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>
                Need to Issue Group Hotel Confirmation Vouchers?
              </h3>
            </div>
            <p style={{ color: '#E2E8F0', fontSize: '0.88rem', margin: 0, maxWidth: '620px' }}>
              You can also use this passport scanner directly inside the Admin Dashboard Hotel Voucher generator to auto-fill guest names into individual rooms.
            </p>
          </div>

          <Link
            href="/admin-dashboard#section-hotel-vouchers"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#D4AF37',
              color: '#0A2240',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <span>Open Hotel Voucher Generator</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </main>

    </div>
  )
}
