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

// Custom High-Performance Markdown and Visual Block Renderer
function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null

  // Split into paragraphs / sections
  const blocks = content.split(/\n\n+/)

  return (
    <div className="prose-container" style={{ color: '#2D3748', fontSize: '1.05rem', lineHeight: '1.85' }}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim()

        // H2 Header
        if (trimmed.startsWith('## ')) {
          const text = trimmed.replace(/^##\s+/, '')
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          return (
            <h2
              key={idx}
              id={id}
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '1.85rem',
                color: 'var(--emerald-secondary)',
                marginTop: '2.5rem',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid rgba(47,133,90,0.15)',
                lineHeight: '1.3',
              }}
            >
              {text}
            </h2>
          )
        }

        // H3 Header
        if (trimmed.startsWith('### ')) {
          const text = trimmed.replace(/^###\s+/, '')
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          return (
            <h3
              key={idx}
              id={id}
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '1.4rem',
                color: '#1A202C',
                marginTop: '2rem',
                marginBottom: '0.75rem',
                lineHeight: '1.35',
              }}
            >
              {text}
            </h3>
          )
        }

        // Inline Image ![Alt text](url)
        const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
        if (imageMatch) {
          const altText = imageMatch[1]
          const imgUrl = imageMatch[2]
          return (
            <figure key={idx} style={{ margin: '2rem 0', textAlign: 'center' }}>
              <div style={{ borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', maxHeight: '420px' }}>
                <img
                  src={imgUrl}
                  alt={altText}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              {altText && (
                <figcaption style={{ fontSize: '0.85rem', color: '#718096', fontStyle: 'italic', marginTop: '0.6rem' }}>
                  📸 {altText}
                </figcaption>
              )}
            </figure>
          )
        }

        // Callout Box / Tip / Alert (> text)
        if (trimmed.startsWith('> ')) {
          const quoteText = trimmed.replace(/^>\s+/, '').replace(/\n>\s+/g, '\n')
          return (
            <div
              key={idx}
              style={{
                borderLeft: '4px solid var(--gold-accent)',
                background: '#FFFDF5',
                padding: '1.25rem 1.5rem',
                margin: '1.75rem 0',
                borderRadius: '0 12px 12px 0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ fontWeight: 700, color: '#975A16', marginBottom: '0.35rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                💡 INSIDER DMC TIP
              </div>
              <div style={{ color: '#744210', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {quoteText}
              </div>
            </div>
          )
        }

        // Bullet List
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split(/\n[-*]\s+/).filter(Boolean).map(i => i.replace(/^[-*]\s+/, ''))
          return (
            <ul key={idx} style={{ margin: '1rem 0 1.5rem 1.5rem', padding: 0 }}>
              {items.map((item, iIdx) => (
                <li key={iIdx} style={{ marginBottom: '0.5rem', lineHeight: '1.7', color: '#374151' }}>
                  <span dangerouslySetInnerHTML={{
                    __html: item
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  }} />
                </li>
              ))}
            </ul>
          )
        }

        // Action CTA Banner inside article
        if (trimmed.startsWith('[CTA:')) {
          const ctaMatch = trimmed.match(/\[CTA:\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]/)
          if (ctaMatch) {
            const title = ctaMatch[1]
            const btnText = ctaMatch[2]
            const linkUrl = ctaMatch[3]
            return (
              <div
                key={idx}
                style={{
                  background: 'linear-gradient(135deg, rgba(47,133,90,0.08) 0%, rgba(212,160,23,0.12) 100%)',
                  border: '1.5px solid var(--emerald-secondary)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  margin: '2.5rem 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--emerald-secondary)', fontSize: '1.1rem', fontWeight: 800 }}>
                    🎟️ {title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#4A5568' }}>
                    Instant barcoded e-tickets • Direct turnstile entry • Lowest wholesale price guarantee.
                  </p>
                </div>
                <Link
                  href={linkUrl}
                  className="btn btn-primary"
                  style={{
                    padding: '0.65rem 1.4rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {btnText} →
                </Link>
              </div>
            )
          }
        }

        // Standard Paragraph
        return (
          <p
            key={idx}
            style={{ marginBottom: '1.25rem', color: '#374151', fontSize: '1.05rem', lineHeight: '1.85' }}
            dangerouslySetInnerHTML={{
              __html: trimmed
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:var(--emerald-secondary);font-weight:600;text-decoration:underline;">$1</a>')
            }}
          />
        )
      })}
    </div>
  )
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
          // Increment view count for this article
          if (match) {
            fetch(`/api/blog/view/${match.slug}`, { method: 'PATCH' }).catch(console.error)
          }
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
        <p style={{ opacity: 0.8, marginBottom: '2rem' }}>We could not locate this travel story or guide.</p>
        <Link href="/blog" className="btn btn-primary">Back to Blog Feed</Link>
      </div>
    )
  }

  // Extract Table of Contents from markdown headings
  const tocHeadings = (article.content || '')
    .split('\n')
    .filter(line => line.startsWith('## ') || line.startsWith('### '))
    .map(line => {
      const isH2 = line.startsWith('## ')
      const text = line.replace(/^#{2,3}\s+/, '')
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return { text, id, isH2 }
    })

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Back button link */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/blog" style={{ color: 'var(--emerald-secondary)', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          ← Back to Blog Feed
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'start' }}>
        
        {/* Main Content Pane */}
        <div style={{ flex: '2' }}>
          
          {/* Article Header info */}
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.8rem', background: 'rgba(47,133,90,0.1)', color: 'var(--emerald-secondary)', padding: '0.3rem 0.85rem', borderRadius: '15px', fontWeight: 700, textTransform: 'uppercase' }}>
              {article.category}
            </span>
            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.5rem', color: '#1A202C', marginTop: '1rem', marginBottom: '1rem', lineHeight: '1.25' }}>
              {article.title}
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', color: '#718096', fontSize: '0.85rem', flexWrap: 'wrap' }}>
              <span>✍️ Written by: <strong>{article.author}</strong></span>
              <span>📅 Published: {article.date}</span>
              <span>⏱️ Read Time: {article.readTime}</span>
            </div>
          </div>

          {/* Hero Cover Image */}
          <div style={{ height: '420px', borderRadius: '16px', overflow: 'hidden', marginBottom: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          {/* Table of Contents Box (Mobile/In-line) */}
          {tocHeadings.length > 0 && (
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '1.5rem',
                marginBottom: '2.5rem'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--emerald-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📑 In this Singapore Travel Guide:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', listStyle: 'none' }}>
                {tocHeadings.map((h, hIdx) => (
                  <li key={hIdx} style={{ marginBottom: '0.45rem', paddingLeft: h.isH2 ? 0 : '1rem' }}>
                    <a
                      href={`#${h.id}`}
                      style={{
                        color: h.isH2 ? '#1E293B' : '#64748B',
                        fontWeight: h.isH2 ? 600 : 400,
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                        transition: 'color 0.2s'
                      }}
                    >
                      {h.isH2 ? '• ' : '↳ '} {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Render Full Rich Markdown Content with Photos & Callouts */}
          <MarkdownRenderer content={article.content} />

          {/* Bottom Article Author & Share footer */}
          <div style={{ marginTop: '4rem', padding: '2rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--emerald-secondary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
              {article.author.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#1E293B' }}>{article.author}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.2rem' }}>
                Destination Specialist at Flying Wonders Singapore. Curating luxury itineraries, corporate groups, and family holiday experiences.
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Call To Action widgets */}
        <div style={{ flex: '1 0 320px', position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Quick Attraction Tickets Booking Widget */}
          <div className="glass" style={{ padding: '1.75rem', borderRadius: '16px', background: '#FFF', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--emerald-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ⚡ Instant E-Tickets
            </span>
            <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.35rem', color: '#1A202C', margin: '0.5rem 0 0.75rem 0' }}>
              Singapore Attractions E-Ticket Builder
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4A5568', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Universal Studios, Gardens by the Bay, Night Safari & more at wholesale DMC rates. Instant barcode dispatch.
            </p>
            <Link
              href="/singapore-attractions"
              className="btn btn-primary"
              style={{ width: '100%', textAlign: 'center', display: 'block', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 700 }}
            >
              Get Instant Attraction Quote →
            </Link>
          </div>

          {/* Custom Package Planner CTA */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--bg-dark)', color: 'white', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-lg)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--gold-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Singapore DMC Specialist
            </span>
            <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.4rem', color: '#FFF', margin: '0.5rem 0 1rem 0' }}>
              Plan a Complete Singapore Holiday
            </h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Let our travel architects craft a custom itinerary for your family, couple trip, or corporate team.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/packages" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', background: 'var(--gold-accent)', color: '#111', fontWeight: 700 }}>
                Explore Holiday Packages
              </Link>
              <Link href="/ai-planner" style={{ textAlign: 'center', color: '#FFF', fontSize: '0.85rem', textDecoration: 'underline' }}>
                ✨ Try AI Trip Planner (Free)
              </Link>
            </div>
          </div>

          {/* Instant WhatsApp Help Widget */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: '#FFF', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--emerald-secondary)', margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 700 }}>
              Need Help Planning?
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#4A5568', marginBottom: '1rem' }}>
              Chat directly with our Singapore destination desk on WhatsApp.
            </p>
            <a 
              href="https://wa.me/919886171251" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: '#25D366',
                color: '#FFF',
                padding: '0.65rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              💬 WhatsApp Us (+91 98861 71251)
            </a>
          </div>

        </div>

      </div>

    </div>
  )
}
