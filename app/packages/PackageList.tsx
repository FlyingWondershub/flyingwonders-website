'use client'

import { useState } from 'react'
import { urlForImage } from '../../sanity/lib/image'
import Link from 'next/link'

export default function PackageList({ initialPackages }: { initialPackages: any[] }) {
  const [activeTier, setActiveTier] = useState('all')

  const filteredPackages = activeTier === 'all' 
    ? initialPackages 
    : initialPackages.filter(pkg => pkg.tier === activeTier)

  return (
    <div>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {filteredPackages.length > 0 ? (
          filteredPackages.map((pkg) => (
            <div key={pkg._id} className="glass hover-lift" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: '100%', height: '200px', background: '#e2e8f0', position: 'relative' }}>
                {pkg.image ? (
                  <img src={urlForImage(pkg.image).url()} alt={pkg.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    No Image
                  </div>
                )}
              </div>
              <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent-blue)', fontWeight: 600 }}>{pkg.tier}</span>
                <h3 style={{ margin: '0.5rem 0', color: 'var(--primary-blue)' }}>{pkg.title}</h3>
                <p style={{ flexGrow: 1, fontSize: '0.9rem', opacity: 0.8, marginBottom: '1rem' }}>
                  {pkg.description?.substring(0, 100)}...
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>${pkg.price}</span>
                  <Link href={`/book?packageId=${pkg._id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Customize & Book
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
            No packages found for this tier yet. Check back soon!
          </div>
        )}
      </div>
    </div>
  )
}
