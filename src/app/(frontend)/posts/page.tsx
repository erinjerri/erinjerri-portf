import type { Metadata } from 'next/types'

import { CategoryFilter } from '@/components/CategoryFilter'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import React from 'react'
import PageClient from './page.client'

const getCachedPostsPage = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    return Promise.all([
      payload.find({
        collection: 'posts',
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
  ['posts-list'],
  { revalidate: 60, tags: ['posts'] },
)

export default async function Page() {
  const [posts, categoriesResult] = await getCachedPostsPage()

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
          <h1>Posts</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CategoryFilter categories={categories} docs={posts.docs} relationTo="posts" />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Posts`,
  }
}
