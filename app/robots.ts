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
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'cohere-ai',
        ],
        allow: '/',
        disallow: ['/studio', '/api/', '/admin-dashboard', '/agent-portal'],
      },
      {
        userAgent: ['CCBot', 'Bytespider', 'PetalBot', 'Amazonbot', 'Diffbot'],
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
