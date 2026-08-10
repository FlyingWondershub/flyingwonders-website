import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id') || '2701'

  // Singapore LTA Datamall official camera IDs:
  // 2701 = Woodlands Causeway (BTI/Checkpoint)
  // 4703 = Tuas Second Link Checkpoint
  const cameraUrls: Record<string, string> = {
    '2701': 'https://images.gothere.sg/traffic/2701.jpg',
    '4703': 'https://images.gothere.sg/traffic/4703.jpg'
  }

  const targetUrl = cameraUrls[id] || cameraUrls['2701']

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://gothere.sg/'
      },
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch camera image: ${res.status}`)
    }

    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (err) {
    // If external fetch fails, redirect to fallback stable image
    return NextResponse.redirect(targetUrl, { status: 302 })
  }
}
