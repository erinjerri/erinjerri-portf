import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

import { syncSubstackToPosts } from '@/utilities/substack/syncSubstackToPosts'

export const maxDuration = 300

const RSS_URL = process.env.SUBSTACK_RSS_URL || 'https://erinjerri.substack.com/feed'
const MODE: 'auto_publish' | 'review' =
  process.env.SUBSTACK_SYNC_MODE === 'auto_publish' ? 'auto_publish' : 'review'

function resolveSyncMode(headers: Headers): 'auto_publish' | 'review' {
  const requested = headers.get('x-substack-sync-mode')
  if (requested === 'auto_publish' || requested === 'review') return requested
  return MODE
}

function isAuthorizedByCronSecret(authorization: string | null): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret || !authorization) return false
  return authorization.trim() === `Bearer ${secret}`
}

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()
  const authorization = requestHeaders.get('authorization')

  const allowCron = isAuthorizedByCronSecret(authorization)
  const { user } = allowCron ? { user: null } : await payload.auth({ headers: requestHeaders })

  if (!allowCron && !user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    const req = user ? await createLocalReq({ user }, payload) : undefined
    const mode = resolveSyncMode(requestHeaders)

    const result = await syncSubstackToPosts({
      payload,
      req,
      options: {
        rssURL: RSS_URL,
        mode,
        notifyEmail: process.env.SUBSTACK_SYNC_NOTIFY_EMAIL,
        defaultAuthorID: process.env.SUBSTACK_DEFAULT_AUTHOR_ID,
        defaultAuthorEmail: process.env.SUBSTACK_DEFAULT_AUTHOR_EMAIL,
        maxItems: process.env.SUBSTACK_SYNC_MAX_ITEMS ? Number(process.env.SUBSTACK_SYNC_MAX_ITEMS) : undefined,
        forceUpdate: process.env.SUBSTACK_SYNC_FORCE_UPDATE === 'true',
        downloadImages: process.env.SUBSTACK_SYNC_DOWNLOAD_IMAGES === 'true',
        includeImageSourceLinks: process.env.SUBSTACK_SYNC_INCLUDE_IMAGE_SOURCE_LINKS
          ? process.env.SUBSTACK_SYNC_INCLUDE_IMAGE_SOURCE_LINKS === 'true'
          : undefined,
        maxImagesPerPost: process.env.SUBSTACK_SYNC_MAX_IMAGES_PER_POST
          ? Number(process.env.SUBSTACK_SYNC_MAX_IMAGES_PER_POST)
          : undefined,
      },
    })

    return Response.json({ success: true, mode, ...result })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error syncing Substack posts' })
    return new Response('Error syncing Substack posts.', { status: 500 })
  }
}

