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
  if (pageSlug === 'about') {
    console.log('[About bio debug] Top bio renderer would be MediumImpactHero')
  }

  const heroMedia = media && typeof media === 'object' ? media : null

  const hasLinks = Array.isArray(links) && links.length > 0

  return (
    <div className="container">
      <div className={cn('relative isolate flex flex-col overflow-hidden', 'items-center')}>
        {/* Image */}
        {heroMedia && (
          <div className={cn('relative z-10 mb-6 w-full max-w-[420px]')}>
            <Media
              alt={
                (typeof heroMedia.alt === 'string' && heroMedia.alt.trim()) || 'Profile portrait'
              }
              className="w-full"
              imgClassName="h-auto w-full max-w-full"
              pictureClassName="block w-full"
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
              'relative z-10 m-0 inline-flex max-w-full list-none flex-row flex-wrap items-center justify-start gap-3.5 self-start p-0',
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
          <div className="relative z-10 w-full max-w-[52rem]">
            <RichText className={heroBioRichTextClassName} data={richText} enableGutter={false} />
          </div>
        )}
      </div>
    </div>
  )
}
