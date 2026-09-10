import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Cache of local base64 assets to avoid repeated disk reads
const assetCache: Record<string, string> = {}

function getLocalBase64(relPath: string): string {
  if (assetCache[relPath]) return assetCache[relPath]
  try {
    const full = path.join(process.cwd(), 'public', relPath.replace(/^\//, ''))
    if (fs.existsSync(full)) {
      const ext = path.extname(full).toLowerCase().replace('.', '')
      const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg'
      const buf = fs.readFileSync(full)
      const dataUri = `data:${mime};base64,${buf.toString('base64')}`
      assetCache[relPath] = dataUri
      return dataUri
    }
  } catch (e) {
    console.error('Failed to read local image:', relPath, e)
  }
  return ''
}

// Singapore Attractions catalog photo map directly aligned with app/singapore-attractions/AttractionsForm.tsx
const SINGAPORE_ATTRACTIONS_PHOTO_MAP: Record<string, string> = {
  universal: 'https://www.pelago.com/img/products/SG-Singapore/universal-studios-singapore-express-pass/26453e06-f8b7-4eda-badc-9cdc06a6e229_universal-studios-singapore-express-pass-xlarge.jpg',
  gardens: 'https://www.pelago.com/img/products/SG-Singapore/gardens-by-the-bay/0609-0615_jwe_gbtb_zone-03_petting-zoo_friends-group-selfie-xlarge.jpg',
  'night safari': 'https://www.pelago.com/img/products/SG-Singapore/night-safari-wildlife-park/1114-0139_night-safari-wildlife-park-singapore-pelago6-xlarge.jpg',
  zoo: 'https://www.pelago.com/img/products/SG-Singapore/singapore-zoo-wildlife-park/0717-0924_singapore-zoo-wildlife-park-singapore-pelago0-xlarge.jpg',
  'bird paradise': 'https://www.pelago.com/img/products/SG-Singapore/bird-paradise-tickets/0716-0618_bird-paradise-tickets-singapore-pelago1-xlarge.jpg',
  'river wonders': 'https://www.pelago.com/img/products/SG-Singapore/2in1-park-hopper-singapore-zoo--river-wonders/4b855f65-62ee-4d9c-94e7-56c0b32437c0_combo-singapore-zoo-river-wonders-ticket-xlarge.jpg',
  luge: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80',
  tussauds: 'https://www.pelago.com/img/products/SG-Singapore/madame-tussauds-sentosa-tickets/1224-0812_mtsg-images-of-singapore---entrance-landscape-(1)-xlarge.jpg',
  aquarium: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80',
  mbs: 'https://www.pelago.com/img/products/SG-Singapore/marina-bay-sands-skypark-observation-deck-new/0430-0606_marina-bay-sands-skypark-observation-deck_1-xlarge.jpg',
  sands: 'https://www.pelago.com/img/products/SG-Singapore/marina-bay-sands-skypark-observation-deck-new/0430-0606_marina-bay-sands-skypark-observation-deck_1-xlarge.jpg',
  flyer: 'https://www.pelago.com/img/products/SG-Singapore/singapore-flyer--time-capsule/0522-0609_singapore-flyer-time-capsule-singapore-pelago0.jpg-xlarge.jpg',
  'cable car': 'https://www.pelago.com/img/products/SG-Singapore/singapore-cable-car/0616-0638_1125-0343_pokémon-day-to-night-adventure-presented-by-singapore-cable-car-1-large-xlarge.jpeg',
  skyhelix: 'https://www.pelago.com/img/products/SG-Singapore/skyhelix-sentosa---singapores-highest-open-air-panoramic-ride/2a56a2ef-f675-4011-9410-b8e64bbed146_skyhelix-sentosa-ticket-singapore-s-highest-open-air-panoramic-ride-xlarge.jpg',
  wings: 'https://www.pelago.com/img/products/SG-Singapore/wings-of-time--spectacular-light-water-show/0616-0636_0109-0846_1600-x-900_wotfs-(new-2025-dec)-xlarge.jpg',
  jewel: 'https://images.unsplash.com/photo-1600420673889-c6d4f64bdf5c?auto=format&fit=crop&w=600&q=80',
}

const LOCAL_FALLBACK_PHOTOS: Record<string, string> = {
  universal: '/images/attractions/universal-studios-singapore/cover.jpg',
  gardens: '/images/attractions/gardens-by-the-bay/cover.jpg',
  'night safari': '/images/attractions/night-safari-singapore/cover.jpg',
  'cable car': '/images/attractions/singapore-cable-car/cover.jpg',
  zoo: '/images/attractions/singapore-zoo/cover.jpg',
  'bird paradise': '/images/attractions/bird-paradise-singapore/cover.jpg',
  'river wonders': '/images/attractions/river-wonders-singapore/cover.jpg',
  aquarium: '/images/attractions/sea-aquarium-singapore/cover.jpg',
  luge: '/images/attractions/sentosa-skyline-luge/cover.jpg',
  flyer: '/images/attractions/singapore-flyer/cover.jpg'
}

function resolveAttractionPhoto(name: string, customUrl?: string): { url: string; label: string } {
  const lower = name.toLowerCase()
  if (customUrl) {
    return { url: customUrl, label: name.replace(/\(.*?\)/g, '').trim() }
  }

  for (const [key, photoUrl] of Object.entries(SINGAPORE_ATTRACTIONS_PHOTO_MAP)) {
    if (lower.includes(key)) {
      const localRel = LOCAL_FALLBACK_PHOTOS[key]
      const localBase64 = localRel ? getLocalBase64(localRel) : ''
      return {
        url: photoUrl || localBase64,
        label: key.toUpperCase()
      }
    }
  }

  return {
    url: getLocalBase64('/images/attractions/gardens-by-the-bay/cover.jpg'),
    label: name.replace(/\(.*?\)/g, '').slice(0, 20).trim().toUpperCase()
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const {
      guestName = '',
      headline = '',
      nightsCount = 3,
      travelDates = 'SPECIAL PROMOTIONAL TOUR',
      hotelRequired = false,
      hotelName = '',
      isPrivateTransfers = true,
      inclusions = [],
      pricing = {
        showPrice: true,
        figure: '315',
        currency: 'SGD',
        inrEquivalent: '≈ Rs. 23,565 INR / Pax',
        label: 'PER PERSON ONLY'
      },
      attractionPhotos = [],
      agency = {
        name: 'FLYING WONDERS DMC',
        tagline: 'SINGAPORE B2B DESTINATION SPECIALIST',
        logoUrl: '',
        phone: '+91 98861 71251',
        deskPhone: '+65 9689 0101',
        email: 'ops@flyingwonders.com',
        singaporeAddress: '160 Robinson Road, #14-04 SBF Center, Singapore 068914',
        indiaAddress: 'Bangalore & Delhi NCR B2B Operations Hub'
      },
      returnBase64 = true
    } = data

    // Determine final headline: Guest Name -- followed with Singapore Gateway or Singapore Tour
    let finalHeadline = headline
    if (!finalHeadline) {
      const cleanGuest = (guestName || '').trim().toUpperCase()
      if (cleanGuest) {
        finalHeadline = `${cleanGuest} — SINGAPORE GETAWAY`
      } else {
        finalHeadline = 'SINGAPORE GETAWAY'
      }
    }

    // Determine subtitle
    const daysNights = `${nightsCount + 1} Days / ${nightsCount} Nights`
    const hotelSuffix = hotelRequired 
      ? `(With ${hotelName ? hotelName.split(' ').slice(0, 2).join(' ') : 'Hotel Accommodations'})`
      : '(Land Package & Transfers)'
    const finalSubtitle = `${daysNights} ${hotelSuffix}`

    // Hero and Logo base64
    const heroBase64 = getLocalBase64('/images/hero/singapore-hero-1.jpg')
    let agencyLogoSrc = agency.logoUrl || ''
    if (!agencyLogoSrc) {
      agencyLogoSrc = getLocalBase64('/images/logo.png')
    }

    // Prepare up to 4 attraction cards
    let finalPhotos = Array.isArray(attractionPhotos) && attractionPhotos.length > 0 
      ? attractionPhotos.map((p: any) => resolveAttractionPhoto(p.name || '', p.photoUrl))
      : []

    // Fallbacks if fewer than 4 photos
    const defaults = [
      { name: 'Night Safari', key: 'night safari' },
      { name: 'Sentosa Island', key: 'cable car' },
      { name: 'Universal Studios', key: 'universal' },
      { name: 'Gardens by the Bay', key: 'gardens' }
    ]

    defaults.forEach(d => {
      if (finalPhotos.length < 4 && !finalPhotos.some(p => p.label.toLowerCase().includes(d.key))) {
        finalPhotos.push(resolveAttractionPhoto(d.name))
      }
    })
    finalPhotos = finalPhotos.slice(0, 4)

    // Prepare Inclusions (up to 6)
    const displayInclusions = (Array.isArray(inclusions) && inclusions.length > 0)
      ? inclusions.slice(0, 6)
      : [
          { title: 'Return Airport Transfers', tag: isPrivateTransfers ? 'Private Air-Conditioned Vehicle' : 'Sharing Seat-in-Coach', type: isPrivateTransfers ? 'private' : 'sharing', icon: '🚗' },
          { title: 'Night Safari + Tram Ride', tag: 'Admission & Tram Ride Included (Sharing)', type: 'sharing', icon: '🦁' },
          { title: 'Singapore Panoramic Drive', tag: 'Merlion Park, Civic District & Marina Bay (Sharing)', type: 'sharing', icon: '🏙️' },
          { title: 'Sentosa Cable Car + Wings of Time', tag: 'Mount Faber Line & Evening Spectacular (Sharing)', type: 'sharing', icon: '🚡' },
          { title: 'Universal Studios Singapore', tag: '1-Day Full Access Ticket (Sharing)', type: 'sharing', icon: '🎢' },
          { title: 'Gardens by the Bay', tag: 'Flower Dome + Cloud Forest Double Domes (Sharing)', type: 'sharing', icon: '🌸' }
        ]

    // Construct the HTML document
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@1,600;1,700&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    body {
      width: 1200px;
      height: 1800px;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #081224;
      color: #FFFFFF;
      position: relative;
    }

    /* Top Header Bar */
    .header-bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 92px;
      background: linear-gradient(180deg, rgba(6, 14, 28, 0.98) 0%, rgba(8, 18, 36, 0.85) 100%);
      backdrop-filter: blur(8px);
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 50px;
      border-bottom: 2px solid rgba(212, 175, 55, 0.35);
    }

    .agency-branding {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .agency-logo-container {
      background: #FFFFFF;
      padding: 6px 14px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 56px;
    }

    .agency-logo-container img {
      max-height: 44px;
      max-width: 150px;
      object-fit: contain;
    }

    .agency-text-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #FFFFFF;
      text-transform: uppercase;
    }

    .agency-tagline {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 2.5px;
      color: #E2B755;
      text-transform: uppercase;
    }

    .dmc-badge {
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%);
      border: 1.5px solid rgba(212, 175, 55, 0.6);
      padding: 8px 20px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #F6D884;
      text-transform: uppercase;
    }

    /* Hero Section */
    .hero-banner {
      position: absolute;
      top: 92px;
      left: 0;
      width: 100%;
      height: 485px;
      overflow: hidden;
      z-index: 10;
    }

    .hero-bg-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 25%;
      filter: brightness(0.85) contrast(1.1);
    }

    .hero-gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(180deg, 
        rgba(8, 18, 36, 0.15) 0%, 
        rgba(8, 18, 36, 0.45) 45%, 
        rgba(8, 18, 36, 0.95) 85%, 
        #081224 100%
      );
    }

    .hero-content {
      position: absolute;
      bottom: 25px;
      left: 50px;
      right: 50px;
      z-index: 15;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    /* Season Ribbon */
    .season-ribbon {
      background: linear-gradient(135deg, #F3D279 0%, #C9972E 50%, #E6C265 100%);
      color: #071731;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 6px 20px;
      border-radius: 4px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
      margin-bottom: 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    /* Bold Title */
    .hero-headline {
      font-family: 'Cinzel', serif;
      font-size: 42px;
      font-weight: 900;
      line-height: 1.15;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: linear-gradient(180deg, #FFFFFF 20%, #E2E8F0 50%, #D4AF37 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.7));
      margin-bottom: 6px;
    }

    .hero-subtitle {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 26px;
      font-weight: 700;
      color: #F8E29A;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.6);
    }

    /* Main Body (2 Columns) */
    .main-body {
      position: absolute;
      top: 575px;
      left: 50px;
      right: 50px;
      height: 875px;
      z-index: 15;
      display: flex;
      gap: 36px;
    }

    /* Left Column: Inclusions & Price */
    .left-col {
      flex: 1.15;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .inclusions-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .inclusion-item {
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(15, 29, 56, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-left: 4.5px solid #E2B755;
      padding: 12px 18px;
      border-radius: 12px;
      backdrop-filter: blur(4px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.25);
    }

    .inc-icon-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #091D3E 0%, #153265 100%);
      border: 1.5px solid rgba(226, 183, 85, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
    }

    .inc-details {
      display: flex;
      flex-direction: column;
    }

    .inc-title {
      font-size: 16px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      line-height: 1.25;
    }

    .inc-tag {
      font-size: 13px;
      font-weight: 600;
      margin-top: 2px;
    }

    .inc-tag.sharing {
      color: #93C5FD;
    }

    .inc-tag.private {
      color: #6EE7B7;
    }

    /* Luxury Price Badge */
    .price-card {
      margin-top: 15px;
      background: linear-gradient(135deg, #06152F 0%, #0D2654 100%);
      border: 2.5px solid #D4AF37;
      border-radius: 16px;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 25px rgba(212, 175, 55, 0.15);
      position: relative;
      overflow: hidden;
    }

    .price-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, transparent 60%);
      pointer-events: none;
    }

    .price-left {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #E2B755;
      text-transform: uppercase;
    }

    .price-currency {
      font-size: 24px;
      font-weight: 900;
      color: #F8E29A;
      margin-right: 6px;
    }

    .price-figure {
      font-family: 'Cinzel', serif;
      font-size: 56px;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1;
      letter-spacing: -1px;
      text-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
    }

    .price-right {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .price-unit {
      background: linear-gradient(135deg, #F3D279 0%, #C9972E 100%);
      color: #071731;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .price-note {
      font-size: 12px;
      color: #94A3B8;
      margin-top: 6px;
      font-weight: 600;
    }

    /* Right Column: Photo Collage */
    .right-col {
      flex: 1.05;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 16px;
    }

    .photo-card {
      position: relative;
      border-radius: 14px;
      overflow: hidden;
      border: 3.5px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
      background: #0B192C;
    }

    .photo-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .photo-label-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(6, 14, 28, 0.92) 100%);
      padding: 24px 12px 10px 12px;
    }

    .photo-label {
      font-size: 13px;
      font-weight: 800;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 6px rgba(0,0,0,0.8);
    }

    /* Features Badges Strip */
    .features-strip {
      position: absolute;
      top: 1465px;
      left: 0;
      width: 100%;
      height: 72px;
      background: #050C18;
      border-top: 1.5px solid rgba(212, 175, 55, 0.35);
      border-bottom: 1.5px solid rgba(212, 175, 55, 0.35);
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 0 40px;
      z-index: 20;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .feature-icon {
      font-size: 20px;
    }

    .feature-text {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #E2E8F0;
      text-transform: uppercase;
    }

    .feature-divider {
      width: 1px;
      height: 30px;
      background: rgba(212, 175, 55, 0.3);
    }

    /* Footer / Agent Details */
    .footer-bar {
      position: absolute;
      top: 1537px;
      left: 0;
      width: 100%;
      height: 263px;
      background: #FFFFFF;
      color: #1E293B;
      padding: 24px 50px;
      z-index: 20;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .contact-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid #E2E8F0;
    }

    .contact-pill {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .contact-icon-bg {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .contact-texts {
      display: flex;
      flex-direction: column;
    }

    .contact-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .contact-val {
      font-size: 16px;
      font-weight: 800;
      color: #0F172A;
    }

    .address-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 40px;
      padding-top: 4px;
    }

    .address-col {
      flex: 1;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .address-texts {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .address-title {
      font-size: 12px;
      font-weight: 800;
      color: #0F172A;
      text-transform: uppercase;
    }

    .address-body {
      font-size: 12px;
      color: #475569;
      line-height: 1.4;
    }

    .bottom-disclaimer {
      font-size: 10px;
      color: #94A3B8;
      text-align: center;
      border-top: 1px solid #F1F5F9;
      padding-top: 8px;
      font-weight: 500;
    }
  </style>
</head>
<body>

  <!-- Top Header Bar -->
  <div class="header-bar">
    <div class="agency-branding">
      ${agencyLogoSrc ? `
      <div class="agency-logo-container">
        <img src="${agencyLogoSrc}" alt="Agency Logo" />
      </div>
      ` : ''}
      <div>
        <div class="agency-text-title">${agency.name || 'FLYING WONDERS DMC'}</div>
        <div class="agency-tagline">${agency.tagline || 'SINGAPORE B2B DESTINATION SPECIALIST'}</div>
      </div>
    </div>
    <div class="dmc-badge">★ EXCLUSIVE DMC RATES ★</div>
  </div>

  <!-- Hero Section -->
  <div class="hero-banner">
    <img class="hero-bg-img" src="${heroBase64}" alt="Singapore Skyline" />
    <div class="hero-gradient-overlay"></div>
    <div class="hero-content">
      <div class="season-ribbon">✨ ${travelDates}</div>
      <h1 class="hero-headline">${finalHeadline}</h1>
      <div class="hero-subtitle">${finalSubtitle}</div>
    </div>
  </div>

  <!-- Main Body -->
  <div class="main-body">
    <!-- Left Column: Inclusions & Price -->
    <div class="left-col">
      <div class="inclusions-list">
        ${displayInclusions.map(inc => `
          <div class="inclusion-item">
            <div class="inc-icon-circle">${inc.icon || '✨'}</div>
            <div class="inc-details">
              <div class="inc-title">${inc.title}</div>
              <div class="inc-tag ${inc.type === 'private' ? 'private' : 'sharing'}">${inc.tag}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Price Box -->
      ${pricing.showPrice ? `
      <div class="price-card">
        <div class="price-left">
          <div class="price-label">Special Promotional Rate</div>
          <div style="display: flex; align-items: baseline; margin-top: 2px;">
            <span class="price-currency">${pricing.currency || 'SGD'}</span>
            <span class="price-figure">${pricing.figure}</span>
          </div>
        </div>
        <div class="price-right">
          <div class="price-unit">${pricing.label || 'PER PERSON ONLY'}</div>
          ${pricing.inrEquivalent ? `<div class="price-note">${pricing.inrEquivalent}</div>` : ''}
        </div>
      </div>
      ` : `
      <div class="price-card" style="justify-content: center; text-align: center; padding: 22px;">
        <div style="font-size: 16px; font-weight: 800; color: #E2B755; letter-spacing: 2px; text-transform: uppercase;">
          ★ EXCLUSIVE ALL-INCLUSIVE B2B PACKAGE ★
        </div>
      </div>
      `}
    </div>

    <!-- Right Column: Photo Collage -->
    <div class="right-col">
      ${finalPhotos.map(photo => `
        <div class="photo-card">
          <img src="${photo.url}" alt="${photo.label}" />
          <div class="photo-label-bar">
            <div class="photo-label">${photo.label}</div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Features Strip: With/Without Hotels, Private/Group Transfers, Best Price -->
  <div class="features-strip">
    <div class="feature-item">
      <span class="feature-icon">🏨</span>
      <span class="feature-text">${hotelRequired ? 'WITH HOTELS' : 'WITHOUT HOTELS'}</span>
    </div>
    <div class="feature-divider"></div>
    <div class="feature-item">
      <span class="feature-icon">🚐</span>
      <span class="feature-text">${isPrivateTransfers ? 'PRIVATE TRANSFERS' : 'GROUP TRANSFERS'}</span>
    </div>
    <div class="feature-divider"></div>
    <div class="feature-item">
      <span class="feature-icon">📅</span>
      <span class="feature-text">GUARANTEED DEPARTURES</span>
    </div>
    <div class="feature-divider"></div>
    <div class="feature-item">
      <span class="feature-icon">💰</span>
      <span class="feature-text">BEST PRICE GUARANTEED</span>
    </div>
  </div>

  <!-- Footer / Contact Card -->
  <div class="footer-bar">
    <div class="contact-row">
      <div class="contact-pill">
        <div class="contact-icon-bg">📞</div>
        <div class="contact-texts">
          <span class="contact-label">Mobile / WhatsApp</span>
          <span class="contact-val">${agency.phone || '+91 98861 71251'}</span>
        </div>
      </div>
      <div class="contact-pill">
        <div class="contact-icon-bg">☎️</div>
        <div class="contact-texts">
          <span class="contact-label">Singapore Direct Desk</span>
          <span class="contact-val">${agency.deskPhone || '+65 9689 0101'}</span>
        </div>
      </div>
      <div class="contact-pill">
        <div class="contact-icon-bg">✉️</div>
        <div class="contact-texts">
          <span class="contact-label">Email Support</span>
          <span class="contact-val">${agency.email || 'ops@flyingwonders.com'}</span>
        </div>
      </div>
    </div>

    <div class="address-row">
      <div class="address-col">
        <div class="contact-icon-bg" style="width:36px; height:36px; font-size:15px;">📍</div>
        <div class="address-texts">
          <span class="address-title">Singapore Headquarters</span>
          <span class="address-body">${agency.singaporeAddress || '160 Robinson Road, #14-04 SBF Center, Singapore 068914'}</span>
        </div>
      </div>
      <div class="address-col">
        <div class="contact-icon-bg" style="width:36px; height:36px; font-size:15px;">🇮🇳</div>
        <div class="address-texts">
          <span class="address-title">Partner B2B Desk</span>
          <span class="address-body">${agency.indiaAddress || 'Bangalore & Delhi NCR B2B Operations Hub'}</span>
        </div>
      </div>
    </div>

    <div class="bottom-disclaimer">
      Rates are dynamic and subject to seasonal ticket & vehicle availability upon confirmation. White-label B2B generated proposal.
    </div>
  </div>

</body>
</html>
`

    // Launch Puppeteer with available browser
    const puppeteer = await import('puppeteer')
    const executablePath = process.env.CHROME_PATH || (process.platform === 'win32' 
      ? (fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe') 
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
          : (fs.existsSync('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe') 
              ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' 
              : undefined))
      : undefined)

    const browser = await puppeteer.default.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    })
    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 1800, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: 'domcontentloaded' })
    await new Promise(r => setTimeout(r, 200))

    const buffer = await page.screenshot({
      type: 'jpeg',
      quality: 85,
      clip: { x: 0, y: 0, width: 1200, height: 1800 }
    })

    await browser.close()

    const base64Data = `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`

    if (returnBase64) {
      return NextResponse.json({
        success: true,
        base64: base64Data,
        sizeKb: Math.round(buffer.length / 1024),
        headline: finalHeadline
      })
    }

    const filename = `${(agency.name || 'Travel').replace(/[^a-zA-Z0-9]/g, '')}-Flyer-${(guestName || 'Singapore').replace(/[^a-zA-Z0-9]/g, '')}.jpg`

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    })

  } catch (err: any) {
    console.error('Error generating flyer:', err)
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Failed to render flyer image' 
    }, { status: 500 })
  }
}
