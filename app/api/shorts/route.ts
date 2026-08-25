import { NextResponse } from 'next/server'
import { DEFAULT_SINGAPORE_SHORTS, type TravelShort } from '../../../utils/packages'

function formatViews(viewsStr?: string): string {
  if (!viewsStr) return ''
  const num = parseInt(viewsStr, 10)
  if (isNaN(num)) return viewsStr
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}K views`
  }
  return `${num} views`
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const destination = (searchParams.get('destination') || 'Singapore').trim()
    const apiKey = process.env.YOUTUBE_API_KEY

    // If no API key is provided, return default destination fallback shorts
    if (!apiKey) {
      return NextResponse.json({
        shorts: DEFAULT_SINGAPORE_SHORTS,
        source: 'curated_fallback'
      })
    }

    // 1. Search YouTube for vertical Shorts matching destination
    const query = encodeURIComponent(`${destination} travel #shorts`)
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoDuration=short&order=viewCount&maxResults=8&key=${apiKey}`

    const searchRes = await fetch(searchUrl, {
      next: { revalidate: 86400 }
    })

    if (!searchRes.ok) {
      return NextResponse.json({
        shorts: DEFAULT_SINGAPORE_SHORTS,
        source: 'curated_fallback'
      })
    }

    const searchData = await searchRes.json()
    const videoItems = searchData.items || []

    if (videoItems.length === 0) {
      return NextResponse.json({
        shorts: DEFAULT_SINGAPORE_SHORTS,
        source: 'curated_fallback'
      })
    }

    const videoIds = videoItems.map((item: any) => item.id?.videoId).filter(Boolean).join(',')

    // 2. Fetch statistics (view counts, thumbnails) for discovered videos
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${apiKey}`
    const statsRes = await fetch(statsUrl, {
      next: { revalidate: 86400 }
    })

    if (!statsRes.ok) {
      return NextResponse.json({
        shorts: DEFAULT_SINGAPORE_SHORTS,
        source: 'curated_fallback'
      })
    }

    const statsData = await statsRes.json()

    const liveShorts: TravelShort[] = (statsData.items || []).map((item: any) => {
      const thumbs = item.snippet?.thumbnails
      const thumbnailUrl = thumbs?.maxres?.url || thumbs?.high?.url || thumbs?.medium?.url || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`
      return {
        id: item.id,
        title: item.snippet?.title || `${destination} Travel Experience`,
        creator: item.snippet?.channelTitle || 'Travel Creator',
        views: formatViews(item.statistics?.viewCount),
        thumbnailUrl,
        youtubeVideoId: item.id
      }
    })

    return NextResponse.json({
      shorts: liveShorts.length > 0 ? liveShorts : DEFAULT_SINGAPORE_SHORTS,
      source: 'live_youtube_api'
    })
  } catch (error) {
    console.error('Error fetching YouTube shorts:', error)
    return NextResponse.json({
      shorts: DEFAULT_SINGAPORE_SHORTS,
      source: 'curated_fallback'
    })
  }
}
