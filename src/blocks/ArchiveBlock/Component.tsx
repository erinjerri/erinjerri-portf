import type { ArchiveBlock as ArchiveBlockProps, Post, Project } from '@/payload-types'

import React from 'react'
import RichText from '@/components/RichText'
import { draftMode } from 'next/headers'

import { CategoryFilter } from '@/components/CategoryFilter'
import { CollectionArchive } from '@/components/CollectionArchive'
import type { CardRelationTo } from '@/components/Card'
import {
  isMongoConnectionRetryableError,
  withPayloadClientRetry,
} from '@/utilities/getPayloadClient'

type ArchiveFetchedDocs = {
  docs: (Post | Project)[]
}

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { categories, id, introContent, limit: limitFromProps, populateBy, selectedDocs } = props
  const { isEnabled: isDraftMode } = await draftMode()

  const relationTo = (props.relationTo || 'posts') as CardRelationTo
  const limit =
    relationTo === 'watch'
      ? Math.max(limitFromProps ?? 100, 100)
      : relationTo === 'posts'
        ? Math.max(limitFromProps ?? 100, 100)
        : limitFromProps ?? 24

  let docs: (Post | Project)[] = []

  if (populateBy === 'collection') {
    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    try {
      const fetchedDocs = await withPayloadClientRetry<ArchiveFetchedDocs>((payload) => {
        return (payload as any).find({
          collection: relationTo,
          draft: isDraftMode,
          depth: 2,
          limit,
          overrideAccess: isDraftMode ? true : false,
          sort: '-publishedAt',
          ...(flattenedCategories && flattenedCategories.length > 0
            ? {
                where: {
                  categories: {
                    in: flattenedCategories,
                  },
                },
              }
            : {}),
        }) as Promise<ArchiveFetchedDocs>
      })

      docs = fetchedDocs.docs as (Post | Project)[]
    } catch (error) {
      if (isMongoConnectionRetryableError(error)) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[ArchiveBlock] MongoDB unavailable — archive renders empty until the DB is reachable.',
          )
        }
      } else {
        throw error
      }
    }
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedDocs = selectedDocs.map((doc) => {
        if (typeof doc.value === 'object') return doc.value
      }) as (Post | Project)[]

      docs = filteredSelectedDocs
    }
  }

  // Always sort docs by publishedAt descending (newest first / far left)
  docs.sort((a, b) => {
    const dateA = a?.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const dateB = b?.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return dateB - dateA
  })

  const categoryMap = new Map<string, { id: string; slug?: string | null; title: string }>()

  for (const doc of docs) {
    if (!doc?.categories || !Array.isArray(doc.categories)) continue

    for (const category of doc.categories) {
      if (category && typeof category === 'object') {
        const id = String(category.id)
        if (!categoryMap.has(id)) {
          categoryMap.set(id, {
            id,
            slug: category.slug ?? null,
            title: category.title ?? 'Untitled category',
          })
        }
      }
    }
  }

  const filterCategories = Array.from(categoryMap.values())

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      {filterCategories.length > 0 ? (
        <CategoryFilter categories={filterCategories} docs={docs} relationTo={relationTo} />
      ) : (
        <CollectionArchive docs={docs} relationTo={relationTo} />
      )}
    </div>
  )
}
