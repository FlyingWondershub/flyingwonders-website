'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Mail, Plus, Edit3, Send, Trash2, Eye, RefreshCw, CheckCircle,
  AlertCircle, Sparkles, X, ChevronRight, Users, Clock, CheckCheck,
  FileText, Smartphone, Monitor, ShieldCheck, Check, MessageSquare
} from 'lucide-react'

interface Campaign {
  _id: string
  title: string
  subject: string
  content: string
  structuredData?: string
  status: 'draft' | 'sent'
  sentAt?: string
  sentToCount?: number
  _createdAt?: string
}

interface HighlightItem {
  id: string
  title: string
  desc: string
}

interface StructuredCampaignData {
  greeting: string
  headline: string
  bodyText: string
  highlights: HighlightItem[]
  showCta: boolean
  ctaText: string
  ctaUrl: string
  showWhatsApp: boolean
  whatsAppText: string
  showSignature: boolean
  salutation: string
  signoffName: string
}

const DEFAULT_STRUCTURED_DATA: StructuredCampaignData = {
  greeting: 'Dear Valued Traveler,',
  headline: 'Singapore Unveiled: Exclusive DMC Rates & Seasonal Highlights',
  bodyText: `Singapore is brimming with fresh wonders this season! Whether you are seeking world-class entertainment, culinary delights, or lush tropical gardens, our destination experts have curated exclusive experiences tailored for you.\n\nFrom seamless airport transfers to bespoke city tours and VIP attraction access, we ensure every detail of your journey is effortless and memorable.`,
  highlights: [
    {
      id: '1',
      title: 'Marina Bay & Gardens by the Bay',
      desc: 'Supertree Grove, Cloud Forest, and nightly Garden Rhapsody light shows with priority access passes.'
    },
    {
      id: '2',
      title: 'Sentosa VIP Island Packages',
      desc: 'Universal Studios Singapore express combos, S.E.A. Aquarium, and Cable Car Sky Dining at wholesale DMC rates.'
    },
    {
      id: '3',
      title: 'Chauffeured Ground Fleet',
      desc: '7-seater VIP Toyota Alphard/Vellfire and luxury 45-seater coaches with certified English & Hindi guides.'
    }
  ],
  showCta: true,
  ctaText: 'Customize Your Singapore Trip →',
  ctaUrl: 'https://flyingwonders.net/custom-package',
  showWhatsApp: true,
  whatsAppText: 'Chat with our Singapore Desk on WhatsApp',
  showSignature: true,
  salutation: 'Thanks & Best Regards,',
  signoffName: 'Nithin'
}

