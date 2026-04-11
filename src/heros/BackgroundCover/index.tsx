import React from 'react'

import type { Page } from '@/payload-types'

import { heroBioRichTextClassName } from '@/heros/heroBioRichTextClassName'
import { cn } from '@/utilities/ui'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

const heroCoverImgClassName = 'object-cover object-[40%_20%]'

export const BackgroundCoverHero: React.FC<Page['hero']> = ({
  backgroundMedia,
  links,
  richText,
}) => {
  const backgroundImage = backgroundMedia && typeof backgroundMedia === 'object' ? backgroundMedia : null

  return (
    <div
      className="relative -mt-[6.75rem] md:-mt-[10.4rem] min-h-[65vh] md:min-h-[72vh] w-full overflow-hidden text-white"
      data-theme="dark"
    >
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-[#000815] via-[#0c1633] to-[#020712]"
        aria-hidden
      />

      {backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <Media
            alt={
              (typeof backgroundImage.alt === 'string' && backgroundImage.alt.trim()) ||
              'Full-width hero background — Erin Jerri, AI and spatial computing'
            }
            fill
            className="absolute inset-0 h-full w-full"
            imgClassName={heroCoverImgClassName}
            pictureClassName="relative block h-full w-full"
            priority
            resource={backgroundImage}
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
      )}

      {(richText || (Array.isArray(links) && links.length > 0)) && (
        <div className="pointer-events-none absolute bottom-6 left-6 z-10 max-w-[400px] text-left md:bottom-8 md:left-8">
          <div className="pointer-events-auto p-6 md:p-8">
            {richText && (
              <RichText
                className={cn(
                  'mb-6',
                  heroBioRichTextClassName,
                  '[&_.prose]:text-white [&_.prose_*]:text-white',
                )}
                data={richText}
                enableGutter={false}
              />
            )}
            {Array.isArray(links) && links.length > 0 && (
              <ul className="m-0 inline-flex max-w-full list-none flex-row flex-wrap items-center justify-start gap-3.5 p-0">
                {links.map(({ link }, i) => (
                  <li className="shrink-0" key={i}>
                    <CMSLink {...link} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
