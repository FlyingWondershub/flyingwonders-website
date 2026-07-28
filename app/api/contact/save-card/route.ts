import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import nodemailer from 'nodemailer'

const getSanityWriteClient = () => {
  const token = process.env.SANITY_WRITE_TOKEN
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8xtd7yiv'
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  
  if (!token) {
    console.warn('SANITY_WRITE_TOKEN is missing. Cannot save leads.')
    return null
  }

  return createClient({
    projectId,
    dataset,
    token,
    apiVersion: '2024-01-01',
    useCdn: false,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, company, title, frontImage, backImage, addToNewsletter } = body

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
    }

    const writeClient = getSanityWriteClient()
    if (!writeClient) {
      return NextResponse.json({ error: 'Sanity writer client is not configured.' }, { status: 500 })
    }

    // Helper to upload base64 image to Sanity asset pipeline
    const uploadBase64Image = async (base64String: string, filename: string) => {
      const match = base64String.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/)
      const data = match ? match[2] : base64String
      const buffer = Buffer.from(data, 'base64')
      
      const asset = await writeClient.assets.upload('image', buffer, {
        filename,
        contentType: match ? match[1] : 'image/jpeg'
      })
      return asset
    }

    let frontAsset = null
    let backAsset = null

    if (frontImage) {
      try {
        frontAsset = await uploadBase64Image(frontImage, 'business_card_front.jpg')
      } catch (err) {
        console.error('Error uploading front image asset:', err)
      }
    }

    if (backImage) {
      try {
        backAsset = await uploadBase64Image(backImage, 'business_card_back.jpg')
      } catch (err) {
        console.error('Error uploading back image asset:', err)
      }
    }

    // 1. Create the Business Card Lead Document
    const leadDoc = await writeClient.create({
      _type: 'businessCard',
      name: name || '',
      email,
      phone: phone || '',
      company: company || '',
      title: title || '',
      frontCardImage: frontAsset ? {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: frontAsset._id
        }
      } : undefined,
      backCardImage: backAsset ? {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: backAsset._id
        }
      } : undefined,
      capturedAt: new Date().toISOString()
    })

    // 2. Add to Newsletter Subscribers if checked
    if (addToNewsletter) {
      try {
        // First check if subscriber already exists
        const query = `*[_type == "newsletterSubscriber" && email == $email][0]`
        const existingSub = await writeClient.fetch(query, { email })

        if (!existingSub) {
          await writeClient.create({
            _type: 'newsletterSubscriber',
            email,
            subscribedAt: new Date().toISOString(),
            isActive: true
          })
          console.log(`Subscribed ${email} to newsletter successfully.`)
        } else {
          console.log(`Subscriber ${email} already exists.`)
        }
      } catch (newsletterErr) {
        console.error('Failed to register email subscription:', newsletterErr)
      }
    }

    // 3. Send Email Notification
    try {
      const user = process.env.SMTP_USER
      const pass = process.env.SMTP_PASS
      const host = process.env.SMTP_HOST || 'smtp.gmail.com'
      const port = parseInt(process.env.SMTP_PORT || '465')

      if (user && pass) {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        })

        let recipientEmails = 'info.flyingwonders@gmail.com'
        try {
          const fetched = await writeClient.fetch(`*[_type == "siteSettings"][0]{ notificationEmails }`)
          if (fetched?.notificationEmails) {
            recipientEmails = fetched.notificationEmails
          }
        } catch (err) {
          console.error('Failed to fetch recipient emails from siteSettings:', err)
        }

        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Singapore' })

        await transporter.sendMail({
          from: `"Flying Wonders Lead Alert" <${user}>`,
          to: recipientEmails,
          subject: `📇 Scanned Business Card: ${name || 'New Lead'} — ${company || 'No Company'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #F8FAFC;">
              <h3 style="color: #0F172A; margin-top: 0; border-bottom: 2px solid #10B981; padding-bottom: 8px;">📇 New Lead Registered (Business Card Scan)</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9rem;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 130px; color: #475569;">Full Name:</td>
                  <td style="padding: 6px 0; color: #0F172A;">${name || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #475569;">Email Address:</td>
                  <td style="padding: 6px 0; color: #0F172A;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #475569;">Phone Number:</td>
                  <td style="padding: 6px 0; color: #0F172A;">${phone || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #475569;">Company:</td>
                  <td style="padding: 6px 0; color: #0F172A;">${company || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #475569;">Job Title:</td>
                  <td style="padding: 6px 0; color: #0F172A;">${title || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #475569;">Newsletter List:</td>
                  <td style="padding: 6px 0; color: #10B981; font-weight: bold;">${addToNewsletter ? 'Subscribed' : 'Not Subscribed'}</td>
                </tr>
              </table>
              <hr style="border: 0; border-top: 1px dashed #CBD5E1; margin: 15px 0;" />
              <p style="font-size: 0.75rem; color: #94A3B8; text-align: center; margin: 0;">Captured on ${timestamp} SGT</p>
            </div>
          `
        })
        console.log(`Lead notification email sent to ${recipientEmails}`)
      }
    } catch (emailErr) {
      console.error('Failed to send lead registration email notification:', emailErr)
    }

    return NextResponse.json({ success: true, leadId: leadDoc._id })
  } catch (error: any) {
    console.error('Error in save-card API:', error)
    return NextResponse.json({ error: error.message || 'Failed to save lead.' }, { status: 500 })
  }
}
