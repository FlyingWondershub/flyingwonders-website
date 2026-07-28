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
      'https://instagram.com',
      'https://facebook.com',
      'https://youtube.com'
    ],
    'areaServed': ['Singapore', 'India'],
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(travelAgencySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  )
}
