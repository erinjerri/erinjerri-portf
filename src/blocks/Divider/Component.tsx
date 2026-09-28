import type { DividerBlock as DividerBlockProps } from '@/payload-types'
import React from 'react'

import { BRAND_ACCENTS } from '@/utilities/brandAccents'
import { cn } from '@/utilities/ui'

const WIDTH_CLASS: Record<string, string> = {
  content: 'mx-auto w-full',
  narrow: 'mx-auto w-full max-w-4xl',
  full: 'w-full',
}

const SPACING_CLASS: Record<string, string> = {
  tight: 'my-6 md:my-8',
  normal: 'my-12 md:my-16',
  loose: 'my-20 md:my-28',
}

const ACCENT_HEX: Record<string, string | null> = {
  teal: BRAND_ACCENTS.teal,
  mint: BRAND_ACCENTS.mint,
  pink: BRAND_ACCENTS.pink,
  neutral: null,
}

export const DividerBlockComponent: React.FC<DividerBlockProps> = (props) => {
  const { accent = 'teal', width = 'content', spacing = 'normal' } = props

  const hex = ACCENT_HEX[accent ?? 'teal'] ?? null
  const widthClass = WIDTH_CLASS[width ?? 'content'] ?? WIDTH_CLASS.content
  const spacingClass = SPACING_CLASS[spacing ?? 'normal'] ?? SPACING_CLASS.normal

  return (
    <div className={cn('container', spacingClass)}>
      <div aria-hidden className={cn('relative', widthClass)}>
        <div
          className="h-px w-full"
          style={
            hex
              ? { backgroundImage: `linear-gradient(to right, transparent, ${hex}8c, transparent)` }
              : { backgroundColor: 'hsl(var(--border))' }
          }
        />
        {hex ? (
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 blur-sm"
            style={{
              backgroundImage: `radial-gradient(ellipse at center, ${hex}38 0%, transparent 70%)`,
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
