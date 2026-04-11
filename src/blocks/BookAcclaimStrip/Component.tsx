import { cn } from '@/utilities/ui'
import type { BookAcclaimStripBlock as BookAcclaimStripBlockProps } from '@/payload-types'
import React from 'react'

/**
 * Section title: near-black. `!` beats `[data-home-prismatic] h2` in globals (which forces light mist).
 */
const sectionHeadingClass =
  'font-title text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl'

/**
 * Numbered leads: stepped type (no arbitrary clamp — Tailwind v3 turns `_` inside arbitrary
 * font-size values into spaces, which breaks valid clamp() syntax).
 */
const leadNumberedClass =
  'max-w-full break-words text-balance font-title font-semibold tabular-nums leading-[1.08] tracking-tight text-white/90 ' +
  'text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-5xl 2xl:text-6xl'

/** Check-variant leads: smaller scale, same wrap safety. */
const leadCheckClass =
  'max-w-full break-words text-balance font-title font-semibold leading-[1.15] tracking-tight text-white/90 ' +
  'text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-4xl 2xl:text-5xl'

export const BookAcclaimStripBlock: React.FC<BookAcclaimStripBlockProps> = (props) => {
  const { heading = 'Book acclaim', items } = props
  if (!items?.length) return null

  const count = items.length

  return (
    <section className="book-acclaim-strip w-full py-24 text-foreground md:py-32">
      <div className="container">
        {heading ? <h2 className={sectionHeadingClass}>{heading}</h2> : null}
        <div
          className={cn(
            'mt-8 grid grid-cols-1 gap-y-12 sm:mt-10 sm:gap-y-14 lg:mt-12',
            /* One column until there is room; three-up only at xl+ */
            count >= 3 && 'xl:grid-cols-3 xl:gap-x-10 xl:gap-y-14 2xl:gap-x-14',
            count === 2 && 'lg:grid-cols-2 lg:gap-x-12 lg:gap-y-12',
          )}
        >
          {items.map((item, i) => (
            <div className="min-w-0 text-center sm:text-left" key={i}>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-4">
                {item.variant === 'check' ? (
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border-2 border-white/20 text-sm font-bold text-white sm:mt-1',
                    )}
                    aria-hidden
                  >
                    ✓
                  </span>
                ) : null}
                <div className="min-w-0 w-full max-w-full flex-1">
                  <p
                    className={cn(
                      item.variant === 'numbered' ? leadNumberedClass : leadCheckClass,
                    )}
                  >
                    {item.lead}
                  </p>
                  {item.body ? (
                    <p className="mx-auto mt-4 max-w-prose text-base leading-relaxed text-white/70 sm:mx-0 md:text-lg">
                      {item.body}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
