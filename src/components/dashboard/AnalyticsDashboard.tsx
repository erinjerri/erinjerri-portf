import type { PayloadRequest } from 'payload'

import { AffiliateRevenueCard } from './AffiliateRevenueCard'
import { TopPostsCard } from './TopPostsCard'
import { TrafficCard } from './TrafficCard'

/**
 * Analytics dashboard widget — composes Traffic, Top Posts, and Affiliate cards.
 * Wire TrafficCard and AffiliateRevenueCard to GA4 Reporting API for real event data.
 * @see https://payloadcms.com/docs/custom-components/dashboard
 * @see https://www.youtube.com/watch?v=fXF34Ef6G84
 */
export default async function AnalyticsDashboard({ req }: { req: PayloadRequest }) {
  const { payload } = req

  const [postsResult] = await Promise.all([
    payload.find({
      collection: 'posts',
      req,
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 5,
      depth: 0,
      overrideAccess: false,
    }),
  ])

  const posts = postsResult?.docs ?? []

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 'var(--base)',
      }}
    >
      <TrafficCard />
      <TopPostsCard posts={posts} />
      <AffiliateRevenueCard />
    </div>
  )
}
