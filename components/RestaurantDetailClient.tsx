'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Utensils,
  MapPin,
  Clock,
  Sparkles,
  Play,
  ImageIcon,
  Check,
  Share2,
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Star,
  Info,
  DollarSign,
  Coffee,
  CheckCircle2,
  Compass
} from 'lucide-react'
import { RestaurantData, MustTryDish } from '../utils/restaurants'
import PackageShortsCarousel from './PackageShortsCarousel'
import ImageGalleryLightbox from './ImageGalleryLightbox'

export default function RestaurantDetailClient({ restaurant }: { restaurant: RestaurantData }) {
  const [copied, setCopied] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return ''
    try {
      if (url.includes('/embed/')) {
        const separator = url.includes('?') ? '&' : '?'
        return `${url}${separator}rel=0&modestbranding=1&enablejsapi=1`
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1`
      }
      if (url.includes('youtube.com/shorts/')) {
        const id = url.split('shorts/')[1]?.split('?')[0]?.split('&')[0]
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1`
      }
      if (url.includes('youtube.com/watch')) {
        const v = new URL(url).searchParams.get('v')
        if (v) return `https://www.youtube.com/embed/${v}?rel=0&modestbranding=1&enablejsapi=1`
      }
      const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)
      if (match && match[2]?.length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?rel=0&modestbranding=1&enablejsapi=1`
      }
    } catch (e) {}
    return url
  }

  const targetWhatsappNumber = (restaurant.whatsappNumber || '919886171251').replace(/[^0-9]/g, '')
  const whatsappMsgText = restaurant.whatsappMessage || `Hi Flying Wonders! I would like to inquire about group table reservations, dietary options, and special buffet rates for ${restaurant.name}.`
  const whatsappMsg = encodeURIComponent(whatsappMsgText)

  const allPhotos = [
    restaurant.coverImageUrl,
    ...(restaurant.galleryImageUrls || [])
  ].filter(Boolean)

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B', paddingBottom: '3rem' }}>
      
      {/* ── 1. BREADCRUMBS & TOP BAR ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0.75rem 1rem', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1440px', width: '96%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748B', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/services-catalog" style={{ color: '#64748B', textDecoration: 'none' }}>Services Catalog</Link>
            <span>/</span>
            <Link href="/services-catalog?tab=restaurants" style={{ color: '#0F4C3A', fontWeight: 700, textDecoration: 'none' }}>Restaurants</Link>
            <span>/</span>
            <span style={{ color: '#0F172A', fontWeight: 800 }}>{restaurant.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              <span>{copied ? 'Link Copied!' : 'Share Restaurant'}</span>
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
      <section style={{ maxWidth: '1440px', width: '96%', margin: '1.25rem auto', padding: '0 0.5rem' }}>
        <div style={{
          position: 'relative',
          minHeight: '340px',
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundImage: `linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.5) 50%, rgba(15,23,42,0.25) 100%), url(${restaurant.coverImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '2rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)'
        }}>
          {/* Top Badges */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', zIndex: 2 }}>
            <span style={{ background: '#0F4C3A', color: '#FFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px', backdropFilter: 'blur(6px)' }}>
              <Utensils size={13} /> {restaurant.cuisineType}
            </span>
            {restaurant.hasBuffet && (
              <span style={{ background: '#D97706', color: '#FFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px', backdropFilter: 'blur(6px)' }}>
                🍽️ Buffet Available
              </span>
            )}
            {restaurant.isPopular && (
              <span style={{ background: '#DC2626', color: '#FFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                ⭐ Most Popular
              </span>
            )}
            <span style={{ background: 'rgba(255,255,255,0.92)', color: '#0F172A', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
              {restaurant.priceRange}
            </span>
          </div>

          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2 }}>
            <span style={{ background: 'rgba(15,23,42,0.85)', color: '#FCD34D', padding: '5px 12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px', backdropFilter: 'blur(8px)', border: '1px solid rgba(252,211,77,0.3)' }}>
              <Star size={15} fill="#FCD34D" color="#FCD34D" /> {restaurant.starRating} / 5.0
            </span>
          </div>

          {/* Banner Content */}
          <div style={{ maxWidth: '900px', zIndex: 2 }}>
            <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.65rem)', fontWeight: 900, color: '#FFFFFF', margin: '0 0 0.5rem', lineHeight: 1.2, fontFamily: 'var(--font-playfair), serif' }}>
              {restaurant.name}
            </h1>
            {restaurant.subtitle && (
              <p style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', color: '#E2E8F0', margin: '0 0 1rem', fontWeight: 600 }}>
                {restaurant.subtitle}
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
              {restaurant.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#CBD5E1', fontSize: '0.82rem' }}>
                  <MapPin size={15} color="#34D399" />
                  <span>{restaurant.address}</span>
                </div>
              )}
              {restaurant.nearestMrt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#FDE68A', fontSize: '0.82rem', fontWeight: 700 }}>
                  <Compass size={15} color="#FDE68A" />
                  <span>{restaurant.nearestMrt}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. MAIN CONTENT LAYOUT (2 COLUMNS) ── */}
      <div style={{ maxWidth: '1440px', width: '96%', margin: '0 auto', padding: '0 0.5rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '1.75rem' }}>
        
        {/* LEFT COLUMN: Deep Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', minWidth: 0 }}>
          
          {/* A. Video Showcase Tour Player */}
          {restaurant.videoUrl && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Play size={20} color="#EF4444" fill="#EF4444" /> Video Showcase & Dining Atmosphere
                </h2>
                <span style={{ fontSize: '0.75rem', background: '#FEF2F2', color: '#DC2626', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  Full HD Tour
                </span>
              </div>

              {restaurant.videoUrl.includes('youtube.com') || restaurant.videoUrl.includes('youtu.be') ? (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                  <iframe
                    src={getYouTubeEmbedUrl(restaurant.videoUrl)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${restaurant.name} Video Tour`}
                  />
                </div>
              ) : (
                <video
                  controls
                  playsInline
                  src={restaurant.videoUrl}
                  style={{ width: '100%', maxHeight: '420px', borderRadius: '12px', background: '#000', border: '1px solid #E2E8F0' }}
                />
              )}
            </div>
          )}

          {/* B. YouTube Shorts Reels Carousel */}
          {restaurant.shorts && restaurant.shorts.length > 0 && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="#D97706" /> Vertical Shorts & Reel Highlights
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                    Quick video highlights showing culinary prep, sizzlers, and buffet walkthroughs.
                  </p>
                </div>
              </div>
              <PackageShortsCarousel curatedShorts={restaurant.shorts} destination={restaurant.destination} />
            </div>
          )}

          {/* C. Buffet & Special Dining Offers Card */}
          {restaurant.hasBuffet && (
            <div style={{
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #FDE68A',
              boxShadow: '0 4px 15px rgba(217,119,6,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>🍽️</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#92400E' }}>
                  {restaurant.buffetHighlight || 'Special Buffet & Thali Spread Available'}
                </h3>
              </div>
              {restaurant.buffetDetails && (
                <p style={{ margin: '0 0 1rem', fontSize: '0.86rem', color: '#78350F', lineHeight: 1.6 }}>
                  {restaurant.buffetDetails}
                </p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ background: '#FEF9C3', color: '#854D0E', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', border: '1px solid #FDE047' }}>
                  ✓ Unlimited Refills Available
                </span>
                <span style={{ background: '#FEF9C3', color: '#854D0E', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', border: '1px solid #FDE047' }}>
                  ✓ Group Bookings Accepted
                </span>
                <span style={{ background: '#FEF9C3', color: '#854D0E', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', border: '1px solid #FDE047' }}>
                  ✓ Fresh Naan Baskets Served to Table
                </span>
              </div>
            </div>
          )}

          {/* D. Culinary Story & Dining Experience Overview */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.85rem' }}>
              Culinary Story & Overview
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.7, margin: '0 0 1.25rem', whiteSpace: 'pre-wrap' }}>
              {restaurant.longDescription}
            </p>

            {/* Dietary Badges */}
            {restaurant.dietaryBadges && restaurant.dietaryBadges.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <strong style={{ fontSize: '0.8rem', color: '#0F4C3A', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  Dietary Flexibility & Highlights
                </strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {restaurant.dietaryBadges.map((badge, idx) => (
                    <span key={idx} style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                      🌱 {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features & Amenities */}
            {restaurant.features && restaurant.features.length > 0 && (
              <div>
                <strong style={{ fontSize: '0.8rem', color: '#0F4C3A', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  Dining Amenities & Services
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {restaurant.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#334155', background: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <CheckCircle2 size={15} color="#059669" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* E. Signature Must-Try Dishes Showcase */}
          {restaurant.mustTryDishes && restaurant.mustTryDishes.length > 0 && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="#0F4C3A" /> Signature Must-Try Dishes
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                    Handcrafted house specialties and award-winning recipes recommended by food critics.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {restaurant.mustTryDishes.map((dishItem, idx) => {
                  const dish: MustTryDish = typeof dishItem === 'string'
                    ? { name: dishItem, description: 'Signature restaurant specialty recommended by chef.' }
                    : dishItem

                  return (
                    <div key={idx} style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                          {dish.name}
                        </h4>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {dish.isVegetarian && (
                            <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                              VEG
                            </span>
                          )}
                          {dish.isChefSpecial && (
                            <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                              ★ CHEF PICK
                            </span>
                          )}
                        </div>
                      </div>

                      {dish.category && (
                        <span style={{ fontSize: '0.72rem', color: '#0F4C3A', fontWeight: 700 }}>
                          {dish.category}
                        </span>
                      )}

                      {dish.description && (
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                          {dish.description}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* F. Photo Gallery with Lightbox */}
          {allPhotos.length > 0 && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={18} color="#0F4C3A" /> Photo Gallery ({allPhotos.length})
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#0F4C3A', fontWeight: 700 }}>
                  Click to open high-res slider →
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {allPhotos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    style={{
                      height: '130px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      border: '1px solid #E2E8F0',
                      transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* G. Diner Pro-Tips & Recommendations */}
          {restaurant.tips && restaurant.tips.length > 0 && (
            <div style={{ background: '#EFF6FF', borderRadius: '16px', padding: '1.5rem', border: '1px solid #BFDBFE' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E40AF', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} color="#2563EB" /> Insider Tips for Travelers & Diners
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {restaurant.tips.map((tip, idx) => (
                  <li key={idx} style={{ fontSize: '0.85rem', color: '#1E3A8A', lineHeight: 1.5 }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Sticky Logistics & Action Card */}
        <div>
          <div style={{ position: 'sticky', top: '70px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Quick Action & Contact Card */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Price Indicator</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>
                    {restaurant.priceRange}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Rating</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={16} fill="#F59E0B" color="#F59E0B" /> {restaurant.starRating}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                <a
                  href={`https://wa.me/${targetWhatsappNumber}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    background: '#25D366',
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(37,211,102,0.25)'
                  }}
                >
                  <MessageCircle size={18} fill="#FFF" />
                  <span>WhatsApp Concierge & Book</span>
                </a>

                {restaurant.reservationUrl && (
                  <a
                    href={restaurant.reservationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0F4C3A 0%, #166534 100%)',
                      color: '#FFF',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textDecoration: 'none'
                    }}
                  >
                    <span>Reserve Table Online</span>
                    <ExternalLink size={14} />
                  </a>
                )}

                {restaurant.menuUrl && (
                  <a
                    href={restaurant.menuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '0.7rem 1rem',
                      borderRadius: '10px',
                      background: '#F1F5F9',
                      color: '#334155',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      textDecoration: 'none',
                      border: '1px solid #CBD5E1'
                    }}
                  >
                    <span>View Official Full Menu</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>

              {/* Logistics Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                
                {/* Operating Hours */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '2px' }}>
                    <Clock size={14} color="#0F4C3A" /> Operating Hours
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: 600 }}>
                    {restaurant.timings || '11:30 AM – 10:30 PM Daily'}
                  </div>
                </div>

                {/* Address & MRT */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '2px' }}>
                    <MapPin size={14} color="#0F4C3A" /> Address & Location
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#1E293B', lineHeight: 1.4 }}>
                    {restaurant.address}
                  </div>
                  {restaurant.nearestMrt && (
                    <div style={{ marginTop: '4px', fontSize: '0.76rem', color: '#047857', fontWeight: 700 }}>
                      🚇 {restaurant.nearestMrt}
                    </div>
                  )}
                  {restaurant.googleMapsUrl && (
                    <a
                      href={restaurant.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#2563EB', fontWeight: 700, textDecoration: 'none', marginTop: '4px' }}
                    >
                      <span>Open in Google Maps</span> →
                    </a>
                  )}
                </div>

                {/* Telephone */}
                {restaurant.phone && (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '2px' }}>
                      📞 Telephone
                    </div>
                    <a href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`} style={{ fontSize: '0.82rem', color: '#0F4C3A', fontWeight: 700, textDecoration: 'none' }}>
                      {restaurant.phone}
                    </a>
                  </div>
                )}

              </div>

              {/* Verified DMC Badge */}
              <div style={{ marginTop: '1.25rem', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.75rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#166534" />
                <div style={{ fontSize: '0.75rem', color: '#166534', lineHeight: 1.4 }}>
                  <strong>Verified Singapore DMC Partner</strong>
                  <div>Quality and hygiene inspected for group and FIT itineraries.</div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Lightbox Slider */}
      <ImageGalleryLightbox
        images={allPhotos}
        initialIndex={lightboxIndex || 0}
        title={restaurant.name}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      />

    </div>
  )
}
