import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateWatch: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/watch/${doc.slug}`

      payload.logger.info(`Revalidating watch doc at path: ${path}`)

      revalidatePath(path)
      revalidateTag('watch-sitemap')
    }

    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/watch/${previousDoc.slug}`

      payload.logger.info(`Revalidating old watch doc at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('watch-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/watch/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('watch-sitemap')
  }

  return doc
}
