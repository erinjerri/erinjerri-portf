import { cn } from '@/utilities/ui'
import type { BookAcclaimStripBlock as BookAcclaimStripBlockProps } from '@/payload-types'
import React from 'react'

const accent = 'text-[hsl(43_42%_58%)]'

export const BookAcclaimStripBlock: React.FC<BookAcclaimStripBlockProps> = (props) => {
  const { heading = 'Book acclaim', items } = props
  if (!items?.length) return null

  return (
    <div className="container my-10 lg:my-14">
      {heading ? (
        <h2 className="font-title text-xl font-extrabold tracking-tight lg:text-2xl">{heading}</h2>
      ) : null}
      <div
        className={cn(
          'mt-6 grid gap-4 border border-border/60 bg-card/30 p-4 lg:gap-6 lg:p-6',
          items.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2',
        )}
      >
        {items.map((item, i) => (
          <div className="border-border/30 md:border-l md:pl-6 first:md:border-l-0 first:md:pl-0" key={i}>
            <div className="flex gap-3">
              {item.variant === 'check' ? (
                <span
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                    accent,
                    'border-current',
                  )}
                  aria-hidden
                >
                  ✓
                </span>
              ) : null}
              <div>
                <p
                  className={cn(
                    'font-title text-base font-extrabold leading-snug lg:text-lg',
                    accent,
                    item.variant === 'numbered' && 'tabular-nums',
                  )}
                >
                  {item.lead}
                </p>
                {item.body ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
