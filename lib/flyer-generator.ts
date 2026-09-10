// Client-Side Promotional Flyer Image Generator
// 100% runs in browser canvas — zero serverless Chrome dependencies!

export const SINGAPORE_ATTRACTIONS_PHOTO_MAP: Record<string, string> = {
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

export const LOCAL_FALLBACK_PHOTOS: Record<string, string> = {
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

export interface FlyerInclusion {
  title: string
  tag: string
  type: 'private' | 'sharing'
  icon: string
}

export interface FlyerPayload {
  guestName?: string
  headline?: string
  nightsCount?: number
  travelDates?: string
  hotelRequired?: boolean
  hotelName?: string
  isPrivateTransfers?: boolean
  inclusions?: FlyerInclusion[]
  pricing?: {
    showPrice: boolean
    figure: string
    currency: string
    inrEquivalent?: string
    label?: string
  }
  attractionPhotos?: { name: string; photoUrl?: string }[]
  agency?: {
    name?: string
    tagline?: string
    logoUrl?: string
    phone?: string
    deskPhone?: string
    email?: string
    singaporeAddress?: string
    indiaAddress?: string
  }
}

// Proxies remote images to avoid canvas CORS taint
async function resolveProxyImage(url: string): Promise<string> {
  if (!url) return ''
  if (url.startsWith('data:')) return url
  if (url.startsWith('/')) return url
  try {
    const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`)
    if (res.ok) {
      const data = await res.json()
      if (data.success && data.base64) return data.base64
    }
  } catch (e) {
    console.warn('Failed to proxy image:', url, e)
  }
  return url
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      console.warn('Image load error for:', src)
      resolve(null)
    }
    img.src = src
  })
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight
  const targetRatio = w / h
  let sw = img.naturalWidth
  let sh = img.naturalHeight
  let sx = 0
  let sy = 0

  if (imgRatio > targetRatio) {
    sw = img.naturalHeight * targetRatio
    sx = (img.naturalWidth - sw) / 2
  } else {
    sh = img.naturalWidth / targetRatio
    sy = (img.naturalHeight - sh) / 2
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill = false,
  stroke = false
) {
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }
  if (fill) ctx.fill()
  if (stroke) ctx.stroke()
}

export async function generateFlyerCanvas(data: FlyerPayload): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 1800
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create canvas 2D context')

  // Background
  ctx.fillStyle = '#081224'
  ctx.fillRect(0, 0, 1200, 1800)

  // 1. Resolve Images
  const heroSrc = '/images/hero/singapore-hero-1.jpg'
  const logoSrc = data.agency?.logoUrl || '/images/logo.png'

  // Match 4 attractions
  const distinctKeywords = [
    { key: 'night safari', label: 'NIGHT SAFARI' },
    { key: 'cable car', label: 'SENTOSA ISLAND' },
    { key: 'universal', label: 'UNIVERSAL STUDIOS' },
    { key: 'gardens', label: 'GARDENS BY THE BAY' }
  ]

  // Override with user attractions if available
  const userAttrNames = (data.attractionPhotos || []).map(p => p.name.toLowerCase())
  const selectedCards: { label: string; url: string }[] = []

  // Try matching user selections first
  for (const item of (data.attractionPhotos || [])) {
    if (selectedCards.length >= 4) break
    const lower = item.name.toLowerCase()
    let matchedUrl = item.photoUrl || ''
    let label = item.name.replace(/\(.*?\)/g, '').replace(/-\s*Fixed\s*Date.*/i, '').trim().toUpperCase()

    if (!matchedUrl) {
      for (const [k, url] of Object.entries(SINGAPORE_ATTRACTIONS_PHOTO_MAP)) {
        if (lower.includes(k)) {
          matchedUrl = url
          label = k.toUpperCase()
          break
        }
      }
    }

    if (matchedUrl && !selectedCards.some(c => c.label === label)) {
      selectedCards.push({ label, url: matchedUrl })
    }
  }

  // Fill remaining slots from defaults
  for (const def of distinctKeywords) {
    if (selectedCards.length >= 4) break
    if (!selectedCards.some(c => c.label.includes(def.label) || def.label.includes(c.label))) {
      selectedCards.push({
        label: def.label,
        url: SINGAPORE_ATTRACTIONS_PHOTO_MAP[def.key] || LOCAL_FALLBACK_PHOTOS[def.key]
      })
    }
  }

  // Preload and proxy all images concurrently
  const [heroImg, logoImg, ...photoImgs] = await Promise.all([
    loadImage(heroSrc),
    resolveProxyImage(logoSrc).then(url => loadImage(url)),
    ...selectedCards.map(async (c, i) => {
      const proxyUrl = await resolveProxyImage(c.url)
      const loaded = await loadImage(proxyUrl)
      if (loaded) return loaded
      // Try local fallback
      const key = distinctKeywords[i]?.key || 'gardens'
      const fallbackUrl = LOCAL_FALLBACK_PHOTOS[key]
      return loadImage(fallbackUrl)
    })
  ])

  // ── 2. Top Header Bar (0 to 92) ──
  const headGrad = ctx.createLinearGradient(0, 0, 0, 92)
  headGrad.addColorStop(0, 'rgba(6, 14, 28, 0.98)')
  headGrad.addColorStop(1, 'rgba(8, 18, 36, 0.85)')
  ctx.fillStyle = headGrad
  ctx.fillRect(0, 0, 1200, 92)

  // Gold divider
  ctx.fillStyle = 'rgba(212, 175, 55, 0.35)'
  ctx.fillRect(0, 90, 1200, 2)

  // Agency Logo Card
  let textStartX = 50
  if (logoImg && logoImg.naturalWidth > 0) {
    const lBoxW = 150
    const lBoxH = 56
    const lBoxX = 50
    const lBoxY = 18
    ctx.fillStyle = '#FFFFFF'
    drawRoundedRect(ctx, lBoxX, lBoxY, lBoxW, lBoxH, 8, true, false)

    // Draw logo inside container
    const maxW = lBoxW - 16
    const maxH = lBoxH - 10
    const ratio = logoImg.naturalWidth / logoImg.naturalHeight
    let fitW = maxW
    let fitH = fitW / ratio
    if (fitH > maxH) {
      fitH = maxH
      fitW = fitH * ratio
    }
    const lx = lBoxX + (lBoxW - fitW) / 2
    const ly = lBoxY + (lBoxH - fitH) / 2
    ctx.drawImage(logoImg, lx, ly, fitW, fitH)

    textStartX = lBoxX + lBoxW + 16
  }

  // Agency Title & Tagline
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '900 22px Inter, sans-serif'
  const agencyName = (data.agency?.name || 'FLYING WONDERS DMC').toUpperCase()
  ctx.fillText(agencyName, textStartX, 44)

  ctx.fillStyle = '#E2B755'
  ctx.font = '600 11px Inter, sans-serif'
  const agencyTagline = (data.agency?.tagline || 'SINGAPORE B2B DESTINATION SPECIALIST').toUpperCase()
  ctx.fillText(agencyTagline, textStartX, 64)

  // DMC Badge on Right
  const badgeW = 270
  const badgeH = 40
  const badgeX = 1200 - 50 - badgeW
  const badgeY = 26
  ctx.fillStyle = 'rgba(212, 175, 55, 0.12)'
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)'
  ctx.lineWidth = 1.5
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 20, true, true)

  ctx.fillStyle = '#F6D884'
  ctx.font = '800 12px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('★ EXCLUSIVE DMC RATES ★', badgeX + badgeW / 2, badgeY + 25)
  ctx.textAlign = 'left'

  // ── 3. Hero Section (92 to 575) ──
  const heroY = 92
  const heroH = 485
  if (heroImg && heroImg.naturalWidth > 0) {
    drawCoverImage(ctx, heroImg, 0, heroY, 1200, heroH)
  }

  // Hero Gradient Overlay
  const heroGrad = ctx.createLinearGradient(0, heroY, 0, heroY + heroH)
  heroGrad.addColorStop(0, 'rgba(8, 18, 36, 0.15)')
  heroGrad.addColorStop(0.45, 'rgba(8, 18, 36, 0.45)')
  heroGrad.addColorStop(0.85, 'rgba(8, 18, 36, 0.95)')
  heroGrad.addColorStop(1, '#081224')
  ctx.fillStyle = heroGrad
  ctx.fillRect(0, heroY, 1200, heroH)

  // Hero Content: Season Ribbon
  const ribbonX = 50
  const ribbonY = 430
  const ribbonH = 32
  const ribbonText = `✨ ${(data.travelDates || 'SPECIAL PROMOTIONAL TOUR').toUpperCase()}`
  ctx.font = '900 13px Inter, sans-serif'
  const ribbonTextW = ctx.measureText(ribbonText).width
  const ribbonW = ribbonTextW + 36

  const ribbonGrad = ctx.createLinearGradient(ribbonX, ribbonY, ribbonX + ribbonW, ribbonY + ribbonH)
  ribbonGrad.addColorStop(0, '#F3D279')
  ribbonGrad.addColorStop(0.5, '#C9972E')
  ribbonGrad.addColorStop(1, '#E6C265')
  ctx.fillStyle = ribbonGrad
  drawRoundedRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH, 4, true, false)

  ctx.fillStyle = '#071731'
  ctx.fillText(ribbonText, ribbonX + 18, ribbonY + 21)

  // Hero Headline: Guest Name -- followed with Singapore Gateway or Singapore Tour
  let headlineText = (data.headline || '').trim().toUpperCase()
  if (!headlineText) {
    const cleanGuest = (data.guestName || '').trim().toUpperCase()
    headlineText = cleanGuest ? `${cleanGuest} — SINGAPORE GETAWAY` : 'SINGAPORE GETAWAY'
  }

  ctx.font = '900 42px Cinzel, "Playfair Display", Georgia, serif'
  const headTextGrad = ctx.createLinearGradient(50, 480, 50, 520)
  headTextGrad.addColorStop(0, '#FFFFFF')
  headTextGrad.addColorStop(0.5, '#E2E8F0')
  headTextGrad.addColorStop(1, '#D4AF37')
  ctx.fillStyle = headTextGrad

  // Measure and truncate if too long
  let displayHead = headlineText
  if (ctx.measureText(displayHead).width > 1100) {
    ctx.font = '900 36px Cinzel, "Playfair Display", Georgia, serif'
  }
  ctx.fillText(displayHead, 50, 515)

  // Subtitle
  const nights = data.nightsCount || 3
  const hotelSuffix = data.hotelRequired 
    ? `(With ${data.hotelName ? data.hotelName.split(' ').slice(0, 2).join(' ') : 'Hotel Accommodation'})` 
    : '(Land Package & Transfers)'
  const subtitleText = `${nights + 1} Days / ${nights} Nights ${hotelSuffix}`
  ctx.font = 'italic 700 25px "Playfair Display", Georgia, serif'
  ctx.fillStyle = '#F8E29A'
  ctx.fillText(subtitleText, 50, 552)

  // ── 4. Main Body: Left Column (Inclusions & Price) ──
  const incY = 590
  const inclusions = (data.inclusions && data.inclusions.length > 0)
    ? data.inclusions.slice(0, 6)
    : [
        { title: 'Return Airport Transfers', tag: data.isPrivateTransfers ? 'Private Air-Conditioned Vehicle' : 'Sharing Seat-in-Coach (SIC)', type: (data.isPrivateTransfers ? 'private' : 'sharing') as 'private' | 'sharing', icon: '🚗' },
        { title: 'Night Safari + Tram Ride', tag: 'Admission & Tram Ride Included (Sharing)', type: 'sharing' as const, icon: '🦁' },
        { title: 'Singapore Panoramic Drive', tag: 'Merlion Park, Civic District & Marina Bay (Sharing)', type: 'sharing' as const, icon: '🏙️' },
        { title: 'Sentosa Cable Car + Wings of Time', tag: 'Mount Faber Line & Evening Spectacular (Sharing)', type: 'sharing' as const, icon: '🚡' },
        { title: 'Universal Studios Singapore', tag: '1-Day Full Access Ticket (Sharing)', type: 'sharing' as const, icon: '🎢' },
        { title: 'Gardens by the Bay', tag: 'Flower Dome + Cloud Forest Double Domes (Sharing)', type: 'sharing' as const, icon: '🌸' }
      ]

  inclusions.forEach((inc, i) => {
    const cardY = incY + i * 92
    const cardW = 530
    const cardH = 76
    const cardX = 50

    // Card background
    ctx.fillStyle = 'rgba(15, 29, 56, 0.75)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 12, true, true)

    // Left gold bar
    ctx.fillStyle = '#E2B755'
    drawRoundedRect(ctx, cardX, cardY, 5, cardH, 2, true, false)

    // Circular Icon Badge
    const cx = cardX + 38
    const cy = cardY + 38
    const r = 22
    const iconGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
    iconGrad.addColorStop(0, '#091D3E')
    iconGrad.addColorStop(1, '#153265')
    ctx.fillStyle = iconGrad
    ctx.strokeStyle = 'rgba(226, 183, 85, 0.7)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Icon Emoji
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(inc.icon || '✨', cx, cy + 7)
    ctx.textAlign = 'left'

    // Title
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '800 16px Inter, sans-serif'
    ctx.fillText(inc.title.toUpperCase(), cardX + 72, cardY + 33)

    // Tag
    ctx.fillStyle = inc.type === 'private' ? '#6EE7B7' : '#93C5FD'
    ctx.font = '600 13px Inter, sans-serif'
    ctx.fillText(inc.tag, cardX + 72, cardY + 55)
  })

  // Price Card
  const priceCardX = 50
  const priceCardY = 1205
  const priceCardW = 530
  const priceCardH = 175

  const priceGrad = ctx.createLinearGradient(priceCardX, priceCardY, priceCardX + priceCardW, priceCardY + priceCardH)
  priceGrad.addColorStop(0, '#06152F')
  priceGrad.addColorStop(1, '#0D2654')
  ctx.fillStyle = priceGrad
  ctx.strokeStyle = '#D4AF37'
  ctx.lineWidth = 2.5
  drawRoundedRect(ctx, priceCardX, priceCardY, priceCardW, priceCardH, 16, true, true)

  const showPrice = data.pricing?.showPrice ?? true
  if (showPrice) {
    ctx.fillStyle = '#E2B755'
    ctx.font = '800 12px Inter, sans-serif'
    ctx.fillText('SPECIAL PROMOTIONAL RATE', priceCardX + 26, priceCardY + 35)

    ctx.fillStyle = '#F8E29A'
    ctx.font = '900 24px Inter, sans-serif'
    ctx.fillText(data.pricing?.currency || 'SGD', priceCardX + 26, priceCardY + 95)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '900 56px Cinzel, "Playfair Display", Inter, serif'
    const fig = data.pricing?.figure || '315'
    ctx.fillText(fig, priceCardX + 90, priceCardY + 100)

    // Right Unit Tag
    const unitX = priceCardX + priceCardW - 195
    const unitY = priceCardY + 52
    const unitGrad = ctx.createLinearGradient(unitX, unitY, unitX + 170, unitY + 36)
    unitGrad.addColorStop(0, '#F3D279')
    unitGrad.addColorStop(1, '#C9972E')
    ctx.fillStyle = unitGrad
    drawRoundedRect(ctx, unitX, unitY, 170, 36, 6, true, false)

    ctx.fillStyle = '#071731'
    ctx.font = '900 13px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(data.pricing?.label || 'PER PERSON ONLY', unitX + 85, unitY + 23)
    ctx.textAlign = 'left'

    // Subtitle conversion note
    if (data.pricing?.inrEquivalent) {
      ctx.fillStyle = '#94A3B8'
      ctx.font = '600 12px Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(data.pricing.inrEquivalent, priceCardX + priceCardW - 25, priceCardY + 115)
      ctx.textAlign = 'left'
    }
  } else {
    ctx.fillStyle = '#E2B755'
    ctx.font = '800 18px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('★ EXCLUSIVE ALL-INCLUSIVE B2B PACKAGE ★', priceCardX + priceCardW / 2, priceCardY + 95)
    ctx.textAlign = 'left'
  }

  // ── 5. Main Body: Right Column (Photo Collage) ──
  const photoColX = 610
  const photoW = 260
  const photoH = 395
  const gap = 20

  const photoPositions = [
    { x: photoColX, y: 590 },
    { x: photoColX + photoW + gap, y: 590 },
    { x: photoColX, y: 590 + photoH + gap },
    { x: photoColX + photoW + gap, y: 590 + photoH + gap }
  ]

  photoPositions.forEach((pos, idx) => {
    const pImg = photoImgs[idx]
    const cardInfo = selectedCards[idx] || distinctKeywords[idx]
    const label = cardInfo?.label || 'SINGAPORE'

    ctx.save()
    drawRoundedRect(ctx, pos.x, pos.y, photoW, photoH, 14, false, false)
    ctx.clip()

    if (pImg && pImg.naturalWidth > 0) {
      drawCoverImage(ctx, pImg, pos.x, pos.y, photoW, photoH)
    } else {
      ctx.fillStyle = '#0F2752'
      ctx.fillRect(pos.x, pos.y, photoW, photoH)
    }

    // Bottom dark gradient overlay for label
    const labelH = 75
    const labelGrad = ctx.createLinearGradient(pos.x, pos.y + photoH - labelH, pos.x, pos.y + photoH)
    labelGrad.addColorStop(0, 'transparent')
    labelGrad.addColorStop(1, 'rgba(6, 14, 28, 0.94)')
    ctx.fillStyle = labelGrad
    ctx.fillRect(pos.x, pos.y + photoH - labelH, photoW, labelH)

    // Label Text
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '800 13px Inter, sans-serif'
    ctx.fillText(label, pos.x + 14, pos.y + photoH - 14)
    ctx.restore()

    // White Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.lineWidth = 3.5
    drawRoundedRect(ctx, pos.x, pos.y, photoW, photoH, 14, false, true)
  })

  // ── 6. Features Badges Strip (1465 to 1537) ──
  const stripY = 1465
  const stripH = 72
  ctx.fillStyle = '#050C18'
  ctx.fillRect(0, stripY, 1200, stripH)

  ctx.fillStyle = 'rgba(212, 175, 55, 0.35)'
  ctx.fillRect(0, stripY, 1200, 1.5)
  ctx.fillRect(0, stripY + stripH - 1.5, 1200, 1.5)

  // 4 Features: With/Without Hotels, Private/Group Transfers, Guaranteed Departures, Best Price Guaranteed
  const features = [
    { icon: '🏨', text: data.hotelRequired ? 'WITH HOTELS' : 'WITHOUT HOTELS' },
    { icon: '🚐', text: data.isPrivateTransfers ? 'PRIVATE TRANSFERS' : 'GROUP TRANSFERS' },
    { icon: '📅', text: 'GUARANTEED DEPARTURES' },
    { icon: '💰', text: 'BEST PRICE GUARANTEED' }
  ]

  const featureColW = 1200 / 4
  features.forEach((feat, idx) => {
    const fx = idx * featureColW
    if (idx > 0) {
      ctx.fillStyle = 'rgba(212, 175, 55, 0.3)'
      ctx.fillRect(fx, stripY + 20, 1, 32)
    }

    ctx.font = '18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(feat.icon, fx + featureColW / 2 - 60, stripY + 43)

    ctx.fillStyle = '#E2E8F0'
    ctx.font = '800 12.5px Inter, sans-serif'
    ctx.fillText(feat.text, fx + featureColW / 2 + 15, stripY + 42)
  })
  ctx.textAlign = 'left'

  // ── 7. Footer / Contact Card (1537 to 1800) ──
  const footY = 1537
  const footH = 1800 - footY
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, footY, 1200, footH)

  // Contact Row
  const phone = data.agency?.phone || '+91 98861 71251'
  const deskPhone = data.agency?.deskPhone || '+65 9689 0101'
  const email = data.agency?.email || 'ops@flyingwonders.com'

  const contactItems = [
    { icon: '📞', label: 'MOBILE / WHATSAPP', val: phone },
    { icon: '☎️', label: 'SINGAPORE DIRECT DESK', val: deskPhone },
    { icon: '✉️', label: 'EMAIL SUPPORT', val: email }
  ]

  const cColW = (1200 - 100) / 3
  contactItems.forEach((c, i) => {
    const cx = 50 + i * cColW
    const cy = footY + 42

    // Circle icon
    ctx.fillStyle = '#F1F5F9'
    ctx.strokeStyle = '#CBD5E1'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx + 22, cy, 22, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.font = '18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(c.icon, cx + 22, cy + 6)
    ctx.textAlign = 'left'

    ctx.fillStyle = '#64748B'
    ctx.font = '700 11px Inter, sans-serif'
    ctx.fillText(c.label, cx + 54, cy - 4)

    ctx.fillStyle = '#0F172A'
    ctx.font = '800 16px Inter, sans-serif'
    ctx.fillText(c.val, cx + 54, cy + 16)
  })

  // Divider
  ctx.fillStyle = '#E2E8F0'
  ctx.fillRect(50, footY + 80, 1100, 1)

  // Address Row
  const sgAddr = data.agency?.singaporeAddress || '160 Robinson Road, #14-04 SBF Center, Singapore 068914'
  const inAddr = data.agency?.indiaAddress || 'Bangalore & Delhi NCR B2B Operations Hub'

  const addrs = [
    { icon: '📍', title: 'SINGAPORE HEADQUARTERS', body: sgAddr },
    { icon: '🇮🇳', title: 'PARTNER B2B DESK', body: inAddr }
  ]

  addrs.forEach((a, i) => {
    const ax = 50 + i * 570
    const ay = footY + 122

    ctx.fillStyle = '#F1F5F9'
    ctx.strokeStyle = '#CBD5E1'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(ax + 18, ay, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(a.icon, ax + 18, ay + 6)
    ctx.textAlign = 'left'

    ctx.fillStyle = '#0F172A'
    ctx.font = '800 12px Inter, sans-serif'
    ctx.fillText(a.title, ax + 46, ay - 3)

    ctx.fillStyle = '#475569'
    ctx.font = '500 12px Inter, sans-serif'
    ctx.fillText(a.body, ax + 46, ay + 15)
  })

  // Disclaimer
  ctx.fillStyle = '#E2E8F0'
  ctx.fillRect(50, footY + 180, 1100, 1)

  ctx.fillStyle = '#94A3B8'
  ctx.font = '500 11px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Rates are dynamic and subject to seasonal ticket & vehicle availability upon confirmation. White-label B2B generated proposal.', 600, footY + 215)
  ctx.textAlign = 'left'

  return canvas
}

export async function generateFlyerBlob(data: FlyerPayload, quality = 0.84): Promise<Blob> {
  const canvas = await generateFlyerCanvas(data)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to create flyer blob'))
    }, 'image/jpeg', quality)
  })
}

export async function generateFlyerDataUrl(data: FlyerPayload, quality = 0.84): Promise<string> {
  const canvas = await generateFlyerCanvas(data)
  return canvas.toDataURL('image/jpeg', quality)
}
