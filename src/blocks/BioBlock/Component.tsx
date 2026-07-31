import type { BioBlockBlock as BioBlockBlockProps } from '@/payload-types'
import { bioVariants } from './bioVariants'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import Image from 'next/image'
import React, { Fragment } from 'react'
import { SpeakerBioKit, type SpeakerHeadshotOption } from './SpeakerBioKit.client'

const colorMap = {
  mint: '#9ff0bd',
  teal: '#78e7df',
  pink: '#f3b0d2',
  white: 'rgba(255,255,255,0.92)',
} as const

type BioParagraph = NonNullable<BioBlockBlockProps['paragraphs']>[number]
type BioHighlight = NonNullable<NonNullable<BioParagraph['highlights']>>[number]
type BioBlockBlockComponentProps = BioBlockBlockProps & {
  pageSlug?: string
}

function isHeadshotResource(
  resource: BioBlockBlockProps['headshot'],
): resource is SpeakerHeadshotOption['image'] {
  return Boolean(
    (resource && typeof resource === 'object') ||
    (typeof resource === 'string' && resource.trim().length > 0),
  )
}

function headshotResourceKey(resource: SpeakerHeadshotOption['image']): string {
  if (typeof resource === 'string') return resource
  return String(resource.id ?? resource.url ?? resource.filename ?? '')
}

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

export const BioBlockBlock: React.FC<BioBlockBlockComponentProps> = ({
  eyebrow,
  headshot,
  headshotsDownloadable,
  headline,
  pageSlug,
  paragraphs,
  pills,
  speakerHeadshots,
}) => {
  if (pageSlug === 'about') {
    console.log('[About bio debug] Canonical bio renderer is BioBlockBlock')
  }

  const bioParagraphs = paragraphs?.filter((paragraph) => paragraph?.text?.trim()) ?? []
  const bioPills = pills?.filter((pill) => pill?.label?.trim()) ?? []
  const hasHeadshot = isHeadshotResource(headshot)
  const speakerKitHeadshots = [
    ...(hasHeadshot
      ? [
          {
            id: 'primary',
            image: headshot,
            label: 'Primary headshot',
          } satisfies SpeakerHeadshotOption,
        ]
      : []),
    ...(speakerHeadshots ?? [])
      .filter((item) => isHeadshotResource(item?.image))
      .map(
        (item, index) =>
          ({
            id: item.id ?? `alternate-${index + 1}`,
            image: item.image,
            label: item.label,
            caption: item.caption,
          }) satisfies SpeakerHeadshotOption,
      ),
  ].filter((item, index, items) => {
    const key = headshotResourceKey(item.image)
    return (
      Boolean(key) &&
      items.findIndex((candidate) => headshotResourceKey(candidate.image) === key) === index
    )
  })

  if (!headline?.trim() && !bioParagraphs.length && !bioPills.length && !hasHeadshot) return null

  return (
    <section className="bg-transparent px-8 py-10 text-white md:px-12 md:py-12">
      {eyebrow?.trim() ? (
        <div className="mb-10 flex items-center gap-4">
          <span className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-white/28">
            {eyebrow.trim()}
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] lg:items-start">
        <div>
          {headline?.trim() ? (
            <h2 className="max-w-4xl font-title text-[2.35rem] font-normal leading-[1.18] text-white md:text-[3.1rem]">
              {headline.trim()}
            </h2>
          ) : null}

          <div className={headline?.trim() ? 'mt-8 space-y-7 md:mt-9' : 'space-y-7'}>
            {bioParagraphs.map((paragraph, index) => (
              <p
                className={cn(
                  'max-w-4xl text-white/78',
                  pageSlug === 'home'
                    ? 'text-[clamp(1.125rem,2vw,1.375rem)] font-normal leading-[1.72]'
                    : 'text-[1rem] leading-8 md:text-[1.0625rem] md:leading-9',
                )}
                key={paragraph.id ?? index}
              >
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
                    className="inline-flex items-center rounded-none bg-white/[0.06] px-4 py-2 text-[0.82rem] font-semibold uppercase tracking-[0.08em]"
                    key={pill.id ?? index}
                    style={{ color }}
                  >
                    {pill.label?.trim()}
                  </span>
                )
              })}
            </div>
          ) : null}
        </div>

        {hasHeadshot ? (
          <div className="relative mx-auto w-full max-w-[24rem] overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.24)] lg:sticky lg:top-28">
            {typeof headshot === 'string' ? (
              <Image
                alt="Erin Jerri Malonzo Pañgilinan"
                className="aspect-[4/5] h-full w-full object-cover"
                loading="lazy"
                height={663}
                src={headshot}
                sizes="(max-width: 1024px) min(100vw, 384px), 360px"
                width={600}
              />
            ) : (
              <Media
                imgClassName="aspect-[4/5] h-full w-full object-cover"
                priority={false}
                resource={headshot}
                size="(max-width: 1024px) min(100vw, 384px), 360px"
              />
            )}
          </div>
        ) : null}
      </div>

      {pageSlug !== 'home' ? (
        <SpeakerBioKit
          headshots={speakerKitHeadshots}
          headshotsDownloadable={headshotsDownloadable ?? true}
          variants={bioVariants}
        />
      ) : null}
    </section>
  )
}
