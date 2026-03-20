import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import React from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { resolveHeroMedia } from '@/heros/resolveHeroMedia'
import { generateMeta } from '@/utilities/generateMeta'
import { getPayloadClient, withPayloadClientRetry } from '@/utilities/getPayloadClient'
import { VideoEmbed } from '@/components/VideoEmbed'
import { homeStatic } from '@/endpoints/seed/home-static'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  try {
    const payload = await getPayloadClient()
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

  const renderedPage = page ?? (isBuild && decodedSlug === 'home' ? homeStatic : null)

  if (!renderedPage) {
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

  const resolvedHero = await resolveHeroMedia(renderedPage.hero)

  const hasHomeGridMedia =
    decodedSlug === 'home' &&
    Boolean(
      resolvedHero?.backgroundMedia ||
      resolvedHero?.heroImage1 ||
      resolvedHero?.heroImage2 ||
      resolvedHero?.heroImage3,
    )

  const hero = hasHomeGridMedia
    ? {
        ...resolvedHero,
        type: 'highImpact' as const,
      }
    : resolvedHero

  const { layout, videoAsset, videoSource, videoUrl } = renderedPage
  const selectedVideo = typeof videoAsset === 'object' && videoAsset?.mimeType?.includes('video')
    ? videoAsset
    : null

  return (
    <>
      <article className="pt-16 pb-24">
        <PageClient />

        {draft && <LivePreviewListener />}

        <RenderHero {...hero} />
        <VideoEmbed className="container mt-8" video={selectedVideo} videoSource={videoSource} videoUrl={videoUrl} />
        <RenderBlocks blocks={layout} />
      </article>
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

  try {
    const page = await getPageBySlug(decodedSlug, draft)
    return generateMeta({ doc: page ?? (isBuild && decodedSlug === 'home' ? homeStatic : null) })
  } catch (err) {
    if (!isBuild) throw err
    console.warn('[slug/page] Skipping metadata because DB is unavailable:', err)
    return generateMeta({ doc: decodedSlug === 'home' ? homeStatic : null })
  }

  // Unreachable
}

const getPageBySlug = async (slug: string, draft: boolean) => {
  if (draft) {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'pages',
      depth: 3,
      draft: true,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
    return result.docs?.[0] ?? null
  }

  const fetchPage = async () =>
    withPayloadClientRetry((payload) =>
      payload.find({
        collection: 'pages',
        depth: 3,
        draft: false,
        limit: 1,
        pagination: false,
        overrideAccess: false,
        where: { slug: { equals: slug } },
      }),
    ).then((result) => result.docs?.[0] ?? null)

  if (process.env.NODE_ENV === 'development') {
    return fetchPage()
  }

  const getCached = unstable_cache(fetchPage, ['page', slug, 'depth-3'], {
    revalidate: 60,
    tags: [`page_${slug}`],
  })

  return getCached()
}
