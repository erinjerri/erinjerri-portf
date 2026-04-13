import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import React from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { resolveHeroMedia } from '@/heros/resolveHeroMedia'
import { enhancePageForRoute } from '@/utilities/enhancePageForRoute'
import { generateMeta } from '@/utilities/generateMeta'
import { withPayloadClientRetry } from '@/utilities/getPayloadClient'
import { VideoEmbed } from '@/components/VideoEmbed'
import { homeStatic } from '@/endpoints/seed/home-static'
import { mergeHomeHireMeLayoutBlocks } from '@/endpoints/seed/home-hire-me-layout'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { cn } from '@/utilities/ui'

export async function generateStaticParams() {
  try {
    const pages = await withPayloadClientRetry((payload) =>
      payload.find({
        collection: 'pages',
        draft: false,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        select: {
          slug: true,
        },
      }),
    )

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

  const enhancedPage = enhancePageForRoute(renderedPage, decodedSlug)

  const resolvedHero = await resolveHeroMedia(enhancedPage.hero)

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

  const { layout, videoAsset, videoSource, videoUrl } = enhancedPage
  const selectedVideo = typeof videoAsset === 'object' && videoAsset?.mimeType?.includes('video')
    ? videoAsset
    : null

  const isHomePrismatic = decodedSlug === 'home'
  const layoutToRender = isHomePrismatic ? mergeHomeHireMeLayoutBlocks(layout) : layout

  return (
    <>
      <article
        className={cn(
          isHomePrismatic ? 'theme-prismatic home-prismatic-scope pt-0 pb-0' : 'pt-16 pb-24',
          decodedSlug === 'about' && 'about-prose-scope',
        )}
      >
        {draft && <LivePreviewListener />}

        <RenderHero
          {...hero}
          pageSlug={decodedSlug}
          visualVariant={isHomePrismatic ? 'prismatic' : undefined}
        />
        {(decodedSlug === 'timebite' || decodedSlug === 'timebite-download') && (
          <p className="container mt-8 max-w-[48rem] text-base leading-relaxed text-muted-foreground">
            TimeBite is an AI-powered productivity and spatial computing system designed for real-world
            workflows.
          </p>
        )}
        <VideoEmbed className="container mt-8" video={selectedVideo} videoSource={videoSource} videoUrl={videoUrl} />
        <RenderBlocks blocks={layoutToRender} pageSlug={decodedSlug} />
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
    const path = decodedSlug === 'home' ? '/' : `/${decodedSlug}`
    return generateMeta({
      doc: page ?? (isBuild && decodedSlug === 'home' ? homeStatic : null),
      canonicalPath: path,
    })
  } catch (err) {
    if (!isBuild) throw err
    console.warn('[slug/page] Skipping metadata because DB is unavailable:', err)
    const path = decodedSlug === 'home' ? '/' : `/${decodedSlug}`
    return generateMeta({
      doc: decodedSlug === 'home' ? homeStatic : null,
      canonicalPath: path,
    })
  }

  // Unreachable
}

const getPageBySlug = async (slug: string, draft: boolean) => {
  if (draft) {
    const result = await withPayloadClientRetry((payload) =>
      payload.find({
        collection: 'pages',
        depth: 3,
        draft: true,
        limit: 1,
        pagination: false,
        overrideAccess: true,
        where: { slug: { equals: slug } },
      }),
    )
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
