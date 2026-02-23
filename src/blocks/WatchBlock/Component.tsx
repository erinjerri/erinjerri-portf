import React from 'react'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'

type Props = {
  categories?: unknown[]
  id?: string
  introContent?: unknown
  limit?: number
}

export const WatchBlockComponent: React.FC<Props> = async (props) => {
  const { categories, id, introContent, limit } = props

  return (
    <ArchiveBlock
      categories={categories as any}
      id={id}
      introContent={introContent as any}
      limit={limit ?? 10}
      populateBy="collection"
      relationTo="watch"
    />
  )
}
