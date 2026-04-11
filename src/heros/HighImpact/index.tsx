import React from 'react'

import type { Media as MediaDoc, Page } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

import { heroBioRichTextClassName } from '@/heros/heroBioRichTextClassName'

type HeroProps = Page['hero'] & { visualVariant?: 'prismatic' }

const isPopulated = (m: unknown): m is MediaDoc =>
  Boolean(m && typeof m === 'object' && 'url' in m)

const heroFallbacks = {
  background: '/media/dimensions-background-curves.webp',
} as const

/** Full-bleed / slot heroes: cover + bias upper area so heads stay in frame (spec: top center or 40% 20%). */
const heroCoverImgClassName = 'object-cover object-[40%_20%]'

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
  visualVariant,
}) => {
  const hasBackground = isPopulated(backgroundMedia)
  const hasPortrait = isPopulated(media)
  const hasAnyGridFields = Boolean(heroImage1 || heroImage2 || heroImage3)
  const hasGridMedia =
    isPopulated(heroImage1) || isPopulated(heroImage2) || isPopulated(heroImage3)
  /** Homepage experiment: prioritize editorial split + portrait over multi-image grid */
  const forcePortraitSplit = visualVariant === 'prismatic' && hasPortrait
  const showGridLayout = !forcePortraitSplit && (hasAnyGridFields || hasGridMedia)
  const isPrismatic = visualVariant === 'prismatic'
  const backgroundImage = hasBackground ? backgroundMedia : null
  const backgroundSrc = backgroundImage ? undefined : heroFallbacks.background

  const renderHeroCopy = (className?: string) => {
    const hasLinks = Array.isArray(links) && links.length > 0
    if (!richText && !hasLinks) return null

    return (
      <div className={className}>
        {richText && (
          <RichText
            className={cn(
              isPrismatic ? 'mb-5 hp-hero-prose hp-hero-prose--open' : 'mb-6',
              !isPrismatic && heroBioRichTextClassName,
            )}
            data={richText}
            demoteExtraHeroH1
            enableGutter={false}
          />
        )}
        {hasLinks && (
          <ul
            className={cn(
              'm-0 inline-flex max-w-full list-none flex-row flex-wrap items-center justify-start gap-3.5 p-0',
              isPrismatic && 'hp-hero-links',
            )}
          >
            {links.map(({ link }, i) => (
              <li className="shrink-0" key={i}>
                <CMSLink {...link} />
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  const renderPortrait = () => {
    if (!hasPortrait) return null

    return (
      <Media
        alt={
          (typeof media.alt === 'string' && media.alt.trim()) ||
          'Erin Jerri Apple Vision Pro spatial computing work'
        }
        imgClassName={cn(
          'h-auto w-full object-cover object-[40%_20%]',
          'rounded-[1.5rem] shadow-[0_24px_70px_-24px_rgba(0,0,0,0.58)]',
        )}
        pictureClassName="relative block w-full overflow-hidden"
        priority
        resource={media}
        size="(max-width: 640px) 78vw, (max-width: 1280px) 36vw, 460px"
      />
    )
  }

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
          imgClassName={heroCoverImgClassName}
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
      className={cn(
        'relative -mt-[6.75rem] md:-mt-[10.4rem] min-h-[65vh] md:min-h-[75vh] w-full overflow-hidden text-foreground',
        isPrismatic && 'hp-hero-root',
      )}
      data-theme="dark"
    >
      {/* Background: prismatic ink + mist, or legacy gradient, then optional CMS background */}
      {isPrismatic ? (
        <div className="hp-hero-backdrop absolute inset-0 -z-10" aria-hidden />
      ) : (
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-[#000815] via-[#0c1633] to-[#020712]"
          aria-hidden
        />
      )}
      {backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <Media
            alt={
              (typeof backgroundImage.alt === 'string' && backgroundImage.alt.trim()) ||
              'Full-width hero background — Erin Jerri, AI and spatial computing'
            }
            fill
            className="absolute inset-0 h-full w-full"
            imgClassName={heroCoverImgClassName}
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
            position="40% 20%"
          />
        </div>
      )}

      {/* Foreground visuals fill the hero; prismatic variant uses a tighter side-by-side layout so the portrait and copy read as one composition. */}
      {!showGridLayout && hasPortrait ? (
        <>
          {isPrismatic ? (
            <div className="relative z-10 mx-auto flex min-h-[62vh] w-full max-w-[96rem] flex-col justify-center gap-8 px-6 py-16 md:px-10 lg:px-12 xl:grid xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] xl:items-center xl:gap-12 xl:py-20">
              <div className="order-2 xl:order-1">
                {renderHeroCopy('max-w-[min(calc(100vw-2.5rem),40rem)]')}
              </div>
              <div className="order-1 flex justify-center xl:order-2 xl:justify-end">
                <div className="w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[420px] xl:max-w-[500px]">
                  {renderPortrait()}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center px-4 pt-20 pb-36 xl:justify-end xl:px-8 xl:pb-8 xl:pt-24">
                <div className="pointer-events-auto w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[440px] xl:max-w-[560px]">
                  {renderPortrait()}
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-6 left-6 z-20 text-left md:bottom-8 md:left-8">
                <div className="pointer-events-auto max-w-[min(calc(100vw-2.5rem),42rem)] p-6 md:max-w-[46rem] md:p-8 pr-1">
                  {renderHeroCopy()}
                </div>
              </div>
            </>
          )}
        </>
      ) : !showGridLayout ? (
        <div className="pointer-events-none absolute bottom-6 left-6 z-20 text-left md:bottom-8 md:left-8">
          <div className="pointer-events-auto max-w-[min(calc(100vw-2.5rem),42rem)] p-6 md:max-w-[46rem] md:p-8 pr-1">
            {renderHeroCopy()}
          </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 z-0 flex items-center justify-center px-4 pt-20 pb-40 xl:justify-end xl:px-8 xl:pb-12 xl:pt-24">
            <div className="w-full max-w-md sm:max-w-lg xl:max-w-2xl">
              <div
                className={cn(
                  'grid grid-cols-2 gap-2 sm:gap-3',
                  isPrismatic && '[&_.relative]:rounded-xl [&_.relative]:ring-1 [&_.relative]:ring-white/15',
                )}
              >
                <div className="relative col-span-2 aspect-[16/9] overflow-hidden">
                  {renderHeroSlot(
                    heroImage1,
                    'Erin Jerri — featured work spanning AI, spatial computing, and creative technology',
                    '(max-width: 1279px) min(100vw - 2rem, 24rem), min(50vw, 32rem)',
                  )}
                </div>
                <div className="relative aspect-[3/4] overflow-hidden">
                  {renderHeroSlot(
                    heroImage2,
                    'Erin Jerri Apple Vision Pro spatial computing work',
                    '(max-width: 767px) min(50vw - 0.5rem, 16rem), (max-width: 1279px) min(50vw - 0.5rem, 18rem), min(25vw, 22rem)',
                    true,
                  )}
                </div>
                <div className="relative aspect-[3/4] overflow-hidden">
                  {renderHeroSlot(
                    heroImage3,
                    'Erin Jerri — engineering, AI systems, and spatial computing',
                    '(max-width: 1279px) min(50vw - 0.5rem, 12rem), min(25vw, 15rem)',
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-6 left-6 z-20 text-left md:bottom-8 md:left-8">
            <div className="pointer-events-auto max-w-[min(calc(100vw-2.5rem),42rem)] p-6 md:max-w-[46rem] md:p-8 pr-1">
              {renderHeroCopy()}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
