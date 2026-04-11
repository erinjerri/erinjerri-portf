import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Forward the request pathname so Server Components (e.g. Header) can match the client’s
 * `usePathname()` on first paint and avoid hydration mismatches from theme/layout branching.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all pathnames except static assets and Next internals.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
