import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import { Card, CardDocData, CardRelationTo } from '@/components/Card'

export type Props = {
  docs: CardDocData[]
  prismaticCards?: boolean
  relationTo?: CardRelationTo
  viewAllHref?: string
  viewAllLabel?: string
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const {
    docs,
    prismaticCards = false,
    relationTo = 'posts',
    viewAllHref,
    viewAllLabel,
  } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-6 gap-x-4 lg:gap-y-10 lg:gap-x-8 xl:gap-x-8">
          {docs?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <Card
                    className="h-full"
                    doc={result}
                    relationTo={relationTo}
                    showCategories
                    variant={prismaticCards ? 'prismatic' : 'default'}
                  />
                </div>
              )
            }

            return null
          })}
        </div>
        {viewAllHref && viewAllLabel ? (
          <div className="mt-12 flex justify-center md:mt-14">
            <Link
              className="hp-view-all-link inline-flex items-center gap-2 rounded-none border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-medium tracking-wide text-[hsl(var(--hp-mist))] backdrop-blur-md transition-[border-color,box-shadow,background-color,color] duration-300 hover:border-[hsl(var(--hp-mint)/0.45)] hover:bg-white/[0.1] hover:text-white hover:shadow-[0_0_32px_-8px_hsl(var(--hp-mint)/0.35)]"
              href={viewAllHref}
            >
              {viewAllLabel}
              <span aria-hidden className="text-[hsl(var(--hp-mint))]">
                →
              </span>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
