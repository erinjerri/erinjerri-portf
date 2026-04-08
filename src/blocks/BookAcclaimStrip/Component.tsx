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
            'mt-8 grid gap-4 border border-slate-200 bg-slate-50/90 p-4 lg:gap-6 lg:p-6',
            items.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2',
          )}
        >
          {items.map((item, i) => (
            <div
              className="border-slate-200 md:border-l md:pl-6 first:md:border-l-0 first:md:pl-0"
              key={i}
            >
              <div className="flex gap-3">
                {item.variant === 'check' ? (
                  <span
                    className={cn(
                      'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary text-xs font-bold text-primary',
                    )}
                    aria-hidden
                  >
                    ✓
                  </span>
                ) : null}
                <div>
                  <p
                    className={cn(
                      'font-title text-base font-extrabold leading-snug text-primary lg:text-lg',
                      item.variant === 'numbered' && 'tabular-nums',
                    )}
                  >
                    {item.lead}
                  </p>
                  {item.body ? (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
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
