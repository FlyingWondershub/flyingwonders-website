import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

export const dynamic = 'force-dynamic'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const DEFAULT_SETTINGS = {
  _id: 'jobSettings',
  _type: 'jobSettings',
  heroBadge: 'WE ARE HIRING TALENT',
  heroTitle: 'Shape the Future of Global Experiential Travel',
  heroSubtitle:
    'Join our passionate team delivering extraordinary journeys across Singapore, Southeast Asia, and worldwide. Explore open roles or join our talent network.',
  adminNotificationEmails: 'contact@flyingwonders.net, info.flyingwonders@gmail.com',
  autoReplyEnabled: true,
  acknowledgementEmailSubject: 'Application Received: {{jobTitle}} at Flying Wonders',
  acknowledgementCustomMessage:
    'Thank you for taking the time to share your background with us. Our hiring and operations leadership reviews all submissions carefully. If your skills match our current focus, our team will reach out within 48 to 72 hours for an exploratory conversation.',
  acceptGeneralApplications: true,
  generalApplicationPrompt:
    "Don't see your specific role? Join our Talent Network and we'll reach out when matching opportunities arise.",
}

export async function GET() {
  try {
    let settings = await writeClient.fetch(`*[_type == "jobSettings"][0]`)
    if (!settings) {
      settings = DEFAULT_SETTINGS
    }
    return NextResponse.json({ success: true, settings })
  } catch (err: any) {
    console.error('Job Settings API GET Error:', err)
    return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      heroBadge,
      heroTitle,
      heroSubtitle,
      adminNotificationEmails,
      autoReplyEnabled,
      acknowledgementEmailSubject,
      acknowledgementCustomMessage,
      acceptGeneralApplications,
      generalApplicationPrompt,
    } = body

    const docPayload = {
      _type: 'jobSettings',
      heroBadge: heroBadge || DEFAULT_SETTINGS.heroBadge,
      heroTitle: heroTitle || DEFAULT_SETTINGS.heroTitle,
      heroSubtitle: heroSubtitle || DEFAULT_SETTINGS.heroSubtitle,
      adminNotificationEmails:
        adminNotificationEmails || DEFAULT_SETTINGS.adminNotificationEmails,
      autoReplyEnabled: autoReplyEnabled !== false,
      acknowledgementEmailSubject:
        acknowledgementEmailSubject || DEFAULT_SETTINGS.acknowledgementEmailSubject,
      acknowledgementCustomMessage:
        acknowledgementCustomMessage || DEFAULT_SETTINGS.acknowledgementCustomMessage,
      acceptGeneralApplications: acceptGeneralApplications !== false,
      generalApplicationPrompt:
        generalApplicationPrompt || DEFAULT_SETTINGS.generalApplicationPrompt,
    }

    const saved = await writeClient.createOrReplace({
      _id: 'jobSettings',
      ...docPayload,
    })

    return NextResponse.json({
      success: true,
      settings: saved,
      message: 'Careers settings saved successfully!',
    })
  } catch (err: any) {
    console.error('Job Settings API POST Error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save settings' },
      { status: 500 }
    )
  }
}
