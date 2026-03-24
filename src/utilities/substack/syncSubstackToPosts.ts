import https from 'node:https'
import http from 'node:http'
import Parser from 'rss-parser'
import { JSDOM } from 'jsdom'

import type { Payload, PayloadRequest } from 'payload'

import type { RichTextField } from 'payload'

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

import { Posts } from '../../collections/Posts'
import { getServerSideURL } from '../getURL'
import type { Post } from '../../payload-types'

type SyncMode = 'auto_publish' | 'review'

export type SyncSubstackToPostsOptions = {
  /**
   * RSS feed URL, e.g. https://erinjerri.substack.com/feed
   */
  rssURL: string
  /**
   * If `review`, creates draft posts with `crosspostReviewStatus=in_review` and optionally emails you.
   * If `auto_publish`, creates published posts with `crosspostReviewStatus=auto_published`.
   */
  mode: SyncMode
  /**
   * Optional: send a single summary email when new posts are imported.
   */
  notifyEmail?: string
  /**
   * Optional: set author(s) on imported posts.
   */
  defaultAuthorID?: string
  defaultAuthorEmail?: string
  /**
   * Optional: cap number of feed items processed per run.
   */
  maxItems?: number
  /**
   * Optional: when true, re-fetch and update content for existing posts (useful if they were synced with excerpt only).
   */
  forceUpdate?: boolean
  /**
   * If true, downloads <img> URLs from Substack and creates `media` uploads,
   * then rewrites the HTML so the Lexical conversion creates Upload nodes that
   * reference your `media` collection.
   */
  downloadImages?: boolean
  /**
   * Safety cap per post when `downloadImages` is enabled.
   * @default 25
   */
  maxImagesPerPost?: number
  /**
   * If true, append a source link paragraph under each successfully imported image.
   * @default true
   */
  includeImageSourceLinks?: boolean
  /**
   * If true, always fetches the full post HTML from Substack (not just RSS).
   * @default true
   */
  alwaysFetchFullArticle?: boolean
}

type SubstackItem = {
  guid?: string
  link?: string
  title?: string
  content?: string
  'content:encoded'?: string
  contentSnippet?: string
  isoDate?: string
}

type ImportedPost = {
  id: string
  slug: string
  title: string
  substackURL?: string
}

type PayloadFile = {
  name: string
  data: Buffer
  mimetype: string
  size: number
}

function relationID(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return undefined
}

function getPreservedCrosspostStatus(
  existingDoc: Post | undefined,
  fallback: 'in_review' | 'auto_published',
): 'in_review' | 'approved' | 'rejected' | 'auto_published' {
  const existingStatus = existingDoc?.crosspostReviewStatus
  return existingStatus ?? fallback
}

function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function extFromMimeType(mimeType: string): string | undefined {
  const normalized = mimeType.split(';')[0]?.trim().toLowerCase()
  if (!normalized) return undefined
  if (normalized === 'image/jpeg') return 'jpg'
  if (normalized === 'image/png') return 'png'
  if (normalized === 'image/webp') return 'webp'
  if (normalized === 'image/gif') return 'gif'
  if (normalized === 'image/avif') return 'avif'
  if (normalized === 'image/svg+xml') return 'svg'
  return undefined
}

/** Browser-like headers — Substack CDN often blocks Node's default User-Agent */
const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
} as const

/**
 * Extract the underlying S3 URL from Substack CDN URLs.
 * Format: substackcdn.com/image/fetch/w_1456,.../https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2F...
 * S3 public buckets are often less restrictive than the CDN.
 */
function extractSubstackS3Url(src: string): string | null {
  const tryDecode = (value: string): string => {
    let cur = value
    for (let i = 0; i < 5; i++) {
      try {
        const next = decodeURIComponent(cur)
        if (next === cur) break
        cur = next
      } catch {
        break
      }
    }
    return cur
  }

  try {
    const url = new URL(src)
    if (!url.hostname.includes('substackcdn.com') || !url.pathname.includes('/image/fetch/'))
      return null

    const candidates: string[] = []

    // path segments often contain the encoded origin URL
    candidates.push(...url.pathname.split('/').filter(Boolean))

    // sometimes Substack includes the origin URL in query params
    for (const [, v] of url.searchParams.entries()) {
      if (v) candidates.push(v)
    }

    for (let i = candidates.length - 1; i >= 0; i--) {
      const raw = candidates[i]
      if (!raw) continue
      if (!raw.includes('substack-post-media') && !raw.includes('https%3A') && !raw.includes('http'))
        continue

      const decoded = tryDecode(raw)
      if (decoded.startsWith('http') && decoded.includes('substack-post-media')) {
        return decoded
      }
    }
    return null
  } catch {
    return null
  }
}

