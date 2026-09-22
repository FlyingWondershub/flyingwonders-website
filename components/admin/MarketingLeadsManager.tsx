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
  leadType?: string
  internalNotes?: string
  _createdAt?: string
}

// B2B Contact Parsing Constants
const GENERIC_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.in', 'yahoo.co.uk',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'icloud.com', 'me.com',
  'rediffmail.com', 'rediff.com', 'zoho.com', 'zohomail.com', 'protonmail.com',
  'proton.me', 'aol.com', 'ymail.com', 'mail.com', 'gmx.com'
])

const KNOWN_CITIES = [
  'Bangalore', 'Bengaluru', 'Mumbai', 'Bombay', 'Delhi', 'New Delhi', 'Chennai', 'Madras',
  'Kolkata', 'Calcutta', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa', 'Panaji',
  'Kochi', 'Cochin', 'Trivandrum', 'Thiruvananthapuram', 'Coimbatore', 'Madurai', 'Mysore',
  'Mysuru', 'Mangalore', 'Mangaluru', 'Hubli', 'Dharwad', 'Chandigarh', 'Lucknow', 'Kanpur',
  'Surat', 'Indore', 'Bhopal', 'Nagpur', 'Patna', 'Vadodara', 'Visakhapatnam', 'Vizag',
  'Agra', 'Varanasi', 'Amritsar', 'Guwahati', 'Nashik', 'Rajkot', 'Srinagar', 'Noida',
  'Gurgaon', 'Gurugram', 'Faridabad', 'Ghaziabad', 'Singapore', 'Dubai', 'Abu Dhabi',
  'Bangkok', 'Kuala Lumpur', 'Doha', 'Muscat', 'Colombo'
]

const ACCREDITATIONS_LIST = ['IATA', 'TAAI', 'TAFI', 'ADTOI', 'OTOAI', 'IAAPI', 'ATOAI', 'ISO', 'MOT']

const COMPANY_KEYWORDS = [
  'tours', 'travels', 'travel', 'holidays', 'vacations', 'voyages', 'destinations',
  'tourism', 'adventures', 'trip', 'trips', 'journeys', 'expeditions', 'getaways',
  'resorts', 'hospitality', 'ticketing', 'express', 'air', 'logistics', 'routes',
  'innovations', 'pvt ltd', 'private limited', 'llp', 'ltd', 'inc', 'corp', 'agency',
  'services', 'enterprises', 'solutions', 'consultants', 'm/s', 'messrs'
]

