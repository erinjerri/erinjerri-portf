import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import React from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { VideoEmbed } from '@/components/VideoEmbed'
import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { getPayloadClient } from '@/utilities/getPayloadClient'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { ReadingProgress } from '@/components/ReadingProgress'

export async function generateStaticParams() {
  try {
    const payload = await getPayloadClient()
    const posts = await payload.find({
      collection: 'posts',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    return posts.docs.map(({ slug }) => ({ slug }))
  } catch (err) {
    console.warn('[generateStaticParams] Skipping posts prebuild:', err)
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await getPostBySlug(decodedSlug, draft)
  const selectedVideo =
    typeof post?.videoAsset === 'object' && post.videoAsset?.mimeType?.includes('video')
      ? post.videoAsset
      : null
  const videoSource = post?.videoSource ?? 'upload'
  const videoUrl = typeof post?.videoUrl === 'string' ? post.videoUrl : null

  if (!post) return <PayloadRedirects url={url} />

  return (
    <article className="pt-16 pb-16">
      <ReadingProgress />
      <PageClient />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />
      <VideoEmbed className="container mt-8" video={selectedVideo} videoSource={videoSource} videoUrl={videoUrl} />

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <RichText className="max-w-[48rem] mx-auto" data={post.content} enableGutter={false} />
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
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
  const post = await getPostBySlug(decodedSlug, draft)

  return generateMeta({ doc: post })
}

const getPostBySlug = async (slug: string, draft: boolean) => {
  if (draft) {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'posts',
      draft: true,
      depth: 2,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
    return result.docs?.[0] ?? null
  }

  const getCached = unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'posts',
        draft: false,
        depth: 2,
        limit: 1,
        pagination: false,
        overrideAccess: false,
        where: { slug: { equals: slug } },
      })
      return result.docs?.[0] ?? null
    },
    ['post', slug],
    { revalidate: 60, tags: [`post_${slug}`] },
  )
  return getCached()
}
