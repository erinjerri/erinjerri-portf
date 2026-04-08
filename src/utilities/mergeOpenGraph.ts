import type { Metadata } from 'next'

import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_WIDTH,
} from '@/constants/defaultOgImage'

import { getServerSideURL } from './getURL'

function absoluteOgImageUrl(): string {
  if (DEFAULT_OG_IMAGE_PATH.startsWith('http://') || DEFAULT_OG_IMAGE_PATH.startsWith('https://')) {
    return DEFAULT_OG_IMAGE_PATH
  }
  return `${getServerSideURL()}${DEFAULT_OG_IMAGE_PATH}`
}

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Articles, projects, speaking, and creative work from Erin Jerri.',
  images: [
    {
      url: absoluteOgImageUrl(),
      width: DEFAULT_OG_IMAGE_WIDTH,
      height: DEFAULT_OG_IMAGE_HEIGHT,
      alt: 'Erin Jerri',
    },
  ],
  siteName: 'Erin Jerri',
  title: 'Erin Jerri',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
