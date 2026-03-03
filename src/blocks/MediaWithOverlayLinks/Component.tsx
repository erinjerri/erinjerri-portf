import React from 'react'

import { Media as MediaComponent } from '@/components/Media'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'

import type { Media as MediaDoc } from '@/payload-types'

type MediaBlockShape = {
  blockType: 'mediaBlock'
  mediaType?: 'image' | 'video' | 'audio'
  image?: number | string | MediaDoc | null
  media?: number | string | MediaDoc | null
  overlayOpacity?: number | null
  overlayRichText?: unknown
}

type ContentBlockShape = {
  blockType: 'content'
  columns?: Array<{
    enableLink?: boolean
    link?: { label?: string | null; url?: string | null; appearance?: string | null }
  }> | null
}

type CtaBlockShape = {
  blockType: 'cta'
  links?: Array<{ link?: { label?: string | null; url?: string | null; appearance?: string | null } }> | null
}

function extractLinksFromBlock(
  block: ContentBlockShape | CtaBlockShape | null,
): Array<{ link?: { label?: string | null; url?: string | null; appearance?: string | null } }> {
  if (!block) return []
  if (block.blockType === 'cta') {
    return (block as CtaBlockShape).links || []
  }
  if (block.blockType === 'content') {
    const cols = (block as ContentBlockShape).columns || []
    return cols
      .filter((c) => c?.enableLink && c?.link)
      .map((c) => ({ link: c!.link }))
  }
  return []
}

type Props = {
  mediaBlock: MediaBlockShape
  linksBlock: ContentBlockShape | CtaBlockShape
}

export const MediaWithOverlayLinksBlock: React.FC<Props> = ({ mediaBlock, linksBlock }) => {
  const selectedMedia =
    mediaBlock.mediaType === 'image'
      ? mediaBlock.image || mediaBlock.media
      : mediaBlock.media || mediaBlock.image

  const links = extractLinksFromBlock(linksBlock)

  if (!selectedMedia || typeof selectedMedia !== 'object' || links.length === 0) return null

  const opacity = Math.max(0, Math.min(100, mediaBlock.overlayOpacity ?? 60)) / 100
  const overlayRichText = mediaBlock.overlayRichText
  const hasOverlayRichText =
    overlayRichText &&
    typeof overlayRichText === 'object' &&
    Array.isArray((overlayRichText as any)?.root?.children) &&
    (overlayRichText as any).root.children.length > 0

  return (
    <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden min-h-[40vh] md:min-h-[50vh]">
      <div className="absolute inset-0">
        <MediaComponent
          fill
          imgClassName="h-full w-full object-cover"
          pictureClassName="absolute inset-0"
          priority
          resource={selectedMedia}
        />
      </div>
      <div className="absolute inset-0 bg-black" style={{ opacity }} />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="max-w-[36.5rem] md:text-center">
          {hasOverlayRichText ? (
            <div className="mb-6 text-2xl md:text-3xl font-semibold text-white [&_.prose]:text-white [&_.prose_*]:text-white [&_.prose_a]:text-white">
              <RichText data={overlayRichText as any} enableGutter={false} />
            </div>
          ) : null}
          <ul className="flex flex-wrap md:justify-center gap-4 text-white [&_.prose]:text-white [&_.prose_*]:text-white [&_a]:text-white">
            {links.map(({ link }, i) => (
              <li key={i}>
                <CMSLink {...(link as any)} appearance={link?.appearance || 'light'} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
