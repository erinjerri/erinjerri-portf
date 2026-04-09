import React, { Fragment } from 'react'

import type {
  CallToActionBlock as CtaBlockType,
  ContentBlock as ContentBlockType,
  MediaBlock as MediaBlockType,
  Page,
} from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { AffiliateProductsBlock } from '@/blocks/AffiliateProducts/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { DocumentBlockComponent } from '@/blocks/DocumentBlock/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaWithOverlayLinksBlock } from '@/blocks/MediaWithOverlayLinks/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { ToplineHeaderBlock } from '@/blocks/ToplineHeader/Component'
import { VideoBackgroundTransitionBlock } from '@/blocks/VideoBackgroundTransition/Component'
import { WatchBlockComponent } from '@/blocks/WatchBlock/Component'
import { StatStripBlock } from '@/blocks/StatStrip/Component'
import { TagPillsBlock } from '@/blocks/TagPills/Component'
import { BrandLogosBlock } from '@/blocks/BrandLogos/Component'
import { BookCoverRowBlock } from '@/blocks/BookCoverRow/Component'
import { HeroCredentialStripBlock } from '@/blocks/HeroCredentialStrip/Component'
import { SignatureTalksBlock } from '@/blocks/SignatureTalks/Component'
import { BookAcclaimStripBlock } from '@/blocks/BookAcclaimStrip/Component'

const blockComponents = {
  archive: ArchiveBlock,
  affiliateProductsBlock: AffiliateProductsBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  documentBlock: DocumentBlockComponent,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  toplineHeader: ToplineHeaderBlock,
  videoBackgroundTransition: VideoBackgroundTransitionBlock,
  watchBlock: WatchBlockComponent,
  statStrip: StatStripBlock,
  tagPills: TagPillsBlock,
  brandLogos: BrandLogosBlock,
  bookCoverRow: BookCoverRowBlock,
  heroCredentialStrip: HeroCredentialStripBlock,
  signatureTalks: SignatureTalksBlock,
  bookAcclaimStrip: BookAcclaimStripBlock,
}

/** Layout block - element of page layout array */
type LayoutBlock = Page['layout'] extends (infer B)[] ? B : Page['layout'] extends readonly (infer B)[] ? B : Record<string, unknown> & { blockType?: string }

/** Narrow layout block to MediaBlock */
function asMediaBlock(b: LayoutBlock | null | undefined): MediaBlockType | null {
  return b && (b as { blockType?: string }).blockType === 'mediaBlock'
    ? (b as MediaBlockType)
    : null
}

function getMediaBlockKind(b: LayoutBlock | null | undefined): 'audio' | 'image' | 'video' | null {
  const mediaBlock = asMediaBlock(b)

  if (!mediaBlock) return null
  if (mediaBlock.mediaType) return mediaBlock.mediaType
  if (mediaBlock.image) return 'image'
  if (mediaBlock.video) return 'video'
  if (mediaBlock.audio) return 'audio'

  const legacyMedia = mediaBlock.media
  if (legacyMedia && typeof legacyMedia === 'object' && 'mimeType' in legacyMedia) {
    const mimeType = (legacyMedia as { mimeType?: string | null }).mimeType
    if (mimeType?.startsWith('image/')) return 'image'
    if (mimeType?.startsWith('video/')) return 'video'
    if (mimeType?.startsWith('audio/')) return 'audio'
  }

  // Legacy pages often used `media` as an image-only field before `mediaType` existed.
  if (legacyMedia) return 'image'

  return null
}

function hasToplineMedia(b: LayoutBlock | null | undefined): boolean {
  if (!b || (b as { blockType?: string }).blockType !== 'toplineHeader') return false
  return Boolean((b as { media?: unknown }).media)
}

function hasVideoBackgroundMedia(b: LayoutBlock | null | undefined): boolean {
  if (!b || (b as { blockType?: string }).blockType !== 'videoBackgroundTransition') return false
  return Boolean((b as { media?: unknown }).media)
}

function isLeadingHeroLikeBlock(b: LayoutBlock | null | undefined): boolean {
  if (!b) return false

  if (hasToplineMedia(b) || hasVideoBackgroundMedia(b)) {
    return true
  }

  const mediaBlock = asMediaBlock(b)
  if (!mediaBlock) return false

  const mediaKind = getMediaBlockKind(b)
  if (mediaKind !== 'image' && mediaKind !== 'video') return false

  const displayStyle = mediaBlock.displayStyle
  return (
    displayStyle === 'default' ||
    displayStyle === 'fullWidthTransition' ||
    displayStyle === 'heroOverlay' ||
    !displayStyle
  )
}

/** Check if content block has columns with links */
function contentHasLinks(b: LayoutBlock | null | undefined): boolean {
  if (!b) return false
  const c = b as ContentBlockType
  return Array.isArray(c.columns) && c.columns.some((col) => col?.enableLink && col?.link)
}

