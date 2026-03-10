 'use client'

import React from 'react'
import Script from 'next/script'

type Props = {
  measurementId?: string | null
}

export const AnalyticsScripts: React.FC<Props> = ({ measurementId }) => {
  if (!measurementId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onError={(e) => {
          // Inline logging only — avoid throwing.
          // eslint-disable-next-line no-console
          console.warn('Google Analytics script failed to load:', (e as any)?.message ?? e)
        }}
      />

      <Script
        id="google-analytics"
        strategy="afterInteractive"
        onError={(e) => {
          // eslint-disable-next-line no-console
          console.warn('Google Analytics inline script error:', (e as any)?.message ?? e)
        }}
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  )
}

