import type { PayloadRequest } from 'payload'

import { AnalyticsDashboardLoader } from './AnalyticsDashboardLoader'

/**
 * Analytics dashboard — server wrapper fetches recent posts for the content tab;
 * charts use placeholder data until wired to analytics-snapshots / GA4.
 */
export default async function AnalyticsDashboard({ req }: { req: PayloadRequest }) {
  const { payload } = req

  const postsResult = await payload.find({
    collection: 'posts',
    req,
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 8,
    depth: 0,
    overrideAccess: false,
  })

  const recentPosts = postsResult.docs.map((p) => ({
    id: String(p.id),
    title: typeof p.title === 'string' ? p.title : 'Untitled',
  }))

  return <AnalyticsDashboardLoader recentPosts={recentPosts} />
}
