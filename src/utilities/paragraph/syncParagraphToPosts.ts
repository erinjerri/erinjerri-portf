import http from 'node:http'
import https from 'node:https'

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import type { Payload, PayloadRequest, RichTextField } from 'payload'

import { Posts } from '../../collections/Posts'
import type { Post } from '../../payload-types'
import { getServerSideURL } from '../getURL'

type SyncMode = 'auto_publish' | 'review'

type ParagraphAuthor = {
  id?: string
  name?: string
}

type ParagraphPost = {
  id: string
  title?: string
  slug?: string
  imageUrl?: string
  publishedAt?: string
  updatedAt?: string
  subtitle?: string
  staticHtml?: string
  json?: string
  markdown?: string
  categories?: string[]
  authors?: ParagraphAuthor[]
  authorIds?: string[]
}

type ParagraphPublication = {
  id: string
  name?: string
  slug?: string
  customDomain?: string
  summary?: string
}

type ParagraphPostsResponse = {
  items?: ParagraphPost[]
  pagination?: {
    hasMore?: boolean
    cursor?: string
    total?: number
  }
}

type ParagraphPublicationResponse = {
  publication?: ParagraphPublication
} & ParagraphPublication

type ParagraphFeedUser = {
  id?: string
  name?: string
  farcaster?: {
    username?: string
    displayName?: string
  }
}

type ParagraphFeedItem = {
  post: ParagraphPost
  publication: ParagraphPublication
  user?: ParagraphFeedUser
}

type ParagraphFeedResponse = {
  items?: ParagraphFeedItem[]
  pagination?: {
    hasMore?: boolean
    cursor?: string
    total?: number
  }
}

type ParagraphPageDiscovery = {
  publicationId?: string
  publicationSlug?: string
  postSlugs: string[]
}

type ImportedPost = {
  id: string
  slug: string
  title: string
  paragraphURL?: string
}

type PayloadFile = {
  name: string
  data: Buffer
  mimetype: string
  size: number
}

export type SyncParagraphToPostsOptions = {
  publication: string
  mode: SyncMode
  notifyEmail?: string
  defaultAuthorID?: string
  defaultAuthorEmail?: string
  maxItems?: number
  forceUpdate?: boolean
  downloadImages?: boolean
  maxImagesPerPost?: number
  includeImageSourceLinks?: boolean
}

const API_BASE = 'https://public.api.paragraph.com/api/v1'
const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json, text/html, image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
} as const

function relationID(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return undefined
}

/** Parse Paragraph's publishedAt (epoch seconds or ISO string) to a valid Date. */
function parseParagraphDate(value: string | number | null | undefined): Date {
  if (value == null || value === '') return new Date()
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isFinite(num)) {
    // Epoch seconds (10 digits) vs milliseconds (13 digits)
    const ms = num < 1e12 ? num * 1000 : num
    const d = new Date(ms)
    if (!Number.isNaN(d.getTime())) return d
  }
  const d = new Date(value as string)
  return Number.isNaN(d.getTime()) ? new Date() : d
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

function normalizeParagraphPublication(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return 'cypherpinay'

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed)
      const path = url.pathname.replace(/^\/+|\/+$/g, '')
      const cleaned = path ? path.replace(/^@/, '') : 'cypherpinay'
      return cleaned
    } catch {
      return trimmed.replace(/^@/, '')
    }
  }

  return trimmed.replace(/^@/, '')
}

function normalizeImageSrc(src: string): { cacheKey: string; original: string } {
  try {
    const url = new URL(src)
    url.search = ''
    url.hash = ''
    return { original: src, cacheKey: `${url.origin}${url.pathname}` }
  } catch {
    return { original: src, cacheKey: src }
  }
}

