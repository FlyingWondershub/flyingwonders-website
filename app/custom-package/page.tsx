'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import IciciQrModal from '../../components/IciciQrModal'
import { load } from '@cashfreepayments/cashfree-js'
import { Loader2, Copy, FileText, Calendar, MessageSquare, Save, Send, CopyCheck, FileDown, CalendarDays, MessageCircle, BookmarkCheck, AlertTriangle, X } from 'lucide-react'

// Default Fallback Master Data (Configured in SGD)
const FALLBACK_HOTELS = [
  {
    name: 'Boss Hotel Singapore (3★ Budget)',
    rooms: [
      { type: 'Standard Queen Room', price: 105 },
      { type: 'Family Quad Room', price: 150 },
      { type: 'Extra Bed Surcharge', price: 40 },
    ],
  },
  {
    name: 'Orchard Hotel Singapore (4★ Premium)',
    rooms: [
      { type: 'Deluxe Twin Room', price: 190 },
      { type: 'Executive Suite', price: 350 },
      { type: 'Extra Bed Surcharge', price: 60 },
    ],
  },
]

const FALLBACK_VEHICLES: { type: string; pricePerTransfer: number; serviceName?: string }[] = [
  { type: 'Private Sedan (Toyota Camry / Similar)', pricePerTransfer: 70 },
  { type: 'Private Minibus (13-Seater High Roof)', pricePerTransfer: 100 },
]

const FALLBACK_ATTRACTIONS = [
  { name: 'Universal Studios Singapore', adultPrice: 78, childPrice: 66 },
  { name: 'Gardens by the Bay (Double Domes)', adultPrice: 30, childPrice: 22 },
]

const ATTRACTION_DESCRIPTIONS: Record<string, string> = {
  'Universal Studios Singapore': 'Experience cutting-edge rides, shows, and attractions based on your favorite blockbuster films and television series.',
  'Gardens by the Bay (Double Domes)': 'Explore the Flower Dome (the largest glass greenhouse) and the Cloud Forest, home to a massive indoor waterfall.',
  'Night Safari': 'Explore the world\'s first nocturnal zoo and observe nocturnal animals in their natural habitats.',
  'Sentosa Cable Car': 'Enjoy panoramic aerial views of Singapore\'s skyline and Sentosa Island from the Mount Faber Line.',
  'Madame Tussauds': 'Get up close with lifelike wax figures of world-famous celebrities, leaders, and historical icons.',
  'Wings of Time': 'A spectacular night show set against the open sea, featuring water, laser, and fire effects.'
}

const MEAL_PRICES = {
  breakfast: 12,
  lunch: 17,
  dinner: 17
}

const isVehicleSIC = (v?: { type?: string; isSIC?: boolean }) => {
  if (!v) return false
  if (v.isSIC) return true
  const t = (v.type || '').toLowerCase()
  return t.includes('sic') || t.includes('seat-in-coach') || t.includes('seat in coach') || t.includes('shared')
}

const TIME_OPTIONS: string[] = []
for (let h = 0; h < 24; h++) {
  const hStr = h.toString().padStart(2, '0')
  TIME_OPTIONS.push(`${hStr}:00`)
  TIME_OPTIONS.push(`${hStr}:15`)
  TIME_OPTIONS.push(`${hStr}:30`)
  TIME_OPTIONS.push(`${hStr}:45`)
}

const FALLBACK_GUIDES = [
  { type: 'Half-Day Professional Heritage Guide', pricePerDay: 80 },
  { type: 'Full-Day Accompanying Tour Director', pricePerDay: 145 },
]

interface TransferEntry {
  vehicleIndex: number
  time: string
  description: string
  qty?: number
  type?: string
  serviceName?: string
}

interface MealEntry {
  mealIndex: number
  time: string
  description: string
  type?: string
}

interface GuideEntry {
  guideIndex: number
  time: string
  description: string
  type?: string
}

interface AttractionEntry {
  attractionIndex: number
  attractionName?: string
  adultTickets: number
  childTickets: number
  time: string
  description: string
  hasTransfer?: boolean
  pickupEnabled?: boolean
  pickupTime?: string
  pickupVehicleIndex?: number
  pickupVehicleType?: string
  pickupNotes?: string
  dropEnabled?: boolean
  dropTime?: string
  dropVehicleIndex?: number
  dropVehicleType?: string
  dropNotes?: string
}

interface DayPlan {
  transfers: TransferEntry[]
  attractions: AttractionEntry[]
  breakfast: boolean
  lunch: boolean
  dinner: boolean
  guides: GuideEntry[]
  meals?: MealEntry[]
  guideRequired?: boolean
  isBreakTrip?: boolean
  isCustomDay?: boolean
  customDate?: string
}

// Default fallback rate until live API responds (overridden on mount)
const DEFAULT_SGD_TO_INR = 74.81

