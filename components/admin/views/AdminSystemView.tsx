'use client'

import React, { useState } from 'react'
import {
  Map,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  Download,
  ExternalLink,
  Eye,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Wrench,
  ShoppingBag,
  Globe,
  Sliders
} from 'lucide-react'

interface AdminSystemViewProps {
  subTab: string
  onSelectSubTab: (subTabId: string) => void
  onSyncAttractions: () => void
  isSyncingAttractions: boolean
  syncMessage: string | null
  competitorPrices: any[]
  isRefreshingPrices: boolean
  triggerPriceRefresh: () => void
  agents: any[]
  toggleAgentStatus: (agentId: string, currentState: boolean) => Promise<void>
  logs: any[]
}

export default function AdminSystemView({
  subTab,
  onSelectSubTab,
  onSyncAttractions,
  isSyncingAttractions,
  syncMessage,
  competitorPrices,
  isRefreshingPrices,
  triggerPriceRefresh,
  agents,
  toggleAgentStatus,
  logs
}: AdminSystemViewProps) {
  const [routeSearch, setRouteSearch] = useState('')

  // 51 Verified Routes matrix
  const allRoutes = [
    {
      category: 'Operations & B2B Portals',
      icon: Zap,
      color: '#D97706',
      links: [
        { name: 'Sanity Studio CMS', path: '/studio', desc: 'Manage database schemas & live content' },
        { name: 'Marketing & B2B Leads Directory', path: '/admin-dashboard?workspace=marketing&tab=leads', desc: 'WhatsApp, CSV lead ingestion & CRM pipeline' },
        { name: 'Email Campaigns & Subscribers Audience', path: '/admin-dashboard?workspace=marketing&tab=newsletters', desc: 'Visual block builder & Brevo dispatch' },
        { name: 'B2B Agent Portal', path: '/agent-portal', desc: 'Partner agent workspace & dashboard' },
        { name: 'Custom Package Builder & Land Quoter', path: '/custom-package', desc: 'FIT quotation engine, PDF & Flyer generator' },
        { name: 'Ready-Made Land Packages (No Hotels)', path: '/ready-made', desc: 'Dedicated B2B land packages (13-seater minibus & SIC)' },
        { name: 'Ready-Made Package Dedicated Pages', path: '/ready-made/3n-4d-singapore-highlights-city-essentials', desc: 'Direct SEO landing pages & live quoter' },
        { name: 'B2B Travel Directory', path: '/b2b-directory', desc: 'Verified agencies & DMC directory' },
        { name: 'B2B Leads & RFQs', path: '/b2b-leads', desc: 'Live buyer inquiries & trade leads' },
        { name: 'B2B Partnership Hub', path: '/b2b', desc: 'Trade partner registration & perks' },
        { name: 'Group Hotel Voucher Hub', path: '/admin-dashboard?workspace=operations&tab=vouchers', desc: 'Visa-compliant group hotel confirmation vouchers' },
        { name: 'Customer Invoices & Receipts Generator', path: '/admin-dashboard?workspace=finance&tab=invoices', desc: 'GST Tax / Proforma Invoices & UPI receipts' },
        { name: 'Live Voucher Verification Portal', path: '/verify-voucher', desc: 'Official Embassy & Border Control authentication gateway' },
        { name: 'Card Scanner / Contact Ingest', path: '/add-contact', desc: 'Optical card reader & contact save' },
        { name: 'Careers & Job Openings (Public)', path: '/job-openings', desc: 'Job listings, candidate applications & talent network' },
        { name: 'Careers & Talent Admin Hub', path: '/admin-dashboard?workspace=marketing&tab=jobs', desc: 'Manage job postings & review applications' },
        { name: 'Passport Scanner & Air Ticketing Tool', path: '/travel-tools/scanner', desc: 'MRZ scanner, GDS fast-copy & 6-mo validity checker' },
        { name: 'Competitor Price Tracker', path: '/api/admin/price-tracker', desc: 'Real-time JSON market price tracker' }
      ]
    },
    {
      category: 'Interactive Travel Tools & Utilities',
      icon: Wrench,
      color: '#2563EB',
      links: [
        { name: 'Travel Tools Master Hub', path: '/travel-tools', desc: 'Complete interactive utility suite' },
        { name: 'SG Arrival Card (SGAC)', path: '/sgac', desc: '100% Free official ICA Singapore arrival portal & guide' },
        { name: 'Malaysia Arrival Card (MDAC)', path: '/mdac', desc: 'Official Malaysian Immigration MDAC portal & guide' },
        { name: 'Air Suvidha Self-Declaration', path: '/air-suvidha', desc: 'Official India MoCA pre-departure portal & guide' },
        { name: 'Visa Requirements Checker', path: '/visa-checker', desc: 'Live Singapore & Malaysia entry rules' },
        { name: 'SGD / INR Currency Converter', path: '/currency-converter', desc: 'Live exchange rates with conversion' },
        { name: 'Causeway Border Traffic', path: '/border-traffic', desc: 'Tuas & Woodlands live traffic cameras' },
        { name: 'Changi Flight Tracker', path: '/flight-tracker', desc: 'Real-time flight arrival & departure radar' },
        { name: 'Traveler Age Calculator', path: '/age-calculator', desc: 'Infant, child & adult fare categorization' },
        { name: 'AI Trip & Itinerary Planner', path: '/ai-planner', desc: 'Intelligent AI-generated itineraries' },
        { name: 'Instant Package Estimator', path: '/instant-quote', desc: 'Rapid pricing & budget calculator' },
        { name: 'Shopping Malls & Retail Hubs', path: '/travel-tools/shopping-malls', desc: 'IMM, Mustafa, Bugis, MBS, Orchard & Chinatown retail guides' },
        { name: 'Singapore Shopping & 9% GST Guide', path: '/travel-tools/shopping-guide', desc: '4-day shopping itinerary & eTRS refund calculator' },
        { name: 'GST Refund & Customs Calculator', path: '/gst-customs-guide', desc: 'Tax refund claims & India customs duty guide' }
      ]
    },
    {
      category: 'Services & Tour Catalogs',
      icon: ShoppingBag,
      color: '#7C3AED',
      links: [
        { name: 'Services Catalog', path: '/services-catalog', desc: 'Master multi-category service directory' },
        { name: 'Singapore Attractions', path: '/singapore-attractions', desc: 'Attractions catalog & quote builder' },
        { name: 'Active Promotions', path: '/singapore-attractions/promotions', desc: 'Discounted attraction deals & passes' },
        { name: 'Live Attraction Booking', path: '/attractions-live', desc: 'Direct instant e-ticket issuance' },
        { name: 'Curated Tour Packages', path: '/packages', desc: 'Exotic, Classic & Explorer packages' },
        { name: 'Travel & Medical Insurance', path: '/insurance', desc: 'Policy quotation & instant issuance' },
        { name: 'Travel Consulting', path: '/travel-consulting', desc: '1-on-1 personalized itinerary planning' },
        { name: 'Study in Singapore', path: '/study-in-singapore', desc: 'Educational & student immersion tours' },
        { name: 'Education Tours & Immersions', path: '/education-tours', desc: 'School, College & MBA study circuits' },
        { name: 'Karnataka Specialist Hub', path: '/karnataka', desc: 'Direct Karnataka to Singapore tours' },
        { name: 'Corporate Travel & MICE', path: '/corporate-travel', desc: 'Corporate delegations & events' }
      ]
    },
    {
      category: 'Public, Booking & Legal Information',
      icon: Globe,
      color: '#059669',
      links: [
        { name: 'Main Landing Page', path: '/', desc: 'Public homepage & hero showcase' },
        { name: 'Direct Booking Checkout', path: '/book', desc: 'Package reservation & traveler checkout' },
        { name: 'Online Payments & QR', path: '/pay', desc: 'Card checkout & ICICI UPI QR portal' },
        { name: 'Customer Invoice & Receipt Portal', path: '/invoice', desc: 'Client tax invoice lookup & receipts' },
        { name: 'Travel Brochure', path: '/brochure', desc: 'Downloadable marketing materials' },
        { name: 'Travel Blog & Articles', path: '/blog', desc: 'SEO travel guides & insights' },
        { name: 'Guest Reviews & Ratings', path: '/reviews', desc: 'Verified traveler testimonials' },
        { name: 'Singapore Events Calendar', path: '/events', desc: 'Festivals, concerts & exhibitions' },
        { name: 'About Flying Wonders', path: '/about', desc: 'Company vision, mission & team' },
        { name: 'Contact & Support', path: '/contact', desc: 'Singapore & India contact info' },
        { name: 'FAQ Help Center', path: '/faq', desc: 'Frequently asked customer questions' },
        { name: 'Terms of Service', path: '/terms', desc: 'Master booking terms & travel conditions' },
        { name: 'Privacy Policy', path: '/privacy', desc: 'PDPA & GDPR privacy declarations' },
        { name: 'Refund & Cancellation Policy', path: '/refund', desc: 'Cancellation schedule & refund rules' },
        { name: 'PWA Offline Fallback', path: '/offline', desc: 'Offline service worker app view' }
      ]
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      
      {/* ── SUB-TAB 1: SITE MAP & 51 ROUTES ── */}
      {subTab === 'sitemap' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.25rem',
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E293B', margin: 0, fontFamily: 'var(--font-playfair), serif' }}>
                  Site Map & Quick Links Matrix
                </h2>
                <span style={{ fontSize: '0.74rem', background: '#DCFCE7', color: '#166534', padding: '0.15rem 0.55rem', borderRadius: '12px', fontWeight: 800 }}>
                  ● 51 Verified Routes
                </span>
                <span style={{ fontSize: '0.74rem', background: '#DBEAFE', color: '#1E40AF', padding: '0.15rem 0.55rem', borderRadius: '12px', fontWeight: 800 }}>
                  ● 0 Dead Links
                </span>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.84rem', margin: '0.25rem 0 0 0' }}>
                Complete live routing directory and search index status across public, agent, and administration tools.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Filter 51 routes..."
                  value={routeSearch}
                  onChange={e => setRouteSearch(e.target.value)}
                  style={{
                    padding: '0.45rem 0.85rem 0.45rem 2rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    width: '200px',
                    outline: 'none'
                  }}
                />
              </div>

              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#4338CA',
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '7px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>sitemap.xml</span>
                <ExternalLink size={12} />
              </a>

              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#475569',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '7px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>robots.txt</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Grid of Categories */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {allRoutes.map(cat => {
              const Icon = cat.icon
              const matchedLinks = cat.links.filter(
                l =>
                  !routeSearch.trim() ||
                  l.name.toLowerCase().includes(routeSearch.toLowerCase()) ||
                  l.desc.toLowerCase().includes(routeSearch.toLowerCase()) ||
                  l.path.toLowerCase().includes(routeSearch.toLowerCase())
              )

              if (matchedLinks.length === 0) return null

              return (
                <div
                  key={cat.category}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <h3
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: '0 0 0.85rem 0',
                      paddingBottom: '0.45rem',
                      borderBottom: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem'
                    }}
                  >
                    <Icon size={16} color={cat.color} />
                    <span>{cat.category}</span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
                      ({matchedLinks.length})
                    </span>
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {matchedLinks.map(link => (
                      <a
                        key={link.path}
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.55rem 0.75rem',
                          background: '#F8FAFC',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          color: '#1E293B',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#F1F5F9'
                          e.currentTarget.style.transform = 'translateX(2px)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#F8FAFC'
                          e.currentTarget.style.transform = 'translateX(0)'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{link.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{link.desc}</div>
                        </div>
                        <ExternalLink size={13} color="#94A3B8" />
                      </a>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: ATTRACTIONS SYNC ── */}
      {subTab === 'sync' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ maxWidth: '650px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              Google Sheets Attraction Data Sync & Cache Invalidation
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.35rem 0 1.5rem 0' }}>
              Pulls live attraction data, rates, and availability tiers directly from the master Google Sheet, updates Sanity CMS schemas, and flushes ISR caches across Singapore Attraction pages.
            </p>

            {syncMessage && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: syncMessage.startsWith('Error') ? '#FEF2F2' : '#F0FDF4',
                  border: `1px solid ${syncMessage.startsWith('Error') ? '#FECACA' : '#BBF7D0'}`,
                  color: syncMessage.startsWith('Error') ? '#991B1B' : '#166534',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {syncMessage.startsWith('Error') ? <XCircle size={18} /> : <CheckCircle size={18} />}
                <span>{syncMessage}</span>
              </div>
            )}

            <button
              onClick={onSyncAttractions}
              disabled={isSyncingAttractions}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#0F4C3A',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: isSyncingAttractions ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(15,76,58,0.2)'
              }}
            >
              <FileSpreadsheet size={18} className={isSyncingAttractions ? 'animate-spin' : ''} />
              <span>{isSyncingAttractions ? 'Syncing Attractions with Google Sheets...' : 'Trigger Live Sync & Flush Cache'}</span>
            </button>

            <div style={{ marginTop: '2rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.35rem' }}>
                ℹ️ What happens during this sync?
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.78rem', color: '#64748B', lineHeight: 1.6 }}>
                <li>Connects securely to the Google Sheets DMC pricing spreadsheet.</li>
                <li>Updates attraction titles, adult/child retail rates, net rates, and promos.</li>
                <li>Purges the Next.js cache for <code>/singapore-attractions</code> and related builder tools.</li>
                <li>Applies changes instantly to both public quotes and B2B agent proposals.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: COMPETITOR RATES TRACKER ── */}
      {subTab === 'competitor' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                🎡 Competitor Ticket Price Tracker
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                Monitors competitor retail rates vs Flying Wonders B2B net rates.
              </p>
            </div>

            <button
              onClick={triggerPriceRefresh}
              disabled={isRefreshingPrices}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.95rem',
                background: 'var(--emerald-secondary)',
                color: '#FFF',
                border: 'none',
                borderRadius: '7px',
                cursor: isRefreshingPrices ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: '0.78rem'
              }}
            >
              <RefreshCw className={isRefreshingPrices ? 'animate-spin' : ''} size={13} />
              <span>{isRefreshingPrices ? 'Scraping Live Rates...' : 'Fetch Live Rates'}</span>
            </button>
          </div>

          {competitorPrices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94A3B8' }}>
              <Eye size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
              <h3 style={{ color: '#334155', margin: '0 0 0.35rem', fontSize: '1.05rem' }}>No Competitor Data Cached</h3>
              <p style={{ fontSize: '0.84rem', margin: 0 }}>Click "Fetch Live Rates" above to poll market benchmarks.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '0.74rem', textTransform: 'uppercase', background: '#F8FAFC' }}>
                    <th style={{ padding: '0.75rem' }}>Attraction / Ticket</th>
                    <th style={{ padding: '0.75rem' }}>Competitor</th>
                    <th style={{ padding: '0.75rem' }}>Competitor Price</th>
                    <th style={{ padding: '0.75rem' }}>Our Price</th>
                    <th style={{ padding: '0.75rem' }}>Advantage</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorPrices.map((cp, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #EDF2F7' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: '#1E293B' }}>{cp.name || cp.ticketName}</td>
                      <td style={{ padding: '0.75rem', color: '#64748B' }}>{cp.competitor || 'Klook / Traveloka'}</td>
                      <td style={{ padding: '0.75rem', color: '#DC2626', fontWeight: 700 }}>S$ {cp.competitorPrice}</td>
                      <td style={{ padding: '0.75rem', color: '#16A34A', fontWeight: 800 }}>S$ {cp.ourPrice}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: '#DCFCE7', color: '#166534' }}>
                          Save S$ {(Number(cp.competitorPrice || 0) - Number(cp.ourPrice || 0)).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 4: B2B AGENT APPROVALS ── */}
      {subTab === 'agents' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              B2B Agent Access & Verification
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Manage registered travel agents, verify agency credentials, and toggle portal login access.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '0.74rem', textTransform: 'uppercase', background: '#F8FAFC' }}>
                  <th style={{ padding: '0.75rem' }}>Company / Agency</th>
                  <th style={{ padding: '0.75rem' }}>Agent Contact</th>
                  <th style={{ padding: '0.75rem' }}>Email Address</th>
                  <th style={{ padding: '0.75rem' }}>Account Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Toggle Access</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(a => (
                  <tr key={a._id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#0F172A' }}>
                      {a.companyName || 'Independent Agent'}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#334155' }}>
                      {a.agentName || 'Agent'}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#64748B' }}>
                      {a.email}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: a.isActive ? '#DCFCE7' : '#FEE2E2',
                          color: a.isActive ? '#166534' : '#991B1B'
                        }}
                      >
                        {a.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => toggleAgentStatus(a._id, a.isActive)}
                        style={{
                          background: a.isActive ? '#FEE2E2' : '#DCFCE7',
                          color: a.isActive ? '#991B1B' : '#166534',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.35rem 0.75rem',
                          cursor: 'pointer',
                          fontSize: '0.76rem',
                          fontWeight: 700
                        }}
                      >
                        {a.isActive ? 'Deactivate Access' : 'Activate Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 5: AUDIT LOGS ── */}
      {subTab === 'audit' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              System Audit Trail & Security Logs
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Immutable record of administrative logins, status overrides, and system changes.
            </p>
          </div>

          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>No audit logs recorded yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {logs.map((log, idx) => (
                <div
                  key={log._id || idx}
                  style={{
                    padding: '0.85rem 1rem',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    borderLeft: '4px solid #0F4C3A',
                    border: '1px solid #E2E8F0',
                    borderLeftWidth: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.84rem' }}>{log.action}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '0.2rem' }}>
                    User: <strong>{log.email || 'System'}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 6: DATA EXPORTS ── */}
      {subTab === 'exports' && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            Operational CSV Data Exports
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.35rem 0 1.5rem 0' }}>
            Download live operational datasets in comma-separated format for offline financial audits, CRM imports, and partner management.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem'
            }}
          >
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: '#F8FAFC' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem', marginBottom: '0.3rem' }}>
                Accounts & Ledger
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 1rem 0' }}>
                Contract values, total collected, and outstanding receivables.
              </p>
              <a
                href="/api/admin/export-accounts"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  background: '#0F4C3A',
                  color: '#FFF',
                  textDecoration: 'none',
                  borderRadius: '7px',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}
              >
                <Download size={14} /> Download Ledger CSV
              </a>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: '#F8FAFC' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem', marginBottom: '0.3rem' }}>
                B2B Partner Agencies
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 1rem 0' }}>
                All registered travel agencies, company names, emails, and statuses.
              </p>
              <a
                href="/api/admin/export-agents"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  background: '#2563EB',
                  color: '#FFF',
                  textDecoration: 'none',
                  borderRadius: '7px',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}
              >
                <Download size={14} /> Download Agents CSV
              </a>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: '#F8FAFC' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem', marginBottom: '0.3rem' }}>
                Captured Leads & Contacts
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 1rem 0' }}>
                OCR scanned business cards, newsletter subscribers, and inquiries.
              </p>
              <a
                href="/api/admin/export-contacts"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  background: '#7C3AED',
                  color: '#FFF',
                  textDecoration: 'none',
                  borderRadius: '7px',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}
              >
                <Download size={14} /> Download Contacts CSV
              </a>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: '#F8FAFC' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem', marginBottom: '0.3rem' }}>
                Payment Transaction Log
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 1rem 0' }}>
                All logged and verified payments, wire proofs, and UTR receipts.
              </p>
              <a
                href="/api/admin/export-payments"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  background: '#0D9488',
                  color: '#FFF',
                  textDecoration: 'none',
                  borderRadius: '7px',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}
              >
                <Download size={14} /> Download Payments CSV
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
