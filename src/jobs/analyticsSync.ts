import type { TaskConfig } from 'payload'

import { analyticsProviderDefinitions, getAnalyticsProviderConnectionState } from '../utilities/analytics/providers'

type AnalyticsSyncTaskIO = {
  input: Record<string, never>
  output: {
    configuredProviders: number
    providers: Array<{
      isConfigured: boolean
      missingEnvVars: string[]
      provider: string
      syncMode: 'api' | 'manual'
    }>
    totalProviders: number
  }
}

const enabled = process.env.ANALYTICS_SYNC_ENABLED === 'true'
const cron = process.env.ANALYTICS_SYNC_CRON || '0 0 */6 * * *'
const queue = process.env.ANALYTICS_SYNC_QUEUE || 'analytics'

/**
 * Starter analytics task scaffold.
 * This audits provider readiness now and becomes the place to plug source-specific fetchers later.
 */
export const analyticsSyncTask: TaskConfig<AnalyticsSyncTaskIO> = {
  slug: 'analyticsSync',
  label: 'Audit analytics provider readiness',
  handler: async () => {
    const providers = analyticsProviderDefinitions.map((definition) => {
      const connection = getAnalyticsProviderConnectionState(definition)

      return {
        isConfigured: connection.isConfigured,
        missingEnvVars: [...connection.missingEnvVars],
        provider: connection.provider,
        syncMode: connection.syncMode,
      }
    })

    return {
      output: {
        configuredProviders: providers.filter((provider) => provider.isConfigured).length,
        providers,
        totalProviders: providers.length,
      },
    }
  },
  schedule: enabled
    ? [
        {
          cron,
          queue,
        },
      ]
    : [],
}
