'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from 'next-sanity'

// Inline Sanity client for client component
const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

interface Experience {
  _id: string
  title: string
  category: string
  priceINR: number
  description?: string
  duration?: string
}

const TIER_BASE_PRICES: Record<string, number> = {
  budget: 25000,
  premium: 55000,
  solo: 32000,
  groups: 22000,
}

const TIER_LABELS: Record<string, string> = {
  budget: 'Budget Explorer',
  premium: 'Premium Luxury',
  solo: 'Solo Adventurer',
  groups: 'Groups & Families',
}

// Fallback experiences if Sanity is empty
const FALLBACK_EXPERIENCES: Experience[] = [
  { _id: 'f1', title: 'Universal Studios Singapore', category: 'theme_park', priceINR: 5500 },
  { _id: 'f2', title: 'Gardens by the Bay', category: 'nature', priceINR: 2800 },
  { _id: 'f3', title: 'Marina Bay Sands SkyPark', category: 'luxury', priceINR: 3200 },
  { _id: 'f4', title: 'Sentosa Island Day Pass', category: 'adventure', priceINR: 4500 },
  { _id: 'f5', title: 'Night Safari Expedition', category: 'nature', priceINR: 4800 },
  { _id: 'f6', title: 'Heritage Hawker Food Tour', category: 'food', priceINR: 3500 },
  { _id: 'f7', title: 'Jewel Changi Experience', category: 'luxury', priceINR: 2200 },
  { _id: 'f8', title: 'Singapore Science Centre', category: 'cultural', priceINR: 1800 },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.875rem 1rem',
  borderRadius: '8px',
  border: '1px solid #CBD5E1',
  fontSize: '1rem',
  background: '#FAFAFA',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  marginBottom: '0.5rem',
  fontSize: '0.95rem',
}

