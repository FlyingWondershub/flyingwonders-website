import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../sanity/env'
import JobDetailClient from '../../../components/JobDetailClient'

export const dynamic = 'force-dynamic'

const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: false,
})

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
  try {
    const job = await client.fetch(
      `*[_type == "jobOpening" && (slug.current == $slug || _id == $slug)][0]`,
      { slug }
    )

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
    const url = `https://flyingwonders.net/job-openings/${job.slug?.current || slug}`

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

  let job: any = null
  let otherJobs: any[] = []
  let settings: any = null

  try {
    const [fetchedJob, fetchedOthers, fetchedSettings] = await Promise.all([
      client.fetch(
        `*[_type == "jobOpening" && (slug.current == $slug || _id == $slug)][0]`,
        { slug }
      ),
      client.fetch(
        `*[_type == "jobOpening" && status == "active" && slug.current != $slug && _id != $slug][0...3] | order(urgent desc, featured desc, _createdAt desc)`
      ),
      client.fetch(`*[_type == "jobSettings"][0]`),
    ])

    job = fetchedJob
    otherJobs = fetchedOthers || []
    settings = fetchedSettings
  } catch (err: any) {
    console.warn('Failed to fetch job opening details from Sanity:', err.message)
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
        addressLocality: job.location.includes('Singapore') ? 'Singapore' : 'Bangalore',
        addressCountry: job.location.includes('Singapore') ? 'SG' : 'IN',
      },
    },
    jobLocationType: job.workplaceType === 'Remote' ? 'TELECOMMUTE' : undefined,
    applicantLocationRequirements:
      job.workplaceType === 'Remote'
        ? {
            '@type': 'Country',
            name: job.location.includes('India') ? 'India' : 'Singapore',
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
