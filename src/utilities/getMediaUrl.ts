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

  if (!forcePayloadProxyReads && value.startsWith('/api/media/file/')) {
    return `/media/${value.slice('/api/media/file/'.length)}`
  }

  if (forcePayloadProxyReads && value.startsWith('/media/')) {
    return `/api/media/file/${value.slice('/media/'.length)}`
  }

  return value
}

/** R2 S3 API endpoint is not publicly accessible; use proxy path instead */
const isBrokenR2Url = (url: string): boolean => url.includes('r2.cloudflarestorage.com')

export const getMediaUrl = (
  url: string | null | undefined,
  cacheTag?: string | null,
  fallbackPath?: string | null,
): string => {
  const resolved =
    url && isBrokenR2Url(url) && fallbackPath ? fallbackPath : url ?? fallbackPath ?? ''
  if (!resolved) return ''
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
  if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
    try {
      const parsed = new URL(resolved)

      if (!forcePayloadProxyReads && parsed.pathname.startsWith('/api/media/file/')) {
        parsed.pathname = `/media/${parsed.pathname.slice('/api/media/file/'.length)}`
      } else if (forcePayloadProxyReads && parsed.pathname.startsWith('/media/')) {
        parsed.pathname = `/api/media/file/${parsed.pathname.slice('/media/'.length)}`
      }

      return appendCacheTag(parsed.toString())
    } catch {
      return appendCacheTag(resolved)
    }
  }

  const normalizedUrl = encodePathPreserveQuery(toPayloadFileEndpoint(resolved))

  // Keep local URLs relative so they work regardless of host (localhost/LAN/custom domain).
  if (normalizedUrl.startsWith('/')) {
    return appendCacheTag(normalizedUrl)
  }

  // Use full base URL when available; otherwise relative (resolves to current origin)
  const baseUrl = canUseDOM ? getClientSideURL() : getServerSideURL()
  const effectiveBase = baseUrl || ''
  return appendCacheTag(`${effectiveBase}${normalizedUrl}`)
}
