'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdBanner from '../../components/AdBanner'
import { client } from '../../sanity/lib/client'
import { 
  FileText, 
  Globe, 
  Calculator, 
  CheckSquare, 
  Utensils, 
  Clock, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Compass, 
  Sparkles,
  Phone,
  HelpCircle,
  Bus,
  Plane,
  Search,
  Loader2
} from 'lucide-react'

export default function TravelToolsPage() {
  const [activeVisaTab, setActiveVisaTab] = useState<'sg' | 'my' | 'crossborder'>('sg')
  
  // Sanity Dynamic Settings
  const [sanitySettings, setSanitySettings] = useState<{
    heroTitle?: string
    heroSubtitle?: string
    hideOfficialPortals?: boolean
    hideScamAdvisory?: boolean
    hideVisaChecklist?: boolean
    hideCurrencyConverter?: boolean
    hideMealEstimator?: boolean
    hideInteractiveChecklist?: boolean
    hideAttractionAllocator?: boolean
    hideFlightTracker?: boolean
    sgacOfficialLink?: string
    mdacOfficialLink?: string
    sgVisaStatusLink?: string
    airSuvidhaLink?: string
    hideAirSuvidha?: boolean
  }>({})

  // AirLabs Live Flight Search State
  const [flightNumberInput, setFlightNumberInput] = useState<string>('')
  const [flightLoading, setFlightLoading] = useState<boolean>(false)
  const [flightResult, setFlightResult] = useState<any>(null)
  const [flightError, setFlightError] = useState<string | null>(null)

  // Currency Calculator States
  const [amountSgd, setAmountSgd] = useState<number>(100)
  const [sgdToInrRate, setSgdToInrRate] = useState<number>(74.50)
  const [sgdToMyrRate, setSgdToMyrRate] = useState<number>(3.35)
  const [rateLoaded, setRateLoaded] = useState<boolean>(false)

  // Meal Estimator States
  const [days, setDays] = useState<number>(4)
  const [adults, setAdults] = useState<number>(2)
  const [kids, setKids] = useState<number>(0)
  const [diningStyle, setDiningStyle] = useState<'budget' | 'balanced' | 'luxury'>('balanced')

  // Interactive Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    passport: true,
    sgac: false,
    mdac: false,
    insurance: true,
    tickets: true,
    adapter: false,
    forex: false,
    sim: false
  })

  useEffect(() => {
    // Fetch live exchange rate
    fetch('/api/exchange-rate')
      .then(res => res.json())
      .then(data => {
        if (data.rate) {
          setSgdToInrRate(data.rate)
          setRateLoaded(true)
        }
      })
      .catch(err => console.error('Exchange rate fetch error:', err))

    // Fetch Sanity Travel Tools Settings
    client.fetch(`*[_type == "travelTools"][0]`)
      .then(res => {
        if (res) setSanitySettings(res)
      })
      .catch(err => console.error('Travel tools Sanity fetch error:', err))
  }, [])

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const completedCount = Object.values(checkedItems).filter(Boolean).length
  const totalCount = Object.keys(checkedItems).length
  const readinessPercent = Math.round((completedCount / totalCount) * 100)

  // Meal Budget Calculation
  const dailyAdultMeal = diningStyle === 'budget' ? 25 : (diningStyle === 'balanced' ? 55 : 130)
  const dailyChildMeal = dailyAdultMeal * 0.6
  const totalMealCostSgd = Math.round((adults * dailyAdultMeal + kids * dailyChildMeal) * days)
  const totalMealCostInr = Math.round(totalMealCostSgd * sgdToInrRate)

  const handleSearchFlight = async (e?: React.FormEvent, codeOverride?: string) => {
    if (e) e.preventDefault()
    const targetCode = (codeOverride || flightNumberInput).trim()
    if (!targetCode) return
    setFlightLoading(true)
    setFlightError(null)
    setFlightResult(null)

    try {
      const res = await fetch(`/api/flights?flight_iata=${encodeURIComponent(targetCode)}`)
      const json = await res.json()
      if (!res.ok || json.error) {
        setFlightError(json.error || 'Flight not found or invalid flight number.')
      } else if (json.data) {
        setFlightResult(json.data)
      } else {
        setFlightError('No flight data returned for this flight number.')
      }
    } catch (err: any) {
      setFlightError('Failed to fetch live flight details. Please try again.')
    } finally {
      setFlightLoading(false)
    }
  }

  const sgacLink = sanitySettings.sgacOfficialLink || 'https://eservices.ica.gov.sg/sgarrivalcard/'
  const mdacLink = sanitySettings.mdacOfficialLink || 'https://imigresen-online.imi.gov.my/mdac/main'
  const sgVisaLink = sanitySettings.sgVisaStatusLink || 'https://eservices.ica.gov.sg/save/sso/login.xhtml'
  const airSuvidhaLink = sanitySettings.airSuvidhaLink || 'https://www.airsuvidha.app.nic.in/'

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* 1. HERO HEADER */}
      <section style={{ 
        background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)', 
        color: '#FFF', 
        padding: '4rem 1.5rem 5rem', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span style={{ 
            background: 'rgba(212, 175, 55, 0.15)', 
            color: '#D4AF37', 
            border: '1px solid rgba(212, 175, 55, 0.3)', 
            padding: '0.35rem 0.85rem', 
            borderRadius: '20px', 
            fontSize: '0.78rem', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            marginBottom: '1rem'
          }}>
            <Sparkles size={14} /> Flying Wonders Traveler Hub
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, margin: '0.5rem 0 1rem', lineHeight: 1.2 }}>
            {sanitySettings.heroTitle || 'Singapore & Malaysia Travel Tools & Visa Center'}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '720px', margin: '0 auto', lineHeight: 1.6, fontWeight: 300 }}>
            {sanitySettings.heroSubtitle || 'Your 1-stop portal for ICA SG Arrival Card (SGAC), Malaysia MDAC, Visa Document Checklists, Live Currency Converter, and Smart Packing Lists.'}
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '-2.5rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        
        {/* ✈️ AIRLABS LIVE FLIGHT RADAR & STATUS TRACKER */}
        {!sanitySettings.hideFlightTracker && (
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A365D', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Plane size={22} color="#059669" /> AirLabs Real-Time Flight Radar & Changi Status
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#718096', margin: '0.25rem 0 0' }}>
                  Track live flight status, arrivals, departures, terminals, and gates in real time.
                </p>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', padding: '0.25rem 0.65rem', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} /> Live AirLabs Data
              </span>
            </div>

            <form onSubmit={handleSearchFlight} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div style={{ flex: '1 1 280px', position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Enter Flight Number (e.g. SQ423, 6E53, AI380, MH601)..." 
                  value={flightNumberInput}
                  onChange={e => setFlightNumberInput(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.92rem', fontWeight: 600, background: '#F8FAFC' }}
                />
                <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <button 
                type="submit"
                disabled={flightLoading}
                style={{ padding: '0.75rem 1.75rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0F4C3A 0%, #059669 100%)', color: '#FFF', fontWeight: 700, fontSize: '0.9rem', cursor: flightLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 3px 10px rgba(5,150,105,0.2)' }}
              >
                {flightLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                <span>Track Flight</span>
              </button>
            </form>

            {/* Quick Sample Badges */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.78rem', color: '#64748B' }}>
              <span>Try example flights:</span>
              {['SQ423', '6E53', 'AI380', 'MH601'].map(code => (
                <button
                  key={code}
                  type="button"
                  onClick={() => { setFlightNumberInput(code); handleSearchFlight(undefined, code); }}
                  style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, color: '#334155' }}
                >
                  {code}
                </button>
              ))}
            </div>

            {/* Flight Search Error */}
            {flightError && (
              <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.88rem', fontWeight: 600 }}>
                ⚠️ {flightError}
              </div>
            )}

            {/* Flight Search Result Display Card */}
            {flightResult && (
              <div style={{ marginTop: '1.5rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {flightResult.airline_name || 'Airline Carrier'}
                    </span>
                    <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A365D', margin: '0.1rem 0 0' }}>
                      Flight {flightResult.flight_iata || flightResult.flight_number}
                    </h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      padding: '0.35rem 0.85rem', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem', 
                      fontWeight: 800, 
                      textTransform: 'uppercase',
                      background: flightResult.status === 'en-route' ? '#DBEAFE' : (flightResult.status === 'landed' ? '#DCFCE7' : '#FEF3C7'),
                      color: flightResult.status === 'en-route' ? '#1E40AF' : (flightResult.status === 'landed' ? '#166534' : '#92400E'),
                      border: `1px solid ${flightResult.status === 'en-route' ? '#93C5FD' : (flightResult.status === 'landed' ? '#86EFAC' : '#FCD34D')}`
                    }}>
                      {flightResult.status || 'Scheduled'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, display: 'block' }}>DEPARTURE</span>
                    <strong style={{ fontSize: '1.05rem', color: '#1E293B', display: 'block' }}>{flightResult.dep_name || flightResult.dep_iata} ({flightResult.dep_iata})</strong>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>Terminal: {flightResult.dep_terminal || 'TBA'} | Gate: {flightResult.dep_gate || 'TBA'}</span>
                    <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                      Time: {flightResult.dep_time || flightResult.dep_estimated || 'On Schedule'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, display: 'block' }}>ARRIVAL</span>
                    <strong style={{ fontSize: '1.05rem', color: '#1E293B', display: 'block' }}>{flightResult.arr_name || flightResult.arr_iata} ({flightResult.arr_iata})</strong>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>Terminal: {flightResult.arr_terminal || 'TBA'} | Gate: {flightResult.arr_gate || 'TBA'}</span>
                    <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                      Time: {flightResult.arr_time || flightResult.arr_estimated || 'On Schedule'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, display: 'block' }}>AIRCRAFT & STATUS</span>
                    <span style={{ fontSize: '0.85rem', color: '#334155', display: 'block', fontWeight: 600 }}>Model: {flightResult.aircraft_code || 'Commercial Jet'}</span>
                    <span style={{ fontSize: '0.8rem', color: '#475569', display: 'block' }}>Speed: {flightResult.speed ? `${flightResult.speed} km/h` : 'N/A'}</span>
                    {flightResult.delayed ? (
                      <span style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 700, display: 'block', marginTop: '0.2rem' }}>
                        ⚠️ Delayed by {flightResult.delayed} mins
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, display: 'block', marginTop: '0.2rem' }}>
                        ✓ Operating On Time
                      </span>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
        
        {/* 2. OFFICIAL GOVERNMENT PORTALS */}
        {!sanitySettings.hideOfficialPortals && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            
            {/* ICA SGAC Portal Card */}
            <div style={{ background: '#FFF', borderRadius: '16px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🇸🇬</span>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A365D', margin: 0 }}>Singapore SG Arrival Card (SGAC)</h3>
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Mandatory within 3 days prior to arrival</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#4A5568', lineHeight: 1.5, margin: '0.5rem 0 1.25rem' }}>
                  All travelers (including tourists and children) must submit the electronic SGAC with health declaration before clearing Singapore immigration.
                </p>
              </div>
              <a 
                href={sgacLink} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem', 
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', 
                  color: '#FFF', 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: '8px', 
                  fontWeight: 700, 
                  fontSize: '0.88rem', 
                  textDecoration: 'none',
                  boxShadow: '0 3px 8px rgba(16,185,129,0.2)'
                }}
              >
                <span>Submit Official SGAC (ICA.gov.sg)</span>
                <ExternalLink size={16} />
              </a>
            </div>

            {/* Malaysia MDAC Portal Card */}
            <div style={{ background: '#FFF', borderRadius: '16px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🇲🇾</span>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A365D', margin: 0 }}>Malaysia Digital Arrival Card (MDAC)</h3>
                    <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700 }}>Mandatory within 3 days prior to entry</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#4A5568', lineHeight: 1.5, margin: '0.5rem 0 1.25rem' }}>
                  Required for all foreign visitors entering Malaysia via land causeway or air. Free official submission on Immigration Malaysia.
                </p>
              </div>
              <a 
                href={mdacLink} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem', 
                  background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)', 
                  color: '#FFF', 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: '8px', 
                  fontWeight: 700, 
                  fontSize: '0.88rem', 
                  textDecoration: 'none',
                  boxShadow: '0 3px 8px rgba(217,119,6,0.2)'
                }}
              >
                <span>Submit Official MDAC Portal</span>
                <ExternalLink size={16} />
              </a>
            </div>

          {/* Sponsored Ad Banner Unit */}
          <AdBanner category="travel-tools" slotId="travel_tools_slot_1" />

          {/* India AirSuvidha 2.0 Card */}
            {!sanitySettings.hideAirSuvidha && (
            <div style={{ background: '#FFF', borderRadius: '16px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🇮🇳</span>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A365D', margin: 0 }}>India AirSuvidha 2.0</h3>
                    <span style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 700 }}>Mandatory for Inbound Flights to India</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#4A5568', lineHeight: 1.5, margin: '0.5rem 0 1.25rem' }}>
                  India&apos;s official self-declaration portal for travellers arriving in India. Required for all international passengers — submit health declaration, travel history, and upload documents before boarding.
                </p>
              </div>
              <a 
                href={airSuvidhaLink} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem', 
                  background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)', 
                  color: '#FFF', 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: '8px', 
                  fontWeight: 700, 
                  fontSize: '0.88rem', 
                  textDecoration: 'none',
                  boxShadow: '0 3px 8px rgba(124,58,237,0.2)'
                }}
              >
                <span>Submit AirSuvidha 2.0</span>
                <ExternalLink size={16} />
              </a>
            </div>
            )}

            {/* ICA eVisa Status Card */}
            <div style={{ background: '#FFF', borderRadius: '16px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <ShieldCheck size={28} color="#2563EB" />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A365D', margin: 0 }}>ICA eVisa Status Verification</h3>
                    <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700 }}>Official SAVE Portal Check</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#4A5568', lineHeight: 1.5, margin: '0.5rem 0 1.25rem' }}>
                  Verify approved Singapore e-Visa status, download copy, or check application validity directly with ICA Singapore.
                </p>
              </div>
              <a 
                href={sgVisaLink} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem', 
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)', 
                  color: '#FFF', 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: '8px', 
                  fontWeight: 700, 
                  fontSize: '0.88rem', 
                  textDecoration: 'none',
                  boxShadow: '0 3px 8px rgba(37,99,235,0.2)'
                }}
              >
                <span>Check ICA eVisa Status</span>
                <ExternalLink size={16} />
              </a>
            </div>

          </div>
        )}

        {/* ⚠️ CRITICAL SCAM ADVISORY CALLOUT */}
        {!sanitySettings.hideScamAdvisory && (
          <div style={{ 
            background: '#FFFBEB', 
            border: '1.5px solid #FCD34D', 
            borderRadius: '12px', 
            padding: '1.25rem 1.5rem', 
            marginBottom: '3rem', 
            display: 'flex', 
            gap: '1rem', 
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(245,158,11,0.06)'
          }}>
            <AlertTriangle size={28} color="#D97706" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#92400E', fontSize: '0.95rem', display: 'block', marginBottom: '0.2rem' }}>
                ⚠️ Fraud Advisory: Both SGAC & MDAC Official Submissions Are 100% FREE!
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#B45309', margin: 0, lineHeight: 1.5 }}>
                The Singapore ICA and Malaysia Immigration Department <strong>DO NOT charge any submission fee</strong> for arrival cards. Avoid third-party websites asking for $30-$80 USD credit card payments. Always use the official government links provided above.
              </p>
            </div>
          </div>
        )}

        {/* 3. VISA DOCUMENTATION CHECKLIST (SG & MY) */}
        {!sanitySettings.hideVisaChecklist && (
          <section style={{ marginBottom: '3.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Document Verification
              </span>
              <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '2.2rem', fontWeight: 800, color: '#1A365D', margin: '0.25rem 0' }}>
                Visa Document Requirements & Checklists
              </h2>
            </div>

            {/* Visa Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
              <button
                type="button"
                onClick={() => setActiveVisaTab('sg')}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeVisaTab === 'sg' ? '#0F4C3A' : '#FFF',
                  color: activeVisaTab === 'sg' ? '#FFF' : '#4A5568',
                  boxShadow: activeVisaTab === 'sg' ? '0 4px 12px rgba(15,76,58,0.2)' : '0 1px 3px rgba(0,0,0,0.08)'
                }}
              >
                🇸🇬 Singapore Tourist Visa (eVisa)
              </button>

              <button
                type="button"
                onClick={() => setActiveVisaTab('my')}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeVisaTab === 'my' ? '#1A365D' : '#FFF',
                  color: activeVisaTab === 'my' ? '#FFF' : '#4A5568',
                  boxShadow: activeVisaTab === 'my' ? '0 4px 12px rgba(26,54,93,0.2)' : '0 1px 3px rgba(0,0,0,0.08)'
                }}
              >
                🇲🇾 Malaysia Visa & Visa-Free Entry
              </button>

              <button
                type="button"
                onClick={() => setActiveVisaTab('crossborder')}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeVisaTab === 'crossborder' ? '#D97706' : '#FFF',
                  color: activeVisaTab === 'crossborder' ? '#FFF' : '#4A5568',
                  boxShadow: activeVisaTab === 'crossborder' ? '0 4px 12px rgba(217,119,6,0.2)' : '0 1px 3px rgba(0,0,0,0.08)'
                }}
              >
                🚌 Cross-Border Land Transit (Causeway / Tuas)
              </button>
            </div>

            {/* Visa Tab Content */}
            <div style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
              
              {activeVisaTab === 'sg' && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F4C3A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={20} /> Singapore Tourist Visa Document Checklist (eVisa Subclass 14)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', fontSize: '0.88rem' }}>
                    <div style={{ background: '#F8FAFC', padding: '1.15rem', borderRadius: '8px', borderLeft: '4px solid #059669' }}>
                      <strong style={{ color: '#1A365D', display: 'block', marginBottom: '0.35rem' }}>1. Passport Requirements</strong>
                      Valid for at least 6 months beyond intended date of departure from Singapore, with minimum 2 blank visa pages.
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '1.15rem', borderRadius: '8px', borderLeft: '4px solid #059669' }}>
                      <strong style={{ color: '#1A365D', display: 'block', marginBottom: '0.35rem' }}>2. Form 14A & Photo Specs</strong>
                      Duly filled Form 14A. 2 recent passport photos (35x45mm, white background, matte finish, 80% face coverage).
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '1.15rem', borderRadius: '8px', borderLeft: '4px solid #059669' }}>
                      <strong style={{ color: '#1A365D', display: 'block', marginBottom: '0.35rem' }}>3. Financial Proof & Bank Statements</strong>
                      Original bank statements for last 6 months certified by bank (recommended minimum balance ₹50,000 / $700 SGD per person).
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '1.15rem', borderRadius: '8px', borderLeft: '4px solid #059669' }}>
                      <strong style={{ color: '#1A365D', display: 'block', marginBottom: '0.35rem' }}>4. Confirmed Flight & Hotel Vouchers</strong>
                      Round-trip confirmed flight itinerary and Flying Wonders Singapore DMC hotel confirmation voucher.
                    </div>
                  </div>
                </div>
              )}

              {activeVisaTab === 'my' && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A365D', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={20} /> Malaysia Tourist Visa & Digital Arrival Card Checklist
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', fontSize: '0.88rem' }}>
                    <div style={{ background: '#F8FAFC', padding: '1.15rem', borderRadius: '8px', borderLeft: '4px solid #2563EB' }}>
                      <strong style={{ color: '#1A365D', display: 'block', marginBottom: '0.35rem' }}>1. MDAC Submission QR Code</strong>
                      Completed MDAC digital arrival submission within 3 days prior to arrival. Keep softcopy/printout handy.
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '1.15rem', borderRadius: '8px', borderLeft: '4px solid #2563EB' }}>
                      <strong style={{ color: '#1A365D', display: 'block', marginBottom: '0.35rem' }}>2. Passport & Onward Flight</strong>
                      Passport valid minimum 6 months. Confirmed return flight or onward land travel voucher back to Singapore/home.
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '1.15rem', borderRadius: '8px', borderLeft: '4px solid #2563EB' }}>
                      <strong style={{ color: '#1A365D', display: 'block', marginBottom: '0.35rem' }}>3. Hotel & Accommodation Proof</strong>
                      Confirmed hotel booking in Kuala Lumpur, Johor Bahru, Genting, or Penang.
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '1.15rem', borderRadius: '8px', borderLeft: '4px solid #2563EB' }}>
                      <strong style={{ color: '#1A365D', display: 'block', marginBottom: '0.35rem' }}>4. Daily Subsistence Funds</strong>
                      Proof of sufficient funds (USD $500 equivalent cash or active credit card) presented to immigration officer if requested.
                    </div>
                  </div>
                </div>
              )}

              {activeVisaTab === 'crossborder' && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D97706', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bus size={20} /> Singapore ⇄ Malaysia Cross-Border Land Transit Guidelines
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#4A5568', lineHeight: 1.6, marginBottom: '1rem' }}>
                    When taking Flying Wonders private interline transfers across <strong>Woodlands Causeway or Tuas Second Link</strong>:
                  </p>
                  <ul style={{ fontSize: '0.88rem', color: '#2D3748', lineHeight: 1.7, paddingLeft: '1.25rem' }}>
                    <li><strong>Multiple Entries:</strong> Ensure your Singapore visa is a <em>Multiple Entry Visa (MEV)</em> if returning to Singapore after Malaysia.</li>
                    <li><strong>Vehicle Clearance:</strong> For private minibus/MPV transfers, passengers remain comfortably inside the vehicle during Singapore immigration clearance at Tuas.</li>
                    <li><strong>Peak Causeway Hours:</strong> Peak traffic occurs Friday 4 PM - 9 PM (entering Malaysia) and Sunday 3 PM - 10 PM (returning to Singapore). Plan extra travel buffers.</li>
                  </ul>
                </div>
              )}

            </div>
          </section>
        )}

        {/* 4. LIVE CURRENCY CALCULATOR & MEAL BUDGET ESTIMATOR */}
        {(!sanitySettings.hideCurrencyConverter || !sanitySettings.hideMealEstimator) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
            
            {/* Live Currency Calculator */}
            {!sanitySettings.hideCurrencyConverter && (
              <div style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A365D', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calculator size={20} color="#059669" /> SGD Live Currency Converter
                  </h3>
                  <span style={{ fontSize: '0.72rem', background: '#EBF8F0', color: '#059669', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 700 }}>
                    {rateLoaded ? `S$1 = ₹${sgdToInrRate.toFixed(2)}` : 'Live Rate'}
                  </span>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.35rem' }}>Amount in Singapore Dollars (SGD)</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                    <span style={{ fontWeight: 800, color: '#0F4C3A', marginRight: '0.5rem' }}>S$</span>
                    <input 
                      type="number" 
                      min="1" 
                      value={amountSgd} 
                      onChange={e => setAmountSgd(Math.max(1, parseFloat(e.target.value) || 0))}
                      style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 700, fontSize: '1.1rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#FAF5FF', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E9D5FF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6B46C1', fontWeight: 600 }}>Indian Rupee (INR)</span>
                    <strong style={{ fontSize: '1.25rem', color: '#6B46C1' }}>₹{Math.round(amountSgd * sgdToInrRate).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #D6BCFA', paddingTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#4A5568', fontWeight: 600 }}>Malaysian Ringgit (MYR)</span>
                    <strong style={{ fontSize: '1.1rem', color: '#2D3748' }}>RM {(amountSgd * sgdToMyrRate).toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Meal Budget Estimator */}
            {!sanitySettings.hideMealEstimator && (
              <div style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A365D', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Utensils size={20} color="#D97706" /> Meal Budget Estimator
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4A5568' }}>Days</label>
                    <input 
                      type="number" min="1" max="30" value={days} onChange={e => setDays(parseInt(e.target.value) || 1)}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4A5568' }}>Adults</label>
                    <input 
                      type="number" min="1" max="50" value={adults} onChange={e => setAdults(parseInt(e.target.value) || 1)}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4A5568' }}>Children</label>
                    <input 
                      type="number" min="0" max="50" value={kids} onChange={e => setKids(parseInt(e.target.value) || 0)}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.35rem' }}>Dining Style Preference</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setDiningStyle('budget')}
                      style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', border: '1px solid #CBD5E1', background: diningStyle === 'budget' ? '#FEF3C7' : '#FFF', color: diningStyle === 'budget' ? '#92400E' : '#4A5568', cursor: 'pointer' }}
                    >
                      Hawkers (S$25/day)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiningStyle('balanced')}
                      style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', border: '1px solid #CBD5E1', background: diningStyle === 'balanced' ? '#FEF3C7' : '#FFF', color: diningStyle === 'balanced' ? '#92400E' : '#4A5568', cursor: 'pointer' }}
                    >
                      Balanced (S$55/day)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiningStyle('luxury')}
                      style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', border: '1px solid #CBD5E1', background: diningStyle === 'luxury' ? '#FEF3C7' : '#FFF', color: diningStyle === 'luxury' ? '#92400E' : '#4A5568', cursor: 'pointer' }}
                    >
                      Fine Dining (S$130)
                    </button>
                  </div>
                </div>

                <div style={{ background: '#FFFBEB', padding: '1.25rem', borderRadius: '10px', border: '1px solid #FCD34D', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#B45309', display: 'block' }}>Estimated Total Food & Beverage Budget</span>
                  <strong style={{ fontSize: '1.6rem', color: '#92400E' }}>S$ {totalMealCostSgd.toLocaleString()}</strong>
                  <span style={{ fontSize: '0.85rem', color: '#78350F', display: 'block', fontWeight: 600 }}>approx. ₹{totalMealCostInr.toLocaleString('en-IN')}</span>
                </div>

              </div>
            )}

          </div>
        )}

        {/* 5. INTERACTIVE PRE-DEPARTURE PACKING CHECKLIST */}
        {!sanitySettings.hideInteractiveChecklist && (
          <section style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A365D', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckSquare size={22} color="#059669" /> Interactive Pre-Departure Checklist
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#718096', margin: '0.2rem 0 0' }}>Tick off essential items before heading to Changi Airport.</p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F0FDF4', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #BBF7D0' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>Trip Readiness: {readinessPercent}%</span>
                <div style={{ width: '80px', height: '8px', background: '#DCFCE7', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${readinessPercent}%`, height: '100%', background: '#166534', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {[
                { id: 'passport', title: 'Passport (>6 months validity)', desc: 'With min 2 blank visa pages' },
                { id: 'sgac', title: 'SG Arrival Card (ICA SGAC) QR', desc: 'Submitted within 3 days of departure' },
                { id: 'mdac', title: 'Malaysia MDAC (If crossing Causeways)', desc: 'Submitted prior to entering Malaysia' },
                { id: 'insurance', title: 'Comprehensive Travel Insurance', desc: 'Covering medical & flight delays' },
                { id: 'tickets', title: 'Flying Wonders Hotel & Attraction Vouchers', desc: 'Downloaded soft copies on mobile' },
                { id: 'adapter', title: 'Universal Type G Power Adapter (230V)', desc: '3-square pin UK standard plug' },
                { id: 'forex', title: 'SGD Cash & Forex Card', desc: 'For hawkers and MRT SimplyGo' },
                { id: 'sim', title: 'Singapore Tourist eSIM / Local SIM', desc: 'Activated for instant connectivity' }
              ].map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleCheck(item.id)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '0.75rem', 
                    padding: '1rem', 
                    borderRadius: '10px', 
                    border: `1px solid ${checkedItems[item.id] ? '#A7F3D0' : '#CBD5E1'}`,
                    background: checkedItems[item.id] ? '#ECFDF5' : '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={checkedItems[item.id] || false} 
                    onChange={() => {}}
                    style={{ marginTop: '0.2rem', width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: checkedItems[item.id] ? '#065F46' : '#1A365D', display: 'block' }}>{item.title}</strong>
                    <span style={{ fontSize: '0.78rem', color: checkedItems[item.id] ? '#047857' : '#64748B' }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. ATTRACTION TIME ALLOCATOR & DURATION TABLE */}
        {!sanitySettings.hideAttractionAllocator && (
          <section style={{ background: '#FFF', borderRadius: '16px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A365D', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={22} color="#2563EB" /> Recommended Attraction Time Allocator
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#718096', margin: '0.2rem 0 0' }}>Plan your daily itinerary pace effectively with estimated durations.</p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#1A365D', color: '#FFF' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Attraction / Activity</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Estimated Duration</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Best Time Slot</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Walking Intensity</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Universal Studios Singapore (USS)', duration: '6 – 7 Hours', slot: '10:00 AM Opening', intensity: 'High (Outdoors)' },
                    { name: 'Gardens by the Bay (Domes + Supertree)', duration: '3 – 4 Hours', slot: '4:00 PM – 8:30 PM (Show)', intensity: 'Moderate' },
                    { name: 'Singapore Night Safari', duration: '3.5 Hours', slot: '7:15 PM Entry', intensity: 'Moderate (Tram included)' },
                    { name: 'Bird Paradise (Mandai)', duration: '4 Hours', slot: '9:00 AM Morning', intensity: 'High' },
                    { name: 'Marina Bay Sands SkyPark Observation', duration: '1.5 Hours', slot: '5:30 PM Sunset', intensity: 'Low' },
                    { name: 'Jewel Changi Rain Vortex & Canopy Park', duration: '2.5 Hours', slot: 'Arrival / Departure Day', intensity: 'Easy Walk' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #EDF2F7', background: idx % 2 === 0 ? '#F8FAFC' : '#FFF' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1A365D' }}>{row.name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#059669', fontWeight: 600 }}>{row.duration}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#4A5568' }}>{row.slot}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#718096' }}>{row.intensity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>

    </div>
  )
}
