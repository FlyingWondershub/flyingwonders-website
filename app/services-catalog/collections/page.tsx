'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  Search,
  Filter,
  Users,
  Clock,
  Layers,
  ChevronRight,
  Briefcase,
  Heart,
  BookOpen
} from 'lucide-react'
import { getAllCuratedCollections, CuratedCollectionData } from '../../../utils/curatedCollections'

const CATEGORY_TABS = [
  { id: 'all', label: 'All Collections', icon: Layers },
  { id: 'family', label: '👨‍👩‍👧‍👦 Family & Kids', icon: Users },
  { id: 'cross-border', label: '🚍 Cross-Border (SG + MY)', icon: MapPin },
  { id: 'corporate', label: '💼 Corporate MICE', icon: Briefcase },
  { id: 'culture', label: '🍛 Culture & Food', icon: Utensils },
  { id: 'honeymoon', label: '💍 Honeymoon & Couples', icon: Heart },
]

export default function CuratedCollectionsIndexPage() {
  const [collections, setCollections] = useState<CuratedCollectionData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDestination, setSelectedDestination] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllCuratedCollections()
        setCollections(data)
      } catch (err) {
        console.error('Failed to load curated collections:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredCollections = useMemo(() => {
    return collections.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category?.toLowerCase() === selectedCategory.toLowerCase()
      const matchesDestination =
        selectedDestination === 'all' ||
        (selectedDestination === 'Singapore' && item.destination === 'Singapore') ||
        (selectedDestination === 'Malaysia' && item.destination === 'Malaysia') ||
        (selectedDestination === 'Cross Border' && (item.destination === 'Cross Border' || item.destination.includes('+')))
      
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.tagline?.toLowerCase().includes(q) ||
        item.targetAudience?.toLowerCase().includes(q) ||
        item.destination?.toLowerCase().includes(q) ||
        item.highlights?.some((h) => h.toLowerCase().includes(q))

      return matchesCategory && matchesDestination && matchesSearch
    })
  }, [collections, selectedCategory, selectedDestination, searchQuery])

  const copyNewsletterSnippet = (e: React.MouseEvent, item: CuratedCollectionData) => {
    e.preventDefault()
    e.stopPropagation()
    const textToCopy =
      item.newsletterTeaser ||
      `✨ ${item.title} (${item.duration})\n${item.tagline}\n\n👉 View Complete Essentials Guide: https://flyingwonders.net/services-catalog/collections/${item.slug}`
    navigator.clipboard.writeText(textToCopy)
    setCopiedId(item._id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Breadcrumb Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/services-catalog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Services Catalog
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 dark:text-slate-100 font-medium">Curated Collections</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/services-catalog"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Browse Full Inventory
            </Link>
            <a
              href="https://wa.me/919886171251?text=Hi%20Flying%20Wonders!%20I%20would%20like%20to%20inquire%20about%20a%20customized%20Curated%20Collection%20for%20our%20group."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp Concierge
            </a>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950 text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/40">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Turnkey Itinerary Essentials
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-serif text-white mb-4">
            Curated Travel Collections
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-sans">
            One-page blueprints hand-crafted for newsletters, corporate proposals, and specialized travel sectors. 
            Each collection bundles recommended hotels, must-do attractions, authentic dining, and guided circuits.
          </p>

          {/* Quick Newsletter Pitch Callout */}
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs sm:text-sm text-slate-300 backdrop-blur">
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Newsletter & Agency Ready:</strong> Click any card to view the complete essentials guide or copy 1-click email teaser blurbs.
            </span>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 transition-colors">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by collection title, theme, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Destination Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
                Destination:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 w-full">
                {['all', 'Singapore', 'Malaysia', 'Cross Border'].map((dest) => (
                  <button
                    key={dest}
                    onClick={() => setSelectedDestination(dest)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                      selectedDestination === dest
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {dest === 'all' ? 'All Destinations' : dest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sector Category Tabs */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = selectedCategory === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Collections Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
              Curated Itinerary Blueprints
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Showing {filteredCollections.length} curated collection{filteredCollections.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse space-y-4"
              >
                <div className="h-52 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
            <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No collections match your filter</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-6">
              Try adjusting your category, destination, or search query to explore other blueprints.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all')
                setSelectedDestination('all')
                setSearchQuery('')
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCollections.map((col) => {
              const hotelsCount = col.featuredHotels?.length || 0
              const attrCount = col.featuredAttractions?.length || 0
              const diningCount = col.featuredDining?.length || 0
              const shoppingCount = col.featuredShopping?.length || 0

              return (
                <div
                  key={col._id}
                  className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Image & Badges */}
                    <div className="relative h-56 w-full overflow-hidden bg-slate-800">
                      {col.coverImageUrl ? (
                        <img
                          src={col.coverImageUrl}
                          alt={col.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-indigo-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500 text-slate-950 shadow-sm">
                          {col.badge || 'CURATED'}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur border border-white/20">
                          {col.duration}
                        </span>
                      </div>

                      {/* Destination Pill */}
                      <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-medium text-slate-200 bg-slate-950/70 backdrop-blur px-2.5 py-1 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        <span>{col.destination}</span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                        <Link href={`/services-catalog/collections/${col.slug}`}>
                          {col.title}
                        </Link>
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                        {col.tagline || col.overview}
                      </p>

                      {/* Included Components Counter Pill */}
                      <div className="grid grid-cols-4 gap-1.5 py-2 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center mb-5">
                        <div>
                          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                            <Building2 className="w-3 h-3 text-blue-500" />
                            Stays
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">{hotelsCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                            <Compass className="w-3 h-3 text-emerald-500" />
                            Sights
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">{attrCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                            <Utensils className="w-3 h-3 text-amber-500" />
                            Dine
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">{diningCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                            <ShoppingBag className="w-3 h-3 text-purple-500" />
                            Shop
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">{shoppingCount}</div>
                        </div>
                      </div>

                      {/* Standout Highlights Preview */}
                      {col.highlights && col.highlights.length > 0 && (
                        <div className="space-y-1.5 mb-4">
                          {col.highlights.slice(0, 2).map((h, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                              <span className="line-clamp-1">{h}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom CTA Actions */}
                  <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 mt-auto">
                    <Link
                      href={`/services-catalog/collections/${col.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition group/btn"
                    >
                      <span>Explore Essentials</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>

                    {/* Copy Newsletter Snippet */}
                    <button
                      type="button"
                      onClick={(e) => copyNewsletterSnippet(e, col)}
                      title="Copy newsletter email blurb"
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shrink-0"
                    >
                      {copiedId === col._id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom Newsletter Promotion Box */}
        <section className="mt-16 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-400/20 text-blue-200 border border-blue-300/30">
              For Tour Organizers & Newsletter Editors
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif mt-4 mb-3">
              Need a Custom Turnkey Collection for Your Campaign?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed mb-6 font-sans">
              Our destination operations team can create bespoke one-page collections curated specifically for your corporate incentive group, school delegation, or seasonal newsletter promotion.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/919886171251?text=Hi%20Flying%20Wonders!%20We%20would%20like%20to%20request%20a%20customized%20Curated%20Collection%20for%20our%20newsletter%20campaign."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Our Operations Desk
              </a>
              <Link
                href="/services-catalog"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/20 transition"
              >
                Browse Master Inventory Catalog
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
