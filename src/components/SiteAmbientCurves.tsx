'use client'

import { RibbonCurves } from '@/blocks/RibbonBlock/Curves'
import React from 'react'

/**
 * Fixed canvas ribbon + stars behind the whole frontend (not only the home ribbon block).
 * Uses `variant="ambient"` so the page background shows through; keeps pointer-events off for perf.
 */
export function SiteAmbientCurves() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 min-h-[100dvh] w-full"
      aria-hidden
    >
      <RibbonCurves variant="ambient" />
    </div>
  )
}
