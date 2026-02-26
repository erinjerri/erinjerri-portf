import React from 'react'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import type { Media as MediaDoc } from '@/payload-types'

type Props = {
  content?: unknown
  height?: 'small' | 'medium' | 'large' | 'hero' | null
  links?: Array<{ link?: { label?: string | null; url?: string | null; appearance?: string } }> | null
  media?: number | string | MediaDoc | null
  overlayOpacity?: number | null
}

const heightClasses: Record<'small' | 'medium' | 'large' | 'hero', string> = {
  small: 'h-32 md:h-40',
  medium: 'h-48 md:h-64',
  large: 'h-64 md:h-96',
  hero: 'min-h-[40vh] md:min-h-[50vh]',
}

export const VideoBackgroundTransitionBlock: React.FC<Props> = ({
  content,
  height = 'medium',
  links,
  media,
  overlayOpacity = 80,
}) => {
  if (!media || typeof media !== 'object') return null

  const safeHeight = (height ?? 'medium') as keyof typeof heightClasses
  const heightClass = heightClasses[safeHeight] ?? heightClasses.medium
  const opacity = Math.max(0, Math.min(100, overlayOpacity ?? 80)) / 100
  const isVideo = media.mimeType?.includes('video')
  const hasOverlay = Boolean(content) || (Array.isArray(links) && links.length > 0)

  return (
    <div
      className={cn(
        'relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden',
        heightClass,
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
      {hasOverlay && (
        <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center px-6 py-8 text-center">
          <div className="max-w-3xl text-white [&_.prose]:text-white [&_.prose_*]:text-white [&_a]:text-white">
            {Boolean(content) && <RichText data={content as any} enableGutter={false} />}
          </div>
          {Array.isArray(links) && links.length > 0 && (
            <ul className="mt-6 flex flex-wrap justify-center gap-4">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...(link as any)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
