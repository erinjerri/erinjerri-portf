import React from 'react'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import type { Media as MediaDoc } from '@/payload-types'

type Props = {
  content?: unknown
  height?: 'small' | 'medium' | 'large' | null
  media?: number | string | MediaDoc | null
  overlayOpacity?: number | null
}

const heightClasses: Record<'small' | 'medium' | 'large', string> = {
  small: 'h-32 md:h-40',
  medium: 'h-48 md:h-64',
  large: 'h-64 md:h-96',
}

export const VideoBackgroundTransitionBlock: React.FC<Props> = ({
  content,
  height = 'medium',
  media,
  overlayOpacity = 80,
}) => {
  if (!media || typeof media !== 'object') return null

  const safeHeight = height ?? 'medium'
  const opacity = Math.max(0, Math.min(100, overlayOpacity ?? 80)) / 100
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
          priority
          resource={media}
          videoClassName="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-black" style={{ opacity }} />
      {Boolean(content) && (
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <div className="max-w-3xl text-white [&_.prose]:text-white [&_.prose_*]:text-white [&_a]:text-white">
            <RichText data={content as any} enableGutter={false} />
          </div>
        </div>
      )}
    </div>
  )
}
