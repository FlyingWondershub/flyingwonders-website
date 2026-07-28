import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://flyingwonders.net'
  
  const routes = [
    '',
    '/about',
    '/contact',
    '/packages',
    '/reviews',
    '/singapore-attractions',
    '/custom-package',
    '/faq',
    '/pay',
    '/refund',
    '/book',
    '/brochure',
    '/privacy',
    '/terms',
    '/blog',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))
}
