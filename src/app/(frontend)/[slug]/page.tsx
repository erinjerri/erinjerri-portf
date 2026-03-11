import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import React from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { VideoEmbed } from '@/components/VideoEmbed'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const pages = await payload.find({
      collection: 'pages',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    return (
      pages.docs
        ?.filter((doc) => doc.slug !== 'home')
        .map(({ slug }) => ({ slug })) ?? []
    )
  } catch (err) {
    console.warn('[generateStaticParams] Skipping pages prebuild:', err)
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

  let page: Awaited<ReturnType<typeof getPageBySlug>> | null = null

  try {
    page = await getPageBySlug(decodedSlug, draft)
  } catch (err) {
    if (!isBuild) throw err
    console.warn('[slug/page] Skipping prerender because DB is unavailable:', err)
    page = null
  }

  if (!page) {
    if (isBuild) {
      // Avoid DB-backed redirects lookup during build when the DB is unavailable.
      return (
        <article className="pt-16 pb-24">
          <div className="container">
            <h1 className="text-2xl font-bold">Loading…</h1>
          </div>
        </article>
      )
    }
    return <PayloadRedirects url={url} />
  }

  const { hero, layout, videoAsset, videoSource, videoUrl } = page
  const selectedVideo = typeof videoAsset === 'object' && videoAsset?.mimeType?.includes('video')
    ? videoAsset
    : null

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <VideoEmbed className="container mt-8" video={selectedVideo} videoSource={videoSource} videoUrl={videoUrl} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

  try {
    const page = await getPageBySlug(decodedSlug, draft)
    return generateMeta({ doc: page })
  } catch (err) {
    if (!isBuild) throw err
    console.warn('[slug/page] Skipping metadata because DB is unavailable:', err)
    return generateMeta({ doc: null })
  }

  // Unreachable
}

async function getPageBySlug(slug: string, draft: boolean) {
  if (draft) {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      depth: 2,
      draft: true,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
    return result.docs?.[0] ?? null
  }

  const getCached = unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'pages',
        depth: 2,
        draft: false,
        limit: 1,
        pagination: false,
        overrideAccess: false,
        where: { slug: { equals: slug } },
      })
      return result.docs?.[0] ?? null
    },
    ['page', slug, 'depth-2'],
    { revalidate: 60, tags: [`page_${slug}`] },
  )
  return getCached()
}
