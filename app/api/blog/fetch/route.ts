import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    let googleArticles: any[] = []
    
    // 1. Try fetching from published Google Sheets
    try {
      const res = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQlNHAbUt7ldY7my-EXF1VZq4s2eQ7y3YzZm8z6vFLfUH4KYKHw3G03FK60DlgQ_fGUN1Hz1qIBFqUT/pub?output=xlsx', {
        next: { revalidate: 60 } // Cache for 1 minute
      })
      if (res.ok) {
        const buffer = await res.arrayBuffer()
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })
        const blogSheet = workbook.Sheets['Blog']
        if (blogSheet) {
          const rows: any[] = XLSX.utils.sheet_to_json(blogSheet)
          googleArticles = rows.map((row, idx) => ({
            id: `gs-${idx}`,
            title: row['Title'] || '',
            slug: row['Slug'] || '',
            category: row['Category'] || 'Travel',
            date: row['Date'] || new Date().toISOString().split('T')[0],
            author: row['Author'] || 'Flying Wonders Spec',
            readTime: row['Read Time'] || '5 min read',
            imageUrl: row['Image URL'] || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop',
            excerpt: row['Excerpt'] || '',
            content: row['Content'] || ''
          })).filter(a => a.title && a.slug)
        }
      }
    } catch (e) {
      console.warn('Google sheets blog fetch skipped or failed, falling back to local file. Error:', e)
    }

    // 2. Read local blog data
    const localFilePath = path.join(process.cwd(), 'data', 'blog_articles.json')
    let localArticles: any[] = []
    if (fs.existsSync(localFilePath)) {
      const localData = fs.readFileSync(localFilePath, 'utf8')
      localArticles = JSON.parse(localData)
    }

    // 3. Merge lists, removing duplicates by slug (prioritize Google Sheets)
    const allArticles = [...googleArticles]
    localArticles.forEach(localArt => {
      if (!allArticles.some(a => a.slug === localArt.slug)) {
        allArticles.push(localArt)
      }
    })

    // Sort by date descending
    allArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ success: true, articles: allArticles })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' })
  }
}
