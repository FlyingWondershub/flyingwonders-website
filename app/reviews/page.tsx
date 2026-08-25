'use client'

import { useState, useEffect } from 'react'
import reviewsData from '../../data/reviews_segmented.json'
import AdBanner from '../../components/AdBanner'

interface B2BReview {
  agent_company: string
  origin_city: string
  segment_type: string
  passenger_count: number
  review_text: string
  star_rating: number
  operational_tags: string[]
}

const SEGMENTS = [
  'All Segments',
  'Couple Packages',
  'Honeymoon Packages',
  'Family Packages',
  'Small Groups',
  'Large Groups'
]

export default function ReviewsPage() {
  const [selectedSegment, setSelectedSegment] = useState('All Segments')
  const [sanityReviews, setSanityReviews] = useState<B2BReview[]>([])
  
  // Form State
  const [showForm, setShowForm] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [agentCompany, setAgentCompany] = useState('')
  const [originCity, setOriginCity] = useState('')
  const [passengerCount, setPassengerCount] = useState(2)
  const [segmentType, setSegmentType] = useState('Couple Packages')
  const [rating, setRating] = useState(5)
  const [operationalTags, setOperationalTags] = useState('')
  const [reviewContent, setReviewContent] = useState('')
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [formMessage, setFormMessage] = useState('')

  // Fetch approved Sanity reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews/fetch')
        const data = await res.json()
        if (data.success) {
          setSanityReviews(data.reviews)
        }
      } catch (err) {
        console.error('Error loading Sanity reviews:', err)
      }
    }
    fetchReviews()
  }, [])

  // Combine static segmented database and live approved Sanity reviews
  const allReviews = [...reviewsData, ...sanityReviews]

  const filteredReviews = selectedSegment === 'All Segments'
    ? allReviews
    : allReviews.filter(r => r.segment_type === selectedSegment)

  // Handle submit review form
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus('submitting')
    setFormMessage('')

    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName,
          agent_company: agentCompany,
          origin_city: originCity,
          segment_type: segmentType,
          passenger_count: passengerCount,
          content: reviewContent,
          rating,
          operational_tags: operationalTags
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setFormStatus('success')
        setFormMessage(data.message)
        // Reset fields
        setAuthorName('')
        setAgentCompany('')
        setOriginCity('')
        setPassengerCount(2)
        setSegmentType('Couple Packages')
        setRating(5)
        setOperationalTags('')
        setReviewContent('')
      } else {
        throw new Error(data.error || 'Failed to submit review')
      }
    } catch (err: any) {
      setFormStatus('error')
      setFormMessage(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
      
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span style={{ 
          color: 'var(--gold-accent)', 
          textTransform: 'uppercase', 
          fontWeight: 700, 
          letterSpacing: '0.25em',
          fontSize: '0.8rem',
          display: 'inline-block',
          marginBottom: '0.75rem'
        }}>
          DMC Ground Handling Feedback
        </span>
        <h1 style={{ 
          fontFamily: 'var(--font-playfair), serif', 
          fontSize: '3rem', 
          color: 'var(--text-dark)', 
          margin: '0 0 1rem 0',
          lineHeight: 1.2
        }}>
          What our Partners & Customers Say
        </h1>
        <p style={{ 
          maxWidth: '650px', 
          margin: '0 auto 2rem auto', 
          opacity: 0.8,
          fontSize: '1.05rem',
          lineHeight: 1.6
        }}>
          Operational feedback from elite outbound travel agents across India representing premium couples, honeymooners, families, and group MICE bookings in Singapore.
        </p>

        {/* Toggle Write Review Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: 'var(--gold-accent)',
            color: '#111',
            border: 'none',
            padding: '0.75rem 1.75rem',
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {showForm ? 'Close Feedback Form ✕' : '✍️ Write Feedback'}
        </button>
      </div>

      {/* Review Submission Form Drawer/Block */}
      {showForm && (
        <div className="glass" style={{ 
          maxWidth: '650px', 
          margin: '0 auto 4rem auto', 
          padding: '2rem', 
          borderRadius: '16px', 
          background: '#FFF', 
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-xl)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--crimson-primary)', fontFamily: 'var(--font-playfair), serif', fontSize: '1.4rem' }}>
            Submit Travel Agent Feedback
          </h3>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1.5rem' }}>
            Submit your DMC ground handling review. Your post will appear on our live page once approved by moderation.
          </p>

          {formStatus === 'success' ? (
            <div style={{ background: '#E6FFFA', color: '#2C7A7B', padding: '1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
              ✅ {formMessage}
              <button 
                onClick={() => setFormStatus('idle')} 
                style={{ display: 'block', background: 'transparent', border: 'none', textDecoration: 'underline', color: '#2C7A7B', cursor: 'pointer', marginTop: '1rem', fontWeight: 700 }}
              >
                Submit another review
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Contact Person *</label>
                  <input 
                    type="text" required placeholder="e.g. Rajesh Kumar"
                    value={authorName} onChange={e => setAuthorName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Agency / Company Name</label>
                  <input 
                    type="text" placeholder="e.g. Royal Escapes India"
                    value={agentCompany} onChange={e => setAgentCompany(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Origin City (India)</label>
                  <input 
                    type="text" placeholder="e.g. Mumbai"
                    value={originCity} onChange={e => setOriginCity(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Passenger Count</label>
                  <input 
                    type="number" min={1}
                    value={passengerCount} onChange={e => setPassengerCount(parseInt(e.target.value) || 2)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Travel Segment</label>
                  <select 
                    value={segmentType} onChange={e => setSegmentType(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFF', fontSize: '0.85rem' }}
                  >
                    <option value="Couple Packages">Couple Packages</option>
                    <option value="Honeymoon Packages">Honeymoon Packages</option>
                    <option value="Family Packages">Family Packages</option>
                    <option value="Small Groups">Small Groups</option>
                    <option value="Large Groups">Large Groups</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Star Rating *</label>
                  <select 
                    value={rating} onChange={e => setRating(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFF', fontSize: '0.85rem' }}
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                    <option value={2}>2 Stars ★★☆☆☆</option>
                    <option value={1}>1 Star ★☆☆☆☆</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Operational Tags (Comma separated)</label>
                <input 
                  type="text" placeholder="e.g. Private Yacht, Hotel Upgrade, Jain Food"
                  value={operationalTags} onChange={e => setOperationalTags(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Review Content *</label>
                <textarea 
                  required placeholder="Describe your experience with our Singapore ground handling team, hotel upgrade support, or transport coordination..."
                  rows={4}
                  value={reviewContent} onChange={e => setReviewContent(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              {formStatus === 'error' && (
                <p style={{ color: '#E53E3E', fontSize: '0.8rem', margin: 0 }}>⚠️ {formMessage}</p>
              )}

              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                style={{
                  background: 'var(--crimson-primary)',
                  color: '#FFF',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                {formStatus === 'submitting' ? 'Submitting Review...' : 'Submit Feedback for Moderation ✉️'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Filter Chips Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '0.75rem', 
        marginBottom: '3rem', 
        flexWrap: 'wrap' 
      }}>
        {SEGMENTS.map(seg => (
          <button
            key={seg}
            onClick={() => setSelectedSegment(seg)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '30px',
              border: selectedSegment === seg ? '1px solid var(--crimson-primary)' : '1px solid #E2E8F0',
              background: selectedSegment === seg ? 'var(--crimson-primary)' : '#FFF',
              color: selectedSegment === seg ? '#FFF' : 'var(--text-dark)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedSegment === seg ? 'var(--shadow-md)' : 'none'
            }}
          >
            {seg}
          </button>
        ))}
      </div>

      {/* AdSense Unit */}
      <AdBanner slotId="reviews_mid_slot" category="reviews" />

      {/* Testimonials Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '2rem' 
      }}>
        {filteredReviews.map((review, rIdx) => (
          <div 
            key={rIdx} 
            className="glass hover-lift" 
            style={{ 
              padding: '2rem', 
              borderRadius: '16px', 
              background: '#FFF',
              border: '1px solid #E2E8F0',
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '260px'
            }}
          >
            <div>
              {/* Card Top: Rating and Location */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  background: 'rgba(128, 0, 32, 0.08)', 
                  color: 'var(--crimson-primary)', 
                  padding: '0.25rem 0.6rem', 
                  borderRadius: '30px', 
                  fontWeight: 700 
                }}>
                  {review.segment_type} ({review.passenger_count} Pax)
                </span>
                <div style={{ color: '#F59E0B', fontSize: '0.9rem' }}>
                  {'★'.repeat(review.star_rating)}{'☆'.repeat(5 - review.star_rating)}
                </div>
              </div>

              {/* Review Text */}
              <p style={{ 
                fontStyle: 'italic', 
                opacity: 0.85, 
                fontSize: '0.92rem',
                lineHeight: 1.6,
                margin: '0 0 1.5rem 0',
                color: '#2D3748'
              }}>
                "{review.review_text}"
              </p>
            </div>

            {/* Card Bottom: Agency & Tag Chips */}
            <div>
              <div style={{ borderTop: '1px solid #EDF2F7', paddingTop: '1rem', marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-dark)', display: 'block' }}>
                  {review.agent_company}
                </strong>
                <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                  📍 {review.operational_tags.includes('Private Group') ? 'Private Group Booking' : 'Outbound Partner'} | {review.origin_city}, India
                </span>
              </div>

              {/* Operational Tag Chips */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {review.operational_tags.map((tag, tIdx) => (
                  <span 
                    key={tIdx} 
                    style={{ 
                      fontSize: '0.65rem', 
                      background: '#F7FAFC', 
                      border: '1px solid #E2E8F0', 
                      color: '#4A5568', 
                      padding: '0.15rem 0.45rem', 
                      borderRadius: '4px',
                      fontWeight: 500
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}
