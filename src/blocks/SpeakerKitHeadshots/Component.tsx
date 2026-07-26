'use client'

import { Media } from '@/components/Media'
import { useState } from 'react'

type PhotoItem = { photo: any; caption?: string | null; id?: string | null }

type Props = {
  heading?: string | null
  photos?: PhotoItem[] | null
  downloadable?: boolean | null
}

export const SpeakerKitHeadshotsBlock: React.FC<Props> = ({
  heading = 'Speaker Kit Headshots',
  photos,
  downloadable,
}) => {
  const [index, setIndex] = useState(0)

  if (!photos || photos.length === 0) return null

  const total = photos.length
  const current = photos[index]
  const photoUrl = typeof current.photo === 'object' ? (current.photo as any)?.url : null

  return (
    <section className="container py-12 text-foreground">
      <p className="mb-6 text-xs font-semibold uppercase tracking-widest opacity-60">{heading}</p>

      <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-sm bg-muted">
        <Media fill imgClassName="object-cover w-full h-full" resource={current.photo} />
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button
          aria-label="Previous"
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-current transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30"
          disabled={total <= 1}
          onClick={() => setIndex((i) => (i - 1 + total) % total)}
          type="button"
        >
          ←
        </button>
        <span className="text-sm opacity-60">
          {index + 1} / {total}
        </span>
        <button
          aria-label="Next"
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-current transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30"
          disabled={total <= 1}
          onClick={() => setIndex((i) => (i + 1) % total)}
          type="button"
        >
          →
        </button>
      </div>

      {current.caption ? <p className="mt-3 text-xs italic opacity-60">{current.caption}</p> : null}

      {downloadable === true && photoUrl ? (
        <a
          className="mt-4 inline-flex items-center gap-2 rounded-sm border border-current px-4 py-2 text-sm transition-colors hover:bg-foreground hover:text-background"
          download
          href={photoUrl}
        >
          ↓ Download
        </a>
      ) : null}
    </section>
  )
}
