'use client'

import React, { useState } from 'react'
import { cn } from '@/utilities/ui'
import { Card, CardPostData } from '@/components/Card'

type Category = {
  id: string
  title: string
  slug?: string | null
}

type Props = {
  categories: Category[]
  posts: CardPostData[]
}

export const CategoryFilter: React.FC<Props> = ({ categories, posts }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredPosts =
    activeCategory === null
      ? posts
      : posts.filter((post) => {
          if (!post.categories || !Array.isArray(post.categories)) return false
          return post.categories.some((cat) => {
            if (typeof cat === 'object' && cat !== null) {
              return cat.id === activeCategory
            }
            return cat === activeCategory
          })
        })

  return (
    <>
      <div className="container mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              'px-4 py-1.5 rounded text-sm font-medium transition-colors border',
              activeCategory === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary',
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                setActiveCategory(activeCategory === category.id ? null : category.id)
              }
              className={cn(
                'px-4 py-1.5 rounded text-sm font-medium transition-colors border',
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary',
              )}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => {
              if (typeof post === 'object' && post !== null) {
                return (
                  <div className="col-span-4" key={index}>
                    <Card className="h-full" doc={post} relationTo="posts" showCategories />
                  </div>
                )
              }
              return null
            })
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No posts found for this category.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
