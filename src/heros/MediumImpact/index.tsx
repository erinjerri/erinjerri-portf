import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

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
          <ul className={cn('flex flex-wrap justify-center gap-4', heroMedia ? 'mt-4 mb-6' : 'mb-6')}>
            {links!.map(({ link }, i) => (
              <li key={i}>
                <CMSLink {...link} />
              </li>
            ))}
          </ul>
        )}
        {/* Rich text below image + links */}
        {richText && (
          <div className="w-full max-w-[52rem]">
            <RichText data={richText} enableGutter={false} />
          </div>
        )}
      </div>
    </div>
  )
}
