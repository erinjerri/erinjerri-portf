import 'dotenv/config'

import { getPayload } from 'payload'
import config from '../payload.config'

type LexicalNode = Record<string, unknown>

const DRY_RUN = process.env.SUBSTACK_CLEANUP_DRY_RUN !== 'false'
const CONFIRM = process.env.SUBSTACK_CLEANUP_CONFIRM === 'true'
const MAX_DELETE = process.env.SUBSTACK_CLEANUP_MAX_DELETE
  ? Number(process.env.SUBSTACK_CLEANUP_MAX_DELETE)
  : Infinity

function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function collectMediaIDsFromLexical(value: unknown, out: Set<string>): void {
  const visit = (v: unknown): void => {
    if (!v) return
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return
    if (Array.isArray(v)) {
      for (const x of v) visit(x)
      return
    }
    if (typeof v === 'object') {
      const o = v as LexicalNode

      // Lexical upload node shapes we’ve seen:
      // { type: 'upload', relationTo: 'media', value: { id } } OR value: 'id'
      if (o.type === 'upload') {
        const relationTo = o.relationTo
        if (relationTo === 'media' || relationTo == null) {
          const val = o.value
          if (typeof val === 'string') out.add(val)
          if (val && typeof val === 'object' && typeof (val as any).id === 'string') out.add((val as any).id)
        }
      }

      // Sometimes upload refs are nested
      if (o.relationTo === 'media') {
        const val = (o as any).value
        if (typeof val === 'string') out.add(val)
        if (val && typeof val === 'object' && typeof val.id === 'string') out.add(val.id)
      }

      if (o.fields && typeof o.fields === 'object') {
        const f = o.fields as any
        if (f?.relationTo === 'media') {
          const val = f.value
          if (typeof val === 'string') out.add(val)
          if (val && typeof val === 'object' && typeof val.id === 'string') out.add(val.id)
        }
      }

      for (const x of Object.values(o)) visit(x)
    }
  }

  visit(value)
}

function isSubstackImportedFilename(filename: string, postTitleSlugs: Set<string>): boolean {
  const lower = filename.toLowerCase()
  if (lower.startsWith('substack-')) return true
  for (const slug of postTitleSlugs) {
    if (lower.startsWith(slug)) return true
  }
  return false
}

async function main(): Promise<void> {
  const payload = await getPayload({ config })

  // 1) Gather Substack post title slugs + referenced media IDs from ALL posts content/hero/meta
  const referencedMediaIDs = new Set<string>()
  const substackPostTitleSlugs = new Set<string>()

  let page = 1
  const limit = 100
  while (true) {
    const res = await payload.find({
      collection: 'posts',
      depth: 0,
      overrideAccess: true,
      limit,
      page,
      sort: '-updatedAt',
      select: {
        id: true,
        title: true,
        substackId: true,
        heroImage: true,
        meta: true,
        content: true,
      },
    })

    for (const doc of res.docs as any[]) {
      if (doc?.heroImage) referencedMediaIDs.add(String(typeof doc.heroImage === 'object' ? doc.heroImage.id : doc.heroImage))
      if (doc?.meta?.image)
        referencedMediaIDs.add(String(typeof doc.meta.image === 'object' ? doc.meta.image.id : doc.meta.image))

      collectMediaIDsFromLexical(doc?.content, referencedMediaIDs)

      if (doc?.substackId && typeof doc?.title === 'string') {
        substackPostTitleSlugs.add(toSlug(doc.title))
      }
    }

    if (!res.hasNextPage) break
    page++
  }

  // 2) Fetch all media docs and find “Substack-imported” ones that are NOT referenced
  const media = await payload.find({
    collection: 'media',
    depth: 0,
    overrideAccess: true,
    limit: 2000,
    pagination: false,
    sort: '-createdAt',
    select: { id: true, filename: true, mimeType: true, createdAt: true },
  })

  const candidates: Array<{ id: string; filename: string; createdAt?: string | null }> = []
  for (const m of media.docs as any[]) {
    const id = String(m.id)
    const filename = String(m.filename || '')
    const mimeType = String(m.mimeType || '')
    if (!filename) continue
    if (!mimeType.startsWith('image/')) continue
    if (!isSubstackImportedFilename(filename, substackPostTitleSlugs)) continue
    if (referencedMediaIDs.has(id)) continue
    candidates.push({ id, filename, createdAt: m.createdAt ?? null })
  }

  console.log(
    JSON.stringify(
      {
        dryRun: DRY_RUN,
        confirm: CONFIRM,
        referencedMediaIDs: referencedMediaIDs.size,
        substackPostTitleSlugs: substackPostTitleSlugs.size,
        totalMedia: media.docs.length,
        deletableCandidates: candidates.length,
        sample: candidates.slice(0, 25),
      },
      null,
      2,
    ),
  )

  if (DRY_RUN || !CONFIRM) {
    console.log(
      '\nDry run only. To actually delete, re-run with SUBSTACK_CLEANUP_CONFIRM=true SUBSTACK_CLEANUP_DRY_RUN=false',
    )
    return
  }

  let deleted = 0
  for (const c of candidates) {
    if (deleted >= MAX_DELETE) break
    await payload.delete({
      collection: 'media',
      id: c.id,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    deleted++
  }

  console.log(`\nDeleted ${deleted} media docs.`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

