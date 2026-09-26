'use client'

import React, { useState, useEffect, useMemo } from 'react'
import * as XLSX from 'xlsx'
import {
  Mail, Plus, Edit3, Send, Trash2, Eye, RefreshCw, CheckCircle,
  AlertCircle, Sparkles, X, ChevronRight, Users, Clock, CheckCheck,
  FileText, Smartphone, Monitor, ShieldCheck, Check, MessageSquare,
  Image as ImageIcon, Upload, UploadCloud, Download, UserPlus, Search, Filter, CheckCircle2,
  History, Copy, MessageCircle
} from 'lucide-react'
import { ParsedContact, parseSpreadsheetBuffer, parseWhatsAppChatText, parseRawContactText } from '../../lib/contact-parser'

export interface DispatchHistoryItem {
  _key?: string
  dispatchedAt?: string
  targetAudience?: string
  audience?: string
  sentCount?: number
  errorCount?: number
  dispatchedBy?: string
  adminEmail?: string
  notes?: string
}

function formatDateSafe(val?: string | null): string {
  if (!val) return 'Never'
  try {
    const d = new Date(val)
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString()
  } catch {
    return 'N/A'
  }
}

interface Campaign {
  _id: string
  title: string
  subject: string
  preheader?: string
  content: string
  structuredData?: string
  status: 'draft' | 'sent'
  sentAt?: string
  sentToCount?: number
  dispatchCount?: number
  lastSentAt?: string
  lastSentToCount?: number
  dispatchHistory?: DispatchHistoryItem[]
  dispatchedEmails?: string[]
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
  heroImage?: string
  heroImageAlt?: string
  heroImageLink?: string
  heroImagePosition?: 'top' | 'below-intro'
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
  heroImage: '',
  heroImageAlt: 'Singapore Skyline and Attractions',
  heroImageLink: 'https://flyingwonders.net/custom-package',
  heroImagePosition: 'top',
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
      heroImage: '',
      heroImageAlt: 'Singapore City',
      heroImageLink: 'https://flyingwonders.net/custom-package',
      heroImagePosition: 'top',
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
      heroImage: '',
      heroImageAlt: 'B2B Tariff Sheet',
      heroImageLink: 'https://flyingwonders.net/agent-portal',
      heroImagePosition: 'top',
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
      heroImage: '',
      heroImageAlt: 'Attraction Deals',
      heroImageLink: 'https://flyingwonders.net/singapore-attractions',
      heroImagePosition: 'top',
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
 * Incorporates uploaded image banners, official Flying Wonders Gmail signature, & 6 accreditation badges.
 */
export function compileEmailHtml(data: StructuredCampaignData): string {
  // Convert multiline text into styled paragraphs
  const paragraphs = data.bodyText
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.68; color: #334155; text-align: justify; text-justify: inter-word;">${p.replace(/\n/g, '<br />')}</p>`)
    .join('')

  // Hero Image Banner
  const heroImageHtml = data.heroImage ? `
    <div style="margin: 20px 0 24px 0; text-align: center;">
      ${data.heroImageLink ? `<a href="${data.heroImageLink}" target="_blank" style="text-decoration: none; display: inline-block;">` : ''}
        <img
          src="${data.heroImage}"
          alt="${data.heroImageAlt || 'Campaign flyer'}"
          style="width: 100%; max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto; border: 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08);"
        />
      ${data.heroImageLink ? `</a>` : ''}
    </div>
  ` : ''

  // Highlights list
  let highlightsHtml = ''
  if (data.highlights && data.highlights.length > 0) {
    const items = data.highlights
      .filter(h => h.title || h.desc)
      .map(h => `
        <li style="margin-bottom: 12px; font-size: 14px; line-height: 1.65; color: #334155; text-align: justify; text-justify: inter-word;">
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
          <span style="color: #475569; text-decoration: none !important; border-bottom: none !important; cursor: default; pointer-events: none;">#74, 4&zwnj;th Cross, SBM Colony, BSK 1st Stage, Bangalore, India - 560&zwnj;050</span>
        </div>
        
        <div style="margin-bottom: 12px; font-size: 12px;">
          <strong style="color: #0F172A;">Flying Wonders Pte Ltd.</strong><br />
          <span style="color: #475569; text-decoration: none !important; border-bottom: none !important; cursor: default; pointer-events: none;">#12-07, Suntec Tower One, Singapore - 038&zwnj;987</span>
        </div>
        
        <div style="color: #334155; font-size: 12px; margin-bottom: 10px; line-height: 1.7;">
          <strong>Mobile :</strong> <a href="tel:+6594722830" style="color: #800020; text-decoration: none; font-weight: 600;">+65 94722830</a> / <a href="tel:+919886171251" style="color: #800020; text-decoration: none; font-weight: 600;">+91 9886171251</a><br />
          <strong>Email:</strong> <a href="mailto:info.flyingwonders@gmail.com" style="color: #800020; text-decoration: none;">info.flyingwonders@gmail.com</a> / <a href="mailto:contact@flyingwonders.net" style="color: #800020; text-decoration: none;">contact@flyingwonders.net</a><br />
          <strong>Website:</strong> <a href="http://www.flyingwonders.net" style="color: #800020; text-decoration: underline;">http://www.flyingwonders.net</a>
        </div>
        
        <div style="background-color: #F1F5F9; border-left: 3px solid #800020; padding: 8px 12px; margin: 12px 0 16px 0; font-size: 11px; color: #475569; line-height: 1.5;">
          <strong>Product Portfolio:</strong> Travel Assistance | Visas | Accommodations | Land Packages | Air Ticketing | Global Attraction Tickets &amp; Cruises
        </div>
        
        <!-- Official Accreditations Badge Banner (Centered) -->
        <div style="margin-top: 18px; text-align: center;">
          <img src="https://flyingwonders.net/images/voucher-footer-accreditations.png" alt="Accreditations: ISO 9001, ISO 27001, TAAI, TOA, nidhi+, D-U-N-S" style="max-width: 100%; width: 440px; height: auto; display: block; margin: 0 auto; border: 0;" />
        </div>
      </div>
    `
  }

  const isTopImage = data.heroImagePosition !== 'below-intro'

  return `
    ${isTopImage ? heroImageHtml : ''}
    ${data.greeting ? `<h3 style="margin: 0 0 12px 0; font-size: 18px; color: #0F172A; font-weight: 700;">${data.greeting}</h3>` : ''}
    ${data.headline ? `<h2 style="margin: 0 0 18px 0; font-size: 20px; color: #800020; font-weight: 800; line-height: 1.35;">${data.headline}</h2>` : ''}
    ${paragraphs}
    ${!isTopImage ? heroImageHtml : ''}
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
  const [formPreheader, setFormPreheader] = useState('')
  
  // Visual Builder Form State
  const [structuredData, setStructuredData] = useState<StructuredCampaignData>(DEFAULT_STRUCTURED_DATA)
  // Raw HTML Form State
  const [rawHtmlContent, setRawHtmlContent] = useState('')

  // Image Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Full Screen Preview Modal State
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null)

  // Test Send State
  const [testEmail, setTestEmail] = useState('info.flyingwonders@gmail.com')
  const [sendingTestId, setSendingTestId] = useState<string | null>(null)
  const [testSendResult, setTestSendResult] = useState<string | null>(null)

  // Targeted Audience Dispatch Modal State
  const [dispatchModalCampaign, setDispatchModalCampaign] = useState<Campaign | null>(null)
  const [targetAudience, setTargetAudience] = useState<'all' | 'b2b' | 'b2c' | 'new' | 'tag' | 'custom'>('all')
  const [selectedDispatchTag, setSelectedDispatchTag] = useState('')
  const [customEmailsInput, setCustomEmailsInput] = useState('')
  const [dispatchBatchLimit, setDispatchBatchLimit] = useState<'all' | '1000' | '500' | '250' | '100' | '50' | 'custom'>('1000')
  const [customBatchLimitInput, setCustomBatchLimitInput] = useState('500')
  const [dispatchSkipSent, setDispatchSkipSent] = useState(true)
  const [isDispatchingModal, setIsDispatchingModal] = useState(false)
  const [dispatchModalFeedback, setDispatchModalFeedback] = useState<{ success: boolean; message: string; remaining?: number } | null>(null)

  // Dispatcher Engine State: 'ses' (Amazon SES) | 'brevo' (Brevo Free Waves)
  const [selectedDispatcher, setSelectedDispatcher] = useState<'ses' | 'brevo'>('ses')

  // Live Amazon SES State
  const [sesInfo, setSesInfo] = useState<{
    configured: boolean
    region: string
    fromEmail: string
    quota: {
      max24HourSend: number
      maxSendRate: number
      sentLast24Hours: number
    } | null
  } | null>(null)

  // Live Brevo Account Quota State
  const [brevoQuota, setBrevoQuota] = useState<{
    planType: string
    dailyLimit: number
    sentToday: number
    remainingCredits: number
    safeRemaining: number
    resetsInHours: number
    resetsAtUtc: string
    campaignsSentToday?: Array<{ title: string; sentCount: number; time: string }>
  } | null>(null)
  const [loadingQuota, setLoadingQuota] = useState(false)

  const fetchQuota = async () => {
    setLoadingQuota(true)
    try {
      const res = await fetch('/api/newsletter/quota?adminEmail=info.flyingwonders@gmail.com')
      const data = await res.json()
      if (data.success) {
        if (data.quota) {
          setBrevoQuota(data.quota)
        }
        if (data.ses) {
          setSesInfo(data.ses)
          if (data.ses.configured) {
            setSelectedDispatcher(prev => prev || 'ses')
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch live quota:', e)
    } finally {
      setLoadingQuota(false)
    }
  }

  // Dispatch History Audit Modal State
  const [historyModalCampaign, setHistoryModalCampaign] = useState<Campaign | null>(null)

  // WhatsApp Copy Feedback State
  const [copiedWhatsAppId, setCopiedWhatsAppId] = useState<string | null>(null)

  // Dispatch Campaign State (Legacy / Global notice)
  const [dispatchingId, setDispatchingId] = useState<string | null>(null)
  const [dispatchResult, setDispatchResult] = useState<string | null>(null)

  // Section Mode: 'campaigns' | 'subscribers'
  const [managerTab, setManagerTab] = useState<'campaigns' | 'subscribers'>('campaigns')

  // Subscribers Management State
  const [subscribersList, setSubscribersList] = useState<any[]>([])
  const [loadingSubscribers, setLoadingSubscribers] = useState(false)
  const [subscriberSearch, setSubscriberSearch] = useState('')
  const [subscriberFilterAudience, setSubscriberFilterAudience] = useState('all')
  const [subscriberFilterSource, setSubscriberFilterSource] = useState('all')
  const [subscriberFilterStatus, setSubscriberFilterStatus] = useState('all')
  const [subscriberPage, setSubscriberPage] = useState(1)
  const SUBSCRIBERS_PER_PAGE = 50

  // Unique Source / Event Tags found in subscribers database (aggregated & deduplicated)
  const availableSourceTags = useMemo(() => {
    const tagMap = new Map<string, { tag: string; activeCount: number }>()
    for (const sub of subscribersList) {
      if (!sub.source) continue
      const rawTags = sub.source.split(',').map((t: string) => t.trim()).filter(Boolean)
      for (const rawTag of rawTags) {
        const key = rawTag.toLowerCase()
        const existing = tagMap.get(key)
        const isAct = sub.isActive ? 1 : 0
        if (existing) {
          existing.activeCount += isAct
        } else {
          tagMap.set(key, { tag: rawTag, activeCount: isAct })
        }
      }
    }
    return Array.from(tagMap.values())
      .sort((a, b) => b.activeCount - a.activeCount)
  }, [subscribersList])

  // Live Multi-Wave & Brevo Batch Breakdown Calculation (Live Quota-Aware)
  const dispatchAudienceStats = useMemo(() => {
    if (!dispatchModalCampaign) {
      return {
        total: 0,
        alreadySent: 0,
        eligible: 0,
        toSendNow: 0,
        desiredSend: 0,
        remainingAfter: 0,
        totalWaves: 1,
        quotaExceeded: false,
        maxCanSendToday: 250,
        remainingDailyCredits: 250
      }
    }

    const sentList = dispatchModalCampaign.dispatchedEmails || []
    const sentSet = new Set(sentList.map((e: string) => e.toLowerCase().trim()))

    let matching: any[] = []
    if (targetAudience === 'custom') {
      const list = customEmailsInput
        .split(/[\n,;]+/)
        .map(e => e.trim().toLowerCase())
        .filter(e => e.includes('@'))
      const unique = Array.from(new Set(list))
      matching = unique.map(e => ({ email: e }))
    } else if (targetAudience === 'tag') {
      const t = (selectedDispatchTag || '').trim().toLowerCase()
      matching = subscribersList.filter(s => {
        if (!s.isActive || !s.source) return false
        const tags = s.source.split(',').map((x: string) => x.trim().toLowerCase())
        return t ? (tags.includes(t) || s.source.toLowerCase().includes(t)) : true
      })
    } else if (targetAudience === 'b2b') {
      matching = subscribersList.filter(s => s.isActive && (s.audienceType === 'b2b' || !s.audienceType))
    } else if (targetAudience === 'b2c') {
      matching = subscribersList.filter(s => s.isActive && s.audienceType === 'b2c')
    } else if (targetAudience === 'new') {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
      matching = subscribersList.filter(s => s.isActive && (new Date(s.subscribedAt || s._createdAt || 0).getTime() >= thirtyDaysAgo))
    } else {
      matching = subscribersList.filter(s => s.isActive)
    }

    const total = matching.length
    const alreadySent = matching.filter(s => sentSet.has((s.email || '').toLowerCase().trim())).length
    const eligible = dispatchSkipSent ? Math.max(0, total - alreadySent) : total

    const isUsingSes = selectedDispatcher === 'ses' && (sesInfo?.configured ?? true)

    // Account-wide live quota calculations:
    const remainingDailyCredits = brevoQuota ? brevoQuota.remainingCredits : 250
    const maxCanSendToday = isUsingSes ? eligible : Math.max(0, remainingDailyCredits)

    const rawLimit = dispatchBatchLimit === 'all'
      ? (isUsingSes ? Math.min(eligible, 1000) : eligible)
      : dispatchBatchLimit === 'custom'
        ? (parseInt(customBatchLimitInput, 10) || (isUsingSes ? Math.min(eligible, 1000) : 250))
        : (parseInt(dispatchBatchLimit, 10) || (isUsingSes ? Math.min(eligible, 1000) : 250))

    const desiredSend = Math.min(eligible, Math.max(0, rawLimit))
    const quotaExceeded = !isUsingSes && brevoQuota ? desiredSend > remainingDailyCredits : false

    // Effective number to send today: capped by Brevo credits only if Brevo is active
    const toSendNow = isUsingSes ? desiredSend : (brevoQuota ? Math.min(desiredSend, remainingDailyCredits) : desiredSend)
    const remainingAfter = Math.max(0, eligible - toSendNow)
    const totalWaves = toSendNow > 0 ? Math.ceil(eligible / toSendNow) : 1

    return {
      total,
      alreadySent,
      eligible,
      toSendNow,
      desiredSend,
      remainingAfter,
      totalWaves,
      quotaExceeded,
      maxCanSendToday,
      remainingDailyCredits,
      isUsingSes
    }
  }, [
    dispatchModalCampaign,
    targetAudience,
    selectedDispatchTag,
    customEmailsInput,
    subscribersList,
    dispatchSkipSent,
    dispatchBatchLimit,
    customBatchLimitInput,
    brevoQuota,
    selectedDispatcher,
    sesInfo
  ])

  // Add Subscriber Form
  const [isAddingSub, setIsAddingSub] = useState(false)
  const [newSubEmail, setNewSubEmail] = useState('')
  const [newSubName, setNewSubName] = useState('')
  const [newSubCompany, setNewSubCompany] = useState('')
  const [newSubAudience, setNewSubAudience] = useState<'b2b' | 'b2c' | 'lead'>('b2b')
  const [subActionFeedback, setSubActionFeedback] = useState<string | null>(null)

  // Bulk Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importTab, setImportTab] = useState<'csv' | 'chat' | 'text'>('csv')
  const [importAudience, setImportAudience] = useState<'b2b' | 'b2c' | 'lead'>('b2b')
  const [importDualSyncLeads, setImportDualSyncLeads] = useState(true)
  const [importSourceTag, setImportSourceTag] = useState('b2b_audience_import')
  const [importCity, setImportCity] = useState('')
  const [importText, setImportText] = useState('')
  const [parsedImportSubscribers, setParsedImportSubscribers] = useState<ParsedContact[]>([])
  const [importFilterQuery, setImportFilterQuery] = useState('')
  const [isParsingImport, setIsParsingImport] = useState(false)
  const [isSyncingImport, setIsSyncingImport] = useState(false)
  const [importSyncFeedback, setImportSyncFeedback] = useState<string | null>(null)
  const [importSyncProgress, setImportSyncProgress] = useState<{
    current: number
    total: number
    percent: number
    message?: string
  } | null>(null)
  const [stagingPage, setStagingPage] = useState(1)
  const STAGING_PAGE_SIZE = 100

  const filteredParsedSubscribers = useMemo(() => {
    if (!importFilterQuery.trim()) return parsedImportSubscribers
    const q = importFilterQuery.toLowerCase()
    return parsedImportSubscribers.filter(s =>
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.company && s.company.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.city && s.city.toLowerCase().includes(q))
    )
  }, [parsedImportSubscribers, importFilterQuery])

  const totalStagingPages = Math.max(1, Math.ceil(filteredParsedSubscribers.length / STAGING_PAGE_SIZE))
  const pagedSubscribers = useMemo(() => {
    const start = (stagingPage - 1) * STAGING_PAGE_SIZE
    return filteredParsedSubscribers.slice(start, start + STAGING_PAGE_SIZE)
  }, [filteredParsedSubscribers, stagingPage])

  // Real-time compiled HTML for editor preview
  const liveCompiledHtml = useMemo(() => {
    if (editorMode === 'visual') {
      return compileEmailHtml(structuredData)
    }
    return rawHtmlContent
  }, [editorMode, structuredData, rawHtmlContent])

  const fetchSubscribersFull = async () => {
    setLoadingSubscribers(true)
    try {
      const res = await fetch('/api/newsletter/subscribe?full=true')
      const data = await res.json()
      if (data.success) {
        setSubscribersList(data.subscribers || [])
        setSubscriberCount((data.subscribers || []).filter((s: any) => s.isActive).length)
      }
    } catch (err) {
      console.error('Failed to fetch full subscribers:', err)
    } finally {
      setLoadingSubscribers(false)
    }
  }

  const fetchCampaigns = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/newsletter/campaigns?adminEmail=info.flyingwonders@gmail.com')
      const data = await res.json()
      if (data.success) {
        setCampaigns(data.campaigns || [])
        setSubscriberCount(data.subscriberCount || 0)
        if (data.quota) {
          setBrevoQuota(data.quota)
        }
        if (data.ses) {
          setSesInfo(data.ses)
          if (data.ses.configured) {
            setSelectedDispatcher('ses')
          }
        }
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
    fetchSubscribersFull()
  }, [])

  useEffect(() => {
    if (targetAudience === 'tag' && !selectedDispatchTag && availableSourceTags.length > 0) {
      setSelectedDispatchTag(availableSourceTags[0].tag)
    }
  }, [targetAudience, selectedDispatchTag, availableSourceTags])

  const handleOpenNew = () => {
    setEditingCampaignId(null)
    setFormTitle('Singapore Seasonal Escapes')
    setFormSubject('🌟 Exclusive: Singapore Hidden Gems & DMC Rates for Your Trip')
    setFormPreheader('DMC nett rates & seasonal packages for your Singapore journey')
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
    setFormPreheader(c.preheader || '')
    setRawHtmlContent(c.content)

    if (c.structuredData) {
      try {
        const parsed = JSON.parse(c.structuredData)
        setStructuredData({
          ...DEFAULT_STRUCTURED_DATA,
          ...parsed,
        })
        setEditorMode('visual')
      } catch (e) {
        setEditorMode('raw')
      }
    } else {
      setEditorMode('raw')
    }

    setSaveMessage(null)
    setIsEditorOpen(true)
  }

  const handleDuplicateCampaign = (c: Campaign) => {
    setEditingCampaignId(null)
    setFormTitle(`${c.title} (Copy)`)
    setFormSubject(c.subject)
    setFormPreheader(c.preheader || '')
    setRawHtmlContent(c.content)

    if (c.structuredData) {
      try {
        const parsed = JSON.parse(c.structuredData)
        setStructuredData({
          ...DEFAULT_STRUCTURED_DATA,
          ...parsed,
        })
        setEditorMode('visual')
      } catch (e) {
        setEditorMode('raw')
      }
    } else {
      setEditorMode('raw')
    }

    setSaveMessage(null)
    setIsEditorOpen(true)
  }

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    if (confirm(`Apply the "${preset.name}" preset? This will populate the editor with this template's fields.`)) {
      setFormTitle(preset.title)
      setFormSubject(preset.subject)
      setFormPreheader(preset.data.headline || '')
      setStructuredData(preset.data)
      setRawHtmlContent(compileEmailHtml(preset.data))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    setImageUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/newsletter/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.success && data.url) {
        setStructuredData(prev => ({
          ...prev,
          heroImage: data.url,
          heroImageAlt: file.name.replace(/\.[^/.]+$/, '')
        }))
      } else {
        throw new Error(data.error || 'Failed to upload image')
      }
    } catch (err: any) {
      setImageUploadError(err.message || 'Image upload failed')
    } finally {
      setIsUploadingImage(false)
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
        preheader: formPreheader,
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
    if (!confirm(`Are you sure you want to delete the template "${title}"?`)) return
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

  const handleOpenDispatchModal = (c: Campaign) => {
    setDispatchModalCampaign(c)
    setTargetAudience('all')
    setSelectedDispatchTag('')
    setCustomEmailsInput('')
    setDispatchSkipSent(true)
    setDispatchModalFeedback(null)
    const preferSes = sesInfo?.configured ?? true
    setSelectedDispatcher(preferSes ? 'ses' : 'brevo')
    setDispatchBatchLimit(preferSes ? '1000' : '250')
    setCustomBatchLimitInput(preferSes ? '1000' : '250')
    fetchQuota()
    if (subscribersList.length === 0) {
      fetchSubscribersFull()
    }
  }

  const handleExecuteDispatch = async () => {
    if (!dispatchModalCampaign) return

    if (targetAudience === 'tag' && !selectedDispatchTag.trim()) {
      alert('Please select an event tag to target.')
      return
    }

    if (targetAudience === 'custom') {
      const emailList = customEmailsInput
        .split(/[\n,;]+/)
        .map(e => e.trim())
        .filter(e => e.length > 0 && e.includes('@'))
      if (emailList.length === 0) {
        alert('Please enter at least one valid recipient email address.')
        return
      }
    }

    const isUsingSes = selectedDispatcher === 'ses'
    const effectiveLimit = dispatchBatchLimit === 'all'
      ? (isUsingSes ? 1000 : undefined)
      : dispatchBatchLimit === 'custom'
        ? (parseInt(customBatchLimitInput, 10) || (isUsingSes ? 1000 : 250))
        : parseInt(dispatchBatchLimit, 10)

    setIsDispatchingModal(true)
    setDispatchModalFeedback(null)

    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: dispatchModalCampaign._id,
          adminEmail: 'info.flyingwonders@gmail.com',
          targetAudience,
          sourceTag: targetAudience === 'tag' ? selectedDispatchTag.trim() : undefined,
          customEmails: targetAudience === 'custom' ? customEmailsInput : undefined,
          batchLimit: effectiveLimit,
          skipPreviouslySent: dispatchSkipSent,
          dispatcher: selectedDispatcher,
        })
      })
      const data = await res.json()
      if (data.success) {
        const remaining = typeof data.remainingAfterBatch === 'number' ? data.remainingAfterBatch : 0
        const viaTag = selectedDispatcher === 'ses' ? ' via Amazon SES' : ' via Brevo'
        const waveNotice = remaining > 0
          ? `🎉 Dispatched${viaTag}! Successfully sent to ${data.sentCount} recipient(s). ${remaining} contact(s) remaining for next wave.`
          : `🎉 Successfully dispatched${viaTag} to all ${data.sentCount} recipient(s)! All eligible contacts have received this campaign.`

        setDispatchModalFeedback({
          success: true,
          message: waveNotice,
          remaining
        })
        await Promise.all([fetchCampaigns(), fetchSubscribersFull(), fetchQuota()])
        setTimeout(() => {
          setDispatchModalCampaign(null)
          setDispatchModalFeedback(null)
        }, 3200)
      } else {
        throw new Error(data.error || 'Failed to dispatch campaign')
      }
    } catch (err: any) {
      setDispatchModalFeedback({
        success: false,
        message: `Dispatch Error: ${err.message}`
      })
    } finally {
      setIsDispatchingModal(false)
    }
  }

  const handleCopyWhatsAppText = async (c: Campaign) => {
    let headline = c.subject || c.title
    let text = `*🌟 ${headline}*\n\n`

    if (c.structuredData) {
      try {
        const data: StructuredCampaignData = JSON.parse(c.structuredData)
        if (data.bodyText) {
          text += `${data.bodyText}\n\n`
        }
        if (data.highlights && data.highlights.length > 0) {
          text += `*Key Highlights & Inclusions:*\n`
          data.highlights.forEach(h => {
            text += `• *${h.title}*: ${h.desc}\n`
          })
          text += `\n`
        }
        if (data.ctaUrl) {
          text += `👉 *${data.ctaText || 'Learn More / Book Now'}:* ${data.ctaUrl}\n\n`
        }
      } catch {
        text += `${c.content.replace(/<[^>]+>/g, '').trim()}\n\n`
      }
    } else {
      text += `${c.content.replace(/<[^>]+>/g, '').trim()}\n\n`
    }

    text += `_Flying Wonders - Singapore & India Specialist DMC_\n📲 Chat directly on WhatsApp: https://wa.me/6594722830?text=${encodeURIComponent(`Hi Flying Wonders, I received your update regarding: ${c.subject}`)}`

    try {
      await navigator.clipboard.writeText(text)
      setCopiedWhatsAppId(c._id)
      setTimeout(() => setCopiedWhatsAppId(null), 3000)
    } catch (err) {
      console.error('Copy failed:', err)
      alert('Could not copy automatically. Please copy manually.')
    }
  }

  const handleToggleSubscriberStatus = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentActive }),
      })
      const data = await res.json()
      if (data.success) {
        setSubscribersList(prev => prev.map(s => s._id === id ? { ...s, isActive: !currentActive } : s))
        setSubActionFeedback(`Subscriber status updated to ${!currentActive ? 'Active' : 'Inactive'}.`)
        setSubscriberCount(prev => (!currentActive ? prev + 1 : Math.max(0, prev - 1)))
        setTimeout(() => setSubActionFeedback(null), 3000)
      }
    } catch (err: any) {
      alert(`Failed to update subscriber: ${err.message}`)
    }
  }

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete subscriber "${email}"? This cannot be undone.`)) return
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.success) {
        setSubscribersList(prev => prev.filter(s => s._id !== id))
        setSubscriberCount(prev => Math.max(0, prev - 1))
        setSubActionFeedback(`Subscriber "${email}" removed.`)
        setTimeout(() => setSubActionFeedback(null), 3000)
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  const handleAddSubscriberSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubEmail || !newSubEmail.includes('@')) {
      alert('Please enter a valid email address.')
      return
    }
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newSubEmail.trim().toLowerCase(),
          name: newSubName.trim() || undefined,
          company: newSubCompany.trim() || undefined,
          audienceType: newSubAudience,
          source: 'admin_dashboard',
          skipWelcomeEmail: true,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSubActionFeedback(`✅ ${data.message || 'Subscriber added successfully!'}`)
        setNewSubEmail('')
        setNewSubName('')
        setNewSubCompany('')
        setIsAddingSub(false)
        await fetchSubscribersFull()
        setTimeout(() => setSubActionFeedback(null), 4000)
      } else {
        alert(data.error || 'Failed to add subscriber')
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const filteredSubscribers = useMemo(() => {
    return subscribersList.filter(s => {
      if (subscriberSearch) {
        const q = subscriberSearch.toLowerCase()
        const match = (s.email && s.email.toLowerCase().includes(q)) ||
                      (s.name && s.name.toLowerCase().includes(q)) ||
                      (s.company && s.company.toLowerCase().includes(q)) ||
                      (s.source && s.source.toLowerCase().includes(q))
        if (!match) return false
      }
      if (subscriberFilterAudience !== 'all') {
        if ((s.audienceType || 'b2b') !== subscriberFilterAudience) return false
      }
      if (subscriberFilterSource !== 'all') {
        if (!s.source || !s.source.toLowerCase().includes(subscriberFilterSource.toLowerCase())) return false
      }
      if (subscriberFilterStatus !== 'all') {
        if (subscriberFilterStatus === 'active' && !s.isActive) return false
        if (subscriberFilterStatus === 'inactive' && s.isActive) return false
      }
      return true
    })
  }, [subscribersList, subscriberSearch, subscriberFilterAudience, subscriberFilterSource, subscriberFilterStatus])

  const totalSubscriberPages = Math.max(1, Math.ceil(filteredSubscribers.length / SUBSCRIBERS_PER_PAGE))
  const pagedSubscribersList = useMemo(() => {
    const start = (subscriberPage - 1) * SUBSCRIBERS_PER_PAGE
    return filteredSubscribers.slice(start, start + SUBSCRIBERS_PER_PAGE)
  }, [filteredSubscribers, subscriberPage])

  const handleExportSubscribers = () => {
    const list = filteredSubscribers.length > 0 ? filteredSubscribers : subscribersList
    if (list.length === 0) {
      alert('No subscribers available to export.')
      return
    }
    const exportRows = list.map(s => ({
      'Email': s.email,
      'Name': s.name || '',
      'Company': s.company || '',
      'Audience Type': s.audienceType === 'b2b' ? 'B2B Partner' : (s.audienceType === 'b2c' ? 'B2C Website' : 'Lead'),
      'Source / Event Tag': s.source || 'website',
      'Status': s.isActive ? 'Active' : 'Inactive',
      'Date Subscribed': s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString() : (s._createdAt ? new Date(s._createdAt).toLocaleDateString() : '')
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportRows)
    XLSX.utils.book_append_sheet(wb, ws, 'Subscribers')
    XLSX.writeFile(wb, `FlyingWonders_Subscribers_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  // ── BULK IMPORT HANDLERS ──
  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsParsingImport(true)
    setImportSyncFeedback(null)
    try {
      const buffer = await file.arrayBuffer()
      const results = parseSpreadsheetBuffer(buffer, {
        defaultAudience: importAudience,
        sourceTag: importSourceTag || 'csv_import'
      })
      setParsedImportSubscribers(results)
    } catch (err: any) {
      alert(`Failed to parse spreadsheet: ${err.message}`)
    } finally {
      setIsParsingImport(false)
    }
  }

  const handleChatFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsParsingImport(true)
    setImportSyncFeedback(null)
    try {
      const text = await file.text()
      const results = parseWhatsAppChatText(text, {
        defaultAudience: importAudience,
        sourceTag: importSourceTag || 'whatsapp_chat'
      })
      setParsedImportSubscribers(results)
    } catch (err: any) {
      alert(`Chat parse error: ${err.message}`)
    } finally {
      setIsParsingImport(false)
    }
  }

  const handleRawTextParse = () => {
    if (!importText.trim()) return
    setIsParsingImport(true)
    setImportSyncFeedback(null)
    try {
      const results = parseRawContactText(importText, {
        defaultAudience: importAudience,
        defaultCity: importCity,
        sourceTag: importSourceTag || 'manual_text_paste'
      })
      setParsedImportSubscribers(results)
    } catch (err: any) {
      alert(`Text parse error: ${err.message}`)
    } finally {
      setIsParsingImport(false)
    }
  }

  const handleLoadSamplePaste = () => {
    setImportText(`M/S Marshall Tours N Travels   packages@marshalltravel.in   9538683939   Bangalore
M/S Bhalaji Tours & Travels    sribhalajitravels1@gmail.com 9845857147   Chennai
M/S Travel Innovations   info@bestbus.in 8121115444   Hyderabad
Rajesh Sharma | Skyway Travels Bangalore | info@skyway.com | 9845012345 | IATA
Priya Nair | Wanderlust Corporate Desk | priya@wanderlust.co.in | +919876543210 | Mumbai`)
  }

  const handleUpdateParsedSub = (idx: number, field: keyof ParsedContact, val: string) => {
    setParsedImportSubscribers(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: val }
      return next
    })
  }

  const handleDeleteParsedSub = (idx: number) => {
    setParsedImportSubscribers(prev => prev.filter((_, i) => i !== idx))
  }

  const handleExportParsedSubscribers = () => {
    if (parsedImportSubscribers.length === 0) return
    const exportRows = parsedImportSubscribers.map(s => ({
      'Email': s.email || '',
      'Name': s.name || '',
      'Company': s.company || '',
      'Phone': s.phone || '',
      'City': s.city || '',
      'Audience Group': s.audienceType || 'b2b',
      'Source': s.source || '',
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportRows)
    XLSX.utils.book_append_sheet(wb, ws, 'Staging Subscribers')
    XLSX.writeFile(wb, `Parsed_Subscribers_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const handleSyncImportToSubscribers = async () => {
    if (parsedImportSubscribers.length === 0) return
    setIsSyncingImport(true)
    setImportSyncFeedback(null)

    const BATCH_SIZE = 150
    const total = parsedImportSubscribers.length
    let totalSynced = 0

    try {
      for (let i = 0; i < total; i += BATCH_SIZE) {
        const chunk = parsedImportSubscribers.slice(i, i + BATCH_SIZE)
        const currentProgress = Math.min(i + chunk.length, total)
        const percent = Math.round((currentProgress / total) * 100)

        setImportSyncProgress({
          current: currentProgress,
          total,
          percent,
          message: `Ingesting contacts ${currentProgress.toLocaleString()} of ${total.toLocaleString()} (${percent}%)...`
        })

        // Retry loop for resilience against transient network hiccups
        let attempts = 0
        let batchSuccess = false

        while (attempts < 2 && !batchSuccess) {
          attempts++
          try {
            const res = await fetch('/api/newsletter/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subscribers: chunk,
                dualSyncLeads: importDualSyncLeads,
                skipWelcomeEmail: true,
              }),
            })

            if (!res.ok) {
              const text = await res.text().catch(() => '')
              let msg = `HTTP ${res.status}`
              try {
                const j = JSON.parse(text)
                if (j.error) msg = j.error
              } catch {
                if (res.status === 413) msg = 'Payload too large for server'
                else if (res.status === 504) msg = 'Server timeout'
                else if (text.length > 0 && text.length < 150) msg = text
              }
              if (attempts < 2) {
                await new Promise(r => setTimeout(r, 1200))
                continue
              }
              throw new Error(`Batch (${i + 1}-${currentProgress}) failed: ${msg}`)
            }

            const data = await res.json()
            if (!data.success && data.error) {
              throw new Error(data.error)
            }

            totalSynced += (data.syncedCount !== undefined ? data.syncedCount : chunk.length)
            batchSuccess = true
          } catch (fetchErr: any) {
            if (attempts >= 2) throw fetchErr
            await new Promise(r => setTimeout(r, 1200))
          }
        }
      }

      setImportSyncFeedback(`✅ Successfully imported and synchronized all ${totalSynced.toLocaleString()} contacts!${importDualSyncLeads ? ' (And dual-synced to Marketing Leads)' : ''}`)
      await fetchSubscribersFull()
      setImportSyncProgress(null)
      setTimeout(() => {
        setIsImportModalOpen(false)
        setParsedImportSubscribers([])
        setImportSyncFeedback(null)
        setImportText('')
      }, 2400)
    } catch (err: any) {
      setImportSyncFeedback(`❌ Error: ${err.message}`)
    } finally {
      setIsSyncingImport(false)
      setImportSyncProgress(null)
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
                Upload banners, compose visually with your official signature &amp; badges, preview, and dispatch via Amazon SES or Brevo.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
            <Users size={15} color="#800020" />
            <span>Active Subscribers: <strong style={{ color: '#0F172A' }}>{subscriberCount}</strong></span>
          </div>

          {sesInfo?.configured ? (
            <div
              title={`Amazon SES Active (${sesInfo.region} • ${sesInfo.fromEmail})`}
              style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#166534', fontWeight: 700 }}
            >
              <span style={{ fontSize: '0.95rem' }}>🚀</span>
              <span>Amazon SES Active</span>
            </div>
          ) : (
            <div
              title="Brevo Free Tier Safe Waves"
              style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#1E40AF', fontWeight: 700 }}
            >
              <span>🛡️</span>
              <span>Brevo Free: {brevoQuota ? `${brevoQuota.remainingCredits}/300` : '300/day'}</span>
            </div>
          )}

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

      {/* View Switcher: Campaigns vs Subscribers Audience */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setManagerTab('campaigns')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: managerTab === 'campaigns' ? '#800020' : '#F1F5F9',
            color: managerTab === 'campaigns' ? '#FFF' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Mail size={15} />
          <span>Email Campaigns & Templates ({campaigns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setManagerTab('subscribers')
            fetchSubscribersFull()
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: managerTab === 'subscribers' ? '#800020' : '#F1F5F9',
            color: managerTab === 'subscribers' ? '#FFF' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Users size={15} />
          <span>Subscribers Audience ({subscriberCount})</span>
        </button>
      </div>

      {/* ── VIEW 1: EMAIL CAMPAIGNS & TEMPLATES ── */}
      {managerTab === 'campaigns' && (
        <div>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
              {campaigns.map((c) => {
                const isDispatched = (c.dispatchCount && c.dispatchCount > 0) || c.status === 'sent'
                const dispatchTimes = c.dispatchCount || (c.status === 'sent' ? 1 : 0)
                return (
                  <div
                    key={c._id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      position: 'relative'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1E293B' }}>
                          {c.title}
                        </h4>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: isDispatched ? '#ECFDF5' : '#F1F5F9',
                            color: isDispatched ? '#065F46' : '#475569',
                            border: `1px solid ${isDispatched ? '#A7F3D0' : '#CBD5E1'}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {isDispatched ? <CheckCheck size={12} /> : <FileText size={12} />}
                          {isDispatched ? `Dispatched (${dispatchTimes}x)` : 'Reusable Template'}
                        </span>
                      </div>

                      <p style={{ margin: '0 0 6px 0', fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <Mail size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span><strong style={{ color: '#334155' }}>Subject:</strong> {c.subject}</span>
                      </p>

                      {c.preheader && (
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#64748B', fontStyle: 'italic', paddingLeft: '20px' }}>
                          Snippet: {c.preheader}
                        </p>
                      )}

                      {isDispatched && (
                        <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', fontSize: '0.74rem', color: '#475569', marginBottom: '14px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Last Dispatched:</span>
                            <strong>{formatDateSafe(c.lastSentAt || c.sentAt)}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Last Recipients:</span>
                            <strong>{c.lastSentToCount ?? c.sentToCount ?? 0} delivered</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total Launches:</span>
                            <span style={{ color: '#800020', fontWeight: 700 }}>{dispatchTimes} broadcast{dispatchTimes > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginTop: '8px' }}>
                      <button
                        onClick={() => setPreviewCampaign(c)}
                        style={{ padding: '6px 11px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Eye size={13} />
                        Preview
                      </button>

                      <button
                        onClick={() => handleOpenEdit(c)}
                        style={{ padding: '6px 11px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#92400E', display: 'flex', alignItems: 'center', gap: '5px' }}
                        title="Edit template fields, layout, and copy"
                      >
                        <Edit3 size={13} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleSendTestEmail(c.subject, c.content, c._id)}
                        disabled={sendingTestId === c._id}
                        style={{ padding: '6px 11px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '5px' }}
                        title={`Send test to ${testEmail}`}
                      >
                        <Send size={13} className={sendingTestId === c._id ? 'animate-spin' : ''} />
                        {sendingTestId === c._id ? 'Sending...' : 'Test Send'}
                      </button>

                      <button
                        onClick={() => handleOpenDispatchModal(c)}
                        style={{ padding: '6px 13px', background: '#800020', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}
                        title="Launch targeted email broadcast"
                      >
                        <Send size={13} />
                        Dispatch 🚀
                      </button>

                      <button
                        onClick={() => setHistoryModalCampaign(c)}
                        style={{ padding: '6px 10px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}
                        title="View dispatch history and audit logs"
                      >
                        <History size={13} />
                        History ({dispatchTimes})
                      </button>

                      <button
                        onClick={() => handleCopyWhatsAppText(c)}
                        style={{ padding: '6px 10px', background: copiedWhatsAppId === c._id ? '#DCFCE7' : '#F0FDF4', border: `1px solid ${copiedWhatsAppId === c._id ? '#86EFAC' : '#BBF7D0'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: copiedWhatsAppId === c._id ? '#15803D' : '#166534', display: 'flex', alignItems: 'center', gap: '5px' }}
                        title="Copy WhatsApp-formatted text with direct chat links"
                      >
                        {copiedWhatsAppId === c._id ? <Check size={13} color="#15803D" /> : <Copy size={13} color="#166534" />}
                        {copiedWhatsAppId === c._id ? 'Copied!' : 'WhatsApp'}
                      </button>

                      <button
                        onClick={() => handleDuplicateCampaign(c)}
                        style={{ padding: '6px 9px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}
                        title="Duplicate into a new template draft"
                      >
                        Duplicate
                      </button>

                      <button
                        onClick={() => handleDeleteCampaign(c._id, c.title)}
                        style={{ padding: '6px 8px', background: '#FFF', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer', color: '#DC2626', marginLeft: 'auto' }}
                        title="Delete template"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 2: SUBSCRIBERS AUDIENCE LIST ── */}
      {managerTab === 'subscribers' && (
        <div>
          {/* Action Feedback */}
          {subActionFeedback && (
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', color: '#065F46', fontWeight: 700, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>{subActionFeedback}</span>
            </div>
          )}

          {/* Controls Bar: Search, Filters, Add, Export */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
              <Search size={15} color="#64748B" />
              <input
                type="text"
                value={subscriberSearch}
                onChange={(e) => {
                  setSubscriberSearch(e.target.value)
                  setSubscriberPage(1)
                }}
                placeholder="Search by email, name, or company..."
                style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.82rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={subscriberFilterAudience}
                onChange={(e) => {
                  setSubscriberFilterAudience(e.target.value)
                  setSubscriberPage(1)
                }}
                style={{ padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.82rem', background: '#FFF', color: '#0F172A' }}
              >
                <option value="all">All Audiences</option>
                <option value="b2b">🏢 B2B Travel Partners</option>
                <option value="b2c">🌐 B2C Website Subscribers</option>
                <option value="lead">🎯 Leads / Inquiries</option>
              </select>

              <select
                value={subscriberFilterStatus}
                onChange={(e) => {
                  setSubscriberFilterStatus(e.target.value)
                  setSubscriberPage(1)
                }}
                style={{ padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.82rem', background: '#FFF', color: '#0F172A' }}
              >
                <option value="all">All Statuses</option>
                <option value="active">🟢 Active</option>
                <option value="inactive">🔴 Inactive / Unsubscribed</option>
              </select>

              <select
                value={subscriberFilterSource}
                onChange={(e) => {
                  setSubscriberFilterSource(e.target.value)
                  setSubscriberPage(1)
                }}
                style={{ padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.82rem', background: '#FFF', color: '#0F172A', maxWidth: '200px' }}
                title="Filter by Event or Source Tag"
              >
                <option value="all">🎪 All Events &amp; Sources</option>
                {availableSourceTags.map(({ tag, activeCount }) => (
                  <option key={tag} value={tag}>
                    🎪 {tag} ({activeCount})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(true)
                  setImportSyncFeedback(null)
                }}
                style={{
                  padding: '6px 14px',
                  background: '#0F4C3A',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(15, 76, 58, 0.15)'
                }}
                title="Bulk import from Excel, WhatsApp, or pasted contacts"
              >
                <Sparkles size={13} />
                📥 Bulk Import Audience
              </button>

              <button
                type="button"
                onClick={handleExportSubscribers}
                style={{ padding: '6px 12px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                title="Download subscribers list (.xlsx)"
              >
                <Download size={13} color="#0F4C3A" />
                Export (.xlsx)
              </button>

              <button
                type="button"
                onClick={() => setIsAddingSub(!isAddingSub)}
                style={{ padding: '6px 14px', background: '#800020', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <UserPlus size={13} />
                {isAddingSub ? 'Cancel' : '+ Add Subscriber'}
              </button>
            </div>
          </div>

          {/* Add Subscriber Inline Form */}
          {isAddingSub && (
            <form onSubmit={handleAddSubscriberSubmit} style={{ background: '#FFF', border: '1px solid #FECACA', borderRadius: '10px', padding: '16px', marginBottom: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 800, color: '#800020' }}>
                Add Contact to Newsletter Subscribers List
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                    Email Address <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newSubEmail}
                    onChange={(e) => setNewSubEmail(e.target.value)}
                    placeholder="contact@agency.com"
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                    Contact Name:
                  </label>
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                    Company / Agency:
                  </label>
                  <input
                    type="text"
                    value={newSubCompany}
                    onChange={(e) => setNewSubCompany(e.target.value)}
                    placeholder="e.g. Royal Tours"
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                    Audience Group:
                  </label>
                  <select
                    value={newSubAudience}
                    onChange={(e) => setNewSubAudience(e.target.value as any)}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.82rem', background: '#FFF' }}
                  >
                    <option value="b2b">🏢 B2B Travel Partner</option>
                    <option value="b2c">🌐 B2C Website Subscriber</option>
                    <option value="lead">🎯 Lead / Inquiry</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddingSub(false)}
                  style={{ padding: '6px 12px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '6px 16px', background: '#800020', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Subscriber
                </button>
              </div>
            </form>
          )}

          {/* Subscribers Table */}
          {loadingSubscribers ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontSize: '0.88rem' }}>
              Loading subscribers list...
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
              <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>No subscribers match your search or filter criteria.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '10px 14px' }}>Subscriber Email</th>
                    <th style={{ padding: '10px 14px' }}>Contact & Company</th>
                    <th style={{ padding: '10px 14px' }}>Audience Group</th>
                    <th style={{ padding: '10px 14px' }}>Source</th>
                    <th style={{ padding: '10px 14px' }}>Date Subscribed</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                    <th style={{ width: '48px', padding: '10px 10px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedSubscribersList.map((s) => {
                    const isB2B = s.audienceType === 'b2b' || !s.audienceType
                    const dateStr = s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString() : (s._createdAt ? new Date(s._createdAt).toLocaleDateString() : '—')

                    return (
                      <tr key={s._id} style={{ borderBottom: '1px solid #F1F5F9', background: s.isActive ? 'transparent' : '#F8FAFC' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: s.isActive ? '#0F172A' : '#94A3B8' }}>
                          {s.email}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 600, color: '#1E293B' }}>{s.name || '—'}</div>
                          {s.company && <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{s.company}</div>}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: isB2B ? '#EEF2FF' : '#ECFDF5',
                            color: isB2B ? '#4338CA' : '#065F46',
                            border: `1px solid ${isB2B ? '#C7D2FE' : '#A7F3D0'}`
                          }}>
                            {isB2B ? '🏢 B2B Partner' : '🌐 B2C Consumer'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.74rem', color: '#64748B' }}>
                          {s.source || 'website'}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.76rem', color: '#64748B' }}>
                          {dateStr}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleSubscriberStatus(s._id, !!s.isActive)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: `1px solid ${s.isActive ? '#BBF7D0' : '#FECACA'}`,
                              background: s.isActive ? '#DCFCE7' : '#FEE2E2',
                              color: s.isActive ? '#15803D' : '#991B1B'
                            }}
                            title={s.isActive ? 'Click to unsubscribe / deactivate' : 'Click to reactivate'}
                          >
                            {s.isActive ? '🟢 Active' : '🔴 Inactive'}
                          </button>
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubscriber(s._id, s.email)}
                            style={{
                              padding: '5px 7px',
                              background: '#FFF',
                              border: '1px solid #FECACA',
                              borderRadius: '6px',
                              color: '#DC2626',
                              cursor: 'pointer'
                            }}
                            title="Delete subscriber record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div style={{ padding: '12px 16px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  Showing <strong>{pagedSubscribersList.length > 0 ? (subscriberPage - 1) * SUBSCRIBERS_PER_PAGE + 1 : 0}</strong>–<strong>{Math.min(subscriberPage * SUBSCRIBERS_PER_PAGE, filteredSubscribers.length)}</strong> of <strong>{filteredSubscribers.length}</strong> matching ({subscribersList.length} total subscribers)
                </div>
                {totalSubscriberPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      disabled={subscriberPage <= 1}
                      onClick={() => setSubscriberPage(prev => Math.max(1, prev - 1))}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        background: subscriberPage <= 1 ? '#F1F5F9' : '#FFF',
                        color: subscriberPage <= 1 ? '#94A3B8' : '#0F172A',
                        cursor: subscriberPage <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      ← Previous
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600, padding: '0 4px' }}>
                      Page {subscriberPage} of {totalSubscriberPages}
                    </span>
                    <button
                      type="button"
                      disabled={subscriberPage >= totalSubscriberPages}
                      onClick={() => setSubscriberPage(prev => Math.min(totalSubscriberPages, prev + 1))}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        background: subscriberPage >= totalSubscriberPages ? '#F1F5F9' : '#FFF',
                        color: subscriberPage >= totalSubscriberPages ? '#94A3B8' : '#0F172A',
                        cursor: subscriberPage >= totalSubscriberPages ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
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
                  No HTML required. Upload flyer/banner photos, add custom highlights, and your official signature is attached automatically.
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

                  <div style={{ marginBottom: '12px' }}>
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

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Inbox Preheader / Snippet Preview (Optional):
                    </label>
                    <input
                      type="text"
                      value={formPreheader}
                      onChange={(e) => setFormPreheader(e.target.value)}
                      placeholder="e.g. DMC nett rates & exclusive Singapore attractions pass guide inside..."
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem', color: '#0F172A', background: '#FFF' }}
                    />
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', marginTop: '3px' }}>
                      Summary text shown next to or below your subject line in Gmail, Apple Mail &amp; Outlook before opening. Supports <code style={{ color: '#800020' }}>{`{{name}}`}</code> and <code style={{ color: '#800020' }}>{`{{company}}`}</code> tags.
                    </span>
                  </div>
                </div>

                {editorMode === 'visual' ? (
                  <>
                    {/* SECTION: Featured Hero Image / Promo Flyer Upload */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ImageIcon size={16} color="#800020" /> Featured Image / Flyer Banner (Optional)
                        </h4>
                        {structuredData.heroImage && (
                          <button
                            type="button"
                            onClick={() => setStructuredData({ ...structuredData, heroImage: '', heroImageLink: '', heroImageAlt: '' })}
                            style={{ fontSize: '0.72rem', color: '#DC2626', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                          >
                            Remove Image
                          </button>
                        )}
                      </div>

                      {imageUploadError && (
                        <div style={{ padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', color: '#991B1B', fontSize: '0.78rem', marginBottom: '10px' }}>
                          {imageUploadError}
                        </div>
                      )}

                      {structuredData.heroImage ? (
                        <div>
                          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', marginBottom: '10px', background: '#F8FAFC', textAlign: 'center', maxHeight: '200px' }}>
                            <img
                              src={structuredData.heroImage}
                              alt={structuredData.heroImageAlt || 'Campaign preview'}
                              style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748B', marginBottom: '3px' }}>
                                Click-through Link (When user taps image):
                              </label>
                              <input
                                type="text"
                                value={structuredData.heroImageLink || ''}
                                onChange={(e) => setStructuredData({ ...structuredData, heroImageLink: e.target.value })}
                                placeholder="https://flyingwonders.net/custom-package"
                                style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem', background: '#FFF' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748B', marginBottom: '3px' }}>
                                Image Placement:
                              </label>
                              <select
                                value={structuredData.heroImagePosition || 'top'}
                                onChange={(e) => setStructuredData({ ...structuredData, heroImagePosition: e.target.value as any })}
                                style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem', background: '#FFF' }}
                              >
                                <option value="top">Top Header Banner (Above Greeting)</option>
                                <option value="below-intro">Featured Image (Below Intro Message)</option>
                              </select>
                            </div>
                          </div>

                          {/* Quick Replace Button */}
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 600, color: '#800020', cursor: 'pointer' }}>
                            <Upload size={13} /> Replace Image
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingImage}
                              onChange={handleImageUpload}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                      ) : (
                        <div>
                          <label
                            style={{
                              border: '2px dashed #CBD5E1',
                              borderRadius: '8px',
                              padding: '20px 16px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                              background: '#F8FAFC',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingImage}
                              onChange={handleImageUpload}
                              style={{ display: 'none' }}
                            />
                            {isUploadingImage ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#800020', fontWeight: 600, fontSize: '0.82rem' }}>
                                <RefreshCw size={16} className="animate-spin" />
                                Uploading image to Sanity CDN...
                              </div>
                            ) : (
                              <>
                                <Upload size={22} color="#800020" style={{ marginBottom: '6px' }} />
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
                                  Click to Upload Image from Computer / Phone
                                </span>
                                <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                                  Supports JPG, PNG, WEBP, GIF (Max 10MB) • Uploads directly to Sanity CDN
                                </span>
                              </>
                            )}
                          </label>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>Or paste image URL:</span>
                            <input
                              type="text"
                              placeholder="https://...image.jpg"
                              value={structuredData.heroImage || ''}
                              onChange={(e) => setStructuredData({ ...structuredData, heroImage: e.target.value })}
                              style={{ flex: 1, padding: '5px 8px', border: '1px solid #CBD5E1', borderRadius: '5px', fontSize: '0.76rem', background: '#FFF' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

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
                      <Monitor size={13} /> Desktop (720px)
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
                      width: previewDevice === 'desktop' ? '680px' : '360px',
                      maxWidth: '100%',
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      overflow: 'hidden',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                      transition: 'width 0.2s ease'
                    }}
                  >
                    {/* Inbox Preview Header Snippet */}
                    <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '8px 14px', fontSize: '0.72rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={13} color="#800020" style={{ flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 700, color: '#1E293B' }}>{formSubject || 'No Subject Line'}</span>
                        {formPreheader && (
                          <span style={{ color: '#64748B', marginLeft: '6px' }}>— {formPreheader}</span>
                        )}
                      </div>
                    </div>

                    {/* Header: Homepage Style & Logo */}
                    <div style={{ background: '#FFFFFF', padding: '22px 20px 18px 20px', textAlign: 'center', borderTop: '4px solid #800020', borderBottom: '2px solid #C5A880' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
                        <img 
                          src="/images/logo.png" 
                          alt="Flying Wonders Logo" 
                          style={{ 
                            height: '52px', 
                            width: '52px', 
                            borderRadius: '50%', 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '2px solid #C5A880',
                            display: 'block'
                          }} 
                        />
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.45rem', fontWeight: 500, color: '#1A1A1A', letterSpacing: '0.18em', textTransform: 'uppercase', lineHeight: 1.1 }}>
                            Flying Wonders
                          </div>
                          <div style={{ color: '#800020', fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>
                            Singapore &amp; India Specialist DMC
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email Body Content */}
                    <div
                      style={{ padding: '24px 20px', color: '#1A202C', fontSize: '0.92rem', lineHeight: 1.6, textAlign: 'justify' }}
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
          <div style={{ background: '#FFFFFF', maxWidth: '800px', width: '100%', maxHeight: '90vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            
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
              <div style={{ maxWidth: '720px', margin: '0 auto', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                {/* Header: Homepage Style & Logo */}
                <div style={{ background: '#FFFFFF', padding: '24px 20px 20px 20px', textAlign: 'center', borderTop: '4px solid #800020', borderBottom: '2px solid #C5A880' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
                    <img 
                      src="/images/logo.png" 
                      alt="Flying Wonders Logo" 
                      style={{ 
                        height: '54px', 
                        width: '54px', 
                        borderRadius: '50%', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        border: '2px solid #C5A880',
                        display: 'block'
                      }} 
                    />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.5rem', fontWeight: 500, color: '#1A1A1A', letterSpacing: '0.18em', textTransform: 'uppercase', lineHeight: 1.1 }}>
                        Flying Wonders
                      </div>
                      <div style={{ color: '#800020', fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>
                        Singapore &amp; India Specialist DMC
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div
                  style={{ padding: '28px 24px', color: '#1A202C', fontSize: '0.92rem', lineHeight: 1.6, textAlign: 'justify' }}
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

      {/* ── TARGETED AUDIENCE DISPATCH MODAL ── */}
      {dispatchModalCampaign && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', maxWidth: '640px', width: '100%', maxHeight: '92vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Send size={18} color="#800020" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Targeted Campaign Dispatch
                  </h3>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                  Broadcast &ldquo;{dispatchModalCampaign.title}&rdquo; to selected audience segments
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isDispatchingModal) {
                    setDispatchModalCampaign(null)
                    setDispatchModalFeedback(null)
                  }
                }}
                disabled={isDispatchingModal}
                style={{ border: 'none', background: 'transparent', cursor: isDispatchingModal ? 'not-allowed' : 'pointer', color: '#64748B', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
              
              {/* Campaign summary card */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 16px', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748B', marginBottom: '2px' }}>Email Subject:</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>{dispatchModalCampaign.subject}</div>
                {dispatchModalCampaign.preheader && (
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    <span style={{ fontWeight: 600 }}>Preheader:</span> {dispatchModalCampaign.preheader}
                  </div>
                )}
              </div>

              {/* Feedback banner */}
              {dispatchModalFeedback && (
                <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', background: dispatchModalFeedback.success ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${dispatchModalFeedback.success ? '#A7F3D0' : '#FECACA'}`, color: dispatchModalFeedback.success ? '#065F46' : '#991B1B', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {dispatchModalFeedback.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>{dispatchModalFeedback.message}</span>
                </div>
              )}

              {/* Step: Select Audience */}
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                Select Target Audience Segment:
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                
                {/* Option 1: All Active */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '8px', border: targetAudience === 'all' ? '2px solid #800020' : '1px solid #E2E8F0', background: targetAudience === 'all' ? '#FFF5F5' : '#FFFFFF', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <input
                    type="radio"
                    name="targetAudience"
                    value="all"
                    checked={targetAudience === 'all'}
                    onChange={() => setTargetAudience('all')}
                    style={{ marginTop: '3px', accentColor: '#800020' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                      🌐 All Active Subscribers ({subscriberCount} contacts)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                      Full blast across both verified B2B travel partners and direct retail consumer leads.
                    </div>
                  </div>
                </label>

                {/* Option 2: B2B Only */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '8px', border: targetAudience === 'b2b' ? '2px solid #800020' : '1px solid #E2E8F0', background: targetAudience === 'b2b' ? '#FFF5F5' : '#FFFFFF', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <input
                    type="radio"
                    name="targetAudience"
                    value="b2b"
                    checked={targetAudience === 'b2b'}
                    onChange={() => setTargetAudience('b2b')}
                    style={{ marginTop: '3px', accentColor: '#800020' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                      🏢 B2B Travel Partners &amp; Corporate Agencies Only
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                      Send exclusively to registered travel agents, tour operators, and corporate accounts with DMC nett rates.
                    </div>
                  </div>
                </label>

                {/* Option 3: B2C Only */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '8px', border: targetAudience === 'b2c' ? '2px solid #800020' : '1px solid #E2E8F0', background: targetAudience === 'b2c' ? '#FFF5F5' : '#FFFFFF', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <input
                    type="radio"
                    name="targetAudience"
                    value="b2c"
                    checked={targetAudience === 'b2c'}
                    onChange={() => setTargetAudience('b2c')}
                    style={{ marginTop: '3px', accentColor: '#800020' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                      🧳 B2C Travelers &amp; Website Inquiries Only
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                      Send exclusively to retail travelers who signed up for seasonal vacation guides and packages.
                    </div>
                  </div>
                </label>

                {/* Option 4: New Subscribers */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '8px', border: targetAudience === 'new' ? '2px solid #800020' : '1px solid #E2E8F0', background: targetAudience === 'new' ? '#FFF5F5' : '#FFFFFF', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <input
                    type="radio"
                    name="targetAudience"
                    value="new"
                    checked={targetAudience === 'new'}
                    onChange={() => setTargetAudience('new')}
                    style={{ marginTop: '3px', accentColor: '#800020' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                      ✨ Recent / New Subscribers (Past 30 Days)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                      Target only newly acquired contacts who joined recently &mdash; ideal for onboarding and welcome nurture.
                    </div>
                  </div>
                </label>

                {/* Option: Specific Event / Campaign Tag */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '8px', border: targetAudience === 'tag' ? '2px solid #800020' : '1px solid #E2E8F0', background: targetAudience === 'tag' ? '#FFF5F5' : '#FFFFFF', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <input
                    type="radio"
                    name="targetAudience"
                    value="tag"
                    checked={targetAudience === 'tag'}
                    onChange={() => {
                      setTargetAudience('tag')
                      if (!selectedDispatchTag && availableSourceTags.length > 0) {
                        setSelectedDispatchTag(availableSourceTags[0].tag)
                      }
                    }}
                    style={{ marginTop: '3px', accentColor: '#800020' }}
                  />
                  <div style={{ width: '100%' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🏷️ Specific Event / Campaign Tag</span>
                      <span style={{ fontSize: '0.7rem', background: '#DCFCE7', color: '#15803D', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                        Event Targeting
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                      Target exclusively delegates from a specific expo, roadshow, or partner list (e.g. SATTE, OTM).
                    </div>

                    {targetAudience === 'tag' && (
                      <div style={{ marginTop: '10px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 12px' }}>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Select Event Tag:
                        </label>
                        {loadingSubscribers ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '0.78rem', color: '#64748B' }}>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>Loading event tags from subscriber database...</span>
                          </div>
                        ) : availableSourceTags.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                            <select
                              value={selectedDispatchTag || (availableSourceTags[0]?.tag || '')}
                              onChange={(e) => setSelectedDispatchTag(e.target.value)}
                              style={{
                                padding: '6px 10px',
                                border: '1px solid #CBD5E1',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                background: '#FFF',
                                color: '#0F172A',
                                flex: 1,
                                minWidth: '180px',
                                fontFamily: 'var(--font-inter), sans-serif',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="">-- Choose an Event Tag --</option>
                              {availableSourceTags.map(({ tag, activeCount }) => (
                                <option key={tag} value={tag}>
                                  🎪 {tag} ({activeCount} active contacts)
                                </option>
                              ))}
                            </select>
                            {(selectedDispatchTag || availableSourceTags[0]?.tag) && (
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F4C3A', background: '#ECFDF5', padding: '4px 10px', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                                Target: &ldquo;{selectedDispatchTag || availableSourceTags[0]?.tag}&rdquo;
                              </span>
                            )}
                          </div>
                        ) : (
                          <p style={{ margin: 0, fontSize: '0.78rem', color: '#94A3B8' }}>
                            No event tags found in active subscribers yet. Import contacts with an event tag like &ldquo;SATTE 2026&rdquo; first.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </label>

                {/* Option 5: Custom Emails List */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '8px', border: targetAudience === 'custom' ? '2px solid #800020' : '1px solid #E2E8F0', background: targetAudience === 'custom' ? '#FFF5F5' : '#FFFFFF', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <input
                    type="radio"
                    name="targetAudience"
                    value="custom"
                    checked={targetAudience === 'custom'}
                    onChange={() => setTargetAudience('custom')}
                    style={{ marginTop: '3px', accentColor: '#800020' }}
                  />
                  <div style={{ width: '100%' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                      📋 Custom Specific Email List
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                      Paste specific agency or partner email addresses separated by commas or line breaks.
                    </div>

                    {targetAudience === 'custom' && (
                      <div style={{ marginTop: '10px' }}>
                        <textarea
                          rows={4}
                          value={customEmailsInput}
                          onChange={(e) => setCustomEmailsInput(e.target.value)}
                          placeholder={'partner@travelagency.com, booking@voyages.sg\nmanager@corporate.com'}
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#0F172A', background: '#FFF' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.72rem', color: '#64748B' }}>
                          <span>Separate multiple addresses with commas or line breaks</span>
                          <span style={{ fontWeight: 700, color: '#800020' }}>
                            {customEmailsInput.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.includes('@')).length} email(s) detected
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </label>

              </div>

              {/* Multi-Wave Deduplication Checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', cursor: 'pointer', marginBottom: '14px', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '9px 12px', borderRadius: '8px' }}>
                <input
                  type="checkbox"
                  checked={dispatchSkipSent}
                  onChange={(e) => setDispatchSkipSent(e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: '#800020' }}
                />
                <span>
                  ☑️ Exclude contacts who already received this campaign (Multi-wave dispatch progression)
                </span>
              </label>

              {/* ── DELIVERY ENGINE SELECTOR ── */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Select Delivery Engine:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {/* Card 1: Amazon SES */}
                  <div
                    onClick={() => {
                      setSelectedDispatcher('ses')
                      setDispatchBatchLimit('all')
                    }}
                    style={{
                      border: selectedDispatcher === 'ses' ? '2px solid #800020' : '1px solid #CBD5E1',
                      background: selectedDispatcher === 'ses' ? '#FFF5F6' : '#FFFFFF',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: selectedDispatcher === 'ses' ? '0 2px 8px rgba(128,0,32,0.12)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1.1rem' }}>🚀</span>
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: selectedDispatcher === 'ses' ? '#800020' : '#0F172A' }}>
                          Amazon SES
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        background: sesInfo?.configured ? '#DCFCE7' : '#FEF3C7',
                        color: sesInfo?.configured ? '#166534' : '#92400E',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        {sesInfo?.configured ? '⚡ High Speed • Active' : (sesInfo ? 'Setup Needed' : 'Active & Ready')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                      <strong>Instant Cloud Blast.</strong> Send to all contacts at once with no 300/day limit. Verified domain: <code>flyingwonders.net</code> ({sesInfo?.region || 'us-east-1'}).
                    </div>
                  </div>

                  {/* Card 2: Brevo Free Tier */}
                  <div
                    onClick={() => {
                      setSelectedDispatcher('brevo')
                      setDispatchBatchLimit('250')
                    }}
                    style={{
                      border: selectedDispatcher === 'brevo' ? '2px solid #0F4C3A' : '1px solid #CBD5E1',
                      background: selectedDispatcher === 'brevo' ? '#F0FDF4' : '#FFFFFF',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: selectedDispatcher === 'brevo' ? '0 2px 8px rgba(15,76,58,0.12)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} color="#0F4C3A" />
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: selectedDispatcher === 'brevo' ? '#0F4C3A' : '#0F172A' }}>
                          Brevo Free Waves
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          background: (brevoQuota && brevoQuota.remainingCredits <= 20) ? '#FEE2E2' : '#E0E7FF',
                          color: (brevoQuota && brevoQuota.remainingCredits <= 20) ? '#991B1B' : '#3730A3',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          {brevoQuota ? `${brevoQuota.remainingCredits} left today` : '300/day cap'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            fetchQuota()
                          }}
                          disabled={loadingQuota}
                          title="Refresh quota"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '2px' }}
                        >
                          <RefreshCw size={11} className={loadingQuota ? 'animate-spin' : ''} />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                      <strong>Phased Safe Batches.</strong> Automatically capped at 250-300 emails/day with multi-wave progression.
                    </div>
                  </div>
                </div>
              </div>

              {/* ── DISPATCH ENGINE SPECIFIC CONTROLS ── */}
              {selectedDispatcher === 'ses' ? (
                /* AMAZON SES CONTROLS */
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.05rem' }}>🚀</span>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#800020' }}>
                        Amazon SES High-Capacity Dispatcher
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      No 300/Day Quota Lock • Sender: {sesInfo?.fromEmail || 'contact@flyingwonders.net'}
                    </div>
                  </div>

                  {/* Wave & Audience Live Breakdown Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 12px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Total Audience</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                        {dispatchAudienceStats.total} contacts
                      </div>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 12px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Already Sent</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#64748B', marginTop: '2px' }}>
                        {dispatchAudienceStats.alreadySent} contacts
                      </div>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '8px 12px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#065F46', fontWeight: 600 }}>Eligible To Send</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#065F46', marginTop: '2px' }}>
                        {dispatchAudienceStats.eligible} contacts
                      </div>
                    </div>

                    <div style={{ background: '#FFF5F6', border: '1px solid #FECDD3', borderRadius: '8px', padding: '8px 12px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#9F1239', fontWeight: 600 }}>Sending In This Blast</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#800020', marginTop: '2px' }}>
                        {dispatchAudienceStats.toSendNow} contacts
                      </div>
                    </div>

                    {dispatchAudienceStats.remainingAfter > 0 && (
                      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '8px 12px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#92400E', fontWeight: 600 }}>Remaining (Next Batch)</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400E', marginTop: '2px' }}>
                          {dispatchAudienceStats.remainingAfter} contacts
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Batch Size Presets */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Select Batch Size / Volume:
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setDispatchBatchLimit('1000')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: dispatchBatchLimit === '1000' ? '1px solid #800020' : '1px solid #CBD5E1',
                          background: dispatchBatchLimit === '1000' ? '#800020' : '#FFFFFF',
                          color: dispatchBatchLimit === '1000' ? '#FFFFFF' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer'
                        }}
                      >
                        ⚡ 1,000 / wave
                      </button>

                      <button
                        type="button"
                        onClick={() => setDispatchBatchLimit('500')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: dispatchBatchLimit === '500' ? '1px solid #800020' : '1px solid #CBD5E1',
                          background: dispatchBatchLimit === '500' ? '#800020' : '#FFFFFF',
                          color: dispatchBatchLimit === '500' ? '#FFFFFF' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer'
                        }}
                      >
                        ⚡ 500 / wave
                      </button>

                      <button
                        type="button"
                        onClick={() => setDispatchBatchLimit('all')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: dispatchBatchLimit === 'all' ? '1px solid #800020' : '1px solid #CBD5E1',
                          background: dispatchBatchLimit === 'all' ? '#800020' : '#FFFFFF',
                          color: dispatchBatchLimit === 'all' ? '#FFFFFF' : '#334155',
                          fontWeight: 800,
                          fontSize: '0.76rem',
                          cursor: 'pointer'
                        }}
                      >
                        {dispatchAudienceStats.eligible > 1000 ? `🚀 Max Wave (1,000 of ${dispatchAudienceStats.eligible})` : `🚀 Send All (${dispatchAudienceStats.eligible})`}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDispatchBatchLimit('250')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: dispatchBatchLimit === '250' ? '1px solid #800020' : '1px solid #CBD5E1',
                          background: dispatchBatchLimit === '250' ? '#800020' : '#FFFFFF',
                          color: dispatchBatchLimit === '250' ? '#FFFFFF' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer'
                        }}
                      >
                        ⚡ 250 / batch
                      </button>

                      <button
                        type="button"
                        onClick={() => setDispatchBatchLimit('100')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: dispatchBatchLimit === '100' ? '1px solid #800020' : '1px solid #CBD5E1',
                          background: dispatchBatchLimit === '100' ? '#800020' : '#FFFFFF',
                          color: dispatchBatchLimit === '100' ? '#FFFFFF' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer'
                        }}
                      >
                        ⚡ 100 / batch
                      </button>

                      <button
                        type="button"
                        onClick={() => setDispatchBatchLimit('custom')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: dispatchBatchLimit === 'custom' ? '1px solid #800020' : '1px solid #CBD5E1',
                          background: dispatchBatchLimit === 'custom' ? '#800020' : '#FFFFFF',
                          color: dispatchBatchLimit === 'custom' ? '#FFFFFF' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Custom
                      </button>

                      {dispatchBatchLimit === 'custom' && (
                        <input
                          type="number"
                          min={1}
                          max={50000}
                          value={customBatchLimitInput}
                          onChange={(e) => setCustomBatchLimitInput(e.target.value)}
                          placeholder="e.g. 500"
                          style={{
                            width: '80px',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            background: '#FFF',
                            color: '#0F172A'
                          }}
                        />
                      )}
                    </div>

                    {dispatchAudienceStats.eligible > 1000 && (
                      <div style={{ marginTop: '10px', fontSize: '0.74rem', color: '#92400E', background: '#FEF3C7', padding: '8px 12px', borderRadius: '8px', border: '1px solid #FDE68A', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.45 }}>
                        <span style={{ fontSize: '1rem', lineHeight: 1 }}>🛡️</span>
                        <div>
                          <strong>Large Audience Protection:</strong> High-volume lists are dispatched in safe waves of up to 1,000 contacts to guarantee zero Amazon SES throttling and prevent serverless execution timeouts. Contacts already sent in previous waves are automatically skipped.
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>💡</span>
                    <span>
                      {dispatchAudienceStats.remainingAfter > 0
                        ? `Delivering ${dispatchAudienceStats.toSendNow} contacts via Amazon SES. ${dispatchAudienceStats.remainingAfter} contacts will remain for subsequent waves.`
                        : `Delivering instantly to all ${dispatchAudienceStats.eligible} eligible contacts via Amazon SES.`}
                    </span>
                  </div>
                </div>
              ) : (
                /* BREVO SAFE WAVE CONTROLS */
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color="#0F4C3A" />
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>
                        Brevo Free Tier Safe Wave Dispatcher
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', background: (brevoQuota && brevoQuota.remainingCredits <= 20) ? '#FEE2E2' : '#DCFCE7', color: (brevoQuota && brevoQuota.remainingCredits <= 20) ? '#991B1B' : '#15803D', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                        {brevoQuota ? `⚡ ${brevoQuota.remainingCredits} / ${brevoQuota.dailyLimit} Credits Left Today` : '🛡️ 300/Day Quota Shield'}
                      </span>
                      <button
                        type="button"
                        onClick={fetchQuota}
                        disabled={loadingQuota}
                        title="Refresh live Brevo credits"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'inline-flex', alignItems: 'center', padding: '2px' }}
                      >
                        <RefreshCw size={13} className={loadingQuota ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>

                  {/* Account-Wide Daily Usage Notice */}
                  {brevoQuota && (
                    <div style={{
                      background: brevoQuota.remainingCredits <= 20 ? '#FEF2F2' : (brevoQuota.sentToday > 0 ? '#FFFBEB' : '#F0FDF4'),
                      border: `1px solid ${brevoQuota.remainingCredits <= 20 ? '#FECACA' : (brevoQuota.sentToday > 0 ? '#FDE68A' : '#BBF7D0')}`,
                      borderRadius: '8px',
                      padding: '10px 12px',
                      marginBottom: '12px',
                      fontSize: '0.75rem',
                      color: brevoQuota.remainingCredits <= 20 ? '#991B1B' : (brevoQuota.sentToday > 0 ? '#92400E' : '#166534'),
                      lineHeight: 1.45
                    }}>
                      <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span>📊 Account Daily Usage (All Campaigns Combined):</span>
                        <span>{brevoQuota.sentToday} of {brevoQuota.dailyLimit} sent today</span>
                      </div>
                      <div>
                        {brevoQuota.sentToday > 0 ? (
                          <>
                            You already sent <strong>{brevoQuota.sentToday} emails</strong> earlier today across your Brevo account
                            {brevoQuota.campaignsSentToday && brevoQuota.campaignsSentToday.length > 0 && (
                              <span> ({brevoQuota.campaignsSentToday.map(c => `"${c.title}": ${c.sentCount}`).join(', ')})</span>
                            )}.
                            {' '}Your account currently has <strong style={{ textDecoration: 'underline' }}>{brevoQuota.remainingCredits} sends remaining</strong> until quota resets at {brevoQuota.resetsAtUtc} (~{brevoQuota.resetsInHours}h).
                          </>
                        ) : (
                          <>Full 300 emails/day capacity available on your Brevo Free plan for today.</>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quota Exceeded Auto-Cap Warning */}
                  {dispatchAudienceStats.quotaExceeded && (
                    <div style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      marginBottom: '12px',
                      fontSize: '0.76rem',
                      color: '#991B1B',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}>
                      <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong>Account Quota Protection Active:</strong> You requested {dispatchAudienceStats.desiredSend} contacts, but your Brevo account only has <strong>{dispatchAudienceStats.remainingDailyCredits} sends remaining</strong> today because {brevoQuota?.sentToday || 0} emails were dispatched earlier.
                        <br />
                        We automatically capped today&apos;s batch to <strong>{dispatchAudienceStats.toSendNow} contacts</strong> to prevent daily quota errors. (Tip: Switch to Amazon SES above for unlimited blasts).
                      </div>
                    </div>
                  )}

                  {/* Wave & Audience Live Breakdown Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 12px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Total Audience</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                        {dispatchAudienceStats.total} contacts
                      </div>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 12px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Already Sent</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#64748B', marginTop: '2px' }}>
                        {dispatchAudienceStats.alreadySent} contacts
                      </div>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '8px 12px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#065F46', fontWeight: 600 }}>Eligible To Send</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#065F46', marginTop: '2px' }}>
                        {dispatchAudienceStats.eligible} contacts
                      </div>
                    </div>

                    <div style={{
                      background: dispatchAudienceStats.quotaExceeded ? '#FEF2F2' : '#EFF6FF',
                      border: `1px solid ${dispatchAudienceStats.quotaExceeded ? '#FECACA' : '#BFDBFE'}`,
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: dispatchAudienceStats.quotaExceeded ? '#991B1B' : '#1E40AF', fontWeight: 600 }}>
                        Batch Sending Today
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: dispatchAudienceStats.quotaExceeded ? '#DC2626' : '#1E40AF', marginTop: '2px' }}>
                        {dispatchAudienceStats.toSendNow} contacts
                      </div>
                      {dispatchAudienceStats.quotaExceeded && (
                        <div style={{ fontSize: '0.66rem', color: '#DC2626', fontWeight: 700, marginTop: '1px' }}>
                          Capped by daily quota
                        </div>
                      )}
                    </div>

                    {dispatchAudienceStats.remainingAfter > 0 && (
                      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '8px 12px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#92400E', fontWeight: 600 }}>Remaining (Wave 2)</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400E', marginTop: '2px' }}>
                          {dispatchAudienceStats.remainingAfter} contacts
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Batch Cap Presets */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Select Daily Batch Cap / Wave Size:
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      {brevoQuota && brevoQuota.remainingCredits > 0 && brevoQuota.remainingCredits < 250 && (
                        <button
                          type="button"
                          onClick={() => {
                            setDispatchBatchLimit('custom')
                            setCustomBatchLimitInput(String(brevoQuota.remainingCredits))
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: (dispatchBatchLimit === 'custom' && customBatchLimitInput === String(brevoQuota.remainingCredits)) ? '1px solid #0F4C3A' : '1px solid #16A34A',
                            background: (dispatchBatchLimit === 'custom' && customBatchLimitInput === String(brevoQuota.remainingCredits)) ? '#0F4C3A' : '#ECFDF5',
                            color: (dispatchBatchLimit === 'custom' && customBatchLimitInput === String(brevoQuota.remainingCredits)) ? '#FFFFFF' : '#15803D',
                            fontWeight: 800,
                            fontSize: '0.76rem',
                            cursor: 'pointer'
                          }}
                        >
                          ⚡ {brevoQuota.remainingCredits} / day (Use Remaining Daily Quota)
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setDispatchBatchLimit('250')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: dispatchBatchLimit === '250' ? '1px solid #0F4C3A' : '1px solid #CBD5E1',
                          background: dispatchBatchLimit === '250' ? '#0F4C3A' : '#FFFFFF',
                          color: dispatchBatchLimit === '250' ? '#FFFFFF' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer'
                        }}
                      >
                        ⚡ 250 / day (Brevo Free Safe Cap)
                      </button>

                      <button
                        type="button"
                        onClick={() => setDispatchBatchLimit('100')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: dispatchBatchLimit === '100' ? '1px solid #0F4C3A' : '1px solid #CBD5E1',
                          background: dispatchBatchLimit === '100' ? '#0F4C3A' : '#FFFFFF',
                          color: dispatchBatchLimit === '100' ? '#FFFFFF' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer'
                        }}
                      >
                        ⚡ 100 / wave (Test Wave)
                      </button>

                      <button
                        type="button"
                        onClick={() => setDispatchBatchLimit('50')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: dispatchBatchLimit === '50' ? '1px solid #0F4C3A' : '1px solid #CBD5E1',
                          background: dispatchBatchLimit === '50' ? '#0F4C3A' : '#FFFFFF',
                          color: dispatchBatchLimit === '50' ? '#FFFFFF' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer'
                        }}
                      >
                        ⚡ 50 / wave (Sample)
                      </button>

                      <button
                        type="button"
                        onClick={() => setDispatchBatchLimit('all')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: dispatchBatchLimit === 'all' ? '1px solid #0F4C3A' : '1px solid #CBD5E1',
                          background: dispatchBatchLimit === 'all' ? '#0F4C3A' : '#FFFFFF',
                          color: dispatchBatchLimit === 'all' ? '#FFFFFF' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer'
                        }}
                      >
                        🚀 Send All ({dispatchAudienceStats.eligible})
                      </button>

                      <button
                        type="button"
                        onClick={() => setDispatchBatchLimit('custom')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: dispatchBatchLimit === 'custom' ? '1px solid #0F4C3A' : '1px solid #CBD5E1',
                          background: dispatchBatchLimit === 'custom' ? '#0F4C3A' : '#FFFFFF',
                          color: dispatchBatchLimit === 'custom' ? '#FFFFFF' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Custom
                      </button>

                      {dispatchBatchLimit === 'custom' && (
                        <input
                          type="number"
                          min={1}
                          max={10000}
                          value={customBatchLimitInput}
                          onChange={(e) => setCustomBatchLimitInput(e.target.value)}
                          placeholder="e.g. 150"
                          style={{
                            width: '80px',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            background: '#FFF',
                            color: '#0F172A'
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>💡</span>
                    <span>
                      {dispatchAudienceStats.remainingAfter > 0
                        ? `Dispatching Wave 1 today (${dispatchAudienceStats.toSendNow} contacts). The remaining ${dispatchAudienceStats.remainingAfter} contacts will be queued for tomorrow's wave without duplicates.`
                        : `This batch delivers to all ${dispatchAudienceStats.eligible} remaining contacts in one dispatch.`}
                    </span>
                  </div>
                </div>
              )}

              {/* Personalization & High-Speed Batch Shield info */}
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '10px 14px', fontSize: '0.75rem', color: '#1E40AF', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#2563EB" /> Dynamic Personalization &amp; Timeout Protection Active
                </div>
                <div>
                  • Merge tags <code style={{ background: '#DBEAFE', padding: '1px 4px', borderRadius: '3px' }}>{`{{name}}`}</code> and <code style={{ background: '#DBEAFE', padding: '1px 4px', borderRadius: '3px' }}>{`{{company}}`}</code> will automatically personalize for each recipient.
                </div>
                <div>
                  • Dispatches in concurrent chunks via {selectedDispatcher === 'ses' ? 'Amazon SES verified AWS server' : 'Brevo REST API'} (<strong style={{ color: '#1E40AF' }}>contact@flyingwonders.net</strong>) with zero timeout risk.
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 22px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setDispatchModalCampaign(null)
                  setDispatchModalFeedback(null)
                }}
                disabled={isDispatchingModal}
                style={{ padding: '8px 16px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: isDispatchingModal ? 'not-allowed' : 'pointer' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteDispatch}
                disabled={isDispatchingModal || dispatchAudienceStats.toSendNow === 0}
                style={{
                  padding: '9px 22px',
                  background: dispatchAudienceStats.toSendNow === 0 ? '#94A3B8' : (selectedDispatcher === 'ses' ? '#800020' : '#0F4C3A'),
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#FFF',
                  cursor: (isDispatchingModal || dispatchAudienceStats.toSendNow === 0) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: selectedDispatcher === 'ses' ? '0 2px 4px rgba(128,0,32,0.25)' : '0 2px 4px rgba(15,76,58,0.25)'
                }}
              >
                <Send size={15} className={isDispatchingModal ? 'animate-spin' : ''} />
                {isDispatchingModal
                  ? 'Dispatching In Batches...'
                  : dispatchAudienceStats.toSendNow === 0
                    ? (selectedDispatcher === 'brevo' && brevoQuota && brevoQuota.remainingCredits <= 0
                        ? `Daily Brevo Limit Reached (${brevoQuota.sentToday}/${brevoQuota.dailyLimit} Sent Today)`
                        : 'No Eligible Contacts / Already Dispatched')
                    : selectedDispatcher === 'ses'
                      ? (dispatchAudienceStats.remainingAfter > 0
                          ? `🚀 Blast Wave (${dispatchAudienceStats.toSendNow} via Amazon SES)`
                          : `🚀 Blast All (${dispatchAudienceStats.toSendNow} via Amazon SES)`)
                      : (dispatchAudienceStats.remainingAfter > 0
                          ? `🛡️ Launch Wave (${dispatchAudienceStats.toSendNow} via Brevo)`
                          : `🛡️ Launch Campaign Broadcast (${dispatchAudienceStats.toSendNow} via Brevo)`)}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── DISPATCH HISTORY AUDIT MODAL ── */}
      {historyModalCampaign && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', maxWidth: '780px', width: '100%', maxHeight: '88vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={18} color="#800020" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Dispatch History &amp; Audit Trail
                  </h3>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                  Template: <strong>{historyModalCampaign.title}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalCampaign(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
              
              {/* KPIs Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Broadcasts</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#800020', marginTop: '2px' }}>
                    {historyModalCampaign.dispatchCount || (historyModalCampaign.status === 'sent' ? 1 : 0)}x
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Last Sent Date</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', marginTop: '4px' }}>
                    {formatDateSafe(historyModalCampaign.lastSentAt || historyModalCampaign.sentAt)}
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Last Batch Delivered</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                    {historyModalCampaign.lastSentToCount ?? historyModalCampaign.sentToCount ?? 0}
                  </div>
                </div>
              </div>

              {/* History Table */}
              {Array.isArray(historyModalCampaign.dispatchHistory) && historyModalCampaign.dispatchHistory.length > 0 ? (
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700, fontSize: '0.74rem' }}>
                        <th style={{ padding: '10px 14px' }}>Date &amp; Time</th>
                        <th style={{ padding: '10px 14px' }}>Target Audience</th>
                        <th style={{ padding: '10px 14px' }}>Delivered</th>
                        <th style={{ padding: '10px 14px' }}>Errors</th>
                        <th style={{ padding: '10px 14px' }}>Admin</th>
                        <th style={{ padding: '10px 14px' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyModalCampaign.dispatchHistory.map((item, idx) => {
                        const rawAudience = (item.targetAudience || item.audience || 'ALL').toString().toUpperCase()
                        const audienceLower = rawAudience.toLowerCase()
                        const dateStr = formatDateSafe(item.dispatchedAt)
                        const adminStr = item.dispatchedBy || item.adminEmail || 'info.flyingwonders@gmail.com'
                        const delivered = typeof item.sentCount === 'number' ? item.sentCount : 0
                        const errors = typeof item.errorCount === 'number' ? item.errorCount : 0

                        return (
                          <tr key={item._key || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '10px 14px', color: '#1E293B', fontWeight: 600 }}>
                              {dateStr}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: audienceLower.includes('b2b') ? '#EEF2FF' : audienceLower.includes('b2c') ? '#ECFDF5' : audienceLower.includes('custom') ? '#FFFBEB' : '#F1F5F9',
                                color: audienceLower.includes('b2b') ? '#4338CA' : audienceLower.includes('b2c') ? '#065F46' : audienceLower.includes('custom') ? '#92400E' : '#334155',
                                border: '1px solid #E2E8F0'
                              }}>
                                {rawAudience}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 700 }}>
                              {delivered}
                            </td>
                            <td style={{ padding: '10px 14px', color: errors > 0 ? '#DC2626' : '#94A3B8', fontWeight: errors > 0 ? 700 : 400 }}>
                              {errors}
                            </td>
                            <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '0.74rem' }}>
                              {adminStr}
                            </td>
                            <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '0.74rem' }}>
                              {item.notes || '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : historyModalCampaign.sentAt ? (
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700, fontSize: '0.74rem' }}>
                        <th style={{ padding: '10px 14px' }}>Date &amp; Time</th>
                        <th style={{ padding: '10px 14px' }}>Target Audience</th>
                        <th style={{ padding: '10px 14px' }}>Delivered</th>
                        <th style={{ padding: '10px 14px' }}>Admin</th>
                        <th style={{ padding: '10px 14px' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 14px', color: '#1E293B', fontWeight: 600 }}>
                          {formatDateSafe(historyModalCampaign.sentAt)}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0' }}>
                            ALL SUBSCRIBERS
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 700 }}>
                          {historyModalCampaign.sentToCount || 0}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '0.74rem' }}>
                          info.flyingwonders@gmail.com
                        </td>
                        <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '0.74rem' }}>
                          Initial broadcast record
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 16px', background: '#F8FAFC', border: '2px dashed #E2E8F0', borderRadius: '10px', color: '#64748B', fontSize: '0.84rem' }}>
                  <History size={32} color="#CBD5E1" style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#334155' }}>No Previous Dispatches</p>
                  <p style={{ margin: 0, fontSize: '0.78rem' }}>This template has not been dispatched yet. Click &ldquo;Dispatch 🚀&rdquo; to launch it to your audience.</p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 22px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setHistoryModalCampaign(null)}
                style={{ padding: '7px 18px', background: '#800020', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Close History
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── BULK IMPORT SUBSCRIBERS MODAL ── */}
      {isImportModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', maxWidth: '1040px', width: '100%', maxHeight: '92vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📥 Bulk Import Subscribers Audience</span>
                  <span style={{ fontSize: '0.72rem', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                    AI-Enhanced Parser
                  </span>
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0' }}>
                  Multi-source bulk ingestion with automatic email cleansing, phone standardization (+91), staging review, and deduplication.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false)
                  setParsedImportSubscribers([])
                  setImportFilterQuery('')
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '16px' }}>
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

              {/* Ingestion Presets & Dual-Sync */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '10px 14px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B' }}>
                  <span>⚙️ Ingestion Defaults:</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>Target Audience:</label>
                    <select
                      value={importAudience}
                      onChange={(e) => setImportAudience(e.target.value as any)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        fontFamily: 'var(--font-inter), sans-serif',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="b2b">🏢 B2B Travel Partner</option>
                      <option value="b2c">🌐 B2C Website Subscriber</option>
                      <option value="lead">🎯 Lead / Inquiry</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>Event / Tag:</label>
                    <input
                      type="text"
                      value={importSourceTag}
                      onChange={(e) => setImportSourceTag(e.target.value)}
                      placeholder="e.g. SATTE 2026"
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.76rem',
                        width: '120px',
                        background: '#FFF',
                        color: '#0F172A',
                        fontWeight: 600
                      }}
                    />
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {['SATTE 2026', 'OTM', 'BLTM', 'Roadshow', 'Website'].map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setImportSourceTag(chip)}
                          style={{
                            padding: '3px 7px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            borderRadius: '4px',
                            border: importSourceTag === chip ? '1px solid #0F4C3A' : '1px solid #CBD5E1',
                            background: importSourceTag === chip ? '#0F4C3A' : '#F1F5F9',
                            color: importSourceTag === chip ? '#FFF' : '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {importTab === 'text' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>City:</label>
                      <input
                        type="text"
                        value={importCity}
                        onChange={(e) => setImportCity(e.target.value)}
                        placeholder="e.g. Bangalore"
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.76rem',
                          width: '100px',
                          background: '#FFF',
                          color: '#0F172A'
                        }}
                      />
                    </div>
                  )}

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#0F4C3A', cursor: 'pointer', background: '#ECFDF5', padding: '4px 8px', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                    <input
                      type="checkbox"
                      checked={importDualSyncLeads}
                      onChange={(e) => setImportDualSyncLeads(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>☑️ Also sync to Marketing Leads Directory</span>
                  </label>
                </div>
              </div>

              {/* Tab 1: CSV / Excel */}
              {importTab === 'csv' && (
                <div style={{ background: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                  <FileText size={36} color="#0F4C3A" style={{ margin: '0 auto 10px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#1E293B', fontWeight: 700 }}>
                    Upload CSV or Excel Spreadsheet (.xlsx, .xls, .csv)
                  </h4>
                  <p style={{ margin: '0 0 16px', fontSize: '0.78rem', color: '#64748B' }}>
                    Auto-maps columns: Email, Contact Name, Company, Phone (+91), City, and Audience.
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
                      Paste Raw Text, Phone Numbers, or Directory Contacts:
                    </label>
                    <button
                      type="button"
                      onClick={handleLoadSamplePaste}
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#0F4C3A',
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Load real-world sample B2B contacts"
                    >
                      <Sparkles size={13} /> Load Sample B2B Data
                    </button>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '0.76rem', color: '#64748B', lineHeight: 1.4 }}>
                    Paste line-by-line directory contacts (e.g. <code>M/S Agency packages@agency.in 9538683939</code>), tab-separated spreadsheet rows, or multi-line email blocks. Auto-extracts emails, phone numbers, companies, and cities.
                  </p>
                  <textarea
                    rows={6}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={`M/S Marshall Tours N Travels   packages@marshalltravel.in   9538683939\nM/S Bhalaji Tours & Travels    sribhalajitravels1@gmail.com 9845857147\nM/S Travel Innovations   info@bestbus.in 8121115444\nRajesh Sharma | Skyway Travels Bangalore | info@skyway.com | 9845012345 | IATA`}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontFamily: 'monospace',
                      color: '#0F172A',
                      background: '#FFFFFF',
                      marginBottom: '12px'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleRawTextParse}
                      disabled={!importText.trim() || isParsingImport}
                      style={{
                        padding: '9px 18px',
                        background: '#0F4C3A',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: !importText.trim() || isParsingImport ? 'not-allowed' : 'pointer',
                        opacity: !importText.trim() || isParsingImport ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Sparkles size={15} />
                      {isParsingImport ? 'Parsing Text...' : 'Extract & Preview Contacts'}
                    </button>
                    {importText.trim() && (
                      <button
                        type="button"
                        onClick={() => setImportText('')}
                        style={{
                          padding: '9px 14px',
                          background: '#F1F5F9',
                          color: '#475569',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Feedback Message */}
              {importSyncFeedback && (
                <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', background: importSyncFeedback.startsWith('✅') ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${importSyncFeedback.startsWith('✅') ? '#A7F3D0' : '#FECACA'}`, color: importSyncFeedback.startsWith('✅') ? '#065F46' : '#991B1B', fontWeight: 700, fontSize: '0.82rem' }}>
                  {importSyncFeedback}
                </div>
              )}

              {/* Ingestion Progress Bar */}
              {importSyncProgress && (
                <div style={{ marginTop: '14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#14532D' }}>
                    <span>{importSyncProgress.message || 'Ingesting contacts in verified chunks...'}</span>
                    <span style={{ fontSize: '0.9rem', color: '#0F4C3A' }}>{importSyncProgress.percent}%</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: '#DCFCE7', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${importSyncProgress.percent}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #059669 0%, #0F4C3A 100%)',
                        transition: 'width 0.25s ease-in-out',
                        borderRadius: '9999px'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#15803D', marginTop: '6px' }}>
                    <span>Chunked ingestion (150/req) prevents server timeouts</span>
                    <span>{importSyncProgress.current.toLocaleString()} / {importSyncProgress.total.toLocaleString()} processed</span>
                  </div>
                </div>
              )}

              {/* Extracted Preview / Staging Grid */}
              {parsedImportSubscribers.length > 0 && (
                <div style={{ marginTop: '22px', borderTop: '1px solid #E2E8F0', paddingTop: '18px' }}>
                  {/* Staging Toolbar */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                        📋 Staging Review:{' '}
                        <span style={{ color: '#059669' }}>
                          {parsedImportSubscribers.length.toLocaleString()} contacts ready to ingest
                        </span>
                        {importFilterQuery && (
                          <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 500, marginLeft: '6px' }}>
                            ({filteredParsedSubscribers.length.toLocaleString()} matching filter)
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#64748B' }}>
                        Showing {((stagingPage - 1) * STAGING_PAGE_SIZE) + 1}–{Math.min(stagingPage * STAGING_PAGE_SIZE, filteredParsedSubscribers.length).toLocaleString()} of {filteredParsedSubscribers.length.toLocaleString()} (All {parsedImportSubscribers.length.toLocaleString()} will be synced)
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ position: 'relative' }}>
                        <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                          type="text"
                          value={importFilterQuery}
                          onChange={(e) => {
                            setImportFilterQuery(e.target.value)
                            setStagingPage(1)
                          }}
                          placeholder="Filter contacts..."
                          style={{
                            padding: '5px 8px 5px 26px',
                            fontSize: '0.76rem',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            width: '160px',
                            background: '#FFFFFF',
                            color: '#0F172A',
                            fontFamily: 'var(--font-inter), sans-serif'
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleExportParsedSubscribers}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 10px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: '#0F4C3A',
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Download parsed staging contacts as an Excel file"
                      >
                        <Download size={13} /> Export (.xlsx)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setParsedImportSubscribers([])
                          setImportFilterQuery('')
                          setStagingPage(1)
                        }}
                        style={{
                          fontSize: '0.74rem',
                          color: '#EF4444',
                          background: '#FEF2F2',
                          border: '1px solid #FECACA',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Editable Grid */}
                  <div style={{
                    maxHeight: '360px',
                    overflowY: 'auto',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    background: '#FFFFFF'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', textAlign: 'left' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#F1F5F9', zIndex: 2 }}>
                        <tr style={{ borderBottom: '1px solid #CBD5E1', color: '#475569' }}>
                          <th style={{ padding: '8px 6px', width: '32px', textAlign: 'center' }}>#</th>
                          <th style={{ padding: '8px 8px', minWidth: '180px' }}>Email Address (Required)</th>
                          <th style={{ padding: '8px 8px', minWidth: '140px' }}>Contact Name</th>
                          <th style={{ padding: '8px 8px', minWidth: '170px' }}>Company / Agency</th>
                          <th style={{ padding: '8px 8px', minWidth: '140px' }}>Phone (+91)</th>
                          <th style={{ padding: '8px 8px', minWidth: '100px' }}>City</th>
                          <th style={{ padding: '8px 8px', minWidth: '120px' }}>Event / Tag</th>
                          <th style={{ padding: '8px 8px', minWidth: '130px' }}>Audience Group</th>
                          <th style={{ padding: '8px 6px', width: '36px', textAlign: 'center' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedSubscribers.map((p, idx) => {
                          const originalIdx = parsedImportSubscribers.indexOf(p)
                          const targetIdx = originalIdx >= 0 ? originalIdx : idx
                          const rowNumber = ((stagingPage - 1) * STAGING_PAGE_SIZE) + idx + 1
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                              <td style={{ padding: '6px 4px', textAlign: 'center', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 600 }}>
                                {rowNumber}
                              </td>
                              <td style={{ padding: '4px 6px' }}>
                                <input
                                  type="text"
                                  value={p.email || ''}
                                  onChange={(e) => handleUpdateParsedSub(targetIdx, 'email', e.target.value)}
                                  placeholder="user@domain.com"
                                  style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    background: '#FFFFFF',
                                    color: '#800020',
                                    fontFamily: 'var(--font-inter), sans-serif'
                                  }}
                                />
                              </td>
                              <td style={{ padding: '4px 6px' }}>
                                <input
                                  type="text"
                                  value={p.name || ''}
                                  onChange={(e) => handleUpdateParsedSub(targetIdx, 'name', e.target.value)}
                                  placeholder="Contact name"
                                  style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    fontSize: '0.76rem',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    background: '#FFFFFF',
                                    color: '#0F172A',
                                    fontFamily: 'var(--font-inter), sans-serif'
                                  }}
                                />
                              </td>
                              <td style={{ padding: '4px 6px' }}>
                                <input
                                  type="text"
                                  value={p.company || ''}
                                  onChange={(e) => handleUpdateParsedSub(targetIdx, 'company', e.target.value)}
                                  placeholder="Company name"
                                  style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    background: '#FFFFFF',
                                    color: '#0F172A',
                                    fontFamily: 'var(--font-inter), sans-serif'
                                  }}
                                />
                              </td>
                              <td style={{ padding: '4px 6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <input
                                    type="text"
                                    value={p.phone || ''}
                                    onChange={(e) => handleUpdateParsedSub(targetIdx, 'phone', e.target.value)}
                                    placeholder="+91..."
                                    style={{
                                      flex: 1,
                                      padding: '4px 6px',
                                      fontSize: '0.76rem',
                                      border: '1px solid #CBD5E1',
                                      borderRadius: '4px',
                                      background: '#FFFFFF',
                                      color: '#0F172A',
                                      fontFamily: 'var(--font-inter), sans-serif'
                                    }}
                                  />
                                  {p.whatsapp && (
                                    <a
                                      href={p.whatsapp}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Open WhatsApp chat"
                                      style={{ color: '#15803D', display: 'flex', alignItems: 'center' }}
                                    >
                                      <MessageCircle size={14} />
                                    </a>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '4px 6px' }}>
                                <input
                                  type="text"
                                  value={p.city || ''}
                                  onChange={(e) => handleUpdateParsedSub(targetIdx, 'city', e.target.value)}
                                  placeholder="City"
                                  style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    fontSize: '0.76rem',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    background: '#FFFFFF',
                                    color: '#0F172A',
                                    fontFamily: 'var(--font-inter), sans-serif'
                                  }}
                                />
                              </td>
                              <td style={{ padding: '4px 6px' }}>
                                <input
                                  type="text"
                                  value={p.source || importSourceTag}
                                  onChange={(e) => handleUpdateParsedSub(targetIdx, 'source', e.target.value)}
                                  placeholder="e.g. SATTE 2026"
                                  style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    background: '#FFFFFF',
                                    color: '#0F4C3A',
                                    fontFamily: 'var(--font-inter), sans-serif'
                                  }}
                                />
                              </td>
                              <td style={{ padding: '4px 6px' }}>
                                <select
                                  value={p.audienceType || 'b2b'}
                                  onChange={(e) => handleUpdateParsedSub(targetIdx, 'audienceType', e.target.value as any)}
                                  style={{
                                    width: '100%',
                                    padding: '4px 4px',
                                    fontSize: '0.74rem',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    background: '#FFFFFF',
                                    color: '#0F172A',
                                    fontFamily: 'var(--font-inter), sans-serif',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="b2b">🏢 B2B Partner</option>
                                  <option value="b2c">🌐 B2C Subscriber</option>
                                  <option value="lead">🎯 Lead / Inquiry</option>
                                </select>
                              </td>
                              <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteParsedSub(targetIdx)}
                                  title="Remove this row"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94A3B8',
                                    padding: '2px',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalStagingPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.78rem' }}>
                      <button
                        type="button"
                        disabled={stagingPage <= 1}
                        onClick={() => setStagingPage(p => Math.max(1, p - 1))}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: stagingPage <= 1 ? '#F1F5F9' : '#FFFFFF', cursor: stagingPage <= 1 ? 'not-allowed' : 'pointer', fontWeight: 600, color: stagingPage <= 1 ? '#94A3B8' : '#334155' }}
                      >
                        &larr; Previous Page
                      </button>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>
                        Page {stagingPage} of {totalStagingPages}
                      </span>
                      <button
                        type="button"
                        disabled={stagingPage >= totalStagingPages}
                        onClick={() => setStagingPage(p => Math.min(totalStagingPages, p + 1))}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: stagingPage >= totalStagingPages ? '#F1F5F9' : '#FFFFFF', cursor: stagingPage >= totalStagingPages ? 'not-allowed' : 'pointer', fontWeight: 600, color: stagingPage >= totalStagingPages ? '#94A3B8' : '#334155' }}
                      >
                        Next Page &rarr;
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSyncImportToSubscribers}
                    disabled={isSyncingImport}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      background: '#0F4C3A',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: isSyncingImport ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 6px -1px rgba(15, 76, 58, 0.2)'
                    }}
                  >
                    {isSyncingImport ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        {importSyncProgress ? importSyncProgress.message : `Syncing ${parsedImportSubscribers.length.toLocaleString()} Contacts to Sanity...`}
                      </>
                    ) : (
                      <>
                        <UploadCloud size={16} />
                        🚀 Sync All {parsedImportSubscribers.length.toLocaleString()} Contacts to Subscribers Audience {importDualSyncLeads ? '(& Leads Directory)' : ''}
                      </>
                    )}
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
                  setParsedImportSubscribers([])
                  setImportFilterQuery('')
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