function getFilenameHintFromImageURL(urlString: string, fallback: string): string {
  const normalizedFallback = toSlug(fallback) || 'paragraph-image'
  try {
    const url = new URL(urlString)
    const lastSegment = url.pathname.split('/').filter(Boolean).pop()
    if (!lastSegment) return normalizedFallback
    const decoded = decodeURIComponent(lastSegment)
    const withoutExt = decoded.replace(/\.[a-z0-9]+$/i, '')
    return toSlug(withoutExt) || normalizedFallback
  } catch {
    return normalizedFallback
  }
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    cache: 'no-store',
    headers: FETCH_HEADERS,
    signal: AbortSignal.timeout(20_000),
  })

  if (!res.ok) {
    throw new Error(`Paragraph API request failed with HTTP ${res.status} for ${url}`)
  }

  return (await res.json()) as T
}

async function fetchPublicationByDomain(domain: string): Promise<ParagraphPublication> {
  const encoded = encodeURIComponent(domain)
  const result = await fetchJSON<ParagraphPublicationResponse>(
    `${API_BASE}/publications/domain/${encoded}`,
  )
  return result.publication ?? result
}

async function fetchPublicationByID(publicationId: string): Promise<ParagraphPublication> {
  return await fetchJSON<ParagraphPublication>(`${API_BASE}/publications/${encodeURIComponent(publicationId)}`)
}

function extractPublicationIDFromHTML(html: string): string | null {
  const patterns = [
    /"publicationId"\s*:\s*"([^"]+)"/,
    /"publication"\s*:\s*\{\s*"id"\s*:\s*"([^"]+)"/,
    /"publication"\s*:\s*\{[^}]*"id"\s*:\s*"([^"]+)"/,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}

function extractPublicationSlugFromHTML(html: string): string | null {
  const patterns = [
    /https:\/\/paragraph\.com\/@([^/"?#]+)\/[^"'\\<\s]+/gi,
    /"slug"\s*:\s*"([^"]+)"/g,
  ]

  for (const pattern of patterns) {
    const match = pattern.exec(html)
    if (match?.[1]) return match[1]
  }

  return null
}

function extractPostSlugsFromHTML(args: { html: string; publicationSlug?: string }): string[] {
  const { html, publicationSlug } = args
  const found = new Set<string>()

  if (publicationSlug) {
    const escaped = publicationSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const absolute = new RegExp(`https://paragraph\\.com/@${escaped}/([^"'?#/\\\\<\\s]+)`, 'gi')
    const relative = new RegExp(`/@${escaped}/([^"'?#/\\\\<\\s]+)`, 'gi')

    for (const pattern of [absolute, relative]) {
      let match: RegExpExecArray | null
      while ((match = pattern.exec(html)) !== null) {
        if (match[1]) found.add(match[1])
      }
    }
  }

  return [...found]
}

