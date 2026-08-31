import './loadEnv'

import fs from 'fs'
import path from 'path'

import { getPayload } from 'payload'

import type { Page } from '../payload-types'

/**
 * Restores a layout snapshot back onto a page, as a DRAFT.
 *
 * The counterpart to snapshot-page-layout.ts. Together they make a layout
 * portable: capture it, commit the JSON, and re-apply it later on this database
 * or a fresh one seeded from the same media.
 *
 * Always writes `draft: true`, so the published page is untouched until someone
 * hits Publish. Restores the `hero` field too, since it renders above the
 * layout and is easy to forget.
 *
 *   SNAPSHOT_FILE=home-v1.json pnpm restore:layout
 *   SNAPSHOT_FILE=home-v1.json TARGET_SLUG=home-archive pnpm restore:layout
 *
 * Media is referenced by id. If the target database has different media ids,
 * image fields come back empty and need re-selecting — the copy survives, the
 * uploads do not.
 */

const DIR = path.resolve(process.cwd(), 'snapshots/page-layouts')
const FILE = process.env.SNAPSHOT_FILE?.trim()

async function run(): Promise<void> {
  if (!FILE) {
    throw new Error('Set SNAPSHOT_FILE, e.g. SNAPSHOT_FILE=home-v1.json pnpm restore:layout')
  }

  const src = path.join(DIR, FILE)
  if (!fs.existsSync(src)) {
    throw new Error(`Snapshot not found: ${path.relative(process.cwd(), src)}`)
  }

  const snap = JSON.parse(fs.readFileSync(src, 'utf8'))
  const targetSlug = process.env.TARGET_SLUG?.trim() || snap.slug

  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  const found = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: true,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: targetSlug } },
  })

  const page = found.docs[0]
  if (!page) {
    throw new Error(`Target page /${targetSlug} not found. Create it first, then rerun.`)
  }

  const currentCount = Array.isArray(page.layout) ? page.layout.length : 0

  await payload.update({
    collection: 'pages',
    id: page.id,
    context: { disableRevalidate: true },
    depth: 0,
    draft: true,
    overrideAccess: true,
    data: {
      layout: snap.layout,
      ...(snap.hero ? { hero: snap.hero } : {}),
    } as Partial<Page>,
  })

  payload.logger.info(`Restored "${snap.label}" onto /${targetSlug} as a DRAFT.`)
  payload.logger.info(`  ${currentCount} block(s) replaced by ${snap.layout.length}`)
  payload.logger.info(`  hero.type restored to: ${snap.hero?.type ?? '(not in snapshot)'}`)
  payload.logger.info('Published version untouched. Review at /admin, then Publish.')
  payload.logger.info(
    'If image fields look empty, the media ids differ in this database — re-select the uploads.',
  )
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
