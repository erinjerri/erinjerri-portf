'use client'

import type { ComponentType } from 'react'
import React, { useEffect, useState } from 'react'

type RibbonCurvesProps = { variant?: 'ambient' | 'full' }

/** Loaded only after mount so the canvas chunk is not in the initial RSC client module graph. */
type RibbonCurvesComponent = ComponentType<RibbonCurvesProps>

/** Viewport width: defer canvas until idle below this (aligns with `max-width: 768px` / `md`). */
const MOBILE_DEFER_CURVES_PX = 768

/**
 * Fixed canvas ribbon + stars behind the whole frontend.
 * Desktop: start immediately. Mobile: defer until idle (with timeout) or first scroll/touch/pointer.
 *
 * `RibbonCurves` is loaded via `import()` after the shell mounts so Flight/webpack do not need its
 * factory during the first `react-server-dom-webpack` client module init (avoids `options.factory` / `.call` errors).
 */
export function SiteAmbientCurves() {
  const [show, setShow] = useState(false)
  const [RibbonCurves, setRibbonCurves] = useState<RibbonCurvesComponent | null>(null)

  useEffect(() => {
    let cancelled = false
    const start = () => {
      if (!cancelled) setShow(true)
    }

    if (typeof window === 'undefined') return

    if (window.innerWidth >= MOBILE_DEFER_CURVES_PX) {
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
        idleHandle = window.requestIdleCallback(() => start(), { timeout: 2000 })
      } else {
        idleHandle = setTimeout(() => start(), 2000)
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

  useEffect(() => {
    if (!show) {
      setRibbonCurves(null)
      return
    }

    let cancelled = false
    void import('@/blocks/RibbonBlock/Curves').then((mod) => {
      if (!cancelled) setRibbonCurves(() => mod.RibbonCurves)
    })

    return () => {
      cancelled = true
    }
  }, [show])

  return (
    <div
      className="site-ambient-curves pointer-events-none fixed inset-0 z-0 min-h-[100dvh] w-full"
      aria-hidden
    >
      {RibbonCurves ? <RibbonCurves variant="ambient" /> : null}
    </div>
  )
}
