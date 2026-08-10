import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 900 // Cache for 15 minutes

interface NewsItem {
  id: string
  title: string
  link: string
  pubDate: string
  timeAgo: string
  source: string
  category: 'aviation' | 'sea' | 'industry'
  snippet: string
}

function getTimeAgo(dateStr: string): string {
  try {
    const pub = new Date(dateStr).getTime()
    const now = Date.now()
    if (isNaN(pub)) return 'Recently'
    const diffMin = Math.floor((now - pub) / 60000)
    if (diffMin < 60) return `${Math.max(1, diffMin)}m ago`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  } catch (e) {
    return 'Recently'
  }
}

function parseXmlTag(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i')
  const match = xml.match(regex)
  if (!match || !match[1]) return ''
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim()
}

async function fetchRssFeed(url: string, sourceName: string, category: 'aviation' | 'sea' | 'industry'): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 900 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    })
    if (!res.ok) return []
    const xmlText = await res.text()

    const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || xmlText.match(/<entry[\s\S]*?<\/entry>/gi) || []
    const results: NewsItem[] = []

    itemMatches.slice(0, 5).forEach((itemXml, idx) => {
      const title = parseXmlTag(itemXml, 'title') || 'Travel News Update'
      let link = parseXmlTag(itemXml, 'link')
      if (!link) {
        const linkHrefMatch = itemXml.match(/href=["']([^"']+)["']/i)
        link = linkHrefMatch ? linkHrefMatch[1] : '#'
      }
      const pubDate = parseXmlTag(itemXml, 'pubDate') || parseXmlTag(itemXml, 'published') || parseXmlTag(itemXml, 'updated') || new Date().toISOString()
      const desc = parseXmlTag(itemXml, 'description') || parseXmlTag(itemXml, 'summary') || ''
      const cleanSnippet = desc.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim().slice(0, 140)

      if (title && title !== 'Travel News Update') {
        results.push({
          id: `${category}-${idx}-${Date.now()}`,
          title: title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
          link,
          pubDate,
          timeAgo: getTimeAgo(pubDate),
          source: sourceName,
          category,
          snippet: cleanSnippet.length > 0 ? `${cleanSnippet}...` : 'Click to read full story update.'
        })
      }
    })

    return results
  } catch (err) {
    console.warn(`Failed to fetch RSS feed for ${sourceName}:`, err)
    return []
  }
}

export async function GET() {
  try {
    const [aviationNews, seaNews, b2bNews] = await Promise.all([
      fetchRssFeed('https://simpleflying.com/feed/', 'Simple Flying', 'aviation'),
      fetchRssFeed('https://www.straitstimes.com/news/asia/rss.xml', 'Straits Times Asia', 'sea'),
      fetchRssFeed('https://www.travelweekly.com/rss/travel-news', 'Travel Weekly', 'industry')
    ])

    const allNews = [...aviationNews, ...seaNews, ...b2bNews]
    allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

    return NextResponse.json({
      success: true,
      count: allNews.length,
      news: allNews
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to parse travel news.' })
  }
}
