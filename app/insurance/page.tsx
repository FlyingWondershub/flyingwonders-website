'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface Traveler {
  id: number
  age: number
}

interface PlanFeature {
  name: string
  limit: string
}

interface InsurancePlan {
  id: string
  name: string
  badge: string
  popular?: boolean
  sumInsured: string
  sumInsuredVal: number
  deductible: string
  schengenApproved: boolean
  features: PlanFeature[]
  pricing: {
    subtotalINR: number
    gstINR: number
    totalINR: number
    approxUSD: number
    perDayINR: number
  }
}

export default function InsurancePage() {
  // Destination state
  const [destination, setDestination] = useState<string>('schengen_europe')
  
  // Dates
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 21) // default 14 days trip
    return d.toISOString().split('T')[0]
  })
  const [durationDays, setDurationDays] = useState<number>(14)

  // Travelers
  const [travelers, setTravelers] = useState<Traveler[]>([{ id: 1, age: 30 }])

  // Sum Insured & Addons
  const [sumInsuredUSD, setSumInsuredUSD] = useState<number>(100000)
  const [adventureSports, setAdventureSports] = useState<boolean>(false)
  const [pedCover, setPedCover] = useState<boolean>(false)
  const [tripCancellationAddon, setTripCancellationAddon] = useState<boolean>(false)

  // Plan loading & selection
  const [plans, setPlans] = useState<InsurancePlan[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null)

  // Inquiry / Booking Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [submittingInquiry, setSubmittingInquiry] = useState<boolean>(false)
  const [inquirySuccess, setInquirySuccess] = useState<boolean>(false)
  const [inquiryRef, setInquiryRef] = useState<string>('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    passportNumber: '',
    notes: '',
  })

  // Calculate days whenever dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = end.getTime() - start.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDurationDays(diffDays > 0 ? diffDays : 1)
    }
  }, [startDate, endDate])

  // Fetch / Calculate Quotes
  const fetchQuotes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/insurance/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          durationDays,
          travelers,
          sumInsuredUSD,
          adventureSports,
          pedCover,
          tripCancellationAddon,
        }),
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.plans)) {
        setPlans(data.plans)
      }
    } catch (err) {
      console.error('Error fetching quotes:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch initial quotes and whenever params change
  useEffect(() => {
    fetchQuotes()
  }, [destination, durationDays, travelers, sumInsuredUSD, adventureSports, pedCover, tripCancellationAddon])

  // Add / Remove Traveler
  const addTraveler = () => {
    if (travelers.length < 8) {
      setTravelers([...travelers, { id: Date.now(), age: 28 }])
    }
  }

  const removeTraveler = (id: number) => {
    if (travelers.length > 1) {
      setTravelers(travelers.filter(t => t.id !== id))
    }
  }

  const updateTravelerAge = (id: number, age: number) => {
    setTravelers(travelers.map(t => (t.id === id ? { ...t, age: Math.max(1, Math.min(99, age)) } : t)))
  }

  const handleOpenModal = (plan: InsurancePlan) => {
    setSelectedPlan(plan)
    setInquirySuccess(false)
    setModalOpen(true)
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fullName || !formData.phone || !formData.email) return

    setSubmittingInquiry(true)
    try {
      const res = await fetch('/api/insurance/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          destination,
          startDate,
          endDate,
          durationDays,
          planName: selectedPlan?.name || 'Selected Plan',
          sumInsured: selectedPlan?.sumInsured || `$${sumInsuredUSD}`,
          premiumTotalINR: selectedPlan?.pricing.totalINR || 0,
          travelersCount: travelers.length,
          travelerAges: travelers.map(t => t.age).join(', '),
        }),
      })
      const result = await res.json()
      if (result.success) {
        setInquirySuccess(true)
        setInquiryRef(result.referenceId || 'FW-INS-REQ')
      }
    } catch (err) {
      console.error('Inquiry submission failed:', err)
    } finally {
      setSubmittingInquiry(false)
    }
  }

  const generateWhatsAppUrl = (plan: InsurancePlan) => {
    const text = encodeURIComponent(
      `Hello Flying Wonders! I would like to purchase/inquire about Travel Insurance:\n\n` +
      `🛡️ Plan: ${plan.name} (${plan.sumInsured})\n` +
      `🌍 Destination: ${destination.replace(/_/g, ' ').toUpperCase()}\n` +
      `📅 Dates: ${startDate} to ${endDate} (${durationDays} Days)\n` +
      `👥 Travelers: ${travelers.length} (${travelers.map(t => `${t.age} yrs`).join(', ')})\n` +
      `💰 Quoted Premium: ₹${plan.pricing.totalINR.toLocaleString('en-IN')} (incl. GST)\n\n` +
      `Please assist me with instant policy issuance.`
    )
    return `https://wa.me/6591234567?text=${text}` // Update with official WhatsApp number if configured
  }

  // FAQ list
  const faqs = [
    {
      q: 'Is this travel insurance compliant with Schengen Visa requirements?',
      a: 'Yes, absolutely! All our Schengen and European plans meet and exceed the official European consulate requirements, providing minimum €30,000 (or $50,000+) emergency medical cover, zero deductible options, emergency medical evacuation, and repatriation of remains with instant downloadable embassy visa certificates.',
    },
    {
      q: 'How does cashless hospitalization work overseas?',
      a: 'In case of an emergency medical situation, you or the hospital staff can contact our 24/7 International Emergency Assistance TPA helpline (provided on your policy certificate). The medical team verifies coverage with the hospital and issues a Letter of Guarantee (GOP) directly to the hospital so you do not have to pay out of pocket.',
    },
    {
      q: 'Can I purchase insurance if my trip has already started?',
      a: 'Travel insurance policies should ideally be purchased prior to your departure from your home country. If you require an extension for an existing overseas policy, our desk can endorse and extend your coverage seamlessly.',
    },
    {
      q: 'Are COVID-19 medical expenses and quarantine covered?',
      a: 'Yes, emergency hospitalization, diagnostic tests, and medically required treatment related to COVID-19 contracted during the covered trip are treated as any other standard medical illness up to the policy sum insured.',
    },
    {
      q: 'What happens if my flight is delayed or luggage is lost?',
      a: 'Our comprehensive plans cover reimbursement for essential toiletries, clothes, and emergency supplies if checked baggage is delayed beyond 6 to 12 hours. For total baggage loss or flight cancellation due to adverse weather/medical emergencies, direct compensation is provided per policy terms.',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Glow overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 backdrop-blur-md">
            <span>🛡️</span> Official Travel Insurance Desk
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 font-playfair">
            Travel the World with <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-amber-300">Complete Peace of Mind</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
            Embassy-approved Schengen visa compliance, up to <strong>$1,000,000 USD</strong> medical cover, 24/7 cashless hospital networks across 180+ countries, flight delay & baggage protection, and instant policy certificate issuance.
          </p>

          {/* Quick Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 text-xl">🏥</div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-medium">Cashless Care</div>
                <div className="text-sm font-bold text-white">Global Hospital Network</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xl">🇪🇺</div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-medium">Visa Approved</div>
                <div className="text-sm font-bold text-white">100% Schengen Guaranteed</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 text-xl">🧳</div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-medium">Transit Shield</div>
                <div className="text-sm font-bold text-white">Baggage & Flight Delay</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 text-xl">⚡</div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-medium">Instant Certificate</div>
                <div className="text-sm font-bold text-white">Delivered in 2 Minutes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Calculator & Filter Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>⚡</span> Instant Travel Insurance Premium Calculator
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Customize your trip details and compare comprehensive coverage tiers instantly.
              </p>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold">
              Live Rates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Destination Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                1. Destination Zone
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="schengen_europe">Schengen & Europe (Visa Compliant)</option>
                <option value="worldwide_without_us_ca">Worldwide (Excl. USA & Canada)</option>
                <option value="worldwide_with_us_ca">Worldwide (Incl. USA & Canada)</option>
                <option value="asia">Asia Pacific & Middle East</option>
                <option value="domestic">Domestic Travel (India)</option>
              </select>
            </div>

            {/* Travel Dates */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                2. Travel Dates ({durationDays} Days)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 ml-1">Departure</span>
                </div>
                <div>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 ml-1">Return</span>
                </div>
              </div>
            </div>

            {/* Sum Insured */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                3. Medical Sum Insured
              </label>
              <select
                value={sumInsuredUSD}
                onChange={(e) => setSumInsuredUSD(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={50000}>$50,000 USD (Essential)</option>
                <option value={100000}>$100,000 USD (Recommended)</option>
                <option value={250000}>$250,000 USD (Gold Protection)</option>
                <option value={500000}>$500,000 USD (Comprehensive)</option>
                <option value={1000000}>$1,000,000 USD (Ultra Shield)</option>
              </select>
            </div>
          </div>

          {/* Travelers Age Section */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                4. Travelers ({travelers.length}) & Age
              </label>
              <button
                type="button"
                onClick={addTraveler}
                disabled={travelers.length >= 8}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-lg text-xs font-semibold transition"
              >
                <span>+ Add Traveler</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {travelers.map((t, idx) => (
                <div key={t.id} className="relative bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Person {idx + 1}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={t.age}
                      onChange={(e) => updateTravelerAge(t.id, parseInt(e.target.value) || 1)}
                      className="w-14 text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-1 text-sm font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-xs text-slate-400">yrs</span>
                  </div>
                  {travelers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTraveler(t.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] shadow hover:bg-rose-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add-on Filters */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mr-2">
              Optional Riders:
            </span>

            <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              <input
                type="checkbox"
                checked={adventureSports}
                onChange={(e) => setAdventureSports(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>⛷️ Adventure Sports Rider</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              <input
                type="checkbox"
                checked={pedCover}
                onChange={(e) => setPedCover(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>❤️ Pre-existing Condition (PED) Emergency Life-Threatening Cover</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              <input
                type="checkbox"
                checked={tripCancellationAddon}
                onChange={(e) => setTripCancellationAddon(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>✈️ Trip Cancellation Any Reason Cover</span>
            </label>
          </div>
        </div>
      </section>

      {/* Plans Grid Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-playfair">
            Choose Your Travel Insurance Protection Plan
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto text-sm sm:text-base">
            Transparent pricing with 100% cashless emergency care, zero hidden costs, and compliant certificate delivery.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Recalculating live plans and benefits...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const isPopular = plan.popular
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border ${
                    isPopular
                      ? 'border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/20 shadow-2xl scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800 shadow-lg'
                  } p-6 transition-all duration-200 hover:shadow-xl`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                      ★ MOST POPULAR CHOICE
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {plan.badge}
                      </span>
                      {plan.schengenApproved && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          ✓ Schengen Valid
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {plan.name}
                    </h3>

                    {/* Sum Insured display */}
                    <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 uppercase font-semibold">
                        Medical Sum Insured
                      </div>
                      <div className="text-2xl font-black text-blue-950 dark:text-blue-200">
                        {plan.sumInsured}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Deductible: <strong>{plan.deductible}</strong>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="my-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">
                          ₹{plan.pricing.totalINR.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          (incl. GST)
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex justify-between">
                        <span>≈ ${plan.pricing.approxUSD} USD</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          ₹{plan.pricing.perDayINR}/day
                        </span>
                      </div>
                    </div>

                    {/* Key features */}
                    <div className="space-y-2.5 mb-6 text-xs sm:text-sm">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Coverage Highlights
                      </div>
                      {plan.features.slice(0, 6).map((f, fIdx) => (
                        <div key={fIdx} className="flex items-start justify-between gap-2">
                          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="text-emerald-500">✓</span> {f.name}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0 text-right">
                            {f.limit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(plan)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
                        isPopular
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <span>Get Policy / Quote</span>
                      <span>→</span>
                    </button>

                    <a
                      href={generateWhatsAppUrl(plan)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
                    >
                      <span>💬 WhatsApp Policy Desk</span>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Detailed Comparison Table */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-playfair">
              Detailed Plan Benefits Comparison
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Compare inclusions across all tiers to choose the optimal cover for your journey.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">Coverage Benefit</th>
                  <th className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">Standard Essential</th>
                  <th className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">Silver Comprehensive</th>
                  <th className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">Gold Elite</th>
                  <th className="py-3.5 px-4 font-bold text-purple-600 dark:text-purple-400">Student Elite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-3 px-4 font-semibold">Medical Expenses & Hospitalization</td>
                  <td className="py-3 px-4">$50,000 / $100,000</td>
                  <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">Up to $100,000</td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">Up to $250,000+</td>
                  <td className="py-3 px-4">Up to $250,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Cashless Hospital Network</td>
                  <td className="py-3 px-4">✓ Worldwide</td>
                  <td className="py-3 px-4">✓ Worldwide</td>
                  <td className="py-3 px-4">✓ Priority TPA</td>
                  <td className="py-3 px-4">✓ University Network</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Deductible / Excess per claim</td>
                  <td className="py-3 px-4">$100</td>
                  <td className="py-3 px-4">$50</td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">$0 (Zero Deductible)</td>
                  <td className="py-3 px-4">$50</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Trip Cancellation / Interruption</td>
                  <td className="py-3 px-4 text-slate-400">—</td>
                  <td className="py-3 px-4">Up to $1,500</td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">Up to $3,500</td>
                  <td className="py-3 px-4">Up to $1,500</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Loss of Checked Baggage</td>
                  <td className="py-3 px-4">Up to $500</td>
                  <td className="py-3 px-4">Up to $1,000</td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">Up to $2,000</td>
                  <td className="py-3 px-4">Up to $1,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Baggage Delay Reimbursement</td>
                  <td className="py-3 px-4">Up to $150</td>
                  <td className="py-3 px-4">Up to $250</td>
                  <td className="py-3 px-4">Up to $500</td>
                  <td className="py-3 px-4">Up to $250</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Loss of Passport & Documents</td>
                  <td className="py-3 px-4">Up to $250</td>
                  <td className="py-3 px-4">Up to $500</td>
                  <td className="py-3 px-4">Up to $1,000</td>
                  <td className="py-3 px-4">Up to $500</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Emergency Evacuation & Repatriation</td>
                  <td className="py-3 px-4">Up to $40,000</td>
                  <td className="py-3 px-4">Up to $75,000</td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">Up to $100,000</td>
                  <td className="py-3 px-4">Up to $75,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Schengen Embassy Acceptance</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">100% Guaranteed</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">100% Guaranteed</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">100% Guaranteed</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">100% Guaranteed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Emergency Claims Assistance Section */}
      <section className="bg-slate-100 dark:bg-slate-900/60 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-playfair">
              How to File a Claim in 4 Simple Steps
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">
              24/7 International assistance team ready to back you up anywhere in the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-black rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg">
                1
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Emergency Intimation</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Call the 24/7 international emergency toll-free number or message our claims desk immediately upon admission or flight event.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 font-black rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg">
                2
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Cashless Letter of Guarantee</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Our TPA desk sends a direct Guarantee of Payment (GOP) to the treating hospital for seamless cashless medical care.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 font-black rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg">
                3
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Document Collection</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Retain doctor prescriptions, medical diagnosis reports, airline PIR (Property Irregularity Report), and original bills.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 font-black rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg">
                4
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Direct Settlement</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Fast claims processing with direct bank transfer settlement for non-cashless expenses within 7 to 10 business days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-playfair">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
            Everything you need to know about international travel coverage and claim processing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, fIdx) => (
            <details
              key={fIdx}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm open:ring-1 open:ring-blue-500/20"
            >
              <summary className="flex items-center justify-between font-bold text-slate-900 dark:text-white cursor-pointer text-sm sm:text-base select-none">
                <span>{faq.q}</span>
                <span className="text-blue-500 group-open:rotate-180 transition-transform duration-200 ml-3">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Inquiry / Policy Issuance Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
            >
              ✕
            </button>

            {inquirySuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-playfair">
                  Quote Request Received!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 mb-4">
                  Reference: <strong className="text-blue-600 dark:text-blue-400">{inquiryRef}</strong>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Our insurance specialist will verify your details and email your official policy draft and payment link immediately.
                </p>

                <div className="flex flex-col gap-3">
                  {selectedPlan && (
                    <a
                      href={generateWhatsAppUrl(selectedPlan)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
                    >
                      <span>💬 Chat on WhatsApp for Instant Issuance</span>
                    </a>
                  )}
                  <button
                    onClick={() => setModalOpen(false)}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Policy Issuance Desk
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-playfair mt-0.5">
                    {selectedPlan?.name || 'Travel Insurance Plan'}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <span>Sum Insured: <strong>{selectedPlan?.sumInsured}</strong></span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      Total: ₹{selectedPlan?.pricing.totalINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Lead Traveler Full Name (as on Passport) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Passport Number (Optional - for embassy visa certificate)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Z1234567"
                      value={formData.passportNumber}
                      onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Additional Notes / Destination Details
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Schengen visa appointment on Friday, need urgent certificate"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submittingInquiry}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
                    >
                      {submittingInquiry ? (
                        <span>Submitting Request...</span>
                      ) : (
                        <span>Request Official Policy Certificate</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
