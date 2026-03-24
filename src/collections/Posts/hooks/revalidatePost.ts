import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { getServerSideURL } from '../../../utilities/getURL'

import type { Post } from '../../../payload-types'

type RevalidateArgs = {
  paths?: string[]
  tags?: string[]
}

function resolveRevalidateBaseURL() {
  const configuredBaseURL = String(getServerSideURL() || '').replace(/\/$/, '')
  const runningInHostedEnv = Boolean(
    process.env.VERCEL ||
      process.env.NETLIFY ||
      process.env.CF_PAGES_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.DEPLOY_PRIME_URL,
  )

  if (runningInHostedEnv) return configuredBaseURL

  // Local/CLI runs often have NEXT_PUBLIC_SERVER_URL set to production;
  // force local revalidate endpoint so local cache is actually invalidated.
  return 'http://localhost:3000'
}

function triggerNextRevalidate(payloadLogger: { warn: (msg: string) => void }, args: RevalidateArgs) {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) return

  const baseURL = resolveRevalidateBaseURL()
  if (!baseURL) return

  void fetch(`${baseURL}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(args),
  }).catch((err) => {
    payloadLogger.warn(`[Posts] Revalidate request failed: ${String((err as Error)?.message || err)}`)
  })
}

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  if (doc._status === 'published') {
    const path = `/posts/${doc.slug}`
    payload.logger.info(`Revalidating post at path: ${path}`)
    triggerNextRevalidate(payload.logger, {
      tags: ['posts', 'posts-sitemap', 'page_blog'],
      paths: [path, '/posts', '/posts/page/1', '/blog'],
    })
  }

  // If the post was previously published, we need to revalidate the old path
  if (previousDoc?._status === 'published' && doc._status !== 'published') {
    const oldPath = `/posts/${previousDoc.slug}`
    payload.logger.info(`Revalidating old post at path: ${oldPath}`)
    triggerNextRevalidate(payload.logger, {
      tags: ['posts', 'posts-sitemap', 'page_blog'],
      paths: [oldPath, '/posts', '/posts/page/1', '/blog'],
    })
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc

  const path = `/posts/${doc?.slug}`
  triggerNextRevalidate(
    // no access to payload logger here, so use console-like interface
    { warn: () => {} },
    {
      tags: ['posts', 'posts-sitemap', 'page_blog'],
      paths: [path, '/posts', '/posts/page/1', '/blog'],
    },
  )

  return doc
}