const SUBSTACK_POST_MEDIA_HOST = 'substack-post-media.s3.amazonaws.com'
const SUBSTACK_POST_MEDIA_PATH_FRAGMENT = '/public/images/'

type NormalizedImageSrc = {
  original: string
  /**
   * If the src is a substackcdn.com/image/fetch URL, this will be the decoded underlying S3 URL.
   * We use it for dedupe because Substack can emit many CDN variants for the same origin.
   */
  s3Url?: string
  /** Stable cache key used for dedupe (prefer s3Url, else cleaned original). */
  cacheKey: string
  /** True only for real Substack post-media images (filters out UI icons/avatars/etc.). */
  isSubstackPostMedia: boolean
}

function normalizeImageSrc(src: string): NormalizedImageSrc {
  const original = src
  const s3Url = extractSubstackS3Url(src) ?? undefined
  const keyBase = s3Url ?? src

  let cacheKey = keyBase
  try {
    const u = new URL(keyBase)
    // Drop query/hash so different variants dedupe
    cacheKey = `${u.origin}${u.pathname}`
  } catch {
    // leave as-is
  }

  const isSubstackPostMedia =
    cacheKey.includes(SUBSTACK_POST_MEDIA_HOST) && cacheKey.includes(SUBSTACK_POST_MEDIA_PATH_FRAGMENT)

  return { original, s3Url, cacheKey, isSubstackPostMedia }
}

function getStableSubstackImageIdFromS3Url(s3Url: string): string | null {
  try {
    const u = new URL(s3Url)
    const last = u.pathname.split('/').filter(Boolean).pop()
    if (!last) return null
    const base = last.split('.').slice(0, -1).join('.')
    const id = base.split('_')[0]
    // UUID-ish: 36 chars with dashes
    if (id && id.length >= 32) return id
    return null
  } catch {
    return null
  }
}

async function fetchImageToBuffer(
  url: string,
  opts: { referrer?: string; timeout?: number } = {},
): Promise<{ data: Buffer; contentType: string } | null> {
  const { referrer, timeout = 15_000 } = opts
  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      ...FETCH_HEADERS,
      ...(referrer ? { Referer: referrer } : {}),
    },
    signal: AbortSignal.timeout(timeout),
  })
  if (!res.ok) {
    if (process.env.DEBUG_SUBSTACK_SYNC === 'true') {
      console.warn(`[Substack sync] Image fetch HTTP ${res.status} for ${url}`)
    }
    return null
  }
  const contentType = res.headers.get('content-type') || 'application/octet-stream'
  if (!contentType.toLowerCase().startsWith('image/')) {
    if (process.env.DEBUG_SUBSTACK_SYNC === 'true') {
      console.warn(
        `[Substack sync] Image fetch non-image content-type (${contentType}) for ${url}`,
      )
    }
    return null
  }
  const arrayBuffer = await res.arrayBuffer()
  return { data: Buffer.from(arrayBuffer), contentType }
}

/** Fallback: Node native https — sometimes works when fetch is blocked by CDN */
function fetchImageViaHttps(
  url: string,
  opts: { referrer?: string; timeout?: number } = {},
): Promise<{ data: Buffer; contentType: string } | null> {
  return new Promise((resolve) => {
    const { referrer, timeout = 15_000 } = opts
    const parsed = new URL(url)
    const isHttps = parsed.protocol === 'https:'
    const client = isHttps ? https : http

    const reqOpts: https.RequestOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        ...FETCH_HEADERS,
        ...(referrer ? { Referer: referrer } : {}),
      },
    }

    const timer = setTimeout(() => {
      req.destroy()
      resolve(null)
    }, timeout)

    const req = client.request(reqOpts, (res) => {
      clearTimeout(timer)
      if (res.statusCode && res.statusCode >= 400) {
        if (process.env.DEBUG_SUBSTACK_SYNC === 'true') {
          console.warn(`[Substack sync] Image https HTTP ${res.statusCode} for ${url}`)
        }
        resolve(null)
        return
      }
      const contentType = res.headers['content-type'] || 'application/octet-stream'
      if (!contentType.toLowerCase().startsWith('image/')) {
        if (process.env.DEBUG_SUBSTACK_SYNC === 'true') {
          console.warn(
            `[Substack sync] Image https non-image content-type (${contentType}) for ${url}`,
          )
        }
        resolve(null)
        return
      }
      const chunks: Uint8Array[] = []
      res.on('data', (chunk: Buffer | Uint8Array) => chunks.push(Uint8Array.from(chunk)))
      res.on('end', () => {
        const total = chunks.reduce((acc, c) => acc + c.length, 0)
        const data = new Uint8Array(total)
        let offset = 0
        for (const c of chunks) {
          data.set(c, offset)
          offset += c.length
        }
        resolve({ data: Buffer.from(data), contentType })
      })
      res.on('error', () => resolve(null))
    })
    req.on('error', () => {
      clearTimeout(timer)
      resolve(null)
    })
    req.end()
  })
}

