'use client'

import type { AnalyticsDashboardClientProps } from './AnalyticsDashboard.client'
import AnalyticsDashboardClient from './AnalyticsDashboard.client'

/** Static import avoids `next/dynamic` client chunk issues under RSC. */
export function AnalyticsDashboardLoader(props: AnalyticsDashboardClientProps) {
  return <AnalyticsDashboardClient {...props} />
}
