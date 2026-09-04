import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { cookies } from 'next/headers'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

export const dynamic = 'force-dynamic'

const readClient = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false, // Ensure we check active status in real-time
})

export async function GET() {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }

  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('b2b_session')

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false }, { headers })
    }

    const cleanEmail = sessionCookie.value.trim().toLowerCase()
    const agent = await readClient.fetch(`*[_type == "b2bAgent" && (lower(email) == $cleanEmail || email == $cleanEmail)][0]{
      _id,
      companyName,
      agentName,
      email,
      phone,
      isActive,
      "logoUrl": logo.asset->url
    }`, { cleanEmail })

    if (!agent || !agent.isActive) {
      // Clear cookie if agent no longer exists or is deactivated
      cookieStore.delete('b2b_session')
      return NextResponse.json({ authenticated: false }, { headers })
    }

    // Check if the user is explicitly marked as an admin in Sanity, or is the hardcoded default admin
    const isAdminCount = await readClient.fetch(`count(*[_type == "adminUser" && (lower(email) == $cleanEmail || email == $cleanEmail)])`, { cleanEmail })
    const role = (cleanEmail === 'info.flyingwonders@gmail.com' || isAdminCount > 0) ? 'admin' : 'user'
    return NextResponse.json({
      authenticated: true,
      agent: {
        companyName: agent.companyName,
        agentName: agent.agentName,
        email: agent.email,
        phone: agent.phone || '',
        role,
        logoUrl: agent.logoUrl || '',
      },
    }, { headers })
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { headers })
  }
}
