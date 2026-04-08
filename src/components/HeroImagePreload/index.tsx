import { getMediaUrl } from '@/utilities/getMediaUrl'
import React from 'react'

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

  // Preload the same source URL the hero will render from and let next/image choose the
  // responsive candidate. A fixed 1920px preload was oversized for mobile and competed with LCP.
  const fullUrl = getMediaUrl(mediaUrl, media.updatedAt)
  if (!fullUrl) return null

  return (
    <link
      rel="preload"
      as="image"
      href={fullUrl}
      fetchPriority="high"
    />
  )
}
