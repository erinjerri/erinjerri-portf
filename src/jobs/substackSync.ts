import type { TaskConfig } from 'payload'

import { syncSubstackToPosts } from '../utilities/substack/syncSubstackToPosts'

type SubstackSyncTaskIO = {
  input: Record<string, never>
  output: {
    synced: number
    skipped: number
    errors: number
  }
}

const enabled = process.env.SUBSTACK_SYNC_ENABLED === 'true'
const rssURL = process.env.SUBSTACK_RSS_URL || 'https://erinjerri.substack.com/feed'
const mode: 'auto_publish' | 'review' =
  process.env.SUBSTACK_SYNC_MODE === 'auto_publish' ? 'auto_publish' : 'review'
const cron = process.env.SUBSTACK_SYNC_CRON || '0 0 * * * *'
const queue = process.env.SUBSTACK_SYNC_QUEUE || 'substack'

export const substackSyncTask: TaskConfig<SubstackSyncTaskIO> = {
  slug: 'substackSync',
  label: 'Sync Substack posts',
  handler: async ({ req }) => {
    const maxItemsRaw = process.env.SUBSTACK_SYNC_MAX_ITEMS
    const maxItems =
      typeof maxItemsRaw === 'string' && maxItemsRaw.trim().length > 0 ? Number(maxItemsRaw) : undefined

    const maxImagesRaw = process.env.SUBSTACK_SYNC_MAX_IMAGES_PER_POST
    const maxImagesPerPost =
      typeof maxImagesRaw === 'string' && maxImagesRaw.trim().length > 0 ? Number(maxImagesRaw) : undefined

    const forceUpdateEnv = process.env.SUBSTACK_SYNC_FORCE_UPDATE?.trim()
    const downloadImagesEnv = process.env.SUBSTACK_SYNC_DOWNLOAD_IMAGES?.trim()

    const { synced, skipped, errors } = await syncSubstackToPosts({
      payload: req.payload,
      req,
      options: {
        rssURL,
        mode,
        notifyEmail: process.env.SUBSTACK_SYNC_NOTIFY_EMAIL,
        defaultAuthorID: process.env.SUBSTACK_DEFAULT_AUTHOR_ID,
        defaultAuthorEmail: process.env.SUBSTACK_DEFAULT_AUTHOR_EMAIL,
        maxItems: Number.isFinite(maxItems) ? maxItems : undefined,
        forceUpdate: forceUpdateEnv ? forceUpdateEnv === 'true' : undefined,
        downloadImages: downloadImagesEnv ? downloadImagesEnv === 'true' : undefined,
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
