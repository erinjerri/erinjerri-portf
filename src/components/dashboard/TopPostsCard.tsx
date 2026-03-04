import React from 'react'
import Link from 'next/link'

import type { Post } from '@/payload-types'

/**
 * Top posts card — shows recent or most-viewed posts.
 * Sorted by publishedAt; add a views field to sort by engagement.
 */
export function TopPostsCard({ posts }: { posts: Post[] }) {
  return (
    <div className="card" style={{ padding: 'var(--base)', background: 'var(--theme-elevation-0)' }}>
      <h3 style={{ margin: '0 0 var(--base)', color: 'var(--theme-text)', fontSize: '1rem' }}>
        Top Posts
      </h3>
      {posts.length === 0 ? (
        <p style={{ color: 'var(--theme-elevation-500)', margin: 0, fontSize: '0.875rem' }}>
          No published posts yet.
        </p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--theme-text)' }}>
          {posts.slice(0, 5).map((post) => (
            <li key={post.id} style={{ marginBottom: '0.25rem' }}>
              <Link
                href={`/admin/collections/posts/${post.id}`}
                style={{ color: 'var(--theme-success-500)' }}
              >
                {typeof post.title === 'string' ? post.title : 'Untitled'}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
