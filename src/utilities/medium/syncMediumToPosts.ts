import http from 'node:http'
import https from 'node:https'

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import type { Payload, PayloadRequest, RichTextField } from 'payload'
import Parser from 'rss-parser'

import { Posts } from '../../collections/Posts'
import type { Post } from '../../payload-types'
import { getServerSideURL } from '../getURL'

type SyncMode = 'auto_publish' | 'review'

export type SyncMediumToPostsOptions = {
  rssURL: string
  mode: SyncMode
  notifyEmail?: string
  defaultAuthorID?: string
  defaultAuthorEmail?: string
  maxItems?: number
  forceUpdate?: boolean
  downloadImages?: boolean
  maxImagesPerPost?: number
  includeImageSourceLinks?: boolean
  alwaysFetchFullArticle?: boolean
}

type MediumItem = {
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
  mediumURL?: string
}

type PayloadFile = {
  name: string
  data: Buffer
  mimetype: string
  size: number
}

type FetchFullArticleResult = {
  html: string
  ogImage?: string
}

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
} as const

const RSS_HEADERS = {
  'User-Agent': FETCH_HEADERS['User-Agent'],
  Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
  'Accept-Language': FETCH_HEADERS['Accept-Language'],
} as const

const MEDIUM_ARTICLE_SELECTORS = [
  'article',
  'main article',
  '[data-testid="storyContent"]',
  'main',
]

