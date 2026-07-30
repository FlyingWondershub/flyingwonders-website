import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { cookies } from 'next/headers'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

export const dynamic = 'force-dynamic'

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
    const agents = await readClient.fetch(`*[_type == "b2bAgent"] | order(_createdAt desc) {
      companyName,
      agentName,
      email,
      phone,
      isActive,
      _createdAt
    }`)

    // Generate CSV Content
    const headers = ['Company Name', 'Agent Name', 'Email', 'Phone', 'Is Active', 'Registered At']
    const rows = agents.map((a: any) => [
      `"${(a.companyName || '').replace(/"/g, '""')}"`,
      `"${(a.agentName || '').replace(/"/g, '""')}"`,
      `"${a.email || ''}"`,
      `"${a.phone || ''}"`,
      a.isActive ? 'Active' : 'Inactive',
      a._createdAt ? new Date(a._createdAt).toISOString() : ''
    ])

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\r\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="b2b_agent_accounts.csv"',
      },
    })
  } catch (err: any) {
    console.error('Export error:', err)
    return NextResponse.json({ error: err.message || 'Failed to export agents' }, { status: 500 })
  }
}
