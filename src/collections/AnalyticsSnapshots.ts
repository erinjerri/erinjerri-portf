import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import {
  analyticsEntityTypeOptions,
  analyticsGoalOptions,
  analyticsMetricCategoryOptions,
  analyticsPlatformOptions,
  analyticsProviderOptions,
  analyticsSnapshotTimeframeOptions,
} from '../utilities/analytics/constants'

export const AnalyticsSnapshots: CollectionConfig = {
  slug: 'analytics-snapshots',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['provider', 'platform', 'metricKey', 'metricValue', 'snapshotDate'],
    description: 'Normalized analytics metrics for dashboard widgets and conversion reporting.',
    group: 'Analytics',
    useAsTitle: 'metricLabel',
  },
  fields: [
    {
      name: 'provider',
      type: 'select',
      index: true,
      options: [...analyticsProviderOptions],
      required: true,
    },
    {
      name: 'platform',
      type: 'select',
      index: true,
      options: [...analyticsPlatformOptions],
      required: true,
    },
    {
      name: 'metricCategory',
      type: 'select',
      index: true,
      options: [...analyticsMetricCategoryOptions],
      required: true,
    },
    {
      name: 'metricKey',
      type: 'text',
      index: true,
      required: true,
    },
    {
      name: 'metricLabel',
      type: 'text',
      required: true,
    },
    {
      name: 'metricValue',
      type: 'number',
      required: true,
    },
    {
      name: 'snapshotDate',
      type: 'date',
      index: true,
      required: true,
    },
    {
      name: 'timeframe',
      type: 'select',
      defaultValue: 'daily',
      options: [...analyticsSnapshotTimeframeOptions],
      required: true,
    },
    {
      name: 'conversionGoal',
      type: 'select',
      options: [...analyticsGoalOptions],
    },
    {
      name: 'entityType',
      type: 'select',
      options: [...analyticsEntityTypeOptions],
    },
    {
      name: 'entityId',
      type: 'text',
    },
    {
      name: 'externalId',
      type: 'text',
    },
    {
      name: 'externalName',
      type: 'text',
    },
    {
      name: 'landingPath',
      type: 'text',
    },
    {
      name: 'campaign',
      type: 'text',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
  labels: {
    plural: 'Analytics Snapshots',
    singular: 'Analytics Snapshot',
  },
  timestamps: true,
}
