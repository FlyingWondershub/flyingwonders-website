'use client'

import { useState } from 'react'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.875rem 1rem',
  borderRadius: '8px',
  border: '1px solid #CBD5E1',
  fontSize: '1rem',
  background: '#FAFAFA',
  outline: 'none',
  transition: 'border-color 0.2s ease',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  marginBottom: '0.5rem',
  fontSize: '0.95rem',
}

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus('idle')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          tier: 'general_inquiry',
          travelers: 0,
          travelDate: '',
          experiences: [],
          totalPrice: 0,
          notes: `Subject: ${formData.subject}\n\n${formData.message}`,
        }),
      })

      if (res.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📩</div>
        <h2 style={{ color: 'var(--emerald-secondary)', marginBottom: '1rem' }}>Message Sent!</h2>
        <p style={{ opacity: 0.8 }}>
          We'll get back to you at <strong>{formData.email || 'your email'}</strong> within 24 hours.
        </p>
        <button onClick={() => setStatus('idle')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Send Another Message</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={labelStyle}>Your Name *</label>
          <input type="text" required placeholder="Full name" value={formData.name} onChange={e => updateForm('name', e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email Address *</label>
          <input type="email" required placeholder="you@email.com" value={formData.email} onChange={e => updateForm('email', e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div>
          <label style={labelStyle}>Phone Number *</label>
          <input type="tel" required placeholder="+91 98861 71251" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Subject</label>
          <input type="text" placeholder="What is this about?" value={formData.subject} onChange={e => updateForm('subject', e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <label style={labelStyle}>Your Message *</label>
        <textarea
          required rows={5}
          placeholder="Tell us how we can help you..."
          value={formData.message}
          onChange={e => updateForm('message', e.target.value)}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {status === 'error' && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(153,0,0,0.08)', color: 'var(--crimson-primary)', borderRadius: '8px', fontSize: '0.9rem' }}>
          ⚠️ Failed to send message. Please try again or reach us on WhatsApp.
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isSubmitting}
        style={{ marginTop: '2rem', width: '100%', padding: '1rem', opacity: isSubmitting ? 0.7 : 1 }}
      >
        {isSubmitting ? 'Sending...' : 'Send Message ✈'}
      </button>
    </form>
  )
}
