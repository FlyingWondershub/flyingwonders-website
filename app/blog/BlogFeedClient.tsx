'use client'

import { useState } from 'react'
import Link from 'next/link'
import AdBanner from '../../components/AdBanner'
import { BlogPost } from '../../utils/blog'

interface BlogFeedClientProps {
  initialArticles: BlogPost[]
}

export default function BlogFeedClient({ initialArticles }: BlogFeedClientProps) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortOrder, setSortOrder] = useState<string>('newest')

  const categories = ['All', 'Sightseeing', 'Food', 'Hotels', 'Travel Hacks', 'Hidden Gems', 'Family']

  const categoryFiltered = activeCategory === 'All'
    ? initialArticles
    : initialArticles.filter(a => a.category.toLowerCase().replace(/_/g, ' ') === activeCategory.toLowerCase())

  // Apply sorting
  const filteredArticles = [...categoryFiltered].sort((a, b) => {
    switch (sortOrder) {
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case 'title-az':
        return a.title.localeCompare(b.title)
      case 'title-za':
        return b.title.localeCompare(a.title)
      case 'read-time':
        return (parseInt(a.readTime) || 0) - (parseInt(b.readTime) || 0)
      default:
        return 0
    }
  })

  return (
    <div>
      {/* Category Filter + Sort Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', opacity: 0.7, whiteSpace: 'nowrap' }}>Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              fontFamily: 'var(--font-inter), sans-serif',
              background: 'var(--bg-secondary)',
              color: 'var(--text-dark)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '140px',
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title-az">Title A → Z</option>
            <option value="title-za">Title Z → A</option>
            <option value="read-time">Read Time ↑</option>
          </select>
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dark)', opacity: 0.7 }}>
          📭 No articles found for this category.
        </div>
      ) : (
        <div>
          {/* Sponsored Ad Unit */}
          <AdBanner category="blog" />

          {/* Standard Blog Articles Grid */}
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
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    loading="lazy"
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
