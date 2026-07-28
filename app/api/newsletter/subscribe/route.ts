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

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    // 1. Check if subscriber already exists
    const existing = await writeClient.fetch(
      `*[_type == "newsletterSubscriber" && email == $email][0]`,
      { email }
    )

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ success: true, message: 'You are already subscribed!' })
      } else {
        // Re-activate subscription
        await writeClient
          .patch(existing._id)
          .set({ isActive: true, subscribedAt: new Date().toISOString() })
          .commit()
        return NextResponse.json({ success: true, message: 'Welcome back! Your subscription has been reactivated.' })
      }
    }

    // 2. Create new subscriber
    await writeClient.create({
      _type: 'newsletterSubscriber',
      email,
      subscribedAt: new Date().toISOString(),
      isActive: true,
    })

    return NextResponse.json({ success: true, message: 'Thank you for subscribing to Singapore Insider Guide!' })
  } catch (err: any) {
    console.error('Subscription API Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
