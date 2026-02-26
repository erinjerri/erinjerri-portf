'use client'

import React from 'react'

import type { Media as MediaDoc } from '@/payload-types'

import { Media as MediaComponent } from '@/components/Media'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getVideoEmbedUrl, isDirectVideoUrl } from '@/utilities/getVideoEmbedUrl'

type Props = {
  video?: MediaDoc | null
  videoUrl?: string | null
  videoSource?: 'upload' | 'url' | null
  heroImage?: MediaDoc | null
}

/**
 * Large, playable video hero for watch/talks pages.
 * Similar to designcode.io - full-width video at top with native controls.
 * Supports: uploaded video, external URLs (YouTube or any page with a video).
 * Falls back to heroImage when no video is set.
 */
export const WatchVideoHero: React.FC<Props> = ({
  video,
  videoUrl,
  videoSource,
  heroImage,
}) => {
  const hasUploadedVideo =
    video && typeof video === 'object' && video.mimeType?.includes('video')
  const hasExternalUrl = videoSource === 'url' && videoUrl && videoUrl.trim().length > 0
  const embedUrl = hasExternalUrl ? getVideoEmbedUrl(videoUrl!) : null
  const isDirectVideo = hasExternalUrl && isDirectVideoUrl(videoUrl!)
  const isExternalLink = hasExternalUrl && !embedUrl && !isDirectVideo
  const hasHeroImage = heroImage && typeof heroImage === 'object'

  if (!hasUploadedVideo && !embedUrl && !isDirectVideo && !isExternalLink && !hasHeroImage)
    return null

  // External URL: iframe embed (YouTube, Vimeo - platforms that allow embedding)
  if (embedUrl) {
    const displayUrl = videoUrl!.trim()
    const hostname = (() => {
      try {
        return new URL(displayUrl).hostname.replace(/^www\./, '')
      } catch {
        return 'external'
      }
    })()
    return (
      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-black px-4 md:px-6 lg:px-8">
        <div className="aspect-video w-full max-w-[96rem] mx-auto">
          <iframe
            className="h-full w-full"
            src={embedUrl}
            title="Embedded video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <a
          href={displayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Watch on {hostname} ↗
        </a>
      </div>
    )
  }

  // External link: site blocks iframe embedding (InfoQ, etc.) - show link card with hero image + overlay
  if (isExternalLink) {
    const displayUrl = videoUrl!.trim()
    const hostname = (() => {
      try {
        return new URL(displayUrl).hostname.replace(/^www\./, '')
      } catch {
        return 'external'
      }
    })()
    return (
      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-black px-4 md:px-6 lg:px-8">
        <a
          href={displayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex aspect-video w-full max-w-[96rem] mx-auto flex-col items-center justify-center gap-4 overflow-hidden rounded-lg border border-border transition-colors hover:border-primary/50"
        >
          {/* Hero image at 20% opacity as background */}
          {hasHeroImage ? (
            <div className="absolute inset-0 opacity-20">
              <MediaComponent
                fill
                imgClassName="object-cover"
                priority
                resource={heroImage!}
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-muted/50" aria-hidden />
          )}
          {/* Overlay text */}
          <span className="relative z-10 text-4xl" aria-hidden>
            ▶
          </span>
          <span className="relative z-10 text-lg font-medium">Watch on {hostname}</span>
          <span className="relative z-10 text-sm text-muted-foreground">Opens in new tab</span>
        </a>
      </div>
    )
  }

  // Direct video URL (.mp4, .webm, etc.)
  if (isDirectVideo) {
    const src = videoUrl!.trim()
    return (
      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-black px-4 md:px-6 lg:px-8">
        <div className="aspect-video w-full max-w-[96rem] mx-auto">
          <video className="h-full w-full object-contain" controls playsInline preload="metadata">
            <source src={src} />
            Your browser does not support the video element.
          </video>
        </div>
      </div>
    )
  }

  if (hasUploadedVideo) {
    const { filename } = video!
    if (!filename) return null

    const src = getMediaUrl(`/media/${filename}`)

    return (
      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-black px-4 md:px-6 lg:px-8">
        <div className="aspect-video w-full max-w-[96rem] mx-auto">
          <video
            className="h-full w-full object-contain"
            controls
            playsInline
            preload="metadata"
            poster={
              video?.sizes?.thumbnail?.url
                ? getMediaUrl(video.sizes.thumbnail.url, video?.updatedAt)
                : undefined
            }
          >
            <source src={src} type={video!.mimeType || 'video/mp4'} />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    )
  }

  return (
    <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-black aspect-video">
      <MediaComponent
        fill
        imgClassName="object-cover"
        priority
        resource={heroImage!}
      />
    </div>
  )
}
