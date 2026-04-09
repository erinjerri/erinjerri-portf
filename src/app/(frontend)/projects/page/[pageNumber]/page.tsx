import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'
import { canonicalUrlForPath, SITE_DEFAULT_DESCRIPTION } from '@/utilities/siteMetadata'

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

  let projects: any

  try {
    const payload = await getPayload({ config: configPromise })
    projects = await payload.find({
      collection: 'projects',
      depth: 1,
      limit: 12,
      page: sanitizedPageNumber,
      overrideAccess: false,
      sort: '-publishedAt',
    })
  } catch (err) {
    if (!isBuild) throw err
    console.warn('[projects/page/[pageNumber]] Skipping prerender because DB is unavailable:', err)
    projects = { docs: [], page: sanitizedPageNumber, totalPages: 1, totalDocs: 0 }
  }

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

      <CollectionArchive docs={projects.docs} relationTo="projects" />

      <div className="container">
        {projects?.page && projects?.totalPages > 1 && (
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

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  const path = `/projects/page/${pageNumber || '1'}`
  return {
    alternates: { canonical: canonicalUrlForPath(path) },
    description: SITE_DEFAULT_DESCRIPTION,
    title: `Projects — page ${pageNumber || ''}`,
  }
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const { totalDocs } = await payload.count({
      collection: 'projects',
      overrideAccess: false,
    })

    const totalPages = Math.ceil(totalDocs / 10)
    const pages: { pageNumber: string }[] = []

    for (let i = 1; i <= totalPages; i++) {
      pages.push({ pageNumber: String(i) })
    }

    return pages
  } catch (err) {
    console.warn('[generateStaticParams] Skipping projects pagination prebuild:', err)
    return []
  }
}
