'use client'

import React, { useState, useEffect } from 'react'
import IciciQrModal from '../../components/IciciQrModal'
import { load } from '@cashfreepayments/cashfree-js'
import { Loader2 } from 'lucide-react'

export default function PayDirectPage() {
  const [amountSgd, setAmountSgd] = useState(500)
  const [customRef, setCustomRef] = useState('')
  const [guestName, setGuestName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [cashfreeLoading, setCashfreeLoading] = useState(false)
  const [sgdToInrRate, setSgdToInrRate] = useState(65) // Fallback rate

  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(res => res.json())
      .then(data => {
        if (data.rate) {
          setSgdToInrRate(data.rate)
        }
      })
      .catch(() => {})
  }, [])

  const handleCashfreePayment = async () => {
    if (!amountSgd || amountSgd < 1) {
      alert("Please enter a valid amount.")
      return
    }

    setCashfreeLoading(true)
    try {
      const amountInr = Math.round(amountSgd * sgdToInrRate)

      const res = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInr,
          customerId: `CUST_${Date.now()}`,
          customerName: guestName || 'Direct Payer',
          customerEmail: email || 'partner@flyingwonders.com',
          customerPhone: phone || '9999999999'
        })
      })
      const data = await res.json()

      if (!data.success || !data.paymentSessionId) {
        throw new Error(data.error || 'Failed to create payment session')
      }

      const cashfree = await load({
        mode: "sandbox", 
      })

      if (!cashfree) {
        throw new Error('Cashfree SDK failed to load')
      }

      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_modal"
      }).then((result: any) => {
        if(result.error){
          alert("Payment failed or cancelled: " + result.error.message)
        }
        if(result.paymentDetails){
          alert("Payment Successful! Thank you.")
        }
      })
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed')
    } finally {
      setCashfreeLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        color: '#F8FAFC',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '3rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          background: '#1E293B',
          padding: '2rem',
          borderRadius: '20px',
          border: '1px solid #334155',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          textAlign: 'center'
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          Flying Wonders • Secure Payment
        </span>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0 1rem 0' }}>
          Pay Invoice via ICICI UPI QR
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Enter your invoice or deposit amount in SGD below to generate an instant ICICI Bank UPI QR code.
        </p>

        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: 600 }}>
              Amount to Pay (SGD) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              min="1"
              value={amountSgd}
              onChange={(e) => setAmountSgd(Math.max(1, parseInt(e.target.value) || 0))}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #475569', background: '#0F172A', color: '#F8FAFC', fontSize: '0.95rem', fontWeight: 700, outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: 600 }}>
              Invoice / Booking Reference (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. FW-PROP-8942"
              value={customRef}
              onChange={(e) => setCustomRef(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #475569', background: '#0F172A', color: '#F8FAFC', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '0.25rem', fontWeight: 600 }}>
                Your Name
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0F172A', color: '#F8FAFC', fontSize: '0.82rem', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '0.25rem', fontWeight: 600 }}>
                Email (For Receipt)
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0F172A', color: '#F8FAFC', fontSize: '0.82rem', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '0.9rem',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
            }}
          >
            📱 Generate ICICI UPI QR Code & Pay
          </button>
          
          <button
            onClick={handleCashfreePayment}
            disabled={cashfreeLoading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #1A365D 0%, #2A4365 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '0.9rem',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: cashfreeLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(26, 54, 93, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: cashfreeLoading ? 0.7 : 1
            }}
          >
            {cashfreeLoading ? <Loader2 size={18} className="animate-spin" /> : '💳 Pay Securely (Cashfree)'}
          </button>
        </div>
      </div>

      {/* ICICI Payment Modal */}
      <IciciQrModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amountSgd={amountSgd}
        bookingReference={customRef || `FW-PAY-${Math.floor(100000 + Math.random() * 900000)}`}
        initialGuestName={guestName}
        initialEmail={email}
        initialPhone={phone}
      />
    </div>
  )
}
