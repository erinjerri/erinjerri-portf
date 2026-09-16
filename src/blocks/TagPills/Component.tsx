import type { TagPillsBlock as TagPillsBlockProps } from '@/payload-types'
import React from 'react'

import { accentForIndex } from '@/utilities/brandAccents'

export const TagPillsBlock: React.FC<TagPillsBlockProps> = (props) => {
  const { intro, tags } = props
  if (!tags?.length) return null

  return (
    <div className="container my-6 lg:my-8">
      {intro ? (
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground lg:text-base">{intro}</p>
      ) : null}
      <div className="flex flex-wrap justify-center gap-2 lg:justify-start lg:gap-3">
        {tags.map((t, i) => {
          const isDeprecatedFollowerClaim = t.label.toLowerCase().includes('10k')

          return (
            <span
              className="inline-flex items-center rounded-none bg-white/[0.08] px-4 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.1em]"
              key={i}
              style={{ color: accentForIndex(i) }}
            >
              <span
                className={
                  isDeprecatedFollowerClaim
                    ? 'line-through decoration-[#78e7df] decoration-2'
                    : undefined
                }
              >
                {t.label}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
