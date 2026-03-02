#!/usr/bin/env npx tsx
/**
 * Upload public/media to R2. Uses your existing R2 env vars (R2_BUCKET, R2_ACCESS_KEY_ID, etc.).
 * Run: pnpm upload:media
 *
 * Requires: R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID (or R2_ENDPOINT)
 */

import 'dotenv/config'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readdir, readFile, stat } from 'fs/promises'
import path from 'path'

const MEDIA_DIR = path.join(process.cwd(), 'public/media')
const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif|svg)$/i

async function collectFiles(dir: string, base = ''): Promise<string[]> {
  const entries = await readdir(path.join(dir, base), { withFileTypes: true })
  const paths: string[] = []
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name
    if (e.isDirectory()) {
      paths.push(...(await collectFiles(dir, rel)))
    } else if (e.isFile() && IMAGE_EXT.test(e.name)) {
      paths.push(rel)
    }
  }
  return paths
}

async function main() {
  const bucket = process.env.R2_BUCKET?.trim()
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim()
  const accountId = process.env.R2_ACCOUNT_ID?.trim()
  const endpoint =
    process.env.R2_ENDPOINT?.trim() ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined)

  if (!bucket || !accessKeyId || !secretAccessKey || !endpoint) {
    console.error('Missing R2 env vars. Need: R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID')
    process.exit(1)
  }

  const dirStat = await stat(MEDIA_DIR).catch(() => null)
  if (!dirStat?.isDirectory()) {
    console.error(`Directory not found: ${MEDIA_DIR}`)
    process.exit(1)
  }

  const client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: process.env.R2_FORCE_PATH_STYLE !== 'false',
  })

  const files = await collectFiles(MEDIA_DIR)
  console.log(`Uploading ${files.length} files to r2:${bucket}/media/`)

  const cacheControl = process.env.R2_CACHE_CONTROL?.trim() || 'public, max-age=31536000, immutable'

  for (const rel of files) {
    const fullPath = path.join(MEDIA_DIR, rel)
    // Ensure S3 key is safe (encode URI components for segments)
    const key = `media/${rel
      .split('/')
      .map((s) => encodeURIComponent(s))
      .join('/')}`

    try {
      const body = await readFile(fullPath)
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: rel.endsWith('.png')
            ? 'image/png'
            : rel.endsWith('.webp')
              ? 'image/webp'
              : rel.endsWith('.gif')
                ? 'image/gif'
                : rel.endsWith('.svg')
                  ? 'image/svg+xml'
                  : 'image/jpeg',
          CacheControl: cacheControl,
        }),
      )
      console.log(`✓ ${rel}`)
    } catch (err) {
      console.error(`✗ ${rel}:`, err instanceof Error ? err.message : err)
    }
  }

  console.log('\nDone.')
}

main()
