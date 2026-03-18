 'use client'

import React from 'react'
import Script from 'next/script'

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
      ) : null}

      {clarityProjectId ? (
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          onError={(e) => {
            // eslint-disable-next-line no-console
            console.warn('Microsoft Clarity inline script error:', (e as any)?.message ?? e)
          }}
        >
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityProjectId}");
          `}
        </Script>
      ) : null}
    </>
  )
}
