'use client'

import { useState, useMemo, useEffect } from 'react'
import * as XLSX from 'xlsx'
import IciciQrModal from '../../components/IciciQrModal'
import { load } from '@cashfreepayments/cashfree-js'
import { Loader2 } from 'lucide-react'

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

const FALLBACK_VEHICLES = [
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
  breakfast: 10,
  lunch: 18,
  dinner: 22
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
}

interface MealEntry {
  mealIndex: number
  time: string
  description: string
}

interface GuideEntry {
  guideIndex: number
  time: string
  description: string
}

interface AttractionEntry {
  attractionIndex: number
  adultTickets: number
  childTickets: number
  time: string
  description: string
}

interface DayPlan {
  transfers: TransferEntry[]
  breakfast?: boolean
  lunch?: boolean
  dinner?: boolean
  guideRequired?: boolean
  meals?: MealEntry[]
  guides: GuideEntry[]
  attractions: AttractionEntry[]
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

  // Auto-populate enquiry form fields once agent is logged in
  useEffect(() => {
    if (activeAgent) {
      setAgentName(activeAgent.agentName || '')
      setAgentEmail(activeAgent.email || '')
      setAgentPhone(activeAgent.phone || '')
      setCustomAgencyName(activeAgent.companyName || 'My Travel Agency')
      setCustomAgencyEmail(activeAgent.email || '')
      setCustomAgencyPhone(activeAgent.phone || '')
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
  const [nightsCount, setNightsCount] = useState(3)
  const [markupPercent, setMarkupPercent] = useState(0)
  const [markupAbsolute, setMarkupAbsolute] = useState(0)
  const [discountPerPerson, setDiscountPerPerson] = useState(0)
  const [arrivalDate, setArrivalDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  // Live SGD → INR exchange rate (fetched from /api/exchange-rate on mount)
  const [sgdToInrRate, setSgdToInrRate] = useState(DEFAULT_SGD_TO_INR)
  const [rateLoaded, setRateLoaded] = useState(false)
  const [isIciciModalOpen, setIsIciciModalOpen] = useState(false)
  const [customPackageSheetUrl, setCustomPackageSheetUrl] = useState<string | null>(null)
  const [hideIciciCustomPackage, setHideIciciCustomPackage] = useState(false)
  const [hideClientPreview, setHideClientPreview] = useState(false)

  // Dynamic Master Data fetched from Google Sheets (SGD pricing)
  const [hotelsList, setHotelsList] = useState(FALLBACK_HOTELS)
  const [vehiclesList, setVehiclesList] = useState(FALLBACK_VEHICLES)
  const [attractionsList, setAttractionsList] = useState<{ name: string; adultPrice: number; childPrice: number; area?: string }[]>(FALLBACK_ATTRACTIONS)
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
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')

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
  const [registrySearchQuery, setRegistrySearchQuery] = useState('')
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false)
  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>({})

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
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleFilters, setScheduleFilters] = useState({ transfers: true, attractions: true, meals: true, guides: true })

  // 1. Verify Session Check on load
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/check')
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
          if (settingsData.settings?.customPackageSheetUrl) {
            sheetUrl = settingsData.settings.customPackageSheetUrl
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
            const price = Number(row['Price/ room / night ($)']) || 0
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
            const rate = Number(row['Rate']) || 0
            return {
              type: `${vType} - ${transName} (${tType})`,
              pricePerTransfer: rate
            }
          })
          if (parsedTransfers.length > 0) setVehiclesList(parsedTransfers)
        }

        // 3. Parse Attractions Sheet
        const attractionsSheet = workbook.Sheets['Attractions']
        if (attractionsSheet) {
          const attractionRows: any[] = XLSX.utils.sheet_to_json(attractionsSheet)
          const parsedAttractions = attractionRows.map(row => {
            const name = row['Attractions'] || ''
            const adult = Number(row['Adult']) || 0
            const child = Number(row['Child']) || 0
            const area = row['Area'] || ''
            return { name, adultPrice: adult, childPrice: child, area }
          })
          if (parsedAttractions.length > 0) setAttractionsList(parsedAttractions)
        }

        // 4. Parse Meals Plan Sheet
        const mealsSheet = workbook.Sheets['Meals Plan']
        if (mealsSheet) {
          const mealRows: any[] = XLSX.utils.sheet_to_json(mealsSheet)
          const parsedMeals = mealRows.map(row => {
            const restName = row['Restaurant Name'] || ''
            const mType = row['Meal Type'] || ''
            const rate = Number(row['Price Per person']) || 0
            return {
              type: `${restName} (${mType})`,
              pricePerHead: rate
            }
          })
          if (parsedMeals.length > 0) setMealsList(parsedMeals)
        }

