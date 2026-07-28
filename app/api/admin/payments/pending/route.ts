import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { cookies } from 'next/headers'
import { apiVersion, dataset, projectId } from '../../../../../sanity/env'

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
  const email = sessionCookie.value
  const isAdminCount = await readClient.fetch(`count(*[_type == "adminUser" && email == $email])`, { email })
  if (email.toLowerCase() !== 'info.flyingwonders@gmail.com' && isAdminCount === 0) return false
  return true
}

export async function GET() {
  if (!(await verifyAdmin())) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const payments = await readClient.fetch(`*[_type == "manualPayment" && status == "pending_verification"] | order(_createdAt desc){
      _id,
      bookingReference,
      guestName,
      email,
      phone,
      amountSgd,
      amountInr,
      utrNumber,
      status,
      submittedAt
    }`)
    
    return NextResponse.json(payments)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
