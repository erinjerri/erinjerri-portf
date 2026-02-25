import type { Metadata } from 'next/types'

import { CategoryFilter } from '@/components/CategoryFilter'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import React from 'react'
import PageClient from './page.client'

const getCachedWatchPage = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    const payloadAny = payload as any
    return Promise.all([
      payloadAny.find({
        collection: 'watch',
        depth: 1,
        limit: 12,
        overrideAccess: false,
        sort: '-publishedAt',
        select: {
          title: true,
          slug: true,
          categories: true,
          meta: true,
        },
      }),
      payload.find({
        collection: 'categories',
        limit: 100,
        overrideAccess: false,
        sort: 'title',
      }),
    ])
  },
  ['watch-list'],
  { revalidate: 60, tags: ['watch'] },
)

export default async function Page() {
  const [watchDocs, categoriesResult] = await getCachedWatchPage()

  const categories = categoriesResult.docs.map((cat) => ({
    id: cat.id,
    title: cat.title,
    slug: cat.slug ?? null,
  }))

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Videos</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="watch"
          currentPage={watchDocs.page}
          limit={12}
          totalDocs={watchDocs.totalDocs}
        />
      </div>

      <CategoryFilter categories={categories} docs={watchDocs.docs} relationTo="watch" />

      <div className="container">
        {watchDocs.totalPages > 1 && watchDocs.page && (
          <Pagination page={watchDocs.page} routePrefix="/watch/page" totalPages={watchDocs.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Videos`,
  }
}
