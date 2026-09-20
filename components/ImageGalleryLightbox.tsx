'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react'

interface ImageGalleryLightboxProps {
  images: string[]
  initialIndex?: number
  title?: string
  isOpen: boolean
  onClose: () => void
}

export default function ImageGalleryLightbox({
  images,
  initialIndex = 0,
  title,
  isOpen,
  onClose,
}: ImageGalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)
  const thumbnailStripRef = useRef<HTMLDivElement>(null)

  // Keep currentIndex in sync when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const validIndex = Math.max(0, Math.min(initialIndex, images.length - 1))
      setCurrentIndex(validIndex)
    }
  }, [isOpen, initialIndex, images.length])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  const handleNext = useCallback(() => {
    if (images.length <= 1) return
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleNext, handlePrev, onClose])

  // Auto-scroll thumbnail strip so active photo is visible
  useEffect(() => {
    if (!isOpen || !thumbnailStripRef.current) return
    const activeThumb = thumbnailStripRef.current.children[currentIndex] as HTMLElement
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [currentIndex, isOpen])

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX)
    setTouchEndX(null)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return
    const deltaX = touchStartX - touchEndX
    const swipeThreshold = 45 // min pixels to count as swipe

    if (deltaX > swipeThreshold) {
      // Swiped Left -> Next Image
      handleNext()
    } else if (deltaX < -swipeThreshold) {
      // Swiped Right -> Previous Image
      handlePrev()
    }
    setTouchStartX(null)
    setTouchEndX(null)
  }

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery viewer"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(10, 15, 25, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 100005,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif',
        userSelect: 'none',
      }}
      onClick={onClose}
    >
      {/* ── TOP BAR: Title, Counter & Close ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 1.5rem',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
          zIndex: 10,
          color: '#FFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span
            style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <ImageIcon size={13} /> {currentIndex + 1} / {images.length}
          </span>
          {title && (
            <h3
              style={{
                margin: 0,
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#F8FAFC',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </h3>
          )}
        </div>

        <button
          onClick={onClose}
          aria-label="Close image gallery"
          style={{
            background: 'rgba(255, 255, 255, 0.18)',
            border: 'none',
            color: '#FFFFFF',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease, transform 0.15s ease',
            outline: 'none',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.32)'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── MAIN STAGE: Center Image with Next/Prev Arrows ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem 1rem',
          minHeight: 0,
          cursor: 'default',
        }}
      >
        {/* Previous Button (left) */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Previous photo"
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              transition: 'background 0.15s ease, transform 0.15s ease',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(15, 76, 58, 0.95)'
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.75)'
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
            }}
          >
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>
        )}

        {/* Current Active Image */}
        <div
          style={{
            maxWidth: '92vw',
            maxHeight: '74vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <img
            key={currentImage}
            src={currentImage}
            alt={title ? `${title} - photo ${currentIndex + 1}` : `Photo ${currentIndex + 1}`}
            style={{
              maxWidth: '100%',
              maxHeight: '74vh',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              animation: 'fadeSlideIn 0.22s ease-out',
            }}
          />
        </div>

        {/* Next Button (right) */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            aria-label="Next photo"
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              transition: 'background 0.15s ease, transform 0.15s ease',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(15, 76, 58, 0.95)'
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.75)'
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
            }}
          >
            <ChevronRight size={26} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* ── BOTTOM THUMBNAIL TRACK ── */}
      {images.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: '0.75rem 1.25rem 1.25rem',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
            zIndex: 10,
          }}
        >
          <div
            ref={thumbnailStripRef}
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              justifyContent: images.length > 6 ? 'flex-start' : 'center',
              paddingBottom: '4px',
              scrollbarWidth: 'thin',
            }}
          >
            {images.map((imgUrl, idx) => {
              const isActive = idx === currentIndex
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`View photo ${idx + 1}`}
                  style={{
                    flexShrink: 0,
                    width: '68px',
                    height: '48px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: isActive ? '2px solid #10B981' : '1px solid rgba(255,255,255,0.2)',
                    opacity: isActive ? 1 : 0.55,
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                    padding: 0,
                    background: 'transparent',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.opacity = '0.9'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.opacity = '0.55'
                  }}
                >
                  <img
                    src={imgUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Keyframe animation for slide in */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0.7;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
