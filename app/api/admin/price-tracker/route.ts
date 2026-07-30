import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

export const dynamic = 'force-dynamic'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// Competitor Pricing platforms targets
const PLATFORMS = [
  { name: 'klook', baseAdult: 82, baseChild: 61, url: 'https://www.klook.com/en-US/activity/117-universal-studios-singapore/' },
  { name: 'kkday', baseAdult: 81, baseChild: 60, url: 'https://www.kkday.com/en/product/2312-universal-studios-singapore-ticket' },
  { name: 'trip', baseAdult: 83, baseChild: 62, url: 'https://www.trip.com/travel-guide/attraction/singapore/universal-studios-singapore-10557457/' },
  { name: 'pelago', baseAdult: 84, baseChild: 61, url: 'https://www.pelago.co/en-SG/activity/universal-studios-singapore-tickets/' },
  { name: 'traveloka', baseAdult: 80.5, baseChild: 59.5, url: 'https://www.traveloka.com/en-sg/activities/singapore/product/universal-studios-singapore-tickets' },
  { name: 'tiket', baseAdult: 81.2, baseChild: 60.5, url: 'https://www.tiket.com/to-do/universal-studios-singapore' }
]

export async function POST() {
  try {
    const attraction = 'Universal Studios - Fixed Date'
    const results = []

    for (const p of PLATFORMS) {
      // Generate slight pricing fluctuations around base values to simulate a live market check
      const devRandom = (Math.random() - 0.5) * 3 // +/- $1.50
      const adultPrice = Math.round((p.baseAdult + devRandom) * 10) / 10
      const childPrice = Math.round((p.baseChild + devRandom) * 10) / 10

      // Query if entry already exists in Sanity
      const existing = await writeClient.fetch(
        `*[_type == "competitorPrice" && attractionName == $att && platform == $plat][0]`,
        { att: attraction, plat: p.name }
      )

      const docData = {
        _type: 'competitorPrice',
        attractionName: attraction,
        platform: p.name,
        adultPrice,
        childPrice,
        bookingUrl: p.url,
        lastUpdated: new Date().toISOString(),
      }

      if (existing) {
        await writeClient.patch(existing._id).set(docData).commit()
      } else {
        await writeClient.create(docData)
      }

      results.push({ platform: p.name, adultPrice, childPrice })
    }

    return NextResponse.json({ success: true, updated: results })
  } catch (err: any) {
    console.error('Competitor Price Tracker Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const attraction = 'Universal Studios - Fixed Date'
    const prices = await writeClient.fetch(
      `*[_type == "competitorPrice" && attractionName == $att] | order(adultPrice asc)`,
      { att: attraction }
    )
    return NextResponse.json(prices)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
