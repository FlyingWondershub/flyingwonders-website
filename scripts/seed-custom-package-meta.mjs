import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@sanity/client'
import * as XLSX from 'xlsx'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 1. Parse .env.local for Sanity credentials
const envPath = path.resolve(__dirname, '../.env.local')
let projectId = '8xtd7yiv'
let dataset = 'production'
let writeToken = ''

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [k, ...v] = trimmed.split('=')
    const key = k.trim()
    const val = v.join('=').trim().replace(/^['"]|['"]$/g, '')
    if (key === 'NEXT_PUBLIC_SANITY_PROJECT_ID') projectId = val
    if (key === 'NEXT_PUBLIC_SANITY_DATASET') dataset = val
    if (key === 'SANITY_WRITE_TOKEN' || key === 'SANITY_API_TOKEN') writeToken = val
  }
}

if (!writeToken) {
  console.error('❌ Missing SANITY_WRITE_TOKEN in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-07-09',
  useCdn: false,
  token: writeToken
})

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=xlsx'

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// Curated high-res Unsplash photos (crisp, reliable CDN delivery)
const IMAGE_LIBRARY = {
  // Transfers
  sedan: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1000&auto=format&fit=crop&q=85',
  minibus: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1000&auto=format&fit=crop&q=85',
  mediumCoach: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=85',
  fullCoach: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=1000&auto=format&fit=crop&q=85',
  superCoach: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=85',
  sicBus: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1000&auto=format&fit=crop&q=85',

  // Guides
  airportGuide: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000&auto=format&fit=crop&q=85',
  gardensGuide: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1000&auto=format&fit=crop&q=85',
  cityGuide: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1000&auto=format&fit=crop&q=85',
  wildlifeGuide: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=1000&auto=format&fit=crop&q=85',
  sentosaGuide: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=85',
  themeParkGuide: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&auto=format&fit=crop&q=85',
  generalGuide: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1000&auto=format&fit=crop&q=85',

  // Hotels
  luxuryHotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop&q=85',
  cityHotel: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=85',
  poolHotel: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&auto=format&fit=crop&q=85',
  boutiqueHotel: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&auto=format&fit=crop&q=85',
  heritageHotel: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1000&auto=format&fit=crop&q=85',
  budgetHotel: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&auto=format&fit=crop&q=85',

  // Meals
  breakfastBuffet: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1000&auto=format&fit=crop&q=85',
  lunchBuffet: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=85',
  dinnerBuffet: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=85',
  indianThali: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=1000&auto=format&fit=crop&q=85',
  dosaSambar: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=1000&auto=format&fit=crop&q=85',
  biryaniPlatter: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1000&auto=format&fit=crop&q=85',
  tandooriNaan: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&auto=format&fit=crop&q=85',
  courtyardCafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=85',
}

const uploadedAssetsCache = new Map()