/** Optional fallback: Playwright request (more browser-like) */
async function fetchImageViaPlaywright(
  url: string,
  opts: { referrer?: string; timeout?: number } = {},
): Promise<{ data: Buffer; contentType: string } | null> {
  if (process.env.SUBSTACK_SYNC_USE_PLAYWRIGHT !== 'true') return null

  try {
    const { referrer, timeout = 20_000 } = opts
    // Lazy import so normal runs don't require Playwright at runtime
    const { default: playwright } = await import('playwright')
    const context = await playwright.request.newContext({
      userAgent: FETCH_HEADERS['User-Agent'],
      extraHTTPHeaders: {
        ...FETCH_HEADERS,
        ...(referrer ? { Referer: referrer } : {}),
      },
      timeout,
    })

    try {
      const res = await context.get(url)
      const status = res.status()
      if (status >= 400) {
        if (process.env.DEBUG_SUBSTACK_SYNC === 'true') {
          console.warn(`[Substack sync] Image playwright HTTP ${status} for ${url}`)
        }
        return null
      }

      const headers = res.headers()
      const contentType = headers['content-type'] || 'application/octet-stream'
      if (!String(contentType).toLowerCase().startsWith('image/')) {
        if (process.env.DEBUG_SUBSTACK_SYNC === 'true') {
          console.warn(
            `[Substack sync] Image playwright non-image content-type (${contentType}) for ${url}`,
          )
        }
        return null
      }

      const body = await res.body()
      return { data: Buffer.from(body), contentType }
    } finally {
      await context.dispose()
    }
  } catch (err) {
    if (process.env.DEBUG_SUBSTACK_SYNC === 'true') {
      console.warn(`[Substack sync] Image playwright fetch failed for ${url}:`, err)
    }
    return null
  }
}

async function downloadImageAsFile(args: {
  src: string
  nameHint: string
  referrer?: string
}): Promise<PayloadFile | null> {
  const { src, nameHint, referrer } = args
  const urlsToTry: string[] = [src]
  const s3Url = extractSubstackS3Url(src)
  if (s3Url && s3Url !== src) urlsToTry.push(s3Url)
  if (process.env.DEBUG_SUBSTACK_SYNC === 'true' && s3Url) {
    console.log(`[Substack sync] Extracted S3 origin URL: ${s3Url}`)
  }

  const tryWithReferrer = [true, false] as const
  const fetchers: Array<
    (u: string, o: { referrer?: string }) => Promise<{ data: Buffer; contentType: string } | null>
  > = [
    fetchImageToBuffer,
    fetchImageViaHttps, // Fallback: native https sometimes works when fetch is blocked
    fetchImageViaPlaywright, // Optional: most browser-like, enable with SUBSTACK_SYNC_USE_PLAYWRIGHT=true
  ]

  for (const url of urlsToTry) {
    for (const useRef of tryWithReferrer) {
      for (const fetcher of fetchers) {
        try {
          const result = await fetcher(url, {
            referrer: useRef ? referrer : undefined,
          })
          if (!result) continue

          const { data, contentType } = result
          const ext = extFromMimeType(contentType) || 'img'
          const safeBase = toSlug(nameHint) || 'substack-image'
          const name = `${safeBase}.${ext}`

          return {
            name,
            data,
            mimetype: contentType,
            size: data.byteLength,
          }
        } catch (err) {
          if (process.env.DEBUG_SUBSTACK_SYNC === 'true') {
            console.warn(`[Substack sync] Failed to fetch (${url}, referrer=${useRef}):`, err)
          }
        }
      }
    }
  }
  return null
}

