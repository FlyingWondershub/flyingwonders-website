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

// Fallback demo catalog profiles (Empty for clean production launch)
const SEED_PROFILES: any[] = []

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
      secondaryEmail,
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

    if (!companyName || !email) {
      return NextResponse.json({ success: false, error: 'Company Name and Email are required.' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

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
      secondaryEmail: (secondaryEmail || '').toLowerCase().trim(),
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
