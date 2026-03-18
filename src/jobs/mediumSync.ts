import type { TaskConfig } from 'payload'

import { syncMediumToPosts } from '../utilities/medium/syncMediumToPosts'

type MediumSyncTaskIO = {
  input: Record<string, never>
  output: {
    synced: number
    skipped: number
    errors: number
  }
}

const enabled = process.env.MEDIUM_SYNC_ENABLED === 'true'
const rssURL = process.env.MEDIUM_RSS_URL || 'https://medium.com/feed/@erinjerri'
const mode: 'auto_publish' | 'review' =
  process.env.MEDIUM_SYNC_MODE === 'auto_publish' ? 'auto_publish' : 'review'
const cron = process.env.MEDIUM_SYNC_CRON || '0 30 * * * *'
const queue = process.env.MEDIUM_SYNC_QUEUE || 'medium'

export const mediumSyncTask: TaskConfig<MediumSyncTaskIO> = {
  slug: 'mediumSync',
  label: 'Sync Medium posts',
  handler: async ({ req }) => {
    const maxItemsRaw = process.env.MEDIUM_SYNC_MAX_ITEMS
    const maxItems =
      typeof maxItemsRaw === 'string' && maxItemsRaw.trim().length > 0
        ? Number(maxItemsRaw)
        : undefined

    const maxImagesRaw = process.env.MEDIUM_SYNC_MAX_IMAGES_PER_POST
    const maxImagesPerPost =
      typeof maxImagesRaw === 'string' && maxImagesRaw.trim().length > 0
        ? Number(maxImagesRaw)
        : undefined

    const forceUpdateEnv = process.env.MEDIUM_SYNC_FORCE_UPDATE?.trim()
    const downloadImagesEnv = process.env.MEDIUM_SYNC_DOWNLOAD_IMAGES?.trim()
    const includeImageSourceLinksEnv = process.env.MEDIUM_SYNC_INCLUDE_IMAGE_SOURCE_LINKS?.trim()

    const { synced, skipped, errors } = await syncMediumToPosts({
      payload: req.payload,
      req,
      options: {
        rssURL,
        mode,
        notifyEmail: process.env.MEDIUM_SYNC_NOTIFY_EMAIL,
        defaultAuthorID: process.env.MEDIUM_DEFAULT_AUTHOR_ID,
        defaultAuthorEmail: process.env.MEDIUM_DEFAULT_AUTHOR_EMAIL,
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