function getSlugBaseFromLink(link?: string): string | undefined {
  if (!link) return undefined
  try {
    const url = new URL(link)
    const last = url.pathname.split('/').filter(Boolean).pop()
    if (!last) return undefined
    return toSlug(last)
  } catch {
    return undefined
  }
}

/** Substack article body selectors (in order of preference) */
const SUBSTACK_BODY_SELECTORS = [
  '.available-content',
  '.body.markup',
  '[data-test-id="post-content"]',
  '.post .body',
  'article .body',
  '.post-content',
  '.body',
  'article',
]

export type FetchFullArticleResult = {
  html: string
  /** og:image URL from page head — canonical hero/featured image */
  ogImage?: string
}

/**
 * Fetch full article HTML from Substack when RSS only has excerpt.
 * Extracts the post body, rewrites relative image URLs to absolute,
 * and returns og:image for hero image when available.
 */
async function fetchFullArticleHtml(articleUrl: string): Promise<FetchFullArticleResult | null> {
  try {
    const res = await fetch(articleUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; SubstackSync/1.0; +https://github.com/payloadcms)',
      },
      cache: 'no-store',
    })
    if (!res.ok) return null

    const html = await res.text()
    const dom = new JSDOM(html)
    const doc = dom.window.document
    const baseUrl = new URL(articleUrl)

    const ogImage =
      doc.querySelector('meta[property="og:image"]')?.getAttribute('content')?.trim() || undefined

    const extractFromNextData = (): string | null => {
      const script = doc.querySelector('script#__NEXT_DATA__')?.textContent
      if (!script) return null
      try {
        const json = JSON.parse(script) as unknown
        let best = ''

        const visit = (value: unknown): void => {
          if (!value) return
          if (typeof value === 'string') {
            const looksLikeHtml = value.includes('<p') || value.includes('<div') || value.includes('<img')
            if (looksLikeHtml && value.length > best.length) best = value
            return
          }
          if (Array.isArray(value)) {
            for (const v of value) visit(v)
            return
          }
          if (typeof value === 'object') {
            for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
              // prioritize common Substack keys
              if (
                k === 'body_html' ||
                k === 'bodyHtml' ||
                k === 'post_html' ||
                k === 'html' ||
                k === 'content_html'
              ) {
                visit(v)
              } else {
                visit(v)
              }
            }
          }
        }

        visit(json)
        return best.length > 200 ? best : null
      } catch {
        return null
      }
    }

    let bodyEl: Element | null = null
    for (const sel of SUBSTACK_BODY_SELECTORS) {
      bodyEl = doc.querySelector(sel)
      if (bodyEl && bodyEl.textContent && bodyEl.textContent.trim().length > 100) break
    }

    const candidateHtml = bodyEl?.innerHTML || extractFromNextData()
    if (!candidateHtml) return null

    const candidateDom = new JSDOM(candidateHtml)
    const body = candidateDom.window.document.body

    // Rewrite relative img src to absolute (Substack CDN)
    body.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src')
      if (src && !src.startsWith('http')) {
        try {
          img.setAttribute('src', new URL(src, baseUrl.origin).href)
        } catch {
          /* keep original */
        }
      }
    })

    return { html: body.innerHTML, ogImage }
  } catch {
    return null
  }
}

/** Extract hero image URL: prefer og:image, else first img in HTML */
function extractHeroImageUrl(html: string, ogImage?: string): string | null {
  if (ogImage && ogImage.startsWith('http')) return ogImage
  const dom = new JSDOM(html)
  const firstImg = dom.window.document.querySelector('img[src^="http"]')
  const src = firstImg?.getAttribute('src')
  return src && !src.startsWith('data:') ? src : null
}

/** RSS content is often excerpt-only; use full article fetch when content looks truncated */
function shouldFetchFullArticle(item: SubstackItem): boolean {
  const encoded = item['content:encoded'] || item.content || ''
  const snippet = item.contentSnippet || ''
  if (!encoded || encoded.length < 500) return true
  if (snippet && encoded.trim() === snippet.trim()) return true
  if (encoded.includes('Subscribe to read') || encoded.includes('Read more')) return true
  return false
}

function isLexicalContentEmpty(content: unknown): boolean {
  const root = (content as { root?: { children?: unknown[] } })?.root
  const children = root?.children
  if (!Array.isArray(children) || children.length === 0) return true

  const asString = JSON.stringify(content)
  if (asString.length < 250) return true
  if (asString.includes('No content.')) return true
  return false
}

