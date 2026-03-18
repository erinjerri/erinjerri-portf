import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../src/payload.config'

/**
 * Copy one blog post into a watch talk entry so the media blocks stay linked.
 *
 * Usage:
 *   pnpm duplicate:post-to-watch <post-slug> [watch-slug] [--force]
 */

type CLIArgs = {
  postSlug: string
  watchSlug: string
  force: boolean
}

function parseArgs(): CLIArgs {
  const raw = process.argv.slice(2)
  const positional: string[] = []
  let force = false

  raw.forEach((arg) => {
    if (arg === '--force') {
      force = true
      return
    }
    positional.push(arg)
  })

  if (positional.length === 0) {
    console.error('Usage: pnpm duplicate:post-to-watch <post-slug> [watch-slug] [--force]')
    process.exit(1)
  }

  const postSlug = positional[0]
  const watchSlug = positional[1] ?? postSlug

  return { postSlug, watchSlug, force }
}

function toRelationId(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'id' in value && typeof (value as any).id === 'string') {
    return (value as any).id
  }
  return undefined
}

function toRelationArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const ids = value
    .map((item) => toRelationId(item))
    .filter((id): id is string => Boolean(id))
  return ids.length > 0 ? ids : undefined
}

async function main(): Promise<void> {
  const { postSlug, watchSlug, force } = parseArgs()

  const payload = await getPayload({ config })

  const postResult = await payload.find({
    collection: 'posts',
    where: { slug: { equals: postSlug } },
    limit: 1,
    pagination: false,
    overrideAccess: true,
  })

  const post = postResult.docs?.[0]
  if (!post) {
    throw new Error(`Post with slug "${postSlug}" not found.`)
  }

  const watchResult = await payload.find({
    collection: 'watch',
    where: { slug: { equals: watchSlug } },
    limit: 1,
    pagination: false,
    overrideAccess: true,
  })

  const existing = watchResult.docs?.[0]
  if (existing && !force) {
    console.error(
      `watch slug "${watchSlug}" already exists. Rerun with --force to update the existing document.`,
    )
    process.exit(1)
  }

  const watchData: Record<string, unknown> = {
    title: post.title,
    slug: watchSlug,
    heroImage: toRelationId(post.heroImage),
    content: post.content,
    categories: toRelationArray(post.categories) ?? undefined,
    authors: toRelationArray(post.authors) ?? undefined,
    meta: post.meta
      ? {
          ...post.meta,
          image: toRelationId(post.meta.image),
        }
      : undefined,
    publishedAt: post.publishedAt,
    _status: post._status,
  }

  const result = existing
    ? await payload.update({
        collection: 'watch',
        id: existing.id,
        data: watchData,
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'watch',
        data: watchData,
      })

  console.log(`${existing ? 'Updated' : 'Created'} watch doc: ${result.slug} (${result.id})`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
