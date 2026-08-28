'use client'

import React, { useEffect, useCallback } from 'react'
import type { TravelShort } from '../utils/packages'
import { extractYouTubeVideoId } from '../utils/packages'

interface ShortsModalPlayerProps {
  isOpen: boolean
  onClose: () => void
  shorts: TravelShort[]
  currentIndex: number
  onNavigate: (index: number) => void
}

export default function ShortsModalPlayer({
  isOpen,
  onClose,
  shorts,
  currentIndex,
  onNavigate
}: ShortsModalPlayerProps) {
  const currentShort = shorts[currentIndex]
  const videoId = currentShort ? extractYouTubeVideoId(currentShort.youtubeVideoId || currentShort.id) : ''

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (currentIndex < shorts.length - 1) {
          onNavigate(currentIndex + 1)
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (currentIndex > 0) {
          onNavigate(currentIndex - 1)
        }
      }
    },
    [currentIndex, shorts.length, onClose, onNavigate]
  )

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !currentShort) return null

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < shorts.length - 1

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          height: 'min(82vh, 660px)',
          background: '#0a0a0a',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.12)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 30,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, background 0.15s ease'
          }}
        >
          ✕
        </button>

        {/* Counter Badge */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 30,
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '4px 10px',
            fontSize: '0.75rem',
            color: '#FFFFFF',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}
        >
          {currentIndex + 1} / {shorts.length}
        </div>

        {/* YouTube Vertical Iframe */}
        <div style={{ position: 'relative', width: '100%', flex: 1, background: '#000' }}>
          <iframe
            key={videoId}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`}
            title={currentShort.title}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Video Info Bottom Banner */}
        <div
          style={{
            padding: '0.85rem 1.15rem',
            background: 'linear-gradient(180deg, #111827 0%, #030712 100%)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {currentShort.title}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#9CA3AF' }}>
            <span>👤 {currentShort.creator}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentShort.views && <span>👁️ {currentShort.views}</span>}
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#FF0000',
                  background: 'rgba(255, 0, 0, 0.12)',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Watch on YouTube ↗
              </a>
            </div>
          </div>
        </div>

        {/* Previous Navigation Floating Button */}
        {hasPrev && (
          <button
            type="button"
            onClick={() => onNavigate(currentIndex - 1)}
            aria-label="Previous Short"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 25,
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}
          >
            ‹
          </button>
        )}

        {/* Next Navigation Floating Button */}
        {hasNext && (
          <button
            type="button"
            onClick={() => onNavigate(currentIndex + 1)}
            aria-label="Next Short"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 25,
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}
          >
            ›
          </button>
        )}
      </div>
    </div>
  )
}
