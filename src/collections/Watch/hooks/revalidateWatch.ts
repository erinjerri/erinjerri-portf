import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { getServerSideURL } from '../../../utilities/getURL'

type RevalidateArgs = {
  paths?: string[]
  tags?: string[]
}

function triggerNextRevalidate(payloadLogger: { warn: (msg: string) => void }, args: RevalidateArgs) {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) return

  const baseURL = String(getServerSideURL() || '').replace(/\/$/, '')
  if (!baseURL) return

  void fetch(`${baseURL}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(args),
  }).catch((err) => {
    payloadLogger.warn(`[Watch] Revalidate request failed: ${String((err as Error)?.message || err)}`)
  })
}

export const revalidateWatch: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  // Watch listing pages cache off the "watch" tag (see /watch/page.tsx)
  triggerNextRevalidate(payload.logger, {
    tags: ['watch'],
    paths: ['/watch', '/watch/page'],
  })

  if (doc._status === 'published') {
    const path = `/watch/${doc.slug}`
    payload.logger.info(`Revalidating watch doc at path: ${path}`)
    triggerNextRevalidate(payload.logger, {
      tags: ['watch', 'watch-sitemap'],
      paths: [path, '/watch', '/watch/page'],
    })
  }

  if (previousDoc?._status === 'published' && doc._status !== 'published') {
    const oldPath = `/watch/${previousDoc.slug}`
    payload.logger.info(`Revalidating old watch doc at path: ${oldPath}`)
    triggerNextRevalidate(payload.logger, {
      tags: ['watch', 'watch-sitemap'],
      paths: [oldPath, '/watch', '/watch/page'],
    })
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc

  const path = `/watch/${doc?.slug}`
  triggerNextRevalidate(
    // no access to payload logger here, so use console-like interface
    { warn: () => {} },
    {
      tags: ['watch', 'watch-sitemap'],
      paths: [path, '/watch', '/watch/page'],
    },
  )

  return doc
}
