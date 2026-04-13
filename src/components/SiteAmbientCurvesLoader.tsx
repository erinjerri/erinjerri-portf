'use client'

import dynamic from 'next/dynamic'
import React from 'react'

/**
 * `ssr: false` is only valid inside a Client Component (not in the root `layout.tsx` Server Component).
 * This thin shell defers the ambient canvas chunk until the browser.
 */
const SiteAmbientCurvesLazy = dynamic(
  () => import('@/components/SiteAmbientCurves').then((m) => ({ default: m.SiteAmbientCurves })),
  { ssr: false, loading: () => null },
)

export function SiteAmbientCurvesLoader() {
  return <SiteAmbientCurvesLazy />
}