function relationID(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return undefined
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

function normalizeMediumImageSrc(src: string): { cacheKey: string; original: string } {
  try {
    const url = new URL(src)

    if (url.hostname === 'miro.medium.com') {
      url.search = ''
      url.hash = ''

      const resizePrefix = '/v2/resize:'
      if (url.pathname.startsWith(resizePrefix)) {
        const segments = url.pathname.split('/').filter(Boolean)
        const assetIndex = segments.findIndex(
          (segment) => segment.startsWith('1*') || segment.startsWith('0*') || /\.(png|jpe?g|webp|gif|avif)$/i.test(segment),
        )

        if (assetIndex >= 0) {
          url.pathname = `/${segments.slice(assetIndex).join('/')}`
        }
      }

      return {
        original: src,
        cacheKey: `${url.origin}${url.pathname}`,
      }
    }

    url.search = ''
    url.hash = ''
    return {
      original: src,
      cacheKey: `${url.origin}${url.pathname}`,
    }
  } catch {
    return { original: src, cacheKey: src }
  }
}

function getFilenameHintFromImageURL(urlString: string, fallback: string): string {
  const normalizedFallback = toSlug(fallback) || 'medium-image'
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
    if (process.env.DEBUG_MEDIUM_SYNC === 'true') {
      console.warn(`[Medium sync] Image fetch HTTP ${res.status} for ${url}`)
    }
    return null
  }

  const contentType = res.headers.get('content-type') || 'application/octet-stream'
  if (!contentType.toLowerCase().startsWith('image/')) {
    if (process.env.DEBUG_MEDIUM_SYNC === 'true') {
      console.warn(`[Medium sync] Image fetch non-image content-type (${contentType}) for ${url}`)
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
        if (process.env.DEBUG_MEDIUM_SYNC === 'true') {
          console.warn(`[Medium sync] Image https HTTP ${res.statusCode} for ${url}`)
        }
        resolve(null)
        return
      }

      const contentType = res.headers['content-type'] || 'application/octet-stream'
      if (!contentType.toLowerCase().startsWith('image/')) {
        if (process.env.DEBUG_MEDIUM_SYNC === 'true') {
          console.warn(
            `[Medium sync] Image https non-image content-type (${contentType}) for ${url}`,
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
  if (process.env.MEDIUM_SYNC_USE_PLAYWRIGHT !== 'true') return null

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
        if (process.env.DEBUG_MEDIUM_SYNC === 'true') {
          console.warn(`[Medium sync] Image playwright HTTP ${res.status()} for ${url}`)
        }
        return null
      }

      const headers = res.headers()
      const contentType = headers['content-type'] || 'application/octet-stream'
      if (!String(contentType).toLowerCase().startsWith('image/')) {
        if (process.env.DEBUG_MEDIUM_SYNC === 'true') {
          console.warn(
            `[Medium sync] Image playwright non-image content-type (${contentType}) for ${url}`,
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
    if (process.env.DEBUG_MEDIUM_SYNC === 'true') {
      console.warn(`[Medium sync] Image playwright fetch failed for ${url}:`, err)
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
        const safeBase = toSlug(nameHint) || 'medium-image'
        return {
          name: `${safeBase}.${ext}`,
          data: result.data,
          mimetype: result.contentType,
          size: result.data.byteLength,
        }
      } catch (err) {
        if (process.env.DEBUG_MEDIUM_SYNC === 'true') {
          console.warn(`[Medium sync] Failed to fetch ${src}:`, err)
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

function shouldFetchFullArticle(item: MediumItem): boolean {
  const encoded = item['content:encoded'] || item.content || ''
  const snippet = item.contentSnippet || ''
  if (!encoded || encoded.length < 500) return true
  if (snippet && encoded.trim() === snippet.trim()) return true
  if (encoded.includes('Continue reading') || encoded.includes('Read more')) return true
  return false
}

async function fetchMediumFeed(rssURL: string): Promise<MediumItem[]> {
  const parser = new Parser({
    customFields: {
      item: ['content:encoded', 'content'],
    },
  })

  const res = await fetch(rssURL, {
    cache: 'no-store',
    headers: RSS_HEADERS,
    signal: AbortSignal.timeout(20_000),
  })

  if (!res.ok) {
    throw new Error(`Medium RSS fetch failed with HTTP ${res.status} for ${rssURL}`)
  }

  const xml = await res.text()
  const feed = await parser.parseString(xml)
  return (feed.items ?? []) as MediumItem[]
}

async function fetchFullArticleHtml(articleUrl: string): Promise<FetchFullArticleResult | null> {
  try {
    const res = await fetch(articleUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': RSS_HEADERS['User-Agent'],
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(20_000),
    })

    if (!res.ok) return null

    const html = await res.text()
    const dom = new JSDOM(html)
    const doc = dom.window.document

    const ogImage =
      doc.querySelector('meta[property="og:image"]')?.getAttribute('content')?.trim() || undefined

    const article = MEDIUM_ARTICLE_SELECTORS.map((selector) => doc.querySelector(selector)).find(
      (node): node is Element => Boolean(node && node.textContent && node.textContent.trim().length > 100),
    )

    if (!article) return null

    const clone = article.cloneNode(true) as Element
    clone.querySelectorAll('button, svg, noscript, form, footer').forEach((node) => node.remove())

    return { html: clone.innerHTML, ogImage }
  } catch {
    return null
  }
}

function extractHeroImageUrl(html: string, ogImage?: string): string | null {
  if (ogImage && ogImage.startsWith('http')) return ogImage
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

export async function syncMediumToPosts(args: {
  payload: Payload
  req?: PayloadRequest
  options: SyncMediumToPostsOptions
}): Promise<{
  synced: number
  skipped: number
  errors: number
  imported: ImportedPost[]
}> {
  const { payload, req, options } = args
  const shouldIncludeImageSourceLinks = options.includeImageSourceLinks !== false
  const items = await fetchMediumFeed(options.rssURL)

  const limitedItems =
    typeof options.maxItems === 'number' && options.maxItems > 0
      ? items.slice(0, options.maxItems)
      : items

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

  const ordered = [...limitedItems].reverse()
  for (const item of ordered) {
    const mediumId = item.guid || item.link
    if (!mediumId) {
      skipped++
      continue
    }

    const existing = await payload.find({
      collection: 'posts',
      where: { mediumId: { equals: mediumId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const existingDoc = existing.docs[0]
    const isUpdate =
      Boolean(existingDoc) &&
      (options.forceUpdate || isLexicalContentEmpty((existingDoc as { content?: unknown })?.content))

    if (existingDoc && !isUpdate) {
      skipped++
      continue
    }

    let html = item['content:encoded'] || item.content || ''
    let ogImage: string | undefined

    const alwaysFetch = options.alwaysFetchFullArticle === true
    if ((alwaysFetch || shouldFetchFullArticle(item)) && item.link) {
      const fullResult = await fetchFullArticleHtml(item.link)
      if (fullResult) {
        html = fullResult.html
        ogImage = fullResult.ogImage
      }
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    if (!html || html.trim().length < 10) html = '<p>No content.</p>'

    const heroImageUrl = extractHeroImageUrl(html, ogImage)
    const heroNormalized = heroImageUrl ? normalizeMediumImageSrc(heroImageUrl) : null

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

          const normalized = normalizeMediumImageSrc(src)
          if (perPostSeen.has(normalized.cacheKey)) continue
          perPostSeen.add(normalized.cacheKey)

          const altText = img.getAttribute('alt') || item.title || 'Medium image'

          try {
            let mediaID = uploadedImageCache.get(normalized.cacheKey)
            if (!mediaID) {
              const file = await downloadImageAsFile({
                src,
                nameHint: getFilenameHintFromImageURL(normalized.cacheKey, `${item.title || 'post'}-${processed + 1}`),
                referrer: item.link,
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
              sourceLink.textContent = 'Medium'
              sourceParagraph.appendChild(sourceLink)
              img.insertAdjacentElement('afterend', sourceParagraph)
            }

            processed++
          } catch (err) {
            if (process.env.DEBUG_MEDIUM_SYNC === 'true') {
              console.warn(`[Medium sync] Image import failed for ${src}:`, err)
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
        if (process.env.DEBUG_MEDIUM_SYNC === 'true') {
          console.warn(`[Medium sync] Image import block failed for "${item.title ?? item.link}":`, err)
        }
      }
    }

    const domForCleanup = new JSDOM(html)
    const docForCleanup = domForCleanup.window.document
    docForCleanup.querySelectorAll('img[src^="http"]:not([data-lexical-upload-id])').forEach((img) => {
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
          nameHint: getFilenameHintFromImageURL(heroNormalized.cacheKey, `${item.title || 'post'}-hero`),
          referrer: item.link,
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
            await new Promise((resolve) => setTimeout(resolve, 150))
          } catch (err) {
            if (process.env.DEBUG_MEDIUM_SYNC === 'true') {
              console.warn(`[Medium sync] Hero image create failed for ${heroNormalized.original}:`, err)
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
      console.error(`[Medium sync] Lexical conversion failed for "${item.title ?? item.link}":`, err)
      continue
    }

    const slugBase = getSlugBaseFromLink(item.link) || toSlug(item.title || 'untitled')
    let slug = isUpdate ? (existingDoc!.slug as string) : slugBase || `medium-${Date.now().toString(36)}`
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
    const crosspostStatus = shouldAutoPublish ? ('auto_published' as const) : ('in_review' as const)
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
      mediumId,
      mediumURL: item.link,
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

    try {
      const result = isUpdate
        ? await payload.update({
            collection: 'posts',
            id: existingDoc!.id,
            data: {
              title: data.title,
              content: data.content,
              mediumURL: data.mediumURL,
              crosspostReviewStatus: data.crosspostReviewStatus,
              meta: data.meta,
              ...(resolvedHeroImageID ? { heroImage: resolvedHeroImageID } : {}),
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
        mediumURL: item.link,
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
        `[Medium sync] Create/update failed for "${item.title ?? item.link}":`,
        validationErrors.length > 0 ? JSON.stringify(validationErrors, null, 2) : err,
      )
    }
  }

  if (options.notifyEmail && imported.length > 0) {
    try {
      const serverURL = getServerSideURL()
      const subject =
        options.mode === 'auto_publish'
          ? `Medium sync: ${imported.length} post(s) auto-published`
          : `Medium sync: ${imported.length} new draft(s) ready for review`

      const lines = imported
        .map((post) => {
          const adminURL = `${serverURL}/admin/collections/posts/${post.id}`
          const publicURL = `${serverURL}/posts/${post.slug}`
          const source = post.mediumURL ? ` (source: ${post.mediumURL})` : ''
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
