'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import { getDocumentUrl } from '@/utilities/getDocumentUrl'

type CardCategory = {
  id: number | string
  title?: string | null
}

type CardMeta = {
  description?: string | null
  image?: number | string | MediaType | null
}

type SlidesDoc = {
  url?: string | null
  filename?: string | null
  title?: string | null
}

export type CardDocData = {
  categories?: (number | string | CardCategory | null)[] | null
  meta?: CardMeta | null
  slug?: string | null
  title?: string | null
  slides?: number | string | SlidesDoc | null
}

export type CardRelationTo = 'posts' | 'projects' | 'watch'

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardDocData
  relationTo?: CardRelationTo
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo = 'posts', showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title, slides } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const slidesDoc =
    slides && typeof slides === 'object' && slides !== null ? (slides as SlidesDoc) : null
  const slidesPdfUrl =
    slidesDoc && (slidesDoc.url || slidesDoc.filename)
      ? getDocumentUrl(
          typeof slidesDoc.url === 'string' ? slidesDoc.url : null,
          slidesDoc.filename,
        )
      : null
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`
  const isWatch = relationTo === 'watch'

  return (
    <article
      className={cn(
        'group rounded-lg overflow-hidden border border-white/30 bg-[linear-gradient(180deg,rgba(186,230,253,0.24),rgba(56,189,248,0.12))] backdrop-blur-lg shadow-[0_10px_30px_rgba(8,47,73,0.28)] transition-colors hover:cursor-pointer hover:border-cyan-200/70',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full">
        {!metaImage && <div className="">No image</div>}
        {metaImage && typeof metaImage !== 'string' && <Media resource={metaImage} size="33vw" />}
        {isWatch && metaImage && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-black/35 transition-opacity duration-300 group-hover:opacity-45" />
            <Link
              aria-label={`Play video${titleToUse ? `: ${titleToUse}` : ''}`}
              className="absolute inset-0 flex items-center justify-center"
              href={href}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/90 ring-1 ring-white/60 backdrop-blur-sm transition-transform duration-200 group-hover:scale-105">
                <svg
                  aria-hidden
                  className="h-5 w-5 translate-x-[1px]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 8.5v7l7-3.5-7-3.5z" />
                </svg>
              </span>
            </Link>
          </>
        )}
      </div>
      <div className="p-4">
        {showCategories && hasCategories && (
          <div className="uppercase text-sm mb-4">
            {showCategories && hasCategories && (
              <div>
                {categories?.map((category, index) => {
                  if (category && typeof category === 'object') {
                    const { title: titleFromCategory } = category

                    const categoryTitle = titleFromCategory || 'Untitled category'

                    const isLast = index === categories.length - 1

                    return (
                      <Fragment key={index}>
                        {categoryTitle}
                        {!isLast && <Fragment>, &nbsp;</Fragment>}
                      </Fragment>
                    )
                  }

                  return null
                })}
              </div>
            )}
          </div>
        )}
        {titleToUse && (
          <div className="prose">
            <h3>
              <Link className="not-prose" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {description && <div className="mt-2">{description && <p>{sanitizedDescription}</p>}</div>}
        {relationTo === 'watch' && slidesPdfUrl && (
          <div className="mt-4">
            <a
              href={slidesPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="text-sky-500 hover:text-sky-400 hover:underline font-medium transition-colors"
            >
              Download slides
              <span aria-hidden> →</span>
            </a>
          </div>
        )}
      </div>
    </article>
  )
}
