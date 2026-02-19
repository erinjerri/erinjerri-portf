import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'
import type { Media } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { Media as MediaComponent } from '@/components/Media'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props
  type ColumnWithFlexibleContent = NonNullable<ContentBlockProps['columns']>[number] & {
    contentType?: 'media' | 'text' | null
    media?: Media | number | string | null
  }

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="container my-16">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const typedCol = col as ColumnWithFlexibleContent
            const { contentType, enableLink, link, media, richText, size } = typedCol
            const shouldRenderText = !contentType || contentType === 'text'
            const shouldRenderMedia = contentType === 'media' && Boolean(media)

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
              >
                {shouldRenderText && richText && <RichText data={richText} enableGutter={false} />}
                {shouldRenderMedia && <MediaComponent resource={media} />}

                {enableLink && <CMSLink {...link} />}
              </div>
            )
          })}
      </div>
    </div>
  )
}
