import type { TaskConfig } from 'payload'

import { syncParagraphToPosts } from '../utilities/paragraph/syncParagraphToPosts'

type ParagraphSyncTaskIO = {
  input: Record<string, never>
  output: {
    synced: number
    skipped: number
    errors: number
  }
}

const enabled = process.env.PARAGRAPH_SYNC_ENABLED === 'true'
const publication = process.env.PARAGRAPH_PUBLICATION || '@cypherpinay'
const mode: 'auto_publish' | 'review' =
  process.env.PARAGRAPH_SYNC_MODE === 'auto_publish' ? 'auto_publish' : 'review'
const cron = process.env.PARAGRAPH_SYNC_CRON || '0 45 * * * *'
const queue = process.env.PARAGRAPH_SYNC_QUEUE || 'paragraph'

export const paragraphSyncTask: TaskConfig<ParagraphSyncTaskIO> = {
  slug: 'paragraphSync',
  label: 'Sync Paragraph posts',
  handler: async ({ req }) => {
    const maxItemsRaw = process.env.PARAGRAPH_SYNC_MAX_ITEMS
    const maxItems =
      typeof maxItemsRaw === 'string' && maxItemsRaw.trim().length > 0
        ? Number(maxItemsRaw)
        : undefined

    const maxImagesRaw = process.env.PARAGRAPH_SYNC_MAX_IMAGES_PER_POST
    const maxImagesPerPost =
      typeof maxImagesRaw === 'string' && maxImagesRaw.trim().length > 0
        ? Number(maxImagesRaw)
        : undefined

    const forceUpdateEnv = process.env.PARAGRAPH_SYNC_FORCE_UPDATE?.trim()
    const downloadImagesEnv = process.env.PARAGRAPH_SYNC_DOWNLOAD_IMAGES?.trim()
    const includeImageSourceLinksEnv = process.env.PARAGRAPH_SYNC_INCLUDE_IMAGE_SOURCE_LINKS?.trim()

    const { synced, skipped, errors } = await syncParagraphToPosts({
      payload: req.payload,
      req,
      options: {
        publication,
        mode,
        notifyEmail: process.env.PARAGRAPH_SYNC_NOTIFY_EMAIL,
        defaultAuthorID: process.env.PARAGRAPH_DEFAULT_AUTHOR_ID,
        defaultAuthorEmail: process.env.PARAGRAPH_DEFAULT_AUTHOR_EMAIL,
        maxItems: Number.isFinite(maxItems) ? maxItems : undefined,
        forceUpdate: forceUpdateEnv ? forceUpdateEnv === 'true' : undefined,
        downloadImages: downloadImagesEnv ? downloadImagesEnv === 'true' : undefined,
        includeImageSourceLinks: includeImageSourceLinksEnv
          ? includeImageSourceLinksEnv === 'true'
          : undefined,
        maxImagesPerPost: Number.isFinite(maxImagesPerPost) ? maxImagesPerPost : undefined,
      },
    })

    return {
      output: { synced, skipped, errors },
    }
  },
  schedule: enabled
    ? [
        {
          cron,
          queue,
        },
      ]
    : [],
}