export default function MarketingLeadsManager() {
  const [leads, setLeads] = useState<MarketingLead[]>([])
  const [stats, setStats] = useState({
    total: 0,
    highPriority: 0,
    withWhatsApp: 0,
    contacted: 0,
    inDiscussion: 0,
    missingPhone: 0,
    missingEmail: 0,
    complete: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isSearchingServer, setIsSearchingServer] = useState(false)

  // Multi-selection & Deletion State
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set())
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filters, Search & Display Limit
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cleanlinessFilter, setCleanlinessFilter] = useState<'all' | 'complete' | 'missing_phone' | 'missing_email'>('all')
  const [displayLimit, setDisplayLimit] = useState<string>('all')

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
  const [importLeadType, setImportLeadType] = useState<string>('agent')
  const [importPriority, setImportPriority] = useState<'high' | 'medium' | 'normal'>('normal')
  const [importFilterQuery, setImportFilterQuery] = useState('')

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

  const fetchLeads = async (searchOverride?: string) => {
    setRefreshing(true)
    setIsSearchingServer(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', displayLimit)
      if (priorityFilter !== 'all') params.set('priority', priorityFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (cleanlinessFilter !== 'all') params.set('filterType', cleanlinessFilter)

      const term = searchOverride !== undefined ? searchOverride : searchQuery
      if (term.trim()) {
        params.set('search', term.trim())
      }

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
      setIsSearchingServer(false)
    }
  }

  // Reload when filters or limit change
  useEffect(() => {
    fetchLeads(searchQuery)
    fetchSubscribers()
  }, [priorityFilter, statusFilter, displayLimit, cleanlinessFilter])

  // Debounced server search when typing in search box
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads(searchQuery)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

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
        let company = findVal(['company', 'organization', 'agency', 'business', 'corp'])
        const designation = findVal(['designation', 'role', 'title', 'position'])
        const city = findVal(['city', 'location', 'state', 'country'])
        const accreditations = findVal(['accreditation', 'tags', 'source', 'notes'])

        if (email || phone || name || company) {
          const cleanedP = phone ? cleanPhone(phone) : ''
          
          // Fallback company from corporate domain if empty and non-generic
          if (!company && email) {
            const domain = email.split('@')[1] || ''
            if (!GENERIC_EMAIL_DOMAINS.has(domain.toLowerCase())) {
              const domainName = domain.split('.')[0]
              if (domainName && domainName.length > 2) {
                company = domainName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
              }
            }
          }

          extracted.push({
            name: name || '',
            email: email.toLowerCase(),
            phone: cleanedP,
            whatsapp: cleanedP ? `https://wa.me/${cleanedP.replace(/[^\d]/g, '')}` : '',
            company: company,
            designation: designation,
            city: city,
            accreditations: accreditations,
            priority: cleanedP ? 'high' : importPriority,
            leadType: importLeadType || 'agent',
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

      const phoneRegex = /(?:(?:\+?91[\s.-]?)?[6-9]\d{9})|(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,5}\)?[\s.-]?\d{3,4}[\s.-]?\d{4,5}/
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i

      for (const line of lines) {
        const emailMatch = line.match(emailRegex)
        const senderMatch = line.match(/\]\s*([^:]+):/)
        const sender = senderMatch ? senderMatch[1].trim() : ''

        let senderPhone = ''
        if (/[\d+]{7,15}/.test(sender)) {
          senderPhone = cleanPhone(sender)
        }

        const email = emailMatch ? emailMatch[0].toLowerCase().trim() : ''

        let messagePhone = ''
        const contentPhoneMatch = line.match(phoneRegex)
        if (contentPhoneMatch) {
          const cp = cleanPhone(contentPhoneMatch[0])
          if (cp.replace(/[^\d]/g, '').length >= 10) messagePhone = cp
        }

        const effectivePhone = senderPhone || messagePhone
        const contactName = senderPhone ? '' : sender

        if (email || effectivePhone) {
          const key = (email || effectivePhone).toLowerCase()
          if (!extracted.has(key)) {
            let company = ''
            if (email) {
              const domain = email.split('@')[1] || ''
              if (!GENERIC_EMAIL_DOMAINS.has(domain.toLowerCase())) {
                const domainName = domain.split('.')[0]
                if (domainName && domainName.length > 2) {
                  company = domainName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                }
              }
            }

            extracted.set(key, {
              name: contactName,
              email: email,
              phone: effectivePhone,
              whatsapp: effectivePhone ? `https://wa.me/${effectivePhone.replace(/[^\d]/g, '')}` : '',
              company: company,
              designation: '',
              city: '',
              accreditations: '',
              priority: effectivePhone ? 'high' : importPriority,
              leadType: importLeadType || 'whatsapp',
              status: 'new',
              source: 'whatsapp_chat',
            })
          }
        }
      }

      setParsedImportLeads(Array.from(extracted.values()))
    } catch (err: any) {
      alert(`Chat parse error: ${err.message}`)
    } finally {
      setIsParsingImport(false)
    }
  }

  // 3. Raw Text Paste Parser (Intelligent Line & Multi-Line Block Ingestion)
  const handleRawTextParse = () => {
    if (!importText.trim()) return
    setIsParsingImport(true)
    setImportSyncFeedback(null)

    try {
      const rawBlocks = importText.split(/\r?\n\s*\r?\n/).map(b => b.trim()).filter(Boolean)
      const useBlocks = rawBlocks.length > 1 && rawBlocks.some(b => b.includes('\n'))
      const units = useBlocks ? rawBlocks : importText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

      const results: any[] = []
      const seenKeys = new Set<string>()

      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i
      const phoneRegex = /(?:(?:\+?91[\s.-]?)?[6-9]\d{9})|(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,5}\)?[\s.-]?\d{3,4}[\s.-]?\d{4,5}/

      for (const unit of units) {
        let currentText = unit
        let email = ''
        let phone = ''

        // 1. Extract Email
        const emailMatch = currentText.match(emailRegex)
        if (emailMatch) {
          email = emailMatch[0].toLowerCase().trim()
          currentText = currentText.replace(emailMatch[0], ' ')
        }

        // 2. Extract Phone
        const phoneMatch = currentText.match(phoneRegex)
        if (phoneMatch) {
          const rawP = phoneMatch[0].trim()
          const cleanedP = cleanPhone(rawP)
          if (cleanedP.replace(/[^\d]/g, '').length >= 10) {
            phone = cleanedP
            currentText = currentText.replace(phoneMatch[0], ' ')
          }
        }

        if (!email && !phone) continue

        let company = ''
        let name = ''
        let city = ''
        let accreditations = ''

        // Check for explicit field labels if present
        const labeledCompany = unit.match(/(?:company|agency|firm|business|organization)\s*[:=\-–]\s*([^\n\r,;|]+)/i)
        if (labeledCompany) company = labeledCompany[1].trim()

        const labeledName = unit.match(/(?:contact|name|attn|rep|person)\s*[:=\-–]\s*([^\n\r,;|]+)/i)
        if (labeledName) name = labeledName[1].trim()

        const labeledCity = unit.match(/(?:city|location|branch|place)\s*[:=\-–]\s*([^\n\r,;|]+)/i)
        if (labeledCity) city = labeledCity[1].trim()

        // Clean delimiters and tokenize remainder
        let remainder = currentText
          .replace(/(?:company|agency|firm|business|name|contact|email|phone|mobile|tel|whatsapp|city|location)\s*[:=\-–]/gi, ' ')
          .replace(/[\r\n\t]+/g, ' | ')
          .replace(/\s{2,}/g, ' | ')
          .replace(/\s*[,|–—]\s*/g, ' | ')
          .replace(/\s+-\s+/g, ' | ')
          .trim()

        remainder = remainder.replace(/^[|\s-]+|[|\s-]+$/g, '').trim()
        const tokens = remainder.split('|').map(t => t.trim()).filter(Boolean)

        for (const token of tokens) {
          const lower = token.toLowerCase()

          // Check City
          const matchedCity = KNOWN_CITIES.find(c => new RegExp(`\\b${c}\\b`, 'i').test(token))
          if (matchedCity && !city) {
            city = matchedCity
            if (token.length <= matchedCity.length + 3) continue
          }

          // Check Accreditations
          const matchedAcc = ACCREDITATIONS_LIST.find(a => new RegExp(`\\b${a}\\b`, 'i').test(token))
          if (matchedAcc && !accreditations) {
            accreditations = matchedAcc
            if (token.length <= matchedAcc.length + 2) continue
          }

          // Check Company indicators or M/S
          const isCompanyLike = COMPANY_KEYWORDS.some(kw => lower.includes(kw)) ||
            /^m\/s/i.test(token) || /^messrs/i.test(token)

          if (isCompanyLike && !company) {
            company = token
          } else if (!name && !isCompanyLike && /^[a-zA-Z\s.'’-]{2,35}$/.test(token)) {
            name = token
          } else if (!company) {
            company = token
          }
        }

        if (!company && tokens.length > 0) {
          company = tokens[0]
        }

        // Company fallback from corporate domain
        if (!company && email) {
          const domain = email.split('@')[1] || ''
          if (!GENERIC_EMAIL_DOMAINS.has(domain.toLowerCase())) {
            const domainName = domain.split('.')[0]
            if (domainName && domainName.length > 2) {
              company = domainName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            }
          }
        }

        // Contact name fallback from email handle if human-like
        if (!name && email) {
          const username = email.split('@')[0] || ''
          const cleanUser = username.replace(/[0-9_.]+/g, ' ').trim()
          const isGenericHandle = ['info', 'contact', 'admin', 'sales', 'packages', 'support', 'booking', 'bookings', 'help'].some(w => cleanUser.toLowerCase().includes(w))
          const hasCompanyKeyword = COMPANY_KEYWORDS.some(kw => cleanUser.toLowerCase().includes(kw))

          if (cleanUser.length >= 3 && !isGenericHandle && !hasCompanyKeyword) {
            name = cleanUser.replace(/\b\w/g, c => c.toUpperCase())
          }
        }

        if (company) {
          if (city && company.toLowerCase().endsWith(city.toLowerCase())) {
            company = company.slice(0, -city.length).replace(/[-–,\s]+$/, '').trim()
          }
          company = company.replace(/\s+/g, ' ').trim()
        }

        const uniqueKey = (email || phone).toLowerCase()
        if (seenKeys.has(uniqueKey)) continue
        seenKeys.add(uniqueKey)

        results.push({
          name: name || '',
          email: email,
          phone: phone,
          whatsapp: phone ? `https://wa.me/${phone.replace(/[^\d]/g, '')}` : '',
          company: company,
          designation: '',
          city: city,
          accreditations: accreditations,
          priority: phone ? 'high' : importPriority,
          leadType: importLeadType || 'agent',
          status: 'new',
          source: 'manual_text_paste',
        })
      }

      setParsedImportLeads(results)
    } catch (err: any) {
      alert(`Text parse error: ${err.message}`)
    } finally {
      setIsParsingImport(false)
    }
  }

  // Staging Grid Handlers
  const handleUpdateParsedLead = (index: number, field: string, value: string) => {
    setParsedImportLeads(prev => {
      const updated = [...prev]
      const item = { ...updated[index], [field]: value }
      if (field === 'phone') {
        const cleanP = cleanPhone(value)
        item.whatsapp = cleanP ? `https://wa.me/${cleanP.replace(/[^\d]/g, '')}` : ''
      }
      updated[index] = item
      return updated
    })
  }

  const handleDeleteParsedLead = (index: number) => {
    setParsedImportLeads(prev => prev.filter((_, i) => i !== index))
  }

  const handleExportParsedLeads = () => {
    if (parsedImportLeads.length === 0) return
    const exportRows = parsedImportLeads.map((lead, idx) => ({
      'S.No': idx + 1,
      'Company Name': lead.company || '',
      'Contact Name': lead.name || '',
      'Email Address': lead.email || '',
      'Phone Number': lead.phone || '',
      'WhatsApp Link': lead.whatsapp || '',
      'City / Location': lead.city || '',
      'Accreditations': lead.accreditations || '',
      'Lead Type': lead.leadType || 'agent',
      'Priority': lead.priority || 'normal',
      'Source': lead.source || 'parsed_import'
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staging_Leads')
    XLSX.writeFile(workbook, `Import_Staging_Leads_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleLoadSamplePaste = () => {
    const sample = `M/S Marshall Tours N Travels   packages@marshalltravel.in   9538683939
M/S Bhalaji Tours & Travels    sribhalajitravels1@gmail.com 9845857147
M/S Travel Innovations   info@bestbus.in 8121115444
M/S Blended Routes LLP   blendedroutes@gmail.com 7892749935
M/S Abishek Travels      venkatesh4465@gmail.com 9844264501
M/S Pooja Travels        poojatravels@gmail.com  9845049916
Rajesh Sharma | Skyway Travels Bangalore | info@skyway.com | 9845012345 | IATA`
    setImportText(sample)
  }

  // Filtered preview leads for staging review
  const filteredParsedLeads = parsedImportLeads.filter(p => {
    if (!importFilterQuery.trim()) return true
    const q = importFilterQuery.toLowerCase()
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.company && p.company.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q)) ||
      (p.city && p.city.toLowerCase().includes(q)) ||
      (p.accreditations && p.accreditations.toLowerCase().includes(q))
    )
  })

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
            onClick={() => fetchLeads()}
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
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.74rem', color: '#065F46', fontWeight: 700, textTransform: 'uppercase' }}>✅ Complete (Email + Phone)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#065F46', marginTop: '2px' }}>{stats.complete || 0}</div>
        </div>
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.74rem', color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>🌟 High Priority Leads</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#92400E', marginTop: '2px' }}>{stats.highPriority}</div>
        </div>
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.74rem', color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase' }}>💬 Direct WhatsApp Ready</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E40AF', marginTop: '2px' }}>{stats.withWhatsApp}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 260px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 12px' }}>
          <Search size={15} color={isSearchingServer ? '#0F4C3A' : '#94A3B8'} className={isSearchingServer ? 'animate-spin' : ''} />
          <input
            type="text"
            placeholder="Global search across all 1,366+ database leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.84rem', color: '#0F172A', background: 'transparent', fontFamily: 'var(--font-inter), sans-serif' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Cleanliness / Quality Filter */}
        <select
          value={cleanlinessFilter}
          onChange={(e) => setCleanlinessFilter(e.target.value as any)}
          style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.82rem', background: '#FFF', color: '#334155', fontWeight: 600, fontFamily: 'var(--font-inter), sans-serif' }}
        >
          <option value="all">All Records ({stats.total || leads.length})</option>
          <option value="complete">✅ Complete (Email + Phone) ({stats.complete || 0})</option>
          <option value="missing_phone">⚠️ Missing Phone ({stats.missingPhone || 0})</option>
          <option value="missing_email">⚠️ Missing Email ({stats.missingEmail || 0})</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.82rem', background: '#FFF', color: '#334155', fontWeight: 600, fontFamily: 'var(--font-inter), sans-serif' }}
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
          style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.82rem', background: '#FFF', color: '#334155', fontWeight: 600, fontFamily: 'var(--font-inter), sans-serif' }}
        >
          <option value="all">All Pipeline Stages</option>
          <option value="new">🔵 New / Uncontacted</option>
          <option value="contacted">🟡 Contacted</option>
          <option value="in_discussion">🟢 In Discussion</option>
          <option value="closed">🟣 Closed / Booked</option>
        </select>

        {/* Display Limit Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>Show:</label>
          <select
            value={displayLimit}
            onChange={(e) => setDisplayLimit(e.target.value)}
            style={{ padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.78rem', background: '#FFF', color: '#0F172A', fontWeight: 700, fontFamily: 'var(--font-inter), sans-serif' }}
          >
            <option value="all">All ({stats.total || '1,366'})</option>
            <option value="1000">1,000</option>
            <option value="500">500</option>
            <option value="250">250</option>
          </select>
        </div>

        <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isSearchingServer && <RefreshCw size={12} className="animate-spin" color="#0F4C3A" />}
          Showing <strong>{filteredLeads.length}</strong> of <strong>{stats.total || leads.length}</strong> leads
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
          <div style={{ background: '#FFFFFF', maxWidth: '1020px', width: '100%', maxHeight: '92vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📥 Import Leads to Directory</span>
                  <span style={{ fontSize: '0.72rem', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                    AI-Enhanced Parser
                  </span>
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0' }}>
                  Intelligently captures company names, contact names, emails, phones (+91), cities, and accreditations into single unified records.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false)
                  setParsedImportLeads([])
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

              {/* Batch Ingestion Presets */}
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
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 400 }}>
                    (Applied to newly parsed leads)
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>Default Lead Type:</label>
                    <select
                      value={importLeadType}
                      onChange={(e) => setImportLeadType(e.target.value)}
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
                      <option value="agent">Travel Agent / B2B Partner</option>
                      <option value="company">Company Account</option>
                      <option value="individual">Direct Individual</option>
                      <option value="department">Department Inbox</option>
                      <option value="whatsapp">WhatsApp Contact</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>Default Priority:</label>
                    <select
                      value={importPriority}
                      onChange={(e) => setImportPriority(e.target.value as any)}
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
                      <option value="normal">🔵 Normal Priority</option>
                      <option value="high">🌟 High Priority</option>
                      <option value="medium">⚡ Medium Priority</option>
                    </select>
                  </div>
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
                    Paste line-by-line directory contacts (e.g. <code>M/S Agency packages@agency.in 9538683939</code>), tab-separated spreadsheet rows, or multi-line email signatures. Auto-extracts emails, phones (+91), companies, cities, and accreditations into single unified leads.
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
                      {isParsingImport ? 'Parsing Text...' : 'Extract & Unify Contacts'}
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

              {/* Extracted Preview / Staging Grid */}
              {parsedImportLeads.length > 0 && (
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
                          {parsedImportLeads.length} leads ready to ingest
                        </span>
                        {importFilterQuery && (
                          <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 500, marginLeft: '6px' }}>
                            ({filteredParsedLeads.length} matching filter)
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#64748B' }}>
                        You can edit fields inline or remove rows before syncing to directory.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ position: 'relative' }}>
                        <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                          type="text"
                          value={importFilterQuery}
                          onChange={(e) => setImportFilterQuery(e.target.value)}
                          placeholder="Filter parsed leads..."
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
                        onClick={handleExportParsedLeads}
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
                        title="Download parsed staging leads as an Excel file"
                      >
                        <Download size={13} /> Export (.xlsx)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setParsedImportLeads([])
                          setImportFilterQuery('')
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
                    marginBottom: '16px',
                    background: '#FFFFFF'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', textAlign: 'left' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#F1F5F9', zIndex: 2 }}>
                        <tr style={{ borderBottom: '1px solid #CBD5E1', color: '#475569' }}>
                          <th style={{ padding: '8px 6px', width: '32px', textAlign: 'center' }}>#</th>
                          <th style={{ padding: '8px 8px', minWidth: '170px' }}>Company / Agency</th>
                          <th style={{ padding: '8px 8px', minWidth: '130px' }}>Contact Name</th>
                          <th style={{ padding: '8px 8px', minWidth: '170px' }}>Email Address</th>
                          <th style={{ padding: '8px 8px', minWidth: '140px' }}>Phone (+91)</th>
                          <th style={{ padding: '8px 8px', minWidth: '100px' }}>City</th>
                          <th style={{ padding: '8px 8px', minWidth: '85px' }}>Accreditation</th>
                          <th style={{ padding: '8px 8px', minWidth: '110px' }}>Type</th>
                          <th style={{ padding: '8px 8px', minWidth: '95px' }}>Priority</th>
                          <th style={{ padding: '8px 6px', width: '36px', textAlign: 'center' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredParsedLeads.map((p, idx) => {
                          const originalIdx = parsedImportLeads.indexOf(p)
                          const targetIdx = originalIdx >= 0 ? originalIdx : idx
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                              <td style={{ padding: '6px 4px', textAlign: 'center', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 600 }}>
                                {targetIdx + 1}
                              </td>
                              <td style={{ padding: '4px 6px' }}>
                                <input
                                  type="text"
                                  value={p.company || ''}
                                  onChange={(e) => handleUpdateParsedLead(targetIdx, 'company', e.target.value)}
                                  placeholder="Company name"
                                  style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
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
                                  value={p.name || ''}
                                  onChange={(e) => handleUpdateParsedLead(targetIdx, 'name', e.target.value)}
                                  placeholder="Contact person"
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
                                  value={p.email || ''}
                                  onChange={(e) => handleUpdateParsedLead(targetIdx, 'email', e.target.value)}
                                  placeholder="Email"
                                  style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    fontSize: '0.76rem',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    background: '#FFFFFF',
                                    color: '#800020',
                                    fontFamily: 'var(--font-inter), sans-serif'
                                  }}
                                />
                              </td>
                              <td style={{ padding: '4px 6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <input
                                    type="text"
                                    value={p.phone || ''}
                                    onChange={(e) => handleUpdateParsedLead(targetIdx, 'phone', e.target.value)}
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
                                  onChange={(e) => handleUpdateParsedLead(targetIdx, 'city', e.target.value)}
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
                                  value={p.accreditations || ''}
                                  onChange={(e) => handleUpdateParsedLead(targetIdx, 'accreditations', e.target.value)}
                                  placeholder="IATA, TAAI"
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
                                <select
                                  value={p.leadType || 'agent'}
                                  onChange={(e) => handleUpdateParsedLead(targetIdx, 'leadType', e.target.value)}
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
                                  <option value="agent">Agent</option>
                                  <option value="company">Company</option>
                                  <option value="individual">Individual</option>
                                  <option value="department">Dept</option>
                                  <option value="whatsapp">WhatsApp</option>
                                </select>
                              </td>
                              <td style={{ padding: '4px 6px' }}>
                                <select
                                  value={p.priority || 'normal'}
                                  onChange={(e) => handleUpdateParsedLead(targetIdx, 'priority', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '4px 4px',
                                    fontSize: '0.74rem',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    background: '#FFFFFF',
                                    color: p.priority === 'high' ? '#D97706' : '#0F172A',
                                    fontWeight: p.priority === 'high' ? 700 : 500,
                                    fontFamily: 'var(--font-inter), sans-serif',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="normal">Normal</option>
                                  <option value="high">High</option>
                                  <option value="medium">Medium</option>
                                </select>
                              </td>
                              <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteParsedLead(targetIdx)}
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

                  <button
                    type="button"
                    onClick={handleSyncImportToSanity}
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
                        Syncing {parsedImportLeads.length} Leads to Sanity...
                      </>
                    ) : (
                      <>
                        🚀 Sync {parsedImportLeads.length} Leads to Sanity Directory
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
                  setParsedImportLeads([])
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
