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

    const response = await fetch(substackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
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