/** Check if CTA block has links */
function ctaHasLinks(b: LayoutBlock | null | undefined): boolean {
  if (!b) return false
  const c = b as CtaBlockType
  return Array.isArray(c.links) && c.links.length > 0
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
  /** When set, skips the first mediaBlock (image, default display) to avoid duplicating the hero background on pages like /watch, /read */
  pageSlug?: string
}> = (props) => {
  const { blocks, pageSlug } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  const trimLeadingHeroLikeBlocks = pageSlug === 'watch' || pageSlug === 'read'
  let leadingTrimCount = 0

  if (trimLeadingHeroLikeBlocks && Array.isArray(blocks)) {
    while (leadingTrimCount < blocks.length && isLeadingHeroLikeBlock(blocks[leadingTrimCount])) {
      leadingTrimCount += 1

      const maybeLinksBlock = blocks[leadingTrimCount]
      const mergedLinksBlock =
        maybeLinksBlock &&
        ((maybeLinksBlock.blockType === 'content' && contentHasLinks(maybeLinksBlock)) ||
          (maybeLinksBlock.blockType === 'cta' && ctaHasLinks(maybeLinksBlock)))

      if (mergedLinksBlock) {
        leadingTrimCount += 1
      }
    }
  }

  const blocksToRender = leadingTrimCount > 0 ? blocks.slice(leadingTrimCount) : blocks

  if (hasBlocks) {
    return (
      <Fragment>
        {blocksToRender.map((block, index) => {
          const { blockType } = block
          const nextBlock = blocksToRender[index + 1]

          // Merge mediaBlock (image) + content/cta with links into hero-style overlay
          const blockMedia = asMediaBlock(block)
          const isMediaBlockWithImage =
            blockMedia &&
            blockMedia.mediaType === 'image' &&
            (blockMedia.image || blockMedia.media)
          const nextHasLinks =
            nextBlock?.blockType === 'content' && contentHasLinks(nextBlock)
          const nextCtaHasLinks = nextBlock?.blockType === 'cta' && ctaHasLinks(nextBlock)
          const shouldMergeWithOverlay =
            isMediaBlockWithImage && (nextHasLinks || nextCtaHasLinks)

          if (shouldMergeWithOverlay && nextBlock) {
            return (
              <div
                className={
                  index === 0 ? 'mb-20 md:mb-24 lg:mb-28' : 'my-20 md:my-24 lg:my-28'
                }
                key={index}
              >
                <MediaWithOverlayLinksBlock
                  mediaBlock={block as MediaBlockType}
                  linksBlock={
                    nextBlock as React.ComponentProps<
                      typeof MediaWithOverlayLinksBlock
                    >['linksBlock']
                  }
                />
              </div>
            )
          }

          // Skip rendering the links block when we merged it with the previous media block
          if (index > 0 && (blockType === 'content' || blockType === 'cta')) {
            const prevBlock = blocksToRender[index - 1]
            const prevMedia = prevBlock ? asMediaBlock(prevBlock) : null
            const prevIsMediaBlockWithImage =
              prevMedia &&
              prevMedia.mediaType === 'image' &&
              (prevMedia.image || prevMedia.media)
            const thisHasLinks =
              (blockType === 'cta' && ctaHasLinks(block)) ||
              (blockType === 'content' && contentHasLinks(block))
            if (prevIsMediaBlockWithImage && thisHasLinks) {
              return null
            }
          }

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType as keyof typeof blockComponents]

            if (typeof Block === 'function') {
              const prevBlock = blocksToRender[index - 1]
              const isMedia =
                blockType === 'mediaBlock' || blockType === 'videoBackgroundTransition'
              const prevIsCta = prevBlock?.blockType === 'cta'
              const prevIsMedia =
                prevBlock &&
                (prevBlock.blockType === 'mediaBlock' ||
                  prevBlock.blockType === 'videoBackgroundTransition')
              const nextIsMedia =
                nextBlock &&
                (nextBlock.blockType === 'mediaBlock' ||
                  nextBlock.blockType === 'videoBackgroundTransition')
              const isCtaFollowedByMedia = blockType === 'cta' && nextIsMedia
              const isCtaFollowedByMediaBlock = blockType === 'cta' && prevIsMedia

              // CTA follows media (or merged overlay: media + links block)
              const prevIsLinksBlock =
                prevBlock &&
                (prevBlock.blockType === 'content' || prevBlock.blockType === 'cta') &&
                ((prevBlock.blockType === 'cta' && ctaHasLinks(prevBlock)) ||
                  (prevBlock.blockType === 'content' && contentHasLinks(prevBlock)))
              const prevPrev = index >= 2 ? blocksToRender[index - 2] : null
              const prevPrevIsMedia =
                prevPrev &&
                (prevPrev.blockType === 'mediaBlock' ||
                  prevPrev.blockType === 'videoBackgroundTransition')
              const isCtaAfterMergedOverlay =
                blockType === 'cta' && prevIsLinksBlock && prevPrevIsMedia

              const sectionY = 'my-20 md:my-24 lg:my-28'
              const sectionBottom = 'mb-20 md:mb-24 lg:mb-28'
              let marginClass: string
              if (index === 0) {
                marginClass = sectionBottom
              } else if (isCtaFollowedByMedia) {
                marginClass = 'mt-20 md:mt-24 mb-0 md:mb-0 lg:mb-0'
              } else if (prevIsCta && isMedia) {
                marginClass = 'mt-0 mb-20 md:mb-24 lg:mb-28'
              } else if (isCtaFollowedByMediaBlock || isCtaAfterMergedOverlay) {
                marginClass = 'mt-24 mb-20 md:mt-28 md:mb-24 lg:mb-28'
              } else {
                marginClass = sectionY
              }

              return (
                <div className={marginClass} key={index}>
                  {/* Block component expects its specific block type; block is a layout union */}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Block {...(block as any)} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
