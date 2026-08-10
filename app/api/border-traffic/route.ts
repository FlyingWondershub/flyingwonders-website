import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 120 // Cache for 2 minutes

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
    
    // LTA DataMall / Gov.sg official traffic camera feeds via internal proxy (prevents flickering & CORS blocks)
    const woodlandsCamera = '/api/border-traffic/camera?id=2701'
    const tuasCamera = '/api/border-traffic/camera?id=4703'

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
