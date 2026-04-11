import React from 'react'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import type { Media as MediaDoc } from '@/payload-types'
import { richTextHasContent } from '@/utilities/richTextHasContent'

type Props = {
  content?: unknown
  height?: 'small' | 'medium' | 'large' | 'hero' | null
  links?: Array<{
    link?: {
      label?: string | null
      url?: string | null
      appearance?: string
      type?: string | null
      reference?: { value?: unknown } | null
    }
  }> | null
  media?: number | string | MediaDoc | null
  overlayOpacity?: number | null
}

function linkRowHasTarget(
  row: NonNullable<Props['links']>[number] | null | undefined,
): boolean {
  const link = row?.link
  if (!link || typeof link !== 'object') return false
  if (typeof link.url === 'string' && link.url.trim().length > 0) return true
  const refVal = link.reference?.value
  if (refVal && typeof refVal === 'object' && 'slug' in (refVal as object)) return true
  return false
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

  const hasRichOverlay = richTextHasContent(content)
  const hasLinkOverlay = Array.isArray(links) && links.some((row) => linkRowHasTarget(row))
  /* Decorative video-only strips read as a random band above following sections — require real overlay. */
  if (!hasRichOverlay && !hasLinkOverlay) return null

  const safeHeight = (height ?? 'medium') as keyof typeof heightClasses
  const heightClass = heightClasses[safeHeight] ?? heightClasses.medium
  const opacity = Math.max(0, Math.min(100, overlayOpacity ?? 80)) / 100
  const isVideo = media.mimeType?.includes('video')

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
      <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center px-6 py-8 text-center">
        {hasRichOverlay ? (
          <div className="max-w-2xl text-white [&_.prose]:text-base [&_.prose]:leading-relaxed [&_.prose]:text-white md:[&_.prose]:text-lg [&_.prose_*]:text-white [&_.prose_h1]:!text-[1.75rem] [&_.prose_h1]:!leading-tight md:[&_.prose_h1]:!text-[2rem] [&_.prose_h2]:!text-lg [&_.prose_h2]:md:!text-xl [&_a]:text-white">
            <RichText data={content as any} enableGutter={false} />
          </div>
        ) : null}
        {hasLinkOverlay ? (
          <ul className={cn('flex flex-wrap justify-center gap-4', hasRichOverlay && 'mt-6')}>
            {links!.map(({ link }, i) =>
              linkRowHasTarget({ link }) ? (
                <li key={i}>
                  <CMSLink {...(link as any)} />
                </li>
              ) : null,
            )}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
