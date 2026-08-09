import { NextResponse } from 'next/server'

export async function GET() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-3967023851392009'
  
  // Format standard Google AdSense ads.txt line
  const cleanPubId = publisherId.replace('ca-pub-', '')
  const adsTxtContent = `# Flying Wonders Official ads.txt
google.com, pub-${cleanPubId}, DIRECT, f08c47fec0942fa0
`

  return new NextResponse(adsTxtContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
