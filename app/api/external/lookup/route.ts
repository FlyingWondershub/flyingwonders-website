import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, ...params } = body

    const baseUrl = process.env.DMCQUOTE_API_BASE_URL || 'https://dmcquote.com/b2b/api/external/v1'
    const apiKey = process.env.DMCQUOTE_API_KEY || 'b2b_BXHjj22isxNfiAAItTnt59LDCyAN'

    let url = ''
    let options: RequestInit = {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    }

    if (type === 'destinations') {
      url = `${baseUrl}/hotels/destinations`
    } else if (type === 'zones') {
      url = `${baseUrl}/transfers/zones`
    } else if (type === 'tours') {
      const cityId = params.city_id || '1'
      url = `${baseUrl}/tours/search?city_id=${cityId}`
    } else if (type === 'transfers') {
      const { from_zone_id, to_zone_id, date } = params
      url = `${baseUrl}/transfers/search?from_zone_id=${from_zone_id}&to_zone_id=${to_zone_id}&date=${date}`
    } else if (type === 'hotels') {
      url = `${baseUrl}/hotels/search`
      options = {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          city_id: params.city_id,
          check_in: params.check_in,
          check_out: params.check_out,
          adults: params.adults,
          children: params.children || 0,
          rooms: params.rooms || 1
        })
      }
    } else {
      return NextResponse.json({ error: 'Invalid search type specified.' }, { status: 400 })
    }

    console.log(`Proxying external API call: ${url} (Method: ${options.method})`)
    const res = await fetch(url, options)
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.error || 'External API request failed' }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('API Proxy Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