async function getOrUploadAsset(url, filename) {
  if (uploadedAssetsCache.has(url)) {
    return uploadedAssetsCache.get(url)
  }
  console.log(`  📸 Downloading & uploading asset: ${filename} ...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  const arrayBuf = await res.arrayBuffer()
  const asset = await client.assets.upload('image', Buffer.from(arrayBuf), { filename })
  uploadedAssetsCache.set(url, asset)
  return asset
}

async function main() {
  console.log('🚀 Starting Sanity Custom Package Metadata Seeder...')
  console.log(`📡 Project ID: ${projectId} | Dataset: ${dataset}`)

  // 1. Fetch live Google Sheet
  console.log('📥 Fetching Google Sheets workbook...')
  const sheetRes = await fetch(DEFAULT_SHEET_URL)
  if (!sheetRes.ok) throw new Error(`Failed to download spreadsheet: HTTP ${sheetRes.status}`)
  const sheetBuf = await sheetRes.arrayBuffer()
  const wb = XLSX.read(new Uint8Array(sheetBuf), { type: 'array' })

  // ─────────────────────────────────────────────────────────────
  // 1. TRANSFERS SEEDING
  // ─────────────────────────────────────────────────────────────
  console.log('\n==============================')
  console.log('🚗 1. SEEDING TRANSFERS')
  console.log('==============================')
  const tSheet = wb.Sheets['Transfers']
  if (!tSheet) throw new Error('Sheet "Transfers" not found in workbook')
  const tRows = XLSX.utils.sheet_to_json(tSheet)
  const seenTransfers = new Set()

  for (const row of tRows) {
    const v = (row['Vehicle Type'] || '').trim()
    const t = (row['Transfer Type'] || '').trim()
    const rt = (row['Rate type'] || row['Rate Type'] || '').trim()
    const s = (row['Service Name'] || row['Service'] || row['Transfers'] || 'Transfers').trim()
    const combo = [v, t, rt, s].filter(Boolean).join(' - ')
    if (!combo || combo === 'Transfers' || seenTransfers.has(combo)) continue
    seenTransfers.add(combo)

    let cat = 'Other'
    let capPax = 'Up to 4 Passengers'
    let capLug = '2-3 Large Suitcases'
    let imgKey = 'sedan'
    let features = ['Air Conditioned', 'Door-to-Door Service', 'Professional Chauffeur']

    if (combo.startsWith('Sedan')) {
      cat = 'Sedan'
      capPax = 'Up to 3 Passengers'
      capLug = '2 Large Suitcases (24") + 2 Handbags'
      imgKey = 'sedan'
      features = ['Air Conditioned', 'Door-to-Door Service', 'Professional Chauffeur', 'Flight Tracking Included', 'Bottled Water']
    } else if (combo.startsWith('13-Seater')) {
      cat = 'Minibus'
      capPax = 'Up to 9-13 Passengers'
      capLug = '9 Large Suitcases (28") + Handbags'
      imgKey = 'minibus'
      features = ['High Roof Headroom', 'Automatic Sliding Door', 'Chilled Air Conditioning', 'Dedicated Luggage Compartment', 'Driver Assistance']
    } else if (combo.startsWith('24-Seater')) {
      cat = 'Medium Coach'
      capPax = 'Up to 20-23 Passengers'
      capLug = '20 Large Suitcases + Cabin Bags'
      imgKey = 'mediumCoach'
      features = ['Reclining Fabric Seats', 'Onboard PA System & Mic', 'Overhead Luggage Racks', 'Spacious Legroom', 'Chilled Climate Control']
    } else if (combo.startsWith('45-Seater')) {
      cat = 'Full Coach'
      capPax = 'Up to 40-44 Passengers'
      capLug = '40 Large Stowed Suitcases'
      imgKey = 'fullCoach'
      features = ['High-Deck Panoramic Windows', 'Undercarriage Luggage Holds', 'Dual Zone AC', 'Ergonomic Reclining Seats', 'Tour Guide PA System']
    } else if (combo.startsWith('55-Seater')) {
      cat = 'Super Coach'
      capPax = 'Up to 49-53 Passengers'
      capLug = '50 Large Stowed Suitcases'
      imgKey = 'superCoach'
      features = ['Maximum Group Capacity', 'Massive Undercarriage Storage', 'Dual Passenger Entry Doors', 'High Output Climate Control', 'PA Sound Integration']
    } else if (combo.startsWith('SIC')) {
      cat = 'SIC'
      capPax = 'Per Person Reserved Seat'
      capLug = '1 Standard Suitcase + 1 Cabin Bag'
      imgKey = 'sicBus'
      features = ['Cost Effective Shared Transit', 'Air Conditioned Coach', 'Scheduled Departure', 'Luggage Allowance Included']
    }

    let shortDesc = `${v || 'Private'} transfer service in Singapore with dedicated professional chauffeur.`
    let longDesc = `Enjoy seamless and comfortable transit across Singapore in a well-maintained, fully air-conditioned ${v || 'vehicle'}. Includes direct door-to-door pickup and experienced driver navigation.`

    if (s.toLowerCase().includes('arrival')) {
      shortDesc = `Dedicated Changi Airport arrival reception and swift transit to your hotel in a ${v}.`
      longDesc = `Professional airport arrival service. Your chauffeur meets you at the arrival hall, assists with luggage loading, and ensures direct, relaxing highway transit to your accommodation.`
    } else if (s.toLowerCase().includes('departure')) {
      shortDesc = `Punctual hotel pickup and direct transfer to Changi Airport Terminal in a ${v}.`
      longDesc = `Stress-free airport departure transfer. Driver arrives promptly at your hotel lobby, handles luggage stowage, and ensures timely arrival at your departure terminal.`
    } else if (s.toLowerCase().includes('city tour')) {
      shortDesc = `Private chartered ${v} for curated Singapore city exploration and group sightseeing.`
      longDesc = `Chartered sightseeing service tailored to your party. Travel comfortably between iconic landmarks like Merlion Park, Chinatown, Little India, and Marina Bay with dedicated driver standby.`
    } else if (s.toLowerCase().includes('disposal')) {
      shortDesc = `Hourly chartered ${v} with dedicated professional chauffeur on standby.`
      longDesc = `Flexible vehicle disposal by the hour for business meetings, shopping sprees, or custom itineraries. Enjoy unlimited stops across Singapore with your chauffeur at your service.`
    } else if (s.toLowerCase().includes('hotel pickup')) {
      shortDesc = `Additional hotel pickup stop for ${v} group transfer.`
      longDesc = `Convenient secondary hotel stop to pick up or drop off members of your travel group staying at different hotels across Singapore.`
    } else if (s.toLowerCase().includes('round trip')) {
      shortDesc = `Seat-in-Coach (SIC) round-trip airport transfers between Changi and major city hotels.`
      longDesc = `Convenient scheduled shared coach service providing reliable round-trip transfers between Changi Airport terminals and key tourist hotels in Singapore.`
    }

    const asset = await getOrUploadAsset(IMAGE_LIBRARY[imgKey], `transfer-${imgKey}.jpg`)

    const docId = `transfer-${slugify(combo)}`
    const doc = {
      _id: docId,
      _type: 'transferMeta',
      name: combo,
      vehicleCategory: cat,
      passengerCapacity: capPax,
      luggageCapacity: capLug,
      shortDescription: shortDesc,
      longDescription: longDesc,
      features,
      photo: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id }
      }
    }

    await client.createOrReplace(doc)
    console.log(`  ✅ [Transfer] ${combo} -> ${docId}`)
  }

  // ─────────────────────────────────────────────────────────────
  // 2. GUIDES SEEDING
  // ─────────────────────────────────────────────────────────────
  console.log('\n==============================')
  console.log('👤 2. SEEDING GUIDES')
  console.log('==============================')
  const gSheet = wb.Sheets['Guide']
  if (!gSheet) throw new Error('Sheet "Guide" not found in workbook')
  const gRows = XLSX.utils.sheet_to_json(gSheet)
  const seenGuides = new Set()

  for (const row of gRows) {
    const d = (row['Transfer Description'] || '').trim()
    if (!d || seenGuides.has(d)) continue
    seenGuides.add(d)

    let duration = 'Up to 4 Hours'
    let languages = ['English', 'Hindi']
    let certs = ['STB Licensed Tour Guide', 'First-Aid Certified']
    let imgKey = 'generalGuide'
    let shortDesc = `STB-certified professional tour guide delivering commentary and logistical coordination.`
    let longDesc = `Experience Singapore with an accredited, knowledgeable tour guide who shares rich history, local secrets, and manages your group logistics with seamless professionalism.`

    const lower = d.toLowerCase()
    if (lower.includes('arrival')) {
      duration = '2 - 3 Hours'
      imgKey = 'airportGuide'
      shortDesc = `Dedicated STB-licensed airport liaison guide for warm Changi Airport meet & greet.`
      longDesc = `Welcomes your guests at the Changi arrival hall with personalized signage. Assists with baggage recovery, mobile SIM cards, currency exchange, and coordinates smooth boarding onto waiting private transfers.`
      certs = ['STB Licensed Tour Guide', 'Airport Protocol Certified']
    } else if (lower.includes('departure')) {
      duration = '2 - 3 Hours'
      imgKey = 'airportGuide'
      shortDesc = `Airport departure facilitation guide assisting with tax refund (GST), check-in, and bag drop.`
      longDesc = `Ensures seamless flight check-in at Changi Airport. Guides your guests through electronic TRS GST tourist tax refund kiosks, group airline check-in counters, and gate immigration entrance.`
      certs = ['STB Licensed Tour Guide', 'Changi Airport Protocol Specialist']
    } else if (lower.includes('gardens')) {
      duration = '3 - 4 Hours'
      imgKey = 'gardensGuide'
      shortDesc = `Specialist botanical & architectural tour guide for Flower Dome, Cloud Forest, and Supertrees.`
      longDesc = `Brings the world-famous bio-domes to life with rich botanical storytelling, rare floral insights, the 35m indoor mountain waterfall, and engineering marvels of the vertical Supertree gardens.`
      certs = ['STB Licensed Tour Guide', 'Nature & Botanical Specialist']
    } else if (lower.includes('city tour')) {
      duration = '3 - 4 Hours'
      imgKey = 'cityGuide'
      shortDesc = `Accredited heritage guide narrating Singapore's transformation from fishing village to modern metropolis.`
      longDesc = `Engaging storytelling covering the historic Civic District, Padang, Merlion Park photo shoot, vibrant spice streets of Little India, and Chinatown heritage enclaves.`
      certs = ['STB Licensed Tour Guide', 'National Heritage Board Accredited']
    } else if (lower.includes('night safari')) {
      duration = '4 Hours'
      imgKey = 'wildlifeGuide'
      shortDesc = `Expert wildlife escort assisting with priority tram boarding and Creatures of the Night show seating.`
      longDesc = `Navigate the world's premier nocturnal wildlife park with ease. Your guide optimizes tram boarding slots, secures prime seats for animal presentations, and leads sensory walking trails.`
      certs = ['STB Licensed Tour Guide', 'Mandai Wildlife Reserve Specialist']
    } else if (lower.includes('sentosa half day 1 show')) {
      duration = '4 Hours'
      imgKey = 'sentosaGuide'
      shortDesc = `Half-day Sentosa Island tour guide coordinating attractions and 1 signature evening show.`
      longDesc = `Full coordination across Sentosa's beaches and attractions with reserved prime seating for the spectacular Wings of Time multi-sensory night show.`
      certs = ['STB Licensed Tour Guide', 'Sentosa Island Specialist']
    } else if (lower.includes('sentosa half day 2 show')) {
      duration = '5 Hours'
      imgKey = 'sentosaGuide'
      shortDesc = `Extended Sentosa tour guide coordinating attractions and 2 premium entertainment presentations.`
      longDesc = `Covers Sentosa attractions plus seamless coordination for two major live shows (Wings of Time and interactive resort entertainment), eliminating queue delays.`
      certs = ['STB Licensed Tour Guide', 'Event & Show Coordinator']
    } else if (lower.includes('sentosa full day')) {
      duration = '8 Hours'
      imgKey = 'sentosaGuide'
      shortDesc = `Comprehensive full-day Sentosa Island manager guiding beaches, cable cars, and attractions.`
      longDesc = `Complete VIP day management on Sentosa: Mount Faber Cable Car transit, Madame Tussauds, Skyline Luge, beach lounges, and evening show coordination with full group tracking.`
      certs = ['STB Licensed Tour Guide', 'VIP Group Tour Manager']
    } else if (lower.includes('uss')) {
      duration = '6 - 8 Hours'
      imgKey = 'themeParkGuide'
      shortDesc = `Universal Studios Singapore expert park guide optimizing ride queues and character meet & greets.`
      longDesc = `Maximize your theme park adventure! Your guide maps out optimal ride sequencing across all 7 themed zones, schedules parade viewings, and manages dining vouchers.`
      certs = ['Theme Park Concierge Specialist', 'STB Licensed Guide']
    } else if (lower.includes('mandai')) {
      duration = 'Full Day (8-10 Hours)'
      imgKey = 'wildlifeGuide'
      shortDesc = `Full-day dedicated Mandai wildlife circuit guide for Zoo, River Wonders, Night Safari, and Bird Paradise.`
      longDesc = `The ultimate wildlife adventure guide. Handles multi-park entry tickets, tram transfers, feeding show timings, behind-the-scenes insights, and wildlife sanctuary education.`
      certs = ['STB Senior Naturalist Guide', 'First-Aid Certified', 'Wildlife Sanctuary Specialist']
    } else if (lower.includes('guide included')) {
      duration = 'Full Day Guided Package'
      imgKey = 'generalGuide'
      shortDesc = `Full-time dedicated STB-licensed private tour director accompanying your package itinerary.`
      longDesc = `Professional English/Hindi speaking tour escort accompanying your party throughout the day, providing continuous commentary, restaurant translations, and concierge assistance.`
      certs = ['STB Licensed Tour Guide', 'Executive Concierge']
    }

    const asset = await getOrUploadAsset(IMAGE_LIBRARY[imgKey], `guide-${imgKey}.jpg`)

    const docId = `guide-${slugify(d)}`
    const doc = {
      _id: docId,
      _type: 'guideMeta',
      name: d,
      duration,
      languages,
      certifications: certs,
      shortDescription: shortDesc,
      longDescription: longDesc,
      photo: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id }
      }
    }

    await client.createOrReplace(doc)
    console.log(`  ✅ [Guide] ${d} -> ${docId}`)
  }

  // ─────────────────────────────────────────────────────────────
  // 3. HOTELS SEEDING
  // ─────────────────────────────────────────────────────────────
  console.log('\n==============================')
  console.log('🏨 3. SEEDING HOTELS')
  console.log('==============================')
  const hSheet = wb.Sheets['Hotel']
  if (!hSheet) throw new Error('Sheet "Hotel" not found in workbook')
  const hRows = XLSX.utils.sheet_to_json(hSheet)
  const seenHotels = new Set()

  for (const row of hRows) {
    const h = (row['Hotel Name'] || '').trim()
    if (!h || seenHotels.has(h)) continue
    seenHotels.add(h)

    let star = '4★'
    let loc = 'Singapore City Center'
    let imgKey = 'cityHotel'
    let amenities = ['Free High-Speed Wi-Fi', 'Air Conditioned', 'Daily Housekeeping', '24-Hour Reception']
    let checkIn = '15:00 hrs'
    let checkOut = '11:00 hrs'
    let shortDesc = `Comfortable hotel in central Singapore offering contemporary rooms and easy access to MRT transit.`
    let longDesc = `Featuring modern air-conditioned guestrooms with plush bedding, private en-suite bathrooms, and high-speed Wi-Fi. Ideally located near popular shopping and dining enclaves.`

    const lower = h.toLowerCase()
    if (lower.includes('boss hotel')) {
      star = '4★'
      loc = '500 Jalan Sultan, Lavender / Kampong Glam, Singapore'
      imgKey = 'poolHotel'
      amenities = ['Sky Terrace Swimming Pool', 'Fitness Gym', 'Onsite Food Street', 'Near Lavender MRT (EW11)', 'Free High-Speed Wi-Fi']
      shortDesc = `Iconic modern landmark hotel near Lavender MRT, boasting a sky terrace pool, gym, and lively food street.`
      longDesc = `Conveniently nestled between Kampong Glam and Little India. Features 1,500 stylish guestrooms, outdoor pool overlooking the city, 24-hour food hall, money changers, and convenience stores on-site.`
    } else if (lower.includes('v hotel')) {
      star = '4★'
      loc = '70 Jellicoe Road, Lavender, Singapore'
      imgKey = 'cityHotel'
      amenities = ['Direct Access to Lavender MRT', 'Outdoor Swimming Pool', 'Sky Fitness Room', 'Cafes & Retail Promenade', 'Free High-Speed Wi-Fi']
      shortDesc = `Unbeatable connectivity directly situated above Lavender MRT Station with outdoor pool and fitness facilities.`
      longDesc = `Step right out of the train into your hotel lobby. Enjoy comfortable modern rooms with 32-inch LED TVs, garden terrace pool, all-day dining options, and fast direct train to Changi Airport.`
    } else if (lower.includes('mi rochor')) {
      star = '4★'
      loc = '895 Rochor Road, Singapore'
      imgKey = 'boutiqueHotel'
      amenities = ['Outdoor Swimming Pool', '2 Mins Walk to Rochor MRT', 'Bugis & Sim Lim Proximity', 'Smart Work Desks', 'Free Wi-Fi']
      shortDesc = `Chic lifestyle hotel with outdoor pool, nestled between Bugis, Little India, and Sim Lim Square.`
      longDesc = `Vibrant design-led property with eco-friendly smart rooms, outdoor swimming pool, and sun loungers. 2 minutes walk to Rochor MRT station with immediate connectivity to Downtown and Marina Bay.`
      checkOut = '12:00 hrs'
    } else if (lower.includes('tyrwhitt') || lower.includes('mercury')) {
      star = '4★'
      loc = '270 Tyrwhitt Road, Jalan Besar / Lavender, Singapore'
      imgKey = 'poolHotel'
      amenities = ['Rooftop Swimming Pool', 'Fitness Center', 'Accor Quality Hospitality', 'Near Farrer Park & Lavender', 'Free Wi-Fi']
      shortDesc = `Contemporary Accor-managed 4-star hotel offering rooftop pool, gym, and tranquil heritage surroundings.`
      longDesc = `Spacious, well-appointed guestrooms in the historic Jalan Besar precinct. Features landscaped rooftop pool, kids wading pool, fitness center, and easy access to both Lavender and Farrer Park MRT stations.`
      checkOut = '12:00 hrs'
    } else if (lower.includes('hilton garden inn')) {
      star = '4★'
      loc = '3 Belilios Road, Little India, Singapore'
      imgKey = 'luxuryHotel'
      amenities = ['Outdoor Pool with Skyline Views', 'Hilton Honors Standards', '24-Hour Fitness Center', 'The Garden Grille Restaurant', 'Steps from Mustafa Centre']
      shortDesc = `Upscale international Hilton hospitality with outdoor pool overlooking heritage shop-houses, next to Sri Veeramakaliamman Temple.`
      longDesc = `World-class Hilton standards in the colorful cultural hub of Singapore. Features signature Suite Dreams® by Serta beds, 24-hour fitness center, outdoor pool, and The Garden Grille restaurant.`
      checkOut = '12:00 hrs'
    } else if (lower.includes('ibis styles albert court')) {
      star = '3★'
      loc = 'Albert Court Heritage Village, Rochor, Singapore'
      imgKey = 'heritageHotel'
      amenities = ['Historic Shophouse Architecture', 'Outdoor Jacuzzis', 'Fitness Gym', 'Courtyard Dining', 'Free Wi-Fi']
      shortDesc = `Charming heritage shop-house hotel in Albert Court, blending Peranakan architecture with modern comforts.`
      longDesc = `Located within a picturesque preserved courtyard of restored 19th-century shop-houses. Features outdoor jacuzzis, fitness gym, authentic Indian dining courtyard, and 2 minutes walk to Rochor MRT.`
      checkOut = '12:00 hrs'
    } else if (lower.includes('ibis styles albert street')) {
      star = '3★'
      loc = '180 Albert Street, Rochor / Bugis, Singapore'
      imgKey = 'boutiqueHotel'
      amenities = ['Vibrant Designer Rooms', 'Fitness Center', 'Near Rochor MRT (DT13)', 'High-Speed Wi-Fi', 'Walking Distance to Bugis']
      shortDesc = `Vibrant, design-led hotel in the Bugis/Rochor arts precinct with colorful rooms and modern amenities.`
      longDesc = `Energetic and whimsical modern accommodation moments from Bugis Street, Sim Lim Square, and Rochor MRT. Ideal for trend-conscious travelers and young families.`
      checkOut = '12:00 hrs'
    } else if (lower.includes('chancellor')) {
      star = '3★'
      loc = '28 Cavenagh Road, Orchard Road, Singapore'
      imgKey = 'poolHotel'
      amenities = ['Rooftop Swimming Pool', 'Orchard Road Shopping Belt', '5 Mins Walk to Somerset MRT', 'In-Room Water Dispenser', 'Free Wi-Fi']
      shortDesc = `Prime Orchard Road location with rooftop swimming pool, just minutes from Somerset MRT station.`
      longDesc = `Situated in a tranquil enclave off Singapore's premier shopping boulevard. Features rooftop pool with panoramic skyline views, in-room filtered water dispensers, and direct access to Orchard dining and retail malls.`
    } else if (lower.includes('holiday inn')) {
      star = '5★'
      loc = '10 Farrer Park Station Road, Singapore'
      imgKey = 'luxuryHotel'
      amenities = ['Direct MRT Connection (Farrer Park)', '25m Outdoor Lap Pool', '24-Hour Fitness Gym', 'Extensive Indian Breakfast Buffet', 'Luxury Bedding']
      shortDesc = `Luxurious 5-star property directly connected to Farrer Park MRT, featuring a 25m lap pool and lavish buffets.`
      longDesc = `Premium luxury retreat towering above Farrer Park MRT station. Floor-to-ceiling city view windows, 25-meter outdoor swimming pool, 24-hour fitness center, and renowned buffet breakfasts with extensive Indian cuisine options.`
      checkOut = '12:00 hrs'
    } else if (lower.includes('aqueen')) {
      star = '3★'
      loc = '383 Jalan Besar, Lavender, Singapore'
      imgKey = 'boutiqueHotel'
      amenities = ['Rooftop Swimming Pool', 'Rainfall Showers', 'High-Speed Wi-Fi', 'Compact Modern Rooms', 'Heritage Food Enclave']
      shortDesc = `Sleek, stylish boutique hotel with rooftop pool and modern compact rooms in Jalan Besar.`
      longDesc = `A trendy modern stay offering custom pocketed-spring mattresses, rainfall showers, rooftop swimming pool, and high-speed Wi-Fi, moments away from Singapore's top food and shopping spots.`
    } else if (lower.includes('4* hotel - little india')) {
      star = '4★'
      loc = 'Little India / Farrer Park, Singapore'
      imgKey = 'cityHotel'
      amenities = ['Outdoor Swimming Pool', 'Fitness Center', 'Free Wi-Fi', 'Daily Indian Breakfast Available', 'Steps from Mustafa Centre']
      shortDesc = `Premium 4-star hotel offering contemporary rooms, outdoor swimming pool, and prime connectivity to Mustafa Centre.`
      longDesc = `Experience elevated comfort with plush bedding, smart TV, fitness center, and swimming pool. Ideally located for both leisure shoppers and business travelers seeking central city access.`
      checkOut = '12:00 hrs'
    } else if (lower.includes('budget') || lower.includes('value')) {
      star = '3★'
      loc = 'Little India Enclave, Singapore'
      imgKey = 'budgetHotel'
      amenities = ['Free Wi-Fi', 'Daily Housekeeping', 'Air Conditioned', 'Luggage Storage', 'Walking Distance to MRT']
      shortDesc = `Clean, budget-friendly accommodation tailored for value-conscious leisure travelers and families.`
      longDesc = `Cozy, well-maintained rooms offering essential comfort: air conditioning, private hot showers, electronic keycards, and high-speed Wi-Fi, right beside MRT transit links.`
    } else if (lower.includes('3* hotel - little india')) {
      star = '3★'
      loc = 'Little India / Serangoon Road, Singapore'
      imgKey = 'cityHotel'
      amenities = ['Free High-Speed Wi-Fi', 'Near MRT Station', 'Walking Distance to Indian Dining', '24-Hour Reception', 'Air Conditioned']
      shortDesc = `Comfortable 3-star hotel located in the heart of Little India, walking distance to 24-hour shopping and authentic dining.`
      longDesc = `Modern air-conditioned guestrooms with en-suite bathrooms, free Wi-Fi, and tea/coffee facilities. Surrounded by vibrant spice markets, South Indian restaurants, and Farrer Park / Little India MRT stations.`
    }

    const asset = await getOrUploadAsset(IMAGE_LIBRARY[imgKey], `hotel-${imgKey}.jpg`)

    const docId = `hotel-${slugify(h)}`
    const doc = {
      _id: docId,
      _type: 'hotelMeta',
      name: h,
      starRating: star,
      addressLocation: loc,
      checkInTime: checkIn,
      checkOutTime: checkOut,
      amenities,
      shortDescription: shortDesc,
      longDescription: longDesc,
      photo: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id }
      }
    }

    await client.createOrReplace(doc)
    console.log(`  ✅ [Hotel] ${h} -> ${docId}`)
  }

  // ─────────────────────────────────────────────────────────────
  // 4. MEALS PLAN SEEDING
  // ─────────────────────────────────────────────────────────────
  console.log('\n==============================')
  console.log('🍽️ 4. SEEDING MEALS')
  console.log('==============================')
  const mSheet = wb.Sheets['Meals Plan']
  if (!mSheet) throw new Error('Sheet "Meals Plan" not found in workbook')
  const mRows = XLSX.utils.sheet_to_json(mSheet)
  const seenMeals = new Set()

  const mealItems = []
  ;['Breakfast', 'Lunch', 'Dinner'].forEach(m => {
    seenMeals.add(m)
    mealItems.push({ name: m, restaurant: '', mealType: m })
  })

  mRows.forEach(r => {
    const rest = (r['Restaurant Name'] || r['__EMPTY_2'] || '').trim()
    const type = (r['Meal Type'] || r['Type'] || r['__EMPTY_3'] || '').trim()
    let name = ''
    if (rest && type) name = `${rest} (${type})`
    else if (rest) name = rest
    else if (type) name = type
    if (name && !seenMeals.has(name)) {
      seenMeals.add(name)
      mealItems.push({ name, restaurant: rest, mealType: type })
    }
  })

  for (const item of mealItems) {
    let mType = 'Lunch'
    let cuisine = 'Authentic Indian Cuisine'
    let badges = ['Vegetarian Friendly', 'Air Conditioned Dining', 'Fresh Ingredients']
    let imgKey = 'indianThali'
    let shortDesc = `Delicious meal prepared with fresh ingredients and authentic spices.`
    let longDesc = `Enjoy a delightful dining experience with an extensive selection of flavorful curries, freshly baked breads, aromatic rice, and traditional desserts.`

    const lower = item.name.toLowerCase()
    if (item.name === 'Breakfast') {
      mType = 'Breakfast'
      cuisine = 'Continental & Indian Breakfast Buffet'
      badges = ['Vegetarian Friendly', 'Fresh Fruits & Juices', 'Hot Coffee & Tea']
      imgKey = 'breakfastBuffet'
      shortDesc = `Wholesome morning buffet spread featuring continental pastries, eggs, cereals, juices, and hot Indian selections.`
      longDesc = `Daily hotel buffet breakfast designed to energize your morning with freshly baked breads, cut fruits, idli/vada, hot tea, and fresh coffee.`
    } else if (item.name === 'Lunch') {
      mType = 'Lunch'
      cuisine = 'Multi-Cuisine / Indian Buffet'
      badges = ['Pure Veg Options', 'Halal Friendly', 'Air Conditioned Dining']
      imgKey = 'lunchBuffet'
      shortDesc = `Delightful midday buffet or set meal featuring flavorful curries, rice, breads, and crisp salad.`
      longDesc = `A satisfying afternoon culinary pause during your sightseeing itinerary. Includes balanced vegetarian and non-vegetarian selections prepared with quality ingredients.`
    } else if (item.name === 'Dinner') {
      mType = 'Dinner'
      cuisine = 'North & South Indian Dinner Buffet'
      badges = ['Rich Gravies & Naans', 'Jain Options Upon Request', 'Traditional Desserts']
      imgKey = 'dinnerBuffet'
      shortDesc = `Sumptuous evening buffet dinner with aromatic biryanis, gravies, tandoori items, and desserts.`
      longDesc = `Relax after a full day of attractions with a warm, satisfying dinner spread featuring savory gravies, fresh naan, steamed basmati rice, and sweet dessert.`
    } else if (lower.includes('tasty corner')) {
      mType = lower.includes('lunch') ? 'Lunch' : 'Dinner'
      cuisine = 'Homestyle North & South Indian'
      badges = ['Pure Ghee Preparations', 'Vegetarian & Non-Veg', 'Freshly Rolled Rotis']
      imgKey = 'indianThali'
      shortDesc = `Authentic Indian homestyle meal at Tasty Corner, known for fresh rotis, savory dal, and rich paneer curries.`
      longDesc = `Popular dining destination serving comforting North and South Indian home-style meals. Crisp salad, aromatic rice, freshly rolled rotis, and chef's daily vegetable and chicken specialties.`
    } else if (lower.includes('nandanas')) {
      mType = lower.includes('dinner') ? 'Dinner' : 'Lunch'
      cuisine = 'Authentic Chettinad & South Indian'
      badges = ['Crispy Dosas', 'Authentic Chettinad Spices', 'Filter Coffee Specialty']
      imgKey = 'dosaSambar'
      shortDesc = `Celebrated authentic South Indian & Chettinad spread with signature dosas, curries, and biryanis.`
      longDesc = `Traditional flavors bursting with authentic spices. Enjoy fluffy idlis, golden ghee roast dosas, Chettinad chicken gravies, and aromatic South Indian filter coffee.`
    } else if (lower.includes('arya bhavan')) {
      mType = 'Special'
      cuisine = '100% Pure Vegetarian & Jain Cuisine'
      badges = ['100% Pure Vegetarian', 'Strict Jain Meals Available', 'Zero Onion & Garlic Option', 'Pure Ghee Sweets']
      imgKey = 'indianThali'
      shortDesc = `100% Pure Vegetarian & Jain culinary sanctuary serving satvik meals, dosas, and vegetarian thalis.`
      longDesc = `Strict pure vegetarian dining prepared in pristine conditions without meat, fish, or eggs. Strict Jain preparations available (no root vegetables, onions, or garlic) prepared upon request.`
    } else if (lower.includes('jubilee') || lower.includes('jalsa')) {
      mType = 'Special'
      cuisine = 'North Indian Tandoori & Mughlai'
      badges = ['Sentosa Island Location', 'Air Conditioned Comfort', 'Theme Park Tour Friendly']
      imgKey = 'tandooriNaan'
      shortDesc = `Exclusive Indian dining on Sentosa Island, offering scenic resort atmosphere and rich North Indian flavors.`
      longDesc = `The perfect culinary recharge while enjoying Sentosa attractions. Air-conditioned comfort, prompt service, sizzling kebabs, creamy butter chicken, and tandoori breads.`
    } else if (lower.includes('pine & dine')) {
      mType = 'Breakfast'
      cuisine = 'Continental & Indian Fusion Dining'
      badges = ['Historic Shophouse Ambiance', 'Alfresco Courtyard Seating', 'Breakfast & Meals']
      imgKey = 'courtyardCafe'
      shortDesc = `Cozy alfresco & indoor dining in historic Albert Court, serving hearty breakfasts and Indian meal sets.`
      longDesc = `Charming heritage village setting in Albert Court. Freshly prepared breakfast platters, tea/coffee, and flavorful midday curries served with warm hospitality.`
    } else if (lower.includes('shish mahal')) {
      mType = 'Dinner'
      cuisine = 'Royal North Indian, Tandoori & Nepalese'
      badges = ['Tandoor Clay Oven Breads', 'Himalayan Specialties', 'Heritage Courtyard Dining']
      imgKey = 'tandooriNaan'
      shortDesc = `Award-winning North Indian and Nepalese dining in Albert Court, famous for tandoori kebabs and momos.`
      longDesc = `Regal Mughlai culinary traditions featuring tender chicken tikka, succulent lamb seekh kebabs, Himalayan spiced momos, and garlic naans baked in authentic tandoor clay ovens.`
    } else if (lower.includes('little india (breakfast)')) {
      mType = 'Breakfast'
      cuisine = 'Traditional South Indian Breakfast'
      badges = ['Piping Hot Chai', 'Fresh Idli & Vada', 'Authentic Coconut Chutneys']
      imgKey = 'dosaSambar'
      shortDesc = `Traditional morning South Indian breakfast in Little India with hot idlis, crispy medu vada, and chai.`
      longDesc = `Immerse in the sensory morning atmosphere of Little India. Freshly steamed rice idlis, crunchy lentil vadas, piping hot sambar, coconut chutneys, and authentic ginger tea.`
    } else if (lower.includes('little india (lunch)')) {
      mType = 'Lunch'
      cuisine = 'Traditional Indian Banana Leaf / Thali'
      badges = ['Cultural Dining Experience', 'Unlimited Gravies', 'Pure Vegetarian Available']
      imgKey = 'indianThali'
      shortDesc = `Traditional banana leaf or thali lunch in Little India with unlimited rice, gravies, and pappadams.`
      longDesc = `Experience iconic cultural dining with a classic Indian feast. Rich array of vegetable curries, rasam, payasam dessert, and flavorful side dishes.`
    } else if (lower.includes('little india (dinner)')) {
      mType = 'Dinner'
      cuisine = 'North & South Indian Dinner'
      badges = ['Late Night Dining', 'Vibrant Heritage Atmosphere', 'Family Friendly']
      imgKey = 'biryaniPlatter'
      shortDesc = `Lively evening dining in Little India featuring tandoori grills, aromatic biryani, and rich curries.`
      longDesc = `Atmospheric night dining in Singapore's most colorful heritage district. Savor tandoori grills, butter naans, and rich curries amidst the bustling evening buzz.`
    } else if (lower.includes('little india (early breakfast)')) {
      mType = 'Breakfast'
      cuisine = 'Early Morning Indian Breakfast'
      badges = ['Available from 06:30 AM', 'Red-Eye Flight Friendly', 'Hot Masala Chai Included']
      imgKey = 'dosaSambar'
      shortDesc = `Specially arranged early morning breakfast (from 06:30 AM) for dawn flight arrivals and early tours.`
      longDesc = `Essential logistics solution for travelers arriving on red-eye flights or departing for early morning excursions (e.g. Mandai wildlife / Malaysia day trips). Piping hot tea, fresh poori bhaji, and idli.`
    }

    const asset = await getOrUploadAsset(IMAGE_LIBRARY[imgKey], `meal-${imgKey}.jpg`)

    const docId = `meal-${slugify(item.name)}`
    const doc = {
      _id: docId,
      _type: 'mealMeta',
      name: item.name,
      mealType: mType,
      cuisine,
      dietaryBadges: badges,
      shortDescription: shortDesc,
      longDescription: longDesc,
      photo: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id }
      }
    }

    await client.createOrReplace(doc)
    console.log(`  ✅ [Meal] ${item.name} -> ${docId}`)
  }

  console.log('\n🎉 ALL 62 ENTRIES ACROSS TRANSFERS, GUIDES, HOTELS & MEALS SEEDED SUCCESSFULLY!')
}

main().catch(err => {
  console.error('\n❌ Seeding failed with error:', err)
  process.exit(1)
})
