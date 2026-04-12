import type { BioBlockBlock as BioBlockBlockProps } from '@/payload-types'
import React, { Fragment } from 'react'

const colorMap = {
  mint: '#9ff0bd',
  teal: '#78e7df',
  pink: '#f3b0d2',
  white: 'rgba(255,255,255,0.92)',
} as const

type BioParagraph = NonNullable<BioBlockBlockProps['paragraphs']>[number]
type BioHighlight = NonNullable<NonNullable<BioParagraph['highlights']>>[number]

function renderParagraph(text: string, highlights: BioHighlight[] | null | undefined) {
  const activeHighlights = (highlights ?? []).filter((item) => item?.phrase?.trim())
  if (!activeHighlights.length) return text

  type Segment = { text: string; highlight?: BioHighlight }
  let segments: Segment[] = [{ text }]

  for (const highlight of activeHighlights) {
    const phrase = highlight.phrase.trim()
    const nextSegments: Segment[] = []

    for (const segment of segments) {
      if (segment.highlight) {
        nextSegments.push(segment)
        continue
      }

      const index = segment.text.indexOf(phrase)

      if (index === -1) {
        nextSegments.push(segment)
        continue
      }

      if (index > 0) nextSegments.push({ text: segment.text.slice(0, index) })
      nextSegments.push({ text: phrase, highlight })

      const rest = segment.text.slice(index + phrase.length)
      if (rest) nextSegments.push({ text: rest })
    }

    segments = nextSegments
  }

  return segments.map((segment, index) => {
    if (!segment.highlight) return <Fragment key={index}>{segment.text}</Fragment>

    const color = colorMap[segment.highlight.color ?? 'mint'] ?? colorMap.mint

    return (
      <span
        key={index}
        style={{
          color,
          fontWeight: 600,
          borderBottom: segment.highlight.underline ? `1px solid ${color}` : 'none',
        }}
      >
        {segment.text}
      </span>
    )
  })
}

export const BioBlockBlock: React.FC<BioBlockBlockProps> = ({
  eyebrow,
  headline,
  paragraphs,
  pills,
}) => {
  const bioParagraphs =
    paragraphs?.filter((paragraph) => paragraph?.text?.trim()) ?? []
  const bioPills = pills?.filter((pill) => pill?.label?.trim()) ?? []

  if (!headline?.trim() && !bioParagraphs.length && !bioPills.length) return null

  return (
    <section className="rounded-[8px] border border-white/10 bg-[#0b0d11] px-8 py-10 text-white shadow-[0_28px_80px_-48px_rgba(0,0,0,0.8)] md:px-12 md:py-12">
      {eyebrow?.trim() ? (
        <div className="mb-10 flex items-center gap-4">
          <span className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-white/28">
            {eyebrow.trim()}
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
      ) : null}

      {headline?.trim() ? (
        <h2 className="max-w-4xl font-title text-[2.35rem] font-semibold leading-[1.18] text-white md:text-[3.1rem]">
          {headline.trim()}
        </h2>
      ) : null}

      <div className="mt-8 space-y-6 md:mt-9">
        {bioParagraphs.map((paragraph, index) => (
          <p className="max-w-4xl text-[1.05rem] leading-8 text-white/50 md:text-[1.16rem] md:leading-9" key={paragraph.id ?? index}>
            {renderParagraph(paragraph.text?.trim() ?? '', paragraph.highlights)}
          </p>
        ))}
      </div>

      {bioPills.length ? (
        <div className="mt-10 flex flex-wrap gap-3">
          {bioPills.map((pill, index) => {
            const color = colorMap[pill.color ?? 'mint'] ?? colorMap.mint

            return (
              <span
                className="inline-flex items-center rounded-[8px] border px-4 py-2 text-[0.82rem] font-semibold uppercase tracking-[0.08em]"
                key={pill.id ?? index}
                style={{
                  borderColor: color,
                  color,
                  backgroundColor: 'rgba(255,255,255,0.01)',
                }}
              >
                {pill.label?.trim()}
              </span>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
