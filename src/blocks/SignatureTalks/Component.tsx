import type { SignatureTalksBlock as SignatureTalksBlockProps } from '@/payload-types'
import React from 'react'

import { BRAND_ACCENTS } from '@/utilities/brandAccents'

/**
 * The talk list an organizer scans before deciding whether to enquire.
 *
 * Was a two-column grid of bordered cards, which forced long titles to wrap
 * hard and made the list read as eight objects rather than one menu. A single
 * column with rules between rows lets each title run on one or two lines and
 * keeps the scan vertical, which is how this gets read.
 */
export const SignatureTalksBlock: React.FC<SignatureTalksBlockProps> = (props) => {
  const { heading = 'Signature talks', intro, talks } = props
  if (!talks?.length) return null

  return (
    <div className="container my-16 md:my-20 lg:my-24">
      <h2 className="font-title text-display-h2 font-semibold tracking-tight md:text-display-h2-md">
        {heading}
      </h2>
      {intro ? (
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted-foreground lg:text-lg">
          {intro}
        </p>
      ) : null}

      <div className="mt-10 border-t border-border/60 md:mt-12">
        {talks.map((talk, i) => (
          <div
            className="grid grid-cols-1 gap-x-6 gap-y-1 border-b border-border/60 py-6 sm:grid-cols-[3.25rem_1fr] md:py-7"
            key={i}
          >
            <span
              className="font-title text-xs font-medium tabular-nums tracking-[0.1em] sm:pt-1.5"
              style={{ color: BRAND_ACCENTS.teal }}
            >
              {talk.number}
            </span>
            <div className="min-w-0">
              <h3 className="font-title text-lg font-medium leading-snug tracking-tight text-foreground md:text-xl">
                {talk.title?.trim()}
              </h3>
              {talk.subtitle?.trim() ? (
                <p className="mt-1.5 max-w-[72ch] text-[0.95rem] leading-relaxed text-muted-foreground">
                  {talk.subtitle.trim()}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
