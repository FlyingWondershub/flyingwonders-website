import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'

interface LeadItem {
  _id?: string
  name: string
  email: string
  phone: string
  whatsapp: string
  designation: string
  company: string
  website: string
  city: string
  accreditations: string
  taxId: string
  priority: 'high' | 'medium' | 'normal'
  leadType: 'individual' | 'department' | 'company' | 'whatsapp'
  status: 'new' | 'contacted' | 'in_discussion' | 'closed' | 'opt_out'
  source: 'gmail' | 'whatsapp_chat' | 'whatsapp_group' | 'google_contacts' | 'manual'
  instagram?: string
  linkedin?: string
  relevantKeywords?: string
  subjectSample?: string
  internalNotes?: string
}

export function MarketingHubTool() {
  const [activeTab, setActiveTab] = useState<'ingest' | 'directory'>('ingest')
  const [parsedLeads, setParsedLeads] = useState<LeadItem[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null)

  // Directory State
  const [directoryLeads, setDirectoryLeads] = useState<LeadItem[]>([])
  const [stats, setStats] = useState<any>({})
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Text paste input
  const [rawText, setRawText] = useState('')

  // WhatsApp template selector
  const [selectedTemplate, setSelectedTemplate] = useState<'drone_corp' | 'drone_wedding'>('drone_corp')

  const TEMPLATES = {
    drone_corp: (name: string, company: string) =>
      `Hi ${name || 'there'}, loved your recent work at ${company || 'your company'}! We produce synchronized aerial drone light shows and entertainment storytelling for major brand launches, music festivals, government summits, and corporate events across India. Would love to share our 30-second showreel with your event team. Could I send that over?`,
    drone_wedding: (name: string, company: string) =>
      `Hi ${name || 'there'}, reaching out from Flying Wonders! We specialize in bespoke aerial drone light shows and 3D sky animations for luxury weddings and private celebrations across India. Would love to share our entertainment deck and past show videos for your upcoming projects.`,
  }

  // Load directory on mount or tab change
  useEffect(() => {
    if (activeTab === 'directory') {
      fetchDirectory()
    }
  }, [activeTab])

  const fetchDirectory = async () => {
    setIsLoadingDirectory(true)
    try {
      const res = await fetch('/api/admin/leads?limit=500')
      const data = await res.json()
      if (data.success) {
        setDirectoryLeads(data.leads || [])
        setStats(data.stats || {})
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingDirectory(false)
    }
  }

  // Sanitization helper
  const cleanPhone = (raw: string): string => {
    const cleaned = raw.replace(/[^\d+]/g, '')
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      return `+91${cleaned}`
    }
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`
    }
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
  }

  // Parser 1: WhatsApp Chat TXT File
  const handleChatFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsParsing(true)
    setSyncFeedback(null)

    const text = await file.text()
    const lines = text.split('\n')
    const extracted: Map<string, LeadItem> = new Map()

    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}/g
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

    for (const line of lines) {
      // Find emails
      const emails = line.match(emailRegex) || []
      const phones = line.match(phoneRegex) || []

      // Check line sender e.g. "[20/09/26, 10:15:30] +91 98765 43210: hello"
      const senderMatch = line.match(/\]\s*([^:]+):/)
      let sender = senderMatch ? senderMatch[1].trim() : ''

      let senderPhone = ''
      if (/[\d+]{7,15}/.test(sender)) {
        senderPhone = cleanPhone(sender)
      }

      for (const email of emails) {
        const cleanEmail = email.toLowerCase().trim()
        if (!extracted.has(cleanEmail)) {
          const domain = cleanEmail.split('@')[1] || ''
          extracted.set(cleanEmail, {
            name: senderPhone ? '' : sender,
            email: cleanEmail,
            phone: senderPhone,
            whatsapp: senderPhone ? `https://wa.me/${senderPhone.replace('+', '')}` : '',
            designation: '',
            company: domain.split('.')[0].toUpperCase(),
            website: domain ? `https://${domain}` : '',
            city: '',
            accreditations: '',
            taxId: '',
            priority: 'normal',
            leadType: 'individual',
            status: 'new',
            source: 'whatsapp_chat',
            subjectSample: line.slice(0, 100),
          })
        }
      }

      if (senderPhone && !extracted.has(senderPhone)) {
        extracted.set(senderPhone, {
          name: '',
          email: '',
          phone: senderPhone,
          whatsapp: `https://wa.me/${senderPhone.replace('+', '')}`,
          designation: '',
          company: '',
          website: '',
          city: '',
          accreditations: '',
          taxId: '',
          priority: 'normal',
          leadType: 'whatsapp',
          status: 'new',
          source: 'whatsapp_chat',
          subjectSample: line.slice(0, 100),
        })
      }
    }

    setParsedLeads(Array.from(extracted.values()))
    setIsParsing(false)
  }

  // Parser 2: Google Contacts CSV
  const handleContactsFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsParsing(true)
    setSyncFeedback(null)

    const text = await file.text()
    const rows = text.split('\n').map((r) => r.split(','))
    const extracted: LeadItem[] = []

    // Look for columns: Name, Given Name, Family Name, Phone 1 - Value, E-mail 1 - Value
    const header = rows[0].map((h) => h.toLowerCase().trim().replace(/["']/g, ''))
    const nameIdx = header.findIndex((h) => h.includes('name'))
    const phoneIdx = header.findIndex((h) => h.includes('phone'))
    const emailIdx = header.findIndex((h) => h.includes('e-mail') || h.includes('email'))
    const orgIdx = header.findIndex((h) => h.includes('organization') || h.includes('company'))

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].map((c) => c.replace(/["']/g, '').trim())
      const name = nameIdx !== -1 ? cols[nameIdx] : ''
      const phone = phoneIdx !== -1 ? cols[phoneIdx] : ''
      const email = emailIdx !== -1 ? cols[emailIdx] : ''
      const company = orgIdx !== -1 ? cols[orgIdx] : ''

      if (name || phone || email) {
        const cleanedP = phone ? cleanPhone(phone) : ''
        extracted.push({
          name: name || 'Contact',
          email: email.toLowerCase(),
          phone: cleanedP,
          whatsapp: cleanedP ? `https://wa.me/${cleanedP.replace('+', '')}` : '',
          designation: '',
          company: company,
          website: email.includes('@') ? `https://${email.split('@')[1]}` : '',
          city: '',
          accreditations: '',
          taxId: '',
          priority: cleanedP ? 'high' : 'normal',
          leadType: 'individual',
          status: 'new',
          source: 'google_contacts',
        })
      }
    }

    setParsedLeads(extracted)
    setIsParsing(false)
  }

  // Parser 3: Raw Textarea Numbers Paste
  const handleRawTextParse = () => {
    if (!rawText.trim()) return
    setIsParsing(true)
    setSyncFeedback(null)

    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}/g
    const matches = rawText.match(phoneRegex) || []
    const seen = new Set<string>()
    const extracted: LeadItem[] = []

    for (const raw of matches) {
      const p = cleanPhone(raw)
      if (p.length >= 10 && !seen.has(p)) {
        seen.add(p)
        extracted.push({
          name: '',
          email: '',
          phone: p,
          whatsapp: `https://wa.me/${p.replace('+', '')}`,
          designation: '',
          company: '',
          website: '',
          city: '',
          accreditations: '',
          taxId: '',
          priority: 'high',
          leadType: 'whatsapp',
          status: 'new',
          source: 'whatsapp_group',
        })
      }
    }

    setParsedLeads(extracted)
    setIsParsing(false)
  }

  // Sync parsed leads to Sanity
  const handleSyncToSanity = async () => {
    if (parsedLeads.length === 0) return
    setIsSyncing(true)
    setSyncFeedback(null)

    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: parsedLeads }),
      })
      const data = await res.json()
      if (data.success) {
        setSyncFeedback(`✅ ${data.message}`)
        setParsedLeads([])
      } else {
        setSyncFeedback(`❌ Error: ${data.error}`)
      }
    } catch (e: any) {
      setSyncFeedback(`❌ Network error: ${e.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  // Export to Excel
  const handleExportExcel = (leadsToExport: LeadItem[]) => {
    if (leadsToExport.length === 0) return
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(leadsToExport)
    XLSX.utils.book_append_sheet(wb, ws, 'Marketing Leads')
    XLSX.writeFile(wb, `Marketing_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  // Update lead status in Directory
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      setDirectoryLeads((prev) =>
        prev.map((l) => (l._id === id ? { ...l, status: newStatus as any } : l))
      )
    } catch (e) {
      console.error(e)
    }
  }

  // Filtered Directory
  const filteredDirectory = directoryLeads.filter((l) => {
    const matchesSearch =
      !searchTerm ||
      `${l.name} ${l.company} ${l.email} ${l.phone} ${l.city}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === 'all' || l.priority === filterPriority
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus
    return matchesSearch && matchesPriority && matchesStatus
  })

  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#0F172A',
        color: '#F8FAFC',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #334155',
          paddingBottom: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.8rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span>🎯</span> Marketing Hub
          </h1>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.95rem' }}>
            Multi-source Lead Ingestion (WhatsApp, Gmail, Phonebook) & Outreach Engine
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: '#1E293B', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('ingest')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              background: activeTab === 'ingest' ? '#3B82F6' : 'transparent',
              color: '#FFFFFF',
              transition: 'all 0.2s',
            }}
          >
            📥 Import & Ingest
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              background: activeTab === 'directory' ? '#3B82F6' : 'transparent',
              color: '#FFFFFF',
              transition: 'all 0.2s',
            }}
          >
            👥 Leads Directory ({stats.total || directoryLeads.length})
          </button>
        </div>
      </div>

      {/* TAB 1: INGEST */}
      {activeTab === 'ingest' && (
        <div>
          {/* 3 Import Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            {/* Card 1: WhatsApp Chat */}
            <div
              style={{
                background: '#1E293B',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #334155',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💬</div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>WhatsApp Chat Export</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                Upload exported <code>_chat.txt</code> from any client or event group.
              </p>
              <input
                type="file"
                accept=".txt"
                onChange={handleChatFile}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: '#0F172A',
                  border: '1px solid #475569',
                  color: '#CBD5E1',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            {/* Card 2: Google Contacts */}
            <div
              style={{
                background: '#1E293B',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #334155',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📱</div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Google Contacts Export</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                Upload exported <code>contacts.csv</code> from contacts.google.com.
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleContactsFile}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: '#0F172A',
                  border: '1px solid #475569',
                  color: '#CBD5E1',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            {/* Card 3: WhatsApp Web Textarea */}
            <div
              style={{
                background: '#1E293B',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #334155',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Paste WhatsApp Web Group</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                Paste numbers copied from WhatsApp Web group inspect element.
              </p>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="+91 98765 43210, +91 98123 45678..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: '#0F172A',
                  border: '1px solid #475569',
                  color: '#CBD5E1',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                  marginBottom: '0.75rem',
                }}
              />
              <button
                onClick={handleRawTextParse}
                disabled={isParsing || !rawText.trim()}
                style={{
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.4rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                }}
              >
                Extract Numbers
              </button>
            </div>
          </div>

          {/* Sync Feedback Alert */}
          {syncFeedback && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                background: syncFeedback.startsWith('✅') ? '#064E3B' : '#7F1D1D',
                border: syncFeedback.startsWith('✅') ? '1px solid #059669' : '1px solid #DC2626',
                color: '#FFFFFF',
                marginBottom: '1.5rem',
                fontWeight: '600',
              }}
            >
              {syncFeedback}
            </div>
          )}

          {/* Parsed Leads Actions & Table */}
          {parsedLeads.length > 0 && (
            <div
              style={{
                background: '#1E293B',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #334155',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.3rem' }}>
                    Preview: {parsedLeads.length} Leads Extracted
                  </h2>
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>
                    Review below before syncing to your permanent Sanity database.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleExportExcel(parsedLeads)}
                    style={{
                      background: '#334155',
                      color: '#FFFFFF',
                      border: '1px solid #475569',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                    }}
                  >
                    📥 Download Excel
                  </button>
                  <button
                    onClick={handleSyncToSanity}
                    disabled={isSyncing}
                    style={{
                      background: '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.6rem 1.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    {isSyncing ? 'Syncing to Sanity...' : '🚀 Save & Sync to Sanity'}
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#0F172A', color: '#94A3B8', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem', borderRadius: '6px 0 0 6px' }}>Contact</th>
                      <th style={{ padding: '0.75rem' }}>Phone / Mobile</th>
                      <th style={{ padding: '0.75rem' }}>WhatsApp Action</th>
                      <th style={{ padding: '0.75rem' }}>Email / Domain</th>
                      <th style={{ padding: '0.75rem', borderRadius: '0 6px 6px 0' }}>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedLeads.slice(0, 50).map((l, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: '600' }}>{l.name || 'Unnamed Contact'}</div>
                          {l.designation && <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{l.designation}</div>}
                        </td>
                        <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{l.phone || '—'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          {l.whatsapp ? (
                            <a
                              href={l.whatsapp}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                background: '#059669',
                                color: '#FFFFFF',
                                textDecoration: 'none',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              <span>💬</span> Chat
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div>{l.email || '—'}</div>
                          {l.website && (
                            <a
                              href={l.website}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#60A5FA', fontSize: '0.8rem', textDecoration: 'none' }}
                            >
                              {l.website.replace('https://', '')}
                            </a>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#94A3B8' }}>{l.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MASTER DIRECTORY */}
      {activeTab === 'directory' && (
        <div>
          {/* Stats Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Total Verified Leads</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#FFFFFF' }}>{stats.total || directoryLeads.length}</div>
            </div>
            <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>🌟 High Priority</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#FBBF24' }}>{stats.highPriority || 0}</div>
            </div>
            <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>💬 Has WhatsApp</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#34D399' }}>{stats.withWhatsApp || 0}</div>
            </div>
            <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>🟡 Contacted</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#60A5FA' }}>{stats.contacted || 0}</div>
            </div>
          </div>

          {/* Filters & Actions Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#1E293B',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #334155',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search name, company, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: '#0F172A',
                  border: '1px solid #475569',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  minWidth: '260px',
                }}
              />

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                style={{
                  background: '#0F172A',
                  border: '1px solid #475569',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">All Priorities</option>
                <option value="high">🌟 High Priority</option>
                <option value="medium">⚡ Medium</option>
                <option value="normal">🔵 Normal</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  background: '#0F172A',
                  border: '1px solid #475569',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">All Statuses</option>
                <option value="new">🔵 New</option>
                <option value="contacted">🟡 Contacted</option>
                <option value="in_discussion">🟢 In Discussion</option>
                <option value="closed">🟣 Closed</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as any)}
                style={{
                  background: '#0F172A',
                  border: '1px solid #475569',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  color: '#CBD5E1',
                  fontSize: '0.85rem',
                }}
              >
                <option value="drone_corp">Template: Corporate Drone Show</option>
                <option value="drone_wedding">Template: Luxury Weddings</option>
              </select>

              <button
                onClick={() => handleExportExcel(filteredDirectory)}
                style={{
                  background: '#334155',
                  color: '#FFFFFF',
                  border: '1px solid #475569',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                }}
              >
                📥 Export CSV / Excel
              </button>
            </div>
          </div>

          {/* Directory Table */}
          {isLoadingDirectory ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>Loading leads directory...</div>
          ) : (
            <div style={{ background: '#1E293B', borderRadius: '12px', border: '1px solid #334155', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#0F172A', color: '#94A3B8', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Priority & Name</th>
                    <th style={{ padding: '0.75rem' }}>Company / City</th>
                    <th style={{ padding: '0.75rem' }}>Contact Info</th>
                    <th style={{ padding: '0.75rem' }}>1-Click WhatsApp</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDirectory.map((lead) => {
                    const waMsg = TEMPLATES[selectedTemplate](lead.name, lead.company)
                    const waUrl = lead.phone
                      ? `https://wa.me/${lead.phone.replace('+', '')}?text=${encodeURIComponent(waMsg)}`
                      : ''

                    return (
                      <tr key={lead._id || lead.email || lead.phone} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{lead.priority === 'high' ? '🌟' : lead.priority === 'medium' ? '⚡' : '🔵'}</span>
                            <span style={{ fontWeight: '600' }}>{lead.name || 'Unnamed Lead'}</span>
                          </div>
                          {lead.designation && (
                            <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginLeft: '1.5rem' }}>
                              {lead.designation}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: '500' }}>{lead.company || '—'}</div>
                          {lead.website && (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#60A5FA', fontSize: '0.8rem', textDecoration: 'none' }}
                            >
                              {lead.website.replace('https://', '')}
                            </a>
                          )}
                          {lead.city && <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}> • {lead.city}</span>}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          {lead.email && <div style={{ fontSize: '0.85rem' }}>{lead.email}</div>}
                          {lead.phone && <div style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{lead.phone}</div>}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          {lead.phone ? (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => {
                                if (lead._id && lead.status === 'new') {
                                  handleStatusUpdate(lead._id, 'contacted')
                                }
                              }}
                              style={{
                                background: '#059669',
                                color: '#FFFFFF',
                                textDecoration: 'none',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              <span>💬</span> WhatsApp
                            </a>
                          ) : (
                            <span style={{ color: '#64748B' }}>No phone</span>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          <select
                            value={lead.status || 'new'}
                            onChange={(e) => lead._id && handleStatusUpdate(lead._id, e.target.value)}
                            style={{
                              background: '#0F172A',
                              border: '1px solid #475569',
                              padding: '0.35rem',
                              borderRadius: '4px',
                              color: '#FFFFFF',
                              fontSize: '0.8rem',
                            }}
                          >
                            <option value="new">🔵 New</option>
                            <option value="contacted">🟡 Contacted</option>
                            <option value="in_discussion">🟢 In Discussion</option>
                            <option value="closed">🟣 Closed</option>
                            <option value="opt_out">🔴 Opt-Out</option>
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
