import type { Config } from 'src/payload-types'

import { unstable_cache } from 'next/cache'
import { getPayloadClient } from './getPayloadClient'

type Global = keyof Config['globals']

const DEV_GLOBAL_TTL_MS = 30_000
const devGlobalCache = new Map<
  string,
  {
    expiresAt: number
    value: unknown
  }
>()

async function getGlobal(slug: Global, depth = 0): Promise<unknown> {
  const cacheKey = `${slug}:${depth}`

  if (process.env.NODE_ENV === 'development') {
    const cached = devGlobalCache.get(cacheKey)

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value
    }
  }

  const startedAt = Date.now()
  const payload = await getPayloadClient()

  const global = await payload.findGlobal({
    slug,
    depth,
  })

  if (process.env.NODE_ENV === 'development') {
    const elapsedMs = Date.now() - startedAt
    console.log(`[getGlobal] ${slug} depth=${depth} ${elapsedMs}ms`)
    devGlobalCache.set(cacheKey, {
      expiresAt: Date.now() + DEV_GLOBAL_TTL_MS,
      value: global,
    })
  }

  return global
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = (slug: Global, depth = 0) =>
  unstable_cache(async () => getGlobal(slug, depth), [slug, String(depth)], {
    tags: [`global_${slug}`],
  })
