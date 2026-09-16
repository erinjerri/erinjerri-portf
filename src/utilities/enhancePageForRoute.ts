import type { BookCoverRowBlock, Page, StatStripBlock, TagPillsBlock } from '@/payload-types'
import { defaultBioBlock } from '@/blocks/BioBlock/defaults'

type LayoutBlock = NonNullable<Page['layout']>[number]

const SPEAKING_FORM_SLUG = '/speaking-info'
const SPEAKING_BOOKING_URL_FRAGMENT = 'cal.com/erinjerri/45min'

/** Slugs that get the default book metrics strip. Override with BOOK_PAGE_SLUG (comma-separated). */
const DEFAULT_BOOK_PAGE_SLUGS = [
  'creating-ar-vr-book',
  'creating-ar-vr',
  'creating-arvr-book',
  'creating-arvr',
  'creatingarvrbook',
  'book-creating-ar-vr',
] as const

function bookPageSlugList(): string[] {
  const raw =
    typeof process.env.BOOK_PAGE_SLUG === 'string' ? process.env.BOOK_PAGE_SLUG.trim() : ''
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
    columns: 'four',
    emphasis: 'bold',
    items: [
      { value: '42+', label: 'COUNTRIES DISTRIBUTED' },
      { value: '3', label: 'LANGUAGES PUBLISHED EN · ZH · KO' },
      { value: '#1', label: 'AMAZON DEBUT GAME PROGRAMMING' },
      { value: '2015', label: 'SHIPPING IN AI & XR SINCE' },
    ],
  }
}

function bookProofBlock(): BookCoverRowBlock {
  return {
    blockType: 'bookCoverRow',
    blockName: 'Book proof',
    heading: "I wrote the O'Reilly book on spatial computing — the first in over five years.",
    intro: 'Author',
    body: 'Creating Augmented and Virtual Realities (O’Reilly) debuted at #1 in Amazon’s Game Programming category, was translated into Chinese and Korean, reached 42+ countries, and became known across the XR community as the “VR Bible.” It’s taught as official VR developer curriculum.',
    note: 'Three covers is the strongest visual proof on the site. Three languages side by side is the 42-countries claim — it does not need a stat to explain it. Worth more than any logo row.',
    primaryButtonLabel: 'Buy the book →',
    primaryButtonUrl: '/CreatingARVRBook',
    secondaryButtonLabel: 'New books in development →',
    secondaryButtonUrl: '/writing',
    variant: 'authorProof',
    covers: [
      {
        image: '/media/erinjerri-book-headshot-green-no-glare-768.webp',
        caption: 'book-headshot-green-no-glare · 768×849',
      },
      {
        image: '/media/CYR-CreatingARVR-X-cover-updated@1x.png',
        caption: 'English',
      },
      {
        image: '/media/creating-arvr-eng-chinese-korean-1001.webp',
        caption: '中文',
      },
      {
        image: '/media/CYR-CreatingARVR-X-cover-updated@1x.png',
        caption: '한국어',
      },
    ],
  } as unknown as BookCoverRowBlock
}

