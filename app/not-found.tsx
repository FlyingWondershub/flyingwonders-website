import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found (404) | Flying Wonders Singapore DMC',
  description: 'The requested page could not be found. Explore our Singapore tour packages, attraction tickets, and travel tools.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: '600px', width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '3rem 2rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: 1 }}>✈️</div>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--emerald-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'inline-block', marginBottom: '0.5rem' }}>
          404 — Page Not Found
        </span>
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', color: 'var(--text-dark)', margin: '0 0 1rem 0', lineHeight: 1.25 }}>
          Destination Off the Map
        </h1>
        <p style={{ color: 'var(--text-dark)', opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          We couldn&apos;t locate the page you were looking for. It may have been moved, updated, or is temporarily unavailable.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 700 }}
          >
            ← Return to Homepage
          </Link>
          <Link
            href="/packages"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--emerald-secondary)',
              background: 'transparent',
              border: '1.5px solid var(--emerald-secondary)',
              borderRadius: '8px',
              textDecoration: 'none'
            }}
          >
            Explore Packages
          </Link>
        </div>
      </div>
    </div>
  )
}
