'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, ExternalLink, ArrowLeft, CheckCircle2, AlertTriangle, Copy, Check, HelpCircle, Compass, FileCheck, Share2 } from 'lucide-react'

export default function AirSuvidhaPage() {
  const officialAirSuvidhaLink = 'https://www.newdelhiairport.in/airsuvidha/ap-registration'
  const [copied, setCopied] = useState(false)
  const [copiedPage, setCopiedPage] = useState(false)

  const copyUrl = (text: string, isPage?: boolean) => {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(text)
      if (isPage) {
        setCopiedPage(true)
        setTimeout(() => setCopiedPage(false), 2500)
      } else {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    }
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#1E293B', fontFamily: 'var(--font-inter), sans-serif', paddingBottom: '4rem' }}>
      
      {/* Breadcrumb & Top Bar */}
      <div style={{ background: '#FFF', borderBottom: '1px solid #E2E8F0', padding: '0.65rem 1.25rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link href="/travel-tools" style={{ color: '#EA580C', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={14} /> Back to Travel Tools
            </Link>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <span style={{ color: '#64748B', fontWeight: 600 }}>Air Suvidha (India)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => copyUrl('https://flyingwonders.net/air-suvidha', true)}
              style={{ background: copiedPage ? '#FFEDD5' : '#F1F5F9', color: copiedPage ? '#C2410C' : '#475569', border: '1px solid #CBD5E1', padding: '3px 9px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {copiedPage ? <Check size={12} /> : <Share2 size={12} />}
              <span>{copiedPage ? 'Page Link Copied!' : 'Share Tool Link'}</span>
            </button>
            <div style={{ background: '#FFEDD5', color: '#C2410C', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
              ● 100% Free Official Gov Portal
            </div>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #1C1917 0%, #7C2D12 50%, #EA580C 100%)',
        color: '#FFF',
        padding: 'clamp(2.5rem, 5vw, 4rem) 1.25rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#FDBA74', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'inline-block', marginBottom: '0.75rem', backdropFilter: 'blur(8px)' }}>
            🇮🇳 Ministry of Civil Aviation (MoCA)
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 900, margin: '0 0 0.75rem', lineHeight: 1.2 }}>
            Air Suvidha Self-Declaration Portal
          </h1>
          <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', color: 'rgba(255,255,255,0.9)', maxWidth: '680px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Official online self-declaration portal for international passengers arriving in India (Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kochi, Kolkata).
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={officialAirSuvidhaLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#EA580C',
                color: '#FFF',
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(234,88,12,0.35)'
              }}
            >
              <span>Open Official Air Suvidha Portal</span> <ExternalLink size={17} />
            </a>
            <Link
              href="/travel-tools"
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#FFF',
                padding: '0.85rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(255,255,255,0.25)'
              }}
            >
              <Compass size={16} /> All Travel Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '-1.5rem auto 0', padding: '0 1.25rem', position: 'relative', zIndex: 10 }}>
        
        {/* Official URL Highlight Card */}
        <div style={{ background: '#FFF', borderRadius: '16px', border: '1.5px solid #FDBA74', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Official Ministry of Civil Aviation Portal URL:
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#9A3412', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                {officialAirSuvidhaLink}
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                Official Air Suvidha registration portal. Zero fee required.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => copyUrl(officialAirSuvidhaLink, false)}
                style={{
                  background: copied ? '#EA580C' : '#FFF7ED',
                  color: copied ? '#FFF' : '#C2410C',
                  border: '1px solid #FDBA74',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Official URL'}</span>
              </button>
              <a
                href={officialAirSuvidhaLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #C2410C 0%, #EA580C 100%)',
                  color: '#FFF',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Launch Portal</span> <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </div>

        {/* 4 Feature Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>100% Free Service</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Zero fees on the official portal. No agent or processing fee required.
            </p>
          </div>

          <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '0.75rem' }}>
              <FileCheck size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>Pre-Departure Entry</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Complete registration prior to boarding international inbound flights to India.
            </p>
          </div>

          <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', marginBottom: '0.75rem' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>Airport Fast-Track</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Saves time at Port Health Organization (PHO) counters at arrival airports.
            </p>
          </div>

          <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', marginBottom: '0.75rem' }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>Keep PDF Application</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Save generated application reference number and PDF confirmation on phone.
            </p>
          </div>
        </div>

        {/* Other Arrival Cards */}
        <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem' }}>
            Other Arrival Cards You May Need:
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <Link href="/sgac" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', textDecoration: 'none', color: '#166534' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>🇸🇬 Singapore Arrival Card (SGAC)</div>
                <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '2px' }}>Mandatory for entering Singapore</div>
              </div>
              <ExternalLink size={16} />
            </Link>
            <Link href="/mdac" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', textDecoration: 'none', color: '#1E40AF' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>🇲🇾 Malaysia Arrival Card (MDAC)</div>
                <div style={{ fontSize: '0.78rem', color: '#3B82F6', marginTop: '2px' }}>Mandatory for entering Malaysia</div>
              </div>
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>

      </div>

    </div>
  )
}