export default function BookingCustomizer() {
  const [step, setStep] = useState(1)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const [formData, setFormData] = useState({
    tier: 'solo',
    travelers: 1,
    date: '',
    selectedExperiences: [] as string[],
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  // Fetch experiences from Sanity
  useEffect(() => {
    async function fetchExperiences() {
      try {
        const query = `*[_type == "experience"]{ _id, title, category, priceINR, description, duration }`
        const data = await client.fetch(query)
        setExperiences(data && data.length > 0 ? data : FALLBACK_EXPERIENCES)
      } catch {
        setExperiences(FALLBACK_EXPERIENCES)
      }
    }
    fetchExperiences()
  }, [])

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const toggleExperience = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedExperiences: prev.selectedExperiences.includes(id)
        ? prev.selectedExperiences.filter(e => e !== id)
        : [...prev.selectedExperiences, id],
    }))
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 4))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  // Live price calculation
  const selectedExpDetails = useMemo(
    () => experiences.filter(e => formData.selectedExperiences.includes(e._id)),
    [experiences, formData.selectedExperiences]
  )

  const totalPrice = useMemo(() => {
    const base = TIER_BASE_PRICES[formData.tier] || 25000
    const experienceTotal = selectedExpDetails.reduce((sum, exp) => sum + exp.priceINR, 0)
    return base + experienceTotal
  }, [formData.tier, selectedExpDetails])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        travelDate: formData.date,
        tier: formData.tier,
        travelers: formData.travelers,
        experiences: selectedExpDetails.map(exp => ({ title: exp.title, priceINR: exp.priceINR })),
        totalPrice,
        notes: formData.notes,
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setSubmitStatus('success')
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈️</div>
        <h2 style={{ color: 'var(--emerald-secondary)', marginBottom: '1rem' }}>Request Submitted Successfully!</h2>
        <p style={{ opacity: 0.8, maxWidth: '500px', margin: '0 auto 2rem auto' }}>
          Our travel architects will review your custom package and get back to you within 24 hours at <strong>{formData.email}</strong>.
        </p>
        <a href="/" className="btn btn-primary">Back to Home</a>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
      {/* Left: Multi-step Form */}
      <div>
        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(0,0,0,0.1)', zIndex: 0 }}></div>
          {[1, 2, 3, 4].map(num => (
            <div key={num} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: step >= num ? 'var(--crimson-primary)' : '#CBD5E1',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1, fontWeight: 'bold', fontSize: '0.9rem',
              transition: 'background 0.3s ease',
            }}>
              {step > num ? '✓' : num}
            </div>
          ))}
        </div>

        <form onSubmit={submit}>
          {/* Step 1: Traveler Profile */}
          {step === 1 && (
            <div>
              <h2 style={{ color: 'var(--crimson-primary)', marginBottom: '0.5rem' }}>Step 1: Traveler Profile</h2>
              <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Tell us about your ideal trip style.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {Object.entries(TIER_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateForm('tier', value)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: formData.tier === value ? '2px solid var(--crimson-primary)' : '2px solid #E2E8F0',
                      background: formData.tier === value ? 'rgba(153,0,0,0.05)' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: formData.tier === value ? 'var(--crimson-primary)' : '#333' }}>{label}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '4px' }}>From ₹{TIER_BASE_PRICES[value].toLocaleString('en-IN')}/person</div>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <label style={labelStyle}>Number of Travelers</label>
                <input
                  type="number" min="1" max="50"
                  value={formData.travelers}
                  onChange={e => updateForm('travelers', parseInt(e.target.value) || 1)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Step 2: Choose Experiences */}
          {step === 2 && (
            <div>
              <h2 style={{ color: 'var(--crimson-primary)', marginBottom: '0.5rem' }}>Step 2: Choose Experiences</h2>
              <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Select the attractions you want to include.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {experiences.map(exp => {
                  const isSelected = formData.selectedExperiences.includes(exp._id)
                  return (
                    <label
                      key={exp._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1rem 1.25rem', borderRadius: '12px',
                        border: isSelected ? '2px solid var(--emerald-secondary)' : '2px solid #E2E8F0',
                        background: isSelected ? 'rgba(0,168,89,0.05)' : 'white',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleExperience(exp._id)}
                        style={{ width: '20px', height: '20px', accentColor: 'var(--emerald-secondary)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{exp.title}</div>
                        {exp.duration && <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{exp.duration}</div>}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--emerald-secondary)', whiteSpace: 'nowrap' }}>
                        ₹{exp.priceINR.toLocaleString('en-IN')}
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Travel Date & Notes */}
          {step === 3 && (
            <div>
              <h2 style={{ color: 'var(--crimson-primary)', marginBottom: '0.5rem' }}>Step 3: Travel Dates & Notes</h2>
              <p style={{ opacity: 0.7, marginBottom: '2rem' }}>When are you planning to visit?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Travel Date *</label>
                  <input
                    type="date" required
                    value={formData.date}
                    onChange={e => updateForm('date', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Special Requests / Notes</label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={e => updateForm('notes', e.target.value)}
                    placeholder="Any dietary requirements, accessibility needs, hotel preferences..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contact & Schedule */}
          {step === 4 && (
            <div>
              <h2 style={{ color: 'var(--crimson-primary)', marginBottom: '0.5rem' }}>Step 4: Contact & Schedule</h2>
              <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Provide your contact details so we can finalize the booking.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Your Name *</label>
                  <input
                    type="text" required placeholder="Enter your full name"
                    value={formData.name}
                    onChange={e => updateForm('name', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input
                    type="email" required placeholder="Enter your email"
                    value={formData.email}
                    onChange={e => updateForm('email', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input
                    type="tel" required placeholder="Enter mobile number"
                    value={formData.phone}
                    onChange={e => updateForm('phone', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1.5rem' }}>
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="btn" style={{ background: '#CBD5E1', color: '#1A202C' }}>
                ← Previous
              </button>
            ) : <div></div>}

            {step < 4 ? (
              <button type="button" onClick={nextStep} className="btn btn-primary">
                Next Step →
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? 'Sending...' : 'Submit Custom Request ✈'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Right: Live Custom Package Proposal */}
      <div style={{
        position: 'sticky', top: '100px',
        background: 'white',
        border: '2px solid #E2E8F0',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{ background: 'var(--crimson-primary)', color: 'white', padding: '1.25rem 1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Custom Package Proposal</h3>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--crimson-primary)', fontWeight: 700, marginBottom: '1rem' }}>
            LIVE BUILDER
          </div>

          {/* Traveler Profile */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.5, marginBottom: '4px' }}>Traveler Profile:</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{TIER_LABELS[formData.tier]}</div>
          </div>

          {/* Comfort Tier */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.5, marginBottom: '4px' }}>Comfort Tier:</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{TIER_LABELS[formData.tier]}</div>
          </div>

          {/* Travelers */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.5, marginBottom: '4px' }}>Party Size:</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formData.travelers} {formData.travelers === 1 ? 'Traveler' : 'Travelers'}</div>
          </div>

          {/* Included Experiences */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.5, marginBottom: '8px' }}>Included Experiences:</div>
            {selectedExpDetails.length > 0 ? (
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                {selectedExpDetails.map(exp => (
                  <li key={exp._id} style={{ marginBottom: '4px', fontSize: '0.95rem' }}>{exp.title}</li>
                ))}
              </ul>
            ) : (
              <p style={{ opacity: 0.4, fontStyle: 'italic', fontSize: '0.9rem', margin: 0 }}>No experiences selected yet</p>
            )}
          </div>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '2px solid #E2E8F0', margin: '1.5rem 0' }} />

          {/* Estimated Price */}
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.5, marginBottom: '4px' }}>Estimated Package Value:</div>
            <div style={{ fontWeight: 800, fontSize: '1.8rem', color: 'var(--crimson-primary)' }}>
              ₹{totalPrice.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>Per Person</div>
          </div>

          {/* Guarantee Badge */}
          <div style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            background: 'rgba(0,168,89,0.08)',
            borderRadius: '8px',
            borderLeft: '4px solid var(--emerald-secondary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--emerald-secondary)',
          }}>
            🛡️ Price protected under best price guarantee.
          </div>
        </div>
      </div>
    </div>
  )
}
