import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../sanity/env'

export const dynamic = 'force-dynamic'

const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
})

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// Fallback demo catalog profiles when database is initializing
const SEED_PROFILES = [
  {
    _id: 'dmc-singapore-apex',
    companyName: 'Apex Travels & DMC Singapore',
    tagline: 'Premier Singapore B2B Ground Handler & VIP Transfers',
    agentName: 'Marcus Tan',
    email: 'marcus@apextravels.sg',
    phone: '+65 9123 4567',
    whatsappNumber: '6591234567',
    city: 'Singapore',
    country: 'Singapore',
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1000&auto=format&fit=crop&q=80',
    aboutCompany: 'Specializing in Singapore luxury FIT, MICE ground handling, VIP airport transfers, and attraction ticketing. Operating a proprietary fleet of luxury Mercedes V-Class vans and 45-seater coaches.',
    destinationsCovered: ['Singapore', 'Malaysia', 'Desaru Coast'],
    specialties: ['Corporate MICE', 'VIP Transfers', 'Attraction Passes', 'FIT Travel'],
    servicesMatrix: ['Airport Meet & Greet', 'Fleet Transfers & Coaches', 'Wholesale Attraction Passes', 'Visa Processing Assistance'],
    languagesSupported: ['English', 'Mandarin', 'Malay', 'Hindi'],
    fleetTypes: ['VIP MPV (7-Seater)', '45-Seater Coach', 'Luxury Sedan'],
    paymentMethods: ['PayNow', 'Bank Transfer (Wire)', 'Credit Card'],
    tradeCertifications: ['STB Licensed DMC', 'NATAS Member', 'IATA Certified'],
    leadTimeNotice: 'Same-Day Booking Accepted',
    brochurePdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    galleryImages: [
      'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop&q=80'
    ],
    websiteUrl: 'https://apextravels.sg',
    likesCount: 38,
    packageHighlights: [
      { title: '3N/4D Singapore Highlights & Sentosa Escape', duration: '3N/4D', startingPrice: 320 },
      { title: '4N/5D Cross-Border Desaru Beach Resort Special', duration: '4N/5D', startingPrice: 580 }
    ],
    recommendations: [
      { recommenderEmail: 'aditya@royalholidays.in', recommenderCompany: 'Royal Holidays India', recommenderName: 'Aditya Sharma', comment: 'Exceptional VIP transfers and 24/7 hotline support in Singapore!', createdAt: '2026-08-01' }
    ],
    isPublic: true
  },
  {
    _id: 'dmc-malaysia-borneo',
    companyName: 'Nusantara DMC & Overland Tours',
    tagline: 'Kuala Lumpur, Penang & Borneo Eco-Adventure Specialists',
    agentName: 'Siti Rahayu',
    email: 'siti@nusantaradmc.my',
    phone: '+60 12 345 6789',
    whatsappNumber: '60123456789',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    logoUrl: 'https://images.unsplash.com/photo-1516876437184-593fda40c7ce?w=300&auto=format&fit=crop&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1000&auto=format&fit=crop&q=80',
    aboutCompany: 'Full-service Malaysia DMC handling Peninsular Malaysia overland routes, Genting Highlands cable cars, Langkawi island hopping, and Sabah/Sarawak rainforest expeditions.',
    destinationsCovered: ['Malaysia', 'Kuala Lumpur', 'Penang', 'Langkawi', 'Borneo'],
    specialties: ['Overland Tours', 'Eco-Tourism', 'Island Hopping', 'Culture & Heritage'],
    servicesMatrix: ['Fleet Transfers & Coaches', 'Wholesale Attraction Passes', 'Hotel Contracting', 'Visa Processing Assistance'],
    languagesSupported: ['English', 'Malay', 'Mandarin', 'Tamil'],
    fleetTypes: ['14-Seater Van', '44-Seater Bus', 'Private SUV'],
    paymentMethods: ['Bank Transfer (Wire)', 'Wise', 'Credit Card'],
    tradeCertifications: ['MATTA Member', 'Tourism Malaysia Approved'],
    leadTimeNotice: '24h Advance Notice',
    brochurePdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    videoUrl: '',
    galleryImages: [
      'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&auto=format&fit=crop&q=80'
    ],
    websiteUrl: 'https://nusantaradmc.my',
    likesCount: 24,
    packageHighlights: [
      { title: '4N/5D KL + Genting Highlands + Batu Caves', duration: '4N/5D', startingPrice: 240 },
      { title: '3N/4D Langkawi Luxury Beach & Mangrove Safari', duration: '3N/4D', startingPrice: 310 }
    ],
    recommendations: [
      { recommenderEmail: 'priya@horizonoutbound.com', recommenderCompany: 'Horizon Outbound India', recommenderName: 'Priya Mehta', comment: 'Flawless KL airport pickups and Genting coach arrangements.', createdAt: '2026-08-05' }
    ],
    isPublic: true
  },
  {
    _id: 'dmc-thailand-siam',
    companyName: 'Siam Horizon DMC Thailand',
    tagline: 'Bangkok, Phuket, Pattaya & Chiang Mai Destination Experts',
    agentName: 'Katsuhiro Naito',
    email: 'info@siamhorizondmc.com',
    phone: '+66 81 234 5678',
    whatsappNumber: '66812345678',
    city: 'Bangkok',
    country: 'Thailand',
    logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1000&auto=format&fit=crop&q=80',
    aboutCompany: 'Providing wholesale Thailand land packages, island speedboats, Bangkok temple passes, Safari World tickets, and luxury Phuket yacht charters to global B2B agents.',
    destinationsCovered: ['Thailand', 'Bangkok', 'Phuket', 'Pattaya', 'Chiang Mai'],
    specialties: ['Beach Resorts', 'Nightlife & Shows', 'Yacht Charters', 'MICE Events'],
    servicesMatrix: ['Airport Meet & Greet', 'Wholesale Attraction Passes', 'Hotel Contracting', 'Cruise Shore Excursions'],
    languagesSupported: ['English', 'Thai', 'Japanese', 'Mandarin'],
    fleetTypes: ['VIP Toyota Commuter Van', 'Luxury Coach'],
    paymentMethods: ['PayNow', 'Bank Transfer (Wire)', 'Razorpay', 'Credit Card'],
    tradeCertifications: ['TAT Licensed DMC', 'ATTA Member'],
    leadTimeNotice: 'Same-Day Booking Accepted',
    brochurePdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    videoUrl: '',
    galleryImages: [
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&auto=format&fit=crop&q=80'
    ],
    websiteUrl: 'https://siamhorizondmc.com',
    likesCount: 41,
    packageHighlights: [
      { title: '5N/6D Bangkok + Pattaya Island Combo', duration: '5N/6D', startingPrice: 280 },
      { title: '4N/5D Phuket Luxury Villa & Speedboat Safari', duration: '4N/5D', startingPrice: 420 }
    ],
    recommendations: [
      { recommenderEmail: 'marcus@apextravels.sg', recommenderCompany: 'Apex Travels Singapore', recommenderName: 'Marcus Tan', comment: 'Our trusted B2B partner for all Thailand client extensions!', createdAt: '2026-08-08' }
    ],
    isPublic: true
  }
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const destination = searchParams.get('destination')?.toLowerCase().trim()
    const specialty = searchParams.get('specialty')?.toLowerCase().trim()
    const service = searchParams.get('service')?.toLowerCase().trim()
    const queryStr = searchParams.get('query')?.toLowerCase().trim()
    const sort = searchParams.get('sort') || 'likes'

    let sanityProfiles: any[] = []
    try {
      sanityProfiles = await client.fetch(
        `*[_type == "b2bCatalogProfile" && isPublic != false] | order(_createdAt desc)`
      )
    } catch (err) {
      console.warn('Failed to fetch catalog profiles from Sanity, using fallback dataset.', err)
    }

    // Merge database profiles with seed fallback profiles, prioritizing Sanity
    const combinedMap = new Map<string, any>()
    SEED_PROFILES.forEach(p => combinedMap.set(p._id, p))
    sanityProfiles.forEach(p => combinedMap.set(p._id || p.email, p))

    let profiles = Array.from(combinedMap.values())

    // Filtering
    if (destination) {
      profiles = profiles.filter(p =>
        Array.isArray(p.destinationsCovered) &&
        p.destinationsCovered.some((d: string) => d.toLowerCase().includes(destination))
      )
    }
    if (specialty) {
      profiles = profiles.filter(p =>
        Array.isArray(p.specialties) &&
        p.specialties.some((s: string) => s.toLowerCase().includes(specialty))
      )
    }
    if (service) {
      profiles = profiles.filter(p =>
        Array.isArray(p.servicesMatrix) &&
        p.servicesMatrix.some((sm: string) => sm.toLowerCase().includes(service))
      )
    }
    if (queryStr) {
      profiles = profiles.filter(p =>
        (p.companyName || '').toLowerCase().includes(queryStr) ||
        (p.agentName || '').toLowerCase().includes(queryStr) ||
        (p.city || '').toLowerCase().includes(queryStr) ||
        (p.country || '').toLowerCase().includes(queryStr) ||
        (p.aboutCompany || '').toLowerCase().includes(queryStr)
      )
    }

    // Sorting
    if (sort === 'likes') {
      profiles.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    } else if (sort === 'recommended') {
      profiles.sort((a, b) => ((b.recommendations || []).length) - ((a.recommendations || []).length))
    } else if (sort === 'newest') {
      profiles.sort((a, b) => new Date(b._createdAt || b.createdAt || 0).getTime() - new Date(a._createdAt || a.createdAt || 0).getTime())
    }

    return NextResponse.json({ success: true, profiles })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      companyName,
      tagline,
      agentName,
      email,
      phone,
      whatsappNumber,
      city,
      country,
      logoUrl,
      coverImageUrl,
      aboutCompany,
      destinationsCovered,
      specialties,
      servicesMatrix,
      languagesSupported,
      fleetTypes,
      paymentMethods,
      tradeCertifications,
      leadTimeNotice,
      brochurePdfUrl,
      videoUrl,
      galleryImages,
      websiteUrl,
      packageHighlights,
    } = body

    if (!email || !companyName) {
      return NextResponse.json({ success: false, error: 'Company Name and Email are required.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Find existing profile in Sanity
    const existing = await writeClient.fetch(
      `*[_type == "b2bCatalogProfile" && lower(email) == $email][0]`,
      { email: normalizedEmail }
    )

    const docData = {
      _type: 'b2bCatalogProfile',
      companyName,
      tagline: tagline || '',
      agentName: agentName || '',
      email: normalizedEmail,
      phone: phone || '',
      whatsappNumber: whatsappNumber || phone || '',
      city: city || '',
      country: country || '',
      logoUrl: logoUrl || '',
      coverImageUrl: coverImageUrl || '',
      aboutCompany: aboutCompany || '',
      destinationsCovered: Array.isArray(destinationsCovered) ? destinationsCovered : [],
      specialties: Array.isArray(specialties) ? specialties : [],
      servicesMatrix: Array.isArray(servicesMatrix) ? servicesMatrix : [],
      languagesSupported: Array.isArray(languagesSupported) ? languagesSupported : [],
      fleetTypes: Array.isArray(fleetTypes) ? fleetTypes : [],
      paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : [],
      tradeCertifications: Array.isArray(tradeCertifications) ? tradeCertifications : [],
      leadTimeNotice: leadTimeNotice || '',
      brochurePdfUrl: brochurePdfUrl || '',
      videoUrl: videoUrl || '',
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      websiteUrl: websiteUrl || '',
      packageHighlights: Array.isArray(packageHighlights) ? packageHighlights : [],
      isPublic: true,
    }

    let result
    if (existing) {
      result = await writeClient.patch(existing._id).set(docData).commit()
    } else {
      result = await writeClient.create({
        ...docData,
        likesCount: 0,
        recommendations: [],
      })
    }

    return NextResponse.json({
      success: true,
      profile: result,
      message: existing ? 'Profile updated successfully!' : 'Profile created successfully!',
    })
  } catch (error: any) {
    console.error('Error saving B2B catalog profile:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to save profile' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')?.toLowerCase().trim()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required for deletion.' }, { status: 400 })
    }

    const existing = await writeClient.fetch(
      `*[_type == "b2bCatalogProfile" && lower(email) == $email][0]`,
      { email }
    )

    if (existing) {
      await writeClient.delete(existing._id)
    }

    return NextResponse.json({ success: true, message: 'Profile deleted successfully.' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete profile' }, { status: 500 })
  }
}
