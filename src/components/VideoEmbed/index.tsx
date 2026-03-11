import React from 'react'

import type { Media as MediaDoc } from '@/payload-types'

import { Media as MediaComponent } from '@/components/Media'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getVideoEmbedUrl, isDirectVideoUrl } from '@/utilities/getVideoEmbedUrl'

type Props = {
  className?: string
  title?: string
  video?: MediaDoc | null
  videoSource?: 'upload' | 'url' | null
  videoUrl?: string | null
}

export function VideoEmbed({ className, title = 'Embedded video', video, videoSource, videoUrl }: Props) {
  const hasUploadedVideo = video && typeof video === 'object' && video.mimeType?.includes('video')
  const hasExternalUrl = videoSource === 'url' && typeof videoUrl === 'string' && videoUrl.trim().length > 0
  const normalizedVideoUrl = hasExternalUrl ? videoUrl.trim() : null
  const embedUrl = normalizedVideoUrl ? getVideoEmbedUrl(normalizedVideoUrl) : null
  const directVideo = normalizedVideoUrl ? isDirectVideoUrl(normalizedVideoUrl) : false

  if (embedUrl) {
    return (
      <div className={className}>
        <div className="relative w-full overflow-hidden rounded-[0.8rem] border border-border pt-[56.25%]">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute left-0 top-0 h-full w-full"
            src={embedUrl}
            title={title}
          />
        </div>
      </div>
    )
  }

  if (directVideo && normalizedVideoUrl) {
    return (
      <div className={className}>
        <video className="h-auto w-full rounded-[0.8rem] border border-border" controls playsInline preload="metadata">
          <source src={normalizedVideoUrl} />
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  if (hasUploadedVideo && video?.filename) {
    const poster = video?.sizes?.thumbnail?.url
      ? getMediaUrl(video.sizes.thumbnail.url, video.updatedAt)
      : undefined

    return (
      <div className={className}>
        <video
          className="h-auto w-full rounded-[0.8rem] border border-border"
          controls
          playsInline
          poster={poster}
          preload="metadata"
        >
          <source src={getMediaUrl(`/media/${video.filename}`)} type={video.mimeType || undefined} />
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  if (normalizedVideoUrl) {
    const hostname = (() => {
      try {
        return new URL(normalizedVideoUrl).hostname.replace(/^www\./, '')
      } catch {
        return 'external'
      }
    })()

    return (
      <a
        className={`block rounded-[0.8rem] border border-border p-5 transition-colors hover:border-primary/50 ${className ?? ''}`}
        href={normalizedVideoUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="mb-2 text-sm text-muted-foreground">Open externally</div>
        <div className="font-medium text-foreground">Watch on {hostname}</div>
      </a>
    )
  }

  return null
}
