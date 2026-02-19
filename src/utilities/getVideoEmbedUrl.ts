/**
 * Returns a URL suitable for embedding in an iframe.
 * Only returns a value for platforms that reliably allow embedding (e.g. YouTube).
 * Many sites (InfoQ, etc.) block iframes via X-Frame-Options, which causes
 * "refused to connect" errors—for those, the caller should show a link card instead.
 */
export function getVideoEmbedUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null

  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase()

    // YouTube: reliably allows embedding
    if (hostname === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      const watchId = parsed.searchParams.get('v')
      if (watchId) return `https://www.youtube.com/embed/${watchId}`
      const pathParts = parsed.pathname.split('/').filter(Boolean)
      const embedIndex = pathParts.findIndex((p) => p === 'embed')
      if (embedIndex >= 0 && pathParts[embedIndex + 1])
        return `https://www.youtube.com/embed/${pathParts[embedIndex + 1]}`
      const shortsIndex = pathParts.findIndex((p) => p === 'shorts')
      if (shortsIndex >= 0 && pathParts[shortsIndex + 1])
        return `https://www.youtube.com/embed/${pathParts[shortsIndex + 1]}`
    }

    // Vimeo: has a dedicated embed player
    if (hostname === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://player.vimeo.com/video/${id}` : null
    }

    // Other URLs: many sites block iframe embedding (X-Frame-Options).
    // Return null so caller shows a link card instead of a broken iframe.
    return null
  } catch {
    return null
  }
}

/** True if the URL is a direct video file (.mp4, .webm, etc.) */
export function isDirectVideoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  try {
    const ext = new URL(url).pathname.split('.').pop()?.toLowerCase()
    return ['mp4', 'webm', 'ogg', 'mov'].includes(ext ?? '')
  } catch {
    return false
  }
}
