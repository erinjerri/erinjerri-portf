'use client'

import React from 'react'

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, string | number | boolean>,
    ) => void
  }
}

type AffiliateLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  url: string
  product: string
  children?: React.ReactNode
}

/**
 * Wraps affiliate links and fires `affiliate_click` GA event on click.
 * Use with gtag/GA4 for tracking affiliate conversions.
 */
export function AffiliateLink({ url, product, children, target, rel, ...anchorProps }: AffiliateLinkProps) {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'affiliate_click', { product })
    }
  }

  return (
    <a
      href={url}
      onClick={handleClick}
      target={target ?? '_blank'}
      rel={rel ?? 'sponsored noopener noreferrer'}
      {...anchorProps}
    >
      {children ?? 'Buy Product'}
    </a>
  )
}
