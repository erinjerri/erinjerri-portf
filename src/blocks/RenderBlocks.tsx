import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

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
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
  /** When set, skips the first mediaBlock (image, default display) to avoid duplicating the hero background on pages like /watch */
  pageSlug?: string
}> = (props) => {
  const { blocks, pageSlug } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  const isFirstBlockRedundantMedia =
    pageSlug === 'watch' &&
    blocks?.[0] &&
    (blocks[0] as { blockType?: string; mediaType?: string; displayStyle?: string }).blockType ===
      'mediaBlock' &&
    (blocks[0] as { mediaType?: string }).mediaType === 'image' &&
    ((blocks[0] as { displayStyle?: string }).displayStyle === 'default' ||
      !(blocks[0] as { displayStyle?: string }).displayStyle)

  const blocksToRender = isFirstBlockRedundantMedia ? blocks.slice(1) : blocks

  if (hasBlocks) {
    return (
      <Fragment>
        {blocksToRender.map((block, index) => {
          const { blockType } = block
          const nextBlock = blocksToRender[index + 1]

          // Merge mediaBlock (image) + content/cta with links into hero-style overlay
          const isMediaBlockWithImage =
            blockType === 'mediaBlock' &&
            (block as any).mediaType === 'image' &&
            ((block as any).image || (block as any).media)
          const nextHasLinks =
            nextBlock?.blockType === 'content' &&
            ((nextBlock as any).columns?.some((c: any) => c?.enableLink && c?.link) ?? false)
          const nextCtaHasLinks =
            nextBlock?.blockType === 'cta' &&
            Array.isArray((nextBlock as any).links) &&
            (nextBlock as any).links.length > 0
          const shouldMergeWithOverlay =
            isMediaBlockWithImage && (nextHasLinks || nextCtaHasLinks)

          if (shouldMergeWithOverlay && nextBlock) {
            return (
              <div
                className={
                  index === 0 ? 'mb-8' : 'my-8'
                }
                key={index}
              >
                <MediaWithOverlayLinksBlock
                  mediaBlock={block as any}
                  linksBlock={nextBlock as any}
                />
              </div>
            )
          }

          // Skip rendering the links block when we merged it with the previous media block
          if (index > 0 && (blockType === 'content' || blockType === 'cta')) {
            const prevBlock = blocksToRender[index - 1]
            const prevIsMediaBlockWithImage =
              prevBlock?.blockType === 'mediaBlock' &&
              (prevBlock as any).mediaType === 'image' &&
              ((prevBlock as any).image || (prevBlock as any).media)
            const thisHasLinks =
              (blockType === 'cta' &&
                Array.isArray((block as any).links) &&
                (block as any).links.length > 0) ||
              (blockType === 'content' &&
                (block as any).columns?.some((c: any) => c?.enableLink && c?.link))
            if (prevIsMediaBlockWithImage && thisHasLinks) {
              return null
            }
          }

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
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
                ((prevBlock.blockType === 'cta' &&
                  Array.isArray((prevBlock as any).links) &&
                  (prevBlock as any).links.length > 0) ||
                  (prevBlock.blockType === 'content' &&
                    (prevBlock as any).columns?.some((c: any) => c?.enableLink && c?.link)))
              const prevPrevIsMedia =
                index >= 2 &&
                blocksToRender[index - 2] &&
                ((blocksToRender[index - 2] as any).blockType === 'mediaBlock' ||
                  (blocksToRender[index - 2] as any).blockType === 'videoBackgroundTransition')
              const isCtaAfterMergedOverlay =
                blockType === 'cta' && prevIsLinksBlock && prevPrevIsMedia

              let marginClass: string
              if (index === 0) {
                marginClass = 'mb-8'
              } else if (isCtaFollowedByMedia) {
                marginClass = 'mt-8 mb-0'
              } else if (prevIsCta && isMedia) {
                marginClass = 'mt-0 mb-8'
              } else if (isCtaFollowedByMediaBlock || isCtaAfterMergedOverlay) {
                marginClass = 'mt-12 mb-8'
              } else {
                marginClass = 'my-8'
              }

              return (
                <div className={marginClass} key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
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
