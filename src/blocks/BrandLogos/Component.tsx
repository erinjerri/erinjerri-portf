import type { BrandLogosBlock as BrandLogosBlockProps, Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import { Media } from '@/components/Media'

function isExternal(href: string) {
  return /^https?:\/\//i.test(href)
}

export const BrandLogosBlock: React.FC<BrandLogosBlockProps> = (props) => {
  const { heading, intro, logos, style = 'color' } = props
  if (!logos?.length) return null

  const muted = style === 'muted'

  return (
    <div className="container my-16 pb-8 md:my-20 lg:my-24 lg:pb-12">
      {heading ? (
        <h2 className="mb-3 text-center font-title text-display-h2 font-semibold tracking-tight md:text-display-h2-md">
          {heading}
        </h2>
      ) : null}
      {intro ? (
        <p className="mx-auto mb-8 max-w-2xl text-center text-base leading-relaxed text-muted-foreground">
          {intro}
        </p>
      ) : null}

      <ul
        className="flex flex-wrap items-center justify-center gap-x-8 gap-y-10 sm:gap-x-12 md:gap-x-16 lg:gap-x-20"
        role="list"
      >
        {logos.map((row, i) => {
          const asset = row.logo
          if (!asset || typeof asset !== 'object') return null
          const media = asset as MediaType
          const alt =
            row.label?.trim() ||
            (typeof media.alt === 'string' && media.alt.trim()) ||
            'Partner logo'
          const href = row.href?.trim()

          const inner = (
            <Media
              alt={alt}
              htmlElement={null}
              imgClassName={cn(
                'h-9 w-auto max-w-[min(140px,28vw)] object-contain md:h-11 md:max-w-[160px]',
                muted && 'opacity-75 transition duration-300 hover:opacity-100',
                !muted && 'opacity-90 transition duration-300 hover:opacity-100',
              )}
              pictureClassName="flex items-center justify-center"
              resource={media}
              size="(max-width: 640px) 33vw, 160px"
            />
          )

          const wrapped =
            href && href.length > 0 ? (
              isExternal(href) ? (
                <a
                  className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  href={href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {inner}
                </a>
              ) : (
                <Link
                  className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  href={href}
                >
                  {inner}
                </Link>
              )
            ) : (
              <span className="inline-flex">{inner}</span>
            )

          return (
            <li className="flex list-none items-center justify-center" key={i}>
              {wrapped}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
