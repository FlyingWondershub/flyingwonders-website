import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { cookies } from 'next/headers'
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
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 1. Fetch user record
    const user = await writeClient.fetch(
      `*[_type == "attractionsUser" && email == $email][0]`,
      { email: normalizedEmail }
    )

    if (!user) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 })
    }

    if (!user.isApproved) {
      return NextResponse.json({ error: 'Your access is pending approval.' }, { status: 403 })
    }

    // 2. Validate OTP code & expiration
    if (user.otp !== otp) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 })
    }

    const expiryTime = new Date(user.otpExpiry).getTime()
    if (expiryTime < Date.now()) {
      return NextResponse.json({ error: 'Verification code has expired.' }, { status: 400 })
    }

    // 3. Clear OTP in Sanity
    await writeClient
      .patch(user._id)
      .set({ otp: '', otpExpiry: '' })
      .commit()

    // 4. Set Session Cookie
    const cookieStore = await cookies()
    cookieStore.set('attractions_session', normalizedEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days session
      path: '/',
      sameSite: 'lax',
    })

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        company: user.company,
      },
    })
  } catch (err: any) {
    console.error('Verify OTP Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
