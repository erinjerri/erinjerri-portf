import type { Metadata } from 'next/types'

import { CategoryFilter } from '@/components/CategoryFilter'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const [projects, categoriesResult] = await Promise.all([
    payload.find({
      collection: 'projects',
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
          <h1>Projects</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="projects"
          currentPage={projects.page}
          limit={12}
          totalDocs={projects.totalDocs}
        />
      </div>

      <CategoryFilter categories={categories} docs={projects.docs} relationTo="projects" />

      <div className="container">
        {projects.totalPages > 1 && projects.page && (
          <Pagination page={projects.page} routePrefix="/projects/page" totalPages={projects.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Projects`,
  }
}
