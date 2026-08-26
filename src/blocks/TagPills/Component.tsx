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
          /** Cycle teal → mint → pink, the same palette the biography uses. */
          const color = accentForIndex(i)

          return (
            <span
              className="inline-flex items-center rounded-[8px] border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider"
              key={i}
              style={{ borderColor: `${color}80`, color }}
            >
              {t.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
