import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/visa-checker',
          '/currency-converter',
          '/border-traffic',
          '/flight-tracker',
          '/travel-tools',
          '/singapore-attractions',
          '/ai-planner',
          '/packages',
          '/blog',
        ],
        disallow: ['/studio', '/api/'],
      }
    ],
    sitemap: 'https://flyingwonders.net/sitemap.xml',
  }
}

