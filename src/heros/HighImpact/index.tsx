import React from 'react'

import type { Media as MediaDoc, Page } from '@/payload-types'

import { HeaderThemeSetter } from '@/heros/HeaderThemeSetter'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

type HeroProps = Page['hero']

const isPopulated = (m: unknown): m is MediaDoc =>
  Boolean(m && typeof m === 'object' && 'url' in m)

const heroFallbacks = {
  background: '/media/dimensions-background-curves.webp',
  gridTop: '/media/CYR-CreatingARVR-X-cover-updated@1x.png',
  gridBottomLeft: '/media/Erin-Book-Headshot.webp',
  gridBottomRight: '/media/erin-AVP-headshot-95op.png',
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
  const backgroundImage = hasBackground ? backgroundMedia : !showGridLayout && hasPortrait ? media : null
  const backgroundSrc = backgroundImage ? undefined : heroFallbacks.background

  const renderHeroSlot = (
    resource: MediaDoc | string | number | null | undefined,
    fallbackSrc: string,
    alt: string,
    size?: string,
  ) => {
    if (isPopulated(resource)) {
      return (
        <Media
          fill
          htmlElement={null}
          imgClassName="object-cover"
          pictureClassName="relative block h-full w-full"
          priority
          resource={resource}
          size={size}
        />
      )
    }

    return (
      <StaticHeroImage
        alt={alt}
        className="h-full w-full"
        src={fallbackSrc}
        position="center"
      />
    )
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
            fill
            className="absolute inset-0 h-full w-full"
            imgClassName="object-cover object-[50%_22%] md:object-center"
            pictureClassName="relative block h-full w-full"
            priority
            resource={backgroundImage}
          />
        </div>
      )}
      {!backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <StaticHeroImage
            alt=""
            className="h-full w-full"
            src={backgroundSrc!}
            position="50% 22%"
          />
        </div>
      )}

      {/* Keep legacy single-image high-impact heroes working while supporting the new 3-image layout. */}
      {!showGridLayout && hasPortrait ? (
        <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-8 px-4 py-16 xl:grid-cols-2 xl:gap-12 xl:px-8">
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
        </div>
      ) : !showGridLayout ? (
        <div className="relative z-10 mx-auto flex max-w-[1200px] items-center px-4 py-16 xl:px-8">
          <div className="max-w-[36.5rem]">
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
      ) : (
        <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-8 px-4 py-16 xl:grid-cols-2 xl:gap-12 xl:px-8">
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

          <div className="order-1 xl:order-2">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="col-span-2 aspect-[16/9] overflow-hidden">
                {renderHeroSlot(
                  heroImage1,
                  heroFallbacks.gridTop,
                  'Hero top',
                  '(max-width: 1024px) 100vw, 50vw',
                )}
              </div>
              <div className="aspect-[3/4] overflow-hidden">
                {renderHeroSlot(
                  heroImage2,
                  heroFallbacks.gridBottomLeft,
                  'Hero bottom left',
                  '(max-width: 1024px) 50vw, 25vw',
                )}
              </div>
              <div className="aspect-[3/4] overflow-hidden">
                {renderHeroSlot(
                  heroImage3,
                  heroFallbacks.gridBottomRight,
                  'Hero bottom right',
                  '(max-width: 1024px) 50vw, 25vw',
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
