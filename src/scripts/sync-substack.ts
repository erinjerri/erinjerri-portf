/**
 * Sync Substack posts to Payload CMS posts collection.
 *
 * Fetches from your Substack RSS feed, converts HTML to Lexical,
 * and creates draft posts for review. Run with: pnpm sync:substack
 *
 * Requires: DATABASE_URL (or MONGODB_URI) and PAYLOAD_SECRET in .env or environment.
 * Set SUBSTACK_RSS_URL env var to override the default (erinjerri.substack.com).
 * Optional: set SUBSTACK_SYNC_DOWNLOAD_IMAGES=true to import images into the Media collection.
 */

import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../payload.config'
import { syncSubstackToPosts } from '../utilities/substack/syncSubstackToPosts'

const RSS_URL = process.env.SUBSTACK_RSS_URL || 'https://erinjerri.substack.com/feed'
const MODE: 'auto_publish' | 'review' =
  process.env.SUBSTACK_SYNC_MODE === 'auto_publish' ? 'auto_publish' : 'review'

async function syncSubstack(): Promise<void> {
  const payload = await getPayload({ config })

  const forceUpdateEnv = process.env.SUBSTACK_SYNC_FORCE_UPDATE?.trim()
  const downloadImagesEnv = process.env.SUBSTACK_SYNC_DOWNLOAD_IMAGES?.trim()

  const { synced, skipped, errors } = await syncSubstackToPosts({
    payload,
    options: {
      rssURL: RSS_URL,
      mode: MODE,
      notifyEmail: process.env.SUBSTACK_SYNC_NOTIFY_EMAIL,
      defaultAuthorID: process.env.SUBSTACK_DEFAULT_AUTHOR_ID,
      defaultAuthorEmail: process.env.SUBSTACK_DEFAULT_AUTHOR_EMAIL,
      maxItems: process.env.SUBSTACK_SYNC_MAX_ITEMS
        ? Number(process.env.SUBSTACK_SYNC_MAX_ITEMS)
        : undefined,
      forceUpdate: forceUpdateEnv ? forceUpdateEnv === 'true' : undefined,
      downloadImages: downloadImagesEnv ? downloadImagesEnv === 'true' : undefined,
      maxImagesPerPost: process.env.SUBSTACK_SYNC_MAX_IMAGES_PER_POST
        ? Number(process.env.SUBSTACK_SYNC_MAX_IMAGES_PER_POST)
        : undefined,
    },
  })

  console.log(`\nDone. Synced: ${synced}, Skipped: ${skipped}, Errors: ${errors}`)
}

syncSubstack()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