const PRESETS: Array<{ name: string; title: string; subject: string; data: StructuredCampaignData }> = [
  {
    name: '🇸🇬 Singapore Insider (B2C)',
    title: 'Singapore Insider Travel Guide',
    subject: '🌟 Singapore Unveiled: Top Hidden Gems & Seasonal Itineraries',
    data: {
      greeting: 'Dear Traveler,',
      headline: 'Singapore Unveiled: Top Hidden Gems & Seasonal Itineraries',
      bodyText: `Singapore is brimming with fresh wonders this season! Whether you are seeking world-class entertainment, culinary delights, or lush tropical gardens, our destination specialists have curated the finest highlights for your upcoming holiday.\n\nEnjoy guaranteed seamless ground handling, luxury private transfers, and instant digital attraction vouchers with zero hassle.`,
      highlights: [
        {
          id: '1',
          title: 'Marina Bay & Gardens by the Bay',
          desc: 'Experience the illuminated Supertree Grove and the breathtaking indoor waterfall at Cloud Forest.'
        },
        {
          id: '2',
          title: 'Sentosa Island Pass Highlights',
          desc: 'Universal Studios Singapore, S.E.A. Aquarium, and Cable Car Sky Dining at exclusive bundled DMC rates.'
        },
        {
          id: '3',
          title: 'Mandai Wildlife Reserve',
          desc: 'Singapore Zoo, Night Safari VIP tram rides, and River Wonders Amazon River Quest.'
        }
      ],
      showCta: true,
      ctaText: 'Customize Your Singapore Trip →',
      ctaUrl: 'https://flyingwonders.net/custom-package',
      showWhatsApp: true,
      whatsAppText: 'Inquire on WhatsApp (+65 94722830)',
      showSignature: true,
      salutation: 'Thanks & Best Regards,',
      signoffName: 'Nithin'
    }
  },
  {
    name: '🤝 B2B Wholesale Tariffs (B2B)',
    title: 'B2B Partner Tariff Sheet 2026',
    subject: '📄 Flying Wonders Singapore DMC: 2026 Wholesale Tariff Sheet & Partner Portal',
    data: {
      greeting: 'Dear Travel Partner,',
      headline: 'Flying Wonders Singapore DMC: 2026 Wholesale Tariffs & Ground Services',
      bodyText: `We are pleased to present our updated Singapore Destination Management Company (DMC) wholesale tariffs and ground support services for 2026.\n\nOur direct contracts with Singapore attractions, luxury coach fleets, and star hotels allow your agency to offer the most competitive packages across Southeast Asia with instant markup tools.`,
      highlights: [
        {
          id: '1',
          title: 'Instant Package Estimator',
          desc: 'Build and price multi-day Singapore & Malaysia itineraries in real-time with your agency co-branding.'
        },
        {
          id: '2',
          title: 'Wholesale Attraction Passes API',
          desc: 'Instant QR code ticket issuing for USS, Sentosa, Wildlife Parks, and Night Safari.'
        },
        {
          id: '3',
          title: 'Private Fleet & MICE Support',
          desc: '7-seater VIP MPVs to 45-seater luxury coaches with dedicated airport representatives.'
        }
      ],
      showCta: true,
      ctaText: 'Access B2B Partner Portal →',
      ctaUrl: 'https://flyingwonders.net/agent-portal',
      showWhatsApp: true,
      whatsAppText: 'Direct B2B Desk on WhatsApp (+65 94722830)',
      showSignature: true,
      salutation: 'Thanks & Best Regards,',
      signoffName: 'Nithin'
    }
  },
  {
    name: '🎟️ Flash Attraction Deals',
    title: 'Flash Attraction Tickets Promo',
    subject: '🎟️ Flash Promo: Universal Studios + Marina Bay Attraction Bundles',
    data: {
      greeting: 'Dear Explorer,',
      headline: 'Exclusive Singapore Attraction Pass Drop & Combos',
      bodyText: `Planning your trip to the Lion City? Take advantage of our limited-time attraction bundle passes with instant digital vouchers and guaranteed entry slots.\n\nSkip ticket booth lines and secure wholesale rates with our instant mobile vouchers.`,
      highlights: [
        {
          id: '1',
          title: 'Universal Studios Singapore + Express Pass',
          desc: 'Skip regular queues at Battlestar Galactica, Transformers 3D, and Jurassic Park.'
        },
        {
          id: '2',
          title: 'Sentosa Mega Combo Pass',
          desc: 'Singapore Cable Car Sky Pass + SkyHelix Sentosa + S.E.A. Aquarium 1-Day Ticket.'
        },
        {
          id: '3',
          title: 'Marina Bay Sands SkyPark & Sampan Ride',
          desc: 'Panoramic 57th-floor observatory deck views + scenic canal boat cruise.'
        }
      ],
      showCta: true,
      ctaText: 'View All Attraction Passes →',
      ctaUrl: 'https://flyingwonders.net/singapore-attractions',
      showWhatsApp: true,
      whatsAppText: 'Book Tickets via WhatsApp (+65 94722830)',
      showSignature: true,
      salutation: 'Thanks & Best Regards,',
      signoffName: 'Nithin'
    }
  }
]

/**
 * Compiles structured block fields into responsive, email-client-friendly HTML.
 * Incorporates the official Flying Wonders Gmail signature & 6 accreditation badges.
 */
