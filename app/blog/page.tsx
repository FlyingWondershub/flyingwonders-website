'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdBanner from '../../components/AdBanner'

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
}

export default function BlogFeed() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    async function loadArticles() {
      try {
        const res = await fetch('/api/blog/fetch')
        const data = await res.json()
        if (data.success) {
          setArticles(data.articles)
        }
      } catch (err) {
        console.error('Failed to load blog articles', err)
      } finally {
        setLoading(false)
      }
    }
    loadArticles()
  }, [])

  const categories = ['All', 'Sightseeing', 'Food', 'Hotels', 'Travel Hacks']

  const filteredArticles = activeCategory === 'All'
    ? articles
    : articles.filter(a => a.category.toLowerCase() === activeCategory.toLowerCase())

  const featuredArticle = filteredArticles[0]
  const listArticles = filteredArticles.slice(1)

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', minHeight: '80vh', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Super Compact Blog Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.75rem, 5vw, 2.3rem)', color: 'var(--emerald-secondary)', margin: '0 0 0.4rem 0', lineHeight: '1.2' }}>
          Singapore Travel Guides & Stories
        </h1>
        <p style={{ color: 'var(--text-dark)', opacity: 0.85, maxWidth: '650px', margin: '0 auto', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', lineHeight: '1.5' }}>
          Insider attraction tips, hawker secrets, itineraries, and transport hacks curated by Flying Wonders DMC specialists.
        </p>
      </div>

      {/* Category Filter Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.45rem 1.1rem',
              background: activeCategory === cat ? 'var(--emerald-secondary)' : 'var(--bg-secondary)',
              color: activeCategory === cat ? '#FFFFFF' : 'var(--text-dark)',
              border: activeCategory === cat ? '1px solid var(--emerald-secondary)' : '1px solid var(--glass-border)',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--emerald-secondary)' }}>
          🔄 Loading stories & travel guides...
        </div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dark)', opacity: 0.7 }}>
          📭 No articles found.
        </div>
      ) : (
        <div>
          {/* Sponsored Ad Unit */}
          <AdBanner category="blog" slotId="blog_feed_slot_1" />

          {/* Standard Blog Articles Grid (All articles direct) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
            {filteredArticles.map((article) => (
              <Link 
                key={article.id} 
                href={`/blog/${article.slug}`}
                className="glass hover-lift" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  background: 'var(--bg-secondary)', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  border: '1px solid var(--glass-border)', 
                  padding: '1rem', 
                  boxShadow: 'var(--shadow-sm)',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', background: 'rgba(0,0,0,0.05)' }}>
                  <img 
                    src={article.imageUrl || '/images/hero/singapore-hero-1.jpg'} 
                    alt={article.title} 
                    onError={(e: any) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/hero/singapore-hero-1.jpg';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--emerald-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                        🏷️ {article.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', opacity: 0.7 }}>{article.readTime}</span>
                    </div>
                    
                    <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.25rem', color: 'var(--text-dark)', margin: '0.25rem 0 0.75rem 0', lineHeight: '1.4' }}>
                      {article.title}
                    </h3>
                    
                    <p style={{ color: 'var(--text-dark)', opacity: 0.85, fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                      {article.excerpt}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', opacity: 0.75 }}>👤 {article.author}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald-secondary)', textDecoration: 'underline' }}>
                      Read More →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      )}

    </div>
  )
}
