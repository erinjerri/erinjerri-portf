import type { SignatureTalksBlock as SignatureTalksBlockProps } from '@/payload-types'
import React from 'react'

const accent = 'text-[hsl(43_42%_58%)]'

export const SignatureTalksBlock: React.FC<SignatureTalksBlockProps> = (props) => {
  const { heading = 'Signature talks', intro, talks } = props
  if (!talks?.length) return null

  return (
    <div className="container my-16 md:my-20 lg:my-24">
      <h2 className="font-title text-display-h2 font-semibold tracking-tight md:text-display-h2-md">
        {heading}
      </h2>
      {intro ? (
        <p className="mt-3 max-w-3xl text-muted-foreground lg:text-lg">{intro}</p>
      ) : null}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {talks.map((talk, i) => (
          <div
            className="border border-border/60 bg-card/20 p-5 lg:p-6"
            key={i}
          >
            <div className="flex gap-4">
              <span className={`font-title text-xl font-semibold tabular-nums sm:text-2xl ${accent}`}>
                {talk.number}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-title text-base font-semibold leading-snug text-foreground/95 lg:text-lg">
                  {talk.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {talk.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
