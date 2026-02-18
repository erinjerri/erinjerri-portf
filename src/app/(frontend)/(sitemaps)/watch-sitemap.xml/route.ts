import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getWatchSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const payloadAny = payload as any

    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payloadAny.find({
      collection: 'watch',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    const sitemap = results.docs
      ? results.docs
          .filter((doc: { slug?: string }) => Boolean(doc?.slug))
          .map((doc: { slug?: string; updatedAt?: string }) => ({
            loc: `${SITE_URL}/watch/${doc?.slug}`,
            lastmod: doc.updatedAt || dateFallback,
          }))
      : []

    return sitemap
  },
  ['watch-sitemap'],
  {
    tags: ['watch-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getWatchSitemap()

  return getServerSideSitemap(sitemap)
}