export default function PrototypeBuilder() {
  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null) // null represents loading state
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [regCompanyName, setRegCompanyName] = useState('')
  const [regAgentName, setRegAgentName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [debugCode, setDebugCode] = useState<string | null>(null)
  const [smtpError, setSmtpError] = useState<string | null>(null)
  
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [activeAgent, setActiveAgent] = useState<{ companyName?: string; agentName?: string; email?: string; phone?: string; role?: string } | null>(null)

  // Newsletter Admin States
  const [draftCampaigns, setDraftCampaigns] = useState<{ _id: string; title: string; subject: string }[]>([])
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [dispatchMessage, setDispatchMessage] = useState('')

  // Fetch draft campaigns if logged in as Admin
  useEffect(() => {
    if (activeAgent?.email?.toLowerCase() === 'info.flyingwonders@gmail.com') {
      const fetchDrafts = async () => {
        try {
          const res = await fetch(`/api/newsletter/campaigns?adminEmail=${activeAgent.email}`)
          const data = await res.json()
          if (data.success) {
            setDraftCampaigns(data.campaigns)
          }
        } catch (err) {
          console.error('Failed to fetch draft campaigns', err)
        }
      }
      fetchDrafts()
    } else {
      setDraftCampaigns([])
    }
  }, [activeAgent])

  // Dispatch Newsletter Action
  const handleDispatchNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCampaignId || !activeAgent?.email) return
    setDispatchStatus('sending')
    setDispatchMessage('')

    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          adminEmail: activeAgent.email
        })
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setDispatchStatus('success')
        setDispatchMessage(`Newsletter dispatched successfully to ${data.sentCount} of ${data.totalCount} active subscribers.`)
        // Remove the sent campaign from list
        setDraftCampaigns(prev => prev.filter(c => c._id !== selectedCampaignId))
        setSelectedCampaignId('')
      } else {
        throw new Error(data.error || 'Failed to dispatch campaign')
      }
    } catch (err: any) {
      setDispatchStatus('error')
      setDispatchMessage(err.message || 'Error executing newsletter dispatch.')
    }
  }

  // Admin B2B Agent Attribution States
  const [b2bAgentsList, setB2bAgentsList] = useState<any[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string>('direct')
  const [selectedAgentDetails, setSelectedAgentDetails] = useState<{ _id?: string; companyName?: string; agentName?: string; email?: string; phone?: string } | null>(null)

  // Fetch registered B2B agents if logged in as Admin
  useEffect(() => {
    if (activeAgent?.email?.toLowerCase() === 'info.flyingwonders@gmail.com') {
      fetch('/api/admin/agents')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setB2bAgentsList(data.filter((a: any) => a.isApproved !== false))
          }
        })
        .catch(() => {})
    } else {
      setB2bAgentsList([])
    }
  }, [activeAgent])

  // Handle Admin selecting an Agent to attribute the proposal to
  const handleAdminAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId)
    if (!agentId || agentId === 'direct') {
      setSelectedAgentDetails(null)
      setAgentName('Flying Wonders DMC')
      setAgentEmail('info.flyingwonders@gmail.com')
      setAgentPhone('+65 9689 0101')
      setCustomAgencyName('Flying Wonders DMC')
      setCustomAgencyEmail('info.flyingwonders@gmail.com')
      setCustomAgencyPhone('+65 9689 0101')
      return
    }
    const found = b2bAgentsList.find(a => a._id === agentId)
    if (found) {
      setSelectedAgentDetails(found)
      setAgentName(found.agentName || '')
      setAgentEmail(found.email || '')
      setAgentPhone(found.phone || '')
      setCustomAgencyName(found.companyName || found.agentName || 'Partner Agency')
      setCustomAgencyEmail(found.email || '')
      setCustomAgencyPhone(found.phone || '')
    }
  }

  // Auto-populate enquiry form fields once agent is logged in
  useEffect(() => {
    if (activeAgent) {
      const isAdmin = activeAgent.email?.toLowerCase() === 'info.flyingwonders@gmail.com'
      if (!isAdmin) {
        setAgentName(activeAgent.agentName || '')
        setAgentEmail(activeAgent.email || '')
        setAgentPhone(activeAgent.phone || '')
        setCustomAgencyName(activeAgent.companyName || 'My Travel Agency')
        setCustomAgencyEmail(activeAgent.email || '')
        setCustomAgencyPhone(activeAgent.phone || '')
      }
    } else {
      setAgentName('')
      setAgentEmail('')
      setAgentPhone('')
      setCustomAgencyName('My Travel Agency')
      setCustomAgencyEmail('')
      setCustomAgencyPhone('')
    }
  }, [activeAgent])

  // Global Parameter States
  const [adults, setAdults] = useState(2)
  const [kids, setKids] = useState(0)
  const [childAges, setChildAges] = useState<number[]>([])
  const [nightsCount, setNightsCount] = useState(3)
  const [miscCostPerPerson, setMiscCostPerPerson] = useState(0)
  const [miscNotes, setMiscNotes] = useState('')
  const [markupPercent, setMarkupPercent] = useState(0)
  const [markupAbsolute, setMarkupAbsolute] = useState(0)
  const [discountPerPerson, setDiscountPerPerson] = useState(0)
  const minCheckinDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  }, [])

  const [arrivalDate, setArrivalDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  })

  // Live SGD → INR exchange rate (fetched from /api/exchange-rate on mount)
  const [sgdToInrRate, setSgdToInrRate] = useState(DEFAULT_SGD_TO_INR)
  const [rateLoaded, setRateLoaded] = useState(false)
  const [isIciciModalOpen, setIsIciciModalOpen] = useState(false)
  const [customPackageSheetUrl, setCustomPackageSheetUrl] = useState<string | null>(null)
  const [hideIciciCustomPackage, setHideIciciCustomPackage] = useState(false)
  const [hideCashfreeCustomPackage, setHideCashfreeCustomPackage] = useState(false)
  const [hidePreviewPackageOverlay, setHidePreviewPackageOverlay] = useState(false)
  const [hideClientPreview, setHideClientPreview] = useState(false)

  // Dynamic Master Data fetched from Google Sheets (SGD pricing)
  const [hotelsList, setHotelsList] = useState(FALLBACK_HOTELS)
  const [vehiclesList, setVehiclesList] = useState<{ type: string; pricePerTransfer: number; serviceName?: string }[]>(FALLBACK_VEHICLES)
  const [attractionsList, setAttractionsList] = useState<{ name: string; adultPrice: number; childPrice: number; area?: string }[]>(FALLBACK_ATTRACTIONS)
  const [attractionsMeta, setAttractionsMeta] = useState<Record<string, { shortDescription?: string; longDescription?: string; highlights?: string[]; tips?: string[]; rating?: number; category?: string; openingHours?: string; duration?: string; location?: string; photoUrl?: string | null }>>({})
  const [mealsList, setMealsList] = useState<any[]>([])
  const [guidesList, setGuidesList] = useState(FALLBACK_GUIDES)
  const [sheetLoading, setSheetLoading] = useState(false)

  // B2B Enquiry Form States
  const [agentName, setAgentName] = useState('')
  const [agentEmail, setAgentEmail] = useState('')
  const [agentPhone, setAgentPhone] = useState('')
  const [agentQuery, setAgentQuery] = useState('')
  const [enquiryStatus, setEnquiryStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [cashfreeLoading, setCashfreeLoading] = useState(false)

  // White-Label Customization States
  const [customAgencyName, setCustomAgencyName] = useState('My Travel Agency')
  const [customAgencyEmail, setCustomAgencyEmail] = useState('')
  const [customAgencyPhone, setCustomAgencyPhone] = useState('')
  const [hideNetPricing, setHideNetPricing] = useState(true)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'templates'>('editor')
  const [hideReadyTemplatesSubpage, setHideReadyTemplatesSubpage] = useState(false)
  const [activeTemplateName, setActiveTemplateName] = useState<string | null>(null)
  const [readyTemplatesList, setReadyTemplatesList] = useState<any[]>([
    {
      _id: 'template-1',
      title: '3N/4D Singapore Highlights & City Essentials',
      nightsCount: 3,
      category: 'popular',
      badgeText: 'BESTSELLER',
      startingPriceSGD: 485,
      summary: 'Airport Transfers + Half Day City Tour + Gardens by the Bay (2 Domes) + Night Safari with Tram.',
      coverImage: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop&q=80',
      itinerary: [
        {
          dayTitle: 'Arrival & Changi Jewel Transfer',
          transfers: [{ vehicleIndex: 0, time: '12:00', description: 'Changi Airport to Hotel Private Transfer', qty: 1 }],
          attractions: [],
          breakfast: false, lunch: false, dinner: false,
          guides: []
        },
        {
          dayTitle: 'Gardens by the Bay & Flower Dome',
          transfers: [{ vehicleIndex: 0, time: '09:30', description: 'Hotel to Gardens by the Bay Transfer', qty: 1 }],
          attractions: [{ attractionIndex: 0, attractionName: 'Gardens by the Bay - Flower Dome & Cloud Forest', time: '10:00', adultQty: 2, childQty: 0 }],
          breakfast: true, lunch: false, dinner: false,
          guides: [{ guideType: 0, notes: 'English Speaking Half Day Guide' }]
        },
        {
          dayTitle: 'Night Safari Experience',
          transfers: [{ vehicleIndex: 0, time: '17:00', description: 'Hotel to Mandai Wildlife Reserve', qty: 1 }],
          attractions: [{ attractionIndex: 2, attractionName: 'Night Safari with Tram Ride', time: '18:30', adultQty: 2, childQty: 0 }],
          breakfast: true, lunch: false, dinner: true,
          guides: []
        },
        {
          dayTitle: 'Departure Transfer',
          transfers: [{ vehicleIndex: 0, time: '11:00', description: 'Hotel to Changi Airport Private Departure', qty: 1 }],
          attractions: [],
          breakfast: true, lunch: false, dinner: false,
          guides: []
        }
      ]
    },
    {
      _id: 'template-2',
      title: '4N/5D Sentosa Thrill & Universal Studios Special',
      nightsCount: 4,
      category: 'family',
      badgeText: 'FAMILY FAVORITE',
      startingPriceSGD: 720,
      summary: 'Universal Studios Full Day Pass + S.E.A. Aquarium + Wings of Time + Marina Bay Sands SkyPark.',
      coverImage: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&auto=format&fit=crop&q=80',
      itinerary: [
        {
          dayTitle: 'Arrival & Hotel Check-in',
          transfers: [{ vehicleIndex: 0, time: '14:00', description: 'Airport to Hotel Transfer', qty: 1 }],
          attractions: [],
          breakfast: false, lunch: false, dinner: false,
          guides: []
        },
        {
          dayTitle: 'Universal Studios Singapore Full Day',
          transfers: [{ vehicleIndex: 0, time: '09:00', description: 'Hotel to Resorts World Sentosa Transfer', qty: 1 }],
          attractions: [{ attractionIndex: 1, attractionName: 'Universal Studios Singapore One-Day Ticket', time: '10:00', adultQty: 2, childQty: 0 }],
          breakfast: true, lunch: false, dinner: false,
          guides: []
        },
        {
          dayTitle: 'S.E.A. Aquarium & Wings of Time',
          transfers: [{ vehicleIndex: 0, time: '10:00', description: 'Hotel to Sentosa Island', qty: 1 }],
          attractions: [
            { attractionIndex: 3, attractionName: 'S.E.A. Aquarium', time: '10:30', adultQty: 2, childQty: 0 },
            { attractionIndex: 4, attractionName: 'Wings of Time Night Show', time: '19:40', adultQty: 2, childQty: 0 }
          ],
          breakfast: true, lunch: false, dinner: true,
          guides: []
        },
        {
          dayTitle: 'MBS SkyPark & Marina Bay Cruise',
          transfers: [{ vehicleIndex: 0, time: '15:00', description: 'Hotel to Marina Bay Sands', qty: 1 }],
          attractions: [{ attractionIndex: 5, attractionName: 'Marina Bay Sands SkyPark Observation Deck', time: '16:00', adultQty: 2, childQty: 0 }],
          breakfast: true, lunch: false, dinner: false,
          guides: [{ guideType: 0, notes: 'Half Day Escort Guide' }]
        },
        {
          dayTitle: 'Departure Transfer',
          transfers: [{ vehicleIndex: 0, time: '12:00', description: 'Hotel to Changi Departure', qty: 1 }],
          attractions: [],
          breakfast: true, lunch: false, dinner: false,
          guides: []
        }
      ]
    },
    {
      _id: 'template-3',
      title: '5N/6D Grand Singapore & Malaysia Cross-Border Escape',
      nightsCount: 5,
      category: 'luxury',
      badgeText: 'LUXURY DMC',
      startingPriceSGD: 1050,
      summary: 'Full Singapore Highlights + Private VIP Cross-Border Transfer to Johor Bahru / Desaru Coast.',
      coverImage: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop&q=80',
      itinerary: [
        {
          dayTitle: 'Arrival & VIP Transfer',
          transfers: [{ vehicleIndex: 1, time: '13:00', description: 'Changi Airport to Luxury Hotel VIP 7-Seater', qty: 1 }],
          attractions: [],
          breakfast: false, lunch: false, dinner: false,
          guides: []
        },
        {
          dayTitle: 'Gardens by the Bay & Supertree Observatory',
          transfers: [{ vehicleIndex: 1, time: '09:30', description: 'Private Transfer to Gardens by the Bay', qty: 1 }],
          attractions: [{ attractionIndex: 0, attractionName: 'Gardens by the Bay + Supertree Observatory', time: '10:00', adultQty: 2, childQty: 0 }],
          breakfast: true, lunch: true, dinner: false,
          guides: [{ guideType: 1, notes: 'Full Day Licensed English Guide' }]
        },
        {
          dayTitle: 'Universal Studios VIP Access',
          transfers: [{ vehicleIndex: 1, time: '09:00', description: 'Private Sentosa VIP Transfer', qty: 1 }],
          attractions: [{ attractionIndex: 1, attractionName: 'Universal Studios Singapore Express Ticket', time: '10:00', adultQty: 2, childQty: 0 }],
          breakfast: true, lunch: false, dinner: true,
          guides: []
        },
        {
          dayTitle: 'Private Cross-Border Transfer to Malaysia',
          transfers: [{ vehicleIndex: 1, time: '09:00', description: 'Singapore Hotel to Johor Bahru Cross-Border VIP MPV', qty: 1 }],
          attractions: [],
          breakfast: true, lunch: false, dinner: false,
          guides: []
        },
        {
          dayTitle: 'Desaru Coast Leisure Day',
          transfers: [],
          attractions: [],
          breakfast: true, lunch: false, dinner: false,
          guides: []
        },
        {
          dayTitle: 'Return Departure Transfer',
          transfers: [{ vehicleIndex: 1, time: '10:00', description: 'Johor Bahru to Changi Airport Departure', qty: 1 }],
          attractions: [],
          breakfast: true, lunch: false, dinner: false,
          guides: []
        }
      ]
    }
  ])
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState<'all' | '3' | '4' | '5'>('all')
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<'all' | 'popular' | 'family' | 'luxury' | 'budget' | 'mice'>('all')
  const [templateModalItem, setTemplateModalItem] = useState<any | null>(null)
  const [templateModalCheckinDate, setTemplateModalCheckinDate] = useState('')

  // UI Layout States
  const [collapsedDays, setCollapsedDays] = useState<Set<number>>(new Set(Array.from({ length: 15 }, (_, i) => i)))
  const [priceDrawerOpen, setPriceDrawerOpen] = useState(false)
  const [showBranding, setShowBranding] = useState(false)
  const [showEnquiry, setShowEnquiry] = useState(false)
  const [hotelEditOpen, setHotelEditOpen] = useState(true)
  const [agentSettingsOpen, setAgentSettingsOpen] = useState(false)

  // Proposal Save & Search States
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [savedProposalNum, setSavedProposalNum] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'success' | 'not_found' | 'error'>('idle')

  // Guest Name & Quotations List States
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [showQuotationsModal, setShowQuotationsModal] = useState(false)
  const [quotationsList, setQuotationsList] = useState<any[]>([])
  const [loadingQuotations, setLoadingQuotations] = useState(false)
  const [loadedProposalRaw, setLoadedProposalRaw] = useState<any | null>(null)
  const [registrySearchQuery, setRegistrySearchQuery] = useState('')
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false)
  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>({})

  // Admin Invoicing & Financial Ledger States
  const [activeProposalStatus, setActiveProposalStatus] = useState<string>('pending')
  const [activeInvoiceNumber, setActiveInvoiceNumber] = useState<string>('')
  const [activeInvoiceDate, setActiveInvoiceDate] = useState<string>('')
  const [activePaymentLedger, setActivePaymentLedger] = useState<any[]>([])
  const [activeAdditionalCharges, setActiveAdditionalCharges] = useState<any[]>([])
  const [showLedgerModal, setShowLedgerModal] = useState<boolean>(false)

  // Ledger Add Forms
  const [ledgerPaymentAmount, setLedgerPaymentAmount] = useState<string>('')
  const [ledgerPaymentMethod, setLedgerPaymentMethod] = useState<string>('Bank Transfer (PayNow/Wire)')
  const [ledgerPaymentRef, setLedgerPaymentRef] = useState<string>('')
  const [ledgerPaymentNotes, setLedgerPaymentNotes] = useState<string>('')
  
  const [ledgerChargeDesc, setLedgerChargeDesc] = useState<string>('')
  const [ledgerChargeAmount, setLedgerChargeAmount] = useState<string>('')
  const [ledgerChargeType, setLedgerChargeType] = useState<string>('Add-On')
  const [ledgerSubmitting, setLedgerSubmitting] = useState<boolean>(false)

  const toggleDay = (idx: number) => {
    setCollapsedDays(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const toggleAreaExpand = (dayIdx: number, areaName: string) => {
    const key = `${dayIdx}-${areaName}`
    setExpandedAreas(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }
  const collapseAll = () => setCollapsedDays(new Set(itinerary.map((_, i) => i)))
  const expandAll = () => setCollapsedDays(new Set())

  // Global Hotel Selection States
  const [hotelRequired, setHotelRequired] = useState(true)
  const [globalHotelIndex, setGlobalHotelIndex] = useState(0)
  const [globalRoomIndex, setGlobalRoomIndex] = useState(0)
  const [globalRoomCount, setGlobalRoomCount] = useState(1)
  const [globalSuppIndex, setGlobalSuppIndex] = useState(-1)
  const [globalSuppCount, setGlobalSuppCount] = useState(0)

  // Custom Hotel Pricing States
  const [customHotelEnabled, setCustomHotelEnabled] = useState(false)
  const [customHotelName, setCustomHotelName] = useState('')
  const [customHotelRoomType, setCustomHotelRoomType] = useState('')
  const [customHotelPrice, setCustomHotelPrice] = useState(0)
  const [customHotelSuppName, setCustomHotelSuppName] = useState('')
  const [customHotelSuppCost, setCustomHotelSuppCost] = useState(0)
  const [supplementRequired, setSupplementRequired] = useState(false)

  const [itinerary, setItinerary] = useState<DayPlan[]>([])
  const handleDestinationModeChange = (mode: 'singapore' | 'malaysia') => {
    setDestinationMode(mode)
    setGlobalHotelIndex(0)
    setGlobalRoomIndex(0)
    setGlobalRoomCount(1)
    setGlobalSuppIndex(-1)
    setGlobalSuppCount(0)
    setCustomHotelEnabled(false)
    setCustomHotelName('')
    setCustomHotelRoomType('')
    setCustomHotelPrice(0)
    setCustomHotelSuppName('')
    setCustomHotelSuppCost(0)
    setSupplementRequired(false)
    setItinerary(prev => prev.map(day => ({
      ...day,
      transfers: [],
      breakfast: false,
      lunch: false,
      dinner: false,
      guideRequired: false,
      meals: [],
      guides: [],
      attractions: [],
      isBreakTrip: false
    })))
  }
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleFilters, setScheduleFilters] = useState({ transfers: true, attractions: true, meals: true, guides: true })

  // 1. Verify Session Check on load
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`/api/auth/check?cb=${Date.now()}`, { cache: 'no-store' })
        const data = await res.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
          setActiveAgent(data.agent)
        } else {
          setIsAuthenticated(false)
        }
      } catch (err) {
        setIsAuthenticated(false)
      }
    }
    checkSession()
  }, [])

  // AI Planner draft pre-fill: detect ?from=ai-planner via window.location and load sessionStorage draft
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('from') !== 'ai-planner') return
    try {
      const raw = sessionStorage.getItem('ai_planner_draft')
      if (!raw) return
      const draft = JSON.parse(raw)
      if (draft.adults) setAdults(draft.adults)
      if (draft.kids !== undefined) setKids(draft.kids)
      if (draft.numNights) setNightsCount(draft.numNights)
      if (draft.arrivalDate) setArrivalDate(draft.arrivalDate)
      // Pre-fill itinerary attractions after the itinerary array is initialized
      if (Array.isArray(draft.days) && draft.days.length > 0) {
        setTimeout(() => {
          setItinerary(prev => {
            const updated = [...prev]
            draft.days.forEach((draftDay: { dayNumber: number; attractions: string[] }) => {
              const dayIdx = draftDay.dayNumber - 1
              if (dayIdx >= 0 && dayIdx < updated.length && Array.isArray(draftDay.attractions)) {
                const matchedAttractions = draftDay.attractions
                  .map((name: string) => ({
                    attractionName: name,
                    attractionIndex: -1,
                    adultTickets: draft.adults || 2,
                    childTickets: draft.kids || 0,
                    time: '10:00',
                    description: `Loaded from AI Planner: ${name}`
                  }))
                if (matchedAttractions.length > 0) {
                  updated[dayIdx] = { ...updated[dayIdx], attractions: matchedAttractions }
                }
              }
            })
            return updated
          })
          sessionStorage.removeItem('ai_planner_draft')
        }, 1200)
      }
    } catch { /* noop */ }
  }, [])

  // Destination Mode State ('singapore' | 'malaysia' | 'combined')
  const [destinationMode, setDestinationMode] = useState<'singapore' | 'malaysia' | 'combined'>('singapore')
  const [malaysiaPackageSheetUrl, setMalaysiaPackageSheetUrl] = useState<string | null>(null)

  // 2. Fetch published Excel Google Sheet (.xlsx format) to read all sheets
  useEffect(() => {
    if (!isAuthenticated) return // Only fetch if authenticated

    async function fetchGoogleWorkbook() {
      setSheetLoading(true)
      try {
        let sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=xlsx'
        try {
          const settingsRes = await fetch('/api/site-settings')
          const settingsData = await settingsRes.json()
          
          if (settingsData.settings?.customPackageSheetUrl) setCustomPackageSheetUrl(settingsData.settings.customPackageSheetUrl)
          if (settingsData.settings?.malaysiaPackageSheetUrl) setMalaysiaPackageSheetUrl(settingsData.settings.malaysiaPackageSheetUrl)

          const targetUrl = destinationMode === 'malaysia'
            ? (settingsData.settings?.malaysiaPackageSheetUrl || settingsData.settings?.customPackageSheetUrl)
            : (settingsData.settings?.customPackageSheetUrl || settingsData.settings?.attractionsSheetUrl)

          if (targetUrl) {
            sheetUrl = targetUrl
              .replace(/\/pubhtml.*/gi, '/pub?output=xlsx')
              .replace(/output=csv/gi, 'output=xlsx')
              .replace(/output=html/gi, 'output=xlsx')
            if (!sheetUrl.includes('output=xlsx')) {
              sheetUrl += (sheetUrl.includes('?') ? '&' : '?') + 'output=xlsx'
            }
          }
        } catch (e) {}

        const res = await fetch(sheetUrl)
        const buffer = await res.arrayBuffer()
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })

        // 1. Parse Hotel Sheet
        const hotelSheet = workbook.Sheets['Hotel']
        if (hotelSheet) {
          const hotelRows: any[] = XLSX.utils.sheet_to_json(hotelSheet)
          const hotelMap: { [key: string]: { name: string, rooms: { type: string, price: number }[] } } = {}
          hotelRows.forEach(row => {
            const hName = row['Hotel Name']
            const rType = row['Room Type']
            const price = Number(row['Price/room/night ($)'] ?? row['Price/ room / night ($)']) || 0
            if (hName && rType) {
              if (!hotelMap[hName]) {
                hotelMap[hName] = { name: hName, rooms: [] }
              }
              hotelMap[hName].rooms.push({ type: rType, price })
            }
          })
          const parsedHotels = Object.values(hotelMap)
          if (parsedHotels.length > 0) setHotelsList(parsedHotels)
        }

        // 2. Parse Transfers Sheet
        const transfersSheet = workbook.Sheets['Transfers']
        if (transfersSheet) {
          const transferRows: any[] = XLSX.utils.sheet_to_json(transfersSheet)
          const parsedTransfers = transferRows.map(row => {
            const vType = row['Vehicle Type'] || ''
            const tType = row['Transfer Type'] || ''
            const transName = row['Transfers'] || ''
            const serviceName = row['Service Name'] || row['Service'] || row['Transfers'] || 'Transfers'
            const rate = Number(row['Rate($)'] ?? row['Rate']) || 0
            return {
              type: `${vType}${tType ? ` - ${tType}` : ''}`,
              serviceName,
              pricePerTransfer: rate
            }
          }).filter(t => t.pricePerTransfer > 0 && t.type.trim() !== '')
          if (parsedTransfers.length > 0) setVehiclesList(parsedTransfers)
        }

        // 3. Parse Attractions Sheet
        const attractionsSheet = workbook.Sheets['Attractions']
        if (attractionsSheet) {
          const attractionRows: any[] = XLSX.utils.sheet_to_json(attractionsSheet)
          const parsedAttractions = attractionRows.map(row => {
            const name = row['Attractions'] || ''
            const adult = Number(row['Adult ($)'] ?? row['Adult']) || 0
            const child = Number(row['Child ($)'] ?? row['Child']) || 0
            const area = row['Area'] || ''
            return { name, adultPrice: adult, childPrice: child, area }
          }).filter(a => a.name.trim() !== '' && (a.adultPrice > 0 || a.childPrice > 0))
          if (parsedAttractions.length > 0) setAttractionsList(parsedAttractions)
        }

        // 4. Parse Meals Plan Sheet
        const mealsSheet = workbook.Sheets['Meals Plan']
        if (mealsSheet) {
          const mealRows: any[] = XLSX.utils.sheet_to_json(mealsSheet)
          const parsedMeals = mealRows.map(row => {
            const restName = row['Restaurant Name'] || ''
            const mType = row['Meal Type'] || row['Type'] || ''
            const rate = Number(row['Rate($)'] ?? row['Rate'] ?? row['Price Per person'] ?? row['Price Per Person'] ?? row['Price']) || 0
            
            // Sync standard meal prices if found
            const mtLower = mType.toLowerCase().trim()
            if (mtLower === 'breakfast' && rate > 0) MEAL_PRICES.breakfast = rate
            if (mtLower === 'lunch' && rate > 0) MEAL_PRICES.lunch = rate
            if (mtLower === 'dinner' && rate > 0) MEAL_PRICES.dinner = rate

            return {
              type: restName ? `${restName} (${mType})` : mType,
              pricePerHead: rate
            }
          }).filter(m => m.type && m.pricePerHead > 0)
          if (parsedMeals.length > 0) setMealsList(parsedMeals)
        }

        // 5. Parse Guide Sheet
        const guideSheet = workbook.Sheets['Guide']
        if (guideSheet) {
          const guideRows: any[] = XLSX.utils.sheet_to_json(guideSheet)
          const parsedGuides = guideRows.map(row => {
            const desc = row['Transfer Description'] || ''
            const rate = Number(row['Rate($)'] ?? row['Rate']) || 0
            return { type: desc, pricePerDay: rate }
          }).filter(g => g.type.trim() !== '' && g.pricePerDay > 0)
          if (parsedGuides.length > 0) setGuidesList(parsedGuides)
        }

      } catch (err) {
        console.error('Failed to parse dynamic Google Sheets workbook:', err)
      } finally {
        setSheetLoading(false)
      }
    }
    fetchGoogleWorkbook()
  }, [isAuthenticated, destinationMode])

  // Fetch live SGD → INR exchange rate, site-settings and attraction meta on mount
  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(res => res.json())
      .then(data => {
        if (typeof data.rate === 'number' && data.rate > 0) {
          setSgdToInrRate(data.rate)
        }
        setRateLoaded(true)
      })
      .catch(() => {
        setRateLoaded(true)
      })

    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.hideReadyTemplatesSubpage) setHideReadyTemplatesSubpage(true)
        if (data.settings?.hideCustomPackageClientPreview) setHideClientPreview(true)
        if (data.settings?.hidePreviewPackageOverlay) setHidePreviewPackageOverlay(true)
        if (data.settings?.hideIciciCustomPackage) setHideIciciCustomPackage(true)
        if (data.settings?.hideCashfreeCustomPackage) setHideCashfreeCustomPackage(true)
      })
      .catch(() => {})

    // Fetch attraction meta (photos, descriptions, highlights) from Sanity
    fetch('/api/attraction-meta')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.meta)) {
          const metaMap: Record<string, any> = {}
          data.meta.forEach((m: any) => {
            // Index by name and by matchKeyword for flexible matching
            if (m.name) metaMap[m.name.toLowerCase().trim()] = m
            if (m.matchKeyword) metaMap[m.matchKeyword.toLowerCase().trim()] = m
          })
          setAttractionsMeta(metaMap)
        }
      })
      .catch(() => {})
  }, [])

  // Initialize itinerary array when nightsCount changes to show number of nights + 1 days
  useEffect(() => {
    if (!isAuthenticated) return
    const baseDaysCount = nightsCount + 1
    setItinerary(prev => {
      // If proposal is already loaded with populated days, preserve them
      if (prev.length > 0 && prev.some(d => (d.attractions?.length || 0) > 0 || (d.transfers?.length || 0) > 0)) {
        if (baseDaysCount <= prev.length) return prev
      }

      const customDays = prev.filter(d => d.isCustomDay)
      const baseDays = prev.filter(d => !d.isCustomDay)
      if (baseDaysCount > baseDays.length) {
        for (let i = baseDays.length; i < baseDaysCount; i++) {
          baseDays.push({
            transfers: [],
            breakfast: false,
            lunch: false,
            dinner: false,
            guideRequired: false,
            meals: [],
            guides: [],
            attractions: [],
            isBreakTrip: false,
            isCustomDay: false
          })
        }
      } else if (baseDaysCount < baseDays.length) {
        baseDays.length = baseDaysCount
      }
      return [...baseDays, ...customDays]
    })
  }, [nightsCount, isAuthenticated])

  // Re-sync hotel indices, room indices, and itinerary item indices whenever master sheet data finishes loading or loaded proposal changes
  useEffect(() => {
    if (!loadedProposalRaw) return

    // 1. Sync Hotel Selection
    if (!loadedProposalRaw.customHotelEnabled && loadedProposalRaw.hotelName && hotelsList.length > 0) {
      const hIdx = hotelsList.findIndex(h => h.name.toLowerCase().trim() === (loadedProposalRaw.hotelName || '').toLowerCase().trim())
      if (hIdx >= 0) {
        setGlobalHotelIndex(hIdx)
        if (loadedProposalRaw.roomType) {
          const rIdx = hotelsList[hIdx]?.rooms.findIndex(r => r.type.toLowerCase().trim() === (loadedProposalRaw.roomType || '').toLowerCase().trim())
          if (rIdx >= 0) setGlobalRoomIndex(rIdx)
        }
        if (loadedProposalRaw.supplementType) {
          const sIdx = hotelsList[hIdx]?.rooms.findIndex(r => r.type.toLowerCase().trim() === (loadedProposalRaw.supplementType || '').toLowerCase().trim())
          if (sIdx >= 0) setGlobalSuppIndex(sIdx)
        }
      }
    }

    // 2. Sync Itinerary Item Indices (Attractions, Transfers, Meals, Guides)
    setItinerary(prevItin => {
      if (!prevItin || prevItin.length === 0) return prevItin
      return prevItin.map(day => ({
        ...day,
        transfers: (day.transfers || []).map(t => {
          if (vehiclesList.length > 0 && (t.type || t.serviceName)) {
            const vIdx = vehiclesList.findIndex(v => 
              (t.type && v.type.toLowerCase().trim() === t.type.toLowerCase().trim()) ||
              (t.serviceName && v.serviceName && v.serviceName.toLowerCase().trim() === t.serviceName.toLowerCase().trim())
            )
            if (vIdx >= 0) return { ...t, vehicleIndex: vIdx }
          }
          return t
        }),
        attractions: (day.attractions || []).map(a => {
          if (attractionsList.length > 0 && a.attractionName) {
            const aName = a.attractionName.toLowerCase().trim()
            const aIdx = attractionsList.findIndex(item => item.name.toLowerCase().trim() === aName)
            let updated = a
            if (aIdx >= 0) {
              updated = { ...updated, attractionIndex: aIdx }
            }
            if (vehiclesList.length > 0) {
              if (a.pickupVehicleType) {
                const pvName = a.pickupVehicleType.toLowerCase().trim()
                const pvIdx = vehiclesList.findIndex(v => v.type.toLowerCase().trim() === pvName)
                if (pvIdx >= 0) updated = { ...updated, pickupVehicleIndex: pvIdx }
              }
              if (a.dropVehicleType) {
                const dvName = a.dropVehicleType.toLowerCase().trim()
                const dvIdx = vehiclesList.findIndex(v => v.type.toLowerCase().trim() === dvName)
                if (dvIdx >= 0) updated = { ...updated, dropVehicleIndex: dvIdx }
              }
            }
            return updated
          }
          return a
        }),
        meals: (day.meals || []).map(m => {
          if (mealsList.length > 0 && m.type) {
            const mName = m.type.toLowerCase().trim()
            const mIdx = mealsList.findIndex(item => item.type.toLowerCase().trim() === mName)
            if (mIdx >= 0) return { ...m, mealIndex: mIdx }
          }
          return m
        }),
        guides: (day.guides || []).map(g => {
          if (guidesList.length > 0 && g.type) {
            const gName = g.type.toLowerCase().trim()
            const gIdx = guidesList.findIndex(item => item.type.toLowerCase().trim() === gName)
            if (gIdx >= 0) return { ...g, guideIndex: gIdx }
          }
          return g
        })
      }))
    })
  }, [hotelsList, attractionsList, vehiclesList, mealsList, guidesList, loadedProposalRaw])

  // Custom date formatter: e.g. "24 Jul 2026"
  const getItineraryDate = (dayIndex: number) => {
    const dayObj = itinerary[dayIndex]
    if (dayObj && dayObj.customDate) {
      const date = new Date(dayObj.customDate)
      if (!isNaN(date.getTime())) {
        const day = date.getDate()
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = months[date.getMonth()]
        const year = date.getFullYear()
        return `${day} ${month} ${year}`
      }
    }

    if (!arrivalDate) return `Day ${dayIndex + 1}`
    const date = new Date(arrivalDate)
    date.setDate(date.getDate() + dayIndex)
    
    const day = date.getDate()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    
    return `${day} ${month} ${year}`
  }

  // Duplicate Attraction Detection Hook
  const duplicateAttractions = useMemo(() => {
    const counts: Record<string, number[]> = {}
    itinerary.forEach((day, dIdx) => {
      day.attractions.forEach(attr => {
        let attrName = ''
        if (typeof attr.attractionIndex === 'number' && attractionsList[attr.attractionIndex]) {
          attrName = attractionsList[attr.attractionIndex].name
        } else if (attr.attractionName) {
          attrName = attr.attractionName
        }
        if (attrName) {
          const cleanName = attrName.trim().toLowerCase()
          if (!counts[cleanName]) counts[cleanName] = []
          counts[cleanName].push(dIdx + 1)
        }
      })
    })

    const duplicates: { name: string; days: number[] }[] = []
    Object.entries(counts).forEach(([name, days]) => {
      if (days.length > 1) {
        const originalObj = attractionsList.find(a => a.name.trim().toLowerCase() === name)
        duplicates.push({
          name: originalObj ? originalObj.name : name,
          days
        })
      }
    })
    return duplicates
  }, [itinerary, attractionsList])

  // Load Ready-Made Package Template into Builder Workspace
  const handleLoadTemplateIntoBuilder = (tmpl: any, checkinDateToUse: string) => {
    if (!tmpl) return
    if (checkinDateToUse) setArrivalDate(checkinDateToUse)
    setNightsCount(tmpl.nightsCount || 3)
    setActiveTemplateName(tmpl.title)
    setSavedProposalNum(null)

    if (tmpl.itinerary && Array.isArray(tmpl.itinerary)) {
      const mappedItinerary: DayPlan[] = tmpl.itinerary.map((day: any) => ({
        transfers: Array.isArray(day.transfers) ? day.transfers.map((t: any) => ({
          vehicleIndex: typeof t.vehicleIndex === 'number' ? t.vehicleIndex : 0,
          time: t.time || '09:00',
          description: t.description || '',
          qty: typeof t.qty === 'number' ? t.qty : 1
        })) : [],
        attractions: Array.isArray(day.attractions) ? day.attractions.map((a: any) => {
          let idx = typeof a.attractionIndex === 'number' ? a.attractionIndex : 0
          if (a.attractionName) {
            const found = attractionsList.findIndex(item => item.name.toLowerCase() === a.attractionName.toLowerCase())
            if (found >= 0) idx = found
          }
          return {
            attractionIndex: idx,
            attractionName: a.attractionName || (attractionsList[idx]?.name || ''),
            time: a.time || '10:00',
            adultQty: typeof a.adultQty === 'number' ? a.adultQty : adults,
            childQty: typeof a.childQty === 'number' ? a.childQty : kids,
            pickupNotes: a.pickupNotes || ''
          }
        }) : [],
        breakfast: !!day.breakfast,
        lunch: !!day.lunch,
        dinner: !!day.dinner,
        guides: Array.isArray(day.guides) ? day.guides.map((g: any) => ({
          guideType: typeof g.guideType === 'number' ? g.guideType : 0,
          notes: g.notes || ''
        })) : [],
        guideRequired: Array.isArray(day.guides) && day.guides.length > 0,
        isBreakTrip: !!day.isBreakTrip
      }))
      setItinerary(mappedItinerary)
    }

    setTemplateModalItem(null)
    setActiveTab('editor')
    alert(`✅ Loaded template "${tmpl.title}" into Builder Workspace! You can now customize every detail.`)
  }

  const updateDay = (dayIndex: number, key: keyof DayPlan, value: any) => {
    setItinerary(prev => {
      const copy = [...prev]
      copy[dayIndex] = { ...copy[dayIndex], [key]: value }
      return copy
    })
  }

  // Row Manipulation helpers
  const addTransferRow = (dayIndex: number) => {
    const day = itinerary[dayIndex]
    if (!day) return
    const firstVehicle = vehiclesList[0]
    const isSic = firstVehicle ? (firstVehicle.type || '').toLowerCase().includes('sic') || (firstVehicle.type || '').toLowerCase().includes('seat-in-coach') || (firstVehicle.type || '').toLowerCase().includes('shared') : false
    const defaultQty = isSic ? (adults + kids) || 1 : 1
    updateDay(dayIndex, 'transfers', [...day.transfers, { vehicleIndex: 0, time: '12:00', description: '', qty: defaultQty }])
  }

  const removeTransferRow = (dayIndex: number, rIdx: number) => {
    const day = itinerary[dayIndex]
    if (!day) return
    const filtered = day.transfers.filter((_, i) => i !== rIdx)
    updateDay(dayIndex, 'transfers', filtered)
  }

  const updateTransferRow = (dayIndex: number, rIdx: number, field: keyof TransferEntry, value: any) => {
    const day = itinerary[dayIndex]
    if (!day) return
    const updated = [...day.transfers]
    if (field === 'vehicleIndex') {
      const selectedVehicle = vehiclesList[value]
      const isSic = selectedVehicle ? (selectedVehicle.type || '').toLowerCase().includes('sic') || (selectedVehicle.type || '').toLowerCase().includes('seat-in-coach') || (selectedVehicle.type || '').toLowerCase().includes('shared') : false
      const newQty = isSic ? (adults + kids) || 1 : 1
      updated[rIdx] = { ...updated[rIdx], vehicleIndex: value, qty: newQty }
    } else {
      updated[rIdx] = { ...updated[rIdx], [field]: value }
    }
    updateDay(dayIndex, 'transfers', updated)
  }

  const addMealRow = (dayIndex: number) => {
    const day = itinerary[dayIndex]
    if (!day) return
    const currentMeals = day.meals || []
    updateDay(dayIndex, 'meals', [...currentMeals, { mealIndex: 0, time: '12:00', description: '' }])
  }

  const removeMealRow = (dayIndex: number, rIdx: number) => {
    const day = itinerary[dayIndex]
    if (!day) return
    const currentMeals = day.meals || []
    const filtered = currentMeals.filter((_, i) => i !== rIdx)
    updateDay(dayIndex, 'meals', filtered)
  }

  const updateMealRow = (dayIndex: number, rIdx: number, field: keyof MealEntry, value: any) => {
    const day = itinerary[dayIndex]
    if (!day) return
    const currentMeals = day.meals || []
    const updated = [...currentMeals]
    updated[rIdx] = { ...updated[rIdx], [field]: value }
    updateDay(dayIndex, 'meals', updated)
  }

  const addGuideRow = (dayIndex: number) => {
    const day = itinerary[dayIndex]
    if (!day) return
    updateDay(dayIndex, 'guides', [...day.guides, { guideIndex: 0, time: '09:00', description: '' }])
  }

  const removeGuideRow = (dayIndex: number, rIdx: number) => {
    const day = itinerary[dayIndex]
    if (!day) return
    const filtered = day.guides.filter((_, i) => i !== rIdx)
    updateDay(dayIndex, 'guides', filtered)
  }

  const updateGuideRow = (dayIndex: number, rIdx: number, field: keyof GuideEntry, value: any) => {
    const day = itinerary[dayIndex]
    if (!day) return
    const updated = [...day.guides]
    updated[rIdx] = { ...updated[rIdx], [field]: value }
    updateDay(dayIndex, 'guides', updated)
  }

  const addAttractionRow = (dayIndex: number) => {
    const day = itinerary[dayIndex]
    if (!day) return
    updateDay(dayIndex, 'attractions', [
      ...day.attractions, 
      { attractionIndex: 0, adultTickets: adults, childTickets: kids, time: '10:00', description: '' }
    ])
  }

  const removeAttractionRow = (dayIndex: number, rIdx: number) => {
    const day = itinerary[dayIndex]
    if (!day) return
    const filtered = day.attractions.filter((_, i) => i !== rIdx)
    updateDay(dayIndex, 'attractions', filtered)
  }

  const updateAttractionRow = (dayIndex: number, rIdx: number, field: keyof AttractionEntry, value: any) => {
    const day = itinerary[dayIndex]
    if (!day) return
    const updated = [...day.attractions]
    updated[rIdx] = { ...updated[rIdx], [field]: value }
    updateDay(dayIndex, 'attractions', updated)
  }

  // Top + Add Custom Day (Break Trip) - Inserts at beginning of itinerary
  const handleAddTopCustomBreakDay = () => {
    if (arrivalDate) {
      const d = new Date(arrivalDate)
      d.setDate(d.getDate() - 1)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      setArrivalDate(`${yyyy}-${mm}-${dd}`)
    }
    setItinerary(prev => [
      {
        transfers: [],
        attractions: [],
        breakfast: false,
        lunch: false,
        dinner: false,
        guides: [],
        guideRequired: false,
        isCustomDay: true,
        isBreakTrip: true
      },
      ...prev
    ])
  }

  // Bottom + Add Custom Day (Break Trip) - Appends at end of itinerary
  const handleAddCustomBreakDay = () => {
    setItinerary(prev => [
      ...prev,
      {
        transfers: [],
        attractions: [],
        breakfast: false,
        lunch: false,
        dinner: false,
        guides: [],
        guideRequired: false,
        isCustomDay: true,
        isBreakTrip: true
      }
    ])
  }

  // Cost Calculations
  const costBreakdown = useMemo(() => {
    if (!isAuthenticated && isAuthenticated !== null) {
      return { hotelTotal: 0, roomCostTotal: 0, suppCostTotal: 0, transportTotal: 0, attractionTotal: 0, mealTotal: 0, guideTotal: 0, miscTotal: 0, netCost: 0, netCostINR: 0, totalClientPrice: 0, totalClientPriceINR: 0, adultQuote: 0, childQuote: 0 }
    }

    let hotelTotal = 0
    let transportTotal = 0
    let attractionTotal = 0
    let attractionAdultTotal = 0
    let attractionChildTotal = 0
    let mealTotal = 0
    let guideTotal = 0

    // Resilient Hotel lookup
    let hotel: { name: string; rooms: { type: string; price: number }[] } | undefined = hotelsList[globalHotelIndex]
    if (!hotel && loadedProposalRaw?.hotelName && hotelsList.length > 0) {
      hotel = hotelsList.find(h => h.name.toLowerCase().trim() === loadedProposalRaw.hotelName.toLowerCase().trim())
    }
    let mainRoom: { type: string; price: number } | undefined = hotel?.rooms[globalRoomIndex]
    if (!mainRoom && hotel && loadedProposalRaw?.roomType) {
      mainRoom = hotel.rooms.find(r => r.type.toLowerCase().trim() === loadedProposalRaw.roomType.toLowerCase().trim())
    }
    let suppRoom: { type: string; price: number } | null | undefined = globalSuppIndex >= 0 ? hotel?.rooms[globalSuppIndex] : null
    if (!suppRoom && hotel && loadedProposalRaw?.supplementType) {
      suppRoom = hotel.rooms.find(r => r.type.toLowerCase().trim() === loadedProposalRaw.supplementType.toLowerCase().trim()) || null
    }

    let roomCostTotal = 0
    let suppCostTotal = 0
    if (hotelRequired) {
      if (customHotelEnabled) {
        roomCostTotal = (customHotelPrice || 0) * (globalRoomCount || 1) * nightsCount
        suppCostTotal = (customHotelSuppCost || 0) * (globalSuppCount || 0) * nightsCount
        hotelTotal = roomCostTotal + suppCostTotal
      } else if (mainRoom) {
        roomCostTotal = mainRoom.price * (globalRoomCount || 1) * nightsCount
        suppCostTotal = suppRoom ? (suppRoom.price * (globalSuppCount || 0) * nightsCount) : 0
        hotelTotal = roomCostTotal + suppCostTotal
      }
    }
    let totalTransfers = 0
    let totalAttractionsCount = 0
    let totalLunchCount = 0
    let totalDinnerCount = 0
    let totalBreakfastCount = 0
    let totalGuidesCount = 0

    const totalPax = (adults + kids) > 0 ? (adults + kids) : 1

    itinerary.forEach(day => {
      day.transfers.forEach(trans => {
        let vehicle: { type: string; pricePerTransfer: number; serviceName?: string } | undefined = vehiclesList[trans.vehicleIndex]
        if (!vehicle && (trans.type || trans.serviceName)) {
          vehicle = vehiclesList.find(v => 
            (trans.type && v.type.toLowerCase().trim() === trans.type.toLowerCase().trim()) ||
            (trans.serviceName && v.serviceName && v.serviceName.toLowerCase().trim() === trans.serviceName.toLowerCase().trim())
          )
        }
        if (vehicle) {
          const qty = trans.qty || 1
          transportTotal += vehicle.pricePerTransfer * qty
          totalTransfers += qty
        }
      })

      day.attractions.forEach(attrRow => {
        let attr: { name: string; adultPrice: number; childPrice: number; area?: string } | undefined = attractionsList[attrRow.attractionIndex]
        if (!attr && attrRow.attractionName) {
          attr = attractionsList.find(a => a.name.toLowerCase().trim() === attrRow.attractionName?.toLowerCase().trim())
        }
        if (attr) {
          const rowAdultCount = attrRow.adultTickets || 0
          const rowChildCount = attrRow.childTickets || 0
          
          attractionTotal += (attr.adultPrice * rowAdultCount) + (attr.childPrice * rowChildCount)
          attractionAdultTotal += attr.adultPrice * rowAdultCount
          attractionChildTotal += attr.childPrice * rowChildCount
          totalAttractionsCount++
        }
        if (attrRow.hasTransfer) {
          if (attrRow.pickupEnabled !== false) {
            let pv: { type: string; pricePerTransfer: number; serviceName?: string } | undefined = vehiclesList[attrRow.pickupVehicleIndex ?? 0]
            if (!pv && attrRow.pickupVehicleType) {
              pv = vehiclesList.find(v => v.type.toLowerCase().trim() === attrRow.pickupVehicleType?.toLowerCase().trim())
            }
            if (pv) {
              const paxMult = isVehicleSIC(pv) ? totalPax : 1
              transportTotal += pv.pricePerTransfer * paxMult
              totalTransfers++
            }
          }
          if (attrRow.dropEnabled !== false) {
            let dv: { type: string; pricePerTransfer: number; serviceName?: string } | undefined = vehiclesList[attrRow.dropVehicleIndex ?? 0]
            if (!dv && attrRow.dropVehicleType) {
              dv = vehiclesList.find(v => v.type.toLowerCase().trim() === attrRow.dropVehicleType?.toLowerCase().trim())
            }
            if (dv) {
              const paxMult = isVehicleSIC(dv) ? totalPax : 1
              transportTotal += dv.pricePerTransfer * paxMult
              totalTransfers++
            }
          }
        }
      })

      let dayMealCost = 0
      if (day.breakfast) { dayMealCost += MEAL_PRICES.breakfast; totalBreakfastCount++; }
      if (day.lunch) { dayMealCost += MEAL_PRICES.lunch; totalLunchCount++; }
      if (day.dinner) { dayMealCost += MEAL_PRICES.dinner; totalDinnerCount++; }
      mealTotal += dayMealCost * (adults + kids)

      if (day.meals && Array.isArray(day.meals)) {
        day.meals.forEach(mealRow => {
          let meal: any | undefined = mealsList[mealRow.mealIndex]
          if (!meal && mealRow.type) {
            meal = mealsList.find(m => m.type.toLowerCase().trim() === mealRow.type?.toLowerCase().trim())
          }
          if (meal) {
            mealTotal += meal.pricePerHead * (adults + kids)
            const mType = (meal.type || '').toLowerCase()
            if (mType.includes('lunch')) totalLunchCount++
            else if (mType.includes('dinner')) totalDinnerCount++
          }
        })
      }

      day.guides.forEach(guideRow => {
        let guide: { type: string; pricePerDay: number } | undefined = guidesList[guideRow.guideIndex]
        if (!guide && guideRow.type) {
          guide = guidesList.find(g => g.type.toLowerCase().trim() === guideRow.type?.toLowerCase().trim())
        }
        if (guide) {
          guideTotal += guide.pricePerDay
          totalGuidesCount++
        }
      })
    })

    const totalPeople = adults + kids
    const miscTotal = (miscCostPerPerson || 0) * totalPeople
    const rawNetCost = hotelTotal + transportTotal + attractionTotal + mealTotal + guideTotal + miscTotal
    const totalDiscount = discountPerPerson * totalPeople
    const netCost = Math.max(0, rawNetCost - totalDiscount)
    
    const markupFactor = 1 + markupPercent / 100
    const totalClientPrice = Math.round(netCost * markupFactor + markupAbsolute)

    const sharedNetPerHead = (hotelTotal + transportTotal + guideTotal) / (totalPeople || 1)
    const mealsNetPerHead = mealTotal / (totalPeople || 1)
    const absoluteMarkupPerHead = markupAbsolute / (totalPeople || 1)

    const netAdultPerHead = Math.max(0, sharedNetPerHead + mealsNetPerHead + (miscCostPerPerson || 0) + (attractionAdultTotal / (adults || 1)) - discountPerPerson)
    const adultQuote = Math.round(netAdultPerHead * markupFactor + absoluteMarkupPerHead)

    const netChildPerHead = Math.max(0, sharedNetPerHead + mealsNetPerHead + (miscCostPerPerson || 0) + (attractionChildTotal / (kids || 1)) - discountPerPerson)
    const childQuote = kids > 0 ? Math.round(netChildPerHead * markupFactor + absoluteMarkupPerHead) : 0

    const netCostINR = Math.round(netCost * sgdToInrRate)
    const totalClientPriceINR = Math.round(totalClientPrice * sgdToInrRate)

    return {
      hotelTotal,
      roomCostTotal,
      suppCostTotal,
      transportTotal,
      attractionTotal,
      mealTotal,
      guideTotal,
      miscTotal,
      netCost,
      netCostINR,
      totalClientPrice,
      totalClientPriceINR,
      adultQuote,
      childQuote,
      totalTransfers,
      totalAttractionsCount,
      totalLunchCount,
      totalDinnerCount,
      totalBreakfastCount,
      totalGuidesCount,
    }
  }, [itinerary, hotelsList, vehiclesList, attractionsList, mealsList, guidesList, adults, kids, nightsCount, miscCostPerPerson, globalHotelIndex, globalRoomIndex, globalRoomCount, globalSuppIndex, globalSuppCount, markupPercent, markupAbsolute, discountPerPerson, isAuthenticated, hotelRequired, sgdToInrRate, customHotelEnabled, customHotelName, customHotelRoomType, customHotelPrice, customHotelSuppName, customHotelSuppCost])

  // Agent activity notification helper
  const notifyAgentActivity = (action: string) => {
    if (!activeAgent) return
    const hotel = hotelRequired
      ? (customHotelEnabled 
          ? `${customHotelName || 'Custom Hotel'} — ${customHotelRoomType || 'Custom Room'} ×${globalRoomCount}` 
          : `${hotelsList[globalHotelIndex]?.name} — ${hotelsList[globalHotelIndex]?.rooms[globalRoomIndex]?.type} ×${globalRoomCount}`)
      : 'No hotel'
    const pax = `${adults} Adult${adults !== 1 ? 's' : ''}${kids > 0 ? `, ${kids} Child${kids !== 1 ? 'ren' : ''}` : ''}`
    fetch('/api/agent-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        agentName: activeAgent.agentName || '',
        agentEmail: activeAgent.email || '',
        agentPhone: activeAgent.phone || '',
        agentCompany: activeAgent.companyName || '',
        totalPrice: costBreakdown.totalClientPrice,
        pax,
        nights: nightsCount,
        hotel,
        proposalNumber: savedProposalNum || 'Draft',
        directProposalUrl: savedProposalNum ? `${window.location.origin}/custom-package?ref=${savedProposalNum}` : '',
        itinerarySummary: generateProposalText(),
      }),
    }).catch(() => {}) // Fire-and-forget, never block UI
  }

  // Concise WhatsApp-optimised Proposal Text
  const generateProposalText = (overrideNum?: string) => {
    const pNum = overrideNum || savedProposalNum
    const sep = '━━━━━━━━━━━━━━━━━━━━━'
    let t = `✈️ *${destinationMode === 'malaysia' ? 'MALAYSIA' : 'SINGAPORE'} ITINERARY*`
    if (pNum) {
      t += `  (Ref: ${pNum})`
    }
    t += `\n${sep}\n`
    if (guestName) {
      t += `👤 *Guest Name:* ${guestName}\n`
    }
    if (guestPhone) {
      t += `📞 *Guest Contact:* ${guestPhone}\n`
    }
    if (guestName || guestPhone) {
      t += `${sep}\n`
    }
    t += `\n`

    // Calculate summaries
    let totalTransfers = 0
    let totalAttractionsCount = 0
    const usedVehicles = new Set<string>()
    itinerary.forEach(day => {
      day.transfers.forEach(tr => {
        totalTransfers += (tr.qty || 1)
        const vName = vehiclesList[tr.vehicleIndex]?.type
        if (vName) usedVehicles.add(vName.split(' - ')[0] || vName)
      })
      day.attractions.forEach(a => {
        totalAttractionsCount++
        if (a.hasTransfer) {
          if (a.pickupEnabled !== false) {
            totalTransfers++
            const pvName = vehiclesList[a.pickupVehicleIndex ?? 0]?.type
            if (pvName) usedVehicles.add(pvName.split(' - ')[0] || pvName)
          }
          if (a.dropEnabled !== false) {
            totalTransfers++
            const dvName = vehiclesList[a.dropVehicleIndex ?? 0]?.type
            if (dvName) usedVehicles.add(dvName.split(' - ')[0] || dvName)
          }
        }
      })
    })
    const totalRooms = hotelRequired ? globalRoomCount : 0

    // Hotel
    if (hotelRequired) {
      if (customHotelEnabled) {
        t += `🏨 *Hotel:* ${customHotelName || 'Custom Hotel'}\n`
        t += `   └ ${customHotelRoomType || 'Custom Room'} ×${globalRoomCount}${nightsCount > 0 ? ` | ${nightsCount} Night${nightsCount !== 1 ? 's' : ''}` : ''}\n`
        if (customHotelSuppName && globalSuppCount > 0) {
          t += `   └ Supplement: ${customHotelSuppName} ×${globalSuppCount}\n`
        }
      } else {
        const h = hotelsList[globalHotelIndex]
        const room = h?.rooms[globalRoomIndex]
        t += `🏨 *Hotel:* ${h?.name || '—'}\n`
        t += `   └ ${room?.type || '—'} ×${globalRoomCount}${nightsCount > 0 ? ` | ${nightsCount} Night${nightsCount !== 1 ? 's' : ''}` : ''}\n`
        if (globalSuppIndex >= 0 && globalSuppCount > 0) {
          t += `   └ Supplement: ${h?.rooms[globalSuppIndex]?.type} ×${globalSuppCount}\n`
        }
      }
    } else {
      t += `🏨 *Hotel:* Not Included\n`
    }

    // Transfers summary line
    if (usedVehicles.size > 0) {
      t += `🚗 *Transfers:* ${totalTransfers > 0 ? `${totalTransfers} Transfer${totalTransfers !== 1 ? 's' : ''}` : 'Included'} (${Array.from(usedVehicles).join(', ')})\n`
    } else if (totalTransfers > 0) {
      t += `🚗 *Transfers:* ${totalTransfers} Transfer${totalTransfers !== 1 ? 's' : ''} Included\n`
    }

    // Pax + dates
    const childAgeStr = kids > 0 && childAges.length > 0 ? ` (Ages: ${childAges.slice(0, kids).join(', ')} yrs)` : ''
    t += `👥 *Pax:* ${adults} Adult${adults !== 1 ? 's' : ''}${kids > 0 ? ` & ${kids} Child${kids !== 1 ? 'ren' : ''}${childAgeStr}` : ''}\n`
    t += `📅 *Arrival:* ${getItineraryDate(0)}  •  ${nightsCount + 1}D/${nightsCount}N\n`
    t += `💰 *Total:* S$ ${costBreakdown.totalClientPrice.toLocaleString()}  _(≈₹${costBreakdown.totalClientPriceINR.toLocaleString('en-IN')})_\n`

    // Per-head breakdown
    t += `💵 *Per Adult:* S$ ${costBreakdown.adultQuote}`
    if (kids > 0) t += `  |  *Per Child:* S$ ${costBreakdown.childQuote}`
    if (discountPerPerson > 0) t += `  _(Disc: S$${discountPerPerson}/pax)_`
    t += `\n`

    // Day-by-day
    t += `\n${sep}\n`
    itinerary.forEach((day, dIdx) => {
      const dayItems: { time: string; text: string }[] = []
      
      if (day.isBreakTrip) {
        dayItems.push({
          time: '08:00',
          text: `🌴 *Free & Easy / Interline Break Day* — No scheduled sightseeing`
        })
      }
      
      day.transfers.forEach(tr => {
        const v = vehiclesList[tr.vehicleIndex]?.type || 'Transfer'
        const qtyStr = tr.qty && tr.qty > 1 ? ` (×${tr.qty})` : ''
        dayItems.push({
          time: tr.time || '00:00',
          text: `🚗 ${tr.time || '00:00'} — ${v}${qtyStr}${tr.description ? ' → ' + tr.description : ''}`
        })
      })
      day.attractions.forEach(a => {
        const name = attractionsList[a.attractionIndex]?.name || 'Attraction'
        const paxStr = a.adultTickets > 0 || a.childTickets > 0 ? ` (${a.adultTickets}Ad${a.childTickets > 0 ? `/${a.childTickets}Ch` : ''})` : ''
        
        // Interline Pickup Transfer
        if (a.hasTransfer && a.pickupEnabled !== false) {
          const pvName = vehiclesList[a.pickupVehicleIndex ?? 0]?.type || 'Transfer'
          dayItems.push({
            time: a.pickupTime || '09:00',
            text: `🚗 ${a.pickupTime || '09:00'} — Pickup Transfer (${pvName})${a.pickupNotes ? ' → ' + a.pickupNotes : ''} [for ${name}]`
          })
        }

        // Attraction Entry
        dayItems.push({
          time: a.time || '00:00',
          text: `🎟️ ${a.time || '00:00'} — ${name}${paxStr}${a.description ? ' · ' + a.description : ''}`
        })

        // Interline Drop Transfer
        if (a.hasTransfer && a.dropEnabled !== false) {
          const dvName = vehiclesList[a.dropVehicleIndex ?? 0]?.type || 'Transfer'
          dayItems.push({
            time: a.dropTime || '17:00',
            text: `🚗 ${a.dropTime || '17:00'} — Drop Transfer (${dvName})${a.dropNotes ? ' → ' + a.dropNotes : ''} [from ${name}]`
          })
        }
      })
      const cbMeals: string[] = []
      if (day.breakfast) cbMeals.push('Breakfast')
      if (day.lunch) cbMeals.push('Lunch')
      if (day.dinner) cbMeals.push('Dinner')
      if (cbMeals.length > 0) {
        dayItems.push({
          time: '12:00',
          text: `🍽️ Meals: ${cbMeals.join(', ')}`
        })
      }

      if (day.meals && Array.isArray(day.meals)) {
        day.meals.forEach(m => {
          const type = mealsList[m.mealIndex]?.type || 'Meal'
          dayItems.push({
            time: m.time || '00:00',
            text: `🍽️ ${m.time} — ${type}${m.description ? ' · ' + m.description : ''}`
          })
        })
      }
      day.guides.forEach(g => {
        const type = guidesList[g.guideIndex]?.type || 'Guide'
        dayItems.push({
          time: g.time || '00:00',
          text: `👤 ${g.time} — ${type}${g.description ? ' · ' + g.description : ''}`
        })
      })

      // Sort items time-wise
      dayItems.sort((a, b) => a.time.localeCompare(b.time))

      t += `\n*Day ${dIdx + 1} · ${getItineraryDate(dIdx)}*\n`
      if (dayItems.length > 0) t += dayItems.map(i => `  ${i.text}`).join('\n') + '\n'
      else t += `  _(Rest day / TBD)_\n`
    })

    t += `${sep}\n`
    t += `📊 *SUMMARY STATS:*\n`
    t += `  • Total Rooms: ${totalRooms}\n`
    t += `  • Total Transfers: ${totalTransfers}\n`
    t += `  • Total Attractions: ${totalAttractionsCount}\n`
    t += `  • Meals Plan: ${costBreakdown.totalLunchCount} Lunch, ${costBreakdown.totalDinnerCount} Dinner\n\n`
    t += `⚠️ *Note:* Prices may vary based on surcharges / unforeseen events\n`
    t += `📌 FIT room rates are subject to a marginal increase\n`
    t += `${sep}\n`
    if (activeAgent) {
      t += `📞 ${activeAgent.agentName || ''}${activeAgent.phone ? ' · ' + activeAgent.phone : ''}\n`
    }
    t += `_Powered by Flying Wonders Singapore_`
    return t
  }

  // Download Itinerary PDF helper (auto-saves proposal if draft)
  const downloadProposalPDF = async () => {
    const pNum = await ensureProposalSaved(true)
    import('jspdf').then((module) => {
      const jsPDF = module.jsPDF
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const PW = 210  // page width
      const PH = 297  // page height
      const ML = 14   // margin left
      const MR = 196  // margin right
      const CW = MR - ML // content width

      // ─── Color Palette ───────────────────────────────────────
      const NAVY   = [10, 34, 64]    as [number,number,number]
      const GOLD   = [196, 156, 60]  as [number,number,number]
      const GOLD_L = [249, 240, 210] as [number,number,number]
      const CRIM   = [140, 30, 50]   as [number,number,number]
      const TEAL   = [32, 100, 96]   as [number,number,number]
      const SLATE  = [44, 62, 80]    as [number,number,number]
      const LGRAY  = [235, 238, 242] as [number,number,number]
      const MGRAY  = [160, 170, 180] as [number,number,number]
      const WHITE  = [255, 255, 255] as [number,number,number]
      const TEXT   = [30, 40, 55]    as [number,number,number]

      let y = 0
      let pageNum = 1

      // ─── Helpers ────────────────────────────────────────────
      const setFill = (c: [number,number,number]) => doc.setFillColor(c[0], c[1], c[2])
      const setDraw = (c: [number,number,number]) => doc.setDrawColor(c[0], c[1], c[2])
      const setTxt  = (c: [number,number,number]) => doc.setTextColor(c[0], c[1], c[2])
      const font    = (w: 'normal'|'bold'|'italic', s: number) => { doc.setFont('Helvetica', w); doc.setFontSize(s) }

      const checkPage = (need = 12) => {
        if (y + need > PH - 22) {
          addFooter()
          doc.addPage()
          pageNum++
          addPageHeader()
          y = 48
        }
      }

      const addPageHeader = () => {
        // Slim repeat header for continuation pages
        setFill(NAVY); doc.rect(0, 0, PW, 12, 'F')
        setFill(GOLD); doc.rect(0, 12, PW, 1.2, 'F')
        font('bold', 8); setTxt(WHITE)
        doc.text((customAgencyName || 'FLYING WONDERS').toUpperCase(), ML, 8.5)
        font('normal', 7); setTxt(GOLD)
        doc.text('SINGAPORE TOUR PROPOSAL', PW / 2, 8.5, { align: 'center' })
        if (savedProposalNum) {
          doc.text(`Ref: ${savedProposalNum}`, MR, 8.5, { align: 'right' })
        }
      }

      const addFooter = () => {
        const fy = PH - 12
        setFill(NAVY); doc.rect(0, fy - 2, PW, 14, 'F')
        setFill(GOLD); doc.rect(0, fy - 2, PW, 0.8, 'F')
        font('normal', 7); setTxt(GOLD)
        doc.text('Singapore DMC Travel Partner', ML, fy + 3)
        setTxt(WHITE)
        doc.text(`Page ${pageNum}`, PW / 2, fy + 3, { align: 'center' })
        const today = new Date().toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' })
        font('normal', 7); setTxt(WHITE)
        doc.text(`Generated: ${today}`, MR, fy + 3, { align: 'right' })
      }

      const sectionTitle = (label: string) => {
        checkPage(14)
        y += 3
        setFill(NAVY); doc.rect(ML, y, CW, 8, 'F')
        setFill(GOLD); doc.rect(ML, y, 3, 8, 'F')
        font('bold', 10); setTxt(WHITE)
        doc.text(label.toUpperCase(), ML + 6, y + 5.5)
        y += 12
      }

      const twoCol = (label: string, value: string, yPos: number, colX = ML, colW = CW / 2) => {
        font('bold', 8.5); setTxt(SLATE)
        doc.text(label, colX + 2, yPos + 4)
        font('normal', 8.5); setTxt(TEXT)
        const lines = doc.splitTextToSize(value, colW - 4)
        doc.text(lines, colX + 2, yPos + 9)
        return lines.length
      }

      const hrLine = (col = LGRAY, weight = 0.3) => {
        setDraw(col); doc.setLineWidth(weight)
        doc.line(ML, y, MR, y)
        y += 3
      }

      // ──────────────────────────────────────────────────────────
      //  PAGE 1 — COVER HEADER
      // ──────────────────────────────────────────────────────────

      // ─── Big branded header band ───────────────────────────
      setFill(NAVY); doc.rect(0, 0, PW, 52, 'F')
      // Diagonal gold accent
      setFill(GOLD)
      doc.rect(0, 52, PW, 2.5, 'F')
      // Right-side accent bar
      setFill(CRIM); doc.rect(PW - 22, 0, 22, 52, 'F')

      // Agency name
      font('bold', 20); setTxt(WHITE)
      doc.text((customAgencyName || 'FLYING WONDERS').toUpperCase(), ML, 22)

      // Tagline
      font('italic', 9); setTxt(GOLD)
      const agencyTagline = activeAgent?.companyName
        ? `${activeAgent.companyName} · Singapore DMC Travel Partner`
        : 'Singapore DMC Travel Partner · Singapore Specialist'
      doc.text(agencyTagline, ML, 31)

      // Document label (vertical on right accent)
      doc.setFont('Helvetica', 'bold'); doc.setFontSize(7.5); setTxt(WHITE)
      doc.text('TOUR', PW - 11, 20, { angle: 90 })
      doc.text('PROPOSAL', PW - 11, 35, { angle: 90 })

      // Contact row
      font('normal', 8); setTxt(GOLD)
      const ctLine = [
        customAgencyPhone ? `Tel: ${customAgencyPhone}` : '',
        customAgencyEmail ? `Email: ${customAgencyEmail}` : '',
      ].filter(Boolean).join('   |   ')
      doc.text(ctLine, ML, 43)

      // Proposal ref badge
      if (savedProposalNum) {
        setFill(GOLD); doc.roundedRect(130, 8, 52, 10, 2, 2, 'F')
        font('bold', 8); setTxt(NAVY)
        doc.text(`PROPOSAL REF: ${savedProposalNum}`, 156, 14.5, { align: 'center' })
      }

      y = 62

      // ─── GUEST OVERVIEW CARD ──────────────────────────────
      setFill(GOLD_L); doc.roundedRect(ML, y, CW, 38, 3, 3, 'F')
      setDraw(GOLD); doc.setLineWidth(0.6); doc.roundedRect(ML, y, CW, 38, 3, 3, 'S')

      const cH = 38 / 2
      // Guest name & contact
      font('bold', 9); setTxt(CRIM)
      doc.text('PREPARED FOR', ML + 4, y + 6)
      font('bold', 15); setTxt(NAVY)
      const guestDisplay = `${guestName || 'Valued Guest'}${guestPhone ? ` (${guestPhone})` : ''}`
      doc.text(guestDisplay, ML + 4, y + 15)

      // Row of info chips
      const chips = [
        { icon: '👥', label: 'Pax', val: `${adults} Adult${adults>1?'s':''}${kids>0?` + ${kids} Child${kids>1?'ren':''}`:''}`},
        { icon: '📅', label: 'Arrival', val: getItineraryDate(0) },
        { icon: '🌙', label: 'Duration', val: `${nightsCount+1}D / ${nightsCount}N` },
        { icon: '🏨', label: 'Hotel', val: hotelRequired ? (customHotelEnabled ? (customHotelName || 'Custom') : (hotelsList[globalHotelIndex]?.name?.split(' ').slice(0,3).join(' ') || 'TBD')) : 'Not Required' },
      ]
      const chipW = CW / chips.length
      chips.forEach((c, i) => {
        const cx = ML + i * chipW
        setFill(WHITE); doc.roundedRect(cx + 2, y + 20, chipW - 4, 15, 2, 2, 'F')
        font('bold', 7); setTxt(MGRAY)
        doc.text(c.label.toUpperCase(), cx + (chipW/2), y + 26, { align: 'center' })
        font('bold', 8); setTxt(NAVY)
        const lines = doc.splitTextToSize(c.val, chipW - 6)
        doc.text(lines, cx + (chipW/2), y + 31, { align: 'center' })
      })

      y += 44

      // ─── QUOTATION HIGHLIGHTS BAR ─────────────────────────
      setFill(NAVY); doc.roundedRect(ML, y, CW, 22, 3, 3, 'F')
      const priceItems = [
        { lbl: 'Per Adult (SGD)', val: `S$ ${costBreakdown.adultQuote.toLocaleString()}` },
        { lbl: kids > 0 ? 'Per Child (SGD)' : 'Total Package', val: kids > 0 ? `S$ ${costBreakdown.childQuote.toLocaleString()}` : `S$ ${costBreakdown.totalClientPrice.toLocaleString()}` },
        { lbl: 'INR Equivalent', val: `₹ ${costBreakdown.totalClientPriceINR.toLocaleString('en-IN')}` },
      ]
      const piW = CW / priceItems.length
      priceItems.forEach((pi, i) => {
        const px = ML + i * piW
        if (i > 0) { setDraw(GOLD); doc.setLineWidth(0.3); doc.line(px, y + 3, px, y + 19) }
        font('normal', 7); setTxt(GOLD)
        doc.text(pi.lbl.toUpperCase(), px + piW/2, y + 7.5, { align: 'center' })
        font('bold', 13); setTxt(WHITE)
        doc.text(pi.val, px + piW/2, y + 17, { align: 'center' })
      })
      y += 27

      // ─── HOTEL SECTION ────────────────────────────────────
      sectionTitle('🏨  Accommodation Details')
      if (hotelRequired) {
        const hotelName = customHotelEnabled ? (customHotelName || 'Custom Hotel') : (hotelsList[globalHotelIndex]?.name || 'TBD')
        const roomType  = customHotelEnabled ? (customHotelRoomType || 'Custom Room') : (hotelsList[globalHotelIndex]?.rooms[globalRoomIndex]?.type || 'TBD')
        const suppType  = customHotelEnabled ? customHotelSuppName : (hotelsList[globalHotelIndex]?.rooms[globalSuppIndex]?.type || '')

        setFill(LGRAY); doc.rect(ML, y, CW, 7, 'F')
        font('bold', 9); setTxt(NAVY)
        doc.text('Property', ML + 2, y + 5)
        doc.text('Room Configuration', ML + 90, y + 5)
        doc.text('Nights', MR - 18, y + 5)
        y += 7
        setDraw(LGRAY); doc.setLineWidth(0.2); doc.line(ML, y, MR, y)

        font('normal', 9); setTxt(TEXT)
        doc.text(hotelName, ML + 2, y + 6)
        doc.text(`${roomType} × ${globalRoomCount}`, ML + 90, y + 6)
        doc.text(`${nightsCount}`, MR - 18, y + 6)
        y += 9

        if (suppType && globalSuppCount > 0) {
          font('italic', 8.5); setTxt(SLATE)
          doc.text(`+ Supplement: ${suppType} × ${globalSuppCount}`, ML + 2, y + 4)
          y += 8
        }
      } else {
        font('italic', 9); setTxt(MGRAY)
        doc.text('Hotel accommodation not included in this package.', ML + 2, y + 5)
        y += 10
      }
      y += 3

      // ─── COST BREAKDOWN TABLE ─────────────────────────────
      sectionTitle('💰  Price Breakdown')
      const costRows = [
        [`Rooms (${globalRoomCount})`, `S$ ${costBreakdown.roomCostTotal.toFixed(2)}`],
        [`Supp (${globalSuppCount})`, `S$ ${costBreakdown.suppCostTotal.toFixed(2)}`],
        [`Transfers (${costBreakdown.totalTransfers})`, `S$ ${costBreakdown.transportTotal.toFixed(2)}`],
        [`Tickets (${costBreakdown.totalAttractionsCount})`, `S$ ${costBreakdown.attractionTotal.toFixed(2)}`],
        [`Meals (${costBreakdown.totalLunchCount}L, ${costBreakdown.totalDinnerCount}D)`, `S$ ${costBreakdown.mealTotal.toFixed(2)}`],
        [`Guides (${costBreakdown.totalGuidesCount})`, `S$ ${costBreakdown.guideTotal.toFixed(2)}`],
      ].filter(r => parseFloat(r[1].replace('S$ ', '')) > 0)

      costRows.forEach((row, i) => {
        checkPage(8)
        if (i % 2 === 0) { setFill(LGRAY); doc.rect(ML, y, CW, 7, 'F') }
        font('normal', 8.5); setTxt(TEXT)
        doc.text(row[0], ML + 3, y + 5)
        font('bold', 8.5); setTxt(SLATE)
        doc.text(row[1], MR - 2, y + 5, { align: 'right' })
        y += 7
      })

      // Net total
      if (!hideNetPricing) {
        const netAdult = (costBreakdown.adultQuote / (1 + markupPercent / 100)).toFixed(2)
        checkPage(9)
        setFill(TEAL); doc.rect(ML, y, CW, 8, 'F')
        font('bold', 9); setTxt(WHITE)
        doc.text('B2B Net Rate (per adult)', ML + 3, y + 5.5)
        doc.text(`S$ ${netAdult}`, MR - 2, y + 5.5, { align: 'right' })
        y += 8
      }

      // Grand totals
      checkPage(16)
      setFill(NAVY); doc.rect(ML, y, CW, 8, 'F')
      font('bold', 9.5); setTxt(GOLD)
      doc.text(`Total Package Price — ${adults} Adult${adults>1?'s':''}${kids>0?` + ${kids} Child${kids>1?'ren':''}`: ''}`, ML + 3, y + 5.5)
      doc.text(`S$ ${costBreakdown.totalClientPrice.toLocaleString()}`, MR - 2, y + 5.5, { align: 'right' })
      y += 8

      setFill(GOLD_L); doc.rect(ML, y, CW, 7, 'F')
      font('normal', 8); setTxt(SLATE)
      doc.text('Approx. INR Equivalent', ML + 3, y + 4.5)
      font('bold', 8); setTxt(CRIM)
      doc.text(`₹ ${costBreakdown.totalClientPriceINR.toLocaleString('en-IN')}`, MR - 2, y + 4.5, { align: 'right' })
      y += 10

      if (discountPerPerson > 0) {
        checkPage(8)
        font('italic', 8); setTxt(TEAL)
        doc.text(`* Discount of S$ ${discountPerPerson}/person has been applied.`, ML + 3, y + 4)
        y += 8
      }

      // ─── INCLUDES / EXCLUDES ─────────────────────────────
      const hasAttr  = itinerary.some(d => d.attractions.length > 0)
      const hasXfer  = itinerary.some(d => d.transfers.length > 0 || d.attractions.some(a => a.hasTransfer))
      const hasMeals = itinerary.some(d => d.breakfast || d.lunch || d.dinner || (d.meals && d.meals.length > 0))

      sectionTitle('✅  Package Inclusions & Exclusions')
      checkPage(48)

      const inclW = (CW - 4) / 2
      // INCLUDES box
      setFill([230, 248, 237] as [number,number,number]); doc.roundedRect(ML, y, inclW, 36, 2, 2, 'F')
      setDraw(TEAL); doc.setLineWidth(0.5); doc.roundedRect(ML, y, inclW, 36, 2, 2, 'S')
      font('bold', 8.5); setTxt(TEAL)
      doc.text('✓  INCLUDED', ML + 3, y + 6)
      const incl: string[] = []
      if (hotelRequired) incl.push(`${nightsCount} Night${nightsCount>1?'s':''} Hotel Accommodation`)
      if (hasXfer) incl.push('Private Airport / Sightseeing Transfers')
      if (hasAttr) incl.push('Entrance Tickets as per Itinerary')
      if (hasMeals) incl.push('Meals as per Day Plan')
      incl.push('English-Speaking Guide (where applicable)')
      font('normal', 8); setTxt(SLATE)
      incl.forEach((line, i) => { doc.text(`• ${line}`, ML + 3, y + 13 + i * 5.5) })

      // EXCLUDES box
      const ex2 = ML + inclW + 4
      setFill([255, 240, 240] as [number,number,number]); doc.roundedRect(ex2, y, inclW, 36, 2, 2, 'F')
      setDraw(CRIM); doc.setLineWidth(0.5); doc.roundedRect(ex2, y, inclW, 36, 2, 2, 'S')
      font('bold', 8.5); setTxt(CRIM)
      doc.text('✗  EXCLUDED', ex2 + 3, y + 6)
      const excl = ['International / Domestic Airfare', 'Travel Insurance', 'Personal Expenses & Tips', 'Singapore Entry Visa Fees', 'Items Not Mentioned Above']
      font('normal', 8); setTxt(SLATE)
      excl.forEach((line, i) => { doc.text(`• ${line}`, ex2 + 3, y + 13 + i * 5.5) })

      y += 40

      // ─── PAGE BREAK BEFORE ITINERARY ─────────────────────
      addFooter()
      doc.addPage()
      pageNum++
      addPageHeader()
      y = 48

      // ─── DAY-BY-DAY ITINERARY ─────────────────────────────
      sectionTitle('🗓️  Day-by-Day Itinerary')

      itinerary.forEach((day, dIdx) => {
        // Build non-attraction items (transfers, meals, guides)
        const nonAttrItems: { time: string; label: string; detail: string; color: [number,number,number] }[] = []

        day.transfers.forEach(t => {
          const vehicle = vehiclesList[t.vehicleIndex]?.type || 'Vehicle'
          const qtyStr = t.qty && t.qty > 1 ? ` (x${t.qty})` : ''
          nonAttrItems.push({ time: t.time||'00:00', label: `Private Transfer — ${vehicle}${qtyStr}`, detail: t.description || 'Point-to-point transfer', color: TEAL })
        })
        day.attractions.forEach(a => {
          const name = attractionsList[a.attractionIndex]?.name || 'Attraction'
          if (a.hasTransfer) {
            if (a.pickupEnabled !== false) {
              const pvName = vehiclesList[a.pickupVehicleIndex ?? 0]?.type || 'Vehicle'
              nonAttrItems.push({ time: a.pickupTime || '09:00', label: `Pickup Transfer — ${pvName}`, detail: a.pickupNotes || `Transfer to ${name}`, color: TEAL })
            }
            if (a.dropEnabled !== false) {
              const dvName = vehiclesList[a.dropVehicleIndex ?? 0]?.type || 'Vehicle'
              nonAttrItems.push({ time: a.dropTime || '17:00', label: `Drop Transfer — ${dvName}`, detail: a.dropNotes || `Transfer from ${name}`, color: TEAL })
            }
          }
        })
        if (day.breakfast || day.lunch || day.dinner) {
          const cbMeals = [day.breakfast&&'Breakfast', day.lunch&&'Lunch', day.dinner&&'Dinner'].filter(Boolean).join(', ')
          nonAttrItems.push({ time: '07:00', label: 'Meals Included', detail: cbMeals as string, color: [60, 120, 90] as [number,number,number] })
        }
        if (day.meals && Array.isArray(day.meals)) {
          day.meals.forEach(m => {
            const mt = mealsList[m.mealIndex]?.type || 'Meal'
            nonAttrItems.push({ time: m.time||'00:00', label: mt, detail: m.description || 'Dining experience', color: [60, 120, 90] as [number,number,number] })
          })
        }
        day.guides.forEach(g => {
          const gt = guidesList[g.guideIndex]?.type || 'Guide'
          nonAttrItems.push({ time: g.time||'00:00', label: gt, detail: g.description || 'Professional tour assistance', color: SLATE })
        })
        nonAttrItems.sort((a, b) => a.time.localeCompare(b.time))

        // Check if this day has anything
        const hasContent = nonAttrItems.length > 0 || day.attractions.length > 0

        checkPage(22)

        // Day header
        setFill(GOLD); doc.roundedRect(ML, y, CW, 9, 2, 2, 'F')
        font('bold', 10); setTxt(NAVY)
        doc.text(`DAY ${dIdx + 1}`, ML + 4, y + 6.2)
        font('normal', 8.5); setTxt(NAVY)
        doc.text(getItineraryDate(dIdx), ML + 22, y + 6.2)
        const dayLabel = dIdx === 0 ? 'Arrival Day' : dIdx === nightsCount ? 'Departure Day' : 'Tour Day'
        font('italic', 8); setTxt(NAVY)
        doc.text(dayLabel, MR - 2, y + 6.2, { align: 'right' })
        y += 11

        if (!hasContent) {
          font('italic', 8.5); setTxt(MGRAY)
          doc.text('Free & Easy / Rest Day — Itinerary to be confirmed.', ML + 4, y + 5)
          y += 10
        } else {
          // ── Render non-attraction items as compact timeline rows ──
          nonAttrItems.forEach((item, iIdx) => {
            const dl = doc.splitTextToSize(item.detail, CW - 40)
            const rowHeight = 9 + (dl.length > 1 ? (dl.length - 1) * 4 : 0)
            checkPage(rowHeight + 4)
            if (iIdx % 2 === 0) { setFill(LGRAY); doc.rect(ML, y, CW, rowHeight, 'F') }
            setFill(item.color); doc.circle(ML + 5.5, y + 4.5, 2.5, 'F')
            font('bold', 7.5); setTxt(item.color)
            doc.text(item.time, ML + 10, y + 5.2)
            font('bold', 8.5); setTxt(NAVY)
            doc.text(item.label, ML + 22, y + 5.2, { maxWidth: CW - 25 })
            font('italic', 7.5); setTxt(SLATE)
            doc.text(dl, ML + 22, y + 10.5)
            y += rowHeight
          })

          // ── Render attractions as rich cards ──
          day.attractions.forEach(a => {
            const attrName = attractionsList[a.attractionIndex]?.name || 'Attraction'
            const notes = a.description ? a.description : ''
            const metaKey = attrName.toLowerCase().trim()
            const meta = attractionsMeta[metaKey] || null

            const shortDesc = meta?.shortDescription || ATTRACTION_DESCRIPTIONS[attrName] || 'One of Singapore\'s premier sightseeing attractions.'
            const highlights: string[] = meta?.highlights?.slice(0, 4) || []
            const rating = meta?.rating || null
            const openingHours = meta?.openingHours || ''
            const duration = meta?.duration || ''
            const location = meta?.location || ''
            const hasPhoto = !!(meta?.photoUrl)

            // Estimate card height — meta parts render one-per-line at 4.5mm each
            const descLines = doc.splitTextToSize(shortDesc, hasPhoto ? CW - 60 : CW - 8)
            const highlightRows = Math.ceil(highlights.length / 2)
            const metaLineCount = [openingHours, duration, location].filter(Boolean).length
            const cardH = 16 + descLines.length * 4 + (highlights.length > 0 ? highlightRows * 6 + 4 : 0) + (metaLineCount > 0 ? metaLineCount * 4.5 + 4 : 0) + (notes ? 7 : 0)
            checkPage(cardH + 10)

            // Card background
            setFill([248, 246, 240] as [number,number,number])
            doc.roundedRect(ML, y, CW, cardH, 2, 2, 'F')
            setDraw(GOLD); doc.setLineWidth(0.4)
            doc.roundedRect(ML, y, CW, cardH, 2, 2, 'S')
            // Left accent bar
            setFill(CRIM); doc.rect(ML, y, 3, cardH, 'F')

            let cy = y + 5

            if (hasPhoto) {
              // Image on the right side (40mm wide)
              const imgX = MR - 42
              const imgW = 42
              const imgH = Math.min(cardH - 6, 30)
              try {
                doc.addImage(meta!.photoUrl!, 'JPEG', imgX, y + 3, imgW, imgH, undefined, 'MEDIUM')
                // Subtle overlay text area width
              } catch (e) { /* image may not load in PDF context */ }
            }

            const textW = hasPhoto ? CW - 50 : CW - 10

            // Attraction name + time badge
            font('bold', 10); setTxt(NAVY)
            doc.text(attrName, ML + 6, cy)
            cy += 5

            // Time + ticket count chips inline
            const ticketInfo = `${a.time ? a.time + '  |  ' : ''}Adult x${a.adultTickets}${kids > 0 ? `  |  Child x${a.childTickets}` : ''}`
            font('bold', 7.5); setTxt(CRIM)
            doc.text(ticketInfo, ML + 6, cy)

            // Rating — ASCII-safe (jsPDF Helvetica cannot render Unicode stars)
            if (rating) {
              const ratingStr = `Rating: ${rating.toFixed(1)} / 5.0`
              font('bold', 7.5); setTxt([180, 130, 20] as [number,number,number])
              doc.text(ratingStr, ML + textW - 2, cy, { align: 'right' })
            }
            cy += 5

            // Description
            font('normal', 7.5); setTxt(SLATE)
            const dl2 = doc.splitTextToSize(shortDesc, textW)
            doc.text(dl2, ML + 6, cy)
            cy += dl2.length * 4 + 1

            // Notes from agent
            if (notes) {
              font('italic', 7); setTxt(TEAL)
              const nl = doc.splitTextToSize(`Note: ${notes}`, textW)
              doc.text(nl, ML + 6, cy)
              cy += nl.length * 3.5 + 1
            }

            // Highlights as pills
            if (highlights.length > 0) {
              font('bold', 7); setTxt(NAVY)
              doc.text('Highlights:', ML + 6, cy)
              cy += 4
              highlights.forEach((h, hi) => {
                const col = hi % 2 === 0 ? ML + 6 : ML + (CW / 2)
                if (hi % 2 === 0 && hi > 0) cy += 5.5
                setFill(GOLD_L); doc.roundedRect(col, cy - 3, (CW / 2) - 8, 5, 1, 1, 'F')
                font('normal', 6.5); setTxt(NAVY)
                doc.text(`• ${h}`, col + 1.5, cy + 0.5, { maxWidth: (CW / 2) - 10 })
              })
              if (highlights.length % 2 !== 0) cy += 5.5
              else cy += 5.5
            }

            // Opening hours / duration / location metadata row — ASCII-safe labels only
            const metaParts: string[] = []
            if (openingHours) metaParts.push(`Hours: ${openingHours}`)
            if (duration) metaParts.push(`Duration: ${duration}`)
            if (location) metaParts.push(`Location: ${location}`)
            if (metaParts.length > 0) {
              font('normal', 6.5); setTxt(MGRAY)
              // Render each part on a new line to avoid overflow
              metaParts.forEach((mp, mpi) => {
                const mpLines = doc.splitTextToSize(mp, textW)
                doc.text(mpLines, ML + 6, cy + 1 + mpi * 4.5)
              })
              cy += metaParts.length * 4.5 + 2
            }

            y += cardH + 4
          })
        }

        y += 4
        hrLine(LGRAY, 0.2)
      })


      // ─── TERMS & IMPORTANT NOTES ──────────────────────────
      sectionTitle('📋  Terms & Important Notes')
      checkPage(60)

      const notes = [
        'Prices are quoted in Singapore Dollars (SGD) and are indicative. Final rates will be confirmed upon booking.',
        'Exchange rates for INR are approximate and subject to change on the date of payment.',
        'Rates are subject to change due to peak seasons, public holidays, or third-party surcharges.',
        'FIT room rates are subject to a marginal increase.',
        'Itinerary sequence may be adjusted based on operational requirements without notice.',
        'Cancellation policy and payment terms apply as per Flying Wonders\' standard terms and conditions.',
        'Valid travel documents (passport, visa) are the sole responsibility of the traveler.',
        'Travel insurance is highly recommended for all international travel.',
      ]
      notes.forEach((note, i) => {
        checkPage(9)
        if (i % 2 === 0) { setFill(LGRAY); doc.rect(ML, y, CW, 7, 'F') }
        font('normal', 8); setTxt(TEXT)
        const lines = doc.splitTextToSize(`${i + 1}. ${note}`, CW - 4)
        doc.text(lines, ML + 3, y + 4.5)
        y += 7
      })

      // ─── AGENT / CONTACT CARD ────────────────────────────
      y += 5
      checkPage(38)
      setFill(NAVY); doc.roundedRect(ML, y, CW, 32, 3, 3, 'F')
      setFill(GOLD); doc.rect(ML, y + 30, CW, 2, 'F')
      font('bold', 10); setTxt(GOLD)
      doc.text('Your Travel Consultant', ML + 5, y + 9)
      if (activeAgent) {
        font('bold', 12); setTxt(WHITE)
        doc.text(activeAgent.agentName || 'Travel Consultant', ML + 5, y + 18)
        font('normal', 8.5); setTxt(GOLD)
        const agentContactParts: string[] = []
        if (activeAgent.phone) agentContactParts.push(`Tel: ${activeAgent.phone}`)
        if (activeAgent.email) agentContactParts.push(`Email: ${activeAgent.email}`)
        doc.text(agentContactParts.join('   |   '), ML + 5, y + 26)

        // Company name on the right
        if (activeAgent.companyName) {
          font('bold', 9); setTxt(GOLD)
          doc.text(activeAgent.companyName.toUpperCase(), MR - 5, y + 18, { align: 'right' })
        }
        font('normal', 7.5); setTxt(WHITE)
        doc.text('Singapore DMC Travel Partner', MR - 5, y + 26, { align: 'right' })
      } else {
        font('bold', 9); setTxt(GOLD)
        doc.text('FLYING WONDERS', MR - 5, y + 18, { align: 'right' })
        font('normal', 7.5); setTxt(WHITE)
        doc.text('Singapore DMC Travel Partner', MR - 5, y + 26, { align: 'right' })
      }
      y += 37

      // final footer
      addFooter()

      const guestSlug = (guestName || 'Guest').replace(/\s+/g, '-')
      doc.save(`FW-Proposal-${guestSlug}-${savedProposalNum || 'Draft'}.pdf`)
      notifyAgentActivity('pdf_download')
    })
  }

  // Helper to ensure proposal is saved & assigned a Proposal ID before copying, sharing, or downloading
  const ensureProposalSaved = async (quiet = true): Promise<string | null> => {
    if (savedProposalNum) return savedProposalNum
    if (!activeAgent) return null

    try {
      setSaveStatus('saving')
      const h = hotelsList[globalHotelIndex]
      const room = h?.rooms[globalRoomIndex]
      const supp = globalSuppIndex >= 0 ? h?.rooms[globalSuppIndex] : null

      const isAdmin = activeAgent.email?.toLowerCase() === 'info.flyingwonders@gmail.com'
      const targetAgentId = isAdmin ? (selectedAgentId !== 'direct' ? selectedAgentId : undefined) : undefined
      const targetAgentEmail = isAdmin ? (selectedAgentDetails?.email || (selectedAgentId === 'direct' ? undefined : undefined)) : activeAgent.email

      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalNumber: undefined,
          isTemplateBased: !!activeTemplateName,
          templateName: activeTemplateName || '',
          agentId: targetAgentId,
          agentEmail: targetAgentEmail,
          guestName,
          guestPhone,
          adults,
          kids,
          childAges,
          nights: nightsCount,
          arrivalDate,
          hotelRequired,
          hotelName: customHotelEnabled ? customHotelName : (h?.name || ''),
          roomType: customHotelEnabled ? customHotelRoomType : (room?.type || ''),
          roomCount: globalRoomCount,
          supplementType: customHotelEnabled ? customHotelSuppName : (supp?.type || ''),
          supplementCount: globalSuppCount,
          customHotelEnabled,
          customHotelPrice,
          customHotelSuppCost,
          miscCostPerPerson,
          miscNotes,
          markupPercent,
          markupAbsolute,
          discountPerPerson,
          customAgencyName,
          customAgencyEmail,
          customAgencyPhone,
          destinationMode,
          costBreakdown,
          itinerary,
        })
      })
      const data = await res.json()
      if (res.ok && data.success && data.proposalNumber) {
        setSaveStatus('success')
        setSavedProposalNum(data.proposalNumber)
        if (!quiet) {
          alert(`Proposal created successfully! Proposal Number: ${data.proposalNumber}`)
        }
        return data.proposalNumber
      }
    } catch (err) {
      console.error('Auto-save proposal error:', err)
      setSaveStatus('error')
    }
    return null
  }

  // Copy Proposal handler with automatic Proposal ID assignment
  const handleCopyProposalText = async (closeDrawer = false) => {
    const pNum = await ensureProposalSaved(true)
    const text = generateProposalText(pNum || undefined)
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.error('Clipboard copy failed:', e)
    }
    notifyAgentActivity('clipboard_copy')
    if (closeDrawer) setPriceDrawerOpen(false)
    const refMsg = pNum ? ` (Ref: ${pNum})` : ''
    alert(`Proposal copied to clipboard!${refMsg}`)
  }

  // Send Itinerary on WhatsApp helper (auto-saves proposal if draft)
  const sendOnWhatsApp = async () => {
    const pNum = await ensureProposalSaved(true)
    const text = generateProposalText(pNum || undefined)
    const encodedText = encodeURIComponent(text)
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`
    window.open(whatsappUrl, '_blank')
    notifyAgentActivity('whatsapp_share')
  }

  // Handle Save Proposal to Sanity (Updates existing proposal if reloaded/active, or creates new if fresh)
  const handleSaveProposal = async () => {
    if (!activeAgent) return
    setSaveStatus('saving')
    try {
      const h = hotelsList[globalHotelIndex]
      const room = h?.rooms[globalRoomIndex]
      const supp = globalSuppIndex >= 0 ? h?.rooms[globalSuppIndex] : null

      const isAdmin = activeAgent.email?.toLowerCase() === 'info.flyingwonders@gmail.com'
      const targetAgentId = isAdmin ? (selectedAgentId !== 'direct' ? selectedAgentId : undefined) : undefined
      const targetAgentEmail = isAdmin ? (selectedAgentDetails?.email || (selectedAgentId === 'direct' ? undefined : undefined)) : activeAgent.email

      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalNumber: savedProposalNum || undefined,
          isTemplateBased: !!activeTemplateName,
          templateName: activeTemplateName || '',
          agentId: targetAgentId,
          agentEmail: targetAgentEmail,
          guestName,
          guestPhone,
          adults,
          kids,
          childAges,
          nights: nightsCount,
          arrivalDate,
          hotelRequired,
          hotelName: customHotelEnabled ? customHotelName : (h?.name || ''),
          roomType: customHotelEnabled ? customHotelRoomType : (room?.type || ''),
          roomCount: globalRoomCount,
          supplementType: customHotelEnabled ? customHotelSuppName : (supp?.type || ''),
          supplementCount: globalSuppCount,
          customHotelEnabled,
          customHotelPrice,
          customHotelSuppCost,
          miscCostPerPerson,
          miscNotes,
          markupPercent,
          markupAbsolute,
          discountPerPerson,
          customAgencyName,
          customAgencyEmail,
          customAgencyPhone,
          destinationMode,
          costBreakdown,
          itinerary,
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSaveStatus('success')
        setSavedProposalNum(data.proposalNumber)
        alert(data.updated ? `Proposal ${data.proposalNumber} updated successfully!` : `Proposal created successfully! Proposal Number: ${data.proposalNumber}`)
      } else {
        throw new Error(data.error || 'Failed to save proposal')
      }
    } catch (err) {
      console.error(err)
      setSaveStatus('error')
      alert('Failed to save proposal to Sanity. Check write tokens.')
    }
  }

  // Handle Save As Proposal to Sanity (Creates a brand new package based on current details)
  const handleSaveAsProposal = async () => {
    if (!activeAgent) return
    
    // Prompt agent for new guest/client name or default to current guest name + "(Copy)"
    const defaultName = guestName ? `${guestName} (Copy)` : ''
    const newGuestName = prompt('Enter Guest Name for the new cloned package:', defaultName)
    if (newGuestName === null) return // User cancelled

    setSaveStatus('saving')
    try {
      const h = hotelsList[globalHotelIndex]
      const room = h?.rooms[globalRoomIndex]
      const supp = globalSuppIndex >= 0 ? h?.rooms[globalSuppIndex] : null

      const isAdmin = activeAgent.email?.toLowerCase() === 'info.flyingwonders@gmail.com'
      const targetAgentId = isAdmin ? (selectedAgentId !== 'direct' ? selectedAgentId : undefined) : undefined
      const targetAgentEmail = isAdmin ? (selectedAgentDetails?.email || (selectedAgentId === 'direct' ? undefined : undefined)) : activeAgent.email

      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalNumber: undefined, // Force creation of a brand new proposal number
          isTemplateBased: !!activeTemplateName,
          templateName: activeTemplateName || '',
          agentId: targetAgentId,
          agentEmail: targetAgentEmail,
          guestName: newGuestName.trim() || guestName,
          guestPhone,
          adults,
          kids,
          childAges,
          nights: nightsCount,
          arrivalDate,
          hotelRequired,
          hotelName: customHotelEnabled ? customHotelName : (h?.name || ''),
          roomType: customHotelEnabled ? customHotelRoomType : (room?.type || ''),
          roomCount: globalRoomCount,
          supplementType: customHotelEnabled ? customHotelSuppName : (supp?.type || ''),
          supplementCount: globalSuppCount,
          customHotelEnabled,
          customHotelPrice,
          customHotelSuppCost,
          miscCostPerPerson,
          miscNotes,
          markupPercent,
          markupAbsolute,
          discountPerPerson,
          customAgencyName,
          customAgencyEmail,
          customAgencyPhone,
          destinationMode,
          costBreakdown,
          itinerary,
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSaveStatus('success')
        setSavedProposalNum(data.proposalNumber)
        if (newGuestName.trim()) setGuestName(newGuestName.trim())
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', `/custom-package?ref=${data.proposalNumber}`)
        }
        alert(`New package created successfully! Proposal Number: ${data.proposalNumber}`)
      } else {
        throw new Error(data.error || 'Failed to save new package')
      }
    } catch (err) {
      console.error(err)
      setSaveStatus('error')
      alert('Failed to save new package to Sanity. Check write tokens.')
    }
  }

  // Core function to load proposal details by proposal number
  const loadProposalByNumber = async (num: string, showAlert = true) => {
    const targetNum = num.trim()
    if (!targetNum) return
    setSearchQuery(targetNum)
    setSearchStatus('searching')
    try {
      const res = await fetch(`/api/proposals?number=${encodeURIComponent(targetNum)}`)
      const data = await res.json()
      if (res.ok && data.found) {
        const prop = data.proposal
        setSearchStatus('success')
        setSavedProposalNum(prop.proposalNumber)
        setLoadedProposalRaw(prop)
        // Load details back into state
        setGuestName(prop.guestName || '')
        setGuestPhone(prop.guestPhone || '')
        setAdults(prop.adults || 2)
        setKids(prop.kids || 0)
        if (prop.childAges) {
          try {
            const parsed = typeof prop.childAges === 'string' ? JSON.parse(prop.childAges) : prop.childAges
            if (Array.isArray(parsed)) setChildAges(parsed)
          } catch (e) {}
        }
        setNightsCount(prop.nights || 3)
        const cleanDate = (dateStr: string) => {
          if (!dateStr) return new Date().toISOString().split('T')[0]
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
          try {
            const d = new Date(dateStr)
            if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
          } catch (e) {}
          return new Date().toISOString().split('T')[0]
        }
        setArrivalDate(cleanDate(prop.arrivalDate))
        setHotelRequired(!!prop.hotelRequired)
        const isCustom = !!prop.customHotelEnabled
        setCustomHotelEnabled(isCustom)
        if (isCustom) {
          setCustomHotelName(prop.hotelName || '')
          setCustomHotelRoomType(prop.roomType || '')
          setGlobalRoomCount(prop.roomCount || 1)
          setCustomHotelPrice(prop.customHotelPrice || 0)
          setCustomHotelSuppName(prop.supplementType || '')
          setGlobalSuppCount(prop.supplementCount || 0)
          setCustomHotelSuppCost(prop.customHotelSuppCost || 0)
        } else {
          // Match hotel name
          const hIdx = hotelsList.findIndex(h => h.name === prop.hotelName)
          if (hIdx >= 0) {
            setGlobalHotelIndex(hIdx)
            const rIdx = hotelsList[hIdx]?.rooms.findIndex(r => r.type === prop.roomType)
            if (rIdx >= 0) setGlobalRoomIndex(rIdx)
            setGlobalRoomCount(prop.roomCount || 1)
            const sIdx = hotelsList[hIdx]?.rooms.findIndex(r => r.type === prop.supplementType)
            if (sIdx >= 0) setGlobalSuppIndex(sIdx)
            setGlobalSuppCount(prop.supplementCount || 0)
          }
        }
        setMiscCostPerPerson(prop.miscCostPerPerson || 0)
        setMiscNotes(prop.miscNotes || '')
        setMarkupPercent(prop.markupPercent || 0)
        setMarkupAbsolute(prop.markupAbsolute || 0)
        setDiscountPerPerson(prop.discountPerPerson || 0)
        setActiveProposalStatus(prop.status || 'pending')
        setActiveInvoiceNumber(prop.invoiceNumber || '')
        setActiveInvoiceDate(prop.invoiceDate || '')
        setActivePaymentLedger(Array.isArray(prop.paymentLedger) ? prop.paymentLedger : [])
        setActiveAdditionalCharges(Array.isArray(prop.additionalCharges) ? prop.additionalCharges : [])
        if (prop.agent) {
          setSelectedAgentId(prop.agent._id || 'direct')
          setSelectedAgentDetails(prop.agent)
        } else {
          setSelectedAgentId('direct')
          setSelectedAgentDetails(null)
        }
        if (prop.customAgencyName) setCustomAgencyName(prop.customAgencyName)
        if (prop.customAgencyEmail) setCustomAgencyEmail(prop.customAgencyEmail)
        if (prop.customAgencyPhone) setCustomAgencyPhone(prop.customAgencyPhone)
        if (prop.destinationMode && ['singapore', 'malaysia', 'combined'].includes(prop.destinationMode)) {
          setDestinationMode(prop.destinationMode as any)
        }
        if (prop.itinerary && prop.itinerary.length > 0) {
          const sanitizeTime = (timeStr: string) => {
            if (!timeStr) return '12:00'
            const clean = timeStr.trim().toUpperCase()
            const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/)
            if (match) {
              let hour = parseInt(match[1])
              const minute = match[2]
              const ampm = match[3]
              if (ampm === 'PM' && hour < 12) hour += 12
              if (ampm === 'AM' && hour === 12) hour = 0
              return `${hour.toString().padStart(2, '0')}:${minute}`
            }
            return timeStr
          }

          const sanitizedItin = prop.itinerary.map((day: any) => ({
            ...day,
            transfers: day.transfers?.map((t: any) => ({ ...t, time: sanitizeTime(t.time) })) || [],
            guides: day.guides?.map((g: any) => ({ ...g, time: sanitizeTime(g.time) })) || [],
            attractions: day.attractions?.map((a: any) => ({ 
              ...a, 
              time: sanitizeTime(a.time),
              pickupTime: sanitizeTime(a.pickupTime || '09:00'),
              dropTime: sanitizeTime(a.dropTime || '17:00')
            })) || []
          }))
          setItinerary(sanitizedItin)
        }
        // Force days open if loaded
        setCollapsedDays(new Set())
        if (showAlert) {
          alert(`Loaded Proposal: ${prop.proposalNumber}`)
        }
      } else {
        setSearchStatus('not_found')
        if (showAlert) alert('Proposal not found.')
      }
    } catch (err) {
      console.error(err)
      setSearchStatus('error')
      if (showAlert) alert('Failed to fetch proposal details.')
    }
  }

  // Handle Search Form Submission
  const handleSearchProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    loadProposalByNumber(searchQuery)
  }

  // Financial Ledger Handlers (Admin Only)
  const handleAddPayment = async () => {
    if (!savedProposalNum || !activeAgent) return
    const amt = parseFloat(ledgerPaymentAmount)
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payment amount.')
      return
    }
    setLedgerSubmitting(true)
    try {
      const res = await fetch('/api/admin/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalNumber: savedProposalNum,
          adminEmail: activeAgent.email,
          action: 'add_payment',
          paymentData: {
            amount: amt,
            method: ledgerPaymentMethod,
            referenceNo: ledgerPaymentRef,
            notes: ledgerPaymentNotes
          }
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setLedgerPaymentAmount('')
        setLedgerPaymentRef('')
        setLedgerPaymentNotes('')
        setActivePaymentLedger(data.proposal.paymentLedger || [])
        setActiveInvoiceNumber(data.proposal.invoiceNumber || '')
        setActiveInvoiceDate(data.proposal.invoiceDate || '')
        alert('Payment recorded successfully!')
      } else {
        alert(data.error || 'Failed to record payment.')
      }
    } catch (e) {
      alert('Error recording payment.')
    } finally {
      setLedgerSubmitting(false)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return
    try {
      const res = await fetch('/api/admin/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalNumber: savedProposalNum,
          adminEmail: activeAgent?.email,
          action: 'delete_payment',
          paymentData: { paymentId }
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setActivePaymentLedger(data.proposal.paymentLedger || [])
      }
    } catch (e) {
      alert('Failed to delete payment.')
    }
  }

  const handleAddCharge = async () => {
    if (!savedProposalNum || !activeAgent) return
    const amt = parseFloat(ledgerChargeAmount)
    if (!ledgerChargeDesc || isNaN(amt)) {
      alert('Please enter description and valid amount.')
      return
    }
    setLedgerSubmitting(true)
    try {
      const res = await fetch('/api/admin/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalNumber: savedProposalNum,
          adminEmail: activeAgent.email,
          action: 'add_charge',
          chargeData: {
            itemDescription: ledgerChargeDesc,
            amount: amt,
            chargeType: ledgerChargeType
          }
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setLedgerChargeDesc('')
        setLedgerChargeAmount('')
        setActiveAdditionalCharges(data.proposal.additionalCharges || [])
        alert('Change order / charge added successfully!')
      } else {
        alert(data.error || 'Failed to add charge.')
      }
    } catch (e) {
      alert('Error adding charge.')
    } finally {
      setLedgerSubmitting(false)
    }
  }

  const handleDeleteCharge = async (chargeId: string) => {
    if (!confirm('Delete this charge?')) return
    try {
      const res = await fetch('/api/admin/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalNumber: savedProposalNum,
          adminEmail: activeAgent?.email,
          action: 'delete_charge',
          chargeData: { chargeId }
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setActiveAdditionalCharges(data.proposal.additionalCharges || [])
      }
    } catch (e) {
      alert('Failed to delete charge.')
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!savedProposalNum || !activeAgent) return
    try {
      const res = await fetch('/api/admin/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalNumber: savedProposalNum,
          adminEmail: activeAgent.email,
          action: 'update_status',
          status: newStatus
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setActiveProposalStatus(newStatus)
        if (data.proposal.invoiceNumber) setActiveInvoiceNumber(data.proposal.invoiceNumber)
        if (data.proposal.invoiceDate) setActiveInvoiceDate(data.proposal.invoiceDate)
        alert(`Status updated to ${newStatus.toUpperCase()}!`)
      }
    } catch (e) {
      alert('Failed to update status.')
    }
  }

  // Auto-load proposal when ref/proposal parameter is present in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref') || params.get('proposal') || params.get('number') || params.get('proposalNumber')
      if (ref) {
        loadProposalByNumber(ref, false)
      }
    }
  }, [])

  const handleCashfreePayment = async () => {
    setCashfreeLoading(true)
    try {
      // 1. Create Order via our Backend API
      const res = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: costBreakdown.totalClientPriceINR || Math.round(costBreakdown.totalClientPrice * sgdToInrRate), // Charge the total INR amount
          customerId: `CUST_${Date.now()}`,
          customerName: agentName || 'B2B Partner',
          customerEmail: agentEmail || 'partner@flyingwonders.com',
          customerPhone: agentPhone || '9999999999'
        })
      })
      const data = await res.json()

      if (!data.success || !data.paymentSessionId) {
        throw new Error(data.error || 'Failed to create payment session')
      }

      // 2. Initialize Cashfree SDK
      // Mode depends on whether the site is test or prod, we'll default to sandbox for safety until you configure prod
      const cashfree = await load({
        mode: data.environment === 'PRODUCTION' ? "production" : "sandbox", 
      })

      if (!cashfree) {
        throw new Error('Cashfree SDK failed to load')
      }

      // 3. Open Checkout
      let checkoutOptions = {
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_modal"
      }
      cashfree.checkout(checkoutOptions).then((result: any) => {
        if(result.error){
          console.error("Cashfree Checkout Error: ", result.error)
          alert("Payment failed or cancelled: " + result.error.message)
        }
        if(result.redirect){
          console.log("Cashfree Payment complete, redirecting...", result.redirect)
        }
        if(result.paymentDetails){
          console.log("Payment completed successfully: ", result.paymentDetails)
          alert("Payment Successful! Thank you.")
        }
      })
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Payment initiation failed')
    } finally {
      setCashfreeLoading(false)
    }
  }

  // Clear existing entries and start a new itinerary
  const handleRefresh = () => {
    if (confirm('Are you sure you want to clear all existing entries and start a new itinerary? This will reset all days and custom pricing fields.')) {
      setAdults(2)
      setKids(0)
      setChildAges([])
      setNightsCount(3)
      setGuestName('')
      setGuestPhone('')
      setArrivalDate(minCheckinDate)
      setGlobalHotelIndex(0)
      setGlobalRoomIndex(0)
      setGlobalRoomCount(1)
      setGlobalSuppIndex(-1)
      setGlobalSuppCount(0)
      setCustomHotelEnabled(false)
      setCustomHotelName('')
      setCustomHotelRoomType('')
      setCustomHotelPrice(0)
      setCustomHotelSuppName('')
      setCustomHotelSuppCost(0)
      setMiscCostPerPerson(0)
      setMiscNotes('')
      setMarkupPercent(0)
      setMarkupAbsolute(0)
      setDiscountPerPerson(0)
      setSavedProposalNum(null)
      setActiveTemplateName(null)
      setSearchQuery('')
      setActiveProposalStatus('pending')
      setActiveInvoiceNumber('')
      setActiveInvoiceDate('')
      setActivePaymentLedger([])
      setActiveAdditionalCharges([])

      setItinerary(Array.from({ length: 4 }, () => ({
        transfers: [],
        breakfast: false,
        lunch: false,
        dinner: false,
        guideRequired: false,
        meals: [],
        guides: [],
        attractions: [],
      })))

      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/custom-package')
      }

      alert('Workspace cleared. All guest details, adults, children, nights, and itinerary have been reset.')
    }
  }

  // Fetch own/all proposals list
  const handleLoadQuotations = async () => {
    if (!activeAgent) return
    setLoadingQuotations(true)
    try {
      const isSystemAdmin = activeAgent.email?.toLowerCase() === 'info.flyingwonders@gmail.com'
      const queryParam = isSystemAdmin ? 'listAll=true' : `agentEmail=${encodeURIComponent(activeAgent.email || '')}`
      const res = await fetch(`/api/proposals?${queryParam}`)
      const data = await res.json()
      if (res.ok && data.success) {
        setQuotationsList(data.list || [])
      }
    } catch (err) {
      console.error('Failed to load quotations:', err)
    } finally {
      setLoadingQuotations(false)
    }
  }

  // Handle B2B Send Enquiry Submission
  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnquiryStatus('submitting')

    try {
      const proposal = generateProposalText()
      const directProposalUrl = savedProposalNum 
        ? `${window.location.origin}/custom-package?ref=${savedProposalNum}`
        : ''

      const payload = {
        name: agentName,
        email: agentEmail,
        phone: agentPhone,
        travelDate: arrivalDate,
        tier: 'b2b_builder',
        travelers: adults + kids,
        experiences: [],
        totalPrice: costBreakdown.totalClientPriceINR,
        notes: `
B2B Package Builder Submission (SGD Pricing Mode)
Proposal Number: ${savedProposalNum || 'Draft'}
Direct Link to Open: ${directProposalUrl || 'N/A'}

=== AGENT QUERY / NOTES ===
${agentQuery}

=== DETAILED ITINERARY PROPOSAL ===
${proposal}
        `.trim()
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Database logging failed')
      }

      const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
      if (web3formsKey) {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: web3formsKey,
            subject: `💼 B2B SGD Package Enquiry [${savedProposalNum || 'Draft'}] from ${agentName}`,
            from_name: 'Flying Wonders Website B2B',
            name: agentName,
            email: agentEmail,
            cc: agentEmail, // CC to agent email ID
            message: payload.notes,
          }),
        })
      }

      setEnquiryStatus('success')
      notifyAgentActivity('enquiry_submitted')
      setAgentName('')
      setAgentEmail('')
      setAgentPhone('')
      setAgentQuery('')
    } catch (err) {
      console.error('Enquiry dispatch failed:', err)
      setEnquiryStatus('error')
    }
  }

  // WhatsApp Enquiry Trigger
  const handleWhatsAppEnquiry = () => {
    const text = `Hello Flying Wonders! I have submitted a B2B Package Enquiry.%0A%0A*Agent Name:* ${agentName || 'N/A'}%0A*Phone:* ${agentPhone || 'N/A'}%0A*Itinerary cost:* S$ ${costBreakdown.totalClientPrice} (approx. ₹${costBreakdown.totalClientPriceINR.toLocaleString('en-IN')})%0A*Notes:* ${agentQuery || 'None'}`
    window.open(`https://wa.me/919886171251?text=${text}`, '_blank')
  }

  // OTP Authentication Trigger: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    setDebugCode(null)

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          companyName: authMode === 'signup' ? regCompanyName : undefined,
          agentName: authMode === 'signup' ? regAgentName : undefined,
          phone: authMode === 'signup' ? regPhone : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        if (data.error && (data.error.toLowerCase().includes('account not found') || data.error.toLowerCase().includes('register'))) {
          setAuthMode('signup')
        }
        throw new Error(data.error || 'Failed to dispatch verification code')
      }

      setOtpSent(true)
      if (data.debugOtp) {
        // Show debug code banner to make developers/admins testing easy without forced SMTP setup!
        setDebugCode(data.debugOtp)
      }
      if (data.smtpError) {
        setSmtpError(data.smtpError)
      } else {
        setSmtpError(null)
      }
    } catch (err: any) {
      setAuthError(err.message || 'Something went wrong')
    } finally {
      setAuthLoading(false)
    }
  }

  // OTP Verification Trigger: Verify OTP and set cookie
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          otp: otpCode,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Invalid code')
      }

      setIsAuthenticated(true)
      setActiveAgent(data.agent)
    } catch (err: any) {
      setAuthError(err.message || 'OTP verification failed')
    } finally {
      setAuthLoading(false)
    }
  }

  // B2B Agent Log out
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setIsAuthenticated(false)
    setActiveAgent(null)
    setOtpSent(false)
    setOtpCode('')
    setDebugCode(null)
    setSmtpError(null)
  }

  // 3. Loading state rendering
  if (isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--gold-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.2rem', color: 'var(--text-dark)' }}>Verifying B2B Session...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // 4. Guest login/register screen rendering
  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="glass" style={{ width: '100%', maxWidth: '480px', padding: '3rem 2.5rem', borderRadius: '16px', background: '#FFF', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xl)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2rem', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', lineHeight: 1.2 }}>
              Flying Wonders
            </span>
            <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.7rem', color: 'var(--gold-accent)', letterSpacing: '0.3em', textTransform: 'uppercase', display: 'block', marginTop: '4px' }}>
              Singapore DMC Partner Portal
            </span>
          </div>

          {/* Toggle Tab */}
          {!otpSent && (
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #E2E8F0', marginBottom: '2rem', paddingBottom: '2px' }}>
              <button 
                type="button" 
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: 'none', borderBottom: authMode === 'login' ? '3px solid var(--crimson-primary)' : 'none', color: authMode === 'login' ? 'var(--crimson-primary)' : '#718096', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Sign In
              </button>
              <button 
                type="button" 
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: 'none', borderBottom: authMode === 'signup' ? '3px solid var(--crimson-primary)' : 'none', color: authMode === 'signup' ? 'var(--crimson-primary)' : '#718096', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Register Agency
              </button>
            </div>
          )}

          {/* Display Errors */}
          {authError && (
            <div style={{ background: '#FFF5F5', color: '#C53030', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem', borderLeft: '4px solid #C53030' }}>
              ⚠️ {authError}
              {(authError.toLowerCase().includes('account not found') || authError.toLowerCase().includes('register')) && (
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                  style={{ display: 'block', marginTop: '0.5rem', background: '#C53030', color: '#FFF', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  👉 Click here to Register Agency
                </button>
              )}
            </div>
          )}

          {/* Debug helper code if SMTP not configured */}
          {debugCode && (
            <div style={{ background: '#FEFCBF', color: '#744210', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid #F6E05E' }}>
              ℹ️ <strong>Development Sandbox Mode:</strong> {smtpError ? `Email dispatch failed: ${smtpError}.` : 'We detected that your SMTP configuration is empty.'} Enter this code to verify: <strong style={{ fontSize: '1.2rem', color: '#000' }}>{debugCode}</strong>
            </div>
          )}

          {/* Form rendering */}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {authMode === 'signup' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#4A5568' }}>Company / Agency Name *</label>
                    <input 
                      type="text" required placeholder="e.g. Travel Wonders Inc"
                      value={regCompanyName} onChange={e => setRegCompanyName(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#4A5568' }}>Agent Name *</label>
                    <input 
                      type="text" required placeholder="e.g. Amit Kumar"
                      value={regAgentName} onChange={e => setRegAgentName(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#4A5568' }}>Phone / WhatsApp Number *</label>
                    <input 
                      type="tel" required placeholder="e.g. +91 9886171251"
                      value={regPhone} onChange={e => setRegPhone(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#4A5568' }}>Work Email Address *</label>
                <input 
                  type="email" required placeholder="e.g. agent@travelagency.com"
                  value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={authLoading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem', padding: '0.85rem', fontWeight: 700 }}
              >
                {authLoading ? 'Generating Code...' : 'Send Verification Code ✉️'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#4A5568' }}>We have sent a 6-digit OTP code to:</p>
                <strong style={{ fontSize: '0.95rem', color: 'var(--emerald-secondary)' }}>{authEmail}</strong>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#4A5568', textAlign: 'center' }}>Enter Verification Code</label>
                <input 
                  type="text" required placeholder="123456" maxLength={6}
                  value={otpCode} onChange={e => setOtpCode(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '2px solid var(--gold-accent)', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.3em', fontWeight: 700 }}
                />
              </div>

              <button 
                type="submit" 
                disabled={authLoading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
              >
                {authLoading ? 'Verifying...' : 'Verify & Log In Key 🔑'}
              </button>

              <button 
                type="button" 
                onClick={() => { setOtpSent(false); setDebugCode(null); setSmtpError(null); }}
                style={{ background: 'transparent', border: 'none', color: '#718096', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', marginTop: '0.5rem' }}
              >
                Change Email Address
              </button>
            </form>
          )}

        </div>
      </div>
    )
  }

  // Generate flat array of events for the transport schedule
  const generateScheduleData = () => {
    const events: any[] = []
    itinerary.forEach((day, dIdx) => {
      const dayStr = `Day ${dIdx + 1}`
      const dateStr = getItineraryDate(dIdx)
      
      day.transfers.forEach(t => {
        if (!scheduleFilters.transfers) return
        const vehicle = vehiclesList[t.vehicleIndex]?.type || 'Vehicle'
        const qtyStr = t.qty && t.qty > 1 ? ` (x${t.qty})` : ''
        events.push({ dayStr, dateStr, time: t.time || '00:00', type: 'Transfer', details: `${vehicle}${qtyStr}`, pax: `${adults + kids} Pax`, notes: t.description })
      })
      day.attractions.forEach(a => {
        const attrName = attractionsList[a.attractionIndex]?.name || 'Attraction'
        if (scheduleFilters.attractions) {
          events.push({ dayStr, dateStr, time: a.time || '00:00', type: 'Attraction', details: attrName, pax: `${a.adultTickets} Ad / ${a.childTickets} Ch`, notes: a.description })
        }
        // Include inline attraction pickup/dropoff transfers in schedule if transfer filter is active
        if (scheduleFilters.transfers && a.hasTransfer) {
          if (a.pickupEnabled !== false) {
            const vehicle = vehiclesList[a.pickupVehicleIndex ?? 0]?.type || 'Vehicle'
            const pickupNote = a.pickupNotes ? `${attrName} Pickup: ${a.pickupNotes}` : `${attrName} Pickup Transfer`
            events.push({ dayStr, dateStr, time: a.pickupTime || '09:00', type: 'Transfer', details: `Attraction Transfer (${vehicle})`, pax: `${adults + kids} Pax`, notes: pickupNote })
          }
          if (a.dropEnabled !== false) {
            const vehicle = vehiclesList[a.dropVehicleIndex ?? 0]?.type || 'Vehicle'
            const dropNote = a.dropNotes ? `${attrName} Dropoff: ${a.dropNotes}` : `${attrName} Dropoff Transfer`
            events.push({ dayStr, dateStr, time: a.dropTime || '17:00', type: 'Transfer', details: `Attraction Transfer (${vehicle})`, pax: `${adults + kids} Pax`, notes: dropNote })
          }
        }
      })
      if (day.meals && Array.isArray(day.meals)) {
        day.meals.forEach(m => {
          if (!scheduleFilters.meals) return
          const mealType = mealsList[m.mealIndex]?.type || 'Meal'
          events.push({ dayStr, dateStr, time: m.time || '00:00', type: 'Meal', details: mealType, pax: `${adults + kids} Pax`, notes: m.description })
        })
      }
      day.guides.forEach(g => {
        if (!scheduleFilters.guides) return
        const guideType = guidesList[g.guideIndex]?.type || 'Guide'
        events.push({ dayStr, dateStr, time: g.time || '00:00', type: 'Guide', details: guideType, pax: `${adults + kids} Pax`, notes: g.description })
      })
    })

    events.sort((a, b) => {
      if (a.dayStr !== b.dayStr) return a.dayStr.localeCompare(b.dayStr)
      return a.time.localeCompare(b.time)
    })
    
    return events
  }

  const downloadExcelSchedule = () => {
    const data = generateScheduleData()
    if (data.length === 0) {
      alert("No schedule events found in itinerary.")
      return
    }
    
    const hotel = hotelRequired
      ? (customHotelEnabled 
          ? `${customHotelName || 'Custom Hotel'} — ${customHotelRoomType || 'Custom Room'} ×${globalRoomCount}` 
          : `${hotelsList[globalHotelIndex]?.name} — ${hotelsList[globalHotelIndex]?.rooms[globalRoomIndex]?.type} ×${globalRoomCount}`)
      : 'No hotel'

    const wsData = [
      ["Operations & Transport Schedule"],
      ["Guest:", guestName || "TBA"],
      ["Contact:", guestPhone || "TBA"],
      ["Pax:", `${adults + kids} Pax`],
      ["Hotel:", hotel],
      [],
      ["Day", "Date", "Time", "Service Type", "Details", "Pax", "Notes/Route"]
    ]
    
    data.forEach(e => {
      wsData.push([e.dayStr, e.dateStr, e.time, e.type, e.details, e.pax, e.notes])
    })
    
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!cols'] = [ {wch: 6}, {wch: 12}, {wch: 8}, {wch: 14}, {wch: 35}, {wch: 15}, {wch: 40} ]
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Operations Schedule")
    XLSX.writeFile(wb, `${guestName || 'Guest'}_Transport_Schedule.xlsx`)
  }

  // 5. Main authenticated cost estimator rendering
  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem', maxWidth: '1200px' }}>
      
      {/* Header Banner */}
      <div className="glass" style={{ 
        background: 'linear-gradient(135deg, var(--bg-dark) 0%, #1E293B 100%)', 
        color: '#FFF', 
        padding: '0.85rem 1.25rem',
        borderRadius: '16px', 
        marginBottom: '1rem',
        borderLeft: '6px solid var(--gold-accent)',
        position: 'relative'
      }}>
        
        {/* Agent Profile & Logout Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.4rem', marginBottom: '0.4rem' }}>
          <span style={{ color: 'var(--gold-accent)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Internal B2B Agent Portal
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right', color: 'white', fontSize: '0.75rem' }}>
              <strong>{activeAgent?.agentName} ({activeAgent?.companyName})</strong>
            </div>
            <button 
              onClick={handleLogout} 
              style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 700, alignSelf: 'center' }}
            >
              Logout
            </button>
          </div>
        </div>

        <h1 style={{ fontSize: '1.2rem', marginTop: '0.25rem', marginBottom: '0', fontFamily: 'var(--font-playfair), serif', lineHeight: '1.2' }}>
          Singapore Interactive Package Cost Estimator
        </h1>
      </div>

      {/* Workspace View Mode Toggle Tabs */}
      <div className="package-editor-toolbar" style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.6rem', gap: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            style={{
              padding: '0.35rem 0.75rem',
              background: activeTab === 'editor' ? 'var(--emerald-secondary)' : 'transparent',
              color: activeTab === 'editor' ? '#FFF' : '#4A5568',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'editor' ? '0 3px 8px rgba(47,133,90,0.15)' : 'none'
            }}
          >
            ⚙️ Builder
          </button>

          {/* 🇸🇬 / 🇲🇾 Destination Mode Switcher */}
          <div style={{ display: 'inline-flex', background: '#EDF2F7', padding: '0.15rem', borderRadius: '8px', border: '1px solid #CBD5E1', marginLeft: '0.25rem', marginRight: '0.25rem' }}>
            <button
              type="button"
              onClick={() => handleDestinationModeChange('singapore')}
              title="Singapore DMC Mode"
              style={{
                padding: '0.3rem 0.55rem',
                borderRadius: '6px',
                border: 'none',
                background: destinationMode === 'singapore' ? '#0F4C3A' : 'transparent',
                color: destinationMode === 'singapore' ? '#FFF' : '#4A5568',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🇸🇬
            </button>
            <button
              type="button"
              onClick={() => handleDestinationModeChange('malaysia')}
              title="Malaysia DMC Mode"
              style={{
                padding: '0.3rem 0.55rem',
                borderRadius: '6px',
                border: 'none',
                background: destinationMode === 'malaysia' ? '#B7791F' : 'transparent',
                color: destinationMode === 'malaysia' ? '#FFF' : '#4A5568',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🇲🇾
            </button>
          </div>

          {!hideReadyTemplatesSubpage && (
            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              style={{
                padding: '0.35rem 0.75rem',
                background: activeTab === 'templates' ? 'var(--emerald-secondary)' : 'transparent',
                color: activeTab === 'templates' ? '#FFF' : '#4A5568',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'templates' ? '0 3px 8px rgba(47,133,90,0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>📦</span> Ready-Made
            </button>
          )}
          {!hideClientPreview && (
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '0.35rem 0.75rem',
                background: activeTab === 'preview' ? 'var(--emerald-secondary)' : 'transparent',
                color: activeTab === 'preview' ? '#FFF' : '#4A5568',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'preview' ? '0 3px 8px rgba(47,133,90,0.15)' : 'none'
              }}
            >
              👁️ Preview
            </button>
          )}

          {activeAgent?.email?.toLowerCase() === 'info.flyingwonders@gmail.com' && (
            <button
              type="button"
              onClick={() => setHideReadyTemplatesSubpage(prev => !prev)}
              title="Toggle visibility of Ready-Made Packages subpage for B2B portal"
              style={{
                padding: '0.35rem 0.75rem',
                background: hideReadyTemplatesSubpage ? '#FEF2F2' : '#F0FDF4',
                color: hideReadyTemplatesSubpage ? '#991B1B' : '#166534',
                border: `1px solid ${hideReadyTemplatesSubpage ? '#FECACA' : '#BBF7D0'}`,
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              {hideReadyTemplatesSubpage ? '🙈 Subpage: Hidden' : '👁️ Subpage: Visible'}
            </button>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            style={{
              padding: '0.45rem 1rem',
              background: '#FFF5F5',
              color: '#C53030',
              border: '1px solid #FEB2B2',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 1px 4px rgba(229, 62, 62, 0.08)'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#FED7D7'}
            onMouseOut={e => e.currentTarget.style.background = '#FFF5F5'}
          >
            🔄 Clear & New Itinerary
          </button>
          {!hidePreviewPackageOverlay && (
            <button
              type="button"
              onClick={() => setShowPreviewOverlay(true)}
              style={{
                padding: '0.45rem 1rem',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: '#FFF',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 3px 8px rgba(16, 185, 129, 0.15)'
              }}
            >
              🔍 Preview Package
            </button>
          )}
          {!hideIciciCustomPackage && (
            <button
              type="button"
              onClick={() => setIsIciciModalOpen(true)}
              style={{
                padding: '0.35rem 0.8rem',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: '#FFF',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 3px 8px rgba(16, 185, 129, 0.25)'
              }}
            >
              📱 UPI - Pay
            </button>
          )}

          {!hideCashfreeCustomPackage && (
            <button
              type="button"
              onClick={handleCashfreePayment}
              disabled={cashfreeLoading}
              style={{
                padding: '0.35rem 0.8rem',
                background: 'linear-gradient(135deg, #1A365D 0%, #2A4365 100%)',
                color: '#FFF',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: cashfreeLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '150px',
                gap: '0.35rem',
                boxShadow: '0 3px 8px rgba(26, 54, 93, 0.25)',
                opacity: cashfreeLoading ? 0.7 : 1
              }}
            >
              {cashfreeLoading ? <Loader2 size={16} className="animate-spin" /> : '💳 Credit Card - Pay'}
            </button>
          )}
      </div>

      {activeTab === 'templates' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Subpage Banner */}
          <div style={{ background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)', borderRadius: '16px', padding: '2rem 2.5rem', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div>
              <span style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                B2B Ready-Made Packages
              </span>
              <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem' }}>
                Pre-Configured Tour Packages
              </h2>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9, maxWidth: '600px', fontWeight: 300 }}>
                Select a ready-made itinerary template below to instantly pre-fill your workspace. Customize dates, transfers, hotel rooms, tickets, and meals before quoting.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#FFF', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration:</span>
              {(['all', '3', '4', '5'] as const).map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSelectedTemplateFilter(n)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedTemplateFilter === n ? '#0F4C3A' : '#F1F5F9',
                    color: selectedTemplateFilter === n ? '#FFF' : '#475569'
                  }}
                >
                  {n === 'all' ? 'All Durations' : `${n} Nights / ${parseInt(n) + 1} Days`}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category:</span>
              {(['all', 'popular', 'family', 'luxury', 'budget', 'mice'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedTemplateCategory(cat)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    background: selectedTemplateCategory === cat ? '#0F4C3A' : '#F1F5F9',
                    color: selectedTemplateCategory === cat ? '#FFF' : '#475569'
                  }}
                >
                  {cat === 'all' ? 'All Themes' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Template Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' }}>
            {readyTemplatesList
              .filter(t => {
                if (t.hideTemplate) return false
                if (selectedTemplateFilter !== 'all' && String(t.nightsCount) !== selectedTemplateFilter) return false
                if (selectedTemplateCategory !== 'all' && t.category !== selectedTemplateCategory) return false
                return true
              })
              .map((tmpl: any) => (
                <div key={tmpl._id || tmpl.title} style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s ease' }}>
                  
                  <div>
                    {/* Card Cover Image with Badge */}
                    <div style={{ height: '180px', width: '100%', position: 'relative', overflow: 'hidden', background: '#1E293B' }}>
                      <img src={tmpl.coverImage || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'} alt={tmpl.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)' }} />
                      
                      {tmpl.badgeText && (
                        <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#D4AF37', color: '#111', fontWeight: 800, fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                          {tmpl.badgeText}
                        </span>
                      )}

                      <span style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(15,76,58,0.9)', color: '#FFF', fontWeight: 800, fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                        🌙 {tmpl.nightsCount} Nights / {tmpl.nightsCount + 1} Days
                      </span>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A365D', margin: '0 0 0.6rem', lineHeight: 1.3 }}>
                        {tmpl.title}
                      </h3>

                      <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                        {tmpl.summary}
                      </p>

                      {/* Included Highlights Pills */}
                      {tmpl.itinerary && Array.isArray(tmpl.itinerary) && (
                        <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F4C3A', display: 'block', marginBottom: '0.35rem' }}>
                            Included Highlights Overview:
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', fontSize: '0.75rem', color: '#334155' }}>
                            {tmpl.itinerary.map((d: any, idx: number) => (
                              <span key={idx} style={{ background: '#FFF', border: '1px solid #CBD5E1', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                                Day {idx + 1}: {d.dayTitle || `Day ${idx + 1}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {tmpl.startingPriceSGD > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Est. Starting Net Price:</span>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                            S$ {tmpl.startingPriceSGD.toLocaleString()}{' '}
                            <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 600 }}>
                              (₹{Math.round(tmpl.startingPriceSGD * sgdToInrRate).toLocaleString('en-IN')})
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div style={{ padding: '1rem 1.5rem 1.5rem', borderTop: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setTemplateModalItem(tmpl)
                        setTemplateModalCheckinDate(arrivalDate || minCheckinDate)
                      }}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #0F4C3A 0%, #059669 100%)',
                        color: '#FFF',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 3px 8px rgba(5,150,105,0.2)'
                      }}
                    >
                      <span>🚀</span> Customize & Quote This Package
                    </button>
                  </div>

                </div>
              ))}
          </div>

        </div>
      ) : activeTab === 'preview' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* White-Label Customer Header */}
          <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', background: '#FFF', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '2px solid #F0F4F8', paddingBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--emerald-secondary)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Prepared By:
                </span>
                <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '1.8rem', color: '#1A202C', fontFamily: 'var(--font-playfair), serif' }}>
                  {customAgencyName}
                </h2>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#4A5568', lineHeight: 1.6 }}>
                {customAgencyPhone && <div>📞 {customAgencyPhone}</div>}
                {customAgencyEmail && <div>✉️ {customAgencyEmail}</div>}
                <div>📍 Authorized Agent Partner Desk</div>
              </div>
            </div>
            
            {/* Quick Stats Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.5rem', textAlign: 'center' }}>
              <div style={{ background: '#F7FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #EDF2F7' }}>
                <span style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Duration</span>
                <strong style={{ fontSize: '1.1rem', color: '#2D3748' }}>{nightsCount + 1} Days / {nightsCount} Nights</strong>
              </div>
              <div style={{ background: '#F7FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #EDF2F7' }}>
                <span style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Travelers</span>
                <strong style={{ fontSize: '1.1rem', color: '#2D3748' }}>{adults} Adults {kids > 0 ? `| ${kids} Child(ren)` : ''}</strong>
              </div>
              <div style={{ background: '#F7FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #EDF2F7' }}>
                <span style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Start Date</span>
                <strong style={{ fontSize: '1.1rem', color: '#2D3748' }}>{getItineraryDate(0)}</strong>
              </div>
            </div>
          </div>

          {/* Visual Day-by-Day timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {itinerary.map((day, dayIdx) => {
              // Determine cover photo based on attractions
              let dayCover = 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop' // Singapore general
              const dayAttrs = day.attractions.map(a => attractionsList[a.attractionIndex]?.name.toLowerCase() || '')
              if (dayAttrs.some(name => name.includes('universal'))) {
                dayCover = 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&auto=format&fit=crop' // Theme park
              } else if (dayAttrs.some(name => name.includes('garden') || name.includes('dome'))) {
                dayCover = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop' // Gardens
              } else if (dayAttrs.some(name => name.includes('night') || name.includes('safari') || name.includes('zoo'))) {
                dayCover = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop' // Wildlife night
              }

              return (
                <div key={dayIdx} className="glass" style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFF', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-md)' }}>
                  
                  {/* Hero card header */}
                  <div style={{ position: 'relative', height: '180px', background: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.65)), url(${dayCover})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', padding: '1.5rem 2rem' }}>
                    <div style={{ color: 'white' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--gold-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        Day {dayIdx + 1}
                      </span>
                      <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.6rem', color: 'white', fontFamily: 'var(--font-playfair), serif', fontWeight: 600 }}>
                        {getItineraryDate(dayIdx)}
                      </h3>
                    </div>
                  </div>

                  <div style={{ padding: '2rem' }}>
                    
                    {/* Day Details Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      
                      {/* Hotel for Day */}
                      {hotelRequired && dayIdx === 0 && (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', borderBottom: '1px solid #F0F4F8', paddingBottom: '1rem' }}>
                          <span style={{ fontSize: '1.25rem' }}>🏨</span>
                          <div>
                            <strong style={{ fontSize: '0.95rem', color: '#1A202C', display: 'block' }}>Base Hotel Accommodation:</strong>
                            <span style={{ fontSize: '0.85rem', color: '#4A5568' }}>
                              {customHotelEnabled
                                ? `${customHotelName || 'Custom Hotel'} — ${customHotelRoomType || 'Custom Room'} (${globalRoomCount} room(s))`
                                : `${hotelsList[globalHotelIndex]?.name} — ${hotelsList[globalHotelIndex]?.rooms[globalRoomIndex]?.type} (${globalRoomCount} room(s))`}
                            </span>
                          </div>
                        </div>
                      )}

                      {(() => {
                        const items: any[] = []
                        day.transfers.forEach(t => {
                          items.push({
                            time: t.time || '00:00',
                            icon: '🚗',
                            title: `Private Transfer (${vehiclesList[t.vehicleIndex]?.type})`,
                            desc: `${t.description || 'Ground transport transfer services'} ${t.qty && t.qty > 1 ? `x ${t.qty} vehicle(s)/hour(s)` : ''}`
                          })
                        })
                        day.attractions.forEach(a => {
                          const name = attractionsList[a.attractionIndex]?.name || 'Attraction'
                          if (a.hasTransfer) {
                            if (a.pickupEnabled !== false) {
                              const pvName = vehiclesList[a.pickupVehicleIndex ?? 0]?.type || 'Vehicle'
                              items.push({
                                time: a.pickupTime || '09:00',
                                icon: '🚗',
                                title: `Pickup Transfer (${pvName})`,
                                desc: a.pickupNotes || `Transport to ${name}`
                              })
                            }
                            if (a.dropEnabled !== false) {
                              const dvName = vehiclesList[a.dropVehicleIndex ?? 0]?.type || 'Vehicle'
                              items.push({
                                time: a.dropTime || '17:00',
                                icon: '🚗',
                                title: `Drop Transfer (${dvName})`,
                                desc: a.dropNotes || `Return transport from ${name}`
                              })
                            }
                          }
                          items.push({
                            time: a.time || '00:00',
                            icon: '🎟️',
                            title: `${name} Entry Pass`,
                            desc: `Adult Tickets: ${a.adultTickets} ${a.childTickets > 0 ? `| Child Tickets: ${a.childTickets}` : ''} ${a.description ? `(Note: ${a.description})` : ''}`
                          })
                        })
                        const cbMeals: string[] = []
                        if (day.breakfast) cbMeals.push('Breakfast')
                        if (day.lunch) cbMeals.push('Lunch')
                        if (day.dinner) cbMeals.push('Dinner')
                        if (cbMeals.length > 0) {
                          items.push({
                            time: '12:00',
                            icon: '🍽️',
                            title: `Meals Plan`,
                            desc: `Includes: ${cbMeals.join(', ')}`
                          })
                        }

                        if (day.meals && Array.isArray(day.meals)) {
                          day.meals.forEach(m => {
                            items.push({
                              time: m.time || '00:00',
                              icon: '🍽️',
                              title: `Meal Plan (${mealsList[m.mealIndex]?.type})`,
                              desc: m.description || 'Enjoy delicious multi-cuisine meals'
                            })
                          })
                        }
                        day.guides.forEach(g => {
                          items.push({
                            time: g.time || '00:00',
                            icon: '👤',
                            title: 'Escorted Guide Services',
                            desc: guidesList[g.guideIndex]?.type || 'Professional heritage guide/director'
                          })
                        })

                        items.sort((a, b) => a.time.localeCompare(b.time))

                        if (items.length === 0) {
                          return <div style={{ fontSize: '0.85rem', color: '#718096', fontStyle: 'italic' }}>Rest day / Free and easy itinerary TBD.</div>
                        }

                        return items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', borderBottom: idx === items.length - 1 ? 'none' : '1px solid #F0F4F8', paddingBottom: '0.75rem' }}>
                            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                            <div>
                              <strong style={{ fontSize: '0.9rem', color: '#2D3748', display: 'block' }}>
                                [{item.time}] {item.title}
                              </strong>
                              <span style={{ fontSize: '0.85rem', color: '#718096' }}>
                                {item.desc}
                              </span>
                            </div>
                          </div>
                        ))
                      })()}

                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Client Proposal Price Card */}
          <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', background: 'var(--bg-dark)', color: 'white', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--gold-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Itinerary Estimated Price Quote
            </span>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', margin: '1.5rem 0' }}>
              <div>
                <span style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '4px' }}>Per Adult Rate</span>
                <strong style={{ fontSize: '2.2rem', color: '#FFF' }}>S$ {costBreakdown.adultQuote.toLocaleString()}</strong>
              </div>
              {kids > 0 && (
                <div>
                  <span style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '4px' }}>Per Child Rate</span>
                  <strong style={{ fontSize: '2.2rem', color: '#FFF' }}>S$ {costBreakdown.childQuote.toLocaleString()}</strong>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Package Value:</span>
              <h2 style={{ fontSize: '2rem', margin: '0.25rem 0 0.75rem 0', color: 'var(--gold-accent)' }}>
                S$ {costBreakdown.totalClientPrice.toLocaleString()} <span style={{ fontSize: '1.2rem', color: '#FFF', fontWeight: 400 }}>(approx. ₹{costBreakdown.totalClientPriceINR.toLocaleString('en-IN')})</span>
              </h2>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '1.5rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                * Prices may vary based on surcharges / unforeseen events<br />
                * FIT room rates are subject to a marginal increase
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem 1.5rem', fontWeight: 700, background: '#F7FAFC', color: '#2D3748', border: '1px solid #E2E8F0', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  🗓️ Transport Schedule
                </button>
                <button 
                  onClick={downloadProposalPDF} 
                  className="btn btn-primary" 
                  style={{ padding: '0.75rem 1.5rem', fontWeight: 700, background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  📥 Download Visual PDF Brochure
                </button>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <>
        {/* ══ MOBILE PRICE FAB ══ */}
        <style>{`
          .cp-mobile-fab {
            display: none;
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 8000;
            background: linear-gradient(135deg, #0F4C3A 0%, #1a6b52 100%);
            color: white; padding: 0.85rem 1.25rem;
            align-items: center; justify-content: space-between; gap: 0.75rem;
            box-shadow: 0 -4px 24px rgba(0,0,0,0.25);
            border-top: 1px solid rgba(255,255,255,0.12);
            cursor: pointer; user-select: none;
          }
          .cp-price-drawer-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 9000;
            display: flex; flex-direction: column; justify-content: flex-end;
          }
          .cp-price-drawer {
            background: var(--bg-main); border-radius: 20px 20px 0 0;
            padding: 1.5rem 1.25rem 2rem; max-height: 88vh; overflow-y: auto;
            box-shadow: 0 -8px 40px rgba(0,0,0,0.2);
            animation: cp-slide-up 0.28s cubic-bezier(0.32,0.72,0,1);
          }
          @keyframes cp-slide-up {
            from { transform: translateY(100%); } to { transform: translateY(0); }
          }
          .cp-modal-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9500;
            display: flex; align-items: flex-end; justify-content: center;
          }
          .cp-modal {
            background: #FFF; border-radius: 20px 20px 0 0; width: 100%; max-height: 90vh;
            overflow-y: auto; padding: 1.5rem 1.25rem 2rem;
            animation: cp-slide-up 0.28s cubic-bezier(0.32,0.72,0,1);
          }
          .cp-modal-handle { width: 40px; height: 4px; background: #E2E8F0; border-radius: 2px; margin: 0 auto 1.25rem; }
          .cp-day-body {
            transition: max-height 0.3s ease, opacity 0.25s ease;
            overflow: hidden;
          }
          .cp-day-body.collapsed { max-height: 0 !important; opacity: 0; }
          .cp-agent-toolbar {
            display: flex; gap: 0.35rem; flex-wrap: nowrap; align-items: center; overflow-x: auto;
            padding: 0.55rem 0.85rem; background: #F8FAFC;
            border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 1.25rem;
          }
          .cp-tool-btn {
            display: inline-flex; align-items: center; gap: 0.25rem;
            padding: 0.35rem 0.65rem; border-radius: 5px; border: 1px solid #CBD5E1;
            background: #FFF; color: #2D3748; font-size: 0.76rem; font-weight: 700;
            cursor: pointer; white-space: nowrap; transition: all 0.15s; flex-shrink: 0;
          }
          .cp-tool-btn:hover { background: #EBF8F0; border-color: #0F4C3A; color: #0F4C3A; }
          .cp-tool-btn.whatsapp { background: #25D366; color: #FFF; border-color: #25D366; }
          .cp-tool-btn.whatsapp:hover { background: #1da851; }
          @media (max-width: 768px) {
            .cp-mobile-fab { display: flex; }
            .builder-layout { padding-bottom: 80px; }
            .cp-modal { border-radius: 20px 20px 0 0; }
          }
          @media (min-width: 769px) {
            .cp-modal-overlay { align-items: center; }
            .cp-modal { border-radius: 16px; width: 480px; max-width: 95vw; padding: 2rem; }
            .cp-modal-handle { display: none; }
          }
        `}</style>

        {/* Mobile Price FAB */}
        <div className="cp-mobile-fab" onClick={() => setPriceDrawerOpen(true)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', opacity: 0.75 }}>
                {adults}Ad{kids > 0 ? `+${kids}Ch` : ''} · {nightsCount}N
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>S$ {costBreakdown.totalClientPrice.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {costBreakdown.totalClientPriceINR > 0 && (
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>≈₹{costBreakdown.totalClientPriceINR.toLocaleString('en-IN')}</span>
            )}
            <span style={{ background: 'var(--gold-accent)', color: '#111', fontWeight: 700, fontSize: '0.75rem', padding: '0.4rem 0.9rem', borderRadius: '8px' }}>
              See Breakdown ↑
            </span>
          </div>
        </div>

        {/* Price Breakdown Drawer (mobile) */}
        {priceDrawerOpen && (
          <div className="cp-price-drawer-overlay" onClick={() => setPriceDrawerOpen(false)}>
            <div className="cp-price-drawer" onClick={e => e.stopPropagation()}>
              <div className="cp-modal-handle" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 1rem', fontFamily: 'var(--font-playfair), serif' }}>💰 Quotation Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.88rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                {hotelRequired && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.65 }}>Accommodation</span><span style={{ fontWeight: 600 }}>S$ {costBreakdown.hotelTotal.toLocaleString()}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.65 }}>Transfers</span><span style={{ fontWeight: 600 }}>S$ {costBreakdown.transportTotal.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.65 }}>Attractions</span><span style={{ fontWeight: 600 }}>S$ {costBreakdown.attractionTotal.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.65 }}>Meals</span><span style={{ fontWeight: 600 }}>S$ {costBreakdown.mealTotal.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.65 }}>Guides</span><span style={{ fontWeight: 600 }}>S$ {costBreakdown.guideTotal.toLocaleString()}</span></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <span>Net Cost</span><span>S$ {costBreakdown.netCost.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', opacity: 0.7, marginBottom: '1rem' }}>
                <span>Per Adult / Child</span><span>S${costBreakdown.adultQuote}{kids > 0 ? ` / S$${costBreakdown.childQuote}` : ''}</span>
              </div>
              <div style={{ background: '#0F4C3A', color: 'white', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>TOTAL CLIENT PRICE</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>S$ {costBreakdown.totalClientPrice.toLocaleString()}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--gold-accent)' }}>≈₹{costBreakdown.totalClientPriceINR.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.78rem', opacity: 0.8 }}>
                  <div>{adults}Ad{kids > 0 ? `+${kids}Ch` : ''}</div>
                  <div>{nightsCount}N / {nightsCount + 1}D</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={() => handleCopyProposalText(true)} className="cp-tool-btn" style={{ justifyContent: 'center', padding: '0.65rem 0.5rem' }}>📋 Copy</button>
                <button onClick={() => { downloadProposalPDF(); setPriceDrawerOpen(false) }} className="cp-tool-btn" style={{ justifyContent: 'center', padding: '0.65rem 0.5rem' }}>📄 PDF</button>
                <button onClick={() => { sendOnWhatsApp(); setPriceDrawerOpen(false) }} className="cp-tool-btn whatsapp" style={{ justifyContent: 'center', padding: '0.65rem 0.5rem' }}>💬 WA</button>
              </div>
            </div>
          </div>
        )}

        {/* Branding Modal */}
        {showBranding && (
          <div className="cp-modal-overlay" onClick={() => setShowBranding(false)}>
            <div className="cp-modal" onClick={e => e.stopPropagation()}>
              <div className="cp-modal-handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--emerald-secondary)' }}>📁 White-Label Branding</h3>
                <button onClick={() => setShowBranding(false)} style={{ border: 'none', background: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#718096' }}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: '#4A5568' }}>Agency Name</label><input type="text" value={customAgencyName} onChange={e => setCustomAgencyName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: '#4A5568' }}>Agency Email</label><input type="email" value={customAgencyEmail} onChange={e => setCustomAgencyEmail(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: '#4A5568' }}>Agency Phone</label><input type="text" value={customAgencyPhone} onChange={e => setCustomAgencyPhone(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }} /></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="hideNetPricingModal" checked={hideNetPricing} onChange={e => setHideNetPricing(e.target.checked)} style={{ cursor: 'pointer', width: '1rem', height: '1rem' }} />
                  <label htmlFor="hideNetPricingModal" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#4A5568', cursor: 'pointer' }}>Hide B2B Net Cost in PDF</label>
                </div>
                <button onClick={() => setShowBranding(false)} className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.65rem', fontWeight: 700 }}>✓ Save Branding</button>
              </div>
            </div>
          </div>
        )}

        {/* Enquiry Modal */}
        {showEnquiry && (
          <div className="cp-modal-overlay" onClick={() => setShowEnquiry(false)}>
            <div className="cp-modal" onClick={e => e.stopPropagation()}>
              <div className="cp-modal-handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--emerald-secondary)' }}>📧 Send B2B Enquiry</h3>
                <button onClick={() => setShowEnquiry(false)} style={{ border: 'none', background: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#718096' }}>✕</button>
              </div>
              {enquiryStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                  <p style={{ fontWeight: 700, color: 'var(--emerald-secondary)' }}>Enquiry Sent!</p>
                  <button onClick={() => { handleWhatsAppEnquiry(); setShowEnquiry(false) }} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', background: '#25D366', border: 'none', padding: '0.65rem', fontWeight: 700 }}>Notify via WhatsApp 💬</button>
                </div>
              ) : (
                <form onSubmit={handleSendEnquiry} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input type="text" required placeholder="Agent / Contact Name *" value={agentName} onChange={e => setAgentName(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }} />
                  <input type="email" required placeholder="Email Address *" value={agentEmail} onChange={e => setAgentEmail(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }} />
                  <input type="tel" required placeholder="Phone / WhatsApp Number *" value={agentPhone} onChange={e => setAgentPhone(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }} />
                  <textarea placeholder="Queries or custom requests..." rows={3} value={agentQuery} onChange={e => setAgentQuery(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical' }} />
                  {enquiryStatus === 'error' && <p style={{ color: 'red', fontSize: '0.75rem', margin: 0 }}>⚠️ Error. Try again or use WhatsApp.</p>}
                  <button type="submit" className="btn btn-primary" disabled={enquiryStatus === 'submitting'} style={{ padding: '0.7rem', fontWeight: 700 }}>{enquiryStatus === 'submitting' ? 'Sending...' : 'Send Enquiry ✉️'}</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ══ COMPACT AGENT TOOLS BAR ══ */}
        <div className="cp-agent-toolbar">
          <Link href="/agent-portal" className="cp-tool-btn" style={{ background: '#0F4C3A', color: '#FFF', border: 'none', fontWeight: 800, padding: '0.4rem 0.75rem' }}>
            🏠 Home Dashboard
          </Link>
          <button className="cp-tool-btn" onClick={() => { setShowQuotationsModal(true); handleLoadQuotations(); }} style={{ background: '#EBF8FF', border: '1px solid #BEE3F8', color: '#2B6CB0' }}>🗄️ View Proposals</button>
          <button className="cp-tool-btn" onClick={() => handleCopyProposalText(false)}>📋 Copy Proposal</button>
          <button className="cp-tool-btn" onClick={downloadProposalPDF}>📄 PDF</button>
          <button className="cp-tool-btn whatsapp" onClick={sendOnWhatsApp}>💬 WhatsApp</button>
          <button className="cp-tool-btn" onClick={handleSaveProposal} style={{ background: '#FAF5FF', border: '1px solid #D6BCFA', color: '#6B46C1' }}>
            💾 {saveStatus === 'saving' ? 'Saving...' : (savedProposalNum ? 'Update Proposal' : 'Save Proposal')}
          </button>
          {savedProposalNum && (
            <button className="cp-tool-btn" onClick={handleSaveAsProposal} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8' }} title="Save as a new proposal copy">
              📋 Save As New
            </button>
          )}
          {activeAgent?.email?.toLowerCase() === 'info.flyingwonders@gmail.com' && savedProposalNum && (
            <button 
              className="cp-tool-btn" 
              onClick={() => setShowLedgerModal(true)} 
              style={{ 
                background: activeProposalStatus === 'confirmed' ? '#DCFCE7' : '#FEF3C7', 
                border: `1px solid ${activeProposalStatus === 'confirmed' ? '#86EFAC' : '#FCD34D'}`, 
                color: activeProposalStatus === 'confirmed' ? '#166534' : '#92400E', 
                fontWeight: 800 
              }}
            >
              💳 Ledger {activeInvoiceNumber ? `(${activeInvoiceNumber})` : ''}
            </button>
          )}
          {savedProposalNum && (
            <span style={{ fontSize: '0.75rem', background: '#EBF8FF', color: '#2B6CB0', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #BEE3F8', flexShrink: 0 }}>
              Num: {savedProposalNum}
            </span>
          )}
          <button className="cp-tool-btn" onClick={() => setShowEnquiry(true)}>📧 Enquiry</button>
        </div>

        {/* View Quotations / Proposals Listing Modal */}
        {showQuotationsModal && (
          <div className="cp-modal-overlay" onClick={() => setShowQuotationsModal(false)}>
            <div className="cp-modal" onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '95vw', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--emerald-secondary)' }}>🗄️ Saved Proposals Registry</h3>
                <button onClick={() => setShowQuotationsModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#718096' }}>✕</button>
              </div>

              {loadingQuotations ? (
                <p style={{ textAlign: 'center', fontSize: '0.9rem', opacity: 0.6 }}>Loading saved records...</p>
              ) : (
                <>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <input 
                      type="text"
                      placeholder="🔍 Search by Guest Name, Arrival Date, or Proposal Number..."
                      value={registrySearchQuery}
                      onChange={e => setRegistrySearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem' }}
                    />
                  </div>

                  {(() => {
                    const filtered = quotationsList.filter(q => {
                      const query = registrySearchQuery.toLowerCase().trim()
                      if (!query) return true
                      return (
                        (q.guestName || '').toLowerCase().includes(query) ||
                        (q.guestPhone || '').toLowerCase().includes(query) ||
                        (q.arrivalDate || '').toLowerCase().includes(query) ||
                        (q.proposalNumber || '').toLowerCase().includes(query)
                      )
                    })

                    if (filtered.length === 0) {
                      return <p style={{ textAlign: 'center', fontSize: '0.9rem', opacity: 0.6 }}>No matching proposals found.</p>
                    }

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filtered.map((q, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              setSearchQuery(q.proposalNumber);
                              setShowQuotationsModal(false);
                              loadProposalByNumber(q.proposalNumber);
                            }}
                            style={{ 
                              background: '#F8FAFC', 
                              border: '1px solid #E2E8F0', 
                              borderRadius: '8px', 
                              padding: '1rem', 
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                              textAlign: 'left'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#EDF2F7'}
                            onMouseOut={e => e.currentTarget.style.background = '#F8FAFC'}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                              <span style={{ color: 'var(--emerald-secondary)' }}>{q.proposalNumber}</span>
                              <span>S$ {q.totalClientPrice?.toLocaleString()}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#4A5568', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                              <span>👤 Guest: <strong>{q.guestName || 'TBD'}</strong> {q.guestPhone ? `(${q.guestPhone})` : ''}</span>
                              <span>📅 Date: {q.arrivalDate || 'TBD'}</span>
                              <span>🌙 Nights: {q.nights}N</span>
                            </div>
                            {activeAgent?.email?.toLowerCase() === 'info.flyingwonders@gmail.com' && q.agent && (
                              <div style={{ fontSize: '0.72rem', opacity: 0.6, borderTop: '1px dashed #E2E8F0', paddingTop: '0.35rem', marginTop: '0.35rem' }}>
                                🏢 Agent: {q.agent.agentName} ({q.agent.companyName})
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </>
              )}
            </div>
          </div>
        )}

        {/* Floating Preview Overlay */}
        {showPreviewOverlay && (
          <div className="cp-modal-overlay" style={{ background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div className="cp-modal" style={{ width: '850px', maxWidth: '95vw', height: '90vh', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '1.5rem', background: '#FFF', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1rem', flexShrink: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald-secondary)' }}>🔍 Proposal Summary & Preview</h3>
                <button onClick={() => setShowPreviewOverlay(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#718096' }}>✕</button>
              </div>

              {/* Consolidated proposal text block */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '0.25rem 0' }}>
                <pre style={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: '#2D3748',
                  background: '#F8FAFC',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  {generateProposalText()}
                </pre>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginTop: '1rem', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setShowPreviewOverlay(false)}
                  className="btn"
                  style={{ padding: '0.55rem 1.25rem', border: '1px solid #CBD5E1', color: '#4A5568', fontWeight: 700, cursor: 'pointer', background: '#FFF', borderRadius: '6px' }}
                >
                  ✕ Close Preview
                </button>
                <button
                  type="button"
                  disabled={saveStatus === 'saving'}
                  onClick={async () => {
                    await handleSaveProposal();
                    setShowPreviewOverlay(false);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.75rem', fontWeight: 700, background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', border: 'none', color: '#FFF', cursor: 'pointer', borderRadius: '6px' }}
                >
                  {saveStatus === 'saving' ? 'Saving...' : '💾 Save Proposal to Registry'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 💳 ADMIN FINANCIAL LEDGER & INVOICING MODAL */}
        {showLedgerModal && (
          <div className="cp-modal-overlay" onClick={() => setShowLedgerModal(false)} style={{ zIndex: 99999 }}>
            <div className="cp-modal" onClick={e => e.stopPropagation()} style={{ width: '840px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', background: '#FFF', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
              
              {/* Modal Title & Close Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    💳 Admin Financial Ledger & Invoicing
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    Proposal Ref: <strong>{savedProposalNum}</strong> {activeInvoiceNumber ? `• Tax Invoice: ${activeInvoiceNumber}` : ''}
                  </span>
                </div>
                <button onClick={() => setShowLedgerModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#718096' }}>✕</button>
              </div>

              {(() => {
                const totalAddons = activeAdditionalCharges.reduce((sum, c) => {
                  const amt = Number(c.amount) || 0
                  return (c.chargeType === 'Discount' || c.chargeType === 'Refund') ? sum - amt : sum + amt
                }, 0)
                const basePrice = costBreakdown.totalClientPrice || 0
                const adjustedPrice = basePrice + totalAddons
                const totalPaid = activePaymentLedger.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
                const balanceDue = adjustedPrice - totalPaid

                let statusBadge = { label: '🔴 Unpaid (100% Due)', bg: '#FEE2E2', color: '#991B1B' }
                if (totalPaid >= adjustedPrice && adjustedPrice > 0) {
                  statusBadge = { label: '🟢 Fully Settled', bg: '#DCFCE7', color: '#166534' }
                } else if (totalPaid > 0) {
                  statusBadge = { label: `🟡 Partially Paid (S$ ${totalPaid.toLocaleString()} paid)`, bg: '#FEF3C7', color: '#92400E' }
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* 1. FINANCIAL SUMMARY BANNER & STATUS */}
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'flex-start' }}>
                        
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Package Status</span>
                          <select 
                            value={activeProposalStatus} 
                            onChange={e => handleUpdateStatus(e.target.value)}
                            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: 800, background: '#FFF', cursor: 'pointer' }}
                          >
                            <option value="pending">🔵 Pending (Quotation)</option>
                            <option value="followup">🟡 Follow-Up Needed</option>
                            <option value="confirmed">🟢 Confirmed (Issue Invoice)</option>
                            <option value="scheduled">💜 Scheduled (Post-Confirm)</option>
                            <option value="completed">✅ Completed (Trip Finished)</option>
                            <option value="ignore">⚪ Ignored / Closed</option>
                          </select>
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Contract Value</span>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E293B', marginTop: '0.2rem', whiteSpace: 'nowrap' }}>
                            S$ {adjustedPrice.toLocaleString()}
                          </div>
                          {totalAddons !== 0 && (
                            <span style={{ fontSize: '0.7rem', color: totalAddons > 0 ? '#15803D' : '#B91C1C', display: 'block', whiteSpace: 'nowrap' }}>
                              Base: S$ {basePrice.toLocaleString()} ({totalAddons > 0 ? `+S$${totalAddons}` : `-S$${Math.abs(totalAddons)}`})
                            </span>
                          )}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Total Paid</span>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#166534', marginTop: '0.2rem', whiteSpace: 'nowrap' }}>
                            S$ {totalPaid.toLocaleString()}
                          </div>
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Balance Due</span>
                          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: balanceDue > 0 ? '#991B1B' : '#166534', marginTop: '0.2rem', whiteSpace: 'nowrap' }}>
                            S$ {balanceDue.toLocaleString()}
                          </div>
                        </div>

                      </div>

                      {/* Payment Status Badge */}
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px dashed #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, background: statusBadge.bg, color: statusBadge.color }}>
                          {statusBadge.label}
                        </span>
                        <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                          Guest: <strong>{guestName || 'Valued Guest'}</strong> {guestPhone ? `(${guestPhone})` : ''}
                        </div>
                      </div>
                    </div>

                    {/* 2. PAYMENT COLLECTION LEDGER TABLE & RECORD FORM */}
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', background: '#FFF' }}>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        💳 Payment Collection Ledger ({activePaymentLedger.length})
                      </h4>

                      {/* Payment List Table */}
                      {activePaymentLedger.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic', marginBottom: '1.25rem' }}>No payments recorded yet.</p>
                      ) : (
                        <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ background: '#F1F5F9', color: '#475569' }}>
                                <th style={{ padding: '0.5rem 0.75rem' }}>Date</th>
                                <th style={{ padding: '0.5rem 0.75rem' }}>Method</th>
                                <th style={{ padding: '0.5rem 0.75rem' }}>Ref / UTR No.</th>
                                <th style={{ padding: '0.5rem 0.75rem' }}>Amount (S$)</th>
                                <th style={{ padding: '0.5rem 0.75rem' }}>Notes</th>
                                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activePaymentLedger.map((p, idx) => (
                                <tr key={p.paymentId || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                  <td style={{ padding: '0.55rem 0.75rem', color: '#334155' }}>{new Date(p.date).toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#0F4C3A' }}>{p.method}</td>
                                  <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'monospace', color: '#1E293B' }}>{p.referenceNo || '—'}</td>
                                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 800, color: '#166534' }}>+S$ {Number(p.amount).toLocaleString()}</td>
                                  <td style={{ padding: '0.55rem 0.75rem', color: '#64748B' }}>{p.notes || '—'}</td>
                                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                                    <button onClick={() => handleDeletePayment(p.paymentId)} style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                                      🗑️ Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Add Payment Form */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#1E293B', display: 'block', marginBottom: '0.65rem' }}>+ Record New Payment Entry</strong>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: '0.2rem' }}>Amount Paid (S$) *</label>
                            <input 
                              type="number" 
                              placeholder="e.g. 500" 
                              value={ledgerPaymentAmount} 
                              onChange={e => setLedgerPaymentAmount(e.target.value)} 
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }} 
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: '0.2rem' }}>Payment Method</label>
                            <select 
                              value={ledgerPaymentMethod} 
                              onChange={e => setLedgerPaymentMethod(e.target.value)}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                            >
                              <option value="Bank Transfer (PayNow/Wire)">Bank Transfer (PayNow / Wire)</option>
                              <option value="Cash / Forex">Cash / Forex</option>
                              <option value="Credit Note / Adjustment">Credit Note / Adjustment</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: '0.2rem' }}>Ref / UTR / Txn No.</label>
                            <input 
                              type="text" 
                              placeholder="e.g. UTR99881122" 
                              value={ledgerPaymentRef} 
                              onChange={e => setLedgerPaymentRef(e.target.value)} 
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }} 
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: '0.2rem' }}>Notes</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Advance deposit" 
                              value={ledgerPaymentNotes} 
                              onChange={e => setLedgerPaymentNotes(e.target.value)} 
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }} 
                            />
                          </div>
                        </div>

                        <button 
                          type="button" 
                          disabled={ledgerSubmitting}
                          onClick={handleAddPayment}
                          style={{ padding: '0.55rem 1.25rem', background: '#0F4C3A', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: ledgerSubmitting ? 'not-allowed' : 'pointer' }}
                        >
                          {ledgerSubmitting ? 'Recording...' : 'Record Payment Entry 💵'}
                        </button>
                      </div>

                    </div>

                    {/* 3. POST-CONFIRMATION CHANGE ORDERS & ADD-ONS */}
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', background: '#FFF' }}>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📝 Post-Confirmation Change Orders & Add-Ons ({activeAdditionalCharges.length})
                      </h4>

                      {/* Additional Charges List */}
                      {activeAdditionalCharges.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic', marginBottom: '1.25rem' }}>No change orders or add-ons added after confirmation.</p>
                      ) : (
                        <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ background: '#F1F5F9', color: '#475569' }}>
                                <th style={{ padding: '0.5rem 0.75rem' }}>Date</th>
                                <th style={{ padding: '0.5rem 0.75rem' }}>Description</th>
                                <th style={{ padding: '0.5rem 0.75rem' }}>Type</th>
                                <th style={{ padding: '0.5rem 0.75rem' }}>Amount (S$)</th>
                                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeAdditionalCharges.map((c, idx) => {
                                const isNeg = c.chargeType === 'Discount' || c.chargeType === 'Refund'
                                return (
                                  <tr key={c.chargeId || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '0.55rem 0.75rem', color: '#334155' }}>{new Date(c.date).toLocaleDateString('en-SG', { day: '2-digit', month: 'short' })}</td>
                                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#1E293B' }}>{c.itemDescription}</td>
                                    <td style={{ padding: '0.55rem 0.75rem' }}>
                                      <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', background: isNeg ? '#FEE2E2' : '#E0E7FF', color: isNeg ? '#991B1B' : '#3730A3', fontWeight: 700, fontSize: '0.72rem' }}>
                                        {c.chargeType}
                                      </span>
                                    </td>
                                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: 800, color: isNeg ? '#DC2626' : '#15803D' }}>
                                      {isNeg ? `-S$ ${Number(c.amount).toLocaleString()}` : `+S$ ${Number(c.amount).toLocaleString()}`}
                                    </td>
                                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                                      <button onClick={() => handleDeleteCharge(c.chargeId)} style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                                        🗑️ Delete
                                      </button>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Add Charge Form */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#1E293B', display: 'block', marginBottom: '0.65rem' }}>+ Add Extra Charge / Activity / Discount</strong>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: '0.2rem' }}>Item / Service Description *</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Added 2x Night Safari tickets on Day 3" 
                              value={ledgerChargeDesc} 
                              onChange={e => setLedgerChargeDesc(e.target.value)} 
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }} 
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: '0.2rem' }}>Amount (S$) *</label>
                            <input 
                              type="number" 
                              placeholder="e.g. 120" 
                              value={ledgerChargeAmount} 
                              onChange={e => setLedgerChargeAmount(e.target.value)} 
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }} 
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: '0.2rem' }}>Type</label>
                            <select 
                              value={ledgerChargeType} 
                              onChange={e => setLedgerChargeType(e.target.value)}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                            >
                              <option value="Add-On">Add-On Activity</option>
                              <option value="Surcharge">Midnight / Peak Surcharge</option>
                              <option value="Discount">Discount / Waiver (-)</option>
                              <option value="Refund">Refund (-)</option>
                            </select>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          disabled={ledgerSubmitting}
                          onClick={handleAddCharge}
                          style={{ padding: '0.55rem 1.25rem', background: '#1A365D', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: ledgerSubmitting ? 'not-allowed' : 'pointer' }}
                        >
                          {ledgerSubmitting ? 'Adding...' : 'Add Charge Order 📝'}
                        </button>
                      </div>

                    </div>

                  </div>
                )
              })()}

            </div>
          </div>
        )}

        <div className="builder-layout">
        
        {/* Left: Input parameters & Day-Wise Itinerary Options */}
        <div>
          {/* Active Template Banner */}
          {activeTemplateName && (
            <div style={{ background: '#FAF5FF', border: '1.5px solid #D6BCFA', borderRadius: '12px', padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(107, 70, 193, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ background: '#6B46C1', color: '#FFF', fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px', textTransform: 'uppercase' }}>
                  Template Active
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4C1D95' }}>
                  📦 {activeTemplateName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTemplateName(null)}
                style={{ background: 'transparent', border: 'none', color: '#6B46C1', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Unlink Template
              </button>
            </div>
          )}

          {/* Duplicate Attraction Alert Banner */}
          {duplicateAttractions.length > 0 && (
            <div style={{ background: '#FFFBEB', border: '1.5px solid #F59E0B', borderRadius: '12px', padding: '0.95rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', boxShadow: '0 3px 12px rgba(245,158,11,0.12)' }}>
              <AlertTriangle color="#D97706" size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', color: '#92400E', lineHeight: 1.5 }}>
                <strong style={{ fontSize: '0.9rem', color: '#B45309', display: 'block', marginBottom: '0.25rem' }}>
                  ⚠️ Duplicate Attraction Alert:
                </strong>
                The following attraction tickets are selected on multiple days. Please review to avoid duplicate ticketing:
                <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {duplicateAttractions.map((dup, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#FEF3C7', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #FDE68A', fontWeight: 700, color: '#B45309', fontSize: '0.78rem' }}>
                      🎟️ <strong>{dup.name}</strong> — selected on Day(s) <strong>{dup.days.join(', ')}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* General Inputs Panel (Global Hotel Selection) */}
          <div className="glass" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem', background: '#FFF', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
              <h3 style={{ color: 'var(--emerald-secondary)', fontFamily: 'var(--font-playfair), serif', fontSize: '1.2rem', margin: 0 }}>
                Choose Details
              </h3>
              {sheetLoading ? (
                <span style={{ fontSize: '0.75rem', background: 'var(--gold-accent)', color: '#111', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>
                  Syncing with Google Sheets...
                </span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.55rem', color: '#94A3B8', opacity: 0.45 }}>
                    ● Sheets Sync Active
                  </span>
                  <span title={`Live SGD to INR rate. Refreshes every 12 hours.`} style={{ fontSize: '0.7rem', background: rateLoaded ? '#EBF8F0' : '#F7FAFC', color: rateLoaded ? '#276749' : '#718096', border: `1px solid ${rateLoaded ? '#C6F6D5' : '#E2E8F0'}`, padding: '0.15rem 0.55rem', borderRadius: '4px', fontWeight: 700, cursor: 'default', letterSpacing: '0.02em' }}>
                    {rateLoaded ? `S$1 = ₹${sgdToInrRate.toFixed(2)}` : 'Loading rate...'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Partner Agency Attribution (Admin or Agent) */}
            {activeAgent?.email?.toLowerCase() === 'info.flyingwonders@gmail.com' ? (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🏢</span>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Partner Agency Attribution
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#15803D' }}>
                      Assign this package quote to an agent's account & ledger.
                    </div>
                  </div>
                </div>
                <div style={{ minWidth: '260px', flex: '1 1 260px' }}>
                  <select
                    value={selectedAgentId}
                    onChange={e => handleAdminAgentChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #86EFAC',
                      background: '#FFF',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#14532D',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="direct">🏢 Direct / In-House (Flying Wonders)</option>
                    {b2bAgentsList.map((a: any) => (
                      <option key={a._id} value={a._id}>
                        {a.companyName || a.agentName} — {a.agentName} ({a.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              activeAgent && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.5rem 0.85rem', marginBottom: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.95rem' }}>🏢</span>
                    <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                      Partner Agency: <strong style={{ color: '#0F4C3A' }}>{activeAgent.companyName || 'Registered Agency'}</strong> ({activeAgent.agentName || 'Agent'})
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#DCFCE7', color: '#166534', padding: '0.15rem 0.55rem', borderRadius: '12px' }}>
                    ✓ Auto-Linked to Agency Ledger
                  </span>
                </div>
              )
            )}

            {/* Row 1: Traveler details */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>Guest Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ramesh Kumar"
                  value={guestName} 
                  onChange={e => setGuestName(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.82rem' }}
                />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>Guest Contact</label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 9876543210"
                  value={guestPhone} 
                  onChange={e => setGuestPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.82rem' }}
                />
              </div>
              <div style={{ width: '85px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>Adults</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', overflow: 'hidden' }}>
                  <button 
                    type="button" 
                    onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                    style={{ border: 'none', background: 'transparent', padding: '0.5rem 0.35rem', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', color: '#4A5568' }}
                  >
                    −
                  </button>
                  <input 
                    type="number" min="1" max="100" 
                    value={adults} 
                    onChange={e => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ flex: 1, width: '100%', border: 'none', background: 'transparent', textAlign: 'center', padding: '0.5rem 0', fontWeight: 700, fontSize: '0.82rem', outline: 'none' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setAdults(prev => Math.min(100, prev + 1))}
                    style={{ border: 'none', background: 'transparent', padding: '0.5rem 0.35rem', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', color: '#4A5568' }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ width: '85px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>Children</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', overflow: 'hidden' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      const newKids = Math.max(0, kids - 1)
                      setKids(newKids)
                      setChildAges(prev => prev.slice(0, newKids))
                    }}
                    style={{ border: 'none', background: 'transparent', padding: '0.5rem 0.35rem', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', color: '#4A5568' }}
                  >
                    −
                  </button>
                  <input 
                    type="number" min="0" max="100" 
                    value={kids} 
                    onChange={e => {
                      const newKids = Math.max(0, parseInt(e.target.value) || 0)
                      setKids(newKids)
                      setChildAges(prev => {
                        const next = [...prev]
                        if (newKids > next.length) {
                          for (let i = next.length; i < newKids; i++) next.push(5)
                        } else {
                          next.length = newKids
                        }
                        return next
                      })
                    }}
                    style={{ flex: 1, width: '100%', border: 'none', background: 'transparent', textAlign: 'center', padding: '0.5rem 0', fontWeight: 700, fontSize: '0.82rem', outline: 'none' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const newKids = Math.min(100, kids + 1)
                      setKids(newKids)
                      setChildAges(prev => {
                        const next = [...prev]
                        if (newKids > next.length) {
                          for (let i = next.length; i < newKids; i++) next.push(5)
                        }
                        return next
                      })
                    }}
                    style={{ border: 'none', background: 'transparent', padding: '0.5rem 0.35rem', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', color: '#4A5568' }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ width: '85px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>Nights</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', overflow: 'hidden' }}>
                  <button 
                    type="button" 
                    onClick={() => setNightsCount(prev => Math.max(1, prev - 1))}
                    style={{ border: 'none', background: 'transparent', padding: '0.5rem 0.35rem', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', color: '#4A5568' }}
                  >
                    −
                  </button>
                  <input 
                    type="number" min="1" max="30" 
                    value={nightsCount} 
                    onChange={e => setNightsCount(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                    style={{ flex: 1, width: '100%', border: 'none', background: 'transparent', textAlign: 'center', padding: '0.5rem 0', fontWeight: 700, fontSize: '0.82rem', outline: 'none' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setNightsCount(prev => Math.min(30, prev + 1))}
                    style={{ border: 'none', background: 'transparent', padding: '0.5rem 0.35rem', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', color: '#4A5568' }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>Checkin Date</label>
                <input 
                  type="date"
                  min={minCheckinDate}
                  value={arrivalDate} 
                  onChange={e => setArrivalDate(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.82rem', background: '#F8FAFC' }}
                />
              </div>
              <div style={{ flex: '1 1 110px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }} title="e.g. Visas, Water bottle, Extra items per person">Misc Cost / Pax (S$)</label>
                <input 
                  type="number" min="0" placeholder="e.g. 25"
                  value={miscCostPerPerson || ''} 
                  onChange={e => setMiscCostPerPerson(Math.max(0, parseFloat(e.target.value) || 0))}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.82rem', background: '#F8FAFC' }}
                />
              </div>
              <div style={{ flex: '1.5 1 150px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>Misc Notes</label>
                <input 
                  type="text" placeholder="e.g. Visas, Water bottle"
                  value={miscNotes} 
                  onChange={e => setMiscNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.82rem', background: '#F8FAFC' }}
                />
              </div>
            </div>

            {/* Child Ages Dropdowns */}
            {kids > 0 && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', alignItems: 'center', background: '#FFF5F5', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid #FEB2B2' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#C53030', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  👶 Child Age{kids > 1 ? 's' : ''}:
                </span>
                {Array.from({ length: kids }).map((_, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
                    <span style={{ color: '#4A5568', fontWeight: 600 }}>Child {idx + 1}:</span>
                    <select
                      value={childAges[idx] ?? 5}
                      onChange={e => {
                        const age = parseInt(e.target.value)
                        setChildAges(prev => {
                          const updated = [...prev]
                          updated[idx] = age
                          return updated
                        })
                      }}
                      style={{ padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.78rem', background: '#FFF', fontWeight: 600 }}
                    >
                      {Array.from({ length: 17 }, (_, a) => a + 1).map(age => (
                        <option key={age} value={age}>{age} yrs</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Row 2: Hotel */}
            <div style={{ background: '#F0F7FF', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #3182CE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ color: '#2B6CB0', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>🏨 Hotel Accommodation</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4A5568' }}>Custom Pricing?</span>
                    <input 
                      type="checkbox" 
                      checked={customHotelEnabled} 
                      onChange={e => setCustomHotelEnabled(e.target.checked)}
                      style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4A5568' }}>Required?</span>
                    <input 
                      type="checkbox" 
                      checked={hotelRequired} 
                      onChange={e => setHotelRequired(e.target.checked)}
                      style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                    />
                  </div>
                  {hotelRequired && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4A5568' }}>Supplement?</span>
                      <input 
                        type="checkbox" 
                        checked={supplementRequired} 
                        onChange={e => {
                          setSupplementRequired(e.target.checked)
                          if (!e.target.checked) {
                            setGlobalSuppCount(0)
                            setGlobalSuppIndex(-1)
                            setCustomHotelSuppCost(0)
                            setCustomHotelSuppName('')
                          }
                        }}
                        style={{ width: '1.15rem', height: '1.15rem', cursor: 'pointer' }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {hotelRequired ? (
                customHotelEnabled ? (
                  <>
                    <div className="hotel-grid">
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Custom Hotel Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Marina Bay Sands"
                          value={customHotelName}
                          onChange={e => setCustomHotelName(e.target.value)}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', background: '#FFF' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Custom Room Type</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Deluxe Room"
                          value={customHotelRoomType}
                          onChange={e => setCustomHotelRoomType(e.target.value)}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', background: '#FFF' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Price / Room / Night (S$)</label>
                        <input 
                          type="number" min="0"
                          placeholder="0"
                          value={customHotelPrice || ''}
                          onChange={e => setCustomHotelPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', background: '#FFF' }}
                        />
                      </div>
                    </div>

                     <div className="hotel-grid" style={{ marginTop: '0.75rem' }}>
                       <div>
                         <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Room Qty</label>
                         <input 
                           type="number" min="1" max="50"
                           value={globalRoomCount}
                           onChange={e => setGlobalRoomCount(Math.max(1, parseInt(e.target.value) || 1))}
                           style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', background: '#FFF' }}
                         />
                       </div>
                     </div>

                     {supplementRequired && (
                       <div className="hotel-grid" style={{ marginTop: '1rem', borderTop: '1px dashed #BEE3F8', paddingTop: '1rem' }}>
                         <div>
                           <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Custom Supp Description</label>
                           <input 
                             type="text" 
                             placeholder="e.g. Extra Bed"
                             value={customHotelSuppName}
                             onChange={e => setCustomHotelSuppName(e.target.value)}
                             style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', background: '#FFF' }}
                           />
                         </div>
                         <div>
                           <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Supp Cost / Night (S$)</label>
                           <input 
                             type="number" min="0"
                             placeholder="0"
                             value={customHotelSuppCost || ''}
                             onChange={e => setCustomHotelSuppCost(Math.max(0, parseFloat(e.target.value) || 0))}
                             style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', background: '#FFF' }}
                           />
                         </div>
                         <div>
                           <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Supplement Qty</label>
                           <input 
                             type="number" min="0" max="50"
                             value={globalSuppCount}
                             onChange={e => setGlobalSuppCount(Math.max(0, parseInt(e.target.value) || 0))}
                             style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', background: '#FFF' }}
                           />
                         </div>
                       </div>
                     )}
                  </>
                ) : (
                  <>
                    <div className="hotel-grid">
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Select Hotel</label>
                        <select 
                          value={globalHotelIndex} 
                          onChange={e => {
                            setGlobalHotelIndex(parseInt(e.target.value))
                            setGlobalRoomIndex(0)
                            setGlobalSuppIndex(-1)
                            setGlobalSuppCount(0)
                          }}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFF' }}
                        >
                          {hotelsList.map((h, idx) => (
                            <option key={idx} value={idx}>{h.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Select Room Type</label>
                        <select 
                          value={globalRoomIndex} 
                          onChange={e => setGlobalRoomIndex(parseInt(e.target.value))}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFF' }}
                        >
                          {hotelsList[globalHotelIndex]?.rooms?.map((r, idx) => (
                            <option key={idx} value={idx}>{r.type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Rooms</label>
                        <input 
                          type="number" min="1" max="50"
                          value={globalRoomCount}
                          onChange={e => setGlobalRoomCount(Math.max(1, parseInt(e.target.value) || 1))}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }}
                        />
                      </div>
                    </div>

                    {/* Supplementary room cost input row */}
                    {supplementRequired && (
                      <div className="hotel-grid" style={{ marginTop: '1rem', borderTop: '1px dashed #BEE3F8', paddingTop: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Select Supplement / Surcharge</label>
                          <select 
                            value={globalSuppIndex} 
                            onChange={e => {
                              const idx = parseInt(e.target.value)
                              setGlobalSuppIndex(idx)
                              if (idx >= 0 && globalSuppCount === 0) {
                                setGlobalSuppCount(1)
                              } else if (idx === -1) {
                                setGlobalSuppCount(0)
                              }
                            }}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFF' }}
                          >
                            <option value={-1}>None</option>
                            {hotelsList[globalHotelIndex]?.rooms?.map((r, idx) => (
                              <option key={idx} value={idx}>{r.type}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Supplement Qty</label>
                          <input 
                            type="number" min="0" max="50"
                            value={globalSuppCount}
                            onChange={e => setGlobalSuppCount(Math.max(0, parseInt(e.target.value) || 0))}
                            style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px dashed #BEE3F8', padding: '1rem', borderRadius: '8px', textAlign: 'center', fontSize: '0.85rem', color: '#718096' }}>
                  Hotel accommodation is excluded from this package. Net cost is adjusted automatically.
                </div>
              )}
            </div>

          </div>

          {/* Day Wise Itinerary Options */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: '#FFF', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <h3 style={{ color: 'var(--emerald-secondary)', fontFamily: 'var(--font-playfair), serif', fontSize: '1.5rem', margin: 0 }}>
                📅 Daywise Itinerary
              </h3>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button 
                  type="button" 
                  onClick={handleAddTopCustomBreakDay} 
                  style={{ border: '1.5px solid var(--gold-accent)', background: '#FFFDF5', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#0F4C3A' }}
                >
                  + Add Custom Day (Break Trip)
                </button>
                <button type="button" onClick={expandAll} style={{ border: '1px solid #CBD5E1', background: '#FFF', padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#4A5568' }}>↕ Expand All</button>
                <button type="button" onClick={collapseAll} style={{ border: '1px solid #CBD5E1', background: '#FFF', padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#4A5568' }}>↕ Collapse All</button>
              </div>
            </div>

            {itinerary.map((day, dIdx) => {
              const isCollapsed = collapsedDays.has(dIdx)
              const cbMealsCount = (day.breakfast ? 1 : 0) + (day.lunch ? 1 : 0) + (day.dinner ? 1 : 0)
              const hasCBMeals = cbMealsCount > 0
              const summaryParts = [
                day.transfers.length > 0 ? `🚗${day.transfers.length}` : '',
                day.attractions.length > 0 ? `🎟${day.attractions.length}` : '',
                hasCBMeals ? `🍽${cbMealsCount}` : (day.meals && day.meals.length > 0 ? `🍽${day.meals.length}` : ''),
                (day.guideRequired || (day.guides && day.guides.length > 0)) ? `👤Required` : '',
              ].filter(Boolean)
              return (
              <div key={dIdx} style={{ 
                border: '2px solid var(--gold-accent)', 
                borderRadius: '12px',
                marginBottom: '1.25rem', 
                background: '#FFF',
                overflow: 'hidden'
              }}>
                {/* Clickable Day Header */}
                <div
                  onClick={() => toggleDay(dIdx)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', cursor: 'pointer', background: isCollapsed ? '#FFFDF5' : '#FFF', userSelect: 'none', gap: '0.5rem', flexWrap: 'wrap' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h4 style={{ color: 'var(--emerald-secondary)', fontSize: '1.05rem', fontFamily: 'var(--font-playfair), serif', margin: 0 }}>
                      Day {dIdx + 1} · {getItineraryDate(dIdx)}
                    </h4>
                    {day.isCustomDay && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setItinerary(prev => prev.filter((_, idx) => idx !== dIdx))
                          }}
                          style={{ background: '#FFF5F5', color: '#E53E3E', border: '1px solid #FEB2B2', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          ✕ Remove Day
                        </button>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4A5568' }}>Date:</span>
                          <input 
                            type="date"
                            value={day.customDate || ''}
                            onChange={(e) => updateDay(dIdx, 'customDate', e.target.value)}
                            style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.75rem', outline: 'none', background: '#FFF' }}
                          />
                        </div>
                      </>
                    )}
                    {summaryParts.length > 0 && !day.isBreakTrip && (
                      <span style={{ fontSize: '0.75rem', color: '#718096', display: 'flex', gap: '0.35rem' }}>
                        {summaryParts.map((p, i) => <span key={i} style={{ background: '#F0FDF4', border: '1px solid #C6F6D5', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{p}</span>)}
                      </span>
                    )}
                    {summaryParts.length === 0 && !day.isBreakTrip && <span style={{ fontSize: '0.72rem', color: '#A0AEC0', fontStyle: 'italic' }}>Empty — tap to add</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {day.isCustomDay && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateDay(dIdx, 'isBreakTrip', !day.isBreakTrip)
                        }}
                        style={{
                          background: day.isBreakTrip ? '#D69E2E' : '#B7791F',
                          color: '#FFF',
                          border: 'none',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '14px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Break Trip {day.isBreakTrip ? '✓' : '▼'}
                      </button>
                    )}
                    <span style={{ background: 'var(--gold-accent)', color: '#FFF', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>{destinationMode === 'malaysia' ? 'MYS' : 'SGP'}</span>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 700 }}>{isCollapsed ? '▼' : '▲'}</span>
                  </div>
                </div>

                {/* Collapsible Day Body */}
                <div
                  className={`cp-day-body${isCollapsed ? ' collapsed' : ''}`}
                  style={{ maxHeight: isCollapsed ? 0 : '2000px', padding: isCollapsed ? '0 1.25rem' : '1.25rem 1.25rem' }}
                >
                  {/* Day Options selection next to Day Label */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', background: '#F8FAFC', padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--emerald-secondary)' }}>Day {dIdx + 1} Options:</span>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', color: '#4A5568' }}>
                        <input
                          type="checkbox"
                          checked={day.breakfast || false}
                          onChange={e => updateDay(dIdx, 'breakfast', e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        🍳 Breakfast
                      </label>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', color: '#4A5568' }}>
                        <input
                          type="checkbox"
                          checked={day.lunch || false}
                          onChange={e => updateDay(dIdx, 'lunch', e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        🍱 Lunch
                      </label>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', color: '#4A5568' }}>
                        <input
                          type="checkbox"
                          checked={day.dinner || false}
                          onChange={e => updateDay(dIdx, 'dinner', e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        🍽️ Dinner
                      </label>
                    </div>

                    {destinationMode !== 'malaysia' && (
                      <>
                        <div style={{ borderLeft: '1px solid #CBD5E1', height: '1.25rem', margin: '0 0.5rem' }} />
                        <label style={{ fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', color: '#2C7A7B' }}>
                          <input
                            type="checkbox"
                            checked={day.guideRequired || false}
                            onChange={e => {
                              updateDay(dIdx, 'guideRequired', e.target.checked)
                              if (e.target.checked) {
                                if (!day.guides || day.guides.length === 0) {
                                  updateDay(dIdx, 'guides', [{ guideIndex: 0, time: '09:00', description: 'Escorted tour guide services' }])
                                }
                              } else {
                                updateDay(dIdx, 'guides', [])
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          />
                          👤 Guide Required
                        </label>
                      </>
                    )}
                  </div>
                <div style={{ background: '#FAF5FF', padding: '1.25rem 1rem', borderRadius: '8px', borderLeft: '4px solid #805AD5', marginBottom: '1.5rem' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h5 style={{ color: '#6B46C1', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>🚗 Transfers</h5>
                      <span style={{ fontSize: '0.72rem', color: '#805AD5', fontStyle: 'italic', opacity: 0.8 }}>(for Arrival / Departure / Meal transfers)</span>
                    </div>
                    <button type="button" onClick={() => addTransferRow(dIdx)} style={{ background: '#805AD5', color: '#FFF', border: 'none', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                      + Add Transfer
                    </button>
                  </div>

                  {/* Section B: Transfers */}
                  {day.transfers.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', opacity: 0.6, fontStyle: 'italic' }}>No transport transfers scheduled for this day</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {day.transfers.map((trans, rIdx) => (
                        <div key={rIdx} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', background: '#FFF', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          <select 
                            value={trans.time}
                            onChange={e => updateTransferRow(dIdx, rIdx, 'time', e.target.value)}
                            style={{ width: '95px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', background: '#FFF' }}
                          >
                            {TIME_OPTIONS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>

                          <select 
                            value={trans.vehicleIndex} 
                            onChange={e => updateTransferRow(dIdx, rIdx, 'vehicleIndex', parseInt(e.target.value))}
                            style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', minWidth: '180px', flex: '1 0 180px' }}
                          >
                            {vehiclesList.map((v, idx) => {
                              const vType = (v as any).vehicleType || v.type.split(' - ')[0] || v.type
                              const tType = (v as any).transferType || ''
                              const sName = (v as any).serviceName || (v as any).transfers || 'Transfers'
                              const label = [vType, tType, sName].filter(Boolean).join(' - ')
                              return (
                                <option key={idx} value={idx}>{label}</option>
                              )
                            })}
                          </select>
                          
                          <div style={{ display: 'flex', gap: '0.5rem', flex: '1 0 200px', alignItems: 'center' }}>
                            <input 
                              type="text" 
                              required
                              placeholder="Notes (e.g. Airport to Hotel)"
                              value={trans.description}
                              onChange={e => updateTransferRow(dIdx, rIdx, 'description', e.target.value)}
                              style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none' }}
                            />
                            <input 
                              type="number" 
                              min="1" 
                              max="100"
                              title="Qty / Hrs (Multiplier)"
                              placeholder="Qty"
                              value={trans.qty || 1}
                              onChange={e => updateTransferRow(dIdx, rIdx, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                              style={{ width: '50px', padding: '0.4rem 0.2rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', textAlign: 'center', outline: 'none' }}
                            />
                          </div>

                          <button type="button" onClick={() => removeTransferRow(dIdx, rIdx)} style={{ background: 'transparent', border: 'none', color: '#E53E3E', fontSize: '1.1rem', cursor: 'pointer', padding: '0 0.25rem' }}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section C: Guide Configuration (Display only if guideRequired is checked next to Day label) */}
                {day.guideRequired && (
                  <div style={{ background: '#E6FFFA', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: '4px solid #319795', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2C7A7B' }}>👤 Guide Configuration</span>
                      <button type="button" onClick={() => addGuideRow(dIdx)} style={{ background: '#319795', color: '#FFF', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>
                        + Add More Guide Slots
                      </button>
                    </div>

                    {day.guides.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', opacity: 0.6, fontStyle: 'italic' }}>No guide slots configured.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {day.guides.map((guideRow, rIdx) => (
                          <div key={rIdx} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', background: '#FFF', padding: '0.4rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                            <select 
                              value={guideRow.time}
                              onChange={e => updateGuideRow(dIdx, rIdx, 'time', e.target.value)}
                              style={{ width: '95px', padding: '0.35rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', background: '#FFF' }}
                            >
                              {TIME_OPTIONS.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>

                            <select 
                              value={guideRow.guideIndex} 
                              onChange={e => updateGuideRow(dIdx, rIdx, 'guideIndex', parseInt(e.target.value))}
                              style={{ padding: '0.35rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', width: '180px' }}
                            >
                              {guidesList.map((g, idx) => (
                                <option key={idx} value={idx}>{g.type}</option>
                              ))}
                            </select>
                            
                            <input 
                              type="text" 
                              required
                              placeholder="Activity description (e.g. City Tour Guide)"
                              value={guideRow.description}
                              onChange={e => updateGuideRow(dIdx, rIdx, 'description', e.target.value)}
                              style={{ flex: '1 0 180px', padding: '0.35rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                            />

                            <button type="button" onClick={() => removeGuideRow(dIdx, rIdx)} style={{ background: 'transparent', border: 'none', color: '#E53E3E', fontSize: '1.1rem', cursor: 'pointer', padding: '0 0.25rem' }}>
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Section D: Attractions (Rows Grouped by Area on selection) */}
                {/* Section D: Attractions Grouped by Area with Expand/Compress Toggles */}
                <div style={{ background: '#F0FFF4', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: '4px solid #38A169' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h5 style={{ color: '#276749', fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>🎟️ Attractions & Tickets</h5>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        type="button" 
                        onClick={() => {
                          const nextAreas = { ...expandedAreas }
                          const uniqueAreas = Array.from(new Set(attractionsList.map(a => a.area || 'Other Attractions')))
                          uniqueAreas.forEach(a => {
                            nextAreas[`${dIdx}-${a}`] = true
                          })
                          setExpandedAreas(nextAreas)
                        }}
                        style={{ color: '#276749', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', padding: '2px 6px', background: '#FFF', border: '1px solid #C6F6D5', borderRadius: '4px' }}
                      >
                        [+ Expand All]
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          const nextAreas = { ...expandedAreas }
                          const uniqueAreas = Array.from(new Set(attractionsList.map(a => a.area || 'Other Attractions')))
                          uniqueAreas.forEach(a => {
                            nextAreas[`${dIdx}-${a}`] = false
                          })
                          setExpandedAreas(nextAreas)
                        }}
                        style={{ color: '#C53030', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', padding: '2px 6px', background: '#FFF', border: '1px solid #FEB2B2', borderRadius: '4px' }}
                      >
                        [− Collapse All]
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(() => {
                      // Get all unique areas
                      const uniqueAreas = Array.from(new Set(attractionsList.map(a => a.area || 'Other Attractions')))

                      return uniqueAreas.map(areaName => {
                        const isAreaExpanded = !!expandedAreas[`${dIdx}-${areaName}`]
                        const areaAttractions = attractionsList
                          .map((attr, idx) => ({ ...attr, originalIdx: idx }))
                          .filter(attr => (attr.area || 'Other Attractions') === areaName)

                        return (
                          <div key={areaName} style={{ border: '1px solid #C6F6D5', borderRadius: '6px', overflow: 'hidden' }}>
                            {/* Area Header Bar */}
                            {(() => {
                              const areaOriginalIndices = new Set(areaAttractions.map(a => a.originalIdx))
                              const selectedInAreaCount = day.attractions.filter(sel => areaOriginalIndices.has(sel.attractionIndex)).length

                              return (
                                <div 
                                  onClick={() => toggleAreaExpand(dIdx, areaName)}
                                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#E6FFFA', padding: '0.35rem 0.65rem', cursor: 'pointer', userSelect: 'none' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2C7A7B' }}>📍 {areaName}</span>
                                    {selectedInAreaCount > 0 && (
                                      <span style={{ background: '#319795', color: '#FFF', fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                        🎟️ {selectedInAreaCount}
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#319795' }}>
                                    {isAreaExpanded ? '− Compress' : '+ Expand'}
                                  </span>
                                </div>
                              )
                            })()}

                            {/* Area Attractions List */}
                            {isAreaExpanded && (
                              <div style={{ padding: '0.5rem', background: '#F9FFF9', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {areaAttractions.length === 0 ? (
                                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#718096', fontStyle: 'italic' }}>No attractions found in this area</p>
                                ) : (
                                  areaAttractions.map(attraction => {
                                    const existingIdx = day.attractions.findIndex(sel => sel.attractionIndex === attraction.originalIdx)
                                    const isSelected = existingIdx >= 0
                                    const row = isSelected ? day.attractions[existingIdx] : null

                                    return (
                                      <div key={attraction.originalIdx} style={{ background: '#FFF', padding: '0.4rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#2D3748' }}>
                                          <input 
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={e => {
                                              if (e.target.checked) {
                                                const nextAttrs = [...day.attractions, { attractionIndex: attraction.originalIdx, time: '10:00', adultTickets: adults, childTickets: kids, description: '' }]
                                                updateDay(dIdx, 'attractions', nextAttrs)
                                              } else {
                                                const nextAttrs = day.attractions.filter(sel => sel.attractionIndex !== attraction.originalIdx)
                                                updateDay(dIdx, 'attractions', nextAttrs)
                                              }
                                            }}
                                            style={{ width: '1.05rem', height: '1.05rem', cursor: 'pointer' }}
                                          />
                                          <span>{attraction.name} <span style={{ fontSize: '0.7rem', color: '#718096' }}>(Ad: S${attraction.adultPrice} / Ch: S${attraction.childPrice || 'N/A'})</span></span>
                                        </label>

                                        {isSelected && row && (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem', padding: '0.35rem', borderTop: '1px dashed #CBD5E1' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <span style={{ fontSize: '0.72rem', color: '#4A5568' }}>Time:</span>
                                                <select 
                                                  value={row.time}
                                                  onChange={e => updateAttractionRow(dIdx, existingIdx, 'time', e.target.value)}
                                                  style={{ width: '85px', padding: '0.15rem 0.25rem', borderRadius: '3px', border: '1px solid #CBD5E1', fontSize: '0.75rem', background: '#FFF' }}
                                                >
                                                  {TIME_OPTIONS.map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                  ))}
                                                </select>
                                              </div>
                                              
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid #CBD5E1', borderRadius: '4px', background: '#F8FAFC', padding: '0.15rem 0.35rem' }}>
                                                <span style={{ fontSize: '0.72rem', color: '#4A5568', marginRight: '0.2rem' }}>Adults:</span>
                                                <button 
                                                  type="button"
                                                  onClick={() => updateAttractionRow(dIdx, existingIdx, 'adultTickets', Math.max(0, row.adultTickets - 1))}
                                                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem', color: '#4A5568', padding: '0 0.15rem' }}
                                                >
                                                  −
                                                </button>
                                                <input 
                                                  type="number" min="0" max="100"
                                                  value={row.adultTickets}
                                                  onChange={e => updateAttractionRow(dIdx, existingIdx, 'adultTickets', Math.max(0, parseInt(e.target.value) || 0))}
                                                  style={{ width: '20px', border: 'none', background: 'transparent', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', outline: 'none' }}
                                                />
                                                <button 
                                                  type="button"
                                                  onClick={() => updateAttractionRow(dIdx, existingIdx, 'adultTickets', Math.min(100, row.adultTickets + 1))}
                                                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem', color: '#4A5568', padding: '0 0.15rem' }}
                                                >
                                                  +
                                                </button>
                                              </div>

                                              {kids > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid #CBD5E1', borderRadius: '4px', background: '#F8FAFC', padding: '0.15rem 0.35rem' }}>
                                                  <span style={{ fontSize: '0.72rem', color: '#4A5568', marginRight: '0.2rem' }}>Kids:</span>
                                                  <button 
                                                    type="button"
                                                    onClick={() => updateAttractionRow(dIdx, existingIdx, 'childTickets', Math.max(0, row.childTickets - 1))}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem', color: '#4A5568', padding: '0 0.15rem' }}
                                                  >
                                                    −
                                                  </button>
                                                  <input 
                                                    type="number" min="0" max="100"
                                                    value={row.childTickets}
                                                    onChange={e => updateAttractionRow(dIdx, existingIdx, 'childTickets', Math.max(0, parseInt(e.target.value) || 0))}
                                                    style={{ width: '20px', border: 'none', background: 'transparent', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', outline: 'none' }}
                                                  />
                                                  <button 
                                                    type="button"
                                                    onClick={() => updateAttractionRow(dIdx, existingIdx, 'childTickets', Math.min(100, row.childTickets + 1))}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem', color: '#4A5568', padding: '0 0.15rem' }}
                                                  >
                                                    +
                                                  </button>
                                                </div>
                                              )}

                                              <input 
                                                type="text" 
                                                placeholder="Notes (e.g. Priority pass)"
                                                value={row.description}
                                                onChange={e => updateAttractionRow(dIdx, existingIdx, 'description', e.target.value)}
                                                style={{ flex: '1 1 120px', padding: '0.15rem 0.35rem', borderRadius: '3px', border: '1px solid #CBD5E1', fontSize: '0.75rem' }}
                                              />

                                              {destinationMode !== 'malaysia' && (
                                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#6B46C1', cursor: 'pointer', marginLeft: 'auto', userSelect: 'none' }}>
                                                  <input 
                                                    type="checkbox"
                                                    checked={row.hasTransfer || false}
                                                    onChange={e => updateAttractionRow(dIdx, existingIdx, 'hasTransfer', e.target.checked)}
                                                  />
                                                  🚌 Transfer?
                                                </label>
                                              )}
                                            </div>
 
                                            {row.hasTransfer && destinationMode !== 'malaysia' && (
                                              <div style={{ marginTop: '0.5rem', background: '#F3E8FF', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #E9D5FF', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                {/* Pickup Transfer Line */}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                                                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: '#581C87', cursor: 'pointer' }}>
                                                    <input 
                                                      type="checkbox" 
                                                      checked={row.pickupEnabled !== false} 
                                                      onChange={e => updateAttractionRow(dIdx, existingIdx, 'pickupEnabled', e.target.checked)} 
                                                    />
                                                    Pickup Time:
                                                  </label>
                                                  <select
                                                    value={row.pickupTime || '09:00'}
                                                    onChange={e => updateAttractionRow(dIdx, existingIdx, 'pickupTime', e.target.value)}
                                                    style={{ padding: '0.2rem 0.35rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.75rem', background: '#FFF' }}
                                                    disabled={row.pickupEnabled === false}
                                                  >
                                                    {TIME_OPTIONS.map(t => (
                                                      <option key={t} value={t}>{t}</option>
                                                    ))}
                                                  </select>
                                                  <select
                                                    value={row.pickupVehicleIndex ?? 0}
                                                    onChange={e => updateAttractionRow(dIdx, existingIdx, 'pickupVehicleIndex', parseInt(e.target.value))}
                                                    style={{ padding: '0.2rem 0.35rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.75rem', background: '#FFF', maxWidth: '200px' }}
                                                    disabled={row.pickupEnabled === false}
                                                  >
                                                    {vehiclesList
                                                      .map((v, vIdx) => ({ ...v, vIdx }))
                                                      .filter(v => {
                                                        const sName = (v as any).serviceName || (v as any).service || ''
                                                        if (!sName) return true
                                                        const s = sName.toString().trim().toLowerCase()
                                                        return s === 'transfers' || s === 'transfer' || s.includes('transfer')
                                                      })
                                                      .map(v => (
                                                        <option key={v.vIdx} value={v.vIdx}>{v.type.split(' - ')[0] || v.type}</option>
                                                      ))
                                                    }
                                                  </select>
                                                  <input
                                                    type="text"
                                                    placeholder="Pickup Notes (e.g. Hotel to Attraction)"
                                                    value={row.pickupNotes || ''}
                                                    onChange={e => updateAttractionRow(dIdx, existingIdx, 'pickupNotes', e.target.value)}
                                                    style={{ flex: '1 1 140px', padding: '0.2rem 0.35rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.75rem', background: row.pickupEnabled === false ? '#F1F5F9' : '#FFF' }}
                                                    disabled={row.pickupEnabled === false}
                                                  />
                                                </div>

                                                {/* Drop Transfer Line */}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                                                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: '#581C87', cursor: 'pointer' }}>
                                                    <input 
                                                      type="checkbox" 
                                                      checked={row.dropEnabled !== false} 
                                                      onChange={e => updateAttractionRow(dIdx, existingIdx, 'dropEnabled', e.target.checked)} 
                                                    />
                                                    Drop Time:
                                                  </label>
                                                  <select
                                                    value={row.dropTime || '17:00'}
                                                    onChange={e => updateAttractionRow(dIdx, existingIdx, 'dropTime', e.target.value)}
                                                    style={{ padding: '0.2rem 0.35rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.75rem', background: '#FFF' }}
                                                    disabled={row.dropEnabled === false}
                                                  >
                                                    {TIME_OPTIONS.map(t => (
                                                      <option key={t} value={t}>{t}</option>
                                                    ))}
                                                  </select>
                                                  <select
                                                    value={row.dropVehicleIndex ?? 0}
                                                    onChange={e => updateAttractionRow(dIdx, existingIdx, 'dropVehicleIndex', parseInt(e.target.value))}
                                                    style={{ padding: '0.2rem 0.35rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.75rem', background: '#FFF', maxWidth: '200px' }}
                                                    disabled={row.dropEnabled === false}
                                                  >
                                                    {vehiclesList
                                                      .map((v, vIdx) => ({ ...v, vIdx }))
                                                      .filter(v => {
                                                        const sName = (v as any).serviceName || (v as any).service || ''
                                                        if (!sName) return true
                                                        const s = sName.toString().trim().toLowerCase()
                                                        return s === 'transfers' || s === 'transfer' || s.includes('transfer')
                                                      })
                                                      .map(v => (
                                                        <option key={v.vIdx} value={v.vIdx}>{v.type.split(' - ')[0] || v.type}</option>
                                                      ))
                                                    }
                                                  </select>
                                                  <input
                                                    type="text"
                                                    placeholder="Drop Notes (e.g. Attraction to Hotel)"
                                                    value={row.dropNotes || ''}
                                                    onChange={e => updateAttractionRow(dIdx, existingIdx, 'dropNotes', e.target.value)}
                                                    style={{ flex: '1 1 140px', padding: '0.2rem 0.35rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.75rem', background: row.dropEnabled === false ? '#F1F5F9' : '#FFF' }}
                                                    disabled={row.dropEnabled === false}
                                                  />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
                </div>
              </div>
              )
            })}

            {/* Add Custom Day (Break Trip) Button */}
            <div style={{ marginTop: '1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleAddCustomBreakDay}
                style={{
                  padding: '0.75rem 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#6B46C1',
                  background: '#FAF5FF',
                  border: '1.5px solid #E9D5FF',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(107, 70, 193, 0.08)'
                }}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>+</span> Add Custom Day (Break Trip)
              </button>
            </div>

            {itinerary.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowPreviewOverlay(true)}
                  className="btn btn-primary"
                  style={{
                    padding: '0.85rem 2rem',
                    fontSize: '1rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  🔍 Preview Package Proposal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Dynamic Pricing Calculator */}
        <div style={{ position: 'sticky', top: '100px' }}>
          
          {/* Agent Profit Control Panel */}
          <div className="glass" style={{ 
            padding: '1rem 1.15rem', 
            borderRadius: '12px', 
            marginBottom: '1rem', 
            background: '#FFF', 
            border: '1px solid #E2E8F0' 
          }}>
            <div 
              onClick={() => setAgentSettingsOpen(prev => !prev)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              <h4 style={{ color: 'var(--emerald-secondary)', margin: 0, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                Agent Profit Settings
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>
                {agentSettingsOpen ? '▲' : '▼'}
              </span>
            </div>
            
            {agentSettingsOpen && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.2rem', color: '#4A5568' }}>
                      Markup (%)
                    </label>
                    <input 
                      type="number" min="0" max="100"
                      value={markupPercent}
                      onChange={e => setMarkupPercent(Math.max(0, parseInt(e.target.value) || 0))}
                      style={{ width: '100%', padding: '0.35rem 0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.78rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.2rem', color: '#4A5568' }}>
                      Absolute (S$)
                    </label>
                    <input 
                      type="number" min="0"
                      placeholder="0"
                      value={markupAbsolute || ''}
                      onChange={e => setMarkupAbsolute(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ width: '100%', padding: '0.35rem 0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.78rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.2rem', color: '#4A5568' }}>
                    Discount / Pax (S$)
                  </label>
                  <input 
                    type="number" min="0" max="10000" step="5"
                    value={discountPerPerson}
                    onChange={e => setDiscountPerPerson(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ width: '100%', padding: '0.35rem 0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.78rem', outline: 'none' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pricing Estimation Summary */}
          <div style={{ 
            background: 'var(--bg-dark)', 
            color: 'var(--text-light)', 
            borderRadius: '12px', 
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            marginBottom: '1.25rem'
          }}>
            <div style={{ background: 'var(--emerald-secondary)', padding: '0.85rem 1.15rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#FFF' }}>
                Quotation Summary
              </h3>
            </div>

            <div style={{ padding: '1rem 1.15rem' }}>
              
              {/* Itemized Net Cost (SGD) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                {hotelRequired && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ opacity: 0.7 }}>Rooms ({globalRoomCount}):</span>
                      <span>S$ {costBreakdown.roomCostTotal.toLocaleString()}</span>
                    </div>
                    {globalSuppIndex >= 0 && globalSuppCount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ opacity: 0.7 }}>Supp ({globalSuppCount}):</span>
                        <span>S$ {costBreakdown.suppCostTotal.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Transfers ({costBreakdown.totalTransfers}):</span>
                  <span>S$ {costBreakdown.transportTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Tickets ({costBreakdown.totalAttractionsCount}):</span>
                  <span>S$ {costBreakdown.attractionTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Meals ({costBreakdown.totalLunchCount}L, {costBreakdown.totalDinnerCount}D):</span>
                  <span>S$ {costBreakdown.mealTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Guides ({costBreakdown.totalGuidesCount}):</span>
                  <span>S$ {costBreakdown.guideTotal.toLocaleString()}</span>
                </div>
                {(costBreakdown.miscTotal > 0 || miscNotes) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.7 }} title={miscNotes}>Misc ({miscNotes || 'Addons'}):</span>
                    <span>S$ {costBreakdown.miscTotal.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Net Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, padding: '0.85rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <span>Subtotal (Net Cost):</span>
                <span style={{ textAlign: 'right' }}>
                  S$ {costBreakdown.netCost.toLocaleString()}<br />
                  <span style={{ fontSize: '0.72rem', color: 'var(--gold-accent)', fontWeight: 400 }}>
                    (₹{costBreakdown.netCostINR.toLocaleString('en-IN')})
                  </span>
                </span>
              </div>

              {/* B2B Price Splits */}
              <div style={{ 
                background: 'rgba(255,255,255,0.05)', 
                padding: '0.65rem 0.85rem', 
                borderRadius: '6px', 
                marginTop: '0.75rem',
                borderLeft: '3px solid var(--gold-accent)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.76rem' }}>
                  <span style={{ opacity: 0.8 }}>Quote per Adult:</span>
                  <span style={{ fontWeight: 700, color: 'var(--gold-accent)' }}>S$ {costBreakdown.adultQuote.toLocaleString()}</span>
                </div>
                {kids > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ opacity: 0.8 }}>Quote per Child:</span>
                    <span style={{ fontWeight: 700, color: 'var(--gold-accent)' }}>S$ {costBreakdown.childQuote.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Client Proposal Total */}
              <div style={{ padding: '0.85rem 0 0.35rem 0', borderTop: '2px solid var(--gold-accent)', marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.72rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Package Valuation (Client Price)
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', margin: '0.15rem 0', lineHeight: '1.2' }}>
                  S$ {costBreakdown.totalClientPrice.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gold-accent)', fontWeight: 700 }}>
                  ₹{costBreakdown.totalClientPriceINR.toLocaleString('en-IN')}{' '}
                  <span style={{ fontSize: '0.68rem', opacity: 0.6, fontWeight: 400, color: '#FFF' }}>approx. INR</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.25rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => handleCopyProposalText(false)}
                  title="Copy Proposal"
                  style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#FFF', fontWeight: 800, padding: '0.45rem 0.1rem', fontSize: '0.62rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}
                >
                  <CopyCheck size={15} color="#FFF" />
                  <span>COPY</span>
                </button>

                <button 
                  type="button" 
                  onClick={downloadProposalPDF}
                  title="Download PDF"
                  style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFF', fontWeight: 800, padding: '0.45rem 0.1rem', fontSize: '0.62rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}
                >
                  <FileDown size={15} color="#FFF" />
                  <span>PDF</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => { setShowScheduleModal(true); setPriceDrawerOpen(false); }}
                  title="Transport Schedule"
                  style={{ background: 'linear-gradient(135deg, #475569 0%, #334155 100%)', color: '#FFF', fontWeight: 800, padding: '0.45rem 0.1rem', fontSize: '0.62rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}
                >
                  <CalendarDays size={15} color="#FFF" />
                  <span>SCHED</span>
                </button>

                <button 
                  type="button" 
                  onClick={sendOnWhatsApp}
                  title="WhatsApp Proposal"
                  style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFF', fontWeight: 800, padding: '0.45rem 0.1rem', fontSize: '0.62rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}
                >
                  <MessageCircle size={15} color="#FFF" />
                  <span>WA</span>
                </button>

                <button 
                  type="button" 
                  onClick={handleSaveProposal}
                  disabled={saveStatus === 'saving'}
                  title="Save Proposal"
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: '#FFF', fontWeight: 800, padding: '0.45rem 0.1rem', fontSize: '0.62rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', borderRadius: '8px', border: 'none', cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer', opacity: saveStatus === 'saving' ? 0.7 : 1, boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}
                >
                  <BookmarkCheck size={15} color="#FFF" />
                  <span>{saveStatus === 'saving' ? '...' : 'SAVE'}</span>
                </button>
              </div>

              {/* Order / Enquire - Flying Wonders Button */}
              <button
                type="button"
                onClick={() => {
                  setShowEnquiry(true);
                  setPriceDrawerOpen(false);
                }}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  padding: '0.85rem 1rem',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, var(--crimson-primary) 0%, #9B2C39 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(184, 58, 75, 0.35)',
                  letterSpacing: '0.02em'
                }}
              >
                <Send size={18} color="#FFF" /> Order / Enquire - Flying Wonders
              </button>

            </div>
          </div>

        </div>
      </div>
      </>
      )}

      {/* ICICI Bank UPI QR Payment Modal */}
      <IciciQrModal
        isOpen={isIciciModalOpen}
        onClose={() => setIsIciciModalOpen(false)}
        amountSgd={costBreakdown.totalClientPrice}
        bookingReference={`FW-PROP-${Math.floor(100000 + Math.random() * 900000)}`}
        initialGuestName={guestName}
        initialEmail={agentEmail}
        initialPhone={agentPhone}
      />

      {/* Operations & Transport Schedule Modal */}
      {showScheduleModal && (() => {
        const hotel = hotelRequired
          ? (customHotelEnabled 
              ? `${customHotelName || 'Custom Hotel'} — ${customHotelRoomType || 'Custom Room'} ×${globalRoomCount}` 
              : `${hotelsList[globalHotelIndex]?.name} — ${hotelsList[globalHotelIndex]?.rooms[globalRoomIndex]?.type} ×${globalRoomCount}`)
          : 'No hotel'
          
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
              
              {/* Header */}
              <div style={{ padding: '1.5rem 2rem', background: 'linear-gradient(135deg, #0F4C3A 0%, #1a6b52 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-playfair), serif', marginBottom: '0.5rem' }}>🗓️ Operations & Transport Schedule</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', opacity: 0.9, fontSize: '0.9rem' }}>
                    <span>👤 Guest: <strong>{guestName || 'TBA'}</strong> {guestPhone ? `(${guestPhone})` : ''} • {adults + kids} Pax</span>
                    <span>🏨 Hotel: {hotel}</span>
                  </div>
                </div>
                <button onClick={() => setShowScheduleModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
              </div>

            {/* Filters */}
            <div style={{ padding: '1rem 2rem', background: '#EDF2F7', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A5568' }}>Filter View:</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#2D3748', cursor: 'pointer' }}>
                <input type="checkbox" checked={scheduleFilters.transfers} onChange={(e) => setScheduleFilters(prev => ({...prev, transfers: e.target.checked}))} />
                Transfers
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#2D3748', cursor: 'pointer' }}>
                <input type="checkbox" checked={scheduleFilters.attractions} onChange={(e) => setScheduleFilters(prev => ({...prev, attractions: e.target.checked}))} />
                Attractions
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#2D3748', cursor: 'pointer' }}>
                <input type="checkbox" checked={scheduleFilters.meals} onChange={(e) => setScheduleFilters(prev => ({...prev, meals: e.target.checked}))} />
                Meals
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#2D3748', cursor: 'pointer' }}>
                <input type="checkbox" checked={scheduleFilters.guides} onChange={(e) => setScheduleFilters(prev => ({...prev, guides: e.target.checked}))} />
                Guides
              </label>
            </div>

            {/* Table Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem', background: '#F7FAFC' }}>
              {generateScheduleData().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#718096' }}>No events added to the itinerary yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <thead style={{ background: '#EDF2F7', borderBottom: '2px solid #E2E8F0' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#4A5568', fontWeight: 700 }}>Date & Time</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#4A5568', fontWeight: 700 }}>Type</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#4A5568', fontWeight: 700 }}>Details / Service</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#4A5568', fontWeight: 700 }}>Pax</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#4A5568', fontWeight: 700 }}>Notes / Route</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generateScheduleData().map((evt, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #EDF2F7', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <strong style={{ display: 'block', color: '#2D3748' }}>{evt.dayStr}</strong>
                          <span style={{ color: '#718096', fontSize: '0.8rem' }}>{evt.dateStr} @ {evt.time}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ 
                            background: evt.type === 'Transfer' ? '#EBF8FF' : evt.type === 'Attraction' ? '#FEFCBF' : '#E9D8FD', 
                            color: evt.type === 'Transfer' ? '#3182CE' : evt.type === 'Attraction' ? '#D69E2E' : '#805AD5',
                            padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700
                          }}>{evt.type}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#2D3748', fontWeight: 600 }}>{evt.details}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#4A5568' }}>{evt.pax}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#718096', fontSize: '0.85rem' }}>{evt.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 2rem', background: 'white', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#718096', fontSize: '0.85rem' }}>Share this schedule with your ground handling or transport partners.</span>
              <button 
                onClick={downloadExcelSchedule}
                className="btn btn-primary"
                style={{ background: '#38A169', color: 'white', border: 'none', padding: '0.75rem 1.5rem', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                📊 Download Excel (.xlsx)
              </button>
            </div>
          </div>
        </div>
        );
      })()}
      {/* TEMPLATE CONFIRMATION MODAL */}
      {templateModalItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setTemplateModalItem(null)}>
          <div style={{ background: '#FFF', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setTemplateModalItem(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <X size={20} color="#64748B" />
            </button>

            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Ready-Made Package Template</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1A365D', margin: '0.2rem 0 0.8rem' }}>
              {templateModalItem.title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.25rem' }}>
              Select your client's Check-in Date to load this template into your Builder Workspace:
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1A365D', marginBottom: '0.35rem' }}>Check-in Date *</label>
              <input 
                type="date"
                min={minCheckinDate}
                value={templateModalCheckinDate}
                onChange={e => setTemplateModalCheckinDate(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', background: '#F8FAFC' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.25rem', display: 'block' }}>* Minimum T+3 days lead time enforced for bookings</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setTemplateModalItem(null)}
                style={{ flex: 1, background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleLoadTemplateIntoBuilder(templateModalItem, templateModalCheckinDate)}
                style={{ flex: 1.5, background: 'linear-gradient(135deg, #0F4C3A 0%, #059669 100%)', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 800, color: '#FFF', cursor: 'pointer' }}
              >
                Confirm & Load into Builder 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
