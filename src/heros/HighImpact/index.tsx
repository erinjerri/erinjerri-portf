import React from 'react'

import type { Media as MediaDoc, Page } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { HeaderThemeSetter } from '@/heros/HeaderThemeSetter'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

import { heroBioRichTextClassName } from '@/heros/heroBioRichTextClassName'

type HeroProps = Page['hero']

const isPopulated = (m: unknown): m is MediaDoc =>
  Boolean(m && typeof m === 'object' && 'url' in m)

const heroFallbacks = {
  background: '/media/dimensions-background-curves.webp',
} as const

const StaticHeroImage: React.FC<{
  alt: string
  className: string
  src: string
  position?: string
}> = ({ alt, className, src, position = 'center' }) => (
  <div
    aria-label={alt}
    className={className}
    role="img"
    style={{
      backgroundImage: `url(${src})`,
      backgroundPosition: position,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    }}
  />
)

const StaticHeroSlot: React.FC<{ className?: string }> = ({ className }) => (
  <div
    aria-hidden
    className={className}
    style={{
      background:
        'linear-gradient(135deg, rgba(15,23,42,0.45) 0%, rgba(30,41,59,0.35) 100%)',
    }}
  />
)

export const HighImpactHero: React.FC<HeroProps> = ({
  links,
  media,
  richText,
  backgroundMedia,
  heroImage1,
  heroImage2,
  heroImage3,
}) => {
  const hasBackground = isPopulated(backgroundMedia)
  const hasPortrait = isPopulated(media)
  const hasAnyGridFields = Boolean(heroImage1 || heroImage2 || heroImage3)
  const hasGridMedia =
    isPopulated(heroImage1) || isPopulated(heroImage2) || isPopulated(heroImage3)
  const showGridLayout = hasAnyGridFields || hasGridMedia
  const backgroundImage = hasBackground ? backgroundMedia : null
  const backgroundSrc = backgroundImage ? undefined : heroFallbacks.background

  const renderHeroSlot = (
    resource: MediaDoc | string | number | null | undefined,
    alt: string,
    size?: string,
    unoptimized?: boolean,
  ) => {
    if (isPopulated(resource)) {
      return (
        <Media
          alt={
            (typeof resource.alt === 'string' && resource.alt.trim()) ||
            alt ||
            'Erin Jerri — AI, spatial computing, and engineering work'
          }
          fill
          htmlElement={null}
          imgClassName="object-cover"
          pictureClassName="relative block h-full w-full"
          quality={100}
          {...(unoptimized ? { unoptimized: true } : {})}
          resource={resource}
          size={size}
        />
      )
    }

    return <StaticHeroSlot className="h-full w-full" />
  }

  return (
    <div
      className="relative -mt-[6.75rem] md:-mt-[10.4rem] min-h-[65vh] w-full overflow-hidden text-foreground"
      data-theme="dark"
    >
      <HeaderThemeSetter theme="dark" />

      {/* Background: gradient fallback, then background image */}
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
            imgClassName="object-cover object-[50%_22%] md:object-center"
            pictureClassName="relative block h-full w-full"
            priority
            quality={100}
            resource={backgroundImage}
            size="(max-width: 768px) 100vw, (max-width: 1440px) 100vw, 1920px"
          />
        </div>
      )}
      {!backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <StaticHeroImage
            alt="Decorative hero background — Erin Jerri portfolio"
            className="h-full w-full"
            src={backgroundSrc!}
            position="50% 22%"
          />
        </div>
      )}

      {/* Keep legacy single-image high-impact heroes working while supporting the new 3-image layout. */}
      {!showGridLayout && hasPortrait ? (
        <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-8 px-4 py-20 md:py-24 lg:py-28 xl:grid-cols-2 xl:gap-12 xl:px-8">
          <div className="order-2 flex flex-col items-center text-center xl:order-1 xl:items-start xl:text-left">
            <div className="max-w-[36.5rem]">
              {richText && (
                <RichText
                  className={cn('mb-6', heroBioRichTextClassName)}
                  data={richText}
                  enableGutter={false}
                />
              )}
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

          <div className="order-1 flex min-h-[260px] justify-center self-start xl:order-2 xl:min-h-0 xl:justify-end">
            <div className="w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[420px] xl:max-w-[520px]">
              <Media
                alt={
                  (typeof media.alt === 'string' && media.alt.trim()) ||
                  'Erin Jerri Apple Vision Pro spatial computing work'
                }
                imgClassName="h-auto w-full object-contain object-top drop-shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
                pictureClassName="relative block w-full"
                priority
                resource={media}
                size="(max-width: 640px) 78vw, (max-width: 1280px) 42vw, 520px"
              />
            </div>
          </div>
        </div>
      ) : !showGridLayout ? (
        <div className="relative z-10 mx-auto flex max-w-[1200px] items-center px-4 py-20 md:py-24 lg:py-28 xl:px-8">
          <div className="max-w-[36.5rem]">
            {richText && (
              <RichText
                className={cn('mb-6', heroBioRichTextClassName)}
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
      ) : (
        <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-8 px-4 py-20 md:py-24 lg:py-28 xl:grid-cols-2 xl:gap-12 xl:px-8">
          <div className="order-2 flex flex-col items-center text-center xl:order-1 xl:items-start xl:text-left">
            <div className="max-w-[36.5rem]">
              {richText && (
                <RichText
                  className={cn('mb-6', heroBioRichTextClassName)}
                  data={richText}
                  enableGutter={false}
                />
              )}
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

          <div className="order-1 xl:order-2">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="col-span-2 aspect-[16/9] overflow-hidden">
                {renderHeroSlot(
                  heroImage1,
                  'Erin Jerri — featured work spanning AI, spatial computing, and creative technology',
                  // Cap logical width so mobile does not pull 750w+ for a ~380px slot (PageSpeed / Slow 4G).
                  '(max-width: 1279px) min(100vw - 2rem, 24rem), min(50vw, 32rem)',
                )}
              </div>
              <div className="aspect-[3/4] overflow-hidden">
                {renderHeroSlot(
                  heroImage2,
                  'Erin Jerri Apple Vision Pro spatial computing work',
                  // This card grows wider than the previous sizes hint suggested, especially on
                  // high-DPR desktop displays. Give the browser a truer width so it can request
                  // a larger source candidate and avoid soft/pixelated rendering.
                  '(max-width: 767px) min(50vw - 0.5rem, 16rem), (max-width: 1279px) min(50vw - 0.5rem, 18rem), min(25vw, 22rem)',
                  true,
                )}
              </div>
              <div className="aspect-[3/4] overflow-hidden">
                {renderHeroSlot(
                  heroImage3,
                  'Erin Jerri — engineering, AI systems, and spatial computing',
                  '(max-width: 1279px) min(50vw - 0.5rem, 12rem), min(25vw, 15rem)',
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
