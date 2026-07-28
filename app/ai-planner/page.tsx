'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface ItineraryDay {
  dayNumber: number
  title: string
  events: {
    time: string
    title: string
    description: string
    isInventoryItem: boolean
    priceSGD: number
  }[]
}

interface AIResponse {
  tripSummary?: string
  totalEstimatedPriceSGD?: number
  days?: ItineraryDay[]
  error?: string
}

export default function AIPlannerPage() {
  const [dates, setDates] = useState('3 Days')
  const [adults, setAdults] = useState(2)
  const [kids, setKids] = useState(0)
  const [vibe, setVibe] = useState('Balanced / Top Highlights')
  const [budget, setBudget] = useState('Standard')
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIResponse | null>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/ai-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates, adults, kids, vibe, budget })
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error(err)
      setResult({ error: 'Failed to communicate with AI. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0F4C3A 0%, #1a6b52 100%)', padding: '4rem 2rem', color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.5rem', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
          ✨ AI Journey Planner
        </h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', opacity: 0.9 }}>
          Let our intelligent assistant craft the perfect Singapore itinerary for you in seconds, using live pricing and our hand-picked attractions.
        </p>
      </div>

      <div className="container" style={{ maxWidth: '1000px', margin: '-3rem auto 0', padding: '0 1rem' }}>
        {/* Input Form */}
        {!result && !loading && (
          <form onSubmit={handleGenerate} className="glass" style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            <h2 style={{ color: 'var(--text-dark)', fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>Tell us about your trip</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#4A5568' }}>Duration / Dates</label>
                <input type="text" value={dates} onChange={e => setDates(e.target.value)} placeholder="e.g. 4 Days or Oct 10-14" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#4A5568' }}>Adults</label>
                  <input type="number" min="1" value={adults} onChange={e => setAdults(Number(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#4A5568' }}>Kids</label>
                  <input type="number" min="0" value={kids} onChange={e => setKids(Number(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#4A5568' }}>Travel Vibe</label>
                <select value={vibe} onChange={e => setVibe(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                  <option>Balanced / Top Highlights</option>
                  <option>Family Friendly & Relaxed</option>
                  <option>Action & Adventure</option>
                  <option>Romantic Getaway</option>
                  <option>Nature & Culture Focus</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#4A5568' }}>Budget</label>
                <select value={budget} onChange={e => setBudget(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                  <option>Standard / Cost Conscious</option>
                  <option>Comfort / Moderate</option>
                  <option>Luxury / Premium</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: 'var(--gold-accent)', color: '#111', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
              Generate My Itinerary ✨
            </button>
          </form>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ background: 'white', padding: '4rem 2rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>✨</div>
            <h2 style={{ color: 'var(--text-dark)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Crafting your journey...</h2>
            <p style={{ color: '#718096' }}>Our AI is selecting the best attractions and calculating live prices.</p>
          </div>
        )}

        {/* Result State */}
        {result && !loading && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {result.error ? (
              <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', padding: '2rem', borderRadius: '16px', textAlign: 'center', color: '#C53030' }}>
                <h3>Oops!</h3>
                <p>{result.error}</p>
                {(result as any).details && (
                  <p style={{ fontSize: '0.85rem', color: '#9B2C2C', opacity: 0.8, marginTop: '0.5rem', wordBreak: 'break-all' }}>
                    Error Details: {(result as any).details}
                  </p>
                )}
                <button onClick={() => setResult(null)} className="btn btn-primary" style={{ marginTop: '1rem' }}>Try Again</button>
              </div>
            ) : (
              <>
                {/* Summary Card */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2rem', color: 'var(--emerald-primary)', margin: '0 0 1rem' }}>Your Custom Itinerary</h2>
                      <p style={{ color: '#4A5568', lineHeight: 1.6, fontSize: '1.05rem', margin: 0 }}>{result.tripSummary}</p>
                    </div>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', minWidth: '200px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Estimated Attraction Cost</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold-accent)' }}>S$ {result.totalEstimatedPriceSGD?.toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: '#A0AEC0', marginTop: '0.5rem' }}>*AI generated - Human agent to confirm details</div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {result.days?.map(day => (
                    <div key={day.dayNumber} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                      <h3 style={{ margin: '0 0 1.5rem', color: 'var(--emerald-secondary)', fontSize: '1.3rem', borderBottom: '2px solid #EDF2F7', paddingBottom: '0.75rem' }}>
                        Day {day.dayNumber}: {day.title}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {day.events.map((evt, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '60px', fontWeight: 700, color: '#718096', paddingTop: '0.2rem' }}>{evt.time}</div>
                            <div style={{ flex: 1, background: evt.isInventoryItem ? '#F0FFF4' : '#F7FAFC', border: evt.isInventoryItem ? '1px solid #C6F6D5' : '1px solid #E2E8F0', padding: '1rem', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <div style={{ fontWeight: 700, color: '#2D3748', fontSize: '1.1rem' }}>
                                  {evt.isInventoryItem && <span style={{ marginRight: '0.5rem' }}>🎟️</span>}
                                  {evt.title}
                                </div>
                                {evt.isInventoryItem && evt.priceSGD > 0 && (
                                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38A169' }}>S$ {evt.priceSGD}</div>
                                )}
                              </div>
                              <div style={{ color: '#4A5568', fontSize: '0.95rem', lineHeight: 1.5 }}>{evt.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Handoff */}
                <div style={{ textAlign: 'center', marginTop: '3rem', background: 'linear-gradient(135deg, var(--bg-dark) 0%, #1E293B 100%)', padding: '3rem 2rem', borderRadius: '16px', color: 'white' }}>
                  <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-playfair), serif', margin: '0 0 1rem' }}>Ready to make this a reality?</h3>
                  <p style={{ opacity: 0.9, marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                    Send this itinerary to our expert travel agents. We will confirm availability, finalize the pricing, and lock in your dream vacation.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <a href={`https://wa.me/6591234567?text=Hi, I would like to book the following AI generated itinerary: ${result.tripSummary}`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ background: '#25D366', color: 'white', border: 'none', padding: '1rem 2rem', fontSize: '1.1rem' }}>
                      💬 WhatsApp Us
                    </a>
                    <button onClick={() => setResult(null)} className="btn btn-secondary" style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '1rem 2rem', fontSize: '1.1rem' }}>
                      Start Over
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  )
}
