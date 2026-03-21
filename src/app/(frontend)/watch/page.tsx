import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import React from 'react'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { resolveHeroMedia } from '@/heros/resolveHeroMedia'
import { generateMeta } from '@/utilities/generateMeta'
import { Media as MediaComponent } from '@/components/Media'
import { getPayloadClient, withPayloadClientRetry } from '@/utilities/getPayloadClient'

const WATCH_PAGE_SLUG = 'watch'

export default async function Page() {
  const { isEnabled: draft } = await draftMode()
  const url = `/${WATCH_PAGE_SLUG}`
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

  let page: any | null = null

  try {
    page = await getPageBySlug(WATCH_PAGE_SLUG, draft)
  } catch (err) {
    if (!isBuild) throw err
    console.warn('[watch/page] Skipping prerender because DB is unavailable:', err)
    page = null
  }

  if (!page) {
    if (isBuild) {
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

  const { hero, layout, videoAsset } = page
  const resolvedHero = await resolveHeroMedia(hero)
  const selectedVideo =
    typeof videoAsset === 'object' && videoAsset?.mimeType?.includes('video') ? videoAsset : null

  return (
    <article className="pt-16 pb-24">
      <PageClient />

      {draft && <LivePreviewListener />}

      <RenderHero {...resolvedHero} />
      {selectedVideo && (
        <div className="container mt-8">
          <MediaComponent resource={selectedVideo} />
        </div>
      )}
      <RenderBlocks blocks={layout} pageSlug="watch" />
    </article>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

  try {
    const page = await getPageBySlug(WATCH_PAGE_SLUG, draft)
    return generateMeta({ doc: page })
  } catch (err) {
    if (!isBuild) throw err
    console.warn('[watch/page] Skipping metadata because DB is unavailable:', err)
    return generateMeta({ doc: null })
  }
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

  const getCached = unstable_cache(
    async () =>
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
      ).then((result) => result.docs?.[0] ?? null),
    ['page', slug, 'depth-3'],
    { revalidate: 60, tags: [`page_${slug}`] },
  )

  return getCached()
}
