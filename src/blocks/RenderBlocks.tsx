import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { DocumentBlockComponent } from '@/blocks/DocumentBlock/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { ToplineHeaderBlock } from '@/blocks/ToplineHeader/Component'
import { VideoBackgroundTransitionBlock } from '@/blocks/VideoBackgroundTransition/Component'
import { WatchBlockComponent } from '@/blocks/WatchBlock/Component'

const blockComponents = {
  archive: ArchiveBlock,
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
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className={index === 0 ? 'mb-16' : 'my-16'} key={index}>
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
