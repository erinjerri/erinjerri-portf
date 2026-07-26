import { CANONICAL_SITE_ORIGIN } from './siteMetadata'

/** Optional custom hostname. Leave unset to serve poetry at `/poetry` on the main site. */
export const POETRY_HOSTNAME = process.env.NEXT_PUBLIC_POETRY_HOSTNAME?.trim().toLowerCase() || ''
export const POETRY_ORIGIN = POETRY_HOSTNAME ? `https://${POETRY_HOSTNAME}` : CANONICAL_SITE_ORIGIN

export function getRequestHostname(headers: Headers): string {
  const forwardedHost = headers.get('x-forwarded-host')
  const host = forwardedHost || headers.get('host') || ''
  return host.split(',')[0]?.trim().split(':')[0]?.toLowerCase() ?? ''
}

export function isPoetryHostname(hostname: string): boolean {
  return Boolean(POETRY_HOSTNAME) && hostname === POETRY_HOSTNAME
}

export function poetryCanonicalUrlForPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (normalized === '/') return `${POETRY_ORIGIN}/`
  return `${POETRY_ORIGIN}${normalized}`
}
