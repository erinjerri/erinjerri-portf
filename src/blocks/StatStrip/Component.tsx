import { cn } from '@/utilities/ui'
import type { StatStripBlock as StatStripBlockProps } from '@/payload-types'
import React from 'react'

import { accentForIndex, BRAND_ACCENTS } from '@/utilities/brandAccents'

/**
 * A row of proof points. Deliberately unboxed.
 *
 * An earlier version wrapped the row in a bordered panel and put rules between
 * the cells, which read as a wide slab dropped onto the page rather than part
 * of it — and the generous cell padding pushed the labels onto three lines. The
 * numbers are the signal here; spacing separates them, not chrome.
 */
export const StatStripBlock: React.FC<StatStripBlockProps> = (props) => {
  const { columns = 'four', emphasis = 'default', eyebrow, items } = props
  const isBold = emphasis === 'bold'

  if (!items?.length) return null

  /**
   * Four across only from `lg`. Below that the labels are long enough that four
   * columns force a wrap on every one of them.
   */
  const grid =
    columns === 'three'
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  return (
    <div className="container my-16 md:my-20 lg:my-24">
      {eyebrow ? (
        <p
          className="mb-6 text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: BRAND_ACCENTS.teal }}
        >
          {eyebrow}
        </p>
      ) : null}
      <div className={cn('grid gap-x-8 gap-y-8 lg:gap-x-10', grid)}>
        {items.map((item, i) => (
          <div className="min-w-0" key={i}>
            <div
              style={{ color: accentForIndex(i) }}
              className={cn(
                'font-title leading-[1.1] tracking-tight tabular-nums',
                isBold
                  ? 'text-[2rem] font-bold sm:text-[2.25rem]'
                  : 'text-[1.75rem] font-semibold sm:text-[1.875rem]',
              )}
            >
              {item.value}
            </div>
            <div
              className={cn(
                'mt-2 text-[0.625rem] font-semibold uppercase leading-[1.5] tracking-[0.13em] text-muted-foreground sm:text-[0.6875rem]',
                isBold && 'text-foreground/85',
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
