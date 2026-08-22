import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio', '/api/', '/admin-dashboard', '/agent-portal'],
      },
      {
        userAgent: ['GPTBot', 'CCBot', 'ClaudeBot', 'Bytespider', 'PetalBot', 'Amazonbot', 'Diffbot', 'anthropic-ai'],
        disallow: ['/'],
      },
      {
        userAgent: 'Mediapartners-Google',
        allow: '/',
        disallow: ['/studio', '/api/', '/admin-dashboard', '/agent-portal'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/studio', '/api/', '/admin-dashboard', '/agent-portal'],
      },
    ],
    sitemap: 'https://flyingwonders.net/sitemap.xml',
  }
}
