'use client'

import { useState, useEffect } from 'react'
import { urlForImage } from '../../sanity/lib/image'
import Link from 'next/link'
import IciciQrModal from '../../components/IciciQrModal'

export default function PackageList({ initialPackages, exchangeRate = 74.81 }: { initialPackages: any[], exchangeRate?: number }) {
  const [activeTier, setActiveTier] = useState('all')
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null)
  const [activeModalPackage, setActiveModalPackage] = useState<any | null>(null)
  const [hideIciciPackages, setHideIciciPackages] = useState(false)

  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.hideIciciPackages) {
          setHideIciciPackages(true)
        }
      })
      .catch(() => {})
  }, [])

  const filteredPackages = activeTier === 'all' 
    ? initialPackages 
    : initialPackages.filter(pkg => pkg.tier === activeTier)

  return (
    <div>
      {/* Services Catalog Public Banner Link */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <Link
          href="/services-catalog"
          className="hover-lift"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #0F4C3A 0%, #10B981 100%)',
            color: '#FFFFFF',
            padding: '0.75rem 1.5rem',
            borderRadius: '30px',
            fontWeight: 800,
            fontSize: '0.9rem',
            textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(15, 76, 58, 0.25)'
          }}
        >
          📖 Explore Singapore & Malaysia Services Catalog (Hotels, Attractions, Dining, Guides & Tours) ➔
        </Link>
      </div>

      {/* Dynamic Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        {['all', 'budget', 'premium', 'solo', 'groups'].map((tier) => (
          <button
            key={tier}
            onClick={() => setActiveTier(tier)}
            className={`btn ${activeTier === tier ? 'btn-primary' : 'glass hover-lift'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {tier === 'groups' ? 'Groups/Families' : tier}
          </button>
        ))}
      </div>

      {/* Package Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {filteredPackages.length > 0 ? (
          filteredPackages.map((pkg) => (
            <div key={pkg._id} className="glass" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'start' }}>
                
                {/* Image Section */}
                <div style={{ flex: '1 0 250px', height: '220px', background: 'var(--bg-secondary)', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                  {pkg.image ? (
                    <img 
                      src={typeof pkg.image === 'string' ? pkg.image : urlForImage(pkg.image).url()} 
                      alt={pkg.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)', opacity: 0.6 }}>
                      No Image Available
                    </div>
                  )}
                </div>

                {/* Text Details Section */}
                <div style={{ flex: '2 0 300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--gold-accent)', fontWeight: 700 }}>
                        {pkg.tier} package
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.65rem', color: 'var(--crimson-primary)', fontFamily: 'var(--font-inter), sans-serif' }}>
                          ₹ {Math.round(pkg.price * exchangeRate).toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--emerald-secondary)', fontWeight: 700, opacity: 0.85 }}>
                          (S$ {pkg.price})
                        </span>
                      </div>
                    </div>
                    
                    <h3 style={{ margin: '0.5rem 0', color: 'var(--text-dark)', fontSize: '1.6rem', fontFamily: 'var(--font-playfair), serif' }}>
                      {pkg.title}
                    </h3>
                    
                    <p style={{ fontSize: '0.92rem', opacity: 0.85, marginBottom: '1rem', lineHeight: 1.5 }}>
                      {pkg.description}
                    </p>

                    {/* Hotel Options Row */}
                    {pkg.hotelOptions && (
                      <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                        <strong style={{ color: 'var(--text-dark)', display: 'block', marginBottom: '0.2rem' }}>
                          🏢 Hotel Options:
                        </strong>
                        <span style={{ color: 'var(--text-dark)', opacity: 0.9 }}>{pkg.hotelOptions}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setExpandedPackageId(expandedPackageId === pkg._id ? null : pkg._id)}
                      style={{
                        background: expandedPackageId === pkg._id ? 'var(--emerald-secondary)' : 'transparent',
                        border: '1px solid var(--emerald-secondary)',
                        color: expandedPackageId === pkg._id ? '#FFF' : 'var(--emerald-secondary)',
                        padding: '0.6rem 1.25rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flexGrow: 1
                      }}
                    >
                      {expandedPackageId === pkg._id ? '🔼 Hide Detailed Itinerary' : '📆 View Detailed Itinerary'}
                    </button>
                    
                    <Link 
                      href={`/book?packageId=${pkg._id}`} 
                      className="btn btn-primary" 
                      style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', display: 'inline-block', textDecoration: 'none' }}
                    >
                      Book / Customize ✈️
                    </Link>

                    {!hideIciciPackages && (
                      <button
                        onClick={() => setActiveModalPackage(pkg)}
                        style={{
                          background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                          color: '#FFF',
                          border: 'none',
                          padding: '0.6rem 1.25rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 3px 8px rgba(16, 185, 129, 0.25)'
                        }}
                      >
                        📱 Pay via ICICI UPI QR
                      </button>
                    )}
                  </div>

                </div>

              </div>

              {/* Expandable Day-by-Day Timeline */}
              {expandedPackageId === pkg._id && pkg.itinerary && (
                <div style={{ 
                  marginTop: '2rem', 
                  borderTop: '1px dashed #CBD5E1', 
                  paddingTop: '1.5rem', 
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '1.5rem' 
                }}>
                  <h4 style={{ color: 'var(--crimson-primary)', fontSize: '1.1rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    📋 Day-by-Day Detailed Timeline:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {pkg.itinerary.map((day: any, dIdx: number) => (
                      <div key={dIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h5 style={{ color: 'var(--emerald-secondary)', fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ background: 'var(--gold-accent)', color: '#111', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                            DAY {day.day}
                          </span>
                          {day.title}
                        </h5>
                        <div style={{ 
                          paddingLeft: '1.5rem', 
                          borderLeft: '2px solid var(--glass-border)', 
                          marginLeft: '0.8rem', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.45rem', 
                          marginTop: '0.25rem' 
                        }}>
                          {day.activities.map((act: any, aIdx: number) => (
                            <div key={aIdx} style={{ fontSize: '0.88rem', color: 'var(--text-dark)', opacity: 0.9, lineHeight: 1.4 }}>
                              <strong style={{ color: 'var(--crimson-primary)', fontSize: '0.85rem', marginRight: '0.75rem' }}>
                                {act.time}
                              </strong>
                              {act.desc}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
            No packages found for this tier yet. Check back soon!
          </div>
        )}
      </div>

      {/* ICICI Bank UPI QR Payment Modal */}
      {activeModalPackage && (
        <IciciQrModal
          isOpen={!!activeModalPackage}
          onClose={() => setActiveModalPackage(null)}
          amountSgd={activeModalPackage.price}
          bookingReference={`FW-PKG-${activeModalPackage._id?.toUpperCase()}`}
        />
      )}
    </div>
  )
}
