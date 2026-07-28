'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { client } from '../../sanity/lib/client'

interface FAQItem {
  id: string
  category: 'general' | 'payments' | 'tickets' | 'visas' | 'refunds' | string
  question: string
  answer: string | React.ReactNode
}

const DEFAULT_FAQ_DATA: FAQItem[] = [
  /* 🏛️ GENERAL & DMC SERVICES */
  {
    id: 'faq-1',
    category: 'general',
    question: 'Who is Flying Wonders?',
    answer: 'Flying Wonders is a registered Singapore Destination Management Company (DMC) with dual operational offices in Singapore and India, providing ground transfers, B2B wholesale rates, and custom holiday packages.'
  },
  {
    id: 'faq-2',
    category: 'general',
    question: 'Do you offer B2B wholesale rates for Travel Agents?',
    answer: 'Yes! Registered travel agents get instant access to net B2B rates, custom markup sliders, and white-label PDF/WhatsApp proposal generators via our B2B Portal (/custom-package).'
  },

  /* 💳 PAYMENTS, PRICING & CURRENCY */
  {
    id: 'faq-4',
    category: 'payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept zero-fee ICICI Bank UPI transfers (Google Pay, PhonePe, Paytm, BHIM), direct bank transfers, and international credit/debit cards.'
  },
  {
    id: 'faq-5',
    category: 'payments',
    question: 'How is the SGD to INR exchange rate calculated?',
    answer: 'Package and ticket prices configured in SGD are converted to INR in real-time based on live international central bank exchange rates (Frankfurter API) plus your configured markup.'
  },
  {
    id: 'faq-6',
    category: 'payments',
    question: 'Is there any hidden gateway fee for paying via ICICI UPI QR?',
    answer: 'No! Paying via our ICICI Bank UPI QR code carries 0% transaction or gateway surcharge fees.'
  },

  /* 🎟️ SINGAPORE ATTRACTIONS & E-TICKETS */
  {
    id: 'faq-7',
    category: 'tickets',
    question: 'Are attraction tickets open-dated or fixed-date?',
    answer: 'Most tickets (like Gardens by the Bay, Cable Car, and DUKW Tour) are open-dated for maximum travel flexibility. Time-slot specific attractions (like Universal Studios or Night Safari) are issued for your chosen travel dates.'
  },
  {
    id: 'faq-8',
    category: 'tickets',
    question: 'How fast will I receive my Singapore E-Tickets after paying?',
    answer: 'Once your UTR reference or payment is verified by our accounts desk with ICICI Bank, your official barcoded E-Tickets are dispatched instantly to your WhatsApp & Email.'
  },
  {
    id: 'faq-9',
    category: 'tickets',
    question: 'Can I customize my day-by-day attraction itinerary?',
    answer: 'Yes! Use our interactive Singapore Attractions Builder (/singapore-attractions) to pick tickets, assign trip dates, and generate an instant PDF quote.'
  },

  /* ✈️ VISAS & TRANSFERS */
  {
    id: 'faq-10',
    category: 'visas',
    question: 'Do you provide airport transfers and private vehicle charters?',
    answer: 'Yes, we operate private 7-seater Combi vans, 13-seater HiAce, and 40-seater coaches for seamless Changi Airport transfers and hotel drop-offs.'
  },
  {
    id: 'faq-11',
    category: 'visas',
    question: 'Do you assist with Singapore Visas?',
    answer: 'We connect you with an Authorized Visa Agent for Visas and usual Singapore Visa processing time is 5 working days.'
  },

  /* 🔄 REFUNDS & POLICY */
  {
    id: 'faq-12',
    category: 'refunds',
    question: 'What is your cancellation and refund policy?',
    answer: (
      <span>
        Non-issued tickets and flexible packages can be cancelled according to our official{' '}
        <Link href="/refund" style={{ color: '#10B981', fontWeight: 700, textDecoration: 'underline' }}>
          Refund & Cancellation Policy
        </Link>.
      </span>
    )
  },
  {
    id: 'faq-13',
    category: 'refunds',
    question: 'What happens if an outdoor attraction is closed due to heavy rain?',
    answer: 'Singapore attractions operate rain or shine. For severe weather closures, date adjustments or alternative indoor ticket replacements are arranged by our ground desk.'
  }
]

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQ_DATA)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ 'faq-1': true, 'faq-4': true })

  // Fetch FAQ questions from Sanity CMS
  useEffect(() => {
    client.fetch(`*[_type == "faqItem" && isActive == true] | order(sortOrder asc) {
      _id, question, answer, category, sortOrder
    }`)
    .then((rawFaqs: any[]) => {
      if (rawFaqs && rawFaqs.length > 0) {
        const mapped = rawFaqs.map((f: any) => ({
          id: f._id,
          category: f.category || 'general',
          question: f.question,
          answer: f.answer
        }))
        setFaqs(mapped)
      }
    })
    .catch((err) => {
      console.warn('Failed to fetch FAQs from Sanity, using default FAQs:', err)
    })
  }, [])

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredFaqs = faqs.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const query = searchQuery.toLowerCase().trim()
    const matchesQuery = !query || 
      item.question.toLowerCase().includes(query) || 
      (typeof item.answer === 'string' && item.answer.toLowerCase().includes(query))
    return matchesCategory && matchesQuery
  })

  // Schema.org FAQ structured data for SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': typeof item.answer === 'string' ? item.answer : 'Non-issued tickets can be cancelled according to our Refund & Cancellation Policy.'
      }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div
        style={{
          minHeight: '90vh',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#F8FAFC',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '3rem 1rem 6rem 1rem'
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Flying Wonders • Help Center
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0.5rem 0 1rem 0', background: 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Frequently Asked Questions
            </h1>
            <p style={{ fontSize: '1rem', color: '#94A3B8', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              Find quick answers to common questions regarding Singapore packages, B2B agent quotes, ICICI UPI payments, attraction e-tickets, and visas.
            </p>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '2rem', position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search questions (e.g. UPI payment, e-tickets, visa, refund)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid #334155',
                background: '#0F172A',
                color: '#F8FAFC',
                fontSize: '1rem',
                outline: 'none',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '1.25rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'general', label: '🏛️ General & DMC' },
              { id: 'payments', label: '💳 Payments & Rates' },
              { id: 'tickets', label: '🎟️ E-Tickets' },
              { id: 'visas', label: '✈️ Visas & Transfers' },
              { id: 'refunds', label: '🔄 Refunds & Policy' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '0.65rem 1.1rem',
                  borderRadius: '20px',
                  border: activeCategory === cat.id ? 'none' : '1px solid #334155',
                  background: activeCategory === cat.id ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' : '#1E293B',
                  color: activeCategory === cat.id ? '#FFFFFF' : '#CBD5E1',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: activeCategory === cat.id ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          {filteredFaqs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3.5rem' }}>
              {filteredFaqs.map(item => {
                const isOpen = !!openItems[item.id]
                return (
                  <div
                    key={item.id}
                    style={{
                      background: '#1E293B',
                      borderRadius: '14px',
                      border: '1px solid #334155',
                      overflow: 'hidden',
                      transition: 'all 0.2s'
                    }}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      style={{
                        width: '100%',
                        padding: '1.25rem 1.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#F8FAFC',
                        textAlign: 'left',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <span>{item.question}</span>
                      <span style={{ fontSize: '1.2rem', color: '#10B981', fontWeight: 800 }}>
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: '0 1.5rem 1.25rem 1.5rem',
                          color: '#CBD5E1',
                          fontSize: '0.92rem',
                          lineHeight: '1.6',
                          borderTop: '1px dashed #334155',
                          paddingTop: '1rem'
                        }}
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#1E293B', borderRadius: '16px', border: '1px dashed #334155', marginBottom: '3rem' }}>
              <p style={{ fontSize: '1.1rem', color: '#94A3B8', margin: '0 0 1rem 0' }}>
                No questions found matching "{searchQuery}".
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all') }}
                style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Clear Search & Filters
              </button>
            </div>
          )}

          {/* Rapid Response Contact Box */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0F4C3A 0%, #064E3B 100%)',
              padding: '2rem',
              borderRadius: '18px',
              border: '1px solid #10B981',
              textAlign: 'center',
              boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.35rem', color: '#ECFDF5', fontWeight: 800 }}>
              Still have a question?
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#A7F3D0', margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
              Our Singapore & India operations desk is available on WhatsApp to assist with instant quotes, hotel bookings, and UTR verifications.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://wa.me/919886171251?text=Hi%20Flying%20Wonders,%20I%20have%20a%20question%20regarding%20Singapore%20packages%20and%20tickets."
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#10B981',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}
              >
                💬 Chat on WhatsApp (+91 9886171251)
              </a>
              <Link
                href="/contact"
                style={{
                  background: 'transparent',
                  color: '#ECFDF5',
                  textDecoration: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: '1px solid #A7F3D0'
                }}
              >
                ✉️ Visit Contact Desk
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
