'use client'

import { useState } from 'react'
import Link from 'next/link'
import { urlForImage } from '../../../sanity/lib/image'
import IciciQrModal from '../../../components/IciciQrModal'
import AdBanner from '../../../components/AdBanner'
import type { TravelPackage } from '../../../utils/packages'

interface Props {
  pkg: TravelPackage
  exchangeRate: number
  inrPrice: number
  cleanSlug: string
}

export default function PackageDetailClient({ pkg, exchangeRate, inrPrice, cleanSlug }: Props) {
  const [showQrModal, setShowQrModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const imageUrl = typeof pkg.image === 'string'
    ? pkg.image
    : (pkg.image ? urlForImage(pkg.image).url() : '/images/hero/singapore-hero-1.jpg')

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const whatsappMessage = encodeURIComponent(
    `Hi Flying Wonders, I am interested in booking the "${pkg.title}" (${pkg.itinerary.length} Days) package. Please share available travel dates, hotel upgrade options, and net invoice quote.`
  )

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '6rem' }}>
      
      {/* ── Top Hero / Breadcrumb Navigation ── */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)', padding: '1.25rem 1.5rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted, #64748B)' }}>
            <Link href="/" style={{ color: 'var(--emerald-secondary)', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            <span>/</span>
            <Link href="/packages" style={{ color: 'var(--emerald-secondary)', textDecoration: 'none', fontWeight: 600 }}>Packages</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-dark)', fontWeight: 700 }}>{pkg.title}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={handleCopyLink}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                border: copied ? '1px solid #10B981' : '1px solid var(--glass-border, #CBD5E1)',
                background: copied ? 'rgba(16,185,129,0.1)' : 'var(--bg-main)',
                color: copied ? '#047857' : 'var(--text-dark)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {copied ? '✓ Direct Link Copied!' : '🔗 Share Package Link'}
            </button>

            <Link
              href="/packages"
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                border: '1px solid var(--glass-border)',
                background: 'var(--bg-main)',
                color: 'var(--emerald-secondary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                textDecoration: 'none'
              }}
            >
              ← All Packages
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem' }}>
        
        {/* ── Top Header Section ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ 
                background: 'rgba(15,76,58,0.1)', 
                color: 'var(--emerald-secondary)', 
                fontSize: '0.75rem', 
                fontWeight: 800, 
                padding: '3px 10px', 
                borderRadius: '12px',
                textTransform: 'uppercase'
              }}>
                {pkg.tier} Tier Package
              </span>
              <span style={{ 
                background: 'rgba(212,175,55,0.15)', 
                color: 'var(--text-dark)', 
                fontSize: '0.75rem', 
                fontWeight: 800, 
                padding: '3px 10px', 
                borderRadius: '12px' 
              }}>
                ⏱️ {pkg.itinerary.length} Days / {Math.max(1, pkg.itinerary.length - 1)} Nights
              </span>
            </div>

            <h1 style={{ 
              fontFamily: 'var(--font-playfair), serif', 
              fontSize: 'clamp(2rem, 4vw, 3rem)', 
              color: 'var(--text-dark)', 
              margin: '0 0 1rem 0',
              lineHeight: 1.2
            }}>
              {pkg.title}
            </h1>

            <p style={{ 
              fontSize: '1.05rem', 
              lineHeight: 1.7, 
              color: 'var(--text-dark)', 
              opacity: 0.85, 
              margin: 0,
              maxWidth: '750px' 
            }}>
              {pkg.description}
            </p>
          </div>

          {/* ── Price Card ── */}
          <div style={{ 
            background: 'var(--card-bg, #FFF)', 
            border: '1.5px solid var(--emerald-secondary)', 
            borderRadius: '16px', 
            padding: '1.75rem', 
            boxShadow: 'var(--shadow-md)',
            minWidth: '280px',
            flex: '0 0 auto'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
              Direct DMC Net Rate
            </span>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--crimson-primary)', fontFamily: 'var(--font-inter), sans-serif' }}>
                ₹ {inrPrice.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ person</span>
            </div>

            <span style={{ fontSize: '0.9rem', color: 'var(--emerald-secondary)', fontWeight: 700, display: 'block', marginBottom: '1.25rem' }}>
              (S$ {pkg.price} SGD Net Rate)
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <a
                href={`https://wa.me/919886171251?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#25D366',
                  color: '#FFFFFF',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(37,211,102,0.25)'
                }}
              >
                💬 Inquire on WhatsApp
              </a>

              <Link
                href={`/book?packageId=${pkg._id}`}
                className="btn btn-primary"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textDecoration: 'none'
                }}
              >
                Book Package Online →
              </Link>

              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                style={{
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                ⚡ Instant ICICI UPI QR (0% Fee)
              </button>
            </div>
          </div>
        </div>

        {/* ── Cover Hero Image ── */}
        <div style={{ 
          height: 'clamp(280px, 45vw, 460px)', 
          borderRadius: '20px', 
          overflow: 'hidden', 
          marginBottom: '3rem', 
          boxShadow: 'var(--shadow-md)',
          position: 'relative'
        }}>
          <img 
            src={imageUrl} 
            alt={pkg.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* ── Hotel Options & Inclusions Bar ── */}
        {pkg.hotelOptions && (
          <div style={{ 
            background: 'var(--bg-secondary)', 
            borderRadius: '14px', 
            border: '1px solid var(--glass-border)', 
            padding: '1.25rem 1.5rem', 
            marginBottom: '3rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ fontSize: '1.5rem' }}>🏨</div>
            <div>
              <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--gold-accent)', display: 'block' }}>
                Featured Hotel Options & Standard Category
              </strong>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                {pkg.hotelOptions}
              </span>
            </div>
          </div>
        )}

        {/* ── Day-by-Day Comprehensive Itinerary Timeline ── */}
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ color: 'var(--crimson-primary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.15em', fontSize: '0.8rem' }}>
              Curated DMC Schedule
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', color: 'var(--text-dark)', margin: '0.3rem 0 0 0' }}>
              Day-by-Day Detailed Itinerary
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {pkg.itinerary.map((day, dIdx) => (
              <div key={dIdx}>
                
                {/* Single Day Card */}
                <div style={{ 
                  background: 'var(--card-bg, #FFF)', 
                  borderRadius: '16px', 
                  border: '1px solid var(--glass-border)', 
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <span style={{ 
                      background: 'var(--emerald-secondary)', 
                      color: '#FFF', 
                      padding: '0.3rem 0.85rem', 
                      borderRadius: '8px', 
                      fontWeight: 800, 
                      fontSize: '0.85rem' 
                    }}>
                      DAY {day.day}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                      {day.title}
                    </h3>
                  </div>

                  <div style={{ 
                    paddingLeft: '1.5rem', 
                    borderLeft: '3px solid var(--emerald-secondary)', 
                    marginLeft: '0.75rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.75rem' 
                  }}>
                    {day.activities.map((act, aIdx) => (
                      <div key={aIdx} style={{ fontSize: '0.92rem', color: 'var(--text-dark)', lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--crimson-primary)', marginRight: '0.75rem', fontSize: '0.88rem' }}>
                          ⏰ {act.time}
                        </strong>
                        {act.desc}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 🎯 Strategic Ad Placement between Day 2 & Day 3 */}
                {dIdx === 1 && (
                  <AdBanner 
                    slotId="package_detail_mid_slot" 
                    category="packages"
                    style={{ margin: '2.5rem 0' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── Bottom Booking Action Box ── */}
          <div style={{ 
            marginTop: '4rem', 
            padding: '2.5rem', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, rgba(15,76,58,0.06) 0%, rgba(184,58,75,0.06) 100%)', 
            border: '2px solid var(--emerald-secondary)',
            textAlign: 'center'
          }}>
            <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.8rem', color: 'var(--text-dark)', margin: '0 0 0.5rem 0' }}>
              Ready to Book {pkg.title}?
            </h3>
            <p style={{ maxWidth: '600px', margin: '0 auto 1.75rem', color: 'var(--text-dark)', opacity: 0.85, fontSize: '0.95rem' }}>
              Connect with our Singapore destination desk on WhatsApp for custom hotel dates, flight add-ons, or wholesale B2B travel agency invoices.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href={`https://wa.me/919886171251?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: '#FFFFFF',
                  padding: '0.85rem 1.75rem',
                  borderRadius: '30px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(37,211,102,0.3)'
                }}
              >
                💬 WhatsApp Destination Desk (+91 9886171251)
              </a>

              <Link
                href={`/book?packageId=${pkg._id}`}
                className="btn btn-primary"
                style={{
                  padding: '0.85rem 1.75rem',
                  borderRadius: '30px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textDecoration: 'none'
                }}
              >
                Confirm Booking Online →
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* ── ICICI QR Modal ── */}
      {showQrModal && (
        <IciciQrModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          amountSgd={pkg.price}
          bookingReference={`FW-PKG-${cleanSlug.toUpperCase()}`}
        />
      )}

    </div>
  )
}
