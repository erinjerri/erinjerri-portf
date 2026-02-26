import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'

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
        {children || (richText && <RichText className="mb-6" data={richText} enableGutter={false} />)}
        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex flex-wrap gap-4 mt-4">
            {links.map(({ link }, i) => (
              <li key={i}>
                <CMSLink {...link} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
