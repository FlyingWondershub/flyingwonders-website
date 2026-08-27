'use client'

import React from 'react'
import { Smartphone, CheckCircle } from 'lucide-react'

export interface AppDetails {
  appName: string
  appDescription?: string
  appStoreUrl?: string
  playStoreUrl?: string
  appFeatures?: string[]
}

interface AppDownloadCardProps {
  appDetails: AppDetails
  accentColor?: string
}

export default function AppDownloadCard({
  appDetails,
  accentColor = '#0F4C3A'
}: AppDownloadCardProps) {
  if (!appDetails || !appDetails.appName) return null

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        color: '#FFFFFF',
        borderRadius: '18px',
        padding: '1.75rem',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header Tag */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: '#34D399', marginBottom: '0.85rem', backdropFilter: 'blur(4px)' }}>
          <Smartphone size={14} /> Official Visitor Mobile App
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 0.4rem', letterSpacing: '-0.01em' }}>
          {appDetails.appName}
        </h3>

        {appDetails.appDescription && (
          <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
            {appDetails.appDescription}
          </p>
        )}

        {/* Feature List */}
        {appDetails.appFeatures && appDetails.appFeatures.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.06)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {appDetails.appFeatures.map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#F1F5F9' }}>
                <CheckCircle size={14} color="#34D399" style={{ flexShrink: 0 }} />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        )}

        {/* App Download Buttons (iOS App Store & Android Google Play) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {appDetails.appStoreUrl && (
            <a
              href={appDetails.appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#000000',
                color: '#FFFFFF',
                padding: '0.65rem 1.15rem',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                transition: 'transform 0.15s ease, background 0.15s ease'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.4c.66-.8 1.11-1.92.99-3.04-1 .04-2.14.67-2.82 1.46-.58.67-1.1 1.77-.96 2.85 1.1.09 2.18-.54 2.79-1.27z"/>
              </svg>
              <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                <span style={{ fontSize: '0.62rem', color: '#94A3B8', display: 'block' }}>Download on the</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>App Store</span>
              </div>
            </a>
          )}

          {appDetails.playStoreUrl && (
            <a
              href={appDetails.playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#000000',
                color: '#FFFFFF',
                padding: '0.65rem 1.15rem',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                transition: 'transform 0.15s ease, background 0.15s ease'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3.609 1.814L13.792 12 3.61 22.186c-.352-.37-.567-.932-.567-1.639V3.453c0-.707.215-1.27.566-1.639z" fill="#4285F4"/>
                <path d="M17.18 8.613L13.792 12l3.388 3.387 3.824-2.173c1.092-.62 1.092-1.63 0-2.25L17.18 8.613z" fill="#FBBC04"/>
                <path d="M3.609 22.186L13.792 12l3.388 3.387-11.897 6.76c-.503.285-.947.23-1.283-.021z" fill="#EA4335"/>
                <path d="M3.609 1.814L5.283 3.49l11.897 6.76-3.388 3.387L3.61 1.814c.335-.25.78-.306 1.282-.021z" fill="#34A853"/>
              </svg>
              <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                <span style={{ fontSize: '0.62rem', color: '#94A3B8', display: 'block' }}>GET IT ON</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Google Play</span>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
