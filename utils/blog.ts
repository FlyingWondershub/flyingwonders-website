import { createClient } from 'next-sanity'
import { dataset, projectId, apiVersion } from '../sanity/env'
import { urlForImage } from '../sanity/lib/image'

export interface BlogPost {
  id: string
  title: string
  slug: string
  category: string
  date: string
  author: string
  readTime: string
  imageUrl: string
  excerpt: string
  content: string
  tags?: string[]
  seoDescription?: string
}

function getSanityClient() {
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_READ_TOKEN,
  })
}

function enrichArticle(a: any): BlogPost {
  const cleanTitle = (a.title || '').replace(/\s*\([A-Z0-9]{3,6}\)\s*$/i, '').trim()
  
  let resolvedImage = null
  if (a.coverImage?.asset) {
    try {
      resolvedImage = urlForImage(a.coverImage)?.auto('format').width(1200).url()
    } catch (err) {
      resolvedImage = null
    }
  }
  if (!resolvedImage) {
    resolvedImage = a.imageUrl || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop'
  }

  const slug = typeof a.slug === 'object' && a.slug !== null ? a.slug.current : a.slug

  return {
    id: a._id || a.id || slug,
    title: cleanTitle || a.title || 'Singapore Travel Story',
    slug,
    category: a.category || 'Sightseeing',
    date: a.date || (a._createdAt ? a._createdAt.split('T')[0] : '2026-08-25'),
    author: a.author || 'Aditya Sharma',
    readTime: a.readTime ?? `${Math.max(3, Math.ceil((a.content?.split(/\s+/).length || 0) / 200))} min read`,
    imageUrl: resolvedImage,
    excerpt: a.excerpt || a.seoDescription || 'Comprehensive Singapore travel guide from Flying Wonders DMC experts.',
    content: a.content || '',
    tags: a.tags || [],
    seoDescription: a.seoDescription || a.excerpt || '',
  }
}

export async function getAllBlogArticles(): Promise<BlogPost[]> {
  try {
    const client = getSanityClient()
    const articles = await client.fetch('*[_type == "blogPost" && isPublished == true] | order(date desc)')
    
    if (!Array.isArray(articles)) return []

    const seenTitles = new Set<string>()
    const result: BlogPost[] = []

    for (const a of articles) {
      const cleanTitle = (a.title || '').replace(/\s*\([A-Z0-9]{3,6}\)\s*$/i, '').trim().toLowerCase()
      if (seenTitles.has(cleanTitle)) continue
      seenTitles.add(cleanTitle)
      result.push(enrichArticle(a))
    }

    return result
  } catch (err) {
    console.error('Error fetching all blog articles:', err)
    return []
  }
}

export async function getBlogArticleBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const client = getSanityClient()
    const article = await client.fetch(
      '*[_type == "blogPost" && slug.current == $slug && isPublished == true][0]',
      { slug }
    )

    if (!article) return null
    return enrichArticle(article)
  } catch (err) {
    console.error(`Error fetching blog article for slug ${slug}:`, err)
    return null
  }
}

export async function getAllBlogSlugs(): Promise<string[]> {
  try {
    const client = getSanityClient()
    const slugs = await client.fetch('*[_type == "blogPost" && isPublished == true].slug.current')
    if (!Array.isArray(slugs)) return []
    return slugs.filter(Boolean)
  } catch (err) {
    console.error('Error fetching blog slugs:', err)
    return []
  }
}
