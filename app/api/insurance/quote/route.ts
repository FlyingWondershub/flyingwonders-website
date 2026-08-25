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

    // Destination multiplier & labels
    let destMultiplier = 1.0
    let destLabel = 'Worldwide'
    let isSchengen = false
    let isUSA = false
    let isDomestic = false

    if (destination === 'worldwide_with_us_ca') {
      destMultiplier = 1.85
      destLabel = 'Worldwide (incl. USA & Canada)'
      isUSA = true
    } else if (destination === 'worldwide_without_us_ca') {
      destMultiplier = 1.35
      destLabel = 'Worldwide (excl. USA & Canada)'
    } else if (destination === 'schengen_europe') {
      destMultiplier = 1.25
      destLabel = 'Schengen & European Union (Visa Compliant)'
      isSchengen = true
    } else if (destination === 'asia') {
      destMultiplier = 1.0
      destLabel = 'Asia Pacific & Middle East'
    } else if (destination === 'domestic') {
      destMultiplier = 0.4
      destLabel = 'Domestic Travel (India)'
      isDomestic = true
    }

    // Dynamic Deductibles based on Location & Embassy Rules
    const standardDeductible = isDomestic ? '₹500 per claim' : (isSchengen ? '$50 per claim' : (isUSA ? '$100 per claim' : '$50 per claim'))
    const silverDeductible = isDomestic ? '₹0 (Zero Deductible)' : (isSchengen ? '$0 (Zero Deductible)' : (isUSA ? '$50 per claim' : '$25 per claim'))
    const goldDeductible = isDomestic ? '₹0 (Zero Deductible)' : '$0 (Zero Deductible)'
    const studentDeductible = isDomestic ? '₹0 (Zero Deductible)' : '$50 per claim'

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
        deductible: standardDeductible,
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
        deductible: silverDeductible,
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
        deductible: goldDeductible,
        schengenApproved: true,
        features: [
          { name: 'Emergency Medical & Hospitalization', limit: `Up to $${Math.max(sumInsuredUSD, 250000).toLocaleString()}` },
          { name: 'Emergency Medical Evacuation & Rescue', limit: 'Up to $100,000' },
          { name: 'Repatriation of Mortal Remains', limit: 'Up to $50,000' },
          { name: 'Trip Cancellation (Any Reason)', limit: 'Up to $3,500' },
          { name: 'Trip Interruption & Curtailment', limit: 'Up to $2,500' },
          { name: 'Loss of Checked Baggage', limit: 'Up to $2,000' },
          { name: 'Baggage Delay (>6 hrs)', limit: 'Up to $500' },
          { name: 'Passport, Visas & Financial Loss', limit: 'Up to $1,000' },
          { name: 'Emergency Dental Care', limit: 'Up to $1,000' },
          { name: 'Personal Accident (AD&D)', limit: 'Up to $50,000' },
          { name: 'Personal Liability & Legal Defence', limit: 'Up to $250,000' },
          { name: 'Bail Bond & Emergency Cash Advance', limit: 'Up to $5,000' },
          { name: 'Compassionate Family Visit', limit: 'Roundtrip Ticket Included' },
        ],
        highlightColor: 'from-emerald-600 to-teal-800',
      },
      {
        id: 'student_elite',
        name: 'Student Overseas Elite',
        badge: 'Study Abroad',
        sumInsured: '$250,000',
        sumInsuredVal: 250000,
        baseRatePerDay: 65,
        deductible: studentDeductible,
        schengenApproved: true,
        features: [
          { name: 'Medical Expenses & Hospitalization', limit: 'Up to $250,000' },
          { name: 'Study Interruption / Fee Reimbursement', limit: 'Up to $10,000' },
          { name: 'Sponsor Protection / Tuition Shield', limit: 'Up to $15,000' },
          { name: 'Compassionate Visit (Parent Return Ticket)', limit: 'Up to $3,000' },
          { name: 'Emergency Medical Evacuation', limit: 'Up to $50,000' },
          { name: 'Repatriation of Remains', limit: 'Up to $25,000' },
          { name: 'Loss of Laptop & Study Equipment', limit: 'Up to $1,000' },
          { name: 'Loss of Passport & Student Visa', limit: 'Up to $500' },
          { name: 'Personal Liability', limit: 'Up to $100,000' },
          { name: 'University Medical Waiver Guaranteed', limit: '100% Accepted' },
        ],
        highlightColor: 'from-purple-600 to-indigo-800',
      },
    ]

    // Calculate age multiplier for each traveler
    const calculateTravelerMultiplier = (age: number): number => {
      if (age <= 40) return 1.0
      if (age <= 60) return 1.2
      if (age <= 70) return 1.6
      if (age <= 80) return 2.5
      return 3.5
    }

    // Riders additions per day
    let riderDailyAddition = 0
    if (adventureSports) riderDailyAddition += 25
    if (pedCover) riderDailyAddition += 45
    if (tripCancellationAddon) riderDailyAddition += 20

    const calculatedPlans = plans.map(plan => {
      let totalTravelersPremium = 0

      travelerList.forEach(t => {
        const ageMult = calculateTravelerMultiplier(t.age)
        const dailyRate = (plan.baseRatePerDay + riderDailyAddition) * destMultiplier * sumInsuredMultiplier * ageMult
        const travelerTotal = dailyRate * days
        totalTravelersPremium += travelerTotal
      })

      // Round & add 18% GST for India / international billing
      const subtotalINR = Math.round(totalTravelersPremium)
      const gstINR = Math.round(subtotalINR * 0.18)
      const totalINR = subtotalINR + gstINR
      const approxUSD = Math.round(totalINR / 87) // approx 87 INR per USD

      return {
        ...plan,
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
      destination: destLabel,
      durationDays: days,
      travelersCount: travelerList.length,
      plans: calculatedPlans,
    })
  } catch (err: any) {
    console.error('Error calculating insurance quote:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to calculate insurance quote.' },
      { status: 500 }
    )
  }
}
