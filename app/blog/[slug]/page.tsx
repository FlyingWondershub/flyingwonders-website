'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  slug: string
  category: string
  date: string
  author: string
  readTime: string
  imageUrl: string
  excerpt: string
  content: string
}

export default function ArticleDetail() {
  const { slug } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArticle() {
      try {
        const res = await fetch('/api/blog/fetch')
        const data = await res.json()
        if (data.success) {
          const match = data.articles.find((a: Article) => a.slug === slug)
          setArticle(match || null)
        }
      } catch (err) {
        console.error('Failed to load article detail', err)
      } finally {
        setLoading(false)
      }
    }
    loadArticle()
  }, [slug])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '10rem 1.5rem', fontSize: '1.2rem', color: 'var(--emerald-secondary)' }}>
        🔄 Loading guide content...
      </div>
    )
  }

  if (!article) {
    return (
      <div style={{ textAlign: 'center', padding: '10rem 1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2rem', color: 'red', marginBottom: '1rem' }}>Article Not Found</h2>
        <p style={{ opacity: 0.8, marginBottom: '2rem' }}>We could not locate this travel story or guide in our Google Sheets sync database.</p>
        <Link href="/blog" className="btn btn-primary">Back to Blog Feed</Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Back button link */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/blog" style={{ color: 'var(--emerald-secondary)', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          ← Back to Blog Feed
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        
        {/* Main Content Pane */}
        <div style={{ flex: '2' }}>
          
          {/* Article Header info */}
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.8rem', background: 'rgba(47,133,90,0.1)', color: 'var(--emerald-secondary)', padding: '0.3rem 0.85rem', borderRadius: '15px', fontWeight: 700, textTransform: 'uppercase' }}>
              {article.category}
            </span>
            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.5rem', color: '#1A202C', marginTop: '1rem', marginBottom: '1rem', lineHeight: '1.2' }}>
              {article.title}
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', color: '#718096', fontSize: '0.85rem', flexWrap: 'wrap' }}>
              <span>✍️ Written by: <strong>{article.author}</strong></span>
              <span>📅 Published: {article.date}</span>
              <span>⏱️ Read Time: {article.readTime}</span>
            </div>
          </div>

          {/* Hero Cover Image */}
          <div style={{ height: '400px', borderRadius: '16px', overflow: 'hidden', marginBottom: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          {/* Article Rich Text Body */}
          <div style={{ color: '#2D3748', fontSize: '1.05rem', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
            {article.content}
          </div>

        </div>

        {/* Sidebar Call To Action widgets */}
        <div style={{ flex: '1 0 300px', position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Booking CTA card */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--bg-dark)', color: 'white', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-lg)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--gold-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Singapore DMC Desk
            </span>
            <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.5rem', color: '#FFF', margin: '0.5rem 0 1rem 0' }}>
              Inspired by this guide?
            </h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Let our travel architects custom design the perfect Singapore itinerary for your clients. Real-time cost updates and instant B2B confirmations.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/packages" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', background: 'var(--gold-accent)', color: '#111', fontWeight: 700 }}>
                Explore Tour Packages
              </Link>
              <Link href="/custom-package" style={{ textAlign: 'center', color: '#FFF', fontSize: '0.85rem', textDecoration: 'underline' }}>
                Go to B2B Builder Workspace
              </Link>
            </div>
          </div>

          {/* Instant WhatsApp Help Widget */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: '#FFF', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--emerald-secondary)', margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 700 }}>
              Need Help Planning?
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#4A5568', marginBottom: '1rem' }}>
              Chat instantly on WhatsApp for support on customized bookings.
            </p>
            <a 
              href="https://wa.me/919886171251" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: '#25D366',
                color: '#FFF',
                padding: '0.6rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              💬 WhatsApp Support
            </a>
          </div>

        </div>

      </div>

    </div>
  )
}
