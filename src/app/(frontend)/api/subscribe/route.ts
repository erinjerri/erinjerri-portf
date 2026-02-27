import { NextResponse } from 'next/server'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    const body = (await req.json()) as { email?: string }
    const email = body?.email?.trim().toLowerCase()

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ ok: false, error: 'Please enter a valid email.' }, { status: 400 })
    }

    const substackUrl = process.env.SUBSTACK_SUBSCRIBE_URL
    if (!substackUrl) {
      return NextResponse.json(
        { ok: false, error: 'Subscription service is not configured yet.' },
        { status: 503 },
      )
    }

    const subscribeUrl = normalizeSubstackSubscribeURL(substackUrl)
    if (!subscribeUrl) {
      return NextResponse.json(
        { ok: false, error: 'Subscription service is not configured yet.' },
        { status: 503 },
      )
    }

    const response = await fetch(subscribeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (compatible; NewsletterSubscribe/1.0)',
      },
      body: new URLSearchParams({ email }).toString(),
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: 'Subscription failed. Please try again.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }
}
