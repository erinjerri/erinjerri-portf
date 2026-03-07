import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateWatch: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    // Watch listing pages cache off the "watch" tag (see /watch/page.tsx)
    revalidateTag('watch', 'max')

    if (doc._status === 'published') {
      const path = `/watch/${doc.slug}`

      payload.logger.info(`Revalidating watch doc at path: ${path}`)

      revalidatePath(path)
      revalidatePath('/watch')
      revalidatePath('/watch/page')
      revalidateTag('watch-sitemap', 'max')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `/watch/${previousDoc.slug}`

      payload.logger.info(`Revalidating old watch doc at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidatePath('/watch')
      revalidatePath('/watch/page')
      revalidateTag('watch-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/watch/${doc?.slug}`

    revalidatePath(path)
    revalidatePath('/watch')
    revalidatePath('/watch/page')
    revalidateTag('watch', 'max')
    revalidateTag('watch-sitemap', 'max')
  }

  return doc
}
