import canUseDOM from '@/utilities/canUseDOM'
import { getClientSideURL, getServerSideURL } from '@/utilities/getURL'

const forcePayloadProxyReads = () =>
  process.env.NEXT_PUBLIC_USE_PAYLOAD_MEDIA_PROXY === 'true'

const isBrokenR2Url = (u: string): boolean =>
  u.includes('r2.cloudflarestorage.com')

/**
 * Resolves document (PDF) URLs for display/download.
 * Rewrites broken R2 S3 URLs to proxy path when proxy mode is on.
 */
export function getDocumentUrl(
  url: string | null | undefined,
  filename?: string | null,
): string {
  if (!url) {
    if (filename) {
      const path = `/api/documents/file/${encodeURIComponent(filename.replace(/^\/+/, ''))}`
      return forcePayloadProxyReads() ? path : `${getServerSideURL()}${path}`
    }
    return ''
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url)
      if (
        forcePayloadProxyReads() &&
        (parsed.hostname.endsWith('r2.cloudflarestorage.com') ||
          parsed.hostname.endsWith('.r2.dev'))
      ) {
        const pathParts = parsed.pathname.split('/').filter(Boolean)
        const fn = pathParts[pathParts.length - 1] ?? filename
        if (fn) {
          return `/api/documents/file/${encodeURIComponent(fn)}`
        }
      }
      return url
    } catch {
      return url
    }
  }

  if (url.startsWith('/')) {
    return url
  }

  const base = canUseDOM ? getClientSideURL() : getServerSideURL()
  return `${base || ''}${url}`
}
