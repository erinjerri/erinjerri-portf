/**
 * Sync Medium posts to Payload CMS posts collection.
 *
 * Fetches from your Medium RSS feed, converts HTML to Lexical,
 * and creates draft posts for review. Run with: pnpm sync:medium
 *
 * Requires: DATABASE_URL (or MONGODB_URI) and PAYLOAD_SECRET in .env or environment.
 * Set MEDIUM_RSS_URL env var to override the default (@erinjerri).
 * Optional: set MEDIUM_SYNC_DOWNLOAD_IMAGES=true to import images into the Media collection.
 */

import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../payload.config'
import { syncMediumToPosts } from '../utilities/medium/syncMediumToPosts'

const RSS_URL = process.env.MEDIUM_RSS_URL || 'https://medium.com/feed/@erinjerri'
const MODE: 'auto_publish' | 'review' =
  process.env.MEDIUM_SYNC_MODE === 'auto_publish' ? 'auto_publish' : 'review'

async function syncMedium(): Promise<void> {
  const payload = await getPayload({ config })

  const forceUpdateEnv = process.env.MEDIUM_SYNC_FORCE_UPDATE?.trim()
  const downloadImagesEnv = process.env.MEDIUM_SYNC_DOWNLOAD_IMAGES?.trim()
  const includeImageSourceLinksEnv = process.env.MEDIUM_SYNC_INCLUDE_IMAGE_SOURCE_LINKS?.trim()

  const { synced, skipped, errors } = await syncMediumToPosts({
    payload,
    options: {
      rssURL: RSS_URL,
      mode: MODE,
      notifyEmail: process.env.MEDIUM_SYNC_NOTIFY_EMAIL,
      defaultAuthorID: process.env.MEDIUM_DEFAULT_AUTHOR_ID,
      defaultAuthorEmail: process.env.MEDIUM_DEFAULT_AUTHOR_EMAIL,
      maxItems: process.env.MEDIUM_SYNC_MAX_ITEMS
        ? Number(process.env.MEDIUM_SYNC_MAX_ITEMS)
        : undefined,
      forceUpdate: forceUpdateEnv ? forceUpdateEnv === 'true' : undefined,
      downloadImages: downloadImagesEnv ? downloadImagesEnv === 'true' : undefined,
      includeImageSourceLinks: includeImageSourceLinksEnv
        ? includeImageSourceLinksEnv === 'true'
        : undefined,
      maxImagesPerPost: process.env.MEDIUM_SYNC_MAX_IMAGES_PER_POST
        ? Number(process.env.MEDIUM_SYNC_MAX_IMAGES_PER_POST)
        : undefined,
    },
  })

  console.log(`\nDone. Synced: ${synced}, Skipped: ${skipped}, Errors: ${errors}`)
}

syncMedium()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
