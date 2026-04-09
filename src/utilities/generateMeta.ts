import type { Metadata } from 'next'

import type { Config, Media, Page, Post, Project, Watch } from '../payload-types'

import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_WIDTH,
} from '@/constants/defaultOgImage'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import {
  CANONICAL_SITE_ORIGIN,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  canonicalUrlForPath,
  getFixedPageSeo,
} from './siteMetadata'

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

function normalizeCanonicalPath(path: string): string {
  if (!path || path === '/') return '/'
  const withSlash = path.startsWith('/') ? path : `/${path}`
  return withSlash.replace(/\/$/, '') || '/'
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | Partial<Project> | Partial<Watch> | null
  /** Public pathname e.g. `/`, `/about`, `/posts/hello` */
  canonicalPath: string
}): Promise<Metadata> => {
  const { doc, canonicalPath } = args
  const path = normalizeCanonicalPath(canonicalPath)
  const canonical = canonicalUrlForPath(path === '/' ? '/' : path)

  const serverUrl = getServerSideURL()
  const defaultOgAbsolute =
    DEFAULT_OG_IMAGE_PATH.startsWith('http://') || DEFAULT_OG_IMAGE_PATH.startsWith('https://')
      ? DEFAULT_OG_IMAGE_PATH
      : `${serverUrl}${DEFAULT_OG_IMAGE_PATH.startsWith('/') ? '' : '/'}${DEFAULT_OG_IMAGE_PATH}`

  const ogImage = getImageURL(doc?.meta?.image)

  const fixedPageSeo = getFixedPageSeo(path)

  const cmsTitle = doc?.meta?.title?.trim()
  const cmsDescription = doc?.meta?.description?.trim()

  let title: string
  if (fixedPageSeo) {
    title = fixedPageSeo.title
  } else if (cmsTitle) {
    title = `${cmsTitle} | Erin Jerri`
  } else {
    title = SITE_DEFAULT_TITLE
  }

  const description =
    fixedPageSeo?.description ??
    (cmsDescription || SITE_DEFAULT_DESCRIPTION)

  const ogUrl =
    path === '/' ? `${CANONICAL_SITE_ORIGIN}/` : `${CANONICAL_SITE_ORIGIN}${path}`

  return {
    alternates: {
      canonical,
    },
    description,
    openGraph: mergeOpenGraph({
      description,
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
      url: ogUrl,
    }),
    title,
    twitter: {
      card: 'summary_large_image',
      creator: '@erinjerri',
      description,
      title,
    },
  }
}
