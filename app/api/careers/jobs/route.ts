import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

const SANITY_WRITE_TOKEN =
  process.env.SANITY_WRITE_TOKEN ||
  process.env.SANITY_API_TOKEN ||
  'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG'

const writeClient = createClient({
  apiVersion,
  dataset,
  projectId,
  token: SANITY_WRITE_TOKEN,
  useCdn: false,
})

export const LEGACY_ID_MAP: Record<string, string> = {
  'sample-job-1': 'job-senior-tour-operations-executive',
  'sample-job-2': 'job-b2b-travel-sales-account-manager',
  'sample-job-3': 'job-full-stack-web-developer',
  'sample-job-4': 'job-guest-experience-ticketing-specialist',
}

export function normalizeJobId(id: string): string {
  return LEGACY_ID_MAP[id] || id
}

// Sample fallback jobs with permanent Sanity IDs
const SAMPLE_JOBS = [
  {
    _id: 'job-senior-tour-operations-executive',
    _type: 'jobOpening',
    title: 'Senior Tour Operations Executive (Singapore & B2B)',
    slug: { _type: 'slug', current: 'senior-tour-operations-executive-singapore' },
    department: 'Operations & Tour Logistics',
    location: 'Singapore (HQ) / Hybrid',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level',
    salaryRange: 'SGD 3,800 - 5,200 / month',
    shortDescription: 'Lead end-to-end inbound Singapore tour operations, coordinating private fleet transfers, licensed tourist guides, attraction tickets, and VIP guest handling.',
    responsibilities: [
      'Coordinate and execute daily inbound Singapore tours, private transfers, and attraction bundle ticketing.',
      'Liaise closely with our fleet transport partners, licensed tour guides, and hotel concierges.',
      'Oversee real-time on-ground logistics and manage emergency passenger inquiries with high empathy.',
      'Collaborate with our B2B agency partners across India and Southeast Asia for custom land package itineraries.',
    ],
    requirements: [
      'Minimum 2-4 years of experience in Singapore inbound DMC, travel agency, or hospitality operations.',
      'Strong familiarity with Singapore tourist attractions, Changi airport logistics, and cruise terminal transfers.',
      'Excellent verbal and written communication skills in English (additional language proficiency is an asset).',
      'High attention to detail, problem-solving mindset, and ability to thrive in a fast-paced environment.',
    ],
    benefits: [
      'Competitive monthly remuneration + performance incentives.',
      'Annual travel allowances and family attraction access passes.',
      'Comprehensive medical insurance and wellness benefits.',
      'Warm, merit-driven work culture with clear leadership growth path.',
    ],
    status: 'active',
    featured: true,
    urgent: true,
    publishedAt: new Date().toISOString(),
  },
  {
    _id: 'job-b2b-travel-sales-account-manager',
    _type: 'jobOpening',
    title: 'B2B Travel Sales & Account Manager (India & SEA Market)',
    slug: { _type: 'slug', current: 'b2b-travel-sales-account-manager' },
    department: 'Sales & Business Development',
    location: 'Bangalore, India / Remote',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    experienceLevel: 'Senior',
    salaryRange: 'Competitive Base + Lucrative Commission',
    shortDescription: 'Drive B2B partnerships with travel agents, corporate MICE planners, and regional tour operators promoting Flying Wonders customized Singapore & Southeast Asia itineraries.',
    responsibilities: [
      'Acquire, onboard, and nurture travel agencies, corporate travel desks, and MICE organizers into the Flying Wonders B2B network.',
      'Deliver compelling product presentations on our proprietary land packages, hotel vouchers, and attraction bundles.',
      'Collaborate with the quoter engineering team to turn around rapid custom package quotations for partner agents.',
      'Achieve monthly and quarterly gross transaction volume and agent engagement targets.',
    ],
    requirements: [
      '3-6 years of proven B2B outbound or inbound travel sales experience in the Indian or Southeast Asian market.',
      'Established network of travel agents, tour operators, and corporate event organizers.',
      'Exceptional consultative sales, negotiation, and relationship-building capabilities.',
      'Self-driven, metric-oriented, and comfortable utilizing modern CRM & digital communication tools.',
    ],
    benefits: [
      'Attractive performance-linked commission model with uncapped upside.',
      'Work-from-anywhere flexibility with subsidized office equipment.',
      'Annual all-expenses-paid familiarization trips (FAM trips) to Singapore.',
      'Subsidized healthcare insurance and learning stipend.',
    ],
    status: 'active',
    featured: true,
    urgent: false,
    publishedAt: new Date().toISOString(),
  },
  {
    _id: 'job-full-stack-web-developer',
    _type: 'jobOpening',
    title: 'Full Stack Web Developer (Next.js, TypeScript & React)',
    slug: { _type: 'slug', current: 'full-stack-web-developer-nextjs' },
    department: 'Software Engineering & Tech',
    location: 'Remote (Worldwide)',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level',
    salaryRange: 'Competitive / Industry Standard',
    shortDescription: 'Build next-generation travel technology including our instant quotation engines, dynamic voucher generators, interactive itinerary maps, and partner API integrations.',
    responsibilities: [
      'Develop modern, ultra-responsive web applications using Next.js App Router, React 19, TypeScript, and Tailwind/CSS.',
      'Architect robust backend API routes, Sanity CMS schemas, and automated transactional email workflows.',
      'Optimize web performance, Core Web Vitals, and mobile user experience across iOS and Android browsers.',
      'Collaborate directly with founders to conceptualize and ship high-impact features with rapid velocity.',
    ],
    requirements: [
      '2+ years of hands-on experience building production web applications in Next.js, React, and TypeScript.',
      'Strong grasp of headless CMS platforms (Sanity.io preferred) and REST / serverless backend architecture.',
      'Sharp design intuition, deep appreciation for clean typography, high contrast, and smooth micro-interactions.',
      'Experience with PDF generation, canvas rendering, or payment gateways (ICICI, Cashfree, Stripe) is a bonus.',
    ],
    benefits: [
      '100% remote working freedom with flexible core hours.',
      'Modern tech stack with continuous learning and innovation culture.',
      'Annual tech gear reimbursement and travel discounts.',
      'Direct impact on hundreds of daily travelers and partner travel agencies.',
    ],
    status: 'active',
    featured: false,
    urgent: false,
    publishedAt: new Date().toISOString(),
  },
  {
    _id: 'job-guest-experience-ticketing-specialist',
    _type: 'jobOpening',
    title: 'Guest Experience & Ticketing Specialist',
    slug: { _type: 'slug', current: 'guest-experience-ticketing-specialist' },
    department: 'Customer Experience & Concierge',
    location: 'Singapore / Hybrid',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: 'Entry-level',
    salaryRange: 'SGD 3,000 - 3,800 / month',
    shortDescription: 'Deliver white-glove customer concierge service, dispatching digital admission passes, answering traveler questions via WhatsApp, and resolving booking amendments.',
    responsibilities: [
      'Monitor incoming customer inquiries across WhatsApp, email, and live concierge channels.',
      'Issue and deliver instant attraction e-vouchers and Singapore border entry documentation support (SGAC).',
      'Assist travelers with itinerary modifications, rescheduling, and customized local recommendations.',
      'Gather traveler feedback and drive 5-star customer review collection.',
    ],
    requirements: [
      '1+ years of customer service or tourism ticketing experience (fresh graduates with enthusiasm welcome).',
      'Warm, courteous, and prompt customer interaction style.',
      'Comfortable using digital ticketing portals, mobile apps, and spreadsheet tools.',
      'Willingness to work on rotating weekend shifts during peak travel seasons.',
    ],
    benefits: [
      'Comprehensive tourism training and Singapore attraction site visits.',
      'Shift allowance and weekend differential pay.',
      'Generous paid annual leave and comprehensive healthcare benefits.',
    ],
    status: 'active',
    featured: false,
    urgent: false,
    publishedAt: new Date().toISOString(),
  },
]

