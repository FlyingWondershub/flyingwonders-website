'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, ShieldAlert, Loader2, CheckCircle, XCircle, Activity, Users, DollarSign, RefreshCw, FileText } from 'lucide-react'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  const [metrics, setMetrics] = useState({ activeAgents: 0, pendingPayments: 0, totalContacts: 0 })
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])

  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    setRefreshing(true)
    try {
      const [authRes, metRes, payRes, agentRes, logRes] = await Promise.all([
        fetch('/api/auth/check'),
        fetch('/api/admin/metrics'),
        fetch('/api/admin/payments/pending'),
        fetch('/api/admin/agents'),
        fetch('/api/admin/audit-logs')
      ])

      const authData = await authRes.json()
      if (authData.authenticated && authData.agent?.role === 'admin') {
        setIsAdmin(true)
        setMetrics(await metRes.json())
        setPendingPayments(await payRes.json())
        setAgents(await agentRes.json())
        setLogs(await logRes.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      await fetch('/api/admin/payments/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status })
      })
      fetchData()
    } catch (e) {
      alert('Failed to update payment status')
    }
  }

  const toggleAgentStatus = async (agentId: string, currentState: boolean) => {
    try {
      await fetch('/api/admin/agents/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, isActive: !currentState })
      })
      fetchData()
    } catch (e) {
      alert('Failed to toggle agent status')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="var(--emerald-secondary)" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#F7FAFC' }}>
        <ShieldAlert size={64} color="#E53E3E" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.5rem', color: '#2D3748', marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ color: '#4A5568', fontSize: '1.1rem', marginBottom: '2rem' }}>You must log in as an administrator to view this page.</p>
        <button
          onClick={() => router.push('/')}
          style={{ padding: '0.75rem 2rem', background: 'var(--emerald-secondary)', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
        >
          Return Home
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAFC', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.5rem', color: '#2D3748', margin: 0 }}>Admin Dashboard</h1>
            <p style={{ color: '#4A5568', fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}>Manage operations, approvals, and data exports.</p>
          </div>
          <button 
            onClick={fetchData} 
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer' }}
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ background: '#FFF', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '1rem', background: '#E6FFFA', borderRadius: '12px' }}><Users color="#319795" /></div>
              <h3 style={{ margin: 0, color: '#4A5568' }}>Active Agents</h3>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2D3748' }}>{metrics.activeAgents}</div>
          </div>
          <div style={{ background: '#FFF', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '1rem', background: '#FFF5F5', borderRadius: '12px' }}><DollarSign color="#E53E3E" /></div>
              <h3 style={{ margin: 0, color: '#4A5568' }}>Pending Payments</h3>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2D3748' }}>{metrics.pendingPayments}</div>
          </div>
          <div style={{ background: '#FFF', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '1rem', background: '#EBF4FF', borderRadius: '12px' }}><FileText color="#3182CE" /></div>
              <h3 style={{ margin: 0, color: '#4A5568' }}>Total Contacts</h3>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2D3748' }}>{metrics.totalContacts}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* PENDING PAYMENTS */}
            <div style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#2D3748', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>Pending Payments</h2>
              {pendingPayments.length === 0 ? <p style={{ color: '#718096' }}>No pending payments to verify.</p> : (
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#718096' }}>
                      <th style={{ padding: '0.75rem 0' }}>Ref</th>
                      <th style={{ padding: '0.75rem 0' }}>Amount</th>
                      <th style={{ padding: '0.75rem 0' }}>UTR</th>
                      <th style={{ padding: '0.75rem 0' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayments.map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                        <td style={{ padding: '1rem 0', fontWeight: 600 }}>{p.bookingReference || 'N/A'}</td>
                        <td style={{ padding: '1rem 0' }}>₹{p.amountInr}</td>
                        <td style={{ padding: '1rem 0', fontFamily: 'monospace' }}>{p.utrNumber}</td>
                        <td style={{ padding: '1rem 0', display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => updatePaymentStatus(p._id, 'verified')} style={{ background: '#48BB78', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer' }}><CheckCircle size={16} /></button>
                          <button onClick={() => updatePaymentStatus(p._id, 'rejected')} style={{ background: '#F56565', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer' }}><XCircle size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* AGENT APPROVALS */}
            <div style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#2D3748', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>Recent B2B Agents</h2>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#718096' }}>
                      <th style={{ padding: '0.75rem 0' }}>Company</th>
                      <th style={{ padding: '0.75rem 0' }}>Email</th>
                      <th style={{ padding: '0.75rem 0' }}>Status</th>
                      <th style={{ padding: '0.75rem 0' }}>Toggle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map(a => (
                      <tr key={a._id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                        <td style={{ padding: '1rem 0', fontWeight: 600 }}>{a.companyName}</td>
                        <td style={{ padding: '1rem 0' }}>{a.email}</td>
                        <td style={{ padding: '1rem 0' }}>
                          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.8rem', background: a.isActive ? '#C6F6D5' : '#FED7D7', color: a.isActive ? '#22543D' : '#742A2A' }}>
                            {a.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0' }}>
                          <button onClick={() => toggleAgentStatus(a._id, a.isActive)} style={{ background: '#E2E8F0', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                            {a.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>

            {/* EXPORTS */}
            <div style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#2D3748', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>Data Exports</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="/api/admin/export-agents" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#2B6CB0', color: '#FFF', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}><Download size={18} /> Agents CSV</a>
                <a href="/api/admin/export-contacts" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#2B6CB0', color: '#FFF', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}><Download size={18} /> Contacts CSV</a>
                <a href="/api/admin/export-payments" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#2B6CB0', color: '#FFF', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}><Download size={18} /> Payments CSV</a>
              </div>
            </div>
          </div>

          {/* AUDIT LOGS */}
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', height: 'fit-content', maxHeight: '800px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#2D3748', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={20} /> Security & Audit Logs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {logs.length === 0 ? <p style={{ color: '#718096' }}>No logs recorded yet.</p> : logs.map(log => (
                <div key={log._id} style={{ padding: '1rem', background: '#F7FAFC', borderRadius: '8px', borderLeft: '4px solid #3182CE' }}>
                  <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem' }}>{new Date(log.timestamp).toLocaleString()}</div>
                  <div style={{ fontWeight: 600, color: '#2D3748', marginBottom: '0.25rem' }}>{log.action}</div>
                  <div style={{ fontSize: '0.9rem', color: '#4A5568' }}>{log.email}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
