import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../sanity/env'
import JobDetailClient from '../../../components/JobDetailClient'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 60

const SANITY_READ_TOKEN =
  process.env.SANITY_WRITE_TOKEN ||
  process.env.SANITY_API_TOKEN ||
  'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG'

const client = createClient({
  apiVersion,
  dataset,
  projectId,
  token: SANITY_READ_TOKEN,
  useCdn: false,
})

// Fallback sample jobs in case of network or database reachability delay
const DEFAULT_JOBS = [
  {
    _id: 'job-senior-tour-operations-executive',
    title: 'Operations Executive (Singapore - Employment Pass)',
    slug: { current: 'operations-executive-singapore-employment-pass' },
    department: 'Operations & Tour Logistics',
    location: 'Singapore (HQ) / Hybrid',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level',
    salaryRange: 'SGD 3,800 - 5,200 / month',
    shortDescription:
      'Handle end-to-end inbound Singapore tour operations, coordinating private fleet transfers, licensed tourist guides, attraction tickets, and VIP guest handling.',
    responsibilities: [
      'Coordinate and execute daily inbound Singapore tours, private transfers, and attraction bundle ticketing.',
      'Liaise closely with fleet transport partners, licensed tour guides, and hotel concierges.',
      'Oversee real-time on-ground logistics and manage passenger inquiries with high empathy.',
      'Collaborate with our B2B agency partners across India and Southeast Asia for custom land package itineraries.',
    ],
    requirements: [
      'Minimum 2-4 years of experience in Singapore inbound DMC, travel agency, or hospitality operations.',
      'Strong familiarity with Singapore tourist attractions, Changi airport logistics, and cruise terminal transfers.',
      'Excellent verbal and written communication skills in English.',
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
    title: 'B2B Travel Sales & Account Manager (India - Employee)',
    slug: { current: 'b2b-travel-sales-account-manager-india-employee' },
    department: 'Sales & Business Development',
    location: 'Bangalore, India / Remote',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    experienceLevel: 'Senior',
    salaryRange: 'Competitive Base + Lucrative Commission',
    shortDescription:
      'Drive B2B partnerships with travel agents, corporate MICE planners, and regional tour operators promoting Flying Wonders customized Singapore & Southeast Asia itineraries.',
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
    title: 'Full Stack Web Developer (Next.js, TypeScript & React)',
    slug: { current: 'full-stack-web-developer-nextjs' },
    department: 'Software Engineering & Tech',
    location: 'Remote (Worldwide)',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level',
    salaryRange: 'Competitive / Industry Standard',
    shortDescription:
      'Build next-generation travel technology including our instant quotation engines, dynamic voucher generators, interactive itinerary maps, and partner API integrations.',
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
      'Experience with PDF generation, canvas rendering, or payment gateways is a bonus.',
    ],
    benefits: [
      '100% remote working freedom with flexible core hours.',
      'Modern tech stack with continuous learning and innovation culture.',
      'Annual tech gear reimbursement and travel discounts.',
      'Direct impact on hundreds of daily travelers and partner travel agencies.',
    ],
    status: 'closed',
    featured: false,
    urgent: false,
    publishedAt: new Date().toISOString(),
  },
  {
    _id: 'job-guest-experience-ticketing-specialist',
    title: 'Guest Experience & Ticketing Specialist',
    slug: { current: 'guest-experience-ticketing-specialist' },
    department: 'Ticketing & Attractions Operations',
    location: 'Singapore (HQ) / Shift-based',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    experienceLevel: 'Entry-level',
    salaryRange: 'SGD 2,800 - 3,500 / month',
    shortDescription:
      'Provide concierge and live ticketing support for international guests visiting Singapore attractions and experiencing curated tours.',
    responsibilities: [
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
    status: 'closed',
    featured: false,
    urgent: false,
    publishedAt: new Date().toISOString(),
  },
]

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const jobs = await client.fetch(
      `*[_type == "jobOpening" && defined(slug.current)]{ "slug": slug.current }`
    )
    return jobs.map((j: { slug: string }) => ({ slug: j.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const cleanSlug = decodeURIComponent(slug || '').trim()

  try {
    let job = await client.fetch(
      `*[_type == "jobOpening" && (slug.current == $slug || lower(slug.current) == lower($slug) || _id == $slug || lower(_id) == lower($slug))][0]`,
      { slug: cleanSlug }
    )

    if (!job) {
      job = DEFAULT_JOBS.find(
        (j) =>
          j.slug?.current === cleanSlug ||
          j.slug?.current?.toLowerCase() === cleanSlug.toLowerCase() ||
          j._id === cleanSlug ||
          j._id.toLowerCase() === cleanSlug.toLowerCase()
      )
    }

    if (!job) {
      return {
        title: 'Job Opening | Flying Wonders Careers',
        description: 'Explore career opportunities with Flying Wonders.',
      }
    }

    const title = `${job.title} | Careers at Flying Wonders`
    const description =
      job.shortDescription ||
      `Join Flying Wonders as a ${job.title} in ${job.location}. Apply now for exciting travel careers.`
    const url = `https://flyingwonders.net/job-openings/${job.slug?.current || cleanSlug}`

    return {
      title,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        siteName: 'Flying Wonders',
        locale: 'en_US',
        type: 'article',
        publishedTime: job.publishedAt || job._createdAt,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    }
  } catch {
    return {
      title: 'Careers & Job Openings | Flying Wonders',
    }
  }
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params
  const cleanSlug = decodeURIComponent(slug || '').trim()

  let job: any = null
  let otherJobs: any[] = []
  let settings: any = null

  try {
    job = await client.fetch(
      `*[_type == "jobOpening" && (slug.current == $slug || lower(slug.current) == lower($slug) || _id == $slug || lower(_id) == lower($slug))][0]`,
      { slug: cleanSlug }
    )
  } catch (err: any) {
    console.warn('Failed to fetch primary job opening from Sanity:', err.message)
  }

  // Gracefully fetch secondary data without blocking or failing the main job view
  if (job) {
    try {
      const [fetchedOthers, fetchedSettings] = await Promise.all([
        client
          .fetch(
            `*[_type == "jobOpening" && status == "active" && slug.current != $slug && _id != $slug][0...3] | order(urgent desc, featured desc, _createdAt desc)`,
            { slug: job.slug?.current || cleanSlug }
          )
          .catch(() => []),
        client.fetch(`*[_type == "jobSettings"][0]`).catch(() => null),
      ])
      otherJobs = fetchedOthers || []
      settings = fetchedSettings
    } catch {
      // Non-critical background fetches failed
    }
  }

  // Fallback resilience for newly created or sample jobs
  if (!job) {
    const fallback = DEFAULT_JOBS.find(
      (j) =>
        j.slug?.current === cleanSlug ||
        j.slug?.current?.toLowerCase() === cleanSlug.toLowerCase() ||
        j._id === cleanSlug ||
        j._id.toLowerCase() === cleanSlug.toLowerCase()
    )
    if (fallback) {
      job = fallback
      otherJobs = DEFAULT_JOBS.filter((j) => j._id !== fallback._id && j.status === 'active')
    }
  }

  if (!job) {
    notFound()
  }

  // Google for Jobs Schema (schema.org/JobPosting)
  const jobSchema = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: `${job.shortDescription}\n\nKey Responsibilities:\n${(job.responsibilities || []).join('\n')}\n\nRequirements:\n${(job.requirements || []).join('\n')}`,
    identifier: {
      '@type': 'PropertyValue',
      name: 'Flying Wonders',
      value: job._id,
    },
    datePosted: job.publishedAt || job._createdAt || new Date().toISOString(),
    validThrough: job.deadline || undefined,
    employmentType:
      job.employmentType === 'Full-time'
        ? 'FULL_TIME'
        : job.employmentType === 'Part-time'
        ? 'PART_TIME'
        : 'OTHER',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Flying Wonders',
      sameAs: 'https://flyingwonders.net',
      logo: 'https://flyingwonders.net/images/logo.png',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: (job.location || '').includes('Singapore') ? 'Singapore' : 'Bangalore',
        addressCountry: (job.location || '').includes('Singapore') ? 'SG' : 'IN',
      },
    },
    jobLocationType: job.workplaceType === 'Remote' ? 'TELECOMMUTE' : undefined,
    applicantLocationRequirements:
      job.workplaceType === 'Remote'
        ? {
            '@type': 'Country',
            name: (job.location || '').includes('India') ? 'India' : 'Singapore',
          }
        : undefined,
    baseSalary: job.salaryRange
      ? {
          '@type': 'MonetaryAmount',
          currency: job.salaryRange.includes('SGD') ? 'SGD' : 'INR',
          value: {
            '@type': 'QuantitativeValue',
            value: job.salaryRange,
            unitText: 'MONTH',
          },
        }
      : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }}
      />
      <JobDetailClient job={job} otherJobs={otherJobs} settings={settings} />
    </>
  )
}
