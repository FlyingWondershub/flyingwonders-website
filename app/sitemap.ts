import { MetadataRoute } from 'next';
import { createClient } from 'next-sanity';
import { dataset, projectId, apiVersion } from '../sanity/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://flyingwonders.net'
  const today = new Date().toISOString().split('T')[0]

  // Core pages
  const coreRoutes = [
    { path: '', priority: 1.0, freq: 'daily' },
    { path: '/services-catalog', priority: 0.95, freq: 'daily' },
    { path: '/b2b-directory', priority: 0.95, freq: 'daily' },
    { path: '/b2b-leads', priority: 0.95, freq: 'daily' },
    { path: '/directory', priority: 0.9, freq: 'daily' },
    { path: '/packages', priority: 0.9, freq: 'weekly' },
    { path: '/singapore-attractions', priority: 0.9, freq: 'daily' },
    { path: '/singapore-attractions/promotions', priority: 0.85, freq: 'daily' },
    { path: '/ai-planner', priority: 0.9, freq: 'weekly' },
    { path: '/travel-tools', priority: 0.9, freq: 'daily' },
    { path: '/travel-consulting', priority: 0.9, freq: 'daily' },
    { path: '/study-in-singapore', priority: 0.85, freq: 'daily' },
    { path: '/karnataka', priority: 0.9, freq: 'daily' },
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

   // Convert core routes to sitemap entries
   const coreSitemap = coreRoutes.map((r) => ({
     url: `${baseUrl}${r.path}`,
     lastModified: today,
     changeFrequency: r.freq as MetadataRoute.Sitemap[0]['changeFrequency'],
     priority: r.priority,
   }))

   // Convert tool routes to sitemap entries
   const toolSitemap = toolRoutes.map((r) => ({
     url: `${baseUrl}${r.path}`,
     lastModified: today,
     changeFrequency: r.freq as MetadataRoute.Sitemap[0]['changeFrequency'],
     priority: r.priority,
   }))

   // Dynamic blog routes – fetch all published slugs from Sanity
   const client = createClient({
     projectId,
     dataset,
     apiVersion,
     useCdn: false,
     token: process.env.SANITY_READ_TOKEN,
   })
   const blogSlugs: string[] = await client.fetch("*[_type == \"blogPost\" && isPublished == true].slug.current")
   const blogRoutes = blogSlugs.map((slug) => ({
     url: `${baseUrl}/blog/${slug}`,
     lastModified: today,
     changeFrequency: 'daily' as MetadataRoute.Sitemap[0]['changeFrequency'],
     priority: 0.7,
   }))

   return [...coreSitemap, ...toolSitemap, ...blogRoutes]

}
