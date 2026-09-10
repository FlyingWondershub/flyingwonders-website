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
  'city private': '/images/hero/singapore-hero-2.jpg',
  'private city': '/images/hero/singapore-hero-2.jpg',
  'city tour': '/images/hero/singapore-hero-2.jpg',
  'singapore city': '/images/hero/singapore-hero-2.jpg',
  city: '/images/hero/singapore-hero-2.jpg',
  panoramic: '/images/hero/singapore-hero-4.jpg',
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
  flyer: '/images/attractions/singapore-flyer/cover.jpg',
  'city tour': '/images/hero/singapore-hero-2.jpg',
  'singapore city': '/images/hero/singapore-hero-2.jpg',
  city: '/images/hero/singapore-hero-2.jpg',
  panoramic: '/images/hero/singapore-hero-4.jpg',
}

export interface FlyerInclusion {
  title: string
  tag: string
  type: 'private' | 'sharing'
  icon: string
  dayNumber?: string | number
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
    // For portrait images (e.g. 1024x1536 city tour infographics), anchor at sy = 0 so the top hero header and skyline are perfectly framed
    // For moderate aspect ratios, bias slightly towards top (15%)
    sy = imgRatio < 0.9 ? 0 : Math.max(0, (img.naturalHeight - sh) * 0.15)
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

export function getAttractionCategoryTag(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('universal')) return 'THEME PARK'
  if (lower.includes('night safari')) return 'MANDAI WILDLIFE'
  if (lower.includes('zoo')) return 'MANDAI WILDLIFE'
  if (lower.includes('bird')) return 'MANDAI WILDLIFE'
  if (lower.includes('river')) return 'MANDAI WILDLIFE'
  if (lower.includes('cable') || lower.includes('sentosa') || lower.includes('wings')) return 'SCENIC SKY NETWORK'
  if (lower.includes('garden')) return 'CLOUD FOREST & FLOWER DOME'
  if (lower.includes('sands') || lower.includes('mbs') || lower.includes('skypark')) return 'MARINA BAY SKYPARK'
  if (lower.includes('flyer')) return 'PANORAMIC FLIGHT'
  if (lower.includes('luge')) return 'SENTOSA ATTRACTION'
  if (lower.includes('aquarium')) return 'RESORTS WORLD SENTOSA'
  if (lower.includes('city') && lower.includes('private')) return 'PRIVATE SIGHTSEEING'
  if (lower.includes('city') || lower.includes('panoramic')) return 'CITY ORIENTATION'
  return 'SINGAPORE ATTRACTION'
}

