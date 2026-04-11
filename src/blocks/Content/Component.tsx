import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'
import type { Media } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { Media as MediaComponent } from '@/components/Media'
import { richTextHasContent } from '@/utilities/richTextHasContent'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns, contrastStyle } = props
  const isWhiteContrast = contrastStyle === 'whiteOnBlackText'
  const glassColumnText =
    '[&_.payload-richtext]:!text-foreground [&_.payload-richtext_*]:!text-foreground/90 [&_.prose]:!text-foreground [&_.prose_*]:!text-foreground/90 [&_.payload-richtext_a]:!text-primary'
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

  /** Natural aspect — no fixed-ratio box or tinted fill behind the image (avoids letterboxing). */
  const renderColumnMedia = (media: ColumnWithFlexibleContent['media'], columnSize: string | null | undefined) => {
    if (!media || typeof media !== 'object') return null
    const m = media as Media
    const alt = (typeof m.alt === 'string' && m.alt.trim()) || 'Image'

    return (
      <div className="w-full overflow-hidden rounded-md">
        <MediaComponent
          alt={alt}
          className="block w-full max-w-full"
          imgClassName="h-auto w-full max-w-full rounded-md"
          pictureClassName="block w-full"
          quality={100}
          resource={m}
          size={mediaSizesForColumn(columnSize)}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        /* Tight top on contrast band avoids a “dead” strip of body background between hero and first section. */
        isWhiteContrast ? 'mb-16 mt-0 md:mb-20' : 'my-16',
        {
          /* No border-y: twin horizontal rules read as an accidental “strip” on full-bleed bands. */
          'relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-gradient-to-b from-background via-background to-slate-950 py-10 text-foreground':
            isWhiteContrast,
        },
      )}
    >
      <div
        className={cn({
          container: true,
          'px-8 [&_a]:text-primary': isWhiteContrast,
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
              const hasRich = Boolean(shouldRenderText && richText && richTextHasContent(richText))
              const hasMed = Boolean(shouldRenderMedia && media && typeof media === 'object')
              const hasLink =
                Boolean(enableLink && link) &&
                Boolean(
                  (typeof link?.url === 'string' && link.url.trim()) ||
                    (typeof link?.label === 'string' && link.label.trim()),
                )
              const isFullBleedWhite =
                columnStyle === 'whiteBgBlackText' &&
                whiteStyleMode === 'fullBleed' &&
                (size ?? 'oneThird') === 'full'

              if (!hasRich && !hasMed && !hasLink) {
                return (
                  <div
                    className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                      'md:col-span-2': size !== 'full',
                    })}
                    key={index}
                  />
                )
              }

              return (
                <div
                  className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                    'md:col-span-2': size !== 'full',
                  })}
                  key={index}
                >
                  {isFullBleedWhite ? (
                    <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-white/5 py-6 backdrop-blur-sm">
                      <div className={cn('container px-8 text-foreground', glassColumnText, '[&_a]:text-primary')}>
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
                        'rounded-none border border-white/10 bg-white/5 px-6 py-6 text-foreground shadow-2xl backdrop-blur-sm [&_.prose]:text-foreground [&_.prose_*]:text-foreground/90 [&_a]:text-primary':
                          columnStyle === 'whiteBgBlackText',
                        'rounded-none border border-white/10 bg-white/5 px-6 py-6 text-foreground shadow-2xl backdrop-blur-sm':
                          isWhiteContrast && columnStyle !== 'blackBgWhiteText',
                      })}
                    >
                      {shouldRenderText && richText && (
                        <div
                          className={cn(
                            'flex flex-row-reverse items-start gap-4',
                            isWhiteContrast && glassColumnText,
                          )}
                        >
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
