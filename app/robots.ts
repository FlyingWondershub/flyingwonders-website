import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/custom-package', '/studio', '/api/'],
    },
    sitemap: 'https://flyingwonders.net/sitemap.xml',
  }
}
