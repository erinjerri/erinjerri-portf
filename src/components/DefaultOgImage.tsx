import Image from 'next/image'

import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_WIDTH,
} from '@/constants/defaultOgImage'
import { getServerSideURL } from '@/utilities/getURL'

function defaultOgSrc(): string {
  if (DEFAULT_OG_IMAGE_PATH.startsWith('http://') || DEFAULT_OG_IMAGE_PATH.startsWith('https://')) {
    return DEFAULT_OG_IMAGE_PATH
  }
  return `${getServerSideURL()}${DEFAULT_OG_IMAGE_PATH.startsWith('/') ? '' : '/'}${DEFAULT_OG_IMAGE_PATH}`
}

type DefaultOgImageProps = {
  /** Override URL; defaults to the configured default OG / book headshot asset. */
  image?: string
}

/**
 * Default share / book headshot. Use where this asset should render in-page.
 * OG `<meta>` URLs are configured separately in `mergeOpenGraph` / `generateMeta`.
 */
export function DefaultOgImage({ image: imageProp }: DefaultOgImageProps) {
  const image = imageProp ?? defaultOgSrc()

  return (
    <Image
      src={image}
      alt="Erin Jerri book"
      width={DEFAULT_OG_IMAGE_WIDTH}
      height={DEFAULT_OG_IMAGE_HEIGHT}
      quality={100}
      sizes="(max-width: 768px) 100vw, 50vw"
      priority
    />
  )
}
