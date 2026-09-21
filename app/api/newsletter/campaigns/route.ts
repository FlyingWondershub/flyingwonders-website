import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// GET: Fetch all campaigns (Drafts and Sent)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const adminEmail = searchParams.get('adminEmail')

    const allowedAdmins = ['info.flyingwonders@gmail.com', 'support.flyingwonders@gmail.com']
    // Allow internal admin requests or explicit admin email check
    if (adminEmail && !allowedAdmins.includes(adminEmail.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    const campaigns = await writeClient.fetch(
      `*[_type == "newsletterCampaign"] | order(_createdAt desc) {
        _id,
        title,
        subject,
        content,
        status,
        sentAt,
        sentToCount,
        _createdAt
      }`
    )

    const subscriberCount = await writeClient.fetch(
      `count(*[_type == "newsletterSubscriber" && isActive == true])`
    )

    return NextResponse.json({ success: true, campaigns, subscriberCount })
  } catch (err: any) {
    console.error('Fetch Campaigns Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

// POST: Create a new campaign template
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, subject, content } = body

    if (!title || !subject || !content) {
      return NextResponse.json({ error: 'Title, subject, and content are required.' }, { status: 400 })
    }

    const newCampaign = await writeClient.create({
      _type: 'newsletterCampaign',
      title: title.trim(),
      subject: subject.trim(),
      content: content.trim(),
      status: 'draft',
    })

    return NextResponse.json({ success: true, campaign: newCampaign }, { status: 201 })
  } catch (err: any) {
    console.error('Create Campaign Error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create campaign' }, { status: 500 })
  }
}

// PUT: Update an existing campaign template
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { campaignId, title, subject, content } = body

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required.' }, { status: 400 })
    }

    const patchData: any = {}
    if (title) patchData.title = title.trim()
    if (subject) patchData.subject = subject.trim()
    if (content) patchData.content = content.trim()

    const updated = await writeClient
      .patch(campaignId)
      .set(patchData)
      .commit()

    return NextResponse.json({ success: true, campaign: updated })
  } catch (err: any) {
    console.error('Update Campaign Error:', err)
    return NextResponse.json({ error: err.message || 'Failed to update campaign' }, { status: 500 })
  }
}

// DELETE: Delete a draft campaign template
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const campaignId = searchParams.get('id')

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required.' }, { status: 400 })
    }

    // Verify it is draft
    const campaign = await writeClient.fetch(
      `*[_type == "newsletterCampaign" && _id == $campaignId][0]`,
      { campaignId }
    )

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'Cannot delete already dispatched campaigns for audit record preservation.' }, { status: 400 })
    }

    await writeClient.delete(campaignId)
    return NextResponse.json({ success: true, message: 'Campaign deleted successfully.' })
  } catch (err: any) {
    console.error('Delete Campaign Error:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete campaign' }, { status: 500 })
  }
}
