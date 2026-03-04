import Parser from 'rss-parser'
import { JSDOM } from 'jsdom'

import type { Payload, PayloadRequest } from 'payload'

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

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

async function downloadImageAsFile(args: { src: string; nameHint: string }): Promise<PayloadFile | null> {
  const { src, nameHint } = args
  try {
    const res = await fetch(src, { cache: 'no-store' })
    if (!res.ok) return null

    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    if (!contentType.toLowerCase().startsWith('image/')) return null

    const arrayBuffer = await res.arrayBuffer()
    const data = Buffer.from(arrayBuffer)

    const ext = extFromMimeType(contentType) || 'img'
    const safeBase = toSlug(nameHint) || 'substack-image'
    const name = `${safeBase}.${ext}`

    return {
      name,
      data,
      mimetype: contentType,
      size: data.byteLength,
    }
  } catch {
    return null
  }
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

/**
 * Fetch full article HTML from Substack when RSS only has excerpt.
 * Extracts the post body and rewrites relative image URLs to absolute.
 */
async function fetchFullArticleHtml(articleUrl: string): Promise<string | null> {
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

    return body.innerHTML
  } catch {
    return null
  }
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

  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  let synced = 0
  let skipped = 0
  let errors = 0
  const imported: ImportedPost[] = []
  const uploadedImageCache = new Map<string, string>()

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

    const alwaysFetch = options.alwaysFetchFullArticle !== false
    if ((alwaysFetch || shouldFetchFullArticle(item)) && item.link) {
      const fullHtml = await fetchFullArticleHtml(item.link)
      if (fullHtml) html = fullHtml
      await new Promise((r) => setTimeout(r, 600))
    }

    if (!html || html.trim().length < 10) html = '<p>No content.</p>'

    const shouldDownloadImages = options.downloadImages !== false
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
        for (const img of images) {
          if (processed >= maxImagesPerPost) break

          const src = img.getAttribute('src') || ''
          if (!src || src.startsWith('data:')) continue

          let mediaID = uploadedImageCache.get(src)
          if (!mediaID) {
            const file = await downloadImageAsFile({
              src,
              nameHint: `${item.title || 'post'}-${processed + 1}`,
            })
            if (!file) continue

            const createdMedia = await payload.create({
              collection: 'media',
              data: {
                mediaType: 'image',
                alt: img.getAttribute('alt') || item.title || 'Substack image',
              },
              file,
              overrideAccess: true,
              ...(req ? { req } : {}),
            })

            mediaID = String(createdMedia.id)
            uploadedImageCache.set(src, mediaID)
          }

          img.setAttribute('data-lexical-upload-relation-to', 'media')
          img.setAttribute('data-lexical-upload-id', mediaID)
          processed++
        }

        html = document.body.innerHTML || html
      } catch {
        // ignore image download failures; continue with HTML
      }
    }

    let lexicalContent: Post['content']
    try {
      lexicalContent = convertHTMLToLexical({
        editorConfig,
        html,
        JSDOM,
      }) as Post['content']
    } catch {
      errors++
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
      const crosspostStatus = shouldAutoPublish ? ('auto_published' as const) : ('in_review' as const)
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
        meta: {
          description: item.contentSnippet?.slice(0, 160) ?? undefined,
        },
      }

      const result = isUpdate
        ? await payload.update({
            collection: 'posts',
            id: existingDoc!.id,
            data: {
              title: data.title,
              content: data.content,
              substackURL: data.substackURL,
              crosspostReviewStatus: data.crosspostReviewStatus,
              meta: data.meta,
            },
            overrideAccess: true,
            ...(req ? { req } : {}),
          })
        : await payload.create({
            collection: 'posts',
            data,
            overrideAccess: true,
            ...(req ? { req } : {}),
          })

      imported.push({
        id: String(result.id),
        slug: result.slug as string,
        title: result.title as string,
        substackURL: item.link,
      })
      synced++
    } catch {
      errors++
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
