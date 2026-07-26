import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { POETRY_ORIGIN } from '@/utilities/poetry'

const getPoetrySitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })

    const results = await payload.find({
      collection: 'poetry',
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
    const sitemap = [
      {
        loc: `${POETRY_ORIGIN}/`,
        lastmod: dateFallback,
      },
      ...(results.docs
        ? results.docs
            .filter((poem) => Boolean(poem?.slug))
            .map((poem) => ({
              loc: `${POETRY_ORIGIN}/poetry/${poem?.slug}`,
              lastmod: poem.updatedAt || dateFallback,
            }))
        : []),
    ]

    return sitemap
  },
  ['poetry-sitemap'],
  {
    tags: ['poetry-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPoetrySitemap()

  return getServerSideSitemap(sitemap)
}
