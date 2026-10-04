import type {
  BookCoverRowBlock as BookCoverRowBlockProps,
  Media as MediaType,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'

/** Tuned for sharp covers: ~320-384px CSS width x 2-3x DPR -> srcset pulls adequate pixels. */
const COVER_SIZES =
  '(max-width: 640px) min(88vw, 380px), (max-width: 1024px) min(42vw, 340px), min(30vw, 360px)'

/** The lead portrait carries the section, so it gets a real share of the viewport. */
const LEAD_SIZES = '(max-width: 768px) 88vw, (max-width: 1280px) 45vw, 480px'

export const BookCoverRowBlock: React.FC<BookCoverRowBlockProps> = (props) => {
  const { heading, intro, covers, leadImage } = props
  if (!covers?.length) return null

  const lead = leadImage && typeof leadImage === 'object' ? (leadImage as MediaType) : null

  const coverGrid = cn(
    'grid gap-10',
    // Beside a lead portrait the covers are supporting evidence, so they stay
    // three-across on one row rather than expanding to fill the section.
    lead
      ? 'mt-8 grid-cols-3 gap-4 sm:gap-5'
      : cn(
          covers.length === 1 && 'max-w-sm justify-items-center md:mx-auto',
          covers.length === 2 && 'grid-cols-1 sm:grid-cols-2 sm:gap-8 lg:gap-12',
          covers.length >= 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-12',
        ),
  )

  const copy = (
    <>
      {heading ? (
        <h2
          className={cn(
            'font-title text-display-h2 font-semibold tracking-tight md:text-display-h2-md',
            lead ? 'mb-4' : 'mb-3 text-center',
          )}
        >
          {heading}
        </h2>
      ) : null}
      {intro ? (
        <p
          className={cn(
            'text-base leading-relaxed text-muted-foreground',
            lead ? 'max-w-[54ch]' : 'mx-auto mb-8 max-w-2xl text-center md:mb-10',
          )}
        >
          {intro}
        </p>
      ) : null}
    </>
  )

  const coverRow = (
    <div className={coverGrid}>
      {covers.map((row, i) => {
        const asset = row.image
        if (!asset || typeof asset !== 'object') return null
        const media = asset as MediaType
        const alt =
          (typeof media.alt === 'string' && media.alt.trim()) ||
          row.caption?.trim() ||
          "Creating Augmented and Virtual Realities O'Reilly book cover"
        const btnLabel = typeof row.buttonLabel === 'string' ? row.buttonLabel.trim() : ''
        const btnUrl = typeof row.buttonUrl === 'string' ? row.buttonUrl.trim() : ''
        const showButton = Boolean(btnLabel && btnUrl)

        return (
          <figure
            className={cn(
              'flex w-full flex-col gap-y-2',
              lead ? 'min-w-0' : 'mx-auto max-w-[min(100%,22rem)] sm:max-w-none',
            )}
            key={i}
          >
            <div className="w-full min-h-0 overflow-hidden rounded-none">
              <Media
                alt={alt}
                className="block w-full max-w-full"
                imgClassName="h-auto w-full max-w-full rounded-none"
                pictureClassName="block w-full"
                quality={100}
                resource={media}
                size={COVER_SIZES}
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
              <figcaption
                className={cn(
                  'text-xs font-medium uppercase tracking-wider text-muted-foreground md:text-sm',
                  lead ? 'text-left' : 'text-center',
                )}
              >
                {row.caption}
              </figcaption>
            ) : null}
          </figure>
        )
      })}
    </div>
  )

  if (!lead) {
    return (
      <div className="container mt-12 mb-3 md:mt-16 md:mb-4 lg:mt-20 lg:mb-6">
        {copy}
        {coverRow}
      </div>
    )
  }

  return (
    <div className="container mt-12 mb-3 md:mt-16 md:mb-4 lg:mt-20 lg:mb-6">
      <div className="grid items-start gap-8 md:gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14">
        <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
          <Media
            alt={(typeof lead.alt === 'string' && lead.alt.trim()) || 'Erin Jerri with the book'}
            className="block w-full"
            imgClassName="h-auto w-full rounded-none"
            pictureClassName="block w-full"
            quality={90}
            resource={lead}
            size={LEAD_SIZES}
          />
        </div>
        <div className="min-w-0">
          {copy}
          {coverRow}
        </div>
      </div>
    </div>
  )
}
