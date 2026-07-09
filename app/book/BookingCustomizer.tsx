'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function BookingCustomizer() {
  const router = useRouter()
  // Wait, Next.js useSearchParams cannot be used without Suspense boundary in some cases,
  // but it's fine for client components in most setups if not statically rendered,
  // or we can just use a simple state to avoid Suspense requirement warnings.
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    tier: 'budget',
    travelers: 1,
    date: '',
    extras: [] as string[],
    name: '',
    email: '',
    notes: '',
  })

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const toggleExtra = (extra: string) => {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras.includes(extra) 
        ? prev.extras.filter(e => e !== extra)
        : [...prev.extras, extra]
    }))
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 4))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here we'd send data to Sanity or an email API
    alert('Booking request sent successfully! Our team will contact you shortly.')
    router.push('/')
  }

  return (
    <div>
      {/* Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(0,0,0,0.1)', zIndex: 0 }}></div>
        {[1, 2, 3, 4].map(num => (
          <div key={num} style={{ 
            width: '30px', height: '30px', borderRadius: '50%', 
            background: step >= num ? 'var(--primary-blue)' : '#CBD5E1',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1, fontWeight: 'bold'
          }}>
            {num}
          </div>
        ))}
      </div>

      <form onSubmit={submit}>
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <h2 style={{ color: 'var(--primary-blue)' }}>Step 1: Travel Tier & Party</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Select Tier</label>
                <select value={formData.tier} onChange={e => updateForm('tier', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                  <option value="budget">Budget Explorer</option>
                  <option value="premium">Premium Luxury</option>
                  <option value="solo">Solo Adventure</option>
                  <option value="groups">Groups & Families</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Number of Travelers</label>
                <input type="number" min="1" value={formData.travelers} onChange={e => updateForm('travelers', parseInt(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <h2 style={{ color: 'var(--primary-blue)' }}>Step 2: Dates & Extras</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Travel Date</label>
                <input type="date" required value={formData.date} onChange={e => updateForm('date', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Add-on Experiences</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['Universal Studios VIP Tour', 'Marina Bay Sands Dinner', 'Night Safari Expeditions', 'Changi Lounge Access'].map(extra => (
                    <label key={extra} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.extras.includes(extra)} onChange={() => toggleExtra(extra)} />
                      {extra}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <h2 style={{ color: 'var(--primary-blue)' }}>Step 3: Your Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Full Name</label>
                <input type="text" required value={formData.name} onChange={e => updateForm('name', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Email Address</label>
                <input type="email" required value={formData.email} onChange={e => updateForm('email', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Special Requests / Notes</label>
                <textarea rows={4} value={formData.notes} onChange={e => updateForm('notes', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', resize: 'vertical' }}></textarea>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <h2 style={{ color: 'var(--primary-blue)' }}>Step 4: Review & Submit</h2>
            <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '8px', marginTop: '1.5rem' }}>
              <p><strong>Tier:</strong> <span style={{ textTransform: 'capitalize' }}>{formData.tier}</span></p>
              <p><strong>Travelers:</strong> {formData.travelers}</p>
              <p><strong>Date:</strong> {formData.date}</p>
              <p><strong>Extras:</strong> {formData.extras.length > 0 ? formData.extras.join(', ') : 'None'}</p>
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
            </div>
            <p style={{ marginTop: '1.5rem', color: 'var(--accent-blue)', fontWeight: 600 }}>Ready to embark on your journey?</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1.5rem' }}>
          {step > 1 ? (
            <button type="button" onClick={prevStep} className="btn" style={{ background: '#CBD5E1', color: '#1A202C' }}>Back</button>
          ) : <div></div>}
          
          {step < 4 ? (
            <button type="button" onClick={nextStep} className="btn btn-primary">Next Step</button>
          ) : (
            <button type="submit" className="btn btn-primary">Submit Request</button>
          )}
        </div>
      </form>
    </div>
  )
}
