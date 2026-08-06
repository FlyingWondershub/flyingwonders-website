'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface ItineraryDay {
  dayNumber: number
  title: string
  events: {
    time: string
    title: string
    description: string
    isInventoryItem: boolean
    isAvailableInSheet?: boolean
    priceSGD: number
    suggestedAlternatives?: string[]
  }[]
}

interface AIResponse {
  tripSummary?: string
  totalEstimatedPriceSGD?: number
  days?: ItineraryDay[]
  error?: string
  details?: string
}

interface TripParams {
  dates: string
  adults: number
  kids: number
  vibe: string
  budget: string
}

const DAY_COLORS = [
  { bg: '#0F4C3A', light: '#E6F4EF', accent: '#1a6b52' },
  { bg: '#B7791F', light: '#FEFCE8', accent: '#D97706' },
  { bg: '#2B6CB0', light: '#EBF8FF', accent: '#3182CE' },
  { bg: '#6B46C1', light: '#FAF5FF', accent: '#805AD5' },
  { bg: '#C53030', light: '#FFF5F5', accent: '#E53E3E' },
  { bg: '#276749', light: '#F0FFF4', accent: '#38A169' },
  { bg: '#744210', light: '#FFFAF0', accent: '#D69E2E' },
]

const PROGRESS_STEPS = [
  { icon: '🔍', label: 'Reading your requirements…' },
  { icon: '🗺️', label: 'Planning your day-by-day journey…' },
  { icon: '💰', label: 'Fetching live attraction prices…' },
  { icon: '✨', label: 'Finalizing your itinerary…' },
]

function getEventIcon(evt: { title: string; isInventoryItem: boolean }): string {
  const t = evt.title.toLowerCase()
  if (t.includes('transfer') || t.includes('taxi') || t.includes('pickup') || t.includes('drop') || t.includes('van') || t.includes('car') || t.includes('airport')) return '🚗'
  if (t.includes('hotel') || t.includes('check-in') || t.includes('check in') || t.includes('resort') || t.includes('stay') || t.includes('check-out')) return '🏨'
  if (t.includes('breakfast') || t.includes('brunch')) return '🍳'
  if (t.includes('lunch') || t.includes('hawker') || t.includes('dine') || t.includes('restaurant') || t.includes('cafe')) return '🍽️'
  if (t.includes('dinner') || t.includes('rooftop')) return '🌆'
  if (t.includes('guide') || t.includes('tour director')) return '👤'
  if (t.includes('night safari') || t.includes('safari') || t.includes('zoo') || t.includes('bird')) return '🦁'
  if (t.includes('universal') || t.includes('theme park')) return '🎢'
  if (t.includes('garden') || t.includes('nature')) return '🌿'
  if (t.includes('cable car') || t.includes('skyride') || t.includes('ferris')) return '🚡'
  if (t.includes('wings of time') || t.includes('show') || t.includes('performance')) return '🎆'
  if (t.includes('sentosa') || t.includes('beach') || t.includes('island')) return '🏖️'
  if (t.includes('shopping') || t.includes('orchard')) return '🛍️'
  if (t.includes('museum') || t.includes('heritage') || t.includes('culture') || t.includes('art')) return '🏛️'
  if (evt.isInventoryItem) return '🎟️'
  return '📍'
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.85rem', fontWeight: 700,
  marginBottom: '0.45rem', color: '#4A5568'
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px',
  border: '1px solid #E2E8F0', outline: 'none', background: 'white',
  fontSize: '0.95rem', boxSizing: 'border-box'
}

const goldBtn: React.CSSProperties = {
  padding: '0.85rem 1.75rem',
  background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
  color: '#111', border: 'none', borderRadius: '10px',
  fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer',
  boxShadow: '0 4px 15px rgba(212,175,55,0.35)',
  transition: 'transform 0.2s, box-shadow 0.2s'
}

