'use client'

import { useEffect } from 'react'

/**
 * Dev-only: suppress noisy unhandledrejection when the rejection reason is a raw DOM Event.
 * Implemented as a client effect so wallet extensions cannot replace an inline <script> in <head>
 * and break React hydration.
 */
export function DevUnhandledRejectionGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const handler = (event: PromiseRejectionEvent) => {
      if (event?.reason instanceof Event) {
        event.preventDefault()
        console.warn(
          '[dev] Suppressed unhandledrejection for raw Event:',
          event.reason.type || event.reason,
        )
      }
    }

    window.addEventListener('unhandledrejection', handler, true)
    return () => window.removeEventListener('unhandledrejection', handler, true)
  }, [])

  return null
}
