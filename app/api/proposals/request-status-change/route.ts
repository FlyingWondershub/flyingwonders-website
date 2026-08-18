import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('b2b_session')
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No active B2B session' }, { status: 401 })
    }

    const email = sessionCookie.value.trim().toLowerCase()

    const { proposalId, targetStatus, note } = await req.json()
    if (!proposalId || !targetStatus) {
      return NextResponse.json({ success: false, error: 'proposalId and targetStatus are required' }, { status: 400 })
    }

    if (targetStatus !== 'confirmed' && targetStatus !== 'ignore') {
      return NextResponse.json({ success: false, error: 'Invalid status request. Must be "confirmed" or "ignore" (closed).' }, { status: 400 })
    }

    // Retrieve proposal
    const proposal = await writeClient.fetch(
      `*[_type == "proposal" && _id == $proposalId]{
        _id,
        status,
        agent->{ email }
      }[0]`,
      { proposalId }
    )

    if (!proposal) {
      return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 })
    }

    // Verify ownership or admin level
    const isOwner = proposal.agent?.email?.toLowerCase() === email
    const isAdmin = email === 'info.flyingwonders@gmail.com' || (await writeClient.fetch(`count(*[_type == "adminUser" && email == $email])`, { email })) > 0

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not own this proposal' }, { status: 403 })
    }

    // Update status request fields
    await writeClient
      .patch(proposalId)
      .set({
        statusChangeRequested: true,
        requestedStatus: targetStatus,
        statusRequestNote: note || '',
        statusRequestAt: new Date().toISOString()
      })
      .commit()

    return NextResponse.json({ success: true, message: 'Status change requested successfully' })
  } catch (err: any) {
    console.error('Error requesting status change:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
