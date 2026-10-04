import type { TagPillsBlock as TagPillsBlockProps } from '@/payload-types'
import React from 'react'

import { accentForIndex } from '@/utilities/brandAccents'

const NEAR_BLACK = '#0a0b10'

/**
 * Mix an accent toward the page ground.
 *
 * The palette is pastel, so an accent fill can only carry dark text. The "deep"
 * variant exists for white text and needs the fill taken most of the way down
 * to the background before contrast is acceptable.
 */
function deepen(hex: string, towardGround = 0.78): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return hex
  const ground = [0x0a, 0x0b, 0x10]
  const mixed = [1, 2, 3].map((i) => {
    const channel = parseInt(m[i]!, 16)
    return Math.round(channel + (ground[i - 1]! - channel) * towardGround)
  })
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function pillStyle(variant: string, accent: string): React.CSSProperties {
  switch (variant) {
    case 'solid':
      return { backgroundColor: accent, color: NEAR_BLACK }
    case 'outline':
      return { backgroundColor: 'transparent', border: `1px solid ${accent}`, color: accent }
    case 'deep':
      return {
        backgroundColor: deepen(accent),
        border: `1px solid ${accent}`,
        color: 'rgba(255,255,255,0.95)',
      }
    default:
      return { backgroundColor: 'rgba(255,255,255,0.08)', color: accent }
  }
}

export const TagPillsBlock: React.FC<TagPillsBlockProps> = (props) => {
  const { intro, tags, variant } = props
  if (!tags?.length) return null

  const style = variant ?? 'subtle'

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
              className="inline-flex items-center rounded-none px-4 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.1em]"
              key={i}
              style={pillStyle(style, accentForIndex(i))}
            >
              <span className={isDeprecatedFollowerClaim ? 'line-through decoration-2' : undefined}>
                {t.label}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
