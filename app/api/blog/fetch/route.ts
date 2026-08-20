import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { dataset, projectId, apiVersion } from '../../../../sanity/env';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const q = searchParams.get('search')

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_READ_TOKEN,
  })

  let query = '*[_type == "blogPost" && isPublished == true]'
  const params: Record<string, any> = {}
  if (category) {
    query += ' && category == $category'
    params.category = category
  }
  if (q) {
    query += ' && (title match $search* || content match $search*)'
    params.search = q
  }

  const articles = await client.fetch(query, params)

  // Ensure clean title, deduplicate identical titles, readTime, and flat slug string
  const seenTitles = new Set<string>()
  const enriched: any[] = []

  for (const a of articles) {
    const cleanTitle = (a.title || '').replace(/\s*\([A-Z0-9]{3,6}\)\s*$/i, '').trim()
    
    // Skip duplicates of the same article title to keep the blog feed clean & diverse
    if (seenTitles.has(cleanTitle.toLowerCase())) {
      continue
    }
    seenTitles.add(cleanTitle.toLowerCase())

    enriched.push({
      ...a,
      id: a._id || a.id,
      title: cleanTitle || a.title,
      slug: typeof a.slug === 'object' && a.slug !== null ? a.slug.current : a.slug,
      imageUrl: a.imageUrl || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop',
      readTime: a.readTime ?? `${Math.ceil((a.content?.split(/\s+/).length || 0) / 200)} min read`,
    })
  }

  return NextResponse.json({ success: true, articles: enriched })
}
