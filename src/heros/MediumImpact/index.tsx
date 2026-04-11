import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { heroBioRichTextClassName } from '@/heros/heroBioRichTextClassName'

export const MediumImpactHero: React.FC<Page['hero'] & { pageSlug?: string }> = ({
  links,
  media,
  pageSlug,
  richText,
}) => {
  const heroMedia = media && typeof media === 'object' ? media : null

  const hasLinks = Array.isArray(links) && links.length > 0

  const isTimebite = pageSlug === 'timebite' || pageSlug === 'timebite-download'

  return (
    <div className="container">
      <div className={cn('flex flex-col', isTimebite ? 'items-start' : 'items-center')}>
        {/* Image */}
        {heroMedia && (
          <div className={cn('mb-6 w-full max-w-[420px]', isTimebite && 'bg-transparent')}>
            <Media
              alt={
                (typeof heroMedia.alt === 'string' && heroMedia.alt.trim()) ||
                'Erin Jerri — about and profile, AI and spatial computing'
              }
              className="w-full"
              imagePlaceholder={isTimebite ? 'empty' : undefined}
              imgClassName="h-auto w-full max-w-full"
              pictureClassName={cn('block w-full', isTimebite && 'bg-transparent')}
              priority
              quality={70}
              resource={heroMedia}
              size="(max-width: 768px) min(92vw, 420px), (max-width: 1024px) 360px, 420px"
            />
            {heroMedia?.caption && (
              <div className="mt-3">
                <RichText data={heroMedia.caption} enableGutter={false} />
              </div>
            )}
          </div>
        )}
        {/* Links (Subscribe button) directly below image */}
        {hasLinks && (
          <ul
            className={cn(
              'm-0 inline-flex max-w-full list-none flex-row flex-wrap items-center justify-start gap-3.5 self-start p-0',
              heroMedia ? 'mt-4 mb-6' : 'mb-6',
            )}
          >
            {links.map(({ link }, i) => (
              <li className="shrink-0" key={i}>
                <CMSLink {...link} />
              </li>
            ))}
          </ul>
        )}
        {/* Rich text below image + links */}
        {richText && (
          <div className="w-full max-w-[52rem]">
            <RichText className={heroBioRichTextClassName} data={richText} enableGutter={false} />
          </div>
        )}
      </div>
    </div>
  )
}
