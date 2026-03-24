/**
 * Sync Paragraph posts to Payload CMS posts collection.
 *
 * Fetches from a Paragraph publication via the public API, converts HTML to Lexical,
 * and creates draft blog posts for review. Run with: pnpm sync:paragraph
 *
 * Requires: DATABASE_URL (or MONGODB_URI) and PAYLOAD_SECRET in .env or environment.
 * Set PARAGRAPH_PUBLICATION to a full publication URL or slug (defaults to @cypherpinay).
 * Optional: set PARAGRAPH_SYNC_DOWNLOAD_IMAGES=true to import images into the Media collection.
 */

import './loadEnv'

import { getPayload } from 'payload'

import config from '../payload.config'
import { syncParagraphToPosts } from '../utilities/paragraph/syncParagraphToPosts'

const PUBLICATION = process.env.PARAGRAPH_PUBLICATION || '@cypherpinay'
const MODE: 'auto_publish' | 'review' =
  process.env.PARAGRAPH_SYNC_MODE === 'auto_publish' ? 'auto_publish' : 'review'

async function syncParagraph(): Promise<void> {
  const payload = await getPayload({ config })

  const forceUpdateEnv = process.env.PARAGRAPH_SYNC_FORCE_UPDATE?.trim()
  const downloadImagesEnv = process.env.PARAGRAPH_SYNC_DOWNLOAD_IMAGES?.trim()
  const includeImageSourceLinksEnv = process.env.PARAGRAPH_SYNC_INCLUDE_IMAGE_SOURCE_LINKS?.trim()

  const { synced, skipped, errors } = await syncParagraphToPosts({
    payload,
    options: {
      publication: PUBLICATION,
      mode: MODE,
      notifyEmail: process.env.PARAGRAPH_SYNC_NOTIFY_EMAIL,
      defaultAuthorID: process.env.PARAGRAPH_DEFAULT_AUTHOR_ID,
      defaultAuthorEmail: process.env.PARAGRAPH_DEFAULT_AUTHOR_EMAIL,
      maxItems: process.env.PARAGRAPH_SYNC_MAX_ITEMS
        ? Number(process.env.PARAGRAPH_SYNC_MAX_ITEMS)
        : undefined,
      forceUpdate: forceUpdateEnv ? forceUpdateEnv === 'true' : undefined,
      downloadImages: downloadImagesEnv ? downloadImagesEnv === 'true' : undefined,
      includeImageSourceLinks: includeImageSourceLinksEnv
        ? includeImageSourceLinksEnv === 'true'
        : undefined,
      maxImagesPerPost: process.env.PARAGRAPH_SYNC_MAX_IMAGES_PER_POST
        ? Number(process.env.PARAGRAPH_SYNC_MAX_IMAGES_PER_POST)
        : undefined,
    },
  })

  console.log(`\nDone. Synced: ${synced}, Skipped: ${skipped}, Errors: ${errors}`)
}

syncParagraph()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
