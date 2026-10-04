import type { ProductShowcaseBlock as ProductShowcaseBlockProps } from '@/payload-types'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'

export const ProductShowcaseBlock: React.FC<ProductShowcaseBlockProps> = (props) => {
  const { blurb, eyebrow, headline, links, screenshot, windowLabel } = props

  if (!screenshot) return null

  const isMediaDocument = typeof screenshot === 'object'
  const alt =
    (isMediaDocument && typeof screenshot.alt === 'string' && screenshot.alt.trim()) ||
    `${windowLabel || headline || 'Product'} screenshot`

  return (
    <section
      aria-label={headline || 'Product preview'}
      className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)] lg:gap-12"
    >
      {/* The window frame stays dark on every surface - it represents the app
          chrome, not the page. Only the surrounding copy follows the surface. */}
      <div className="relative w-full overflow-hidden rounded-[1.35rem] border border-white/15 bg-[#111827] p-2 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.45)] sm:p-2.5">
        <div className="flex h-6 items-center gap-1.5 px-2 sm:h-7">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57] sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e] sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-[#28c840] sm:h-2.5 sm:w-2.5" />
          {windowLabel ? (
            <span className="ml-2 text-[0.6rem] font-medium tracking-[0.08em] text-white/40 sm:text-[0.68rem]">
              {windowLabel}
            </span>
          ) : null}
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[0.85rem] border border-white/10 bg-[#090d18]">
          <Media
            alt={alt}
            fill
            imagePlaceholder="empty"
            imgClassName="object-contain object-center"
            pictureClassName="absolute inset-0 block h-full w-full"
            quality={80}
            {...(isMediaDocument ? { resource: screenshot } : { src: screenshot })}
            size="(max-width: 768px) min(100vw, 52rem), (max-width: 1280px) 52vw, 832px"
          />
        </div>
      </div>

      <div className="max-w-sm lg:justify-self-end">
        {eyebrow ? (
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="m-0 font-title text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
          {headline}
        </h2>
        {blurb ? <p className="mt-4 text-base leading-7 text-muted-foreground">{blurb}</p> : null}
        {links?.length ? (
          <ul className="m-0 mt-7 flex list-none flex-wrap gap-3 p-0">
            {links.map(({ link }, index) => (
              <li className="shrink-0" key={index}>
                <CMSLink {...link} className="hp-hero-links-button" />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
