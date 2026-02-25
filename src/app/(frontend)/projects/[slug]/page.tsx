import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import React from 'react'
import RichText from '@/components/RichText'

import type { Project } from '@/payload-types'

import { Media as MediaComponent } from '@/components/Media'
import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { ReadingProgress } from '@/components/ReadingProgress'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const projects = await payload.find({
    collection: 'projects',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = projects.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function ProjectPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/projects/' + decodedSlug
  const project = await getProjectBySlug(decodedSlug, draft)
  const selectedVideo =
    typeof project?.videoAsset === 'object' && project.videoAsset?.mimeType?.includes('video')
      ? project.videoAsset
      : null

  if (!project) return <PayloadRedirects url={url} />

  return (
    <article className="pt-16 pb-16">
      <ReadingProgress />
      <PageClient />

      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={project} />
      {selectedVideo && (
        <div className="container mt-8">
          <MediaComponent resource={selectedVideo} />
        </div>
      )}

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <RichText className="max-w-[48rem] mx-auto" data={project.content} enableGutter={false} />
          {project.relatedProjects && project.relatedProjects.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={project.relatedProjects.filter((doc) => typeof doc === 'object')}
              relationTo="projects"
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const project = await getProjectBySlug(decodedSlug, draft)

  return generateMeta({ doc: project })
}

async function getProjectBySlug(slug: string, draft: boolean) {
  if (draft) {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'projects',
      draft: true,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
    return (result.docs?.[0] as Project | null) ?? null
  }

  const getCached = unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'projects',
        draft: false,
        limit: 1,
        pagination: false,
        overrideAccess: false,
        where: { slug: { equals: slug } },
      })
      return (result.docs?.[0] as Project | null) ?? null
    },
    ['project', slug],
    { revalidate: 60, tags: [`project_${slug}`] },
  )
  return getCached()
}
