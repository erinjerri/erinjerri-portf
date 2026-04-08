'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import NextImage from 'next/image'
import React, { useEffect, useState } from 'react'

import type { Props as MediaProps } from '../types'

import { cssVariables } from '@/cssVariables'
import { getMediaUrl } from '@/utilities/getMediaUrl'

const { breakpoints } = cssVariables

// A base64 encoded image to use as a placeholder while the image is loading
const placeholderBlur =
  'data:image/png;base64,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'

const SOURCE_OVERRIDES: Record<
  string,
  { src: string; width: number; height: number }
> = {
  'Erin-AVP-1920x1080.png': {
    src: '/media/erin-AVP-headshot-1920x1080-hq.jpg',
    width: 1920,
    height: 1080,
  },
  'erin-AVP-headshot-95op.png': {
    src: '/media/erin-AVP-headshot-1920x1080-hq.jpg',
    width: 1920,
    height: 1080,
  },
}

/**
 * ImageMedia
 *
 * This component passes a **relative** `src` (e.g. `/media/...`) to Next.js Image.
 * The `getMediaUrl` utility constructs the full URL by prepending the base URL from env vars
 * (NEXT_PUBLIC_SERVER_URL). Next.js then optimizes this using `remotePatterns` configured
 * in next.config.js — no custom `loader` needed.
 *
 * Flow:
 *   1. Resource URL from Payload: `/media/image-123.jpg`
 *   2. getMediaUrl() adds base URL: `https://yourdomain.com/media/image-123.jpg`
 *   3. Next.js Image optimizes via remotePatterns: `/_next/image?url=...&w=1200&q=75`
 *
 * If your storage/plugin returns **external CDN URLs** (e.g. `https://cdn.example.com/...`),
 * choose ONE of the following:
 *   A) Allow the remote host in next.config.js:
 *      images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com' }] }
 *   B) Provide a **custom loader** for CDN-specific transforms:
 *      const imageLoader: ImageLoader = ({ src, width, quality }) =>
 *        `https://cdn.example.com${src}?w=${width}&q=${quality ?? 75}`
 *      <Image loader={imageLoader} src="/media/hero.jpg" width={1200} height={600} alt="" />
 *   C) Skip optimization:
 *      <Image unoptimized src="https://cdn.example.com/hero.jpg" width={1200} height={600} alt="" />
 *
 * TL;DR: Template uses relative URLs + getMediaUrl() to construct full URLs, then relies on
 * remotePatterns for optimization. Only add `loader` if using external CDNs with custom transforms.
 */

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const [imageError, setImageError] = useState(false)
  const {
    alt: altFromProps,
    fill,
    pictureClassName,
    imgClassName,
    priority,
    quality: qualityFromProps,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    loading: loadingFromProps,
    unoptimized: unoptimizedFromProps,
  } = props

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, filename, height: fullHeight, url, width: fullWidth } = resource

    width = fullWidth ?? 1200
    height = fullHeight ?? 630
    alt = altFromResource || ''

    const cacheTag = resource.updatedAt
    // Use Payload-provided URL when valid; fallback to /media/filename. encodeURIComponent handles @, spaces, etc.
    const rawFilename = typeof filename === 'string' ? filename.replace(/^\/+/, '') : null
    const mediaUrl =
      typeof url === 'string' && url.trim()
        ? url
        : rawFilename
          ? `/media/${encodeURIComponent(rawFilename)}`
          : null
    const override = filename ? SOURCE_OVERRIDES[filename] : undefined
    if (override) {
      src = override.src
      width = override.width
      height = override.height
    } else {
      src = getMediaUrl(mediaUrl, cacheTag)
    }
  }

  const srcKey = typeof src === 'string' ? src : ''
  useEffect(() => setImageError(false), [srcKey])

  // Skip render when resource is ID-only (unpopulated), src is invalid, or image failed to load (404/deleted)
  if (!src || typeof src !== 'string' || imageError) {
    return null
  }

  // Preserve the original for PNG sources that visibly degrade through the optimizer.
  // Other images should stay optimized so mobile receives responsive srcset candidates.
  const isPngSource = typeof src === 'string' && /\.png($|\?)/i.test(src)
  const disableOptimization = Boolean(unoptimizedFromProps) || isPngSource

  const loading = loadingFromProps || (!priority ? 'lazy' : undefined)
  // Quality: must match next.config images.qualities [60,65,70,75,80,85,90,100]
  const ALLOWED_QUALITIES = [60, 65, 70, 75, 80, 85, 90, 100] as const
  const rawQuality =
    qualityFromProps ?? (fill && priority ? 100 : priority ? 100 : 85)
  const quality = ALLOWED_QUALITIES.includes(rawQuality as (typeof ALLOWED_QUALITIES)[number])
    ? rawQuality
    : 85

  // Use Payload focal point for object-position when using fill (hero images).
  // Set focalX/focalY in Payload admin (Media → edit image → focal point) to keep faces visible on mobile.
  const focalPoint =
    resource && typeof resource === 'object' && (resource.focalX != null || resource.focalY != null)
      ? `${resource.focalX ?? 50}% ${resource.focalY ?? 50}%`
      : undefined

  // NOTE: sizes tells the browser display width so it picks the right srcset. Larger values = sharper on retina.
  // Grid (3-col): 640px ensures ~2x for 33vw on 1440px. Full-width hero: 100vw.
  const sizes = sizeFromProps
    ? sizeFromProps
    : fill
      ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px'
      : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px'

  return (
    <picture className={cn(pictureClassName)}>
      <NextImage
        alt={alt || ''}
        className={cn(imgClassName)}
        fill={fill}
        height={!fill ? height : undefined}
        onError={() => setImageError(true)}
        placeholder="blur"
        blurDataURL={placeholderBlur}
        priority={priority}
        fetchPriority={priority ? 'high' : undefined}
        quality={quality}
        unoptimized={disableOptimization}
        loading={loading}
        sizes={sizes}
        src={src}
        style={fill && focalPoint ? { objectPosition: focalPoint } : undefined}
        width={!fill ? width : undefined}
      />
    </picture>
  )
}
