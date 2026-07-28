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

    // 1. Fetch agent record from Sanity
    const agent = await writeClient.fetch(`*[_type == "b2bAgent" && email == $email][0]`, { email })

    if (!agent) {
      return NextResponse.json({ error: 'Agent profile not found.' }, { status: 404 })
    }

    if (!agent.isActive) {
      return NextResponse.json({ error: 'Account has been deactivated.' }, { status: 403 })
    }

    // 2. Validate OTP code & expiration
    if (agent.otp !== otp) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 })
    }

    const expiryTime = new Date(agent.otpExpiry).getTime()
    if (expiryTime < Date.now()) {
      return NextResponse.json({ error: 'Verification code has expired.' }, { status: 400 })
    }

    // 3. Clear OTP in Sanity after successful validation
    await writeClient
      .patch(agent._id)
      .set({ otp: '', otpExpiry: '' })
      .commit()

    // 4. Create Audit Log entry in Sanity
    try {
      await writeClient.create({
        _type: 'auditLog',
        timestamp: new Date().toISOString(),
        action: 'B2B Login Success',
        email: email,
        details: `Agent ${agent.agentName || 'Unknown'} from company ${agent.companyName || 'Unknown'} logged in successfully.`,
      })
    } catch (auditErr) {
      console.error('Failed to write audit log to Sanity:', auditErr)
    }

    // 5. Set Secure, HTTP-Only Cookie Session
    const cookieStore = await cookies()
    cookieStore.set('b2b_session', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days session
      path: '/',
      sameSite: 'lax',
    })

    // Check if the user is explicitly marked as an admin in Sanity, or is the hardcoded default admin
    const isAdminCount = await writeClient.fetch(`count(*[_type == "adminUser" && email == $email])`, { email })
    const role = (email.toLowerCase() === 'info.flyingwonders@gmail.com' || isAdminCount > 0) ? 'admin' : 'user'
    return NextResponse.json({
      success: true,
      agent: {
        companyName: agent.companyName,
        agentName: agent.agentName,
        email: agent.email,
        phone: agent.phone || '',
        role,
      },
    })
  } catch (err: any) {
    console.error('Verify OTP Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
