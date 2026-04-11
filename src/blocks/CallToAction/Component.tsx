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
          'flex flex-col gap-4 rounded-none border p-6 shadow-2xl md:p-8',
          {
            'bg-card border-border': contrastStyle === 'default',
            'bg-black border-white/20 text-white [&_.prose]:text-white [&_.prose_*]:text-white [&_.payload-richtext_a]:text-white':
              isDark,
            'border border-white/20 bg-white/5 text-foreground backdrop-blur-sm [&_.prose]:text-foreground [&_.prose_*]:text-foreground/90 [&_.payload-richtext_a]:text-primary':
              isLight,
          },
        )}
      >
        <div className="max-w-[48rem]">
          {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        </div>
        <div className="flex flex-col gap-4 items-start">
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} size="lg" {...link} appearance={link?.appearance || 'default'} />
          })}
        </div>
      </div>
    </div>
  )
}
