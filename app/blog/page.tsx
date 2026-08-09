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
    <div className="container" style={{ padding: '6rem 1.5rem', minHeight: '80vh' }}>
      
      {/* Blog Page Hero Banner */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span style={{ color: 'var(--gold-accent)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Explore Singapore Like a Local
        </span>
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '3rem', color: 'var(--emerald-secondary)', marginTop: '0.5rem', marginBottom: '1rem', lineHeight: '1.2' }}>
          Flying Wonders Journal
        </h1>
        <p style={{ opacity: 0.8, maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Get insider travel guides, hawker food secrets, itineraries, and expert tips from Singapore\'s premium DMC specialist architects.
        </p>
      </div>

      {/* Category Filter Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '3rem', flexWrap: 'wrap', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.5rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.6rem 1.25rem',
              background: activeCategory === cat ? 'var(--emerald-secondary)' : 'transparent',
              color: activeCategory === cat ? '#FFF' : '#4A5568',
              border: activeCategory === cat ? 'none' : '1px solid #CBD5E1',
              borderRadius: '25px',
              fontSize: '0.85rem',
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
          📭 No articles found. Check sheets integration or add mock data rows.
        </div>
      ) : (
        <div>
          
          {/* Featured Article Cover Card */}
          {featuredArticle && activeCategory === 'All' && (
            <div className="glass hover-lift" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', padding: '2rem', marginBottom: '4rem', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ height: '320px', borderRadius: '12px', overflow: 'hidden' }}>
                <img 
                  src={featuredArticle.imageUrl} 
                  alt={featuredArticle.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(47,133,90,0.1)', color: 'var(--emerald-secondary)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                      🌟 Featured {featuredArticle.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', opacity: 0.7 }}>{featuredArticle.date}</span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '1rem', lineHeight: '1.3' }}>
                    <Link href={`/blog/${featuredArticle.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {featuredArticle.title}
                    </Link>
                  </h2>
                  <p style={{ color: 'var(--text-dark)', opacity: 0.85, fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    {featuredArticle.excerpt}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>✍️ By {featuredArticle.author}</span>
                  <Link href={`/blog/${featuredArticle.slug}`} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}>
                    Read Guide →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Sponsored Ad Unit */}
          <AdBanner category="blog" slotId="blog_feed_slot_1" />

          {/* Standard Blog Articles Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {(activeCategory === 'All' ? listArticles : filteredArticles).map((article) => (
              <div key={article.id} className="glass hover-lift" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', padding: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
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
