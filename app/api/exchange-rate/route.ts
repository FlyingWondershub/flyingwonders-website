import { NextResponse } from 'next/server'
import { getLiveExchangeRate } from '../../../utils/exchange'

export const revalidate = 60 // Revalidate cache

export async function GET() {
  try {
    const rate = await getLiveExchangeRate()
    return NextResponse.json({ rate }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (err: any) {
    return NextResponse.json({ rate: 74.81, error: err.message || 'Failed to fetch exchange rate' }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  }
}
