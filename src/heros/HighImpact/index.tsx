/**
 * Performance: hero `Media` `size` + quality props cap LCP decode/transfer on mobile viewports.
 */
import React from 'react'

import type { Media as MediaDoc, Page } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { CMSLink } from '@/components/Link'
import { ContainedHeroAnimation } from '@/components/ContainedHeroAnimation'
import { HomeHeroShowcase } from '@/components/HomeHeroShowcase/Component'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

import { heroBioRichTextClassName } from '@/heros/heroBioRichTextClassName'

type HeroProps = Page['hero'] & {
  showHeroAnimation?: boolean
  visualVariant?: 'prismatic'
}

const isPopulated = (m: unknown): m is MediaDoc => Boolean(m && typeof m === 'object' && 'url' in m)

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
      background: 'linear-gradient(135deg, rgba(15,23,42,0.45) 0%, rgba(30,41,59,0.35) 100%)',
    }}
  />
)

// Public asset fallback so the TimeBite preview still renders when the CMS relation is empty.
const productScreenshotFallback = '/media/timebite-macos-sample-screen.png'

type HeroSlotOpts = {
  unoptimized?: boolean
  /** First visible hero tile — LCP candidate (preload + eager decode). */
  priority?: boolean
  quality?: number
}

export const HighImpactHero: React.FC<HeroProps> = ({
  links,
  media,
  richText,
  backgroundMedia,
  heroImageCount,
  heroImage1,
  heroImage2,
  heroImage3,
  productMockup,
  showHeroAnimation = false,
  visualVariant,
}) => {
  const hasBackground = isPopulated(backgroundMedia)
  const imageCount = heroImageCount ?? '1'
  const primaryHeroImage = heroImage2 || heroImage1 || heroImage3
  const portraitResource = isPopulated(media)
    ? media
    : isPopulated(primaryHeroImage)
      ? primaryHeroImage
      : null
  const hasPortrait = Boolean(portraitResource)
  const selectedHeroImages =
    imageCount === '1'
      ? [primaryHeroImage]
      : imageCount === '2'
        ? [heroImage2, heroImage3]
        : [heroImage1, heroImage2, heroImage3]
  const hasAnyGridFields = selectedHeroImages.some(Boolean)
  const hasGridMedia = selectedHeroImages.some(isPopulated)
  const galleryImages = [heroImage1, heroImage2, heroImage3].filter(isPopulated)
  const isPrismatic = visualVariant === 'prismatic'
  /** Home keeps the Ali-style intro split even when the CMS has gallery assets. */
  const forcePortraitSplit = isPrismatic && hasPortrait
  const showGridLayout =
    isPrismatic || (!forcePortraitSplit && (hasAnyGridFields || hasGridMedia))
  const backgroundImage = hasBackground ? backgroundMedia : null
  const backgroundSrc = backgroundImage ? undefined : heroFallbacks.background

  const isBetaLink = ({ link }: { link: { label?: string | null } }) => {
    const label = typeof link.label === 'string' ? link.label.toLowerCase() : ''
    return label.includes('timebite') || label.includes('beta')
  }
  const betaLinks = Array.isArray(links) ? links.filter(isBetaLink) : []
  const workLinks = Array.isArray(links) ? links.filter((entry) => !isBetaLink(entry)) : []
  // Keep the preview visible while an older CMS record is missing the relation.
  const productScreenshotResource: MediaDoc | string = isPopulated(productMockup)
    ? productMockup
    : productScreenshotFallback

  const renderHeroCopy = (className?: string, ctaLinks = links) => {
    const hasLinks = Array.isArray(ctaLinks) && ctaLinks.length > 0
    if (!richText && !hasLinks) return null

    return (
      <div className={cn('hp-hero-content relative z-[2]', className)}>
        <div
          className={cn('hp-hero-content-inner', richText && 'hp-hero-content-inner--with-prose')}
        >
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
                'hp-hero-cta-row m-0 inline-flex max-w-full list-none flex-row flex-wrap items-center justify-start gap-3.5 p-0',
                isPrismatic && 'hp-hero-links',
              )}
            >
              {ctaLinks.map(({ link }, i) => (
                <li className="shrink-0" key={i}>
                  <CMSLink {...link} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    )

  }

  const renderPortrait = () => {
    if (!hasPortrait) return null

    /* Prismatic home: bounded frame + object-contain so AVP art is not cropped on short 13" viewports (object-cover + fixed vh clipped heads/gear). */
    if (isPrismatic) {
      return (
        <div
          className={cn(
            'relative mx-auto w-full max-w-[min(100%,440px)] overflow-hidden rounded-2xl bg-black/25 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.55)]',
            /* Explicit frame height + object-contain: avoids object-cover crop inside a vh-tall box on short 13" viewports */
            'min-h-[200px] h-[min(64svh,680px)]',
          )}
        >
          <Media
            alt={
              (typeof portraitResource!.alt === 'string' && portraitResource!.alt.trim()) ||
              'Erin Jerri Apple Vision Pro spatial computing work'
            }
            fill
            className="absolute inset-0"
            imgClassName="object-contain object-center"
            pictureClassName="absolute inset-0 block h-full w-full"
            priority
            quality={60}
            resource={portraitResource!}
            size="(max-width: 768px) min(100vw, 400px), (max-width: 1024px) 38vw, 420px"
          />
        </div>
      )
    }

    return (
      <Media
        alt={
          (typeof portraitResource!.alt === 'string' && portraitResource!.alt.trim()) ||
          'Erin Jerri Apple Vision Pro spatial computing work'
        }
        imgClassName={cn(
          'h-auto w-full object-cover object-center object-[40%_20%]',
          'rounded-[1.5rem] shadow-[0_24px_70px_-24px_rgba(0,0,0,0.58)]',
        )}
        pictureClassName="relative block w-full overflow-hidden"
        priority
        quality={60}
        resource={portraitResource!}
        size="(max-width: 768px) min(100vw, 400px), (max-width: 1024px) 38vw, 440px"
      />
    )
  }

  const renderHeroSlot = (
    resource: MediaDoc | string | number | null | undefined,
    alt: string,
    size?: string,
    opts?: HeroSlotOpts,
  ) => {
    if (isPopulated(resource)) {
      const { unoptimized, priority: slotPriority, quality: slotQuality } = opts ?? {}
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
          priority={slotPriority}
          quality={slotQuality}
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
        /* No negative margin: sticky header (z-50) must sit above hero; content clears nav via padding below. */
        'relative isolate mt-0 flex w-full flex-col overflow-hidden text-foreground',
        /* CLS: reserve at least one viewport height before paint (Lighthouse); prismatic keeps flex centering inside. */
        'min-h-[100dvh]',
        isPrismatic && 'hp-hero-root',
      )}
      data-high-impact-hero
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
            quality={60}
            resource={backgroundImage}
            size="(max-width: 768px) min(100vw, 768px), (max-width: 1536px) 90vw, 1200px"
          />
        </div>
      )}
      {/* Curves asset lives in the nav on home (prismatic); hero uses ink + mist only. */}
      {!backgroundImage && !isPrismatic && (
        <div className="absolute inset-0 -z-10">
          <StaticHeroImage
            alt="Decorative hero background — Erin Jerri portfolio"
            className="h-full w-full"
            src={backgroundSrc!}
            position="40% 20%"
          />
        </div>
      )}
      {showHeroAnimation && <ContainedHeroAnimation />}

      {/* Mobile-only: gradient + vignette above background, below copy. */}
      <div
        aria-hidden
        className="hp-hero-mobile-overlay pointer-events-none absolute inset-0 z-[1] hidden max-[768px]:block"
      />

      {/* Foreground visuals fill the hero; prismatic variant uses a tighter side-by-side layout so the portrait and copy read as one composition. */}
      {!showGridLayout && hasPortrait ? (
        <>
          {isPrismatic ? (
            <div
              className={cn(
                'relative z-10 isolate mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-6 overflow-hidden px-6 md:px-10',
                /* Tighter vertical rhythm into first homepage section */
                'pb-14 pt-[calc(var(--nav-height)+2.5rem)] md:pt-[calc(var(--nav-height)+3rem)]',
                'xl:grid xl:min-h-0 xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] xl:items-center xl:gap-10 xl:pb-14 xl:pt-[calc(var(--nav-height)+2.5rem)]',
              )}
            >
              <div className="relative z-10 order-2 xl:order-1">
                {renderHeroCopy('max-w-[min(calc(100vw-2.5rem),40rem)]')}
              </div>
              <div className="relative z-10 order-1 flex justify-center xl:order-2 xl:items-center xl:justify-end">
                <div className="w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[420px] xl:max-w-[500px]">
                  {renderPortrait()}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center px-4 pt-20 pb-20 xl:justify-end xl:px-8 xl:pb-8 xl:pt-24">
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
      ) : isPrismatic ? (
        <div className="relative z-10 isolate mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden px-6 pb-16 pt-[calc(var(--nav-height)+2.5rem)] md:px-10 md:pb-20 md:pt-[calc(var(--nav-height)+3rem)]">
          <div className="grid w-full grid-cols-1 items-center gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] xl:gap-10">
            <div className="relative z-10 order-2 xl:order-1">
              {renderHeroCopy('max-w-[min(calc(100vw-2.5rem),40rem)]', workLinks)}
            </div>
            <div className="relative z-10 order-1 flex justify-center xl:order-2 xl:justify-end">
              <div className="w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[420px] xl:max-w-[500px]">
                {renderPortrait()}
              </div>
            </div>
          </div>
          {hasGridMedia && (
            <section className="relative z-10 mt-10 w-full border-t border-white/10 pt-10 sm:mt-14 sm:pt-14" aria-label="Selected work">
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                {galleryImages.map((image, index) => (
                  <div className="relative aspect-[4/3] min-h-[12rem] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]" key={index}>
                    {renderHeroSlot(
                      image,
                      `Erin Jerri — selected work ${index + 1}`,
                      '(max-width: 640px) 100vw, (max-width: 1280px) 30vw, 420px',
                      { priority: index === 0, quality: 90 },
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          <HomeHeroShowcase resource={productScreenshotResource} betaLinks={betaLinks} />
        </div>
      ) : (
        <>
          <div className="absolute inset-0 z-0 flex items-center justify-center px-4 pt-20 pb-24 xl:justify-end xl:px-8 xl:pb-10 xl:pt-24">
            <div className="w-full max-w-md sm:max-w-lg xl:max-w-2xl">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="relative col-span-2 aspect-[16/9] overflow-hidden">
                  {renderHeroSlot(
                    heroImage1,
                    'Erin Jerri — featured work spanning AI, spatial computing, and creative technology',
                    '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 760px',
                    { priority: true, quality: 90 },
                  )}
                </div>
                <div className="relative aspect-[3/4] overflow-hidden">
                  {renderHeroSlot(
                    heroImage2,
                    'Erin Jerri Apple Vision Pro spatial computing work',
                    '(max-width: 768px) 48vw, (max-width: 1280px) 25vw, 380px',
                    { quality: 90 },
                  )}
                </div>
                <div className="relative aspect-[3/4] overflow-hidden">
                  {renderHeroSlot(
                    heroImage3,
                    'Erin Jerri — engineering, AI systems, and spatial computing',
                    '(max-width: 768px) 48vw, (max-width: 1280px) 25vw, 380px',
                    { quality: 90 },
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
