'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, ExternalLink, ArrowLeft, CheckCircle2, AlertTriangle, Copy, Check, HelpCircle, Compass, FileCheck, Share2 } from 'lucide-react'

export default function SgacPage() {
  const officialIcaLink = 'https://eservices.ica.gov.sg/sgarrivalcard/'
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
            <Link href="/travel-tools" style={{ color: '#059669', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={14} /> Back to Travel Tools
            </Link>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <span style={{ color: '#64748B', fontWeight: 600 }}>SG Arrival Card (SGAC)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => copyUrl('https://flyingwonders.net/sgac', true)}
              style={{ background: copiedPage ? '#DCFCE7' : '#F1F5F9', color: copiedPage ? '#166534' : '#475569', border: '1px solid #CBD5E1', padding: '3px 9px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {copiedPage ? <Check size={12} /> : <Share2 size={12} />}
              <span>{copiedPage ? 'Page Link Copied!' : 'Share Tool Link'}</span>
            </button>
            <div style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
              ● 100% Free Official Gov Portal
            </div>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #05241B 0%, #0F4C3A 50%, #064E3B 100%)',
        color: '#FFF',
        padding: 'clamp(2.5rem, 5vw, 4rem) 1.25rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#A7F3D0', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'inline-block', marginBottom: '0.75rem', backdropFilter: 'blur(8px)' }}>
            🇸🇬 Singapore ICA Official Portal
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 900, margin: '0 0 0.75rem', lineHeight: 1.2 }}>
            Singapore Arrival Card (SGAC) Submission
          </h1>
          <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', color: 'rgba(255,255,255,0.9)', maxWidth: '680px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Mandatory electronic health & customs declaration for all foreign travelers entering Singapore. Complete online within <strong>3 days prior to arrival</strong>.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={officialIcaLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#10B981',
                color: '#FFF',
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(16,185,129,0.35)'
              }}
            >
              <span>Submit Official SGAC (ica.gov.sg)</span> <ExternalLink size={17} />
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
        <div style={{ background: '#FFF', borderRadius: '16px', border: '1.5px solid #BBF7D0', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Official ICA Government Portal URL:
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F4C3A', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                {officialIcaLink}
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                Direct official link. Do NOT pay third-party scam agencies charging $30–$80.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => copyUrl(officialIcaLink, false)}
                style={{
                  background: copied ? '#059669' : '#ECFDF5',
                  color: copied ? '#FFF' : '#047857',
                  border: '1px solid #6EE7B7',
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
                href={officialIcaLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #0F4C3A 0%, #059669 100%)',
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
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>100% Free of Charge</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Zero processing fees. Beware of fake third-party websites charging fees.
            </p>
          </div>

          <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', marginBottom: '0.75rem' }}>
              <FileCheck size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>Submit Within 3 Days</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Submissions open 3 days prior to your entry date into Singapore.
            </p>
          </div>

          <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', marginBottom: '0.75rem' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>Instant QR Code</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Instant digital PDF with barcode sent to email for automated e-gantry clearance.
            </p>
          </div>

          <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', marginBottom: '0.75rem' }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>Passport Validity</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Passport must have at least 6 months remaining validity from date of arrival.
            </p>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '2rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F4C3A', margin: '0 0 1.25rem', fontFamily: 'var(--font-playfair), serif' }}>
            How to Submit Your SG Arrival Card (Step-by-Step)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { step: '1', title: 'Open the Official ICA Portal', desc: 'Visit https://eservices.ica.gov.sg/sgarrivalcard/. Select "Foreign Visitors (including IPA holders)".' },
              { step: '2', title: 'Choose Individual or Group Submission', desc: 'Families or travel groups on the same flight can submit together under "Group Submission" (up to 10 persons). Solo travelers select "Individual Submission".' },
              { step: '3', title: 'Enter Passport & Flight Details', desc: 'Provide legal name as in passport, passport number, nationality, date of birth, flight number (e.g. SQ 423), and flight arrival time.' },
              { step: '4', title: 'Enter Singapore Hotel / Accommodation', desc: 'Specify your hotel name (e.g. Marina Bay Sands, Hotel Boss, Village Hotel Bugis) or residential host address and Singapore contact number.' },
              { step: '5', title: 'Complete Health Declaration & Submit', desc: 'Answer standard health declaration questions. Review and submit to receive your digital confirmation PDF.' },
            ].map((s, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0F4C3A', color: '#FFF', fontWeight: 900, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
            <Link href="/mdac" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', textDecoration: 'none', color: '#1E40AF' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>🇲🇾 Malaysia Arrival Card (MDAC)</div>
                <div style={{ fontSize: '0.78rem', color: '#3B82F6', marginTop: '2px' }}>Mandatory for entering Malaysia</div>
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
