'use client'

import React from 'react'
import {
  Mail,
  Users,
  Briefcase,
  Megaphone,
  ExternalLink,
  ShieldCheck,
  Radio,
  Eye,
  EyeOff
} from 'lucide-react'
import NewsletterCampaignManager from '../NewsletterCampaignManager'
import MarketingLeadsManager from '../MarketingLeadsManager'
import JobOpeningsManager from '../JobOpeningsManager'

interface AdminMarketingViewProps {
  subTab: string
  onSelectSubTab: (subTabId: string) => void
  adBlogEnabled: boolean
  adTravelToolsEnabled: boolean
  adTravelNewsEnabled: boolean
  adBorderTrafficEnabled: boolean
  adAirlinePromosEnabled: boolean
  toggleAdCategory: (category: string, currentStatus: boolean) => void
  toggleTravelNews: () => void
  toggleBorderTraffic: () => void
  toggleAirlinePromos: () => void
}

export default function AdminMarketingView({
  subTab,
  onSelectSubTab,
  adBlogEnabled,
  adTravelToolsEnabled,
  adTravelNewsEnabled,
  adBorderTrafficEnabled,
  adAirlinePromosEnabled,
  toggleAdCategory,
  toggleTravelNews,
  toggleBorderTraffic,
  toggleAirlinePromos
}: AdminMarketingViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      
      {/* ── SUB-TAB 1: NEWSLETTER CAMPAIGNS ── */}
      {subTab === 'newsletters' && (
        <div>
          <NewsletterCampaignManager />
        </div>
      )}

      {/* ── SUB-TAB 2: MARKETING LEADS DIRECTORY ── */}
      {subTab === 'leads' && (
        <div>
          <MarketingLeadsManager />
        </div>
      )}

      {/* ── SUB-TAB 3: CAREERS & JOB OPENINGS ── */}
      {subTab === 'jobs' && (
        <div>
          <JobOpeningsManager />
        </div>
      )}

      {/* ── SUB-TAB 4: ADS & MONETIZATION ── */}
      {subTab === 'ads' && (
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
              gap: '0.75rem',
              marginBottom: '1.5rem',
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: '1rem'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Megaphone size={20} color="var(--emerald-secondary)" /> Ad Placements & Radar Monetization
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                Toggle native affiliate travel deals, Google AdSense slots, and live information radars across public pages.
              </p>
            </div>

            <a
              href="/ads.txt"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#2563EB',
                textDecoration: 'none',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                padding: '0.45rem 0.95rem',
                borderRadius: '7px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>View Live ads.txt</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Ad & Radar Switch Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '1rem'
            }}
          >
            {/* 1. Blog Ads */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>Travel Blog Articles (/blog)</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: adBlogEnabled ? '#DCFCE7' : '#FEE2E2',
                    color: adBlogEnabled ? '#166534' : '#991B1B'
                  }}
                >
                  {adBlogEnabled ? 'ACTIVE 🟢' : 'DISABLED 🔴'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 1rem', lineHeight: 1.4 }}>
                In-article native travel sponsor slots & category feed leaderboard banners.
              </p>
              <button
                onClick={() => toggleAdCategory('blog', adBlogEnabled)}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '7px',
                  border: 'none',
                  background: adBlogEnabled ? '#EF4444' : '#10B981',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {adBlogEnabled ? 'Disable Blog Ads' : 'Enable Blog Ads'}
              </button>
            </div>

            {/* 2. Travel Tools Ads */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>Travel Tools (/travel-tools)</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: adTravelToolsEnabled ? '#DCFCE7' : '#FEE2E2',
                    color: adTravelToolsEnabled ? '#166534' : '#991B1B'
                  }}
                >
                  {adTravelToolsEnabled ? 'ACTIVE 🟢' : 'DISABLED 🔴'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 1rem', lineHeight: 1.4 }}>
                Utility sidebar & inline cards on Currency Converter & Pre-Departure checklist.
              </p>
              <button
                onClick={() => toggleAdCategory('travel-tools', adTravelToolsEnabled)}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '7px',
                  border: 'none',
                  background: adTravelToolsEnabled ? '#EF4444' : '#10B981',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {adTravelToolsEnabled ? 'Disable Tools Ads' : 'Enable Tools Ads'}
              </button>
            </div>

            {/* 3. Global Travel News Radar */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>Global Travel News Radar</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: adTravelNewsEnabled ? '#DCFCE7' : '#FEE2E2',
                    color: adTravelNewsEnabled ? '#166534' : '#991B1B'
                  }}
                >
                  {adTravelNewsEnabled ? 'VISIBLE 🟢' : 'HIDDEN 🔴'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 1rem', lineHeight: 1.4 }}>
                Live Singapore & Southeast Asia aviation & border news ticker on /travel-tools.
              </p>
              <button
                onClick={toggleTravelNews}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '7px',
                  border: 'none',
                  background: adTravelNewsEnabled ? '#EF4444' : '#10B981',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {adTravelNewsEnabled ? 'Hide News Radar' : 'Show News Radar'}
              </button>
            </div>

            {/* 4. Border Traffic Radar */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>Border Traffic Cameras</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: adBorderTrafficEnabled ? '#DCFCE7' : '#FEE2E2',
                    color: adBorderTrafficEnabled ? '#166534' : '#991B1B'
                  }}
                >
                  {adBorderTrafficEnabled ? 'VISIBLE 🟢' : 'HIDDEN 🔴'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 1rem', lineHeight: 1.4 }}>
                Live Woodlands & Tuas LTA Causeway camera feeds and wait-times on /travel-tools.
              </p>
              <button
                onClick={toggleBorderTraffic}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '7px',
                  border: 'none',
                  background: adBorderTrafficEnabled ? '#EF4444' : '#10B981',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {adBorderTrafficEnabled ? 'Hide Border Traffic' : 'Show Border Traffic'}
              </button>
            </div>

            {/* 5. Airline Promotions Radar */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>Airline Promotions Radar</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: adAirlinePromosEnabled ? '#DCFCE7' : '#FEE2E2',
                    color: adAirlinePromosEnabled ? '#166534' : '#991B1B'
                  }}
                >
                  {adAirlinePromosEnabled ? 'VISIBLE 🟢' : 'HIDDEN 🔴'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 1rem', lineHeight: 1.4 }}>
                Live SIA, IndiGo, Air India & Scoot promotional flight fare cards on /travel-tools.
              </p>
              <button
                onClick={toggleAirlinePromos}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '7px',
                  border: 'none',
                  background: adAirlinePromosEnabled ? '#EF4444' : '#10B981',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {adAirlinePromosEnabled ? 'Hide Airline Promos' : 'Show Airline Promos'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
