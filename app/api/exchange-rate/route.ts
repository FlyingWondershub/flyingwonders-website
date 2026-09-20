import { NextResponse } from 'next/server'
import { getExchangeRateDetails } from '../../../utils/exchange'

export const revalidate = 60 // Revalidate cache

export async function GET() {
  try {
    const details = await getExchangeRateDetails()
    return NextResponse.json({ 
      rate: details.rate,
      sgdToInr: details.rate,
      baseRate: details.baseRate,
      markupType: details.markupType,
      markupValue: details.markupValue,
      isManualOverride: details.isManualOverride
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (err: any) {
    return NextResponse.json({ 
      rate: 78.31,
      sgdToInr: 78.31,
      baseRate: 74.81,
      markupType: 'absolute',
      markupValue: 3.5,
      isManualOverride: false,
      error: err.message || 'Failed to fetch exchange rate' 
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  }
}

