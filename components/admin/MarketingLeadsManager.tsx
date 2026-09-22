'use client'

import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import {
  Users, Search, Plus, Phone, Mail, MessageCircle, Building2, MapPin,
  Sparkles, RefreshCw, X, Check, Award, ExternalLink, Filter, CheckCircle2,
  Calendar, ArrowUpDown, UserPlus, Trash2, Upload, Download, FileText
} from 'lucide-react'

interface MarketingLead {
  _id: string
  name?: string
  email?: string
  phone?: string
  whatsapp?: string
  designation?: string
  company?: string
  website?: string
  city?: string
  priority?: 'high' | 'medium' | 'normal'
  status?: 'new' | 'contacted' | 'in_discussion' | 'closed' | 'opt_out'
  accreditations?: string
  internalNotes?: string
  _createdAt?: string
}

export default function MarketingLeadsManager() {
  const [leads, setLeads] = useState<MarketingLead[]>([])
  const [stats, setStats] = useState({ total: 0, highPriority: 0, withWhatsApp: 0, contacted: 0, inDiscussion: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Multi-selection & Deletion State
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set())
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Add Lead Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  // Form Fields
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newDesignation, setNewDesignation] = useState('')
  const [newWebsite, setNewWebsite] = useState('')
  const [newCity, setNewCity] = useState('')
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'normal'>('normal')
  const [newAccreditations, setNewAccreditations] = useState('')
  const [newNotes, setNewNotes] = useState('')

  // Newsletter Subscription State
  const [subscribedEmails, setSubscribedEmails] = useState<Set<string>>(new Set())
  const [subscribingEmail, setSubscribingEmail] = useState<string | null>(null)
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  // Import Leads State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importTab, setImportTab] = useState<'csv' | 'chat' | 'text'>('csv')
  const [importText, setImportText] = useState('')
  const [parsedImportLeads, setParsedImportLeads] = useState<any[]>([])
  const [isParsingImport, setIsParsingImport] = useState(false)
  const [isSyncingImport, setIsSyncingImport] = useState(false)
  const [importSyncFeedback, setImportSyncFeedback] = useState<string | null>(null)

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/newsletter/subscribe')
      const data = await res.json()
      if (data.success && Array.isArray(data.subscribers)) {
        setSubscribedEmails(new Set(data.subscribers.map((e: string) => e.toLowerCase().trim())))
      }
    } catch (e) {
      console.error('Failed to fetch subscribers:', e)
    }
  }

  const fetchLeads = async () => {
    setRefreshing(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', '500')
      if (priorityFilter !== 'all') params.set('priority', priorityFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/leads?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setLeads(data.leads || [])
        if (data.stats) setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLeads()
    fetchSubscribers()
  }, [priorityFilter, statusFilter])

  const handleSubscribeLead = async (lead: MarketingLead) => {
    if (!lead.email || !lead.email.includes('@')) {
      alert('This lead does not have a valid email address.')
      return
    }

    const cleanEmail = lead.email.trim().toLowerCase()
    setSubscribingEmail(cleanEmail)
    setActionNotice(null)

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: lead.name || undefined,
          company: lead.company || undefined,
          audienceType: 'b2b',
          source: 'b2b_leads_directory',
          skipWelcomeEmail: true
        })
      })

      const data = await res.json()
      if (data.success) {
        setSubscribedEmails(prev => new Set(prev).add(cleanEmail))
        setActionNotice(`✅ Added "${lead.name || cleanEmail}" to Newsletter Subscribers!`)
        setTimeout(() => setActionNotice(null), 6000)
      } else {
        throw new Error(data.error || 'Failed to subscribe lead')
      }
    } catch (err: any) {
      alert(`Subscription failed: ${err.message}`)
    } finally {
      setSubscribingEmail(null)
    }
  }

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail && !newPhone && !newCompany) {
      alert('Please provide at least an Email, Phone, or Company name.')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const cleanPhone = newPhone.replace(/[^\d+]/g, '')
      const cleanWa = cleanPhone ? `https://wa.me/${cleanPhone.replace(/^\+/, '')}` : ''

      const leadPayload = {
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        phone: cleanPhone,
        whatsapp: cleanWa,
        company: newCompany.trim(),
        designation: newDesignation.trim(),
        website: newWebsite.trim(),
        city: newCity.trim(),
        priority: newPriority,
        accreditations: newAccreditations.trim(),
        internalNotes: newNotes.trim(),
        source: 'manual',
        status: 'new'
      }

      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: [leadPayload] })
      })

      const data = await res.json()
      if (data.success) {
        setSubmitMessage('Lead added successfully!')
        await fetchLeads()
        setTimeout(() => {
          setIsAddModalOpen(false)
          setSubmitMessage(null)
          // Reset fields
          setNewName('')
          setNewEmail('')
          setNewPhone('')
          setNewCompany('')
          setNewDesignation('')
          setNewWebsite('')
          setNewCity('')
          setNewAccreditations('')
          setNewNotes('')
        }, 800)
      } else {
        throw new Error(data.error || 'Failed to add lead')
      }
    } catch (err: any) {
      setSubmitMessage(`Error: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        setLeads(prev => prev.map(l => l._id === id ? { ...l, status: newStatus as any } : l))
      }
    } catch (err) {
      console.error('Failed to update lead status:', err)
    }
  }

  const filteredLeads = leads.filter(l => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.company && l.company.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.phone && l.phone.includes(q)) ||
      (l.city && l.city.toLowerCase().includes(q)) ||
      (l.designation && l.designation.toLowerCase().includes(q))
    )
  })

  // Selection Handlers
  const toggleSelectAll = () => {
    if (filteredLeads.length === 0) return
    const allFilteredSelected = filteredLeads.every(l => selectedLeadIds.has(l._id))
    if (allFilteredSelected) {
      setSelectedLeadIds(new Set())
    } else {
      setSelectedLeadIds(new Set(filteredLeads.map(l => l._id)))
    }
  }

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Delete Individual Lead
  const handleDeleteLead = async (lead: MarketingLead) => {
    const leadLabel = lead.name || lead.company || lead.email || 'this lead'
    if (!window.confirm(`Are you sure you want to delete "${leadLabel}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(lead._id)
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead._id })
      })
      const data = await res.json()
      if (data.success) {
        setLeads(prev => prev.filter(l => l._id !== lead._id))
        setSelectedLeadIds(prev => {
          const next = new Set(prev)
          next.delete(lead._id)
          return next
        })
        setStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }))
        setActionNotice(`🗑️ Lead "${leadLabel}" deleted successfully.`)
        setTimeout(() => setActionNotice(null), 5000)
      } else {
        throw new Error(data.error || 'Failed to delete lead')
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  // Delete Multiple Selected Leads
  const handleDeleteSelected = async () => {
    if (selectedLeadIds.size === 0) return
    const count = selectedLeadIds.size

    if (!window.confirm(`Are you sure you want to permanently delete ${count} selected lead${count === 1 ? '' : 's'}? This action cannot be undone.`)) {
      return
    }

    setIsDeletingBulk(true)
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedLeadIds) })
      })
      const data = await res.json()
      if (data.success) {
        setLeads(prev => prev.filter(l => !selectedLeadIds.has(l._id)))
        setSelectedLeadIds(new Set())
        setStats(prev => ({ ...prev, total: Math.max(0, prev.total - count) }))
        setActionNotice(`🗑️ Successfully deleted ${count} leads.`)
        setTimeout(() => setActionNotice(null), 5000)
      } else {
        throw new Error(data.error || 'Failed to delete leads')
      }
    } catch (err: any) {
      alert(`Bulk delete failed: ${err.message}`)
    } finally {
      setIsDeletingBulk(false)
    }
  }

  // Phone Sanitization
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

  // 1. CSV / Excel File Importer
  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsParsingImport(true)
    setImportSyncFeedback(null)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })

      const extracted: any[] = []
      for (const row of rows) {
        const findVal = (keys: string[]) => {
          for (const k of Object.keys(row)) {
            const lk = k.toLowerCase().trim()
            if (keys.some(key => lk === key || lk.includes(key))) {
              return String(row[k] || '').trim()
            }
          }
          return ''
        }

        const name = findVal(['name', 'contact', 'full name', 'lead name'])
        const email = findVal(['email', 'e-mail', 'mail'])
        const phone = findVal(['phone', 'mobile', 'cell', 'whatsapp', 'tel', 'contact number'])
        const company = findVal(['company', 'organization', 'agency', 'business', 'corp'])
        const designation = findVal(['designation', 'role', 'title', 'position'])
        const city = findVal(['city', 'location', 'state', 'country'])
        const accreditations = findVal(['accreditation', 'tags', 'source', 'notes'])

        if (email || phone || name || company) {
          const cleanedP = phone ? cleanPhone(phone) : ''
          extracted.push({
            name: name || 'Contact',
            email: email.toLowerCase(),
            phone: cleanedP,
            whatsapp: cleanedP ? `https://wa.me/${cleanedP.replace('+', '')}` : '',
            company: company,
            designation: designation,
            city: city,
            accreditations: accreditations,
            priority: cleanedP ? 'high' : 'normal',
            leadType: 'individual',
            status: 'new',
            source: 'csv_import',
          })
        }
      }

      setParsedImportLeads(extracted)
    } catch (err: any) {
      alert(`Failed to parse spreadsheet: ${err.message}`)
    } finally {
      setIsParsingImport(false)
    }
  }

  // 2. WhatsApp Chat .txt Parser
  const handleChatFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsParsingImport(true)
    setImportSyncFeedback(null)

    try {
      const text = await file.text()
      const lines = text.split('\n')
      const extracted: Map<string, any> = new Map()

      const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}/g
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

      for (const line of lines) {
        const emails = line.match(emailRegex) || []
        const senderMatch = line.match(/\]\s*([^:]+):/)
        const sender = senderMatch ? senderMatch[1].trim() : ''

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
              company: domain.split('.')[0].toUpperCase(),
              designation: '',
              city: '',
              accreditations: '',
              priority: 'normal',
              leadType: 'individual',
              status: 'new',
              source: 'whatsapp_chat',
            })
          }
        }

        if (senderPhone && !extracted.has(senderPhone)) {
          extracted.set(senderPhone, {
            name: '',
            email: '',
            phone: senderPhone,
            whatsapp: `https://wa.me/${senderPhone.replace('+', '')}`,
            company: '',
            designation: '',
            city: '',
            accreditations: '',
            priority: 'normal',
            leadType: 'whatsapp',
            status: 'new',
            source: 'whatsapp_chat',
          })
        }
      }

      setParsedImportLeads(Array.from(extracted.values()))
    } catch (err: any) {
      alert(`Chat parse error: ${err.message}`)
    } finally {
      setIsParsingImport(false)
    }
  }

  // 3. Raw Text Paste Parser
  const handleRawTextParse = () => {
    if (!importText.trim()) return
    setIsParsingImport(true)
    setImportSyncFeedback(null)

    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}/g
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

    const emails = importText.match(emailRegex) || []
    const phones = importText.match(phoneRegex) || []

    const extracted: any[] = []
    const seen = new Set<string>()

    for (const em of emails) {
      const c = em.toLowerCase().trim()
      if (!seen.has(c)) {
        seen.add(c)
        extracted.push({
          name: '',
          email: c,
          phone: '',
          whatsapp: '',
          company: (c.split('@')[1] || '').split('.')[0].toUpperCase(),
          designation: '',
          city: '',
          accreditations: '',
          priority: 'normal',
          leadType: 'individual',
          status: 'new',
          source: 'manual_text_paste',
        })
      }
    }

    for (const ph of phones) {
      const p = cleanPhone(ph)
      if (p.length >= 10 && !seen.has(p)) {
        seen.add(p)
        extracted.push({
          name: '',
          email: '',
          phone: p,
          whatsapp: `https://wa.me/${p.replace('+', '')}`,
          company: '',
          designation: '',
          city: '',
          accreditations: '',
          priority: 'high',
          leadType: 'whatsapp',
          status: 'new',
          source: 'manual_text_paste',
        })
      }
    }

    setParsedImportLeads(extracted)
    setIsParsingImport(false)
  }

  // Sync Parsed Leads to Sanity
  const handleSyncImportToSanity = async () => {
    if (parsedImportLeads.length === 0) return
    setIsSyncingImport(true)
    setImportSyncFeedback(null)

    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: parsedImportLeads }),
      })
      const data = await res.json()
      if (data.success) {
        setImportSyncFeedback(`✅ ${data.message}`)
        await fetchLeads()
        setTimeout(() => {
          setIsImportModalOpen(false)
          setParsedImportLeads([])
          setImportSyncFeedback(null)
          setImportText('')
        }, 1200)
      } else {
        throw new Error(data.error || 'Failed to sync leads')
      }
    } catch (err: any) {
      setImportSyncFeedback(`❌ Error: ${err.message}`)
    } finally {
      setIsSyncingImport(false)
    }
  }

  // Export Leads to Excel
  const handleExportExcel = () => {
    const listToExport = filteredLeads.length > 0 ? filteredLeads : leads
    if (listToExport.length === 0) {
      alert('No leads available to export.')
      return
    }
    const exportRows = listToExport.map(l => ({
      'Name': l.name || '',
      'Email': l.email || '',
      'Phone': l.phone || '',
      'WhatsApp': l.whatsapp || '',
      'Company': l.company || '',
      'Designation': l.designation || '',
      'City': l.city || '',
      'Priority': l.priority || 'normal',
      'Status': l.status || 'new',
      'Accreditations': l.accreditations || '',
      'Notes': l.internalNotes || '',
      'Created Date': l._createdAt ? new Date(l._createdAt).toLocaleDateString() : ''
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportRows)
    XLSX.utils.book_append_sheet(wb, ws, 'Leads Directory')
    XLSX.writeFile(wb, `FlyingWonders_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
      {/* Header & Stats Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#065F46' }}>
            <Users size={22} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.4rem', color: '#1A202C', margin: 0, fontWeight: 800 }}>
              Marketing & B2B Leads Directory
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#718096', margin: '2px 0 0 0' }}>
              Database of verified corporate accounts, event planners, agency decision-makers, and DMC contacts.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchLeads}
            disabled={refreshing}
            style={{ padding: '8px 12px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={handleExportExcel}
            style={{ padding: '8px 12px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}
            title="Download leads spreadsheet (.xlsx)"
          >
            <Download size={14} color="#0F4C3A" />
            Export (.xlsx)
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            style={{ padding: '8px 14px', background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}
            title="Import leads from CSV, WhatsApp chat or raw text"
          >
            <Upload size={14} />
            📥 Import Leads
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{ padding: '8px 16px', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <Plus size={15} />
            + Add Lead Manually
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', color: '#065F46', fontWeight: 700, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#059669" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total Database Leads</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>{stats.total || leads.length}</div>
        </div>
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.74rem', color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>🌟 High Priority Leads</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#92400E', marginTop: '2px' }}>{stats.highPriority}</div>
        </div>
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.74rem', color: '#065F46', fontWeight: 700, textTransform: 'uppercase' }}>💬 Direct WhatsApp Ready</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#065F46', marginTop: '2px' }}>{stats.withWhatsApp}</div>
        </div>
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.74rem', color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase' }}>🤝 In Discussion Pipeline</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E40AF', marginTop: '2px' }}>{stats.inDiscussion}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 12px' }}>
          <Search size={15} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by name, company, email, city, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.84rem', color: '#0F172A', background: 'transparent' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.82rem', background: '#FFF', color: '#334155', fontWeight: 600 }}
        >
          <option value="all">All Priorities</option>
          <option value="high">🌟 High Priority</option>
          <option value="medium">⚡ Medium Priority</option>
          <option value="normal">🔵 Normal Priority</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.82rem', background: '#FFF', color: '#334155', fontWeight: 600 }}
        >
          <option value="all">All Pipeline Stages</option>
          <option value="new">🔵 New / Uncontacted</option>
          <option value="contacted">🟡 Contacted</option>
          <option value="in_discussion">🟢 In Discussion</option>
          <option value="closed">🟣 Closed / Booked</option>
        </select>

        <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: 'auto' }}>
          Showing <strong>{filteredLeads.length}</strong> leads
        </span>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedLeadIds.size > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '10px',
          padding: '10px 16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.86rem' }}>
              {selectedLeadIds.size} lead{selectedLeadIds.size === 1 ? '' : 's'} selected
            </span>
            <span style={{ color: '#DC2626', fontSize: '0.78rem' }}>
              (Click delete to remove them in a single batch)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setSelectedLeadIds(new Set())}
              style={{
                padding: '5px 12px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Deselect All
            </button>
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={isDeletingBulk}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 14px',
                background: '#DC2626',
                border: '1px solid #B91C1C',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 800,
                color: '#FFFFFF',
                cursor: isDeletingBulk ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
              }}
              title="Delete all selected entries"
            >
              <Trash2 size={13} className={isDeletingBulk ? 'animate-spin' : ''} />
              {isDeletingBulk ? 'Deleting...' : `Delete Selected (${selectedLeadIds.size})`}
            </button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>Loading leads directory...</div>
      ) : filteredLeads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
          <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>No leads matching your current search or filters.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                <th style={{ width: '38px', padding: '10px 8px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.has(l._id))}
                    onChange={toggleSelectAll}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#800020' }}
                    title={filteredLeads.every(l => selectedLeadIds.has(l._id)) ? 'Deselect all' : 'Select all'}
                  />
                </th>
                <th style={{ padding: '10px 12px' }}>Contact & Role</th>
                <th style={{ padding: '10px 12px' }}>Company & Location</th>
                <th style={{ padding: '10px 12px' }}>Priority</th>
                <th style={{ padding: '10px 12px' }}>Quick Outreach</th>
                <th style={{ padding: '10px 12px' }}>Pipeline Status</th>
                <th style={{ width: '48px', padding: '10px 8px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.slice(0, 100).map((l) => {
                const priorityBadge =
                  l.priority === 'high' ? { label: 'High', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' } :
                  l.priority === 'medium' ? { label: 'Medium', bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' } :
                  { label: 'Normal', bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' }

                const cleanPhone = l.phone ? l.phone.replace(/[^\d+]/g, '') : ''
                const waUrl = l.whatsapp || (cleanPhone ? `https://wa.me/${cleanPhone.replace(/^\+/, '')}` : null)
                const isSelected = selectedLeadIds.has(l._id)

                return (
                  <tr key={l._id} style={{ borderBottom: '1px solid #F1F5F9', background: isSelected ? '#FEF2F2' : 'transparent', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectLead(l._id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#800020' }}
                        title="Select lead"
                      />
                    </td>

                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem' }}>
                        {l.name || 'Unnamed Lead'}
                      </div>
                      {l.designation && l.designation !== 'N/A' && (
                        <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '1px' }}>
                          {l.designation}
                        </div>
                      )}
                      {l.email && (
                        <div style={{ fontSize: '0.74rem', color: '#800020', marginTop: '2px', wordBreak: 'break-all' }}>
                          <a href={`mailto:${l.email}`} style={{ color: '#800020', textDecoration: 'none' }}>
                            {l.email}
                          </a>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: '#1E293B' }}>
                        {l.company || 'Direct Contact'}
                      </div>
                      {l.city && l.city !== 'N/A' && (
                        <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          <MapPin size={11} color="#94A3B8" />
                          {l.city}
                        </div>
                      )}
                      {l.accreditations && (
                        <div style={{ fontSize: '0.68rem', background: '#F8FAFC', padding: '1px 5px', borderRadius: '4px', display: 'inline-block', border: '1px solid #E2E8F0', marginTop: '3px', color: '#475569' }}>
                          {l.accreditations}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: priorityBadge.bg,
                        color: priorityBadge.color,
                        border: `1px solid ${priorityBadge.border}`
                      }}>
                        {l.priority === 'high' ? '🌟 ' : l.priority === 'medium' ? '⚡ ' : ''}
                        {priorityBadge.label}
                      </span>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#DCFCE7', color: '#15803D', borderRadius: '5px', textDecoration: 'none', fontWeight: 700, fontSize: '0.72rem', border: '1px solid #BBF7D0' }}
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={12} />
                            WhatsApp
                          </a>
                        )}

                        {l.email && (
                          <a
                            href={`mailto:${l.email}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#F1F5F9', color: '#334155', borderRadius: '5px', textDecoration: 'none', fontWeight: 700, fontSize: '0.72rem', border: '1px solid #CBD5E1' }}
                            title="Send Email"
                          >
                            <Mail size={12} />
                            Email
                          </a>
                        )}

                        {l.email && (
                          subscribedEmails.has(l.email.trim().toLowerCase()) ? (
                            <span
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '4px 8px', background: '#ECFDF5', color: '#065F46', borderRadius: '5px', fontWeight: 700, fontSize: '0.72rem', border: '1px solid #A7F3D0' }}
                              title="Active subscriber in newsletter campaigns list"
                            >
                              <CheckCircle2 size={12} />
                              Subscribed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSubscribeLead(l)}
                              disabled={subscribingEmail === l.email.trim().toLowerCase()}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                background: '#FEF2F2',
                                color: '#800020',
                                borderRadius: '5px',
                                border: '1px solid #FECACA',
                                cursor: subscribingEmail === l.email.trim().toLowerCase() ? 'not-allowed' : 'pointer',
                                fontWeight: 700,
                                fontSize: '0.72rem'
                              }}
                              title="Add this contact to Newsletter Subscribers list"
                            >
                              <UserPlus size={12} className={subscribingEmail === l.email.trim().toLowerCase() ? 'animate-spin' : ''} />
                              {subscribingEmail === l.email.trim().toLowerCase() ? 'Adding...' : '+ Subscribe'}
                            </button>
                          )
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <select
                        value={l.status || 'new'}
                        onChange={(e) => handleUpdateStatus(l._id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #CBD5E1', background: '#FFF', color: '#0F172A' }}
                      >
                        <option value="new">🔵 New / Uncontacted</option>
                        <option value="contacted">🟡 Contacted</option>
                        <option value="in_discussion">🟢 In Discussion</option>
                        <option value="closed">🟣 Closed / Deal</option>
                        <option value="opt_out">🔴 Opt-Out</option>
                      </select>
                    </td>

                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteLead(l)}
                        disabled={deletingId === l._id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: '#FEE2E2',
                          color: '#DC2626',
                          border: '1px solid #FECACA',
                          cursor: deletingId === l._id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        title="Delete this lead"
                      >
                        <Trash2 size={13} className={deletingId === l._id ? 'animate-spin' : ''} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ADD LEAD MANUALLY MODAL ── */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', maxWidth: '650px', width: '100%', maxHeight: '92vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Add Lead Entry Manually
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0' }}>
                  Add a new B2B travel partner, corporate buyer, or decision maker into the directory.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {submitMessage && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', background: submitMessage.startsWith('Error') ? '#FEF2F2' : '#ECFDF5', color: submitMessage.startsWith('Error') ? '#991B1B' : '#065F46', fontSize: '0.84rem', fontWeight: 600 }}>
                  {submitMessage}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                    Contact Name:
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                    Job Title / Role:
                  </label>
                  <input
                    type="text"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    placeholder="e.g. Managing Director / Event Head"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                    Email Address:
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="rajesh@agency.com"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                    Phone / WhatsApp Number:
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                    Company / Organization:
                  </label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Apex Travel & MICE Pvt Ltd"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                    City / Country:
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Mumbai, India / Singapore"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                    Priority Rating:
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.84rem', background: '#FFF' }}
                  >
                    <option value="high">🌟 High Priority (VIP / Decision Maker)</option>
                    <option value="medium">⚡ Medium Priority</option>
                    <option value="normal">🔵 Normal Priority</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                    Certifications / Accreditations:
                  </label>
                  <input
                    type="text"
                    value={newAccreditations}
                    onChange={(e) => setNewAccreditations(e.target.value)}
                    placeholder="e.g. EEMA, IAAPA, ISO 9001"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                  Internal Notes / Background:
                </label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Met at SATTE expo / Interested in Singapore F1 group packages..."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '8px 20px', background: '#0F4C3A', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.84rem', color: '#FFF', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── IMPORT LEADS MODAL ── */}
      {isImportModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', maxWidth: '750px', width: '100%', maxHeight: '92vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  📥 Import Leads to Directory
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0' }}>
                  Auto-extract contacts from CSV/Excel sheets, exported WhatsApp chats, or pasted text.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false)
                  setParsedImportLeads([])
                  setImportSyncFeedback(null)
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              
              {/* Tab Selector */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setImportTab('csv')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: importTab === 'csv' ? '#0F4C3A' : '#F1F5F9',
                    color: importTab === 'csv' ? '#FFF' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  📁 CSV / Excel Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setImportTab('chat')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: importTab === 'chat' ? '#0F4C3A' : '#F1F5F9',
                    color: importTab === 'chat' ? '#FFF' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  💬 WhatsApp Chat (.txt)
                </button>
                <button
                  type="button"
                  onClick={() => setImportTab('text')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: importTab === 'text' ? '#0F4C3A' : '#F1F5F9',
                    color: importTab === 'text' ? '#FFF' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  📋 Paste Text / Numbers
                </button>
              </div>

              {/* Tab 1: CSV / Excel */}
              {importTab === 'csv' && (
                <div style={{ background: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                  <FileText size={36} color="#0F4C3A" style={{ margin: '0 auto 10px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#1E293B', fontWeight: 700 }}>
                    Upload CSV or Excel Spreadsheet (.xlsx, .xls, .csv)
                  </h4>
                  <p style={{ margin: '0 0 16px', fontSize: '0.78rem', color: '#64748B' }}>
                    Auto-maps columns: Name, Email, Phone, Company, Designation, City, and Accreditations.
                  </p>
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleCsvImport}
                    style={{ fontSize: '0.82rem', cursor: 'pointer' }}
                  />
                </div>
              )}

              {/* Tab 2: WhatsApp Chat */}
              {importTab === 'chat' && (
                <div style={{ background: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                  <MessageCircle size={36} color="#15803D" style={{ margin: '0 auto 10px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#1E293B', fontWeight: 700 }}>
                    Upload Exported WhatsApp Chat (.txt)
                  </h4>
                  <p style={{ margin: '0 0 16px', fontSize: '0.78rem', color: '#64748B' }}>
                    Export a chat or group without media from WhatsApp, and upload the .txt file to automatically extract participant numbers and emails.
                  </p>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleChatFile}
                    style={{ fontSize: '0.82rem', cursor: 'pointer' }}
                  />
                </div>
              )}

              {/* Tab 3: Raw Text Paste */}
              {importTab === 'text' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                    Paste Raw Text, Phone Numbers, or Email Dumps:
                  </label>
                  <textarea
                    rows={5}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste email signatures, raw numbers like +91 9876543210, +65 91234567, contact@agency.com..."
                    style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '10px' }}
                  />
                  <button
                    type="button"
                    onClick={handleRawTextParse}
                    disabled={!importText.trim() || isParsingImport}
                    style={{ padding: '8px 16px', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Extract Contacts
                  </button>
                </div>
              )}

              {/* Feedback Message */}
              {importSyncFeedback && (
                <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', background: importSyncFeedback.startsWith('✅') ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${importSyncFeedback.startsWith('✅') ? '#A7F3D0' : '#FECACA'}`, color: importSyncFeedback.startsWith('✅') ? '#065F46' : '#991B1B', fontWeight: 700, fontSize: '0.82rem' }}>
                  {importSyncFeedback}
                </div>
              )}

              {/* Extracted Preview */}
              {parsedImportLeads.length > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                      Ready to Ingest: <span style={{ color: '#059669' }}>{parsedImportLeads.length} leads extracted</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setParsedImportLeads([])}
                      style={{ fontSize: '0.74rem', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Clear Parsed
                    </button>
                  </div>

                  <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                          <th style={{ padding: '6px 10px' }}>Contact</th>
                          <th style={{ padding: '6px 10px' }}>Company</th>
                          <th style={{ padding: '6px 10px' }}>Email</th>
                          <th style={{ padding: '6px 10px' }}>Phone</th>
                          <th style={{ padding: '6px 10px' }}>Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedImportLeads.slice(0, 8).map((p, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '6px 10px', fontWeight: 700 }}>{p.name || '—'}</td>
                            <td style={{ padding: '6px 10px' }}>{p.company || '—'}</td>
                            <td style={{ padding: '6px 10px', color: '#800020' }}>{p.email || '—'}</td>
                            <td style={{ padding: '6px 10px' }}>{p.phone || '—'}</td>
                            <td style={{ padding: '6px 10px', color: '#64748B' }}>{p.source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={handleSyncImportToSanity}
                    disabled={isSyncingImport}
                    style={{ width: '100%', padding: '10px 16px', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.88rem', cursor: isSyncingImport ? 'not-allowed' : 'pointer' }}
                  >
                    {isSyncingImport ? 'Syncing to Sanity...' : `🚀 Sync ${parsedImportLeads.length} Leads to Sanity Directory`}
                  </button>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', background: '#F8FAFC' }}>
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false)
                  setParsedImportLeads([])
                  setImportSyncFeedback(null)
                }}
                style={{ padding: '7px 16px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
