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
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', color: 'var(--emerald-secondary)', margin: '0 0 0.4rem 0', lineHeight: '1.2' }}>
          Singapore Travel Guides & Stories
        </h1>
        <p style={{ opacity: 0.8, maxWidth: '650px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Insider attraction tips, hawker secrets, itineraries, and transport hacks curated by Flying Wonders DMC specialists.
        </p>
      </div>

      {/* Category Filter Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.45rem 1.1rem',
              background: activeCategory === cat ? 'var(--emerald-secondary)' : 'transparent',
              color: activeCategory === cat ? '#FFF' : '#4A5568',
              border: activeCategory === cat ? 'none' : '1px solid #CBD5E1',
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
        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          📭 No articles found.
        </div>
      ) : (
        <div>
          {/* Sponsored Ad Unit */}
          <AdBanner category="blog" slotId="blog_feed_slot_1" />

          {/* Standard Blog Articles Grid (All articles direct) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {filteredArticles.map((article) => (
              <div key={article.id} className="glass hover-lift" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', padding: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', background: '#F1F5F9' }}>
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
                      <span style={{ fontSize: '0.75rem', color: '#718096' }}>{article.readTime}</span>
                    </div>
                    
                    <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.25rem', color: '#1A202C', margin: '0.25rem 0 0.75rem 0', lineHeight: '1.4' }}>
                      <Link href={`/blog/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {article.title}
                      </Link>
                    </h3>
                    
                    <p style={{ color: '#4A5568', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                      {article.excerpt}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F0F4F8', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#718096' }}>👤 {article.author}</span>
                    <Link href={`/blog/${article.slug}`} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald-secondary)', textDecoration: 'underline' }}>
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  )
}
