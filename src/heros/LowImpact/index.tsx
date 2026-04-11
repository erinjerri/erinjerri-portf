import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { heroBioRichTextClassName } from '@/heros/heroBioRichTextClassName'
import { cn } from '@/utilities/ui'

type LowImpactHeroType =
  | (Omit<Page['hero'], 'richText'> & {
      children?: React.ReactNode
      richText?: never
    })
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, links, richText }) => {
  return (
    <div className="container mt-16">
      <div className="max-w-[48rem]">
        {children ||
          (richText && (
            <RichText
              className={cn('mb-6', heroBioRichTextClassName)}
              data={richText}
              enableGutter={false}
            />
          ))}
        {Array.isArray(links) && links.length > 0 && (
          <ul className="m-0 mt-4 inline-flex max-w-full list-none flex-row flex-wrap items-center justify-start gap-3.5 p-0">
            {links.map(({ link }, i) => (
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
