import './loadEnv'

import fs from 'fs'
import path from 'path'

import { getPayload } from 'payload'

/**
 * Writes a page's published hero + layout to a JSON file in the repo.
 *
 * Payload's version history is not an archive here: `maxPerDoc` is 50 and dev
 * autosave fires every 15s, so an editing session can push an older layout off
 * the bottom in minutes. This snapshot is committed to git, so it survives the
 * version cap, a bad publish, and the database itself.
 *
 * Read-only against Payload — it never writes to the CMS.
 *
 *   pnpm snapshot:layout                 # home
 *   PAGE_SLUG=speaking-info pnpm snapshot:layout
 *   SNAPSHOT_LABEL=v1 pnpm snapshot:layout
 */

const SLUG = process.env.PAGE_SLUG?.trim() || 'home'
const LABEL = process.env.SNAPSHOT_LABEL?.trim() || new Date().toISOString().slice(0, 10)
const OUT_DIR = path.resolve(process.cwd(), 'snapshots/page-layouts')

async function run(): Promise<void> {
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: SLUG } },
  })

  const page = result.docs[0]
  if (!page) {
    throw new Error(`Page /${SLUG} not found.`)
  }

  const layout = Array.isArray(page.layout) ? page.layout : []

  const snapshot = {
    capturedAt: new Date().toISOString(),
    label: LABEL,
    slug: SLUG,
    title: page.title,
    status: page._status,
    /** `hero` is a separate field from `layout` and renders above it. */
    hero: page.hero ?? null,
    blockOrder: layout.map((b) => (b as { blockType?: string }).blockType),
    layout,
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const file = path.join(OUT_DIR, `${SLUG}-${LABEL}.json`)
  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2) + '\n')

  payload.logger.info(`Snapshot written: ${path.relative(process.cwd(), file)}`)
  payload.logger.info(`  ${layout.length} blocks | hero.type=${(page.hero as { type?: string })?.type ?? 'none'}`)
  payload.logger.info(`  ${snapshot.blockOrder.join(' -> ')}`)
  payload.logger.info('Commit this file. It is the only copy that survives the 50-version cap.')
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
