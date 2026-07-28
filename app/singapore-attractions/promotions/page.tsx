import Link from 'next/link'
import { client } from '../../../sanity/lib/client'
import PromotionInquiryForm from './PromotionInquiryForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getPromotions() {
  try {
    const raw = await client.fetch(`*[_type == "promotion"] | order(validTill asc) {
      _id, attractionName, price, validTill, description
    }`)
    return raw || []
  } catch (err) {
    console.error('Error fetching promotions from Sanity:', err)
    return []
  }
}

export const metadata = {
  title: 'Special Attraction Promotions | Flying Wonders',
  description: 'Limited time discounted attraction ticket deals and flash sales in Singapore.',
}

export default async function PromotionsPage() {
  const promotions = await getPromotions()

  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '6rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Back button */}
      <Link 
        href="/Singapore_Attractions"
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--emerald-secondary)', 
          textDecoration: 'none', 
          fontSize: '0.9rem', 
          fontWeight: 700, 
          marginBottom: '2rem',
          transition: 'opacity 0.2s'
        }}
      >
        ← Back to Singapore Attractions Quote
      </Link>

      <div style={{ borderLeft: '6px solid var(--gold-accent)', paddingLeft: '1.25rem', marginBottom: '3rem' }}>
        <span style={{ color: 'var(--gold-accent)', textTransform: 'uppercase', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.15em' }}>
          Flash Deals & Offers
        </span>
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.5rem', color: 'var(--text-dark)', margin: '0.25rem 0' }}>
          🔥 Exclusive Promotions
        </h1>
        <p style={{ margin: 0, opacity: 0.7, fontSize: '0.95rem' }}>
          Book select Singapore attraction entry tickets at special discounted promotional prices. Valid for travel agents and partners.
        </p>
      </div>

      {promotions.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: '#F7FAFC', borderRadius: '12px', border: '1px dashed #E2E8F0' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>🎟️</span>
          <p style={{ fontWeight: 600, color: '#4A5568', margin: 0 }}>No active promotion tickets available right now.</p>
          <p style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: '0.25rem' }}>Check back soon for new flash deals and seasonal discounts!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {promotions.map((p: any) => (
            <div 
              key={p._id}
              className="glass"
              style={{
                background: '#FFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--gold-accent), var(--emerald-secondary))' }} />
              
              <div style={{ flex: 1, minWidth: '260px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  {p.attractionName}
                </h3>
                {p.description && (
                  <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: '0.5rem 0 1rem 0', lineHeight: 1.5 }}>
                    {p.description}
                  </p>
                )}
                <div style={{ fontSize: '0.8rem', background: '#FFF5F5', color: '#C53030', padding: '0.25rem 0.65rem', borderRadius: '4px', display: 'inline-block', fontWeight: 700 }}>
                  ⏳ Valid till: {p.validTill ? new Date(p.validTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                </div>
              </div>

              <div style={{ textAlign: 'right', minWidth: '120px' }}>
                <span style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block', textTransform: 'uppercase' }}>Promo Price</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--emerald-secondary)', display: 'block', lineHeight: 1.1 }}>
                  S$ {p.price}
                </span>
                <span style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginTop: '0.25rem' }}>per person</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inquiry Form */}
      <PromotionInquiryForm promotions={promotions} />

    </div>
  )
}
