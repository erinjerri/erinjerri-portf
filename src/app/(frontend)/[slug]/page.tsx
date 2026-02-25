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
import { Media as MediaComponent } from '@/components/Media'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
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

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
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
  const page = await getPageBySlug(decodedSlug, draft)

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout, videoAsset } = page
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
      {selectedVideo && (
        <div className="container mt-8">
          <MediaComponent resource={selectedVideo} />
        </div>
      )}
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const page = await getPageBySlug(decodedSlug, draft)

  return generateMeta({ doc: page })
}

async function getPageBySlug(slug: string, draft: boolean) {
  if (draft) {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
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
        draft: false,
        limit: 1,
        pagination: false,
        overrideAccess: false,
        where: { slug: { equals: slug } },
      })
      return result.docs?.[0] ?? null
    },
    ['page', slug],
    { revalidate: 60, tags: [`page_${slug}`] },
  )
  return getCached()
}
