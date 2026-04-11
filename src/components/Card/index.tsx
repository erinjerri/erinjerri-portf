'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
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

type CardVideoLink = {
  type?: 'default' | 'custom' | 'reference' | null
  url?: string | null
  reference?: { slug?: string | null; relationTo?: string } | string | null
  label?: string | null
  newTab?: boolean | null
}

type CardQALink = {
  url?: string | null
  label?: string | null
}

export type CardDocData = {
  categories?: (number | string | CardCategory | null)[] | null
  meta?: CardMeta | null
  slug?: string | null
  title?: string | null
  slides?: number | string | SlidesDoc | null
  videoUrl?: string | null
  videoSource?: 'upload' | 'url' | null
  cardVideoLink?: CardVideoLink | null
  cardQALink?: CardQALink | null
}

export type CardRelationTo = 'posts' | 'projects' | 'watch'

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardDocData
  relationTo?: CardRelationTo
  showCategories?: boolean
  title?: string
  variant?: 'default' | 'prismatic'
}> = (props) => {
  const { card, link } = useClickableCard({})
  const {
    className,
    doc,
    relationTo = 'posts',
    showCategories,
    title: titleFromProps,
    variant = 'default',
  } = props

  const { slug, categories, meta, title, slides, videoUrl, videoSource, cardVideoLink, cardQALink } =
    doc || {}
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

  const resolveVideoLink = (): { url: string; label: string; newTab: boolean } | null => {
    const cvl = cardVideoLink
    const defaultLabel = cvl?.label?.trim() || 'Watch video'
    const newTab = Boolean(cvl?.newTab)

    if (cvl?.type === 'custom' && cvl.url?.trim()) {
      return { url: cvl.url.trim(), label: defaultLabel, newTab }
    }
    if (cvl?.type === 'reference' && cvl.reference && typeof cvl.reference === 'object') {
      const ref = cvl.reference as { slug?: string | null; relationTo?: string }
      const refSlug = ref.slug
      if (refSlug) {
        const base = ref.relationTo === 'pages' ? '' : `/${ref.relationTo || 'watch'}`
        return { url: `${base}/${refSlug}`.replace(/^\/\//, '/'), label: defaultLabel, newTab }
      }
    }
    if (cvl?.type === 'default' || !cvl?.type) {
      if (videoSource === 'url' && videoUrl?.trim()) {
        return { url: videoUrl.trim(), label: defaultLabel, newTab }
      }
      if (slug) {
        return { url: href, label: defaultLabel, newTab: false }
      }
    }
    if (!cvl && (videoSource === 'url' ? videoUrl?.trim() : slug)) {
      return {
        url: videoSource === 'url' && videoUrl?.trim() ? videoUrl.trim() : href,
        label: defaultLabel,
        newTab: videoSource === 'url',
      }
    }
    return null
  }
  const videoLink = isWatch ? resolveVideoLink() : null
  const qaLink =
    isWatch && cardQALink?.url?.trim()
      ? {
          url: cardQALink.url.trim(),
          label: cardQALink.label?.trim() || 'Q&A',
        }
      : null

  const surfaceClass =
    variant === 'prismatic'
      ? 'group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-300 hover:cursor-pointer hover:-translate-y-0.5 hover:border-[hsl(var(--hp-mint)/0.35)] hover:shadow-[0_24px_60px_-20px_hsl(var(--hp-mint)/0.18)]'
      : 'group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-300 hover:cursor-pointer hover:-translate-y-0.5 hover:border-white/20 hover:shadow-2xl'

  return (
    <article className={cn(surfaceClass, className)} ref={card.ref}>
      <div className="relative w-full">
        {!metaImage && <div className="">No image</div>}
        {metaImage && typeof metaImage !== 'string' && (
            <Media
              resource={metaImage}
              size="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
            />
          )}
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
        {relationTo === 'watch' && (slidesPdfUrl || videoLink || qaLink) && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {videoLink && (
              <Button asChild size="sm" variant="default">
                <Link
                  href={videoLink.url}
                  {...(videoLink.newTab && { target: '_blank', rel: 'noopener noreferrer' })}
                  prefetch={!videoLink.newTab}
                >
                  {videoLink.label}
                </Link>
              </Button>
            )}
            {qaLink && (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <a href={qaLink.url} target="_blank" rel="noopener noreferrer">
                  {qaLink.label}
                </a>
              </Button>
            )}
            {slidesPdfUrl && (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <a
                  href={slidesPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  Download slides
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
