import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../sanity/env'
import { ATTRACTION_NAMES as FALLBACK_NAMES } from '../../../sanity/schemaTypes/attractionsList'

const readClient = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
})

export const dynamic = 'force-dynamic'
export const revalidate = 60

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=xlsx'

export async function GET() {
  try {
    let sheetUrl = DEFAULT_SHEET_URL
    try {
      const siteSettings = await readClient.fetch(`*[_type == "siteSettings"][0]{ attractionsSheetUrl }`)
      if (siteSettings?.attractionsSheetUrl) {
        sheetUrl = siteSettings.attractionsSheetUrl
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

    // Look for Attractions tab or website_input or any sheet with attraction column
    let targetSheet = workbook.Sheets['Attractions'] || workbook.Sheets['website_input'] || workbook.Sheets['website input']

    if (!targetSheet) {
      for (const name of workbook.SheetNames) {
        const s = workbook.Sheets[name]
        const rows = XLSX.utils.sheet_to_json(s, { header: 1 })
        if (rows.length > 0 && Array.isArray(rows[0]) && rows[0].some(col => String(col).toLowerCase().includes('attraction'))) {
          targetSheet = s
          break
        }
      }
    }

    const attractionNames: string[] = []
    const seen = new Set<string>()

    if (targetSheet) {
      const rows: any[] = XLSX.utils.sheet_to_json(targetSheet)
      for (const row of rows) {
        const rawName = row['Attractions'] || row['Attraction Name'] || row['Attraction'] || row['Name'] || row['name']
        if (rawName && typeof rawName === 'string') {
          const clean = rawName.trim()
          if (clean && !seen.has(clean.toLowerCase()) && !clean.toLowerCase().startsWith('attraction')) {
            seen.add(clean.toLowerCase())
            attractionNames.push(clean)
          }
        }
      }
    }

    if (attractionNames.length === 0) {
      return NextResponse.json({
        success: true,
        attractions: FALLBACK_NAMES,
        isFallback: true
      })
    }

    return NextResponse.json({
      success: true,
      attractions: attractionNames,
      count: attractionNames.length,
      isFallback: false
    })
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      attractions: FALLBACK_NAMES,
      isFallback: true,
      error: err.message
    })
  }
}
