'use client'

import React, { useState, useEffect } from 'react'

interface Traveler {
  id: number
  age: number
}

interface PassengerDetail {
  id: number
  name: string
  passport: string
  dob: string
  gender: string
  age: number
  preExistingMedicalCondition: string
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

  // Travelers in calculator
  const [travelers, setTravelers] = useState<Traveler[]>([{ id: 1, age: 30 }])

  // Passenger KYC Details for Modal (Synchronized with travelers)
  const [passengers, setPassengers] = useState<PassengerDetail[]>([
    { id: 1, name: '', passport: '', dob: '1992-05-15', gender: 'Male', age: 30, preExistingMedicalCondition: 'None' },
  ])

  // Synchronize passengers array whenever travelers count or ages change
  useEffect(() => {
    setPassengers((prev) => {
      return travelers.map((t, idx) => {
        const existing = prev[idx]
        return {
          id: t.id,
          name: existing?.name || '',
          passport: existing?.passport || '',
          dob: existing?.dob || '1992-05-15',
          gender: existing?.gender || 'Male',
          age: t.age || 30,
          preExistingMedicalCondition: existing?.preExistingMedicalCondition || 'None',
        }
      })
    })
  }, [travelers])

  // Contact Details
  const [contactData, setContactData] = useState({
    email: '',
    phone: '',
    nominee: '',
    relation: 'Spouse',
    emergencyContactPerson: '',
    emergencyContactNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    gstState: '',
  })

  // Optional Flight & Student Details
  const [flightData, setFlightData] = useState({
    flightNumber: '',
    pnrNumber: '',
    departureAirportCode: '',
    arrivalAirportCode: '',
  })
  const [studentData, setStudentData] = useState({
    universityName: '',
    universityAddress: '',
  })

  // Sum Insured & Addons
  const [sumInsuredUSD, setSumInsuredUSD] = useState<number>(100000)
  const [adventureSports, setAdventureSports] = useState<boolean>(false)
  const [pedCover, setPedCover] = useState<boolean>(false)
  const [tripCancellationAddon, setTripCancellationAddon] = useState<boolean>(false)

  // Plan loading & selection
  const [plans, setPlans] = useState<InsurancePlan[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null)

  // Inquiry / Policy Issuance State
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [submittingInquiry, setSubmittingInquiry] = useState<boolean>(false)
  const [issuedPolicy, setIssuedPolicy] = useState<any | null>(null)

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
      const newId = Date.now()
      setTravelers([...travelers, { id: newId, age: 28 }])
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

  const updatePassenger = (idx: number, field: keyof PassengerDetail, value: any) => {
    setPassengers((prev) => {
      const updated = [...prev]
      if (updated[idx]) {
        updated[idx] = { ...updated[idx], [field]: value }
      }
      return updated
    })
  }

  const handleOpenModal = (plan: InsurancePlan) => {
    setSelectedPlan(plan)
    setIssuedPolicy(null)
    setModalOpen(true)
  }

