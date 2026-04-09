import type { Metadata } from 'next'

import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_WIDTH,
} from '@/constants/defaultOgImage'

import { SITE_DEFAULT_DESCRIPTION, SITE_DEFAULT_TITLE } from './siteMetadata'
import { getServerSideURL } from './getURL'

function absoluteOgImageUrl(): string {
  if (DEFAULT_OG_IMAGE_PATH.startsWith('http://') || DEFAULT_OG_IMAGE_PATH.startsWith('https://')) {
    return DEFAULT_OG_IMAGE_PATH
  }
  return `${getServerSideURL()}${DEFAULT_OG_IMAGE_PATH}`
}

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: SITE_DEFAULT_DESCRIPTION,
  images: [
    {
      url: absoluteOgImageUrl(),
      width: DEFAULT_OG_IMAGE_WIDTH,
      height: DEFAULT_OG_IMAGE_HEIGHT,
      alt: "Creating Augmented and Virtual Realities O'Reilly book cover — Erin Jerri",
    },
  ],
  siteName: 'Erin Jerri',
  title: SITE_DEFAULT_TITLE,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
