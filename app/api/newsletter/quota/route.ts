import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'
import { isSesConfigured, getSesSendQuota } from '../../../../lib/ses'

export const dynamic = 'force-dynamic'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

export interface SesInfo {
  configured: boolean
  region: string
  fromEmail: string
  quota: {
    max24HourSend: number
    maxSendRate: number
    sentLast24Hours: number
  } | null
}

export interface BrevoQuotaInfo {
  planType: string
  dailyLimit: number
  sentToday: number
  remainingCredits: number
  safeRemaining: number
  resetsInHours: number
  resetsAtUtc: string
  campaignsSentToday: Array<{ title: string; sentCount: number; time: string }>
}

export async function fetchLiveBrevoQuota(): Promise<BrevoQuotaInfo> {
  const brevoApiKey = process.env.BREVO_API_KEY
  let brevoCredits: number | null = null
  let brevoSentToday: number | null = null
  let planType = 'free'
  let dailyLimit = 300

  // 1. Check Brevo API directly if key is available
  if (brevoApiKey && brevoApiKey.startsWith('xkeysib-')) {
    try {
      const accRes = await fetch('https://api.brevo.com/v3/account', {
        headers: { 'api-key': brevoApiKey, accept: 'application/json' },
        cache: 'no-store'
      })
      if (accRes.ok) {
        const accData = await accRes.json()
        if (Array.isArray(accData.plan) && accData.plan.length > 0) {
          const emailPlan = accData.plan.find((p: any) => p.creditsType === 'sendLimit') || accData.plan[0]
          planType = emailPlan.type || 'free'
          if (typeof emailPlan.credits === 'number') {
            brevoCredits = emailPlan.credits
          }
        }
      }

      // Check today's SMTP report from Brevo
      const todayIso = new Date().toISOString().split('T')[0]
      const repRes = await fetch(`https://api.brevo.com/v3/smtp/statistics/reports?startDate=${todayIso}&endDate=${todayIso}`, {
        headers: { 'api-key': brevoApiKey, accept: 'application/json' },
        cache: 'no-store'
      })
      if (repRes.ok) {
        const repData = await repRes.json()
        if (Array.isArray(repData.reports) && repData.reports.length > 0) {
          brevoSentToday = repData.reports[0].requests || 0
        }
      }
    } catch (err: any) {
      console.error('Brevo live quota fetch error:', err.message)
    }
  }

  // 2. Fetch today's Sanity campaign dispatch history
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  let sanitySentToday = 0
  const campaignsSentToday: Array<{ title: string; sentCount: number; time: string }> = []

  try {
    const campaigns = await writeClient.fetch(
      `*[_type == "newsletterCampaign"] {
        title,
        dispatchHistory
      }`
    )

    for (const c of campaigns || []) {
      if (Array.isArray(c.dispatchHistory)) {
        for (const h of c.dispatchHistory) {
          if (h.dispatchedAt) {
            const d = new Date(h.dispatchedAt)
            if (d >= todayStart) {
              const count = h.sentCount || 0
              sanitySentToday += count
              campaignsSentToday.push({
                title: c.title,
                sentCount: count,
                time: d.toLocaleTimeString()
              })
            }
          }
        }
      }
    }
  } catch (err: any) {
    console.error('Sanity quota check error:', err.message)
  }

  const effectiveSentToday = brevoSentToday !== null ? brevoSentToday : sanitySentToday
  const effectiveRemaining = brevoCredits !== null ? brevoCredits : Math.max(0, dailyLimit - effectiveSentToday)
  const safeDailyTarget = 250
  const safeRemaining = Math.max(0, Math.min(effectiveRemaining, safeDailyTarget - effectiveSentToday))

  // Calculate hours until midnight UTC reset
  const now = new Date()
  const nextMidnightUtc = new Date(now)
  nextMidnightUtc.setUTCHours(24, 0, 0, 0)
  const diffHours = Math.max(0, (nextMidnightUtc.getTime() - now.getTime()) / (1000 * 60 * 60))

  return {
    planType,
    dailyLimit,
    sentToday: effectiveSentToday,
    remainingCredits: effectiveRemaining,
    safeRemaining,
    resetsInHours: Math.round(diffHours * 10) / 10,
    resetsAtUtc: '00:00 UTC (8:00 AM SGT / 5:30 AM IST)',
    campaignsSentToday
  }
}

export async function fetchSesStatus(): Promise<SesInfo> {
  const configured = isSesConfigured()
  let quota = null
  if (configured) {
    try {
      quota = await getSesSendQuota()
    } catch (e: any) {
      console.warn('Could not fetch SES quota:', e.message)
    }
  }

  return {
    configured,
    region: process.env.AWS_REGION || 'us-east-1',
    fromEmail: process.env.AWS_SES_FROM_EMAIL || 'Flying Wonders <contact@flyingwonders.net>',
    quota
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const adminEmail = searchParams.get('adminEmail')

    const allowedAdmins = ['info.flyingwonders@gmail.com', 'support.flyingwonders@gmail.com']
    if (adminEmail && !allowedAdmins.includes(adminEmail.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    const [quota, ses] = await Promise.all([
      fetchLiveBrevoQuota(),
      fetchSesStatus()
    ])

    return NextResponse.json({ success: true, quota, ses })
  } catch (err: any) {
    console.error('Fetch Quota Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
