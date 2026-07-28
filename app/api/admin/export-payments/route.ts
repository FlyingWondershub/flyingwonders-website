import { NextResponse } from 'next/server'
import { client } from '../../../../sanity/lib/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
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
