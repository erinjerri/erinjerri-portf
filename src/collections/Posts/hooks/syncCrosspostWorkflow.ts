import type { CollectionBeforeChangeHook } from 'payload'

import type { Post } from '../../../payload-types'

const toISODateString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return undefined
}

const isPublishedWorkflowStatus = (
  value: Post['crosspostReviewStatus'] | undefined,
): value is 'approved' | 'auto_published' => value === 'approved' || value === 'auto_published'

export const syncCrosspostWorkflow: CollectionBeforeChangeHook<Post> = ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data

  const nextWorkflowStatus =
    data.crosspostReviewStatus ?? originalDoc?.crosspostReviewStatus ?? undefined

  if (!isPublishedWorkflowStatus(nextWorkflowStatus)) {
    return data
  }

  const nextData: Partial<Post> = { ...data }

  // When an imported cross-post is approved in admin, make the document publicly readable.
  if (!nextData._status && originalDoc?._status !== 'published') {
    nextData._status = 'published'
  }

  const sourcePublishedAt = toISODateString(req.data?.publishedAt)
  const isPublishingNow = originalDoc?._status !== 'published' && nextData._status === 'published'

  // Freshly approved imports should surface on listing pages even if their source has an old date.
  // If the editor provided a specific date in this request, respect it.
  if (isPublishingNow) {
    nextData.publishedAt = sourcePublishedAt ?? new Date().toISOString()
  } else if (!nextData.publishedAt && !originalDoc?.publishedAt) {
    nextData.publishedAt = sourcePublishedAt ?? new Date().toISOString()
  }

  return nextData
}
