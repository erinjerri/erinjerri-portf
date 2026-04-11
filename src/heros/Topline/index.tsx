import React from 'react'

import { Media } from '@/components/Media'
import type { Media as MediaDoc } from '@/payload-types'
import { cn } from '@/utilities/ui'

type Props = {
  media?: number | string | MediaDoc | null
  overlayTitle?: string | null
}

export const ToplineHero: React.FC<Props> = ({ media, overlayTitle }) => {
  if (!media || typeof media !== 'object') return null

  const isVideo = media.mimeType?.includes('video')
  const title = overlayTitle?.trim() || 'Title'

  return (
    <div className={cn('relative left-1/2 right-1/2 h-32 w-screen -translate-x-1/2 overflow-hidden md:h-44')}>
      <div className="absolute inset-0">
        <Media
          alt={
            (typeof media.alt === 'string' && media.alt.trim()) ||
            `${title} — Erin Jerri, AI and spatial computing`
          }
          fill={!isVideo}
          imgClassName="h-full w-full object-cover object-[40%_20%]"
          pictureClassName="absolute inset-0"
          priority
          resource={media}
          videoClassName="h-full w-full object-cover object-[40%_20%]"
        />
      </div>
      <div className="absolute inset-0 bg-background/70" />
      <div className="relative z-10 flex h-full items-center px-6 md:px-10">
        <h1 className="max-w-[90vw] truncate font-title text-base font-semibold leading-snug tracking-tight text-foreground md:text-lg">
          {title}
        </h1>
      </div>
    </div>
  )
}
