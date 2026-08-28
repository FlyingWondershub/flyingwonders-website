'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  MapPin, 
  Play, 
  ImageIcon, 
  Check, 
  Share2, 
  ArrowLeft, 
  Package, 
  MessageCircle, 
  Sparkles,
  BedDouble,
  ShieldCheck,
  Clock,
  Lightbulb,
  CheckCircle2
} from 'lucide-react'
import { HotelData } from '../../../../utils/hotels'
import PackageShortsCarousel from '../../../../components/PackageShortsCarousel'
import AppDownloadCard from '../../../../components/AppDownloadCard'

export default function HotelDetailClient({ hotel }: { hotel: HotelData }) {
  const [copied, setCopied] = useState(false)
  const [activePhoto, setActivePhoto] = useState<string | null>(null)

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0]
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&rel=0`
      }
      if (url.includes('youtube.com/watch')) {
        const params = new URL(url).searchParams
        return `https://www.youtube-nocookie.com/embed/${params.get('v')}?autoplay=0&rel=0`
      }
    } catch (e) {}
    return url
  }

  const targetWhatsappNumber = (hotel.whatsappNumber || '919886171251').replace(/[^0-9]/g, '')
  const whatsappMsgText = hotel.whatsappMessage || `Hi Flying Wonders! I would like to inquire about B2B rates and group booking availability for ${hotel.name} (${hotel.star}).`
  const whatsappMsg = encodeURIComponent(whatsappMsgText)

  const allPhotos = [
    hotel.coverImageUrl,
    ...(hotel.galleryImageUrls || [])
  ].filter(Boolean)

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B', paddingBottom: '3rem' }}>
      
      {/* ── 1. BREADCRUMBS & TOP BAR ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0.85rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748B', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/services-catalog" style={{ color: '#64748B', textDecoration: 'none' }}>Services Catalog</Link>
            <span>/</span>
            <Link href="/services-catalog" style={{ color: '#0F4C3A', fontWeight: 700, textDecoration: 'none' }}>Hotels</Link>
            <span>/</span>
            <span style={{ color: '#0F172A', fontWeight: 800 }}>{hotel.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFF',
                color: copied ? '#15803D' : '#334155',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} color="#15803D" /> : <Share2 size={14} />}
              <span>{copied ? 'Link Copied!' : 'Share Hotel Page'}</span>
            </button>

            <Link
              href="/services-catalog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #0F4C3A',
                background: '#0F4C3A',
                color: '#FFF',
                fontSize: '0.8rem',
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              <ArrowLeft size={14} />
              <span>Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. HERO SHOWCASE BANNER ── */}
      <section style={{ maxWidth: '1200px', margin: '1.5rem auto', padding: '0 1.5rem' }}>
        <div style={{
          position: 'relative',
          minHeight: '340px',
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundImage: `linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.4) 50%, rgba(15,23,42,0.2) 100%), url(${hotel.coverImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '2.5rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#FEF3C7', color: '#B45309', fontWeight: 900, fontSize: '0.82rem', padding: '4px 10px', borderRadius: '8px' }}>
              ★ {hotel.star}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#FFF', fontWeight: 700, fontSize: '0.82rem', padding: '4px 12px', borderRadius: '8px', backdropFilter: 'blur(6px)' }}>
              <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} /> {hotel.location}
            </span>
            <span style={{ background: '#DCFCE7', color: '#15803D', fontWeight: 800, fontSize: '0.78rem', padding: '4px 10px', borderRadius: '8px' }}>
              <ShieldCheck size={13} style={{ display: 'inline', marginRight: '4px' }} /> Verified B2B DMC Partner
            </span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 0.5rem', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            {hotel.name}
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#E2E8F0', margin: 0, fontWeight: 500, maxWidth: '750px' }}>
            📍 {hotel.hotelAddress || hotel.subtitle || hotel.location}
          </p>
        </div>
      </section>

      {/* ── 3. QUICK STATS STRIP ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 2rem', padding: '0 1.5rem' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1.25rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={20} color="#059669" />
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Check-In / Out</span>
              <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>From 3:00 PM / 12:00 PM</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building2 size={20} color="#2563EB" />
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Property Classification</span>
              <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>{hotel.star} Hotel Destination</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={20} color="#D97706" />
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Transit Link</span>
              <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>Near Key MRT Stations</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={20} color="#9333EA" />
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Allotments</span>
              <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>Direct B2B DMC Contracting</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. MAIN CONTENT: 2-COLUMN LAYOUT ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* LEFT COLUMN: Overview, Highlights, Timings, Pro-Tips, Video, Rooms & Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', gridColumn: 'span 2' }}>
          
          {/* Property Overview & Description */}
          <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} color="#0F4C3A" /> Property Overview
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
              {hotel.description}
            </p>
          </div>

          {/* MUST-EXPERIENCE HOTEL HIGHLIGHTS & AMENITIES */}
          {hotel.mustDoThings && hotel.mustDoThings.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.35rem' }}>✨</span>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Must-Experience Hotel Highlights & Amenities
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
                    Signature facilities, dining options, and guest conveniences at {hotel.name}.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {hotel.mustDoThings.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '1rem 1.15rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0F4C3A', color: '#FFF', fontSize: '0.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      {idx + 1}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.55, fontWeight: 600 }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOTEL TIMINGS & HOUSE GUIDELINES */}
          {hotel.timings && (
            <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="#0F4C3A" /> Hotel Timings & House Guidelines
              </h2>

              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '1.25rem' }}>
                <strong style={{ fontSize: '0.92rem', color: '#166534', lineHeight: 1.6, display: 'block' }}>
                  🕒 {hotel.timings}
                </strong>
              </div>
            </div>
          )}

          {/* PRO-TIPS & NEIGHBORHOOD GUIDE */}
          {hotel.tipsAndTricks && hotel.tipsAndTricks.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <Lightbulb size={22} color="#D97706" />
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Pro-Tips & Neighborhood Guide
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
                    Local transit directions, dining recommendations, and guest hacks.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                {hotel.tipsAndTricks.map((tip, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FEFCE8',
                      border: '1px solid #FEF08A',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#713F12', lineHeight: 1.5, fontWeight: 600 }}>
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Showcase Tour Player */}
          {hotel.videoUrl && (
            <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={20} color="#EF4444" fill="#EF4444" /> Hotel & Room Video Walkthrough Tour
              </h2>
              {hotel.videoUrl.includes('youtube.com') || hotel.videoUrl.includes('youtu.be') ? (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                  <iframe
                    src={getYouTubeEmbedUrl(hotel.videoUrl)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  controls
                  playsInline
                  src={hotel.videoUrl}
                  style={{ width: '100%', maxHeight: '420px', borderRadius: '12px', background: '#000', border: '1px solid #E2E8F0' }}
                />
              )}
            </div>
          )}

          {/* DIGITAL CONCIERGE & APP DOWNLOAD CARD */}
          {hotel.appDetails && (
            <AppDownloadCard appDetails={hotel.appDetails} />
          )}

          {/* Available Room Categories & Suites */}
          {hotel.roomCategories && hotel.roomCategories.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BedDouble size={20} color="#0F4C3A" /> Available Room Categories & Suites
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {hotel.roomCategories.map((rc, idx) => (
                  <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BedDouble size={18} color="#15803D" />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block' }}>{rc}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Enquire for FIT / Group Rates</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YouTube Shorts Carousel for Hotel Video Walkthroughs */}
          {hotel.shorts && hotel.shorts.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <PackageShortsCarousel
                destination={hotel.location || 'Singapore'}
                curatedShorts={hotel.shorts}
              />
            </div>
          )}

          {/* Photo Gallery Grid */}
          {allPhotos.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={20} color="#0F4C3A" /> High-Resolution Photo Gallery ({allPhotos.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
                {allPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActivePhoto(url)}
                    style={{
                      height: '130px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid #E2E8F0',
                      position: 'relative'
                    }}
                  >
                    <img src={url} alt={`${hotel.name} Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s ease' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Quick B2B Action Card & Amenities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Action Card: Custom Package Builder & WhatsApp Booking */}
          <div style={{ background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)', color: '#FFF', borderRadius: '18px', padding: '1.75rem', boxShadow: '0 8px 25px rgba(15,76,58,0.2)', position: 'sticky', top: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.85rem' }}>
              <Sparkles size={13} color="#10B981" /> Wholesale B2B Rates
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFF', margin: '0 0 0.5rem' }}>
              Ready to Book {hotel.name}?
            </h3>

            <p style={{ fontSize: '0.85rem', color: '#E2E8F0', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Include this verified hotel in your custom Singapore or Malaysia itinerary, or request special group block rates from our operations team.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                href="/custom-package"
                style={{
                  background: '#B83A4B',
                  color: '#FFF',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(184,58,75,0.3)'
                }}
              >
                <Package size={17} />
                <span>Build Custom Package ⚙️</span>
              </Link>

              <a
                href={`https://wa.me/${targetWhatsappNumber}?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: '#FFF',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(37,211,102,0.25)'
                }}
              >
                <MessageCircle size={17} />
                <span>Inquire Rates on WhatsApp</span>
              </a>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#A7F3D0', margin: '0 0 0.65rem' }}>
                Key Hotel Amenities & Inclusions:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(hotel.features || ['Buffet Breakfast Available', 'Free High-Speed Wi-Fi', 'Swimming Pool', '24/7 Concierge']).map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#F1F5F9' }}>
                    <Check size={13} color="#10B981" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── 5. LIGHTBOX MODAL FOR FULL-SIZE PHOTOS ── */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            cursor: 'pointer'
          }}
        >
          <img
            src={activePhoto}
            alt="Full size view"
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', objectFit: 'contain' }}
          />
        </div>
      )}

    </div>
  )
}
