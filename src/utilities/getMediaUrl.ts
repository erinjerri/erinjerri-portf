import canUseDOM from '@/utilities/canUseDOM'
import { getClientSideURL, getServerSideURL } from '@/utilities/getURL'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
const encodePathPreserveQuery = (value: string): string => {
  const [path, query = ''] = value.split('?')
  const encodedPath = path
    .split('/')
    .map((segment) => {
      if (!segment) return ''
      try {
        return encodeURIComponent(decodeURIComponent(segment))
      } catch {
        return encodeURIComponent(segment)
      }
    })
    .join('/')

  return query ? `${encodedPath}?${query}` : encodedPath
}

const toPayloadFileEndpoint = (value: string): string => {
  if (value.startsWith('/media/')) {
    return `/api/media/file/${value.slice('/media/'.length)}`
  }

  return value
}

export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  const appendCacheTag = (value: string): string => {
    if (!cacheTag) return value
    const separator = value.includes('?') ? '&' : '?'
    return `${value}${separator}${cacheTag}`
  }

  // Check if URL already has http/https protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return appendCacheTag(url)
  }

  const normalizedUrl = encodePathPreserveQuery(toPayloadFileEndpoint(url))

  // Keep local URLs relative so they work regardless of host (localhost/LAN/custom domain).
  if (normalizedUrl.startsWith('/')) {
    return appendCacheTag(normalizedUrl)
  }

  // Use full base URL when available; otherwise relative (resolves to current origin)
  const baseUrl = canUseDOM ? getClientSideURL() : getServerSideURL()
  const effectiveBase = baseUrl || ''
  return appendCacheTag(`${effectiveBase}${normalizedUrl}`)
}
