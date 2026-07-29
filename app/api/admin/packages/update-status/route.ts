import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { apiVersion, dataset, projectId } from '../../../../../sanity/env'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
    const { proposalId, status } = await req.json()

    if (!proposalId || !status) {
      return NextResponse.json({ error: 'Proposal ID and status are required' }, { status: 400 })
    }

    const validStatuses = ['pending', 'followup', 'confirmed', 'scheduled', 'completed', 'ignore']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    // Patch proposal status in Sanity
    await writeClient.patch(proposalId).set({ status }).commit()

    // Create audit log
    try {
      await writeClient.create({
        _type: 'auditLog',
        timestamp: new Date().toISOString(),
        action: `Updated package status to [${status.toUpperCase()}] for package ${proposalId}`,
        email: 'info.flyingwonders@gmail.com',
      })
    } catch (e) {}

    return NextResponse.json({ success: true, message: `Package status updated to ${status}` })
  } catch (err: any) {
    console.error('Failed to update package status:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
