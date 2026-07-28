import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

const readClient = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
})

export async function GET() {
  try {
    const contacts = await readClient.fetch(`*[_type == "businessCard"] | order(capturedAt desc) {
      name,
      email,
      phone,
      company,
      title,
      capturedAt
    }`)

    // Generate CSV Content
    const headers = ['Full Name', 'Email Address', 'Phone Number', 'Company', 'Job Title', 'Captured At']
    const rows = contacts.map((c: any) => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.email || ''}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      c.capturedAt ? new Date(c.capturedAt).toISOString() : ''
    ])

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\r\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="scanned_contacts.csv"',
      },
    })
  } catch (err: any) {
    console.error('Export contacts error:', err)
    return NextResponse.json({ error: err.message || 'Failed to export contacts' }, { status: 500 })
  }
}
