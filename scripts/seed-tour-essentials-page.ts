import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8xtd7yiv'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

if (!token) {
  console.error('❌ SANITY_WRITE_TOKEN is missing in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false
})

async function seedTourEssentialsPage() {
  console.log('🚀 Seeding Default Tour Essentials Showcase Page to Sanity...')

  // Fetch collections, hotels, attractions, dining, malls, tours
  const collections = await client.fetch(`*[_type == "curatedCollection"]{ _id, title }`)
  const hotels = await client.fetch(`*[_type in ["b2bServiceMedia", "hotelMeta"] && (category == "hotel" || _type == "hotelMeta")]{ _id, title, name }`)
  const attractions = await client.fetch(`*[_type in ["b2bServiceMedia", "attractionMeta"] && (category == "attraction" || _type == "attractionMeta")]{ _id, title, name }`)
  const dining = await client.fetch(`*[_type in ["restaurantMeta", "b2bServiceMedia"] && (category == "restaurant" || _type == "restaurantMeta")]{ _id, title, name }`)
  const malls = await client.fetch(`*[_type == "shoppingMall"]{ _id, name }`)
  const tours = await client.fetch(`*[_type in ["b2bServiceMedia", "readyPackageTemplate"] && (category == "tour" || _type == "readyPackageTemplate")]{ _id, title, name }`)

  const findHotel = (match: string) => hotels.find((h: any) => (h.title || h.name || '').toLowerCase().includes(match.toLowerCase()))?._id
  const findAttraction = (match: string) => attractions.find((a: any) => (a.title || a.name || '').toLowerCase().includes(match.toLowerCase()))?._id
  const findDining = (match: string) => dining.find((d: any) => (d.title || d.name || '').toLowerCase().includes(match.toLowerCase()))?._id
  const findMall = (match: string) => malls.find((m: any) => (m.name || '').toLowerCase().includes(match.toLowerCase()))?._id
  const findTour = (match: string) => tours.find((t: any) => (t.title || t.name || '').toLowerCase().includes(match.toLowerCase()))?._id

  const selectedColRefs = collections.slice(0, 3).map((c: any) => ({ _type: 'reference', _ref: c._id, _key: `col-${c._id}` }))
  
  const selectedHotelRefs = [
    findHotel('Boss'),
    findHotel('Lavender'),
    findHotel('Bugis'),
    findHotel('Copthorne')
  ].filter(Boolean).map((id: any) => ({ _type: 'reference', _ref: id, _key: `hotel-${id}` }))

  const selectedAttrRefs = [
    findAttraction('gardens-by-the-bay'),
    findAttraction('sea-aquarium') || findAttraction('Oceanarium'),
    findAttraction('night-safari'),
    findAttraction('bird-paradise')
  ].filter(Boolean).map((id: any) => ({ _type: 'reference', _ref: id, _key: `attr-${id}` }))

  const selectedDiningRefs = [
    findDining('ananda'),
    findDining('bismillah'),
    findDining('eight')
  ].filter(Boolean).map((id: any) => ({ _type: 'reference', _ref: id, _key: `dining-${id}` }))

  const selectedMallRefs = malls.slice(0, 3).map((m: any) => ({ _type: 'reference', _ref: m._id, _key: `mall-${m._id}` }))

  const selectedTourRefs = [
    findTour('sentosa'),
    findTour('mandai')
  ].filter(Boolean).map((id: any) => ({ _type: 'reference', _ref: id, _key: `tour-${id}` }))

  const doc = {
    _id: 'default-tour-essentials-showcase',
    _type: 'tourEssentialsPage',
    title: 'Singapore & Malaysia Tour Essentials Guide (2026 Edition)',
    slug: { _type: 'slug', current: 'tour-essentials' },
    isDefaultShowcase: true,
    heroBadge: 'CURATED SHOWCASE · 2026 EDITION',
    heroTitle: 'Destination Tour Essentials',
    heroSubtitle: 'A hand-picked editor shortlist of signature travel collections, premier partner hotels, iconic attractions, authentic dining, and retail hubs. An essential one-page guide for group leaders, newsletter subscribers, and discerning travelers.',
    featuredCollections: selectedColRefs,
    featuredHotels: selectedHotelRefs,
    featuredAttractions: selectedAttrRefs,
    featuredDining: selectedDiningRefs,
    featuredShoppingMalls: selectedMallRefs,
    featuredTours: selectedTourRefs,
    newsletterSnippet: 'Looking for a turnkey trip to Singapore & Malaysia? Explore our newly curated 2026 Tour Essentials Showcase! Features editor-approved hotels, Sentosa & Mandai highlights, authentic halal & vegetarian dining, and designer outlet shopping—all in one convenient guide. Click to explore and get instant WhatsApp rates: https://flyingwonders.net/tour-essentials',
    customWhatsAppMessage: 'Hi Flying Wonders! I am browsing the Tour Essentials Showcase and would like to inquire about customized itinerary arrangements and group booking rates.'
  }

  console.log(`⏳ Upserting [${doc.title}]...`)
  await client.createOrReplace(doc)
  console.log(`✅ Upserted Tour Essentials Showcase successfully!`)
}

seedTourEssentialsPage().catch(err => {
  console.error('❌ Failed to seed showcase:', err)
  process.exit(1)
})
