import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Articles, projects, speaking, and creative work from Erin Jerri.',
  images: [
    {
      url: `${getServerSideURL()}/og-default.svg`,
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