async function fetchPublicPageDiscovery(input: string): Promise<ParagraphPageDiscovery | null> {
  const normalized = normalizeParagraphPublication(input)
  const isURL = input.startsWith('http://') || input.startsWith('https://')
  const pageURL = isURL ? input : `https://paragraph.com/@${normalized}`

  try {
    const res = await fetch(pageURL, {
      cache: 'no-store',
      headers: {
        'User-Agent': FETCH_HEADERS['User-Agent'],
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(20_000),
    })

    if (!res.ok) return null
    const html = await res.text()
    const publicationId = extractPublicationIDFromHTML(html)
    const publicationSlug = extractPublicationSlugFromHTML(html) ?? normalized
    const postSlugs = extractPostSlugsFromHTML({ html, publicationSlug })

    return {
      publicationId: publicationId ?? undefined,
      publicationSlug: publicationSlug || undefined,
      postSlugs,
    }
  } catch {
    return null
  }
}

async function fetchPublicationFromPublicPage(input: string): Promise<ParagraphPublication | null> {
  const discovery = await fetchPublicPageDiscovery(input)
  if (!discovery?.publicationId) return null
  return await fetchPublicationByID(discovery.publicationId)
}

function isNotFoundError(err: unknown): boolean {
  if (err instanceof Error && typeof err.message === 'string') {
    return err.message.includes('HTTP 404') || err.message.includes('slug not found')
  }
  return false
}

async function fetchPublicationBySlug(slug: string): Promise<ParagraphPublication> {
  const attempts = [slug]
  if (!slug.startsWith('@')) {
    attempts.push(`@${slug}`)
  } else {
    attempts.push(slug.replace(/^@/, ''))
  }

  for (const candidate of attempts) {
    const encodedSlug = encodeURIComponent(candidate)
    try {
      const result = await fetchJSON<ParagraphPublicationResponse>(
        `${API_BASE}/publications/slug/${encodedSlug}`,
      )
      return result.publication ?? result
    } catch (err) {
      if (isNotFoundError(err) && attempts.length > 1) {
        attempts.shift()
        continue
      }
      throw err
    }
  }

  throw new Error(
    `Paragraph publication slug not found for "${slug}". Try setting PARAGRAPH_PUBLICATION to the exact publication slug from your Paragraph settings (or a custom domain URL).`,
  )
}

async function fetchPostsForPublication(args: {
  publicationId: string
  maxItems?: number
}): Promise<ParagraphPost[]> {
  const { publicationId, maxItems } = args
  const items: ParagraphPost[] = []
  let cursor: string | undefined
  let hasMore = true

  while (hasMore) {
    const limit = Math.min(
      Math.max(typeof maxItems === 'number' && maxItems > 0 ? maxItems - items.length : 25, 1),
      100,
    )

    const search = new URLSearchParams({
      includeContent: 'true',
      limit: String(limit || 25),
    })
    if (cursor) search.set('cursor', cursor)

    const result = await fetchJSON<ParagraphPostsResponse>(
      `${API_BASE}/publications/${encodeURIComponent(publicationId)}/posts?${search.toString()}`,
    )

    items.push(...(result.items ?? []))

    if (typeof maxItems === 'number' && maxItems > 0 && items.length >= maxItems) {
      return items.slice(0, maxItems)
    }

    hasMore = result.pagination?.hasMore === true
    cursor = result.pagination?.cursor
    if (!hasMore || !cursor) break
  }

  return items
}

function matchesParagraphTarget(args: {
  item: ParagraphFeedItem
  normalizedPublication: string
  rawPublication: string
}): boolean {
  const { item, normalizedPublication, rawPublication } = args
  const raw = rawPublication.trim().toLowerCase()
  const normalized = normalizedPublication.replace(/^@/, '').toLowerCase()
  const parsedDomain = raw.startsWith('http://') || raw.startsWith('https://')
    ? (() => {
        try {
          return new URL(rawPublication).hostname.replace(/^www\./, '').toLowerCase()
        } catch {
          return ''
        }
      })()
    : ''

  const candidates = [
    item.publication.slug,
    item.publication.customDomain,
    item.user?.name,
    item.user?.farcaster?.username,
    item.user?.farcaster?.displayName,
  ]
    .filter(Boolean)
    .map((value) => String(value).replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase())

  return candidates.some((candidate) => {
    return (
      candidate === normalized ||
      candidate === `@${normalized}` ||
      candidate === raw ||
      (parsedDomain ? candidate === parsedDomain : false)
    )
  })
}

async function fetchPublicationAndPostsFromFeed(args: {
  publication: string
  normalizedPublication: string
  maxItems?: number
}): Promise<{ publication: ParagraphPublication; posts: ParagraphPost[] } | null> {
  const { publication, normalizedPublication, maxItems } = args
  let cursor: string | undefined
  let hasMore = true
  let matchedPublication: ParagraphPublication | null = null
  const matchedPosts: ParagraphPost[] = []

  while (hasMore) {
    const search = new URLSearchParams({
      includeContent: 'true',
      limit: '60',
    })
    if (cursor) search.set('cursor', cursor)

    const result = await fetchJSON<ParagraphFeedResponse>(`${API_BASE}/posts/feed?${search.toString()}`)
    const items = result.items ?? []

    for (const item of items) {
      if (!matchesParagraphTarget({ item, normalizedPublication, rawPublication: publication })) continue
      matchedPublication = item.publication
      matchedPosts.push(item.post)

      if (typeof maxItems === 'number' && maxItems > 0 && matchedPosts.length >= maxItems) {
        return { publication: matchedPublication, posts: matchedPosts.slice(0, maxItems) }
      }
    }

    hasMore = result.pagination?.hasMore === true
    cursor = result.pagination?.cursor
    if (!hasMore || !cursor) break
  }

  if (!matchedPublication || matchedPosts.length === 0) return null
  return { publication: matchedPublication, posts: matchedPosts }
}

async function fetchPostByPublicationSlug(args: {
  publicationSlug: string
  postSlug: string
}): Promise<ParagraphPost> {
  const { publicationSlug, postSlug } = args
  const encodedPublicationSlug = encodeURIComponent(
    publicationSlug.startsWith('@') ? publicationSlug : `@${publicationSlug}`,
  )
  const encodedPostSlug = encodeURIComponent(postSlug)
  return await fetchJSON<ParagraphPost>(
    `${API_BASE}/publications/slug/${encodedPublicationSlug}/posts/slug/${encodedPostSlug}?includeContent=true`,
  )
}

async function fetchPostsFromPublicPage(args: {
  publication: string
  normalizedPublication: string
  maxItems?: number
}): Promise<{ publication: ParagraphPublication; posts: ParagraphPost[] } | null> {
  const discovery = await fetchPublicPageDiscovery(args.publication)
  if (!discovery?.publicationSlug || discovery.postSlugs.length === 0) return null

  const limitedPostSlugs =
    typeof args.maxItems === 'number' && args.maxItems > 0
      ? discovery.postSlugs.slice(0, args.maxItems)
      : discovery.postSlugs

  const posts: ParagraphPost[] = []
  for (const postSlug of limitedPostSlugs) {
    try {
      const post = await fetchPostByPublicationSlug({
        publicationSlug: discovery.publicationSlug,
        postSlug,
      })
      posts.push(post)
    } catch {
      // Skip individual posts we can't resolve from the public page.
    }
  }

  if (posts.length === 0) return null

  let publication: ParagraphPublication | null = null
  if (discovery.publicationId) {
    try {
      publication = await fetchPublicationByID(discovery.publicationId)
    } catch {
      publication = null
    }
  }

  return {
    publication:
      publication ?? {
        id: discovery.publicationId ?? args.normalizedPublication,
        slug: discovery.publicationSlug,
      },
    posts,
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
    if (process.env.DEBUG_PARAGRAPH_SYNC === 'true') {
      console.warn(`[Paragraph sync] Image fetch HTTP ${res.status} for ${url}`)
    }
    return null
  }

  const contentType = res.headers.get('content-type') || 'application/octet-stream'
  if (!contentType.toLowerCase().startsWith('image/')) {
    if (process.env.DEBUG_PARAGRAPH_SYNC === 'true') {
      console.warn(`[Paragraph sync] Image fetch non-image content-type (${contentType}) for ${url}`)
    }
    return null
  }

  const arrayBuffer = await res.arrayBuffer()
  return { data: Buffer.from(arrayBuffer), contentType }
}

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

    const req = client.request(reqOpts, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        if (process.env.DEBUG_PARAGRAPH_SYNC === 'true') {
          console.warn(`[Paragraph sync] Image https HTTP ${res.statusCode} for ${url}`)
        }
        resolve(null)
        return
      }

      const contentType = res.headers['content-type'] || 'application/octet-stream'
      if (!contentType.toLowerCase().startsWith('image/')) {
        if (process.env.DEBUG_PARAGRAPH_SYNC === 'true') {
          console.warn(
            `[Paragraph sync] Image https non-image content-type (${contentType}) for ${url}`,
          )
        }
        resolve(null)
        return
      }

      const chunks: Uint8Array[] = []
      res.on('data', (chunk: Buffer | Uint8Array) => chunks.push(Uint8Array.from(chunk)))
      res.on('end', () => {
        const total = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
        const data = new Uint8Array(total)
        let offset = 0
        for (const chunk of chunks) {
          data.set(chunk, offset)
          offset += chunk.length
        }
        resolve({ data: Buffer.from(data), contentType })
      })
      res.on('error', () => resolve(null))
    })

    req.setTimeout(timeout, () => {
      req.destroy()
      resolve(null)
    })

    req.on('error', () => resolve(null))
    req.end()
  })
}

