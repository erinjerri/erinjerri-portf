'use client'

import Script from 'next/script'
import React, { useEffect } from 'react'

type Props = {
  clarityProjectId?: string | null
  measurementId?: string | null
}

declare global {
  interface Window {
    __clarityLoadedProjectId?: string
  }
}

const CLARITY_SCRIPT_ID = 'microsoft-clarity-script'

function loadClarity(projectId: string) {
  if (window.__clarityLoadedProjectId === projectId) return
  if (document.getElementById(CLARITY_SCRIPT_ID)) return

  const script = document.createElement('script')
  script.async = true
  script.id = CLARITY_SCRIPT_ID
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`
  script.dataset.analyticsProvider = 'microsoft-clarity'
  script.onload = () => {
    window.__clarityLoadedProjectId = projectId
  }

  document.head.appendChild(script)
}

export const Analytics: React.FC<Props> = ({ clarityProjectId, measurementId }) => {
  const normalizedMeasurementId = measurementId?.trim()
  const normalizedClarityProjectId = clarityProjectId?.trim()

  useEffect(() => {
    if (!normalizedClarityProjectId) return

    let timer: number | undefined

    const load = () => {
      timer = window.setTimeout(() => loadClarity(normalizedClarityProjectId), 1500)
    }

    if (document.readyState === 'complete') {
      load()
    } else {
      window.addEventListener('load', load, { once: true })
    }

    return () => {
      window.removeEventListener('load', load)
      if (timer) window.clearTimeout(timer)
    }
  }, [normalizedClarityProjectId])

  if (!normalizedMeasurementId && !normalizedClarityProjectId) return null

  return normalizedMeasurementId ? (
    <>
      <Script
        id="google-analytics-library"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
          normalizedMeasurementId,
        )}`}
        strategy="lazyOnload"
      />
      <Script
        id="google-analytics-init"
        src="/scripts/ga-init.js"
        strategy="lazyOnload"
        data-measurement-id={normalizedMeasurementId}
      />
    </>
  ) : null
}
