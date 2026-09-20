import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../sanity/env'

const readClient = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
})

const CACHE_FILE = path.join(process.cwd(), 'data', 'exchange_rate.json')
const DEFAULT_RATE = 74.81
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000 // 12 Hours
const FAILURE_ALERT_COOLDOWN_MS = 1 * 60 * 60 * 1000 // 1 Hour

interface ExchangeRateCache {
  rate: number
  lastUpdated: string
  lastFailureAlertSent?: string
  lastSuccessAlertSent?: string
}

export interface ExchangeRateDetails {
  rate: number // Final standardized rate (with markup or manual override applied)
  baseRate: number // Base market rate before markup
  markupType: 'absolute' | 'percentage'
  markupValue: number
  isManualOverride: boolean
}

async function sendEmail(subject: string, htmlContent: string) {
  // Exchange rate email notifications paused per user request
  console.log('Skipped exchange rate email dispatch (paused by user request).')
  return true
}

async function fetchBaseMarketRate(): Promise<number> {
  // Local Fallback Cache Setup
  let cache: ExchangeRateCache = {
    rate: DEFAULT_RATE,
    lastUpdated: new Date(0).toISOString(),
    lastFailureAlertSent: new Date(0).toISOString(),
    lastSuccessAlertSent: new Date(0).toISOString()
  }

  const dataDir = path.dirname(CACHE_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  if (fs.existsSync(CACHE_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
      cache = { ...cache, ...parsed }
    } catch (readErr) {
      console.warn('Failed to parse exchange rate cache, using defaults for memory structure', readErr)
    }
  }

  const lastUpdatedTime = new Date(cache.lastUpdated).getTime()
  const timeSinceLastUpdate = Date.now() - lastUpdatedTime

  // Return cached rate if it is less than 12 hours old
  if (timeSinceLastUpdate < CACHE_DURATION_MS && lastUpdatedTime > 0 && cache.rate > 0) {
    return cache.rate
  }

  // Cache expired or empty, fetch live rate from Frankfurter API
  try {
    console.log('Fetching live SGD to INR exchange rate from API...')
    const res = await fetch('https://api.frankfurter.app/latest?from=SGD&to=INR', {
      next: { revalidate: 3600 }
    })

    if (!res.ok) {
      throw new Error(`Frankfurter API returned status ${res.status}`)
    }

    const data = await res.json()
    const rate = data.rates?.INR

    if (typeof rate !== 'number') {
      throw new Error('Invalid rate format in API response')
    }

    // Rate successfully fetched. Send success alert if needed.
    const lastSuccessAlertTime = cache.lastSuccessAlertSent ? new Date(cache.lastSuccessAlertSent).getTime() : 0
    if (Date.now() - lastSuccessAlertTime >= 12 * 60 * 60 * 1000) {
      const subject = `✅ Exchange Rate Successfully Refreshed`
      const html = `
        <h3>SGD to INR Exchange Rate Updated Successfully</h3>
        <p>The system successfully queried Frankfurter API and refreshed the rate.</p>
        <p><strong>New Active Rate:</strong> S$ 1 SGD = ₹ ${rate} INR</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</p>
        <p style="font-size: 0.85rem; color: #718096;">All conversions across the homepage, packages, and custom package builder are now using this refreshed rate.</p>
      `
      await sendEmail(subject, html)
      cache.lastSuccessAlertSent = new Date().toISOString()
    }

    // Save to cache
    cache.rate = rate
    cache.lastUpdated = new Date().toISOString()
    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8')
      console.log(`Exchange rate cache updated to ₹${rate} (SGD)`)
    } catch (fsErr) {
      console.log(`Exchange rate fetched: ₹${rate} (in-memory serverless cache)`)
    }

    return rate

  } catch (err: any) {
    console.error('Failed to update exchange rate from Frankfurter API:', err)
    return cache.rate > 0 ? cache.rate : DEFAULT_RATE
  }
}

export async function getExchangeRateDetails(): Promise<ExchangeRateDetails> {
  // 1. Fetch Sanity Settings (manual override and markup settings)
  let settings: any = null
  try {
    settings = await readClient.fetch(
      `*[_type == "siteSettings"][0]{ manualRateOverride, exchangeMarkupType, exchangeMarkupValue }`
    )
  } catch (sanityErr) {
    console.error('Failed to fetch siteSettings exchange settings from Sanity:', sanityErr)
  }

  // 2. Fetch base market rate
  const baseRate = await fetchBaseMarketRate()

  // 3. Manual override takes highest priority
  if (settings?.manualRateOverride && typeof settings.manualRateOverride === 'number' && settings.manualRateOverride > 0) {
    const overrideVal = Math.round(settings.manualRateOverride * 100) / 100
    console.log(`Using Sanity Manual Override Rate: ₹${overrideVal}`)
    return {
      rate: overrideVal,
      baseRate: Math.round(baseRate * 100) / 100,
      markupType: settings.exchangeMarkupType || 'absolute',
      markupValue: typeof settings.exchangeMarkupValue === 'number' ? settings.exchangeMarkupValue : 3.5,
      isManualOverride: true
    }
  }

  // 4. Apply configured markup
  const markupType: 'absolute' | 'percentage' = settings?.exchangeMarkupType === 'percentage' ? 'percentage' : 'absolute'
  const markupValue = typeof settings?.exchangeMarkupValue === 'number' ? settings.exchangeMarkupValue : 3.5

  let effectiveRate = baseRate
  if (markupType === 'absolute') {
    effectiveRate = baseRate + markupValue
  } else {
    effectiveRate = baseRate * (1 + markupValue / 100)
  }

  const finalRate = Math.round(effectiveRate * 100) / 100

  return {
    rate: finalRate,
    baseRate: Math.round(baseRate * 100) / 100,
    markupType,
    markupValue,
    isManualOverride: false
  }
}

export async function getLiveExchangeRate(): Promise<number> {
  const details = await getExchangeRateDetails()
  return details.rate
}
