import { NextResponse } from 'next/server'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

    const baseUrl = substackUrl.trim().replace(/\/$/, '')
    const subscribeUrl = baseUrl.includes('?') ? baseUrl : `${baseUrl}?nojs=true`

    const response = await fetch(subscribeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (compatible; NewsletterSubscribe/1.0)',
      },
      body: new URLSearchParams({ email, source: 'subscribe_page' }).toString(),
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
