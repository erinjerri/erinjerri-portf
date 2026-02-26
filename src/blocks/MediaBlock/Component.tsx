import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { getMediaUrl } from '@/utilities/getMediaUrl'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'
import type { Media as MediaDoc } from '@/payload-types'

import { Media as MediaComponent } from '../../components/Media'

type Props = Omit<MediaBlockProps, 'media'> & {
  audio?: number | string | MediaDoc | null
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  image?: number | string | MediaDoc | null
  imgClassName?: string
  media?: number | string | MediaDoc | null
  mediaType?: 'audio' | 'image' | 'video'
  staticImage?: StaticImageData
  thumbnail?: number | string | MediaDoc | null
  video?: number | string | MediaDoc | null
  videoSource?: 'upload' | 'url' | null
  videoUrl?: string | null
  displayStyle?: 'default' | 'fullWidthTransition' | null
  disableInnerContainer?: boolean
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.replace(/^www\./, '')

    if (hostname === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      const watchId = parsed.searchParams.get('v')
      if (watchId) return `https://www.youtube.com/embed/${watchId}`

      const pathParts = parsed.pathname.split('/').filter(Boolean)
      const embedIndex = pathParts.findIndex((part) => part === 'embed')
      if (embedIndex >= 0 && pathParts[embedIndex + 1]) {
        return `https://www.youtube.com/embed/${pathParts[embedIndex + 1]}`
      }

      const shortsIndex = pathParts.findIndex((part) => part === 'shorts')
      if (shortsIndex >= 0 && pathParts[shortsIndex + 1]) {
        return `https://www.youtube.com/embed/${pathParts[shortsIndex + 1]}`
      }
    }
  } catch {
    return null
  }

  return null
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    image,
    media,
    mediaType,
    staticImage,
    audio,
    thumbnail,
    video,
    videoSource,
    videoUrl,
    displayStyle,
    disableInnerContainer,
  } = props

  const isFullWidthTransition = displayStyle === 'fullWidthTransition'

  const selectedMedia = (() => {
    if (mediaType === 'video') return videoSource === 'upload' ? video || media : null
    if (mediaType === 'audio') return audio || media
    if (mediaType === 'image') return image || media
    return media || image || video || audio
  })()

  const isAudio = typeof selectedMedia === 'object' && selectedMedia?.mimeType?.includes('audio')
  const isVideo = mediaType === 'video'

  let caption
  if (selectedMedia && typeof selectedMedia === 'object') caption = selectedMedia.caption

  const thumbnailFallback =
    thumbnail && typeof thumbnail === 'object' && selectedMedia && typeof selectedMedia === 'object' && selectedMedia.filename
      ? `/media/${encodeURI(selectedMedia.filename.replace(/^\/+/, ''))}`
      : null
  const thumbnailURL =
    thumbnail && typeof thumbnail === 'object'
      ? getMediaUrl(thumbnail.url ?? null, thumbnail.updatedAt, thumbnailFallback)
      : undefined

  const youtubeEmbedURL = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null
  const shouldRenderVideoURL = isVideo && videoSource === 'url' && Boolean(videoUrl)

  return (
    <div
      className={cn(
        {
          'relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden': isFullWidthTransition,
        },
        '',
        {
          container: enableGutter && !isFullWidthTransition,
        },
        className,
      )}
    >
      {isAudio && typeof selectedMedia === 'object' && selectedMedia?.filename && (
        <audio className="w-full" controls preload="metadata">
          <source
            src={getMediaUrl(`/media/${selectedMedia.filename}`)}
            type={selectedMedia.mimeType || undefined}
          />
          Your browser does not support the audio element.
        </audio>
      )}
      {shouldRenderVideoURL && youtubeEmbedURL && (
        <div
          className={cn('relative w-full overflow-hidden pt-[56.25%]', {
            'rounded-[0.8rem] border border-border': !isFullWidthTransition,
          })}
        >
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute left-0 top-0 h-full w-full"
            src={youtubeEmbedURL}
            title="Embedded video"
          />
        </div>
      )}
      {shouldRenderVideoURL && !youtubeEmbedURL && videoUrl && (
        <video
          className={cn('h-auto w-full', {
            'rounded-[0.8rem] border border-border': !isFullWidthTransition,
          })}
          controls
          poster={thumbnailURL}
        >
          <source src={videoUrl} />
          Your browser does not support the video tag.
        </video>
      )}
      {!shouldRenderVideoURL &&
        isVideo &&
        typeof selectedMedia === 'object' &&
        selectedMedia?.filename &&
        selectedMedia?.mimeType?.includes('video') && (
          <video
            className={cn('h-auto w-full', {
              'rounded-[0.8rem] border border-border': !isFullWidthTransition,
            })}
            controls
            poster={thumbnailURL}
          >
            <source
              src={getMediaUrl(`/media/${selectedMedia.filename}`)}
              type={selectedMedia.mimeType || undefined}
            />
            Your browser does not support the video tag.
          </video>
        )}
      {!isAudio &&
        !isVideo &&
        !shouldRenderVideoURL &&
        (selectedMedia || staticImage) && (
        <MediaComponent
          imgClassName={cn(
            {
              'border border-border rounded-[0.8rem]': !isFullWidthTransition,
              'w-full object-cover': isFullWidthTransition,
            },
            imgClassName,
          )}
          resource={selectedMedia}
          src={staticImage}
        />
        )}
      {caption && (
        <div
          className={cn(
            'mt-6',
            {
              container: !disableInnerContainer,
            },
            captionClassName,
          )}
        >
          <RichText data={caption} enableGutter={false} />
        </div>
      )}
    </div>
  )
}
