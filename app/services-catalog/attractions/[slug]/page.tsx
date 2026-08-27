import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllAttractions, getAttractionBySlug, slugifyAttractionName } from '../../../../utils/attractions'
import AdBanner from '../../../../components/AdBanner'
import AttractionDetailClient from '../../../../components/AttractionDetailClient'

export const revalidate = 600

export async function generateStaticParams() {
  const attractions = await getAllAttractions()
  return attractions.map(a => ({
    slug: a.slug || slugifyAttractionName(a.name)
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const attraction = await getAttractionBySlug(slug)

  if (!attraction) {
    return {
      title: 'Attraction Not Found | Flying Wonders Singapore',
      description: 'The requested destination attraction could not be found.'
    }
  }

  const imageUrl = attraction.coverImageUrl.startsWith('http')
    ? attraction.coverImageUrl
    : `https://flyingwonders.net${attraction.coverImageUrl}`

  return {
    title: `${attraction.name} — Visitor Guide, Timings & Mobile App | Flying Wonders`,
    description: `${attraction.description.slice(0, 160)}... Must-do experiences, operating hours, pro-tips, and official app details.`,
    keywords: [
      attraction.name,
      `${attraction.name} Singapore`,
      `${attraction.name} Timings`,
      `${attraction.name} Must Do Things`,
      `${attraction.name} Pro Tips`,
      `${attraction.name} Mobile App Download`,
      'Singapore Tourist Attractions',
      'Singapore DMC Ticket Inventory'
    ],
    openGraph: {
      title: `${attraction.name} | Flying Wonders Destination Guide`,
      description: attraction.description,
      url: `https://flyingwonders.net/services-catalog/attractions/${attraction.slug || slugifyAttractionName(attraction.name)}`,
      siteName: 'Flying Wonders',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: attraction.name,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${attraction.name} | Flying Wonders Singapore`,
      description: attraction.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://flyingwonders.net/services-catalog/attractions/${attraction.slug || slugifyAttractionName(attraction.name)}`
    }
  }
}

export default async function AttractionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const attraction = await getAttractionBySlug(slug)

  if (!attraction) {
    notFound()
  }

  // Structured Data (JSON-LD) for Attraction SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: attraction.name,
    description: attraction.description,
    image: attraction.coverImageUrl,
    touristType: attraction.category || 'Sightseeing / Theme Park',
    address: {
      '@type': 'PostalAddress',
      streetAddress: attraction.locationAddress || attraction.destination,
      addressLocality: attraction.destination,
      addressCountry: attraction.destination.includes('Malaysia') ? 'MY' : 'SG'
    },
    amenityFeature: (attraction.features || []).map(f => ({
      '@type': 'LocationFeatureSpecification',
      name: f,
      value: true
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AttractionDetailClient attraction={attraction} />
      <div style={{ maxWidth: '1200px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>
        <AdBanner slotId="attraction_detail_bottom_slot" category="b2b" />
      </div>
    </>
  )
}