export function compileEmailHtml(data: StructuredCampaignData): string {
  // Convert multiline text into styled paragraphs
  const paragraphs = data.bodyText
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #334155;">${p.replace(/\n/g, '<br />')}</p>`)
    .join('')

  // Highlights list
  let highlightsHtml = ''
  if (data.highlights && data.highlights.length > 0) {
    const items = data.highlights
      .filter(h => h.title || h.desc)
      .map(h => `
        <li style="margin-bottom: 12px; font-size: 14px; line-height: 1.6; color: #334155;">
          ${h.title ? `<strong style="color: #0F172A;">${h.title}:</strong> ` : ''}${h.desc || ''}
        </li>
      `)
      .join('')

    if (items) {
      highlightsHtml = `
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #800020; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
          <h4 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #800020; text-transform: uppercase; letter-spacing: 0.05em;">Key Highlights & Exclusive Inclusions:</h4>
          <ul style="margin: 0; padding-left: 20px;">
            ${items}
          </ul>
        </div>
      `
    }
  }

  // CTA Button
  let ctaHtml = ''
  if (data.showCta && data.ctaText && data.ctaUrl) {
    ctaHtml = `
      <div style="text-align: center; margin: 28px 0 20px 0;">
        <a href="${data.ctaUrl}" style="background-color: #800020; color: #FFFFFF; display: inline-block; padding: 14px 30px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 8px; letter-spacing: 0.02em; box-shadow: 0 4px 6px rgba(128, 0, 32, 0.2);">
          ${data.ctaText}
        </a>
      </div>
    `
  }

  // WhatsApp Button
  let whatsAppHtml = ''
  if (data.showWhatsApp) {
    const waUrl = `https://wa.me/6594722830?text=${encodeURIComponent('Hi Flying Wonders, I received your email newsletter and would like to inquire about Singapore packages.')}`
    whatsAppHtml = `
      <div style="text-align: center; margin: 12px 0 24px 0;">
        <a href="${waUrl}" style="background-color: #25D366; color: #FFFFFF; display: inline-block; padding: 10px 22px; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 6px;">
          💬 ${data.whatsAppText || 'Chat on WhatsApp (+65 94722830)'}
        </a>
      </div>
    `
  }

  // Official Signature Block matching Gmail Signature
  let signatureHtml = ''
  if (data.showSignature) {
    signatureHtml = `
      <div style="margin-top: 32px; padding-top: 22px; border-top: 2px solid #E2E8F0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.5; color: #1E293B;">
        <p style="margin: 0 0 4px 0; color: #475569; font-size: 13px;">${data.salutation || 'Thanks & Best Regards,'}</p>
        <p style="margin: 0 0 12px 0; font-weight: bold; font-size: 15px; color: #800020;">${data.signoffName || 'Nithin'}</p>
        
        <div style="margin-bottom: 8px; font-size: 12px;">
          <strong style="color: #0F172A;">Flying Wonders Pvt Ltd.</strong><br />
          <span style="color: #475569;">#74, 4th Cross, SBM Colony, BSK 1st Stage, Bangalore, India - 560050</span>
        </div>
        
        <div style="margin-bottom: 12px; font-size: 12px;">
          <strong style="color: #0F172A;">Flying Wonders Pte Ltd.</strong><br />
          <span style="color: #475569;">#12-07, Suntec Tower One, Singapore - 038987</span>
        </div>
        
        <div style="color: #334155; font-size: 12px; margin-bottom: 10px; line-height: 1.7;">
          <strong>Mobile :</strong> <a href="tel:+6594722830" style="color: #800020; text-decoration: none; font-weight: 600;">+65 94722830</a> / <a href="tel:+919886171251" style="color: #800020; text-decoration: none; font-weight: 600;">+91 9886171251</a><br />
          <strong>Email:</strong> <a href="mailto:info.flyingwonders@gmail.com" style="color: #800020; text-decoration: none;">info.flyingwonders@gmail.com</a> / <a href="mailto:contact@flyingwonders.net" style="color: #800020; text-decoration: none;">contact@flyingwonders.net</a><br />
          <strong>Website:</strong> <a href="http://www.flyingwonders.net" style="color: #800020; text-decoration: underline;">http://www.flyingwonders.net</a>
        </div>
        
        <div style="background-color: #F1F5F9; border-left: 3px solid #800020; padding: 8px 12px; margin: 12px 0 16px 0; font-size: 11px; color: #475569; line-height: 1.5;">
          <strong>Product Portfolio:</strong> Travel Assistance | Visas | Accommodations | Land Packages | Air Ticketing | Global Attraction Tickets &amp; Cruises
        </div>
        
        <!-- Official Accreditations Badge Banner -->
        <div style="margin-top: 14px; text-align: left;">
          <img src="https://flyingwonders.net/images/voucher-footer-accreditations.png" alt="Accreditations: ISO 9001, ISO 27001, TAAI, TOA, nidhi+, D-U-N-S" style="max-width: 100%; width: 440px; height: auto; display: block; border: 0;" />
        </div>
      </div>
    `
  }

  return `
    ${data.greeting ? `<h3 style="margin: 0 0 12px 0; font-size: 18px; color: #0F172A; font-weight: 700;">${data.greeting}</h3>` : ''}
    ${data.headline ? `<h2 style="margin: 0 0 18px 0; font-size: 20px; color: #800020; font-weight: 800; line-height: 1.35;">${data.headline}</h2>` : ''}
    ${paragraphs}
    ${highlightsHtml}
    ${ctaHtml}
    ${whatsAppHtml}
    ${signatureHtml}
  `.trim()
}