export default function AIPlannerPage() {
  const router = useRouter()

  const [plannerMode, setPlannerMode] = useState<'form' | 'text'>('form')
  const [textQuery, setTextQuery] = useState('')
  const [dates, setDates] = useState('4 Days')
  const [adults, setAdults] = useState(2)
  const [kids, setKids] = useState(0)
  const [vibe, setVibe] = useState('Balanced / Top Highlights')
  const [budget, setBudget] = useState('Comfort / Moderate')
  const [loading, setLoading] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [result, setResult] = useState<AIResponse | null>(null)
  const [lastParams, setLastParams] = useState<TripParams | null>(null)
  const [visibleDays, setVisibleDays] = useState<Set<number>>(new Set())

  // WhatsApp Pitch state
  const [showWaPitch, setShowWaPitch] = useState(false)
  const [waPitchText, setWaPitchText] = useState('')
  const [waCopied, setWaCopied] = useState(false)
  const [sgdToInr, setSgdToInr] = useState(74.5)

  // Fetch live exchange rate
  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(r => r.json())
      .then(d => { if (d.rate > 0) setSgdToInr(d.rate) })
      .catch(() => {})
  }, [])

  // Progress stepper animation
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (loading) {
      setProgressStep(0)
      progressRef.current = setInterval(() => {
        setProgressStep(prev => prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev)
      }, 1800)
    } else {
      if (progressRef.current) clearInterval(progressRef.current)
    }
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  }, [loading])

  // Stagger-reveal day cards
  useEffect(() => {
    if (!result?.days) return
    setVisibleDays(new Set())
    result.days.forEach((day, idx) => {
      setTimeout(() => {
        setVisibleDays(prev => new Set([...prev, day.dayNumber]))
      }, idx * 160)
    })
  }, [result])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    if (plannerMode === 'form') setLastParams({ dates, adults, kids, vibe, budget })
    try {
      const res = await fetch('/api/ai-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dates: plannerMode === 'form' ? dates : undefined,
          adults: plannerMode === 'form' ? adults : undefined,
          kids: plannerMode === 'form' ? kids : undefined,
          vibe: plannerMode === 'form' ? vibe : undefined,
          budget: plannerMode === 'form' ? budget : undefined,
          textQuery: plannerMode === 'text' ? textQuery : undefined
        })
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ error: 'Failed to communicate with AI. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = useCallback(() => {
    setResult(null); setShowWaPitch(false); setWaCopied(false)
  }, [])

  const handleEditTrip = useCallback(() => {
    setResult(null); setShowWaPitch(false)
  }, [])

  const generateWaPitch = useCallback(() => {
    if (!result) return
    const topAttractions = result.days
      ?.flatMap(d => d.events.filter(e => e.isInventoryItem && e.isAvailableInSheet !== false))
      .slice(0, 3).map(e => e.title).join(', ') || 'top attractions'
    const nights = result.days ? result.days.length - 1 : 0
    const inrEst = result.totalEstimatedPriceSGD
      ? Math.round(result.totalEstimatedPriceSGD * sgdToInr).toLocaleString('en-IN') : '—'
    setWaPitchText(
      `Hi! 🌟 Your ${nights}N/${nights + 1}D Singapore package is ready with Flying Wonders.\n\n` +
      `✅ Highlights: ${topAttractions}\n` +
      `🚗 All with private transfers included\n` +
      `💰 Estimated: S$${result.totalEstimatedPriceSGD?.toLocaleString()} (approx ₹${inrEst})\n\n` +
      `Reply YES to confirm dates & we'll lock it in! 🙏\n— Flying Wonders DMC`
    )
    setShowWaPitch(true)
  }, [result, sgdToInr])

  const handleSendToBuilder = useCallback(() => {
    if (!result?.days) return
    const nights = result.days.length > 1 ? result.days.length - 1 : 1
    const d = new Date(); d.setDate(d.getDate() + 7)
    const draft = {
      adults, kids, numNights: nights,
      arrivalDate: d.toISOString().split('T')[0],
      days: result.days.map(day => ({
        dayNumber: day.dayNumber,
        attractions: day.events
          .filter(e => e.isInventoryItem && e.isAvailableInSheet !== false)
          .map(e => e.title)
      }))
    }
    try { sessionStorage.setItem('ai_planner_draft', JSON.stringify(draft)) } catch { /* noop */ }
    router.push('/custom-package?from=ai-planner')
  }, [result, adults, kids, router])

  const inrEstimate = result?.totalEstimatedPriceSGD
    ? Math.round(result.totalEstimatedPriceSGD * sgdToInr).toLocaleString('en-IN') : null

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F0F4F8 0%, #E8F4EE 100%)', paddingBottom: '5rem' }}>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0A3728 0%, #0F4C3A 50%, #1a6b52 100%)',
        padding: '4.5rem 2rem 6rem', color: 'white', textAlign: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(212,175,55,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>✨</div>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '1rem', textShadow: '0 2px 15px rgba(0,0,0,0.3)', letterSpacing: '-0.02em' }}>
            AI Journey Planner
          </h1>
          <p style={{ maxWidth: '560px', margin: '0 auto', fontSize: '1.05rem', opacity: 0.88, lineHeight: 1.65 }}>
            Craft the perfect Singapore itinerary in seconds — powered by live pricing and our hand-picked attractions.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '980px', margin: '-4rem auto 0', padding: '0 1rem', position: 'relative', zIndex: 2 }}>

        {/* INPUT FORM */}
        {!result && !loading && (
          <div style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.10)', border: '1px solid rgba(255,255,255,0.8)' }}>
            {/* Mode Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '2rem', gap: '0.5rem' }}>
              {[{ id: 'form', label: '📋 Form Planner' }, { id: 'text', label: '✍️ Paste Requirements' }].map(tab => (
                <button key={tab.id} onClick={() => setPlannerMode(tab.id as 'form' | 'text')} style={{
                  padding: '0.75rem 1.5rem', border: 'none', background: 'transparent',
                  borderBottom: plannerMode === tab.id ? '3px solid #1a6b52' : '3px solid transparent',
                  color: plannerMode === tab.id ? '#1a6b52' : '#718096',
                  fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', marginBottom: '-2px', transition: 'all 0.2s'
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleGenerate}>
              {plannerMode === 'form' ? (
                <div>
                  <h2 style={{ color: '#1A202C', fontSize: '1.25rem', marginBottom: '1.75rem', fontWeight: 700 }}>Tell us about your trip</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div>
                      <label style={labelStyle}>Duration / Dates</label>
                      <input type="text" value={dates} onChange={e => setDates(e.target.value)} placeholder="e.g. 4 Days or Oct 10-14" style={inputStyle} required={plannerMode === 'form'} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Adults</label>
                        <input type="number" min="1" value={adults} onChange={e => setAdults(Number(e.target.value))} style={inputStyle} required />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Kids</label>
                        <input type="number" min="0" value={kids} onChange={e => setKids(Number(e.target.value))} style={inputStyle} required />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Travel Vibe</label>
                      <select value={vibe} onChange={e => setVibe(e.target.value)} style={inputStyle}>
                        <option>Balanced / Top Highlights</option>
                        <option>Family Friendly &amp; Relaxed</option>
                        <option>Action &amp; Adventure</option>
                        <option>Romantic Getaway</option>
                        <option>Nature &amp; Culture Focus</option>
                        <option>MICE / Corporate Group</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Budget</label>
                      <select value={budget} onChange={e => setBudget(e.target.value)} style={inputStyle}>
                        <option>Standard / Cost Conscious</option>
                        <option>Comfort / Moderate</option>
                        <option>Luxury / Premium</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ color: '#1A202C', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>Paste Text Requirements</h2>
                  <p style={{ color: '#718096', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.55 }}>
                    Paste emails, draft messages, or custom specifications — the AI will auto-parse and price using live rates.
                  </p>
                  <textarea value={textQuery} onChange={e => setTextQuery(e.target.value)}
                    placeholder="Dear Sir/Madam, please provide a quote for 2 adults and 1 child (age 8) for 4 nights in Singapore from Oct 10..."
                    required={plannerMode === 'text'}
                    style={{ ...inputStyle, height: '210px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.95rem' }} />
                </div>
              )}
              <button type="submit" style={{ width: '100%', padding: '1rem 2rem', fontSize: '1.05rem', background: 'linear-gradient(135deg, #D4AF37, #B8860B)', color: '#111', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(212,175,55,0.35)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(212,175,55,0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(212,175,55,0.35)' }}>
                {plannerMode === 'form' ? '✨ Generate My Itinerary' : '⚡ Parse & Price Requirements'}
              </button>
            </form>
          </div>
        )}

        {/* PROGRESS STEPPER */}
        {loading && (
          <div style={{ background: 'white', padding: '3.5rem 2rem', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.10)', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem', display: 'inline-block', animation: 'float 2s ease-in-out infinite' }}>✈️</div>
            <h2 style={{ color: '#1A202C', fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 700 }}>
              {plannerMode === 'form' ? 'Crafting your perfect journey…' : 'Parsing & pricing your requirements…'}
            </h2>
            <div style={{ maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {PROGRESS_STEPS.map((step, idx) => {
                const isDone = idx < progressStep
                const isActive = idx === progressStep
                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.25rem', borderRadius: '10px',
                    background: isDone ? '#F0FFF4' : isActive ? '#FFFBEB' : '#F8FAFC',
                    border: `1px solid ${isDone ? '#C6F6D5' : isActive ? '#FBD38D' : '#E2E8F0'}`,
                    transition: 'all 0.4s ease', opacity: idx > progressStep ? 0.4 : 1
                  }}>
                    <span style={{ fontSize: '1.4rem', minWidth: '2rem' }}>{isDone ? '✅' : step.icon}</span>
                    <span style={{ fontWeight: isActive ? 700 : 500, color: isDone ? '#276749' : isActive ? '#744210' : '#718096', fontSize: '0.95rem' }}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* RESULT */}
        {result && !loading && (
          <div>
            {result.error ? (
              <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', padding: '2.5rem', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
                <h3 style={{ color: '#C53030', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Something went wrong</h3>
                <p style={{ color: '#9B2C2C' }}>{result.error}</p>
                {result.details && <p style={{ fontSize: '0.8rem', color: '#9B2C2C', opacity: 0.7, marginTop: '0.5rem', wordBreak: 'break-all' }}>Details: {result.details}</p>}
                <button onClick={handleReset} style={{ ...goldBtn, marginTop: '1.5rem' }}>Try Again</button>
              </div>
            ) : (
              <>
                {/* Trip Pill Bar */}
                {lastParams && (
                  <div style={{ background: 'white', borderRadius: '12px', padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
                    {[
                      `👥 ${lastParams.adults} Adult${lastParams.adults > 1 ? 's' : ''}${lastParams.kids > 0 ? ` · ${lastParams.kids} Child${lastParams.kids > 1 ? 'ren' : ''}` : ''}`,
                      `🗓️ ${lastParams.dates}`, `🌴 ${lastParams.vibe}`, `💳 ${lastParams.budget}`
                    ].map((pill, i) => (
                      <span key={i} style={{ background: '#F0FFF4', color: '#276749', border: '1px solid #C6F6D5', borderRadius: '999px', padding: '0.3rem 0.85rem', fontSize: '0.82rem', fontWeight: 600 }}>{pill}</span>
                    ))}
                    <button onClick={handleEditTrip} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid #CBD5E0', color: '#4A5568', borderRadius: '8px', padding: '0.3rem 0.85rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                      ✏️ Edit Trip
                    </button>
                  </div>
                )}

                {/* Summary Card */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.07)', marginBottom: '1.5rem', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <span style={{ background: '#0F4C3A', color: 'white', borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', display: 'inline-block', marginBottom: '0.75rem' }}>AI GENERATED</span>
                      <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.9rem', color: '#0F4C3A', margin: '0 0 0.85rem', lineHeight: 1.2 }}>Your Custom Itinerary</h2>
                      <p style={{ color: '#4A5568', lineHeight: 1.7, fontSize: '1rem', margin: 0 }}>{result.tripSummary}</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #0A3728, #0F4C3A)', color: 'white', padding: '1.5rem 1.75rem', borderRadius: '16px', textAlign: 'center', minWidth: '200px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Estimated Attraction Cost</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F6D860' }}>S$ {result.totalEstimatedPriceSGD?.toLocaleString()}</div>
                      {inrEstimate && <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '0.25rem' }}>≈ ₹{inrEstimate}</div>}
                      <div style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: '0.5rem' }}>*Tickets only. Excludes hotel & flights.</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.85rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
                    <button onClick={handleSendToBuilder} style={{ ...goldBtn, flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}>
                      🚀 Customize in B2B Builder
                    </button>
                    <button onClick={generateWaPitch} style={{ flex: '1 1 180px', padding: '0.85rem 1.5rem', border: '1px solid #C6F6D5', background: '#F0FFF4', color: '#276749', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#C6F6D5' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#F0FFF4' }}>
                      📱 WhatsApp Pitch
                    </button>
                    <button onClick={handleReset} style={{ flex: '0 0 auto', padding: '0.85rem 1.25rem', border: '1px solid #E2E8F0', background: 'white', color: '#718096', borderRadius: '10px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
                      🔄 Start Over
                    </button>
                  </div>
                </div>

                {/* WhatsApp Pitch Panel */}
                {showWaPitch && (
                  <div style={{ background: 'white', border: '1px solid #C6F6D5', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0, color: '#276749', fontSize: '1.1rem', fontWeight: 700 }}>📱 WhatsApp Pitch Generator</h3>
                      <button onClick={() => setShowWaPitch(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096', fontSize: '1.2rem' }}>✕</button>
                    </div>
                    <p style={{ color: '#718096', fontSize: '0.82rem', marginBottom: '1rem' }}>Edit below, then copy or send directly to your client.</p>
                    <textarea value={waPitchText} onChange={e => setWaPitchText(e.target.value)} rows={8}
                      style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem', resize: 'vertical' }} />
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button onClick={() => { navigator.clipboard.writeText(waPitchText); setWaCopied(true); setTimeout(() => setWaCopied(false), 2500) }}
                        style={{ flex: '1 1 160px', padding: '0.8rem 1.25rem', borderRadius: '8px', border: '1px solid #CBD5E0', background: waCopied ? '#F0FFF4' : 'white', color: waCopied ? '#276749' : '#4A5568', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s' }}>
                        {waCopied ? '✅ Copied!' : '📋 Copy to Clipboard'}
                      </button>
                      <a href={`https://wa.me/?text=${encodeURIComponent(waPitchText)}`} target="_blank" rel="noreferrer"
                        style={{ flex: '1 1 160px', padding: '0.8rem 1.25rem', borderRadius: '8px', background: '#25D366', color: 'white', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 3px 10px rgba(37,211,102,0.3)' }}>
                        📤 Open in WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                {/* Day Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {result.days?.map((day, dayIdx) => {
                    const color = DAY_COLORS[dayIdx % DAY_COLORS.length]
                    const isVisible = visibleDays.has(day.dayNumber)
                    return (
                      <div key={day.dayNumber} style={{
                        background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        overflow: 'hidden', border: '1px solid #E2E8F0',
                        opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
                        transition: 'opacity 0.4s ease, transform 0.4s ease'
                      }}>
                        {/* Day header */}
                        <div style={{ background: `linear-gradient(135deg, ${color.bg}, ${color.accent})`, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: 'white', flexShrink: 0 }}>
                            {day.dayNumber}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.75, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white' }}>Day {day.dayNumber}</div>
                            <div style={{ color: 'white', fontWeight: 700, fontSize: '1.05rem' }}>{day.title}</div>
                          </div>
                        </div>

                        {/* Events */}
                        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          {day.events.map((evt, idx) => {
                            const isAvailable = evt.isAvailableInSheet !== false
                            const icon = getEventIcon(evt)
                            return (
                              <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ minWidth: '52px', fontSize: '0.78rem', fontWeight: 700, color: '#718096', paddingTop: '0.85rem', textAlign: 'right' }}>{evt.time}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '0.85rem' }}>
                                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: !isAvailable ? '#FC8181' : evt.isInventoryItem ? color.accent : '#CBD5E0', border: `2px solid ${!isAvailable ? '#FEB2B2' : evt.isInventoryItem ? color.bg : '#E2E8F0'}` }} />
                                  {idx < day.events.length - 1 && <div style={{ width: '2px', flex: 1, minHeight: '30px', background: '#E2E8F0', marginTop: '3px' }} />}
                                </div>
                                <div style={{ flex: 1, padding: '0.85rem 1rem', borderRadius: '10px', background: !isAvailable ? '#FFF5F5' : evt.isInventoryItem ? color.light : '#F8FAFC', border: `1px solid ${!isAvailable ? '#FEB2B2' : evt.isInventoryItem ? '#C6F6D5' : '#E2E8F0'}` }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                    <div style={{ fontWeight: 700, color: !isAvailable ? '#C53030' : '#2D3748', fontSize: '0.97rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                      <span>{icon}</span>
                                      <span>{evt.title}</span>
                                      {evt.isInventoryItem && isAvailable && (
                                        <span style={{ fontSize: '0.65rem', background: color.bg, color: 'white', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE RATE</span>
                                      )}
                                      {!isAvailable && (
                                        <span style={{ fontSize: '0.65rem', background: '#FEB2B2', color: '#742A2A', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>RATE ON REQUEST</span>
                                      )}
                                    </div>
                                    {evt.isInventoryItem && isAvailable && evt.priceSGD > 0 && (
                                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: color.accent, background: 'white', border: `1px solid ${color.accent}`, padding: '0.15rem 0.6rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                        S$ {evt.priceSGD.toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                  <div style={{ color: '#4A5568', fontSize: '0.88rem', lineHeight: 1.55 }}>{evt.description}</div>
                                  {!isAvailable && evt.suggestedAlternatives && evt.suggestedAlternatives.length > 0 && (
                                    <div style={{ marginTop: '0.65rem', padding: '0.6rem 0.85rem', background: 'rgba(229,62,62,0.05)', borderRadius: '6px', borderLeft: '3px solid #FC8181', fontSize: '0.8rem', color: '#9B2C2C' }}>
                                      <strong>⚠️ Rate not in master sheet.</strong> Alternatives: {evt.suggestedAlternatives.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Bottom Handoff CTA */}
                <div style={{ textAlign: 'center', marginTop: '2.5rem', background: 'linear-gradient(135deg, #0A3728 0%, #1E293B 100%)', padding: '3rem 2rem', borderRadius: '20px', color: 'white', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-playfair), serif', margin: '0 0 0.75rem' }}>Ready to make this real?</h3>
                  <p style={{ opacity: 0.85, marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.65, fontSize: '0.98rem' }}>
                    Load this itinerary into the B2B Builder to fine-tune day plans, add hotels, and generate a client-ready PDF proposal.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={handleSendToBuilder} style={{ ...goldBtn, padding: '0.95rem 2.5rem', fontSize: '1rem' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}>
                      🚀 Open in B2B Builder
                    </button>
                    <a href={`https://wa.me/919886171251?text=${encodeURIComponent('Hi Flying Wonders! I have an AI-generated itinerary I\'d like to confirm: ' + (result.tripSummary || ''))}`}
                      target="_blank" rel="noreferrer"
                      style={{ background: '#25D366', color: 'white', border: 'none', padding: '0.95rem 2.5rem', fontSize: '1rem', fontWeight: 700, borderRadius: '10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(37,211,102,0.3)', transition: 'transform 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none' }}>
                      💬 Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      ` }} />
    </div>
  )
}
