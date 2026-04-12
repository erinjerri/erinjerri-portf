import type { RibbonBlockBlock as RibbonBlockBlockProps } from '@/payload-types'
import React from 'react'

import { RibbonCurves } from './Curves'

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
      <span className="text-[#b7efc3] italic">{phrase}</span>
      {headline.slice(index + phrase.length)}
    </>
  )
}

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
    headline?.trim() || 'I focus on what happens after the model - when AI has to operate inside products, workflows, and environments.'

  return (
    <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#070910] text-white">
      <RibbonCurves />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,155,255,0.14),transparent_36%),radial-gradient(circle_at_82%_72%,rgba(126,104,255,0.1),transparent_30%),linear-gradient(180deg,rgba(8,10,16,0.78)_0%,rgba(7,9,14,0.96)_100%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-7 pb-0 pt-14 md:px-12 md:pt-20">
        {tagline?.trim() ? (
          <p className="mx-auto max-w-4xl text-center text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-white/30 md:text-[0.82rem]">
            {tagline.trim()}
          </p>
        ) : null}

        <div className="mx-auto mt-9 max-w-5xl text-center md:mt-12">
          <h2 className="font-title text-[2.2rem] font-semibold leading-[1.18] text-white md:text-[4rem] md:leading-[1.08]">
            {renderHeadline(displayHeadline, highlight)}
          </h2>

          {supportingText?.trim() ? (
            <p className="mx-auto mt-7 max-w-3xl text-[1.02rem] leading-8 text-white/44 md:text-[1.18rem] md:leading-9">
              {supportingText.trim()}
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-[13rem] max-w-6xl border-t border-white/10 px-7 pb-8 md:mt-[15rem] md:px-12 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {columnItems.map((item, index) => (
            <div
              className={
                index < 2
                  ? 'border-b border-white/10 py-8 md:border-b-0 md:border-r md:border-white/10 md:px-10 md:py-10'
                  : 'py-8 md:px-10 md:py-10'
              }
              key={`${item.number}-${index}`}
            >
              <p className="text-[0.86rem] font-semibold uppercase tracking-[0.16em] text-[#99e2ff]">
                {item.number?.trim() || defaultColumns[index]!.number}
              </p>
              <h3 className="mt-5 font-title text-[2rem] font-semibold leading-tight text-white md:text-[2.22rem]">
                {item.title?.trim() || defaultColumns[index]!.title}
              </h3>
              <p className="mt-4 max-w-[18rem] text-base leading-8 text-white/40 md:text-[1.05rem]">
                {item.description?.trim() || defaultColumns[index]!.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
