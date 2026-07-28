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
    const cookieStore = await cookies()
    const sessionEmail = cookieStore.get('attractions_session')?.value

    if (!sessionEmail) {
      return NextResponse.json({ authenticated: false })
    }

    const user = await readClient.fetch(
      `*[_type == "attractionsUser" && email == $email && isApproved == true][0]`,
      { email: sessionEmail }
    )

    if (!user) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        name: user.name,
        email: user.email,
        company: user.company,
      },
    })
  } catch (err: any) {
    console.error('Session Check Error:', err)
    return NextResponse.json({ authenticated: false })
  }
}
