/**
 * Sync Substack posts to Payload CMS posts collection.
 *
 * Fetches from your Substack RSS feed, converts HTML to Lexical,
 * and creates draft posts for review. Run with: pnpm sync:substack
 *
 * Requires: DATABASE_URL (or MONGODB_URI) and PAYLOAD_SECRET in .env or environment.
 * Set SUBSTACK_RSS_URL env var to override the default (erinjerri.substack.com).
 * Images remain on Substack CDN; use a separate script to download and host locally.
 */

import 'dotenv/config'

import { getPayload } from 'payload'
import Parser from 'rss-parser'
import { JSDOM } from 'jsdom'

import config from '../payload.config'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

const RSS_URL = process.env.SUBSTACK_RSS_URL || 'https://erinjerri.substack.com/feed'
const COLLECTION = 'posts'

interface SubstackItem {
  guid?: string
  link?: string
  title?: string
  content?: string
  'content:encoded'?: string
  contentSnippet?: string
  isoDate?: string
}

async function syncSubstack(): Promise<void> {
  const payload = await getPayload({ config })

  const parser = new Parser({
    customFields: {
      item: ['content:encoded'],
    },
  })

  const feed = await parser.parseURL(RSS_URL)
  const items = (feed.items ?? []) as SubstackItem[]

  const editorConfig = await editorConfigFactory.default({ config })

  let synced = 0
  let skipped = 0
  let errors = 0

  for (const item of items.reverse()) {
    const substackId = item.guid || item.link
    if (!substackId) {
      console.warn('⚠️ Skipping item with no guid/link:', item.title)
      skipped++
      continue
    }

    const existing = await payload.find({
      collection: COLLECTION,
      where: { substackId: { equals: substackId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      skipped++
      continue
    }

    const html = item['content:encoded'] || item.content || '<p>No content.</p>'

    let lexicalContent: Record<string, unknown>
    try {
      lexicalContent = convertHTMLToLexical({
        editorConfig,
        html,
        JSDOM,
      }) as Record<string, unknown>
    } catch (err) {
      console.error(`❌ HTML conversion failed for "${item.title}":`, err)
      errors++
      continue
    }

    const slugBase =
      item.link
        ?.split('/')
        .pop()
        ?.split('?')[0]
        ?.replace(/[^a-z0-9-]/gi, '-') || 'no-slug'
    let slug = slugBase
    let attempts = 0

    while (attempts < 5) {
      const exists = await payload.find({
        collection: COLLECTION,
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (exists.docs.length === 0) break
      slug = `${slugBase}-${Date.now().toString(36)}`
      attempts++
    }

    try {
      await payload.create({
        collection: COLLECTION,
        data: {
          title: item.title || 'Untitled',
          slug,
          content: lexicalContent,
          publishedAt: item.isoDate
            ? new Date(item.isoDate).toISOString()
            : new Date().toISOString(),
          substackId,
          _status: 'draft',
          meta: {
            description: item.contentSnippet?.slice(0, 160) ?? undefined,
          },
        },
        overrideAccess: true,
      })
      console.log(`✅ Synced: ${item.title}`)
      synced++
    } catch (err) {
      console.error(`❌ Create failed for "${item.title}":`, err)
      errors++
    }
  }

  console.log(`\nDone. Synced: ${synced}, Skipped: ${skipped}, Errors: ${errors}`)
}

syncSubstack()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
