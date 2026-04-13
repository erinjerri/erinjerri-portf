/**
 * Performance: Clarity defers until after first LCP paint (or 12s safety) so it does not compete
 * with hero assets on slow 4G (Lighthouse TBT / network). GA stays lazyOnload.
 */
'use client'

import Script from 'next/script'
import React, { useEffect, useRef } from 'react'

type Props = {
  measurementId?: string | null
  clarityProjectId?: string | null
}

export const AnalyticsScripts: React.FC<Props> = ({ measurementId, clarityProjectId }) => {
  const clarityInjected = useRef(false)

  useEffect(() => {
    if (!clarityProjectId || clarityInjected.current) return
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    let cancelled = false
    let fallbackTimer: ReturnType<typeof globalThis.setTimeout> | undefined
    let lcpInjectTimer: ReturnType<typeof globalThis.setTimeout> | undefined
    let lcpObserver: PerformanceObserver | undefined

    const inject = () => {
      if (cancelled || clarityInjected.current || document.getElementById('microsoft-clarity'))
        return
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

    const arm = () => {
      fallbackTimer = globalThis.setTimeout(() => {
        lcpObserver?.disconnect()
        if (lcpInjectTimer) clearTimeout(lcpInjectTimer)
        if ('requestIdleCallback' in globalThis) {
          globalThis.requestIdleCallback(() => inject(), { timeout: 4000 })
        } else {
          globalThis.setTimeout(inject, 0)
        }
      }, 12000)

      try {
        lcpObserver = new PerformanceObserver((list) => {
          if (list.getEntries().length === 0) return
          lcpObserver?.disconnect()
          if (fallbackTimer) clearTimeout(fallbackTimer)
          lcpInjectTimer = globalThis.setTimeout(inject, 900)
        })
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      } catch {
        if (fallbackTimer) clearTimeout(fallbackTimer)
        if ('requestIdleCallback' in globalThis) {
          globalThis.requestIdleCallback(() => inject(), { timeout: 14000 })
        } else {
          globalThis.setTimeout(inject, 8000)
        }
      }
    }

    arm()

    return () => {
      cancelled = true
      lcpObserver?.disconnect()
      if (fallbackTimer) clearTimeout(fallbackTimer)
      if (lcpInjectTimer) clearTimeout(lcpInjectTimer)
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
