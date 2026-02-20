import canUseDOM from '@/utilities/canUseDOM'
import { getClientSideURL, getServerSideURL } from '@/utilities/getURL'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
/**
 * Converts Payload API media URLs to static paths to avoid Next.js Image
 * optimization timeouts from self-requests to /api/media/file/...
 */
const toStaticMediaPath = (url: string): string => {
  const apiMediaMatch = url.match(/^\/api\/media\/file\/(.+)$/)
  if (apiMediaMatch) {
    return `/media/${apiMediaMatch[1]}`
  }
  return url
}

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

export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  // Check if URL already has http/https protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const separator = url.includes('?') ? '&' : '?'
    return cacheTag ? `${url}${separator}${cacheTag}` : url
  }

  // Use static path for Payload API URLs (avoids Next.js Image self-request timeouts)
  const staticUrl = encodePathPreserveQuery(toStaticMediaPath(url))

  // Use full base URL when available; otherwise relative (resolves to current origin)
  const baseUrl = canUseDOM ? getClientSideURL() : getServerSideURL()
  const effectiveBase = baseUrl || ''
  return cacheTag ? `${effectiveBase}${staticUrl}?${cacheTag}` : `${effectiveBase}${staticUrl}`
}
