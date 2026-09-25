import { NextResponse } from 'next/server'
import {
  fetchChunkedLeads,
  saveOrUpdateLeads,
  updateLeadStatus,
  deleteLead,
  deleteBulkLeads,
  MarketingLeadItem,
} from '../../../../lib/audience-chunk-store'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// GET: Fetch leads with optional filtering & full database search
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limitParam = searchParams.get('limit') || '1000'
    const limit = limitParam === 'all' ? 5000 : Math.min(parseInt(limitParam, 10) || 1000, 5000)
    const priority = searchParams.get('priority') || undefined
    const status = searchParams.get('status') || undefined
    const search = (searchParams.get('search') || '').trim()
    const filterType = searchParams.get('filterType') || undefined

    const { leads, stats } = await fetchChunkedLeads({
      limit,
      priority,
      status,
      search,
      filterType,
    })

    return NextResponse.json({ success: true, leads, stats })
  } catch (error: any) {
    console.error('Fetch Leads Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST: Batch upsert leads
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const leads: Partial<MarketingLeadItem>[] = Array.isArray(body.leads) ? body.leads : [body]

    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: false, error: 'No leads provided' }, { status: 400 })
    }

    const result = await saveOrUpdateLeads(leads)
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${result.added + result.updated} leads!`,
      syncedCount: result.added + result.updated,
    })
  } catch (error: any) {
    console.error('Save Leads Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PATCH: Update individual lead status / notes
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json()
    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID required' }, { status: 400 })
    }

    const success = await updateLeadStatus(id, status || 'contacted')
    return NextResponse.json({ success, message: success ? 'Lead updated successfully' : 'Lead not found' })
  } catch (error: any) {
    console.error('Update Lead Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE: Remove single or multiple leads
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const ids: string[] = Array.isArray(body.ids)
      ? body.ids.filter(Boolean)
      : body.id
      ? [body.id]
      : []

    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No lead ID(s) provided' }, { status: 400 })
    }

    let deletedCount = 0
    if (ids.length === 1) {
      const ok = await deleteLead(ids[0])
      deletedCount = ok ? 1 : 0
    } else {
      deletedCount = await deleteBulkLeads(ids)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} lead${deletedCount === 1 ? '' : 's'}`,
      deletedCount,
    })
  } catch (error: any) {
    console.error('Delete Leads Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
