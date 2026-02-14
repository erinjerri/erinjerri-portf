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
  video?: number | string | MediaDoc | null
  disableInnerContainer?: boolean
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
    video,
    disableInnerContainer,
  } = props

  const selectedMedia = (() => {
    if (mediaType === 'video') return video || media
    if (mediaType === 'audio') return audio || media
    if (mediaType === 'image') return image || media
    return media || image || video || audio
  })()

  const isAudio = typeof selectedMedia === 'object' && selectedMedia?.mimeType?.includes('audio')

  let caption
  if (selectedMedia && typeof selectedMedia === 'object') caption = selectedMedia.caption

  return (
    <div
      className={cn(
        '',
        {
          container: enableGutter,
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
      {!isAudio && (selectedMedia || staticImage) && (
        <MediaComponent
          imgClassName={cn('border border-border rounded-[0.8rem]', imgClassName)}
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
