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

  // Ensure readTime is populated
  const enriched = articles.map((a: any) => ({
    ...a,
    readTime: a.readTime ?? `${Math.ceil((a.content?.split(/\\s+/).length || 0) / 200)} min read`,
  }))

  return NextResponse.json({ success: true, articles: enriched })
}
