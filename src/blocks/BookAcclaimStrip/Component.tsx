import { cn } from '@/utilities/ui'
import type { BookAcclaimStripBlock as BookAcclaimStripBlockProps } from '@/payload-types'
import React from 'react'

/** Matches hero RichText h1 sizing from tailwind typography (`prose` / `md:prose-md`). */
const heroH1Class =
  'font-title text-[2.5rem] font-extrabold leading-[1.1] tracking-tight md:text-[3.5rem]'

export const BookAcclaimStripBlock: React.FC<BookAcclaimStripBlockProps> = (props) => {
  const { heading = 'Book acclaim', items } = props
  if (!items?.length) return null

  return (
    <section className="w-full border-t border-slate-200 bg-white py-12 text-slate-900 lg:py-16">
      <div className="container">
        {heading ? <h2 className={heroH1Class}>{heading}</h2> : null}
        <div
          className={cn(
            'mt-10 grid gap-10 lg:mt-12 lg:gap-14',
            items.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2',
          )}
        >
          {items.map((item, i) => (
            <div className="text-center md:text-left" key={i}>
              <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-4">
                {item.variant === 'check' ? (
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary text-sm font-bold text-primary md:mt-1',
                    )}
                    aria-hidden
                  >
                    ✓
                  </span>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'font-title font-extrabold leading-[1.05] tracking-tight text-primary',
                      item.variant === 'numbered'
                        ? 'text-3xl tabular-nums sm:text-4xl lg:text-5xl'
                        : 'text-xl sm:text-2xl lg:text-3xl',
                    )}
                  >
                    {item.lead}
                  </p>
                  {item.body ? (
                    <p className="mx-auto mt-3 max-w-prose text-base leading-relaxed text-slate-700 md:mx-0">
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
