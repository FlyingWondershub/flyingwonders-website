'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Sparkles,
  Calculator,
  Percent,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Plane,
  Luggage,
  Clock,
  Compass,
  Tag
} from 'lucide-react'
import AdBanner from '../../../components/AdBanner'

export default function SingaporeShoppingGuidePage() {
  // eTRS GST Refund Calculator State
  const [spendAmount, setSpendAmount] = useState<number>(350)
  const [exchangeRateInr, setExchangeRateInr] = useState<number>(74.5)

  // In Singapore, consumer retail prices are GST-inclusive (9% GST)
  // GST Component = Total Spend * 9 / 109
  const gstDetails = useMemo(() => {
    const isEligible = spendAmount >= 100
    const grossGst = (spendAmount * 9) / 109
    // Central Refund Agencies (Global Blue, Planet, Tourego) typically deduct an administrative handling fee (~15% of GST)
    const adminFee = grossGst * 0.15
    const netRefundSgd = Math.max(0, grossGst - adminFee)
    const netRefundInr = netRefundSgd * exchangeRateInr

    return {
      isEligible,
      grossGst: Math.round(grossGst * 100) / 100,
      adminFee: Math.round(adminFee * 100) / 100,
      netRefundSgd: Math.round(netRefundSgd * 100) / 100,
      netRefundInr: Math.round(netRefundInr)
    }
  }, [spendAmount, exchangeRateInr])

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-inter), sans-serif', color: '#1E293B', paddingBottom: '4rem' }}>
      
      {/* ── 1. BREADCRUMBS & TOP BAR ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0.85rem 1.5rem' }}>
        <div style={{ maxWidth: '1600px', width: '96%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#64748B' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/travel-tools" style={{ color: '#64748B', textDecoration: 'none' }}>Travel Tools</Link>
            <span>/</span>
            <Link href="/travel-tools/shopping-malls" style={{ color: '#64748B', textDecoration: 'none' }}>Shopping Malls</Link>
            <span>/</span>
            <span style={{ color: '#0F172A', fontWeight: 800 }}>Master Singapore Shopping Guide & Tax Refund</span>
          </div>

          <Link
            href="/travel-tools/shopping-malls"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              border: '1px solid #0F4C3A',
              background: '#0F4C3A',
              color: '#FFF',
              fontSize: '0.82rem',
              fontWeight: 800,
              textDecoration: 'none'
            }}
          >
            <Compass size={14} />
            <span>Explore Individual Mall Guides (IMM, Mustafa, MBS...)</span>
          </Link>
        </div>
      </div>

      {/* ── 2. HERO HEADER (WIDE-SCREEN 1600PX) ── */}
      <section style={{ 
        background: 'linear-gradient(135deg, #0F4C3A 0%, #1A365D 100%)', 
        color: '#FFF', 
        padding: '3rem 1.5rem 3.5rem', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1600px', width: '96%', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '1rem', backdropFilter: 'blur(8px)' }}>
            <Percent size={15} color="#FDE68A" /> The Official 2026 Tourist Playbook
          </div>

          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.15 }}>
            The Ultimate Singapore Shopping Guide
          </h1>

          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: '#E2E8F0', maxWidth: '900px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Your definitive insider resource for navigating Singapore’s retail scene: from the luxury flagships of Marina Bay Sands and deep factory outlet discounts at IMM to curated 4-day shopping itineraries and the 9% eTRS GST Tax Refund Calculator.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href="#gst-calculator"
              style={{
                background: '#F59E0B',
                color: '#FFF',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)'
              }}
            >
              <Calculator size={16} />
              <span>Interactive GST Refund Calculator ↓</span>
            </a>

            <a
              href="#itinerary"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Calendar size={16} />
              <span>4-Day Curated Shopping Route ↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── 3. INTERACTIVE 9% ETRS GST REFUND CALCULATOR (WIDE-SCREEN 1600PX) ── */}
      <section id="gst-calculator" style={{ maxWidth: '1600px', width: '96%', margin: '-1.5rem auto 3rem', padding: '0 0.5rem', position: 'relative', zIndex: 3 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Percent size={22} color="#15803D" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>
                  Interactive 9% GST Tourist Refund (eTRS) Calculator
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '2px 0 0' }}>
                  Calculate your eligible tax refund under Singapore’s Electronic Tourist Refund Scheme. Minimum purchase SGD $100.
                </p>
              </div>
            </div>

            <span style={{ background: '#EFF6FF', color: '#1E40AF', padding: '4px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
              Live 9% Standard Singapore GST Rate
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Input Column */}
            <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                Total Retail Shopping Spend (SGD $):
              </label>
              <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: '#0F172A', fontSize: '1.1rem' }}>S$</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={spendAmount}
                  onChange={e => setSpendAmount(Math.max(0, Number(e.target.value)))}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem 0.85rem 2.8rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    outline: 'none',
                    background: '#FFF',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Slider for quick tweaking */}
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={spendAmount}
                onChange={e => setSpendAmount(Number(e.target.value))}
                style={{ width: '100%', marginBottom: '1.25rem', accentColor: '#0F4C3A' }}
              />

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[100, 250, 500, 1000, 2500].map(val => (
                  <button
                    key={val}
                    onClick={() => setSpendAmount(val)}
                    style={{
                      background: spendAmount === val ? '#0F4C3A' : '#FFF',
                      color: spendAmount === val ? '#FFF' : '#334155',
                      border: '1px solid #CBD5E1',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    S$ {val}
                  </button>
                ))}
              </div>

              {!gstDetails.isEligible && (
                <div style={{ marginTop: '1.25rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#DC2626" />
                  <span style={{ fontSize: '0.82rem', color: '#991B1B', fontWeight: 600 }}>
                    Minimum spend to qualify is <strong>SGD $100</strong> (accumulate up to 3 same-day receipts from same retailer).
                  </span>
                </div>
              )}
            </div>

            {/* Refund Payout Summary Column */}
            <div style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #BBF7D0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                  Estimated Net Cash / Card Refund
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#15803D' }}>
                    S$ {gstDetails.isEligible ? gstDetails.netRefundSgd.toFixed(2) : '0.00'}
                  </span>
                  {gstDetails.isEligible && (
                    <span style={{ fontSize: '1rem', color: '#166534', fontWeight: 700 }}>
                      (Approx. ₹{gstDetails.netRefundInr.toLocaleString()})
                    </span>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #BBF7D0', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#334155' }}>
                    <span>Gross 9% GST Component:</span>
                    <strong>S$ {gstDetails.isEligible ? gstDetails.grossGst.toFixed(2) : '0.00'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B' }}>
                    <span>Estimated eTRS Agency Handling Fee (~15%):</span>
                    <span>- S$ {gstDetails.isEligible ? gstDetails.adminFee.toFixed(2) : '0.00'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#15803D', fontWeight: 800, borderTop: '1px solid #DCFCE7', paddingTop: '6px' }}>
                    <span>Estimated Net Tax Savings:</span>
                    <span>~ 7.6% of Total Bill</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #BBF7D0' }}>
                <span style={{ fontSize: '0.74rem', color: '#166534', display: 'block', lineHeight: 1.4 }}>
                  💡 Payout can be claimed directly in <strong>Cash</strong>, credited back to your <strong>Credit Card</strong>, or transferred into <strong>Alipay</strong> at Changi Airport departure transit terminals.
                </span>
              </div>
            </div>
          </div>

          {/* 4-Step How to Claim Workflow */}
          <div style={{ marginTop: '2rem', paddingTop: '1.75rem', borderTop: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#0F4C3A" /> Step-by-Step eTRS GST Claim Process for Tourists
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem 1.15rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ background: '#0F4C3A', color: '#FFF', fontSize: '0.74rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>STEP 1</span>
                <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block', margin: '6px 0 4px' }}>In-Store Passport Scan</strong>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                  Show physical passport at checkout. The store digitally issues your eTRS transaction ticket. Keep your paper receipts.
                </p>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem 1.15rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ background: '#0F4C3A', color: '#FFF', fontSize: '0.74rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>STEP 2</span>
                <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block', margin: '6px 0 4px' }}>Check-In Bags vs Hand-Carry</strong>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                  Items in <strong>checked bags</strong>: scan passport at eTRS Kiosk in Departure Check-In Hall BEFORE checking in bags.
                </p>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem 1.15rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ background: '#0F4C3A', color: '#FFF', fontSize: '0.74rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>STEP 3</span>
                <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block', margin: '6px 0 4px' }}>Transit Lounge Validation</strong>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                  Items in <strong>cabin hand-carry</strong>: scan passport at kiosks inside the Departure Transit Lounge after passing immigration.
                </p>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem 1.15rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ background: '#0F4C3A', color: '#FFF', fontSize: '0.74rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>STEP 4</span>
                <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block', margin: '6px 0 4px' }}>Receive Refund Instantly</strong>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                  Collect cash at Central Refund Counter or select automatic refund to your credit card / Alipay account within 10 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. 4-DAY CURATED SHOPPING ITINERARY (WIDE-SCREEN 1600PX) ── */}
      <section id="itinerary" style={{ maxWidth: '1600px', width: '96%', margin: '0 auto 3.5rem', padding: '0 0.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>
            The 4-Day Curated Singapore Shopping Itinerary
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '4px 0 0' }}>
            Modeled after the official VisitSingapore travel guides: an optimized day-by-day plan pairing retail therapy with top sightseeing.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          
          {/* Day 1 */}
          <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <span style={{ background: '#FEF3C7', color: '#B45309', fontWeight: 900, fontSize: '0.76rem', padding: '3px 10px', borderRadius: '6px' }}>
              DAY 1 · HIGH STREET & LOCAL DESIGNERS
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0.65rem 0 0.4rem', fontFamily: 'var(--font-playfair), serif' }}>
              Orchard Road & Emerald Hill Heritage
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55, margin: '0 0 1rem' }}>
              Begin at ION Orchard for luxury flagship duplexes and the ION Sky observatory deck. Head to Ngee Ann City’s Takashimaya for Japanese food halls and luxury department stores, then browse 100+ local Singapore designers at Design Orchard before dining among 1920s Peranakan shophouse bars on Emerald Hill.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>MRT: Orchard (NS22/TE14)</span>
              <Link href="/travel-tools/shopping-malls/orchard-road-malls" style={{ color: '#0F4C3A', fontWeight: 800, fontSize: '0.82rem', textDecoration: 'none' }}>
                View Orchard Guide →
              </Link>
            </div>
          </div>

          {/* Day 2 */}
          <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <span style={{ background: '#DBEAFE', color: '#1E40AF', fontWeight: 900, fontSize: '0.76rem', padding: '3px 10px', borderRadius: '6px' }}>
              DAY 2 · ULTRA LUXURY VS STREET BAZAAR
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0.65rem 0 0.4rem', fontFamily: 'var(--font-playfair), serif' }}>
              Marina Bay Sands & Bugis Street Market
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55, margin: '0 0 1rem' }}>
              Start with morning bargain hunting at Bugis Street Market (600+ stalls for Korean fashion, phone cases, and $5 souvenirs) and trendy indie boutiques along Haji Lane. In the afternoon, take Downtown Line to The Shoppes at Marina Bay Sands for floating luxury pavilions, Sampan canal boat rides, and the 8:00 PM Spectra laser show.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>MRT: Bugis (DT14) → Bayfront (DT16)</span>
              <Link href="/travel-tools/shopping-malls/the-shoppes-marina-bay-sands" style={{ color: '#0F4C3A', fontWeight: 800, fontSize: '0.82rem', textDecoration: 'none' }}>
                View MBS Guide →
              </Link>
            </div>
          </div>

          {/* Day 3 */}
          <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <span style={{ background: '#DCFCE7', color: '#15803D', fontWeight: 900, fontSize: '0.76rem', padding: '3px 10px', borderRadius: '6px' }}>
              DAY 3 · BRANDED FACTORY OUTLETS
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0.65rem 0 0.4rem', fontFamily: 'var(--font-playfair), serif' }}>
              Jurong East IMM Outlet Safari
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55, margin: '0 0 1rem' }}>
              Dedicate a relaxed day to Singapore’s largest factory outlet mall. Score 30%–80% discounts across 90+ outlet stores including Coach, Nike Unite, Adidas, Michael Kors, Furla, and Samsonite. Walk sheltered via J-Walk bridge from Jurong East MRT and claim your free Tourist Privilege Booklet at Customer Service Level 1.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>MRT: Jurong East (NS1/EW24)</span>
              <Link href="/travel-tools/shopping-malls/imm" style={{ color: '#0F4C3A', fontWeight: 800, fontSize: '0.82rem', textDecoration: 'none' }}>
                View IMM Guide →
              </Link>
            </div>
          </div>

          {/* Day 4 */}
          <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <span style={{ background: '#F3E8FF', color: '#7E22CE', fontWeight: 900, fontSize: '0.76rem', padding: '3px 10px', borderRadius: '6px' }}>
              DAY 4 · CULTURAL SOUVENIRS & 24/7 MART
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0.65rem 0 0.4rem', fontFamily: 'var(--font-playfair), serif' }}>
              Chinatown, Little India & Jewel Changi
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55, margin: '0 0 1rem' }}>
              Morning cultural souvenir hunting on Pagoda Street in Chinatown (artisan teas, silk robes, and Lim Chee Guan Bak Kwa). Evening excursion into the legendary 24-hour maze of Mustafa Centre in Little India for perfumes, spices, and Tiger Balm, followed by a departure transit shopping finale at Jewel Changi Airport.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>MRT: Chinatown (NE4) → Farrer Park (NE8)</span>
              <Link href="/travel-tools/shopping-malls/mustafa-centre" style={{ color: '#0F4C3A', fontWeight: 800, fontSize: '0.82rem', textDecoration: 'none' }}>
                View Mustafa Guide →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── 5. SINGAPORE SALES SEASONS CALENDAR ── */}
      <section style={{ maxWidth: '1600px', width: '96%', margin: '0 auto 3.5rem', padding: '0 0.5rem' }}>
        <div style={{ background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.5rem', fontFamily: 'var(--font-playfair), serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={22} color="#0F4C3A" /> Singapore Major Sales Seasons & Promotion Calendar
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.5rem' }}>
            Plan your travel dates around Singapore’s major islandwide shopping festivals for maximum discounts.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>JUNE – JULY</span>
              <strong style={{ fontSize: '1rem', color: '#0F172A', display: 'block', margin: '8px 0 4px' }}>The Great Singapore Sale (GSS)</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Singapore’s biggest retail festival. Islandwide markdowns up to 70% off across Orchard Road, Marina Bay, and suburban malls.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <span style={{ background: '#DBEAFE', color: '#1E40AF', fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>LATE NOVEMBER</span>
              <strong style={{ fontSize: '1rem', color: '#0F172A', display: 'block', margin: '8px 0 4px' }}>Black Friday & Cyber Week</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Massive consumer tech and designer clearances. Electronics giants (Courts, Harvey Norman, Challenger) offer extreme flash sales.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <span style={{ background: '#FEF3C7', color: '#B45309', fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>DECEMBER</span>
              <strong style={{ fontSize: '1rem', color: '#0F172A', display: 'block', margin: '8px 0 4px' }}>Year-End Christmas Clearance</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Orchard Road transforms into Christmas on A Great Street with light spectacles. Retailers clear out annual stock before the new year.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>JANUARY – FEBRUARY</span>
              <strong style={{ fontSize: '1rem', color: '#0F172A', display: 'block', margin: '8px 0 4px' }}>Lunar New Year Night Markets</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Chinatown comes alive with massive street fairs selling traditional pastries, dried snacks, floral arrangements, and festive decor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. WHAT TO BUY: HOMEGROWN SINGAPORE BRANDS HALL OF FAME ── */}
      <section style={{ maxWidth: '1600px', width: '96%', margin: '0 auto 3.5rem', padding: '0 0.5rem' }}>
        <div style={{ background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.5rem', fontFamily: 'var(--font-playfair), serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={22} color="#0F4C3A" /> What to Buy in Singapore: Homegrown Brands Hall of Fame
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.5rem' }}>
            Authentic, world-class Singaporean brands that make the perfect souvenirs and gifts.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>👜</span>
              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>Charles & Keith and Pedro</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.45 }}>
                Born in Singapore, these global fashion footwear and handbag icons are priced significantly cheaper in Singapore stores than abroad.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>☕</span>
              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>Bacha Coffee & TWG Tea</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.45 }}>
                Prestige packaging, 100% Arabica single-origin beans, and luxury tea blends housed in iconic yellow and amber tins.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>🐯</span>
              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>Tiger Balm & Axe Brand</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.45 }}>
                World-famous herbal pain relief ointments and soothing universal medicated oils formulated in Singapore for over a century.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>🥥</span>
              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>Ya Kun Kaya Jam & Bengawan Solo</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.45 }}>
                Authentic pandan coconut egg spread (Kaya) and Bengawan Solo’s famous fluffy Pandan Chiffon Cake—Singapore’s national cake.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>🍳</span>
              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>IRVINS Salted Egg Snacks</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.45 }}>
                #DangerouslyAddictive gourmet salted egg fish skin and potato chips. Found at Changi Airport and major malls.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>🥟</span>
              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>Lim Chee Guan Bak Kwa</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.45 }}>
                Singapore’s most cherished traditional charcoal-barbecued sweet pork jerky artisan, hand-grilled fresh in Chinatown since 1938.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. BOTTOM ADVERTISEMENT SLOT ── */}
      <div style={{ maxWidth: '1600px', width: '96%', margin: '0 auto', padding: '0 0.5rem' }}>
        <AdBanner slotId="shopping_guide_bottom_slot" category="b2b" />
      </div>

    </div>
  )
}
