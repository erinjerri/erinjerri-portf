import type {
  BookCoverRowBlock as BookCoverRowBlockProps,
  Media as MediaType,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'

/** Tuned for sharp covers: ~320–384px CSS width × 2–3× DPR → srcset pulls adequate pixels. */
const COVER_SIZES =
  '(max-width: 640px) min(88vw, 380px), (max-width: 1024px) min(42vw, 340px), min(30vw, 360px)'

type CoverRow = NonNullable<BookCoverRowBlockProps['covers']>[number]

type EditorialBookCoverRowProps = BookCoverRowBlockProps & {
  body?: string | null
  note?: string | null
  primaryButtonLabel?: string | null
  primaryButtonUrl?: string | null
  secondaryButtonLabel?: string | null
  secondaryButtonUrl?: string | null
  variant?: 'default' | 'authorProof' | null
}

function resolveCoverImage(row: CoverRow): MediaType | string | null {
  const asset = row.image
  if (!asset) return null
  if (typeof asset === 'object') return asset as MediaType
  if (typeof asset === 'string' && (asset.startsWith('/') || asset.startsWith('http'))) return asset
  return null
}

function coverAlt(row: CoverRow, fallback: string): string {
  const asset = row.image
  if (asset && typeof asset === 'object' && typeof asset.alt === 'string' && asset.alt.trim()) {
    return asset.alt.trim()
  }

  return row.caption?.trim() || fallback
}

export const BookCoverRowBlock: React.FC<BookCoverRowBlockProps> = (props) => {
  const {
    body,
    covers,
    heading,
    intro,
    note,
    primaryButtonLabel,
    primaryButtonUrl,
    secondaryButtonLabel,
    secondaryButtonUrl,
    variant,
  } = props as EditorialBookCoverRowProps
  if (!covers?.length) return null

  if (variant === 'authorProof') {
    const [feature, ...editions] = covers
    const featureImage = feature ? resolveCoverImage(feature) : null
    const buttons = [
      { label: primaryButtonLabel, url: primaryButtonUrl },
      { label: secondaryButtonLabel, url: secondaryButtonUrl },
    ].filter((button): button is { label: string; url: string } =>
      Boolean(button.label?.trim() && button.url?.trim()),
    )

    return (
      <div className="container my-16 md:my-20 lg:my-24">
        <section className="relative overflow-hidden border border-border/70 bg-[#050913] px-6 py-8 text-foreground sm:px-8 md:px-10 md:py-12 lg:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_10%_0%,rgba(120,231,223,0.18),transparent_32%),radial-gradient(circle_at_92%_100%,rgba(243,176,210,0.14),transparent_34%),linear-gradient(135deg,rgba(120,231,223,0.08),transparent_42%)]" />
          <div className="relative grid gap-9 lg:grid-cols-[minmax(16rem,0.86fr)_minmax(0,1.25fr)] lg:items-center lg:gap-12">
            {featureImage ? (
              <figure>
                <div className="overflow-hidden bg-black/15">
                  <Media
                    alt={
                      feature
                        ? coverAlt(
                            feature,
                            'Erin Jerri holding Creating Augmented and Virtual Realities',
                          )
                        : ''
                    }
                    className="block w-full"
                    imgClassName="h-auto w-full object-cover"
                    imagePlaceholder="empty"
                    priority
                    resource={typeof featureImage === 'object' ? featureImage : undefined}
                    src={typeof featureImage === 'string' ? featureImage : undefined}
                    size="(max-width: 1024px) min(88vw, 460px), 420px"
                  />
                </div>
                {feature?.caption ? (
                  <figcaption className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                    {feature.caption}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}

            <div>
              {intro ? (
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#78e7df]">
                  {intro}
                </p>
              ) : null}
              {heading ? (
                <h2 className="max-w-2xl font-title text-3xl font-semibold leading-tight tracking-normal text-white md:text-4xl lg:text-[2.65rem]">
                  {heading}
                </h2>
              ) : null}
              {body ? (
                <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                  {body}
                </p>
              ) : null}

              {editions.length ? (
                <div className="mt-8 grid grid-cols-3 items-end gap-4 sm:max-w-[32rem] sm:gap-6">
                  {editions.map((row, i) => {
                    const image = resolveCoverImage(row)
                    if (!image) return null

                    return (
                      <figure className="min-w-0" key={i}>
                        <Media
                          alt={coverAlt(
                            row,
                            "Creating Augmented and Virtual Realities O'Reilly book cover",
                          )}
                          className="block w-full"
                          imgClassName="h-auto w-full bg-white"
                          imagePlaceholder="empty"
                          quality={100}
                          resource={typeof image === 'object' ? image : undefined}
                          src={typeof image === 'string' ? image : undefined}
                          size="(max-width: 640px) 28vw, 150px"
                        />
                        {row.caption ? (
                          <figcaption className="mt-3 text-center font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                            {row.caption}
                          </figcaption>
                        ) : null}
                      </figure>
                    )
                  })}
                </div>
              ) : null}

              {buttons.length ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  {buttons.map((button) => (
                    <Button asChild className="rounded-none" variant="outline" key={button.label}>
                      <Link href={button.url}>{button.label}</Link>
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
        {note ? (
          <p className="mt-5 border-l border-[#78e7df]/45 pl-4 text-sm leading-7 text-muted-foreground">
            {note}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="container mt-12 mb-3 md:mt-16 md:mb-4 lg:mt-20 lg:mb-6">
      {heading ? (
        <h2 className="mb-3 text-center font-title text-display-h2 font-semibold tracking-tight md:text-display-h2-md">
          {heading}
        </h2>
      ) : null}
      {intro ? (
        <p className="mx-auto mb-8 max-w-2xl text-center text-base leading-relaxed text-muted-foreground md:mb-10">
          {intro}
        </p>
      ) : null}

      <div
        className={cn(
          'grid gap-10',
          covers.length === 1 && 'max-w-sm justify-items-center md:mx-auto',
          covers.length === 2 && 'grid-cols-1 sm:grid-cols-2 sm:gap-8 lg:gap-12',
          covers.length >= 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-12',
        )}
      >
        {covers.map((row, i) => {
          const image = resolveCoverImage(row)
          if (!image) return null
          const alt = coverAlt(row, "Creating Augmented and Virtual Realities O'Reilly book cover")
          const btnLabel = typeof row.buttonLabel === 'string' ? row.buttonLabel.trim() : ''
          const btnUrl = typeof row.buttonUrl === 'string' ? row.buttonUrl.trim() : ''
          const showButton = Boolean(btnLabel && btnUrl)

          return (
            <figure
              className="mx-auto flex w-full max-w-[min(100%,22rem)] flex-col gap-y-2 sm:max-w-none"
              key={i}
            >
              <div className="w-full min-h-0 overflow-hidden rounded-none">
                <Media
                  alt={alt}
                  className="block w-full max-w-full"
                  imgClassName="h-auto w-full max-w-full rounded-none"
                  pictureClassName="block w-full"
                  quality={100}
                  resource={typeof image === 'object' ? image : undefined}
                  size={COVER_SIZES}
                  src={typeof image === 'string' ? image : undefined}
                />
              </div>
              {showButton ? (
                <div className="flex w-full shrink-0 justify-center sm:justify-start">
                  <Button asChild variant="outline" className="w-full rounded-none sm:w-auto">
                    <Link href={btnUrl}>{btnLabel}</Link>
                  </Button>
                </div>
              ) : null}
              {row.caption ? (
                <figcaption className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground md:text-sm">
                  {row.caption}
                </figcaption>
              ) : null}
            </figure>
          )
        })}
      </div>
    </div>
  )
}
