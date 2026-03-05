import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidateTag } from 'next/cache'

/**
 * Revalidate footer cache when media changes.
 * Footer social icons reference media; without this, icon updates
 * (re-upload, URL fix) wouldn't invalidate the cached footer.
 */
export const revalidateFooterOnMediaChange: CollectionAfterChangeHook = ({
  req: { payload, context },
}) => {
  if (!context?.disableRevalidate) {
    payload.logger.info('[Media] Revalidating footer (media changed)')
    try {
      revalidateTag('global_footer', 'max')
    } catch (err) {
      // CLI/background jobs don't run with Next's static generation store.
      // Don't fail media writes when revalidation isn't available.
      payload.logger.warn(
        `[Media] Skipping footer revalidation in this runtime: ${String((err as Error)?.message || err)}`,
      )
    }
  }
}

export const revalidateFooterOnMediaDelete: CollectionAfterDeleteHook = ({
  req: { payload, context },
}) => {
  if (!context?.disableRevalidate) {
    payload.logger.info('[Media] Revalidating footer (media deleted)')
    try {
      revalidateTag('global_footer', 'max')
    } catch (err) {
      payload.logger.warn(
        `[Media] Skipping footer revalidation in this runtime: ${String((err as Error)?.message || err)}`,
      )
    }
  }
}
