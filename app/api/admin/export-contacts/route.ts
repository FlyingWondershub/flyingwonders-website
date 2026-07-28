import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { cookies } from 'next/headers'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

const readClient = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
})

export async function GET() {
  try {
    // 1. Verify Admin Authentication
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('b2b_session')
    
    if (!sessionCookie || !sessionCookie.value) {
      return new NextResponse('Unauthorized - Please log in', { status: 401 })
    }
    
    const email = sessionCookie.value
    const isAdminCount = await readClient.fetch(`count(*[_type == "adminUser" && email == $email])`, { email })
    
    if (email.toLowerCase() !== 'info.flyingwonders@gmail.com' && isAdminCount === 0) {
      return new NextResponse('Forbidden - Admin access required', { status: 403 })
    }

    // 2. Fetch Data
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
