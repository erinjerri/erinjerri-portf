import React from 'react'

/**
 * Traffic overview card for GA4 metrics.
 * Wire to GA4 Reporting API or your analytics endpoint for real data.
 * @see https://payloadcms.com/docs/custom-components/dashboard
 */
export function TrafficCard({
  pageViews,
  uniqueVisitors,
  isLoading = false,
}: {
  pageViews?: number
  uniqueVisitors?: number
  isLoading?: boolean
}) {
  return (
    <div className="card" style={{ padding: 'var(--base)', background: 'var(--theme-elevation-0)' }}>
      <h3 style={{ margin: '0 0 var(--base)', color: 'var(--theme-text)', fontSize: '1rem' }}>
        Traffic
      </h3>
      {isLoading ? (
        <p style={{ color: 'var(--theme-elevation-500)', margin: 0 }}>Loading…</p>
      ) : pageViews != null && uniqueVisitors != null ? (
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--theme-text)' }}>
          <li>Page views: {pageViews.toLocaleString()}</li>
          <li>Unique visitors: {uniqueVisitors.toLocaleString()}</li>
        </ul>
      ) : (
        <p style={{ color: 'var(--theme-elevation-500)', margin: 0, fontSize: '0.875rem' }}>
          Connect GA4 Reporting API for traffic data. Set GA_MEASUREMENT_ID and configure service
          account.
        </p>
      )}
    </div>
  )
}
