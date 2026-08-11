'use client'

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: '#0F4C3A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 24px rgba(15, 76, 58, 0.2)'
      }}>
        <img src="/images/logo.png" alt="Flying Wonders Logo" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
      </div>
      <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-playfair), serif', color: 'var(--emerald-secondary)', marginBottom: '1rem' }}>
        You are offline
      </h1>
      <p style={{ color: '#666', maxWidth: '450px', lineHeight: 1.6, marginBottom: '2rem' }}>
        It looks like you've lost your internet connection. Please check your network to continue browsing Flying Wonders.
      </p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          background: '#0F4C3A',
          color: '#FFFFFF',
          border: 'none',
          padding: '0.8rem 2rem',
          borderRadius: '24px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(15, 76, 58, 0.25)'
        }}
      >
        Retry Connection
      </button>
    </div>
  )
}
