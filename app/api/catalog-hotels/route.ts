import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { cleanHotelName } from '../../../utils/hotels'

// In-memory cache for serverless instance lifetime
let cachedHotels: any[] | null = null
let cacheExpiryTime: number = 0

const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=xlsx'

export async function GET() {
  const now = Date.now()

  // Return from in-memory cache if fresh (10-minute cache)
  if (cachedHotels && cachedHotels.length > 0 && cacheExpiryTime > now) {
    return NextResponse.json(
      { success: true, hotels: cachedHotels, cached: true },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
        }
      }
    )
  }

  try {
    const res = await fetch(GOOGLE_SHEET_URL, {
      next: { revalidate: 600 }
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch Google Sheet: ${res.status}`)
    }

    const buffer = await res.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const hotelSheet = wb.Sheets['Hotel'] || wb.Sheets['HOTEL'] || wb.Sheets['Hotels']

    if (!hotelSheet) {
      throw new Error('Hotel tab not found in workbook')
    }

    const rawHotels: any[] = XLSX.utils.sheet_to_json(hotelSheet)
    const seenNames = new Set<string>()
    const parsed: any[] = []

    rawHotels.forEach((h, idx) => {
      const rawName = h['Hotel Name'] || h['Hotel'] || h['NAME'] || ''
      const roomType = h['Room Category'] || h['Room Type'] || 'Deluxe Room'

      // Skip supplementary cost rows and empty rows
      if (!rawName || /supplementary\s*cost/i.test(roomType) || /price\s*\/\s*night/i.test(rawName)) {
        return
      }

      const { cleanName, detectedStar } = cleanHotelName(rawName)
      const normalizedKey = cleanName.toLowerCase().trim()

      if (seenNames.has(normalizedKey)) return
      seenNames.add(normalizedKey)

      parsed.push({
        id: `hotel-${idx}`,
        name: cleanName,
        star: h['Star Rating'] || h['Star'] || h['Category'] || detectedStar || '4-Star',
        location: h['City'] || h['Location'] || h['Area'] || 'Singapore',
        roomType: roomType,
        amenities: [
          h['Breakfast'] ? 'Breakfast Included' : 'Buffet Breakfast Available',
          'Free Wi-Fi',
          'Swimming Pool'
        ].filter(Boolean)
      })
    })

    // Save to memory cache (10 minutes)
    cachedHotels = parsed
    cacheExpiryTime = now + 10 * 60 * 1000

    return NextResponse.json(
      { success: true, hotels: parsed, cached: false },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
        }
      }
    )
  } catch (err: any) {
    // If external fetch fails but we have stale cache, return stale cache
    if (cachedHotels && cachedHotels.length > 0) {
      return NextResponse.json(
        { success: true, hotels: cachedHotels, stale: true },
        { headers: { 'Cache-Control': 'public, max-age=60' } }
      )
    }

    return NextResponse.json(
      { success: false, error: err.message || 'Failed to load catalog hotels' },
      { status: 500 }
    )
  }
}
