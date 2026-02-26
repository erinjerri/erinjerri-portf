import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const isBrokenR2Url = (u: string) => u.includes('r2.cloudflarestorage.com')

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const fallbackPath = image.filename
      ? `/media/${encodeURI(String(image.filename).replace(/^\/+/, ''))}`
      : null
    const pickUrl = (u: string | null | undefined) =>
      u && !isBrokenR2Url(u) ? u : fallbackPath
    const ogUrl = pickUrl(image.sizes?.og?.url ?? null)
    const mainUrl = pickUrl(image.url ?? null)

    url = (ogUrl || mainUrl) ? serverUrl + (ogUrl || mainUrl!) : url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args

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
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
