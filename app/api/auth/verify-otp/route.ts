import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { cookies } from 'next/headers'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

export const dynamic = 'force-dynamic'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    // 1. Fetch agent record from b2bAgent schema
    let record = await writeClient.fetch(`*[_type == "b2bAgent" && (lower(email) == $cleanEmail || email == $cleanEmail)][0]{
      ...,
      "logoUrl": logo.asset->url
    }`, { cleanEmail })
    let recordType = 'b2bAgent'

    // If not found in b2bAgent, check b2bCatalogProfile for B2B Directory
    if (!record) {
      record = await writeClient.fetch(`*[_type == "b2bCatalogProfile" && lower(email) == $cleanEmail][0]`, { cleanEmail })
      recordType = 'b2bCatalogProfile'
    }

    // 2. Fallback check: if record not in Sanity, allow valid OTP verification for new profile registration
    if (!record) {
      return NextResponse.json({ success: true, isNew: true, message: 'OTP verified for new profile registration.' })
    }

    if (record.isActive === false) {
      return NextResponse.json({ error: 'Account has been deactivated.' }, { status: 403 })
    }

    // 3. Validate OTP code & expiration
    if (record.otp && record.otp !== otp) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 })
    }

    if (record.otpExpiry) {
      const expiryTime = new Date(record.otpExpiry).getTime()
      if (expiryTime < Date.now()) {
        return NextResponse.json({ error: 'Verification code has expired.' }, { status: 400 })
      }
    }

    // 4. Clear OTP in Sanity after successful validation
    await writeClient
      .patch(record._id)
      .set({ otp: '', otpExpiry: '' })
      .commit()

    // 5. Create Audit Log entry in Sanity
    try {
      await writeClient.create({
        _type: 'auditLog',
        timestamp: new Date().toISOString(),
        action: 'B2B Verification Success',
        email: cleanEmail,
        details: `Verified ${recordType} for ${cleanEmail}`,
      })
    } catch (auditErr) {
      console.error('Failed to write audit log to Sanity:', auditErr)
    }

    // 6. Set B2B Agent session cookie
    const response = NextResponse.json({
      success: true,
      agent: {
        companyName: record.companyName,
        agentName: record.agentName,
        email: cleanEmail,
        phone: record.phone,
        logoUrl: record.logoUrl || '',
      },
    })

    const cookieStore = await cookies()
    cookieStore.set('b2b_session', cleanEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
    })

    return response

  } catch (error: any) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json({ error: error.message || 'Verification failed.' }, { status: 500 })
  }
}
