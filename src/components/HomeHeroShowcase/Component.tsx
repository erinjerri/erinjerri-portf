import type { Media as MediaDoc, Page } from '@/payload-types'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'

type HeroLink = NonNullable<Page['hero']['links']>[number]

type HomeHeroShowcaseProps = {
  betaLinks: HeroLink[]
  resource: MediaDoc | string
}

const fallbackBetaLink: HeroLink = {
  link: {
    type: 'custom',
    appearance: 'default',
    label: 'Join the TimeBite beta',
    url: '/timebite-download',
  },
}

export const HomeHeroShowcase: React.FC<HomeHeroShowcaseProps> = ({ betaLinks, resource }) => {
  const links = betaLinks.length > 0 ? betaLinks : [fallbackBetaLink]
  const isMediaDocument = typeof resource === 'object'

  return (
    <section
      aria-label="TimeBite product preview"
      className="relative left-1/2 mt-16 w-screen -translate-x-1/2 border-y border-white/10 bg-[#0b1428] px-6 py-12 shadow-[0_-24px_80px_-48px_rgba(37,99,235,0.4)] sm:mt-20 sm:py-16 md:mt-24 md:py-20"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)] lg:gap-12">
        <div className="relative w-full overflow-hidden rounded-[1.35rem] border border-white/15 bg-[#111827] p-2 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.8)] sm:p-2.5">
          <div className="flex h-6 items-center gap-1.5 px-2 sm:h-7">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57] sm:h-2.5 sm:w-2.5" />
            <span className="h-2 w-2 rounded-full bg-[#febc2e] sm:h-2.5 sm:w-2.5" />
            <span className="h-2 w-2 rounded-full bg-[#28c840] sm:h-2.5 sm:w-2.5" />
            <span className="ml-2 text-[0.6rem] font-medium tracking-[0.08em] text-white/40 sm:text-[0.68rem]">
              TimeBite
            </span>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[0.85rem] border border-white/10 bg-[#090d18]">
            <Media
              alt={
                (isMediaDocument && typeof resource.alt === 'string' && resource.alt.trim()) ||
                'TimeBite macOS app screenshot'
              }
              fill
              imagePlaceholder="empty"
              imgClassName="object-contain object-center"
              pictureClassName="absolute inset-0 block h-full w-full"
              quality={80}
              {...(isMediaDocument ? { resource } : { src: resource })}
              size="(max-width: 768px) min(100vw, 52rem), (max-width: 1280px) 52vw, 832px"
            />
          </div>
        </div>
        <div className="max-w-sm lg:justify-self-end">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            TimeBite
          </p>
          <h2 className="m-0 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            Make time work for you.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/70">
            An AI-native workspace for turning what matters into what happens next.
          </p>
          <ul className="m-0 mt-7 flex list-none flex-wrap gap-3 p-0">
            {links.map(({ link }, index) => (
              <li className="shrink-0" key={index}>
                <CMSLink {...link} className="hp-hero-links-button" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
