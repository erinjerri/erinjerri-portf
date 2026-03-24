import type { Payload, PayloadRequest } from 'payload'

type CrosspostWorkflowStatus = 'approved' | 'auto_published'

const WORKFLOW_STATUSES: CrosspostWorkflowStatus[] = ['approved', 'auto_published']

export async function repairCrosspostPublishState(args: {
  payload: Payload
  req?: PayloadRequest
}) {
  const { payload, req } = args

  const repaired: Array<{
    id: number | string
    title?: string | null
    slug?: string | null
    workflowStatus: CrosspostWorkflowStatus
  }> = []

  for (const workflowStatus of WORKFLOW_STATUSES) {
    const result = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          {
            or: [
              { mediumId: { exists: true } },
              { substackId: { exists: true } },
              { paragraphId: { exists: true } },
            ],
          },
          { crosspostReviewStatus: { equals: workflowStatus } },
          { _status: { not_equals: 'published' } },
        ],
      },
    })

    for (const post of result.docs) {
      await payload.update({
        collection: 'posts',
        id: post.id,
        overrideAccess: true,
        data: {
          _status: 'published',
          publishedAt: post.publishedAt || new Date().toISOString(),
        },
        ...(req ? { req } : {}),
      })

      repaired.push({
        id: post.id,
        title: post.title,
        slug: post.slug,
        workflowStatus,
      })
    }
  }

  return {
    repaired,
    totalRepaired: repaired.length,
  }
}
