import React from 'react'

import type { Page } from '@/payload-types'

import { HeaderThemeSetter } from '@/heros/HeaderThemeSetter'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div
      className="relative -mt-[6.75rem] md:-mt-[10.4rem] flex items-center justify-center text-foreground w-full min-h-[60vh] overflow-hidden"
      data-theme="dark"
    >
      <HeaderThemeSetter theme="dark" />
      {media && typeof media === 'object' && (
        <div className="absolute inset-0">
          <Media fill priority imgClassName="-z-10 object-cover" pictureClassName="h-full w-full" resource={media} />
        </div>
      )}
      <div className="container mb-4 z-10 relative flex items-center justify-center">
        <div className="max-w-[36.5rem] md:text-center">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex md:justify-center gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
