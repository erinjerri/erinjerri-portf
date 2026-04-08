import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_WIDTH,
} from '@/constants/defaultOgImage'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url =
    DEFAULT_OG_IMAGE_PATH.startsWith('http://') || DEFAULT_OG_IMAGE_PATH.startsWith('https://')
      ? DEFAULT_OG_IMAGE_PATH
      : serverUrl + DEFAULT_OG_IMAGE_PATH

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url
    const mainUrl = image.url

    url =
      ogUrl && typeof ogUrl === 'string'
        ? serverUrl + ogUrl
        : mainUrl && typeof mainUrl === 'string'
          ? serverUrl + mainUrl
          : url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args

  const serverUrl = getServerSideURL()
  const defaultOgAbsolute =
    DEFAULT_OG_IMAGE_PATH.startsWith('http://') || DEFAULT_OG_IMAGE_PATH.startsWith('https://')
      ? DEFAULT_OG_IMAGE_PATH
      : `${serverUrl}${DEFAULT_OG_IMAGE_PATH.startsWith('/') ? '' : '/'}${DEFAULT_OG_IMAGE_PATH}`

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title
    ? doc?.meta?.title + ' | Erin Jerri'
    : 'Erin Jerri'

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: title,
              ...(ogImage === defaultOgAbsolute
                ? { width: DEFAULT_OG_IMAGE_WIDTH, height: DEFAULT_OG_IMAGE_HEIGHT }
                : {}),
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