  const handlePolicyIssuanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all passengers have name & passport
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].name || !passengers[i].passport) {
        alert(`Please fill in Traveler #${i + 1} Full Name and Passport Number.`)
        return
      }
    }

    if (!contactData.phone || !contactData.email) {
      alert('Please fill in contact email and phone number.')
      return
    }

    setSubmittingInquiry(true)
    try {
      const res = await fetch('/api/insurance/issue-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          durationDays,
          planId: selectedPlan?.id || 'standard_essential',
          planName: selectedPlan?.name || 'Selected Travel Insurance Plan',
          sumInsured: selectedPlan?.sumInsured || `$${sumInsuredUSD.toLocaleString()} USD`,
          sumInsuredVal: selectedPlan?.sumInsuredVal || sumInsuredUSD,
          deductible: selectedPlan?.deductible || '$50',
          premiumTotalINR: selectedPlan?.pricing.totalINR || 0,
          approxUSD: selectedPlan?.pricing.approxUSD || 0,
          travelers: passengers.map(p => ({
            name: p.name.trim(),
            passport: p.passport.toUpperCase().trim(),
            dob: p.dob,
            gender: p.gender,
            age: p.age,
            preExistingMedicalCondition: p.preExistingMedicalCondition,
          })),
          flightDetails: flightData.flightNumber ? flightData : undefined,
          studentDetails: selectedPlan?.id === 'student_elite' && studentData.universityName ? studentData : undefined,
          contact: {
            email: contactData.email,
            mobileNo: contactData.phone,
            address: contactData.address || 'Traveler Address',
            city: contactData.city || 'Bengaluru',
            state: contactData.state || 'Karnataka',
            pincode: contactData.pincode || '560001',
            nominee: contactData.nominee || passengers[0]?.name || 'Nominee',
            relation: contactData.relation || 'Spouse',
            emergencyContactPerson: contactData.emergencyContactPerson || contactData.nominee || passengers[0]?.name,
            emergencyContactNumber: contactData.emergencyContactNumber || contactData.phone,
            gstNumber: contactData.gstNumber,
            gstState: contactData.gstState,
          },
        }),
      })
      const result = await res.json()
      if (result.success && result.policy) {
        setIssuedPolicy(result.policy)
      } else {
        alert(result.error || 'Failed to issue policy certificate. Please check all details.')
      }
    } catch (err) {
      console.error('Policy issuance failed:', err)
      alert('An unexpected error occurred while generating policy. Please try again.')
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
      
      {/* ── Strict 1-Page Dedicated Print Stylesheet ── */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: #FFFFFF !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 10pt !important;
          }
          /* Hide all screen components */
          body * {
            visibility: hidden !important;
          }
          /* Show ONLY the official certificate document */
          #insurance-certificate-print,
          #insurance-certificate-print * {
            visibility: visible !important;
          }
          #insurance-certificate-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
            border: 2px solid #0F4C3A !important;
            border-radius: 6px !important;
            background: #FFFFFF !important;
            box-shadow: none !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ── Hero Section ── */}
      <section style={{ background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 60%, #0B192C 100%)', color: '#FFFFFF', padding: '2rem 1.25rem 3.25rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: '50px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.35)', color: '#FCD34D', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            <span>🛡️</span> Official Travel Insurance Desk
          </div>

          <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, margin: '0 0 0.65rem', fontFamily: 'var(--font-playfair), serif', lineHeight: 1.2, color: '#FFFFFF' }}>
            Travel the World with <span style={{ color: '#FCD34D' }}>Complete Peace of Mind</span>
          </h1>

          <p style={{ fontSize: '0.92rem', opacity: 0.9, maxWidth: '680px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
            Schengen visa approved, up to <strong>$1,000,000 USD</strong> medical cover, 24/7 cashless hospital networks in 180+ countries, baggage delay protection & instant certificate delivery.
          </p>

          {/* Quick Hero Badges — Compact Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', textAlign: 'left' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', padding: '0.55rem 0.75rem', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🏥</span>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#93C5FD', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1 }}>Cashless Care</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFF', marginTop: '0.15rem' }}>Global Hospitals</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', padding: '0.55rem 0.75rem', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🇪🇺</span>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#86EFAC', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1 }}>Visa Approved</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFF', marginTop: '0.15rem' }}>100% Schengen</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', padding: '0.55rem 0.75rem', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🧳</span>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#FDE047', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1 }}>Transit Shield</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFF', marginTop: '0.15rem' }}>Baggage & Delay</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', padding: '0.55rem 0.75rem', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⚡</span>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#D8B4FE', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1 }}>Instant Policy</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFF', marginTop: '0.15rem' }}>Issued in 2 Mins</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Quote Calculator Box ── */}
      <div style={{ maxWidth: '1120px', margin: '-1.75rem auto 0', padding: '0 1.25rem', position: 'relative', zIndex: 10 }}>
        <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem 1.75rem', boxShadow: '0 15px 35px -10px rgba(0, 0, 0, 0.08)', border: '1px solid #E2E8F0' }}>
          
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
                4. Travelers Count ({travelers.length}) & Ages
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
            Transparent pricing for all {travelers.length} traveler(s) with 100% cashless emergency care and instant visa certificates.
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
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>(for {travelers.length} traveler{travelers.length > 1 ? 's' : ''}, incl. GST)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B', marginTop: '0.35rem' }}>
                        <span>≈ ${plan.pricing.approxUSD} USD total</span>
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
                      Issue Policy ({travelers.length} Person{travelers.length > 1 ? 's' : ''}) →
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

      {/* ── Policy Issuance & Certificate Modal ── */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '18px', maxWidth: '680px', width: '100%', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}>
            
            <button
              onClick={() => setModalOpen(false)}
              className="no-print"
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '1rem', fontWeight: 800, color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>

            {issuedPolicy ? (
              /* ── Official Single-Page Certificate Document ── */
              <div style={{ padding: '0.25rem 0' }}>
                <div id="insurance-certificate-print" style={{ border: '2px solid #0F4C3A', borderRadius: '12px', background: '#FFFFFF', padding: '1.25rem', color: '#0F172A', fontFamily: 'var(--font-inter), sans-serif' }}>
                  
                  {/* Certificate Top Brand & Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0F4C3A', paddingBottom: '0.75rem', marginBottom: '0.85rem' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        FLYING WONDERS TRAVEL INSURANCE · ASEGO PARTNER
                      </div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F4C3A', fontFamily: 'var(--font-playfair), serif', margin: '0.15rem 0' }}>
                        Certificate of Travel Insurance
                      </h3>
                      <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                        Compliant with Regulation (EC) No 810/2009 (European Parliament Schengen Visa Standard)
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-block', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                        ✓ POLICY ACTIVE & VERIFIED
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.25rem' }}>
                        Security Hash: <strong style={{ color: '#1D4ED8' }}>{issuedPolicy.verificationHash}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Core Reference Details Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.55rem 0.75rem', marginBottom: '0.85rem', fontSize: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Policy Number</div>
                      <div style={{ fontWeight: 900, color: '#0F4C3A', fontSize: '0.82rem' }}>{issuedPolicy.policyNumber}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Certificate Ref</div>
                      <div style={{ fontWeight: 800, color: '#1D4ED8', fontSize: '0.82rem' }}>{issuedPolicy.certificateNumber}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Plan Type</div>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>{issuedPolicy.planName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Medical Sum Insured</div>
                      <div style={{ fontWeight: 900, color: '#15803D', fontSize: '0.82rem' }}>{issuedPolicy.sumInsured}</div>
                    </div>
                  </div>

                  {/* Trip Details & Flight Routing */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem', marginBottom: '0.85rem', fontSize: '0.75rem' }}>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Destination: </span>
                      <strong style={{ color: '#0F172A' }}>{issuedPolicy.destination}</strong>
                      {issuedPolicy.flightDetails?.flightNumber && (
                        <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: '0.15rem' }}>
                          Flight: {issuedPolicy.flightDetails.flightNumber} ({issuedPolicy.flightDetails.route})
                        </div>
                      )}
                    </div>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Cover Period: </span>
                      <strong style={{ color: '#0F172A' }}>{issuedPolicy.startDate} to {issuedPolicy.endDate} ({issuedPolicy.durationDays} Days)</strong>
                      {issuedPolicy.studentDetails?.universityName && (
                        <div style={{ fontSize: '0.68rem', color: '#7C3AED', marginTop: '0.15rem' }}>
                          University: {issuedPolicy.studentDetails.universityName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Table of Insured Travelers */}
                  <div style={{ marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F4C3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                      Insured Travelers ({issuedPolicy.travelers.length})
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', border: '1px solid #E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
                      <thead>
                        <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1', textAlign: 'left' }}>
                          <th style={{ padding: '0.4rem 0.55rem', fontWeight: 800 }}>#</th>
                          <th style={{ padding: '0.4rem 0.55rem', fontWeight: 800 }}>Traveler Full Name</th>
                          <th style={{ padding: '0.4rem 0.55rem', fontWeight: 800 }}>Passport No.</th>
                          <th style={{ padding: '0.4rem 0.55rem', fontWeight: 800 }}>Date of Birth</th>
                          <th style={{ padding: '0.4rem 0.55rem', fontWeight: 800 }}>Gender</th>
                          <th style={{ padding: '0.4rem 0.55rem', fontWeight: 800 }}>Age</th>
                        </tr>
                      </thead>
                      <tbody>
                        {issuedPolicy.travelers.map((t: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                            <td style={{ padding: '0.4rem 0.55rem', fontWeight: 700 }}>{idx + 1}</td>
                            <td style={{ padding: '0.4rem 0.55rem', fontWeight: 800, color: '#0F172A' }}>{t.name}</td>
                            <td style={{ padding: '0.4rem 0.55rem', fontWeight: 800, color: '#0F4C3A' }}>{t.passport}</td>
                            <td style={{ padding: '0.4rem 0.55rem' }}>{t.dob}</td>
                            <td style={{ padding: '0.4rem 0.55rem' }}>{t.gender}</td>
                            <td style={{ padding: '0.4rem 0.55rem' }}>{t.age} yrs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Comprehensive Schedule of Covered Benefits Table */}
                  <div style={{ marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F4C3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                      Schedule of Covered Benefits (Zero Deductible / Excess)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', fontSize: '0.68rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.5rem 0.65rem' }}>
                      <div>
                        <span style={{ color: '#64748B' }}>Medical & Hospitalization:</span><br/>
                        <strong style={{ color: '#15803D' }}>{issuedPolicy.sumInsured}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Medical Evacuation / Air Ambulance:</span><br/>
                        <strong style={{ color: '#0F172A' }}>Up to $50,000 USD</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Repatriation of Mortal Remains:</span><br/>
                        <strong style={{ color: '#0F172A' }}>Up to $25,000 USD</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Trip Cancellation & Interruption:</span><br/>
                        <strong style={{ color: '#0F172A' }}>Up to $1,500 – $3,500 USD</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Loss of Passport & Documents:</span><br/>
                        <strong style={{ color: '#0F172A' }}>Up to $500 – $1,000 USD</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Baggage Loss & Delay (&gt;12h):</span><br/>
                        <strong style={{ color: '#0F172A' }}>Up to $1,500 USD</strong>
                      </div>
                    </div>
                  </div>

                  {/* Assistance Services List */}
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '0.45rem 0.65rem', marginBottom: '0.75rem', fontSize: '0.68rem' }}>
                    <strong style={{ color: '#166534' }}>Included Assistance Services: </strong>
                    <span style={{ color: '#15803D' }}>
                      24/7 Cashless Hospital Network · Doctor on Call / Teleconsultation · Emergency Cash Advance · Compassionate Family Visit · Embassy Visa Assistance Guarantee
                    </span>
                  </div>

                  {/* Emergency Contact & Legal Endorsement Footer */}
                  <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '0.55rem', fontSize: '0.68rem', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: '#DC2626', fontWeight: 800 }}>🚨 24/7 International Emergency TPA: </span>
                      <strong style={{ color: '#991B1B' }}>{issuedPolicy.emergencyHelpline}</strong>
                      <div style={{ marginTop: '0.15rem', color: '#64748B' }}>
                        Lead Contact: {issuedPolicy.contact.mobileNo} · {issuedPolicy.contact.email} · Premium: ₹{issuedPolicy.premiumTotalINR.toLocaleString('en-IN')} (PAID)
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#0F4C3A' }}>Flying Wonders Travel Services Pvt Ltd</div>
                      <div style={{ fontSize: '0.62rem', color: '#94A3B8' }}>Authorised Overseas Travel Insurance Desk</div>
                    </div>
                  </div>

                </div>

                {/* On-Screen Action Buttons (Hidden when printing) */}
                <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: '#0F4C3A', color: '#FFF', fontWeight: 800, fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(15, 76, 58, 0.2)' }}
                  >
                    <span>🖨️</span> Print / Save Clean 1-Page PDF
                  </button>

                  <a
                    href={`https://wa.me/6591234567?text=${encodeURIComponent(`Hello Flying Wonders, I have generated Policy ${issuedPolicy.policyNumber} for ${issuedPolicy.travelers.map((t: any) => t.name).join(', ')} (${issuedPolicy.destination}). Please send me the official certificate.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: '#16A34A', color: '#FFF', fontWeight: 800, fontSize: '0.88rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textAlign: 'center' }}
                  >
                    <span>💬</span> WhatsApp Policy Certificate
                  </a>
                </div>

                <div className="no-print" style={{ textAlign: 'center', marginTop: '0.85rem' }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              /* ── Multi-Passenger Details & Issuance Form ── */
              <div>
                <div style={{ borderBottom: '1px solid #EEF2F6', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F4C3A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Official Policy Issuance
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0', fontFamily: 'var(--font-playfair), serif' }}>
                    {selectedPlan?.name || 'Travel Insurance Plan'}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginTop: '0.35rem' }}>
                    <span>Travelers: <strong>{passengers.length} Person{passengers.length > 1 ? 's' : ''}</strong> ({selectedPlan?.sumInsured})</span>
                    <span style={{ color: '#16A34A', fontWeight: 800, fontSize: '0.95rem' }}>
                      Total: ₹{selectedPlan?.pricing.totalINR.toLocaleString('en-IN')} (incl. GST)
                    </span>
                  </div>
                </div>

                <form onSubmit={handlePolicyIssuanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Dynamic Passenger Sections */}
                  {passengers.map((p, idx) => (
                    <div key={p.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0F4C3A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          👤 Traveler #{idx + 1} {idx === 0 ? '(Lead Traveler)' : ''} — Age: {p.age} yrs
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            Full Name (as per Passport) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={`e.g. ${idx === 0 ? 'Rahul Ramesh Sharma' : 'Priya Rahul Sharma'}`}
                            value={p.name}
                            onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.88rem', color: '#0F172A' }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '0.5rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                              Passport Number *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Z1234567"
                              value={p.passport}
                              onChange={(e) => updatePassenger(idx, 'passport', e.target.value)}
                              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.85rem', color: '#0F172A', textTransform: 'uppercase' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                              Date of Birth *
                            </label>
                            <input
                              type="date"
                              required
                              value={p.dob}
                              onChange={(e) => updatePassenger(idx, 'dob', e.target.value)}
                              style={{ width: '100%', padding: '0.6rem 0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.8rem', color: '#0F172A' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                              Gender *
                            </label>
                            <select
                              value={p.gender}
                              onChange={(e) => updatePassenger(idx, 'gender', e.target.value)}
                              style={{ width: '100%', padding: '0.6rem 0.4rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.8rem', color: '#0F172A' }}
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                            Pre-existing medical conditions (if any):
                          </label>
                          <input
                            type="text"
                            placeholder="None / Diabetes / Hypertension / etc."
                            value={p.preExistingMedicalCondition}
                            onChange={(e) => updatePassenger(idx, 'preExistingMedicalCondition', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', fontSize: '0.8rem', color: '#0F172A' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Flight & Routing Information (Optional) */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0F4C3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
                      ✈️ Flight & Routing Details (Optional)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#475569', marginBottom: '0.15rem' }}>Flight Number</label>
                        <input
                          type="text"
                          placeholder="e.g. SQ401"
                          value={flightData.flightNumber}
                          onChange={(e) => setFlightData({ ...flightData, flightNumber: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.8rem', color: '#0F172A' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#475569', marginBottom: '0.15rem' }}>Booking PNR</label>
                        <input
                          type="text"
                          placeholder="e.g. X9Y2Z1"
                          value={flightData.pnrNumber}
                          onChange={(e) => setFlightData({ ...flightData, pnrNumber: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.8rem', color: '#0F172A' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#475569', marginBottom: '0.15rem' }}>Depart Airport</label>
                        <input
                          type="text"
                          placeholder="e.g. BLR"
                          value={flightData.departureAirportCode}
                          onChange={(e) => setFlightData({ ...flightData, departureAirportCode: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.8rem', color: '#0F172A' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#475569', marginBottom: '0.15rem' }}>Arrival Airport</label>
                        <input
                          type="text"
                          placeholder="e.g. SIN / FRA"
                          value={flightData.arrivalAirportCode}
                          onChange={(e) => setFlightData({ ...flightData, arrivalAirportCode: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.8rem', color: '#0F172A' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Student Details (If Student Elite selected) */}
                  {selectedPlan?.id === 'student_elite' && (
                    <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '12px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
                        🎓 Overseas University Information
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#475569', marginBottom: '0.15rem' }}>University Name</label>
                          <input
                            type="text"
                            placeholder="e.g. National University of Singapore"
                            value={studentData.universityName}
                            onChange={(e) => setStudentData({ ...studentData, universityName: e.target.value })}
                            style={{ width: '100%', padding: '0.55rem 0.6rem', borderRadius: '6px', border: '1px solid #D8B4FE', background: '#FFFFFF', fontSize: '0.8rem', color: '#0F172A' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#475569', marginBottom: '0.15rem' }}>Campus Address</label>
                          <input
                            type="text"
                            placeholder="e.g. 21 Lower Kent Ridge Rd, Singapore"
                            value={studentData.universityAddress}
                            onChange={(e) => setStudentData({ ...studentData, universityAddress: e.target.value })}
                            style={{ width: '100%', padding: '0.55rem 0.6rem', borderRadius: '6px', border: '1px solid #D8B4FE', background: '#FFFFFF', fontSize: '0.8rem', color: '#0F172A' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact & Policy Delivery Information */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0F4C3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
                      📋 Policy Delivery & Emergency Contacts
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            Email Address (for Certificate PDF) *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={contactData.email}
                            onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.85rem', color: '#0F172A' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            Phone / WhatsApp *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            value={contactData.phone}
                            onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.85rem', color: '#0F172A' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            Nominee Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Next of Kin"
                            value={contactData.nominee}
                            onChange={(e) => setContactData({ ...contactData, nominee: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.85rem', color: '#0F172A' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            Nominee Relationship
                          </label>
                          <select
                            value={contactData.relation}
                            onChange={(e) => setContactData({ ...contactData, relation: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.82rem', color: '#0F172A' }}
                          >
                            <option value="Spouse">Spouse</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Child">Child</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            City & State
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Bengaluru, Karnataka"
                            value={contactData.city}
                            onChange={(e) => setContactData({ ...contactData, city: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.85rem', color: '#0F172A' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            Pincode
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 560001"
                            value={contactData.pincode}
                            onChange={(e) => setContactData({ ...contactData, pincode: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.85rem', color: '#0F172A' }}
                          />
                        </div>
                      </div>

                      {/* GST Details for Corporate Invoice (Optional) */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', borderTop: '1px solid #EEF2F6', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#64748B', marginBottom: '0.15rem' }}>GST Number (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. 29AAAAA0000A1Z5"
                            value={contactData.gstNumber}
                            onChange={(e) => setContactData({ ...contactData, gstNumber: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', fontSize: '0.78rem', color: '#0F172A', textTransform: 'uppercase' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#64748B', marginBottom: '0.15rem' }}>GST State</label>
                          <input
                            type="text"
                            placeholder="e.g. Karnataka"
                            value={contactData.gstState}
                            onChange={(e) => setContactData({ ...contactData, gstState: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', fontSize: '0.78rem', color: '#0F172A' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    style={{
                      width: '100%',
                      padding: '0.9rem',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)',
                      color: '#FFF',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(15, 76, 58, 0.25)',
                    }}
                  >
                    {submittingInquiry ? '⚡ Issuing Official Certificate...' : `⚡ Issue Policy for ${passengers.length} Traveler${passengers.length > 1 ? 's' : ''}`}
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
