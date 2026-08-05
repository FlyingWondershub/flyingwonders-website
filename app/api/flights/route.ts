import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const flightIata = searchParams.get('flight_iata')?.trim().toUpperCase()
  const airportIata = searchParams.get('airport_iata')?.trim().toUpperCase() || 'SIN'
  const mode = searchParams.get('mode') || 'flight' // 'flight' | 'schedules'

  const apiKey = process.env.AIRLABS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ 
      error: 'AirLabs API key not configured in server environment variables.',
      demo: true 
    }, { status: 200 })
  }

  try {
    if (mode === 'schedules') {
      // Fetch Changi / Airport Schedules
      const res = await fetch(
        `https://airlabs.co/api/v9/schedules?arr_iata=${airportIata}&api_key=${apiKey}`,
        { next: { revalidate: 60 } }
      )
      const data = await res.json()
      return NextResponse.json(data)
    }

    if (!flightIata) {
      return NextResponse.json({ error: 'Flight number (IATA code) is required.' }, { status: 400 })
    }

    // Clean flight number format (e.g. "SQ 423" -> "SQ423")
    const cleanFlight = flightIata.replace(/\s+/g, '')

    // Call AirLabs Real-Time Flight API
    const res = await fetch(
      `https://airlabs.co/api/v9/flight?flight_iata=${cleanFlight}&api_key=${apiKey}`,
      { next: { revalidate: 30 } }
    )

    const data = await res.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message || 'Flight data not found on AirLabs.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: data.response
    })

  } catch (err: any) {
    console.error('AirLabs API Route Error:', err)
    return NextResponse.json({ error: 'Failed to fetch live flight data from AirLabs.' }, { status: 500 })
  }
}