async function resolveDefaultAuthorIDs(args: {
  payload: Payload
  defaultAuthorEmail?: string
  defaultAuthorID?: string
}): Promise<string[] | undefined> {
  const { payload, defaultAuthorEmail, defaultAuthorID } = args

  if (defaultAuthorID) return [defaultAuthorID]

  if (defaultAuthorEmail) {
    const found = await payload.find({
      collection: 'users',
      where: { email: { equals: defaultAuthorEmail } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const id = found.docs?.[0]?.id
    if (typeof id === 'string' || typeof id === 'number') return [String(id)]
  }

  return undefined
}

export async function syncSubstackToPosts(args: {
  payload: Payload
  req?: PayloadRequest
  options: SyncSubstackToPostsOptions
}): Promise<{
  synced: number
  skipped: number
  errors: number
  imported: ImportedPost[]
}> {
  const { payload, req, options } = args
  const shouldIncludeImageSourceLinks = options.includeImageSourceLinks !== false

  const parser = new Parser({
    customFields: {
      item: ['content:encoded', 'content'],
    },
  })

  const feed = await parser.parseURL(options.rssURL)
  const items = (feed.items ?? []) as SubstackItem[]

  const limitedItems =
    typeof options.maxItems === 'number' && options.maxItems > 0
      ? items.slice(0, options.maxItems)
      : items

  const contentField = (Posts.fields ?? []).flatMap((f) =>
    f.type === 'tabs' && 'tabs' in f ? (f.tabs ?? []).flatMap((t) => t.fields ?? []) : [f],
  ).find((f): f is RichTextField => f.type === 'richText' && f.name === 'content')

  const editorConfig = contentField
    ? await editorConfigFactory.fromField({ field: contentField })
    : await editorConfigFactory.default({ config: payload.config })

  let synced = 0
  let skipped = 0
  let errors = 0
  const imported: ImportedPost[] = []
  const uploadedImageCache = new Map<string, string>()
  const existingMediaByFilenameCache = new Map<string, string | null>()

  const findExistingMediaIDByFilename = async (filename: string): Promise<string | undefined> => {
    if (!filename) return undefined
    if (existingMediaByFilenameCache.has(filename)) {
      const cached = existingMediaByFilenameCache.get(filename)
      return cached ?? undefined
    }

    const found = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const id = found.docs?.[0]?.id
    const asString =
      typeof id === 'string' || typeof id === 'number' ? String(id) : null

    existingMediaByFilenameCache.set(filename, asString)
    return asString ?? undefined
  }

  const ordered = [...limitedItems].reverse()
  for (const item of ordered) {
    const substackId = item.guid || item.link
    if (!substackId) {
      skipped++
      continue
    }

    const existing = await payload.find({
      collection: 'posts',
      where: { substackId: { equals: substackId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const existingDoc = existing.docs[0]
    const isUpdate =
      Boolean(existingDoc) &&
      (options.forceUpdate ||
        isLexicalContentEmpty((existingDoc as { content?: unknown })?.content))

    if (existingDoc && !isUpdate) {
      skipped++
      continue
    }

    let html = item['content:encoded'] || item.content || ''
    let ogImage: string | undefined

    const alwaysFetch = options.alwaysFetchFullArticle !== false
    if ((alwaysFetch || shouldFetchFullArticle(item)) && item.link) {
      const fullResult = await fetchFullArticleHtml(item.link)
      if (fullResult) {
        html = fullResult.html
        ogImage = fullResult.ogImage
      }
      await new Promise((r) => setTimeout(r, 600))
    }

    if (!html || html.trim().length < 10) html = '<p>No content.</p>'

    const heroImageUrl = extractHeroImageUrl(html, ogImage)
    const heroNormalized = heroImageUrl ? normalizeImageSrc(heroImageUrl) : null

    const shouldDownloadImages = options.downloadImages !== false
    if (!shouldDownloadImages && process.env.DEBUG_SUBSTACK_SYNC === 'true') {
      console.log(
        `[Substack sync][Media] Skip download for "${item.title ?? item.link}" because downloadImages=false`,
      )
    }
    if (shouldDownloadImages) {
      try {
        const dom = new JSDOM(html)
        const document = dom.window.document
        const images = Array.from(document.querySelectorAll('img'))

        const maxImagesPerPost =
          typeof options.maxImagesPerPost === 'number' && options.maxImagesPerPost > 0
            ? options.maxImagesPerPost
            : 25

        let processed = 0
        const perPostSeen = new Set<string>()
        for (const img of images) {
          if (processed >= maxImagesPerPost) break

          const src = img.getAttribute('src') || ''
          if (!src || src.startsWith('data:')) continue

          const normalized = normalizeImageSrc(src)
          // Skip non-post-media images (icons, avatars, UI chrome) to avoid massive over-import
          if (!normalized.isSubstackPostMedia) continue

          // Deduplicate within the post by stable key (prefer decoded S3 origin)
          if (perPostSeen.has(normalized.cacheKey)) continue
          perPostSeen.add(normalized.cacheKey)

          const altText = img.getAttribute('alt') || item.title || 'Substack image'

          try {
            let mediaID = uploadedImageCache.get(normalized.cacheKey)
            if (!mediaID) {
              const stableId = normalized.s3Url ? getStableSubstackImageIdFromS3Url(normalized.s3Url) : null
              const file = await downloadImageAsFile({
                src,
                nameHint: stableId ? `substack-${stableId}` : `${item.title || 'post'}-${processed + 1}`,
                referrer: item.link,
              })
              if (!file) {
                if (process.env.DEBUG_SUBSTACK_SYNC === 'true') {
                  console.warn(`[Substack sync][Media] Failed to fetch image, falling back to link: ${src}`)
                }
                // Replace failed-download img with link so convertHTMLToLexical doesn't create invalid upload nodes
                const link = document.createElement('a')
                link.setAttribute('href', src)
                link.setAttribute('rel', 'noopener noreferrer')
                link.textContent = altText || '[Image]'
                img.replaceWith(link)
                continue
              }

              const existingMediaID = await findExistingMediaIDByFilename(file.name)
              let createdMedia:
                | Awaited<ReturnType<typeof payload.create>>
                | undefined
              if (!existingMediaID) {
                createdMedia = await payload.create({
                  collection: 'media',
                  data: {
                    mediaType: 'image',
                    alt: altText,
                  },
                  file,
                  overrideAccess: true,
                  context: { disableRevalidate: true },
                  ...(req ? { req } : {}),
                })
              }

              if (process.env.DEBUG_SUBSTACK_SYNC === 'true') {
                if (existingMediaID) {
                  console.log(`[Substack sync] Reused existing image -> media:${existingMediaID} filename=${file.name}`)
                } else {
                  const id = String(createdMedia!.id)
                  const filename =
                    typeof (createdMedia as { filename?: unknown }).filename === 'string'
                      ? ((createdMedia as { filename: string }).filename as string)
                      : null
                  const url =
                    typeof (createdMedia as { url?: unknown }).url === 'string'
                      ? ((createdMedia as { url: string }).url as string)
                      : null

                  console.log(
                    `[Substack sync] Uploaded image -> media:${id}${filename ? ` filename=${filename}` : ''}${
                      url ? ` url=${url}` : ''
                    }`,
                  )
                }
              }

              mediaID = existingMediaID ?? String(createdMedia!.id)
              // Cache on stable key so different CDN variants dedupe in future runs
              uploadedImageCache.set(normalized.cacheKey, mediaID)
              uploadedImageCache.set(src, mediaID)
              if (normalized.s3Url) uploadedImageCache.set(normalized.s3Url, mediaID)
              await new Promise((r) => setTimeout(r, 200))
            }

            img.setAttribute('data-lexical-upload-relation-to', 'media')
            img.setAttribute('data-lexical-upload-id', mediaID)

            if (shouldIncludeImageSourceLinks) {
              const sourceParagraph = document.createElement('p')
              sourceParagraph.append('Source: ')
              const sourceLink = document.createElement('a')
              sourceLink.setAttribute('href', src)
              sourceLink.setAttribute('rel', 'noopener noreferrer')
              sourceLink.textContent = 'Substack'
              sourceParagraph.appendChild(sourceLink)
              img.insertAdjacentElement('afterend', sourceParagraph)
            }

            processed++
          } catch (err) {
            if (process.env.DEBUG_SUBSTACK_SYNC === 'true') {
              console.warn(`[Substack sync][Payload] Validation/create failed for ${src}:`, err)
            }
            const link = document.createElement('a')
            link.setAttribute('href', src)
            link.setAttribute('rel', 'noopener noreferrer')
            link.textContent = altText || '[Image]'
            img.replaceWith(link)
          }
        }

        html = document.body.innerHTML || html
      } catch (err) {
        if (process.env.DEBUG_SUBSTACK_SYNC === 'true') {
          console.warn(
            `[Substack sync] Image import block failed for "${item.title ?? item.link}":`,
            err,
          )
        }
      }
    }

    // Replace any remaining external img (without data-lexical-upload-id) with links so
    // convertHTMLToLexical doesn't produce invalid upload nodes
    const domForCleanup = new JSDOM(html)
    const docForCleanup = domForCleanup.window.document
    docForCleanup.querySelectorAll('img[src^="http"]:not([data-lexical-upload-id])').forEach((img) => {
      const src = img.getAttribute('src')
      if (src) {
        const link = docForCleanup.createElement('a')
        link.setAttribute('href', src)
        link.setAttribute('rel', 'noopener noreferrer')
        link.textContent = img.getAttribute('alt') || '[Image]'
        img.replaceWith(link)
      }
    })
    html = docForCleanup.body.innerHTML || html

    let heroMediaId: string | undefined
    if (heroNormalized?.isSubstackPostMedia && options.downloadImages) {
      heroMediaId = uploadedImageCache.get(heroNormalized.cacheKey)
      if (!heroMediaId) {
        const stableId = heroNormalized.s3Url ? getStableSubstackImageIdFromS3Url(heroNormalized.s3Url) : null
        const heroFile = await downloadImageAsFile({
          src: heroNormalized.original,
          nameHint: stableId ? `substack-${stableId}-hero` : `${item.title || 'post'}-hero`,
          referrer: item.link,
        })
        if (heroFile) {
          try {
            const existingMediaID = await findExistingMediaIDByFilename(heroFile.name)
            let createdMedia:
              | Awaited<ReturnType<typeof payload.create>>
              | undefined
            if (!existingMediaID) {
              createdMedia = await payload.create({
                collection: 'media',
                data: {
                  mediaType: 'image',
                  alt: item.title || 'Hero image',
                },
                file: heroFile,
                overrideAccess: true,
                context: { disableRevalidate: true },
                ...(req ? { req } : {}),
              })
            }
            heroMediaId = existingMediaID ?? String(createdMedia!.id)
            uploadedImageCache.set(heroNormalized.cacheKey, heroMediaId)
            uploadedImageCache.set(heroNormalized.original, heroMediaId)
            if (heroNormalized.s3Url) uploadedImageCache.set(heroNormalized.s3Url, heroMediaId)
            if (process.env.DEBUG_SUBSTACK_SYNC === 'true') {
              console.log(
                existingMediaID
                  ? `[Substack sync] Reused existing hero image -> media:${heroMediaId} filename=${heroFile.name}`
                  : `[Substack sync] Hero image uploaded -> media:${heroMediaId}`,
              )
            }
            await new Promise((r) => setTimeout(r, 200))
          } catch (err) {
            if (process.env.DEBUG_SUBSTACK_SYNC === 'true') {
              console.warn(`[Substack sync] Hero image create failed for ${heroImageUrl}:`, err)
            }
          }
        }
      }
    }

    let lexicalContent: Post['content']
    try {
      lexicalContent = convertHTMLToLexical({
        editorConfig,
        html,
        JSDOM,
      }) as Post['content']
    } catch (err) {
      errors++
      console.error(`[Substack sync] Lexical conversion failed for "${item.title ?? item.link}":`, err)
      continue
    }

    const slugBase = getSlugBaseFromLink(item.link) || toSlug(item.title || 'untitled')
    let slug = isUpdate ? (existingDoc!.slug as string) : slugBase || `substack-${Date.now().toString(36)}`
    let attempts = 0

    if (!isUpdate) {
      while (attempts < 5) {
        const exists = await payload.find({
          collection: 'posts',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        if (exists.docs.length === 0) break
        slug = `${slugBase}-${Date.now().toString(36)}`
        attempts++
      }
    }

    const authors = await resolveDefaultAuthorIDs({
      payload,
      defaultAuthorEmail: options.defaultAuthorEmail,
      defaultAuthorID: options.defaultAuthorID,
    })

    const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date()
    const shouldAutoPublish = options.mode === 'auto_publish'

    try {
      const crosspostStatus = getPreservedCrosspostStatus(
        existingDoc,
        shouldAutoPublish ? 'auto_published' : 'in_review',
      )
      const existingHeroImageID = relationID((existingDoc as { heroImage?: unknown } | undefined)?.heroImage)
      const existingMetaImageID = relationID(
        (existingDoc as { meta?: { image?: unknown } } | undefined)?.meta?.image,
      )
      const resolvedHeroImageID = heroMediaId ?? existingHeroImageID
      const resolvedMetaImageID = existingMetaImageID ?? resolvedHeroImageID
      const data = {
        title: item.title || 'Untitled',
        slug,
        content: lexicalContent,
        publishedAt: publishedAt.toISOString(),
        substackId,
        substackURL: item.link,
        crosspostReviewStatus: crosspostStatus,
        _status: (shouldAutoPublish ? 'published' : 'draft') as 'published' | 'draft',
        ...(authors?.length ? { authors } : {}),
        ...(resolvedHeroImageID ? { heroImage: resolvedHeroImageID } : {}),
        meta: {
          ...((existingDoc as { meta?: Record<string, unknown> } | undefined)?.meta ?? {}),
          description: item.contentSnippet?.slice(0, 160) ?? undefined,
          ...(resolvedMetaImageID ? { image: resolvedMetaImageID } : {}),
        },
      }

      // On update, filter relatedPosts to only valid IDs (avoids "invalid selections" when refs are deleted)
      const validRelatedIds =
        isUpdate && existingDoc
          ? await (async () => {
              const raw = (existingDoc as { relatedPosts?: Array<unknown> }).relatedPosts ?? []
              const ids = raw
                .map((r) => (typeof r === 'object' && r && 'id' in r ? (r as { id: string }).id : r))
                .filter((id): id is string => typeof id === 'string')
              const selfId = String(existingDoc.id)
              const out: string[] = []
              for (const rid of ids) {
                if (rid === selfId) continue
                try {
                  const found = await payload.findByID({
                    collection: 'posts',
                    id: rid,
                    depth: 0,
                    overrideAccess: true,
                  })
                  if (found) out.push(rid)
                } catch {
                  // Ref deleted or invalid; skip
                }
              }
              return out
            })()
          : []

      const result = isUpdate
        ? await payload.update({
            collection: 'posts',
            id: existingDoc!.id,
            data: {
              title: data.title,
              content: data.content,
              substackURL: data.substackURL,
              crosspostReviewStatus: data.crosspostReviewStatus,
              publishedAt: data.publishedAt,
              meta: data.meta,
              ...(resolvedHeroImageID ? { heroImage: resolvedHeroImageID } : {}),
              relatedPosts: validRelatedIds,
            },
            overrideAccess: true,
            context: { disableRevalidate: true },
            ...(req ? { req } : {}),
          })
        : await payload.create({
            collection: 'posts',
            data,
            overrideAccess: true,
            context: { disableRevalidate: true },
            ...(req ? { req } : {}),
          })

      imported.push({
        id: String(result.id),
        slug: result.slug as string,
        title: result.title as string,
        substackURL: item.link,
      })
      synced++
    } catch (err) {
      errors++
      const validationErrors =
        err && typeof err === 'object' && 'data' in err && Array.isArray((err as { data?: { errors?: unknown } }).data?.errors)
          ? (err as { data: { errors: unknown[] } }).data.errors
          : []
      console.error(
        `[Substack sync] Create/update failed for "${item.title ?? item.link}":`,
        validationErrors.length > 0 ? JSON.stringify(validationErrors, null, 2) : err,
      )
    }
  }

  if (options.notifyEmail && imported.length > 0) {
    try {
      const serverURL = getServerSideURL()
      const subject =
        options.mode === 'auto_publish'
          ? `Substack sync: ${imported.length} post(s) auto-published`
          : `Substack sync: ${imported.length} new draft(s) ready for review`

      const lines = imported
        .map((p) => {
          const adminURL = `${serverURL}/admin/collections/posts/${p.id}`
          const publicURL = `${serverURL}/posts/${p.slug}`
          const source = p.substackURL ? ` (source: ${p.substackURL})` : ''
          return `<li><a href="${adminURL}">${p.title}</a> — <a href="${publicURL}">preview</a>${source}</li>`
        })
        .join('')

      await payload.email.sendEmail({
        to: options.notifyEmail,
        subject,
        html: `<p>${subject}.</p><ul>${lines}</ul>`,
      })
    } catch {
      // Email failures should not fail the sync itself.
    }
  }

  return { synced, skipped, errors, imported }
}
