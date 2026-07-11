'use client'

import { useState, useEffect } from 'react'

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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 650)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  const handleWhatsAppFallback = () => {
    const text = `Hello Flying Wonders! I filled out the contact form on your website but wanted to follow up directly.%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.phone}%0A*Subject:* ${formData.subject}%0A*Message:* ${formData.message}`
    window.open(`https://wa.me/919886171251?text=${text}`, '_blank')
  }

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📩</div>
        <h2 style={{ color: 'var(--emerald-secondary)', marginBottom: '1rem', fontSize: '1.5rem' }}>Message Logged!</h2>
        <p style={{ opacity: 0.8, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Thank you for reaching out. We will get back to you at your email address within 24 hours.
        </p>
        <button onClick={() => setStatus('idle')} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>
          Send Another Message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
        gap: '1rem', 
        marginBottom: '1rem' 
      }}>
        <div>
          <label style={labelStyle}>Your Name *</label>
          <input type="text" required placeholder="Full name" value={formData.name} onChange={e => updateForm('name', e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email Address *</label>
          <input type="email" required placeholder="name@domain.com" value={formData.email} onChange={e => updateForm('email', e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
        gap: '1rem', 
        marginBottom: '1.5rem' 
      }}>
        <div>
          <label style={labelStyle}>Phone Number *</label>
          <input type="tel" required placeholder="E.g. +91 98861 71251" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Subject</label>
          <input type="text" placeholder="Topic of inquiry" value={formData.subject} onChange={e => updateForm('subject', e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Your Message *</label>
        <textarea
          required rows={4}
          placeholder="Type your message here..."
          value={formData.message}
          onChange={e => updateForm('message', e.target.value)}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {status === 'error' && (
        <div style={{ 
          marginTop: '1.25rem', 
          padding: '1rem', 
          background: 'rgba(153,0,0,0.06)', 
          borderRadius: '8px', 
          borderLeft: '4px solid var(--crimson-primary)', 
          fontSize: '0.85rem' 
        }}>
          <p style={{ fontWeight: 700, color: 'var(--crimson-primary)', marginBottom: '0.25rem' }}>SMTP Sending Failed</p>
          <p style={{ opacity: 0.8, marginBottom: '0.75rem' }}>Your request was successfully saved to our database, but email dispatch failed. Please click below to send it to us on WhatsApp for instant confirmation:</p>
          <button 
            type="button" 
            onClick={handleWhatsAppFallback} 
            className="btn btn-primary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: '#25D366', boxShadow: 'none' }}
          >
            Send via WhatsApp 💬
          </button>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isSubmitting}
        style={{ marginTop: '1.5rem', width: '100%', padding: '1rem', opacity: isSubmitting ? 0.7 : 1 }}
      >
        {isSubmitting ? 'Sending...' : 'Send Message ✈'}
      </button>
    </form>
  )
}
