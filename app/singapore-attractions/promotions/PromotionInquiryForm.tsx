'use client'

import { useState } from 'react'

interface PromotionInquiryFormProps {
  promotions: { _id: string; attractionName: string }[]
}

export default function PromotionInquiryForm({ promotions }: PromotionInquiryFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedAttraction, setSelectedAttraction] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !phone) {
      setStatus('error')
      setMessage('Please fill in all required fields.')
      return
    }
    setStatus('submitting')
    setMessage('')

    try {
      const res = await fetch('/api/promotions/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          attractionName: selectedAttraction || 'General / All Promotions',
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setStatus('success')
        setMessage(data.message)
        setName('')
        setEmail('')
        setPhone('')
        setSelectedAttraction('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to submit inquiry.')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
      setMessage('An error occurred. Please try again.')
    }
  }

  return (
    <div 
      className="glass" 
      style={{ 
        marginTop: '3.5rem', 
        background: '#FFF', 
        border: '1px solid #E2E8F0', 
        borderRadius: '16px', 
        padding: '2.5rem', 
        boxShadow: 'var(--shadow-md)' 
      }}
    >
      <div style={{ borderLeft: '4px solid var(--emerald-secondary)', paddingLeft: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-dark)', fontFamily: 'var(--font-playfair), serif' }}>
          📩 Claim Promotion / Inquiry
        </h3>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.7 }}>
          Interested in a flash deal? Submit your details to lock in the special promotional rates.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#4A5568' }}>
              Full Name <span style={{ color: '#E53E3E' }}>*</span>
            </label>
            <input 
              type="text" 
              required
              placeholder="Enter your name" 
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#4A5568' }}>
              Email Address <span style={{ color: '#E53E3E' }}>*</span>
            </label>
            <input 
              type="email" 
              required
              placeholder="name@example.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#4A5568' }}>
              Phone / WhatsApp Number <span style={{ color: '#E53E3E' }}>*</span>
            </label>
            <input 
              type="tel" 
              required
              placeholder="+91 98765 43210" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#4A5568' }}>
              Select Attraction Promotion
            </label>
            <select 
              value={selectedAttraction}
              onChange={e => setSelectedAttraction(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', background: '#FFF' }}
            >
              <option value="">General Inquiry (All Deals)</option>
              {promotions.map(p => (
                <option key={p._id} value={p.attractionName}>{p.attractionName}</option>
              ))}
            </select>
          </div>
        </div>

        {message && (
          <div style={{ 
            padding: '0.75rem 1rem', 
            borderRadius: '6px', 
            fontSize: '0.85rem', 
            fontWeight: 600,
            background: status === 'success' ? '#F0FDF4' : '#FFF5F5',
            color: status === 'success' ? '#15803D' : '#E53E3E',
            border: `1px solid ${status === 'success' ? '#BBF7D0' : '#FEB2B2'}`
          }}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={status === 'submitting'}
          style={{ 
            background: 'var(--emerald-secondary)', 
            color: '#FFF', 
            border: 'none', 
            padding: '0.8rem 1.5rem', 
            borderRadius: '6px', 
            fontSize: '0.9rem', 
            fontWeight: 700, 
            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            alignSelf: 'flex-start',
            boxShadow: '0 4px 12px rgba(47,133,90,0.15)'
          }}
          onMouseOver={(e) => { if (status !== 'submitting') e.currentTarget.style.background = '#0F4C3A' }}
          onMouseOut={(e) => { if (status !== 'submitting') e.currentTarget.style.background = 'var(--emerald-secondary)' }}
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit Inquiry / Claim Offer 🎟️'}
        </button>
      </form>
    </div>
  )
}
