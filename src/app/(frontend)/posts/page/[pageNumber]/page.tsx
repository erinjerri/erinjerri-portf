import type { Metadata } from 'next/types'

import { CategoryFilter } from '@/components/CategoryFilter'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  let posts: any
  let categoriesResult: any

  try {
    const payload = await getPayload({ config: configPromise })

    ;[posts, categoriesResult] = await Promise.all([
      payload.find({
        collection: 'posts',
        draft: false,
        depth: 1,
        limit: 12,
        page: sanitizedPageNumber,
        overrideAccess: false,
        sort: '-publishedAt',
        where: {
          _status: {
            equals: 'published',
          },
        },
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
  } catch (err) {
    if (!isBuild) throw err
    console.warn('[posts/page/[pageNumber]] Skipping prerender because DB is unavailable:', err)
    posts = { docs: [], page: sanitizedPageNumber, totalPages: 1, totalDocs: 0 }
    categoriesResult = { docs: [] }
  }

  const categories = categoriesResult.docs.map((cat: { id: string; title: string; slug?: string | null }) => ({
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
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Posts Page ${pageNumber || ''}`,
  }
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const { totalDocs } = await payload.find({
      collection: 'posts',
      draft: false,
      depth: 0,
      limit: 1,
      overrideAccess: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
    })

    const totalPages = Math.ceil(totalDocs / 10)
    const pages: { pageNumber: string }[] = []

    for (let i = 1; i <= totalPages; i++) {
      pages.push({ pageNumber: String(i) })
    }

    return pages
  } catch (err) {
    console.warn('[generateStaticParams] Skipping posts pagination prebuild:', err)
    return []
  }
}
