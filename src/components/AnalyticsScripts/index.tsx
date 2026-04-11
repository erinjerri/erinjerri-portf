'use client'

import Script from 'next/script'
import React, { useEffect, useRef } from 'react'

type Props = {
  measurementId?: string | null
  clarityProjectId?: string | null
}

/**
 * GA stays on lazyOnload. Clarity is deferred until idle (or 6s cap) so it does not compete
 * with LCP / main-thread during the critical window.
 */
export const AnalyticsScripts: React.FC<Props> = ({ measurementId, clarityProjectId }) => {
  const clarityInjected = useRef(false)

  useEffect(() => {
    if (!clarityProjectId || clarityInjected.current) return
    if (typeof document === 'undefined') return

    const inject = () => {
      if (clarityInjected.current || document.getElementById('microsoft-clarity')) return
      clarityInjected.current = true
      const s = document.createElement('script')
      s.id = 'microsoft-clarity'
      s.async = true
      s.textContent = `(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", ${JSON.stringify(clarityProjectId)});`
      document.head.appendChild(s)
    }

    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => inject(), { timeout: 6000 })
    } else {
      timeoutId = setTimeout(inject, 4500)
    }

    return () => {
      if (idleId !== undefined && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }, [clarityProjectId])

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
            id="google-analytics"
            strategy="lazyOnload"
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
    </>
  )
}
