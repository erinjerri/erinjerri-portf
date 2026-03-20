import type { AnalyticsProvider } from './constants'

import { analyticsProviderLabels } from './constants'

export type AnalyticsProviderDefinition = {
  provider: AnalyticsProvider
  summary: string
  setupURL: string
  syncMode: 'api' | 'manual'
  envVars: readonly string[]
}

export const analyticsProviderDefinitions: readonly AnalyticsProviderDefinition[] = [
  {
    provider: 'ga4',
    summary: 'First-party traffic and conversion attribution from your website.',
    setupURL: 'https://support.google.com/analytics/answer/14264492?hl=en',
    syncMode: 'api',
    envVars: [
      'NEXT_PUBLIC_GA_MEASUREMENT_ID',
      'GOOGLE_ANALYTICS_PROPERTY_ID',
      'GOOGLE_ANALYTICS_CLIENT_EMAIL',
      'GOOGLE_ANALYTICS_PRIVATE_KEY',
    ],
  },
  {
    provider: 'linkedin',
    summary: 'Company page, post, video, and follower performance for LinkedIn traffic.',
    setupURL:
      'https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview?view=li-lms-2026-02',
    syncMode: 'api',
    envVars: [
      'LINKEDIN_CLIENT_ID',
      'LINKEDIN_CLIENT_SECRET',
      'LINKEDIN_REFRESH_TOKEN',
      'LINKEDIN_ORGANIZATION_ID',
    ],
  },
  {
    provider: 'substack',
    summary: 'Manual tracking only for now. Use tagged links plus Substack-native post stats.',
    setupURL:
      'https://support.substack.com/hc/en-us/articles/45099095296916-Substack-Developer-API',
    syncMode: 'manual',
    envVars: ['SUBSTACK_SUBSCRIBE_URL'],
  },
  {
    provider: 'instagram',
    summary: 'Professional account performance, content reach, and profile activity.',
    setupURL: 'https://www.facebook.com/help/instagram/257516379077270',
    syncMode: 'api',
    envVars: [
      'META_APP_ID',
      'META_APP_SECRET',
      'META_ACCESS_TOKEN',
      'INSTAGRAM_BUSINESS_ACCOUNT_ID',
    ],
  },
  {
    provider: 'facebook',
    summary: 'Page insights and Facebook-origin traffic into site conversions.',
    setupURL: 'https://www.facebook.com/help/268680253165747/',
    syncMode: 'api',
    envVars: ['META_APP_ID', 'META_APP_SECRET', 'META_ACCESS_TOKEN', 'FACEBOOK_PAGE_ID'],
  },
  {
    provider: 'x',
    summary: 'Organic post/account metrics, with ads access available later if you need it.',
    setupURL: 'https://docs.x.com/x-api/users/lookup/quickstart/user-lookup',
    syncMode: 'api',
    envVars: ['X_CLIENT_ID', 'X_CLIENT_SECRET', 'X_BEARER_TOKEN', 'X_USER_ID'],
  },
  {
    provider: 'youtube',
    summary: 'Channel and video analytics from the YouTube Analytics and Reporting APIs.',
    setupURL: 'https://developers.google.com/youtube/analytics/reference',
    syncMode: 'api',
    envVars: [
      'YOUTUBE_CLIENT_ID',
      'YOUTUBE_CLIENT_SECRET',
      'YOUTUBE_REFRESH_TOKEN',
      'YOUTUBE_CHANNEL_ID',
    ],
  },
] as const

export const getAnalyticsProviderConnectionState = (definition: AnalyticsProviderDefinition) => {
  const missingEnvVars = definition.envVars.filter((envName) => !process.env[envName]?.trim())

  return {
    ...definition,
    isConfigured: missingEnvVars.length === 0,
    label: analyticsProviderLabels[definition.provider],
    missingEnvVars,
  }
}
