import React from 'react'

import { Media } from '@/components/Media'
import type { Media as MediaDoc } from '@/payload-types'
import { cn } from '@/utilities/ui'

type Props = {
  height?: 'small' | 'medium' | 'large' | null
  media?: number | string | MediaDoc | null
  title: string
}

const heightClasses: Record<'small' | 'medium' | 'large', string> = {
  small: 'h-24 md:h-28',
  medium: 'h-32 md:h-40',
  large: 'h-40 md:h-52',
}

export const ToplineHeaderBlock: React.FC<Props> = ({ height = 'medium', media, title }) => {
  if (!media || typeof media !== 'object') return null
  const safeHeight = height ?? 'medium'
  const isVideo = media.mimeType?.includes('video')

  return (
    <div
      className={cn(
        'relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden',
        heightClasses[safeHeight],
      )}
    >
      <div className="absolute inset-0">
        <Media
          fill={!isVideo}
          imgClassName="h-full w-full object-cover"
          pictureClassName="absolute inset-0"
          videoClassName="h-full w-full object-cover"
          priority
          resource={media}
        />
      </div>
      <div className="absolute inset-0 bg-background/70" />
      <div className="relative z-10 flex h-full items-center px-6 md:px-10">
        <h2 className="text-5xl font-extrabold tracking-tight text-foreground md:text-8xl">{title}</h2>
      </div>
    </div>
  )
}