        // 5. Parse Guide Sheet
        const guideSheet = workbook.Sheets['Guide']
        if (guideSheet) {
          const guideRows: any[] = XLSX.utils.sheet_to_json(guideSheet)
          const parsedGuides = guideRows.map(row => {
            const desc = row['Transfer Description'] || ''
            const rate = Number(row['Rate']) || 0
            return { type: desc, pricePerDay: rate }
          })
          if (parsedGuides.length > 0) setGuidesList(parsedGuides)
        }

      } catch (err) {
        console.error('Failed to parse dynamic Google Sheets workbook:', err)
      } finally {
        setSheetLoading(false)
      }
    }
    fetchGoogleWorkbook()
  }, [isAuthenticated])

  // Fetch live SGD → INR exchange rate and site-settings on mount
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
        if (data.settings?.hideIciciCustomPackage) {
          setHideIciciCustomPackage(true)
        }
        if (data.settings?.hideCustomPackageClientPreview) {
          setHideClientPreview(true)
        }
      })
      .catch(() => {})
  }, [])

  // Initialize itinerary array when nightsCount changes to show number of nights + 1 days
  useEffect(() => {
    if (!isAuthenticated) return
    const targetLength = nightsCount + 1
    setItinerary(prev => {
      const nextPlan = [...prev]
      if (targetLength > nextPlan.length) {
        for (let i = nextPlan.length; i < targetLength; i++) {
          nextPlan.push({
            transfers: [],
            breakfast: false,
            lunch: false,
            dinner: false,
            guideRequired: false,
            meals: [],
            guides: [],
            attractions: [],
          })
        }
      } else if (targetLength < nextPlan.length) {
        nextPlan.length = targetLength
      }
      return nextPlan
    })
  }, [nightsCount, isAuthenticated])

  // Custom date formatter: e.g. "24 Jul 2026"
  const getItineraryDate = (dayIndex: number) => {
    if (!arrivalDate) return `Day ${dayIndex + 1}`
    const date = new Date(arrivalDate)
    date.setDate(date.getDate() + dayIndex)
    
    const day = date.getDate()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    
    return `${day} ${month} ${year}`
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
    updateDay(dayIndex, 'transfers', [...day.transfers, { vehicleIndex: 0, time: '12:00', description: '', qty: 1 }])
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
    updated[rIdx] = { ...updated[rIdx], [field]: value }
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

  // Cost Calculations
  const costBreakdown = useMemo(() => {
    if (!isAuthenticated) return { hotelTotal: 0, roomCostTotal: 0, suppCostTotal: 0, transportTotal: 0, attractionTotal: 0, mealTotal: 0, guideTotal: 0, netCost: 0, netCostINR: 0, totalClientPrice: 0, totalClientPriceINR: 0, adultQuote: 0, childQuote: 0 }

    let hotelTotal = 0
    let transportTotal = 0
    let attractionTotal = 0
    let attractionAdultTotal = 0
    let attractionChildTotal = 0
    let mealTotal = 0
    let guideTotal = 0

    const hotel = hotelsList[globalHotelIndex]
    const mainRoom = hotel?.rooms[globalRoomIndex]
    const suppRoom = globalSuppIndex >= 0 ? hotel?.rooms[globalSuppIndex] : null

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
    itinerary.forEach(day => {
      day.transfers.forEach(trans => {
        const vehicle = vehiclesList[trans.vehicleIndex]
        if (vehicle) {
          const qty = trans.qty || 1
          transportTotal += vehicle.pricePerTransfer * qty
        }
      })

      day.attractions.forEach(attrRow => {
        const attr = attractionsList[attrRow.attractionIndex]
        if (attr) {
          const rowAdultCount = attrRow.adultTickets || 0
          const rowChildCount = attrRow.childTickets || 0
          
          attractionTotal += (attr.adultPrice * rowAdultCount) + (attr.childPrice * rowChildCount)
          attractionAdultTotal += attr.adultPrice * rowAdultCount
          attractionChildTotal += attr.childPrice * rowChildCount
        }
      })

      let dayMealCost = 0
      if (day.breakfast) dayMealCost += MEAL_PRICES.breakfast
      if (day.lunch) dayMealCost += MEAL_PRICES.lunch
      if (day.dinner) dayMealCost += MEAL_PRICES.dinner
      mealTotal += dayMealCost * (adults + kids)

      if (day.meals && Array.isArray(day.meals)) {
        day.meals.forEach(mealRow => {
          const meal = mealsList[mealRow.mealIndex]
          if (meal) {
            mealTotal += meal.pricePerHead * (adults + kids)
          }
        })
      }

      day.guides.forEach(guideRow => {
        const guide = guidesList[guideRow.guideIndex]
        if (guide) {
          guideTotal += guide.pricePerDay
        }
      })
    })

    const rawNetCost = hotelTotal + transportTotal + attractionTotal + mealTotal + guideTotal
    const totalPeople = adults + kids
    const totalDiscount = discountPerPerson * totalPeople
    const netCost = Math.max(0, rawNetCost - totalDiscount)
    
    const markupFactor = 1 + markupPercent / 100
    const totalClientPrice = Math.round(netCost * markupFactor + markupAbsolute)

    const sharedNetPerHead = (hotelTotal + transportTotal + guideTotal) / (totalPeople || 1)
    const mealsNetPerHead = mealTotal / (totalPeople || 1)
    const absoluteMarkupPerHead = markupAbsolute / (totalPeople || 1)

    const netAdultPerHead = Math.max(0, sharedNetPerHead + mealsNetPerHead + (attractionAdultTotal / (adults || 1)) - discountPerPerson)
    const adultQuote = Math.round(netAdultPerHead * markupFactor + absoluteMarkupPerHead)

    const netChildPerHead = Math.max(0, sharedNetPerHead + mealsNetPerHead + (attractionChildTotal / (kids || 1)) - discountPerPerson)
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
      netCost,
      netCostINR,
      totalClientPrice,
      totalClientPriceINR,
      adultQuote,
      childQuote,
    }
  }, [itinerary, hotelsList, vehiclesList, attractionsList, mealsList, guidesList, adults, kids, nightsCount, globalHotelIndex, globalRoomIndex, globalRoomCount, globalSuppIndex, globalSuppCount, markupPercent, markupAbsolute, discountPerPerson, isAuthenticated, hotelRequired, sgdToInrRate, customHotelEnabled, customHotelName, customHotelRoomType, customHotelPrice, customHotelSuppName, customHotelSuppCost])

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
        arrivalDate: getItineraryDate(0),
        hotel,
        itinerarySummary: generateProposalText(),
      }),
    }).catch(() => {}) // Fire-and-forget, never block UI
  }

  // Concise WhatsApp-optimised Proposal Text
  const generateProposalText = () => {
    const sep = '━━━━━━━━━━━━━━━━━━━━━'
    let t = `✈️ *SINGAPORE ITINERARY*\n${sep}\n\n`

    // Calculate summaries
    let totalTransfers = 0
    let totalAttractionsCount = 0
    itinerary.forEach(day => {
      totalTransfers += day.transfers.length
      totalAttractionsCount += day.attractions.length
    })
    const totalRooms = hotelRequired ? (globalRoomCount + (globalSuppIndex >= 0 ? globalSuppCount : 0)) : 0

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

    // Pax + dates
    t += `\n👥 *Pax:* ${adults} Adult${adults !== 1 ? 's' : ''}${kids > 0 ? ` & ${kids} Child${kids !== 1 ? 'ren' : ''}` : ''}\n`
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
      day.transfers.forEach(tr => {
        const v = vehiclesList[tr.vehicleIndex]?.type || 'Transfer'
        dayItems.push({
          time: tr.time || '00:00',
          text: `🚗 ${tr.time} — ${v}${tr.description ? ' → ' + tr.description : ''}`
        })
      })
      day.attractions.forEach(a => {
        const name = attractionsList[a.attractionIndex]?.name || 'Attraction'
        const paxStr = a.adultTickets > 0 || a.childTickets > 0 ? ` (${a.adultTickets}Ad${a.childTickets > 0 ? `/${a.childTickets}Ch` : ''})` : ''
        dayItems.push({
          time: a.time || '00:00',
          text: `🎟️ ${a.time} — ${name}${paxStr}${a.description ? ' · ' + a.description : ''}`
        })
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
    t += `  • Total Attractions: ${totalAttractionsCount}\n\n`
    t += `⚠️ *Note:* Prices may vary based on surcharges / unforeseen events\n`
    t += `${sep}\n`
    if (activeAgent) {
      t += `📞 ${activeAgent.agentName || ''}${activeAgent.phone ? ' · ' + activeAgent.phone : ''}\n`
    }
    t += `_Powered by Flying Wonders Singapore_`
    return t
  }

  // Download Itinerary PDF helper
  const downloadProposalPDF = () => {
    import('jspdf').then((module) => {
      const jsPDF = module.jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      let y = 15

      // Helper to add text line by line and handle page overflows
      const addTextLine = (text: string, x = 15, size = 10, isBold = false, color = 'default') => {
        if (y > 275) {
          doc.addPage()
          y = 15
        }
        doc.setFont('Helvetica', isBold ? 'bold' : 'normal')
        doc.setFontSize(size)
        
        if (color === 'red') {
          doc.setTextColor(128, 0, 32) // Crimson
        } else if (color === 'gold') {
          doc.setTextColor(184, 134, 11) // Dark Goldenrod
        } else {
          doc.setTextColor(45, 55, 72) // Dark Slate
        }
        
        doc.text(text, x, y)
        y += (size * 0.35) + 3.5
      }

      // Draw Top Branding Header
      doc.setFillColor(10, 34, 64) // Dark Navy Blue instead of Crimson for a premium travel look
      doc.rect(0, 0, 210, 35, 'F')
      
      // Draw gold stripe accent at the bottom of header
      doc.setFillColor(226, 186, 107) // Gold accent
      doc.rect(0, 35, 210, 2, 'F')
      
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(255, 255, 255)
      doc.text(customAgencyName.toUpperCase(), 15, 15)
      
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(226, 186, 107) // Gold
      const contactInfoStr = [
        customAgencyPhone ? `Phone: ${customAgencyPhone}` : '',
        customAgencyEmail ? `Email: ${customAgencyEmail}` : ''
      ].filter(Boolean).join('  |  ')
      doc.text(contactInfoStr || 'AUTHORIZED DMC TRAVEL PARTNER  |  ITINERARY PROPOSAL', 15, 24)
      
      y = 48 // Content start position

      // 1. Hotel Section
      addTextLine('Hotel Accommodation', 15, 11, true, 'red')
      if (hotelRequired) {
        if (customHotelEnabled) {
          addTextLine(`• Hotel: ${customHotelName || 'Custom Hotel'}`, 20, 9.5)
          addTextLine(`• Room: ${customHotelRoomType || 'Custom Room'} x ${globalRoomCount} room(s)`, 20, 9.5)
          if (customHotelSuppName && globalSuppCount > 0) {
            addTextLine(`• Supplement: ${customHotelSuppName} x ${globalSuppCount} room(s)/unit(s)`, 20, 9.5)
          }
        } else {
          const hotel = hotelsList[globalHotelIndex]
          if (hotel) {
            addTextLine(`• Hotel: ${hotel.name}`, 20, 9.5)
            addTextLine(`• Room: ${hotel.rooms[globalRoomIndex]?.type} x ${globalRoomCount} room(s)`, 20, 9.5)
            if (globalSuppIndex >= 0 && globalSuppCount > 0) {
              addTextLine(`• Supplement: ${hotel.rooms[globalSuppIndex]?.type} x ${globalSuppCount} room(s)/unit(s)`, 20, 9.5)
            }
          }
        }
      } else {
        addTextLine('• Excluded (No hotel accommodation requested)', 20, 9.5)
      }
      y += 3

      // 2. Traveler details
      addTextLine('Travelers Details', 15, 11, true, 'red')
      addTextLine(`• Duration: ${nightsCount + 1} Days / ${nightsCount} Nights`, 20, 9.5)
      addTextLine(`• Details: Adults: ${adults} | Children: ${kids}`, 20, 9.5)
      addTextLine(`• Singapore Arrival Date: ${getItineraryDate(0)}`, 20, 9.5)
      y += 3

      // 3. Quotation Details
      addTextLine('Quotation Details', 15, 11, true, 'red')
      if (!hideNetPricing) {
        addTextLine(`• Price per Adult (B2B Net): S$ ${(costBreakdown.adultQuote / (1 + markupPercent / 100)).toFixed(2)}`, 20, 9.5)
        if (kids > 0) {
          addTextLine(`• Price per Child (B2B Net): S$ ${(costBreakdown.childQuote / (1 + markupPercent / 100)).toFixed(2)}`, 20, 9.5)
        }
      }
      addTextLine(`• Price per Adult (Client Rate): S$ ${costBreakdown.adultQuote}`, 20, 9.5)
      if (kids > 0) {
        addTextLine(`• Price per Child (Client Rate): S$ ${costBreakdown.childQuote}`, 20, 9.5)
      }
      if (discountPerPerson > 0) {
        addTextLine(`• Applied Discount: S$ ${discountPerPerson} per person`, 20, 9.5)
      }
      addTextLine(`• Total Estimated Package Value: S$ ${costBreakdown.totalClientPrice} (approx. INR ${costBreakdown.totalClientPriceINR.toLocaleString('en-IN')})`, 20, 9.5)
      y += 5

      // 4. Day-by-Day Itinerary Plan
      addTextLine('Day-by-Day Itinerary Plan', 15, 13, true, 'red')
      y += 1

      itinerary.forEach((day, dIdx) => {
        // Draw shaded background box for Day title
        if (y > 260) {
          doc.addPage()
          y = 15
        }
        
        doc.setFillColor(247, 250, 252) // Light gray background
        doc.rect(15, y - 4, 180, 6, 'F')
        addTextLine(`Day ${dIdx + 1} : ${getItineraryDate(dIdx)}`, 18, 10.5, true, 'gold')
        y += 1.5

        const items: any[] = []
        day.transfers.forEach(t => {
          const vehicle = vehiclesList[t.vehicleIndex]?.type || 'Vehicle'
          items.push({
            time: t.time || '00:00',
            type: 'transfer',
            title: `🚗 [${t.time}] Private Transfer (${vehicle})`,
            detail: `Route: ${t.description || 'N/A'}`
          })
        })
        day.attractions.forEach(a => {
          const attrName = attractionsList[a.attractionIndex]?.name || 'Attraction'
          const notes = a.description ? ` (Notes: ${a.description})` : ''
          const descText = ATTRACTION_DESCRIPTIONS[attrName] || 'Discover one of Singapore\'s premier landmarks and premium sightseeing attractions.'
          items.push({
            time: a.time || '00:00',
            type: 'attraction',
            title: `🎟️ [${a.time}] ${attrName} (Ad: ${a.adultTickets} / Ch: ${a.childTickets})${notes}`,
            detail: descText
          })
        })
        const cbMeals: string[] = []
        if (day.breakfast) cbMeals.push('Breakfast')
        if (day.lunch) cbMeals.push('Lunch')
        if (day.dinner) cbMeals.push('Dinner')
        if (cbMeals.length > 0) {
          items.push({
            time: '12:00',
            type: 'meal',
            title: `🍽️ Meals Plan`,
            detail: cbMeals.join(', ')
          })
        }

        if (day.meals && Array.isArray(day.meals)) {
          day.meals.forEach(m => {
            const mealType = mealsList[m.mealIndex]?.type || 'Meal'
            items.push({
              time: m.time || '00:00',
              type: 'meal',
              title: `🍽️ [${m.time}] ${mealType}`,
              detail: `Details: ${m.description || 'N/A'}`
            })
          })
        }
        day.guides.forEach(g => {
          const guideType = guidesList[g.guideIndex]?.type || 'Guide'
          items.push({
            time: g.time || '00:00',
            type: 'guide',
            title: `👤 [${g.time}] ${guideType}`,
            detail: `Details: ${g.description || 'N/A'}`
          })
        })

        // Sort items time-wise
        items.sort((a, b) => a.time.localeCompare(b.time))

        if (items.length === 0) {
          addTextLine('  - Rest day / Free and easy itinerary TBD.', 20, 9)
        } else {
          items.forEach(item => {
            if (item.type === 'attraction') {
              addTextLine(`  - ${item.title}`, 20, 9, true, 'gold')
              addTextLine(`    "${item.detail}"`, 22, 7.5, false)
            } else {
              addTextLine(`  - ${item.title} -> ${item.detail}`, 20, 8.5)
            }
          })
        }

        y += 3.5
      })

      // 5. Contact Details / Note at the end
      y += 3.5
      addTextLine('Important Note', 15, 11, true, 'red')
      addTextLine('• Prices may vary based on surcharges / unforeseen events', 20, 9.5)
      y += 2

      if (activeAgent) {
        addTextLine('Contact Details', 15, 11, true, 'red')
        addTextLine(`• Name: ${activeAgent.agentName || 'N/A'}`, 20, 9.5)
        addTextLine(`• Phone: ${activeAgent.phone || 'N/A'}`, 20, 9.5)
      }

      doc.save(`Singapore-Itinerary-Proposal.pdf`)
      notifyAgentActivity('pdf_download')
    })
  }

  // Send Itinerary on WhatsApp helper
  const sendOnWhatsApp = () => {
    const text = generateProposalText()
    const encodedText = encodeURIComponent(text)
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`
    window.open(whatsappUrl, '_blank')
    notifyAgentActivity('whatsapp_share')
  }

  // Handle Save Proposal to Sanity
  const handleSaveProposal = async () => {
    if (!activeAgent) return
    setSaveStatus('saving')
    setSavedProposalNum(null)
    try {
      const h = hotelsList[globalHotelIndex]
      const room = h?.rooms[globalRoomIndex]
      const supp = globalSuppIndex >= 0 ? h?.rooms[globalSuppIndex] : null

      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentEmail: activeAgent.email,
          guestName,
          adults,
          kids,
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
          costBreakdown,
          itinerary,
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSaveStatus('success')
        setSavedProposalNum(data.proposalNumber)
        alert(`Proposal saved successfully! Proposal Number: ${data.proposalNumber}`)
      } else {
        throw new Error(data.error || 'Failed to save proposal')
      }
    } catch (err) {
      console.error(err)
      setSaveStatus('error')
      alert('Failed to save proposal to Sanity. Check write tokens.')
    }
  }

  // Handle Search & Load Proposal from Sanity
  const handleSearchProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearchStatus('searching')
    try {
      const res = await fetch(`/api/proposals?number=${encodeURIComponent(searchQuery.trim())}`)
      const data = await res.json()
      if (res.ok && data.found) {
        const prop = data.proposal
        setSearchStatus('success')
        // Load details back into state
        setGuestName(prop.guestName || '')
        setAdults(prop.adults || 2)
        setKids(prop.kids || 0)
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
            attractions: day.attractions?.map((a: any) => ({ ...a, time: sanitizeTime(a.time) })) || []
          }))
          setItinerary(sanitizedItin)
        }
        // Force days open if loaded
        setCollapsedDays(new Set())
        alert(`Loaded Proposal: ${prop.proposalNumber}`)
      } else {
        setSearchStatus('not_found')
        alert('Proposal not found.')
      }
    } catch (err) {
      console.error(err)
      setSearchStatus('error')
      alert('Failed to fetch proposal details.')
    }
  }

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
      setItinerary(Array.from({ length: nightsCount + 1 }, () => ({
        transfers: [],
        breakfast: false,
        lunch: false,
        dinner: false,
        guideRequired: false,
        meals: [],
        guides: [],
        attractions: [],
      })))
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
      setGuestName('')
      alert('Workspace cleared. You can now build a new itinerary.')
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
            subject: `💼 B2B SGD Package Enquiry from ${agentName}`,
            from_name: 'Flying Wonders Website B2B',
            name: agentName,
            email: agentEmail,
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
        events.push({ dayStr, dateStr, time: t.time || '00:00', type: 'Transfer', details: vehicle, pax: `${adults + kids} Pax`, notes: t.description })
      })
      day.attractions.forEach(a => {
        if (!scheduleFilters.attractions) return
        const attrName = attractionsList[a.attractionIndex]?.name || 'Attraction'
        events.push({ dayStr, dateStr, time: a.time || '00:00', type: 'Attraction', details: attrName, pax: `${a.adultTickets} Ad / ${a.childTickets} Ch`, notes: a.description })
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
              padding: '0.45rem 1rem',
              background: activeTab === 'editor' ? 'var(--emerald-secondary)' : 'transparent',
              color: activeTab === 'editor' ? '#FFF' : '#4A5568',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'editor' ? '0 3px 8px rgba(47,133,90,0.15)' : 'none'
            }}
          >
            ⚙️ Builder Workspace
          </button>
          {!hideClientPreview && (
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '0.45rem 1rem',
                background: activeTab === 'preview' ? 'var(--emerald-secondary)' : 'transparent',
                color: activeTab === 'preview' ? '#FFF' : '#4A5568',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'preview' ? '0 3px 8px rgba(47,133,90,0.15)' : 'none'
              }}
            >
              👁️ Client-Ready Preview
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
          {itinerary.length > 0 && (
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
      </div>

      {activeTab === 'preview' ? (
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
                          items.push({
                            time: a.time || '00:00',
                            icon: '🎟️',
                            title: `${attractionsList[a.attractionIndex]?.name} Entry Pass`,
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
              <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                * Prices may vary based on surcharges / unforeseen events
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
            display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;
            padding: 0.75rem 1rem; background: #F7FAFC;
            border: 1px solid #E2E8F0; border-radius: 10px; margin-bottom: 1.5rem;
          }
          .cp-tool-btn {
            display: inline-flex; align-items: center; gap: 0.35rem;
            padding: 0.4rem 0.85rem; border-radius: 6px; border: 1px solid #CBD5E1;
            background: #FFF; color: #2D3748; font-size: 0.78rem; font-weight: 700;
            cursor: pointer; white-space: nowrap; transition: all 0.15s;
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
                <button onClick={() => { const t = generateProposalText(); navigator.clipboard.writeText(t); notifyAgentActivity('clipboard_copy'); setPriceDrawerOpen(false); alert('Proposal copied!') }} className="cp-tool-btn" style={{ justifyContent: 'center', padding: '0.65rem 0.5rem' }}>📋 Copy</button>
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
          {activeAgent && (
            <span style={{ fontSize: '0.75rem', color: '#4A5568', fontWeight: 600, marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              👤 {activeAgent.agentName}{activeAgent.companyName ? ` · ${activeAgent.companyName}` : ''}
            </span>
          )}
          <button className="cp-tool-btn" onClick={() => { setShowQuotationsModal(true); handleLoadQuotations(); }} style={{ background: '#EBF8FF', border: '1px solid #BEE3F8', color: '#2B6CB0' }}>🗄️ View Proposals</button>
          <button className="cp-tool-btn" onClick={() => { const t = generateProposalText(); navigator.clipboard.writeText(t); notifyAgentActivity('clipboard_copy'); alert('Proposal copied!') }}>📋 Copy Proposal</button>
          <button className="cp-tool-btn" onClick={downloadProposalPDF}>📄 PDF</button>
          <button className="cp-tool-btn whatsapp" onClick={sendOnWhatsApp}>💬 WhatsApp</button>
          <button className="cp-tool-btn" onClick={handleSaveProposal} style={{ background: '#FAF5FF', border: '1px solid #D6BCFA', color: '#6B46C1' }}>
            💾 {saveStatus === 'saving' ? 'Saving...' : 'Save Proposal'}
          </button>
          {savedProposalNum && (
            <span style={{ fontSize: '0.75rem', background: '#EBF8FF', color: '#2B6CB0', fontWeight: 700, padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid #BEE3F8' }}>
              Num: {savedProposalNum}
            </span>
          )}
          <button className="cp-tool-btn" onClick={() => setShowEnquiry(true)}>📧 Enquiry</button>
          <button className="cp-tool-btn" onClick={() => setShowBranding(true)}>🎨 Branding</button>
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
                              // Trigger search and close modal
                              setShowQuotationsModal(false);
                              const fakeEvent = { preventDefault: () => {} } as any;
                              setTimeout(() => {
                                const searchBtn = document.querySelector('form button[type="submit"]') as HTMLButtonElement;
                                if (searchBtn) searchBtn.click();
                              }, 100);
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
                              <span>👤 Guest: <strong>{q.guestName || 'TBD'}</strong></span>
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

        <div className="builder-layout">
        
        {/* Left: Input parameters & Day-Wise Itinerary Options */}
        <div>
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
                    onClick={() => setKids(prev => Math.max(0, prev - 1))}
                    style={{ border: 'none', background: 'transparent', padding: '0.5rem 0.35rem', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', color: '#4A5568' }}
                  >
                    −
                  </button>
                  <input 
                    type="number" min="0" max="100" 
                    value={kids} 
                    onChange={e => setKids(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ flex: 1, width: '100%', border: 'none', background: 'transparent', textAlign: 'center', padding: '0.5rem 0', fontWeight: 700, fontSize: '0.82rem', outline: 'none' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setKids(prev => Math.min(100, prev + 1))}
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
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>Arrival Date</label>
                <input 
                  type="date"
                  value={arrivalDate} 
                  onChange={e => setArrivalDate(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.82rem', background: '#F8FAFC' }}
                />
              </div>
            </div>

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
              <div style={{ display: 'flex', gap: '0.4rem' }}>
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
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', cursor: 'pointer', background: isCollapsed ? '#FFFDF5' : '#FFF', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h4 style={{ color: 'var(--emerald-secondary)', fontSize: '1.05rem', fontFamily: 'var(--font-playfair), serif', margin: 0 }}>
                      Day {dIdx + 1} · {getItineraryDate(dIdx)}
                    </h4>
                    {summaryParts.length > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#718096', display: 'flex', gap: '0.35rem' }}>
                        {summaryParts.map((p, i) => <span key={i} style={{ background: '#F0FDF4', border: '1px solid #C6F6D5', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{p}</span>)}
                      </span>
                    )}
                    {summaryParts.length === 0 && <span style={{ fontSize: '0.72rem', color: '#A0AEC0', fontStyle: 'italic' }}>Empty — tap to add</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: 'var(--gold-accent)', color: '#FFF', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>SGP</span>
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
                  </div>
                <div style={{ background: '#FAF5FF', padding: '1.25rem 1rem', borderRadius: '8px', borderLeft: '4px solid #805AD5', marginBottom: '1.5rem' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h5 style={{ color: '#6B46C1', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>🚗 Transfers</h5>
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
                            style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', width: '135px' }}
                          >
                            {vehiclesList.map((v, idx) => (
                              <option key={idx} value={idx}>{v.type}</option>
                            ))}
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
                            <div 
                              onClick={() => toggleAreaExpand(dIdx, areaName)}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#E6FFFA', padding: '0.35rem 0.65rem', cursor: 'pointer', userSelect: 'none' }}
                            >
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2C7A7B' }}>📍 {areaName}</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#319795' }}>
                                {isAreaExpanded ? '− Compress' : '+ Expand'}
                              </span>
                            </div>

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
                                            </div>
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

            {itinerary.length > 0 && (
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
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
          
          {/* Collapsible Agent Markup Slider Widget */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: '#FFF', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
            <div 
              onClick={() => setAgentSettingsOpen(!agentSettingsOpen)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              <h4 style={{ color: 'var(--emerald-secondary)', margin: 0, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                Agent Profit Settings
              </h4>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 700 }}>
                {agentSettingsOpen ? '▲' : '▼'}
              </span>
            </div>
            
            {agentSettingsOpen && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem', color: '#4A5568' }}>
                      Markup (%)
                    </label>
                    <input 
                      type="number" min="0" max="100"
                      value={markupPercent}
                      onChange={e => setMarkupPercent(Math.max(0, parseInt(e.target.value) || 0))}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem', color: '#4A5568' }}>
                      Absolute (S$)
                    </label>
                    <input 
                      type="number" min="0"
                      placeholder="0"
                      value={markupAbsolute || ''}
                      onChange={e => setMarkupAbsolute(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem', color: '#4A5568' }}>
                    Discount per Person (S$)
                  </label>
                  <input 
                    type="number" min="0" max="10000" step="5"
                    value={discountPerPerson}
                    onChange={e => setDiscountPerPerson(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pricing Estimation Summary */}
          <div style={{ 
            background: 'var(--bg-dark)', 
            color: 'var(--text-light)', 
            borderRadius: '16px', 
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            marginBottom: '1.5rem'
          }}>
            <div style={{ background: 'var(--emerald-secondary)', padding: '1.25rem 1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#FFF' }}>
                Quotation Summary
              </h3>
            </div>

            <div style={{ padding: '1.5rem' }}>
              
              {/* Itemized Net Cost (SGD) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                {hotelRequired && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ opacity: 0.6 }}>Accommodation Rooms (Net):</span>
                      <span>S$ {costBreakdown.roomCostTotal.toLocaleString()}</span>
                    </div>
                    {globalSuppIndex >= 0 && globalSuppCount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ opacity: 0.6 }}>Accommodation Supp (Net):</span>
                        <span>S$ {costBreakdown.suppCostTotal.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Transport & Transfers:</span>
                  <span>S$ {costBreakdown.transportTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Sightseeing Tickets:</span>
                  <span>S$ {costBreakdown.attractionTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Meals Plan:</span>
                  <span>S$ {costBreakdown.mealTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Guides Assigned:</span>
                  <span>S$ {costBreakdown.guideTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Net Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 600, padding: '1.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <span>Subtotal (Net Cost):</span>
                <span style={{ textAlign: 'right' }}>
                  S$ {costBreakdown.netCost.toLocaleString()}<br />
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold-accent)', fontWeight: 400 }}>
                    (₹{costBreakdown.netCostINR.toLocaleString('en-IN')})
                  </span>
                </span>
              </div>

              {/* B2B Price Splits */}
              <div style={{ 
                background: 'rgba(255,255,255,0.05)', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginTop: '1rem',
                borderLeft: '4px solid var(--gold-accent)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ opacity: 0.8 }}>Quote per Adult:</span>
                  <span style={{ fontWeight: 700, color: 'var(--gold-accent)' }}>S$ {costBreakdown.adultQuote.toLocaleString()}</span>
                </div>
                {kids > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ opacity: 0.8 }}>Quote per Child:</span>
                    <span style={{ fontWeight: 700, color: 'var(--gold-accent)' }}>S$ {costBreakdown.childQuote.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Client Proposal Total */}
              <div style={{ padding: '1.25rem 0 0.5rem 0', borderTop: '2px solid var(--gold-accent)', marginTop: '1rem' }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Package Valuation (Client Price)
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#FFF', margin: '0.25rem 0', lineHeight: '1.2' }}>
                  S$ {costBreakdown.totalClientPrice.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--gold-accent)', fontWeight: 700 }}>
                  ₹{costBreakdown.totalClientPriceINR.toLocaleString('en-IN')}{' '}
                  <span style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 400, color: '#FFF' }}>approx. INR value</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    const textSummary = generateProposalText()
                    navigator.clipboard.writeText(textSummary)
                    alert(`Proposal copied to clipboard successfully!`)
                  }}
                  className="btn btn-primary" 
                  style={{ background: 'var(--gold-accent)', color: '#111', fontWeight: 700, padding: '0.75rem 0.25rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <span>📋 Copy</span>
                </button>
                <button 
                  type="button" 
                  onClick={downloadProposalPDF}
                  className="btn btn-primary" 
                  style={{ background: 'var(--emerald-secondary)', color: '#FFF', fontWeight: 700, padding: '0.75rem 0.25rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <span>📄 PDF</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowScheduleModal(true); setPriceDrawerOpen(false); }}
                  className="btn btn-primary" 
                  style={{ background: '#4A5568', color: '#FFF', fontWeight: 700, padding: '0.75rem 0.25rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <span>🗓️ Schedule</span>
                </button>
                <button 
                  type="button" 
                  onClick={sendOnWhatsApp}
                  className="btn btn-primary" 
                  style={{ background: '#25D366', color: '#FFF', border: 'none', fontWeight: 700, padding: '0.75rem 0.25rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <span>💬 WhatsApp</span>
                </button>
              </div>

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
    </div>
  )
}
