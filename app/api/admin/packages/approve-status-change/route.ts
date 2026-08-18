import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { cookies } from 'next/headers'
import { apiVersion, dataset, projectId } from '../../../../../sanity/env'

export const dynamic = 'force-dynamic'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

async function verifyAdmin() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('b2b_session')
  if (!sessionCookie?.value) return false
  const email = sessionCookie.value.trim().toLowerCase()
  const isAdminCount = await writeClient.fetch(`count(*[_type == "adminUser" && email == $email])`, { email })
  if (email !== 'info.flyingwonders@gmail.com' && isAdminCount === 0) return false
  return true
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { proposalId, action } = await req.json()
    if (!proposalId || !action) {
      return NextResponse.json({ success: false, error: 'proposalId and action are required' }, { status: 400 })
    }

    if (action !== 'approve' && action !== 'deny') {
      return NextResponse.json({ success: false, error: 'Invalid action. Must be "approve" or "deny"' }, { status: 400 })
    }

    const proposal = await writeClient.fetch(
      `*[_type == "proposal" && _id == $proposalId][0]{
        _id,
        status,
        requestedStatus,
        statusChangeRequested
      }`,
      { proposalId }
    )

    if (!proposal) {
      return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 })
    }

    if (!proposal.statusChangeRequested) {
      return NextResponse.json({ success: false, error: 'No status change request found for this proposal' }, { status: 400 })
    }

    const patchData: any = {
      statusChangeRequested: false,
      requestedStatus: '',
      statusRequestNote: '',
      statusRequestAt: ''
    }

    if (action === 'approve') {
      patchData.status = proposal.requestedStatus
    }

    await writeClient.patch(proposalId).set(patchData).commit()

    // Create audit log entry
    try {
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get('b2b_session')
      const email = sessionCookie?.value?.trim().toLowerCase() || 'info.flyingwonders@gmail.com'
      await writeClient.create({
        _type: 'auditLog',
        timestamp: new Date().toISOString(),
        action: `Admin [${action.toUpperCase()}] status change request for package ${proposalId} (Target: ${proposal.requestedStatus})`,
        email,
      })
    } catch (e) {
      console.error('Audit log failed for approve-status-change:', e)
    }

    return NextResponse.json({
      success: true,
      message: `Status change request has been successfully ${action}d.`
    })
  } catch (err: any) {
    console.error('Error approving/denying status change:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
