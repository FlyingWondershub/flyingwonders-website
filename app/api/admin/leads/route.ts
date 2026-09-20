import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import crypto from 'crypto'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

function generateLeadId(email?: string, phone?: string): string {
  const seed = (email || phone || Math.random().toString()).toLowerCase().trim()
  const hash = crypto.createHash('md5').update(seed).digest('hex').slice(0, 16)
  return `marketingLead-${hash}`
}

// GET: Fetch leads with optional filtering
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '500', 10)
    const priority = searchParams.get('priority')
    const status = searchParams.get('status')

    let query = `*[_type == "marketingLead"]`
    if (priority) query += ` && priority == "${priority}"`
    if (status) query += ` && status == "${status}"`
    query += ` | order(_createdAt desc)[0...${limit}]`

    const leads = await writeClient.fetch(query)

    // Calculate quick statistics
    const statsQuery = `{
      "total": count(*[_type == "marketingLead"]),
      "highPriority": count(*[_type == "marketingLead" && priority == "high"]),
      "withWhatsApp": count(*[_type == "marketingLead" && defined(whatsapp) && whatsapp != ""]),
      "contacted": count(*[_type == "marketingLead" && status == "contacted"]),
      "inDiscussion": count(*[_type == "marketingLead" && status == "in_discussion"])
    }`
    const stats = await writeClient.fetch(statsQuery)

    return NextResponse.json({ success: true, leads, stats })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST: Batch upsert leads
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const leads = Array.isArray(body.leads) ? body.leads : [body]

    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: false, error: 'No leads provided' }, { status: 400 })
    }

    let createdCount = 0
    let updatedCount = 0

    // Process in batches of 50 for Sanity transactions
    const batchSize = 50
    for (let i = 0; i < leads.length; i += batchSize) {
      const chunk = leads.slice(i, i + batchSize)
      const transaction = writeClient.transaction()

      for (const lead of chunk) {
        const id = lead._id || generateLeadId(lead.email, lead.phone)

        const doc = {
          _id: id,
          _type: 'marketingLead',
          name: lead.name || '',
          email: lead.email ? lead.email.toLowerCase().trim() : '',
          phone: lead.phone || '',
          whatsapp: lead.whatsapp || '',
          designation: lead.designation || '',
          company: lead.company || '',
          website: lead.website || '',
          city: lead.city || '',
          accreditations: lead.accreditations || '',
          taxId: lead.taxId || '',
          priority: lead.priority || 'normal',
          leadType: lead.leadType || 'individual',
          status: lead.status || 'new',
          source: lead.source || 'manual',
          instagram: lead.instagram || '',
          linkedin: lead.linkedin || '',
          meetingLink: lead.meetingLink || '',
          relevantKeywords: lead.relevantKeywords || '',
          subjectSample: lead.subjectSample || '',
          internalNotes: lead.internalNotes || '',
          lastContactedAt: lead.lastContactedAt || null,
        }

        // createOrReplace ensures no duplicates and merges smoothly
        transaction.createOrReplace(doc)
      }

      await transaction.commit()
      createdCount += chunk.length
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${createdCount} leads into Sanity!`,
      syncedCount: createdCount,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PATCH: Update individual lead status / notes
export async function PATCH(req: Request) {
  try {
    const { id, status, internalNotes, lastContactedAt } = await req.json()
    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID required' }, { status: 400 })
    }

    const patch = writeClient.patch(id)
    if (status) patch.set({ status })
    if (internalNotes !== undefined) patch.set({ internalNotes })
    if (lastContactedAt) patch.set({ lastContactedAt })

    await patch.commit()
    return NextResponse.json({ success: true, message: 'Lead updated successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
