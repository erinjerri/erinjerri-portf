import type { WidgetServerProps } from 'payload'

import React from 'react'

import type { AnalyticsGoal, AnalyticsWidgetTimeframe } from '@/utilities/analytics/constants'

import { analyticsGoalLabels } from '@/utilities/analytics/constants'
import {
  buildPlatformPerformanceRows,
  findAnalyticsSnapshots,
  formatMetricValue,
  formatPercent,
} from '@/utilities/analytics/dashboard'

type SourcePerformanceWidgetData = {
  data?: {
    goal?: AnalyticsGoal
    timeframe?: AnalyticsWidgetTimeframe
    title?: string
  }
}

export default async function SourcePerformanceWidget({
  req,
  widgetData,
}: WidgetServerProps<SourcePerformanceWidgetData>) {
  const goal = widgetData?.goal ?? 'newsletter_signup'
  const timeframe = widgetData?.timeframe ?? '30d'
  const title = widgetData?.title ?? 'Channel Performance'

  const conversionRecords = await findAnalyticsSnapshots({
    metricCategory: 'conversion',
    req,
    timeframe,
  })
  const trafficRecords = await findAnalyticsSnapshots({
    metricCategory: 'traffic',
    req,
    timeframe,
  })

  const rows = buildPlatformPerformanceRows({
    goal,
    records: [...conversionRecords, ...trafficRecords],
  })

  return (
    <div className="card" style={{ display: 'grid', gap: 'var(--base)', padding: 'var(--base)' }}>
      <div>
        <h3 style={{ color: 'var(--theme-text)', margin: 0 }}>{title}</h3>
        <p style={{ color: 'var(--theme-elevation-700)', margin: '0.35rem 0 0' }}>
          Compare sessions and {analyticsGoalLabels[goal].toLowerCase()} across your social channels.
        </p>
      </div>

      {rows.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 480, width: '100%' }}>
            <thead>
              <tr style={{ color: 'var(--theme-elevation-700)', textAlign: 'left' }}>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-150)', padding: '0 0 0.75rem' }}>
                  Platform
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-150)', padding: '0 0 0.75rem' }}>
                  Sessions
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-150)', padding: '0 0 0.75rem' }}>
                  Conversions
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-150)', padding: '0 0 0.75rem' }}>
                  Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.platform}>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '0.75rem 0' }}>
                    {row.label}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '0.75rem 0' }}>
                    {formatMetricValue(row.sessions)}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '0.75rem 0' }}>
                    {formatMetricValue(row.conversions)}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '0.75rem 0' }}>
                    {formatPercent(row.conversionRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: 'var(--theme-elevation-700)', margin: 0 }}>
          No cross-channel data yet. Once snapshots land in Payload, this widget becomes your best at-a-glance
          source comparison.
        </p>
      )}
    </div>
  )
}
