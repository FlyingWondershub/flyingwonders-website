import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { cookies } from 'next/headers'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

const readClient = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false, // Ensure we check active status in real-time
})

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('b2b_session')

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false })
    }

    const email = sessionCookie.value
    const agent = await readClient.fetch(`*[_type == "b2bAgent" && email == $email][0]`, { email })

    if (!agent || !agent.isActive) {
      // Clear cookie if agent no longer exists or is deactivated
      cookieStore.delete('b2b_session')
      return NextResponse.json({ authenticated: false })
    }

    // Check if the user is explicitly marked as an admin in Sanity, or is the hardcoded default admin
    const isAdminCount = await readClient.fetch(`count(*[_type == "adminUser" && email == $email])`, { email })
    const role = (email.toLowerCase() === 'info.flyingwonders@gmail.com' || isAdminCount > 0) ? 'admin' : 'user'
    return NextResponse.json({
      authenticated: true,
      agent: {
        companyName: agent.companyName,
        agentName: agent.agentName,
        email: agent.email,
        phone: agent.phone || '',
        role,
      },
    })
  } catch (err) {
    return NextResponse.json({ authenticated: false })
  }
}
