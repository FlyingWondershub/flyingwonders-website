import { createClient } from 'next-sanity'
import { dataset, projectId, apiVersion } from '@/sanity/env'
import path from 'path'
import fs from 'fs'

/**
 * Simple migration script to import existing local blog articles (data/blog_articles.json)
 * into Sanity as `blogPost` documents.
 *
 * Run with: `node scripts/seed-blogs.ts`
 */

async function main() {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN,
  })

  const localFile = path.join(process.cwd(), 'data', 'blog_articles.json')
  if (!fs.existsSync(localFile)) {
    console.error('Local blog data file not found:', localFile)
    process.exit(1)
  }

  const raw = fs.readFileSync(localFile, 'utf-8')
  const articles: any[] = JSON.parse(raw)

  for (const article of articles) {
    // Build slug object for Sanity
    const slugObj = { _type: 'slug', current: article.slug }
    const doc = {
      _type: 'blogPost',
      title: article.title,
      slug: slugObj,
      category: article.category ?? 'Travel',
      author: article.author ?? 'Flying Wonders',
      date: article.date ?? new Date().toISOString().split('T')[0],
      readTime: article.readTime ?? `${Math.ceil((article.content?.split(/\\s+/).length || 0) / 200)} min read`,
      imageUrl: article.imageUrl ?? 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop',
      excerpt: article.excerpt ?? '',
      content: article.content ?? '',
      isFeatured: false,
      isPublished: true,
      viewCount: 0,
      tags: article.tags ?? [],
      seoDescription: article.excerpt ?? '',
    }

    try {
      // Use the slug as an id for deterministic upserts
      const id = `blog-${article.slug}`
      await client.createOrReplace({ _id: id, ...doc })
      console.log(`✅ Imported: ${article.title}`)
    } catch (err) {
      console.error(`❌ Failed to import ${article.title}:`, err)
    }
  }

  console.log('✅ Migration completed.')
}

main().catch(e => {
  console.error('Unexpected error:', e)
  process.exit(1)
})
