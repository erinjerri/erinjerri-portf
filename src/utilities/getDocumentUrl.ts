import canUseDOM from '@/utilities/canUseDOM'
import { getClientSideURL, getServerSideURL } from '@/utilities/getURL'

const forcePayloadProxyReads = () =>
  process.env.NEXT_PUBLIC_USE_PAYLOAD_MEDIA_PROXY === 'true'

const DOCUMENTS_PREFIX = (process.env.R2_DOCUMENTS_PREFIX?.trim() || 'documents').replace(
  /^\/+|\/+$/g,
  '',
)

const getPublicR2DocumentUrl = (filename: string): string | null => {
  const cleanFilename = filename.replace(/^\/+/, '')
  const publicHostname = process.env.R2_PUBLIC_HOSTNAME?.trim()
  const publicReads = process.env.R2_PUBLIC_READS === 'true'
  const accountId = process.env.R2_ACCOUNT_ID?.trim()
  const encodedFilename = encodeURIComponent(cleanFilename)
  const keyPath = DOCUMENTS_PREFIX ? `${DOCUMENTS_PREFIX}/${encodedFilename}` : encodedFilename

  if (publicHostname) {
    const base = publicHostname.replace(/^https?:\/\//, '').replace(/\/+$/, '')
    return `https://${base}/${keyPath}`
  }

  if (publicReads && accountId) {
    return `https://${accountId}.r2.cloudflarestorage.com/${keyPath}`
  }

  return null
}

/**
 * Resolves document (PDF) URLs for display/download.
 * Rewrites broken R2 S3 URLs to proxy path when proxy mode is on.
 */
export function getDocumentUrl(
  url: string | null | undefined,
  filename?: string | null,
): string {
  if (!forcePayloadProxyReads() && url?.startsWith('/api/documents/file/')) {
    const directUrl = getPublicR2DocumentUrl(url.replace(/^\/api\/documents\/file\//, ''))
    if (directUrl) return directUrl
  }

  if (!forcePayloadProxyReads() && url?.startsWith('/documents/')) {
    const directUrl = getPublicR2DocumentUrl(url.replace(/^\/documents\//, ''))
    if (directUrl) return directUrl
  }

  if (!url) {
    if (filename) {
      const path = `/api/documents/file/${encodeURIComponent(filename.replace(/^\/+/, ''))}`
      if (forcePayloadProxyReads()) return path

      const directUrl = getPublicR2DocumentUrl(filename)
      if (directUrl) return directUrl

      return `${getServerSideURL()}${path}`
    }
    return ''
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url)
      const isR2Host =
        parsed.hostname.endsWith('r2.cloudflarestorage.com') ||
        parsed.hostname.endsWith('.r2.dev') ||
        parsed.hostname.endsWith('.r2.cloudflarestorage.com')

      if (isR2Host) {
        if (forcePayloadProxyReads()) {
          const pathParts = parsed.pathname.split('/').filter(Boolean)
          const fn = pathParts[pathParts.length - 1] ?? filename
          if (fn) return `/api/documents/file/${encodeURIComponent(fn)}`
        }
        // Return as-is to avoid hydration mismatch: getPublicR2DocumentUrl uses
        // process.env.R2_* which is undefined on the client (not NEXT_PUBLIC_*).
        return url
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
