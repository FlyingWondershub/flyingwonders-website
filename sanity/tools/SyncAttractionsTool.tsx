import React, { useState } from 'react'

export function SyncAttractionsTool() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/sync-attractions', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setResult({
          success: true,
          message: data.message || `Successfully synced ${data.count} attractions and purged website cache!`,
          count: data.count
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to sync. Please try again.'
        })
      }
    } catch (e: any) {
      setResult({
        success: false,
        message: e.message || 'Network error while syncing.'
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div style={{
      padding: '3rem 2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#F8FAFC',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '2.5rem',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        border: '1px solid #E2E8F0',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#ECFDF5',
          color: '#059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          fontSize: '1.75rem'
        }}>
          🔄
        </div>

        <h1 style={{ color: '#0F172A', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
          Sync Google Sheets & Purge Cache
        </h1>

        <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 2rem 0' }}>
          Whenever you add, rename, or change prices in your master Google Sheet, click below to immediately refresh the website quotation pages and Sanity schemas.
        </p>

        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          style={{
            background: syncing ? '#94A3B8' : '#059669',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '1rem 2rem',
            fontSize: '1.05rem',
            fontWeight: 700,
            cursor: syncing ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {syncing ? '⏳ Syncing Google Sheets...' : '🔄 Sync Sheets & Purge Cache'}
        </button>

        {result && (
          <div style={{
            marginTop: '1.75rem',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            background: result.success ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${result.success ? '#BBF7D0' : '#FECACA'}`,
            color: result.success ? '#166534' : '#991B1B',
            fontSize: '0.92rem',
            fontWeight: 600,
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{result.success ? '✅' : '❌'}</span>
              <span>{result.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
