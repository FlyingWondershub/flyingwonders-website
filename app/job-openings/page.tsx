import { Metadata } from 'next'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../sanity/env'
import JobOpeningsClient from '../../components/JobOpeningsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Careers & Job Openings | Flying Wonders Travel',
  description:
    'Explore exciting career opportunities at Flying Wonders. Join our Singapore & international travel operations, sales, software engineering, and guest concierge teams.',
  keywords: [
    'Flying Wonders careers',
    'travel jobs Singapore',
    'tour operations executive',
    'B2B travel sales manager',
    'travel tech developer',
    'tourism careers Bangalore',
    'hospitality jobs Southeast Asia',
  ],
  openGraph: {
    title: 'Careers & Job Openings | Flying Wonders',
    description:
      'Join our passionate team delivering extraordinary journeys across Singapore, Southeast Asia, and worldwide. View open positions and join our talent network.',
    url: 'https://flyingwonders.net/job-openings',
    siteName: 'Flying Wonders',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://flyingwonders.net/job-openings',
  },
}

// Initial fallback sample jobs if Sanity has not been seeded yet
const DEFAULT_JOBS = [
  {
    _id: 'job-senior-tour-operations-executive',
    title: 'Senior Tour Operations Executive (Singapore & B2B)',
    slug: { current: 'senior-tour-operations-executive-singapore' },
    department: 'Operations & Tour Logistics',
    location: 'Singapore (HQ) / Hybrid',
    workplaceType: 'Hybrid' as const,
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level',
    salaryRange: 'SGD 3,800 - 5,200 / month',
    shortDescription:
      'Lead end-to-end inbound Singapore tour operations, coordinating private fleet transfers, licensed tourist guides, attraction tickets, and VIP guest handling.',
    responsibilities: [
      'Coordinate and execute daily inbound Singapore tours, private transfers, and attraction bundle ticketing.',
      'Liaise closely with our fleet transport partners, licensed tour guides, and hotel concierges.',
      'Oversee real-time on-ground logistics and manage emergency passenger inquiries with high empathy.',
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
    title: 'B2B Travel Sales & Account Manager (India & SEA Market)',
    slug: { current: 'b2b-travel-sales-account-manager' },
    department: 'Sales & Business Development',
    location: 'Bangalore, India / Remote',
    workplaceType: 'Remote' as const,
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
    workplaceType: 'Remote' as const,
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
    status: 'active',
    featured: false,
    urgent: false,
    publishedAt: new Date().toISOString(),
  },
  {
    _id: 'job-guest-experience-ticketing-specialist',
    title: 'Guest Experience & Ticketing Specialist',
    slug: { current: 'guest-experience-ticketing-specialist' },
    department: 'Customer Experience & Concierge',
    location: 'Singapore / Hybrid',
    workplaceType: 'Hybrid' as const,
    employmentType: 'Full-time',
    experienceLevel: 'Entry-level',
    salaryRange: 'SGD 3,000 - 3,800 / month',
    shortDescription:
      'Deliver white-glove customer concierge service, dispatching digital admission passes, answering traveler questions via WhatsApp, and resolving booking amendments.',
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

export default async function JobOpeningsPage() {
  const sanityClient = createClient({
    apiVersion,
    dataset,
    projectId,
    useCdn: false,
  })

  let jobs: any[] = []
  let settings: any = {}
  let fetchSucceeded = false

  try {
    const [fetchedJobs, fetchedSettings] = await Promise.all([
      sanityClient.fetch(
        `*[_type == "jobOpening" && status == "active"] | order(urgent desc, featured desc, order asc, _createdAt desc)`
      ),
      sanityClient.fetch(`*[_type == "jobSettings"][0]`),
    ])

    fetchSucceeded = true
    jobs = fetchedJobs || []
    if (fetchedSettings) {
      settings = fetchedSettings
    }
  } catch (err: any) {
    console.warn('Failed to pre-fetch jobs from Sanity, using default positions:', err.message)
  }

  if (!fetchSucceeded) {
    jobs = DEFAULT_JOBS
  }

  return <JobOpeningsClient initialJobs={jobs} initialSettings={settings} />
}
