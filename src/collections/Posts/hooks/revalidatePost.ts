import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  const safeRevalidate = (path: string) => {
    try {
      revalidatePath(path)
      revalidateTag('posts-sitemap')
    } catch (err) {
      const msg = String((err as Error)?.message || err)
      // Expected in CLI/background jobs (no Next.js static generation store)
      if (!msg.includes('static generation store')) {
        payload.logger.warn(`[Posts] Skipping revalidation: ${msg}`)
      }
    }
  }

  if (doc._status === 'published') {
    const path = `/posts/${doc.slug}`
    payload.logger.info(`Revalidating post at path: ${path}`)
    safeRevalidate(path)
  }

  // If the post was previously published, we need to revalidate the old path
  if (previousDoc?._status === 'published' && doc._status !== 'published') {
    const oldPath = `/posts/${previousDoc.slug}`
    payload.logger.info(`Revalidating old post at path: ${oldPath}`)
    safeRevalidate(oldPath)
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc

  const path = `/posts/${doc?.slug}`
  try {
    revalidatePath(path)
    revalidateTag('posts-sitemap')
  } catch {
    // ignore - can run in CLI/background contexts
  }

  return doc
}
