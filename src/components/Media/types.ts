import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@/payload-types'

export interface Props {
  alt?: string
  className?: string
  fill?: boolean // for NextImage only
  htmlElement?: ElementType | null
  pictureClassName?: string
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  loading?: 'lazy' | 'eager' // for NextImage only
  priority?: boolean // for NextImage only
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  quality?: number // Next.js Image quality (1-100). Default 85 for content, 75-80 for heroes.
  resource?: MediaType | string | number | null // for Payload media
  size?: string // Next.js sizes attribute, e.g. "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
  src?: StaticImageData | string // for static media
  videoClassName?: string
}
