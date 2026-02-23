import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'
import type { Media } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { Media as MediaComponent } from '@/components/Media'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns, contrastStyle } = props
  const isWhiteContrast = contrastStyle === 'whiteOnBlackText'
  type ColumnWithFlexibleContent = NonNullable<ContentBlockProps['columns']>[number] & {
    contentType?: 'media' | 'text' | null
    columnStyle?: 'default' | 'blackBgWhiteText' | 'whiteBgBlackText' | null
    whiteStyleMode?: 'boxed' | 'fullBleed' | null
    media?: Media | number | string | null
  }

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div
      className={cn('my-16', {
        'relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-white py-10 text-black':
          isWhiteContrast,
      })}
    >
      <div
        className={cn({
          container: true,
          'px-8 [&_a]:text-black': isWhiteContrast,
        })}
      >
        <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
          {columns &&
            columns.length > 0 &&
            columns.map((col, index) => {
              const typedCol = col as ColumnWithFlexibleContent
              const { columnStyle, contentType, enableLink, link, media, richText, size, whiteStyleMode } =
                typedCol
              const shouldRenderText = !contentType || contentType === 'text'
              const shouldRenderMedia = contentType === 'media' && Boolean(media)
              const isFullBleedWhite =
                columnStyle === 'whiteBgBlackText' &&
                whiteStyleMode === 'fullBleed' &&
                (size ?? 'oneThird') === 'full'

              return (
                <div
                  className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                    'md:col-span-2': size !== 'full',
                  })}
                  key={index}
                >
                  {isFullBleedWhite ? (
                    <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-white py-6">
                      <div className="container px-8 text-black [&_.prose]:text-black [&_.prose_*]:text-black [&_a]:text-black">
                        {shouldRenderText && richText && <RichText data={richText} enableGutter={false} />}
                        {shouldRenderMedia && <MediaComponent resource={media} />}
                        {enableLink && <CMSLink {...link} className="mt-6 inline-flex" />}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn('h-full', {
                        'bg-black px-6 py-6 text-white [&_a]:text-inherit':
                          columnStyle === 'blackBgWhiteText',
                        'bg-white px-6 py-6 text-black [&_.prose]:text-black [&_.prose_*]:text-black [&_a]:text-black':
                          columnStyle === 'whiteBgBlackText',
                      })}
                    >
                      {shouldRenderText && richText && <RichText data={richText} enableGutter={false} />}
                      {shouldRenderMedia && <MediaComponent resource={media} />}

                      {enableLink && <CMSLink {...link} className="mt-6 inline-flex" />}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
