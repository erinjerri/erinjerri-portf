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
  const forcePayloadProxyReads = process.env.NEXT_PUBLIC_USE_PAYLOAD_MEDIA_PROXY === 'true'

  if (forcePayloadProxyReads && value.startsWith('/media/')) {
    return `/api/media/file/${value.slice('/media/'.length)}`
  }

  return value
}

export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''
  const forcePayloadProxyReads = process.env.NEXT_PUBLIC_USE_PAYLOAD_MEDIA_PROXY === 'true'

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
    try {
      const parsed = new URL(url)

      // R2 S3 API endpoints are not publicly readable in browsers.
      // In proxy mode, rewrite those URLs to Payload's media file route.
      if (
        forcePayloadProxyReads &&
        parsed.hostname.endsWith('r2.cloudflarestorage.com')
      ) {
        const pathParts = parsed.pathname.split('/').filter(Boolean)
        const filename = pathParts[pathParts.length - 1]
        if (filename) {
          return appendCacheTag(`/api/media/file/${encodeURIComponent(filename)}`)
        }
      }

      if (forcePayloadProxyReads && parsed.pathname.startsWith('/media/')) {
        parsed.pathname = `/api/media/file/${parsed.pathname.slice('/media/'.length)}`
      }

      return appendCacheTag(parsed.toString())
    } catch {
      return appendCacheTag(url)
    }
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
