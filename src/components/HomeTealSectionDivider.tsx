import { cn } from '@/utilities/ui'
import React from 'react'

type Props = {
  className?: string
}

/** Soft teal rule + glow (same as `StatsBlock` footer) — wrap with `max-w-4xl mx-auto` to match stats width. */
export function HomeTealSectionDivider({ className }: Props) {
  return (
    <div aria-hidden className={cn('relative w-full', className)}>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#4fd4c4]/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(79,212,196,0.22)_0%,transparent_70%)] blur-sm" />
    </div>
  )
}
