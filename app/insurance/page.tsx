'use client'

import React, { useState, useEffect } from 'react'

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
    return `https://wa.me/6591234567?text=${text}`
  }

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
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem', color: '#1E293B', fontFamily: 'var(--font-inter), sans-serif' }}>
      
      {/* ── Hero Section ── */}
      <section style={{ background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 60%, #0B192C 100%)', color: '#FFFFFF', padding: '3.5rem 1.5rem 4.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '50px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)', color: '#FCD34D', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.25rem' }}>
            <span>🛡️</span> Official Travel Insurance Desk
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, margin: '0 0 1.25rem', fontFamily: 'var(--font-playfair), serif', lineHeight: 1.2, color: '#FFFFFF' }}>
            Travel the World with <span style={{ color: '#FCD34D' }}>Complete Peace of Mind</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', opacity: 0.9, maxWidth: '720px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Embassy-approved Schengen visa compliance, up to <strong>$1,000,000 USD</strong> medical cover, 24/7 cashless hospital networks across 180+ countries, flight delay & baggage protection, and instant policy certificate issuance.
          </p>

          {/* Quick Hero Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'left' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '1rem', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span style={{ fontSize: '1.75rem' }}>🏥</span>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#93C5FD', textTransform: 'uppercase', fontWeight: 700 }}>Cashless Care</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF' }}>Global Hospital Network</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '1rem', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span style={{ fontSize: '1.75rem' }}>🇪🇺</span>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#86EFAC', textTransform: 'uppercase', fontWeight: 700 }}>Visa Approved</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF' }}>100% Schengen Guaranteed</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '1rem', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span style={{ fontSize: '1.75rem' }}>🧳</span>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#FDE047', textTransform: 'uppercase', fontWeight: 700 }}>Transit Shield</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF' }}>Baggage & Delay Cover</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '1rem', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span style={{ fontSize: '1.75rem' }}>⚡</span>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#D8B4FE', textTransform: 'uppercase', fontWeight: 700 }}>Instant Certificate</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF' }}>Issued in 2 Minutes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Quote Calculator Box ── */}
      <div style={{ maxWidth: '1120px', margin: '-2.5rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '2rem', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)', border: '1px solid #E2E8F0' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EEF2F6', paddingBottom: '1.25rem', marginBottom: '1.5rem', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F4C3A', margin: 0, fontFamily: 'var(--font-playfair), serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚡</span> Instant Travel Insurance Premium Calculator
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                Select your destination zone, dates, and travelers to compare live premiums.
              </p>
            </div>
            <div style={{ background: '#DCFCE7', color: '#166534', padding: '0.35rem 0.85rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ● Live Verified Rates
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Destination */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.45rem' }}>
                1. Destination Zone
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#0F172A', fontWeight: 600, fontSize: '0.9rem', outline: 'none' }}
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
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.45rem' }}>
                2. Travel Dates ({durationDays} Days Trip)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem 0.6rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#0F172A', fontWeight: 600, fontSize: '0.85rem' }}
                  />
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.2rem', paddingLeft: '0.25rem' }}>Departure</div>
                </div>
                <div>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem 0.6rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#0F172A', fontWeight: 600, fontSize: '0.85rem' }}
                  />
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.2rem', paddingLeft: '0.25rem' }}>Return</div>
                </div>
              </div>
            </div>

            {/* Medical Sum Insured */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.45rem' }}>
                3. Medical Sum Insured
              </label>
              <select
                value={sumInsuredUSD}
                onChange={(e) => setSumInsuredUSD(Number(e.target.value))}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#0F172A', fontWeight: 600, fontSize: '0.9rem', outline: 'none' }}
              >
                <option value={50000}>$50,000 USD (Essential)</option>
                <option value={100000}>$100,000 USD (Recommended - Popular)</option>
                <option value={250000}>$250,000 USD (Gold Protection)</option>
                <option value={500000}>$500,000 USD (Comprehensive)</option>
                <option value={1000000}>$1,000,000 USD (Ultra Shield)</option>
              </select>
            </div>
          </div>

          {/* Travelers Age Controls */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #EEF2F6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                4. Travelers ({travelers.length}) & Age
              </span>
              <button
                type="button"
                onClick={addTraveler}
                disabled={travelers.length >= 8}
                style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + Add Traveler
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {travelers.map((t, idx) => (
                <div key={t.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>P{idx + 1}:</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={t.age}
                    onChange={(e) => updateTravelerAge(t.id, parseInt(e.target.value) || 1)}
                    style={{ width: '48px', padding: '0.25rem 0.35rem', borderRadius: '6px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>yrs</span>
                  {travelers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTraveler(t.id)}
                      style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Optional Riders */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #EEF2F6', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.5rem' }}>
              Optional Riders:
            </span>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: '#F1F5F9', padding: '0.45rem 0.85rem', borderRadius: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={adventureSports}
                onChange={(e) => setAdventureSports(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#0F4C3A' }}
              />
              <span>⛷️ Adventure Sports Rider</span>
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: '#F1F5F9', padding: '0.45rem 0.85rem', borderRadius: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={pedCover}
                onChange={(e) => setPedCover(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#0F4C3A' }}
              />
              <span>❤️ Pre-existing Condition (PED) Emergency Life-Threatening Cover</span>
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: '#F1F5F9', padding: '0.45rem 0.85rem', borderRadius: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={tripCancellationAddon}
                onChange={(e) => setTripCancellationAddon(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#0F4C3A' }}
              />
              <span>✈️ Trip Cancellation Any Reason Cover</span>
            </label>
          </div>

        </div>
      </div>

      {/* ── Plans Display Grid ── */}
      <section style={{ maxWidth: '1120px', margin: '4rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#0F4C3A', fontFamily: 'var(--font-playfair), serif', margin: '0 0 0.5rem' }}>
            Choose Your Protection Plan
          </h2>
          <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Transparent pricing with 100% cashless emergency care, zero hidden deductions, and instant visa certificates.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #0F4C3A', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#64748B', fontWeight: 600 }}>Calculating tailored insurance options...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {plans.map((plan) => {
              const isPopular = plan.popular
              return (
                <div
                  key={plan.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: isPopular ? '2px solid #D97706' : '1px solid #E2E8F0',
                    padding: '1.75rem 1.5rem',
                    boxShadow: isPopular ? '0 20px 30px -10px rgba(217, 119, 6, 0.15)' : '0 10px 25px -5px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                  }}
                >
                  {isPopular && (
                    <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)', color: '#FFF', fontSize: '0.72rem', fontWeight: 800, padding: '0.25rem 0.85rem', borderRadius: '50px', letterSpacing: '0.05em', whiteSpace: 'nowrap', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                      ★ MOST POPULAR
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '50px', background: '#F1F5F9', color: '#475569' }}>
                        {plan.badge}
                      </span>
                      {plan.schengenApproved && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16A34A' }}>
                          ✓ Schengen Valid
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.85rem', fontFamily: 'var(--font-playfair), serif' }}>
                      {plan.name}
                    </h3>

                    {/* Medical sum insured badge */}
                    <div style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase' }}>Medical Sum Insured</div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#14532D' }}>{plan.sumInsured}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                        Deductible: <strong>{plan.deductible}</strong>
                      </div>
                    </div>

                    {/* Premium */}
                    <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                        <span style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A' }}>
                          ₹{plan.pricing.totalINR.toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>(incl. GST)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B', marginTop: '0.35rem' }}>
                        <span>≈ ${plan.pricing.approxUSD} USD</span>
                        <span style={{ color: '#0F4C3A', fontWeight: 700 }}>₹{plan.pricing.perDayINR}/day</span>
                      </div>
                    </div>

                    {/* Benefits bullet points */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem' }}>
                        Coverage Highlights
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {plan.features.slice(0, 6).map((f, fIdx) => (
                          <div key={fIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', gap: '0.5rem' }}>
                            <span style={{ color: '#475569' }}>
                              <span style={{ color: '#16A34A', fontWeight: 900, marginRight: '0.35rem' }}>✓</span>
                              {f.name}
                            </span>
                            <span style={{ fontWeight: 700, color: '#0F172A', textAlign: 'right', flexShrink: 0 }}>
                              {f.limit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenModal(plan)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        background: isPopular ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)' : '#0F4C3A',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                      }}
                    >
                      Get Policy / Quote →
                    </button>

                    <a
                      href={generateWhatsAppUrl(plan)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem',
                        borderRadius: '10px',
                        background: '#F1F5F9',
                        color: '#334155',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        textAlign: 'center',
                        display: 'block',
                      }}
                    >
                      💬 WhatsApp Policy Desk
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Comparison Table ── */}
      <section style={{ maxWidth: '1120px', margin: '4rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.03)' }}>
          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F4C3A', fontFamily: 'var(--font-playfair), serif', margin: '0 0 0.35rem' }}>
            Detailed Plan Benefits Comparison
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.5rem' }}>
            Compare key limits and deductibles across our travel insurance tiers.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#334155' }}>Coverage Benefit</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#334155' }}>Standard Essential</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#D97706' }}>Silver Comprehensive</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0F4C3A' }}>Gold Elite</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#7C3AED' }}>Student Elite</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Medical Expenses & Hospitalization</td>
                  <td style={{ padding: '0.75rem 1rem' }}>$50,000 / $100,000</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#D97706' }}>Up to $100,000</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0F4C3A' }}>Up to $250,000+</td>
                  <td style={{ padding: '0.75rem 1rem' }}>Up to $250,000</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Cashless Hospital Network</td>
                  <td style={{ padding: '0.75rem 1rem' }}>✓ Worldwide</td>
                  <td style={{ padding: '0.75rem 1rem' }}>✓ Worldwide</td>
                  <td style={{ padding: '0.75rem 1rem' }}>✓ Priority TPA</td>
                  <td style={{ padding: '0.75rem 1rem' }}>✓ University Network</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Deductible / Excess per claim</td>
                  <td style={{ padding: '0.75rem 1rem' }}>$100</td>
                  <td style={{ padding: '0.75rem 1rem' }}>$50</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#16A34A' }}>$0 (Zero Deductible)</td>
                  <td style={{ padding: '0.75rem 1rem' }}>$50</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Trip Cancellation / Interruption</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94A3B8' }}>—</td>
                  <td style={{ padding: '0.75rem 1rem' }}>Up to $1,500</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Up to $3,500</td>
                  <td style={{ padding: '0.75rem 1rem' }}>Up to $1,500</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Loss of Checked Baggage</td>
                  <td style={{ padding: '0.75rem 1rem' }}>Up to $500</td>
                  <td style={{ padding: '0.75rem 1rem' }}>Up to $1,000</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Up to $2,000</td>
                  <td style={{ padding: '0.75rem 1rem' }}>Up to $1,000</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Baggage Delay Reimbursement</td>
                  <td style={{ padding: '0.75rem 1rem' }}>Up to $150</td>
                  <td style={{ padding: '0.75rem 1rem' }}>Up to $250</td>
                  <td style={{ padding: '0.75rem 1rem' }}>Up to $500</td>
                  <td style={{ padding: '0.75rem 1rem' }}>Up to $250</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Schengen Visa Compliance</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#16A34A', fontWeight: 800 }}>100% Guaranteed</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#16A34A', fontWeight: 800 }}>100% Guaranteed</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#16A34A', fontWeight: 800 }}>100% Guaranteed</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#16A34A', fontWeight: 800 }}>100% Guaranteed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 4-Step Claim Process ── */}
      <section style={{ maxWidth: '1120px', margin: '4rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#0F4C3A', fontFamily: 'var(--font-playfair), serif', margin: '0 0 0.5rem' }}>
            How to File an Overseas Claim
          </h2>
          <p style={{ color: '#64748B', fontSize: '1rem' }}>
            24/7 International assistance team ready to back you up anywhere in the world.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '1.75rem 1.25rem', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', fontWeight: 900, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              1
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>Emergency Intimation</h4>
            <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Call the 24/7 emergency toll-free number or contact our claims desk immediately upon admission or flight event.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '1.75rem 1.25rem', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', fontWeight: 900, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              2
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>Cashless Guarantee (GOP)</h4>
            <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Our TPA desk sends a direct Guarantee of Payment (GOP) to the treating hospital for seamless cashless medical care.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '1.75rem 1.25rem', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F3E8FF', color: '#7C3AED', fontWeight: 900, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              3
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>Document Collection</h4>
            <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Retain doctor prescriptions, medical diagnosis reports, airline PIR, and original invoices.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '1.75rem 1.25rem', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#DCFCE7', color: '#15803D', fontWeight: 900, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              4
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>Direct Settlement</h4>
            <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Fast claims processing with direct bank transfer settlement for non-cashless expenses within 7 to 10 working days.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section style={{ maxWidth: '820px', margin: '4rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F4C3A', fontFamily: 'var(--font-playfair), serif', margin: '0 0 0.5rem' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Quick answers about international coverage and claims.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, fIdx) => (
            <details
              key={fIdx}
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
            >
              <summary style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem', cursor: 'pointer', outline: 'none' }}>
                {faq.q}
              </summary>
              <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.6, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', margin: '0.75rem 0 0' }}>
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Inquiry Modal ── */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '18px', maxWidth: '520px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <button
              onClick={() => setModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', fontSize: '1.25rem', fontWeight: 800, color: '#94A3B8', cursor: 'pointer' }}
            >
              ✕
            </button>

            {inquirySuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-playfair), serif', margin: '0 0 0.5rem' }}>
                  Quote Request Received!
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B', margin: '0 0 1rem' }}>
                  Reference: <strong style={{ color: '#0F4C3A' }}>{inquiryRef}</strong>
                </p>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
                  Our travel insurance specialist will review your details and email your official policy draft and secure payment link immediately.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedPlan && (
                    <a
                      href={generateWhatsAppUrl(selectedPlan)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: '#16A34A', color: '#FFF', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', display: 'block' }}
                    >
                      💬 Chat on WhatsApp for Instant Issuance
                    </a>
                  )}
                  <button
                    onClick={() => setModalOpen(false)}
                    style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: '#F1F5F9', color: '#334155', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ borderBottom: '1px solid #EEF2F6', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F4C3A', textTransform: 'uppercase' }}>
                    Policy Issuance Desk
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0.25rem 0', fontFamily: 'var(--font-playfair), serif' }}>
                    {selectedPlan?.name || 'Travel Insurance Plan'}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginTop: '0.5rem' }}>
                    <span>Sum Insured: <strong>{selectedPlan?.sumInsured}</strong></span>
                    <span style={{ color: '#16A34A', fontWeight: 800, fontSize: '0.95rem' }}>
                      Total: ₹{selectedPlan?.pricing.totalINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Lead Traveler Full Name (as on Passport) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.9rem', color: '#0F172A' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem', color: '#0F172A' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem', color: '#0F172A' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Passport Number (Optional - for visa certificate)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Z1234567"
                      value={formData.passportNumber}
                      onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem', color: '#0F172A' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Additional Notes / Destination Details
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Schengen visa appointment on Friday, need urgent certificate"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem', color: '#0F172A' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    style={{
                      width: '100%',
                      padding: '0.9rem',
                      borderRadius: '10px',
                      background: '#0F4C3A',
                      color: '#FFF',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      border: 'none',
                      cursor: 'pointer',
                      marginTop: '0.5rem',
                    }}
                  >
                    {submittingInquiry ? 'Submitting Request...' : 'Request Official Policy Certificate'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
