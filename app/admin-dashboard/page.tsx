'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, ShieldAlert, Loader2 } from 'lucide-react'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.agent?.role === 'admin') {
          setIsAdmin(true)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="var(--emerald-secondary)" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#F7FAFC' }}>
        <ShieldAlert size={64} color="#E53E3E" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.5rem', color: '#2D3748', marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ color: '#4A5568', fontSize: '1.1rem', marginBottom: '2rem' }}>You must log in as an administrator to view this page.</p>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '0.75rem 2rem',
            background: 'var(--emerald-secondary)',
            color: '#FFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Return Home
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAFC', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#FFF', borderRadius: '16px', padding: '3rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.5rem', color: '#2D3748', marginBottom: '1rem' }}>Admin Dashboard</h1>
        <p style={{ color: '#4A5568', fontSize: '1.1rem', marginBottom: '3rem' }}>Securely export database records and manage administrative tasks.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ padding: '1.5rem', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#2D3748', fontWeight: 700 }}>B2B Agents Directory</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#718096', fontSize: '0.9rem' }}>Export all registered travel agent accounts as CSV.</p>
            </div>
            <a 
              href="/api/admin/export-agents" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#2B6CB0',
                color: '#FFF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#2C5282'}
              onMouseOut={e => e.currentTarget.style.background = '#2B6CB0'}
            >
              <Download size={18} />
              Export Agents
            </a>
          </div>

          <div style={{ padding: '1.5rem', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#2D3748', fontWeight: 700 }}>Scanned Business Cards</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#718096', fontSize: '0.9rem' }}>Export all contacts submitted via OCR or forms.</p>
            </div>
            <a 
              href="/api/admin/export-contacts" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#2B6CB0',
                color: '#FFF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#2C5282'}
              onMouseOut={e => e.currentTarget.style.background = '#2B6CB0'}
            >
              <Download size={18} />
              Export Contacts
            </a>
          </div>

          <div style={{ padding: '1.5rem', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#2D3748', fontWeight: 700 }}>Payment Records</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#718096', fontSize: '0.9rem' }}>Export manual UTR and verified transaction history.</p>
            </div>
            <a 
              href="/api/admin/export-payments" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#2B6CB0',
                color: '#FFF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#2C5282'}
              onMouseOut={e => e.currentTarget.style.background = '#2B6CB0'}
            >
              <Download size={18} />
              Export Payments
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
