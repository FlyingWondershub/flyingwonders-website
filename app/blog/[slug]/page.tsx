import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdBanner from '../../../components/AdBanner'
import BlogViewTracker from '../../../components/BlogViewTracker'
import { getBlogArticleBySlug, getAllBlogSlugs, BlogPost } from '../../../utils/blog'

export const revalidate = 600 // ISR: revalidate every 10 minutes

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getBlogArticleBySlug(slug)

  if (!article) {
    return {
      title: 'Article Not Found | Flying Wonders Travel Guides',
      description: 'The requested Singapore travel guide could not be found.',
    }
  }

  const title = `${article.title} | Flying Wonders Singapore`
  const description = article.excerpt || article.seoDescription || `Discover top insider travel tips and guides for Singapore with Flying Wonders.`
  const url = `https://flyingwonders.net/blog/${article.slug}`
  const imageUrl = article.imageUrl || 'https://flyingwonders.net/images/hero/singapore-hero-1.jpg'

  return {
    title,
    description,
    keywords: [
      article.category,
      'Singapore travel guide',
      'Singapore tourism',
      ...(article.tags || []),
      'Flying Wonders DMC'
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Flying Wonders',
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

// Server-Side High-Performance Markdown and Visual Block Renderer
function ServerMarkdownRenderer({ content }: { content: string }) {
  if (!content) return null

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
              <li key={iIdx} style={{ marginBottom: '0.75rem', lineHeight: '1.75', color: 'var(--text-dark)' }}>
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
              <li key={iIdx} style={{ marginBottom: '0.75rem', lineHeight: '1.75', color: 'var(--text-dark)' }}>
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
        <hr key={`hr-${idx}`} style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '2.5rem 0' }} />
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
            key={`ad-mid-${idx}`}
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
            fontSize: '1.75rem',
            color: 'var(--emerald-secondary)',
            marginTop: '2.5rem',
            marginBottom: '1rem',
            lineHeight: '1.3',
            borderBottom: '2px solid rgba(47,133,90,0.15)',
            paddingBottom: '0.5rem'
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
            fontSize: '1.35rem',
            color: 'var(--text-dark)',
            marginTop: '1.75rem',
            marginBottom: '0.75rem',
            lineHeight: '1.4'
          }}
        >
          {text}
        </h3>
      )
      continue
    }

    // Markdown Table Parser
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList()
      const tableLines = [trimmed]
      while (idx + 1 < lines.length && lines[idx + 1].trim().startsWith('|') && lines[idx + 1].trim().endsWith('|')) {
        idx++
        tableLines.push(lines[idx].trim())
      }

      if (tableLines.length >= 2) {
        const headerCols = tableLines[0].split('|').slice(1, -1).map(c => c.trim())
        const rowLines = tableLines.slice(2)

        elements.push(
          <div key={`tbl-${idx}`} style={{ overflowX: 'auto', margin: '2rem 0', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', background: 'var(--bg-secondary)' }}>
              <thead>
                <tr style={{ background: 'var(--emerald-secondary)', color: '#FFFFFF' }}>
                  {headerCols.map((col, cIdx) => (
                    <th key={cIdx} style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                      <span dangerouslySetInnerHTML={{
                        __html: col
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      }} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowLines.map((rowStr, rIdx) => {
                  const cells = rowStr.split('|').slice(1, -1).map(c => c.trim())
                  return (
                    <tr key={rIdx} style={{ borderBottom: '1px solid var(--glass-border)', background: rIdx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                      {cells.map((cell, cellIdx) => (
                        <td key={cellIdx} style={{ padding: '0.85rem 1rem', color: 'var(--text-dark)' }}>
                          <span dangerouslySetInnerHTML={{
                            __html: cell
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:var(--emerald-secondary);font-weight:600;text-decoration:underline;">$1</a>')
                          }} />
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
        continue
      }
    }

    // Markdown Image tag: ![Alt text](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
    if (imgMatch) {
      flushList()
      const alt = imgMatch[1]
      const src = imgMatch[2]
      elements.push(
        <div
          key={`img-${idx}`}
          style={{
            margin: '2rem 0',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            background: 'rgba(0,0,0,0.03)'
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '550px', objectFit: 'cover' }}
            loading="lazy"
          />
          {alt && (
            <div style={{ padding: '0.65rem 1rem', background: 'var(--bg-secondary)', fontSize: '0.82rem', color: 'var(--text-muted, #64748B)', textAlign: 'center', borderTop: '1px solid var(--glass-border)', fontStyle: 'italic' }}>
              📷 {alt}
            </div>
          )}
        </div>
      )
      continue
    }

    // Blockquote Insider Tip (> Tip text)
    if (trimmed.startsWith('>')) {
      flushList()
      const quoteText = trimmed.replace(/^>\s*/, '')
      elements.push(
        <div
          key={`tip-${idx}`}
          style={{
            background: 'linear-gradient(135deg, rgba(212,160,23,0.08) 0%, rgba(212,160,23,0.18) 100%)',
            borderLeft: '4px solid #D4A017',
            borderRadius: '0 12px 12px 0',
            padding: '1.25rem 1.5rem',
            margin: '2rem 0',
            boxShadow: 'var(--shadow-sm)'
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

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const article = await getBlogArticleBySlug(slug)

  if (!article) {
    notFound()
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

  // Google JSON-LD BlogPosting Schema for Rich Search Indexing & AdSense Trust
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || article.seoDescription,
    image: [article.imageUrl],
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Flying Wonders Private Limited',
      logo: {
        '@type': 'ImageObject',
        url: 'https://flyingwonders.net/images/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://flyingwonders.net/blog/${article.slug}`,
    },
  }

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <BlogViewTracker slug={article.slug} />

      <div className="container" style={{ padding: '2.5rem 1.5rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Back button link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/blog" style={{ color: 'var(--emerald-secondary)', fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            ← Back to Blog Feed
          </Link>
        </div>

        <div className="blog-layout-grid">
          
          {/* Main Content Pane */}
          <article style={{ minWidth: 0 }}>
            
            {/* Article Header info */}
            <header style={{ marginBottom: '1.75rem' }}>
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
            </header>

            {/* Hero Cover Image */}
            <div style={{ height: 'clamp(240px, 45vw, 440px)', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem', boxShadow: 'var(--shadow-md)', background: 'rgba(0,0,0,0.05)' }}>
              <img 
                src={article.imageUrl || '/images/hero/singapore-hero-1.jpg'} 
                alt={article.title} 
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
            <ServerMarkdownRenderer content={article.content} />

            {/* Bottom End-of-Article Sponsored Unit */}
            <AdBanner 
              category="blog"
              style={{ marginTop: '2.5rem', marginBottom: '1rem' }}
            />

            {/* Bottom Article Author & Share footer */}
            <footer className="blog-author-box" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--emerald-secondary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, flexShrink: 0 }}>
                {article.author.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{article.author}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dark)', opacity: 0.75, marginTop: '0.15rem' }}>
                  Destination Specialist at Flying Wonders Singapore. Curating luxury itineraries, corporate groups, and family holiday experiences.
                </div>
              </div>
            </footer>

          </article>

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
    </>
  )
}
