import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'

import { syncSubstackToPosts } from '@/utilities/substack/syncSubstackToPosts'

export const maxDuration = 300

const RSS_URL = process.env.SUBSTACK_RSS_URL || 'https://erinjerri.substack.com/feed'
const MODE: 'auto_publish' | 'review' =
  process.env.SUBSTACK_SYNC_MODE === 'auto_publish' ? 'auto_publish' : 'review'

function parseBoolean(input: string | null | undefined): boolean | undefined {
  if (!input) return undefined
  const normalized = input.trim().toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return undefined
}

function parsePositiveInt(input: string | null | undefined): number | undefined {
  if (!input) return undefined
  const parsed = Number(input)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined
}

function resolveSyncMode(requestHeaders: Headers): 'auto_publish' | 'review' {
  const requested = requestHeaders.get('x-substack-sync-mode')
  if (requested === 'auto_publish' || requested === 'review') return requested
  return MODE
}

function parseSourceURLs(raw: string[] | string | null | undefined): string[] | undefined {
  if (!raw) return undefined

  const values = Array.isArray(raw) ? raw : [raw]
  const parsed = values
    .flatMap((value) => value.split(/[\n,]/g))
    .map((value) => value.trim())
    .filter(Boolean)

  return parsed.length > 0 ? parsed : undefined
}

function isAuthorizedByCronSecret(authorization: string | null): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret || !authorization) return false
  return authorization.trim() === `Bearer ${secret}`
}

export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = request.headers
  const authorization = requestHeaders.get('authorization')

  const allowCron = isAuthorizedByCronSecret(authorization)
  const { user } = allowCron ? { user: null } : await payload.auth({ headers: requestHeaders })

  if (!allowCron && !user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    const req = user ? await createLocalReq({ user }, payload) : undefined
    const mode = resolveSyncMode(requestHeaders)
    const syncProfileHeader = requestHeaders.get('x-substack-sync-profile')
    const syncProfile: 'fast' | 'full' =
      syncProfileHeader === 'full' || syncProfileHeader === 'fast'
        ? syncProfileHeader
        : allowCron
          ? 'fast'
          : 'full'
    const alwaysFetchFullArticle =
      parseBoolean(process.env.SUBSTACK_SYNC_ALWAYS_FETCH_FULL_ARTICLE) ??
      (syncProfile === 'full')
    const discoverFromArchive =
      parseBoolean(process.env.SUBSTACK_SYNC_DISCOVER_FROM_ARCHIVE) ?? (syncProfile === 'full')
    const maxItems =
      parsePositiveInt(process.env.SUBSTACK_SYNC_MAX_ITEMS) ??
      (syncProfile === 'fast' ? 5 : undefined)
    const maxImagesPerPost = parsePositiveInt(process.env.SUBSTACK_SYNC_MAX_IMAGES_PER_POST)
    const body = request.headers.get('content-type')?.includes('application/json')
      ? ((await request.json()) as
          | {
              sourceURL?: string
              sourceURLs?: string[] | string
            }
          | null)
      : null
    const sourceURLs =
      parseSourceURLs(body?.sourceURLs) ??
      parseSourceURLs(body?.sourceURL) ??
      parseSourceURLs(requestHeaders.get('x-substack-source-urls')) ??
      parseSourceURLs(process.env.SUBSTACK_SYNC_SOURCE_URLS)

    const result = await syncSubstackToPosts({
      payload,
      req,
      options: {
        rssURL: RSS_URL,
        mode,
        notifyEmail: process.env.SUBSTACK_SYNC_NOTIFY_EMAIL,
        defaultAuthorID: process.env.SUBSTACK_DEFAULT_AUTHOR_ID,
        defaultAuthorEmail: process.env.SUBSTACK_DEFAULT_AUTHOR_EMAIL,
        maxItems,
        forceUpdate: process.env.SUBSTACK_SYNC_FORCE_UPDATE === 'true',
        downloadImages: process.env.SUBSTACK_SYNC_DOWNLOAD_IMAGES === 'true',
        includeImageSourceLinks: process.env.SUBSTACK_SYNC_INCLUDE_IMAGE_SOURCE_LINKS
          ? process.env.SUBSTACK_SYNC_INCLUDE_IMAGE_SOURCE_LINKS === 'true'
          : undefined,
        sourceURLs,
        maxImagesPerPost,
        alwaysFetchFullArticle,
        discoverFromArchive,
      },
    })

    return Response.json({ success: true, mode, syncProfile, ...result })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error syncing Substack posts' })
    return new Response('Error syncing Substack posts.', { status: 500 })
  }
}
