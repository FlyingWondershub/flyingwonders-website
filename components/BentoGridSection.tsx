'use client'

import { useState, useEffect } from 'react'

export interface BentoCardData {
  tagline: string
  header: string
  story: string
  image: string
  gradient: string
  videoType?: 'youtube' | 'file' | 'none'
  videoUrl?: string
  videoFileUrl?: string
}

interface BentoGridSectionProps {
  sectionTitle: string
  cards: BentoCardData[]
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null
  try {
    let videoId = ''
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split(/[?&]/)[0] || ''
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split(/[?&]/)[0] || ''
    } else if (url.includes('youtube.com/watch')) {
      const parsedUrl = new URL(url)
      videoId = parsedUrl.searchParams.get('v') || ''
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('youtube.com/shorts/')[1]?.split(/[?&]/)[0] || ''
    }

    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
    }
  } catch {
    // Fallback if URL parsing fails
  }
  return null
}

export default function BentoGridSection({ sectionTitle, cards }: BentoGridSectionProps) {
  const [activeVideoCard, setActiveVideoCard] = useState<BentoCardData | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveVideoCard(null)
      }
    }
    if (activeVideoCard) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [activeVideoCard])

  return (
    <section style={{ padding: '6rem 2rem', background: 'var(--bg-main)', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <span
          style={{
            color: 'var(--crimson-primary)',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.2em',
            fontSize: '0.8rem',
            display: 'block',
            textAlign: 'center',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-inter), sans-serif',
          }}
        >
          Singapore At A Glance
        </span>
        <h2
          style={{
            textAlign: 'center',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginBottom: '3.5rem',
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontWeight: 600,
          }}
        >
          {sectionTitle}
        </h2>

        <div className="bento-grid">
          {cards.map((card, idx) => {
            const hasVideo =
              card.videoType !== 'none' &&
              ((card.videoType === 'file' && !!card.videoFileUrl) ||
                (card.videoType === 'youtube' && !!card.videoUrl) ||
                (!card.videoType && !!card.videoUrl))

            return (
              <div
                key={idx}
                className="bento-card hover-lift"
                onClick={() => {
                  if (hasVideo) setActiveVideoCard(card)
                }}
                role={hasVideo ? 'button' : undefined}
                tabIndex={hasVideo ? 0 : undefined}
                onKeyDown={(e) => {
                  if (hasVideo && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    setActiveVideoCard(card)
                  }
                }}
                style={{
                  backgroundImage: `${card.gradient}, url(${card.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  colorScheme: 'dark',
                  cursor: hasVideo ? 'pointer' : 'default',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease',
                }}
              >
                {/* Video Play Badge if video is attached */}
                {hasVideo && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '1.25rem',
                      right: '1.25rem',
                      zIndex: 3,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.22)',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '50px',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: 'var(--gold-accent, #D4AF37)',
                        color: '#0F172A',
                        fontSize: '9px',
                        paddingLeft: '2px',
                      }}
                    >
                      ▶
                    </span>
                    <span>Watch Video</span>
                  </div>
                )}

                {/* Card Text Content */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <span
                    style={{
                      color: 'var(--gold-accent, #D4AF37)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontFamily: 'var(--font-inter), sans-serif',
                    }}
                  >
                    {card.tagline}
                  </span>
                  <h3
                    style={{
                      fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)',
                      color: '#FFFFFF',
                      margin: '0 0 0.6rem 0',
                      lineHeight: 1.25,
                      fontFamily: 'var(--font-playfair), Georgia, serif',
                      fontWeight: 600,
                    }}
                  >
                    {card.header}
                  </h3>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '0.92rem',
                      fontWeight: 300,
                      lineHeight: 1.65,
                      margin: 0,
                      fontFamily: 'var(--font-inter), sans-serif',
                    }}
                  >
                    {card.story}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Video Lightbox Modal */}
      {activeVideoCard && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeVideoCard.header}
          onClick={() => setActiveVideoCard(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(5, 10, 18, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '960px',
              backgroundColor: '#0F172A',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(15, 23, 42, 0.95)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                <span
                  style={{
                    color: 'var(--gold-accent, #D4AF37)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontFamily: 'var(--font-inter), sans-serif',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {activeVideoCard.tagline}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                <h4
                  style={{
                    color: '#FFFFFF',
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 500,
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {activeVideoCard.header}
                </h4>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveVideoCard(null)}
                aria-label="Close video"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  flexShrink: 0,
                  marginLeft: '1rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            <div
              style={{
                position: 'relative',
                paddingTop: '56.25%',
                width: '100%',
                backgroundColor: '#000000',
              }}
            >
              {activeVideoCard.videoType === 'file' && activeVideoCard.videoFileUrl ? (
                <video
                  src={activeVideoCard.videoFileUrl}
                  controls
                  autoPlay
                  playsInline
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                (() => {
                  const embedUrl = getYouTubeEmbedUrl(activeVideoCard.videoUrl || '')
                  if (embedUrl) {
                    return (
                      <iframe
                        src={embedUrl}
                        title={activeVideoCard.header}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none',
                        }}
                      />
                    )
                  }
                  return (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.7)',
                        fontFamily: 'var(--font-inter), sans-serif',
                      }}
                    >
                      Video unavailable.
                    </div>
                  )
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
