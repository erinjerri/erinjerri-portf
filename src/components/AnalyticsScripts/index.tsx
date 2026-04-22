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
          />

          <Script
            src="/scripts/ga-init.js"
            strategy="lazyOnload"
            data-measurement-id={measurementId}
          />
        </>
      ) : null}
      {clarityProjectId ? (
        <Script
          src={`https://www.clarity.ms/tag/${clarityProjectId}`}
          strategy="lazyOnload"
        />
      ) : null}
    </>
  )
}
