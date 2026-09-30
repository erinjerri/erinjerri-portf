'use client'

import React, { useState, useRef } from 'react'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import type { WatchTalks as WatchTalksProps } from '@/payload-types'
import type { Media as MediaDoc } from '@/payload-types'

type Talk = {
  title?: string | null
  subtitle?: string | null
  videoSource?: 'upload' | 'youtube' | 'url' | null
  video?: number | string | MediaDoc | null
  videoUrl?: string | null
  thumbnail?: number | string | MediaDoc | null
  id?: string | null
}

type Props = Omit<WatchTalksProps, 'blockType'> & {
  title?: string | null
  description?: any
  talks?: Talk[] | null
  videoHeight?: 'small' | 'medium' | 'large' | null
  showThumbnails?: boolean | null
  allowYouTubeEmbed?: boolean | null
  className?: string
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
    }
  } catch {
    return null
  }

  return null
}

const getHeightClass = (variant?: string | null): string => {
  switch (variant) {
    case 'small':
      return 'h-[40vh]'
    case 'large':
      return 'h-[80vh]'
    default:
      return 'h-[60vh]'
  }
}

export const WatchTalksBlock: React.FC<Props> = (props) => {
  const {
    title,
    description,
    talks = [],
    videoHeight = 'medium',
    showThumbnails = true,
    allowYouTubeEmbed = true,
    className,
  } = props

  const [selectedTalkIndex, setSelectedTalkIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  if (!talks || talks.length === 0) {
    return null
  }

  const selectedTalk = talks[selectedTalkIndex]

  const thumbnailURL =
    selectedTalk?.thumbnail && typeof selectedTalk.thumbnail === 'object' && selectedTalk.thumbnail?.url
      ? getMediaUrl(selectedTalk.thumbnail.url, selectedTalk.thumbnail.updatedAt)
      : undefined

  const youtubeEmbedURL =
    selectedTalk?.videoUrl && selectedTalk?.videoSource === 'youtube'
      ? getYouTubeEmbedUrl(selectedTalk.videoUrl)
      : null

  const shouldRenderYouTube =
    allowYouTubeEmbed && selectedTalk?.videoSource === 'youtube' && youtubeEmbedURL

  const shouldRenderDirectUrl =
    selectedTalk?.videoSource === 'url' && selectedTalk?.videoUrl && !shouldRenderYouTube

  const shouldRenderUploadedVideo =
    selectedTalk?.videoSource === 'upload' &&
    selectedTalk?.video &&
    typeof selectedTalk.video === 'object' &&
    selectedTalk.video?.filename

  return (
    <div className={cn('container py-12 md:py-16', className)}>
      {title && <h2 className="mb-2 text-3xl font-bold md:text-4xl">{title}</h2>}

      {description && (
        <div className="mb-8 max-w-2xl text-lg text-muted-foreground">
          <RichText data={description} enableGutter={false} />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <div
            className={cn(
              'relative w-full overflow-hidden rounded-lg bg-black',
              getHeightClass(videoHeight),
            )}
          >
            {/* YouTube Embed */}
            {shouldRenderYouTube && youtubeEmbedURL && (
              <iframe
                ref={iframeRef}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
                src={youtubeEmbedURL}
                title={selectedTalk?.title || 'Embedded video'}
              />
            )}

            {/* Direct URL Video */}
            {shouldRenderDirectUrl && selectedTalk?.videoUrl && (
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                controls
                poster={thumbnailURL}
              >
                <source src={selectedTalk.videoUrl} />
                Your browser does not support the video tag.
              </video>
            )}

            {/* Uploaded Video */}
            {shouldRenderUploadedVideo &&
              selectedTalk?.video &&
              typeof selectedTalk.video === 'object' && (
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  controls
                  poster={thumbnailURL}
                >
                  <source
                    src={getMediaUrl(`/media/${selectedTalk.video.filename}`)}
                    type={selectedTalk.video.mimeType || 'video/mp4'}
                  />
                  Your browser does not support the video tag.
                </video>
              )}
          </div>

          {/* Video Title and Subtitle */}
          {selectedTalk && (
            <div className="mt-6">
              <h3 className="text-2xl font-bold">{selectedTalk.title}</h3>
              {selectedTalk.subtitle && (
                <p className="mt-2 text-sm text-muted-foreground">{selectedTalk.subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Talk Selector */}
        <div className="lg:col-span-1">
          <div className="space-y-3">
            <h3 className="font-semibold">Select a Talk</h3>
            <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
              {talks.map((talk, index) => (
                <button
                  key={talk.id || index}
                  onClick={() => setSelectedTalkIndex(index)}
                  className={cn(
                    'group relative overflow-hidden rounded-lg p-3 text-left transition-all duration-200',
                    selectedTalkIndex === index
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
                  )}
                >
                  {/* Thumbnail */}
                  {showThumbnails &&
                    talk?.thumbnail &&
                    typeof talk.thumbnail === 'object' &&
                    talk.thumbnail?.url && (
                      <div className="mb-2 overflow-hidden rounded bg-black/20">
                        <img
                          alt={talk.title || 'Talk thumbnail'}
                          className="aspect-video w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          src={getMediaUrl(talk.thumbnail.url, talk.thumbnail.updatedAt)}
                        />
                      </div>
                    )}

                  {/* Text Content */}
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight">{talk.title}</p>
                    {talk.subtitle && (
                      <p className="line-clamp-2 text-xs opacity-75">{talk.subtitle}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
