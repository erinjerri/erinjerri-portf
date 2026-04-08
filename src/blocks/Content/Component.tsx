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
    icon?: Media | number | string | null
  }

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  /** Matches Tailwind container (`80rem` max at xl) so next/image picks enough pixels for full-width column media. */
  const mediaSizesForColumn = (columnSize: string | null | undefined) => {
    switch (columnSize ?? 'full') {
      case 'half':
        return '(max-width: 1024px) 100vw, min(50vw, 40rem)'
      case 'oneThird':
        return '(max-width: 1024px) 100vw, min(33vw, 26rem)'
      case 'twoThirds':
        return '(max-width: 1024px) 100vw, min(66vw, 52rem)'
      case 'full':
      default:
        return '(max-width: 1024px) 100vw, min(100vw, 80rem)'
    }
  }

  /** Without `fill`, next/image uses Payload width/height — wrong metadata makes covers postage-stamp sized. */
  const renderColumnMedia = (media: ColumnWithFlexibleContent['media'], columnSize: string | null | undefined) => {
    if (!media || typeof media !== 'object') return null
    const m = media as Media
    const alt = (typeof m.alt === 'string' && m.alt.trim()) || 'Image'

    return (
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-black/10">
        <MediaComponent
          alt={alt}
          className="absolute inset-0 h-full w-full"
          fill
          imgClassName="object-contain object-center"
          pictureClassName="relative block h-full w-full"
          quality={85}
          resource={m}
          size={mediaSizesForColumn(columnSize)}
        />
      </div>
    )
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
              const { columnStyle, contentType, enableLink, icon, link, media, richText, size, whiteStyleMode } =
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
                        {shouldRenderMedia && renderColumnMedia(media, size)}
                        {enableLink && (
                          <CMSLink
                            {...link}
                            appearance={link?.appearance || 'default'}
                            className="mt-6 inline-flex"
                          />
                        )}
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
                      {shouldRenderText && richText && (
                        <div className="flex gap-4 items-center">
                          {icon && typeof icon === 'object' && icon !== null && (
                            <div className="shrink-0 flex items-center [&_img]:w-8 [&_img]:h-8 [&_img]:object-contain [&_img]:opacity-90">
                              <MediaComponent resource={icon} size="56px" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <RichText data={richText} enableGutter={false} />
                          </div>
                        </div>
                      )}
                      {shouldRenderMedia && renderColumnMedia(media, size)}

                      {enableLink && (
                        <CMSLink
                          {...link}
                          appearance={link?.appearance || 'default'}
                          className="mt-6 inline-flex"
                        />
                      )}
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
