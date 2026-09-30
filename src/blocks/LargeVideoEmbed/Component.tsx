'use client'

import React, { useRef, useEffect } from 'react'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import type { LargeVideoEmbed as LargeVideoEmbedProps } from '@/payload-types'
import type { Media as MediaDoc } from '@/payload-types'

type Props = Omit<LargeVideoEmbedProps, 'blockType'> & {
  video?: number | string | MediaDoc | null
  thumbnail?: number | string | MediaDoc | null
  videoUrl?: string | null
  videoSource?: 'upload' | 'url' | null
  overlayText?: any
  overlayOpacity?: number | null
  heightVariant?: 'standard' | 'large' | 'extraLarge' | null
  autoplay?: boolean | null
  loop?: boolean | null
  muted?: boolean | null
  className?: string
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.replace(/^www\./, '')

    if (hostname === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      const watchId = parsed.searchParams.get('v')
      if (watchId) return `https://www.youtube.com/embed/${watchId}?autoplay=1`

      const pathParts = parsed.pathname.split('/').filter(Boolean)
      const embedIndex = pathParts.findIndex((part) => part === 'embed')
      if (embedIndex >= 0 && pathParts[embedIndex + 1]) {
        return `https://www.youtube.com/embed/${pathParts[embedIndex + 1]}?autoplay=1`
      }

      const shortsIndex = pathParts.findIndex((part) => part === 'shorts')
      if (shortsIndex >= 0 && pathParts[shortsIndex + 1]) {
        return `https://www.youtube.com/embed/${pathParts[shortsIndex + 1]}?autoplay=1`
      }
    }

    if (hostname === 'vimeo.com') {
      const pathParts = parsed.pathname.split('/').filter(Boolean)
      const videoId = pathParts[pathParts.length - 1]
      if (videoId && /^\d+$/.test(videoId)) {
        return `https://player.vimeo.com/video/${videoId}?autoplay=1`
      }
    }
  } catch {
    return null
  }

  return null
}

const getHeightClass = (variant?: string | null): string => {
  switch (variant) {
    case 'large':
      return 'h-[70vh] md:h-[70vh]'
    case 'extraLarge':
      return 'h-[80vh] md:h-[80vh]'
    default:
      return 'h-[60vh] md:h-[60vh]'
  }
}

export const LargeVideoEmbedBlock: React.FC<Props> = (props) => {
  const {
    video,
    thumbnail,
    videoUrl,
    videoSource,
    overlayText,
    overlayOpacity,
    heightVariant,
    autoplay,
    loop,
    muted,
    className,
  } = props

  const resolvedAutoplay = autoplay ?? true
  const resolvedLoop = loop ?? true
  const resolvedMuted = muted ?? true
  const resolvedOpacityValue = overlayOpacity ?? 40

  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const thumbnailURL =
    thumbnail && typeof thumbnail === 'object' && thumbnail.url
      ? getMediaUrl(thumbnail.url, thumbnail.updatedAt)
      : undefined

  const shouldRenderVideoUrl = videoSource === 'url' && videoUrl
  const youtubeEmbedURL = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null
  const isYouTubeOrVimeo = Boolean(youtubeEmbedURL)

  const shouldRenderUploadedVideo =
    videoSource === 'upload' && video && typeof video === 'object' && video?.filename

  useEffect(() => {
    if (videoRef.current && resolvedAutoplay && !isYouTubeOrVimeo) {
      videoRef.current.play().catch(() => {
        // Autoplay might fail if not muted or browser doesn't allow it
        // The component will still display with controls for manual play
      })
    }
  }, [resolvedAutoplay, isYouTubeOrVimeo])

  const opacity = Math.max(0, Math.min(100, resolvedOpacityValue)) / 100
  const hasOverlay = overlayText || resolvedOpacityValue > 0

  return (
    <div
      className={cn(
        'relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden',
        getHeightClass(heightVariant),
        className,
      )}
    >
      {/* YouTube/Vimeo Embed */}
      {isYouTubeOrVimeo && youtubeEmbedURL && (
        <div className="absolute inset-0">
          <iframe
            ref={iframeRef}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
            src={youtubeEmbedURL}
            title="Embedded video"
          />
        </div>
      )}

      {/* Uploaded Video */}
      {shouldRenderUploadedVideo && (
        <video
          ref={videoRef}
          autoPlay={resolvedAutoplay}
          className="h-full w-full object-cover"
          loop={resolvedLoop}
          muted={resolvedMuted}
          poster={thumbnailURL}
        >
          <source
            src={getMediaUrl(`/media/${video.filename}`)}
            type={video.mimeType || 'video/mp4'}
          />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Direct Video URL */}
      {shouldRenderVideoUrl && !isYouTubeOrVimeo && videoUrl && (
        <video
          ref={videoRef}
          autoPlay={resolvedAutoplay}
          className="h-full w-full object-cover"
          loop={resolvedLoop}
          muted={resolvedMuted}
          poster={thumbnailURL}
        >
          <source src={videoUrl} />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Overlay */}
      {hasOverlay && (
        <div className="absolute inset-0 bg-black" style={{ opacity }} />
      )}

      {/* Overlay Text */}
      {overlayText && (
        <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center px-6 py-8 text-center">
          <div className="mx-auto max-w-2xl text-white [&_.prose]:text-white [&_.prose_*]:text-white [&_a]:text-white [&_strong]:font-bold">
            <RichText data={overlayText} enableGutter={false} />
          </div>
        </div>
      )}
    </div>
  )
}
