import type { TwoDoorsBlock as TwoDoorsBlockProps } from '@/payload-types'
import React from 'react'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

const accent = 'text-[hsl(43_42%_58%)]'
const accentBorder = 'border-[hsl(43_42%_58%)]'
const accentBg = 'bg-[hsl(43_42%_58%)]'

export const TwoDoorsBlock: React.FC<TwoDoorsBlockProps> = (props) => {
  const { eyebrow, heading, intro, doors } = props

  if (!doors?.length) return null

  return (
    <div className="container my-16 md:my-20 lg:my-24">
      {/* The eyebrow *is* the section heading here — "WORK WITH ME" in the
          title face, gold, rather than a small label above a second headline. */}
      {eyebrow ? (
        <h2
          className={cn(
            'font-title text-display-h2 font-semibold uppercase tracking-[0.12em] md:text-display-h2-md',
            accent,
          )}
        >
          {eyebrow}
        </h2>
      ) : null}
      {heading ? (
        <p className="mt-3 font-title text-xl font-medium tracking-tight text-foreground/95 md:text-2xl">
          {heading}
        </p>
      ) : null}
      {intro ? (
        <p className="mt-3 max-w-2xl text-muted-foreground lg:text-lg">{intro}</p>
      ) : null}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {doors.map((door, i) => (
          <div
            className="flex flex-col border border-border/60 bg-card/20"
            key={i}
          >
            {door.image ? (
              <Media
                fill
                imgClassName="object-cover"
                pictureClassName="relative block w-full aspect-[16/9] overflow-hidden"
                resource={door.image}
                size="(max-width: 768px) 100vw, 45vw"
              />
            ) : null}
            <div className="flex flex-1 flex-col gap-4 p-5 lg:p-6">
              {door.kicker ? (
                <span
                  className={cn(
                    'font-title text-xs font-semibold uppercase tracking-[0.14em]',
                    accent,
                  )}
                >
                  {door.kicker}
                </span>
              ) : null}
              <h3 className="font-title text-xl font-semibold leading-snug text-foreground/95 lg:text-2xl">
                {door.title}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">{door.body}</p>
              <a
                className={cn(
                  'mt-1 inline-block self-start border px-5 py-3 font-title text-sm font-semibold no-underline transition-colors',
                  accentBorder,
                  door.ctaStyle === 'outline'
                    ? cn(accent, 'hover:bg-[hsl(43_42%_58%)]/10')
                    : cn(accentBg, 'text-background hover:opacity-90'),
                )}
                href={door.ctaUrl ?? '#'}
              >
                {door.ctaLabel}
              </a>
              {door.terms ? (
                <div className="mt-auto border-t border-border/60 pt-4 font-title text-xs uppercase leading-relaxed tracking-[0.08em] text-[hsl(43_42%_58%)]">
                  {door.terms
                    .split('\n')
                    .filter((line) => line.trim())
                    .map((line, j) => (
                      <div key={j}>{line}</div>
                    ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
