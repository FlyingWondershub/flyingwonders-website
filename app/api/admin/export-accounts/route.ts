import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { client } from '../../../../sanity/lib/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
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

    const proposals = await client.fetch(`*[_type == "proposal"] | order(_createdAt desc){
      proposalNumber,
      invoiceNumber,
      invoiceDate,
      guestName,
      guestPhone,
      status,
      totalClientPrice,
      paymentLedger,
      additionalCharges,
      agent->{
        agentName,
        companyName,
        email
      },
      _createdAt
    }`)

    const headers = [
      'Invoice Number',
      'Proposal Ref',
      'Guest Name',
      'Guest Contact',
      'Agent / Company',
      'Package Status',
      'Base Price (SGD)',
      'Change Orders / Add-Ons (SGD)',
      'Total Adjusted Contract Price (SGD)',
      'Payments Collected (SGD)',
      'Outstanding Balance Due (SGD)',
      'Settlement Status',
      'Invoice Date',
      'Created Date'
    ]

    const csvRows = [headers.join(',')]

    for (const p of proposals || []) {
      const basePrice = Number(p.totalClientPrice || p.costBreakdown?.totalClientPrice) || 0
      const totalAddons = (p.additionalCharges || []).reduce((sum: number, c: any) => {
        const amt = Number(c.amount) || 0
        return (c.chargeType === 'Discount' || c.chargeType === 'Refund') ? sum - amt : sum + amt
      }, 0)
      const adjustedPrice = basePrice + totalAddons
      const totalPaid = (p.paymentLedger || []).reduce((sum: number, pay: any) => sum + (Number(pay.amount) || 0), 0)
      const balanceDue = Math.max(0, adjustedPrice - totalPaid)

      let settlementStatus = 'Unpaid'
      if (totalPaid >= adjustedPrice && adjustedPrice > 0) {
        settlementStatus = 'Fully Settled'
      } else if (totalPaid > 0) {
        settlementStatus = 'Partially Paid'
      }

      const agentCompany = p.agent?.companyName || p.agent?.agentName || 'B2C Direct'

      const row = [
        `"${(p.invoiceNumber || '').replace(/"/g, '""')}"`,
        `"${(p.proposalNumber || '').replace(/"/g, '""')}"`,
        `"${(p.guestName || '').replace(/"/g, '""')}"`,
        `"${(p.guestPhone || '').replace(/"/g, '""')}"`,
        `"${agentCompany.replace(/"/g, '""')}"`,
        `"${(p.status || 'pending').toUpperCase()}"`,
        basePrice,
        totalAddons,
        adjustedPrice,
        totalPaid,
        balanceDue,
        `"${settlementStatus}"`,
        `"${p.invoiceDate || ''}"`,
        `"${p._createdAt ? new Date(p._createdAt).toISOString().split('T')[0] : ''}"`
      ]
      csvRows.push(row.join(','))
    }

    const csvContent = csvRows.join('\n')

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="flying_wonders_accounts_ledger_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error: any) {
    console.error('Error exporting accounts ledger:', error)
    return NextResponse.json({ error: error.message || 'Failed to export accounts ledger' }, { status: 500 })
  }
}
