import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://example.com'

export default function robots(): MetadataRoute.Robots {
  const poetryHostname = process.env.NEXT_PUBLIC_POETRY_HOSTNAME?.trim()
  const sitemaps = [
    `${SITE_URL}/pages-sitemap.xml`,
    `${SITE_URL}/posts-sitemap.xml`,
    `${SITE_URL}/projects-sitemap.xml`,
    `${SITE_URL}/watch-sitemap.xml`,
    ...(poetryHostname ? [`https://${poetryHostname}/poetry-sitemap.xml`] : []),
  ]

  return {
    rules: [
      {
        userAgent: '*',
        disallow: '/admin/',
      },
    ],
    sitemap: sitemaps,
  }
}
