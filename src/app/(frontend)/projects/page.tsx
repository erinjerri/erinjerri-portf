import type { Metadata } from 'next/types'

import { CategoryFilter } from '@/components/CategoryFilter'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import React from 'react'
import PageClient from './page.client'
import { canonicalUrlForPath, SITE_DEFAULT_DESCRIPTION } from '@/utilities/siteMetadata'

const getCachedProjectsPage = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    return Promise.all([
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
  },
  ['projects-list'],
  { revalidate: 60, tags: ['projects'] },
)

export default async function Page() {
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

  let projects: any
  let categoriesResult: any

  try {
    ;[projects, categoriesResult] = await getCachedProjectsPage()
  } catch (err) {
    if (!isBuild) throw err
    console.warn('[projects/page] Skipping prerender because DB is unavailable:', err)
    projects = { docs: [], page: 1, totalPages: 1, totalDocs: 0 }
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
          <Pagination
            page={projects.page}
            routePrefix="/projects/page"
            totalPages={projects.totalPages}
          />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    alternates: { canonical: canonicalUrlForPath('/projects') },
    description: SITE_DEFAULT_DESCRIPTION,
    title: 'Projects',
  }
}
