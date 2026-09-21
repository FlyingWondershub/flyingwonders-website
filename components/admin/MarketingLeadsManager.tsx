'use client'

import React, { useState, useEffect } from 'react'
import {
  Users, Search, Plus, Phone, Mail, MessageCircle, Building2, MapPin,
  Sparkles, RefreshCw, X, Check, Award, ExternalLink, Filter, CheckCircle2,
  Calendar, ArrowUpDown
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
  }, [priorityFilter, statusFilter])

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchLeads}
            disabled={refreshing}
            style={{ padding: '8px 12px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
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
                <th style={{ padding: '10px 12px' }}>Contact & Role</th>
                <th style={{ padding: '10px 12px' }}>Company & Location</th>
                <th style={{ padding: '10px 12px' }}>Priority</th>
                <th style={{ padding: '10px 12px' }}>Quick Outreach</th>
                <th style={{ padding: '10px 12px' }}>Pipeline Status</th>
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

                return (
                  <tr key={l._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
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

    </div>
  )
}
