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
    revalidateTag('global_footer')
  }
}

export const revalidateFooterOnMediaDelete: CollectionAfterDeleteHook = ({
  req: { payload, context },
}) => {
  if (!context?.disableRevalidate) {
    payload.logger.info('[Media] Revalidating footer (media deleted)')
    revalidateTag('global_footer')
  }
}
