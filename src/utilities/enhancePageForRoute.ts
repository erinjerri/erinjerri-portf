import type { Page, StatStripBlock } from '@/payload-types'

type LayoutBlock = NonNullable<Page['layout']>[number]

const SPEAKING_FORM_SLUG = '/speaking-info'
const SPEAKING_BOOKING_URL_FRAGMENT = 'cal.com/erinjerri/45min'

/** Slugs that get the default book metrics strip. Override with BOOK_PAGE_SLUG (comma-separated). */
const DEFAULT_BOOK_PAGE_SLUGS = [
  'creating-ar-vr-book',
  'creating-ar-vr',
  'creating-arvr-book',
  'creating-arvr',
  'book-creating-ar-vr',
] as const

function bookPageSlugList(): string[] {
  const raw = typeof process.env.BOOK_PAGE_SLUG === 'string' ? process.env.BOOK_PAGE_SLUG.trim() : ''
  if (raw) {
    return raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  }
  return [...DEFAULT_BOOK_PAGE_SLUGS]
}

function isBookMetricsPageSlug(slug: string): boolean {
  return bookPageSlugList().includes(slug.toLowerCase())
}

/** Metrics row for /creating-ar-vr-book (includes #1 Amazon Game Programming). */
function bookStatStripBlock(): StatStripBlock {
  return {
    blockType: 'statStrip',
    blockName: 'Book metrics',
    eyebrow: 'By Erin Jerri Pañgilinan & co-authors',
    columns: 'four',
    emphasis: 'bold',
    items: [
      { value: '42+', label: 'COUNTRIES DISTRIBUTED' },
      { value: '#1', label: 'AMAZON GAME PROGRAMMING' },
      { value: '10K+', label: 'FOLLOWERS ACROSS PLATFORMS' },
      { value: '3', label: 'LANGUAGES: EN · ZH · KO' },
    ],
  }
}

function rewriteSpeakingCtaUrls<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteSpeakingCtaUrls(item)) as T
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const next: Record<string, unknown> = {}

  for (const [key, currentValue] of Object.entries(value)) {
    if (
      key === 'url' &&
      typeof currentValue === 'string' &&
      currentValue.toLowerCase().includes(SPEAKING_BOOKING_URL_FRAGMENT)
    ) {
      next[key] = SPEAKING_FORM_SLUG
      continue
    }

    next[key] = rewriteSpeakingCtaUrls(currentValue)
  }

  return next as T
}

function statStripItemCount(block: LayoutBlock | undefined): number {
  if (!block || block.blockType !== 'statStrip') return 0
  return (block as StatStripBlock).items?.length ?? 0
}

/** Any stat strip with four filled rows — treat as “already has metrics” so we don’t duplicate. */
function layoutHasFourItemStatStrip(layout: Page['layout']): boolean {
  const blocks = Array.isArray(layout) ? layout : []
  return blocks.some((b) => b?.blockType === 'statStrip' && statStripItemCount(b) >= 4)
}

/**
 * Ensures the bordered metrics row (42+, #1 Amazon Game Programming, 10K+, 3 languages) is present.
 * Prepends the canonical strip if no stat strip has four items; strips leading empty/partial stat strips first.
 */
function ensureCreatingArVrBookMetrics(layout: Page['layout']): Page['layout'] {
  const blocks = Array.isArray(layout) ? [...layout] : []

  if (layoutHasFourItemStatStrip(blocks)) {
    return blocks
  }

  const rest = [...blocks]
  while (rest.length > 0 && rest[0]?.blockType === 'statStrip' && statStripItemCount(rest[0]) < 4) {
    rest.shift()
  }

  return [bookStatStripBlock(), ...rest]
}

export function enhancePageForRoute<T extends { layout: Page['layout'] }>(page: T, slug: string): T {
  const rewrittenPage = rewriteSpeakingCtaUrls(page)
  let layout = rewrittenPage.layout

  if (isBookMetricsPageSlug(slug)) {
    layout = ensureCreatingArVrBookMetrics(layout)
  }

  return {
    ...rewrittenPage,
    layout,
  }
}
