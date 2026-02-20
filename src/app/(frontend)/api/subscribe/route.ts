import { NextResponse } from 'next/server'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as { email?: string }
    const email = body?.email?.trim().toLowerCase()

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ ok: false, error: 'Please enter a valid email.' }, { status: 400 })
    }

    const webhookURL = process.env.ZAPIER_SUBSCRIBE_WEBHOOK_URL
    if (!webhookURL) {
      return NextResponse.json(
        { ok: false, error: 'Subscription service is not configured yet.' },
        { status: 503 },
      )
    }

    const webhookRes = await fetch(webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        source: 'footer',
        subscribedAt: new Date().toISOString(),
      }),
      cache: 'no-store',
    })

    if (!webhookRes.ok) {
      return NextResponse.json(
        { ok: false, error: 'Subscription provider rejected the request.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }
}