export default function NewsletterCampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [subscriberCount, setSubscriberCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'visual' | 'raw'>('visual')
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formSubject, setFormSubject] = useState('')
  
  // Visual Builder Form State
  const [structuredData, setStructuredData] = useState<StructuredCampaignData>(DEFAULT_STRUCTURED_DATA)
  // Raw HTML Form State
  const [rawHtmlContent, setRawHtmlContent] = useState('')

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Full Screen Preview Modal State
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null)

  // Test Send State
  const [testEmail, setTestEmail] = useState('info.flyingwonders@gmail.com')
  const [sendingTestId, setSendingTestId] = useState<string | null>(null)
  const [testSendResult, setTestSendResult] = useState<string | null>(null)

  // Dispatch Campaign State
  const [dispatchingId, setDispatchingId] = useState<string | null>(null)
  const [dispatchResult, setDispatchResult] = useState<string | null>(null)

  // Real-time compiled HTML for editor preview
  const liveCompiledHtml = useMemo(() => {
    if (editorMode === 'visual') {
      return compileEmailHtml(structuredData)
    }
    return rawHtmlContent
  }, [editorMode, structuredData, rawHtmlContent])

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
    setFormTitle('Singapore Seasonal Escapes')
    setFormSubject('🌟 Exclusive: Singapore Hidden Gems & DMC Rates for Your Trip')
    setStructuredData(DEFAULT_STRUCTURED_DATA)
    setRawHtmlContent(compileEmailHtml(DEFAULT_STRUCTURED_DATA))
    setEditorMode('visual')
    setSaveMessage(null)
    setIsEditorOpen(true)
  }

  const handleOpenEdit = (c: Campaign) => {
    setEditingCampaignId(c._id)
    setFormTitle(c.title)
    setFormSubject(c.subject)
    setRawHtmlContent(c.content)

    if (c.structuredData) {
      try {
        const parsed = JSON.parse(c.structuredData)
        setStructuredData(parsed)
        setEditorMode('visual')
      } catch (e) {
        setEditorMode('raw')
      }
    } else {
      // If old campaign has no structured JSON, default to raw HTML mode or allow visual editing
      setEditorMode('raw')
    }

    setSaveMessage(null)
    setIsEditorOpen(true)
  }

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    if (confirm(`Apply the "${preset.name}" preset? This will populate the editor with this template's fields.`)) {
      setFormTitle(preset.title)
      setFormSubject(preset.subject)
      setStructuredData(preset.data)
      setRawHtmlContent(compileEmailHtml(preset.data))
    }
  }

  const handleAddHighlight = () => {
    setStructuredData(prev => ({
      ...prev,
      highlights: [
        ...prev.highlights,
        { id: Date.now().toString(), title: 'New Highlight', desc: 'Detail about this inclusion or deal.' }
      ]
    }))
  }

  const handleUpdateHighlight = (id: string, field: 'title' | 'desc', val: string) => {
    setStructuredData(prev => ({
      ...prev,
      highlights: prev.highlights.map(h => h.id === id ? { ...h, [field]: val } : h)
    }))
  }

  const handleRemoveHighlight = (id: string) => {
    setStructuredData(prev => ({
      ...prev,
      highlights: prev.highlights.filter(h => h.id !== id)
    }))
  }

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle || !formSubject) {
      alert('Please fill out Template Name and Subject Line.')
      return
    }

    const finalHtml = editorMode === 'visual' ? compileEmailHtml(structuredData) : rawHtmlContent
    if (!finalHtml.trim()) {
      alert('Content cannot be empty.')
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const method = editingCampaignId ? 'PUT' : 'POST'
      const body: any = {
        title: formTitle,
        subject: formSubject,
        content: finalHtml,
      }

      if (editingCampaignId) body.campaignId = editingCampaignId
      if (editorMode === 'visual') {
        body.structuredData = JSON.stringify(structuredData)
      }

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

  const handleSendTestEmail = async (subject: string, content: string, campaignId?: string) => {
    const idToMark = campaignId || 'editor-test'
    setSendingTestId(idToMark)
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
                Create, customize with your official signature & badges, preview, and dispatch campaigns via Brevo.
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
          <span>Quick test email destination:</span>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="admin@example.com"
            style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', width: '240px', background: '#FFF', color: '#0F172A' }}
          />
        </div>
        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
          Emails are dispatched instantly through Brevo's verified DKIM domain (<strong style={{ color: '#800020' }}>contact@flyingwonders.net</strong>).
        </div>
      </div>

      {/* Campaigns & Templates List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontSize: '0.88rem' }}>
          Loading email templates...
        </div>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#F8FAFC', border: '2px dashed #E2E8F0', borderRadius: '12px' }}>
          <FileText size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 6px' }}>No Email Templates Created Yet</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 16px' }}>Use our visual block builder with your official signature to create your first campaign.</p>
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

      {/* ── VISUAL BLOCK BUILDER & LIVE PREVIEW MODAL ── */}
      {isEditorOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', maxWidth: '1280px', width: '100%', height: '94vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            
            {/* Modal Top Header */}
            <div style={{ padding: '14px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {editingCampaignId ? 'Edit Campaign Template' : 'Create New Campaign Template'}
                  </h3>
                  {/* Mode Selector */}
                  <div style={{ display: 'flex', background: '#E2E8F0', borderRadius: '8px', padding: '3px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditorMode('visual')
                        if (!structuredData.bodyText && rawHtmlContent) {
                          setStructuredData(prev => ({ ...prev, bodyText: rawHtmlContent.replace(/<[^>]+>/g, '\n').trim() }))
                        }
                      }}
                      style={{
                        padding: '4px 12px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: editorMode === 'visual' ? '#800020' : 'transparent',
                        color: editorMode === 'visual' ? '#FFFFFF' : '#475569',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      ✨ Visual Block Builder (Easy)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditorMode('raw')
                        setRawHtmlContent(compileEmailHtml(structuredData))
                      }}
                      style={{
                        padding: '4px 12px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: editorMode === 'raw' ? '#800020' : 'transparent',
                        color: editorMode === 'raw' ? '#FFFFFF' : '#475569',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      💻 Raw HTML Mode
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '4px 0 0' }}>
                  No HTML knowledge required. Fill simple fields and your email automatically includes the official Flying Wonders signature & accreditation badges.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B', padding: '4px' }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Quick Starter Presets Bar */}
            <div style={{ padding: '10px 24px', background: '#FFFBEB', borderBottom: '1px solid #FEF3C7', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#92400E', whiteSpace: 'nowrap' }}>
                Quick Presets:
              </span>
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  style={{ padding: '4px 12px', background: '#FFFFFF', border: '1px solid #FDE68A', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#92400E', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Split Screen: Left = Form Inputs, Right = Live Side-by-Side Preview */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              
              {/* LEFT COLUMN: Input Form */}
              <div style={{ width: '50%', borderRight: '1px solid #E2E8F0', overflowY: 'auto', padding: '20px 24px', background: '#FAFAFA' }}>
                {saveMessage && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', background: saveMessage.startsWith('Error') ? '#FEF2F2' : '#ECFDF5', color: saveMessage.startsWith('Error') ? '#991B1B' : '#065F46', fontSize: '0.84rem', fontWeight: 600 }}>
                    {saveMessage}
                  </div>
                )}

                {/* Campaign Header Info */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={16} color="#800020" /> Campaign Identification
                  </h4>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Internal Template Name:
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Singapore Seasonal Escapes 2026"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem', color: '#0F172A', background: '#FFF' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Email Subject Line (Recipients see this in their inbox):
                    </label>
                    <input
                      type="text"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="e.g. 🌟 Exclusive: Singapore Hidden Gems & DMC Rates for Your Trip"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem', color: '#0F172A', background: '#FFF' }}
                    />
                  </div>
                </div>

                {editorMode === 'visual' ? (
                  <>
                    {/* SECTION 1: Greeting & Headline */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
                        1. Greeting & Main Message
                      </h4>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Greeting / Salutation:
                        </label>
                        <input
                          type="text"
                          value={structuredData.greeting}
                          onChange={(e) => setStructuredData({ ...structuredData, greeting: e.target.value })}
                          placeholder="e.g. Dear Valued Traveler, or Dear Travel Partner,"
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem', color: '#0F172A', background: '#FFF' }}
                        />
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Featured Headline (Optional):
                        </label>
                        <input
                          type="text"
                          value={structuredData.headline}
                          onChange={(e) => setStructuredData({ ...structuredData, headline: e.target.value })}
                          placeholder="e.g. Singapore Unveiled: Exclusive DMC Rates & Seasonal Highlights"
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem', color: '#0F172A', background: '#FFF' }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                            Main Body Paragraphs (Plain text - Press Enter twice for new paragraphs):
                          </label>
                        </div>
                        <textarea
                          rows={6}
                          value={structuredData.bodyText}
                          onChange={(e) => setStructuredData({ ...structuredData, bodyText: e.target.value })}
                          placeholder="Type your message naturally here. No HTML needed!"
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem', color: '#0F172A', lineHeight: 1.5, background: '#FFF' }}
                        />
                      </div>
                    </div>

                    {/* SECTION 2: Key Highlights / Bullet Points */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          2. Key Highlights & Inclusions (Bullet Points)
                        </h4>
                        <button
                          type="button"
                          onClick={handleAddHighlight}
                          style={{ padding: '4px 10px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Plus size={13} /> Add Item
                        </button>
                      </div>

                      {structuredData.highlights.length === 0 ? (
                        <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0, fontStyle: 'italic' }}>
                          No bullet highlights added. Click "+ Add Item" above if you want to feature packages or deals.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {structuredData.highlights.map((h, index) => (
                            <div key={h.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#800020' }}>Highlight #{index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHighlight(h.id)}
                                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#DC2626', padding: '2px' }}
                                  title="Remove highlight"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={h.title}
                                onChange={(e) => handleUpdateHighlight(h.id, 'title', e.target.value)}
                                placeholder="Highlight Title (e.g. Universal Studios Singapore VIP Pass)"
                                style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '5px', fontSize: '0.8rem', color: '#0F172A', marginBottom: '6px', background: '#FFF' }}
                              />
                              <input
                                type="text"
                                value={h.desc}
                                onChange={(e) => handleUpdateHighlight(h.id, 'desc', e.target.value)}
                                placeholder="Highlight Description (e.g. Express passes included with instant confirmation)"
                                style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '5px', fontSize: '0.8rem', color: '#0F172A', background: '#FFF' }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SECTION 3: Call-To-Action & WhatsApp Buttons */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
                        3. Action Buttons & Quick WhatsApp
                      </h4>

                      {/* CTA Toggle */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px' }}>
                        <input
                          type="checkbox"
                          checked={structuredData.showCta}
                          onChange={(e) => setStructuredData({ ...structuredData, showCta: e.target.checked })}
                          style={{ width: '16px', height: '16px', accentColor: '#800020' }}
                        />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
                          Include Royal Burgundy Call-To-Action Button
                        </span>
                      </label>

                      {structuredData.showCta && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px', paddingLeft: '24px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748B', marginBottom: '3px' }}>Button Text:</label>
                            <input
                              type="text"
                              value={structuredData.ctaText}
                              onChange={(e) => setStructuredData({ ...structuredData, ctaText: e.target.value })}
                              placeholder="e.g. Customize Your Singapore Trip →"
                              style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem', background: '#FFF' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748B', marginBottom: '3px' }}>Button Link URL:</label>
                            <input
                              type="text"
                              value={structuredData.ctaUrl}
                              onChange={(e) => setStructuredData({ ...structuredData, ctaUrl: e.target.value })}
                              placeholder="https://flyingwonders.net/custom-package"
                              style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem', background: '#FFF' }}
                            />
                          </div>
                        </div>
                      )}

                      {/* WhatsApp Toggle */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px' }}>
                        <input
                          type="checkbox"
                          checked={structuredData.showWhatsApp}
                          onChange={(e) => setStructuredData({ ...structuredData, showWhatsApp: e.target.checked })}
                          style={{ width: '16px', height: '16px', accentColor: '#25D366' }}
                        />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
                          Include WhatsApp Quick Connect Button (+65 94722830)
                        </span>
                      </label>

                      {structuredData.showWhatsApp && (
                        <div style={{ paddingLeft: '24px' }}>
                          <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748B', marginBottom: '3px' }}>WhatsApp Button Text:</label>
                          <input
                            type="text"
                            value={structuredData.whatsAppText}
                            onChange={(e) => setStructuredData({ ...structuredData, whatsAppText: e.target.value })}
                            placeholder="Chat with our Singapore Desk on WhatsApp"
                            style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem', background: '#FFF' }}
                          />
                        </div>
                      )}
                    </div>

                    {/* SECTION 4: Official Flying Wonders Signature Block */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={structuredData.showSignature}
                            onChange={(e) => setStructuredData({ ...structuredData, showSignature: e.target.checked })}
                            style={{ width: '16px', height: '16px', accentColor: '#800020' }}
                          />
                          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={16} color="#059669" />
                            Official Flying Wonders Signature &amp; Badges (Gmail Standard)
                          </span>
                        </label>
                        <span style={{ fontSize: '0.72rem', background: '#ECFDF5', color: '#065F46', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          6 Badges Included
                        </span>
                      </div>

                      {structuredData.showSignature && (
                        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px', marginTop: '10px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748B', marginBottom: '3px' }}>Sign-off Salutation:</label>
                              <input
                                type="text"
                                value={structuredData.salutation}
                                onChange={(e) => setStructuredData({ ...structuredData, salutation: e.target.value })}
                                placeholder="Thanks & Best Regards,"
                                style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem', background: '#FFF' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748B', marginBottom: '3px' }}>Signer Name:</label>
                              <input
                                type="text"
                                value={structuredData.signoffName}
                                onChange={(e) => setStructuredData({ ...structuredData, signoffName: e.target.value })}
                                placeholder="Nithin"
                                style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#800020', background: '#FFF' }}
                              />
                            </div>
                          </div>

                          <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.5, background: '#FFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                            <strong style={{ color: '#0F172A' }}>Fixed Company Credentials Automatically Attached:</strong>
                            <div style={{ marginTop: '3px' }}>• Bangalore Office: #74, 4th Cross, SBM Colony, BSK 1st Stage, Bangalore, India - 560050</div>
                            <div>• Singapore Office: #12-07, Suntec Tower One, Singapore - 038987</div>
                            <div>• Mobile: +65 94722830 / +91 9886171251 | info.flyingwonders@gmail.com</div>
                            <div>• Accreditations: ISO 9001:2015, ICL ISO 27001, TAAI, TOA, nidhi+, Dun &amp; Bradstreet D-U-N-S</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* RAW HTML MODE */
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
                        Raw HTML Source:
                      </label>
                      <button
                        type="button"
                        onClick={() => setRawHtmlContent(compileEmailHtml(structuredData))}
                        style={{ padding: '3px 8px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer', color: '#475569' }}
                      >
                        Insert Visual Builder Output
                      </button>
                    </div>
                    <textarea
                      rows={20}
                      value={rawHtmlContent}
                      onChange={(e) => setRawHtmlContent(e.target.value)}
                      placeholder="Write your email HTML code here..."
                      style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.82rem', color: '#0F172A', fontFamily: 'monospace', lineHeight: 1.5, background: '#FFF' }}
                    />
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Live Side-by-Side Responsive Preview */}
              <div style={{ width: '50%', display: 'flex', flexDirection: 'column', background: '#E2E8F0' }}>
                {/* Preview Control Bar */}
                <div style={{ padding: '10px 18px', background: '#0F172A', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 700 }}>
                    <Eye size={15} color="#dfba6b" />
                    <span>Live Rendering Preview</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      style={{
                        padding: '4px 10px',
                        background: previewDevice === 'desktop' ? '#334155' : 'transparent',
                        color: previewDevice === 'desktop' ? '#FFF' : '#94A3B8',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Monitor size={13} /> Desktop (600px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      style={{
                        padding: '4px 10px',
                        background: previewDevice === 'mobile' ? '#334155' : 'transparent',
                        color: previewDevice === 'mobile' ? '#FFF' : '#94A3B8',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Smartphone size={13} /> Mobile (375px)
                    </button>
                  </div>
                </div>

                {/* Email Canvas Container */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: previewDevice === 'desktop' ? '580px' : '360px',
                      maxWidth: '100%',
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      overflow: 'hidden',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                      transition: 'width 0.2s ease'
                    }}
                  >
                    {/* Header */}
                    <div style={{ background: '#800020', padding: '24px 20px', textAlign: 'center' }}>
                      <h1 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Georgia, serif' }}>
                        Flying Wonders
                      </h1>
                      <p style={{ color: '#dfba6b', margin: '6px 0 0', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700 }}>
                        Singapore &amp; India Specialist DMC
                      </p>
                    </div>

                    {/* Email Body Content */}
                    <div
                      style={{ padding: '24px 20px', color: '#1A202C', fontSize: '0.92rem', lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: liveCompiledHtml }}
                    />

                    {/* Footer */}
                    <div style={{ background: '#F8FAFC', padding: '18px 16px', textAlign: 'center', borderTop: '1px solid #E2E8F0', fontSize: '0.74rem', color: '#64748B' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#334155' }}>Flying Wonders Private Limited</p>
                      <p style={{ margin: '0 0 8px' }}>Singapore &amp; India Specialist DMC • Official B2B &amp; B2C Partner</p>
                      <p style={{ margin: 0, fontSize: '0.7rem' }}>
                        <span style={{ color: '#800020', textDecoration: 'underline' }}>[Unsubscribe from newsletter]</span>
                        &nbsp;•&nbsp;
                        <span style={{ color: '#64748B' }}>Contact Support</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Modal Actions Bar */}
            <div style={{ padding: '12px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleSendTestEmail(formSubject, liveCompiledHtml)}
                  disabled={sendingTestId === 'editor-test'}
                  style={{ padding: '8px 16px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: '6px' }}
                  title={`Send instant preview email to ${testEmail}`}
                >
                  <Sparkles size={14} className={sendingTestId === 'editor-test' ? 'animate-spin' : ''} />
                  {sendingTestId === 'editor-test' ? 'Sending Preview...' : `Send Test Preview to ${testEmail}`}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  style={{ padding: '9px 18px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer', color: '#334155' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCampaign}
                  disabled={isSaving}
                  style={{ padding: '9px 24px', background: '#800020', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.84rem', cursor: isSaving ? 'not-allowed' : 'pointer', color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Check size={16} />
                  {isSaving ? 'Saving...' : editingCampaignId ? 'Update Template' : 'Save Template Draft'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── FULL SCREEN MODAL PREVIEW (for listing preview button) ── */}
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
              <div style={{ maxWidth: '580px', margin: '0 auto', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                {/* Header */}
                <div style={{ background: '#800020', padding: '28px 20px', textAlign: 'center' }}>
                  <h1 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Georgia, serif' }}>
                    Flying Wonders
                  </h1>
                  <p style={{ color: '#dfba6b', margin: '6px 0 0', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700 }}>
                    Singapore &amp; India Specialist DMC
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
                  <p style={{ margin: '0 0 10px' }}>Singapore &amp; India Specialist DMC • Official B2B &amp; B2C Partner</p>
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
