import type { BookCoverRowBlock as BookCoverRowBlockProps, Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/ui'
import React from 'react'

import { Media } from '@/components/Media'

/** Tuned for sharp covers: ~320–384px CSS width × 2–3× DPR → srcset pulls adequate pixels. */
const COVER_SIZES =
  '(max-width: 640px) min(88vw, 380px), (max-width: 1024px) min(42vw, 340px), min(30vw, 360px)'

export const BookCoverRowBlock: React.FC<BookCoverRowBlockProps> = (props) => {
  const { heading, intro, covers, aspectRatio = '2:3' } = props
  if (!covers?.length) return null

  const aspectClass = aspectRatio === '3:4' ? 'aspect-[3/4]' : 'aspect-[2/3]'

  return (
    <div className="container my-10 lg:my-14">
      {heading ? (
        <h2 className="mb-3 text-center font-title text-xl font-semibold tracking-tight md:text-2xl">
          {heading}
        </h2>
      ) : null}
      {intro ? (
        <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-muted-foreground md:mb-10 md:text-base">
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
            'Book cover'

          return (
            <figure
              className="mx-auto flex w-full max-w-[min(100%,22rem)] flex-col sm:max-w-none"
              key={i}
            >
              <div
                className={cn('relative w-full overflow-hidden rounded-md bg-muted/15', aspectClass)}
              >
                <Media
                  alt={alt}
                  className="absolute inset-0 h-full w-full"
                  imgClassName="object-contain object-center"
                  pictureClassName="relative block h-full w-full"
                  quality={100}
                  resource={media}
                  size={COVER_SIZES}
                  fill
                />
              </div>
              {row.caption ? (
                <figcaption className="mt-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground md:text-sm">
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
