import type { WidgetServerProps } from 'payload'

import Link from 'next/link'
import React from 'react'

import type {
  AnalyticsGoal,
  AnalyticsWidgetPlatformFilter,
  AnalyticsWidgetTimeframe,
} from '@/utilities/analytics/constants'

import { analyticsGoalLabels, analyticsPlatformLabels } from '@/utilities/analytics/constants'
import {
  findAnalyticsSnapshots,
  formatMetricValue,
  formatPercent,
  summarizeConversionOverview,
} from '@/utilities/analytics/dashboard'

type ConversionOverviewWidgetData = {
  data?: {
    goal?: AnalyticsGoal
    platform?: AnalyticsWidgetPlatformFilter
    timeframe?: AnalyticsWidgetTimeframe
    title?: string
  }
}

function Stat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        background: 'var(--theme-elevation-50)',
        borderRadius: 'var(--border-radius-m)',
        padding: 'calc(var(--base) * 0.75)',
      }}
    >
      <div style={{ color: 'var(--theme-elevation-700)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ color: 'var(--theme-text)', fontSize: '1.25rem', fontWeight: 700 }}>{value}</div>
    </div>
  )
}

export default async function ConversionOverviewWidget({
  req,
  widgetData,
}: WidgetServerProps<ConversionOverviewWidgetData>) {
  const goal = widgetData?.goal ?? 'newsletter_signup'
  const platform = widgetData?.platform ?? 'all'
  const timeframe = widgetData?.timeframe ?? '30d'
  const title = widgetData?.title ?? 'Conversion Overview'

  const conversionRecords = await findAnalyticsSnapshots({
    metricCategory: 'conversion',
    platform,
    req,
    timeframe,
  })
  const trafficRecords = await findAnalyticsSnapshots({
    metricCategory: 'traffic',
    platform,
    req,
    timeframe,
  })

  const summary = summarizeConversionOverview({
    goal,
    records: [...conversionRecords, ...trafficRecords],
  })
  const hasData = conversionRecords.length > 0 || trafficRecords.length > 0
  const platformLabel = platform === 'all' ? 'All platforms' : analyticsPlatformLabels[platform]

  return (
    <div className="card" style={{ display: 'grid', gap: 'var(--base)', padding: 'var(--base)' }}>
      <div
        style={{
          alignItems: 'flex-start',
          display: 'flex',
          gap: 'var(--base)',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3 style={{ color: 'var(--theme-text)', margin: 0 }}>{title}</h3>
          <p style={{ color: 'var(--theme-elevation-700)', margin: '0.35rem 0 0' }}>
            {platformLabel} · {timeframe} · Goal: {analyticsGoalLabels[goal]}
          </p>
        </div>
        <Link href="/admin/analytics-dashboard" style={{ color: 'var(--theme-success-500)' }}>
          Open full dashboard
        </Link>
      </div>

      {hasData ? (
        <div
          style={{
            display: 'grid',
            gap: 'calc(var(--base) * 0.75)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          }}
        >
          <Stat label="Sessions" value={formatMetricValue(summary.sessions)} />
          <Stat label="Page Views" value={formatMetricValue(summary.pageViews)} />
          <Stat label={analyticsGoalLabels[goal]} value={formatMetricValue(summary.goalConversions)} />
          <Stat label="Conversion Rate" value={formatPercent(summary.conversionRate)} />
          <Stat label="Newsletter Signups" value={formatMetricValue(summary.newsletterSignups)} />
          <Stat label="Affiliate Clicks" value={formatMetricValue(summary.affiliateClicks)} />
          <Stat label="Contact Submits" value={formatMetricValue(summary.contactSubmissions)} />
        </div>
      ) : (
        <p style={{ color: 'var(--theme-elevation-700)', margin: 0 }}>
          No analytics snapshots yet. Start by adding GA4 credentials, then sync daily summaries for the
          platforms you care about.
        </p>
      )}
    </div>
  )
}
