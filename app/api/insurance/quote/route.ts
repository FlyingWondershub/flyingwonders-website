import { NextRequest, NextResponse } from 'next/server'

interface Traveler {
  age: number
  category?: 'individual' | 'student' | 'senior'
}

interface QuoteRequest {
  destination: string
  startDate: string
  endDate: string
  durationDays: number
  travelers: Traveler[]
  sumInsuredUSD: number
  adventureSports?: boolean
  pedCover?: boolean
  tripCancellationAddon?: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body: QuoteRequest = await req.json()
    const { destination, startDate, endDate, durationDays, travelers, sumInsuredUSD, adventureSports, pedCover, tripCancellationAddon } = body

    const days = Math.max(1, durationDays || 1)
    const travelerList = Array.isArray(travelers) && travelers.length > 0 ? travelers : [{ age: 30 }]

    // Destination multiplier
    let destMultiplier = 1.0
    let destLabel = 'Worldwide'
    if (destination === 'worldwide_with_us_ca') {
      destMultiplier = 1.85
      destLabel = 'Worldwide (incl. USA & Canada)'
    } else if (destination === 'worldwide_without_us_ca') {
      destMultiplier = 1.35
      destLabel = 'Worldwide (excl. USA & Canada)'
    } else if (destination === 'schengen_europe') {
      destMultiplier = 1.25
      destLabel = 'Schengen & European Union (Visa Compliant)'
    } else if (destination === 'asia') {
      destMultiplier = 1.0
      destLabel = 'Asia Pacific & Middle East'
    } else if (destination === 'domestic') {
      destMultiplier = 0.4
      destLabel = 'Domestic Travel (India)'
    }

    // Sum Insured multiplier
    let sumInsuredMultiplier = 1.0
    if (sumInsuredUSD <= 50000) sumInsuredMultiplier = 0.85
    else if (sumInsuredUSD <= 100000) sumInsuredMultiplier = 1.0
    else if (sumInsuredUSD <= 250000) sumInsuredMultiplier = 1.35
    else if (sumInsuredUSD <= 500000) sumInsuredMultiplier = 1.75
    else sumInsuredMultiplier = 2.4