function bookCredsBlock(): TagPillsBlock {
  return {
    blockType: 'tagPills',
    blockName: 'Book credentials',
    tags: [
      { label: "O'REILLY AUTHOR" },
      { label: 'FOUNDER & FORMER CTO' },
      { label: 'UC BERKELEY' },
      { label: '10K+ FOLLOWERS' },
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

function layoutHasBookProof(layout: Page['layout']): boolean {
  const blocks = Array.isArray(layout) ? layout : []
  return blocks.some((b) => b?.blockType === 'bookCoverRow' && Boolean(b.covers?.length))
}

function layoutHasBookCredentials(layout: Page['layout']): boolean {
  const blocks = Array.isArray(layout) ? layout : []
  return blocks.some((b) => b?.blockType === 'tagPills' && b.blockName === 'Book credentials')
}

/**
 * Ensures the bordered metrics row (42+, #1 Amazon Game Programming, 10K+, 3 languages) is present.
 * Prepends the canonical strip if no stat strip has four items; strips leading empty/partial stat strips first.
 */
function ensureCreatingArVrBookMetrics(layout: Page['layout']): Page['layout'] {
  const blocks = Array.isArray(layout) ? [...layout] : []

  if (layoutHasFourItemStatStrip(blocks)) {
    const additions: LayoutBlock[] = []
    if (!layoutHasBookProof(blocks)) additions.push(bookProofBlock())
    if (!layoutHasBookCredentials(blocks)) additions.push(bookCredsBlock())
    return additions.length ? [...additions, ...blocks] : blocks
  }

  const rest = [...blocks]
  while (rest.length > 0 && rest[0]?.blockType === 'statStrip' && statStripItemCount(rest[0]) < 4) {
    rest.shift()
  }

  const leadingBlocks: LayoutBlock[] = []
  if (!layoutHasBookProof(rest)) leadingBlocks.push(bookProofBlock())
  leadingBlocks.push(bookStatStripBlock())
  if (!layoutHasBookCredentials(rest)) leadingBlocks.push(bookCredsBlock())

  return [...leadingBlocks, ...rest]
}

function ensureSingleAboutBio(layout: Page['layout']): Page['layout'] {
  const blocks = Array.isArray(layout) ? [...layout] : []
  const savedBio = blocks.find((block) => block?.blockType === 'bioBlock')
  const blocksWithoutOtherBios = blocks.filter(
    (block) => block?.blockType !== 'bioBlock' || block === savedBio,
  )

  if (savedBio) {
    return [savedBio, ...blocksWithoutOtherBios.filter((block) => block !== savedBio)]
  }

  const blocksWithoutLegacyBio = blocks.filter((block) => {
    if (block?.blockType !== 'content') return true

    const serializedBlock = JSON.stringify(block).toLowerCase()
    const isLegacyAboutBio =
      serializedBlock.includes('erin jerri') &&
      serializedBlock.includes('creating augmented and virtual realities') &&
      serializedBlock.includes('timebite')

    return !isLegacyAboutBio
  })

  return [defaultBioBlock(), ...blocksWithoutLegacyBio]
}

/**
 * Home's About media column is the canonical current bio portrait. Keep an older
 * Bio block headshot from shadowing the image selected in the CMS About section.
 */
function syncHomeBioHeadshot(layout: Page['layout']): Page['layout'] {
  const blocks = Array.isArray(layout) ? [...layout] : []
  const aboutBlock = blocks.find(
    (block) => block?.blockType === 'content' && block.blockName === 'About',
  )
  const aboutMedia =
    aboutBlock?.blockType === 'content'
      ? aboutBlock.columns?.find(
          (column) => column?.contentType === 'media' && Boolean(column.media),
        )?.media
      : null

  if (!aboutMedia) return blocks

  return blocks.map((block) =>
    block?.blockType === 'bioBlock' ? { ...block, headshot: aboutMedia } : block,
  )
}

function isHomeBookCoverRow(block: LayoutBlock | null | undefined): boolean {
  if (block?.blockType !== 'bookCoverRow') return false

  const serialized = JSON.stringify(block).toLowerCase()
  return (
    serialized.includes('creating augmented') ||
    serialized.includes('creating ar vr') ||
    serialized.includes('oreilly') ||
    serialized.includes('o’reilly') ||
    serialized.includes("o'reilly")
  )
}

function isOrphanedHomeBookLinks(block: LayoutBlock | null | undefined): boolean {
  if (block?.blockType !== 'content' && block?.blockType !== 'cta') return false

  const serialized = JSON.stringify(block).toLowerCase()
  return (
    serialized.includes('bit.ly/creatingarvrb') &&
    serialized.includes('book.douban.com/subject/35220393') &&
    serialized.includes('product.kyobobook.co.kr/detail/s000003305062')
  )
}

function syncHomeBookCovers(layout: Page['layout']): Page['layout'] {
  const blocks = Array.isArray(layout) ? [...layout] : []
  const coverIndex = blocks.findIndex(isHomeBookCoverRow)
  const linksIndex = blocks.findIndex(isOrphanedHomeBookLinks)

  if (coverIndex === -1 || linksIndex === -1) return blocks

  const [coverBlock] = blocks.splice(coverIndex, 1)
  const adjustedLinksIndex = coverIndex < linksIndex ? linksIndex - 1 : linksIndex

  blocks.splice(adjustedLinksIndex, 1, coverBlock)
  return blocks
}

export function enhancePageForRoute<T extends { layout: Page['layout'] }>(
  page: T,
  slug: string,
): T {
  const rewrittenPage = rewriteSpeakingCtaUrls(page)
  let layout = rewrittenPage.layout
  let hero = (rewrittenPage as T & { hero?: Page['hero'] }).hero

  if (slug === 'home') {
    layout = syncHomeBioHeadshot(layout)
    layout = syncHomeBookCovers(layout)
  }

  if (slug === 'about') {
    console.log(
      '[About bio debug] Top bio renderer was MediumImpactHero; canonical bio renderer is BioBlockBlock',
    )
    layout = ensureSingleAboutBio(layout)
    hero = { type: 'none' }
  }

  if (isBookMetricsPageSlug(slug)) {
    layout = ensureCreatingArVrBookMetrics(layout)
  }

  return {
    ...rewrittenPage,
    ...(hero ? { hero } : {}),
    layout,
  }
}
