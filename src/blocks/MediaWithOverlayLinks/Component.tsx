import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import React from 'react'

import { cn } from '@/utilities/ui'
import { Media as MediaComponent } from '@/components/Media'
import { RocketshipIcon } from '@/components/RocketshipIcon'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'

import type { Media as MediaDoc } from '@/payload-types'

type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
}

type MediaBlockShape = {
  blockType: 'mediaBlock'
  mediaType?: 'image' | 'video' | 'audio'
  image?: number | string | MediaDoc | null
  media?: number | string | MediaDoc | null
  overlayOpacity?: number | null
  overlayRichText?: unknown
  overlayVariant?: 'standard' | 'highImpact' | null
}

type LinkShape = {
  label?: string | null
  url?: string | null
  appearance?: string | null
}

type ContentBlockShape = {
  blockType: 'content'
  blockName?: string | null
  columns?: Array<{
    enableLink?: boolean
    link?: LinkShape
  }> | null
}

type CtaBlockShape = {
  blockType: 'cta'
  blockName?: string | null
  links?: Array<{ link?: LinkShape }> | null
}

function extractPlainText(nodes: LexicalNode[]): string {
  return nodes
    .map((n) => {
      if (n.type === 'text' && typeof n.text === 'string') return n.text
      if (Array.isArray(n.children)) return extractPlainText(n.children)
      return ''
    })
    .join('')
}

function getLexicalRootChildren(overlayRichText: unknown): LexicalNode[] | null {
  if (!overlayRichText || typeof overlayRichText !== 'object') return null
  const root = (overlayRichText as { root?: { children?: LexicalNode[] } }).root
  if (!root || !Array.isArray(root.children)) return null
  return root.children
}

function extractLinksFromBlock(
  block: ContentBlockShape | CtaBlockShape | null,
): Array<{ link?: LinkShape }> {
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
  const isHighImpact = mediaBlock.overlayVariant === 'highImpact'
  const rootChildren = getLexicalRootChildren(overlayRichText)
  const hasOverlayRichText = rootChildren !== null && rootChildren.length > 0

  const overlayText = hasOverlayRichText ? extractPlainText(rootChildren) : ''
  const blockName =
    (linksBlock as ContentBlockShape).blockName ?? (linksBlock as CtaBlockShape).blockName ?? ''
  const linkLabels = links.map((l) => l?.link?.label ?? '').join(' ')
  const isHireMeBlock =
    /hire/i.test(overlayText) || /hire/i.test(blockName) || /hire/i.test(linkLabels)

  return (
    <div
      className={cn(
        'relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden',
        isHighImpact ? 'min-h-[60vh] md:min-h-[70vh]' : 'min-h-[40vh] md:min-h-[50vh]',
      )}
    >
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
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6 py-8">
        <div className="flex items-center gap-6 md:gap-8 max-w-[48rem] w-full">
          {isHireMeBlock && (
            <RocketshipIcon
              className="text-white shrink-0"
              size={isHighImpact ? 40 : 32}
            />
          )}
          <div
            className={cn(
              'flex-1 min-w-0 text-white [&_.prose]:text-white [&_.prose_*]:text-white [&_a]:text-white',
              'sm:text-left md:text-center',
            )}
          >
            {hasOverlayRichText ? (
              <div
                className={cn(
                  'mb-6 font-semibold',
                  isHighImpact ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl',
                )}
              >
                <RichText data={overlayRichText as DefaultTypedEditorState} enableGutter={false} />
              </div>
            ) : null}
            <ul
              className={cn(
                'flex flex-wrap gap-4 sm:justify-start md:justify-center',
                isHighImpact
                  ? 'gap-6 [&_button]:text-lg [&_button]:md:text-xl [&_button]:px-6 [&_button]:py-3'
                  : '[&_button]:text-base [&_button]:md:text-lg',
              )}
            >
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink
                    {...link}
                    appearance={(link?.appearance as 'light' | 'default' | 'outline') || 'light'}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
