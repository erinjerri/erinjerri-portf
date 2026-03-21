import React from 'react'

import type { Page } from '@/payload-types'

import { HeaderThemeSetter } from '@/heros/HeaderThemeSetter'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const BackgroundCoverHero: React.FC<Page['hero']> = ({
  backgroundMedia,
  links,
  richText,
}) => {
  const backgroundImage = backgroundMedia && typeof backgroundMedia === 'object' ? backgroundMedia : null

  return (
    <div
      className="relative -mt-[6.75rem] md:-mt-[10.4rem] min-h-[58vh] w-full overflow-hidden text-white"
      data-theme="dark"
    >
      <HeaderThemeSetter theme="dark" />

      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-[#000815] via-[#0c1633] to-[#020712]"
        aria-hidden
      />

      {backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <Media
            fill
            className="absolute inset-0 h-full w-full"
            imgClassName="object-cover object-center"
            pictureClassName="relative block h-full w-full"
            priority
            resource={backgroundImage}
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-[58vh] max-w-[1200px] items-end px-4 py-16 md:py-20 xl:px-8">
        <div className="max-w-[44rem]">
          {richText && (
            <RichText
              className="mb-6 [&_.prose]:text-white [&_.prose_*]:text-white"
              data={richText}
              enableGutter={false}
            />
          )}
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
