import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="container">
      <div className="flex flex-col md:flex-row md:items-start md:gap-8 lg:gap-10">
        {/* Left: media (book cover) */}
        {media && typeof media === 'object' && (
          <div className="flex-shrink-0 mb-6 md:mb-0 md:w-1/3 lg:w-2/5">
            <Media
              className="w-full max-w-[280px] md:max-w-none"
              imgClassName="object-contain"
              priority
              resource={media}
            />
            {media?.caption && (
              <div className="mt-3">
                <RichText data={media.caption} enableGutter={false} />
              </div>
            )}
          </div>
        )}
        {/* Right: text + links */}
        <div className="flex-1 min-w-0">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap gap-4">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