    // Calculate base rate per traveler per day
    const plans = [
      {
        id: 'standard_essential',
        name: 'Standard Essential',
        badge: 'Budget Friendly',
        sumInsured: sumInsuredUSD <= 50000 ? '$50,000' : '$100,000',
        sumInsuredVal: Math.min(sumInsuredUSD, 100000),
        baseRatePerDay: 55,
        deductible: '$100 per claim',
        schengenApproved: true,
        features: [
          { name: 'Emergency Medical & Hospitalization', limit: `Up to $${Math.min(sumInsuredUSD, 100000).toLocaleString()}` },
          { name: 'Emergency Medical Evacuation', limit: 'Up to $25,000' },
          { name: 'Repatriation of Remains', limit: 'Up to $15,000' },
          { name: 'Loss of Checked Baggage', limit: 'Up to $500' },
          { name: 'Delay of Checked Baggage (>12 hrs)', limit: 'Up to $150' },
          { name: 'Loss of Passport & Documents', limit: 'Up to $250' },
          { name: 'Personal Liability', limit: 'Up to $50,000' },
          { name: '24/7 Global Emergency Assistance', limit: 'Included' },
        ],
        highlightColor: 'from-blue-600 to-indigo-700',
      },
      {
        id: 'silver_comprehensive',
        name: 'Silver Comprehensive',
        badge: 'Most Popular',
        popular: true,
        sumInsured: `$${sumInsuredUSD.toLocaleString()}`,
        sumInsuredVal: sumInsuredUSD,
        baseRatePerDay: 85,
        deductible: '$50 per claim',
        schengenApproved: true,
        features: [
          { name: 'Emergency Medical & Hospitalization', limit: `Up to $${sumInsuredUSD.toLocaleString()}` },
          { name: 'Emergency Medical Evacuation & Rescue', limit: 'Up to $50,000' },
          { name: 'Repatriation of Mortal Remains', limit: 'Up to $25,000' },
          { name: 'Trip Cancellation & Interruption', limit: 'Up to $1,500' },
          { name: 'Trip Delay (>6 hrs)', limit: 'Up to $300' },
          { name: 'Loss of Checked Baggage', limit: 'Up to $1,000' },
          { name: 'Delay of Checked Baggage (>8 hrs)', limit: 'Up to $250' },
          { name: 'Loss of Passport / International Driving Permit', limit: 'Up to $500' },
          { name: 'Emergency Dental Treatment', limit: 'Up to $500' },
          { name: 'Personal Liability', limit: 'Up to $100,000' },
          { name: 'Cashless Hospital Network Access', limit: 'Worldwide Network' },
        ],
        highlightColor: 'from-amber-600 to-orange-600',
      },
      {
        id: 'gold_elite',
        name: 'Gold Elite Worldwide',
        badge: 'Zero Deductible',
        sumInsured: `$${Math.max(sumInsuredUSD, 250000).toLocaleString()}`,
        sumInsuredVal: Math.max(sumInsuredUSD, 250000),
        baseRatePerDay: 135,
        deductible: '$0 (Zero Deductible)',
        schengenApproved: true,
        features: [
          { name: 'Emergency Medical & Hospitalization', limit: `Up to $${Math.max(sumInsuredUSD, 250000).toLocaleString()}` },
          { name: 'Zero Deductible / Zero Excess on all claims', limit: '100% Covered' },
          { name: 'Emergency Evacuation & Air Ambulance', limit: 'Up to $100,000' },
          { name: 'Trip Cancellation for Any Cause', limit: 'Up to $3,500' },
          { name: 'Missed Connection / Flight Hijack Cover', limit: 'Up to $1,000' },
          { name: 'Loss of Checked Baggage', limit: 'Up to $2,000' },
          { name: 'Delay of Checked Baggage (>6 hrs)', limit: 'Up to $500' },
          { name: 'Loss of Passport, Tech Gadgets & Valuables', limit: 'Up to $1,000' },
          { name: 'Emergency Cash Advance Assistance', limit: 'Up to $1,500' },
          { name: 'Compassionate Family Visit', limit: 'Roundtrip Flight Included' },
          { name: 'Personal Liability & Legal Defence', limit: 'Up to $250,000' },
          { name: 'Pre-existing Condition Life Threatening Cover', limit: 'Up to $15,000' },
        ],
        highlightColor: 'from-emerald-600 to-teal-700',
      },
      {
        id: 'student_elite',
        name: 'Overseas Student Shield',
        badge: 'Specialized for Universities',
        sumInsured: `$${Math.max(sumInsuredUSD, 250000).toLocaleString()}`,
        sumInsuredVal: Math.max(sumInsuredUSD, 250000),
        baseRatePerDay: 48, // discounted for long durations
        deductible: '$50 per illness',
        schengenApproved: true,
        features: [
          { name: 'Medical Expenses & Hospitalization', limit: `Up to $${Math.max(sumInsuredUSD, 250000).toLocaleString()}` },
          { name: 'University Fee Interruption Cover', limit: 'Up to $10,000' },
          { name: 'Compassionate Visit for Parents/Guardian', limit: 'Economy Flight + Stay' },
          { name: 'Study Interruption due to Hospitalisation', limit: 'Up to $5,000' },
          { name: 'Mental Health & Nervous Disorders Care', limit: 'Up to $2,500' },
          { name: 'Loss of Laptop / Study Equipment', limit: 'Up to $1,000' },
          { name: 'Bail Bond & Legal Expenses', limit: 'Up to $5,000' },
          { name: 'Meets US, UK, Schengen & Aus University Waivers', limit: '100% Compliant' },
        ],
        highlightColor: 'from-purple-600 to-indigo-800',
      },
    ]

    // Calculate dynamic premiums
    const calculatedPlans = plans.map(p => {
      let totalTravelersPremium = 0

      travelerList.forEach(t => {
        const age = t.age || 30
        let ageMultiplier = 1.0
        if (age < 18) ageMultiplier = 0.85
        else if (age >= 18 && age <= 40) ageMultiplier = 1.0
        else if (age > 40 && age <= 60) ageMultiplier = 1.35
        else if (age > 60 && age <= 70) ageMultiplier = 2.1
        else if (age > 70 && age <= 80) ageMultiplier = 3.4
        else ageMultiplier = 4.8 // 80+

        let travelerBase = p.baseRatePerDay * days * destMultiplier * sumInsuredMultiplier * ageMultiplier
        totalTravelersPremium += travelerBase
      })

      // Addons
      let addonTotal = 0
      if (adventureSports) addonTotal += (days * 45 * travelerList.length)
      if (pedCover) addonTotal += (days * 65 * travelerList.length)
      if (tripCancellationAddon) addonTotal += (days * 30 * travelerList.length)

      const subtotalINR = Math.round(totalTravelersPremium + addonTotal)
      const gstINR = Math.round(subtotalINR * 0.18)
      const totalINR = subtotalINR + gstINR
      const approxUSD = Math.round(totalINR / 87)

      return {
        ...p,
        pricing: {
          subtotalINR,
          gstINR,
          totalINR,
          approxUSD,
          perDayINR: Math.round(totalINR / days),
        },
      }
    })

    return NextResponse.json({
      success: true,
      query: {
        destination,
        destLabel,
        startDate,
        endDate,
        durationDays: days,
        travelersCount: travelerList.length,
        sumInsuredUSD,
        adventureSports: !!adventureSports,
        pedCover: !!pedCover,
        tripCancellationAddon: !!tripCancellationAddon,
      },
      plans: calculatedPlans,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Error generating insurance quote:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to generate insurance quote' },
      { status: 500 }
    )
  }
}
