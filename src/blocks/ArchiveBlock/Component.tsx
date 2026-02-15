import type { ArchiveBlock as ArchiveBlockProps, Post, Project } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'
import type { CardRelationTo } from '@/components/Card'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { categories, id, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  const relationTo = (props.relationTo || 'posts') as CardRelationTo

  let docs: (Post | Project)[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedDocs = await payload.find({
      collection: relationTo,
      depth: 1,
      limit,
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
    })

    docs = fetchedDocs.docs as (Post | Project)[]
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

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive docs={docs} relationTo={relationTo} />
    </div>
  )
}
