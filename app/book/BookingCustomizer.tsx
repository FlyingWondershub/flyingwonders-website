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
  imageUrl?: string
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

// Highly professional Singapore landmarks images
const FALLBACK_EXPERIENCES: Experience[] = [
  { _id: 'f1', title: 'Universal Studios Singapore', category: 'theme_park', priceINR: 5500, duration: 'Full Day Ticket', imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a52b?auto=format&fit=crop&w=400&q=80' },
  { _id: 'f2', title: 'Gardens by the Bay (Flower Dome & Cloud Forest)', category: 'nature', priceINR: 2800, duration: 'Half Day', imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&q=80' },
  { _id: 'f3', title: 'Marina Bay Sands SkyPark & Observation Deck', category: 'luxury', priceINR: 3200, duration: '2 Hours Access', imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80' },
  { _id: 'f4', title: 'Luxury Sentosa Island Yacht & Beach Club Day', category: 'adventure', priceINR: 9500, duration: 'Full Day', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
  { _id: 'f5', title: 'Night Safari Private Tram Expedition', category: 'nature', priceINR: 4800, duration: 'Evening Ticket', imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=400&q=80' },
  { _id: 'f6', title: 'Private Heritage Hawker Food Tasting Tour', category: 'food', priceINR: 3500, duration: '3 Hours', imageUrl: 'https://images.unsplash.com/photo-1626804475315-992d9d1ef035?auto=format&fit=crop&w=400&q=80' },
  { _id: 'f7', title: 'Jewel Changi Canopy Park & Changi Experience', category: 'luxury', priceINR: 2200, duration: 'Flexible Entry', imageUrl: 'https://images.unsplash.com/photo-1570533317769-cf722b512c1d?auto=format&fit=crop&w=400&q=80' },
  { _id: 'f8', title: 'Science Centre & Omni-Theatre Experience', category: 'cultural', priceINR: 1800, duration: 'Half Day', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.875rem 1rem',
  borderRadius: '8px',
  border: '1px solid #CBD5E1',
  fontSize: '1rem',
  background: '#FAFAFA',
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
  const [isMobile, setIsMobile] = useState(false)

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

  // Check window size dynamically for mobile layout responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch experiences from Sanity CMS
  useEffect(() => {
    async function fetchExperiences() {
      try {
        const query = `*[_type == "experience"]{ _id, title, category, priceINR, description, duration, "imageUrl": image.asset->url }`
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

  // Live calculations
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

  // Pre-filled WhatsApp fallback
  const handleWhatsAppRedirect = () => {
    const message = `Hello Flying Wonders! I would like to request a Custom Singapore Package.%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.phone}%0A*Date:* ${formData.date}%0A*Profile:* ${TIER_LABELS[formData.tier]}%0A*Travelers:* ${formData.travelers}%0A*Total Est. Cost:* ₹${totalPrice.toLocaleString('en-IN')}/person%0A*Selected Experiences:*%0A${selectedExpDetails.map(e => `- ${e.title}`).join('%0A')}%0A%0A*Notes:* ${formData.notes || 'None'}`
    window.open(`https://wa.me/919886171251?text=${message}`, '_blank')
  }

  if (submitStatus === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈️</div>
        <h2 style={{ color: 'var(--emerald-secondary)', marginBottom: '1rem' }}>Request Received!</h2>
        <p style={{ opacity: 0.8, maxWidth: '500px', margin: '0 auto 2rem auto' }}>
          Your request has been successfully logged. We will reach out to you within 24 hours to confirm your custom itinerary.
        </p>
        <button onClick={handleWhatsAppRedirect} className="btn btn-primary" style={{ background: '#25D366', boxShadow: 'none' }}>
          Chat on WhatsApp for Instant Confirmation
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', 
      gap: '2.5rem', 
      alignItems: 'start' 
    }}>
      
      {/* Left: Form Flow */}
      <div className="glass" style={{ padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '16px' }}>
        {/* Step Indicator */}
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
          {step === 1 && (
            <div>
              <h2 style={{ color: 'var(--crimson-primary)', marginBottom: '0.5rem' }}>Traveler Profile</h2>
              <p style={{ opacity: 0.7, marginBottom: '2rem', fontSize: '0.9rem' }}>Select the travel style that best matches your expectations.</p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                {Object.entries(TIER_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateForm('tier', value)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: formData.tier === value ? '2px solid var(--crimson-primary)' : '2px solid #E2E8F0',
                      background: formData.tier === value ? 'rgba(153,0,0,0.04)' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: formData.tier === value ? 'var(--crimson-primary)' : '#333' }}>{label}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '4px' }}>Base: ₹{TIER_BASE_PRICES[value].toLocaleString('en-IN')}/person</div>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <label style={labelStyle}>Number of Travelers</label>
                <input
                  type="number" min="1" max="100"
                  value={formData.travelers}
                  onChange={e => updateForm('travelers', parseInt(e.target.value) || 1)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ color: 'var(--crimson-primary)', marginBottom: '0.5rem' }}>Included Hotspots & Experiences</h2>
              <p style={{ opacity: 0.7, marginBottom: '2rem', fontSize: '0.9rem' }}>Select the Singapore hotspots you want added to your itinerary.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {experiences.map(exp => {
                  const isSelected = formData.selectedExperiences.includes(exp._id)
                  return (
                    <div
                      key={exp._id}
                      onClick={() => toggleExperience(exp._id)}
                      style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: '1rem',
                        alignItems: isMobile ? 'stretch' : 'center',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid var(--emerald-secondary)' : '1px solid #E2E8F0',
                        background: isSelected ? 'rgba(0,168,89,0.03)' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {exp.imageUrl && (
                        <div style={{ width: isMobile ? '100%' : '80px', height: isMobile ? '120px' : '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={exp.imageUrl} alt={exp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{exp.title}</div>
                        {exp.duration && <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '2px' }}>{exp.duration}</div>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: isMobile ? '0.5rem' : '0' }}>
                        <span style={{ fontWeight: 800, color: 'var(--emerald-secondary)', marginRight: '1rem' }}>
                          ₹{exp.priceINR.toLocaleString('en-IN')}
                        </span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          style={{ width: '18px', height: '18px', accentColor: 'var(--emerald-secondary)' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ color: 'var(--crimson-primary)', marginBottom: '0.5rem' }}>Step 3: Schedule Details</h2>
              <p style={{ opacity: 0.7, marginBottom: '2rem', fontSize: '0.9rem' }}>Choose your approximate departure date.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Proposed Travel Date *</label>
                  <input
                    type="date" required
                    value={formData.date}
                    onChange={e => updateForm('date', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Special Instructions & Requests</label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={e => updateForm('notes', e.target.value)}
                    placeholder="E.g. vegetarian meals, specific hotel tier, flight itinerary..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ color: 'var(--crimson-primary)', marginBottom: '0.5rem' }}>Step 4: Contact & Finalize</h2>
              <p style={{ opacity: 0.7, marginBottom: '2rem', fontSize: '0.9rem' }}>Fill in your contact information so we can generate your PDF proposal.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    type="text" required placeholder="Enter full name"
                    value={formData.name}
                    onChange={e => updateForm('name', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input
                    type="email" required placeholder="name@domain.com"
                    value={formData.email}
                    onChange={e => updateForm('email', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp Phone Number *</label>
                  <input
                    type="tel" required placeholder="E.g. +91 98861 71251"
                    value={formData.phone}
                    onChange={e => updateForm('phone', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Nav Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1.5rem' }}>
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="btn" style={{ background: '#E2E8F0', color: '#333' }}>
                ← Back
              </button>
            ) : <div></div>}

            {step < 4 ? (
              <button type="button" onClick={nextStep} className="btn btn-primary">
                Next Step →
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Right: Custom Package Proposal Module */}
      <div style={{
        background: '#FFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
      }}>
        <div style={{ background: 'var(--crimson-primary)', color: 'white', padding: '1.25rem 1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Custom Package Proposal</h3>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--crimson-primary)', fontWeight: 700, marginBottom: '1rem' }}>
            LIVE BUILDER SUMMARY
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Traveler Profile:</div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{TIER_LABELS[formData.tier]}</div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Comfort Tier:</div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{TIER_LABELS[formData.tier]}</div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Included Experiences:</div>
            {selectedExpDetails.length > 0 ? (
              <ul style={{ paddingLeft: '1.25rem', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                {selectedExpDetails.map(exp => (
                  <li key={exp._id} style={{ marginBottom: '4px' }}>{exp.title}</li>
                ))}
              </ul>
            ) : (
              <p style={{ opacity: 0.4, fontStyle: 'italic', fontSize: '0.85rem', margin: '4px 0 0 0' }}>No attractions chosen yet</p>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '1rem 0' }} />

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Estimated Package Value:</div>
            <div style={{ fontWeight: 800, fontSize: '1.8rem', color: 'var(--crimson-primary)' }}>
              ₹{totalPrice.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Per Person</div>
          </div>

          <div style={{
            padding: '0.75rem',
            background: 'rgba(0,168,89,0.06)',
            borderRadius: '8px',
            borderLeft: '4px solid var(--emerald-secondary)',
            fontSize: '0.75rem',
            color: 'var(--emerald-secondary)',
            fontWeight: 600,
          }}>
            🛡️ Price protected under best price guarantee.
          </div>
        </div>
      </div>

    </div>
  )
}