export const dynamic = 'force-dynamic'

/**
 * GET /api/careers/jobs
 * Query params:
 *  - scope: 'public' (default, active only) | 'admin' (all statuses)
 *  - department: filter by department
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const scope = searchParams.get('scope') || 'public'
    const department = searchParams.get('department')

    let groqQuery = `*[_type == "jobOpening"]`
    if (scope === 'public') {
      groqQuery = `*[_type == "jobOpening" && status == "active"]`
    }
    if (department && department !== 'All') {
      groqQuery = `*[_type == "jobOpening" && status == "active" && department == $department]`
    }

    groqQuery += ` | order(urgent desc, featured desc, order asc, _createdAt desc)`

    let jobs: any[] = []
    let fetchSucceeded = false
    try {
      jobs = await writeClient.fetch(groqQuery, { department })
      fetchSucceeded = true
    } catch (sanityErr: any) {
      console.warn('Sanity job fetch failed, returning sample jobs fallback:', sanityErr.message)
    }

    // If no jobs exist in Sanity yet, auto-seed them into Sanity so they are real permanent documents
    if (fetchSucceeded && (!jobs || jobs.length === 0)) {
      try {
        await Promise.all(
          SAMPLE_JOBS.map((job) =>
            writeClient.createIfNotExists(job).catch((err) => console.warn('Auto-seed error:', err.message))
          )
        )
        // Re-fetch from Sanity after auto-seeding
        const reFetched = await writeClient.fetch(groqQuery, { department }).catch(() => null)
        if (reFetched && reFetched.length > 0) {
          jobs = reFetched
        } else {
          jobs = SAMPLE_JOBS
        }
      } catch (seedErr: any) {
        console.warn('Failed to auto-seed to Sanity:', seedErr.message)
        jobs = SAMPLE_JOBS
      }
    } else if (!fetchSucceeded && (!jobs || jobs.length === 0)) {
      if (scope === 'public') {
        jobs = SAMPLE_JOBS.filter(
          (j) => !department || department === 'All' || j.department === department
        )
      } else {
        jobs = SAMPLE_JOBS
      }
    }

    // Compute stats
    const stats = {
      total: jobs.length,
      active: jobs.filter((j) => j.status === 'active').length,
      draft: jobs.filter((j) => j.status === 'draft').length,
      closed: jobs.filter((j) => j.status === 'closed').length,
    }

    return NextResponse.json({
      success: true,
      jobs,
      stats,
    })
  } catch (err: any) {
    console.error('Job Openings API GET Error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch job openings' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/careers/jobs
 * Create a new job opening
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      department,
      location,
      workplaceType = 'Hybrid',
      employmentType = 'Full-time',
      experienceLevel = 'Mid-level',
      salaryRange,
      shortDescription,
      responsibilities = [],
      requirements = [],
      benefits = [],
      status = 'active',
      featured = false,
      urgent = false,
      deadline,
      order = 0,
    } = body

    if (!title || !department || !location || !shortDescription) {
      return NextResponse.json(
        { success: false, error: 'Title, Department, Location, and Summary are required.' },
        { status: 400 }
      )
    }

    // Slug generation
    const slugStr = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const doc = await writeClient.create({
      _type: 'jobOpening',
      title: title.trim(),
      slug: { _type: 'slug', current: slugStr },
      department,
      location: location.trim(),
      workplaceType,
      employmentType,
      experienceLevel,
      salaryRange: salaryRange?.trim() || undefined,
      shortDescription: shortDescription.trim(),
      responsibilities: Array.isArray(responsibilities)
        ? responsibilities.filter(Boolean)
        : [],
      requirements: Array.isArray(requirements) ? requirements.filter(Boolean) : [],
      benefits: Array.isArray(benefits) ? benefits.filter(Boolean) : [],
      status,
      featured: Boolean(featured),
      urgent: Boolean(urgent),
      deadline: deadline || undefined,
      order: Number(order) || 0,
      publishedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      job: doc,
      message: 'Job opening created successfully!',
    })
  } catch (err: any) {
    console.error('Job Openings API POST Error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create job opening' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/careers/jobs
 * Update an existing job opening
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    let { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Job Opening ID is required.' },
        { status: 400 }
      )
    }

    // Normalize legacy sample-job-X IDs to real Sanity document IDs
    id = normalizeJobId(id)

    // Ensure the document exists in Sanity before patching to avoid 404
    const existing = await writeClient.getDocument(id).catch(() => null)
    if (!existing) {
      const sample = SAMPLE_JOBS.find((j) => j._id === id || normalizeJobId(j._id) === id)
      const baseDoc: any = sample
        ? { ...sample }
        : {
            _id: id,
            _type: 'jobOpening',
            title: updates.title || 'Job Opening',
            slug: {
              _type: 'slug',
              current: (updates.title || 'job-opening')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, ''),
            },
            department: updates.department || 'Operations & Tour Logistics',
            location: updates.location || 'Singapore (HQ) / Hybrid',
            workplaceType: updates.workplaceType || 'Hybrid',
            employmentType: updates.employmentType || 'Full-time',
            shortDescription: updates.shortDescription || 'Role description',
            status: updates.status || 'active',
            publishedAt: new Date().toISOString(),
          }
      await writeClient.createIfNotExists({
        ...baseDoc,
        _id: id,
        _type: 'jobOpening',
      })
    }

    // Clean payload for Sanity patch
    const patch = writeClient.patch(id)

    if (updates.title) {
      patch.set({ title: updates.title.trim() })
      if (!updates.slug) {
        const slugStr = updates.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
        patch.set({ slug: { _type: 'slug', current: slugStr } })
      }
    }
    if (updates.department) patch.set({ department: updates.department })
    if (updates.location) patch.set({ location: updates.location.trim() })
    if (updates.workplaceType) patch.set({ workplaceType: updates.workplaceType })
    if (updates.employmentType) patch.set({ employmentType: updates.employmentType })
    if (updates.experienceLevel) patch.set({ experienceLevel: updates.experienceLevel })
    if (updates.salaryRange !== undefined) patch.set({ salaryRange: updates.salaryRange })
    if (updates.shortDescription) patch.set({ shortDescription: updates.shortDescription })
    if (updates.responsibilities) patch.set({ responsibilities: updates.responsibilities })
    if (updates.requirements) patch.set({ requirements: updates.requirements })
    if (updates.benefits) patch.set({ benefits: updates.benefits })
    if (updates.status) patch.set({ status: updates.status })
    if (typeof updates.featured === 'boolean') patch.set({ featured: updates.featured })
    if (typeof updates.urgent === 'boolean') patch.set({ urgent: updates.urgent })
    if (updates.deadline !== undefined) patch.set({ deadline: updates.deadline })
    if (updates.order !== undefined) patch.set({ order: Number(updates.order) || 0 })

    const updatedDoc = await patch.commit()

    return NextResponse.json({
      success: true,
      job: updatedDoc,
      message: 'Job opening updated successfully!',
    })
  } catch (err: any) {
    console.error('Job Openings API PUT Error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update job opening' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/careers/jobs
 * Delete a job opening
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawId = searchParams.get('id')

    if (!rawId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required.' },
        { status: 400 }
      )
    }

    const targetId = normalizeJobId(rawId)

    // Delete the target Sanity document
    await writeClient.delete(targetId)

    // If rawId was a legacy ID (e.g. sample-job-1), also delete rawId if it existed
    if (rawId !== targetId) {
      await writeClient.delete(rawId).catch(() => null)
    }

    return NextResponse.json({
      success: true,
      message: 'Job opening removed successfully!',
    })
  } catch (err: any) {
    console.error('Job Openings API DELETE Error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete job opening' },
      { status: 500 }
    )
  }
}
