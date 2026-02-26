import type { CollectionAfterReadHook } from 'payload'

const isBrokenR2Url = (u: string | null | undefined): boolean =>
  Boolean(u && typeof u === 'string' && u.includes('r2.cloudflarestorage.com'))

const toProxyUrl = (filename: string): string =>
  `/api/media/file/${encodeURIComponent(filename)}`

const getFilenameFromPath = (url: string): string | null => {
  try {
    const pathname = new URL(url).pathname
    const segments = pathname.split('/').filter(Boolean)
    return segments[segments.length - 1] ?? null
  } catch {
    return null
  }
}

/**
 * Rewrite broken R2 S3 API URLs to proxy path so admin thumbnails and frontend display work.
 * (r2.cloudflarestorage.com is not publicly readable in the browser.)
 */
export const rewriteBrokenR2Urls: CollectionAfterReadHook = ({ doc }) => {
  if (!doc || typeof doc !== 'object') return doc

  const mainFilename =
    typeof doc.filename === 'string' ? doc.filename.replace(/^\/+/, '') : null

  const result = { ...doc }

  if (isBrokenR2Url(doc.url)) {
    const fn = mainFilename ?? (typeof doc.url === 'string' ? getFilenameFromPath(doc.url) : null)
    if (fn) result.url = toProxyUrl(fn)
  }

  if (doc.sizes && typeof doc.sizes === 'object') {
    result.sizes = { ...doc.sizes }
    for (const key of Object.keys(result.sizes) as (keyof typeof result.sizes)[]) {
      const size = result.sizes[key]
      if (size && typeof size === 'object' && 'url' in size && isBrokenR2Url(size.url)) {
        const fn =
          (typeof size === 'object' && 'filename' in size && typeof (size as { filename?: string }).filename === 'string'
            ? (size as { filename: string }).filename
            : null) ??
          (typeof size.url === 'string' ? getFilenameFromPath(size.url) : null) ??
          mainFilename
        if (fn) (result.sizes[key] as { url?: string }).url = toProxyUrl(fn)
      }
    }
  }

  return result
}
