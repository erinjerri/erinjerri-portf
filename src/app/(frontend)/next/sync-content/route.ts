import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

import { syncMediumToPosts } from '@/utilities/medium/syncMediumToPosts'
import { syncParagraphToPosts } from '@/utilities/paragraph/syncParagraphToPosts'
import { repairCrosspostPublishState } from '@/utilities/crossposts/repairCrosspostPublishState'

export const maxDuration = 300

const RSS_URL = process.env.MEDIUM_RSS_URL || 'https://medium.com/feed/@erinjerri'
const PUBLICATION = process.env.PARAGRAPH_PUBLICATION || '@cypherpinay'
const MODE = process.env.MEDIUM_SYNC_MODE === 'auto_publish' ? 'auto_publish' : 'review'

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

    const [mediumResult, paragraphResult] = await Promise.all([
      syncMediumToPosts({
        payload,
        req,
        options: {
          rssURL: RSS_URL,
          mode: MODE,
          maxItems: process.env.MEDIUM_SYNC_MAX_ITEMS
            ? Number(process.env.MEDIUM_SYNC_MAX_ITEMS)
            : undefined,
          downloadImages: process.env.MEDIUM_SYNC_DOWNLOAD_IMAGES === 'true',
        },
      }),
      syncParagraphToPosts({
        payload,
        req,
        options: {
          publication: PUBLICATION,
          mode: process.env.PARAGRAPH_SYNC_MODE === 'auto_publish' ? 'auto_publish' : 'review',
          maxItems: process.env.PARAGRAPH_SYNC_MAX_ITEMS
            ? Number(process.env.PARAGRAPH_SYNC_MAX_ITEMS)
            : undefined,
          downloadImages: process.env.PARAGRAPH_SYNC_DOWNLOAD_IMAGES === 'true',
        },
      }),
    ])

    const repairResult = await repairCrosspostPublishState({ payload, req })

    return Response.json({
      success: true,
      medium: { synced: mediumResult.synced, skipped: mediumResult.skipped, errors: mediumResult.errors },
      paragraph: {
        synced: paragraphResult.synced,
        skipped: paragraphResult.skipped,
        errors: paragraphResult.errors,
      },
      repair: {
        repaired: repairResult.totalRepaired,
        posts: repairResult.repaired.map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          workflowStatus: post.workflowStatus,
        })),
      },
    })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error syncing content' })
    return new Response('Error syncing content.', { status: 500 })
  }
}
