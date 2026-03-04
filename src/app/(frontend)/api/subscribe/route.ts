import { NextResponse } from 'next/server'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const DEFAULT_SUBSTACK_BASE_URL = 'https://erinjerri.substack.com'

function normalizeSubstackSubscribeURL(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, '')
  if (!trimmed) return ''

  const lower = trimmed.toLowerCase()

  // Allow providing the exact Substack endpoint
  if (lower.includes('/api/v1/free')) return trimmed

  // Allow providing the publication base URL, e.g. https://foo.substack.com
  if (lower.endsWith('.substack.com') || lower.includes('.substack.com/')) {
    // If they provided /subscribe, translate to the API endpoint.
    if (lower.endsWith('/subscribe')) return `${trimmed.replace(/\/subscribe$/i, '')}/api/v1/free`
    return `${trimmed}/api/v1/free`
  }

  // Fall back to what was provided.
  return trimmed
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as { email?: string; currentUrl?: string; referrer?: string }
    const email = body?.email?.trim().toLowerCase()

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ ok: false, error: 'Please enter a valid email.' }, { status: 400 })
    }

    const configured = (process.env.SUBSTACK_SUBSCRIBE_URL || DEFAULT_SUBSTACK_BASE_URL).trim()
    const subscribeApiUrl = normalizeSubstackSubscribeURL(configured) || `${DEFAULT_SUBSTACK_BASE_URL}/api/v1/free`

    const publicationBaseUrl = (() => {
      const trimmed = configured.replace(/\/$/, '')
      if (!trimmed) return DEFAULT_SUBSTACK_BASE_URL
      if (trimmed.toLowerCase().includes('/api/v1/free')) return trimmed.replace(/\/api\/v1\/free$/i, '')
      if (trimmed.toLowerCase().endsWith('/subscribe')) return trimmed.replace(/\/subscribe$/i, '')
      return trimmed
    })()

    // Prefer the actual site origin when present, so Substack sees a browser-like request.
    const siteOrigin = req.headers.get('origin') || undefined

    const response = await fetch(subscribeApiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...(siteOrigin ? { Referer: `${siteOrigin}/`, Origin: siteOrigin } : {}),
      },
      body: new URLSearchParams({
        email,
        ...(body?.currentUrl ? { first_url: body.currentUrl, current_url: body.currentUrl } : {}),
        ...(body?.referrer ? { first_referrer: body.referrer, referrer: body.referrer } : {}),
      }).toString(),
      cache: 'no-store',
    })

    const responseText = await response.text()

    let parsed: unknown = undefined
    try {
      parsed = responseText ? (JSON.parse(responseText) as unknown) : undefined
    } catch {
      // ignore
    }

    const hasApiErrors =
      typeof parsed === 'object' &&
      parsed !== null &&
      // Substack may return `errors` on failure (shape is not guaranteed).
      'errors' in parsed &&
      Array.isArray((parsed as { errors?: unknown }).errors) &&
      (parsed as { errors: unknown[] }).errors.length > 0

    if (!response.ok || hasApiErrors) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Subscription failed. Please try again.',
          // Fallback: redirect the user to Substack’s subscribe page with email prefilled.
          redirectTo: `${publicationBaseUrl}/subscribe?email=${encodeURIComponent(email)}`,
        },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }
}
