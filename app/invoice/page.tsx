'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldAlert, ShieldCheck, Loader2, ArrowLeft, LayoutDashboard, FileSpreadsheet } from 'lucide-react'
import CustomerInvoiceManager from '../../components/admin/CustomerInvoiceManager'

function InvoicePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialRef = searchParams.get('ref') || searchParams.get('proposal') || ''

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminName, setAdminName] = useState<string>('')

  useEffect(() => {
    let isMounted = true

    const checkAdminAuth = async () => {
      try {
        const res = await fetch(`/api/auth/check?cb=${Date.now()}`)
        const data = await res.json()
        if (isMounted) {
          if (data.authenticated && (data.agent?.role === 'admin' || data.agent?.isAdmin)) {
            setIsAdmin(true)
            setAdminName(data.agent?.name || data.agent?.companyName || 'Administrator')
          } else {
            setIsAdmin(false)
          }
        }
      } catch {
        if (isMounted) {
          setIsAdmin(false)
        }
      } finally {
        if (isMounted) {
          setCheckingAuth(false)
        }
      }
    }

    checkAdminAuth()

    return () => {
      isMounted = false
    }
  }, [])

  if (checkingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B132B',
        color: '#FFFFFF',
        fontFamily: 'var(--font-inter), sans-serif',
        padding: '2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2.5rem',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '420px',
          textAlign: 'center'
        }}>
          <Loader2 size={36} className="animate-spin" color="#10B981" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Verifying Admin Access...</h2>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
            Securing access to Flying Wonders invoice and tax receipt management system.
          </p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0B132B 0%, #1C2541 100%)',
        color: '#FFFFFF',
        fontFamily: 'var(--font-inter), sans-serif',
        padding: '2rem'
      }}>
        <div style={{
          background: '#FFFFFF',
          color: '#1E293B',
          padding: '3rem 2.5rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#FEE2E2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <ShieldAlert size={36} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: '1.85rem',
            fontWeight: 800,
            color: '#0F172A',
            marginBottom: '0.75rem',
            lineHeight: 1.2
          }}>
            Admin Access Required
          </h1>

          <p style={{
            fontSize: '0.95rem',
            color: '#64748B',
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            The Customer Invoice & Receipt Management Portal is restricted to authorized Flying Wonders personnel. Please log in through the Admin Dashboard to issue, verify, or download invoices.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              href="/admin-dashboard#section-invoices"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.5rem',
                background: '#047857',
                color: '#FFFFFF',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              <LayoutDashboard size={18} />
              Open Admin Dashboard
            </Link>

            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#F1F5F9',
                color: '#475569',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
                border: '1px solid #E2E8F0'
              }}
            >
              <ArrowLeft size={16} />
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '3rem', fontFamily: 'var(--font-inter), sans-serif' }}>
      {/* Admin Top Utility Bar */}
      <header style={{
        background: '#0B132B',
        color: '#FFFFFF',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => router.push('/admin-dashboard#section-invoices')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.1)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </button>

          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileSpreadsheet size={18} color="#10B981" />
              Customer Invoices & Receipts Portal
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
              Admin Workspace &bull; Logged in as: <strong style={{ color: '#F1F5F9' }}>{adminName}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34D399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '999px',
            fontSize: '0.74rem',
            fontWeight: 700
          }}>
            <ShieldCheck size={13} />
            Admin Verified
          </span>
          <Link
            href="/admin-dashboard"
            style={{
              fontSize: '0.78rem',
              color: '#CBD5E1',
              textDecoration: 'none',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            Admin Command
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', margin: '1.5rem auto', padding: '0 1rem' }}>
        <CustomerInvoiceManager initialReference={initialRef} />
      </main>
    </div>
  )
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B132B', color: '#FFF' }}>
        <Loader2 size={36} className="animate-spin" color="#10B981" />
      </div>
    }>
      <InvoicePageContent />
    </Suspense>
  )
}
