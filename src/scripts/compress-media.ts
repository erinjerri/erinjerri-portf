#!/usr/bin/env npx tsx
/**
 * Compress images in public/media in-place. No download/upload — works on local files.
 *
 * Run: pnpm compress:media
 *
 * Options:
 *   --input <dir>   Source directory (default: public/media)
 *   --quality <n>   Quality 1-100 (default: 80)
 *   --max-width <n> Max dimension (default: 1920)
 *   --dry-run       Preview without writing
 */

import sharp from 'sharp'
import { readdir, readFile, writeFile, stat } from 'fs/promises'
import path from 'path'

const IMAGE_EXT = /\.(jpg|jpeg|png|webp)$/i

function parseArgs(): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {}
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      if (process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) {
        args[key] = process.argv[++i]
      } else {
        args[key] = true
      }
    }
  }
  return args
}

async function collectImagePaths(dir: string, base = ''): Promise<string[]> {
  const entries = await readdir(path.join(dir, base), { withFileTypes: true })
  const paths: string[] = []
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name
    if (e.isDirectory()) {
      paths.push(...(await collectImagePaths(dir, rel)))
    } else if (e.isFile() && IMAGE_EXT.test(e.name)) {
      paths.push(rel)
    }
  }
  return paths
}

async function main() {
  const args = parseArgs()
  const inputDir = path.resolve(process.cwd(), (args.input as string) || 'public/media')
  const quality = Math.min(100, Math.max(1, parseInt(String(args.quality || 80), 10)))
  const maxWidth = parseInt(String(args.maxWidth || 1920), 10) || 1920
  const dryRun = Boolean(args['dry-run'])

  const dirStat = await stat(inputDir).catch(() => null)
  if (!dirStat?.isDirectory()) {
    console.error(`Directory not found: ${inputDir}`)
    process.exit(1)
  }

  const files = await collectImagePaths(inputDir)
  console.log(`Found ${files.length} image(s) in ${inputDir}`)
  if (files.length === 0) {
    process.exit(0)
  }

  let totalSaved = 0
  for (const rel of files) {
    const fullPath = path.join(inputDir, rel)
    const ext = path.extname(rel).toLowerCase()

    try {
      const buffer = await readFile(fullPath)
      const pipeline = sharp(buffer).resize(maxWidth, maxWidth, {
        fit: 'inside',
        withoutEnlargement: true,
      })

      let result: Buffer
      if (['.jpg', '.jpeg'].includes(ext)) {
        result = await pipeline.jpeg({ quality }).toBuffer()
      } else if (ext === '.png') {
        result = await pipeline.png({ compressionLevel: 6 }).toBuffer()
      } else {
        result = await pipeline.webp({ quality }).toBuffer()
      }

      const saved = buffer.length - result.length
      totalSaved += saved

      if (dryRun) {
        console.log(`Would compress: ${rel} (${(saved / 1024).toFixed(1)} KB saved)`)
        continue
      }

      await writeFile(fullPath, new Uint8Array(result))
      console.log(`✓ ${rel} (${(saved / 1024).toFixed(1)} KB saved)`)
    } catch (err) {
      console.error(`✗ ${rel}:`, err instanceof Error ? err.message : err)
    }
  }

  if (!dryRun && totalSaved > 0) {
    console.log(`\nDone. Total saved: ${(totalSaved / 1024).toFixed(1)} KB`)
  }
}

main()
