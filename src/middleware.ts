import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Forward the request pathname so Server Components (e.g. Header) can match the client’s
 * `usePathname()` on first paint and avoid hydration mismatches from theme/layout branching.
 *
 * Netlify runs this as an Edge Function. Copy headers with `forEach` + `set` instead of
 * `new Headers(request.headers)` — some Edge runtimes have thrown when combining the latter
 * with `NextResponse.next({ request: { headers } })`, which surfaces as “edge function crashed”.
 */
export function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl?.pathname ?? '/'
    const requestHeaders = new Headers()
    request.headers.forEach((value, key) => {
      requestHeaders.set(key, value)
    })
    requestHeaders.set('x-pathname', pathname)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (err) {
    console.error('[middleware] failed; continuing without x-pathname', err)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Skip Payload admin, API, and Next static assets. Omit file-extension negative lookahead —
     * it is unnecessary for correctness and can be fragile across Edge regex implementations.
     */
    '/((?!api|admin|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
}
