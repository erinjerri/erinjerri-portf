import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

type CTAPropsWithStyle = CTABlockProps & {
  contrastStyle?: 'default' | 'blackBgWhiteText' | 'whiteBgBlackText' | null
}

export const CallToActionBlock: React.FC<CTABlockProps> = (props) => {
  const { links, richText, contrastStyle = 'default' } = props as CTAPropsWithStyle

  const isDark = contrastStyle === 'blackBgWhiteText'
  const isLight = contrastStyle === 'whiteBgBlackText'

  return (
    <div className="container">
      <div
        className={cn(
          'rounded border p-4 flex flex-col gap-8 md:flex-row md:justify-between md:items-center',
          {
            'bg-card border-border': contrastStyle === 'default',
            'bg-black border-white/20 text-white [&_.prose]:text-white [&_.prose_*]:text-white [&_a]:text-white':
              isDark,
            'bg-white border-black/15 text-black [&_.prose]:text-black [&_.prose_*]:text-black [&_a]:text-black':
              isLight,
          },
        )}
      >
        <div className="max-w-[48rem] flex items-center">
          {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        </div>
        <div className="flex flex-col gap-8">
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} size="lg" {...link} appearance={link?.appearance || 'default'} />
          })}
        </div>
      </div>
    </div>
  )
}