export function cleanInclusionTitle(title: string): string {
  if (!title) return ''
  return title
    .replace(/\(.*?upto.*?\)/gi, '')
    .replace(/\(.*?\)/g, '')
    .replace(/-\s*Fixed\s*Date\s*(\/\s*Time)?/gi, '')
    .replace(/\(Peak\s*-\s*Fixed\s*date\s*\/Time\s*\)/gi, '')
    .replace(/\(Peak\s*-\s*Fixed\s*Date\s*\)/gi, '')
    .replace(/-\s*Fixed\s*Time/gi, '')
    .replace(/-\s*Non\s*Peak/gi, '')
    .replace(/-\s*SIC/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getAttractionCleanLabel(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('city') && lower.includes('private')) return 'Singapore City Private Tour'
  if (lower.includes('city') || lower.includes('panoramic')) return 'Singapore City Orientation Tour'
  if (lower.includes('night safari')) return 'Night Safari Wildlife Park'
  if (lower.includes('cable car') || (lower.includes('sentosa') && !lower.includes('universal'))) return 'Sentosa Island & Cable Car'
  if (lower.includes('universal')) return 'Universal Studios Singapore'
  if (lower.includes('garden')) return 'Gardens by the Bay Double Domes'
  if (lower.includes('bird')) return 'Bird Paradise Mandai'
  if (lower.includes('river')) return 'River Wonders Singapore'
  if (lower.includes('zoo')) return 'Singapore Zoological Gardens'
  if (lower.includes('mbs') || lower.includes('sands')) return 'Marina Bay Sands SkyPark'
  if (lower.includes('flyer')) return 'Singapore Flyer Observation Wheel'
  if (lower.includes('aquarium')) return 'S.E.A. Aquarium Sentosa'
  if (lower.includes('luge')) return 'Skyline Luge & Skyride'
  return cleanInclusionTitle(name)
}

export interface PhotoCardSlot {
  x: number
  y: number
  w: number
  h: number
  isCompact: boolean
}

export function calculatePhotoCardSlots(
  totalCount: number,
  containerX: number,
  containerY: number,
  containerW: number,
  containerH: number
): PhotoCardSlot[] {
  const count = Math.max(1, totalCount)
  const slots: PhotoCardSlot[] = []

  // 1 to 5 attractions: Single column of wide landscape cards
  if (count <= 5) {
    const gap = count <= 3 ? 18 : (count === 4 ? 16 : 12)
    const cardH = Math.floor((containerH - (count - 1) * gap) / count)

    if (count === 1) {
      const singleH = Math.min(640, containerH)
      const singleY = containerY + (containerH - singleH) / 2
      slots.push({ x: containerX, y: singleY, w: containerW, h: singleH, isCompact: false })
      return slots
    }

    for (let i = 0; i < count; i++) {
      slots.push({
        x: containerX,
        y: containerY + i * (cardH + gap),
        w: containerW,
        h: cardH,
        isCompact: false
      })
    }
    return slots
  }

  // 6 or more attractions: 2-column responsive grid
  const gapX = 12
  const colW = Math.floor((containerW - gapX) / 2) // 259px

  if (count === 6) {
    const gapY = 12
    const rowH = Math.floor((containerH - 2 * gapY) / 3) // ~365px
    for (let i = 0; i < 6; i++) {
      const col = i % 2
      const row = Math.floor(i / 2)
      slots.push({
        x: containerX + col * (colW + gapX),
        y: containerY + row * (rowH + gapY),
        w: colW,
        h: rowH,
        isCompact: true
      })
    }
    return slots
  }

  if (count === 7) {
    // 1 Full-width hero card on top (height 230px) + 3 rows of 2 columns (6 cards)
    const gapY = 10
    const topHeroH = 230
    slots.push({
      x: containerX,
      y: containerY,
      w: containerW,
      h: topHeroH,
      isCompact: false
    })

    const remainingH = containerH - topHeroH - gapY
    const rowH = Math.floor((remainingH - 2 * gapY) / 3)
    for (let i = 0; i < 6; i++) {
      const col = i % 2
      const row = Math.floor(i / 2)
      slots.push({
        x: containerX + col * (colW + gapX),
        y: containerY + topHeroH + gapY + row * (rowH + gapY),
        w: colW,
        h: rowH,
        isCompact: true
      })
    }
    return slots
  }

  const rows = Math.ceil(count / 2)
  const gapY = 10
  const rowH = Math.floor((containerH - (rows - 1) * gapY) / rows)
  for (let i = 0; i < count; i++) {
    const col = i % 2
    const row = Math.floor(i / 2)
    const isLastOdd = (i === count - 1 && count % 2 === 1)
    slots.push({
      x: isLastOdd ? containerX : containerX + col * (colW + gapX),
      y: containerY + row * (rowH + gapY),
      w: isLastOdd ? containerW : colW,
      h: rowH,
      isCompact: !isLastOdd
    })
  }
  return slots
}

export async function generateFlyerCanvas(data: FlyerPayload): Promise<HTMLCanvasElement> {
  // Ensure document fonts are loaded if browser environment supports it
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready
    } catch {
      // Continue gracefully
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 1800
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create canvas 2D context')

  // Background
  ctx.fillStyle = '#081224'
  ctx.fillRect(0, 0, 1200, 1800)

  // 1. Resolve Images
  const logoSrc = data.agency?.logoUrl || '/images/logo.png'

  // Default 4 distinct attractions with wide landscape photos
  const distinctKeywords = [
    { key: 'night safari', label: 'Night Safari Wildlife Park', tag: 'MANDAI WILDLIFE' },
    { key: 'cable car', label: 'Sentosa Island & Cable Car', tag: 'SCENIC SKY NETWORK' },
    { key: 'universal', label: 'Universal Studios Singapore', tag: 'THEME PARK' },
    { key: 'gardens', label: 'Gardens by the Bay Double Domes', tag: 'CLOUD FOREST & FLOWER DOME' }
  ]

  // User attractions - include all attractions added by user
  const selectedCards: { label: string; tag: string; url: string }[] = []

  for (const item of (data.attractionPhotos || [])) {
    if (selectedCards.length >= 10) break // Cap at 10 to ensure images remain crisp and prominent
    const lower = item.name.toLowerCase()
    let matchedUrl = item.photoUrl || ''
    const label = getAttractionCleanLabel(item.name)
    const tag = getAttractionCategoryTag(item.name)

    if (!matchedUrl) {
      for (const [k, url] of Object.entries(SINGAPORE_ATTRACTIONS_PHOTO_MAP)) {
        if (lower.includes(k)) {
          matchedUrl = url
          break
        }
      }
    }

    if (!matchedUrl) {
      for (const [k, url] of Object.entries(LOCAL_FALLBACK_PHOTOS)) {
        if (lower.includes(k)) {
          matchedUrl = url
          break
        }
      }
    }

    if (matchedUrl && !selectedCards.some(c => c.label === label)) {
      selectedCards.push({ label, tag, url: matchedUrl })
    }
  }

  // If user provided NO attractions at all, fill with defaults
  if (selectedCards.length === 0) {
    for (const def of distinctKeywords) {
      selectedCards.push({
        label: def.label,
        tag: def.tag,
        url: SINGAPORE_ATTRACTIONS_PHOTO_MAP[def.key] || LOCAL_FALLBACK_PHOTOS[def.key]
      })
    }
  }

  // Preload and proxy all images concurrently
  const [logoImg, ...photoImgs] = await Promise.all([
    resolveProxyImage(logoSrc).then(url => loadImage(url)),
    ...selectedCards.map(async (c, i) => {
      const proxyUrl = await resolveProxyImage(c.url)
      const loaded = await loadImage(proxyUrl)
      if (loaded) return loaded
      // Try local fallback
      const key = distinctKeywords[i % distinctKeywords.length]?.key || 'gardens'
      const fallbackUrl = LOCAL_FALLBACK_PHOTOS[key]
      return loadImage(fallbackUrl)
    })
  ])

  // ── 2. Top Header Bar (0 to 275) — Avoid Skyline Image, Focus on Branding & Headline ──
  const headGrad = ctx.createLinearGradient(0, 0, 0, 275)
  headGrad.addColorStop(0, '#050C18')
  headGrad.addColorStop(0.6, '#09172E')
  headGrad.addColorStop(1, '#0C1E3C')
  ctx.fillStyle = headGrad
  ctx.fillRect(0, 0, 1200, 275)

  // Gold bottom border
  ctx.fillStyle = '#D4AF37'
  ctx.fillRect(0, 273, 1200, 2.5)

  // Top Branding Row
  let textStartX = 50
  if (logoImg && logoImg.naturalWidth > 0) {
    const lBoxW = 150
    const lBoxH = 62
    const lBoxX = 50
    const lBoxY = 22
    ctx.fillStyle = '#FFFFFF'
    drawRoundedRect(ctx, lBoxX, lBoxY, lBoxW, lBoxH, 10, true, false)

    // Draw logo inside container
    const maxW = lBoxW - 20
    const maxH = lBoxH - 12
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

    textStartX = lBoxX + lBoxW + 18
  }

  // Agency Title & Tagline
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '900 24px Inter, -apple-system, sans-serif'
  const agencyName = (data.agency?.name || 'FLYING WONDERS DMC').toUpperCase()
  ctx.fillText(agencyName, textStartX, 48)

  ctx.fillStyle = '#E2B755'
  ctx.font = '700 11.5px Inter, -apple-system, sans-serif'
  const agencyTagline = (data.agency?.tagline || 'SINGAPORE B2B DESTINATION SPECIALIST').toUpperCase()
  ctx.fillText(agencyTagline, textStartX, 70)

  // DMC Badge on Right
  const badgeW = 270
  const badgeH = 40
  const badgeX = 1200 - 50 - badgeW
  const badgeY = 32
  ctx.fillStyle = 'rgba(212, 175, 55, 0.12)'
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)'
  ctx.lineWidth = 1.5
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 20, true, true)

  ctx.fillStyle = '#F6D884'
  ctx.font = '800 12.5px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('★ EXCLUSIVE DMC RATES ★', badgeX + badgeW / 2, badgeY + 25)
  ctx.textAlign = 'left'

  // Season / Promotional Tour Ribbon
  const ribbonX = 50
  const ribbonY = 110
  const ribbonH = 30
  const ribbonText = `✨ ${(data.travelDates || 'SPECIAL PROMOTIONAL TOUR').toUpperCase()}`
  ctx.font = '900 12px Inter, sans-serif'
  const ribbonTextW = ctx.measureText(ribbonText).width
  const ribbonW = ribbonTextW + 36

  const ribbonGrad = ctx.createLinearGradient(ribbonX, ribbonY, ribbonX + ribbonW, ribbonY + ribbonH)
  ribbonGrad.addColorStop(0, '#F3D279')
  ribbonGrad.addColorStop(0.5, '#C9972E')
  ribbonGrad.addColorStop(1, '#E6C265')
  ctx.fillStyle = ribbonGrad
  drawRoundedRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH, 4, true, false)

  ctx.fillStyle = '#071731'
  ctx.fillText(ribbonText, ribbonX + 18, ribbonY + 20)

  // Hero Headline: Guest Name -- followed with Singapore Gateway or Singapore Tour
  let headlineText = (data.headline || '').trim().toUpperCase()
  if (!headlineText) {
    const cleanGuest = (data.guestName || '').trim().toUpperCase()
    headlineText = cleanGuest ? `${cleanGuest} — SINGAPORE GETAWAY` : 'SINGAPORE GETAWAY'
  }

  let fontSize = 42
  ctx.font = `900 ${fontSize}px Cinzel, "Playfair Display", Georgia, serif`
  while (ctx.measureText(headlineText).width > 1100 && fontSize > 26) {
    fontSize -= 2
    ctx.font = `900 ${fontSize}px Cinzel, "Playfair Display", Georgia, serif`
  }

  const headTextGrad = ctx.createLinearGradient(50, 150, 50, 190)
  headTextGrad.addColorStop(0, '#FFFFFF')
  headTextGrad.addColorStop(0.5, '#F1F5F9')
  headTextGrad.addColorStop(1, '#D4AF37')
  ctx.fillStyle = headTextGrad
  ctx.fillText(headlineText, 50, 186)

  // Subtitle
  const nights = data.nightsCount || 3
  const hotelSuffix = data.hotelRequired 
    ? `· Land Package (With ${data.hotelName ? data.hotelName.split(' ').slice(0, 3).join(' ') : 'Hotel Accommodation'})` 
    : '· Land Package (Without Hotels)'
  const subtitleText = `${nights + 1} Days / ${nights} Nights ${hotelSuffix}`
  ctx.font = 'italic 700 23px "Playfair Display", Georgia, serif'
  ctx.fillStyle = '#F8E29A'
  ctx.fillText(subtitleText, 50, 230)

  // ── 3. Main Body (y: 295 to 1445) ──
  const leftColX = 50
  const leftColW = 535
  const rightColX = 620
  const rightColW = 530

  // ── 3A. Left Column: Day-Wise Itinerary & Inclusions ──
  const headerY = 328
  ctx.font = '16px sans-serif'
  ctx.fillText('📋', leftColX, headerY)

  ctx.fillStyle = '#E2B755'
  ctx.font = '900 13px Inter, sans-serif'
  ctx.fillText('DAY-WISE TOUR ITINERARY & INCLUSIONS', leftColX + 26, headerY - 1)

  ctx.fillStyle = 'rgba(212, 175, 55, 0.3)'
  ctx.fillRect(leftColX, headerY + 12, leftColW, 1.5)

  // Default Inclusions
  const defaultInclusions: FlyerInclusion[] = [
    { dayNumber: '01', title: 'Return Airport Transfers', tag: data.isPrivateTransfers ? 'Private Air-Conditioned Vehicle (Changi ⇄ Hotel)' : 'Sharing Seat-in-Coach (SIC)', type: data.isPrivateTransfers ? 'private' : 'sharing', icon: '🚗' },
    { dayNumber: '02', title: 'Night Safari + Tram Ride', tag: "World's 1st Nocturnal Wildlife Park (Sharing)", type: 'sharing', icon: '🦁' },
    { dayNumber: '03', title: 'Singapore Panoramic Drive', tag: 'Merlion Park, Civic District & Marina Bay (Sharing)', type: 'sharing', icon: '🏙️' },
    { dayNumber: '04', title: 'Sentosa Cable Car + Wings of Time', tag: 'Mount Faber Sky Network & Laser Fireworks Show', type: 'sharing', icon: '🚡' },
    { dayNumber: '05', title: 'Universal Studios Singapore', tag: '1-Day Full Access Ticket & Thrill Rides (Sharing)', type: 'sharing', icon: '🎢' },
    { dayNumber: '06', title: 'Gardens by the Bay', tag: 'Flower Dome + Cloud Forest Double Domes (Sharing)', type: 'sharing', icon: '🌸' }
  ]

  let inclusions: FlyerInclusion[] = (data.inclusions && data.inclusions.length > 0)
    ? [...data.inclusions.slice(0, 6)]
    : defaultInclusions

  // Pad if fewer than 6 items to ensure full vertical balance
  if (inclusions.length < 6) {
    for (const def of defaultInclusions) {
      if (inclusions.length >= 6) break
      if (!inclusions.some(inc => inc.title.toLowerCase().includes(def.title.toLowerCase().slice(0, 10)))) {
        inclusions.push({
          ...def,
          dayNumber: String(inclusions.length + 1).padStart(2, '0')
        })
      }
    }
  }

  const listY = 358
  const itemH = 110
  const itemGap = 16

  inclusions.forEach((inc, i) => {
    const cardY = listY + i * (itemH + itemGap)

    // Card background
    ctx.fillStyle = 'rgba(15, 29, 56, 0.85)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1
    drawRoundedRect(ctx, leftColX, cardY, leftColW, itemH, 12, true, true)

    // Left gold vertical accent
    ctx.fillStyle = '#E2B755'
    drawRoundedRect(ctx, leftColX, cardY, 5, itemH, 2, true, false)

    // Day Badge
    const bx = leftColX + 16
    const by = cardY + (itemH - 56) / 2
    const bw = 54
    const bh = 56
    const br = 10

    const bGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh)
    bGrad.addColorStop(0, '#091D3E')
    bGrad.addColorStop(1, '#153265')
    ctx.fillStyle = bGrad
    ctx.strokeStyle = 'rgba(226, 183, 85, 0.7)'
    ctx.lineWidth = 1.5
    drawRoundedRect(ctx, bx, by, bw, bh, br, true, true)

    ctx.fillStyle = '#E2B755'
    ctx.font = '800 10px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('DAY', bx + bw / 2, by + 18)

    const dayNumStr = (inc.dayNumber || (i + 1)).toString().padStart(2, '0')
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '900 22px Inter, sans-serif'
    ctx.fillText(dayNumStr, bx + bw / 2, by + 44)
    ctx.textAlign = 'left'

    // Details
    const tx = leftColX + 86
    const maxTextW = leftColW - 86 - 16 // 433px

    // Dynamic Title Auto-Fit
    const displayTitle = cleanInclusionTitle(inc.title).toUpperCase()
    let titleFontSize = 15.5
    ctx.font = `800 ${titleFontSize}px Inter, sans-serif`
    let titleMeasuredW = ctx.measureText(displayTitle).width
    while (titleMeasuredW > maxTextW && titleFontSize > 11.5) {
      titleFontSize -= 0.5
      ctx.font = `800 ${titleFontSize}px Inter, sans-serif`
      titleMeasuredW = ctx.measureText(displayTitle).width
    }
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(displayTitle, tx, cardY + 36, maxTextW)

    // Dynamic Tag Auto-Fit
    let tagFontSize = 12.5
    ctx.font = `600 ${tagFontSize}px Inter, sans-serif`
    let tagMeasuredW = ctx.measureText(inc.tag).width
    while (tagMeasuredW > maxTextW && tagFontSize > 10) {
      tagFontSize -= 0.5
      ctx.font = `600 ${tagFontSize}px Inter, sans-serif`
      tagMeasuredW = ctx.measureText(inc.tag).width
    }
    ctx.fillStyle = inc.type === 'private' ? '#6EE7B7' : '#93C5FD'
    ctx.fillText(inc.tag, tx, cardY + 62, maxTextW)

    ctx.fillStyle = '#94A3B8'
    ctx.font = '500 11.5px Inter, sans-serif'
    const extraNote = inc.type === 'private' ? 'Dedicated Chauffeur & Sanitized Vehicle' : 'Pre-booked Admission · Instant QR Access'
    ctx.fillText(extraNote, tx, cardY + 86, maxTextW)
  })

  // ── 3B. Left Column Bottom: Luxury Price Card ──
  const priceCardX = leftColX
  const priceCardY = 1234
  const priceCardW = leftColW
  const priceCardH = 150

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
    ctx.fillText('SPECIAL PROMOTIONAL RATE', priceCardX + 24, priceCardY + 34)

    ctx.fillStyle = '#F8E29A'
    ctx.font = '900 24px Inter, sans-serif'
    ctx.fillText(data.pricing?.currency || 'SGD', priceCardX + 24, priceCardY + 98)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '900 56px Cinzel, "Playfair Display", Inter, serif'
    const fig = data.pricing?.figure || '315'
    ctx.fillText(fig, priceCardX + 92, priceCardY + 104)

    // Right Unit Tag
    const unitW = 168
    const unitH = 34
    const unitX = priceCardX + priceCardW - unitW - 24
    const unitY = priceCardY + 48
    const unitGrad = ctx.createLinearGradient(unitX, unitY, unitX + unitW, unitY + unitH)
    unitGrad.addColorStop(0, '#F3D279')
    unitGrad.addColorStop(1, '#C9972E')
    ctx.fillStyle = unitGrad
    drawRoundedRect(ctx, unitX, unitY, unitW, unitH, 6, true, false)

    ctx.fillStyle = '#071731'
    ctx.font = '900 12.5px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(data.pricing?.label || 'PER PERSON ONLY', unitX + unitW / 2, unitY + 22)
    ctx.textAlign = 'left'

    // Subtitle conversion note
    if (data.pricing?.inrEquivalent) {
      ctx.fillStyle = '#94A3B8'
      ctx.font = '600 12px Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(data.pricing.inrEquivalent, priceCardX + priceCardW - 24, priceCardY + 112)
      ctx.textAlign = 'left'
    }
  } else {
    ctx.fillStyle = '#E2B755'
    ctx.font = '800 18px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('★ EXCLUSIVE ALL-INCLUSIVE B2B PACKAGE ★', priceCardX + priceCardW / 2, priceCardY + 74)
    ctx.fillStyle = '#94A3B8'
    ctx.font = '600 12.5px Inter, sans-serif'
    ctx.fillText('Contact your travel consultant for custom pricing & group rates', priceCardX + priceCardW / 2, priceCardY + 102)
    ctx.textAlign = 'left'
  }

  // ── 3C. Right Column: Dynamic Attraction Photo Collage (All User Attractions!) ──
  const photoStartY = 330
  const photoContainerH = 1120
  const slots = calculatePhotoCardSlots(selectedCards.length, rightColX, photoStartY, rightColW, photoContainerH)

  for (let idx = 0; idx < selectedCards.length; idx++) {
    const slot = slots[idx]
    if (!slot) break

    const pImg = photoImgs[idx]
    const cardInfo = selectedCards[idx]

    ctx.save()
    drawRoundedRect(ctx, slot.x, slot.y, slot.w, slot.h, 12, false, false)
    ctx.clip()

    if (pImg && pImg.naturalWidth > 0) {
      drawCoverImage(ctx, pImg, slot.x, slot.y, slot.w, slot.h)
    } else {
      ctx.fillStyle = '#0B192C'
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h)
    }

    // Bottom dark gradient overlay for label
    const labelH = slot.isCompact ? 68 : (slot.h < 200 ? 48 : 58)
    const labelGrad = ctx.createLinearGradient(slot.x, slot.y + slot.h - labelH, slot.x, slot.y + slot.h)
    labelGrad.addColorStop(0, 'transparent')
    labelGrad.addColorStop(1, 'rgba(6, 14, 28, 0.95)')
    ctx.fillStyle = labelGrad
    ctx.fillRect(slot.x, slot.y + slot.h - labelH, slot.w, labelH)

    if (slot.isCompact) {
      // 2-column layout: Tag pill on top, attraction title below
      const tagText = cardInfo.tag.toUpperCase()
      ctx.font = '800 8.5px Inter, sans-serif'
      const tagTextW = ctx.measureText(tagText).width
      const pillW = tagTextW + 14
      const pillH = 18
      const pillX = slot.x + 10
      const pillY = slot.y + slot.h - 44

      ctx.fillStyle = 'rgba(212, 175, 55, 0.25)'
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)'
      ctx.lineWidth = 1
      drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 5, true, true)

      ctx.fillStyle = '#F8E29A'
      ctx.textAlign = 'center'
      ctx.fillText(tagText, pillX + pillW / 2, pillY + 12)
      ctx.textAlign = 'left'

      // Attraction Label
      const displayLabel = cardInfo.label.toUpperCase()
      let labelFontSize = 11.5
      ctx.font = `800 ${labelFontSize}px Inter, sans-serif`
      const maxLabelW = slot.w - 20
      while (ctx.measureText(displayLabel).width > maxLabelW && labelFontSize > 8.5) {
        labelFontSize -= 0.5
        ctx.font = `800 ${labelFontSize}px Inter, sans-serif`
      }
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(displayLabel, slot.x + 10, slot.y + slot.h - 14, maxLabelW)
    } else {
      // Wide layout: Attraction Title on left, Tag pill on right
      const tagText = cardInfo.tag.toUpperCase()
      const isShortCard = slot.h < 200
      const tagFontSize = isShortCard ? 9 : 10
      ctx.font = `800 ${tagFontSize}px Inter, sans-serif`
      const tagTextW = ctx.measureText(tagText).width
      const pillW = tagTextW + 18
      const pillH = isShortCard ? 20 : 24
      const pillX = slot.x + slot.w - pillW - 14
      const pillY = slot.y + slot.h - (isShortCard ? 27 : 32)

      // Tag pill
      ctx.fillStyle = 'rgba(212, 175, 55, 0.22)'
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.65)'
      ctx.lineWidth = 1
      drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 10, true, true)

      ctx.fillStyle = '#F8E29A'
      ctx.textAlign = 'center'
      ctx.fillText(tagText, pillX + pillW / 2, pillY + (isShortCard ? 14 : 16))
      ctx.textAlign = 'left'

      // Attraction Label
      const displayLabel = cardInfo.label.toUpperCase()
      let labelFontSize = isShortCard ? 13 : 14.5
      ctx.font = `800 ${labelFontSize}px Inter, sans-serif`
      const maxLabelW = slot.w - pillW - 36
      while (ctx.measureText(displayLabel).width > maxLabelW && labelFontSize > 10) {
        labelFontSize -= 0.5
        ctx.font = `800 ${labelFontSize}px Inter, sans-serif`
      }
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(displayLabel, slot.x + 16, slot.y + slot.h - (isShortCard ? 14 : 18), maxLabelW)
    }

    ctx.restore()

    // Crisp White Outer Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.lineWidth = 2.5
    drawRoundedRect(ctx, slot.x, slot.y, slot.w, slot.h, 12, false, true)
  }

  // ── 4. Features Badges Strip (1465 to 1537) ──
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

  // ── 5. Footer / Contact Card (1537 to 1800) — No Address, Only Agency Name, Contact Number & Email ──
  const footY = 1537
  const footH = 1800 - footY
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, footY, 1200, footH)

  // Top Row: Agency Name & Tagline
  ctx.fillStyle = '#0F172A'
  ctx.font = '900 24px Inter, -apple-system, sans-serif'
  const footAgencyName = (data.agency?.name || 'FLYING WONDERS DMC').toUpperCase()
  ctx.fillText(footAgencyName, 50, footY + 44)

  ctx.fillStyle = '#C9972E'
  ctx.font = '700 11.5px Inter, -apple-system, sans-serif'
  const footAgencyTagline = (data.agency?.tagline || 'SINGAPORE B2B DESTINATION SPECIALIST').toUpperCase()
  ctx.fillText(footAgencyTagline, 50, footY + 66)

  // Right pill badge
  const deskBadgeW = 170
  const deskBadgeH = 32
  const deskBadgeX = 1200 - 50 - deskBadgeW
  const deskBadgeY = footY + 36
  ctx.fillStyle = '#F1F5F9'
  ctx.strokeStyle = '#CBD5E1'
  ctx.lineWidth = 1
  drawRoundedRect(ctx, deskBadgeX, deskBadgeY, deskBadgeW, deskBadgeH, 16, true, true)
  ctx.fillStyle = '#64748B'
  ctx.font = '800 11.5px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('DIRECT DMC DESK', deskBadgeX + deskBadgeW / 2, deskBadgeY + 20)
  ctx.textAlign = 'left'

  // Divider
  ctx.fillStyle = '#E2E8F0'
  ctx.fillRect(50, footY + 88, 1100, 1)

  // Contact Row: Retain ONLY Contact Number & Email
  const phone = data.agency?.phone || '+91 98861 71251'
  const deskPhone = data.agency?.deskPhone || '+65 9689 0101'
  const email = data.agency?.email || 'ops@flyingwonders.com'

  const contactItems = [
    { icon: '📞', label: 'MOBILE / WHATSAPP', val: phone },
    ...(deskPhone ? [{ icon: '☎️', label: 'SINGAPORE DIRECT DESK', val: deskPhone }] : []),
    { icon: '✉️', label: 'EMAIL SUPPORT', val: email }
  ]

  const cColW = 1100 / contactItems.length
  contactItems.forEach((c, i) => {
    const cx = 50 + i * cColW
    const cy = footY + 140

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
    ctx.fillText(c.val, cx + 54, cy + 17)
  })

  // Divider
  ctx.fillStyle = '#F1F5F9'
  ctx.fillRect(50, footY + 194, 1100, 1)

  // Disclaimer
  ctx.fillStyle = '#94A3B8'
  ctx.font = '500 11px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Rates are dynamic and subject to seasonal ticket & vehicle availability upon confirmation. White-label B2B generated proposal.', 600, footY + 225)
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

