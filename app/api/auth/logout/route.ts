import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  
  // Clear via next/headers cookieStore
  cookieStore.set('b2b_session', '', { path: '/', maxAge: 0, expires: new Date(0), httpOnly: true, sameSite: 'lax' })
  cookieStore.set('attractions_session', '', { path: '/', maxAge: 0, expires: new Date(0), httpOnly: true, sameSite: 'lax' })
  cookieStore.delete('b2b_session')
  cookieStore.delete('attractions_session')

  const response = NextResponse.json({ success: true })
  
  // Set explicit Set-Cookie response headers for maximum browser compatibility
  response.headers.append('Set-Cookie', 'b2b_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax')
  response.headers.append('Set-Cookie', 'attractions_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax')

  return response
}
