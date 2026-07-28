import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { client } from '../../../../sanity/lib/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // 1. Verify Admin Authentication
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('b2b_session')
    
    if (!sessionCookie || !sessionCookie.value) {
      return new NextResponse('Unauthorized - Please log in', { status: 401 })
    }
    
    const email = sessionCookie.value
    const isAdminCount = await client.fetch(`count(*[_type == "adminUser" && email == $email])`, { email })
    
    if (email.toLowerCase() !== 'info.flyingwonders@gmail.com' && isAdminCount === 0) {
      return new NextResponse('Forbidden - Admin access required', { status: 403 })
    }

    // 2. Fetch Data
    const payments = await client.fetch(`*[_type == "manualPayment"] | order(_createdAt desc){
      bookingReference,
      guestName,
      email,
      phone,
      amountSgd,
      amountInr,
      exchangeRateUsed,
      utrNumber,
      status,
      submittedAt
    }`)

    const headers = [
      'Booking Reference',
      'Guest/Agent Name',
      'Email',
      'Phone',
      'Amount (SGD)',
      'Amount Paid (INR)',
      'Applied Rate (INR/SGD)',
      'UTR Number',
      'Status',
      'Submission Timestamp'
    ]

    const csvRows = [headers.join(',')]

    for (const p of payments || []) {
      const row = [
        `"${p.bookingReference || ''}"`,
        `"${(p.guestName || '').replace(/"/g, '""')}"`,
        `"${(p.email || '').replace(/"/g, '""')}"`,
        `"${(p.phone || '').replace(/"/g, '""')}"`,
        p.amountSgd || 0,
        p.amountInr || 0,
        p.exchangeRateUsed || 0,
        `"${(p.utrNumber || '').replace(/"/g, '""')}"`,
        `"${p.status || 'pending_verification'}"`,
        `"${p.submittedAt ? new Date(p.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''}"`
      ]
      csvRows.push(row.join(','))
    }

    const csvContent = csvRows.join('\n')

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="flying_wonders_payments_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error: any) {
    console.error('Error exporting payments:', error)
    return NextResponse.json({ error: error.message || 'Failed to export payments' }, { status: 500 })
  }
}
