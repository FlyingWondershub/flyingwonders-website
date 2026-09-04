import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'
import * as XLSX from 'xlsx'

const readClient = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
})

export const dynamic = 'force-dynamic'

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=xlsx'

async function verifyAdmin() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('b2b_session')
  if (!sessionCookie?.value) return false
  const email = sessionCookie.value
  const isAdminCount = await readClient.fetch(`count(*[_type == "adminUser" && email == $email])`, { email })
  if (email.toLowerCase() !== 'info.flyingwonders@gmail.com' && isAdminCount === 0) return false
  return true
}

export async function POST() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

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

    const res = await fetch(sheetUrl, { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(`Google Sheet returned HTTP ${res.status}`)
    }

    const buffer = await res.arrayBuffer()
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })

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

    let count = 0
    if (targetSheet) {
      const rows = XLSX.utils.sheet_to_json(targetSheet)
      count = rows.length
    }

    // Invalidate caches across the site
    revalidatePath('/singapore-attractions')
    revalidatePath('/custom-package')
    revalidatePath('/api/attraction-meta')

    return NextResponse.json({
      success: true,
      count,
      message: `Successfully synchronized ${count} attractions from Google Sheet and purged page caches.`
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to sync attractions'
    }, { status: 500 })
  }
}
