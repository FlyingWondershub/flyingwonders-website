import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const TEMP_POSTS_POOL = [
  {
    title: "Chinatown Heritage Walk: Temples & Tea Houses",
    slug: "chinatown-heritage-walk-singapore",
    category: "Sightseeing",
    author: "Aditya Sharma",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1543872084-c7bd3822856f?w=800&auto=format&fit=crop",
    excerpt: "Take an afternoon to stroll down Chinatown Pagoda street, discovering historic Buddhist temples and traditional tea ceremonies.",
    content: "Chinatown is one of Singapore\'s most vibrant districts, combining heritage architecture with modern trendy cafes. Here is your self-guided walk map:\n\n### 1. Buddha Tooth Relic Temple\nA magnificent Tang-style temple housing a sacred relic. Admission is free, but dress respectfully.\n\n### 2. Chinatown Heritage Centre\nLocated inside restored shophouses, this museum offers an immersive glimpse into early immigrant lives.\n\n### 3. Traditional Tea Tasting\nStop by Pek Sin Choon tea merchant, established in 1925, to experience authentic Chinese tea brewing."
  },
  {
    title: "Sentosa Island Beach Clubs: Where to Relax",
    slug: "sentosa-beach-clubs-guide",
    category: "Travel Hacks",
    author: "Priya Patel",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
    excerpt: "Sip mocktails and catch the sunset at Singapore's premier coastal club destinations along Siloso Beach.",
    content: "Sentosa Island is home to some of Asia\'s best beach clubs, perfect for groups, couples, and solo travelers alike.\n\n### 1. Tanjong Beach Club\nKnown for its laid-back atmosphere, pool table, and weekend DJ sets. Best for a lazy Sunday brunch.\n\n### 2. Rumours Beach Club\nThe only beach club in Singapore with three swimming pools. Great for parties and sunsets."
  },
  {
    title: "Singapore MRT Guide: Travel Like a Pro",
    slug: "singapore-mrt-travel-guide",
    category: "Travel Hacks",
    author: "Rohan Mehta",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop",
    excerpt: "A beginner's roadmap to navigating Singapore's ultra-efficient Mass Rapid Transit rail network.",
    content: "Singapore\'s MRT is clean, fast, and covers almost the entire city-state. Here is everything you need to know:\n\n### 1. Payment Methods\nYou don't need a special tourist card; simply tap your contact-less Visa or Mastercard at the gantry!\n\n### 2. Peak Hours\nAvoid traveling between 8:00 AM - 9:00 AM and 6:00 PM - 7:00 PM to skip the heavy local commute."
  }
]

export async function GET() {
  try {
    const localFilePath = path.join(process.cwd(), 'data', 'blog_articles.json')
    let currentArticles: any[] = []
    
    if (fs.existsSync(localFilePath)) {
      const data = fs.readFileSync(localFilePath, 'utf8')
      currentArticles = JSON.parse(data)
    }

    // Pick 1 random article from pool for the 15-minute schedule run
    const randomTemplate = TEMP_POSTS_POOL[Math.floor(Math.random() * TEMP_POSTS_POOL.length)]
    
    const uniqueSuffix = Math.random().toString(36).substring(2, 6)
    const dateToday = new Date().toISOString().split('T')[0]
    
    const newArticle = {
      id: `ai-${Date.now()}-${uniqueSuffix}`,
      title: `${randomTemplate.title} (${uniqueSuffix.toUpperCase()})`,
      slug: `${randomTemplate.slug}-${uniqueSuffix}`,
      category: randomTemplate.category,
      date: dateToday,
      author: randomTemplate.author,
      readTime: randomTemplate.readTime,
      imageUrl: randomTemplate.imageUrl,
      excerpt: randomTemplate.excerpt,
      content: randomTemplate.content
    }

    const updatedList = [newArticle, ...currentArticles]
    fs.writeFileSync(localFilePath, JSON.stringify(updatedList, null, 2), 'utf8')

    return NextResponse.json({ 
      success: true, 
      message: "Successfully generated and published 1 new travel article!",
      generated: newArticle.title
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Auto-publish failed' })
  }
}
