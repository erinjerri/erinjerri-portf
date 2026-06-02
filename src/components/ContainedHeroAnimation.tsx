'use client'

import dynamic from 'next/dynamic'
import React from 'react'

import { cn } from '@/utilities/ui'

type ContainedHeroAnimationProps = {
  className?: string
}

const RibbonCurves = dynamic(
  () => import('@/blocks/RibbonBlock/Curves').then((mod) => ({ default: mod.RibbonCurves })),
  { ssr: false, loading: () => null },
)

export function ContainedHeroAnimation({ className }: ContainedHeroAnimationProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 z-0 isolate overflow-hidden',
        className,
      )}
    >
      <RibbonCurves variant="ambient" />
    </div>
  )
}