async function fetchImageViaPlaywright(
  url: string,
  opts: { referrer?: string; timeout?: number } = {},
): Promise<{ data: Buffer; contentType: string } | null> {
  if (process.env.PARAGRAPH_SYNC_USE_PLAYWRIGHT !== 'true') return null

  try {
    const { referrer, timeout = 20_000 } = opts
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
      if (res.status() >= 400) {
        if (process.env.DEBUG_PARAGRAPH_SYNC === 'true') {
          console.warn(`[Paragraph sync] Image playwright HTTP ${res.status()} for ${url}`)
        }
        return null
      }

      const headers = res.headers()
      const contentType = headers['content-type'] || 'application/octet-stream'
      if (!String(contentType).toLowerCase().startsWith('image/')) {
        if (process.env.DEBUG_PARAGRAPH_SYNC === 'true') {
          console.warn(
            `[Paragraph sync] Image playwright non-image content-type (${contentType}) for ${url}`,
          )
        }
        return null
      }

      const body = await res.body()
      return { data: Buffer.from(new Uint8Array(body)), contentType }
    } finally {
      await context.dispose()
    }
  } catch (err) {
    if (process.env.DEBUG_PARAGRAPH_SYNC === 'true') {
      console.warn(`[Paragraph sync] Image playwright fetch failed for ${url}:`, err)
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
  const fetchers = [fetchImageToBuffer, fetchImageViaHttps, fetchImageViaPlaywright]

  for (const useReferrer of [true, false] as const) {
    for (const fetcher of fetchers) {
      try {
        const result = await fetcher(src, { referrer: useReferrer ? referrer : undefined })
        if (!result) continue

        const ext = extFromMimeType(result.contentType) || 'img'
        const safeBase = toSlug(nameHint) || 'paragraph-image'
        return {
          name: `${safeBase}.${ext}`,
          data: result.data,
          mimetype: result.contentType,
          size: result.data.byteLength,
        }
      } catch (err) {
        if (process.env.DEBUG_PARAGRAPH_SYNC === 'true') {
          console.warn(`[Paragraph sync] Failed to fetch ${src}:`, err)
        }
      }
    }
  }

  return null
}

function buildParagraphPostURL(args: {
  publication: ParagraphPublication
  post: ParagraphPost
  normalizedPublication: string
}): string | undefined {
  const { publication, post, normalizedPublication } = args
  if (!post.slug) return undefined
  if (publication.customDomain) {
    const domain = publication.customDomain.startsWith('http')
      ? publication.customDomain
      : `https://${publication.customDomain}`
    return `${domain.replace(/\/+$/, '')}/${post.slug}`
  }

  const slug = publication.slug || normalizedPublication.replace(/^@/, '')
  return `https://paragraph.com/@${slug}/${post.slug}`
}

function sanitizeParagraphHtml(html: string): string {
  const dom = new JSDOM(html)
  const doc = dom.window.document

  doc.querySelectorAll('iframe, video, embed, object, script, style, noscript').forEach((node) => {
    node.remove()
  })

  doc.querySelectorAll('[data-testid="video-player"], [data-video], [data-embed-type="video"]').forEach(
    (node) => {
      node.remove()
    },
  )

  return doc.body.innerHTML || html
}

function extractHeroImageUrl(html: string, imageUrl?: string): string | null {
  if (imageUrl?.startsWith('http')) return imageUrl
  const dom = new JSDOM(html)
  const firstImg = dom.window.document.querySelector('img[src^="http"]')
  const src = firstImg?.getAttribute('src')
  return src && !src.startsWith('data:') ? src : null
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

export async function syncParagraphToPosts(args: {
  payload: Payload
  req?: PayloadRequest
  options: SyncParagraphToPostsOptions
}): Promise<{
  synced: number
  skipped: number
  errors: number
  imported: ImportedPost[]
}> {
  const { payload, req, options } = args
  const normalizedPublication = normalizeParagraphPublication(options.publication)
  let publication: ParagraphPublication
  let posts: ParagraphPost[] | undefined
  try {
    publication = await fetchPublicationBySlug(normalizedPublication)
  } catch (err) {
    const raw = options.publication.trim()
    const looksLikeURL = raw.startsWith('http://') || raw.startsWith('https://')
    if (!isNotFoundError(err)) throw err

    if (looksLikeURL) {
      const parsed = new URL(raw)
      const domain = parsed.hostname.replace(/^www\./, '')
      const isParagraphDomain = domain.endsWith('paragraph.com')
      if (!isParagraphDomain) {
        publication = await fetchPublicationByDomain(domain)
      } else {
        const discovered = await fetchPublicationFromPublicPage(raw)
        if (!discovered) {
          const pageMatch = await fetchPostsFromPublicPage({
            publication: raw,
            normalizedPublication,
            maxItems: options.maxItems,
          })
          if (!pageMatch) {
            const feedMatch = await fetchPublicationAndPostsFromFeed({
              publication: raw,
              normalizedPublication,
              maxItems: options.maxItems,
            })
            if (!feedMatch) throw err
            publication = feedMatch.publication
            posts = feedMatch.posts
          } else {
            publication = pageMatch.publication
            posts = pageMatch.posts
          }
        } else {
          publication = discovered
        }
      }
    } else {
      const discovered = await fetchPublicationFromPublicPage(raw)
      if (!discovered) {
        const pageMatch = await fetchPostsFromPublicPage({
          publication: raw,
          normalizedPublication,
          maxItems: options.maxItems,
        })
        if (!pageMatch) {
          const feedMatch = await fetchPublicationAndPostsFromFeed({
            publication: raw,
            normalizedPublication,
            maxItems: options.maxItems,
          })
          if (!feedMatch) throw err
          publication = feedMatch.publication
          posts = feedMatch.posts
        } else {
          publication = pageMatch.publication
          posts = pageMatch.posts
        }
      } else {
        publication = discovered
      }
    }
  }

  const resolvedPosts =
    posts ??
    (await fetchPostsForPublication({
      publicationId: publication.id,
      maxItems: options.maxItems,
    }))
  const shouldIncludeImageSourceLinks = options.includeImageSourceLinks !== false

  const contentField = (Posts.fields ?? [])
    .flatMap((field) =>
      field.type === 'tabs' && 'tabs' in field ? (field.tabs ?? []).flatMap((tab) => tab.fields ?? []) : [field],
    )
    .find((field): field is RichTextField => field.type === 'richText' && field.name === 'content')

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
    const asString = typeof id === 'string' || typeof id === 'number' ? String(id) : null
    existingMediaByFilenameCache.set(filename, asString)
    return asString ?? undefined
  }

  const ordered = [...resolvedPosts].reverse()
  for (const paragraphPost of ordered) {
    const paragraphId =
      typeof paragraphPost.id === 'string' || typeof paragraphPost.id === 'number'
        ? String(paragraphPost.id).trim()
        : ''
    if (!paragraphId) {
      skipped++
      continue
    }

    const paragraphURL = buildParagraphPostURL({
      publication,
      post: paragraphPost,
      normalizedPublication,
    })

    const existing = await payload.find({
      collection: 'posts',
      where: { paragraphId: { equals: paragraphId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    let existingDoc = existing.docs[0]
    if (!existingDoc && paragraphURL) {
      const existingByURL = await payload.find({
        collection: 'posts',
        where: { paragraphURL: { equals: paragraphURL } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      existingDoc = existingByURL.docs[0]
    }
    const isUpdate =
      Boolean(existingDoc) &&
      (options.forceUpdate || isLexicalContentEmpty((existingDoc as { content?: unknown })?.content))

    if (existingDoc && !isUpdate) {
      skipped++
      continue
    }

    let html = sanitizeParagraphHtml(paragraphPost.staticHtml || '')
    if (!html || html.trim().length < 10) html = '<p>No content.</p>'

    const heroImageUrl = extractHeroImageUrl(html, paragraphPost.imageUrl)
    const heroNormalized = heroImageUrl ? normalizeImageSrc(heroImageUrl) : null

    if (options.downloadImages !== false) {
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
          if (perPostSeen.has(normalized.cacheKey)) continue
          perPostSeen.add(normalized.cacheKey)

          const altText = img.getAttribute('alt') || paragraphPost.title || 'Paragraph image'

          try {
            let mediaID = uploadedImageCache.get(normalized.cacheKey)
            if (!mediaID) {
              const file = await downloadImageAsFile({
                src,
                nameHint: getFilenameHintFromImageURL(
                  normalized.cacheKey,
                  `${paragraphPost.title || 'post'}-${processed + 1}`,
                ),
                referrer: paragraphURL,
              })

              if (!file) {
                const link = document.createElement('a')
                link.setAttribute('href', src)
                link.setAttribute('rel', 'noopener noreferrer')
                link.textContent = altText || '[Image]'
                img.replaceWith(link)
                continue
              }

              const existingMediaID = await findExistingMediaIDByFilename(file.name)
              let createdMedia: Awaited<ReturnType<typeof payload.create>> | undefined
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

              mediaID = existingMediaID ?? String(createdMedia!.id)
              uploadedImageCache.set(normalized.cacheKey, mediaID)
              uploadedImageCache.set(src, mediaID)
              await new Promise((resolve) => setTimeout(resolve, 150))
            }

            img.setAttribute('data-lexical-upload-relation-to', 'media')
            img.setAttribute('data-lexical-upload-id', mediaID)

            if (shouldIncludeImageSourceLinks) {
              const sourceParagraph = document.createElement('p')
              sourceParagraph.append('Source: ')
              const sourceLink = document.createElement('a')
              sourceLink.setAttribute('href', src)
              sourceLink.setAttribute('rel', 'noopener noreferrer')
              sourceLink.textContent = 'Paragraph'
              sourceParagraph.appendChild(sourceLink)
              img.insertAdjacentElement('afterend', sourceParagraph)
            }

            processed++
          } catch (err) {
            if (process.env.DEBUG_PARAGRAPH_SYNC === 'true') {
              console.warn(`[Paragraph sync] Image import failed for ${src}:`, err)
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
        if (process.env.DEBUG_PARAGRAPH_SYNC === 'true') {
          console.warn(
            `[Paragraph sync] Image import block failed for "${paragraphPost.title ?? paragraphPost.slug}":`,
            err,
          )
        }
      }
    }

    const domForCleanup = new JSDOM(html)
    const docForCleanup = domForCleanup.window.document
    docForCleanup
      .querySelectorAll('img[src^="http"]:not([data-lexical-upload-id])')
      .forEach((img) => {
        const src = img.getAttribute('src')
        if (!src) return
        const link = docForCleanup.createElement('a')
        link.setAttribute('href', src)
        link.setAttribute('rel', 'noopener noreferrer')
        link.textContent = img.getAttribute('alt') || '[Image]'
        img.replaceWith(link)
      })
    html = docForCleanup.body.innerHTML || html

    let heroMediaId: string | undefined
    if (heroNormalized && options.downloadImages !== false) {
      heroMediaId = uploadedImageCache.get(heroNormalized.cacheKey)
      if (!heroMediaId) {
        const heroFile = await downloadImageAsFile({
          src: heroNormalized.original,
          nameHint: getFilenameHintFromImageURL(
            heroNormalized.cacheKey,
            `${paragraphPost.title || 'post'}-hero`,
          ),
          referrer: paragraphURL,
        })

        if (heroFile) {
          try {
            const existingMediaID = await findExistingMediaIDByFilename(heroFile.name)
            let createdMedia: Awaited<ReturnType<typeof payload.create>> | undefined
            if (!existingMediaID) {
              createdMedia = await payload.create({
                collection: 'media',
                data: {
                  mediaType: 'image',
                  alt: paragraphPost.title || 'Hero image',
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
            await new Promise((resolve) => setTimeout(resolve, 150))
          } catch (err) {
            if (process.env.DEBUG_PARAGRAPH_SYNC === 'true') {
              console.warn(
                `[Paragraph sync] Hero image create failed for ${heroNormalized.original}:`,
                err,
              )
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
      console.error(
        `[Paragraph sync] Lexical conversion failed for "${paragraphPost.title ?? paragraphPost.slug}":`,
        err,
      )
      continue
    }

    const slugBase = paragraphPost.slug || toSlug(paragraphPost.title || 'untitled')
    let slug = isUpdate ? (existingDoc!.slug as string) : slugBase || `paragraph-${Date.now().toString(36)}`
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

    const publishedAt = parseParagraphDate(paragraphPost.publishedAt)
    const shouldAutoPublish = options.mode === 'auto_publish'
    const crosspostStatus = shouldAutoPublish ? ('auto_published' as const) : ('in_review' as const)
    const existingHeroImageID = relationID((existingDoc as { heroImage?: unknown } | undefined)?.heroImage)
    const existingMetaImageID = relationID(
      (existingDoc as { meta?: { image?: unknown } } | undefined)?.meta?.image,
    )
    const resolvedHeroImageID = heroMediaId ?? existingHeroImageID
    const resolvedMetaImageID = existingMetaImageID ?? resolvedHeroImageID

    const createData = {
      title: paragraphPost.title || 'Untitled',
      slug,
      content: lexicalContent,
      publishedAt: publishedAt.toISOString(),
      paragraphId,
      paragraphURL,
      crosspostReviewStatus: crosspostStatus,
      _status: (shouldAutoPublish ? 'published' : 'draft') as 'published' | 'draft',
      ...(authors?.length ? { authors } : {}),
      ...(resolvedHeroImageID ? { heroImage: resolvedHeroImageID } : {}),
      meta: {
        ...((existingDoc as { meta?: Record<string, unknown> } | undefined)?.meta ?? {}),
        description: paragraphPost.subtitle?.slice(0, 160) ?? undefined,
        ...(resolvedMetaImageID ? { image: resolvedMetaImageID } : {}),
      },
    }

    try {
      let createdPost: Post | undefined
      let updatedPost: Post | undefined

      if (isUpdate) {
        const updated = await payload.update({
          collection: 'posts',
          id: existingDoc!.id,
          data: {
            title: createData.title,
            content: createData.content,
            crosspostReviewStatus: createData.crosspostReviewStatus,
            meta: createData.meta,
            ...(resolvedHeroImageID ? { heroImage: resolvedHeroImageID } : {}),
          },
          overrideAccess: true,
          context: { disableRevalidate: true },
          ...(req ? { req } : {}),
        })
        updatedPost = updated as Post
      } else {
        createdPost = await payload.create({
          collection: 'posts',
          data: createData,
          overrideAccess: true,
          context: { disableRevalidate: true },
          ...(req ? { req } : {}),
        })
      }

      const result = updatedPost ?? createdPost
      if (!result) {
        errors++
        continue
      }

      imported.push({
        id: String(result.id),
        slug: result.slug,
        title: result.title,
        paragraphURL,
      })
      synced++
    } catch (err) {
      errors++
      const validationErrors =
        err &&
        typeof err === 'object' &&
        'data' in err &&
        Array.isArray((err as { data?: { errors?: unknown } }).data?.errors)
          ? (err as { data: { errors: unknown[] } }).data.errors
          : []

      console.error(
        `[Paragraph sync] Create/update failed for "${paragraphPost.title ?? paragraphPost.slug}":`,
        validationErrors.length > 0 ? JSON.stringify(validationErrors, null, 2) : err,
      )
    }
  }

  if (options.notifyEmail && imported.length > 0) {
    try {
      const serverURL = getServerSideURL()
      const subject =
        options.mode === 'auto_publish'
          ? `Paragraph sync: ${imported.length} post(s) auto-published`
          : `Paragraph sync: ${imported.length} new draft(s) ready for review`

      const lines = imported
        .map((post) => {
          const adminURL = `${serverURL}/admin/collections/posts/${post.id}`
          const publicURL = `${serverURL}/posts/${post.slug}`
          const source = post.paragraphURL ? ` (source: ${post.paragraphURL})` : ''
          return `<li><a href="${adminURL}">${post.title}</a> — <a href="${publicURL}">preview</a>${source}</li>`
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
