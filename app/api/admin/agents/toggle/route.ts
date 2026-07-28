import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { cookies } from 'next/headers'
import { apiVersion, dataset, projectId } from '../../../../../sanity/env'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const readClient = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
})

async function verifyAdmin() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('b2b_session')
  if (!sessionCookie?.value) return false
  const email = sessionCookie.value
  const isAdminCount = await readClient.fetch(`count(*[_type == "adminUser" && email == $email])`, { email })
  if (email.toLowerCase() !== 'info.flyingwonders@gmail.com' && isAdminCount === 0) return false
  return true
}

export async function POST(req: Request) {
  if (!(await verifyAdmin())) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const { agentId, isActive } = await req.json()
    if (!agentId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Missing agentId or isActive boolean' }, { status: 400 })
    }

    const updated = await writeClient
      .patch(agentId)
      .set({ isActive })
      .commit()
      
    return NextResponse.json({ success: true, agent: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
