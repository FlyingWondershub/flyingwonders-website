import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 1 minute

interface BorderData {
  timestamp: string
  woodlands: {
    name: string
    status: 'clear' | 'moderate' | 'heavy'
    statusLabel: string
    statusColor: string
    estimatedMins: string
    cameraUrl: string
  }
  tuas: {
    name: string
    status: 'clear' | 'moderate' | 'heavy'
    statusLabel: string
    statusColor: string
    estimatedMins: string
    cameraUrl: string
  }
}

export async function GET() {
  try {
    const timestampStr = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit', hour12: true })
    
    // Default fallback image URLs
    let woodlandsCamera = 'https://images.gothere.sg/traffic/2701.jpg'
    let tuasCamera = 'https://images.gothere.sg/traffic/4703.jpg'

    // Fetch official Singapore Gov (api.data.gov.sg) live HD traffic camera feeds
    try {
      const govRes = await fetch('https://api.data.gov.sg/v1/transport/traffic-images', {
        next: { revalidate: 60 },
        headers: { 'User-Agent': 'FlyingWonders/1.0' }
      })
      if (govRes.ok) {
        const govJson = await govRes.json()
        const cameras = govJson.items?.[0]?.cameras || []
        const woodCamObj = cameras.find((c: any) => c.camera_id === '2701' || c.camera_id === '2702' || c.camera_id === '2704')
        const tuasCamObj = cameras.find((c: any) => c.camera_id === '4703' || c.camera_id === '4712' || c.camera_id === '4713')
        if (woodCamObj?.image) woodlandsCamera = woodCamObj.image
        if (tuasCamObj?.image) tuasCamera = tuasCamObj.image
      }
    } catch (e) {
      console.warn('Failed to fetch data.gov.sg traffic camera feeds:', e)
    }

    // Calculate current traffic intensity based on Singapore Peak Traffic Hours
    const nowSg = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' }))
    const hour = nowSg.getHours()
    const day = nowSg.getDay() // 0 = Sun, 5 = Fri, 6 = Sat

    let woodlandsStatus: 'clear' | 'moderate' | 'heavy' = 'clear'
    let tuasStatus: 'clear' | 'moderate' | 'heavy' = 'clear'
    let woodlandsMins = '15 – 25 mins'
    let tuasMins = '10 – 15 mins'

    // Peak hours: Fri evening (entering MY), Sun evening (entering SG), daily 7-9 AM & 6-8 PM
    if ((day === 5 && hour >= 16 && hour <= 22) || (day === 0 && hour >= 15 && hour <= 22)) {
      woodlandsStatus = 'heavy'
      tuasStatus = 'moderate'
      woodlandsMins = '45 – 75 mins'
      tuasMins = '25 – 40 mins'
    } else if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20)) {
      woodlandsStatus = 'moderate'
      tuasStatus = 'clear'
      woodlandsMins = '25 – 40 mins'
      tuasMins = '15 – 25 mins'
    }

    const data: BorderData = {
      timestamp: `${timestampStr} SGT`,
      woodlands: {
        name: 'Woodlands Causeway Checkpoint (SG ⇄ MY)',
        status: woodlandsStatus,
        statusLabel: woodlandsStatus === 'clear' ? 'Smooth / Clear Traffic 🟢' : (woodlandsStatus === 'moderate' ? 'Moderate Traffic 🟡' : 'Heavy Border Traffic 🔴'),
        statusColor: woodlandsStatus === 'clear' ? '#059669' : (woodlandsStatus === 'moderate' ? '#D97706' : '#DC2626'),
        estimatedMins: woodlandsMins,
        cameraUrl: woodlandsCamera
      },
      tuas: {
        name: 'Tuas Second Link Checkpoint (SG ⇄ MY)',
        status: tuasStatus,
        statusLabel: tuasStatus === 'clear' ? 'Smooth / Clear Traffic 🟢' : (tuasStatus === 'moderate' ? 'Moderate Traffic 🟡' : 'Heavy Border Traffic 🔴'),
        statusColor: tuasStatus === 'clear' ? '#059669' : (tuasStatus === 'moderate' ? '#D97706' : '#DC2626'),
        estimatedMins: tuasMins,
        cameraUrl: tuasCamera
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch live border traffic data.' })
  }
}
