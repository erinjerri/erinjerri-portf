export const POETRY_HOSTNAME = 'poetry.erinjerri.com'
export const POETRY_ORIGIN = `https://${POETRY_HOSTNAME}`

export function getRequestHostname(headers: Headers): string {
  const forwardedHost = headers.get('x-forwarded-host')
  const host = forwardedHost || headers.get('host') || ''
  return host.split(',')[0]?.trim().split(':')[0]?.toLowerCase() ?? ''
}

export function isPoetryHostname(hostname: string): boolean {
  return hostname === POETRY_HOSTNAME
}

export function poetryCanonicalUrlForPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (normalized === '/') return `${POETRY_ORIGIN}/`
  return `${POETRY_ORIGIN}${normalized}`
}
