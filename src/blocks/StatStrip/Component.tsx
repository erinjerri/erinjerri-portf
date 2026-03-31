import { cn } from '@/utilities/ui'
import type { StatStripBlock as StatStripBlockProps } from '@/payload-types'
import React from 'react'

const accent = 'text-[hsl(43_42%_58%)]'

export const StatStripBlock: React.FC<StatStripBlockProps> = (props) => {
  const { columns = 'four', emphasis = 'default', eyebrow, items } = props
  const grid =
    columns === 'three'
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-2 lg:grid-cols-4'
  const isBold = emphasis === 'bold'

  if (!items?.length) return null

  return (
    <div className="container my-10 lg:my-12">
      {eyebrow ? (
        <p
          className={cn('mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em]', accent)}
        >
          {eyebrow}
        </p>
      ) : null}
      <div
        className={cn(
          'grid gap-6 border px-4 py-6 lg:gap-8 lg:px-8',
          isBold
            ? 'border-[hsl(43_42%_58%)]/40 bg-card/50 shadow-sm'
            : 'border-border/60 bg-card/30',
          grid,
        )}
      >
        {items.map((item, i) => (
          <div className="text-center lg:text-left" key={i}>
            <div
              className={cn(
                accent,
                'font-title leading-none tracking-tight',
                isBold ? 'text-3xl font-extrabold sm:text-4xl' : 'text-2xl font-bold sm:text-3xl',
              )}
            >
              {item.value}
            </div>
            <div
              className={cn(
                'mt-2 text-[0.65rem] font-semibold uppercase leading-snug tracking-wider text-muted-foreground',
                isBold && 'font-bold text-foreground/85',
              )}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
