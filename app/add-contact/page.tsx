'use client'

import React, { useState, useRef } from 'react'

export default function AddContactPage() {
  const [frontPreview, setFrontPreview] = useState<string | null>(null)
  const [backPreview, setBackPreview] = useState<string | null>(null)
  
  const [step, setStep] = useState<number>(1) // 1 = capture, 2 = loading, 3 = edit, 4 = success
  const [loadingMessage, setLoadingMessage] = useState<string>('Uploading images...')

  // Extracted fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    addToNewsletter: true
  })

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  // Convert and compress File to compact Base64 JPEG (max 1000px width/height)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const maxDim = 1000
          let width = img.width
          let height = img.height

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(event.target?.result as string)
            return
          }
          ctx.drawImage(img, 0, 0, width, height)
          // Return compact compressed JPEG base64
          resolve(canvas.toDataURL('image/jpeg', 0.75))
        }
        img.onerror = () => resolve(event.target?.result as string)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleFrontCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await fileToBase64(file)
        setFrontPreview(base64)
      } catch (err) {
        console.error(err)
        alert('Failed to read image file.')
      }
    }
  }

  const handleBackCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await fileToBase64(file)
        setBackPreview(base64)
      } catch (err) {
        console.error(err)
        alert('Failed to read image file.')
      }
    }
  }

  const startParsing = async () => {
    if (!frontPreview) {
      alert('Please capture or select the front side of the business card first.')
      return
    }

    setStep(2)
    setLoadingMessage('Gemini AI is parsing the card...')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/contact/parse-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontImage: frontPreview,
          backImage: backPreview
        })
      })

      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to extract text.')
      }

      const info = result.data
      const isValidEmail = (emailStr: string) => {
        if (!emailStr) return false
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim())
      }
      setFormData({
        name: info.name || '',
        email: isValidEmail(info.email) ? info.email.trim() : '',
        phone: info.phone || '',
        company: info.company || '',
        title: info.title || '',
        addToNewsletter: true
      })
      setStep(3)
    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || 'Failed to scan card. Please enter details manually.')
      setStep(3)
    }
  }

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) {
      alert('Email is required.')
      return
    }

    setStep(2)
    setLoadingMessage('Saving lead to Sanity & Newsletter subscribers...')

    try {
      const res = await fetch('/api/contact/save-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          frontImage: frontPreview,
          backImage: backPreview
        })
      })

      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to save lead.')
      }

      setStep(4)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error occurred while saving lead.')
      setStep(3)
    }
  }

  const resetScanner = () => {
    setFrontPreview(null)
    setBackPreview(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      title: '',
      addToNewsletter: true
    })
    setStep(1)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      color: '#F8FAFC',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: '480px', width: '100%', background: '#1E293B', padding: '1.75rem', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Lead Registrar
          </span>
          <h2 style={{ fontSize: '1.4rem', margin: '0.25rem 0 0 0', fontWeight: 800 }}>
            Business Card Scanner
          </h2>
        </div>

        {/* STEP 1: CAPTURE IMAGES */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: '0.82rem', opacity: 0.8, textAlign: 'center', marginBottom: '1.5rem' }}>
              Upload or snap a picture of the card. Gemini AI will automatically extract contact details.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              
              {/* Front Side */}
              <div 
                onClick={() => frontInputRef.current?.click()}
                style={{
                  height: '140px',
                  borderRadius: '10px',
                  border: '2px dashed #475569',
                  background: '#0F172A',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {frontPreview ? (
                  <img 
                    src={frontPreview} 
                    alt="Front Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <>
                    <span style={{ fontSize: '1.5rem' }}>📸</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.25rem' }}>Card Front</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>(Required)</span>
                  </>
                )}
                {frontPreview && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '0.2rem', textAlign: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                    Change Front
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  ref={frontInputRef}
                  onChange={handleFrontCapture}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Back Side */}
              <div 
                onClick={() => backInputRef.current?.click()}
                style={{
                  height: '140px',
                  borderRadius: '10px',
                  border: '2px dashed #475569',
                  background: '#0F172A',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {backPreview ? (
                  <img 
                    src={backPreview} 
                    alt="Back Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <>
                    <span style={{ fontSize: '1.5rem' }}>📸</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.25rem' }}>Card Back</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>(Optional)</span>
                  </>
                )}
                {backPreview && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '0.2rem', textAlign: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                    Change Back
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  ref={backInputRef}
                  onChange={handleBackCapture}
                  style={{ display: 'none' }}
                />
              </div>

            </div>

            <button
              onClick={startParsing}
              disabled={!frontPreview}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: frontPreview ? '#10B981' : '#334155',
                color: frontPreview ? '#FFF' : '#94A3B8',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: frontPreview ? 'pointer' : 'not-allowed',
                boxShadow: frontPreview ? '0 4px 12px rgba(16,185,129,0.25)' : 'none'
              }}
            >
              Scan with Gemini AI
            </button>
          </div>
        )}

        {/* STEP 2: LOADING SCREEN */}
        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{
              width: '45px',
              height: '45px',
              border: '4px solid rgba(16,185,129,0.1)',
              borderTop: '4px solid #10B981',
              borderRadius: '50%',
              margin: '0 auto 1.5rem auto',
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{loadingMessage}</p>
          </div>
        )}

        {/* STEP 3: CONFIRM / EDIT EXTRACTED DATA */}
        {step === 3 && (
          <form onSubmit={submitLead} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            {errorMessage && (
              <div style={{ background: '#7F1D1D', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', textAlign: 'center' }}>
                ⚠️ {errorMessage}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, marginBottom: '0.2rem' }}>
                Full Name
              </label>
              <input 
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #475569', background: '#0F172A', color: '#FFF', fontSize: '0.85rem', outline: 'none' }}
                placeholder="Name"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, marginBottom: '0.2/rem' }}>
                Email Address
              </label>
              <input 
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #475569', background: '#0F172A', color: '#FFF', fontSize: '0.85rem', outline: 'none' }}
                placeholder="Email Address"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, marginBottom: '0.2rem' }}>
                Phone Number
              </label>
              <input 
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #475569', background: '#0F172A', color: '#FFF', fontSize: '0.85rem', outline: 'none' }}
                placeholder="Phone Number"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, marginBottom: '0.2rem' }}>
                  Company
                </label>
                <input 
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #475569', background: '#0F172A', color: '#FFF', fontSize: '0.85rem', outline: 'none' }}
                  placeholder="Company"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, marginBottom: '0.2rem' }}>
                  Job Title
                </label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #475569', background: '#0F172A', color: '#FFF', fontSize: '0.85rem', outline: 'none' }}
                  placeholder="Job Title"
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', padding: '0.5rem 0' }}>
              <input 
                type="checkbox"
                checked={formData.addToNewsletter}
                onChange={e => setFormData({ ...formData, addToNewsletter: e.target.checked })}
                style={{ width: '1rem', height: '1rem' }}
              />
              <span>Subscribe to newsletter list</span>
            </label>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={resetScanner}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', border: '1px solid #475569', background: 'transparent', color: '#FFF', fontWeight: 600, cursor: 'pointer' }}
              >
                Scan Again
              </button>
              <button
                type="submit"
                style={{ flex: 2, padding: '0.65rem', borderRadius: '6px', border: 'none', background: '#10B981', color: '#FFF', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(16,185,129,0.2)' }}
              >
                Confirm & Save
              </button>
            </div>

          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>✅</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}>Lead Saved Successfully</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.25rem', marginBottom: '1.5rem' }}>
              The contact has been added to Sanity and subscribed to your email campaign newsletter.
            </p>

            <button
              onClick={resetScanner}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Scan Another Card
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
