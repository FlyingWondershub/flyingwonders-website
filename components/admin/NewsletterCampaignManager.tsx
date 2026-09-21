'use client'

import React, { useState, useEffect } from 'react'
import {
  Mail, Plus, Edit3, Send, Trash2, Eye, RefreshCw, CheckCircle,
  AlertCircle, Sparkles, X, ChevronRight, Users, Clock, CheckCheck, FileText
} from 'lucide-react'

interface Campaign {
  _id: string
  title: string
  subject: string
  content: string
  status: 'draft' | 'sent'
  sentAt?: string
  sentToCount?: number
  _createdAt?: string
}

const TEMPLATE_PRESETS = [
  {
    name: '🇸🇬 Singapore Insider Travel Guide (B2C)',
    subject: '🌟 Singapore Unveiled: Top Hidden Gems & Seasonal Itineraries',
    content: `<h3>Dear Traveler,</h3>
<p>Singapore is brimming with fresh wonders this season! Whether you are seeking world-class entertainment, culinary delights, or lush tropical gardens, here are our hand-picked insider recommendations for your upcoming visit:</p>

<h4>1. Marina Bay & Gardens by the Bay</h4>
<p>Experience the illuminated Supertree Grove and the breathtaking indoor waterfall at Cloud Forest. Evening light shows start daily at 7:45 PM and 8:45 PM.</p>

<h4>2. Sentosa Island Pass Highlights</h4>
<p>Universal Studios Singapore, S.E.A. Aquarium, and Cable Car Sky Dining passes are now available at exclusive bundled DMC rates.</p>

<p>Ready to tailor your Singapore journey?</p>
<p style="text-align: center; margin: 25px 0;">
  <a href="https://flyingwonders.net/custom-package" style="background-color: #800020; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Customize Your Singapore Trip →</a>
</p>
<p>Warm regards,<br /><strong>Flying Wonders Team</strong></p>`
  },
  {
    name: '🤝 B2B Partner Bulletin & Net Tariffs (B2B)',
    subject: '📄 Flying Wonders Singapore DMC: 2026 Wholesale Tariff Sheet & Partner Portal',
    content: `<h3>Dear Travel Partner,</h3>
<p>We are delighted to share our updated Singapore Destination Management Company (DMC) wholesale tariffs and ground support services for 2026.</p>

<h4>Key B2B Capabilities:</h4>
<ul>
  <li><strong>Instant Package Estimator:</strong> Build and price multi-day Singapore & Malaysia itineraries in real-time with your agency branding.</li>
  <li><strong>Wholesale Attraction Passes:</strong> Direct API issuing for USS, Sentosa, Wildlife Parks, and Night Safari.</li>
  <li><strong>Private Fleet & Coaches:</strong> 7-seater VIP MPVs to 45-seater luxury coaches with certified English/Hindi speaking guides.</li>
</ul>

<p style="text-align: center; margin: 25px 0;">
  <a href="https://flyingwonders.net/agent-portal" style="background-color: #800020; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Access B2B Partner Portal →</a>
</p>
<p>Need custom MICE or wedding group quotes? Reply directly to this email or reach us on WhatsApp.</p>
<p>Best regards,<br /><strong>Flying Wonders Private Limited</strong><br />Singapore & India Specialist DMC</p>`
  },
  {
    name: '⚡ Flash Attraction Deals & Vouchers',
    subject: '🎟️ Flash Promo: Universal Studios + Marina Bay Attraction Bundles',
    content: `<h3>Exclusive Singapore Attraction Pass Drop</h3>
<p>Planning your trip to the Lion City? Take advantage of our limited-time attraction bundle passes with instant digital vouchers:</p>

<ul>
  <li><strong>Universal Studios Singapore + Express Pass:</strong> Skip the queues at Battlestar Galactica and Transformers.</li>
  <li><strong>Sentosa Mega Combo:</strong> Cable Car Round-trip + SkyHelix + S.E.A. Aquarium.</li>
  <li><strong>Mandai Rainforest & Wildlife Parks:</strong> Singapore Zoo, Night Safari, and River Wonders.</li>
</ul>

<p style="text-align: center; margin: 25px 0;">
  <a href="https://flyingwonders.net/singapore-attractions" style="background-color: #800020; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View All Attraction Passes →</a>
</p>
<p>Safe travels,<br /><strong>Flying Wonders Singapore</strong></p>`
  }
]

