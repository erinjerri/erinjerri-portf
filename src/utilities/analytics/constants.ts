export const analyticsProviderOptions = [
  { label: 'Google Analytics 4', value: 'ga4' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Substack', value: 'substack' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'X', value: 'x' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Manual Import', value: 'manual' },
] as const

export type AnalyticsProvider = (typeof analyticsProviderOptions)[number]['value']

export const analyticsPlatformOptions = [
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Substack', value: 'substack' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'X', value: 'x' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Website / Direct', value: 'site' },
] as const

export type AnalyticsPlatform = (typeof analyticsPlatformOptions)[number]['value']

export const analyticsMetricCategoryOptions = [
  { label: 'Traffic', value: 'traffic' },
  { label: 'Engagement', value: 'engagement' },
  { label: 'Audience', value: 'audience' },
  { label: 'Conversion', value: 'conversion' },
  { label: 'Revenue', value: 'revenue' },
  { label: 'Health', value: 'health' },
] as const

export type AnalyticsMetricCategory = (typeof analyticsMetricCategoryOptions)[number]['value']

export const analyticsSnapshotTimeframeOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Lifetime', value: 'lifetime' },
] as const

export type AnalyticsSnapshotTimeframe = (typeof analyticsSnapshotTimeframeOptions)[number]['value']

export const analyticsGoalOptions = [
  { label: 'Newsletter Signups', value: 'newsletter_signup' },
  { label: 'Affiliate Clicks', value: 'affiliate_click' },
  { label: 'Contact Submissions', value: 'contact_submit' },
  { label: 'Tool Clicks', value: 'tool_click' },
  { label: 'Book Calls', value: 'book_call' },
  { label: 'Resume Downloads', value: 'resume_download' },
] as const

export type AnalyticsGoal = (typeof analyticsGoalOptions)[number]['value']

export const analyticsWidgetTimeframeOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
] as const

export type AnalyticsWidgetTimeframe = (typeof analyticsWidgetTimeframeOptions)[number]['value']

export const analyticsWidgetPlatformFilterOptions = [
  { label: 'All Platforms', value: 'all' },
  ...analyticsPlatformOptions,
] as const

export type AnalyticsWidgetPlatformFilter =
  | 'all'
  | (typeof analyticsPlatformOptions)[number]['value']

export const analyticsEntityTypeOptions = [
  { label: 'Account', value: 'account' },
  { label: 'Post', value: 'post' },
  { label: 'Page', value: 'page' },
  { label: 'Video', value: 'video' },
  { label: 'Newsletter Issue', value: 'newsletter' },
  { label: 'Landing Page', value: 'landing_page' },
  { label: 'Campaign', value: 'campaign' },
] as const

export const analyticsPlatformLabels = Object.fromEntries(
  analyticsPlatformOptions.map(({ label, value }) => [value, label]),
) as Record<AnalyticsPlatform, string>

export const analyticsProviderLabels = Object.fromEntries(
  analyticsProviderOptions.map(({ label, value }) => [value, label]),
) as Record<AnalyticsProvider, string>

export const analyticsGoalLabels = Object.fromEntries(
  analyticsGoalOptions.map(({ label, value }) => [value, label]),
) as Record<AnalyticsGoal, string>
