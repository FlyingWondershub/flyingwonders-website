import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../sanity/env'

const readClient = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
})

export const dynamic = 'force-dynamic'
export const revalidate = 60

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=xlsx'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filterType = searchParams.get('type') // 'transfers' | 'guides' | 'hotels' | 'meals'

  try {
    let sheetUrl = DEFAULT_SHEET_URL
    try {
      const siteSettings = await readClient.fetch(`*[_type == "siteSettings"][0]{ attractionsSheetUrl, customPackageSheetUrl }`)
      const configuredUrl = siteSettings?.customPackageSheetUrl || siteSettings?.attractionsSheetUrl
      if (configuredUrl) {
        sheetUrl = configuredUrl
          .replace(/\/pubhtml.*/gi, '/pub?output=xlsx')
          .replace(/output=csv/gi, 'output=xlsx')
          .replace(/output=html/gi, 'output=xlsx')
        if (!sheetUrl.includes('output=xlsx')) {
          sheetUrl += (sheetUrl.includes('?') ? '&' : '?') + 'output=xlsx'
        }
      }
    } catch (e) {}

    const res = await fetch(sheetUrl, { next: { revalidate: 60 } })
    if (!res.ok) {
      throw new Error(`Google Sheet fetch failed: HTTP ${res.status}`)
    }

    const buffer = await res.arrayBuffer()
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })

    // 1. Transfers: Combination of {Vehicle Type} - {Transfer Type} - {Rate type} - {Service Name}
    const transfers: string[] = []
    const seenTransfers = new Set<string>()
    const transfersSheet = workbook.Sheets['Transfers']
    if (transfersSheet) {
      const rows: any[] = XLSX.utils.sheet_to_json(transfersSheet)
      for (const row of rows) {
        const vType = (row['Vehicle Type'] || '').trim()
        const tType = (row['Transfer Type'] || '').trim()
        const rType = (row['Rate type'] || row['Rate Type'] || '').trim()
        const sName = (row['Service Name'] || row['Service'] || row['Transfers'] || 'Transfers').trim()
        const parts = [vType, tType, rType, sName].filter(Boolean)
        if (parts.length > 0) {
          const combo = parts.join(' - ')
          if (!seenTransfers.has(combo.toLowerCase())) {
            seenTransfers.add(combo.toLowerCase())
            transfers.push(combo)
          }
        }
      }
    }

    // 2. Guides: Transfer Description
    const guides: string[] = []
    const seenGuides = new Set<string>()
    const guideSheet = workbook.Sheets['Guide']
    if (guideSheet) {
      const rows: any[] = XLSX.utils.sheet_to_json(guideSheet)
      for (const row of rows) {
        const desc = (row['Transfer Description'] || '').trim()
        if (desc && !seenGuides.has(desc.toLowerCase())) {
          seenGuides.add(desc.toLowerCase())
          guides.push(desc)
        }
      }
    }

    // 3. Hotels: Hotel Name
    const hotels: string[] = []
    const seenHotels = new Set<string>()
    const hotelSheet = workbook.Sheets['Hotel']
    if (hotelSheet) {
      const rows: any[] = XLSX.utils.sheet_to_json(hotelSheet)
      for (const row of rows) {
        const hName = (row['Hotel Name'] || '').trim()
        if (hName && !seenHotels.has(hName.toLowerCase())) {
          seenHotels.add(hName.toLowerCase())
          hotels.push(hName)
        }
      }
    }

    // 4. Meals Plan: Restaurant Name (Meal Type) or Meal Type
    const meals: string[] = []
    const seenMeals = new Set<string>()
    ;['Breakfast', 'Lunch', 'Dinner'].forEach(m => {
      seenMeals.add(m.toLowerCase())
      meals.push(m)
    })

    const mealsSheet = workbook.Sheets['Meals Plan']
    if (mealsSheet) {
      const rows: any[] = XLSX.utils.sheet_to_json(mealsSheet)
      for (const row of rows) {
        const restName = (row['Restaurant Name'] || row['__EMPTY_2'] || '').trim()
        const mType = (row['Meal Type'] || row['Type'] || row['__EMPTY_3'] || '').trim()
        let name = ''
        if (restName && mType) {
          name = `${restName} (${mType})`
        } else if (restName) {
          name = restName
        } else if (mType) {
          name = mType
        }
        if (name && !seenMeals.has(name.toLowerCase())) {
          seenMeals.add(name.toLowerCase())
          meals.push(name)
        }
      }
    }

    if (filterType === 'transfers') {
      return NextResponse.json({ success: true, items: transfers, count: transfers.length })
    }
    if (filterType === 'guides') {
      return NextResponse.json({ success: true, items: guides, count: guides.length })
    }
    if (filterType === 'hotels') {
      return NextResponse.json({ success: true, items: hotels, count: hotels.length })
    }
    if (filterType === 'meals') {
      return NextResponse.json({ success: true, items: meals, count: meals.length })
    }

    return NextResponse.json({
      success: true,
      transfers,
      guides,
      hotels,
      meals
    })
  } catch (err: any) {
    console.error('Failed to parse dynamic catalog from Google Sheets:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to fetch catalog',
      transfers: [],
      guides: [],
      hotels: [],
      meals: ['Breakfast', 'Lunch', 'Dinner']
    }, { status: 500 })
  }
}
