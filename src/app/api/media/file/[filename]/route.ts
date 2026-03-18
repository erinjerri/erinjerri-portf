import { NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import type { GetObjectCommandOutput } from '@aws-sdk/client-s3'
import path from 'path'
import { readFile } from 'fs/promises'
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Uint8Array> {
  const chunks: Buffer[] = []
  const readable = stream as AsyncIterable<Buffer | Uint8Array>
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return new Uint8Array(Buffer.concat(chunks))
}

const getContentType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    case '.svg':
      return 'image/svg+xml'
    case '.mp4':
      return 'video/mp4'
    case '.webm':
      return 'video/webm'
    case '.mp3':
      return 'audio/mpeg'
    case '.wav':
      return 'audio/wav'
    default:
      return 'application/octet-stream'
  }
}

const publicMediaDir = path.join(process.cwd(), 'public', 'media')

const readFromLocalPublicMedia = async (filename: string): Promise<Response | null> => {
  try {
    const buf = await readFile(path.join(publicMediaDir, filename))
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': getContentType(filename),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return null
  }
}

const getS3Client = () => {
  const account = process.env.R2_ACCOUNT_ID
  const endpoint = process.env.R2_ENDPOINT || (account ? `https://${account}.r2.cloudflarestorage.com` : undefined)
  const forcePathStyle = process.env.R2_FORCE_PATH_STYLE !== 'false'

  return new S3Client({
    region: 'auto',
    endpoint,
    forcePathStyle,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  })
}

const R2_MEDIA_PREFIX = (process.env.R2_MEDIA_PREFIX?.trim() || 'media').replace(/\/$/, '')

const tryGetObject = async (
  client: S3Client,
  bucket: string,
  keys: string[],
): Promise<GetObjectCommandOutput | null> => {
  for (const key of keys) {
    try {
      const cmd = new GetObjectCommand({ Bucket: bucket, Key: key })
      const res = (await client.send(cmd)) as GetObjectCommandOutput
      if (res?.Body) return res
    } catch {
      // try next key
    }
  }
  return null
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const params = await context.params
  let filename = params.filename
  if (!filename) {
    return new NextResponse('Missing filename', { status: 400 })
  }

  try {
    filename = decodeURIComponent(filename)
  } catch {
    // keep raw if decode fails
  }

  // Defensive: route param should be a single filename segment.
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
    return new NextResponse('Invalid filename', { status: 400 })
  }

  const cleanFilename = filename.replace(/^\/+/, '')
  const bucket = process.env.R2_BUCKET?.trim()

  // When R2 is not configured, serve from public/media only
  if (!bucket) {
    const local = await readFromLocalPublicMedia(cleanFilename)
    if (local) return local
    return new NextResponse('Not found', { status: 404 })
  }

  // Payload S3/R2 storage may use encoded filenames in keys; try multiple variants
  const encodedFilename = encodeURIComponent(cleanFilename)
  const spaceAsPlus = cleanFilename.replace(/ /g, '+')
  const candidateKeys = Array.from(
    new Set([
      // Payload storage: prefix/encodedFilename (e.g. media/Lightbulb%20Icon.png)
      R2_MEDIA_PREFIX ? `${R2_MEDIA_PREFIX}/${encodedFilename}` : encodedFilename,
      // Prefix with raw filename
      R2_MEDIA_PREFIX ? `${R2_MEDIA_PREFIX}/${cleanFilename}` : cleanFilename,
      // Space as + (some systems)
      R2_MEDIA_PREFIX ? `${R2_MEDIA_PREFIX}/${spaceAsPlus}` : spaceAsPlus,
      // Bucket root
      cleanFilename,
      encodedFilename,
      spaceAsPlus,
    ]),
  )

  try {
    const client = getS3Client()
    const res = await tryGetObject(client, bucket, candidateKeys)

    if (!res || !res.Body) {
      const local = await readFromLocalPublicMedia(cleanFilename)
      if (local) return local
      return new NextResponse('Not found', { status: 404 })
    }

    const headers: Record<string, string> = {}
    // Next/image requires a valid content-type to treat this as an image.
    headers['Content-Type'] = res.ContentType || getContentType(cleanFilename)
    if (res.ContentLength) headers['Content-Length'] = String(res.ContentLength)
    if (res.ETag) headers['ETag'] = String(res.ETag)
    headers['Cache-Control'] = res.CacheControl || 'public, max-age=31536000, immutable'

    // Buffer the S3/R2 stream to avoid Node.js Web Streams transformAlgorithm race
    // (passing the raw stream to Response can cause "transformAlgorithm is not a function")
    const body = res.Body as { transformToByteArray?: () => Promise<Uint8Array> }
    const bytes =
      typeof body?.transformToByteArray === 'function'
        ? await body.transformToByteArray()
        : await streamToBuffer(body as NodeJS.ReadableStream)
    return new Response(bytes, { status: 200, headers })
  } catch (err: unknown) {
    const local = await readFromLocalPublicMedia(cleanFilename)
    if (local) return local
    const message = err instanceof Error ? err.message : String(err)
    return new NextResponse(`Error fetching file: ${message}`, { status: 502 })
  }
}
