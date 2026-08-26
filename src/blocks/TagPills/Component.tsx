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
        {tags.map((t, i) => (
          /** Matches the biography pills exactly: square, soft fill, palette text. */
          <span
            className="inline-flex items-center rounded-none bg-white/[0.06] px-4 py-2 text-[0.82rem] font-semibold uppercase tracking-[0.08em]"
            key={i}
            style={{ color: accentForIndex(i) }}
          >
            {t.label}
          </span>
        ))}
      </div>
    </div>
  )
}
