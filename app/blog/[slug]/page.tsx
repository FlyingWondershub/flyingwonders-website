'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AdBanner from '../../../components/AdBanner'

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

  // Normalize single newlines between list items or headers
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let currentList: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushList = () => {
    if (currentList.length > 0) {
      const items = [...currentList]
      const type = listType
      currentList = []
      listType = null

      if (type === 'ol') {
        elements.push(
          <ol key={`ol-${elements.length}`} style={{ margin: '1.25rem 0 1.75rem 1.75rem', padding: 0 }}>
            {items.map((item, iIdx) => (
              <li key={iIdx} style={{ marginBottom: '0.75rem', lineHeight: '1.75', color: '#374151' }}>
                <span dangerouslySetInnerHTML={{
                  __html: item
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:var(--emerald-secondary);font-weight:600;text-decoration:underline;">$1</a>')
                }} />
              </li>
            ))}
          </ol>
        )
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} style={{ margin: '1.25rem 0 1.75rem 1.75rem', padding: 0, listStyleType: 'disc' }}>
            {items.map((item, iIdx) => (
              <li key={iIdx} style={{ marginBottom: '0.75rem', lineHeight: '1.75', color: '#374151' }}>
                <span dangerouslySetInnerHTML={{
                  __html: item
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:var(--emerald-secondary);font-weight:600;text-decoration:underline;">$1</a>')
                }} />
              </li>
            ))}
          </ul>
        )
      }
    }
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx]
    const trimmed = rawLine.trim()

    if (!trimmed) {
      flushList()
      continue
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      flushList()
      elements.push(
        <hr key={`hr-${idx}`} style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '2.5rem 0' }} />
      )
      continue
    }

    // H2 Header
    if (trimmed.startsWith('## ')) {
      flushList()
      const text = trimmed.replace(/^##\s+/, '')
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const h2Count = elements.filter(el => (el as any)?.type === 'h2').length
      
      // Inject a native ad banner right before the 3rd major section (H2)
      if (h2Count === 2) {
        elements.push(
          <AdBanner 
            key={`in-article-ad-${idx}`} 
            slotId="blog_in_article_slot" 
            category="blog"
            style={{ margin: '2.5rem 0' }}
          />
        )
      }

      elements.push(
        <h2
          key={`h2-${idx}`}
          id={id}
          style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: '1.85rem',
            color: 'var(--emerald-secondary)',
            marginTop: '2.75rem',
            marginBottom: '1.25rem',
            paddingBottom: '0.5rem',
            borderBottom: '2px solid rgba(47,133,90,0.15)',
            lineHeight: '1.3',
          }}
        >
          {text}
        </h2>
      )
      continue
    }

    // H3 Header
    if (trimmed.startsWith('### ')) {
      flushList()
      const text = trimmed.replace(/^###\s+/, '')
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      elements.push(
        <h3
          key={`h3-${idx}`}
          id={id}
          style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: '1.4rem',
            color: '#1A202C',
            marginTop: '2rem',
            marginBottom: '0.85rem',
            lineHeight: '1.35',
          }}
        >
          {text}
        </h3>
      )
      continue
    }

    // Inline Image ![Alt text](url)
    const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
    if (imageMatch) {
      flushList()
      const altText = imageMatch[1]
      const imgUrl = imageMatch[2]
      elements.push(
        <figure key={`fig-${idx}`} style={{ margin: '2.25rem 0', textAlign: 'center' }}>
          <div style={{ borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', maxHeight: '440px', background: '#F1F5F9' }}>
            <img
              src={imgUrl || '/images/hero/singapore-hero-1.jpg'}
              alt={altText}
              loading="lazy"
              onError={(e: any) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/hero/singapore-hero-1.jpg';
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          {altText && (
            <figcaption style={{ fontSize: '0.85rem', color: '#718096', fontStyle: 'italic', marginTop: '0.65rem' }}>
              📸 {altText}
            </figcaption>
          )}
        </figure>
      )
      continue
    }

    // Callout Box / Tip / Alert (> text)
    if (trimmed.startsWith('> ')) {
      flushList()
      const quoteText = trimmed.replace(/^>\s+/, '')
      elements.push(
        <div
          key={`quote-${idx}`}
          className="blog-tip-box"
          style={{
            borderLeft: '4px solid var(--gold-accent)',
            background: '#FFFDF5',
            padding: '1.25rem 1.5rem',
            margin: '1.75rem 0',
            borderRadius: '0 12px 12px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div className="tip-title" style={{ fontWeight: 700, color: '#975A16', marginBottom: '0.35rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            💡 INSIDER DMC TIP
          </div>
          <div className="tip-content" style={{ color: '#744210', fontSize: '0.95rem', lineHeight: '1.6' }}
            dangerouslySetInnerHTML={{
              __html: quoteText
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:var(--emerald-secondary);font-weight:600;text-decoration:underline;">$1</a>')
            }}
          />
        </div>
      )
      continue
    }

    // Action CTA Banner inside article [CTA: title | btnText | linkUrl]
    if (trimmed.startsWith('[CTA:')) {
      flushList()
      const ctaMatch = trimmed.match(/\[CTA:\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]/)
      if (ctaMatch) {
        const title = ctaMatch[1]
        const btnText = ctaMatch[2]
        const linkUrl = ctaMatch[3]
        elements.push(
          <div
            key={`cta-${idx}`}
            className="glass"
            style={{
              background: 'linear-gradient(135deg, rgba(47,133,90,0.08) 0%, rgba(212,160,23,0.12) 100%)',
              border: '1.5px solid var(--emerald-secondary)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              margin: '2.5rem 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--emerald-secondary)', fontSize: '1.05rem', fontWeight: 800 }}>
                🎟️ {title}
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-dark)', opacity: 0.85 }}>
                Instant barcoded e-tickets • Direct turnstile entry • Lowest wholesale price guarantee.
              </p>
            </div>
            <Link
              href={linkUrl}
              className="btn btn-primary"
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}
            >
              {btnText} →
            </Link>
          </div>
        )
        continue
      }
    }

    // Unordered Bullet List (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (listType !== 'ul') flushList()
      listType = 'ul'
      currentList.push(trimmed.replace(/^[-*]\s+/, ''))
      continue
    }

    // Ordered Numbered List (1. or 2.)
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
    if (olMatch && !trimmed.startsWith('##') && !trimmed.startsWith('###')) {
      if (listType !== 'ol') flushList()
      listType = 'ol'
      currentList.push(olMatch[2])
      continue
    }

    // Standard Paragraph
    flushList()
    elements.push(
      <p
        key={`p-${idx}`}
        style={{ marginBottom: '1.25rem', color: 'var(--text-dark)', opacity: 0.9, fontSize: '1.05rem', lineHeight: '1.85' }}
        dangerouslySetInnerHTML={{
          __html: trimmed
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:var(--emerald-secondary);font-weight:600;text-decoration:underline;">$1</a>')
        }}
      />
    )
  }

  flushList()

  return (
    <div className="prose-container">
      {elements}
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
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Back button link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/blog" style={{ color: 'var(--emerald-secondary)', fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          ← Back to Blog Feed
        </Link>
      </div>

      <div className="blog-layout-grid">
        
        {/* Main Content Pane */}
        <div style={{ minWidth: 0 }}>
          
          {/* Article Header info */}
          <div style={{ marginBottom: '1.75rem' }}>
            <span style={{ fontSize: '0.75rem', background: 'rgba(47,133,90,0.12)', color: 'var(--emerald-secondary)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
              {article.category}
            </span>
            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', color: 'var(--text-dark)', marginTop: '0.75rem', marginBottom: '0.85rem', lineHeight: '1.25' }}>
              {article.title}
            </h1>
            <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-dark)', opacity: 0.75, fontSize: '0.82rem', flexWrap: 'wrap' }}>
              <span>✍️ Written by: <strong>{article.author}</strong></span>
              <span>📅 Published: {article.date}</span>
              <span>⏱️ Read Time: {article.readTime}</span>
            </div>
          </div>

          {/* Hero Cover Image */}
          <div style={{ height: 'clamp(240px, 45vw, 440px)', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem', boxShadow: 'var(--shadow-md)', background: 'rgba(0,0,0,0.05)' }}>
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

          {/* Table of Contents Box */}
          {tocHeadings.length > 0 && (
            <div
              className="blog-toc-box"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                marginBottom: '2.5rem'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--emerald-secondary)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📑 In this Singapore Travel Guide:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', listStyle: 'none' }}>
                {tocHeadings.map((h, hIdx) => (
                  <li key={hIdx} style={{ marginBottom: '0.4rem', paddingLeft: h.isH2 ? 0 : '1rem' }}>
                    <a
                      href={`#${h.id}`}
                      style={{
                        color: h.isH2 ? 'var(--text-dark)' : 'var(--text-dark)',
                        opacity: h.isH2 ? 1 : 0.8,
                        fontWeight: h.isH2 ? 600 : 400,
                        fontSize: '0.88rem',
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

          {/* Bottom End-of-Article Sponsored Unit */}
          <AdBanner 
            slotId="blog_article_end_slot" 
            category="blog"
            style={{ marginTop: '2.5rem', marginBottom: '1rem' }}
          />

          {/* Bottom Article Author & Share footer */}
          <div className="blog-author-box" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--emerald-secondary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, flexShrink: 0 }}>
              {article.author.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{article.author}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dark)', opacity: 0.75, marginTop: '0.15rem' }}>
                Destination Specialist at Flying Wonders Singapore. Curating luxury itineraries, corporate groups, and family holiday experiences.
              </div>
            </div>
          </div>

        </div>

        {/* Streamlined Super Compact Sidebar CTA */}
        <aside style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Consolidated Compact Action Card */}
          <div className="glass" style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--emerald-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ⚡ Direct DMC Rates
            </span>
            <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.15rem', color: 'var(--text-dark)', margin: '0.35rem 0 0.5rem 0', lineHeight: '1.3' }}>
              Singapore Attraction Tickets
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dark)', opacity: 0.8, lineHeight: 1.45, marginBottom: '0.85rem' }}>
              Instant barcode e-tickets to USS, Gardens by the Bay, Night Safari & more at wholesale rates.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                href="/singapore-attractions"
                className="btn btn-primary"
                style={{ width: '100%', textAlign: 'center', padding: '0.55rem', fontSize: '0.8rem', fontWeight: 700 }}
              >
                Instant E-Tickets →
              </Link>
              <Link
                href="/packages"
                style={{ width: '100%', textAlign: 'center', padding: '0.45rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--emerald-secondary)', border: '1px solid var(--glass-border)', borderRadius: '6px', textDecoration: 'none' }}
              >
                Custom Packages
              </Link>
            </div>
          </div>

          {/* Quick WhatsApp Link Pill */}
          <a 
            href="https://wa.me/919886171251" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: '#25D366',
              color: '#FFFFFF',
              padding: '0.6rem 0.85rem',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(37,211,102,0.25)'
            }}
          >
            💬 WhatsApp Singapore Desk
          </a>
        </aside>

      </div>

    </div>
  )
}
