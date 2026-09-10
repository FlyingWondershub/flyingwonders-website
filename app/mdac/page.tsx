'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, ExternalLink, ArrowLeft, CheckCircle2, AlertTriangle, Copy, Check, HelpCircle, Compass, FileCheck, Share2 } from 'lucide-react'

export default function MdacPage() {
  const officialMdacLink = 'https://imigresen-online.imi.gov.my/mdac/main'
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
            <Link href="/travel-tools" style={{ color: '#1D4ED8', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={14} /> Back to Travel Tools
            </Link>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <span style={{ color: '#64748B', fontWeight: 600 }}>Malaysia Digital Arrival Card (MDAC)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => copyUrl('https://flyingwonders.net/mdac', true)}
              style={{ background: copiedPage ? '#DBEAFE' : '#F1F5F9', color: copiedPage ? '#1E40AF' : '#475569', border: '1px solid #CBD5E1', padding: '3px 9px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {copiedPage ? <Check size={12} /> : <Share2 size={12} />}
              <span>{copiedPage ? 'Page Link Copied!' : 'Share Tool Link'}</span>
            </button>
            <div style={{ background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
              ● 100% Free Official Gov Portal
            </div>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1D4ED8 100%)',
        color: '#FFF',
        padding: 'clamp(2.5rem, 5vw, 4rem) 1.25rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#93C5FD', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'inline-block', marginBottom: '0.75rem', backdropFilter: 'blur(8px)' }}>
            🇲🇾 Jabatan Imigresen Malaysia (JIM)
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 900, margin: '0 0 0.75rem', lineHeight: 1.2 }}>
            Malaysia Digital Arrival Card (MDAC)
          </h1>
          <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', color: 'rgba(255,255,255,0.9)', maxWidth: '680px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Mandatory digital entry declaration for all foreign tourists entering Malaysia via KLIA, Penang, Johor Bahru, or Woodlands & Tuas land checkpoints. Submit online within <strong>3 days before arrival</strong>.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={officialMdacLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#3B82F6',
                color: '#FFF',
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(59,130,246,0.35)'
              }}
            >
              <span>Submit Official MDAC (imi.gov.my)</span> <ExternalLink size={17} />
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
        <div style={{ background: '#FFF', borderRadius: '16px', border: '1.5px solid #BFDBFE', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Official Immigration Department of Malaysia URL:
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E3A8A', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                {officialMdacLink}
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                Direct official link. Zero fee on the official government website.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => copyUrl(officialMdacLink, false)}
                style={{
                  background: copied ? '#1D4ED8' : '#EFF6FF',
                  color: copied ? '#FFF' : '#1E40AF',
                  border: '1px solid #93C5FD',
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
                href={officialMdacLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)',
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
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>100% Free Official System</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Zero fees on imigresen-online.imi.gov.my. No payment required.
            </p>
          </div>

          <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '0.75rem' }}>
              <FileCheck size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>30-Day Visa Free 2026</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Indian & Chinese passport holders enjoy 30-day visa-free entry to Malaysia through 2026.
            </p>
          </div>

          <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', marginBottom: '0.75rem' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>Submit Within 3 Days</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Submit online within 3 days prior to your arrival date in Malaysia.
            </p>
          </div>

          <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', marginBottom: '0.75rem' }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>Save PDF PIN</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Download or screenshot your MDAC PDF confirmation with PIN to show border officers.
            </p>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '2rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E3A8A', margin: '0 0 1.25rem', fontFamily: 'var(--font-playfair), serif' }}>
            How to Submit Your Malaysia Digital Arrival Card (MDAC)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { step: '1', title: 'Open the Official Malaysian Immigration System', desc: 'Visit https://imigresen-online.imi.gov.my/mdac/main and click "REGISTER".' },
              { step: '2', title: 'Fill Personal Details', desc: 'Enter your name as shown on your passport, passport number, date of birth, nationality, and valid email address.' },
              { step: '3', title: 'Enter Travelling Information', desc: 'Specify your date of arrival, date of departure, mode of transport (Air, Land, or Sea), and flight/vessel number.' },
              { step: '4', title: 'Enter Malaysia Accommodation', desc: 'Provide your hotel name, city (e.g. Kuala Lumpur, Penang, Johor Bahru), and state in Malaysia.' },
              { step: '5', title: 'Submit & Download PIN Confirmation', desc: 'Click submit. You will receive an acknowledgment email with your MDAC PIN number. Keep a copy on your mobile.' },
            ].map((s, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1E3A8A', color: '#FFF', fontWeight: 900, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.step}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.25rem' }}>{s.title}</h4>
                  <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.55 }}>{s.desc}</p>
                </div>
              </div>
            ))}
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
            <Link href="/air-suvidha" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '12px', textDecoration: 'none', color: '#C2410C' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>🇮🇳 India Air Suvidha</div>
                <div style={{ fontSize: '0.78rem', color: '#EA580C', marginTop: '2px' }}>International arrivals declaration</div>
              </div>
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>

      </div>

    </div>
  )
}
