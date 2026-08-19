import Link from 'next/link'

export default function Breadcrumbs({ category, title }: { category: string; title: string }) {
  return (
    <nav aria-label="breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
      <ol style={{ listStyle: 'none', display: 'flex', gap: '0.5rem', padding: 0, margin: 0 }}>
        <li>
          <Link href="/" style={{ color: 'var(--emerald-secondary)' }}>
            Home
          </Link>
        </li>
        <li>/</li>
        <li>
          <Link href="/blog" style={{ color: 'var(--emerald-secondary)' }}>
            Blog
          </Link>
        </li>
        {category && (
          <>
            <li>/</li>
            <li>{category}</li>
          </>
        )}
        <li>/</li>
        <li style={{ color: '#111', fontWeight: 600 }}>{title}</li>
      </ol>
    </nav>
  )
}
