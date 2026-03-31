import type { TagPillsBlock as TagPillsBlockProps } from '@/payload-types'
import React from 'react'

const accent = 'border-[hsl(43_42%_58%)]/50 text-[hsl(43_42%_58%)]'

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
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider ${accent}`}
            key={i}
          >
            {t.label}
          </span>
        ))}
      </div>
    </div>
  )
}
