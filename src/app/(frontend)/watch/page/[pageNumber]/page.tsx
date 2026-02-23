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
  const payload = await getPayload({ config: configPromise })
  const payloadAny = payload as any

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const [watchDocs, categoriesResult] = await Promise.all([
    payloadAny.find({
      collection: 'watch',
      depth: 1,
      limit: 12,
      page: sanitizedPageNumber,
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
        {watchDocs?.page && watchDocs?.totalPages > 1 && (
          <Pagination
            page={watchDocs.page}
            routePrefix="/watch/page"
            totalPages={watchDocs.totalPages}
          />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Videos Page ${pageNumber || ''}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const payloadAny = payload as any

  const { totalDocs } = await payloadAny.count({
    collection: 'watch',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 10)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
