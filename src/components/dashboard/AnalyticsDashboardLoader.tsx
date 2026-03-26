'use client'

import dynamic from 'next/dynamic'

import type { AnalyticsDashboardClientProps } from './AnalyticsDashboard.client'

const AnalyticsDashboardClient = dynamic(() => import('./AnalyticsDashboard.client'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: 'var(--base)', color: 'var(--theme-elevation-500)' }}>Loading analytics…</div>
  ),
})

export function AnalyticsDashboardLoader(props: AnalyticsDashboardClientProps) {
  return <AnalyticsDashboardClient {...props} />
}
