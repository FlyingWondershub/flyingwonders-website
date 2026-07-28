import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

const readClient = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const adminEmail = searchParams.get('adminEmail')

    const allowedAdmins = ['info.flyingwonders@gmail.com', 'support.flyingwonders@gmail.com']
    if (!adminEmail || !allowedAdmins.includes(adminEmail.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    // Fetch all draft campaigns
    const drafts = await readClient.fetch(
      `*[_type == "newsletterCampaign" && status == "draft"] | order(_createdAt desc) { _id, title, subject }`
    )

    return NextResponse.json({ success: true, campaigns: drafts })
  } catch (err: any) {
    console.error('Fetch Campaigns Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
