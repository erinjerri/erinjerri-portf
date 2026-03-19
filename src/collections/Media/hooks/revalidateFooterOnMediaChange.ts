import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Revalidate footer cache when media changes.
 * Footer social icons reference media; without this, icon updates
 * (re-upload, URL fix) wouldn't invalidate the cached footer.
 */
export const revalidateFooterOnMediaChange: CollectionAfterChangeHook = ({
  req: { payload, context },
}) => {
  if (context?.disableRevalidate) return

  payload.logger.info('[Media] Revalidating footer and home page (media changed)')
  try {
    revalidateTag('global_footer')
    revalidateTag('page_home')
    revalidatePath('/')
  } catch (err) {
    const msg = String((err as Error)?.message || err)
    if (!msg.includes('static generation store')) {
      payload.logger.warn(`[Media] Skipping footer revalidation in this runtime: ${msg}`)
    }
  }
}

export const revalidateFooterOnMediaDelete: CollectionAfterDeleteHook = ({
  req: { payload, context },
}) => {
  if (context?.disableRevalidate) return

  payload.logger.info('[Media] Revalidating footer and home page (media deleted)')
  try {
    revalidateTag('global_footer')
    revalidateTag('page_home')
    revalidatePath('/')
  } catch (err) {
    const msg = String((err as Error)?.message || err)
    if (!msg.includes('static generation store')) {
      payload.logger.warn(`[Media] Skipping footer revalidation in this runtime: ${msg}`)
    }
  }
}
