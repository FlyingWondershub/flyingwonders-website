'use client'

import { useState } from 'react'

interface LegalSection {
  id: string
  title: string
  content: string
}

interface LegalPageClientProps {
  title: string
  subtitle: string
  sections: LegalSection[]
}

export default function LegalPageClient({ title, subtitle, sections }: LegalPageClientProps) {
  const [activeTab, setActiveTab] = useState(sections[0]?.id || '')

  const activeSection = sections.find((sec) => sec.id === activeTab) || sections[0]

  return (
    <div className="container" style={{ padding: '6rem 1.5rem', minHeight: '80vh' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span style={{ color: 'var(--gold-accent)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Flying Wonders Compliance Portal
        </span>
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.8rem', color: 'var(--emerald-secondary)', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          {title}
        </h1>
        <p style={{ opacity: 0.7, fontSize: '0.95rem' }}>
          {subtitle}
        </p>
      </div>

      {/* Multi-Page Sidebar Tab Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        
        {/* Sidebar Navigation */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)', fontWeight: 700 }}>
            Sections
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                style={{
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: activeTab === sec.id ? 'var(--emerald-secondary)' : 'transparent',
                  color: activeTab === sec.id ? 'white' : 'var(--text-dark)',
                  border: 'none',
                  fontWeight: activeTab === sec.id ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  opacity: activeTab === sec.id ? 1 : 0.8,
                }}
              >
                {sec.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Panel */}
        <div className="glass" style={{ background: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
          {activeSection ? (
            <>
              <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.75rem', color: 'var(--emerald-secondary)', marginBottom: '1.5rem', borderBottom: '2px solid var(--gold-accent)', paddingBottom: '0.5rem', display: 'inline-block' }}>
                {activeSection.title}
              </h2>
              <div style={{ color: 'var(--text-dark)', fontSize: '1rem', lineHeight: '1.8', whiteSpace: 'pre-line', opacity: 0.95 }}>
                {activeSection.content}
              </div>
            </>
          ) : (
            <p style={{ opacity: 0.5, color: 'var(--text-dark)' }}>No content available for this section.</p>
          )}
        </div>

      </div>

    </div>
  )
}
