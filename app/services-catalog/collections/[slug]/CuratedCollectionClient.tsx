'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Calendar,
  MapPin,
  Building2,
  Compass,
  Utensils,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Copy,
  Check,
  ChevronRight,
  Clock,
  Star,
  CheckCircle2,
  Info,
  ShieldCheck,
  Share2,
  Bus,
  ArrowLeft,
  X,
  ExternalLink,
  ChevronDown,
  Phone,
  Layers,
  Award
} from 'lucide-react'
import { CuratedCollectionData } from '../../../../utils/curatedCollections'

interface Props {
  collection: CuratedCollectionData
}

export default function CuratedCollectionClient({ collection }: Props) {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'hotels' | 'attractions' | 'dining' | 'shopping' | 'tours' | 'tips'>('itinerary')
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedBlurb, setCopiedBlurb] = useState(false)
  const [showNewsletterModal, setShowNewsletterModal] = useState(false)
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({ 'day-1': true })

  const toggleDay = (key: string) => {
    setExpandedDays((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const expandAllDays = () => {
    const all: Record<string, boolean> = {}
    collection.itinerarySchedule?.forEach((_, i) => {
      all[`day-${i + 1}`] = true
    })
    setExpandedDays(all)
  }

  const collapseAllDays = () => {
    setExpandedDays({})
  }

  const whatsappMessage = encodeURIComponent(
    collection.customWhatsAppMessage?.replace('{collectionTitle}', collection.title) ||
      `Hi Flying Wonders! I would like to inquire about customized pricing, availability, and group bookings for the ${collection.title} Curated Collection.`
  )
  const whatsappUrl = `https://wa.me/919886171251?text=${whatsappMessage}`

  const copyUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const copyNewsletterText = () => {
    const text =
      collection.newsletterTeaser ||
      `✨ ${collection.title} (${collection.duration})\n\n${collection.tagline}\n\n👉 Complete One-Page Essentials Guide: https://flyingwonders.net/services-catalog/collections/${collection.slug}\n\n💬 Inquire on WhatsApp: https://wa.me/919886171251`
    navigator.clipboard.writeText(text)
    setCopiedBlurb(true)
    setTimeout(() => setCopiedBlurb(false), 2500)
  }

  const hotelsCount = collection.featuredHotels?.length || 0
  const attrCount = collection.featuredAttractions?.length || 0
  const diningCount = collection.featuredDining?.length || 0
  const shoppingCount = collection.featuredShopping?.length || 0
  const toursCount = collection.featuredTours?.length || 0
  const daysCount = collection.itinerarySchedule?.length || 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 pb-24 md:pb-12">
      {/* Top Breadcrumb Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 overflow-hidden">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link href="/services-catalog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0">
              Catalog
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link href="/services-catalog/collections" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0">
              Collections
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-slate-900 dark:text-slate-100 font-medium truncate">{collection.title}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowNewsletterModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Copy newsletter email blurb"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Newsletter Snippet</span>
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Inquire Package</span>
            </a>
          </div>
        </div>
      </div>

      {/* Hero Showcase */}
      <section className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          {collection.coverImageUrl ? (
            <img
              src={collection.coverImageUrl}
              alt={collection.title}
              className="w-full h-full object-cover opacity-25 scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-4xl">
            {/* Top Badge & Duration */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-500 text-slate-950 shadow-sm">
                {collection.badge || 'CURATED ESSENTIALS'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur border border-white/20">
                {collection.duration}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                {collection.destination}
              </span>
              {collection.targetAudience && (
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Target: {collection.targetAudience}
                </span>
              )}
            </div>

            {/* Collection Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-serif tracking-tight text-white mb-4 leading-tight">
              {collection.title}
            </h1>

            {/* Tagline */}
            {collection.tagline && (
              <p className="text-base sm:text-lg md:text-xl text-slate-300 font-sans leading-relaxed mb-6">
                {collection.tagline}
              </p>
            )}

            {/* Inclusions Counter Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur max-w-2xl mb-8">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-400">Duration</div>
                  <div className="text-xs font-bold text-white">{daysCount} Days Plan</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-400">Hotels</div>
                  <div className="text-xs font-bold text-white">{hotelsCount} Stays</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-400">Attractions</div>
                  <div className="text-xs font-bold text-white">{attrCount} Sights</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Utensils className="w-4 h-4 text-pink-400 shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-400">Dining</div>
                  <div className="text-xs font-bold text-white">{diningCount} Spots</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <ShoppingBag className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-400">Shopping</div>
                  <div className="text-xs font-bold text-white">{shoppingCount} Hubs</div>
                </div>
              </div>
            </div>

            {/* Quick Hero Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/40 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire This Collection via WhatsApp</span>
              </a>

              <button
                onClick={() => setShowNewsletterModal(true)}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <Share2 className="w-4 h-4 text-blue-400" />
                <span>Copy for Newsletter</span>
              </button>

              <button
                onClick={copyUrl}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Section Navigation Pill Bar */}
      <div className="sticky top-[49px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            <a
              href="#section-overview"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 transition shrink-0"
            >
              Overview & Highlights
            </a>
            {daysCount > 0 && (
              <a
                href="#section-itinerary"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 transition shrink-0"
              >
                📅 Day-by-Day Blueprint ({daysCount})
              </a>
            )}
            {hotelsCount > 0 && (
              <a
                href="#section-hotels"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 transition shrink-0"
              >
                🏨 Curated Stays ({hotelsCount})
              </a>
            )}
            {attrCount > 0 && (
              <a
                href="#section-attractions"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 transition shrink-0"
              >
                🎡 Attractions ({attrCount})
              </a>
            )}
            {diningCount > 0 && (
              <a
                href="#section-dining"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 transition shrink-0"
              >
                🍽️ Dining & Food ({diningCount})
              </a>
            )}
            {shoppingCount > 0 && (
              <a
                href="#section-shopping"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 transition shrink-0"
              >
                🛍️ Retail & Malls ({shoppingCount})
              </a>
            )}
            {toursCount > 0 && (
              <a
                href="#section-tours"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 transition shrink-0"
              >
                🚍 Tour Circuit ({toursCount})
              </a>
            )}
            {collection.insiderTips && collection.insiderTips.length > 0 && (
              <a
                href="#section-tips"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 transition shrink-0"
              >
                💡 Curator Tips
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* 1. Overview & Key Highlights */}
        <section id="section-overview" className="scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
                The Curator Narrative
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
                Why this collection was engineered
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                <p>{collection.overview}</p>
              </div>

              {/* Target Audience Note */}
              {collection.targetAudience && (
                <div className="mt-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs sm:text-sm text-blue-950 dark:text-blue-200">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Recommended Traveler Profile:
                  </div>
                  <p>{collection.targetAudience}</p>
                </div>
              )}
            </div>

            {/* Highlights Box */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Standout Inclusions
              </h3>
              <div className="space-y-3">
                {collection.highlights?.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Quick WhatsApp Inquiry
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Day-by-Day Itinerary Blueprint */}
        {daysCount > 0 && (
          <section id="section-itinerary" className="scroll-mt-32">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Turnkey Blueprint
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
                  Day-by-Day Tour Itinerary
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={expandAllDays}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAllDays}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  Collapse All
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {collection.itinerarySchedule?.map((day, idx) => {
                const key = day._key || `day-${idx + 1}`
                const isExpanded = !!expandedDays[key]

                return (
                  <div
                    key={key}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
                  >
                    <button
                      onClick={() => toggleDay(key)}
                      className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-blue-600 text-white shrink-0">
                          {day.day || `Day ${idx + 1}`}
                        </span>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-slate-100">
                            {day.title}
                          </h3>
                          {!isExpanded && day.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {day.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                        {day.description && (
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {day.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          {day.morning && (
                            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                              <span className="font-bold text-amber-800 dark:text-amber-400 block mb-1">
                                🌅 Morning Plan
                              </span>
                              <p className="text-slate-700 dark:text-slate-300">{day.morning}</p>
                            </div>
                          )}

                          {day.afternoon && (
                            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs">
                              <span className="font-bold text-blue-800 dark:text-blue-400 block mb-1">
                                ☀️ Afternoon Plan
                              </span>
                              <p className="text-slate-700 dark:text-slate-300">{day.afternoon}</p>
                            </div>
                          )}

                          {day.evening && (
                            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 text-xs">
                              <span className="font-bold text-indigo-800 dark:text-indigo-400 block mb-1">
                                🌙 Evening Plan
                              </span>
                              <p className="text-slate-700 dark:text-slate-300">{day.evening}</p>
                            </div>
                          )}
                        </div>

                        {day.recommendedDining && (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Utensils className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                            <span>
                              <strong>Recommended Dining:</strong> {day.recommendedDining}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 3. Curated Hotels */}
        {hotelsCount > 0 && (
          <section id="section-hotels" className="scroll-mt-32">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Building2 className="w-3.5 h-3.5" />
                Selected Stays
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
                Curated Partner Hotels
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Hand-picked for proximity to MRT lines, family room availability, and verified hospitality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collection.featuredHotels?.map((h) => {
                const img = h.coverImageUrl || h.photoUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'
                return (
                  <div
                    key={h._id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 w-full bg-slate-800">
                        <img src={img} alt={h.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-950/80 text-amber-400 backdrop-blur">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{h.starRating || '4-Star'}</span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-slate-100 mb-1">
                          {h.name}
                        </h3>
                        {h.hotelAddress && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span className="truncate">{h.hotelAddress}</span>
                          </div>
                        )}
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                          {h.description || h.shortDescription}
                        </p>

                        {/* Features chips */}
                        {h.features && h.features.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {h.features.slice(0, 4).map((f, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 mt-auto">
                      {h.slug ? (
                        <Link
                          href={`/services-catalog/hotels/${h.slug}`}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                          View Hotel Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">Official Partner Hotel</span>
                      )}

                      <a
                        href={`https://wa.me/919886171251?text=Hi%20Flying%20Wonders!%20I%20would%20like%20to%20inquire%20about%20rates%20for%20${encodeURIComponent(h.name)}%20under%20the%20${encodeURIComponent(collection.title)}%20collection.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition inline-flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Inquire Rates
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 4. Curated Attractions */}
        {attrCount > 0 && (
          <section id="section-attractions" className="scroll-mt-32">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Compass className="w-3.5 h-3.5" />
                Must-Do Experiences
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
                Curated Attractions & Sightseeing
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Included highlights with recommended visit durations and tips.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collection.featuredAttractions?.map((a) => {
                const img = a.coverImageUrl || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop'
                return (
                  <div
                    key={a._id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 w-full bg-slate-800">
                        <img src={img} alt={a.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="p-5">
                        <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
                          {a.name}
                        </h3>

                        {a.timings && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
                            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">{a.timings}</span>
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                          {a.description}
                        </p>

                        {a.features && a.features.length > 0 && (
                          <div className="space-y-1 mb-4">
                            {a.features.slice(0, 2).map((f, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                                <span className="line-clamp-1">{f}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 mt-auto">
                      {a.slug ? (
                        <Link
                          href={`/services-catalog/attractions/${a.slug}`}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                          Attraction Guide
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">Instant Admission Voucher</span>
                      )}

                      <a
                        href={`https://wa.me/919886171251?text=Hi%20Flying%20Wonders!%20I%20would%20like%20to%20inquire%20about%20tickets%20for%20${encodeURIComponent(a.name)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition inline-flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Ticket Desk
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 5. Curated Dining */}
        {diningCount > 0 && (
          <section id="section-dining" className="scroll-mt-32">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                <Utensils className="w-3.5 h-3.5" />
                Culinary Highlights
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
                Curated Dining & Food Gems
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Authentic Indian cuisine, certified Halal buffets, and vegetarian sanctuaries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collection.featuredDining?.map((d) => (
                <div
                  key={d._id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-slate-100">
                          {d.name}
                        </h3>
                        {d.cuisineType && (
                          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                            {d.cuisineType}
                          </div>
                        )}
                      </div>
                      {d.priceTier && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {d.priceTier}
                        </span>
                      )}
                    </div>

                    {d.address && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{d.address}</span>
                      </div>
                    )}

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                      {d.description}
                    </p>

                    {/* Dietary Badges */}
                    {d.dietaryTypes && d.dietaryTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {d.dietaryTypes.map((dt, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          >
                            {dt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 mt-auto">
                    {d.slug ? (
                      <Link
                        href={`/services-catalog/restaurants/${d.slug}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        Restaurant Profile
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">Curated Group Dining Partner</span>
                    )}

                    <a
                      href={`https://wa.me/919886171251?text=Hi%20Flying%20Wonders!%20I%20would%20like%20to%20reserve%20group%20dining%20at%20${encodeURIComponent(d.name)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition inline-flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Reserve Table
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Curated Shopping */}
        {shoppingCount > 0 && (
          <section id="section-shopping" className="scroll-mt-32">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                <ShoppingBag className="w-3.5 h-3.5" />
                Retail & Souvenirs
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
                Curated Shopping & Outlet Hubs
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Designer outlet bargains, electronic districts, and street market souvenirs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collection.featuredShopping?.map((m) => (
                <div
                  key={m._id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-slate-100 mb-1">
                      {m.name}
                    </h3>
                    {m.heroSubtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{m.heroSubtitle}</p>
                    )}

                    {m.mrtStation && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-4">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span>MRT: {m.mrtStation}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 mt-auto">
                    {m.slug ? (
                      <Link
                        href={`/travel-tools/shopping-malls/${m.slug}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        Explore Shopping Guide
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">9% GST eTRS Refund Eligible</span>
                    )}

                    <Link
                      href="/travel-tools/shopping-guide"
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                    >
                      9% Tax Refund Guide
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Curated Tours & Package Circuits */}
        {toursCount > 0 && (
          <section id="section-tours" className="scroll-mt-32">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Bus className="w-3.5 h-3.5" />
                Underpinning Circuit
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
                Curated Guided Tour Package
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                The land circuit providing transportation, ticketing, and licensed guide escort.
              </p>
            </div>

            <div className="space-y-4">
              {collection.featuredTours?.map((t) => (
                <div
                  key={t._id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        {t.duration || 'LAND CIRCUIT'}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-2">
                        {t.name}
                      </h3>
                    </div>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Inquire Full Circuit
                    </a>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {t.description}
                  </p>

                  {t.features && t.features.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                      {t.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Curator Insider Tips & Checklist */}
        {collection.insiderTips && collection.insiderTips.length > 0 && (
          <section id="section-tips" className="scroll-mt-32">
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-3xl border border-amber-300/40 dark:border-amber-900/40 p-6 sm:p-8">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">
                <Info className="w-4 h-4" />
                Curator Logistics Checklist
              </div>
              <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mb-4">
                Insider Tips for This Collection
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {collection.insiderTips.map((tip, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-900/30 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1 shadow-sm"
                  >
                    <span className="font-bold text-amber-600 dark:text-amber-400 block text-xs">
                      Tip #{i + 1}
                    </span>
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Bottom CTA Card */}
        <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950">
              Ready to Book or Customize?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
              Get Instant B2B / Family Rates for {collection.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Our operations team responds in minutes on WhatsApp with exact dates, hotel room allocations, and special group discounts.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Concierge Desk on WhatsApp</span>
              </a>
              <Link
                href="/services-catalog/collections"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/20 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Explore Other Collections</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Mobile Bottom Floating Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 p-3 shadow-2xl flex items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Inquire via WhatsApp</span>
        </a>

        <button
          onClick={() => setShowNewsletterModal(true)}
          className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Share for Newsletter"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Newsletter / Campaign Copy Modal */}
      {showNewsletterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Share2 className="w-5 h-5" />
                <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-slate-100">
                  Newsletter & Email Teaser
                </h3>
              </div>
              <button
                onClick={() => setShowNewsletterModal(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Use this pre-formatted blurb in your email blasts, customer proposals, or WhatsApp campaigns. Click copy to grab the snippet:
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-mono whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
              {collection.newsletterTeaser ||
                `✨ ${collection.title} (${collection.duration})\n\n${collection.tagline}\n\n👉 Complete One-Page Essentials Guide: https://flyingwonders.net/services-catalog/collections/${collection.slug}\n\n💬 Inquire on WhatsApp: https://wa.me/919886171251`}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowNewsletterModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
              <button
                onClick={copyNewsletterText}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
              >
                {copiedBlurb ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBlurb ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
