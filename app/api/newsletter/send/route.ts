import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'
import { sendEmail } from '../../../../lib/brevo'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

export async function POST(req: Request) {
  try {
    const { campaignId, adminEmail } = await req.json()

    // 1. Verify that the request is initiated by an authorized admin
    const allowedAdmins = ['info.flyingwonders@gmail.com', 'support.flyingwonders@gmail.com']
    if (!adminEmail || !allowedAdmins.includes(adminEmail.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized. Only admins can dispatch newsletters.' }, { status: 403 })
    }

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required.' }, { status: 400 })
    }

    // 2. Fetch the Campaign document from Sanity
    const campaign = await writeClient.fetch(
      `*[_type == "newsletterCampaign" && _id == $campaignId][0]`,
      { campaignId }
    )

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 })
    }

    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'This campaign has already been sent.' }, { status: 400 })
    }

    // 3. Fetch all active subscribers
    const subscribers = await writeClient.fetch(
      `*[_type == "newsletterSubscriber" && isActive == true].email`
    )

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No active subscribers found in list.' }, { status: 400 })
    }

    console.log(`Starting newsletter dispatch to ${subscribers.length} subscribers for campaign: ${campaign.title}`)

    // 4. Send emails via Brevo
    let successCount = 0
    const errors: Array<{ email: string; error: string }> = []

    for (const email of subscribers) {
      try {
        const unsubscribeUrl = `https://flyingwonders.net/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`

        const mailHtml = `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a202c; max-width: 600px; margin: 0 auto; line-height: 1.6; background: #f8fafc; padding: 20px 0;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 0 16px;">
              <header style="background: #800020; padding: 2.2rem 1.5rem; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 1.8rem; letter-spacing: 0.12em; text-transform: uppercase; font-family: Georgia, serif;">Flying Wonders</h1>
                <p style="color: #dfba6b; margin: 0.5rem 0 0 0; font-size: 0.8rem; letter-spacing: 0.25em; text-transform: uppercase; font-weight: 600;">Singapore & India Specialist DMC</p>
              </header>
              <main style="padding: 2.5rem 2rem; background: #ffffff;">
                ${campaign.content.replace(/\n/g, '<br />')}
              </main>
              <footer style="background: #f8fafc; padding: 1.8rem 1.5rem; text-align: center; border-top: 1px solid #e2e8f0; font-size: 0.78rem; color: #64748b;">
                <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #334155;">Flying Wonders Private Limited</p>
                <p style="margin: 0 0 1rem 0;">Singapore & India Specialist DMC • Official B2B & B2C Partner</p>
                <p style="margin: 0 0 0.5rem 0; font-size: 0.72rem; color: #94a3b8;">
                  You are receiving this email because you subscribed to updates at flyingwonders.net.
                </p>
                <p style="margin: 0; font-size: 0.72rem;">
                  <a href="${unsubscribeUrl}" style="color: #800020; text-decoration: underline;">Unsubscribe from newsletter</a>
                  &nbsp;•&nbsp;
                  <a href="https://flyingwonders.net/contact" style="color: #64748b; text-decoration: none;">Contact Support</a>
                </p>
              </footer>
            </div>
          </div>
        `

        const result = await sendEmail({
          to: email,
          subject: campaign.subject,
          html: mailHtml,
          senderName: 'Flying Wonders',
          senderEmail: 'contact@flyingwonders.net',
          replyTo: 'contact@flyingwonders.net',
        })

        if (result.success) {
          successCount++
        } else {
          throw new Error(result.error || 'Failed to dispatch email')
        }
      } catch (err: any) {
        console.error(`Failed to send newsletter to ${email}:`, err.message)
        errors.push({ email, error: err.message })
      }
    }

    // 5. Update Sanity Campaign Document Status
    await writeClient
      .patch(campaign._id)
      .set({
        status: 'sent',
        sentAt: new Date().toISOString(),
        sentToCount: successCount,
      })
      .commit()

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      totalCount: subscribers.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    console.error('Newsletter Dispatch Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
