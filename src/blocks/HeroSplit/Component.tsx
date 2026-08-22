import type { HeroSplitBlock as HeroSplitBlockProps } from '@/payload-types'
import React from 'react'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

const accentBorder = 'border-[hsl(43_42%_58%)]'
const accentText = 'text-[hsl(43_42%_58%)]'
const accentBg = 'bg-[hsl(43_42%_58%)]'

const ASPECT_CLASS: Record<string, string> = {
  '3/4': 'aspect-[3/4]',
  '4/5': 'aspect-[4/5]',
  '1/1': 'aspect-square',
  '3/2': 'aspect-[3/2]',
}

export const HeroSplitBlock: React.FC<HeroSplitBlockProps> = (props) => {
  const { headline, lead, support, image, imageSide = 'right', imageAspect = '3/4', ctas } = props

  if (!headline) return null

  const aspectClass = ASPECT_CLASS[imageAspect ?? '3/4'] ?? ASPECT_CLASS['3/4']

  return (
    <div className="container my-16 md:my-20 lg:my-24">
      <div
        className={cn(
          'grid items-center gap-8 md:gap-10 lg:gap-14',
          image ? 'md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]' : 'md:grid-cols-1',
        )}
      >
        <div className={cn(imageSide === 'left' && image ? 'md:order-2' : undefined)}>
          <h1 className="font-title text-display-h1 font-semibold tracking-tight md:text-display-h1-md">
            {headline}
          </h1>
          {lead ? (
            <p className="mt-5 max-w-[30ch] font-title text-xl font-medium leading-snug tracking-tight text-foreground/95 md:text-2xl">
              {lead}
            </p>
          ) : null}
          {support ? (
            <p className="mt-5 max-w-prose text-base leading-relaxed text-muted-foreground lg:text-lg">
              {support}
            </p>
          ) : null}
          {ctas?.length ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {ctas.map((cta, i) => (
                <a
                  className={cn(
                    'inline-block border px-6 py-3 font-title text-sm font-semibold no-underline transition-colors',
                    accentBorder,
                    cta.style === 'outline'
                      ? cn(accentText, 'hover:bg-[hsl(43_42%_58%)]/10')
                      : cn(accentBg, 'text-background hover:opacity-90'),
                  )}
                  href={cta.url ?? '#'}
                  key={i}
                >
                  {cta.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {image ? (
          <div className={cn(imageSide === 'left' ? 'md:order-1' : undefined)}>
            <Media
              fill
              imgClassName="object-cover"
              /** `fill` positions against <picture>, so the aspect ratio lives there. */
              pictureClassName={cn('relative block w-full overflow-hidden', aspectClass)}
              priority
              /**
               * Both overrides matter: ImageMedia defaults `fill && priority` to
               * quality 50 and caps its default `sizes` at 720px. A face at the
               * top of the page needs neither of those defaults.
               */
              quality={85}
              resource={image}
              size="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 560px"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
