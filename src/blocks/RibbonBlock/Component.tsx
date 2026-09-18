import type { RibbonBlockBlock as RibbonBlockBlockProps } from '@/payload-types'
import React from 'react'

import { accentForIndex, BRAND_ACCENTS } from '@/utilities/brandAccents'

const defaultColumns = [
  {
    number: '01',
    title: 'AI Agents',
    description: 'Systems that operate beyond chat - executing inside real products and workflows.',
  },
  {
    number: '02',
    title: 'Spatial Computing',
    description: 'AR, VR, and mixed reality interfaces built for visionOS, iOS, and what comes next.',
  },
  {
    number: '03',
    title: 'Product Systems',
    description: 'Architecture and strategy for AI-native products designed to scale in the real world.',
  },
] as const

function renderHeadline(headline: string, highlight: string | null | undefined) {
  const phrase = highlight?.trim()
  if (!phrase) return headline

  const index = headline.indexOf(phrase)
  if (index === -1) return headline

  return (
    <>
      {headline.slice(0, index)}
      <span className="italic" style={{ color: BRAND_ACCENTS.mint }}>
        {phrase}
      </span>
      {headline.slice(index + phrase.length)}
    </>
  )
}

/**
 * Positioning statement plus three practice areas.
 *
 * Previously a full-bleed band with a gradient wash, centred type, and the
 * three columns boxed in with dividers 11rem below the headline. The boxes gave
 * every card the same weight as the statement above it, and the gap read as two
 * unrelated sections. Now: page ground, left-aligned, and each card carries a
 * single accent rule on top — enough to separate them, not enough to compete.
 */
export const RibbonBlockBlock: React.FC<RibbonBlockBlockProps> = ({
  tagline,
  headline,
  highlight,
  supportingText,
  columns,
}) => {
  const columnItems =
    columns?.filter((item) => item?.title?.trim() || item?.description?.trim()).slice(0, 3) ?? []

  while (columnItems.length < 3) {
    columnItems.push({ ...defaultColumns[columnItems.length]! })
  }

  const displayHeadline =
    headline?.trim() ||
    'I focus on what happens after the model - when AI has to operate inside products, workflows, and environments.'

  return (
    <div className="container my-16 md:my-20 lg:my-24">
      {tagline?.trim() ? (
        <p
          className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em]"
          style={{ color: BRAND_ACCENTS.teal }}
        >
          {tagline.trim()}
        </p>
      ) : null}

      <h2 className="mt-5 max-w-[24ch] font-title text-[2rem] font-semibold leading-[1.14] tracking-tight text-balance md:text-[2.6rem]">
        {renderHeadline(displayHeadline, highlight)}
      </h2>

      {supportingText?.trim() ? (
        <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-muted-foreground md:text-lg">
          {supportingText.trim()}
        </p>
      ) : null}

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 md:mt-12 md:grid-cols-3 lg:gap-x-8">
        {columnItems.map((item, index) => (
          <div
            className="border-t-2 pt-5"
            key={`${item.number}-${index}`}
            style={{ borderTopColor: accentForIndex(index) }}
          >
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-muted-foreground/70">
              {item.number?.trim() || defaultColumns[index]!.number}
            </p>
            <h3 className="mt-2 font-title text-xl font-semibold leading-snug tracking-tight md:text-[1.35rem]">
              {item.title?.trim() || defaultColumns[index]!.title}
            </h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
              {item.description?.trim() || defaultColumns[index]!.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
