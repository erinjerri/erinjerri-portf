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

const MEDIA_PREFIX = (process.env.R2_MEDIA_PREFIX?.trim() || 'media').replace(/^\/+|\/+$/g, '')

const getPublicR2MediaUrl = (filename: string): string | null => {
  const cleanFilename = filename.replace(/^\/+/, '')
  const publicHostname = process.env.R2_PUBLIC_HOSTNAME?.trim()
  const publicReads = process.env.R2_PUBLIC_READS === 'true'
  const accountId = process.env.R2_ACCOUNT_ID?.trim()
  let normalizedFilename = cleanFilename

  try {
    let prev = normalizedFilename
    for (let i = 0; i < 5; i++) {
      const decoded = decodeURIComponent(prev)
      if (decoded === prev) break
      prev = decoded
    }
    normalizedFilename = prev
  } catch {
    normalizedFilename = cleanFilename
  }

  const encodedFilename = encodeURIComponent(normalizedFilename)
  const keyPath = MEDIA_PREFIX ? `${MEDIA_PREFIX}/${encodedFilename}` : encodedFilename

  if (publicHostname) {
    const base = publicHostname.replace(/^https?:\/\//, '').replace(/\/+$/, '')
    return `https://${base}/${keyPath}`
  }

  if (publicReads && accountId) {
    return `https://${accountId}.r2.cloudflarestorage.com/${keyPath}`
  }

  return null
}

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

  if (!forcePayloadProxyReads) {
    if (url.startsWith('/media/')) {
      const directUrl = getPublicR2MediaUrl(url.replace(/^\/media\//, ''))
      if (directUrl) return appendCacheTag(directUrl)
    }

    if (url.startsWith('/api/media/file/')) {
      const directUrl = getPublicR2MediaUrl(url.replace(/^\/api\/media\/file\//, ''))
      if (directUrl) return appendCacheTag(directUrl)
    }
  }

  // Check if URL already has http/https protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url)

      // If the source is an R2 URL, prefer serving the image from the site's
      // public `/media/<filename>` path (served by the app) so Next.js can treat it
      // as a remote asset matching remotePatterns or a direct /media path.
      // This avoids returning proxy endpoints like `/api/media/file/...` which
      // can cause next/image to validate against localPatterns and trigger proxy fetches.
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
            const directUrl = getPublicR2MediaUrl(filename)
            if (directUrl) {
              return appendCacheTag(directUrl)
            }

            // Fallback: serve via the Payload proxy to avoid broken /media paths
            // when local media files aren't present.
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
