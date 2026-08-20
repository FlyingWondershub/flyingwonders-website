import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { dataset, projectId, apiVersion } from '../../../../sanity/env';

// 30+ Singapore-focused templates (abbreviated example; add more as needed)
const TEMPLATE_POOL = [
  {
    title: 'Chinatown Heritage Walk: Temples & Tea Houses',
    slug: 'chinatown-heritage-walk-singapore',
    category: 'sightseeing',
    author: 'Aditya Sharma',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1543872084-c7bd3822856f?w=800&auto=format&fit=crop',
    excerpt: "Take an afternoon to stroll down Chinatown Pagoda street, discovering historic Buddhist temples and traditional tea ceremonies.",
    content: `Chinatown is one of Singapore's most vibrant districts, combining heritage architecture with modern trendy cafes. Here is your self‑guided walk map:

### 1. Buddha Tooth Relic Temple
A magnificent Tang‑style temple housing a sacred relic. Admission is free, but dress respectfully.

### 2. Chinatown Heritage Centre
Located inside restored shophouses, this museum offers an immersive glimpse into early immigrant lives.

### 3. Traditional Tea Tasting
Stop by Pek Sin Choon tea merchant, established in 1925, to experience authentic Chinese tea brewing.`
  },
  {
    title: 'Sentosa Beach Day Guide',
    slug: 'sentosa-beach-day-guide',
    category: 'day-trips',
    author: 'Maya Tan',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-8cf4f44b2a0a?w=800&auto=format&fit=crop',
    excerpt: "Relax on Sentosa's golden sands, try water sports, and enjoy beachfront dining.",
    content: `Sentosa offers a variety of beaches each with its own vibe.

### 1. Siloso Beach
Popular for beach volleyball and night parties.

### 2. Palawan Beach
Family‑friendly with a playground and shallow waters.

### 3. Tanjong Beach
Ideal for sunset drinks and a relaxed atmosphere.`
  }
]

export async function GET() {
  try {
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: process.env.SANITY_WRITE_TOKEN,
    })

    // Pick a random template
    const tmpl = TEMPLATE_POOL[Math.floor(Math.random() * TEMPLATE_POOL.length)]
    const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const today = new Date().toISOString().split('T')[0]

    const newDoc = {
      _type: 'blogPost',
      title: `${tmpl.title} (${uniqueSuffix})`,
      slug: { _type: 'slug', current: `${tmpl.slug}-${uniqueSuffix.toLowerCase()}` },
      category: tmpl.category,
      author: tmpl.author,
      date: today,
      readTime: tmpl.readTime,
      imageUrl: tmpl.imageUrl,
      excerpt: tmpl.excerpt,
      content: tmpl.content,
      isFeatured: false,
      isPublished: true,
      viewCount: 0,
      tags: [],
      seoDescription: tmpl.excerpt,
    }

    const created = await client.create(newDoc)

    return NextResponse.json({ success: true, message: 'Generated new blog post', generated: created.title })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Auto‑publish failed' })
  }
}
