'use client'

import dynamic from 'next/dynamic'
import React, { useLayoutEffect, useState } from 'react'

/** Canvas chunk loads only when mounted; keeps initial JS + main thread free on mobile. */
const RibbonCurvesLazy = dynamic(
  () => import('@/blocks/RibbonBlock/Curves').then((mod) => mod.RibbonCurves),
  { ssr: false },
)

/** Match Tailwind `md` and hero mobile CSS (viewport width). */
const MOBILE_DEFER_CURVES_PX = 768

/**
 * Fixed canvas ribbon + stars behind the whole frontend.
 * Desktop: start immediately. Mobile: defer until idle (with timeout) or first scroll/touch/pointer.
 */
export function SiteAmbientCurves() {
  const [show, setShow] = useState(false)

  useLayoutEffect(() => {
    let cancelled = false
    const start = () => {
      if (!cancelled) setShow(true)
    }

    if (typeof window === 'undefined') return

    if (window.innerWidth > MOBILE_DEFER_CURVES_PX) {
      start()
      return () => {
        cancelled = true
      }
    }

    let idleHandle: number | ReturnType<typeof setTimeout> | undefined
    const cancelScheduled = () => {
      if (idleHandle === undefined) return
      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle as number)
      } else {
        clearTimeout(idleHandle as ReturnType<typeof setTimeout>)
      }
      idleHandle = undefined
    }

    const scheduleIdle = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idleHandle = window.requestIdleCallback(() => start(), { timeout: 2800 })
      } else {
        idleHandle = setTimeout(start, 1200)
      }
    }

    scheduleIdle()

    const kick = () => {
      cancelScheduled()
      start()
    }

    window.addEventListener('scroll', kick, { passive: true, once: true })
    window.addEventListener('touchstart', kick, { passive: true, once: true })
    window.addEventListener('pointerdown', kick, { once: true })

    return () => {
      cancelled = true
      cancelScheduled()
      window.removeEventListener('scroll', kick)
      window.removeEventListener('touchstart', kick)
      window.removeEventListener('pointerdown', kick)
    }
  }, [])

  return (
    <div
      className="site-ambient-curves pointer-events-none fixed inset-0 z-0 min-h-[100dvh] w-full"
      aria-hidden
    >
      {show ? <RibbonCurvesLazy variant="ambient" /> : null}
    </div>
  )
}
