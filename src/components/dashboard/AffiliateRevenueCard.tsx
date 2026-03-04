import React from 'react'

/**
 * Affiliate revenue / clicks card.
 * Wire to GA4 (affiliate_click events) or your analytics endpoint for real data.
 * @see https://payloadcms.com/docs/custom-components/dashboard
 */
export function AffiliateRevenueCard({
  affiliateClicks,
  topProducts,
  isLoading = false,
}: {
  affiliateClicks?: number
  topProducts?: Array<{ product: string; clicks: number }>
  isLoading?: boolean
}) {
  return (
    <div className="card" style={{ padding: 'var(--base)', background: 'var(--theme-elevation-0)' }}>
      <h3 style={{ margin: '0 0 var(--base)', color: 'var(--theme-text)', fontSize: '1rem' }}>
        Affiliate Clicks
      </h3>
      {isLoading ? (
        <p style={{ color: 'var(--theme-elevation-500)', margin: 0 }}>Loading…</p>
      ) : affiliateClicks != null ? (
        <>
          <p style={{ margin: '0 0 var(--base)', color: 'var(--theme-text)', fontWeight: 600 }}>
            Total: {affiliateClicks.toLocaleString()} clicks
          </p>
          {topProducts && topProducts.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--theme-text)' }}>
              {topProducts.map(({ product, clicks }, i) => (
                <li key={i}>
                  {product}: {clicks}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p style={{ color: 'var(--theme-elevation-500)', margin: 0, fontSize: '0.875rem' }}>
          Track affiliate_click events via gtag. Connect GA4 Reporting API for click data.
        </p>
      )}
    </div>
  )
}
