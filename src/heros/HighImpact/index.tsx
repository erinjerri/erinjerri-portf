import React from 'react'

import type { Page } from '@/payload-types'

import { HeaderThemeSetter } from '@/heros/HeaderThemeSetter'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

type HeroProps = Page['hero'] & { backgroundMedia?: Page['hero']['media'] }

export const HighImpactHero: React.FC<HeroProps> = ({
  links,
  media,
  richText,
  backgroundMedia,
}) => {
  const hasBackground =
    backgroundMedia && typeof backgroundMedia === 'object'
  const hasPortrait = media && typeof media === 'object'
  const backgroundImage = hasBackground ? backgroundMedia : hasPortrait ? media : null

  if (process.env.NODE_ENV === 'development' && hasBackground && !hasPortrait) {
    console.warn(
      '[HighImpactHero] Portrait not showing: hero.media is',
      media === undefined ? 'undefined' : typeof media === 'string' ? `ID "${media}" (not populated)` : typeof media,
    )
  }

  return (
    <div
      className="relative -mt-[6.75rem] md:-mt-[10.4rem] min-h-[65vh] w-full overflow-hidden text-foreground"
      data-theme="dark"
    >
      <HeaderThemeSetter theme="dark" />

      {/* Background: gradient fallback, background image, or media (when no separate background) */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-[#000815] via-[#0c1633] to-[#020712]"
        aria-hidden
      />
      {backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <Media
            fill
            className="absolute inset-0 h-full w-full"
            imgClassName="object-cover object-[50%_22%] md:object-center"
            pictureClassName="relative block h-full w-full"
            priority
            resource={backgroundImage}
          />
        </div>
      )}

      {/* Content grid: text left, portrait right on xl+; portrait on top centered on mobile/tablet */}
      <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-8 px-4 py-16 xl:grid-cols-2 xl:gap-12 xl:px-8">
        {/* Text block */}
        <div className="order-2 flex flex-col items-center text-center xl:order-1 xl:items-start xl:text-left">
          <div className="max-w-[36.5rem]">
            {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
            {Array.isArray(links) && links.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-4 xl:justify-start">
                {links.map(({ link }, i) => (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Portrait: show whenever we have media; background uses backgroundMedia when set, else media */}
        {hasPortrait && (
          <div className="order-1 flex min-h-[260px] justify-center xl:order-2 xl:min-h-0 xl:justify-end">
            <div className="w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[420px] xl:max-w-[520px]">
              <Media
                imgClassName="h-auto w-full object-contain object-top drop-shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
                pictureClassName="relative block w-full"
                priority
                resource={media}
                size="(max-width: 640px) 78vw, (max-width: 1280px) 42vw, 520px"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
