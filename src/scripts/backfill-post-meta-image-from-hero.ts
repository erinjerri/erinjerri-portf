import 'dotenv/config'

import { getPayload } from 'payload'
import config from '../payload.config'

function relationID(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return undefined
}

async function run(): Promise<void> {
  const payload = await getPayload({ config })
  const dryRun = process.env.SUBSTACK_META_BACKFILL_DRY_RUN !== 'false'
  const max = process.env.SUBSTACK_META_BACKFILL_MAX
    ? Number(process.env.SUBSTACK_META_BACKFILL_MAX)
    : Infinity

  let updated = 0
  let scanned = 0
  let page = 1
  const limit = 100
  const examples: Array<{ id: string; slug?: string | null; heroImage: string }> = []

  while (true) {
    const res = await payload.find({
      collection: 'posts',
      depth: 0,
      overrideAccess: true,
      limit,
      page,
      sort: '-updatedAt',
      where: {
        substackId: {
          exists: true,
        },
      },
      select: {
        id: true,
        slug: true,
        heroImage: true,
        meta: true,
      },
    })

    for (const doc of res.docs as Array<{ id: string; slug?: string | null; heroImage?: unknown; meta?: { image?: unknown } }>) {
      scanned++
      const heroImageID = relationID(doc.heroImage)
      const metaImageID = relationID(doc.meta?.image)
      if (!heroImageID || metaImageID) continue

      if (examples.length < 30) {
        examples.push({ id: String(doc.id), slug: doc.slug ?? null, heroImage: heroImageID })
      }

      if (!dryRun && updated < max) {
        await payload.update({
          collection: 'posts',
          id: doc.id,
          data: {
            meta: {
              ...(doc.meta ?? {}),
              image: heroImageID,
            },
          },
          overrideAccess: true,
          context: { disableRevalidate: true },
        })
      }
      updated++
    }

    if (!res.hasNextPage) break
    page++
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        scannedSubstackPosts: scanned,
        postsNeedingBackfill: updated,
        examples,
      },
      null,
      2,
    ),
  )

  if (dryRun) {
    console.log('\nDry run only. Re-run with SUBSTACK_META_BACKFILL_DRY_RUN=false to apply changes.')
  } else {
    console.log('\nBackfill complete.')
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

