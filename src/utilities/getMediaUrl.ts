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
  // Do not rewrite local /media/ paths to the Payload proxy endpoint here.
  // Returning `/api/media/file/...` causes next/image to treat images as local proxy
  // assets and can trigger heavy proxy fetches during SSG. Keep the original value
  // so callers can decide whether to use a proxy or direct URL.
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
          const filename = pathParts[pathParts.length - 1]
          if (filename) {
            // If the R2 bucket is configured for public reads or a public hostname is provided,
            // prefer returning the public R2 URL so Next.js can treat it as a remote image.
            const publicHostname = process.env.R2_PUBLIC_HOSTNAME?.trim()
            const publicReads = process.env.R2_PUBLIC_READS === 'true'
            if (publicHostname) {
              const base = publicHostname.replace(/^https?:\/\//, '')
              return appendCacheTag(`https://${base}/${encodeURIComponent(filename)}`)
            }

            if (publicReads && process.env.R2_ACCOUNT_ID) {
              const acct = process.env.R2_ACCOUNT_ID.trim()
              return appendCacheTag(`https://${acct}.r2.cloudflarestorage.com/${encodeURIComponent(filename)}`)
            }

            // Fallback: serve via the app's /media/<filename> path (absolute)
            const serverBase = getServerSideURL() || ''
            return appendCacheTag(`${serverBase}/media/${encodeURIComponent(filename)}`)
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
