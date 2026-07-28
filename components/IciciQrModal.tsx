'use client'

import React, { useState, useEffect } from 'react'

interface IciciQrModalProps {
  isOpen: boolean
  onClose: () => void
  amountSgd: number
  bookingReference?: string
  initialGuestName?: string
  initialEmail?: string
  initialPhone?: string
}

export default function IciciQrModal({
  isOpen,
  onClose,
  amountSgd,
  bookingReference,
  initialGuestName = '',
  initialEmail = '',
  initialPhone = ''
}: IciciQrModalProps) {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successData, setSuccessData] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Settings & Rate state
  const [upiId, setUpiId] = useState('flyingwonders@icici')
  const [accountName, setAccountName] = useState('Flying Wonders Pvt Ltd')
  const [bankDetails, setBankDetails] = useState('Account No: 0000 1234 5678 | IFSC: ICIC0000001')
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
  
  const [liveRate, setLiveRate] = useState(63.50)
  const [appliedRate, setAppliedRate] = useState(67.00)
  const [amountInr, setAmountInr] = useState(0)

  // Form State
  const [formData, setFormData] = useState({
    guestName: initialGuestName,
    email: initialEmail,
    phone: initialPhone,
    utrNumber: '',
    notes: ''
  })
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null)
  const [copiedUpi, setCopiedUpi] = useState(false)

  // Fetch Site Settings & Exchange Rate on open
  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    setSuccessData(null)
    setErrorMsg(null)

    const fetchData = async () => {
      try {
        const [settingsRes, rateRes] = await Promise.all([
          fetch('/api/site-settings'),
          fetch('/api/exchange-rate')
        ])

        const settingsData = await settingsRes.json()
        const rateData = await rateRes.json()

        const settings = settingsData.settings || {}
        if (settings.iciciUpiId) setUpiId(settings.iciciUpiId)
        if (settings.iciciAccountName) setAccountName(settings.iciciAccountName)
        if (settings.iciciBankDetails) setBankDetails(settings.iciciBankDetails)

        const baseLive = rateData.rate || 63.50
        setLiveRate(baseLive)

        let finalRate = baseLive
        if (settings.manualRateOverride && Number(settings.manualRateOverride) > 0) {
          finalRate = Number(settings.manualRateOverride)
        } else {
          const type = settings.exchangeMarkupType || 'absolute'
          const val = Number(settings.exchangeMarkupValue) || 3.5
          if (type === 'absolute') {
            finalRate = baseLive + val
          } else {
            finalRate = baseLive * (1 + val / 100)
          }
        }

        const roundedRate = Math.round(finalRate * 100) / 100
        setAppliedRate(roundedRate)
        setAmountInr(Math.round(amountSgd * roundedRate))
      } catch (err) {
        console.warn('Failed to load ICICI QR settings/rate, using defaults:', err)
        const fallbackRate = 67.00
        setAppliedRate(fallbackRate)
        setAmountInr(Math.round(amountSgd * fallbackRate))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen, amountSgd])

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => setScreenshotBase64(event.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId)
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.utrNumber.trim()) {
      alert('Please enter your UTR / Transaction Reference ID.')
      return
    }
    if (!formData.email.trim()) {
      alert('Please enter your email address for receipt acknowledgment.')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/payments/submit-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingReference,
          guestName: formData.guestName,
          email: formData.email,
          phone: formData.phone,
          amountSgd,
          amountInr,
          exchangeRateUsed: appliedRate,
          utrNumber: formData.utrNumber,
          screenshotBase64,
          notes: formData.notes
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit payment details.')
      }

      setSuccessData(data)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Payment submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          background: '#1E293B',
          color: '#F8FAFC',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          border: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📱</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC' }}>
                ICICI Bank UPI QR Payment
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
                Zero-Fee Direct UPI Transfer
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {successData ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🎉</div>
              <h3 style={{ color: '#10B981', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                Payment Submitted Successfully!
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                We have received your UTR reference <strong>{formData.utrNumber}</strong>. An instant receipt has been emailed to <strong>{formData.email}</strong>.
              </p>

              <div style={{ background: '#0F172A', padding: '1rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#94A3B8' }}>Booking Ref:</span>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>{successData.bookingReference}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#94A3B8' }}>Amount Paid:</span>
                  <span style={{ color: '#F8FAFC', fontWeight: 700 }}>₹ {amountInr.toLocaleString('en-IN')} ({amountSgd} SGD)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Verification Status:</span>
                  <span style={{ color: '#F59E0B', fontWeight: 700 }}>⏳ Pending ICICI Bank Check</span>
                </div>
              </div>

              {/* WhatsApp Quick Callout */}
              <div style={{ background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)', padding: '1.25rem', borderRadius: '14px', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
                  Need Quicker Confirmation?
                </span>
                <p style={{ fontSize: '0.82rem', color: '#ECFDF5', margin: '0 0 1rem 0' }}>
                  Chat with our rapid-response accounts desk on WhatsApp for immediate verification!
                </p>
                <a
                  href={`https://wa.me/919886171251?text=${encodeURIComponent(`Hi Flying Wonders, I have paid ₹${amountInr} for reference ${successData.bookingReference} (UTR: ${formData.utrNumber}). Please confirm!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#10B981',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  <span>💬 Chat on WhatsApp</span>
                </a>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  background: '#334155',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Done / Close Window
              </button>
            </div>
          ) : (
            /* PAYMENT MODAL FORM */
            <form onSubmit={handleSubmit}>
              {/* Amount & Conversion Header */}
              <div
                style={{
                  background: '#0F172A',
                  padding: '1.25rem',
                  borderRadius: '14px',
                  border: '1px solid #334155',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Package Amount:</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F8FAFC' }}>SGD {amountSgd.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Applied Conversion Rate:</span>
                  <span style={{ fontSize: '0.78rem', color: '#34D399', fontWeight: 600 }}>1 SGD = ₹ {appliedRate}</span>
                </div>
                <div
                  style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px dashed #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F8FAFC' }}>Total to Pay in INR:</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10B981' }}>
                    ₹ {amountInr.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* QR Code & UPI ID Display */}
              <div
                style={{
                  background: '#0F172A',
                  padding: '1.25rem',
                  borderRadius: '14px',
                  border: '1px solid #334155',
                  textAlign: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                {/* Dynamically generated SVG QR Code fallback or uploaded image */}
                <div style={{ margin: '0 auto 1rem auto', width: '160px', height: '160px', background: '#FFFFFF', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(accountName)}&am=${amountInr}&cu=INR`)}`}
                    alt="ICICI Bank UPI QR Code"
                    style={{ width: '100%', height: '100%', borderRadius: '6px' }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0 0 0.75rem 0' }}>
                  Scan using Google Pay, PhonePe, Paytm, or BHIM
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <code style={{ background: '#1E293B', color: '#34D399', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                    {upiId}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    style={{
                      background: copiedUpi ? '#059669' : '#334155',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {copiedUpi ? 'Copied! ✓' : 'Copy UPI ID'}
                  </button>
                </div>
              </div>

              {/* Form Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#CBD5E1', marginBottom: '0.25rem', fontWeight: 600 }}>
                    UTR / Transaction Reference Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 402512948123"
                    value={formData.utrNumber}
                    onChange={(e) => setFormData({ ...formData, utrNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #475569', background: '#0F172A', color: '#F8FAFC', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '0.25rem', fontWeight: 600 }}>
                      Guest / Agent Name
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0F172A', color: '#F8FAFC', fontSize: '0.82rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '0.25rem', fontWeight: 600 }}>
                      Email (For Receipt) <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0F172A', color: '#F8FAFC', fontSize: '0.82rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '0.25rem', fontWeight: 600 }}>
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0F172A', color: '#F8FAFC', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>

                {/* Optional Screenshot Uploader */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '0.25rem', fontWeight: 600 }}>
                    Upload Payment Screenshot (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    style={{ fontSize: '0.75rem', color: '#94A3B8' }}
                  />
                </div>
              </div>

              {errorMsg && (
                <div style={{ background: '#7F1D1D', color: '#FCA5A5', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', marginBottom: '1rem' }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !formData.utrNumber.trim() || !formData.email.trim()}
                style={{
                  width: '100%',
                  background: submitting ? '#334155' : 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: submitting ? 'default' : 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}
              >
                {submitting ? 'Submitting Payment Details...' : 'Confirm & Submit UTR Reference'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