export default function NewsletterCampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [subscriberCount, setSubscriberCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [formContent, setFormContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Preview Modal State
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null)

  // Test Send State
  const [testEmail, setTestEmail] = useState('info.flyingwonders@gmail.com')
  const [sendingTestId, setSendingTestId] = useState<string | null>(null)
  const [testSendResult, setTestSendResult] = useState<string | null>(null)

  // Dispatch Campaign State
  const [dispatchingId, setDispatchingId] = useState<string | null>(null)
  const [dispatchResult, setDispatchResult] = useState<string | null>(null)

  const fetchCampaigns = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/newsletter/campaigns?adminEmail=info.flyingwonders@gmail.com')
      const data = await res.json()
      if (data.success) {
        setCampaigns(data.campaigns || [])
        setSubscriberCount(data.subscriberCount || 0)
      }
    } catch (err) {
      console.error('Failed to fetch campaigns:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleOpenNew = () => {
    setEditingCampaignId(null)
    setFormTitle('')
    setFormSubject('')
    setFormContent(TEMPLATE_PRESETS[0].content)
    setSaveMessage(null)
    setIsEditorOpen(true)
  }

  const handleOpenEdit = (c: Campaign) => {
    setEditingCampaignId(c._id)
    setFormTitle(c.title)
    setFormSubject(c.subject)
    setFormContent(c.content)
    setSaveMessage(null)
    setIsEditorOpen(true)
  }

  const handleApplyPreset = (preset: typeof TEMPLATE_PRESETS[0]) => {
    if (confirm(`Apply the "${preset.name}" preset? This will replace the current subject and content in the editor.`)) {
      setFormTitle(preset.name.replace(/^[^\s]+\s+/, ''))
      setFormSubject(preset.subject)
      setFormContent(preset.content)
    }
  }

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle || !formSubject || !formContent) {
      alert('Please fill out Title, Subject, and Content.')
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const method = editingCampaignId ? 'PUT' : 'POST'
      const body = editingCampaignId
        ? { campaignId: editingCampaignId, title: formTitle, subject: formSubject, content: formContent }
        : { title: formTitle, subject: formSubject, content: formContent }

      const res = await fetch('/api/newsletter/campaigns', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.success) {
        setSaveMessage('Template saved successfully!')
        await fetchCampaigns()
        setTimeout(() => {
          setIsEditorOpen(false)
          setSaveMessage(null)
        }, 800)
      } else {
        throw new Error(data.error || 'Failed to save template')
      }
    } catch (err: any) {
      setSaveMessage(`Error: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCampaign = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the draft template "${title}"?`)) return
    try {
      const res = await fetch(`/api/newsletter/campaigns?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setCampaigns(prev => prev.filter(c => c._id !== id))
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  const handleSendTestEmail = async (subject: string, content: string, campaignId: string) => {
    setSendingTestId(campaignId)
    setTestSendResult(null)
    try {
      const res = await fetch('/api/newsletter/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          content,
          recipientEmail: testEmail
        })
      })
      const data = await res.json()
      if (data.success) {
        setTestSendResult(data.message)
      } else {
        throw new Error(data.error || 'Test send failed')
      }
    } catch (err: any) {
      setTestSendResult(`Error: ${err.message}`)
    } finally {
      setSendingTestId(null)
      setTimeout(() => setTestSendResult(null), 8000)
    }
  }

  const handleDispatchCampaign = async (campaignId: string, title: string) => {
    if (!confirm(`🚀 Launch Campaign: Are you sure you want to dispatch "${title}" to all ${subscriberCount} active subscribers via Brevo?`)) {
      return
    }

    setDispatchingId(campaignId)
    setDispatchResult(null)

    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          adminEmail: 'info.flyingwonders@gmail.com'
        })
      })
      const data = await res.json()
      if (data.success) {
        setDispatchResult(`🎉 Dispatched successfully to ${data.sentCount} of ${data.totalCount} subscribers!`)
        await fetchCampaigns()
      } else {
        throw new Error(data.error || 'Failed to dispatch campaign')
      }
    } catch (err: any) {
      setDispatchResult(`Error: ${err.message}`)
    } finally {
      setDispatchingId(null)
      setTimeout(() => setDispatchResult(null), 10000)
    }
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
      {/* Top Banner & Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#800020' }}>
              <Mail size={22} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.4rem', color: '#1A202C', margin: 0, fontWeight: 800 }}>
                Email Campaigns & Templates
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#718096', margin: '2px 0 0 0' }}>
                Compose, edit, preview, and dispatch branded campaigns to subscribers via Brevo.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
            <Users size={15} color="#800020" />
            <span>Active Subscribers: <strong style={{ color: '#0F172A' }}>{subscriberCount}</strong></span>
          </div>

          <button
            onClick={fetchCampaigns}
            disabled={refreshing}
            style={{ padding: '8px 12px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}
            title="Refresh templates list"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={handleOpenNew}
            style={{ padding: '8px 16px', background: '#800020', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <Plus size={15} />
            + New Template / Campaign
          </button>
        </div>
      </div>

      {/* Global Alerts / Dispatch Status */}
      {dispatchResult && (
        <div style={{ background: dispatchResult.startsWith('🎉') ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${dispatchResult.startsWith('🎉') ? '#A7F3D0' : '#FECACA'}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: dispatchResult.startsWith('🎉') ? '#065F46' : '#991B1B', fontWeight: 600, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {dispatchResult.startsWith('🎉') ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{dispatchResult}</span>
        </div>
      )}

      {testSendResult && (
        <div style={{ background: testSendResult.startsWith('Error') ? '#FEF2F2' : '#EFF6FF', border: `1px solid ${testSendResult.startsWith('Error') ? '#FECACA' : '#BFDBFE'}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: testSendResult.startsWith('Error') ? '#991B1B' : '#1E40AF', fontWeight: 600, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={18} />
          <span>{testSendResult}</span>
        </div>
      )}

      {/* Test Recipient Email Bar */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#475569' }}>
          <Sparkles size={16} color="#D97706" />
          <span>Test email destination:</span>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="admin@example.com"
            style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', width: '240px', background: '#FFF', color: '#0F172A' }}
          />
        </div>
        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
          Preview emails are sent instantly with Brevo's DKIM signature.
        </div>
      </div>

      {/* Campaigns & Templates Table / Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontSize: '0.88rem' }}>
          Loading email templates...
        </div>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#F8FAFC', border: '2px dashed #E2E8F0', borderRadius: '12px' }}>
          <FileText size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 6px' }}>No Email Templates Created Yet</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 16px' }}>Get started by creating your first campaign from our pre-made travel presets.</p>
          <button
            onClick={handleOpenNew}
            style={{ padding: '9px 18px', background: '#800020', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
          >
            + Create First Template
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {campaigns.map((c) => {
            const isSent = c.status === 'sent'
            return (
              <div
                key={c._id}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  background: isSent ? '#F8FAFC' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  transition: 'box-shadow 0.15s ease'
                }}
              >
                <div style={{ flex: '1 1 350px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: isSent ? '#ECFDF5' : '#FEF3C7',
                      color: isSent ? '#065F46' : '#92400E',
                      border: `1px solid ${isSent ? '#A7F3D0' : '#FDE68A'}`
                    }}>
                      {isSent ? <CheckCheck size={12} /> : <Clock size={12} />}
                      {isSent ? 'SENT' : 'DRAFT'}
                    </span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {c.title}
                    </h3>
                  </div>

                  <div style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '4px' }}>
                    <strong>Subject:</strong> {c.subject}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {isSent ? (
                      <>
                        <span>Sent on: <strong>{c.sentAt ? new Date(c.sentAt).toLocaleDateString() : 'N/A'}</strong></span>
                        <span>Delivered to: <strong>{c.sentToCount || 0} recipients</strong></span>
                      </>
                    ) : (
                      <span>Created: <strong>{c._createdAt ? new Date(c._createdAt).toLocaleDateString() : 'Recent'}</strong></span>
                    )}
                  </div>
                </div>

                {/* Actions Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setPreviewCampaign(c)}
                    style={{ padding: '6px 12px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}
                    title="Preview rendered email"
                  >
                    <Eye size={13} />
                    Preview
                  </button>

                  <button
                    onClick={() => handleSendTestEmail(c.subject, c.content, c._id)}
                    disabled={sendingTestId === c._id}
                    style={{ padding: '6px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: '5px' }}
                    title={`Send preview email to ${testEmail}`}
                  >
                    <Sparkles size={13} className={sendingTestId === c._id ? 'animate-spin' : ''} />
                    {sendingTestId === c._id ? 'Sending...' : 'Test Send'}
                  </button>

                  {!isSent && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        style={{ padding: '6px 12px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#92400E', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Edit3 size={13} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDispatchCampaign(c._id, c.title)}
                        disabled={dispatchingId === c._id || subscriberCount === 0}
                        style={{ padding: '6px 14px', background: '#800020', border: 'none', borderRadius: '6px', cursor: dispatchingId === c._id ? 'not-allowed' : 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}
                        title={`Blast to ${subscriberCount} subscribers`}
                      >
                        <Send size={13} className={dispatchingId === c._id ? 'animate-spin' : ''} />
                        {dispatchingId === c._id ? 'Dispatching...' : 'Dispatch'}
                      </button>

                      <button
                        onClick={() => handleDeleteCampaign(c._id, c.title)}
                        style={{ padding: '6px 8px', background: '#FFF', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer', color: '#DC2626' }}
                        title="Delete draft template"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── TEMPLATE EDITOR MODAL ── */}
      {isEditorOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', maxWidth: '850px', width: '100%', maxHeight: '92vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {editingCampaignId ? 'Edit Campaign Template' : 'Create New Campaign Template'}
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0' }}>
                  Customize your campaign subject, content, and branding.
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Starter Presets Bar */}
            <div style={{ padding: '10px 24px', background: '#FFFBEB', borderBottom: '1px solid #FEF3C7', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#92400E', whiteSpace: 'nowrap' }}>
                Starter Presets:
              </span>
              {TEMPLATE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  style={{ padding: '4px 10px', background: '#FFFFFF', border: '1px solid #FDE68A', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#92400E', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveCampaign} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {saveMessage && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', background: saveMessage.startsWith('Error') ? '#FEF2F2' : '#ECFDF5', color: saveMessage.startsWith('Error') ? '#991B1B' : '#065F46', fontSize: '0.84rem', fontWeight: 600 }}>
                  {saveMessage}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                  Internal Template / Campaign Name:
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Singapore Autumn Season Promo 2026"
                  required
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem', color: '#0F172A', background: '#FFF' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                  Email Subject Line (What recipients see in their inbox):
                </label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. 🌟 Exclusive: Singapore Hidden Gems & DMC Rates for Your Trip"
                  required
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem', color: '#0F172A', background: '#FFF' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
                    Email Body Content (HTML or Plain Text):
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    Supports tags like &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;a href="..."&gt;, &lt;strong&gt;
                  </span>
                </div>
                <textarea
                  rows={11}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write your email content here..."
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A', fontFamily: 'monospace', lineHeight: 1.5, background: '#FFF' }}
                />
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  style={{ padding: '9px 16px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer', color: '#334155' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ padding: '9px 20px', background: '#800020', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.84rem', cursor: isSaving ? 'not-allowed' : 'pointer', color: '#FFF' }}
                >
                  {isSaving ? 'Saving...' : editingCampaignId ? 'Update Template' : 'Save Template Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LIVE PREVIEW MODAL ── */}
      {previewCampaign && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', maxWidth: '680px', width: '100%', maxHeight: '90vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#800020', textTransform: 'uppercase' }}>Live Email Rendering Preview</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{previewCampaign.subject}</div>
              </div>
              <button
                onClick={() => setPreviewCampaign(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', background: '#F1F5F9' }}>
              {/* The Exact Email Box */}
              <div style={{ maxWidth: '580px', margin: '0 auto', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                {/* Header */}
                <div style={{ background: '#800020', padding: '28px 20px', textAlign: 'center' }}>
                  <h1 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Georgia, serif' }}>
                    Flying Wonders
                  </h1>
                  <p style={{ color: '#dfba6b', margin: '6px 0 0', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700 }}>
                    Singapore & India Specialist DMC
                  </p>
                </div>

                {/* Body */}
                <div
                  style={{ padding: '28px 24px', color: '#1A202C', fontSize: '0.92rem', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: previewCampaign.content }}
                />

                {/* Footer */}
                <div style={{ background: '#F8FAFC', padding: '20px 16px', textAlign: 'center', borderTop: '1px solid #E2E8F0', fontSize: '0.74rem', color: '#64748B' }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#334155' }}>Flying Wonders Private Limited</p>
                  <p style={{ margin: '0 0 10px' }}>Singapore & India Specialist DMC • Official B2B & B2C Partner</p>
                  <p style={{ margin: 0, fontSize: '0.7rem' }}>
                    <span style={{ color: '#800020', textDecoration: 'underline' }}>Unsubscribe from newsletter</span>
                    &nbsp;•&nbsp;
                    <span style={{ color: '#64748B' }}>Contact Support</span>
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPreviewCampaign(null)}
                style={{ padding: '7px 16px', background: '#800020', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
