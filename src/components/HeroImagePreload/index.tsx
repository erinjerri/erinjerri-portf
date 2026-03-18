import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getServerSideURL } from '@/utilities/getURL'

type MediaResource = {
  url?: string | null
  filename?: string | null
  updatedAt?: string | null
  mimeType?: string | null
}

type HeroWithMedia = {
  type?: string | null
  media?: MediaResource | number | string | null
}

/**
 * Renders a preload link for the hero image to improve LCP.
 * Place early in the page so the browser starts fetching before the hero mounts.
 */
export const HeroImagePreload: React.FC<{ hero: HeroWithMedia | null }> = ({ hero }) => {
  if (!hero?.media || typeof hero.media !== 'object') return null
  const media = hero.media as MediaResource
  if (media.mimeType && !media.mimeType.startsWith('image/')) return null

  const mediaUrl = media.url ?? (media.filename ? `/media/${media.filename}` : null)
  if (!mediaUrl) return null

  let fullUrl = getMediaUrl(mediaUrl, media.updatedAt)
  if (!fullUrl) return null
  // Ensure absolute URL for next/image (relative paths need base)
  if (fullUrl.startsWith('/')) {
    fullUrl = `${getServerSideURL()}${fullUrl}`
  }

  // Next.js Image requests the optimized URL; preload that for best LCP
  const base = getServerSideURL()
  const optimizedUrl = `${base}/_next/image?url=${encodeURIComponent(fullUrl)}&w=1920&q=90`

  return (
    <link
      rel="preload"
      as="image"
      href={optimizedUrl}
      fetchPriority="high"
    />
  )
}
