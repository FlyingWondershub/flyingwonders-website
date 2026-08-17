import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://flyingwonders.net'
  const today = new Date().toISOString().split('T')[0]

  // Core pages
  const coreRoutes = [
    { path: '', priority: 1.0, freq: 'daily' },
    { path: '/services-catalog', priority: 0.95, freq: 'daily' },
    { path: '/b2b-directory', priority: 0.95, freq: 'daily' },
    { path: '/directory', priority: 0.9, freq: 'daily' },
    { path: '/packages', priority: 0.9, freq: 'weekly' },
    { path: '/singapore-attractions', priority: 0.9, freq: 'daily' },
    { path: '/singapore-attractions/promotions', priority: 0.85, freq: 'daily' },
    { path: '/ai-planner', priority: 0.9, freq: 'weekly' },
    { path: '/travel-tools', priority: 0.9, freq: 'daily' },
    { path: '/travel-consulting', priority: 0.9, freq: 'daily' },
    { path: '/study-in-singapore', priority: 0.85, freq: 'daily' },
    { path: '/corporate-travel', priority: 0.85, freq: 'weekly' },
    { path: '/instant-quote', priority: 0.85, freq: 'weekly' },
    { path: '/attractions-live', priority: 0.85, freq: 'daily' },
    { path: '/about', priority: 0.8, freq: 'monthly' },
    { path: '/contact', priority: 0.8, freq: 'monthly' },
    { path: '/reviews', priority: 0.8, freq: 'weekly' },
    { path: '/custom-package', priority: 0.8, freq: 'weekly' },
    { path: '/book', priority: 0.75, freq: 'weekly' },
    { path: '/blog', priority: 0.75, freq: 'daily' },
    { path: '/brochure', priority: 0.7, freq: 'monthly' },
    { path: '/faq', priority: 0.7, freq: 'monthly' },
    { path: '/events', priority: 0.7, freq: 'weekly' },
    { path: '/pay', priority: 0.6, freq: 'monthly' },
    { path: '/refund', priority: 0.5, freq: 'yearly' },
    { path: '/privacy', priority: 0.4, freq: 'yearly' },
    { path: '/terms', priority: 0.4, freq: 'yearly' },
  ]

  // Standalone tool pages — daily frequency, high priority (high-volume keyword targets)
  const toolRoutes = [
    { path: '/visa-checker', priority: 0.95, freq: 'daily' },
    { path: '/currency-converter', priority: 0.95, freq: 'daily' },
    { path: '/border-traffic', priority: 0.9, freq: 'hourly' },
    { path: '/flight-tracker', priority: 0.9, freq: 'hourly' },
    { path: '/age-calculator', priority: 0.95, freq: 'daily' },
  ]

  return [...coreRoutes, ...toolRoutes].map(({ path, priority, freq }) => ({
    url: `${baseUrl}${path}`,
    lastModified: today,
    changeFrequency: freq as MetadataRoute.Sitemap[0]['changeFrequency'],
    priority,
  }))
}
