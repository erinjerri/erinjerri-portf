import type { AdminViewServerProps } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import React from 'react'

/**
 * Dedicated Analytics Dashboard view at /admin/analytics-dashboard.
 * Uses DefaultTemplate for layout; renders full analytics dashboard.
 * @see https://payloadcms.com/docs/custom-components/custom-views
 */
export default async function AnalyticsView({
  initPageResult,
  viewType,
}: AdminViewServerProps) {
  const { req } = initPageResult

  if (!req.user) {
    return (
      <DefaultTemplate
        i18n={req.i18n}
        payload={req.payload}
        req={req}
        viewType={viewType}
        visibleEntities={initPageResult.visibleEntities}
      >
        <Gutter>
          <p>You must be logged in to view analytics.</p>
        </Gutter>
      </DefaultTemplate>
    )
  }

  const { default: AnalyticsDashboard } = await import('./AnalyticsDashboard')

  return (
    <DefaultTemplate
      i18n={req.i18n}
      payload={req.payload}
      req={req}
      viewType={viewType}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <AnalyticsDashboard req={req} />
      </Gutter>
    </DefaultTemplate>
  )
}
