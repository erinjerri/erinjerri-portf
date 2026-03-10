import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

type Body = {
  paths?: string[]
  tags?: string[]
}

export async function POST(req: Request) {
  const secret = process.env.PAYLOAD_SECRET
  const auth = req.headers.get('authorization')

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: Body = {}
  try {
    body = (await req.json()) as Body
  } catch {
    // ignore
  }

  const paths = Array.isArray(body.paths) ? body.paths : []
  const tags = Array.isArray(body.tags) ? body.tags : []

  for (const tag of tags) {
    if (typeof tag === 'string' && tag.length > 0) {
      revalidateTag(tag)
    }
  }

  for (const path of paths) {
    if (typeof path === 'string' && path.startsWith('/')) {
      revalidatePath(path)
    }
  }

  return NextResponse.json({ ok: true, tags, paths })
}

