import type { PayloadRequest, Where } from 'payload'

import type {
  AnalyticsGoal,
  AnalyticsMetricCategory,
  AnalyticsPlatform,
  AnalyticsProvider,
  AnalyticsWidgetPlatformFilter,
  AnalyticsWidgetTimeframe,
} from './constants'

import { analyticsPlatformLabels } from './constants'

export type AnalyticsSnapshotRecord = {
  externalName?: null | string
  metricCategory?: null | string
  metricKey?: null | string
  metricValue?: null | number
  platform?: null | string
  provider?: null | string
  snapshotDate?: null | string
}

const analyticsSnapshotSelect = {
  externalName: true,
  metricCategory: true,
  metricKey: true,
  metricValue: true,
  platform: true,
  provider: true,
  snapshotDate: true,
} as const

export const getTimeframeStartDate = (timeframe: AnalyticsWidgetTimeframe): Date => {
  const now = new Date()
  const days = timeframe === '7d' ? 7 : timeframe === '90d' ? 90 : 30
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - days)
  return startDate
}

export const findAnalyticsSnapshots = async ({
  req,
  metricCategory,
  platform,
  provider,
  timeframe = '30d',
  limit = 1000,
}: {
  limit?: number
  metricCategory?: AnalyticsMetricCategory
  platform?: AnalyticsWidgetPlatformFilter
  provider?: AnalyticsProvider
  req: PayloadRequest
  timeframe?: AnalyticsWidgetTimeframe
}): Promise<AnalyticsSnapshotRecord[]> => {
  const whereClauses: Where[] = [
    {
      snapshotDate: {
        greater_than_equal: getTimeframeStartDate(timeframe).toISOString(),
      },
    },
  ]

  if (metricCategory) {
    whereClauses.push({
      metricCategory: {
        equals: metricCategory,
      },
    })
  }

  if (platform && platform !== 'all') {
    whereClauses.push({
      platform: {
        equals: platform,
      },
    })
  }

  if (provider) {
    whereClauses.push({
      provider: {
        equals: provider,
      },
    })
  }

  const result = await req.payload.find({
    collection: 'analytics-snapshots',
    depth: 0,
    limit,
    overrideAccess: false,
    req,
    select: analyticsSnapshotSelect,
    sort: '-snapshotDate',
    where: {
      and: whereClauses,
    },
  })

  return result.docs as AnalyticsSnapshotRecord[]
}

export const findLatestSnapshotDateForProvider = async ({
  provider,
  req,
}: {
  provider: AnalyticsProvider
  req: PayloadRequest
}): Promise<null | string> => {
  const result = await req.payload.find({
    collection: 'analytics-snapshots',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    req,
    select: {
      snapshotDate: true,
    },
    sort: '-snapshotDate',
    where: {
      provider: {
        equals: provider,
      },
    },
  })

  return result.docs[0]?.snapshotDate ?? null
}

export const sumMetricValues = (
  records: AnalyticsSnapshotRecord[],
  metricKeys: readonly string[],
): number => {
  const keySet = new Set(metricKeys)

  return records.reduce((total, record) => {
    if (!record.metricKey || !keySet.has(record.metricKey)) {
      return total
    }

    return total + (record.metricValue ?? 0)
  }, 0)
}

export const summarizeConversionOverview = ({
  goal,
  records,
}: {
  goal: AnalyticsGoal
  records: AnalyticsSnapshotRecord[]
}) => {
  const sessions = sumMetricValues(records, ['sessions'])
  const pageViews = sumMetricValues(records, ['page_views', 'pageviews'])
  const goalConversions = sumMetricValues(records, [goal])
  const newsletterSignups = sumMetricValues(records, ['newsletter_signup'])
  const affiliateClicks = sumMetricValues(records, ['affiliate_click'])
  const contactSubmissions = sumMetricValues(records, ['contact_submit'])

  return {
    affiliateClicks,
    contactSubmissions,
    conversionRate: sessions > 0 ? goalConversions / sessions : 0,
    goalConversions,
    newsletterSignups,
    pageViews,
    sessions,
  }
}

export const buildPlatformPerformanceRows = ({
  goal,
  records,
}: {
  goal: AnalyticsGoal
  records: AnalyticsSnapshotRecord[]
}) => {
  const grouped = new Map<
    AnalyticsPlatform,
    {
      conversions: number
      platform: AnalyticsPlatform
      sessions: number
    }
  >()

  records.forEach((record) => {
    const platform = record.platform as AnalyticsPlatform | undefined

    if (!platform || !(platform in analyticsPlatformLabels)) {
      return
    }

    const current =
      grouped.get(platform) ??
      {
        conversions: 0,
        platform,
        sessions: 0,
      }

    if (record.metricKey === 'sessions') {
      current.sessions += record.metricValue ?? 0
    }

    if (record.metricKey === goal) {
      current.conversions += record.metricValue ?? 0
    }

    grouped.set(platform, {
      conversions: current.conversions,
      platform,
      sessions: current.sessions,
    })
  })

  return Array.from(grouped.values())
    .map((row) => ({
      ...row,
      conversionRate: row.sessions > 0 ? row.conversions / row.sessions : 0,
      label: analyticsPlatformLabels[row.platform],
    }))
    .filter((row) => row.sessions > 0 || row.conversions > 0)
    .sort((a, b) => {
      if (b.conversions !== a.conversions) {
        return b.conversions - a.conversions
      }

      return b.sessions - a.sessions
    })
}

export const formatMetricValue = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value)
}

export const formatPercent = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(value)
}

export const formatSnapshotDate = (value: null | string) => {
  if (!value) {
    return 'No snapshot yet'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
