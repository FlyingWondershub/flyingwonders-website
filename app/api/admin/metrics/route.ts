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

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function verifyAdmin() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('b2b_session')
  if (!sessionCookie?.value) return false
  const email = sessionCookie.value.trim().toLowerCase()
  if (email === 'info.flyingwonders@gmail.com') return true
  const isAdminCount = await readClient.fetch(`count(*[_type == "adminUser" && lower(email) == $email])`, { email })
  return isAdminCount > 0
}

export async function GET() {
  if (!(await verifyAdmin())) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const counts = await readClient.fetch(`{
      "activeAgents": count(*[_type == "b2bAgent" && isActive == true]),
      "pendingPayments": count(*[_type == "manualPayment" && status == "pending_verification"]),
      "totalContacts": count(*[_type == "businessCard"]),
      "totalHotelVouchers": count(*[_type == "hotelVoucher"]),
      "totalConsultingBookings": count(*[_type == "travelConsultingBooking"]),
      "totalAuditLogs": count(*[_type == "auditLog"]),
      "totalProposals": count(*[_type == "proposal"]),
      "pendingApprovals": count(*[_type == "proposal" && statusChangeRequested == true])
    }`)
    
    return NextResponse.json(counts)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
