import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { heroBioRichTextClassName } from '@/heros/heroBioRichTextClassName'

export const MediumImpactHero: React.FC<Page['hero']> = ({
  links,
  media,
  richText,
}) => {
  const heroMedia = media && typeof media === 'object' ? media : null

  const hasLinks = Array.isArray(links) && links.length > 0

  return (
    <div className="container">
      <div className="flex flex-col items-center">
        {/* Image */}
        {heroMedia && (
          <div className="mb-6 w-full max-w-[420px]">
            <Media
              alt={
                (typeof heroMedia.alt === 'string' && heroMedia.alt.trim()) ||
                'Erin Jerri — about and profile, AI and spatial computing'
              }
              className="w-full"
              imgClassName="object-contain"
              priority
              resource={heroMedia}
              size="(max-width: 640px) 100vw, (max-width: 1024px) 360px, (max-width: 1280px) 420px, 520px"
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
