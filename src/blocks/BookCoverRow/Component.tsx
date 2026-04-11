import type { BookCoverRowBlock as BookCoverRowBlockProps, Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'

/** Tuned for sharp covers: ~320–384px CSS width × 2–3× DPR → srcset pulls adequate pixels. */
const COVER_SIZES =
  '(max-width: 640px) min(88vw, 380px), (max-width: 1024px) min(42vw, 340px), min(30vw, 360px)'

export const BookCoverRowBlock: React.FC<BookCoverRowBlockProps> = (props) => {
  const { heading, intro, covers } = props
  if (!covers?.length) return null

  return (
    <div className="container my-16 md:my-20 lg:my-24">
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
          covers.length >= 3 &&
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-12',
        )}
      >
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
              className="mx-auto flex w-full max-w-[min(100%,22rem)] flex-col sm:max-w-none"
              key={i}
            >
              <div className="w-full overflow-hidden rounded-none">
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
                <div className="mt-1.5 w-full shrink-0">
                  <Button asChild variant="outline" className="w-full rounded-none sm:w-auto">
                    <Link href={btnUrl}>{btnLabel}</Link>
                  </Button>
                </div>
              ) : null}
              {row.caption ? (
                <figcaption className="mt-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground md:text-sm">
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
