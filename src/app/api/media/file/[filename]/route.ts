import { NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

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

export async function GET(req: Request, context: any) {
  const filename = context?.params?.filename
  if (!filename) {
    return new NextResponse('Missing filename', { status: 400 })
  }

  const bucket = process.env.R2_BUCKET
  if (!bucket) {
    return new NextResponse('R2 bucket not configured', { status: 500 })
  }

  try {
    const client = getS3Client()
    const key = filename
    const cmd = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
    const res = await client.send(cmd)

    if (!res.Body) {
      return new NextResponse('Not found', { status: 404 })
    }

    const headers: Record<string, string> = {}
    if (res.ContentType) headers['Content-Type'] = res.ContentType
    if (res.ContentLength) headers['Content-Length'] = String(res.ContentLength)
    if (res.ETag) headers['ETag'] = String(res.ETag)
    if (res.CacheControl) headers['Cache-Control'] = res.CacheControl

    // Convert Node stream (Body) to web ReadableStream if necessary
    const body: any = res.Body as any
    let stream: ReadableStream
    if (typeof (body as any).transform === 'function' || typeof (body as any).pipe === 'function') {
      // Node.js Readable -> Web ReadableStream
      // @ts-ignore
      stream = (body as any).readable ? (body as any).readable : (body as any)
      // Fallback: use Response with body directly
      return new Response(body as any, { status: 200, headers })
    } else {
      return new Response(body as any, { status: 200, headers })
    }
  } catch (err: any) {
    return new NextResponse(`Error fetching file: ${String(err?.message || err)}`, { status: 502 })
  }
}

