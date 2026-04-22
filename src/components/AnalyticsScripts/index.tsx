import Script from 'next/script'
import React from 'react'

type Props = {
  measurementId?: string | null
  clarityProjectId?: string | null
}

export const AnalyticsScripts: React.FC<Props> = ({ measurementId, clarityProjectId }) => {
  if (!measurementId && !clarityProjectId) return null

  return (
    <>
      {measurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="lazyOnload"
            onError={(e) => {
              // eslint-disable-next-line no-console
              console.warn('Google Analytics script failed to load:', (e as any)?.message ?? e)
            }}
          />

          <Script
            src="/scripts/ga-init.js"
            strategy="lazyOnload"
            data-measurement-id={measurementId}
            onError={(e) => {
              // eslint-disable-next-line no-console
              console.warn('Google Analytics init script failed to load:', (e as any)?.message ?? e)
            }}
          />
        </>
      ) : null}
      {clarityProjectId ? (
        <Script
          src={`https://www.clarity.ms/tag/${clarityProjectId}`}
          strategy="lazyOnload"
          onError={(e) => {
            // eslint-disable-next-line no-console
            console.warn('Microsoft Clarity script failed to load:', (e as any)?.message ?? e)
          }}
        />
      ) : null}
    </>
  )
}
