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

const toPayloadProxyPath = (value: string): string =>
  value.startsWith('/media/') ? value.replace(/^\/media\//, '/api/media/file/') : value

const toPayloadFileEndpoint = (value: string): string => {
  // In dev, or when explicitly requested, allow proxy reads for /media paths so
  // images still load when local media files aren't present.
  const forcePayloadProxyReads = process.env.NEXT_PUBLIC_USE_PAYLOAD_MEDIA_PROXY === 'true'
  if (forcePayloadProxyReads && value.startsWith('/media/')) {
    return toPayloadProxyPath(value)
  }

  // Otherwise keep the original value to avoid proxy fetches during SSG.
  return value
}

/** R2 public URLs return 404 when query params (e.g. cache-bust) are appended. Omit cache tag for R2. */
const isR2Url = (u: string): boolean =>
  u.includes('r2.cloudflarestorage.com') || u.includes('.r2.dev')

export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  const appendCacheTag = (value: string): string => {
    if (!cacheTag || isR2Url(value)) return value
    const separator = value.includes('?') ? '&' : '?'
    return `${value}${separator}${cacheTag}`
  }

  // Keep /media paths direct by default so static files in public/media work during builds.
  // Only proxy them when NEXT_PUBLIC_USE_PAYLOAD_MEDIA_PROXY=true.
  if (url.startsWith('/media/')) {
    return appendCacheTag(toPayloadFileEndpoint(url).split('?')[0])
  }

  if (url.startsWith('/api/media/file/')) {
    // Already a proxy path; ensure it's clean (no double encoding)
    const filename = url.replace(/^\/api\/media\/file\//, '').split('?')[0]
    if (filename) {
      try {
        const decoded = decodeURIComponent(filename)
        const proxyPath = `/api/media/file/${encodeURIComponent(decoded)}`
        return appendCacheTag(proxyPath)
      } catch {
        return appendCacheTag(url.split('?')[0])
      }
    }
  }

  // Check if URL already has http/https protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url)

      // R2 public URLs often 404 (public access not enabled, key mismatch, etc).
      // Always use the Payload proxy for R2 URLs: it fetches via S3 API and serves reliably.
      try {
        const isR2 =
          parsed.hostname.endsWith('r2.cloudflarestorage.com') ||
          parsed.hostname.endsWith('.r2.dev') ||
          parsed.hostname.endsWith('.r2.cloudflarestorage.com')

        if (isR2) {
          const pathParts = parsed.pathname.split('/').filter(Boolean)
          let filename = pathParts[pathParts.length - 1]
          // Decode double-encoded filenames (e.g. %2520 -> space) so we produce a correct URL
          if (filename) {
            try {
              let prev = filename
              for (let i = 0; i < 5; i++) {
                const decoded = decodeURIComponent(prev)
                if (decoded === prev) break
                prev = decoded
              }
              filename = prev
            } catch {
              /* keep original */
            }
          }
          if (filename) {
            const proxyPath = `/api/media/file/${encodeURIComponent(filename)}`
            return appendCacheTag(proxyPath)
          }
        }

        // Do not rewrite other /media/ absolute paths to proxy endpoints.
        return appendCacheTag(parsed.toString())
      } catch {
        return appendCacheTag(url)
      }
    } catch {
      return appendCacheTag(url)
    }
  }

  const normalizedUrl = encodePathPreserveQuery(toPayloadFileEndpoint(url))

  // Keep local URLs relative so they work regardless of host (localhost/LAN/custom domain).
  if (normalizedUrl.startsWith('/')) {
    // Strip any cache-busting query params on media endpoints so public URLs are clean.
    const noQuery = normalizedUrl.split('?')[0]
    return appendCacheTag(noQuery)
  }

  // Use full base URL when available; otherwise relative (resolves to current origin)
  const baseUrl = canUseDOM ? getClientSideURL() : getServerSideURL()
  const effectiveBase = baseUrl || ''
  return appendCacheTag(`${effectiveBase}${normalizedUrl}`)
}
