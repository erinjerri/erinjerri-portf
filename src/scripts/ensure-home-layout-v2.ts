import './loadEnv'

import { getPayload } from 'payload'

import type { Page } from '../payload-types'

/**
 * Applies the v2 homepage layout as a DRAFT.
 *
 * Two guarantees, because this runs against the production database:
 *   1. No existing block is ever deleted. Blocks are reordered, and any type
 *      not named in ORDER keeps its relative position at the end.
 *   2. The write is `draft: true`, so the published homepage is untouched until
 *      someone hits Publish in the admin.
 *
 * Existing copy is left alone on purpose — the point is to get the structure in
 * place so it can be edited in the block editor, not to hardcode prose.
 *
 * Run:  pnpm ensure:home-layout-v2
 */

/** Target order. Blocks not listed here keep their relative order, appended after. */
const ORDER: string[] = [
  'heroSplit',
  'heroCredentialStrip',
  'statStrip',
  'statsBlock',
  'ribbonBlock',
  'twoDoors',
  'signatureTalks',
  'tagPills',
  'bioBlock',
  'content',
  'bookAcclaimStrip',
  'bookCoverRow',
  'brandLogos',
  'productShowcase',
  'mediaBlock',
  'videoBackgroundTransition',
  'watchBlock',
  'archive',
  'cta',
  'formBlock',
]

const HERO_IMAGE_FILENAME = 'erinjerri-meta-connect-2025-AI-glasses.webp'
const SPEAKING_IMAGE_FILENAME = 'QCon-Erin-Speaking-rz.png'

type LayoutBlock = NonNullable<Page['layout']>[number]

async function findMediaIdByFilename(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filename: string,
): Promise<number | string | null> {
  const found = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { filename: { equals: filename } },
  })
  return found.docs[0]?.id ?? null
}

function buildHeroSplit(imageId: number | string | null): LayoutBlock {
  return {
    blockType: 'heroSplit',
    blockName: 'Hero (split)',
    headline: "I'm Erin Jerri.",
    lead: "AI is leaving the chat window. I've been building for the room it walks into since 2015.",
    support:
      'Lead author of Creating Augmented and Virtual Realities (O’Reilly) — the spatial computing reference written years before AI glasses made the category mainstream. Engineer, founder, former CTO.',
    ...(imageId ? { image: imageId } : {}),
    imageSide: 'right',
    imageAspect: '3/4',
    ctas: [
      { label: 'Request a speaking engagement', url: '/speaking-info', style: 'solid' },
      { label: 'Book an advisory session', url: '/advisory', style: 'outline' },
    ],
  } as unknown as LayoutBlock
}

function buildTwoDoors(speakingImageId: number | string | null): LayoutBlock {
  return {
    blockType: 'twoDoors',
    blockName: 'Work with me',
    eyebrow: 'WORK WITH ME',
    heading: '',
    intro:
      'I take a small number of engagements each year, in the places where the decision is expensive and the answer isn’t obvious yet.',
    doors: [
      {
        kicker: 'Keynotes & executive briefings',
        title: 'Speaking',
        body: 'I create talks tailored to your events on all things AI and more.',
        ...(speakingImageId ? { image: speakingImageId } : {}),
        ctaLabel: 'Request a speaking engagement →',
        ctaUrl: '/speaking-info',
        ctaStyle: 'solid',
        terms: 'Paid engagements only\nIn-person & virtual\nPrep call before every booking',
      },
      {
        kicker: 'Founders, product & investor teams',
        title: 'Advisory',
        body: 'Focused paid sessions for teams already in motion, where the next product decision carries real consequences. I’ve been building in AI and spatial computing since 2015 as an engineer, founder, and CTO — the advice comes from having shipped it.',
        ctaLabel: 'Book an advisory session →',
        ctaUrl: '/advisory',
        ctaStyle: 'outline',
        terms: 'Paid sessions · Selective\nNot a discovery call\nScoped before we meet',
      },
    ],
  } as unknown as LayoutBlock
}

/** Stable sort: known types by ORDER index, unknown types after, original order preserved. */
function reorder(blocks: LayoutBlock[]): LayoutBlock[] {
  return blocks
    .map((block, originalIndex) => {
      const type = (block as { blockType?: string }).blockType ?? ''
      const rank = ORDER.indexOf(type)
      return { block, originalIndex, rank: rank === -1 ? ORDER.length : rank }
    })
    .sort((a, b) => a.rank - b.rank || a.originalIndex - b.originalIndex)
    .map((entry) => entry.block)
}

async function run(): Promise<void> {
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: true,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: 'home' } },
  })

  const homePage = result.docs[0]
  if (!homePage) {
    throw new Error('Home page not found. Seed the site first, then rerun this script.')
  }

  const current: LayoutBlock[] = Array.isArray(homePage.layout) ? [...homePage.layout] : []
  const existingTypes = new Set(
    current.map((block) => (block as { blockType?: string }).blockType ?? ''),
  )

  const [heroImageId, speakingImageId] = await Promise.all([
    findMediaIdByFilename(payload, HERO_IMAGE_FILENAME),
    findMediaIdByFilename(payload, SPEAKING_IMAGE_FILENAME),
  ])

  if (!heroImageId) {
    payload.logger.warn(
      `Media "${HERO_IMAGE_FILENAME}" not found — hero block will be created without an image.`,
    )
  }
  if (!speakingImageId) {
    payload.logger.warn(
      `Media "${SPEAKING_IMAGE_FILENAME}" not found — it lives in public/media and may not be in the Media collection yet. The speaking card will be created without an image.`,
    )
  }

  const additions: LayoutBlock[] = []
  if (!existingTypes.has('heroSplit')) additions.push(buildHeroSplit(heroImageId))
  if (!existingTypes.has('twoDoors')) additions.push(buildTwoDoors(speakingImageId))

  const nextLayout = reorder([...current, ...additions])

  if (JSON.stringify(current) === JSON.stringify(nextLayout)) {
    payload.logger.info('Home page already matches the v2 layout. Nothing to do.')
    return
  }

  await payload.update({
    collection: 'pages',
    id: homePage.id,
    depth: 0,
    draft: true,
    overrideAccess: true,
    data: { layout: nextLayout } as Partial<Page>,
  })

  payload.logger.info(
    `Wrote v2 layout as a DRAFT: ${current.length} existing block(s) reordered, ${additions.length} added, 0 removed.`,
  )
  payload.logger.info('Review at /admin → Pages → Home, then Publish when it looks right.')
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
