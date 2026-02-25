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

import { WatchVideoHero } from '@/heros/WatchVideoHero'
import { formatAuthors } from '@/utilities/formatAuthors'
import { formatDateTime } from '@/utilities/formatDateTime'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { ReadingProgress } from '@/components/ReadingProgress'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const payloadAny = payload as any

  const watchDocs = await payloadAny.find({
    collection: 'watch',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = watchDocs.docs.map(({ slug }: { slug: string }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function WatchPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/watch/' + decodedSlug
  const watchDoc = await getWatchBySlug(decodedSlug, draft)

  if (!watchDoc) return <PayloadRedirects url={url} />

  const selectedVideo =
    typeof watchDoc.videoAsset === 'object' && watchDoc.videoAsset?.mimeType?.includes('video')
      ? watchDoc.videoAsset
      : null
  const heroImage =
    typeof watchDoc.heroImage === 'object' && watchDoc.heroImage ? watchDoc.heroImage : null
  const videoSource = watchDoc.videoSource ?? 'upload'
  const videoUrl = typeof watchDoc.videoUrl === 'string' ? watchDoc.videoUrl : null
  const hasAuthors =
    watchDoc.populatedAuthors &&
    watchDoc.populatedAuthors.length > 0 &&
    formatAuthors(watchDoc.populatedAuthors) !== ''

  return (
    <article className="pt-16 pb-24">
      <ReadingProgress />
      <PageClient />

      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      {/* Large playable video hero - designcode.io style */}
      <WatchVideoHero
        video={selectedVideo}
        videoUrl={videoUrl}
        videoSource={videoSource}
        heroImage={heroImage}
      />

      {/* Blog-style content: title, meta, description */}
      <div className="container mt-12 max-w-[52rem] mx-auto">
        <header className="mb-10">
          {watchDoc.categories && watchDoc.categories.length > 0 && (
            <div className="uppercase text-sm text-muted-foreground mb-4">
              {watchDoc.categories
                .map((cat: { title?: string } | null) =>
                  typeof cat === 'object' && cat?.title ? cat.title : null,
                )
                .filter(Boolean)
                .join(', ')}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
            {watchDoc.title}
          </h1>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            {watchDoc.publishedAt && (
              <time dateTime={watchDoc.publishedAt}>
                {formatDateTime(watchDoc.publishedAt)}
              </time>
            )}
            {hasAuthors && (
              <span>{formatAuthors(watchDoc.populatedAuthors)}</span>
            )}
          </div>
        </header>

        <div className="prose dark:prose-invert max-w-none">
          <RichText data={watchDoc.content} enableGutter={false} />
        </div>

        {/* Placeholder for future: slides, downloads, etc. */}
        {/* <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Resources</h2>
          ...
        </div> */}

        {watchDoc.relatedWatch && watchDoc.relatedWatch.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Talks</h2>
            <RelatedPosts
              className="max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={watchDoc.relatedWatch.filter((doc: unknown) => typeof doc === 'object')}
              relationTo="watch"
            />
          </div>
        )}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const watchDoc = await getWatchBySlug(decodedSlug, draft)

  return generateMeta({ doc: watchDoc as Project })
}

async function getWatchBySlug(slug: string, draft: boolean) {
  if (draft) {
    const payload = await getPayload({ config: configPromise })
    const result = await (payload as any).find({
      collection: 'watch',
      draft: true,
      depth: 2,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { slug: { equals: slug } },
    })
    return result.docs?.[0] ?? null
  }

  const getCached = unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })
      const result = await (payload as any).find({
        collection: 'watch',
        draft: false,
        depth: 2,
        limit: 1,
        overrideAccess: false,
        pagination: false,
        where: { slug: { equals: slug } },
      })
      return result.docs?.[0] ?? null
    },
    ['watch', slug],
    { revalidate: 60, tags: [`watch_${slug}`] },
  )
  return getCached()
}
