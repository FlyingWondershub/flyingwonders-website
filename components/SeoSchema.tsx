import React from 'react'

export default function SeoSchema() {
  const travelAgencySchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    'name': 'Flying Wonders Pvt Ltd',
    'image': 'https://flyingwonders.net/images/hero/singapore-hero-1.jpg',
    '@id': 'https://flyingwonders.net/#travelagency',
    'url': 'https://flyingwonders.net',
    'telephone': '+91-9886171251',
    'priceRange': '$$$',
    'address': [
      {
        '@type': 'PostalAddress',
        'streetAddress': '#74, 4th Cross, SBM Colony, BSK 1st Stage',
        'addressLocality': 'Bangalore',
        'addressRegion': 'Karnataka',
        'postalCode': '560050',
        'addressCountry': 'IN'
      },
      {
        '@type': 'PostalAddress',
        'streetAddress': 'Central Singapore',
        'addressLocality': 'Singapore',
        'addressCountry': 'SG'
      }
    ],
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 12.9367,
      'longitude': 77.5627
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      'opens': '09:00',
      'closes': '20:00'
    },
    'sameAs': [
      'https://www.instagram.com/flyingwonders.sg/',
      'https://www.facebook.com/profile.php?id=61585495532807',
      'https://www.youtube.com/@flyingwonders7886'
    ],
    'areaServed': [
      { '@type': 'Country', 'name': 'Singapore' },
      { '@type': 'Country', 'name': 'India' },
      { '@type': 'Country', 'name': 'Malaysia' }
    ],
    'knowsAbout': [
      'Singapore Destination Management Company (DMC)',
      'B2B Travel Agent Wholesale Packages',
      'Universal Studios Singapore Attraction E-Tickets',
      'Singapore Visa Processing & Consultation',
      'Karnataka Heritage & Wildlife Safari Tours',
      'Changi Airport Transfers & Private Transport',
      'Corporate Travel & MICE Management'
    ],
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': 'DMC & B2B Travel Services',
      'itemListElement': [
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            'name': 'B2B Wholesale Travel Agent Packages',
            'description': 'Direct ground handling, nett rates, and white-label itineraries for travel agents.'
          }
        },
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            'name': 'Singapore Attraction E-Tickets',
            'description': 'Instant e-tickets for major Singapore attractions with zero transaction fees.'
          }
        }
      ]
    },
    'description': 'Premier Destination Management Company (DMC) specializing in Singapore B2B travel agent wholesale rates, custom holiday packages, attraction e-tickets, and Changi airport transfers.'
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Flying Wonders',
    'url': 'https://flyingwonders.net',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://flyingwonders.net/singapore-attractions?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }

  const singaporeDestSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    'name': 'Singapore',
    'description': 'Singapore is a global city-state known for world-class attractions, Michelin-starred food, iconic gardens, and seamless connectivity. A premier destination for Indian travellers.',
    'url': 'https://flyingwonders.net',
    'image': 'https://flyingwonders.net/images/hero/singapore-hero-1.jpg',
    'touristType': ['Family', 'Couple', 'Honeymoon', 'Corporate', 'B2B Agent'],
    'geo': { '@type': 'GeoCoordinates', 'latitude': 1.3521, 'longitude': 103.8198 },
    'hasMap': 'https://maps.app.goo.gl/singapore',
    'includesAttraction': [
      { '@type': 'TouristAttraction', 'name': 'Universal Studios Singapore', 'url': 'https://flyingwonders.net/singapore-attractions' },
      { '@type': 'TouristAttraction', 'name': 'Gardens by the Bay', 'url': 'https://flyingwonders.net/singapore-attractions' },
      { '@type': 'TouristAttraction', 'name': 'Singapore Night Safari', 'url': 'https://flyingwonders.net/singapore-attractions' },
      { '@type': 'TouristAttraction', 'name': 'Sentosa Island', 'url': 'https://flyingwonders.net/singapore-attractions' }
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(travelAgencySchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(singaporeDestSchema) }} />
    </>
  )
}
